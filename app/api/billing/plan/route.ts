import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrganizationPlan, getPlanUsage } from "@/lib/billing/access";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId as string | undefined;
    if (!organizationId) return NextResponse.json({success:false,message:"Unauthorized"},{status:401});

    const [plan, usage] = await Promise.all([getOrganizationPlan(organizationId), getPlanUsage(organizationId)]);
    return NextResponse.json({success:true,plan:plan.planCode,subscriptionStatus:plan.subscriptionStatus,limits:plan.limits,usage});
  } catch (error:any) {
    return NextResponse.json({success:false,message:error.message || "Unable to load plan."},{status:500});
  }
}
