'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/ui/page-header';
import {
    RefreshCw,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    ChevronRight,
    Upload,
    ImageIcon,
} from 'lucide-react';

type ActivityStatus = 'Sent' | 'Failed' | 'Pending';

const COUNTRY_CODES = [
    '+91', '+1', '+44', '+971', '+65', '+61', '+49', '+33', '+81', '+55',
];

const PAGE_SIZE = 10;

function formatMessagingLimit(limit?: string) {
    switch (limit) {
        case "TIER_250": return "250";
        case "TIER_1K": return "1,000";
        case "TIER_2K": return "2,000";
        case "TIER_10K": return "10,000";
        case "TIER_25K": return "25,000";
        case "TIER_50K": return "50,000";
        case "TIER_100K": return "100,000";
        case "TIER_UNLIMITED": return "Unlimited";
        default: return "-";
    }
}

function Skeleton({ className = "" }: { className?: string }) {
    return <span className={`inline-block animate-pulse rounded bg-gray-200 ${className}`} />;
}

function StatusBadge({ status }: { status: ActivityStatus }) {
    if (status === 'Sent') {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sent
            </span>
        );
    }
    if (status === 'Failed') {
        return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                <XCircle className="w-3.5 h-3.5" /> Failed
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Clock className="w-3.5 h-3.5" /> Pending
        </span>
    );
}

function WhatsAppIcon({ className = "w-8 h-8" }: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
            <path d="M19.11 17.32c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.47s1.07 2.85 1.22 3.05c.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
            <path d="M16 3C8.82 3 3 8.82 3 16c0 2.56.75 5.05 2.15 7.18L3 29l5.98-2.1A12.94 12.94 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-2.07 0-4.1-.56-5.86-1.63l-.42-.25-3.55 1.25 1.2-3.46-.28-.44A10.46 10.46 0 015.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5z" />
        </svg>
    );
}

