import pool from "@/lib/db";

/**
 * Entry point for every Meta webhook POST.
 * Routes each change by its `field` so coexistence events
 * (history / smb_app_state_sync / smb_message_echoes) are handled
 * alongside the existing message + status events.
 *
 * Each change is wrapped in try/catch so one bad row never fails the
 * whole batch (which would make Meta retry the entire payload).
 */
export async function processWebhook(payload: any) {
    if (!payload?.entry) return;

    for (const entry of payload.entry) {
        const wabaId = entry.id; // WhatsApp Business Account ID

        for (const change of entry.changes ?? []) {
            const value = change.value ?? {};
            const field = change.field;

            try {
                switch (field) {
                    case "history":
                        await handleHistory(wabaId, value);
                        break;

                    case "smb_app_state_sync":
                        await handleStateSync(wabaId, value);
                        break;

                    case "smb_message_echoes":
                        await handleMessageEchoes(wabaId, value);
                        break;

                    default:
                        // Existing behaviour (field === "messages"):
                        // delivery-status updates + incoming messages.
                        if (value.statuses) {
                            for (const status of value.statuses) {
                                await updateMessageStatus(status);
                            }
                        }
                        if (value.messages) {
                            for (const message of value.messages) {
                                await saveIncomingMessage(wabaId, message);
                            }
                        }
                }
            } catch (err) {
                console.error(
                    `Webhook handler failed for field "${field}":`,
                    err
                );
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a WABA ID to the organization + phone number that owns it.
 * Coexistence/message webhooks arrive without a session, so this is how
 * we scope the incoming data to the correct tenant.
 */
async function getAccountByWabaId(
    wabaId: string
): Promise<{ organizationId: string; phoneNumberId: string } | null> {
    const result = await pool.query(
        `
        SELECT organization_id, phone_number_id
        FROM whatsapp_accounts
        WHERE waba_id = $1
        LIMIT 1
        `,
        [wabaId]
    );

    if (!result.rows.length) return null;

    return {
        organizationId: result.rows[0].organization_id,
        phoneNumberId: result.rows[0].phone_number_id,
    };
}

/**
 * Insert or update a message row, keyed on the WhatsApp message id.
 * - Idempotent: Meta retries + history chunks can redeliver the same id.
 * - Media backfill: a `media_placeholder` row is later updated with the
 *   real media payload that arrives in a follow-up history webhook.
 */
async function upsertMessage(row: {
    organizationId: string;
    phone: string;
    wamid: string | null;
    status: string;
    direction: string;
    payload: any;
    sentAtEpoch: number | null;
}) {
    if (row.wamid) {
        const updated = await pool.query(
            `
            UPDATE messages
            SET
                status = $1,
                direction = $2,
                payload = $3,
                organization_id = COALESCE(organization_id, $4)
            WHERE whatsapp_message_id = $5
            `,
            [
                row.status,
                row.direction,
                JSON.stringify(row.payload),
                row.organizationId,
                row.wamid,
            ]
        );

        if (updated.rowCount && updated.rowCount > 0) return;
    }

    await pool.query(
        `
        INSERT INTO messages
        (
            organization_id,
            phone,
            whatsapp_message_id,
            status,
            direction,
            payload,
            sent_at
        )
        VALUES
        (
            $1, $2, $3, $4, $5, $6,
            COALESCE(to_timestamp($7), NOW())
        )
        `,
        [
            row.organizationId,
            row.phone,
            row.wamid,
            row.status,
            row.direction,
            JSON.stringify(row.payload),
            row.sentAtEpoch,
        ]
    );
}

// ---------------------------------------------------------------------------
// Coexistence: history
// ---------------------------------------------------------------------------

/**
 * Chat history sync. Arrives in two shapes under field "history":
 *   value.history[]  -> thread/message chunks (or an errors[] if declined)
 *   value.messages[] -> media-asset follow-ups for earlier placeholders
 */
async function handleHistory(wabaId: string, value: any) {
    const account = await getAccountByWabaId(wabaId);
    if (!account) return;

    const organizationId = account.organizationId;

    for (const h of value.history ?? []) {
        // Business declined to share history.
        if (
            Array.isArray(h.errors) &&
            h.errors.some((e: any) => e.code === 2593109)
        ) {
            console.log("Coexistence history sync declined by business.");
            continue;
        }

        for (const thread of h.threads ?? []) {
            const contactPhone = thread.id; // WhatsApp user phone

            for (const m of thread.messages ?? []) {
                await upsertMessage({
                    organizationId,
                    phone: contactPhone,
                    wamid: m.id ?? null,
                    // `to` is only present on messages the business sent.
                    direction: m.to ? "outbound" : "inbound",
                    status: m.history_context?.status ?? "history",
                    payload: m,
                    sentAtEpoch: m.timestamp ? Number(m.timestamp) : null,
                });
            }
        }

        if (h.metadata?.progress === 100) {
            console.log(
                `Coexistence history sync complete for WABA ${wabaId}.`
            );
        }
    }

    // Media-asset follow-ups (real media id for an earlier placeholder).
    for (const m of value.messages ?? []) {
        await upsertMessage({
            organizationId,
            phone: m.from,
            wamid: m.id ?? null,
            direction: "history",
            status: "history",
            payload: m,
            sentAtEpoch: m.timestamp ? Number(m.timestamp) : null,
        });
    }
}

// ---------------------------------------------------------------------------
// Coexistence: contacts (smb_app_state_sync)
// ---------------------------------------------------------------------------

async function handleStateSync(wabaId: string, value: any) {
    const account = await getAccountByWabaId(wabaId);
    if (!account) return;

    const organizationId = account.organizationId;

    for (const s of value.state_sync ?? []) {
        if (s.type !== "contact") continue;

        const phone = s.contact?.phone_number;
        if (!phone) continue;

        if (s.action === "remove") {
            await pool.query(
                `DELETE FROM contacts WHERE organization_id = $1 AND phone = $2`,
                [organizationId, phone]
            );
            continue;
        }

        // "add" covers both add and edit.
        const name =
            s.contact?.full_name || s.contact?.first_name || null;

        const updated = await pool.query(
            `
            UPDATE contacts
            SET name = COALESCE($3, name)
            WHERE organization_id = $1 AND phone = $2
            `,
            [organizationId, phone, name]
        );

        if (!updated.rowCount) {
            await pool.query(
                `
                INSERT INTO contacts
                    (id, organization_id, name, phone, tag, source, created_at)
                VALUES
                    (gen_random_uuid(), $1, $2, $3, 'WhatsApp Contacts', 'coexistence_sync', NOW())
                `,
                [organizationId, name, phone]
            );
        }
    }
}

// ---------------------------------------------------------------------------
// Coexistence: message echoes (messages the business sends from the WA app)
// ---------------------------------------------------------------------------

async function handleMessageEchoes(wabaId: string, value: any) {
    const account = await getAccountByWabaId(wabaId);
    if (!account) return;

    for (const m of value.message_echoes ?? []) {
        await upsertMessage({
            organizationId: account.organizationId,
            phone: m.to, // recipient of the echoed message
            wamid: m.id ?? null,
            status: "Sent",
            direction: "outbound",
            payload: m,
            sentAtEpoch: m.timestamp ? Number(m.timestamp) : null,
        });
    }
}

// ---------------------------------------------------------------------------
// Existing: delivery status updates
// ---------------------------------------------------------------------------

async function updateMessageStatus(status: any) {
    // Capitalize to match our stored convention: Sent, Delivered, Read, Failed.
    const normalized =
        status.status === "failed" ? "Failed"
            : status.status === "delivered" ? "Delivered"
                : status.status === "read" ? "Read"
                    : status.status === "sent" ? "Sent"
                        : status.status;

    await pool.query(
        `
        UPDATE messages
        SET
            status = $1,
            delivered_at =
                CASE
                    WHEN $1 = 'Delivered'
                    THEN NOW()
                    ELSE delivered_at
                END,
            read_at =
                CASE
                    WHEN $1 = 'Read'
                    THEN NOW()
                    ELSE read_at
                END
        WHERE whatsapp_message_id = $2
        `,
        [normalized, status.id]
    );
}

// ---------------------------------------------------------------------------
// Existing: incoming messages (now tenant-scoped)
// ---------------------------------------------------------------------------

async function saveIncomingMessage(wabaId: string, message: any) {
    const account = await getAccountByWabaId(wabaId);
    const organizationId = account?.organizationId ?? null;

    await pool.query(
        `
        INSERT INTO messages
        (
            organization_id,
            phone,
            whatsapp_message_id,
            status,
            direction,
            payload,
            sent_at
        )
        VALUES
        (
            $1, $2, $3, 'received', 'inbound', $4, NOW()
        )
        `,
        [
            organizationId,
            message.from,
            message.id,
            JSON.stringify(message),
        ]
    );
}
