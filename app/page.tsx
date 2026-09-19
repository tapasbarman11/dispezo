import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Send, Shield, Sparkles, Zap, BarChart3 } from "lucide-react";
import { BRAND } from "@/config/branding";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <div className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full opacity-40 blur-[120px] gradient-brand" />
      <div className="pointer-events-none absolute top-1/3 -right-40 size-[420px] rounded-full opacity-30 blur-[120px] bg-brand-green" />

      <header className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3"><img src={BRAND.logo} alt={BRAND.name} className="h-20 w-auto" /></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a className="hover:text-foreground transition" href="#features">Features</a>
          <Link className="text-foreground font-semibold transition" href="/pricing">Pricing</Link>
          <a className="hover:text-foreground transition" href="#customers">Customers</a>
          <a className="hover:text-foreground transition" href="#docs">Docs</a>
        </nav>
        <div className="flex items-center gap-3"><Link href="/login" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link><Link href="/login" className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)]">Get started free</Link></div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium mb-6"><Sparkles className="size-3 text-brand-purple"/>WhatsApp Business, simplified</div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">WhatsApp messaging,<br/><span className="text-gradient-brand">reimagined for growth.</span></h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">{BRAND.name} is a modern command center for WhatsApp Business. Build campaigns, manage customer contacts, connect your WhatsApp number, and understand delivery performance from one elegant workspace.</p>
          <div className="mt-8 flex flex-wrap items-center gap-3"><Link href="/login" className="px-6 py-3.5 rounded-xl gradient-brand text-white font-semibold shadow-[var(--shadow-glow)] flex items-center gap-2">Get started free<ArrowRight className="size-4"/></Link><Link href="/pricing" className="px-6 py-3.5 rounded-xl border border-border bg-background/60 backdrop-blur font-semibold hover:bg-muted">View pricing</Link></div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">{["Meta Embedded Signup","Transparent pricing","No hidden mark-up"].map(t=><span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-brand-green"/>{t}</span>)}</div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto w-[280px] aspect-[9/19] bg-[#0B141A] rounded-[3rem] p-3 shadow-2xl"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10"/><div className="w-full h-full rounded-[2.5rem] overflow-hidden flex flex-col" style={{background:"#ECE5DD"}}><div className="bg-[#075E54] pt-9 pb-3 px-4 flex items-center gap-3 text-white"><div className="size-9 rounded-full bg-white/20 grid place-items-center text-xs font-bold">M</div><div><div className="text-sm font-semibold">{BRAND.name}</div><div className="text-[10px] text-white/70">online</div></div></div><div className="flex-1 p-3 space-y-3"><div className="max-w-[85%] bg-white p-2.5 rounded-xl rounded-tl-sm shadow-sm"><p className="text-[12px]">Hey <b>Alex</b> 👋 your order <b>#A2840</b> is on the way.</p></div><div className="max-w-[85%] bg-white p-2 rounded-xl rounded-tl-sm shadow-sm"><div className="text-center text-[11px] font-semibold text-brand-blue py-1">📍 Track Shipment</div></div><div className="max-w-[85%] ml-auto bg-[#DCF8C6] p-2.5 rounded-xl rounded-tr-sm shadow-sm"><p className="text-[12px]">Awesome, thanks! ⚡</p></div></div></div></div>
          <div className="absolute -left-4 top-12 glass rounded-2xl p-4 shadow-[var(--shadow-card)] w-44 hidden md:block"><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Read rate</div><div className="text-2xl font-bold mt-1">84.2%</div><div className="text-[11px] text-brand-green font-semibold">Live campaign data</div></div>
          <div className="absolute -right-2 bottom-16 glass rounded-2xl p-4 shadow-[var(--shadow-card)] w-48 hidden md:block"><div className="flex items-center gap-2 mb-2"><div className="size-7 rounded-lg gradient-brand grid place-items-center text-white"><Send className="size-3.5"/></div><div className="text-xs font-semibold">Broadcast sent</div></div><div className="text-[11px] text-muted-foreground">Campaign delivery tracking</div></div>
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16"><p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-brand mb-3">Everything you need</p><h2 className="text-4xl md:text-5xl font-bold tracking-tight">A complete WhatsApp business stack</h2><p className="mt-4 text-muted-foreground">From verified onboarding to campaign analytics, {BRAND.name} keeps WhatsApp business messaging in one place.</p></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{[
          {i:MessageCircle,t:"Meta Embedded Signup",d:"Connect your WhatsApp Business account with a guided Meta onboarding flow."},{i:Send,t:"Broadcast Builder",d:"Compose, preview, schedule, and dispatch campaigns with delivery tracking."},{i:Sparkles,t:"Template Studio",d:"Submit, track, and reuse approved WhatsApp templates across languages."},{i:BarChart3,t:"Real-time Analytics",d:"Track sent, delivered, read, and failed campaign messages."},{i:Shield,t:"Secure Workspace",d:"Keep business messaging, contacts, credentials, and account access protected."},{i:Zap,t:"Built to Scale",d:"Grow from a small business to multi-number, high-volume WhatsApp operations."}
        ].map(({i:Icon,t,d})=><div key={t} className="glass rounded-2xl p-6 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform"><div className="size-10 rounded-xl gradient-brand grid place-items-center text-white shadow-[var(--shadow-glow)] mb-4"><Icon className="size-5"/></div><h3 className="font-semibold text-lg">{t}</h3><p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{d}</p></div>)}</div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 pb-24"><div className="relative overflow-hidden rounded-3xl p-12 md:p-16 gradient-brand text-white text-center shadow-[var(--shadow-glow)]"><div className="relative"><h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to send your first broadcast?</h2><p className="mt-4 text-white/80 max-w-xl mx-auto">Start with the free plan. Upgrade when your business needs more capacity.</p><div className="mt-8 flex flex-wrap items-center justify-center gap-3"><Link href="/login" className="px-6 py-3.5 rounded-xl bg-white text-brand-navy font-semibold flex items-center gap-2">Get started free<ArrowRight className="size-4"/></Link><Link href="/pricing" className="px-6 py-3.5 rounded-xl border border-white/30 text-white font-semibold">View pricing</Link></div></div></div></section>

      <footer className="relative z-10 border-t border-border"><div className="max-w-7xl mx-auto px-6 md:px-12 py-10 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground"><div className="flex items-center gap-3"><img src={BRAND.logo} alt={BRAND.name} className="h-10 opacity-80"/><span>© 2026 {BRAND.name}, Inc.</span></div><div className="flex gap-6"><Link href="/pricing" className="hover:text-foreground">Pricing</Link><Link href="/privacy" className="hover:text-foreground">Privacy</Link><Link href="/terms" className="hover:text-foreground">Terms</Link></div></div></footer>
    </div>
  );
}
