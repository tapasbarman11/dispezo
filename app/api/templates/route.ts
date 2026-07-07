import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import {
    createTemplate,
    updateTemplate,
    deleteTemplateService,
} from "@/lib/api/templates/service";

export async function POST(
    req: NextRequest
) {

    try {

        const session =
            await getServerSession(
                authOptions
            );

        if (!session?.user) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }

        const organizationId =
            (session.user as any)
                .organizationId;

        const body =
            await req.json();

        const template =
            await createTemplate({

                organizationId,

                name:
                    body.name,

                category:
                    body.category,

                language:
                    body.language,

                headerType:
                    body.headerType,

                headerText:
                    body.headerText,

                headerImage:
                    body.headerImage,

                sampleMediaPath:
                    body.sampleMediaPath,

                sampleMediaName:
                    body.sampleMediaName,

                sampleMediaType:
                    body.sampleMediaType,

                body:
                    body.body,

                footer:
                    body.footer,

                buttons:
                    body.buttons,

            });

        return NextResponse.json({

            success: true,

            template,

        });

    } catch (error: any) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message,
            },
            {
                status: 500,
            }
        );

    }

}

export async function PUT(
    req: NextRequest
) {

    try {

        const session =
            await getServerSession(
                authOptions
            );

        if (!session?.user) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }

        const body =
            await req.json();
      
        console.log("========== TEMPLATE SAVE ==========");
        console.log(JSON.stringify(body, null, 2));
        console.log("==================================");
        const template =
            await updateTemplate(

                body.id,

                {

                    organizationId:
                        (session.user as any)
                            .organizationId,

                    name:
                        body.name,

                    category:
                        body.category,

                    language:
                        body.language,

                    headerType:
                        body.headerType,

                    headerText:
                        body.headerText,

                    headerImage:
                        body.headerImage,

                    sampleMediaPath:
                        body.sampleMediaPath,

                    sampleMediaName:
                        body.sampleMediaName,

                    sampleMediaType:
                        body.sampleMediaType,

                    body:
                        body.body,

                    footer:
                        body.footer,

                    buttons:
                        body.buttons,

                }

            );

        return NextResponse.json({

            success: true,

            template,

        });

    } catch (error: any) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message,
            },
            {
                status: 500,
            }
        );

    }

}
//-----------------------------------------------------
// DELETE
//-----------------------------------------------------

export async function DELETE(
    req: NextRequest
) {

    try {

        const session =
            await getServerSession(
                authOptions
            );

        if (!session?.user) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }

        const body =
            await req.json();

        const organizationId =
            (session.user as any)
                .organizationId;

        await deleteTemplateService(

            body.id,

            organizationId

        );

        return NextResponse.json({

            success: true,

        });

    } catch (error: any) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error.message,
            },
            {
                status: 500,
            }
        );

    }

}