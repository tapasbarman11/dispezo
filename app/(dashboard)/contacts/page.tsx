"use client";
import { PageHeader } from "@/components/ui/page-header";
import { Search, Upload, Plus, Filter } from "lucide-react";

const contacts = [
  { name: "Alice Johnson", phone: "+44 7700 900012", tags: ["VIP", "Recurring"], last: "2h ago" },
  { name: "Marcus Reilly", phone: "+44 7700 900483", tags: ["New"], last: "Yesterday" },
  { name: "Priya Sharma", phone: "+44 7700 900911", tags: ["VIP"], last: "3d ago" },
  { name: "Olivia Tan", phone: "+44 7700 900725", tags: ["Newsletter"], last: "1w ago" },
  { name: "Daniel Okafor", phone: "+44 7700 900156", tags: ["Recurring"], last: "2w ago" },
  { name: "Sofia Castillo", phone: "+44 7700 900392", tags: ["VIP", "Newsletter"], last: "1m ago" },
];

const tagColor: Record<string, string> = {
  VIP: "bg-brand-blue/10 text-brand-blue",
  Recurring: "bg-brand-purple/10 text-brand-purple",
  New: "bg-brand-green/10 text-brand-green",
  Newsletter: "bg-muted text-muted-foreground",
};

export default function ContactsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Directory"
        title="Contacts"
        description="Your unified customer list, segmented and ready for outreach."
        actions={
          <>
            <button className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-medium flex items-center gap-2 hover:bg-muted transition">
              <Upload className="size-4" /> Import CSV
            </button>
            <button className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold flex items-center gap-2 shadow-[var(--shadow-glow)]">
              <Plus className="size-4" /> Add Contact
            </button>
          </>
        }
      />

      <div className="glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-4 flex flex-wrap items-center gap-3 border-b border-border">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search contacts, phone, tags..."
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            {["All", "VIP", "Recurring", "New", "Newsletter"].map((t, i) => (
              <button key={t} className={`px-3 py-1.5 rounded-full ${i===0 ? "bg-foreground text-background" : "border border-border text-muted-foreground hover:bg-muted"}`}>{t}</button>
            ))}
          </div>
          <button className="p-2 rounded-xl border border-border hover:bg-muted">
            <Filter className="size-4" />
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground"><input type="checkbox" /></th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Segments</th>
              <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((c) => (
              <tr key={c.phone} className="hover:bg-muted/30 transition">
                <td className="px-6 py-4"><input type="checkbox" /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full gradient-brand grid place-items-center text-white text-[11px] font-semibold">
                      {c.name.split(" ").map(n=>n[0]).join("")}
                    </div>
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{c.phone}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map(t => (
                      <span key={t} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tagColor[t]}`}>{t}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground text-right">{c.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}