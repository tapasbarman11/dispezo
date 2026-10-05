import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConnection } from "@/lib/api/whatsapp/repository";
import { decrypt } from "@/lib/crypto";
import { metaGET } from "@/lib/meta/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId as string | undefined;
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const account = await getConnection(organizationId);
    if (!account) return NextResponse.json({ success: false, available: false, message: "WhatsApp account not connected." });

    const token = decrypt(account.access_token);
    const refresh = req.nextUrl.searchParams.get("refresh") === "1";

    // Meta's billing/credit-line endpoint is not consistently available to every
    // WhatsApp Cloud API token. Try the WABA credit-line edge and return a clear
    // unavailable state instead of inventing a balance.
    const candidates = [
      `/${account.waba_id}/extendedcredits?fields=id,type,name,legal_entity_name,credit_available,credit_limit,currency`,
      `/${account.waba_id}/credit_lines?fields=id,type,name,credit_available,credit_limit,currency`,
    ];

    let raw: any = null;
    let lastError = "";
    for (const endpoint of candidates) {
      try {
        raw = await metaGET<any>(endpoint, token);
        if (raw) break;
      } catch (error: any) {
        lastError = error?.message || "Meta billing API unavailable";
      }
    }

    if (!raw) {
      return NextResponse.json({
        success: true,
        available: false,
        billing: null,
        message: lastError || "Meta billing information is unavailable for this connection.",
        refreshed: refresh,
      });
    }

    const row = Array.isArray(raw?.data) ? raw.data[0] : raw;
    const balance = row?.balance ?? row?.credit_available ?? row?.available_balance ?? null;
    const creditAvailable = row?.credit_available ?? row?.available_balance ?? null;
    const currency = row?.currency || "INR";

    return NextResponse.json({
      success: true,
      available: balance != null || creditAvailable != null,
      billing: {
        balance: balance == null ? null : Number(balance),
        creditAvailable: creditAvailable == null ? null : Number(creditAvailable),
        currency,
        creditLineId: row?.id || null,
        status: row?.status || null,
      },
      raw: process.env.NODE_ENV === "development" ? raw : undefined,
      lastSyncedAt: new Date().toISOString(),
      refreshed: refresh,
    });
  } catch (error: any) {
    console.error("WhatsApp billing error", error);
    return NextResponse.json({ success: false, available: false, message: error?.message || "Unable to load Meta billing information." }, { status: 500 });
  }
}
