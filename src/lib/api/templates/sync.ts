import { decrypt } from "@/lib/crypto";
import { metaGET } from "@/lib/meta/client";

import { getConnection } from "../whatsapp/repository";

import {
    upsertMetaTemplate,
    getTemplates,
} from "./repository";

interface MetaTemplateResponse {

    data: Array<{

        id: string;
        name: string;
        language: string;
        category: string;
        status: string;
        rejected_reason?: string;

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

export async function syncTemplates(
    organizationId: string
): Promise<{
    changed: boolean;
}> {

    //-----------------------------------------------------
    // Load WhatsApp
    //-----------------------------------------------------

    const account =
        await getConnection(
            organizationId
        );

    if (!account) {

        throw new Error(
            "WhatsApp account not connected."
        );

    }

    const accessToken =
        decrypt(
            account.access_token
        );

    //-----------------------------------------------------
    // Existing DB Templates
    //-----------------------------------------------------

    const existing =
        await getTemplates(
            organizationId
        );

    const existingMap =
        new Map(
            existing.map(t => [
                t.name,
                t,
            ])
        );

    //-----------------------------------------------------
    // Fetch Meta
    //-----------------------------------------------------

    const response =
        await metaGET<MetaTemplateResponse>(
            `/${account.waba_id}/message_templates?fields=id,name,status,category,language,components,rejected_reason`,
            accessToken
        );

    //-----------------------------------------------------
    // Compare
    //-----------------------------------------------------

    let changed = false;

    for (const template of response.data ?? []) {

        const header =
            template.components?.find(
                c => c.type === "HEADER"
            );

        const body =
            template.components?.find(
                c => c.type === "BODY"
            );

        const footer =
            template.components?.find(
                c => c.type === "FOOTER"
            );

        const buttonsComponent =
            template.components?.find(
                c => c.type === "BUTTONS"
            );

        const bodyText =
            body?.text ?? "";

        // Header format: Meta returns { type: "HEADER", format: "IMAGE" }
        // We store the format (IMAGE/TEXT/VIDEO/DOCUMENT), not "HEADER"
        const headerType =
            header?.format ?? (header?.text ? "TEXT" : "NONE");

        const headerText =
            header?.text ?? null;

        // Parse buttons from Meta's BUTTONS component
        const buttons = buttonsComponent?.buttons?.map((btn: any) => ({
            type: btn.type,
            text: btn.text ?? "",
            url: btn.url ?? undefined,
            phoneNumber: btn.phone_number ?? undefined,
        })) ?? [];

        const existingTemplate =
            existingMap.get(
                template.name
            );

        if (
            !existingTemplate ||

            existingTemplate.name !== template.name ||

            existingTemplate.category !== template.category ||

            existingTemplate.language !== template.language ||

            existingTemplate.body !== bodyText ||

            existingTemplate.footer !== (footer?.text ?? null) ||

            existingTemplate.status !== template.status ||

            existingTemplate.headerType !== headerType ||

            JSON.stringify(existingTemplate.buttons ?? []) !== JSON.stringify(buttons)
        ) {

            changed = true;

            await upsertMetaTemplate({

                organizationId,

                metaTemplateId:
                    template.id,

                name:
                    template.name,

                category:
                    template.category,

                language:
                    template.language,

                headerType,

                headerText,

                headerImage:
                    null,

                body:
                    bodyText,

                footer:
                    footer?.text,

                buttons,

                metaStatus:
                    template.status,

                rejectedReason:
                    template.rejected_reason ?? null,

            });

        }

    }

    return {

        changed,

    };

}