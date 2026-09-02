import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCampaign, listCampaigns } from "@/lib/api/campaigns/repository";
import { getContactsByTag } from "@/lib/api/contacts/repository";

//-----------------------------------------------------
// GET — list campaigns (paginated)
//-----------------------------------------------------

export async function GET(req: NextRequest) {

    try {

        const session = await getServerSession(authOptions);

        const organizationId =
            (session?.user as any)?.organizationId;

        if (!organizationId) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const { searchParams } = new URL(req.url);

        const page =
            parseInt(searchParams.get("page") || "1", 10);

        const pageSize = 10;

        const { campaigns, total } = await listCampaigns(
            organizationId,
            page,
            pageSize
        );

        return NextResponse.json({
            success: true,
            campaigns,
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        });

    } catch (err: any) {

        console.error("List campaigns error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to load campaigns." },
            { status: 500 }
        );

    }

}

//-----------------------------------------------------
// POST — create a campaign (queues it; actual sending
// is picked up by the background processor)
//-----------------------------------------------------

export async function POST(req: NextRequest) {

    try {

        const session = await getServerSession(authOptions);

        const organizationId =
            (session?.user as any)?.organizationId;

        if (!organizationId) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const body = await req.json();

        const { campaignName, templateName, audienceTag } = body;

        if (!campaignName || !templateName || !audienceTag) {

            return NextResponse.json(
                {
                    success: false,
                    message: "Campaign name, template, and audience are required.",
                },
                { status: 400 }
            );

        }

        // Resolve the actual send list now so we can store an
        // accurate total_contacts count on the campaign.
        const contacts = await getContactsByTag(
            organizationId,
            audienceTag
        );

        if (contacts.length === 0) {

            return NextResponse.json(
                {
                    success: false,
                    message: `No contacts found under audience "${audienceTag}".`,
                },
                { status: 400 }
            );

        }

        const campaign = await createCampaign({
            organizationId,
            campaignName,
            templateName,
            totalContacts: contacts.length,
            audienceTag,
        });

        // NOTE: Actual message sending is intentionally not done
        // here — a background processor (Coolify Scheduled Task
        // hitting /api/campaigns/send) drains queued campaigns in
        // small batches. This keeps this request fast regardless
        // of audience size and avoids request-timeout risk.

        return NextResponse.json({
            success: true,
            campaign,
        });

    } catch (err: any) {

        console.error("Create campaign error:", err);

        return NextResponse.json(
            {
                success: false,
                message: err.message || "Failed to create campaign.",
            },
            { status: 500 }
        );

    }

}
