import Link from "next/link";
import { ArrowRight, Check, MessageCircle, ShieldCheck, Users, Send, WalletCards, Sparkles, RefreshCw } from "lucide-react";
import { BRAND } from "@/config/branding";
import { getMetaPricingSnapshot } from "@/lib/meta/pricing";

export const dynamic = "force-dynamic";

const plans = [
  { name:"Free", price:"₹0", description:"Get started with WhatsApp Business", featured:false, contacts:"Unlimited", team:"2", numbers:"1", broadcast:"500", reviews:"No", markup:"₹0" },
  { name:"Starter", price:"₹799", description:"For growing businesses", featured:false, contacts:"Unlimited", team:"Unlimited", numbers:"2", broadcast:"5,000", reviews:"No", markup:"₹0" },
  { name:"Growth", price:"₹1,499", description:"For businesses ready to scale", featured:true, contacts:"Unlimited", team:"Unlimited", numbers:"5", broadcast:"50,000", reviews:"Yes", markup:"₹0" },
  { name:"Scale", price:"₹3,999", description:"For high-volume businesses & agencies", featured:false, contacts:"Unlimited", team:"Unlimited", numbers:"10", broadcast:"250,000", reviews:"Yes", markup:"₹0" },
];

const rows = [
  ["Contacts","contacts",Users],["Team members","team",Users],["WhatsApp numbers","numbers",MessageCircle],
  ["Broadcast recipients / month","broadcast",Send],["Google Review autoresponder","reviews",Sparkles],["Meta mark-up","markup",WalletCards],
] as const;

const categoryLabel:Record<string,string>={MARKETING:"Marketing",UTILITY:"Utility",AUTHENTICATION:"Authentication",AUTHENTICATION_INTERNATIONAL:"Authentication-International",SERVICE:"Service"};
const money=(v:any)=>v==null?"—":`₹${Number(v).toFixed(4)}`;

