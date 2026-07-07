import {
    metaPOST,
    metaDELETE,
} from "./client";

// -----------------------------------------------------
// Types
// -----------------------------------------------------

export interface MetaTemplateButton {

    type: string;

    text: string;

    url?: string;

    phoneNumber?: string;

}

export interface CreateMetaTemplateInput {

    wabaId: string;

    accessToken: string;

    name: string;

    category: string;

    language: string;

    headerType?: string;

    headerText?: string;

    headerImage?: string;

    body: string;

    footer?: string;

    buttons?: MetaTemplateButton[];

}

export interface MetaTemplateResult {

    id: string;

    status: string;

    category: string;

    language: string;

    name: string;

}

// -----------------------------------------------------
// Component Builder
// -----------------------------------------------------

function buildComponents(
    input: CreateMetaTemplateInput
): any[] {

    const components: any[] = [];

    //-------------------------------------------------
    // HEADER
    //-------------------------------------------------

    if (input.headerType) {

        switch (
        input.headerType.toUpperCase()
        ) {

            case "TEXT":

                if (input.headerText) {

                    components.push({

                        type: "HEADER",

                        format: "TEXT",

                        text: input.headerText,

                    });

                }

                break;

            case "IMAGE":

                components.push({

                    type: "HEADER",

                    format: "IMAGE",

                });

                break;

            case "VIDEO":

                components.push({

                    type: "HEADER",

                    format: "VIDEO",

                });

                break;

            case "DOCUMENT":

                components.push({

                    type: "HEADER",

                    format: "DOCUMENT",

                });

                break;

        }

    }

    //-------------------------------------------------
    // BODY
    //-------------------------------------------------

    components.push({

        type: "BODY",

        text: input.body,

    });

    //-------------------------------------------------
    // FOOTER
    //-------------------------------------------------

    if (input.footer) {

        components.push({

            type: "FOOTER",

            text: input.footer,

        });

    }

    //-------------------------------------------------
    // BUTTONS
    //-------------------------------------------------

    const buttons =
        buildButtons(
            input.buttons
        );

    if (buttons.length) {

        components.push({

            type: "BUTTONS",

            buttons,

        });

    }

    return components;

}
// -----------------------------------------------------
// Button Builder
// -----------------------------------------------------

function buildButtons(
    buttons?: MetaTemplateButton[]
): any[] {

    if (!buttons?.length) {

        return [];

    }

    return buttons.map((button) => {

        switch (
        button.type.toUpperCase()
        ) {

            //-------------------------------------------------
            // QUICK REPLY
            //-------------------------------------------------

            case "QUICK_REPLY":

                return {

                    type: "QUICK_REPLY",

                    text: button.text,

                };

            //-------------------------------------------------
            // URL
            //-------------------------------------------------

            case "URL":

                return {

                    type: "URL",

                    text: button.text,

                    url: button.url,

                };

            //-------------------------------------------------
            // PHONE
            //-------------------------------------------------

            case "PHONE_NUMBER":

                return {

                    type: "PHONE_NUMBER",

                    text: button.text,

                    phone_number:
                        button.phoneNumber,

                };

            //-------------------------------------------------
            // COPY CODE (Future)
            //-------------------------------------------------

            case "COPY_CODE":

                return {

                    type: "COPY_CODE",

                    text: button.text,

                };

            //-------------------------------------------------
            // Default
            //-------------------------------------------------

            default:

                return {

                    type: button.type,

                    text: button.text,

                };

        }

    });

}
// -----------------------------------------------------
// Create Template
// -----------------------------------------------------

export async function createMetaTemplate(
    input: CreateMetaTemplateInput
): Promise<MetaTemplateResult> {

    const components =
        buildComponents(input);
    console.log("================================");
    console.log("CREATE TEMPLATE");
    console.log(JSON.stringify({
        name: input.name,
        category: input.category,
        language: input.language,
        components,
    }, null, 2));
    console.log("================================");
    const response =
        await metaPOST<any>(

            `/${input.wabaId}/message_templates`,

            input.accessToken,

            {

                name:
                    input.name,

                category:
                    input.category,

                language:
                    input.language,

                components,

            }

        );

    return {

        id:
            response.id,

        status:
            response.status ??
            "PENDING",

        category:
            input.category,

        language:
            input.language,

        name:
            input.name,

    };

}

// -----------------------------------------------------
// Delete Template
// -----------------------------------------------------

export async function deleteMetaTemplate(
    wabaId: string,
    accessToken: string,
    templateId: string,
    templateName: string
): Promise<void> {

    await metaDELETE(

        `/${wabaId}/message_templates` +
        `?hsm_id=${templateId}` +
        `&name=${encodeURIComponent(templateName)}`,

        accessToken

    );

}