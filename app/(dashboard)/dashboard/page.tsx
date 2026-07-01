"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import {
    ArrowUpRight,
    Send,
    CheckCheck,
    Eye,
    AlertCircle,
    Megaphone,
    CheckCircle2,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
const data = [
    { d: "Mon", sent: 4200, delivered: 4180, read: 3100 },
    { d: "Tue", sent: 5100, delivered: 5040, read: 4020 },
    { d: "Wed", sent: 4800, delivered: 4780, read: 3800 },
    { d: "Thu", sent: 6200, delivered: 6180, read: 5100 },
    { d: "Fri", sent: 7400, delivered: 7350, read: 6200 },
    { d: "Sat", sent: 5900, delivered: 5870, read: 4900 },
    { d: "Sun", sent: 6800, delivered: 6790, read: 5600 },
];
const stats = [
    {
        label: "Messages Sent",
        value: "142,890",
        trend: "+12.4%",
        icon: Send,
        accent: "from-brand-blue to-brand-purple",
    },
    {
        label: "Delivered",
        value: "99.4%",
        trend: "+0.2%",
        icon: CheckCheck,
        accent: "from-brand-green to-brand-blue",
    },
    {
        label: "Read Rate",
        value: "84.2%",
        trend: "+4.1%",
        icon: Eye,
        accent: "from-brand-purple to-brand-blue",
    },
    {
        label: "Failed",
        value: "0.6%",
        trend: "-0.3%",
        icon: AlertCircle,
        accent: "from-rose-500 to-orange-500",
    },
    {
        label: "Active Campaigns",
        value: "08",
        trend: "3 ending today",
        icon: Megaphone,
        accent: "from-brand-blue to-brand-green",
    },
];
export default function Dashboard() {
    const [onboarding, setOnboarding] = useState<any>(null);
    useEffect(() => {
        const loadStatus = async () => {
            try {
                const res = await fetch("/api/onboarding/status");
                const data = await res.json();
                setOnboarding(data);
            } catch (error) {
                console.error(error);
            }
        };
        loadStatus();
    }, []);
    return (
        <>
            {" "}
            <PageHeader
                eyebrow="Overview"
                title="Good afternoon"
                description="Here's how your messaging is performing across all active campaigns."
                actions={
                    <Link
                        href="/broadcasts"
                        className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-semibold shadow-[var(--shadow-glow)] hover:opacity-90 transition"
                    >
                        {" "}
                        New Broadcast{" "}
                    </Link>
                }
            />{" "}
            {onboarding && onboarding.completionPercent < 100 && (
                <div className="glass rounded-2xl p-5 mb-6 shadow-[var(--shadow-card)]">

                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-lg font-semibold">
                                Setup Progress
                            </h3>

                            <p className="text-sm text-muted-foreground">
                                Complete your account setup
                            </p>
                        </div>

                        <div className="text-right">

                            <div className="text-sm text-muted-foreground">
                                {[
                                    onboarding.profileCompleted,
                                    onboarding.organizationCount > 0,
                                    onboarding.whatsappCount > 0,
                                ].filter(Boolean).length}
                                {" "}of 3 completed
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">

                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-medium text-muted-foreground">
                                Progress
                            </span>

                            <span className="text-xs font-semibold text-green-600">
                                {onboarding.completionPercent}% Complete
                            </span>
                        </div>

                        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                            <div
                                className="absolute inset-y-0 left-0 bg-green-500 rounded-full transition-all duration-500"
                                style={{
                                    width: `${onboarding.completionPercent}%`,
                                }}
                            />

                        </div>

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">

                        <div className="flex flex-wrap items-center gap-6 text-sm">

                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    className={
                                        onboarding.profileCompleted
                                            ? "text-green-500 size-4"
                                            : "text-muted-foreground size-4"
                                    }
                                />
                                <span>Profile</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    className={
                                        onboarding.organizationCount > 0
                                            ? "text-green-500 size-4"
                                            : "text-muted-foreground size-4"
                                    }
                                />
                                <span>Business</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <CheckCircle2
                                    className={
                                        onboarding.whatsappCount > 0
                                            ? "text-green-500 size-4"
                                            : "text-muted-foreground size-4"
                                    }
                                />
                                <span>WhatsApp</span>
                            </div>

                        </div>

                        <Link
                            href="/onboarding"
                            className="text-sm font-semibold text-brand-blue hover:underline"
                        >
                            Complete Setup →
                        </Link>

                    </div>

                </div>
            )}{" "}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {" "}
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div
                            key={s.label}
                            className="glass rounded-2xl p-5 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-transform"
                        >
                            {" "}
                            <div className="flex items-center justify-between mb-4">
                                {" "}
                                <div
                                    className={`size-9 rounded-xl bg-gradient-to-br ${s.accent} grid place-items-center text-white`}
                                >
                                    {" "}
                                    <Icon className="size-4" />{" "}
                                </div>{" "}
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {" "}
                                    {s.trend}{" "}
                                </span>{" "}
                            </div>{" "}
                            <div className="text-2xl font-bold tracking-tight tabular-nums">
                                {" "}
                                {s.value}{" "}
                            </div>{" "}
                            <div className="text-xs text-muted-foreground mt-1">
                                {" "}
                                {s.label}{" "}
                            </div>{" "}
                        </div>
                    );
                })}{" "}
            </div>{" "}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {" "}
                <div className="xl:col-span-2 glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
                    {" "}
                    <div className="flex items-end justify-between mb-6">
                        {" "}
                        <div>
                            {" "}
                            <h3 className="font-semibold"> Message Velocity </h3>{" "}
                            <p className="text-xs text-muted-foreground">
                                {" "}
                                Last 7 days{" "}
                            </p>{" "}
                        </div>{" "}
                        <div className="flex gap-1 text-[11px] font-medium">
                            {" "}
                            <button className="px-3 py-1 rounded-full bg-foreground text-background">
                                {" "}
                                7D{" "}
                            </button>{" "}
                            <button className="px-3 py-1 rounded-full text-muted-foreground hover:bg-muted">
                                {" "}
                                30D{" "}
                            </button>{" "}
                            <button className="px-3 py-1 rounded-full text-muted-foreground hover:bg-muted">
                                {" "}
                                90D{" "}
                            </button>{" "}
                        </div>{" "}
                    </div>{" "}
                    <div className="h-72">
                        {" "}
                        <ResponsiveContainer>
                            {" "}
                            <AreaChart data={data}>
                                {" "}
                                <defs>
                                    {" "}
                                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                        {" "}
                                        <stop
                                            offset="0%"
                                            stopColor="oklch(0.58 0.22 265)"
                                            stopOpacity={0.4}
                                        />{" "}
                                        <stop
                                            offset="100%"
                                            stopColor="oklch(0.58 0.22 265)"
                                            stopOpacity={0}
                                        />{" "}
                                    </linearGradient>{" "}
                                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                                        {" "}
                                        <stop
                                            offset="0%"
                                            stopColor="oklch(0.55 0.25 300)"
                                            stopOpacity={0.35}
                                        />{" "}
                                        <stop
                                            offset="100%"
                                            stopColor="oklch(0.55 0.25 300)"
                                            stopOpacity={0}
                                        />{" "}
                                    </linearGradient>{" "}
                                </defs>{" "}
                                <CartesianGrid
                                    stroke="oklch(0.92 0.012 260)"
                                    vertical={false}
                                />{" "}
                                <XAxis
                                    dataKey="d"
                                    stroke="oklch(0.5 0.03 260)"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                />{" "}
                                <YAxis
                                    stroke="oklch(0.5 0.03 260)"
                                    tickLine={false}
                                    axisLine={false}
                                    fontSize={12}
                                />{" "}
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: "1px solid oklch(0.92 0.012 260)",
                                    }}
                                />{" "}
                                <Area
                                    type="monotone"
                                    dataKey="sent"
                                    stroke="oklch(0.58 0.22 265)"
                                    fill="url(#g1)"
                                    strokeWidth={2}
                                />{" "}
                                <Area
                                    type="monotone"
                                    dataKey="read"
                                    stroke="oklch(0.55 0.25 300)"
                                    fill="url(#g2)"
                                    strokeWidth={2}
                                />{" "}
                            </AreaChart>{" "}
                        </ResponsiveContainer>{" "}
                    </div>{" "}
                </div>{" "}
                <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
                    {" "}
                    <div className="flex items-center justify-between mb-4">
                        {" "}
                        <h3 className="font-semibold"> Recent Campaigns </h3>{" "}
                        <a className="text-xs font-medium text-brand-blue flex items-center gap-1 cursor-pointer">
                            {" "}
                            View all <ArrowUpRight className="size-3" />{" "}
                        </a>{" "}
                    </div>{" "}
                    <div className="space-y-3">
                        {" "}
                        {[
                            {
                                name: "Summer Special 20% Off",
                                status: "Sending",
                                color: "bg-brand-blue",
                                pct: 64,
                            },
                            {
                                name: "Appointment Reminders",
                                status: "Delivered",
                                color: "bg-brand-green",
                                pct: 100,
                            },
                            {
                                name: "Loyalty Reward — VIPs",
                                status: "Scheduled",
                                color: "bg-brand-purple",
                                pct: 0,
                            },
                            {
                                name: "Feedback Request",
                                status: "Delivered",
                                color: "bg-brand-green",
                                pct: 100,
                            },
                        ].map((c) => (
                            <div
                                key={c.name}
                                className="p-3 rounded-xl border border-border hover:bg-muted/50 transition"
                            >
                                {" "}
                                <div className="flex items-center justify-between mb-2">
                                    {" "}
                                    <span className="text-sm font-medium"> {c.name} </span>{" "}
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                        {" "}
                                        {c.status}{" "}
                                    </span>{" "}
                                </div>{" "}
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    {" "}
                                    <div
                                        className={`${c.color} h-full`}
                                        style={{ width: `${c.pct}%` }}
                                    />{" "}
                                </div>{" "}
                            </div>
                        ))}{" "}
                    </div>{" "}
                </div>{" "}
            </div>{" "}
        </>
    );
}
