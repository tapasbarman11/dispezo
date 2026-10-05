"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, BarChart3, CalendarDays, CheckCircle2, Copy, CreditCard, Link2Off, Send, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import WhatsAppConnectButton from "@/components/whatsapp/WhatsAppConnectButton";

const COUNTRY_CODES = ["+91", "+1", "+44", "+971", "+65", "+61", "+49", "+33", "+81", "+55"];
type Activity = { id: string; recipient: string; template: string; status: string; time: string };

function WhatsAppMark({ className = "size-10" }: { className?: string }) {
  return <svg viewBox="0 0 32 32" fill="currentColor" className={className}><path d="M19.11 17.32c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.47s1.07 2.85 1.22 3.05c.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z"/><path d="M16 3C8.82 3 3 8.82 3 16c0 2.56.75 5.05 2.15 7.18L3 29l5.98-2.1A12.94 12.94 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-2.07 0-4.1-.56-5.86-1.63l-.42-.25-3.55 1.25 1.2-3.46-.28-.44A10.46 10.46 0 015.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5z"/></svg>;
}
function Skeleton({ className = "" }: { className?: string }) { return <span className={`inline-block animate-pulse rounded bg-slate-200 ${className}`} />; }
function StatusBadge({ status }: { status: string }) {
  const s = String(status || "").toLowerCase();
  if (s.includes("fail")) return <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600"><XCircle className="size-3"/>Failed</span>;
  if (s.includes("pending") || s.includes("sent")) return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"><Clock className="size-3"/>{s.includes("sent") ? "Sent" : "Pending"}</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"><CheckCircle2 className="size-3"/>Delivered</span>;
}

