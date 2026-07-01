"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Calendar, ChevronDown, Send, Users, Sparkles } from "lucide-react";

export default function BroadcastsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Campaign"
        title="New Broadcast"
        description="Compose your campaign, see the live preview, and dispatch with confidence."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass rounded-2xl p-8 shadow-[var(--shadow-card)] space-y-6">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Campaign Name</label>
              <input
                placeholder="Summer Special Promotion 2026"
                defaultValue="Summer Special — 20% Off Facials"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-base font-medium outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Template</label>
                <button className="w-full px-4 py-3 rounded-xl bg-background border border-brand-blue/30 flex items-center justify-between text-sm font-medium">
                  <span className="font-mono">summer_sale_promo</span>
                  <span className="px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green text-[10px] font-bold">APPROVED</span>
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Audience</label>
                <button className="w-full px-4 py-3 rounded-xl bg-background border border-border flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2"><Users className="size-4 text-muted-foreground" /> Active Members</span>
                  <span className="text-muted-foreground text-xs">1,240</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Variables</label>
              <div className="space-y-2">
                {[
                  { k: "{{1}}", v: "First Name" },
                  { k: "{{2}}", v: "Business Name" },
                ].map((row) => (
                  <div key={row.k} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                    <code className="font-mono text-sm text-brand-purple font-bold">{row.k}</code>
                    <ChevronDown className="size-3 text-muted-foreground -rotate-90" />
                    <span className="text-sm font-medium flex-1">{row.v}</span>
                    <Sparkles className="size-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Schedule</label>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-3 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)] flex items-center justify-center gap-2">
                  <Send className="size-4" /> Send Now
                </button>
                <button className="px-5 py-3 rounded-xl border border-border bg-background font-medium text-sm flex items-center gap-2 hover:bg-muted transition">
                  <Calendar className="size-4" /> Schedule
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { k: "Recipients", v: "1,240" },
              { k: "Est. Cost", v: "$18.60" },
              { k: "Est. Delivery", v: "~3 min" },
            ].map(s => (
              <div key={s.k} className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.k}</div>
                <div className="text-xl font-bold tracking-tight mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Phone preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gradient-brand text-center mb-4">Live WhatsApp Preview</div>
          <div className="mx-auto w-[300px] aspect-[9/19] bg-[#0B141A] rounded-[3rem] p-3 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col" style={{ background: "#ECE5DD" }}>
              {/* Header */}
              <div className="bg-[#075E54] pt-9 pb-3 px-4 flex items-center gap-3 text-white">
                <div className="size-9 rounded-full bg-white/20 grid place-items-center text-xs font-bold">EW</div>
                <div>
                  <div className="text-sm font-semibold">Elite Wellness Spa</div>
                  <div className="text-[10px] text-white/70">online</div>
                </div>
              </div>
              {/* Messages */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <div className="mx-auto px-3 py-1 rounded-full bg-white/60 text-[10px] text-muted-foreground w-fit">Today</div>
                <div className="max-w-[85%] bg-white p-2.5 rounded-xl rounded-tl-sm shadow-sm">
                  <p className="text-[12px] leading-snug text-foreground">
                    🌞 Summer's here, <b>Alice</b>! Get <b>20% off</b> all facials at <b>Elite Wellness Spa</b> this weekend.
                  </p>
                  <p className="text-[9px] text-right text-muted-foreground mt-1">14:20</p>
                </div>
                <div className="max-w-[85%] bg-white p-2 rounded-xl rounded-tl-sm shadow-sm border-t border-l border-brand-blue/20">
                  <div className="text-center text-[11px] font-semibold text-brand-blue py-1">📅 Book Now</div>
                </div>
              </div>
              {/* Input */}
              <div className="p-2 bg-[#F0F0F0] flex items-center gap-2">
                <div className="flex-1 h-9 bg-white rounded-full" />
                <div className="size-9 rounded-full bg-[#128C7E] grid place-items-center text-white">
                  <Send className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}