export default function WhatsAppPage() {
    const [recipientNumber, setRecipientNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("en_US");
    const [sending, setSending] = useState(false);

    const [connection, setConnection] = useState<any>(null);
    const [statusLoaded, setStatusLoaded] = useState(false);
    const [activityLoaded, setActivityLoaded] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [activity, setActivity] = useState<any[]>([]);
    const [activityPage, setActivityPage] = useState(1);

    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
    const [headerImagePreview, setHeaderImagePreview] = useState<string>("");

    const currentTemplate = useMemo(
        () => templates.find((t: any) => t.name === selectedTemplate),
        [templates, selectedTemplate]
    );

    const templateVars = useMemo(() => {
        if (!currentTemplate?.body) return [];
        const matches = Array.from(
            currentTemplate.body.matchAll(/\{\{(\d+)\}\}/g)
        ).map((m: any) => m[1]);
        return [...new Set(matches)].sort((a: string, b: string) => Number(a) - Number(b));
    }, [currentTemplate]);

    const templateButtons = useMemo(() => {
        if (!currentTemplate?.buttons) return [];
        return Array.isArray(currentTemplate.buttons)
            ? currentTemplate.buttons
            : typeof currentTemplate.buttons === 'string'
                ? JSON.parse(currentTemplate.buttons)
                : [];
    }, [currentTemplate]);

    const isImageHeader = useMemo(
        () => (currentTemplate?.headerType ?? '').toUpperCase() === 'IMAGE',
        [currentTemplate]
    );

    useEffect(() => {
        setVariableValues({});
        setHeaderImageFile(null);
        setHeaderImagePreview("");
    }, [selectedTemplate]);

    const loadStatus = useCallback(async () => {
        const res = await fetch("/api/whatsapp/status");
        const json = await res.json();
        setStatusLoaded(true);
        if (!json.success) { setConnection(null); return; }
        setConnection(json.connection);
    }, []);

    const syncMeta = useCallback(async () => {
        try {
            const res = await fetch("/api/whatsapp/sync", { method: "POST" });
            const json = await res.json();
            setActivityLoaded(true);
            if (!json.success) return;
            setConnection(json.connection);
            setTemplates(json.templates);
            setActivity(json.activity);
        } catch (err) {
            console.error(err);
            setActivityLoaded(true);
        }
    }, []);

    const sendTestMessage = useCallback(async () => {
        if (!recipientNumber.trim() || sending) return;
        try {
            setSending(true);
            const components: any[] = [];

            if (isImageHeader && headerImageFile) {
                const formData = new FormData();
                formData.append("file", headerImageFile);
                const uploadRes = await fetch("/api/template-media", {
                    method: "POST",
                    body: formData,
                });
                const uploadJson = await uploadRes.json();
                if (uploadJson.success) {
                    components.push({
                        type: "header",
                        parameters: [{
                            type: "image",
                            image: { link: `${window.location.origin}${uploadJson.path}` },
                        }],
                    });
                }
            }

            if (templateVars.length > 0) {
                components.push({
                    type: "body",
                    parameters: templateVars.map((v: string) => ({
                        type: "text",
                        text: variableValues[v] || `{{${v}}}`,
                    })),
                });
            }

            const res = await fetch("/api/whatsapp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phoneNumber: `${countryCode}${recipientNumber}`,
                    templateName: selectedTemplate,
                    language: selectedLanguage,
                    components: components.length > 0 ? components : undefined,
                }),
            });
            const json = await res.json();
            if (!json.success) throw new Error(json.message);
            await syncMeta();
            alert("Message submitted to WhatsApp. Check Recent Activity for delivery status.");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSending(false);
        }
    }, [
        recipientNumber, countryCode, selectedTemplate, selectedLanguage,
        sending, syncMeta, isImageHeader, headerImageFile, templateVars, variableValues,
    ]);

    useEffect(() => {
        loadStatus();
        syncMeta();
    }, [loadStatus, syncMeta]);

    const totalPages = Math.max(1, Math.ceil(activity.length / PAGE_SIZE));
    const paginatedActivity = activity.slice(
        (activityPage - 1) * PAGE_SIZE,
        activityPage * PAGE_SIZE
    );

    const formatTs = (ts: string) => {
        const d = new Date(ts);
        return d.toLocaleString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    };

    const selectClass =
        'w-full h-11 px-3 border border-border rounded-lg text-sm bg-white text-foreground focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 transition-all appearance-none cursor-pointer';

    const qualityColor = () => {
        if (!connection?.qualityRating) return '';
        const r = connection.qualityRating.toUpperCase();
        if (r === 'GREEN') return 'bg-green-100 text-green-700';
        if (r === 'YELLOW') return 'bg-yellow-100 text-yellow-700';
        if (r === 'RED') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen">
            <div className="space-y-6">
                <PageHeader
                    eyebrow="Integration"
                    title="WhatsApp Cloud API"
                    description="Manage your WhatsApp Business connection and test message delivery."
                />

                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="glass rounded-2xl px-6 py-4 shadow-[var(--shadow-card)]"
                >
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3 flex flex-col justify-center pl-4">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                WhatsApp Number
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[15px] font-semibold whitespace-nowrap">
                                    {!statusLoaded ? <Skeleton className="h-4 w-32" /> : connection?.phoneNumber ?? "-"}
                                </span>
                                {!statusLoaded ? (
                                    <Skeleton className="h-3 w-16" />
                                ) : (
                                    <span className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${connection?.connected ? "text-emerald-600" : "text-gray-400"}`}>
                                        <span className={`h-2 w-2 rounded-full ${connection?.connected ? "bg-emerald-500" : "bg-gray-300"}`} />
                                        {connection?.connected ? "Connected" : "-"}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="col-span-3 flex flex-col justify-center pl-3">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Business Account
                            </div>
                            <div className="text-base font-semibold leading-6">
                                {!statusLoaded ? <Skeleton className="h-4 w-40" /> : connection?.businessName ?? "-"}
                            </div>
                        </div>

                        <div className="col-span-3 flex flex-col justify-center pl-3">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Quality Rating
                            </div>
                            {!statusLoaded ? (
                                <Skeleton className="h-6 w-16 rounded-full" />
                            ) : connection?.qualityRating ? (
                                <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${qualityColor()}`}>
                                    {connection.qualityRating}
                                </span>
                            ) : (
                                <span className="text-base font-semibold">-</span>
                            )}
                        </div>

                        <div className="col-span-3 flex flex-col justify-center pl-3">
                            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Daily Messaging Limit
                            </div>
                            <div className="text-base font-semibold leading-6">
                                {!statusLoaded ? <Skeleton className="h-4 w-12" /> : formatMessagingLimit(connection?.messagingLimit)}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-[1.05fr_0.95fr] gap-6 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.08 }}
                        className="glass rounded-2xl p-6 shadow-[var(--shadow-card)]"
                    >
                        <h2 className="text-[15px] font-semibold text-foreground mb-1">Send Test Message</h2>
                        <p className="text-gray-400 text-sm mb-5">Send a test message using an approved template to verify delivery.</p>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Recipient Number</label>
                            <div className="flex gap-2">
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="h-11 pl-3 pr-8 border border-border rounded-lg text-sm bg-white appearance-none cursor-pointer"
                                >
                                    {COUNTRY_CODES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    value={recipientNumber}
                                    onChange={(e) => setRecipientNumber(e.target.value)}
                                    placeholder="Enter 10 digit WhatsApp number"
                                    className="flex-1 h-11 px-3 border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-brand-blue"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">Example: 9876543210</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Template</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="">Select a template</option>
                                    {templates.map((t: any) => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Language</label>
                                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className={selectClass}>
                                    <option value="en_US">English (en_US)</option>
                                </select>
                            </div>
                        </div>

                        {isImageHeader && (
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">Header Image</label>
                                {headerImagePreview ? (
                                    <div className="flex items-center gap-3 rounded-lg border border-dashed p-3 bg-gray-50">
                                        <img src={headerImagePreview} className="h-12 w-12 rounded object-cover border" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-700 truncate">{headerImageFile?.name}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setHeaderImageFile(null); setHeaderImagePreview(""); }}
                                            className="text-xs text-red-500"
                                        >Remove</button>
                                    </div>
                                ) : (
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed p-3 bg-gray-50 hover:bg-gray-100 transition">
                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                        <span className="text-xs text-gray-500">Upload header image</span>
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

                        {templateVars.length > 0 && (
                            <div className="mb-4 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-[11px] font-medium text-amber-700">Variable values</p>
                                {templateVars.map((v: string) => (
                                    <div key={v} className="flex items-center gap-2">
                                        <span className="w-10 shrink-0 text-xs font-mono text-amber-600">{`{{${v}}}`}</span>
                                        <input
                                            value={variableValues[v] ?? ""}
                                            onChange={(e) => setVariableValues(prev => ({ ...prev, [v]: e.target.value }))}
                                            placeholder={`Value for {{${v}}}`}
                                            className="min-w-0 flex-1 rounded-md border bg-white px-2 py-1.5 text-xs"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {templateButtons.length > 0 && (
                            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                <p className="text-[11px] font-medium text-blue-700 mb-1.5">Action buttons in this template</p>
                                {templateButtons.map((btn: any, i: number) => {
                                    const t = (btn.type || '').toUpperCase();
                                    return (
                                        <div key={i} className="flex items-center gap-2 text-xs text-blue-600">
                                            <span className="font-medium">{t === 'URL' ? '🔗' : t === 'PHONE_NUMBER' ? '📞' : '↩️'}</span>
                                            <span>{btn.text || 'Button'}</span>
                                            {t === 'URL' && btn.url && <span className="text-gray-400 truncate">({btn.url})</span>}
                                            {t === 'PHONE_NUMBER' && btn.phoneNumber && <span className="text-gray-400">({btn.phoneNumber})</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Message Preview</label>
                            <div className="flex items-start justify-between rounded-xl border border-emerald-200 bg-[#E7FFEE] px-4 py-4">
                                <div className="flex-1 pr-3">
                                    {selectedTemplate ? (
                                        <>
                                            <div className="text-[10px] font-semibold uppercase text-emerald-700 mb-1.5">{selectedTemplate}</div>
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {(currentTemplate?.body || "No preview available.").replace(
                                                    /\{\{(\d+)\}\}/g,
                                                    (_: string, n: string) => variableValues[n] || `{{${n}}}`
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-sm text-gray-500">Select a template</div>
                                    )}
                                </div>
                                <div className="ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                                    <WhatsAppIcon className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={sending}
                            onClick={sendTestMessage}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#22C55E] px-6 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-60"
                        >
                            <Send className="h-4 w-4" />
                            <span>{sending ? "Sending..." : "Send Test Message"}</span>
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.14 }}
                        className="glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                            <div>
                                <h2 className="text-[15px] font-semibold text-foreground">Recent Activity</h2>
                                <p className="text-gray-400 text-xs mt-0.5">Message delivery attempts</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        {['Time', 'Recipient', 'Template', 'Status'].map((h, i) => (
                                            <th key={i} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {!activityLoaded ? (
                                        [1, 2, 3].map(i => (
                                            <tr key={i}>
                                                <td className="px-5 py-3"><Skeleton className="h-3 w-28" /></td>
                                                <td className="px-5 py-3"><Skeleton className="h-3 w-24" /></td>
                                                <td className="px-5 py-3"><Skeleton className="h-3 w-20" /></td>
                                                <td className="px-5 py-3"><Skeleton className="h-3 w-12" /></td>
                                            </tr>
                                        ))
                                    ) : paginatedActivity.length === 0 ? (
                                        <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">No activity yet</td></tr>
                                    ) : paginatedActivity.map((row: any) => (
                                        <tr key={row.id} className="hover:bg-muted/40 transition">
                                            <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTs(row.time)}</td>
                                            <td className="px-5 py-3 text-xs font-medium text-foreground">{row.recipient}</td>
                                            <td className="px-5 py-3">
                                                <code className="text-[11px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{row.template}</code>
                                            </td>
                                            <td className="px-5 py-3"><StatusBadge status={row.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
                                <span className="text-xs text-gray-400">
                                    Page {activityPage} of {totalPages}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={activityPage <= 1}
                                        onClick={() => setActivityPage(p => p - 1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                    ><ChevronLeft className="h-3.5 w-3.5" /></button>
                                    <button
                                        disabled={activityPage >= totalPages}
                                        onClick={() => setActivityPage(p => p + 1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-md border text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                                    ><ChevronRight className="h-3.5 w-3.5" /></button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
