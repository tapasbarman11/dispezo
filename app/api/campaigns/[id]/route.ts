import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCampaign } from "@/lib/api/campaigns/repository";

export async function GET(_req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  const session = await getServerSession(authOptions);
  const organizationId = (session?.user as any)?.organizationId as string | undefined;
  if (!organizationId) return NextResponse.json({success:false,message:"Unauthorized"},{status:401});
  const {id} = await params;
  const campaign = await getCampaign(id,organizationId);
  if (!campaign) return NextResponse.json({success:false,message:"Campaign not found."},{status:404});
  return NextResponse.json({success:true,campaign});
}
