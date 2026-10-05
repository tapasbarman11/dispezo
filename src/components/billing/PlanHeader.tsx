"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown } from "lucide-react";

export default function PlanHeader() {
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/billing/plan", { cache: "no-store" })
      .then(r => r.json())
      .then(data => { if (mounted && data.success) setPlan(data); })
      .catch(() => undefined);
    return () => { mounted = false; };
  }, []);

  const used = Number(plan?.usage?.monthlyMessages || 0);
  const limit = plan?.limits?.monthlyMessages == null ? null : Number(plan.limits.monthlyMessages);
  const percent = limit ? Math.min(100, (used / limit) * 100) : 0;
  const label = plan?.plan ? `${String(plan.plan).charAt(0)}${String(plan.plan).slice(1).toLowerCase()} Plan` : "Plan";

  return (
    <Link href="/settings" className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-sm hover:border-brand-purple/30 hover:shadow-md transition">
      <div className="flex items-center gap-2 whitespace-nowrap"><Crown className="size-4 text-amber-500" /><span className="text-sm font-semibold">{label}</span></div>
      {limit != null && <><div className="h-2 w-20 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full gradient-brand" style={{ width: `${percent}%` }} /></div><span className="text-xs font-medium text-slate-600 whitespace-nowrap">{used.toLocaleString("en-IN")} / {limit.toLocaleString("en-IN")} messages</span></>}
      <span className="rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue px-3 py-1.5 text-xs font-semibold text-white">Upgrade</span>
    </Link>
  );
}
