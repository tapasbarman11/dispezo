"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Plus, MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react";

const templates = [
  { name: "appointment_reminder_v2", category: "UTILITY", status: "Approved", lang: "EN", preview: "Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}." },
  { name: "summer_sale_promo", category: "MARKETING", status: "Approved", lang: "EN", preview: "🌞 Summer's here! Get 20% off all treatments at {{1}}. Book now." },
  { name: "loyalty_reward_vip", category: "MARKETING", status: "Pending", lang: "EN", preview: "Hello {{1}}, as a VIP you've unlocked an exclusive {{2}} reward." },
  { name: "feedback_request_v1", category: "UTILITY", status: "Approved", lang: "EN", preview: "Thanks for visiting {{1}}! Mind sharing a quick review?" },
  { name: "delivery_otp", category: "AUTHENTICATION", status: "Approved", lang: "EN", preview: "Your code is {{1}}. Do not share it with anyone." },
  { name: "flash_sale_72h", category: "MARKETING", status: "Rejected", lang: "EN", preview: "URGENT! 72 hours only, biggest sale of the year!!!" },
];

const statusMap = {
  Approved: { cls: "bg-brand-green/10 text-brand-green", icon: CheckCircle2 },
  Pending: { cls: "bg-amber-500/10 text-amber-600", icon: Clock },
  Rejected: { cls: "bg-rose-500/10 text-rose-600", icon: XCircle },
} as const;

export default function TemplatesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Library"
        title="Message Templates"
        description="Pre-approved WhatsApp templates ready for broadcast and automation."
        actions={
          <button className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center gap-2 shadow-[var(--shadow-glow)]">
            <Plus className="size-4" /> New Template
          </button>
        }
      />

      <div className="flex gap-2 mb-6 text-xs font-medium">
        {["All Templates", "Marketing", "Utility", "Authentication"].map((c, i) => (
          <button key={c} className={`px-3 py-1.5 rounded-full ${i===0 ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:bg-muted"}`}>{c}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map((t) => {
          const meta = statusMap[t.status as keyof typeof statusMap];
          const Icon = meta.icon;
          return (
            <div key={t.name} className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform group">
              <div className="flex items-start justify-between mb-3">
                <div className="size-9 rounded-xl gradient-brand grid place-items-center text-white">
                  <MessageSquare className="size-4" />
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${meta.cls}`}>
                  <Icon className="size-3" /> {t.status.toUpperCase()}
                </span>
              </div>
              <div className="font-mono text-sm font-semibold mb-1">{t.name}</div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                <span>{t.category}</span><span>·</span><span>{t.lang}</span>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[80px]">
                {t.preview}
              </div>
              <div className="mt-4 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Updated 2d ago</span>
                <button className="font-semibold text-brand-blue group-hover:underline">Use in broadcast →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}