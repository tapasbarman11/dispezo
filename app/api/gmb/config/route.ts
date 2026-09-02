import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
    getGoogleAccount,
    getConfig,
    upsertConfig,
    getActivityStats,
    deleteGoogleAccount,
} from "@/lib/api/gmb/repository";

//-----------------------------------------------------
// GET — full page data: connection + config + stats
//-----------------------------------------------------

export async function GET() {

    try {

        const session = await getServerSession(authOptions);

        const organizationId = (session?.user as any)?.organizationId;

        if (!organizationId) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const [account, config, stats] = await Promise.all([
            getGoogleAccount(organizationId),
            getConfig(organizationId),
            getActivityStats(organizationId),
        ]);

        return NextResponse.json({
            success: true,
            account,
            config,
            stats,
        });

    } catch (err: any) {

        console.error("GMB config GET error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to load Google Reviews data." },
            { status: 500 }
        );

    }

}

//-----------------------------------------------------
// PUT — save auto-responder config
//-----------------------------------------------------

export async function PUT(req: NextRequest) {

    try {

        const session = await getServerSession(authOptions);

        const organizationId = (session?.user as any)?.organizationId;

        if (!organizationId) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const body = await req.json();

        await upsertConfig({
            organizationId,
            businessPhone: body.businessPhone,
            services: body.services,
            negativeReplyTemplate: body.negativeReplyTemplate,
            notificationEmail: body.notificationEmail,
            enabled: body.enabled,
        });

        return NextResponse.json({ success: true });

    } catch (err: any) {

        console.error("GMB config PUT error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to save settings." },
            { status: 500 }
        );

    }

}

//-----------------------------------------------------
// DELETE — disconnect Google Business account
//-----------------------------------------------------

export async function DELETE() {

    try {

        const session = await getServerSession(authOptions);

        const organizationId = (session?.user as any)?.organizationId;

        if (!organizationId) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        await deleteGoogleAccount(organizationId);

        return NextResponse.json({ success: true });

    } catch (err: any) {

        console.error("GMB disconnect error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to disconnect." },
            { status: 500 }
        );

    }

}
