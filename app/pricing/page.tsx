import Link from "next/link";
import { ArrowRight, Check, MessageCircle, ShieldCheck, Users, Send, WalletCards, Sparkles } from "lucide-react";
import { BRAND } from "@/config/branding";

const plans = [
  { name:"Free", price:"₹0", description:"Get started with WhatsApp Business", cta:"Get started free", featured:false, contacts:"Unlimited", team:"2", numbers:"1", broadcast:"500", reviews:"No", markup:"₹0" },
  { name:"Starter", price:"₹799", description:"For growing businesses", cta:"Get started", featured:false, contacts:"Unlimited", team:"Unlimited", numbers:"2", broadcast:"5,000", reviews:"No", markup:"₹0" },
  { name:"Growth", price:"₹1,499", description:"For businesses ready to scale", cta:"Get started", featured:true, contacts:"Unlimited", team:"Unlimited", numbers:"5", broadcast:"50,000", reviews:"Yes", markup:"₹0" },
  { name:"Scale", price:"₹3,999", description:"For high-volume businesses & agencies", cta:"Get started", featured:false, contacts:"Unlimited", team:"Unlimited", numbers:"10", broadcast:"250,000", reviews:"Yes", markup:"₹0" },
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
      <div className="pointer-events-none fixed top-1/3 -right-48 size-[480px] rounded-full opacity-20 blur-[130px] bg-brand-green" />

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
            <Link href="/login" className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-90">Get started free</Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-20 pb-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gradient-brand">Simple. Transparent. Built to grow.</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">Pricing that stays simple</h1>
          <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            Start free, scale when you need to. Unlimited contacts across every plan,
            with WhatsApp messaging charged at Meta&apos;s rates and no Dispezo mark-up.
          </p>
          <div className="mt-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
            {[
              [Users, "Unlimited contacts", "No artificial contact limits"],
              [Users, "Unlimited team members", "From Starter onwards"],
              [Send, "Scale your broadcasts", "Capacity grows with your plan"],
              [ShieldCheck, "Meta rates, no mark-up", "₹0 Dispezo mark-up"],
            ].map(([Icon, title, text]) => (
              <div key={title as string} className="glass rounded-2xl px-4 py-4 text-left shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg gradient-brand grid place-items-center text-white shrink-0">
                    {Icon && <Icon className="size-4" />}
                  </div>
                  <div><div className="text-sm font-semibold">{title as string}</div><div className="text-[11px] text-muted-foreground mt-0.5">{text as string}</div></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 overflow-x-auto">
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
                    <Link href="/login" className={`mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${plan.featured ? "gradient-brand text-white shadow-[var(--shadow-glow)]" : "border border-border bg-background hover:bg-muted"}`}>{plan.cta}<ArrowRight className="size-3.5"/></Link>
                  </div>
                </div>
              ))}

              {rows.map(([label, key, Icon]) => (
                <div key={key} className="contents">
                  <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5"><Icon className="size-4 text-muted-foreground"/><span className="text-sm font-medium">{label}</span></div>
                  {plans.map(plan => (
                    <div key={`${key}-${plan.name}`} className={`px-5 py-4 border-b border-l border-border text-center text-sm ${plan.featured ? "bg-brand-purple/5" : ""}`}>
                      {key === "reviews" && plan[key] === "Yes" ? <span className="inline-flex items-center gap-1.5 font-semibold text-brand-green"><Check className="size-4"/> Yes</span> : <span className="font-medium">{plan[key]}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 md:px-10 pb-20">
          <div className="rounded-3xl border border-brand-purple/20 bg-brand-purple/5 p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2"><MessageCircle className="size-5 text-brand-purple"/><h2 className="text-lg font-bold">WhatsApp messaging charges</h2></div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                Meta messaging charges are separate from your Dispezo subscription. You pay the applicable Meta rate for WhatsApp messages.
                Dispezo adds <strong className="text-foreground">₹0 mark-up</strong>.
              </p>
            </div>
            <Link href="/login" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl gradient-brand text-white px-5 py-3 text-sm font-semibold shadow-[var(--shadow-glow)]">Get started free<ArrowRight className="size-4"/></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3"><img src={BRAND.logo} alt={BRAND.name} className="h-9 w-auto opacity-80"/><span>© 2026 {BRAND.name}, Inc.</span></div>
          <div className="flex gap-6"><Link href="/pricing" className="hover:text-foreground">Pricing</Link><Link href="/privacy" className="hover:text-foreground">Privacy</Link><Link href="/terms" className="hover:text-foreground">Terms</Link></div>
        </div>
      </footer>
    </div>
  );
}
