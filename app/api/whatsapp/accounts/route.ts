import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConnections } from "@/lib/api/whatsapp/repository";
import { getOrganizationPlan, getPlanUsage } from "@/lib/billing/access";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId as string | undefined;
    if (!organizationId) return NextResponse.json({success:false,message:"Unauthorized"},{status:401});

    const [accounts, plan, usage] = await Promise.all([
      getConnections(organizationId), getOrganizationPlan(organizationId), getPlanUsage(organizationId)
    ]);

    return NextResponse.json({
      success:true,
      accounts:accounts.map((account:any)=>({
        id:account.id,wabaId:account.waba_id,phoneNumberId:account.phone_number_id,
        phoneNumber:account.phone_number,displayName:account.display_name,
        verifiedName:account.verified_name,status:account.status,
        qualityRating:account.quality_rating,messagingLimit:account.messaging_limit,
        isCoexistence:account.is_coexistence,connectedAt:account.connected_at,
      })),
      usage,limit:plan.limits.whatsappNumbers,plan:plan.planCode
    });
  } catch (error:any) {
    return NextResponse.json({success:false,message:error.message || "Unable to load WhatsApp accounts."},{status:500});
  }
}
