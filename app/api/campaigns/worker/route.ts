import { NextRequest, NextResponse } from "next/server";
import { executeCampaignBatch, executeDueCampaigns } from "@/lib/api/campaigns/worker";

function authorized(req: NextRequest) {
  const expected = process.env.DISPAZ_BROADCAST_WORKER_SECRET;
  if (!expected) return false;
  const supplied = req.headers.get("x-dispaz-worker-secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return supplied === expected;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(100, Math.max(1, Number(body.batchSize || 50)));

    if (body.campaignId && body.organizationId) {
      const result = await executeCampaignBatch(
        String(body.campaignId),
        String(body.organizationId),
        batchSize
      );
      return NextResponse.json({ success: true, ...result });
    }

    const results = await executeDueCampaigns(Math.min(10, Math.max(1, Number(body.limit || 3))), batchSize);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("Campaign worker execution error", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Worker execution failed." },
      { status: 500 }
    );
  }
}
