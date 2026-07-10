"use client";

import { useState } from "react";
import {
    Eye,
    Pencil,
    MoreVertical,
    MessageSquare,
    Globe,
    Tag,
    Trash2,
    Send,
    Copy,
    Image as ImageIcon,
    Type,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TemplateButton {
    type: string;
    text: string;
}

export interface TemplateCardModel {
    id: string;
    name: string;
    category: string;
    language: string;
    status: string;
    body: string;

    headerType?: string;
    headerText?: string;
    headerImage?: string;

    footer?: string;

    buttons?: TemplateButton[];
    rejectedReason?: string | null;
}

interface Props {

    template: TemplateCardModel;

    onPreview: () => void;

    onEdit: () => void;

    onDelete: () => void;

    onDuplicate?: () => void;
    onSubmit: () => void;

}

export default function TemplateCard({

    template,

    onPreview,

    onEdit,

    onDelete,

    onDuplicate,
    onSubmit,

}: Props) {

    const [menuOpen, setMenuOpen] =
        useState(false);
    const status =
        template.status?.toUpperCase() ?? "UNKNOWN";
    const badgeColor = () => {

        switch (
        template.category.toUpperCase()
        ) {

            case "MARKETING":
                return "bg-purple-100 text-purple-700";

            case "UTILITY":
                return "bg-blue-100 text-blue-700";

            case "AUTHENTICATION":
                return "bg-orange-100 text-orange-700";

            default:
                return "bg-gray-100 text-gray-700";
        }

    };

    return (

        <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#635BFF] hover:shadow-lg">

            {/* Header */}

            {/* Header */}

            <div className="flex items-start justify-between border-b px-6 py-5">

                <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between">

                        <h3 className="truncate text-lg font-semibold">

                            {template.name}

                        </h3>

                        <div className="ml-4 flex items-center gap-3">

                            <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "APPROVED"
                                    ? "bg-green-100 text-green-700"
                                    : status === "PENDING"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : status === "REJECTED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {status}
                            </span>

                        </div>

                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${badgeColor()}`}
                        >
                            {template.category}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">

                            <Globe className="h-3.5 w-3.5" />

                            {template.language}

                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">

                            {(() => {
                                const ht = (template.headerType ?? "NONE").toUpperCase();
                                if (ht === "IMAGE") return (
                                    <><ImageIcon className="h-3 w-3" /> Image</>
                                );
                                if (ht === "TEXT" || ht === "HEADER") return (
                                    <><Type className="h-3 w-3" /> Text</>
                                );
                                return "None";
                            })()}

                        </span>

                    </div>

                    {status === "REJECTED" && template.rejectedReason && (
                        <p className="mt-2 line-clamp-2 text-xs text-red-500">
                            Reason: {template.rejectedReason}
                        </p>
                    )}

                </div>

            </div>

            {/* Message Preview */}

            <div className="bg-[#F7F8FA] px-6 py-5">

                <div className="mb-3 flex items-center gap-2">

                    <MessageSquare className="h-4 w-4 text-gray-400" />

                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">

                        Message Preview

                    </span>

                </div>

                <div className="flex h-[210px] flex-col rounded-2xl border border-gray-200 bg-white p-4 overflow-hidden">

                    {template.headerText && (

                        <div className="mb-2 font-semibold text-gray-900">

                            {template.headerText}

                        </div>

                    )}

                    <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-gray-700">

                        {template.body ||
                            "No template content available."}

                    </p>

                    {template.footer && (

                        <div className="mt-auto border-t border-gray-200 pt-3 text-xs text-gray-400">

                            {template.footer}

                        </div>

                    )}

                </div>
            </div>

            <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">

                <div className="flex items-center gap-2">

                    {/* Preview */}

                    <Tooltip>

                        <TooltipTrigger asChild>

                            <button
                                onClick={onPreview}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white transition hover:border-[#635BFF] hover:text-[#635BFF]"
                            >
                                <Eye className="h-4 w-4" />
                            </button>

                        </TooltipTrigger>

                        <TooltipContent>

                            Preview

                        </TooltipContent>

                    </Tooltip>

                    {/* Draft or Rejected — Edit */}

                    {(status === "DRAFT" || status === "REJECTED") && (

                        <Tooltip>

                            <TooltipTrigger asChild>

                                <button
                                    onClick={onEdit}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#635BFF] text-white transition hover:bg-[#5148ff]"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>

                            </TooltipTrigger>

                            <TooltipContent>

                                Edit

                            </TooltipContent>

                        </Tooltip>

                    )}

                    {/* Approved — Duplicate */}

                    {status === "APPROVED" && (

                        <Tooltip>

                            <TooltipTrigger asChild>

                                <button
                                    onClick={onDuplicate}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#635BFF] text-white transition hover:bg-[#5148ff]"
                                >
                                    <Copy className="h-4 w-4" />
                                </button>

                            </TooltipTrigger>

                            <TooltipContent>

                                Duplicate

                            </TooltipContent>

                        </Tooltip>

                    )}

                </div>

                {/* Delete - right side with confirmation */}

                <Tooltip>

                    <TooltipTrigger asChild>

                        <button
                            onClick={() => {
                                if (window.confirm(`Delete "${template.name}"? This cannot be undone.`)) {
                                    onDelete();
                                }
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>

                    </TooltipTrigger>

                    <TooltipContent>

                        Delete

                    </TooltipContent>

                </Tooltip>

            </div>

            {/* More Menu */}

            {menuOpen && (

                <div className="absolute right-5 top-16 z-20 w-52 overflow-hidden rounded-2xl border bg-white shadow-xl">

                    <button
                        onClick={() => {

                            setMenuOpen(false);

                            onPreview();

                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
                    >

                        <Eye className="h-4 w-4 text-gray-500" />

                        Preview

                    </button>

                    <button
                        onClick={() => {

                            setMenuOpen(false);

                            onEdit();

                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
                    >

                        <Pencil className="h-4 w-4 text-gray-500" />

                        Edit Template

                    </button>

                    <button
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
                    >

                        <Tag className="h-4 w-4 text-gray-500" />

                        Duplicate

                    </button>

                    <div className="border-t" />

                    <button
                        onClick={() => {
                            setMenuOpen(false);
                            onDelete();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                    </button>
                </div>
            )}
        </div>

    );

}