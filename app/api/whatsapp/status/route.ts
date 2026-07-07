import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getConnectionByOrganization } from "@/lib/api/whatsapp/service";

export async function GET() {

    try {

        const session = await getServerSession(authOptions);

        if (!session?.user) {

            return NextResponse.json(
                {
                    success: false,
                },
                {
                    status: 401,
                }
            );

        }

        const organizationId =
            (session.user as { organizationId: string }).organizationId;

        const account =
            await getConnectionByOrganization(
                organizationId
            );

        if (!account) {

            return NextResponse.json({
                success: true,
                connection: null,
            });

        }

        return NextResponse.json({

            success: true,

            connection: {

                connected: true,

                businessName:
                    account.meta_business_name,

                phoneNumber:
                    account.phone_number,

                verifiedName:
                    account.display_name,

                qualityRating:
                    account.quality_rating,

                messagingLimit:
                    account.messaging_limit,

                webhookStatus:
                    account.webhook_status,

                connectedAt:
                    account.connected_at,

                lastSyncedAt:
                    account.last_synced_at,

                wabaId:
                    account.waba_id,

                phoneNumberId:
                    account.phone_number_id,

            },

        });

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                success: false,
            },
            {
                status: 500,
            }
        );

    }

}