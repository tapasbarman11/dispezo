import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { syncTemplates } from "@/lib/api/templates/sync";

export async function POST() {

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

        const result =
            await syncTemplates(
                organizationId
            );

        return NextResponse.json({

            success: true,

            changed:
                result.changed,

            syncedAt:
                new Date().toISOString(),

        });

    } catch (error: any) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,

                changed: false,

                message:
                    error.message,
            },
            {
                status: 500,
            }
        );

    }

}