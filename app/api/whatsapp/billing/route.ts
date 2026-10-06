import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConnection } from "@/lib/api/whatsapp/repository";
import { decrypt } from "@/lib/crypto";
import { metaGET } from "@/lib/meta/client";
import { getMetaRate } from "@/lib/meta/pricing";
import { getOrganizationPlan, getPlanUsage } from "@/lib/billing/access";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId as string | undefined;
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const [account, plan, usage] = await Promise.all([getConnection(organizationId), getOrganizationPlan(organizationId), getPlanUsage(organizationId)]);
    const planLimit = plan.limits.monthlyMessages == null ? null : Number(plan.limits.monthlyMessages);
    const monthlyMessages = Number(usage.monthlyMessages || 0);
    const planUsage = {
      monthlyMessages,
      limit: planLimit,
      remaining: planLimit == null ? null : Math.max(0, planLimit - monthlyMessages),
      percentage: planLimit ? Math.min(100, Math.round((monthlyMessages / planLimit) * 100)) : 0,
    };

    if (!account) {
      return NextResponse.json({ success: true, available: false, planUsage, message: "WhatsApp account not connected." });
    }

    const token = decrypt(account.access_token);
    const refresh = req.nextUrl.searchParams.get("refresh") === "1";
    const cached = await pool.query(
      `SELECT meta_billing_balance AS balance, meta_billing_credit_available AS "creditAvailable", meta_billing_currency AS currency, meta_billing_credit_line_id AS "creditLineId", meta_billing_last_synced_at AS "lastSyncedAt" FROM whatsapp_accounts WHERE id=$1 LIMIT 1`,
      [account.id]
    );
    const cachedRow = cached.rows[0];

    const responseWithEstimate = async (billing: any, lastSyncedAt: any, cachedValue: boolean, message?: string) => {
      let estimatedMarketingMessages: number | null = null;
      let estimatedUtilityMessages: number | null = null;
      const amount = Number(billing?.creditAvailable ?? billing?.balance ?? 0);

      if (amount > 0) {
        try {
          const [marketingRate, utilityRate] = await Promise.all([
            getMetaRate("MARKETING", monthlyMessages, "INR", "IN"),
            getMetaRate("UTILITY", monthlyMessages, "INR", "IN"),
          ]);
          if (marketingRate > 0) estimatedMarketingMessages = Math.floor(amount / marketingRate);
          if (utilityRate > 0) estimatedUtilityMessages = Math.floor(amount / utilityRate);
        } catch (e) {
          console.warn("Unable to calculate Meta message estimates", e);
        }
      }

      return NextResponse.json({
        success: true,
        available: billing?.balance != null || billing?.creditAvailable != null,
        billing: billing ? { ...billing, estimatedMarketingMessages, estimatedUtilityMessages } : null,
        lastSyncedAt,
        cached: cachedValue,
        planUsage,
        message,
      });
    };

    if (!refresh && cachedRow?.lastSyncedAt && Date.now() - new Date(cachedRow.lastSyncedAt).getTime() < 15 * 60 * 1000) {
      return responseWithEstimate(cachedRow, cachedRow.lastSyncedAt, true);
    }

    // Meta's credit-line endpoint is a Business-level endpoint, not a WABA endpoint.
    // The previous implementation incorrectly tried /{waba_id}/credit_lines, which
    // produces Meta's "Unknown path components: /credit_lines" error.
    const businessId = (account.business_id || account.business_manager_id || "").toString().trim();
    if (!businessId) {
      return NextResponse.json({
        success: true,
        available: false,
        billing: null,
        planUsage,
        message: "Meta billing information is unavailable because the connected Business ID is missing.",
      });
    }

    let raw: any = null;
    let lastError = "";

    try {
      raw = await metaGET<any>(
        `/${businessId}/extendedcredits?fields=id,legal_entity_name,balance,credit_available,currency`,
        token
      );
    } catch (error: any) {
      lastError = error?.message || "Meta billing API unavailable";
    }

    if (!raw) {
      if (cachedRow?.lastSyncedAt) {
        return responseWithEstimate(
          cachedRow,
          cachedRow.lastSyncedAt,
          true,
          "Unable to refresh Meta billing right now. Showing the last successful sync."
        );
      }

      const expired = /expired|session has expired|access token/i.test(lastError);
      const permission = /permission|(#\d+)|not authorized|unsupported get request/i.test(lastError);

      return NextResponse.json({
        success: true,
        available: false,
        billing: null,
        planUsage,
        tokenExpired: expired,
        message: expired
          ? "Your Meta access token has expired. Use Reconnect in the Connection Status card to authorize WhatsApp again."
          : permission
            ? "Meta billing balance is not available with the current WhatsApp connection credentials."
            : "Meta billing balance is currently unavailable for this Business account.",
        refreshed: refresh,
      });
    }

    const row = Array.isArray(raw?.data) ? raw.data[0] : raw;
    if (!row) {
      return responseWithEstimate(null, new Date().toISOString(), false, "No Meta credit line is currently associated with this Business account.");
    }

    const balance = row?.balance ?? row?.credit_available ?? row?.available_balance ?? null;
    const creditAvailable = row?.credit_available ?? row?.available_balance ?? null;
    const currency = row?.currency || "INR";
    const lastSyncedAt = new Date().toISOString();

    await pool.query(
      `UPDATE whatsapp_accounts SET meta_billing_balance=$2, meta_billing_credit_available=$3, meta_billing_currency=$4, meta_billing_credit_line_id=$5, meta_billing_last_synced_at=$6, updated_at=NOW() WHERE id=$1`,
      [account.id, balance == null ? null : Number(balance), creditAvailable == null ? null : Number(creditAvailable), currency, row?.id || null, lastSyncedAt]
    );

    return responseWithEstimate(
      {
        balance: balance == null ? null : Number(balance),
        creditAvailable: creditAvailable == null ? null : Number(creditAvailable),
        currency,
        creditLineId: row?.id || null,
        legalEntityName: row?.legal_entity_name || null,
        status: row?.status || null,
      },
      lastSyncedAt,
      false
    );
  } catch (error: any) {
    console.error("WhatsApp billing error", error);
    return NextResponse.json({ success: false, available: false, message: error?.message || "Unable to load Meta billing information." }, { status: 500 });
  }
}
