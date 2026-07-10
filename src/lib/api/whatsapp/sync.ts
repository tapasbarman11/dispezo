import { decrypt } from "@/lib/crypto";
import { metaGET } from "@/lib/meta/client";
import pool from "@/lib/db";

import {
    getConnection,
    updateConnection,
} from "./repository";

export interface SyncResult {
    connection: {
        connected: boolean;
        businessName: string;
        phoneNumber: string;
        verifiedName: string;
        qualityRating: string;
        messagingLimit: string;
        webhookStatus: string;
        connectedAt: string | null;
        lastSyncedAt: string;
        wabaId: string;
        phoneNumberId: string;
    };

    templates: Array<{
        id: string;
        name: string;
        language: string;
        category: string;
        status: string;
        body: string;
    }>;

    activity: Array<{
        id: string;
        recipient: string;
        template: string;
        status: string;
        messageId: string;
        time: string;
    }>;
}

interface PhoneResponse {
    data: Array<{
        id: string;
        display_phone_number: string;
        verified_name: string;
        quality_rating?: string;
        status?: string;
        whatsapp_business_manager_messaging_limit?: string;
    }>;
}

interface WabaResponse {
    id: string;
    name: string;
}

interface TemplateResponse {
    data: Array<{
        id: string;
        name: string;
        language: string;
        category: string;
        status: string;
        components?: Array<{
            type: string;
            format?: string;
            text?: string;
            buttons?: Array<{
                type: string;
                text?: string;
                url?: string;
                phone_number?: string;
            }>;
        }>;
    }>;
}

export async function syncWhatsApp(
    organizationId: string
): Promise<SyncResult> {

    // ---------------------------------------------
    // Load Connection
    // ---------------------------------------------

    const account = await getConnection(organizationId);

    if (!account) {
        throw new Error("WhatsApp account not connected.");
    }

    const accessToken = decrypt(account.access_token);

    // ---------------------------------------------
    // Phone Number
    // ---------------------------------------------

    let phoneResponse: PhoneResponse;

    try {
        phoneResponse = await metaGET<PhoneResponse>(
            `/${account.waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,status,whatsapp_business_manager_messaging_limit`,
            accessToken
        );
    } catch {
        throw new Error(
            "Unable to fetch phone information from Meta."
        );
    }

    const phone = phoneResponse.data[0];

    if (!phone) {
        throw new Error("No phone number found.");
    }

    // ---------------------------------------------
    // WABA
    // ---------------------------------------------

    let waba: WabaResponse;

    try {

        waba = await metaGET<WabaResponse>(
            `/${account.waba_id}?fields=name`,
            accessToken
        );

    } catch {

        waba = {
            id: account.waba_id,
            name: account.meta_business_name,
        };

    }

    // ---------------------------------------------
    // Templates
    // ---------------------------------------------

    let templateResponse: TemplateResponse;

    try {

        templateResponse = await metaGET<TemplateResponse>(
            `/${account.waba_id}/message_templates?fields=id,name,status,category,language,components`,
            accessToken
        );

    } catch {

        throw new Error(
            "Unable to fetch templates from Meta."
        );

    }

    // ---------------------------------------------
    // Update Cached Data
    // ---------------------------------------------

    await updateConnection(organizationId, {

        meta_business_name:
            waba.name,

        display_name:
            phone.verified_name,

        phone_number:
            phone.display_phone_number,

        quality_rating:
            phone.quality_rating ?? "UNKNOWN",

        messaging_limit:
            phone.whatsapp_business_manager_messaging_limit ??
            account.messaging_limit,

        status:
            phone.status ?? "connected",
        webhook_status:
            "active",

        last_synced_at:
            new Date(),

    });

    // ---------------------------------------------
    // Recent Activity
    // ---------------------------------------------

    const activityResult = await pool.query(
        `
        SELECT
            id,
            phone,
            template_name,
            whatsapp_message_id,
            status,
            sent_at
        FROM messages
        WHERE organization_id = $1
        ORDER BY sent_at DESC
        LIMIT 20
        `,
        [organizationId]
    );

    // ---------------------------------------------
    // Return
    // ---------------------------------------------

    return {

        connection: {

            connected: true,

            businessName:
                waba.name,

            phoneNumber:
                phone.display_phone_number,

            verifiedName:
                phone.verified_name,

            qualityRating:
                phone.quality_rating ?? "UNKNOWN",

            messagingLimit:
                phone.whatsapp_business_manager_messaging_limit ??
                account.messaging_limit ??
                "",

            webhookStatus:
                account.webhook_status,

            connectedAt:
                account.connected_at
                    ? account.connected_at.toISOString()
                    : null,

            lastSyncedAt:
                new Date().toISOString(),

            wabaId:
                account.waba_id,

            phoneNumberId:
                phone.id,

        },

        templates:
            (templateResponse.data ?? []).map(
                (template) => {

                    const header = template.components?.find(
                        (c: any) => c.type === "HEADER"
                    );
                    const buttonsComp = template.components?.find(
                        (c: any) => c.type === "BUTTONS"
                    );

                    return {

                        id: template.id,

                        name: template.name,

                        language: template.language,

                        category: template.category,

                        status: template.status,

                        headerType:
                            header?.format ?? (header?.text ? "TEXT" : "NONE"),

                        headerText:
                            header?.text ?? null,

                        body:
                            template.components?.find(
                                (c: any) => c.type === "BODY"
                            )?.text ?? "",

                        footer:
                            template.components?.find(
                                (c: any) => c.type === "FOOTER"
                            )?.text ?? null,

                        buttons:
                            buttonsComp?.buttons?.map((btn: any) => ({
                                type: btn.type,
                                text: btn.text ?? "",
                                url: btn.url ?? undefined,
                                phoneNumber: btn.phone_number ?? undefined,
                            })) ?? [],

                    };
                }
            ),

        activity:
            activityResult.rows.map((row) => ({

                id: row.id,

                recipient: row.phone,

                template: row.template_name,

                status: row.status,

                messageId: row.whatsapp_message_id,

                time: row.sent_at
                    ? row.sent_at.toISOString()
                    : "",

            })),

    };

}