export default async function PricingPage(){
  let meta:any={rates:[],tiers:[],sync:null};
  try{meta=await getMetaPricingSnapshot("INR","IN");}catch{}
  const rateMap=Object.fromEntries(meta.rates.map((r:any)=>[r.category,r.rate]));
  const groups=["UTILITY","AUTHENTICATION","AUTHENTICATION_INTERNATIONAL"].map(category=>({category,tiers:meta.tiers.filter((t:any)=>t.category===category)})).filter(g=>g.tiers.length);

  return <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
    <div className="pointer-events-none fixed -top-48 -left-48 size-[560px] rounded-full opacity-30 blur-[130px] gradient-brand"/>
    <header className="relative z-20 sticky top-0 border-b border-border/70 bg-background/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <Link href="/"><img src={BRAND.logo} alt={BRAND.name} className="h-14 w-auto"/></Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground"><Link href="/#features">Features</Link><Link href="/pricing" className="text-foreground font-semibold">Pricing</Link><Link href="/#customers">Customers</Link><Link href="/#docs">Docs</Link></nav>
        <Link href="/login" className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)]">Get started free</Link>
      </div>
    </header>
    <main className="relative z-10">
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-10 text-center">
        <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-gradient-brand">Simple. Transparent. Built to grow.</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold tracking-tight">Pricing that stays simple</h1>
        <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">Start free, scale when you need to. Unlimited contacts across every plan, with WhatsApp messaging charged at Meta&apos;s rates and no Dispezo mark-up.</p>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-14 overflow-x-auto">
        <div className="min-w-[980px] rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="grid grid-cols-[250px_repeat(4,minmax(180px,1fr))]">
            <div className="p-5 border-b border-border bg-muted/30"><div className="text-sm font-semibold">Choose your plan</div><div className="text-xs text-muted-foreground mt-1">All prices exclude applicable taxes.</div></div>
            {plans.map(p=><div key={p.name} className={`relative p-5 border-b border-l border-border text-center ${p.featured?"bg-brand-purple/5":""}`}>{p.featured&&<div className="absolute inset-x-0 top-0 h-7 gradient-brand text-white text-[11px] font-bold flex items-center justify-center gap-1"><Sparkles className="size-3"/> Most popular</div>}<div className={p.featured?"pt-5":""}><h2 className="text-xl font-bold">{p.name}</h2><p className="text-xs text-muted-foreground mt-1 min-h-8">{p.description}</p><div className="mt-4 flex items-end justify-center gap-1"><span className="text-4xl font-bold">{p.price}</span><span className="text-xs text-muted-foreground mb-1.5">/ month</span></div><Link href="/login" className={`mt-5 w-full inline-flex justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${p.featured?"gradient-brand text-white":"border border-border bg-background"}`}>Get started<ArrowRight className="size-3.5"/></Link></div></div>)}
            {rows.map(([label,key,Icon])=><div key={key} className="contents"><div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5"><Icon className="size-4 text-muted-foreground"/><span className="text-sm font-medium">{label}</span></div>{plans.map(p=><div key={key+p.name} className={`px-5 py-4 border-b border-l border-border text-center text-sm ${p.featured?"bg-brand-purple/5":""}`}>{key==="reviews"&&p[key]==="Yes"?<span className="inline-flex items-center gap-1.5 font-semibold text-brand-green"><Check className="size-4"/>Yes</span>:p[key]}</div>)}</div>)}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-10">
        <div className="rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
          <div className="p-7 md:p-9 bg-gradient-to-r from-brand-purple/5 via-brand-pink/5 to-brand-blue/5 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div><p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-brand">Meta messaging charges</p><h2 className="mt-2 text-2xl md:text-3xl font-bold">Actual Meta rates. ₹0 Dispezo mark-up.</h2><p className="mt-2 text-sm text-muted-foreground max-w-3xl">Dispezo stores the latest successfully imported Meta INR rate card and volume tiers. If a daily download fails, the last successful rates remain active.</p></div>
              <div className="shrink-0 rounded-2xl border border-brand-purple/20 bg-white/70 px-6 py-4 text-center"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Dispezo mark-up</div><div className="mt-1 text-3xl font-bold text-gradient-brand">₹0</div></div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            {meta.rates.length ? <><div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">{["MARKETING","UTILITY","AUTHENTICATION","AUTHENTICATION_INTERNATIONAL","SERVICE"].map(c=><div key={c} className="rounded-2xl border border-border bg-muted/20 p-4"><div className="text-xs font-semibold">{categoryLabel[c]}</div><div className="mt-2 text-2xl font-bold">{money(rateMap[c])}</div><div className="mt-1 text-[11px] text-muted-foreground">{c==="MARKETING"?"Base rate":c==="SERVICE"?"Current Meta rules apply":"Base rate + volume tiers"}</div></div>)}</div>
              {groups.map(g=><div key={g.category} className="mt-7"><h3 className="text-sm font-bold">{categoryLabel[g.category]} volume tiers</h3><p className="text-xs text-muted-foreground mt-1 mb-3">Imported from the latest Meta volume-tier data.</p><div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[620px] text-sm"><thead className="bg-muted/30"><tr><th className="px-4 py-3 text-left">Monthly messages</th><th className="px-4 py-3 text-right">Meta rate</th><th className="px-4 py-3 text-right">Discount</th></tr></thead><tbody className="divide-y divide-border">{g.tiers.map((t:any)=><tr key={g.category+t.tierFrom}><td className="px-4 py-3">{Number(t.tierFrom).toLocaleString("en-IN")} – {t.tierTo==null?"∞":Number(t.tierTo).toLocaleString("en-IN")}</td><td className="px-4 py-3 text-right font-semibold">{money(t.rate)}</td><td className="px-4 py-3 text-right">{t.discountPercent==null?"—":`${Number(t.discountPercent).toFixed(0)}%`}</td></tr>)}</tbody></table></div></div>)}
              <div className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground"><RefreshCw className="size-3.5"/><span>Last successful sync: {meta.sync?.lastSuccessfulSyncAt?new Date(meta.sync.lastSuccessfulSyncAt).toLocaleString("en-IN"):"Not synced yet"}</span></div>
            </>:<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Meta rate cards have not been synced yet. Configure Meta&apos;s current official CSV URLs; Dispezo will keep the last successful rates if a refresh fails.</div>}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 md:px-10 pb-20"><div className="rounded-3xl border border-brand-purple/20 bg-brand-purple/5 p-7 md:p-9 flex flex-col md:flex-row md:items-center md:justify-between gap-6"><div><div className="flex items-center gap-2"><ShieldCheck className="size-5 text-brand-purple"/><h2 className="text-lg font-bold">Transparent WhatsApp pricing</h2></div><p className="mt-2 text-sm text-muted-foreground">Your subscription pays for Dispezo. WhatsApp messaging charges are separate and Dispezo adds <strong className="text-foreground">₹0 mark-up</strong>.</p></div><Link href="/login" className="shrink-0 inline-flex items-center gap-2 rounded-xl gradient-brand text-white px-5 py-3 text-sm font-semibold">Get started free<ArrowRight className="size-4"/></Link></div></section>
    </main>
    <footer className="border-t border-border"><div className="max-w-7xl mx-auto px-6 md:px-10 py-8 text-sm text-muted-foreground">© 2026 {BRAND.name}, Inc.</div></footer>
  </div>;
}
