"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";

//-----------------------------------------------------
// Mock data — replace with real API calls once
// /api/gmb/configs + /api/gmb/activity are wired up
//-----------------------------------------------------

const trendData = [
    { d: "May 6", v: 40 },
    { d: "May 13", v: 62 },
    { d: "May 20", v: 48 },
    { d: "May 27", v: 74 },
    { d: "Jun 3", v: 66 },
];

const sentimentData = [
    { name: "Positive", value: 186, color: "var(--brand-green)" },
    { name: "Neutral", value: 37, color: "oklch(0.775 0.174 80)" },
    { name: "Negative", value: 33, color: "oklch(0.6 0.2 25)" },
];

const keywords = [
    { k: "service", n: 28, up: 12 },
    { k: "staff", n: 24, up: 8 },
    { k: "clean", n: 18, up: 5 },
    { k: "support", n: 16, up: 6 },
    { k: "experience", n: 14, up: 4 },
];

function StatCard({
    icon: Icon,
    label,
    value,
    trend,
    trendUp,
    iconBg,
}: {
    icon: any;
    label: string;
    value: string;
    trend: string;
    trendUp: boolean;
    iconBg: string;
}) {
    return (
        <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3 mb-3">
                <div className={`size-9 rounded-xl grid place-items-center ${iconBg}`}>
                    <Icon className="size-4" />
                </div>
            </div>
            <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            <div className={`text-[11px] font-semibold mt-1.5 ${trendUp ? "text-brand-green" : "text-red-500"}`}>
                {trendUp ? "↑" : "↓"} {trend} vs last 30 days
            </div>
        </div>
    );
}

