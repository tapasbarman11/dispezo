"use client";

import { useCallback, useEffect, useState } from "react";
import { CreditCard, RefreshCw, MessageCircle, Users, Radio, CheckCircle2, AlertCircle } from "lucide-react";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function money(value: number | null, currency = "INR") {
  if (value == null || !Number.isFinite(value)) return "Not available";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}

export default function WhatsAppBillingPanel() {
  const [plan, setPlan] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async (refreshMeta = false) => {
    try {
      setLoading(true);
      const [planRes, metaRes] = await Promise.all([
        fetch("/api/billing/plan", { cache: "no-store" }),
        fetch(`/api/whatsapp/billing${refreshMeta ? "?refresh=1" : ""}`, { cache: "no-store" }),
      ]);
      const planJson = await planRes.json();
      const metaJson = await metaRes.json();
      if (planJson.success) setPlan(planJson);
      if (metaJson.success) setMeta(metaJson);
    } catch (error) {
      console.error("Unable to load billing information", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = () => {
    setSyncing(true);
    load(true);
  };

  const used = Number(plan?.usage?.monthlyMessages || 0);
  const limit = plan?.limits?.monthlyMessages == null ? null : Number(plan.limits.monthlyMessages);
  const remaining = limit == null ? null : Math.max(0, limit - used);
  const percentage = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const contacts = Number(plan?.usage?.contacts || 0);
  const broadcasts = Number(plan?.usage?.broadcasts || 0);
  const metaBalance = meta?.billing?.balance;
  const metaCreditAvailable = meta?.billing?.creditAvailable;
  const currency = meta?.billing?.currency || "INR";

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Meta WhatsApp Billing</div>
            <h2 className="text-[15px] font-semibold">Meta billing status</h2>
            <p className="text-xs text-muted-foreground mt-1">This is separate from your Dispezo subscription limits.</p>
          </div>
          <button onClick={refresh} disabled={syncing} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted disabled:opacity-50">
            <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} /> {syncing ? "Syncing" : "Sync"}
          </button>
        </div>

        {loading ? <div className="h-24 animate-pulse rounded-xl bg-gray-100" /> : meta?.available ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border p-4"><div className="text-xs text-muted-foreground">Meta balance</div><div className="mt-1 text-lg font-bold">{money(metaBalance, currency)}</div></div>
            <div className="rounded-xl border border-border p-4"><div className="text-xs text-muted-foreground">Credit available</div><div className="mt-1 text-lg font-bold">{money(metaCreditAvailable, currency)}</div></div>
            <div className="rounded-xl border border-border p-4"><div className="text-xs text-muted-foreground">Currency</div><div className="mt-1 text-lg font-bold">{currency}</div></div>
            <div className="rounded-xl border border-border p-4"><div className="text-xs text-muted-foreground">Credit line</div><div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 className="size-4" /> Connected</div></div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
            <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
            <div><div className="text-sm font-semibold text-amber-800">Meta billing balance unavailable</div><p className="text-xs text-amber-700 mt-1">{meta?.message || "Your current Meta token does not have access to the Business Billing/Credit Line API."}</p></div>
          </div>
        )}
        {meta?.lastSyncedAt && <div className="mt-3 text-[11px] text-muted-foreground">Last synced {new Date(meta.lastSyncedAt).toLocaleString("en-IN")}</div>}
      </div>

      <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Dispezo Plan</div>
            <h2 className="text-[15px] font-semibold">{plan?.plan || "-"} plan</h2>
            <p className="text-xs text-muted-foreground mt-1">Your Dispezo subscription allowance, not Meta billing.</p>
          </div>
          <span className="rounded-full bg-brand-purple/10 px-3 py-1 text-[11px] font-bold text-brand-purple">{plan?.subscriptionStatus || "-"}</span>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium">Monthly messages</span><span className="text-xs font-semibold">{formatNumber(used)}{limit == null ? "" : ` / ${formatNumber(limit)}`}</span></div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-brand transition-all" style={{ width: `${percentage}%` }} /></div>
          <div className="mt-2 text-xs text-muted-foreground">{remaining == null ? "Unlimited messages" : `${formatNumber(remaining)} messages remaining this month`}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border p-4 flex items-center gap-3"><div className="size-9 rounded-lg bg-brand-purple/10 grid place-items-center"><MessageCircle className="size-4 text-brand-purple" /></div><div><div className="text-xs text-muted-foreground">Messages</div><div className="text-sm font-semibold">{formatNumber(used)} used</div></div></div>
          <div className="rounded-xl border border-border p-4 flex items-center gap-3"><div className="size-9 rounded-lg bg-blue-50 grid place-items-center"><Users className="size-4 text-blue-600" /></div><div><div className="text-xs text-muted-foreground">Contacts</div><div className="text-sm font-semibold">{formatNumber(contacts)}</div></div></div>
          <div className="rounded-xl border border-border p-4 flex items-center gap-3"><div className="size-9 rounded-lg bg-emerald-50 grid place-items-center"><Radio className="size-4 text-emerald-600" /></div><div><div className="text-xs text-muted-foreground">Broadcasts</div><div className="text-sm font-semibold">{formatNumber(broadcasts)}</div></div></div>
        </div>
      </div>
    </div>
  );
}
