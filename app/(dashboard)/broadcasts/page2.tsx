"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import WhatsAppPreview from "@/components/templates/WhatsAppPreview";
import {
  Calendar,
  Send,
  Users,
  Upload,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

//-----------------------------------------------------
// Skeleton loader
//-----------------------------------------------------

function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`inline-block animate-pulse rounded bg-gray-200 ${className}`} />;
}

//-----------------------------------------------------
// Status badge for campaigns table
//-----------------------------------------------------

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    QUEUED: "bg-amber-50 text-amber-700",
    SENDING: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    PARTIAL: "bg-orange-50 text-orange-700",
    FAILED: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function BroadcastsPage() {

  // ── Composer state ──────────────────────────────────

  const [campaignName, setCampaignName] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  const [audiences, setAudiences] = useState<Array<{ tag: string; count: number }>>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [audiencesLoaded, setAudiencesLoaded] = useState(false);

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState<string>("");

  const [sending, setSending] = useState(false);

  // ── CSV upload state ────────────────────────────────

  const [showUpload, setShowUpload] = useState(false);
  const [uploadTag, setUploadTag] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Campaigns table state ───────────────────────────

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Derived: selected template object ───────────────

  const currentTemplate = useMemo(
    () => templates.find((t: any) => t.name === selectedTemplateName),
    [templates, selectedTemplateName]
  );

  const templateVars = useMemo(() => {
    if (!currentTemplate?.body) return [];
    const matches = Array.from(
      currentTemplate.body.matchAll(/\{\{(\d+)\}\}/g)
    ).map((m: any) => m[1]);
    return [...new Set(matches)].sort((a: string, b: string) => Number(a) - Number(b));
  }, [currentTemplate]);

  const isImageHeader = useMemo(
    () => (currentTemplate?.headerType ?? "").toUpperCase() === "IMAGE",
    [currentTemplate]
  );

  const selectedAudience = audiences.find((a) => a.tag === selectedTag);

  // Reset per-template inputs when template changes
  useEffect(() => {
    setVariableValues({});
    setHeaderImageFile(null);
    setHeaderImagePreview("");
  }, [selectedTemplateName]);

  // ── Data loading ─────────────────────────────────────

  async function loadTemplates() {
    try {
      const res = await fetch("/api/templates");
      const json = await res.json();
      setTemplatesLoaded(true);
      if (!json.success) return;
      // Only approved templates can actually be sent.
      const approved = (json.templates || []).filter(
        (t: any) => (t.status || "").toUpperCase() === "APPROVED"
      );
      setTemplates(approved);
    } catch (err) {
      console.error(err);
      setTemplatesLoaded(true);
    }
  }

  async function loadAudiences() {
    try {
      const res = await fetch("/api/contacts/tags");
      const json = await res.json();
      setAudiencesLoaded(true);
      if (!json.success) return;
      setAudiences(json.audiences || []);
    } catch (err) {
      console.error(err);
      setAudiencesLoaded(true);
    }
  }

  async function loadCampaigns(pageNum: number) {
    try {
      const res = await fetch(`/api/campaigns?page=${pageNum}`);
      const json = await res.json();
      setCampaignsLoaded(true);
      if (!json.success) return;
      setCampaigns(json.campaigns || []);
      setTotalPages(json.totalPages || 1);
    } catch (err) {
      console.error(err);
      setCampaignsLoaded(true);
    }
  }

  useEffect(() => {
    loadTemplates();
    loadAudiences();
    loadCampaigns(1);
  }, []);

  useEffect(() => {
    loadCampaigns(page);
  }, [page]);

  // ── CSV upload handler ──────────────────────────────

  async function handleCsvUpload() {

    if (!uploadFile || !uploadTag.trim()) return;

    try {

      setUploading(true);

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("tag", uploadTag.trim());

      const res = await fetch("/api/contacts/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      alert(`Uploaded ${json.inserted} of ${json.parsed} contacts to "${uploadTag}".`);

      setShowUpload(false);
      setUploadFile(null);
      setUploadTag("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      await loadAudiences();

    } catch (err: any) {

      alert(err.message);

    } finally {

      setUploading(false);

    }

  }

  // ── Send Now handler ────────────────────────────────

  async function handleSendNow() {

    if (!campaignName.trim()) {
      alert("Please enter a campaign name.");
      return;
    }
    if (!selectedTemplateName) {
      alert("Please select a template.");
      return;
    }
    if (!selectedTag) {
      alert("Please select an audience.");
      return;
    }
    if (isImageHeader && !headerImageFile) {
      alert("This template requires a header image. Please upload one.");
      return;
    }

    try {

      setSending(true);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName,
          templateName: selectedTemplateName,
          audienceTag: selectedTag,
        }),
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      alert("Campaign queued. It will start sending shortly — check Recent Broadcasts for progress.");

      setCampaignName("");
      setSelectedTemplateName("");
      setSelectedTag("");
      setVariableValues({});
      setHeaderImageFile(null);
      setHeaderImagePreview("");

      await loadCampaigns(1);
      setPage(1);

    } catch (err: any) {

      alert(err.message);

    } finally {

      setSending(false);

    }

  }

  const previewBody = (currentTemplate?.body || "").replace(
    /\{\{(\d+)\}\}/g,
    (_: string, n: string) => variableValues[n] || `{{${n}}}`
  );

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

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
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Summer Special Promotion 2026"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-base font-medium outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">

              {/* Template dropdown — real data */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Template</label>
                {!templatesLoaded ? (
                  <Skeleton className="h-12 w-full rounded-xl" />
                ) : (
                  <select
                    value={selectedTemplateName}
                    onChange={(e) => setSelectedTemplateName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm font-medium"
                  >
                    <option value="">Select a template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                )}
                {templatesLoaded && templates.length === 0 && (
                  <p className="mt-1.5 text-xs text-gray-400">No approved templates yet.</p>
                )}
              </div>

              {/* Audience — real tags, with upload trigger */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Audience</label>
                  <button
                    type="button"
                    onClick={() => setShowUpload(true)}
                    className="text-[11px] font-semibold text-brand-blue hover:underline"
                  >
                    + Upload CSV
                  </button>
                </div>
                {!audiencesLoaded ? (
                  <Skeleton className="h-12 w-full rounded-xl" />
                ) : (
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-sm font-medium"
                  >
                    <option value="">Select an audience</option>
                    {audiences.map((a) => (
                      <option key={a.tag} value={a.tag}>{a.tag} ({a.count})</option>
                    ))}
                  </select>
                )}
                {audiencesLoaded && audiences.length === 0 && (
                  <p className="mt-1.5 text-xs text-gray-400">No contacts yet — upload a CSV.</p>
                )}
              </div>

            </div>

            {/* Header image uploader — only for IMAGE header templates */}
            {isImageHeader && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Header Image</label>
                {headerImagePreview ? (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3">
                    <img src={headerImagePreview} className="h-12 w-12 rounded-lg border object-cover" />
                    <div className="flex-1 min-w-0 text-xs text-foreground truncate">{headerImageFile?.name}</div>
                    <button
                      type="button"
                      onClick={() => { setHeaderImageFile(null); setHeaderImagePreview(""); }}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >Remove</button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 hover:bg-muted/50 transition">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload header image (required by this template)</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setHeaderImageFile(file);
                        setHeaderImagePreview(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            {/* Variables — dynamically detected from template body */}
            {templateVars.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Variables <span className="font-normal normal-case text-gray-400">(sample values for preview)</span>
                </label>
                <div className="space-y-2">
                  {templateVars.map((v: string) => (
                    <div key={v} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                      <code className="font-mono text-sm text-brand-purple font-bold">{`{{${v}}}`}</code>
                      <input
                        value={variableValues[v] ?? ""}
                        onChange={(e) => setVariableValues((prev) => ({ ...prev, [v]: e.target.value }))}
                        placeholder={`Value for {{${v}}}`}
                        className="flex-1 min-w-0 bg-transparent text-sm font-medium outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Schedule</label>
              <div className="flex gap-2">
                <button
                  onClick={handleSendNow}
                  disabled={sending}
                  className="flex-1 px-4 py-3 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="size-4" /> {sending ? "Queuing..." : "Send Now"}
                </button>
                <button
                  disabled
                  title="Coming soon"
                  className="px-5 py-3 rounded-xl border border-border bg-background font-medium text-sm flex items-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <Calendar className="size-4" /> Schedule
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { k: "Recipients", v: selectedAudience ? String(selectedAudience.count) : "—" },
              { k: "Est. Cost", v: selectedAudience ? `$${(selectedAudience.count * 0.015).toFixed(2)}` : "—" },
              { k: "Est. Delivery", v: selectedAudience ? `~${Math.max(1, Math.ceil(selectedAudience.count / 80))} min` : "—" },
            ].map((s) => (
              <div key={s.k} className="glass rounded-2xl p-4 shadow-[var(--shadow-card)]">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.k}</div>
                <div className="text-xl font-bold tracking-tight mt-1">{s.v}</div>
              </div>
            ))}
          </div>


        </div>

        {/* Live preview — reusing the existing WhatsAppPreview component */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-gradient-brand text-center mb-4">Live WhatsApp Preview</div>
          <WhatsAppPreview
            template={{
              headerType: currentTemplate?.headerType,
              headerText: currentTemplate?.headerText,
              headerImage: headerImagePreview || currentTemplate?.headerImage,
              body: previewBody || "Select a template to preview your message.",
              footer: currentTemplate?.footer,
              buttons: currentTemplate?.buttons,
            }}
            size="large"
          />
        </div>

      </div>
      {/* Recent Broadcasts — paginated table */}
      <div className="glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Recent Broadcasts</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Campaign", "Audience", "Delivered", "Executed", "Status", "Cost"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {!campaignsLoaded ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-3 w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">No broadcasts yet.</td></tr>
              ) : campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3 font-medium">{c.campaignName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.audienceTag} ({c.totalContacts})</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.deliveredCount} / {c.totalContacts}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(c.executedAt || c.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">${Number(c.cost || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
              ><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
              ><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        )}
      </div>
      {/* CSV Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-1">Upload Audience</h3>
            <p className="text-sm text-muted-foreground mb-5">Upload a CSV with columns: name, phone, email (phone required).</p>

            <label className="block text-xs font-medium text-gray-600 mb-1.5">Audience Name</label>
            <input
              value={uploadTag}
              onChange={(e) => setUploadTag(e.target.value)}
              placeholder="e.g. VIP Customers"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm mb-4"
            />

            <label className="block text-xs font-medium text-gray-600 mb-1.5">CSV File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-sm mb-6"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium"
              >Cancel</button>
              <button
                onClick={handleCsvUpload}
                disabled={uploading || !uploadFile || !uploadTag.trim()}
                className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
