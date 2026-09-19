import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCampaign, listCampaigns } from "@/lib/api/campaigns/repository";
import { getContactsByTag } from "@/lib/api/contacts/repository";
import { getTemplateByName } from "@/lib/api/campaigns/template";
import { getMetaRate } from "@/lib/meta/pricing";

async function organizationId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.organizationId as string | undefined;
}

async function templateUnitCost(category: string, volume: number) {
  return getMetaRate(category, volume, "INR", "IN");
}

export async function GET(req: NextRequest) {
  try {
    const org = await organizationId();
    if (!org) return NextResponse.json({ success:false, message:"Unauthorized" }, {status:401});
    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") || 10)));
    const { campaigns, total } = await listCampaigns(org, page, pageSize);
    return NextResponse.json({ success:true, campaigns:campaigns.map((c:any)=>({...c,cost:c.totalCost,executionDurationSeconds:c.executionDurationMs==null?null:Math.round(c.executionDurationMs/1000)})), total, page, pageSize, totalPages:Math.max(1,Math.ceil(total/pageSize)) });
  } catch (error:any) {
    return NextResponse.json({success:false,message:error.message||"Failed to load campaigns."},{status:500});
  }
}

export async function POST(req: NextRequest) {
  try {
    const org = await organizationId();
    if (!org) return NextResponse.json({success:false,message:"Unauthorized"},{status:401});
    const body = await req.json();
    const { campaignName, templateName, audienceTag, variableMapping = {}, manualVariableValues = {}, scheduledAt = null } = body;
    if (!campaignName?.trim() || !templateName || !audienceTag) return NextResponse.json({success:false,message:"Campaign name, template and audience are required."},{status:400});

    const template = await getTemplateByName(org, templateName);
    if (!template) return NextResponse.json({success:false,message:"Template not found."},{status:404});
    if ((template.status || "").toUpperCase() !== "APPROVED") return NextResponse.json({success:false,message:"Only approved templates can be broadcast."},{status:400});

    const contacts = await getContactsByTag(org, audienceTag);
    if (!contacts.length) return NextResponse.json({success:false,message:`No contacts found under audience "${audienceTag}".`},{status:400});

    const parsedSchedule = scheduledAt ? new Date(scheduledAt) : null;
    if (parsedSchedule && Number.isNaN(parsedSchedule.getTime())) return NextResponse.json({success:false,message:"Invalid scheduled date/time."},{status:400});
    if (parsedSchedule && parsedSchedule.getTime() <= Date.now()) return NextResponse.json({success:false,message:"Scheduled time must be in the future."},{status:400});

    const campaign = await createCampaign({
      organizationId:org,
      campaignName,
      templateName,
      templateCategory:template.category || "MARKETING",
      audienceTag,
      totalContacts:contacts.length,
      unitCost:await templateUnitCost(template.category || "MARKETING", contacts.length),
      variableMapping,
      manualVariableValues,
      scheduledAt:parsedSchedule,
    });

    // Both Send Now and Scheduled campaigns are executed by the Dispezo
    // campaign worker. Send Now is persisted as IN_PROGRESS and picked up
    // on the next worker tick; Scheduled is persisted as SCHEDULED.
    return NextResponse.json({
      success:true,
      campaign:{
        ...campaign,
        cost:campaign.totalCost,
        executionDurationSeconds:campaign.executionDurationMs==null?null:Math.round(campaign.executionDurationMs/1000)
      }
    }, { status: 201 });
  } catch (error:any) {
    console.error("Create campaign error",error);
    return NextResponse.json({success:false,message:error.message||"Failed to create campaign."},{status:500});
  }
}
