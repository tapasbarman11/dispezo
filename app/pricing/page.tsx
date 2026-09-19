import Link from "next/link";
import { ArrowRight, Check, MessageCircle, ShieldCheck, Users, Send, WalletCards, Sparkles } from "lucide-react";
import { BRAND } from "@/config/branding";

const plans = [
  { name:"Free", price:"₹0", description:"Get started with WhatsApp Business", featured:false, contacts:"Unlimited", team:"2", numbers:"1", broadcast:"500", reviews:"No", markup:"₹0" },
  { name:"Starter", price:"₹799", description:"For growing businesses", featured:false, contacts:"Unlimited", team:"Unlimited", numbers:"2", broadcast:"5,000", reviews:"No", markup:"₹0" },
  { name:"Growth", price:"₹1,499", description:"For businesses ready to scale", featured:true, contacts:"Unlimited", team:"Unlimited", numbers:"5", broadcast:"50,000", reviews:"Yes", markup:"₹0" },
  { name:"Scale", price:"₹3,999", description:"For high-volume businesses & agencies", featured:false, contacts:"Unlimited", team:"Unlimited", numbers:"10", broadcast:"250,000", reviews:"Yes", markup:"₹0" },
];

const rows = [
  ["Contacts", "contacts", Users],
  ["Team members", "team", Users],
  ["WhatsApp numbers", "numbers", MessageCircle],
  ["Broadcast recipients / month", "broadcast", Send],
  ["Google Review autoresponder", "reviews", Sparkles],
  ["Meta mark-up", "markup", WalletCards],
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="pointer-events-none fixed -top-48 -left-48 size-[560px] rounded-full opacity-30 blur-[130px] gradient-brand" />
      <header className="relative z-20 sticky top-0 border-b border-border/70 bg-background/85 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link href="/"><img src={BRAND.logo} alt={BRAND.name} className="h-14 w-auto" /></Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/#features" className="hover:text-foreground">Features</Link>
            <Link href="/pricing" className="text-foreground font-semibold">Pricing</Link>
            <Link href="/#customers" className="hover:text-foreground">Customers</Link>
            <Link href="/#docs" className="hover:text-foreground">Docs</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-foreground">Sign in</Link>
            <Link href="/login" className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)]">Get started free</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gradient-brand">Simple. Transparent. Built to grow.</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">Pricing that stays simple</h1>
          <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">Start free, scale when you need to. Unlimited contacts across every plan, with WhatsApp messaging charged separately by Meta.</p>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-14 overflow-x-auto">
          <div className="min-w-[980px] rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
            <div className="grid grid-cols-[250px_repeat(4,minmax(180px,1fr))]">
              <div className="p-5 border-b border-border bg-muted/30"><div className="text-sm font-semibold">Choose your plan</div><div className="text-xs text-muted-foreground mt-1">All prices exclude applicable taxes.</div></div>
              {plans.map(plan => (
                <div key={plan.name} className={`relative p-5 border-b border-l border-border text-center ${plan.featured ? "bg-brand-purple/5" : ""}`}>
                  {plan.featured && <div className="absolute inset-x-0 top-0 h-7 gradient-brand text-white text-[11px] font-bold flex items-center justify-center gap-1.5"><Sparkles className="size-3"/> Most popular</div>}
                  <div className={plan.featured ? "pt-5" : ""}>
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1 min-h-8">{plan.description}</p>
                    <div className="mt-4 flex items-end justify-center gap-1"><span className="text-4xl font-bold tracking-tight">{plan.price}</span><span className="text-xs text-muted-foreground mb-1.5">/ month</span></div>
                    <Link href="/login" className={`mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${plan.featured ? "gradient-brand text-white shadow-[var(--shadow-glow)]" : "border border-border bg-background hover:bg-muted"}`}>Get started<ArrowRight className="size-3.5"/></Link>
                  </div>
                </div>
              ))}
              {rows.map(([label, key, Icon]) => (
                <div key={key} className="contents">
                  <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5"><Icon className="size-4 text-muted-foreground"/><span className="text-sm font-medium">{label}</span></div>
                  {plans.map(plan => <div key={`${key}-${plan.name}`} className={`px-5 py-4 border-b border-l border-border text-center text-sm ${plan.featured ? "bg-brand-purple/5" : ""}`}>{key === "reviews" && plan[key] === "Yes" ? <span className="inline-flex items-center gap-1.5 font-semibold text-brand-green"><Check className="size-4"/> Yes</span> : <span className="font-medium">{plan[key]}</span>}</div>)}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-14">
          <div className="rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-7 md:p-9 bg-gradient-to-r from-brand-purple/5 via-brand-pink/5 to-brand-blue/5 border-b border-border">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-brand">Meta messaging charges</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">Meta charges are separate from your Dispezo plan</h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">Meta determines WhatsApp messaging charges based on its applicable pricing rules. Dispezo passes these charges through without adding a platform mark-up.</p>
                </div>
                <div className="shrink-0 rounded-2xl border border-brand-purple/20 bg-white/70 px-6 py-4 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Dispezo Meta mark-up</div>
                  <div className="mt-1 text-3xl font-bold text-gradient-brand">₹0</div>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
              {["Marketing", "Utility", "Authentication", "Service"].map(category => (
                <div key={category} className="p-6 text-center">
                  <div className="text-sm font-semibold">{category}</div>
                  <div className="mt-2 text-sm text-muted-foreground">Charged at applicable Meta rate</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
          <div className="rounded-3xl border border-brand-purple/20 bg-brand-purple/5 p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand-purple"/><h2 className="text-lg font-bold">Transparent WhatsApp pricing</h2></div><p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">Your subscription pays for Dispezo. WhatsApp messaging charges are separate and Dispezo adds <strong className="text-foreground">₹0 mark-up</strong>.</p></div>
            <Link href="/login" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl gradient-brand text-white px-5 py-3 text-sm font-semibold shadow-[var(--shadow-glow)]">Get started free<ArrowRight className="size-4"/></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border"><div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground"><div className="flex items-center gap-3"><img src={BRAND.logo} alt={BRAND.name} className="h-9 w-auto opacity-80"/><span>© 2026 {BRAND.name}, Inc.</span></div><div className="flex gap-6"><Link href="/pricing" className="hover:text-foreground">Pricing</Link><Link href="/privacy" className="hover:text-foreground">Privacy</Link><Link href="/terms" className="hover:text-foreground">Terms</Link></div></div></footer>
    </div>
  );
}
