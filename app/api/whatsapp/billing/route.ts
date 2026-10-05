import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConnection } from "@/lib/api/whatsapp/repository";
import { decrypt } from "@/lib/crypto";
import { metaGET } from "@/lib/meta/client";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId as string | undefined;
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const account = await getConnection(organizationId);
    if (!account) return NextResponse.json({ success: false, available: false, message: "WhatsApp account not connected." });

    const token = decrypt(account.access_token);
    const refresh = req.nextUrl.searchParams.get("refresh") === "1";
    const cached = await pool.query(
      `SELECT meta_billing_balance AS balance,
              meta_billing_credit_available AS "creditAvailable",
              meta_billing_currency AS currency,
              meta_billing_credit_line_id AS "creditLineId",
              meta_billing_last_synced_at AS "lastSyncedAt"
         FROM whatsapp_accounts WHERE id=$1 LIMIT 1`,
      [account.id]
    );
    const cachedRow = cached.rows[0];

    if (!refresh && cachedRow?.lastSyncedAt && Date.now() - new Date(cachedRow.lastSyncedAt).getTime() < 15 * 60 * 1000) {
      return NextResponse.json({ success: true, available: cachedRow.balance != null || cachedRow.creditAvailable != null, billing: cachedRow, lastSyncedAt: cachedRow.lastSyncedAt, cached: true });
    }

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
      if (cachedRow?.lastSyncedAt) {
        return NextResponse.json({ success: true, available: cachedRow.balance != null || cachedRow.creditAvailable != null, billing: cachedRow, lastSyncedAt: cachedRow.lastSyncedAt, cached: true, message: lastError || "Using the last successful Meta billing sync." });
      }
      return NextResponse.json({ success: true, available: false, billing: null, message: lastError || "Meta billing information is unavailable for this connection.", refreshed: refresh });
    }

    const row = Array.isArray(raw?.data) ? raw.data[0] : raw;
    const balance = row?.balance ?? row?.credit_available ?? row?.available_balance ?? null;
    const creditAvailable = row?.credit_available ?? row?.available_balance ?? null;
    const currency = row?.currency || "INR";
    const lastSyncedAt = new Date().toISOString();

    await pool.query(
      `UPDATE whatsapp_accounts
          SET meta_billing_balance=$2,
              meta_billing_credit_available=$3,
              meta_billing_currency=$4,
              meta_billing_credit_line_id=$5,
              meta_billing_last_synced_at=$6,
              updated_at=NOW()
        WHERE id=$1`,
      [account.id, balance == null ? null : Number(balance), creditAvailable == null ? null : Number(creditAvailable), currency, row?.id || null, lastSyncedAt]
    );

    return NextResponse.json({
      success: true,
      available: balance != null || creditAvailable != null,
      billing: { balance: balance == null ? null : Number(balance), creditAvailable: creditAvailable == null ? null : Number(creditAvailable), currency, creditLineId: row?.id || null, status: row?.status || null },
      raw: process.env.NODE_ENV === "development" ? raw : undefined,
      lastSyncedAt,
      refreshed: refresh,
      cached: false,
    });
  } catch (error: any) {
    console.error("WhatsApp billing error", error);
    return NextResponse.json({ success: false, available: false, message: error?.message || "Unable to load Meta billing information." }, { status: 500 });
  }
}
