import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Send,
  Shield,
  Sparkles,
  Zap,
  BarChart3,
} from "lucide-react";
import { BRAND } from "@/config/branding";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full opacity-40 blur-[120px] gradient-brand" />
      <div className="pointer-events-none absolute top-1/3 -right-40 size-[420px] rounded-full opacity-30 blur-[120px] bg-brand-green" />

      {/* Nav */}
      <header className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
   <img src={BRAND.logo} alt={BRAND.name} className="h-20 w-20 " />
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a className="hover:text-foreground transition" href="#features">Features</a>
          <a className="hover:text-foreground transition" href="#pricing">Pricing</a>
          <a className="hover:text-foreground transition" href="#customers">Customers</a>
          <a className="hover:text-foreground transition" href="#docs">Docs</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground transition">Sign in</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-90 transition">
            Open App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium mb-6">
            <Sparkles className="size-3 text-brand-purple" />
            New · AI-powered template suggestions
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            WhatsApp messaging,<br />
            <span className="text-gradient-brand">reimagined for growth.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            {BRAND.name} is the premium command center for WhatsApp Business. Broadcast to millions, automate conversations, and convert chats into revenue — all in one elegant workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/dashboard" className="px-6 py-3.5 rounded-xl gradient-brand text-white font-semibold shadow-[var(--shadow-glow)] hover:opacity-90 transition flex items-center gap-2">
              Launch Dashboard <ArrowRight className="size-4" />
            </Link>
            <Link href="/login" className="px-6 py-3.5 rounded-xl border border-border bg-background/60 backdrop-blur font-semibold hover:bg-muted transition">
              Sign in
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {["Official Meta Business Partner", "GDPR compliant", "99.99% uptime"].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-brand-green" />{t}</span>
            ))}
          </div>
        </div>

        {/* Hero visual: phone + floating cards */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto w-[280px] aspect-[9/19] bg-[#0B141A] rounded-[3rem] p-3 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col" style={{ background: "#ECE5DD" }}>
              <div className="bg-[#075E54] pt-9 pb-3 px-4 flex items-center gap-3 text-white">
                <div className="size-9 rounded-full bg-white/20 grid place-items-center text-xs font-bold">M</div>
                <div>
                  <div className="text-sm font-semibold">{BRAND.name}</div>
                  <div className="text-[10px] text-white/70">online</div>
                </div>
              </div>
              <div className="flex-1 p-3 space-y-3">
                <div className="max-w-[85%] bg-white p-2.5 rounded-xl rounded-tl-sm shadow-sm">
                  <p className="text-[12px] leading-snug">Hey <b>Alex</b> 👋 your order <b>#A2840</b> is on the way.</p>
                  <p className="text-[9px] text-right text-muted-foreground mt-1">14:22</p>
                </div>
                <div className="max-w-[85%] bg-white p-2 rounded-xl rounded-tl-sm shadow-sm">
                  <div className="text-center text-[11px] font-semibold text-brand-blue py-1">📍 Track Shipment</div>
                </div>
                <div className="max-w-[85%] ml-auto bg-[#DCF8C6] p-2.5 rounded-xl rounded-tr-sm shadow-sm">
                  <p className="text-[12px] leading-snug">Awesome, thanks! ⚡</p>
                </div>
              </div>
            </div>
          </div>
          {/* Floating stat */}
          <div className="absolute -left-4 top-12 glass rounded-2xl p-4 shadow-[var(--shadow-card)] w-44 hidden md:block">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Read rate</div>
            <div className="text-2xl font-bold mt-1 tabular-nums">84.2%</div>
            <div className="text-[11px] text-brand-green font-semibold">+4.1% this week</div>
          </div>
          <div className="absolute -right-2 bottom-16 glass rounded-2xl p-4 shadow-[var(--shadow-card)] w-48 hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-7 rounded-lg gradient-brand grid place-items-center text-white"><Send className="size-3.5" /></div>
              <div className="text-xs font-semibold">Broadcast sent</div>
            </div>
            <div className="text-[11px] text-muted-foreground">12,402 delivered · 31% CTR</div>
          </div>
        </div>
      </section>

      {/* Logos strip */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-8 border-y border-border">
        <p className="text-center text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-5">Powering messaging for 2,400+ brands</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-60">
          {["NORTHWIND", "Acme Co.", "Lumière", "Halcyon", "Stratoscope", "Verdant"].map(n => (
            <span key={n} className="text-lg md:text-xl font-bold tracking-tight">{n}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-brand mb-3">Everything you need</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">A complete WhatsApp business stack</h2>
          <p className="mt-4 text-muted-foreground">From verified onboarding to BI-grade analytics, {BRAND.name} is built to make every message count.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { i: MessageCircle, t: "Meta Embedded Signup", d: "Get verified and connected in minutes — no spreadsheets, no support tickets." },
            { i: Send, t: "Broadcast Builder", d: "Compose, preview, and dispatch campaigns to millions with a live phone preview." },
            { i: Sparkles, t: "Template Studio", d: "Submit, track, and reuse approved templates across markets and languages." },
            { i: BarChart3, t: "Real-time Analytics", d: "Delivery, read, and conversion telemetry — drill into every campaign." },
            { i: Shield, t: "Enterprise Security", d: "SOC 2 controls, GDPR, end-to-end encrypted webhooks, audit log." },
            { i: Zap, t: "Automation Flows", d: "Trigger replies, route to humans, and sync with your CRM in real time." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="glass rounded-2xl p-6 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform">
              <div className="size-10 rounded-xl gradient-brand grid place-items-center text-white shadow-[var(--shadow-glow)] mb-4">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-24">
        <div className="relative overflow-hidden rounded-3xl p-12 md:p-16 gradient-brand text-white text-center shadow-[var(--shadow-glow)]">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to send your first broadcast?</h2>
            <p className="mt-4 text-white/80 max-w-xl mx-auto">Spin up {BRAND.name} in under 5 minutes. No credit card required.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/dashboard" className="px-6 py-3.5 rounded-xl bg-white text-brand-navy font-semibold hover:opacity-90 transition flex items-center gap-2">
                Get Started Free <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="px-6 py-3.5 rounded-xl border border-white/30 text-white font-semibold hover:bg-white/10 transition">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <img src={BRAND.logo} alt="{BRAND.name}" className="h-10 opacity-80" />
            <span>© 2026 {BRAND.name}, Inc.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Status</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}  
