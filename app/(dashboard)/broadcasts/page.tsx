"use client";

import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
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
  Clock3,
  CheckCircle2,
  AlertCircle,
  Eye,
  CircleDot,
} from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
  return <span className={`inline-block animate-pulse rounded bg-gray-200 ${className}`} />;
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Scheduled",
  QUEUED: "In-Progress",
  SENDING: "In-Progress",
  IN_PROGRESS: "In-Progress",
  COMPLETED: "Completed",
};

function StatusBadge({ status }: { status: string }) {
  const key = (status || "").toUpperCase();
  const label = STATUS_LABEL[key] || status || "In-Progress";
  const cls =
    key === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : key === "SCHEDULED"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-sky-50 text-sky-700 border-sky-200";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "blue" | "amber" | "violet";
  icon?: ReactNode;
}) {
  const tones = {
    neutral: "border-border bg-background text-foreground",
    green: "border-emerald-200 bg-emerald-50/60 text-emerald-700",
    red: "border-red-200 bg-red-50/60 text-red-700",
    blue: "border-sky-200 bg-sky-50/60 text-sky-700",
    amber: "border-amber-200 bg-amber-50/60 text-amber-700",
    violet: "border-violet-200 bg-violet-50/60 text-violet-700",
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-[var(--shadow-card)] ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</div>
        {icon}
      </div>
      <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

export default function BroadcastsPage() {
  const [campaignName, setCampaignName] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  const [audiences, setAudiences] = useState<Array<{ tag: string; count: number }>>([]);
  const [selectedTag, setSelectedTag] = useState("");
  const [audiencesLoaded, setAudiencesLoaded] = useState(false);

  // Preview/sample values.
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  // Actual field mapping saved with the campaign for the Dispezo worker.
  const [variableMapping, setVariableMapping] = useState<Record<string, string>>({});
  const [manualVariableValues, setManualVariableValues] = useState<Record<string, string>>({});

  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [headerImagePreview, setHeaderImagePreview] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [uploadTag, setUploadTag] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const currentTemplate = useMemo(
    () => templates.find((t: any) => t.name === selectedTemplateName),
    [templates, selectedTemplateName]
  );

  const templateVars = useMemo(() => {
    if (!currentTemplate?.body) return [];
    const matches = Array.from(currentTemplate.body.matchAll(/\{\{(\d+)\}\}/g)).map(
      (m: any) => m[1]
    );
    return [...new Set(matches)].sort(
      (a: string, b: string) => Number(a) - Number(b)
    );
  }, [currentTemplate]);

  const isImageHeader = useMemo(
    () => (currentTemplate?.headerType ?? "").toUpperCase() === "IMAGE",
    [currentTemplate]
  );

  const selectedAudience = audiences.find((a) => a.tag === selectedTag);

  const mappingOptions = useMemo(() => {
    const base = ["name", "phone", "email"];
    return [...new Set([...base, ...csvColumns])];
  }, [csvColumns]);

  useEffect(() => {
    setVariableValues({});
    setVariableMapping({});
    setManualVariableValues({});
    setHeaderImageFile(null);
    setHeaderImagePreview("");
  }, [selectedTemplateName]);

  async function loadTemplates() {
    try {
      const res = await fetch("/api/templates");
      const json = await res.json();
      setTemplatesLoaded(true);
      if (!json.success) return;
      setTemplates(
        (json.templates || []).filter(
          (t: any) => (t.status || "").toUpperCase() === "APPROVED"
        )
      );
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

  function inspectCsvColumns(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
      const columns = firstLine
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
      setCsvColumns(columns);
    };
    reader.readAsText(file);
  }

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

  function validateCampaign() {
    if (!campaignName.trim()) return "Please enter a campaign name.";
    if (!selectedTemplateName) return "Please select a template.";
    if (!selectedTag) return "Please select an audience.";
    if (isImageHeader && !headerImageFile) {
      return "This template requires a header image. Please upload one.";
    }

    for (const variable of templateVars) {
      const source = variableMapping[variable];
      if (source === "__manual__") {
        if (!manualVariableValues[variable]?.trim()) {
          return `Please enter a value for {{${variable}}}.`;
        }
      } else if (!source) {
        return `Please map {{${variable}}} to a contact/CSV field or choose Manual value.`;
      }
    }

    return null;
  }

  async function createCampaign(mode: "now" | "scheduled") {
    const error = validateCampaign();
    if (error) {
      alert(error);
      return;
    }

    if (mode === "scheduled" && !scheduledAt) {
      alert("Please select a date and time.");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignName: campaignName.trim(),
          templateName: selectedTemplateName,
          audienceTag: selectedTag,
          variableMapping,
          manualVariableValues,
          sampleVariableValues: variableValues,
          scheduledAt: mode === "scheduled" ? new Date(scheduledAt).toISOString() : null,
          status: mode === "scheduled" ? "SCHEDULED" : "IN_PROGRESS",
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      alert(
        mode === "scheduled"
          ? "Broadcast scheduled successfully."
          : "Broadcast queued. It will start sending shortly."
      );

      setCampaignName("");
      setSelectedTemplateName("");
      setSelectedTag("");
      setVariableValues({});
      setVariableMapping({});
      setManualVariableValues({});
      setHeaderImageFile(null);
      setHeaderImagePreview("");
      setScheduledAt("");
      setShowSchedule(false);

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
    (_: string, n: string) => manualVariableValues[n] || variableValues[n] || `{{${n}}}`
  );

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (seconds == null) return "—";
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs ? `${minutes}m ${secs}s` : `${minutes} min`;
  };

  return (
    <div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <PageHeader
            eyebrow="Campaign"
            title="New Broadcast"
            description="Compose your campaign, map your audience fields, and dispatch with confidence."
          />
        </div>

        <div className="lg:col-span-5 lg:row-span-2 lg:sticky lg:top-6">
          <div className="mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-gradient-brand">
            Live WhatsApp Preview
          </div>
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

        <div className="space-y-6 lg:col-span-7">
          <div className="glass rounded-2xl p-8 shadow-[var(--shadow-card)] space-y-6">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Campaign Name
              </label>
              <input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Summer Special Promotion 2026"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base font-medium outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Template
                </label>
                {!templatesLoaded ? (
                  <Skeleton className="h-12 w-full rounded-xl" />
                ) : (
                  <select
                    value={selectedTemplateName}
                    onChange={(e) => setSelectedTemplateName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium"
                  >
                    <option value="">Select a template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Audience
                  </label>
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
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium"
                  >
                    <option value="">Select an audience</option>
                    {audiences.map((a) => (
                      <option key={a.tag} value={a.tag}>
                        {a.tag} ({a.count})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {templateVars.length > 0 && (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-violet-700">
                      Map Template Variables
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Map each WhatsApp variable to a contact/CSV field, or enter a fixed value manually.
                    </p>
                  </div>
                  <Users className="h-5 w-5 text-violet-600" />
                </div>

                <div className="space-y-3">
                  {templateVars.map((v: string) => {
                    const isManual = variableMapping[v] === "__manual__";

                    return (
                      <div
                        key={v}
                        className="rounded-xl border border-border bg-white p-3"
                      >
                        <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[90px_1fr]">
                          <code className="font-mono text-sm font-bold text-violet-700">
                            {`{{${v}}}`}
                          </code>

                          <select
                            value={variableMapping[v] || ""}
                            onChange={(e) => {
                              const value = e.target.value;

                              setVariableMapping((prev) => ({
                                ...prev,
                                [v]: value,
                              }));

                              if (value !== "__manual__") {
                                setManualVariableValues((prev) => {
                                  const next = { ...prev };
                                  delete next[v];
                                  return next;
                                });
                              }
                            }}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Select field</option>
                            {mappingOptions.map((field) => (
                              <option key={field} value={field}>
                                {field}
                              </option>
                            ))}
                            <option value="__manual__">Enter manually</option>
                          </select>
                        </div>

                        {isManual && (
                          <div className="mt-3 sm:ml-[90px]">
                            <input
                              value={manualVariableValues[v] || ""}
                              onChange={(e) =>
                                setManualVariableValues((prev) => ({
                                  ...prev,
                                  [v]: e.target.value,
                                }))
                              }
                              placeholder={`Enter value for {{${v}}}`}
                              className="w-full rounded-lg border border-violet-200 bg-violet-50/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                            />
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              This same value will be used for every recipient in this campaign.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isImageHeader && (
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Header Image
                </label>
                {headerImagePreview ? (
                  <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3">
                    <img
                      src={headerImagePreview}
                      className="h-12 w-12 rounded-lg border object-cover"
                      alt=""
                    />
                    <div className="min-w-0 flex-1 truncate text-xs">{headerImageFile?.name}</div>
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderImageFile(null);
                        setHeaderImagePreview("");
                      }}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-4 transition hover:bg-muted/50">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Upload header image (required by this template)
                    </span>
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

            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Schedule
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => createCampaign("now")}
                  disabled={sending}
                  className="flex-1 rounded-xl gradient-brand px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-glow)] flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send className="size-4" />
                  {sending ? "Saving..." : "Send Now"}
                </button>
                <button
                  onClick={() => setShowSchedule(true)}
                  disabled={sending}
                  className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium flex items-center gap-2 hover:bg-muted disabled:opacity-50"
                >
                  <Calendar className="size-4" />
                  Schedule
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Recipients"
              value={selectedAudience ? String(selectedAudience.count) : "—"}
              icon={<Users className="h-4 w-4 opacity-70" />}
            />
            <StatCard
              label="Est. Cost"
              value={selectedAudience ? `₹${(selectedAudience.count * Number(currentTemplate?.costPerMessage || 0)).toFixed(2)}` : "—"}
              tone="violet"
            />
            <StatCard
              label="Est. Delivery"
              value={selectedAudience ? `~${Math.max(1, Math.ceil(selectedAudience.count / 80))} min` : "—"}
              tone="blue"
              icon={<Clock3 className="h-4 w-4 opacity-70" />}
            />
          </div>
        </div>

      </div>

      <div className="mt-8 glass overflow-hidden rounded-2xl shadow-[var(--shadow-card)]">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-sm">Broadcast History</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Campaign-level results. Individual broadcast messages are not shown here.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Campaign",
                  "Audience",
                  "Recipients",
                  "Delivered",
                  "Failed",
                  "Read",
                  "Status",
                  "Execution Time",
                  "Cost",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {!campaignsLoaded ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-3 w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No broadcasts yet.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => {
                  const total = Number(c.totalContacts || 0);
                  const delivered = Number(c.deliveredCount || 0);
                  const failed = Number(c.failedCount || 0);
                  const read = Number(c.readCount || 0);

                  return (
                    <tr key={c.id} className="transition hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{c.campaignName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {c.audienceTag} ({total})
                      </td>
                      <td className="px-4 py-3 font-semibold">{total}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {delivered}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 font-semibold ${failed > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                          <AlertCircle className="h-3.5 w-3.5" />
                          {failed}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-sky-700">
                          <Eye className="h-3.5 w-3.5" />
                          {read}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatDuration(c.executionDurationSeconds)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold text-violet-700">
                        ₹{Number(c.cost || 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Schedule Broadcast</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The campaign configuration will be saved to PostgreSQL and executed by Dispezo automatically.
                </p>
              </div>
            </div>

            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Date & time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mb-6 w-full rounded-xl border border-border px-3 py-3 text-sm"
            />

            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <div className="flex items-center gap-2 font-semibold">
                <CircleDot className="h-3.5 w-3.5" />
                Scheduled
              </div>
              <div className="mt-1">
                Audience: {selectedTag || "—"} · Recipients: {selectedAudience?.count ?? "—"}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSchedule(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => createCampaign("scheduled")}
                disabled={sending || !scheduledAt}
                className="gradient-brand rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {sending ? "Saving..." : "Schedule Broadcast"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-1 text-lg font-bold">Upload Audience</h3>
            <p className="mb-5 text-sm text-muted-foreground">
              CSV must include <b>phone</b>. You can also use name, email, and additional columns for template variables.
            </p>

            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              Audience Name
            </label>
            <input
              value={uploadTag}
              onChange={(e) => setUploadTag(e.target.value)}
              placeholder="e.g. VIP Customers"
              className="mb-4 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />

            <label className="mb-1.5 block text-xs font-medium text-gray-600">
              CSV File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setUploadFile(file);
                if (file) inspectCsvColumns(file);
                else setCsvColumns([]);
              }}
              className="mb-4 w-full text-sm"
            />

            {csvColumns.length > 0 && (
              <div className="mb-6 rounded-xl border border-sky-200 bg-sky-50 p-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-sky-700">
                  Detected CSV fields
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {csvColumns.map((column) => (
                    <span
                      key={column}
                      className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-sky-800 border border-sky-200"
                    >
                      {column}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowUpload(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvUpload}
                disabled={uploading || !uploadFile || !uploadTag.trim()}
                className="gradient-brand flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
