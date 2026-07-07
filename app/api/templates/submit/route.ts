import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { submitTemplate } from "@/lib/api/templates/service";

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

        const body =
            await req.json();

        const organizationId =
            (session.user as any)
                .organizationId;

        const template =
            await submitTemplate(

                body.id,

                organizationId

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