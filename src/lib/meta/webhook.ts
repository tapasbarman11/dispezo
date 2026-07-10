import pool from "@/lib/db";

export async function processWebhook(payload: any) {
    if (!payload.entry) return;

    for (const entry of payload.entry) {
        for (const change of entry.changes ?? []) {
            const value = change.value;

            // -------------------------
            // Message Status Updates
            // -------------------------

            if (value.statuses) {
                for (const status of value.statuses) {
                    await updateMessageStatus(status);
                }
            }

            // -------------------------
            // Incoming Messages
            // -------------------------

            if (value.messages) {
                for (const message of value.messages) {
                    await saveIncomingMessage(
                        value,
                        message
                    );
                }
            }
        }
    }
}

async function updateMessageStatus(status: any) {
    // Capitalize to match our convention: Sent, Failed, Pending
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
                WHEN $1='delivered'
                THEN NOW()
                ELSE delivered_at
            END,
        read_at =
            CASE
                WHEN $1='read'
                THEN NOW()
                ELSE read_at
            END
    WHERE whatsapp_message_id = $2
    `,
        [
            normalized,
            status.id,
        ]
    );
}

async function saveIncomingMessage(
    value: any,
    message: any
) {
    await pool.query(
        `
    INSERT INTO messages
    (
        phone,
        whatsapp_message_id,
        status,
        direction,
        payload,
        sent_at
    )
    VALUES
    (
        $1,
        $2,
        'received',
        'inbound',
        $3,
        NOW()
    )
    `,
        [
            message.from,
            message.id,
            JSON.stringify(message),
        ]
    );
}