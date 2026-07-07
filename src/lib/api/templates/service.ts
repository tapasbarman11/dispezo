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