export default function GoogleReviewsPage() {

    const [autoResponderEnabled, setAutoResponderEnabled] = useState(true);

    const totalReviews = sentimentData.reduce((s, d) => s + d.value, 0);
    const repliedCount = 142;
    const replyRate = Math.round((repliedCount / (totalReviews > 0 ? totalReviews + 114 : 1)) * 100);

    return (
        <div>
            <PageHeader
                eyebrow="Google Reviews"
                title="Auto-Responder"
                description="Automatically reply to Google reviews based on sentiment."
            />

            {/* Connection status */}
            <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)] mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center">
                            <Store className="size-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-base">Acme Studios</span>
                                <span className="px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green text-[10px] font-bold">Connected</span>
                                <span className="text-xs text-muted-foreground">★ 4.2</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Google Business Profile · Bengaluru, Karnataka, India</div>
                            <div className="flex items-center gap-1.5 text-xs text-brand-green mt-1">
                                <span className="size-1.5 rounded-full bg-brand-green" /> Review monitoring is active
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-xs text-muted-foreground">
                            <div>Connected on <span className="text-foreground font-medium">May 24, 2026</span></div>
                            <div className="mt-1">Last synced <span className="text-foreground font-medium">Today, 10:30 AM</span></div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition">Disconnect</button>
                            <button className="px-4 py-2 rounded-xl border border-brand-purple/30 text-brand-purple text-xs font-semibold flex items-center gap-1.5 hover:bg-brand-purple/5 transition">
                                <RefreshCw className="size-3" /> Re-authenticate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auto-responder config */}
            <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)] mb-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-semibold text-base">Auto-Responder</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Enable or disable automated replies to Google reviews.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className={`text-xs font-semibold ${autoResponderEnabled ? "text-brand-green" : "text-muted-foreground"}`}>
                            {autoResponderEnabled ? "Enabled" : "Disabled"}
                        </span>
                        <button
                            onClick={() => setAutoResponderEnabled((v) => !v)}
                            className={`w-11 h-6 rounded-full transition relative ${autoResponderEnabled ? "gradient-brand" : "bg-gray-200"}`}
                        >
                            <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${autoResponderEnabled ? "left-5" : "left-0.5"}`} />
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
                                <div className="text-sm font-semibold">Response time</div>
                                <p className="text-xs text-muted-foreground mt-1">Replies are typically sent within <span className="font-semibold text-foreground">5–10 minutes</span></p>
                            </div>
                        </div>
                        <button className="shrink-0 px-3 py-1.5 rounded-lg border border-border text-xs font-medium flex items-center gap-1.5 hover:bg-muted transition">
                            <Settings className="size-3" /> Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview stats */}
            <div className="mb-2 text-sm font-semibold">Auto-Responder Overview <span className="text-muted-foreground font-normal text-xs">(Last 30 days)</span></div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <StatCard icon={MessageSquare} label="Total Reviews" value="256" trend="18%" trendUp iconBg="bg-blue-50 text-blue-600" />
                <StatCard icon={Smile} label="Positive Reviews" value="186" trend="22%" trendUp iconBg="bg-brand-green/10 text-brand-green" />
                <StatCard icon={Meh} label="Neutral Reviews" value="37" trend="8%" trendUp={false} iconBg="bg-amber-50 text-amber-600" />
                <StatCard icon={Frown} label="Negative Reviews" value="33" trend="15%" trendUp={false} iconBg="bg-red-50 text-red-500" />
                <StatCard icon={Reply} label="Replies Sent" value="142" trend="25%" trendUp iconBg="bg-brand-purple/10 text-brand-purple" />
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
                        <span className="text-brand-green font-semibold">{repliedCount} replied</span> · 114 not replied
                    </div>
                </div>
            </div>

            {/* Performance insights */}
            <div className="text-sm font-semibold mb-3">Performance Insights <span className="text-muted-foreground font-normal text-xs">(Last 30 days)</span></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

                {/* SEO rating donut */}
                <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] flex flex-col items-center">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        SEO Rating <HelpCircle className="size-3" />
                    </div>
                    <div className="relative size-24">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={[{ value: 82 }, { value: 18 }]}
                                    dataKey="value"
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    startAngle={90}
                                    endAngle={-270}
                                    stroke="none"
                                >
                                    <Cell fill="var(--brand-green)" />
                                    <Cell fill="var(--muted)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 grid place-items-center">
                            <span className="text-xl font-bold">82%</span>
                        </div>
                    </div>
                    <div className="text-xs font-semibold text-brand-green mt-2">Good</div>
                    <div className="text-[11px] text-brand-green mt-0.5">↑ 12% vs last 30 days</div>
                </div>

                {/* Review trend */}
                <div className="lg:col-span-2 glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
                    <div className="text-xs font-semibold text-muted-foreground mb-3">Review Trend</div>
                    <div className="h-40">
                        <ResponsiveContainer>
                            <LineChart data={trendData}>
                                <CartesianGrid stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="d" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={11} />
                                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={11} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 }} />
                                <Line type="monotone" dataKey="v" stroke="var(--brand-purple)" strokeWidth={2} dot={{ r: 3, fill: "var(--brand-purple)" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sentiment distribution */}
                <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
                    <div className="text-xs font-semibold text-muted-foreground mb-3">Sentiment Distribution</div>
                    <div className="flex items-center gap-4">
                        <div className="relative size-20 shrink-0">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={sentimentData} dataKey="value" innerRadius="60%" outerRadius="100%" stroke="none">
                                        {sentimentData.map((s, i) => <Cell key={i} fill={s.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-1.5 text-xs">
                            {sentimentData.map((s) => (
                                <div key={s.name} className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                                    <span className="text-muted-foreground">{s.name} ({Math.round((s.value / totalReviews) * 100)}%)</span>
                                    <span className="font-semibold ml-auto">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top keywords */}
            <div className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] mt-4">
                <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1">
                    Top Keywords <HelpCircle className="size-3" />
                </div>
                <div className="space-y-2.5">
                    {keywords.map((k) => (
                        <div key={k.k} className="flex items-center gap-3 text-xs">
                            <span className="w-20 text-muted-foreground">{k.k}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full gradient-brand" style={{ width: `${(k.n / 28) * 100}%` }} />
                            </div>
                            <span className="w-6 text-right font-semibold">{k.n}</span>
                            <span className="text-brand-green">↑ {k.up}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
                <Info className="size-3.5 shrink-0" />
                Replies are sent automatically based on review sentiment. You can disable the auto-responder anytime above.
            </div>
        </div>
    );
}
