import { decrypt } from "@/lib/crypto";
import { metaGET } from "@/lib/meta/client";

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
    }>;
}

interface TemplateResponse {
    data: Array<{
        id: string;
        name: string;
        language: string;
        category: string;
        status: string;
    }>;
}

export async function syncWhatsApp(
    organizationId: string
): Promise<SyncResult> {

    // Load saved connection

    const account = await getConnection(organizationId);

    if (!account) {
        throw new Error("WhatsApp account not connected.");
    }

    // Decrypt access token

    const accessToken = decrypt(account.access_token);

    // Fetch latest phone details

    let phoneResponse: PhoneResponse;

    try {
        phoneResponse = await metaGET<PhoneResponse>(
            `/${account.waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,status`,
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

    // Fetch latest templates

    let templateResponse: TemplateResponse;

    try {
        templateResponse = await metaGET<TemplateResponse>(
            `/${account.waba_id}/message_templates?fields=id,name,status,category,language`,
            accessToken
        );
    } catch {
        throw new Error(
            "Unable to fetch templates from Meta."
        );
    }

    // Update latest information in database

    await updateConnection(organizationId, {
        quality_rating: phone.quality_rating ?? "UNKNOWN",
        status: phone.status ?? "connected",
        last_synced_at: new Date(),
    });

    // Return latest data

    return {
        connection: {
            connected: true,

            businessName: account.meta_business_name,

            phoneNumber: phone.display_phone_number,

            verifiedName: phone.verified_name,

            qualityRating:
                phone.quality_rating ?? "UNKNOWN",

            messagingLimit:
                account.messaging_limit ?? "UNKNOWN",

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

        templates: (templateResponse.data ?? []).map(
            (template) => ({
                id: template.id,
                name: template.name,
                language: template.language,
                category: template.category,
                status: template.status,
            })
        ),

        activity: [],
    };
}