export default function WhatsAppPage() {
  const [connection, setConnection] = useState<any>(null);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [billing, setBilling] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [recipient, setRecipient] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState("en_US");
  const [variables, setVariables] = useState<Record<string,string>>({});
  const [sending, setSending] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const currentTemplate = useMemo(() => templates.find(t => t.name === templateName), [templates, templateName]);
  const templateVars = useMemo(() => currentTemplate?.body ? [...new Set(Array.from(currentTemplate.body.matchAll(/\{\{(\d+)\}\}/g)).map((m:any) => m[1]))].sort((a:any,b:any)=>Number(a)-Number(b)) : [], [currentTemplate]);

  const load = useCallback(async () => {
    try {
      const [statusRes, billingRes, activityRes, templateRes] = await Promise.all([
        fetch("/api/whatsapp/status", { cache: "no-store" }),
        fetch("/api/whatsapp/billing", { cache: "no-store" }),
        fetch("/api/whatsapp/activity", { cache: "no-store" }),
        fetch("/api/templates", { cache: "no-store" }),
      ]);
      const [status, bill, act, temp] = await Promise.all([statusRes.json(), billingRes.json(), activityRes.json(), templateRes.json()]);
      setConnection(status.success ? status.connection : null);
      setStatusLoaded(true);
      setBilling(bill);
      setBillingLoading(false);
      setActivity(act.success ? act.messages || [] : []);
      setTemplates(temp.success ? (temp.templates || []).filter((t:any)=>(t.status || "").toUpperCase() === "APPROVED") : []);
    } catch (e) {
      console.error(e);
      setStatusLoaded(true); setBillingLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const disconnect = async () => {
    if (!confirm("Disconnect this WhatsApp Cloud API connection?")) return;
    try {
      setDisconnecting(true);
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setConnection(null);
      await load();
    } catch (e:any) { alert(e.message || "Unable to disconnect WhatsApp."); } finally { setDisconnecting(false); }
  };

  const sendTest = async () => {
    if (!recipient.trim() || !templateName || sending) return;
    try {
      setSending(true);
      const components = templateVars.length ? [{ type: "body", parameters: templateVars.map((v:string)=>({ type:"text", text:variables[v] || `{{${v}}}` })) }] : undefined;
      const res = await fetch("/api/whatsapp/send", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ phoneNumber:`${countryCode}${recipient}`, templateName, language, components }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Unable to send message.");
      await load();
      alert("Message submitted to WhatsApp. Check Recent Activity for delivery status.");
    } catch (e:any) { alert(e.message || "Unable to send message."); } finally { setSending(false); }
  };

  const copy = (value?: string) => { if (value) navigator.clipboard?.writeText(value); };
  const limitText = (limit?: string) => ({ TIER_250:"250", TIER_1K:"1,000", TIER_2K:"2,000", TIER_10K:"10,000", TIER_25K:"25,000", TIER_50K:"50,000", TIER_100K:"100,000", TIER_UNLIMITED:"Unlimited" } as any)[limit || ""] || "-";
  const balance = Number(billing?.billing?.balance ?? billing?.billing?.creditAvailable ?? 0);
  const marketingEstimate = billing?.billing?.estimatedMarketingMessages;
  const utilityEstimate = billing?.billing?.estimatedUtilityMessages;
  const quality = String(connection?.qualityRating || "").toUpperCase();
  const available = !!connection?.connected;

  return <div className="space-y-4">
    <PageHeader eyebrow="Integration" title="WhatsApp Cloud API" description="Manage your WhatsApp Business connection and send test messages." />

    <motion.section initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="glass rounded-2xl px-5 py-4 shadow-[var(--shadow-card)]">
      <div className="grid grid-cols-[1.35fr_1fr_0.85fr_1fr] divide-x divide-slate-200 items-center">
        <div className="pr-5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Connection Status</div>
          <div className="flex items-center gap-3"><div className="size-11 rounded-full bg-[#25D366] grid place-items-center text-white"><WhatsAppMark className="size-7"/></div><div><div className="flex items-center gap-2 text-sm font-bold">{!statusLoaded ? <Skeleton className="h-4 w-20"/> : <><span className={`size-2 rounded-full ${available ? "bg-emerald-500" : "bg-slate-300"}`}/><span className={available ? "text-emerald-600" : "text-slate-500"}>{available ? "Connected" : "Not connected"}</span></>}</div><div className="text-[11px] text-slate-400 mt-0.5">WhatsApp Business Cloud API</div></div></div>
          <div className="mt-3 flex gap-2">{available ? <><button onClick={disconnect} disabled={disconnecting} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"><Link2Off className="size-3.5"/>{disconnecting ? "Disconnecting" : "Disconnect"}</button><WhatsAppConnectButton compact label="Reconnect" onConnected={load}/></> : <WhatsAppConnectButton compact label="Connect WhatsApp" onConnected={load}/>}</div>
        </div>
        <div className="px-5"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">WhatsApp Number</div><div className="flex items-center gap-2 text-sm font-semibold">{!statusLoaded ? <Skeleton className="h-4 w-32"/> : connection?.phoneNumber || "-"}{connection?.phoneNumber && <button onClick={()=>copy(connection.phoneNumber)}><Copy className="size-3.5 text-slate-400"/></button>}</div><div className="text-[11px] text-slate-400 mt-2">Phone Number ID</div><div className="text-xs text-slate-600 truncate">{connection?.phoneNumberId || "-"}</div></div>
        <div className="px-5"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Business Account</div><div className="text-sm font-semibold leading-5">{connection?.businessName || "-"}</div><div className="text-[11px] text-slate-400 mt-2">Business Account ID</div><div className="text-xs text-slate-600 truncate">{connection?.wabaId || "-"}</div></div>
        <div className="pl-5"><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Quality Rating</div><div className="flex items-center gap-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${quality === "GREEN" ? "bg-emerald-100 text-emerald-700" : quality === "YELLOW" ? "bg-amber-100 text-amber-700" : quality === "RED" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"}`}>{quality || "-"}</span></div><div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3">Daily Messaging Limit</div><div className="text-sm font-bold mt-1">{limitText(connection?.messagingLimit)}</div></div>
      </div>
    </motion.section>

    <div className="grid grid-cols-[1.08fr_0.92fr] gap-4">
      <section className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2.5"><div className="size-8 rounded-lg bg-blue-50 grid place-items-center"><CreditCard className="size-3.5 text-blue-600"/></div><div><h2 className="text-sm font-semibold">Meta WhatsApp Billing</h2><p className="text-[10px] text-slate-400">Separate from your Dispezo subscription</p></div></div><span className="text-[9px] text-slate-400">{billing?.lastSyncedAt ? `Synced ${new Date(billing.lastSyncedAt).toLocaleString("en-IN")}` : ""}</span></div>
        {billingLoading ? <Skeleton className="h-16 w-full"/> : billing?.available ? <div className="grid grid-cols-4 gap-2"><div className="rounded-lg bg-slate-50 px-3 py-2.5"><div className="text-[10px] text-slate-500">Balance</div><div className="mt-0.5 text-base font-bold">{new Intl.NumberFormat("en-IN",{style:"currency",currency:billing.billing.currency||"INR",maximumFractionDigits:2}).format(balance)}</div></div><div className="rounded-lg bg-slate-50 px-3 py-2.5"><div className="text-[10px] text-slate-500">Credit Line</div><div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="size-3.5"/>Active</div></div><div className="rounded-lg border border-slate-100 px-3 py-2.5"><div className="text-[10px] text-slate-500">Marketing</div><div className="text-base font-bold mt-0.5">~ {marketingEstimate ?? "-"}</div></div><div className="rounded-lg border border-slate-100 px-3 py-2.5"><div className="text-[10px] text-slate-500">Utility</div><div className="text-base font-bold mt-0.5">~ {utilityEstimate ?? "-"}</div></div></div> : <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 flex gap-2.5"><AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5"/><div><div className="text-xs font-semibold text-amber-800">Meta billing balance unavailable</div><div className="text-[10px] text-amber-700 mt-0.5">{billing?.message || "The current Meta token does not expose billing/credit-line data."}</div></div></div>}
      </section>

      <section className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2.5"><div className="size-8 rounded-lg bg-violet-50 grid place-items-center"><BarChart3 className="size-3.5 text-violet-600"/></div><div><h2 className="text-sm font-semibold">Message Usage <span className="font-normal text-slate-400">(This Month)</span></h2></div></div><div className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium"><CalendarDays className="size-3"/>Current month</div></div><div className="flex items-center gap-4"><div className="shrink-0"><div className="text-[10px] text-slate-500">Total Messages Sent</div><div className="text-2xl font-bold mt-0.5">{billing?.planUsage?.monthlyMessages?.toLocaleString?.("en-IN") ?? "-"} <span className="text-xs font-normal text-slate-400">/ {billing?.planUsage?.limit?.toLocaleString?.("en-IN") ?? "-"}</span></div></div><div className="flex-1 min-w-0"><div className="h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500" style={{width:`${Math.min(100, Number(billing?.planUsage?.percentage || 0))}%`}}/></div><div className="mt-1.5 text-[10px] text-emerald-600 font-semibold">{billing?.planUsage?.remaining?.toLocaleString?.("en-IN") ?? "-"} remaining</div></div></div></section>
    </div>

    <div className="grid grid-cols-[1.08fr_0.92fr] gap-4 items-stretch">
      <section className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]"><div className="flex items-center gap-3 mb-4"><div className="size-9 rounded-lg bg-violet-50 grid place-items-center"><Send className="size-4 text-violet-600"/></div><div><h2 className="text-sm font-semibold">Send Test Message</h2><p className="text-[11px] text-slate-400">Send an approved template to verify delivery.</p></div></div><div className="mb-3"><label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Recipient Number</label><div className="flex gap-2"><select value={countryCode} onChange={e=>setCountryCode(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs">{COUNTRY_CODES.map(c=><option key={c}>{c}</option>)}</select><input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Enter 10 digit WhatsApp number" className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-brand-blue"/></div><div className="text-[10px] text-slate-400 mt-1">Example: 9876543210</div></div><div className="grid grid-cols-2 gap-3 mb-3"><div><label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Template</label><select value={templateName} onChange={e=>{setTemplateName(e.target.value);setVariables({});}} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="">Select a template</option>{templates.map(t=><option key={t.id} value={t.name}>{t.name}</option>)}</select></div><div><label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Language</label><select value={language} onChange={e=>setLanguage(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="en_US">English (en_US)</option></select></div></div>{templateVars.length>0 && <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">{templateVars.map((v:string)=><div key={v} className="flex items-center gap-2"><span className="w-9 text-[10px] font-mono">{`{{${v}}}`}</span><input value={variables[v]||""} onChange={e=>setVariables(p=>({...p,[v]:e.target.value}))} placeholder="Variable value" className="h-8 flex-1 rounded border border-amber-200 px-2 text-xs"/></div>)}</div>}<div className="mb-3 rounded-xl border border-emerald-200 bg-[#E7FFEE] px-3 py-3 min-h-[58px] flex items-start justify-between"><div className="text-xs text-slate-600 whitespace-pre-wrap">{templateName ? (currentTemplate?.body || "No preview available.").replace(/\{\{(\d+)\}\}/g,(_:string,n:string)=>variables[n] || `{{${n}}}`) : "Select a template to see preview here..."}</div><div className="ml-2 size-8 rounded-full bg-[#25D366] grid place-items-center text-white shrink-0"><WhatsAppMark className="size-5"/></div></div><button disabled={!available || !recipient.trim() || !templateName || sending} onClick={sendTest} className="h-11 w-full rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Send className="size-4"/>{sending ? "Sending..." : "Send Test Message"}</button></section>

      <section className="glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden"><div className="flex items-center justify-between px-5 py-4 border-b border-slate-100"><div className="flex items-center gap-3"><div className="size-9 rounded-lg bg-blue-50 grid place-items-center"><Clock className="size-4 text-blue-600"/></div><div><h2 className="text-sm font-semibold">Recent Activity</h2><p className="text-[11px] text-slate-400">Latest message delivery attempts</p></div></div><span className="text-xs font-semibold text-brand-purple">View All →</span></div><div className="overflow-hidden"><table className="w-full"><thead><tr className="border-b border-slate-100 bg-slate-50/70"><th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">Time</th><th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">Recipient</th><th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">Template</th><th className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-slate-400">Status</th></tr></thead><tbody className="divide-y divide-slate-50">{activity.length ? activity.slice(0,5).map(row=><tr key={row.id} className="hover:bg-slate-50/70"><td className="px-4 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{new Date(row.time).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</td><td className="px-4 py-2.5 text-[11px] font-medium">{row.recipient}</td><td className="px-4 py-2.5 text-[10px] text-violet-600">{row.template}</td><td className="px-4 py-2.5"><StatusBadge status={row.status}/></td></tr>) : <tr><td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-400">No activity yet</td></tr>}</tbody></table></div></section>
    </div>
  </div>;
}
