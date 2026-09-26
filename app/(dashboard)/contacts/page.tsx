"use client";

import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Search, Upload, Plus, Filter, Pencil, Trash2, X, Users, ChevronLeft, ChevronRight } from "lucide-react";

type Contact = { id:string; name:string|null; phone:string; email:string|null; tag:string|null; source:string|null; customFields:Record<string,string>; createdAt:string; updatedAt:string|null };
type Tag = {tag:string;count:number};

const emptyForm = {name:"",phone:"",email:"",tag:"",customFields:""};

function initials(name:string|null){ return (name||"?").split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase(); }
function tagClass(tag:string|null){ if(!tag) return "bg-muted text-muted-foreground"; const palette=["bg-emerald-50 text-emerald-700","bg-violet-50 text-violet-700","bg-blue-50 text-blue-700","bg-amber-50 text-amber-700","bg-pink-50 text-pink-700"]; let n=0; for(const c of tag) n+=c.charCodeAt(0); return palette[n%palette.length]; }

export default function ContactsPage(){
  const [contacts,setContacts]=useState<Contact[]>([]), [tags,setTags]=useState<Tag[]>([]), [search,setSearch]=useState(""), [tag,setTag]=useState(""), [page,setPage]=useState(1), [totalPages,setTotalPages]=useState(1), [total,setTotal]=useState(0), [loading,setLoading]=useState(true), [selected,setSelected]=useState<string[]>([]), [modal,setModal]=useState<"add"|"edit"|null>(null), [editing,setEditing]=useState<Contact|null>(null), [form,setForm]=useState(emptyForm), [saving,setSaving]=useState(false), [uploadOpen,setUploadOpen]=useState(false), [uploadTag,setUploadTag]=useState(""), [uploadFile,setUploadFile]=useState<File|null>(null), [uploading,setUploading]=useState(false);
  const fileRef=useRef<HTMLInputElement>(null);

  async function load(overrides?: {page?: number; search?: string; tag?: string}){
    const requestedPage=overrides?.page ?? page;
    const requestedSearch=overrides?.search ?? search;
    const requestedTag=overrides?.tag ?? tag;
    setLoading(true);
    try{
      const r=await fetch(`/api/contacts?page=${requestedPage}&pageSize=25&search=${encodeURIComponent(requestedSearch)}&tag=${encodeURIComponent(requestedTag)}`,{cache:"no-store"});
      const j=await r.json();
      if(j.success){setContacts(j.contacts);setTotal(j.total);setTotalPages(j.totalPages)}
    } finally{setLoading(false)}
  }
  async function loadTags(){ const r=await fetch("/api/contacts/tags",{cache:"no-store"}); const j=await r.json(); if(j.success)setTags(j.audiences||[]); }
  useEffect(()=>{load()},[page,tag]);
  useEffect(()=>{const t=setTimeout(()=>{setPage(1);load({page:1})},250); return()=>clearTimeout(t)},[search]);
  useEffect(()=>{loadTags()},[]);

  function openAdd(){setEditing(null);setForm(emptyForm);setModal("add")}
  function openEdit(c:Contact){setEditing(c);setForm({name:c.name||"",phone:c.phone,email:c.email||"",tag:c.tag||"",customFields:Object.entries(c.customFields||{}).map(([k,v])=>`${k}=${v}`).join("\n")});setModal("edit")}
  function parseCustom(s:string){const out:Record<string,string>={}; s.split(/\n/).forEach(line=>{const i=line.indexOf("=");if(i>0)out[line.slice(0,i).trim()]=line.slice(i+1).trim()});return out}
  async function save(){
    if(!form.phone.trim())return alert("Phone number is required.");
    setSaving(true);
    try{
      const payload={name:form.name,phone:form.phone,email:form.email,tag:form.tag||null,customFields:parseCustom(form.customFields)};
      const r=await fetch(modal==="edit"?`/api/contacts/${editing!.id}`:"/api/contacts",{method:modal==="edit"?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const j=await r.json();
      if(!j.success)throw new Error(j.message);
      setModal(null);
      setSelected([]);
      // After creating a contact, return to the unfiltered first page so the
      // complete contact list is visible immediately, without requiring refresh.
      if(modal==="add"){
        setSearch("");
        setTag("");
        setPage(1);
        await Promise.all([load({page:1,search:"",tag:""}),loadTags()]);
      } else {
        await Promise.all([load(),loadTags()]);
      }
    }catch(e:any){alert(e.message)}finally{setSaving(false)}
  }
  async function remove(ids:string[]){if(!ids.length||!confirm(`Delete ${ids.length} contact${ids.length>1?"s":""}?`))return;const r=await fetch("/api/contacts",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({ids})});const j=await r.json();if(!j.success)return alert(j.message);setSelected([]);await Promise.all([load(),loadTags()])}
  async function upload(){if(!uploadFile||!uploadTag.trim())return alert("Choose a CSV and audience/tag.");setUploading(true);try{const fd=new FormData();fd.append("file",uploadFile);fd.append("tag",uploadTag.trim());const r=await fetch("/api/contacts/upload",{method:"POST",body:fd});const j=await r.json();if(!j.success)throw new Error(j.message);alert(`Imported ${j.inserted} of ${j.parsed} contacts.`);setUploadOpen(false);setUploadFile(null);setUploadTag("");if(fileRef.current)fileRef.current.value="";setSearch("");setTag("");setPage(1);await Promise.all([load({page:1,search:"",tag:""}),loadTags()])}catch(e:any){alert(e.message)}finally{setUploading(false)}}

  const allSelected=contacts.length>0&&contacts.every(c=>selected.includes(c.id));
  return <div>
    <PageHeader eyebrow="Directory" title="Contacts" description="Manage your customers, segments and CSV data for WhatsApp broadcasts." actions={<><button onClick={()=>setUploadOpen(true)} className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-medium flex items-center gap-2 hover:bg-muted"><Upload className="size-4"/> Import CSV</button><button onClick={openAdd} className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center gap-2 shadow-[var(--shadow-glow)]"><Plus className="size-4"/> Add Contact</button></>}/>
    <div className="glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
      <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border">
        <div className="flex-1 min-w-[260px] relative"><Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, phone, email, tags..." className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-brand-blue/30"/></div>
        <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto">{[{tag:"",count:total},...tags].map((t,i)=><button key={t.tag||"all"} onClick={()=>{setTag(t.tag);setPage(1)}} className={`px-3 py-1.5 rounded-full whitespace-nowrap ${tag===t.tag?(i===0?"bg-foreground text-background":"bg-violet-100 text-violet-700"):"border border-border text-muted-foreground hover:bg-muted"}`}>{t.tag||"All"} <span className="opacity-60">{t.count}</span></button>)}</div>
        {selected.length>0&&<button onClick={()=>remove(selected)} className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2"><Trash2 className="size-4"/> Delete ({selected.length})</button>}
        <button className="p-2 rounded-xl border border-border hover:bg-muted" title="Filter"><Filter className="size-4"/></button>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-muted/40"><tr>{["","Name","Phone","Email","Segment","Source","Added",""] .map((h,i)=><th key={i} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground ${i===7?"text-right":""}`}>{i===0?<input type="checkbox" checked={allSelected} onChange={e=>setSelected(e.target.checked?contacts.map(c=>c.id):[])}/>:h}</th>)}</tr></thead><tbody className="divide-y divide-border">
        {loading?[1,2,3,4].map(i=><tr key={i}>{Array.from({length:8}).map((_,j)=><td key={j} className="px-5 py-4"><span className="block h-4 w-20 animate-pulse rounded bg-muted"/></td></tr>):contacts.length===0?<tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground"><Users className="mx-auto mb-2 size-7 opacity-40"/>No contacts found.</td></tr>:contacts.map(c=><tr key={c.id} className="hover:bg-muted/30"><td className="px-5 py-4"><input type="checkbox" checked={selected.includes(c.id)} onChange={e=>setSelected(s=>e.target.checked?[...s,c.id]:s.filter(x=>x!==c.id))}/></td><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="size-8 rounded-full gradient-brand grid place-items-center text-white text-[10px] font-semibold">{initials(c.name)}</div><span className="text-sm font-medium whitespace-nowrap">{c.name||"Unnamed"}</span></div></td><td className="px-5 py-4 text-sm font-mono text-muted-foreground">{c.phone}</td><td className="px-5 py-4 text-sm text-muted-foreground">{c.email||"—"}</td><td className="px-5 py-4">{c.tag?<span className={`px-2 py-1 rounded-full text-[10px] font-bold ${tagClass(c.tag)}`}>{c.tag}</span>:"—"}</td><td className="px-5 py-4 text-xs text-muted-foreground">{c.source||"—"}</td><td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString("en-IN")}</td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={()=>openEdit(c)} className="p-2 rounded-lg hover:bg-muted"><Pencil className="size-4"/></button><button onClick={()=>remove([c.id])} className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="size-4"/></button></div></td></tr>)}
      </tbody></table></div>
      <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground"><span>{total} contacts</span><div className="flex items-center gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-2 rounded-lg border border-border disabled:opacity-40"><ChevronLeft className="size-4"/></button><span>Page {page} of {totalPages}</span><button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="p-2 rounded-lg border border-border disabled:opacity-40"><ChevronRight className="size-4"/></button></div></div>
    </div>

    {(modal||uploadOpen)&&<div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm grid place-items-center p-4"><div className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-2xl p-6">
      <div className="flex items-center justify-between mb-5"><h3 className="text-lg font-semibold">{uploadOpen?"Import Contacts":""}{modal==="add"?"Add Contact":""}{modal==="edit"?"Edit Contact":""}</h3><button onClick={()=>{setModal(null);setUploadOpen(false)}} className="p-2 rounded-lg hover:bg-muted"><X className="size-4"/></button></div>
      {uploadOpen?<div className="space-y-4"><p className="text-sm text-muted-foreground">CSV must contain a phone/mobile/WhatsApp column. Other columns are preserved as custom fields for broadcast variable mapping.</p><input ref={fileRef} type="file" accept=".csv,text/csv" onChange={e=>setUploadFile(e.target.files?.[0]||null)} className="w-full rounded-xl border border-border p-3 text-sm"/><input value={uploadTag} onChange={e=>setUploadTag(e.target.value)} placeholder="Audience / Tag (e.g. VIP)" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/><button onClick={upload} disabled={uploading} className="w-full rounded-xl gradient-brand text-white py-3 text-sm font-semibold disabled:opacity-60">{uploading?"Importing...":"Import CSV"}</button></div>:<div className="space-y-4"><div className="grid grid-cols-2 gap-3"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Name" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone *" className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/></div><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/><input value={form.tag} onChange={e=>setForm({...form,tag:e.target.value})} placeholder="Audience / Tag" className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/><textarea value={form.customFields} onChange={e=>setForm({...form,customFields:e.target.value})} placeholder="Custom fields, one per line: birthday=12-05-1990" rows={4} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm"/><button onClick={save} disabled={saving} className="w-full rounded-xl gradient-brand text-white py-3 text-sm font-semibold disabled:opacity-60">{saving?"Saving...":modal==="edit"?"Save Changes":"Add Contact"}</button></div>}
    </div></div>}
  </div>
}
