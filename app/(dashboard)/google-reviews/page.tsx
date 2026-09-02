"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import {
    HelpCircle,
    Store,
    CheckCircle2,
    RefreshCw,
    Bot,
    ShieldCheck,
    Clock,
    Settings,
    MessageSquare,
    Smile,
    Meh,
    Frown,
    Reply,
    Info,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

function Skeleton({ className = "" }: { className?: string }) {
    return <span className={`inline-block animate-pulse rounded bg-gray-200 ${className}`} />;
}

function SentimentBadge({ sentiment }: { sentiment: string | null }) {
    const map: Record<string, string> = {
        POSITIVE: "bg-brand-green/10 text-brand-green",
        NEUTRAL: "bg-amber-50 text-amber-600",
        NEGATIVE: "bg-red-50 text-red-500",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${map[sentiment || ""] || "bg-gray-100 text-gray-600"}`}>
            {sentiment || "—"}
        </span>
    );
}

function GoogleReviewsContent() {

    const searchParams = useSearchParams();
    const router = useRouter();

    const [loaded, setLoaded] = useState(false);
    const [account, setAccount] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);

    const [activity, setActivity] = useState<any[]>([]);
    const [activityLoaded, setActivityLoaded] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showSettings, setShowSettings] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [servicesInput, setServicesInput] = useState("");
    const [phoneInput, setPhoneInput] = useState("");
    const [templateInput, setTemplateInput] = useState("");
    const [emailInput, setEmailInput] = useState("");

    const [disconnecting, setDisconnecting] = useState(false);

    async function loadData() {
        try {
            const res = await fetch("/api/gmb/config");
            const json = await res.json();
            setLoaded(true);
            if (!json.success) return;
            setAccount(json.account);
            setConfig(json.config);
            setStats(json.stats);
            if (json.config) {
                setServicesInput((json.config.services || []).join(", "));
                setPhoneInput(json.config.businessPhone || "");
                setTemplateInput(json.config.negativeReplyTemplate || "");
                setEmailInput(json.config.notificationEmail || "");
            }
        } catch (err) {
            console.error(err);
            setLoaded(true);
        }
    }

    async function loadActivity(pageNum: number) {
        try {
            const res = await fetch(`/api/gmb/activity?page=${pageNum}`);
            const json = await res.json();
            setActivityLoaded(true);
            if (!json.success) return;
            setActivity(json.activity || []);
            setTotalPages(json.totalPages || 1);
        } catch (err) {
            console.error(err);
            setActivityLoaded(true);
        }
    }

    useEffect(() => {
        loadData();
        loadActivity(1);

        if (searchParams.get("connected")) {
            router.replace("/google-reviews");
        }
        if (searchParams.get("error")) {
            alert("Failed to connect Google Business Profile. Please try again.");
            router.replace("/google-reviews");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadActivity(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    async function toggleEnabled() {
        if (!config) return;
        const newEnabled = !config.enabled;
        setConfig((prev: any) => ({ ...prev, enabled: newEnabled }));
        await fetch("/api/gmb/config", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: newEnabled }),
        });
    }

    async function saveSettings() {
        try {
            setSavingSettings(true);
            const services = servicesInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            const res = await fetch("/api/gmb/config", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessPhone: phoneInput,
                    services,
                    negativeReplyTemplate: templateInput,
                    notificationEmail: emailInput,
                }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);

            setShowSettings(false);
            await loadData();

        } catch (err: any) {
            alert(err.message || "Failed to save settings.");
        } finally {
            setSavingSettings(false);
        }
    }

    async function handleDisconnect() {
        if (!confirm("Disconnect this Google Business Profile? Auto-replies will stop.")) return;
        try {
            setDisconnecting(true);
            await fetch("/api/gmb/config", { method: "DELETE" });
            await loadData();
        } finally {
            setDisconnecting(false);
        }
    }

    const totalReviews = stats?.total || 0;
    const repliedCount = stats?.replied || 0;
    const replyRate = totalReviews > 0 ? Math.round((repliedCount / totalReviews) * 100) : 0;

    const formatDate = (d: string | null) => {
        if (!d) return "—";
        return new Date(d).toLocaleString("en-GB", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div>
            <PageHeader
                eyebrow="Google Reviews"
                title="Auto-Responder"
                description="Automatically reply to Google reviews based on sentiment."
            />

            {/* Connection status */}
            {!loaded ? (
                <Skeleton className="h-32 w-full rounded-2xl mb-6" />
            ) : !account ? (
                <div className="glass rounded-2xl p-8 shadow-[var(--shadow-card)] mb-6 text-center">
                    <div className="size-12 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center mx-auto mb-3">
                        <Store className="size-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-base mb-1">Connect your Google Business Profile</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                        Connect your business to start monitoring and automatically replying to Google reviews.
                    </p>
                    <a
                        href="/api/gmb/connect"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)]"
                    >
                        Connect Google Business Profile
                    </a>
                </div>
            ) : (
                <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)] mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                                <Store className="size-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-base">{account.businessName || account.locationName}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green text-[10px] font-bold">Connected</span>
                                    {account.rating && <span className="text-xs text-muted-foreground">★ {account.rating}</span>}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    Google Business Profile{account.address ? ` · ${account.address}` : ""}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-brand-green mt-1">
                                    <span className="size-1.5 rounded-full bg-brand-green" /> Review monitoring is active
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-xs text-muted-foreground">
                                <div>Connected on <span className="text-foreground font-medium">{formatDate(account.connectedAt)}</span></div>
                                <div className="mt-1">Last synced <span className="text-foreground font-medium">{account.lastSyncedAt ? formatDate(account.lastSyncedAt) : "Not yet"}</span></div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleDisconnect}
                                    disabled={disconnecting}
                                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50"
                                >
                                    {disconnecting ? "Disconnecting..." : "Disconnect"}
                                </button>
                                <a
                                    href="/api/gmb/connect"
                                    className="px-4 py-2 rounded-xl border border-brand-purple/30 text-brand-purple text-xs font-semibold flex items-center gap-1.5 hover:bg-brand-purple/5 transition"
                                >
                                    <RefreshCw className="size-3" /> Re-authenticate
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {account && (
                <>
                    {/* Auto-responder config */}
                    <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)] mb-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-semibold text-base">Auto-Responder</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Enable or disable automated replies to Google reviews.</p>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className={`text-xs font-semibold ${config?.enabled ? "text-brand-green" : "text-muted-foreground"}`}>
                                    {config?.enabled ? "Enabled" : "Disabled"}
                                </span>
                                <button
                                    onClick={toggleEnabled}
                                    className={`w-11 h-6 rounded-full transition relative ${config?.enabled ? "gradient-brand" : "bg-gray-200"}`}
                                >
                                    <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${config?.enabled ? "left-5" : "left-0.5"}`} />
                                </button>
                            </label>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 pt-5 border-t border-border">
                            <div className="flex gap-3">
                                <div className="size-9 rounded-xl bg-brand-purple/10 grid place-items-center shrink-0">
                                    <Bot className="size-4 text-brand-purple" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">What happens when it's enabled?</div>
                                    <p className="text-xs text-muted-foreground mt-1">We automatically analyze new reviews and send smart replies based on sentiment.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="size-9 rounded-xl bg-brand-green/10 grid place-items-center shrink-0">
                                    <ShieldCheck className="size-4 text-brand-green" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold">Reply criteria</div>
                                    <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 text-brand-green" /> Replies sent for all new reviews</li>
                                        <li className="flex items-center gap-1.5"><CheckCircle2 className="size-3 text-brand-green" /> Replies based on review sentiment</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex gap-3">
                                    <div className="size-9 rounded-xl bg-brand-blue/10 grid place-items-center shrink-0">
                                        <Clock className="size-4 text-brand-blue" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">Services & templates</div>
                                        <p className="text-xs text-muted-foreground mt-1">{config?.services?.length || 0} services configured</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="shrink-0 px-3 py-1.5 rounded-lg border border-border text-xs font-medium flex items-center gap-1.5 hover:bg-muted transition"
                                >
                                    <Settings className="size-3" /> Edit
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Overview stats */}
                    <div className="mb-2 text-sm font-semibold">Auto-Responder Overview <span className="text-muted-foreground font-normal text-xs">(Last 30 days)</span></div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        {[
                            { icon: MessageSquare, label: "Total Reviews", value: totalReviews, bg: "bg-blue-50 text-blue-600" },
                            { icon: Smile, label: "Positive", value: stats?.positive || 0, bg: "bg-brand-green/10 text-brand-green" },
                            { icon: Meh, label: "Neutral", value: stats?.neutral || 0, bg: "bg-amber-50 text-amber-600" },
                            { icon: Frown, label: "Negative", value: stats?.negative || 0, bg: "bg-red-50 text-red-500" },
                            { icon: Reply, label: "Replies Sent", value: repliedCount, bg: "bg-brand-purple/10 text-brand-purple" },
                        ].map((s) => (
                            <div key={s.label} className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
                                <div className={`size-9 rounded-xl grid place-items-center mb-3 ${s.bg}`}>
                                    <s.icon className="size-4" />
                                </div>
                                {!loaded ? <Skeleton className="h-6 w-12" /> : (
                                    <div className="text-2xl font-bold tracking-tight tabular-nums">{s.value}</div>
                                )}
                                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Reply rate */}
                    <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] mb-6">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl gradient-brand grid place-items-center text-white shrink-0">
                                <CheckCircle2 className="size-5" />
                            </div>
                            <div className="shrink-0">
                                <div className="text-xl font-bold">{replyRate}%</div>
                                <div className="text-xs text-muted-foreground">of total reviews</div>
                            </div>
                            <div className="flex-1 mx-2">
                                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full gradient-brand" style={{ width: `${replyRate}%` }} />
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground shrink-0">
                                <span className="text-brand-green font-semibold">{repliedCount} replied</span> · {totalReviews - repliedCount} not replied
                            </div>
                        </div>
                    </div>

                    {/* Recent activity */}
                    <div className="glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="font-semibold text-sm">Recent Activity</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        {["Reviewer", "Rating", "Sentiment", "Reply Sent", "Date"].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {!activityLoaded ? (
                                        [1, 2, 3].map((i) => (
                                            <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                                                <td key={j} className="px-4 py-3"><Skeleton className="h-3 w-16" /></td>
                                            ))}</tr>
                                        ))
                                    ) : activity.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No review activity yet.</td></tr>
                                    ) : activity.map((a) => (
                                        <tr key={a.id} className="hover:bg-muted/30 transition">
                                            <td className="px-4 py-3 font-medium">{a.reviewerName || "Anonymous"}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{a.starRating || "—"}</td>
                                            <td className="px-4 py-3"><SentimentBadge sentiment={a.sentiment} /></td>
                                            <td className="px-4 py-3 text-muted-foreground">{a.replySent ? "Yes" : "No"}</td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(a.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                                <div className="flex gap-1">
                                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5" /></button>
                                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5" /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
                        <Info className="size-3.5 shrink-0" />
                        Replies are sent automatically based on review sentiment. You can disable the auto-responder anytime above.
                    </div>
                </>
            )}

            {/* Edit Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold">Auto-Responder Settings</h3>
                            <button onClick={() => setShowSettings(false)}><X className="size-5 text-muted-foreground" /></button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-5">Used to personalize AI-generated replies and mentioned naturally for SEO.</p>

                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Business phone number</label>
                        <input
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="+91-9876543210"
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm mb-4"
                        />

                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Services (comma separated)</label>
                        <textarea
                            value={servicesInput}
                            onChange={(e) => setServicesInput(e.target.value)}
                            placeholder="Facial, Manicure, Pedicure, Hair Spa"
                            rows={2}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm mb-4"
                        />

                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Negative review reply template</label>
                        <textarea
                            value={templateInput}
                            onChange={(e) => setTemplateInput(e.target.value)}
                            placeholder="Hi {{name}}, we're sorry to hear about your experience..."
                            rows={4}
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm mb-4"
                        />
                        <p className="text-[11px] text-muted-foreground -mt-3 mb-4">Use {"{{name}}"} to insert the reviewer's name.</p>

                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Notification email</label>
                        <input
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="you@business.com"
                            className="w-full rounded-lg border border-border px-3 py-2 text-sm mb-6"
                        />

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowSettings(false)} className="px-4 py-2 rounded-xl border border-border text-sm font-medium">Cancel</button>
                            <button
                                onClick={saveSettings}
                                disabled={savingSettings}
                                className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold disabled:opacity-50"
                            >
                                {savingSettings ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default function GoogleReviewsPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <GoogleReviewsContent />
        </Suspense>
    );
}
