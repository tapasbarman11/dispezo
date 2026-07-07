import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { loadTemplates } from "@/lib/api/templates/service";

export async function GET() {

    try {

        const session =
            await getServerSession(authOptions);

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
            (session.user as any).organizationId;

        const templates =
            await loadTemplates(
                organizationId
            );

        return NextResponse.json({

            success: true,

            templates,

        });

    } catch (error: any) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
                templates: [],
                message: error.message,
            },
            {
                status: 500,
            }
        );

    }

}