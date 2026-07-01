'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import {
    RefreshCw,
    Send,
    CheckCircle2,
    Copy,
    Eye,
    EyeOff,
    Info,
    ExternalLink,
    MoreVertical,
    XCircle,
    FileText,
    BarChart2,
    Shield,
    Activity,
    Clock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type TemplateId =
    | 'hello_world'
    | 'marketing_offer'
    | 'appointment_reminder'
    | 'order_confirmation';

type ActivityStatus = 'Sent' | 'Failed' | 'Pending';

interface ApiResponseData {
    messageId: string;
    timestamp: string;
    latency: number;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const TEMPLATES: Record<TemplateId, { label: string; preview: string }> = {
    hello_world: {
        label: 'hello_world',
        preview: 'Hello 👋 This is a test message from Dispaz.',
    },
    marketing_offer: {
        label: 'marketing_offer',
        preview: 'Get 20% off your next purchase! Code: DISPAZ20',
    },
    appointment_reminder: {
        label: 'appointment_reminder',
        preview: 'Your appointment is scheduled for tomorrow at 10:00 AM.',
    },
    order_confirmation: {
        label: 'order_confirmation',
        preview: 'Your order #DZ-12345 has been confirmed!',
    },
};

const COUNTRY_CODES = [
    '+91', '+1', '+44', '+971', '+65', '+61', '+49', '+33', '+81', '+55',
];

const ACTIVITY_DATA: Array<{
    id: string;
    time: string;
    recipient: string;
    template: TemplateId;
    status: ActivityStatus;
    messageId: string;
}> = [
        {
            id: '1',
            time: '23 Jun 2026, 11:32 AM',
            recipient: '+91 98765 43210',
            template: 'hello_world',
            status: 'Sent',
            messageId: 'wamid.HBgLMTk2MzI0MDU5NTY4FQIAERUC',
        },
        {
            id: '2',
            time: '23 Jun 2026, 11:25 AM',
            recipient: '+91 98765 43210',
            template: 'hello_world',
            status: 'Sent',
            messageId: 'wamid.HBgLMTk2MzI0MDU5NTY0FQIAERUB',
        },
        {
            id: '3',
            time: '22 Jun 2026, 07:18 PM',
            recipient: '+91 98765 43210',
            template: 'hello_world',
            status: 'Failed',
            messageId: '-',
        },
        {
            id: '4',
            time: '22 Jun 2026, 07:10 PM',
            recipient: '+91 98765 43210',
            template: 'hello_world',
            status: 'Sent',
            messageId: 'wamid.HBgLMjM9OTc4ODI2FQIAERUA',
        },
    ];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ActivityStatus }) {
    if (status === 'Sent') {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Sent
            </span>
        );
    }
    if (status === 'Failed') {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                <XCircle className="w-3.5 h-3.5" />
                Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            Pending
        </span>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
            {children}
        </div>
    );
}

