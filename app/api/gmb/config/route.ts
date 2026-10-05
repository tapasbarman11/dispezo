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
import { getOrganizationPlan } from "@/lib/billing/access";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const organizationId = (session?.user as any)?.organizationId;
        if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const [account, config, stats, plan] = await Promise.all([
            getGoogleAccount(organizationId),
            getConfig(organizationId),
            getActivityStats(organizationId),
            getOrganizationPlan(organizationId),
        ]);

        return NextResponse.json({ success: true, account, config, stats, gmbAutoResponderAvailable: plan.limits.googleReviewAutoresponder });
    } catch (err: any) {
        console.error("GMB config GET error:", err);
        return NextResponse.json({ success: false, message: "Failed to load Google Reviews data." }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const organizationId = (session?.user as any)?.organizationId;
        if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const plan = await getOrganizationPlan(organizationId);
        if (body.enabled === true && !plan.limits.googleReviewAutoresponder) {
            return NextResponse.json({ success: false, message: `Google Review Auto-Responder is not available on the ${plan.planCode} plan. Upgrade your plan to enable it.` }, { status: 403 });
        }

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
        return NextResponse.json({ success: false, message: err?.message || "Failed to save settings." }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        const organizationId = (session?.user as any)?.organizationId;
        if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        await deleteGoogleAccount(organizationId);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("GMB disconnect error:", err);
        return NextResponse.json({ success: false, message: "Failed to disconnect." }, { status: 500 });
    }
}
