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

        components?: Array<{

            type: string;
            text?: string;

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
            `/${account.waba_id}/message_templates?fields=id,name,status,category,language,components`,
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

        const bodyText =
            body?.text ?? "";

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

            existingTemplate.status !== template.status
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

                headerType:
                    header?.type,

                headerText:
                    header?.text,

                headerImage:
                    null,

                body:
                    bodyText,

                footer:
                    footer?.text,

                buttons: [],

                metaStatus:
                    template.status,

            });

        }

    }

    return {

        changed,

    };

}