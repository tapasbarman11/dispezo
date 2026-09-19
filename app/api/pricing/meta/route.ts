import { NextResponse } from "next/server";
import { getMetaPricingSnapshot } from "@/lib/meta/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ success:true, ...(await getMetaPricingSnapshot("INR","IN")) });
  } catch (error:any) {
    return NextResponse.json({success:false,message:error.message || "Meta pricing is not available yet."},{status:500});
  }
}
