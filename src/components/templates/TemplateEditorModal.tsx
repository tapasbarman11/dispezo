"use client";

import { useEffect, useRef, useState } from "react";
import {
    X,
    Upload,
    ImageIcon,
    Type,
    FileText,
    Trash2,
} from "lucide-react";
import WhatsAppPreview from "./WhatsAppPreview";
import { BRAND } from "@/config/branding";
interface TemplateButton {
    type: string;
    text: string;
    url?: string;
    phoneNumber?: string;
}

export interface TemplateModel {

    id?: string;

    name: string;

    category: string;

    language: string;

    headerType?: string;

    headerText?: string;

    headerImage?: string;          // Preview only

    sampleMediaPath?: string;
    sampleMediaName?: string;
    sampleMediaType?: string;

    body: string;

    footer?: string;

    buttons?: TemplateButton[];

    variableSamples?: Record<string, string> | null;

}

interface Props {

    open: boolean;

    template: TemplateModel | null;

    onClose: () => void;

    onSaved: () => void;

}

const languages = [

    "en_US",

];

const categories = [

    "MARKETING",
    "UTILITY",
    "AUTHENTICATION",

];

const headerTypes = [

    "NONE",
    "TEXT",
    "IMAGE",

];

export default function TemplateEditorModal({

    open,

    template,

    onClose,

    onSaved,

}: Props) {

    const [saving, setSaving] =
        useState(false);
    const [submitting, setSubmitting] =
        useState(false);

    const [isDirty, setIsDirty] =
        useState(false);

    const [name, setName] =
        useState("");

    const [category, setCategory] =
        useState("MARKETING");

    const [language, setLanguage] =
        useState("en_US");

    const [headerType, setHeaderType] =
        useState("NONE");

    const [headerText, setHeaderText] =
        useState("");

    const [headerImage, setHeaderImage] = useState("");

    const [sampleMediaPath, setSampleMediaPath] = useState("");
    const [sampleMediaName, setSampleMediaName] = useState("");
    const [sampleMediaType, setSampleMediaType] = useState("");

    // The image path already persisted in the DB when the editor opened.
    // This file is NEVER deleted on Cancel. It is only deleted on Save,
    // and only if the user replaced or removed it.
    const [initialMediaPath, setInitialMediaPath] = useState("");

    // Every file uploaded during THIS editing session. Used to clean up
    // throwaway uploads on Cancel, and orphaned uploads on Save.
    const sessionUploadsRef = useRef<string[]>([]);

    // Ref to the body textarea so variables insert at the cursor.
    const bodyRef = useRef<HTMLTextAreaElement>(null);

    const [uploadingImage, setUploadingImage] = useState(false);

    const [body, setBody] =
        useState("");

    // Sample values for body variables {{1}}, {{2}} etc.
    // Key is the variable number string, value is the sample text.
    const [variableSamples, setVariableSamples] =
        useState<Record<string, string>>({});

    const [footer, setFooter] =
        useState("");

    console.log("Template buttons:");
    console.log(template?.buttons);
    console.log(typeof template?.buttons);
    console.log(Array.isArray(template?.buttons));

    const [buttons, setButtons] =
        useState<TemplateButton[]>([]);

    //-----------------------------------------------------
    // Edit Mode
    //-----------------------------------------------------

    useEffect(() => {

        // A fresh editor session starts with no tracked uploads.
        sessionUploadsRef.current = [];

        if (!template) {

            setName("");

            setCategory("MARKETING");

            setLanguage("en_US");

            setHeaderType("NONE");

            setHeaderText("");

            setHeaderImage("");

            // No media on a brand-new template.
            setSampleMediaPath("");
            setSampleMediaName("");
            setSampleMediaType("");
            setInitialMediaPath("");

            setBody("");

            setVariableSamples({});

            setFooter("");

            setButtons([]);

            setIsDirty(false);

            return;

        }

        setName(template.name);

        setCategory(template.category);

        setLanguage(template.language);

        setHeaderType(
            template.headerType ??
            "NONE"
        );

        setHeaderText(
            template.headerText ??
            ""
        );

        setSampleMediaPath(template.sampleMediaPath ?? "");
        setSampleMediaName(template.sampleMediaName ?? "");
        setSampleMediaType(template.sampleMediaType ?? "");

        // Remember the persisted image so Cancel never deletes it.
        setInitialMediaPath(template.sampleMediaPath ?? "");

        setHeaderImage(
            template.sampleMediaPath ?? ""
        );

        setBody(
            template.body
        );

        setVariableSamples(
            template.variableSamples ?? {}
        );

        setFooter(
            template.footer ??
            ""
        );

        setButtons(
            Array.isArray(template.buttons)
                ? template.buttons
                : typeof template.buttons === "string"
                    ? JSON.parse(template.buttons)
                    : []
        );
        setIsDirty(false);

    }, [template]);

    //-----------------------------------------------------
    // Insert next {{n}} variable at the cursor in the body
    //-----------------------------------------------------

    function insertVariable() {

        const existing = Array.from(
            body.matchAll(/\{\{(\d+)\}\}/g)
        ).map((m) => Number(m[1]));

        const next =
            (existing.length ? Math.max(...existing) : 0) + 1;

        const token = `{{${next}}}`;

        const el = bodyRef.current;

        if (el && typeof el.selectionStart === "number") {

            const start = el.selectionStart;
            const end = el.selectionEnd;

            const newBody =
                body.slice(0, start) + token + body.slice(end);

            setBody(newBody);
            setIsDirty(true);

            requestAnimationFrame(() => {
                el.focus();
                const pos = start + token.length;
                el.setSelectionRange(pos, pos);
            });

        } else {

            setBody(body + token);
            setIsDirty(true);

        }

    }

    //-----------------------------------------------------
    // Delete a media file from disk (best-effort)
    //-----------------------------------------------------

    async function deleteMediaFile(imagePath: string) {

        if (!imagePath) return;

        try {

            await fetch("/api/template-media/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    imagePath
                })
            });

        } catch (err) {

            console.error("Failed to delete media file:", err);

        }

    }

    //-----------------------------------------------------
    // Upload Image
    //-----------------------------------------------------
    // We do NOT delete any previous file here. Cleanup is
    // centralized: Save keeps the current file and removes
    // the rest; Cancel removes everything uploaded this session.
    //-----------------------------------------------------

    async function uploadImage(file: File) {

        try {

            setUploadingImage(true);

            const formData = new FormData();

            formData.append("file", file);

            const res = await fetch("/api/template-media", {
                method: "POST",
                body: formData
            });

            const json = await res.json();

            if (!json.success) {

                throw new Error(json.message);
            }

            // Track this upload for later cleanup.
            sessionUploadsRef.current.push(json.path);

            setSampleMediaPath(json.path);
            setSampleMediaName(json.name);
            setSampleMediaType(json.type);

            // Preview
            setHeaderImage(json.path);

            setIsDirty(true);

        } catch (err: any) {

            alert(err.message);

        } finally {

            setUploadingImage(false);

        }

    }

    //-----------------------------------------------------
    // Remove Image (UI only)
    //-----------------------------------------------------
    // Clears the image from the form. The physical file and
    // DB are NOT touched here — they are reconciled on Save,
    // or cleaned up on Cancel.
    //-----------------------------------------------------

    function removeImage() {

        if (!sampleMediaPath) return;

        setSampleMediaPath("");
        setSampleMediaName("");
        setSampleMediaType("");

        setHeaderImage("");

        setIsDirty(true);

    }
    //-----------------------------------------------------
    // Validate Before Save
    //-----------------------------------------------------

    function validateBeforeSave(): string | null {

        if (!name.trim()) {
            return "Template name is required.";
        }

        // Meta requires lowercase, no spaces, underscores only
        if (!/^[a-z0-9_]+$/.test(name.trim())) {
            return "Template name must be lowercase letters, numbers, and underscores only (no spaces or special characters).";
        }

        if (!body.trim()) {
            return "Message body is required.";
        }

        if (body.length > 1024) {
            return `Message body exceeds 1024 characters (currently ${body.length}).`;
        }

        // An image-header template must have a sample image.
        if (headerType === "IMAGE" && !sampleMediaPath) {
            return "An image header requires a sample image. Please upload one or change the header type.";
        }

        // Footer max 60 chars
        if (footer && footer.length > 60) {
            return `Footer exceeds 60 characters (currently ${footer.length}).`;
        }

        // Validate variables are sequential: {{1}}, {{2}}, {{3}}…
        const varMatches = Array.from(
            body.matchAll(/\{\{(\d+)\}\}/g)
        ).map((m) => Number(m[1]));

        if (varMatches.length > 0) {
            const sorted = [...new Set(varMatches)].sort((a, b) => a - b);
            for (let i = 0; i < sorted.length; i++) {
                if (sorted[i] !== i + 1) {
                    return `Variables must be sequential starting from {{1}}. Found {{${sorted[i]}}} but expected {{${i + 1}}}.`;
                }
            }

            // Every variable must have a sample value
            for (const v of sorted) {
                if (!variableSamples[String(v)]?.trim()) {
                    return `Please provide a sample value for variable {{${v}}}. Meta requires sample data for every variable.`;
                }
            }
        }

        // Button validations
        if (buttons.length > 0) {
            const ctaCount = buttons.filter(
                (b) => ["URL", "PHONE_NUMBER"].includes((b.type || "").toUpperCase())
            ).length;
            const qrCount = buttons.filter(
                (b) => (b.type || "").toUpperCase() === "QUICK_REPLY"
            ).length;

            if (ctaCount > 2) {
                return "Maximum 2 call-to-action buttons allowed (Visit website + Call phone).";
            }
            if (qrCount > 3) {
                return "Maximum 3 quick reply buttons allowed.";
            }

            for (let i = 0; i < buttons.length; i++) {
                const b = buttons[i];
                const t = (b.type || "").toUpperCase();

                if (!b.text?.trim()) {
                    return `Button ${i + 1}: text is required.`;
                }
                if (b.text.length > 25) {
                    return `Button ${i + 1}: text exceeds 25 characters.`;
                }
                if (t === "URL" && !b.url?.trim()) {
                    return `Button ${i + 1} (Visit website): URL is required.`;
                }
                if (t === "URL" && b.url && !/^https?:\/\/.+/.test(b.url.trim())) {
                    return `Button ${i + 1}: URL must start with https:// or http://`;
                }
                if (t === "PHONE_NUMBER" && !b.phoneNumber?.trim()) {
                    return `Button ${i + 1} (Call phone): phone number is required. Enter with country code, e.g. 918939989397`;
                }
                if (t === "PHONE_NUMBER" && b.phoneNumber) {
                    const cleaned = b.phoneNumber.replace(/[\s\-()]/g, "");
                    if (cleaned.startsWith("+")) {
                        return `Button ${i + 1}: do not include "+" in the phone number. Enter country code directly, e.g. 918939989397`;
                    }
                    if (!/^\d{7,15}$/.test(cleaned)) {
                        return `Button ${i + 1}: phone number must be 7-15 digits with country code, e.g. 918939989397`;
                    }
                }
            }
        }

        return null;

    }

    //-----------------------------------------------------
    // Save Template
    //-----------------------------------------------------
    // Returns the saved template on success, or null if the
    // save was blocked (validation) or failed. Callers must
    // check the return value before closing the editor.
    //-----------------------------------------------------

    async function saveTemplate(refresh = true): Promise<any> {

        //-------------------------------------------------
        // Validation (blocks save, keeps editor open)
        //-------------------------------------------------

        const validationError = validateBeforeSave();

        if (validationError) {
            alert(validationError);
            return null;
        }

        //-------------------------------------------------
        // A duplicated / new template has no real id, so we
        // CREATE. An existing template has a real id, so we
        // UPDATE. An empty string is never a valid id.
        //-------------------------------------------------

        const existingId =
            template?.id && template.id.trim() !== ""
                ? template.id
                : undefined;

        try {

            setSaving(true);

            const res = await fetch(
                "/api/templates",
                {
                    method: existingId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({

                        id: existingId,

                        name,

                        category,

                        language,

                        headerType,

                        headerText,

                        headerImage,

                        body,

                        footer,

                        buttons,

                        // Send null (not "") when there is no image so the
                        // DB is cleared cleanly on removal.
                        sampleMediaPath: sampleMediaPath || null,
                        sampleMediaName: sampleMediaName || null,
                        sampleMediaType: sampleMediaType || null,

                        variableSamples,

                    }),
                }
            );

            const json = await res.json();

            if (!json.success) {

                throw new Error(
                    json.message
                );

            }

            const savedTemplate = json.template;

            //---------------------------------------------
            // Reconcile files now that the change is saved.
            // Keep the currently-saved file; delete every
            // other file uploaded this session, plus the old
            // persisted file if it was replaced or removed.
            //---------------------------------------------

            const keep = sampleMediaPath;

            for (const path of sessionUploadsRef.current) {
                if (path && path !== keep) {
                    await deleteMediaFile(path);
                }
            }

            if (initialMediaPath && initialMediaPath !== keep) {
                await deleteMediaFile(initialMediaPath);
            }

            sessionUploadsRef.current = [];
            setInitialMediaPath(keep);

            if (refresh) {
                onSaved();
            }

            setIsDirty(false);

            return savedTemplate;

        } catch (err: any) {

            alert(
                err.message
            );

            return null;

        } finally {

            setSaving(false);

        }

    }

    //-----------------------------------------------------
    // Close / Cancel
    //-----------------------------------------------------
    // Nothing is saved, so delete every file uploaded during
    // this session. The persisted file (initialMediaPath) is
    // left untouched so a saved template keeps its image.
    //-----------------------------------------------------

    async function handleClose() {

        if (isDirty) {

            const confirmed = window.confirm(
                "Discard unsaved changes?"
            );

            if (!confirmed) return;

        }

        for (const path of sessionUploadsRef.current) {
            if (path && path !== initialMediaPath) {
                await deleteMediaFile(path);
            }
        }

        sessionUploadsRef.current = [];

        onClose();

    }
    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div className="flex h-[92vh] w-[95vw] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* LEFT PANEL */}

                <div className="w-[58%] overflow-y-auto border-r">

                    {/* Header */}

                    <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">

                        <h2 className="text-lg font-bold">

                            {template
                                ? "Edit Template"
                                : "Create Template"}

                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">

                            Configure your WhatsApp message template.

                        </p>

                    </div>

                    {/* Form */}

                    <div className="space-y-3.5 px-6 py-5">
                        {/* Template Name */}

                        <div>

                            <label className="mb-1 block text-xs font-medium text-gray-600">

                                Template name

                            </label>

                            <input
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="appointment_confirmation"
                                className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:border-[#635BFF]"
                            />

                        </div>

                        {/* Category & Language */}

                        <div className="grid grid-cols-2 gap-4">

                            <div>

                                <label className="mb-1 block text-xs font-medium text-gray-600">

                                    Category

                                </label>

                                <select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >

                                    {categories.map((item) => (

                                        <option
                                            key={item}
                                            value={item}
                                        >

                                            {item}

                                        </option>

                                    ))}

                                </select>

                            </div>

                            <div>

                                <label className="mb-1 block text-xs font-medium text-gray-600">

                                    Language

                                </label>

                                <select
                                    value={language}

                                    onChange={(e) => {
                                        setLanguage(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    className="w-full rounded-lg border px-3 py-2 text-sm"
                                >

                                    {languages.map((item) => (

                                        <option
                                            key={item}
                                            value={item}
                                        >

                                            {item}

                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>

                        {/* Header Type */}

                        <div>

                            <label className="mb-1.5 block text-xs font-medium text-gray-600">

                                Header type

                            </label>

                            <div className="inline-flex gap-1 rounded-lg border bg-gray-50 p-1">

                                {headerTypes.map((item) => (

                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => {
                                            // Switching away from IMAGE: clear the
                                            // form's media fields. The actual file
                                            // deletion happens on Save (reconciliation)
                                            // or Cancel (session cleanup), so the user
                                            // can undo by switching back before saving.
                                            if (
                                                headerType === "IMAGE" &&
                                                item !== "IMAGE"
                                            ) {
                                                setSampleMediaPath("");
                                                setSampleMediaName("");
                                                setSampleMediaType("");
                                                setHeaderImage("");
                                            }
                                            setHeaderType(item);
                                            setIsDirty(true);
                                        }}
                                        className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${headerType === item
                                            ? "bg-[#635BFF] text-white"
                                            : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >

                                        {item.charAt(0) + item.slice(1).toLowerCase()}

                                    </button>

                                ))}

                            </div>

                        </div>

                        {/* Image Upload */}

                        {headerType === "IMAGE" && (

                            <div>

                                <label className="mb-1 block text-xs font-medium text-gray-600">

                                    Sample image <span className="font-normal text-gray-400">· required by Meta</span>

                                </label>

                                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">

                                    {headerImage ? (

                                        <div className="flex items-center gap-3">

                                            <img
                                                src={headerImage}
                                                className="h-12 w-12 rounded-lg border bg-white object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm text-gray-800">
                                                    {sampleMediaName || "Sample image"}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Uploaded
                                                </div>
                                            </div>

                                            <label
                                                htmlFor="template-image-upload"
                                                className="cursor-pointer text-sm font-medium text-[#635BFF] hover:underline"
                                            >
                                                Replace
                                            </label>

                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="text-sm font-medium text-red-500 hover:underline"
                                            >
                                                Remove
                                            </button>

                                            <input
                                                id="template-image-upload"
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    uploadImage(file);
                                                }}
                                            />

                                        </div>

                                    ) : (

                                        <div className="flex flex-col items-center gap-3 py-6 text-center">

                                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEEDFE] text-[#635BFF]">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>

                                            <p className="text-sm text-gray-500">

                                                Upload a sample image

                                            </p>

                                            <input
                                                id="template-image-upload"
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];

                                                    if (!file) return;

                                                    uploadImage(file);
                                                }}
                                            />

                                            <label
                                                htmlFor="template-image-upload"
                                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#635BFF] px-5 py-2 text-sm text-white hover:bg-[#5148ff]"
                                            >
                                                <Upload className="h-4 w-4" />

                                                {uploadingImage ? "Uploading..." : "Upload Image"}
                                            </label>

                                        </div>

                                    )}

                                </div>

                            </div>

                        )}

                        {/* Header Text — always shown, optional */}

                        <div>

                            <label className="mb-1 block text-xs font-medium text-gray-600">

                                Header text <span className="font-normal text-gray-400">(optional)</span>

                            </label>

                            <input
                                value={headerText}
                                onChange={(e) => {
                                    setHeaderText(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Appointment Reminder"
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />

                            {headerType === "IMAGE" && (
                                <p className="mt-1.5 text-xs text-gray-400">
                                    Image headers can’t also carry header text on WhatsApp, so this won’t be submitted to Meta for image templates.
                                </p>
                            )}

                        </div>

                        {/* Body */}

                        <div>

                            <div className="mb-1 flex items-center justify-between">

                                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">

                                    <FileText className="h-3.5 w-3.5" />

                                    Message body

                                </label>

                                <button
                                    type="button"
                                    onClick={insertVariable}
                                    className="rounded-md border border-[#635BFF] px-2.5 py-1 text-[11px] font-medium text-[#635BFF] hover:bg-[#F4F3FF]"
                                >
                                    {"+ Variable {{ }}"}
                                </button>

                            </div>

                            <textarea
                                ref={bodyRef}
                                rows={6}
                                value={body}

                                onChange={(e) => {
                                    setBody(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder={`Hi {{1}}, welcome to ${BRAND.name}...`}
                                className="w-full rounded-lg border px-3 py-2 text-sm leading-6"
                            />

                            {/* Variable Samples */}

                            {(() => {
                                const vars = Array.from(
                                    body.matchAll(/\{\{(\d+)\}\}/g)
                                ).map((m) => m[1]);
                                const unique = [...new Set(vars)].sort(
                                    (a, b) => Number(a) - Number(b)
                                );
                                if (!unique.length) return null;
                                return (
                                    <div className="mt-2 space-y-1.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                        <p className="text-[11px] font-medium text-amber-700">
                                            Sample values for variables (required by Meta)
                                        </p>
                                        {unique.map((v) => (
                                            <div key={v} className="flex items-center gap-2">
                                                <span className="w-12 shrink-0 text-xs font-mono text-amber-600">
                                                    {`{{${v}}}`}
                                                </span>
                                                <input
                                                    value={variableSamples[v] ?? ""}
                                                    onChange={(e) => {
                                                        setVariableSamples((prev) => ({
                                                            ...prev,
                                                            [v]: e.target.value,
                                                        }));
                                                        setIsDirty(true);
                                                    }}
                                                    placeholder={`e.g. ${v === "1" ? "John" : v === "2" ? "Order #1234" : "sample"}`}
                                                    className="min-w-0 flex-1 rounded-md border bg-white px-2 py-1 text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                        </div>

                        {/* Footer */}

                        <div>

                            <label className="mb-1 block text-xs font-medium text-gray-600">

                                Footer <span className="font-normal text-gray-400">(optional)</span>

                            </label>

                            <input
                                value={footer}

                                onChange={(e) => {
                                    setFooter(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder={`e.g. Powered by ${BRAND.name}`}
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />

                        </div>
                        {/* Action Buttons */}

                        <div>

                            <div className="mb-2 flex items-center justify-between">

                                <label className="text-xs font-medium text-gray-600">

                                    Action buttons

                                </label>

                                <button
                                    type="button"
                                    disabled={buttons.length >= 3}
                                    onClick={() => {
                                        setButtons([
                                            ...buttons,
                                            {
                                                type: "QUICK_REPLY",
                                                text: "",
                                                url: "",
                                                phoneNumber: "",
                                            },
                                        ]);
                                        setIsDirty(true);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-md bg-[#635BFF] px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-[#5148ff] disabled:opacity-40"
                                >

                                    <span className="leading-none">+</span> Add

                                </button>

                            </div>

                            {buttons.length === 0 ? (

                                <div className="rounded-2xl border border-dashed py-8 text-center">

                                    <Type className="mx-auto mb-3 h-8 w-8 text-gray-400" />

                                    <p className="text-sm text-gray-500">

                                        No buttons added.

                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-3">

                                    {Array.isArray(buttons) &&
                                        buttons.map((button, index) => {

                                            const type =
                                                (button.type || "").toUpperCase();

                                            const updateButton = (
                                                patch: Partial<TemplateButton>
                                            ) => {
                                                const updated = [...buttons];
                                                updated[index] = {
                                                    ...updated[index],
                                                    ...patch,
                                                };
                                                setButtons(updated);
                                                setIsDirty(true);
                                            };

                                            // A CTA type (website / phone) may only
                                            // be used once. Disable it in this row's
                                            // dropdown if another row already uses it.
                                            const usedByOther = (t: string) =>
                                                buttons.some(
                                                    (b, i) =>
                                                        i !== index &&
                                                        (b.type || "").toUpperCase() === t
                                                );

                                            return (

                                                <div
                                                    key={index}
                                                    className="flex items-center gap-2 rounded-xl border bg-gray-50 p-2"
                                                >

                                                    <select
                                                        value={button.type}
                                                        onChange={(e) =>
                                                            updateButton({ type: e.target.value })
                                                        }
                                                        className="w-[120px] shrink-0 rounded-lg border bg-white px-2 py-1.5 text-xs"
                                                    >
                                                        <option
                                                            value="URL"
                                                            disabled={usedByOther("URL")}
                                                        >
                                                            Visit website
                                                        </option>
                                                        <option
                                                            value="PHONE_NUMBER"
                                                            disabled={usedByOther("PHONE_NUMBER")}
                                                        >
                                                            Call phone
                                                        </option>
                                                        <option value="QUICK_REPLY">
                                                            Quick reply
                                                        </option>
                                                    </select>

                                                    <input
                                                        value={button.text}
                                                        onChange={(e) =>
                                                            updateButton({ text: e.target.value })
                                                        }
                                                        placeholder="Label"
                                                        maxLength={25}
                                                        className="min-w-0 flex-1 rounded-lg border bg-white px-2 py-1.5 text-xs"
                                                    />

                                                    {type === "URL" && (
                                                        <input
                                                            value={button.url ?? ""}
                                                            onChange={(e) =>
                                                                updateButton({ url: e.target.value })
                                                            }
                                                            placeholder="https://…"
                                                            className="min-w-0 flex-1 rounded-lg border bg-white px-2 py-1.5 text-xs"
                                                        />
                                                    )}

                                                    {type === "PHONE_NUMBER" && (
                                                        <input
                                                            value={button.phoneNumber ?? ""}
                                                            onChange={(e) =>
                                                                updateButton({ phoneNumber: e.target.value })
                                                            }
                                                            placeholder="918939989397"
                                                            className="min-w-0 flex-1 rounded-lg border bg-white px-2 py-1.5 text-xs"
                                                        />
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setButtons(
                                                                buttons.filter((_, i) => i !== index)
                                                            )
                                                        }
                                                        aria-label="Remove button"
                                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>

                                                </div>

                                            );
                                        })}

                                </div>

                            )}

                        </div>

                        {/* Character Counter */}

                        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">

                            <div className="text-sm text-gray-500">

                                Body Characters

                            </div>

                            <div
                                className={`text-sm font-semibold ${body.length > 1024
                                    ? "text-red-500"
                                    : "text-[#635BFF]"
                                    }`}
                            >

                                {body.length} / 1024

                            </div>

                        </div>

                        {/* Sticky Footer */}

                        <div className="sticky bottom-0 -mx-8 mt-10 border-t bg-white px-8 py-5">

                            <div className="flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={async () => {

                                        const saved = await saveTemplate();

                                        // Only close if the save actually
                                        // succeeded (validation may block it).
                                        if (saved) {
                                            onClose();
                                        }

                                    }}
                                    disabled={saving || submitting}
                                    className="rounded-xl bg-[#635BFF] px-6 py-3 text-sm font-medium text-white hover:bg-[#5148ff] disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Draft"}
                                </button>
                                <button
                                    type="button"
                                    disabled={saving || submitting}
                                    onClick={async () => {

                                        try {

                                            setSubmitting(true);

                                            const saved =
                                                await saveTemplate(false);

                                            // Save was blocked (validation) or
                                            // failed — stop here. The user has
                                            // already been shown the reason.
                                            if (!saved) {
                                                return;
                                            }

                                            const id =
                                                saved?.id ??
                                                template?.id;

                                            if (!id) {

                                                throw new Error(
                                                    "Unable to save template."
                                                );

                                            }

                                            const res =
                                                await fetch(
                                                    "/api/templates/submit",
                                                    {

                                                        method: "POST",

                                                        headers: {
                                                            "Content-Type": "application/json",
                                                        },

                                                        body: JSON.stringify({
                                                            id,
                                                        }),

                                                    }
                                                );

                                            const json =
                                                await res.json();

                                            if (!json.success) {

                                                throw new Error(
                                                    json.message
                                                );

                                            }

                                            onSaved();

                                            setIsDirty(false);

                                            onClose();

                                        }

                                        catch (err: any) {

                                            alert(err.message);

                                        }

                                        finally {

                                            setSubmitting(false);

                                        }

                                    }}
                                    className="rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700">
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                {/* RIGHT PANEL */}

                <div className="relative flex-1 bg-[#EEF2F7]">

                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 z-10 rounded-xl p-2 hover:bg-white/60"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>

                    <div className="flex h-full items-center justify-center p-6">

                        <WhatsAppPreview
                            template={{
                                headerType,
                                headerText,
                                headerImage,
                                body: body.replace(
                                    /\{\{(\d+)\}\}/g,
                                    (_, n) => variableSamples[n] || `{{${n}}}`
                                ),
                                footer,
                                buttons,
                            }}
                            size="large"
                        />

                    </div>

                </div>

            </div>
        </div>
    );

}