function WhatsAppIcon({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            className={className}
        >
            <path d="M19.11 17.32c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.47s1.07 2.85 1.22 3.05c.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
            <path d="M16 3C8.82 3 3 8.82 3 16c0 2.56.75 5.05 2.15 7.18L3 29l5.98-2.1A12.94 12.94 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-2.07 0-4.1-.56-5.86-1.63l-.42-.25-3.55 1.25 1.2-3.46-.28-.44A10.46 10.46 0 015.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5z" />
        </svg>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WhatsAppPage() {
    const [recipientNumber, setRecipientNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [template, setTemplate] = useState<TemplateId>('hello_world');
    const [language, setLanguage] = useState('en_US');
    const [sending, setSending] = useState(false);
    const [apiResponse, setApiResponse] = useState<ApiResponseData>({
        messageId: 'wamid.HBgLMTk2MzI0MDU5NTY4FQIAERUC',
        timestamp: '2026-06-23T11:32:00',
        latency: 612,
    });
    const [showToken, setShowToken] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [copiedMsgId, setCopiedMsgId] = useState(false);

    const handleCopyMsgId = useCallback(() => {
        navigator.clipboard.writeText(apiResponse.messageId);
        setCopiedMsgId(true);
        setTimeout(() => setCopiedMsgId(false), 2000);
    }, [apiResponse.messageId]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await new Promise((r) => setTimeout(r, 1400));
        setRefreshing(false);
    }, []);

    const handleSend = useCallback(async () => {
        if (!recipientNumber.trim() || sending) return;
        setSending(true);
        await new Promise((r) => setTimeout(r, 1600));
        const latency = Math.floor(Math.random() * 300) + 400;
        setApiResponse({
            messageId: `wamid.HBgL${Math.random().toString(36).substring(2, 8).toUpperCase()}RQIAER==`,
            timestamp: new Date().toISOString(),
            latency,
        });
        setSending(false);
    }, [recipientNumber, sending]);

    const formatTs = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const selectClass =
        'w-full h-12 px-3 border border-border rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all appearance-none cursor-pointer';

    return (
        <div className="min-h-screen">
            <div className="space-y-6">
                {/* ── Header ─────────────────────────────────────────────────────── */}
                <PageHeader
                    eyebrow="Integration"
                    title="WhatsApp Cloud API"
                    description="Manage your WhatsApp Business connection and test message delivery."
                    actions={
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="px-4 py-2 rounded-xl border border-border bg-background text-sm font-semibold shadow-[var(--shadow-card)] hover:bg-muted transition flex items-center gap-2"
                        >
                            <RefreshCw
                                className={`size-4 ${refreshing
                                    ? "animate-spin text-brand-blue"
                                    : "text-muted-foreground"
                                    }`}
                            />
                            Refresh Status
                        </motion.button>
                    }
                />

                {/* Connection Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="glass rounded-2xl px-6 py-4 shadow-[var(--shadow-card)]"
                >

                    <div className="grid grid-cols-12 gap-4 items-center">

                        {/* WhatsApp Number */}
                        <div className="col-span-3 flex flex-col justify-center pl-4">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                WhatsApp Number
                            </div>

                            <div className="flex items-center gap-2">

                               {/*} <div
                                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]"
                                >
                                    <WhatsAppIcon className="h-4 w-4 text-white" />
                                </div> */}

                                <span className="text-[15px] font-semibold whitespace-nowrap">
                                    +91 98765 43210
                                </span>

                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 whitespace-nowrap">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Connected
                                </span>

                            </div>
                        </div>

                        {/* Business Account */}
                        <div className="col-span-3 flex flex-col justify-center pl-3">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Business Account
                            </div>

                            <div className="text-base font-semibold leading-6">
                                Dispaz
                            </div>
                        </div>

                        {/* Quality Rating */}
                        <div className="col-span-3 flex flex-col justify-center pl-3">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Quality Rating
                            </div>

                            <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                High
                            </span>
                        </div>

                        {/* Daily Messaging Limit */}
                        <div className="col-span-3 flex flex-col justify-center pl-3">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Daily Messaging Limit
                            </div>

                            <div className="text-base font-semibold leading-6">
                                1,000 conversations/day
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* ── 2-Column Grid ────────────────────────────────────────────── */}
                <div className="grid grid-cols-[1.05fr_0.95fr] gap-6 items-start">
                    {/* LEFT: Send Test + Recent Activity */}

                    {/* Send Test Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.08 }}
                        className="glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
                        <h2 className="text-[15px] font-semibold text-foreground mb-1">
                            Send Test Message
                        </h2>
                        <p className="text-gray-400 text-sm mb-5">
                            Send a test message using an approved template to verify delivery.
                        </p>

                        {/* Recipient */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Number
                            </label>
                            <div className="flex gap-2">
                                <div className="relative">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="h-12 pl-3 pr-8 border border-border rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 appearance-none cursor-pointer"
                                    >
                                        {COUNTRY_CODES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    type="tel"
                                    value={recipientNumber}
                                    onChange={(e) => setRecipientNumber(e.target.value)}
                                    placeholder="Enter 10 digit WhatsApp number"
                                    className="flex-1 h-12 px-3.5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1.5">Example: 9876543210</p>
                        </div>

                        {/* Template + Language */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template
                                </label>
                                <div className="relative">
                                    <select
                                        value={template}
                                        onChange={(e) => setTemplate(e.target.value as TemplateId)}
                                        className={selectClass}
                                    >
                                        {(Object.keys(TEMPLATES) as TemplateId[]).map((k) => (
                                            <option key={k} value={k}>{TEMPLATES[k].label}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <div className="relative">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="en_US">English (en_US)</option>
                                        <option value="hi_IN">Hindi (hi_IN)</option>
                                        <option value="es_ES">Spanish (es_ES)</option>
                                    </select>
                                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Message Preview */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message Preview
                            </label>
                            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-[#E7FFEE] px-5 py-6">
                                <span className="text-[13.5px] text-gray-700">
                                    {TEMPLATES[template].preview}
                                </span>
                                <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                                    <WhatsAppIcon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Send Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={sending}
                            onClick={handleSend}
                            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#22C55E] px-6 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send className="relative -top-[1px] h-4 w-4 flex-shrink-0" />

                            <span>Send Test Message</span>
                        </motion.button>
                    </motion.div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.14 }}
                        className="glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                            <div>
                                <h2 className="text-[15px] font-semibold text-foreground">Recent Activity</h2>
                                <p className="text-gray-400 text-sm mt-0.5">
                                    All message delivery attempts and their status
                                </p>
                            </div>
                            <button className="text-sm font-medium text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-4 py-1.5 rounded-lg transition-colors">
                                View All Logs
                            </button>
                        </div>

                        <div className="max-h-[540px] overflow-y-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        {['Time', 'Recipient', 'Template', 'Status', 'Message ID', ''].map((h, i) => (
                                            <th
                                                key={i}
                                                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {ACTIVITY_DATA.map((row, i) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-muted/40 transition"
                                            style={{ animation: `fadeIn 0.25s ease both ${i * 0.06}s` }}
                                        >
                                            <td className="px-5 py-3.5 text-[12.5px] text-muted-foreground whitespace-nowrap">
                                                {row.time}
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] font-medium text-foreground">
                                                {row.recipient}
                                            </td>
                                            <td className="px-6 py-5">
                                                <code className="text-[12px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                    {row.template}
                                                </code>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="px-5 py-3.5 max-w-[180px]">
                                                <span className="text-[11.5px] font-mono text-muted-foreground truncate block">
                                                    {row.messageId}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <button className="text-gray-300 hover:text-muted-foreground transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
