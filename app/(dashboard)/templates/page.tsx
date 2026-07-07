"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    RefreshCw,
    LayoutGrid,
} from "lucide-react";

import TemplateCard from "@/components/templates/TemplateCard";
import TemplateEditorModal from "@/components/templates/TemplateEditorModal";
import TemplatePreviewModal from "@/components/templates/TemplatePreviewModal";
import { TooltipProvider } from "@/components/ui/tooltip";
interface Template {

    id: string;

    name: string;

    language: string;

    category: string;

    status: string;

    body: string;

    headerType?: string;

    headerText?: string;

    headerImage?: string;

    sampleMediaPath?: string;
    sampleMediaName?: string;
    sampleMediaType?: string;

    footer?: string;

    buttons?: {
        type: string;
        text: string;
    }[];

}

export default function TemplatesPage() {

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const [templates, setTemplates] = useState<Template[]>([]);

    const [search, setSearch] = useState("");

    const [category, setCategory] = useState("ALL");
    const [status, setStatus] = useState("ALL");

    const [editorOpen, setEditorOpen] = useState(false);

    const [selectedTemplate, setSelectedTemplate] =
        useState<Template | null>(null);
    const [previewOpen, setPreviewOpen] =
        useState(false);

    const [previewTemplate, setPreviewTemplate] =
        useState<Template | null>(null);

    const [deleteOpen, setDeleteOpen] =
        useState(false);

    const [deleteTemplate, setDeleteTemplate] =
        useState<Template | null>(null);

    const [deleting, setDeleting] =
        useState(false);
    const [submitOpen, setSubmitOpen] = useState(false);
    const [submitTemplate, setSubmitTemplate] = useState<Template | null>(null);
    //--------------------------------------------------------
    // Load Templates
    //--------------------------------------------------------

    const loadTemplates = useCallback(async () => {

        try {

            setLoading(true);

            const res = await fetch(
                "/api/templates/status"
            );

            const json = await res.json();
            console.log("API JSON", json);
            if (!json.success) return;

            setTemplates(json.templates ?? []);

        } finally {

            setLoading(false);

        }

    }, []);

    //--------------------------------------------------------
    // Sync Meta
    //--------------------------------------------------------

    const syncTemplates = useCallback(async () => {

        try {

            setSyncing(true);

            const res = await fetch(
                "/api/templates/sync",
                {
                    method: "POST",
                }
            );

            const json = await res.json();

            if (
                json.success &&
                json.changed
            ) {

                await loadTemplates();

            }

        } catch (err) {

            console.error(err);

        } finally {

            setSyncing(false);

        }

    }, [loadTemplates]);

    useEffect(() => {
        let mounted = true;
        const initialize = async () => {
            await loadTemplates();
            if (!mounted) return;
            await syncTemplates();
        };
        initialize();
        return () => {
            mounted = false;
        };
    }, [
        loadTemplates,
        syncTemplates,
    ]);
    //--------------------------------------------------------
    // Dynamic Statuses
    //--------------------------------------------------------

    const statuses = useMemo(() => {

        const unique = new Set<string>();

        templates.forEach((t) => {

            unique.add(
                (t.status ?? "UNKNOWN")
                    .toUpperCase()
            );

        });

        return [
            "ALL",
            ...Array.from(unique).sort(),
        ];

    }, [templates]);

    //--------------------------------------------------------
    // Status Counts
    //--------------------------------------------------------

    const statusCounts = useMemo(() => {

        const counts: Record<string, number> = {};

        templates.forEach((t) => {

            const key =
                (t.status ?? "UNKNOWN")
                    .toUpperCase();

            counts[key] =
                (counts[key] ?? 0) + 1;

        });

        return counts;

    }, [templates]);

    //--------------------------------------------------------
    // Category Counts
    //--------------------------------------------------------

    const categoryCounts = useMemo(() => {

        const counts: Record<string, number> = {};

        templates.forEach((t) => {

            const key = t.category;

            counts[key] =
                (counts[key] ?? 0) + 1;

        });

        return counts;

    }, [templates]);
    //--------------------------------------------------------
    // Filtered Templates
    //--------------------------------------------------------

    const filteredTemplates =
        useMemo(() => {

            return templates.filter((t) => {

                const searchMatch =
                    t.name
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        ) ||

                    t.body
                        .toLowerCase()
                        .includes(
                            search.toLowerCase()
                        );

                const categoryMatch =
                    category === "ALL"
                        ? true
                        : t.category === category;
                const statusMatch =

                    status === "ALL"

                        ? true

                        : t.status === status;
                return (
                    searchMatch &&
                    categoryMatch &&
                    statusMatch
                );

            });

        }, [
            templates,
            search,
            category,
            status,
        ]);
    //--------------------------------------------------------
    // Delete Templates
    //--------------------------------------------------------
    const handleDelete = async () => {
        if (!deleteTemplate) return;
        try {
            setDeleting(true);
            const response =
                await fetch(
                    "/api/templates",
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({

                            id:
                                deleteTemplate.id,
                        }),
                    }
                );
            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message
                );
            }
            setDeleteOpen(false);
            setDeleteTemplate(null);
            await loadTemplates();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setDeleting(false);
        }
    };

    //--------------------------------------------------------
    // Submit Template
    //--------------------------------------------------------

    const [submitting, setSubmitting] =
        useState(false);

    const handleSubmit = async () => {

        if (!submitTemplate) return;

        try {

            setSubmitting(true);

            const response =
                await fetch(
                    "/api/templates/submit",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({

                            id: submitTemplate.id,

                        }),

                    }
                );

            const result =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    result.message
                );

            }

            setSubmitOpen(false);

            setSubmitTemplate(null);

            await syncTemplates();

        } catch (error: any) {

            alert(error.message);

        } finally {

            setSubmitting(false);

        }

    };

    //--------------------------------------------------------
    // Duplicate Template
    //--------------------------------------------------------

    const handleDuplicate = (
        template: Template
    ) => {

        //------------------------------------------------
        // Open editor with a copy
        // No DB save
        //------------------------------------------------

        setSelectedTemplate({

            ...template,

            id: "",

            status: "DRAFT",

            name: `${template.name}_copy_1`,

        });

        setEditorOpen(true);

    };
    //--------------------------------------------------------
    // Page
    //--------------------------------------------------------

    return (

        <div className="space-y-6">

            {/* Header */}

            <div className="flex items-center justify-between">

                <div>

                    <h1 className="text-3xl font-bold">
                        Message Templates
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Create, manage and sync WhatsApp templates.
                    </p>

                </div>

                <div className="flex items-center gap-2">

                    <button
                        onClick={syncTemplates}
                        className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                    >

                        <RefreshCw
                            className={`h-4 w-4 ${syncing
                                ? "animate-spin"
                                : ""
                                }`}
                        />

                        Sync Meta

                    </button>

                    <button
                        onClick={() => {

                            setSelectedTemplate(
                                null
                            );

                            setEditorOpen(
                                true
                            );

                        }}
                        className="flex items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2 text-sm font-medium text-white hover:bg-[#5148ff]"
                    >

                        <Plus className="h-4 w-4" />

                        Create Template

                    </button>

                </div>

            </div>

            {/* Search */}

            <div className="rounded-2xl border bg-white p-5">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="relative w-full md:w-96">

                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search templates..."
                            className="w-full rounded-xl border py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#635BFF]"
                        />

                    </div>
                    <div className="flex items-center gap-2">

                        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                            Category
                        </span>
                        <div className="flex gap-2 flex-wrap">

                            {[
                                "ALL",
                                "MARKETING",
                                "UTILITY",
                                "AUTHENTICATION",
                            ].map((item) => (

                                <button
                                    key={item}
                                    onClick={() =>
                                        setCategory(
                                            item
                                        )
                                    }
                                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${category ===
                                        item
                                        ? "bg-[#635BFF] text-white"
                                        : "border bg-white"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">

                                        <span>{item}</span>

                                        <span className="rounded-full bg-black/10 px-1.5 py-0 text-[9px]">

                                            {
                                                item === "ALL"
                                                    ? templates.length
                                                    : categoryCounts[item] ?? 0
                                            }
                                        </span>
                                    </div>
                                </button>
                            ))}

                        </div>
                    </div>
                </div>

            </div>

            {/* Grid */}

            <div className="flex flex-wrap items-center justify-between gap-4">

                <div className="flex items-center gap-2 text-sm font-medium text-gray-600">

                    <LayoutGrid className="h-4 w-4" />

                    {filteredTemplates.length} Templates

                </div>

                <div className="flex items-center gap-2">

                    <span className="text-sm font-medium text-gray-500">
                        Status
                    </span>

                    <div className="flex flex-wrap gap-2">

                        {statuses.map((item) => (

                            <button
                                key={item}
                                onClick={() => setStatus(item)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition ${status === item
                                    ? "bg-[#635BFF] text-white"
                                    : "border bg-white"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span>
                                        {
                                            item
                                                .toLowerCase()
                                                .replace(/\b\w/g, c => c.toUpperCase())
                                        }
                                    </span>

                                    <span className="rounded-full bg-black/10 px-1.5 py-0 text-[9px]">
                                        {
                                            item === "ALL"

                                                ? templates.length
                                                : statusCounts[item] ?? 0
                                        }

                                    </span>

                                </div>

                            </button>

                        ))}
                    </div>
                </div>

            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {loading ? (

                    <div className="col-span-full rounded-2xl border bg-white py-16 text-center">

                        <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#635BFF]" />

                        <p className="mt-4 text-sm text-gray-500">
                            Loading templates...
                        </p>

                    </div>

                ) : filteredTemplates.length === 0 ? (

                    <div className="col-span-full rounded-2xl border border-dashed bg-white py-20 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F3FF]">

                            <LayoutGrid className="h-8 w-8 text-[#635BFF]" />

                        </div>

                        <h3 className="mt-6 text-lg font-semibold">
                            No Templates Found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500">

                            Try changing your search or sync your Meta account.

                        </p>

                        <button
                            onClick={syncTemplates}
                            className="mt-6 rounded-xl bg-[#635BFF] px-5 py-2 text-sm font-medium text-white hover:bg-[#5148ff]"
                        >

                            Sync Templates

                        </button>

                    </div>

                ) : (
                    <TooltipProvider delayDuration={200}>
                        {filteredTemplates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onPreview={() => {
                                    setPreviewTemplate(template);
                                    setPreviewOpen(true);
                                }}
                                onEdit={() => {
                                    setSelectedTemplate(template);
                                    setEditorOpen(true);

                                }}
                                onDelete={() => {
                                    setDeleteTemplate(template);
                                    setDeleteOpen(true);
                                }}
                                onSubmit={() => {
                                    setSubmitTemplate(template);
                                    setSubmitOpen(true);
                                }}
                                onDuplicate={() => {
                                    handleDuplicate(
                                        template
                                    );
                                }}
                            />
                        ))}
                    </TooltipProvider>
                )}
            </div>

            <TemplateEditorModal
                open={editorOpen}
                template={selectedTemplate}
                onClose={() => {
                    setEditorOpen(false);
                    setSelectedTemplate(null);
                }}
                onSaved={async () => {

                    await loadTemplates();

                    await syncTemplates();

                }}
            />
            <TemplatePreviewModal
                open={previewOpen}
                template={previewTemplate}
                onClose={() => {
                    setPreviewOpen(false);
                    setPreviewTemplate(null);
                }}
            />
            {
                deleteOpen &&
                deleteTemplate && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                        <div className="w-[420px] rounded-3xl bg-white p-8 shadow-2xl">

                            <h2 className="text-xl font-semibold">

                                Delete Template

                            </h2>

                            <p className="mt-4 text-gray-600">

                                Are you sure you want to delete

                                <span className="font-semibold">

                                    {" "}
                                    {deleteTemplate.name}
                                    {" "}

                                </span>

                                ?

                            </p>

                            <p className="mt-2 text-sm text-red-500">

                                This action cannot be undone.

                            </p>

                            <div className="mt-8 flex justify-end gap-3">

                                <button

                                    onClick={() => {

                                        setDeleteOpen(false);

                                        setDeleteTemplate(null);

                                    }}

                                    className="rounded-xl border px-5 py-2"

                                >

                                    Cancel

                                </button>

                                <button

                                    onClick={handleDelete}

                                    disabled={deleting}

                                    className="rounded-xl bg-red-600 px-5 py-2 text-white hover:bg-red-700 disabled:opacity-50"

                                >

                                    {

                                        deleting

                                            ? "Deleting..."

                                            : "Delete"

                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )
            }
            {
                submitOpen &&
                submitTemplate && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

                        <div className="w-[440px] rounded-3xl bg-white p-8 shadow-2xl">

                            <h2 className="text-xl font-semibold">

                                Submit Template

                            </h2>

                            <p className="mt-4 text-gray-600">

                                Submit

                                <span className="font-semibold">

                                    {" "}
                                    {submitTemplate.name}
                                    {" "}

                                </span>

                                to Meta for approval?

                            </p>

                            <p className="mt-2 text-sm text-amber-600">

                                Once submitted, the template cannot be edited until Meta reviews it.

                            </p>

                            <div className="mt-8 flex justify-end gap-3">

                                <button

                                    onClick={() => {

                                        setSubmitOpen(false);

                                        setSubmitTemplate(null);

                                    }}

                                    className="rounded-xl border px-5 py-2"

                                >

                                    Cancel

                                </button>

                                <button

                                    onClick={handleSubmit}

                                    disabled={submitting}

                                    className="rounded-xl bg-[#25D366] px-5 py-2 text-white hover:bg-[#1fa855] disabled:opacity-50"

                                >

                                    {

                                        submitting

                                            ? "Submitting..."

                                            : "Submit"

                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                )
            }
        </div>

    );

}