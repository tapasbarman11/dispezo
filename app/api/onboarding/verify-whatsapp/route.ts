import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { saveConnection } from "@/lib/api/whatsapp/service";

export async function POST(req: NextRequest) {

    try {

        const session =
            await getServerSession(authOptions);

        if (!session?.user) {

            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                {
                    status: 401,
                }
            );

        }

        const body = await req.json();

        const accessToken =
            body.accessToken?.trim();
        const wabaId =
            body.wabaId?.trim();
        if (
            !accessToken ||
            !wabaId
        ) {

            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Access Token and WABA ID are required.",
                },
                {
                    status: 400,
                }
            );

        }

        const result = await saveConnection(
            accessToken,
            wabaId,
            (session.user as any).organizationId,
            (session.user as any).id
        );

        return NextResponse.json({

            success: true,

            whatsappConnected: true,

            connection: result.meta,

        });

    } catch (error: any) {

        console.error(error);

        return NextResponse.json(

            {

                success: false,

                error:
                    error.message ||
                    "Unable to connect WhatsApp.",

            },

            {

                status: 500,

            }

        );

    }

}