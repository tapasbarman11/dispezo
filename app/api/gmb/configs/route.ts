import { NextRequest, NextResponse } from "next/server";
import { listEnabledConfigsForN8n } from "@/lib/api/gmb/repository";
import { decrypt } from "@/lib/crypto";

//-----------------------------------------------------
// GET — every enabled business config, for n8n to
// loop through on its own fixed schedule.
//-----------------------------------------------------

export async function GET(req: NextRequest) {

    try {

        const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");

        if (!apiKey || apiKey !== process.env.GMB_N8N_API_KEY) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const rows = await listEnabledConfigsForN8n();

        const configs = rows.map((r) => ({
            organizationId: r.organizationId,
            googleAccountId: r.googleAccountId,
            locationId: r.locationId,
            businessName: r.businessName,
            accessToken: decrypt(r.accessToken),
            refreshToken: decrypt(r.refreshToken),
            businessPhone: r.businessPhone,
            services: r.services || [],
            negativeReplyTemplate: r.negativeReplyTemplate,
            notificationEmail: r.notificationEmail,
        }));

        return NextResponse.json({
            success: true,
            configs,
        });

    } catch (err: any) {

        console.error("GMB configs GET error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to load configs." },
            { status: 500 }
        );

    }

}
