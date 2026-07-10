import {
    getTemplates as getTemplatesRepository,
    getTemplate as getTemplateRepository,
    saveTemplate as saveTemplateRepository,
    updateTemplate as updateTemplateRepository,
    getTemplateById,
    deleteTemplateById,
    upsertMetaTemplate,
    duplicateTemplate as duplicateTemplateRepository,
} from "./repository";

import {
    SaveTemplateInput,
    Template,
} from "@/lib/types";

import { getConnection } from "../whatsapp/repository";
import { decrypt } from "@/lib/crypto";
import {
    createMetaTemplate,
    deleteMetaTemplate,
} from "@/lib/meta/templates";
import { uploadMediaForTemplate } from "@/lib/meta/client";
// -----------------------------------------------------
// Load All Templates
// -----------------------------------------------------

export async function loadTemplates(
    organizationId: string
): Promise<Template[]> {

    return getTemplatesRepository(
        organizationId
    );

}

// -----------------------------------------------------
// Load Single Template
// -----------------------------------------------------

export async function loadTemplate(
    id: string, organizationId: string
): Promise<Template | null> {

    return getTemplateById(id, organizationId);

}

// -----------------------------------------------------
// Create Template
// -----------------------------------------------------

export async function createTemplate(
    input: SaveTemplateInput
): Promise<Template> {

    return saveTemplateRepository(input);

}

// -----------------------------------------------------
// Update Template
// -----------------------------------------------------

export async function updateTemplate(
    id: string,
    input: SaveTemplateInput
): Promise<Template> {

    const existing =
        await getTemplateById(
            id,
            input.organizationId
        );

    if (!existing) {

        throw new Error(
            "Template not found."
        );

    }

    //-----------------------------------------------------
    // If the template was REJECTED on Meta, delete it from
    // Meta now so sync doesn't overwrite our local draft.
    //-----------------------------------------------------

    if (
        existing.status === "REJECTED" &&
        existing.metaTemplateId
    ) {

        try {

            const account =
                await getConnection(
                    input.organizationId
                );

            if (account) {

                const accessToken =
                    decrypt(
                        account.access_token
                    );

                await deleteMetaTemplate(
                    account.waba_id,
                    accessToken,
                    existing.metaTemplateId,
                    existing.name
                );

            }

        } catch (err: any) {

            console.warn(
                "Failed to delete rejected template from Meta:",
                err.message
            );

        }

    }

    return updateTemplateRepository(
        id,
        input
    );

}

// -----------------------------------------------------
// Save Or Update
// -----------------------------------------------------

export async function saveOrUpdateTemplate(
    id: string | undefined,
    input: SaveTemplateInput
): Promise<Template> {

    if (!id) {

        return createTemplate(input);

    }

    return updateTemplate(
        id,
        input
    );

}

// -----------------------------------------------------
// Delete Template
// -----------------------------------------------------

export async function deleteTemplateService(
    id: string,
    organizationId: string
): Promise<void> {

    //-------------------------------------------------
    // Load Template
    //-------------------------------------------------

    const template =
        await getTemplateById(
            id,
            organizationId
        );

    if (!template) {

        throw new Error(
            "Template not found."
        );

    }

    //-------------------------------------------------
    // Load WhatsApp Connection
    //-------------------------------------------------

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

    //-------------------------------------------------
    // Delete Template From Meta
    //-------------------------------------------------

    if (template.metaTemplateId) {

        await deleteMetaTemplate(

            account.waba_id,

            accessToken,

            template.metaTemplateId,

            template.name

        );

    }

    //-------------------------------------------------
    // Delete Template From Dispaz DB
    //-------------------------------------------------

    await deleteTemplateById(
        id,
        organizationId
    );

}
// -----------------------------------------------------
// Submit Template To Meta
// -----------------------------------------------------

export async function submitTemplate(
    id: string,
    organizationId: string
): Promise<Template> {

    //-------------------------------------------------
    // Load Template
    //-------------------------------------------------

    const template =
        await getTemplateById(
            id,
            organizationId
        );

    if (!template) {

        throw new Error(
            "Template not found."
        );

    }

    //-------------------------------------------------
    // Load WhatsApp Connection
    //-------------------------------------------------

    const account =
        await getConnection(
            organizationId
        );

    if (!account) {

        throw new Error(
            "WhatsApp account not connected."
        );

    }

    //-------------------------------------------------
    // Access Token
    //-------------------------------------------------

    const accessToken =
        decrypt(
            account.access_token
        );

    //-------------------------------------------------
    // If re-submitting a previously rejected template,
    // delete the old one from Meta first. Meta won't
    // allow a new template with the same name while
    // the rejected one still exists.
    //-------------------------------------------------

    if (template.metaTemplateId) {

        try {

            await deleteMetaTemplate(
                account.waba_id,
                accessToken,
                template.metaTemplateId,
                template.name
            );

        } catch (err: any) {

            // If deletion fails because it's already gone
            // on Meta's side, that's fine — continue.
            console.warn(
                "Failed to delete old Meta template (may already be gone):",
                err.message
            );

        }

    }

    //-------------------------------------------------
    // Upload Image to Meta (if IMAGE header)
    //-------------------------------------------------

    let headerHandle: string | undefined;

    if (
        template.headerType?.toUpperCase() === "IMAGE" &&
        template.sampleMediaPath
    ) {

        const path = await import("path");
        const fs = await import("fs");

        const filePath = path.join(
            process.cwd(),
            "public",
            template.sampleMediaPath
        );

        if (fs.existsSync(filePath)) {

            const stats = fs.statSync(filePath);
            const mimeType =
                template.sampleMediaType || "image/png";

            // Get app ID from token
            const { metaGET } = await import("@/lib/meta/client");
            const debug = await metaGET<{
                data: { app_id: string };
            }>(
                "/debug_token?input_token=" + accessToken,
                accessToken
            );

            const appId = debug.data.app_id;

            headerHandle = await uploadMediaForTemplate(
                accessToken,
                appId,
                filePath,
                mimeType,
                stats.size
            );

        }

    }

    //-------------------------------------------------
    // Create Template In Meta
    //-------------------------------------------------

    const metaTemplate =
        await createMetaTemplate({

            wabaId:
                account.waba_id,

            accessToken,

            name:
                template.name,

            category:
                template.category,

            language:
                template.language,

            headerType:
                template.headerType,

            headerText:
                template.headerText,

            headerImage:
                template.headerImage,

            body:
                template.body,

            footer:
                template.footer,

            buttons:
                template.buttons,

            variableSamples:
                template.variableSamples ?? undefined,

            headerHandle,

        });
    if (!metaTemplate.id) {

        throw new Error(
            "Meta template creation failed."
        );

    }

    //-------------------------------------------------
    // Save Meta Response
    //-------------------------------------------------

    return upsertMetaTemplate({

        organizationId,

        metaTemplateId:
            metaTemplate.id,

        name:
            template.name,

        category:
            template.category,

        language:
            template.language,

        headerType:
            template.headerType,

        headerText:
            template.headerText,

        headerImage:
            template.headerImage,

        body:
            template.body,

        footer:
            template.footer,

        buttons:
            template.buttons,

        metaStatus:
            metaTemplate.status,

    });

}