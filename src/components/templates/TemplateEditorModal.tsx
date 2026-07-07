"use client";

import { useEffect, useState } from "react";
import {
    X,
    Upload,
    ImageIcon,
    Type,
    FileText,
} from "lucide-react";
import WhatsAppPreview from "./WhatsAppPreview";
interface TemplateButton {
    type: string;
    text: string;
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

}

interface Props {

    open: boolean;

    template: TemplateModel | null;

    onClose: () => void;

    onSaved: () => void;

}

const languages = [

    "en_US",
    "en_GB",
    "hi",
    "bn",
    "ta",
    "te",

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

    const [uploadingImage, setUploadingImage] = useState(false);

    const [body, setBody] =
        useState("");

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

        if (!template) {
            console.log("EDITOR OPEN");
            console.log(template);
            console.log(template?.headerImage);
            console.log(template?.sampleMediaPath);
            setName("");

            setCategory("MARKETING");

            setLanguage("en_US");

            setHeaderType("NONE");

            setHeaderText("");

            setHeaderImage("");

            setBody("");

            setFooter("");

            setButtons([]);

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

        setHeaderImage(
            template.sampleMediaPath ?? ""
        );

        setBody(
            template.body
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

    async function uploadImage(file: File) {

        try {
            if (sampleMediaPath) {

                await fetch("/api/template-media/delete", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        imagePath: sampleMediaPath
                    })
                });

            }

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

            setSampleMediaPath(json.path);
            setSampleMediaName(json.name);
            setSampleMediaType(json.type);

            // Preview
            setHeaderImage(json.path);
            console.log("AFTER UPLOAD");
            console.log({
                path: json.path,
                sampleMediaPath,
                headerImage
            });
            setIsDirty(true);

        } catch (err: any) {

            alert(err.message);

        } finally {

            setUploadingImage(false);

        }

    }
    async function removeImage() {

        if (!sampleMediaPath) return;

        try {

            await fetch("/api/template-media/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    imagePath: sampleMediaPath
                })
            });

            setSampleMediaPath("");
            setSampleMediaName("");
            setSampleMediaType("");

            setHeaderImage("");

            setIsDirty(true);

        } catch (err) {

            console.error(err);

        }

    }
    //-----------------------------------------------------
    // Save Template
    //-----------------------------------------------------
    async function saveTemplate(refresh = true): Promise<any> {

        try {

            setSaving(true);
            console.log("CURRENT STATE", {
                sampleMediaPath,
                sampleMediaName,
                sampleMediaType
            });
            const res = await fetch(
                "/api/templates",
                {
                    method: template ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({

                        id: template?.id,

                        name,

                        category,

                        language,

                        headerType,

                        headerText,

                        headerImage,

                        body,

                        footer,

                        buttons,
                        sampleMediaPath,
                        sampleMediaName,
                        sampleMediaType,

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

            if (refresh) {
                onSaved();
            }
            return savedTemplate;

        } catch (err: any) {

            alert(
                err.message
            );

        } finally {

            setSaving(false);

        }

    }
    async function handleClose() {

        if (isDirty) {

            const confirmed = window.confirm(
                "Discard unsaved changes?"
            );

            if (!confirmed) return;

        }
        if (sampleMediaPath) {

            await fetch("/api/template-media/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    imagePath: sampleMediaPath
                })
            });

        }

        onClose();

    }
    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

            <div className="flex h-[92vh] w-[95vw] max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* LEFT PANEL */}

                <div className="w-[48%] overflow-y-auto border-r">

                    {/* Header */}

                    <div className="sticky top-0 flex items-center justify-between border-b bg-white px-8 py-6">

                        <div>

                            <h2 className="text-2xl font-bold">

                                {template
                                    ? "Edit Template"
                                    : "Create Template"}

                            </h2>

                            <p className="mt-1 text-sm text-gray-500">

                                Configure your WhatsApp message template.

                            </p>

                        </div>

                        <button
                            onClick={handleClose}
                            className="rounded-xl p-2 hover:bg-gray-100"
                        >

                            <X className="h-5 w-5" />

                        </button>

                    </div>

                    {/* Form */}

                    <div className="space-y-6 p-8">
                        {/* Template Name */}

                        <div>

                            <label className="mb-2 block text-sm font-medium">

                                Template Name

                            </label>

                            <input
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="appointment_confirmation"
                                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-[#635BFF]"
                            />

                        </div>

                        {/* Category & Language */}

                        <div className="grid grid-cols-2 gap-5">

                            <div>

                                <label className="mb-2 block text-sm font-medium">

                                    Category

                                </label>

                                <select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    className="w-full rounded-xl border px-4 py-3"
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

                                <label className="mb-2 block text-sm font-medium">

                                    Language

                                </label>

                                <select
                                    value={language}

                                    onChange={(e) => {
                                        setLanguage(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    className="w-full rounded-xl border px-4 py-3"
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

                            <label className="mb-3 block text-sm font-medium">

                                Header Type

                            </label>

                            <div className="flex gap-3">

                                {headerTypes.map((item) => (

                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => { setHeaderType(item); setIsDirty(true); }}
                                        className={`rounded-xl border px-5 py-2 text-sm transition ${headerType === item
                                            ? "border-[#635BFF] bg-[#F4F3FF] text-[#635BFF]"
                                            : "bg-white"
                                            }`}
                                    >

                                        {item}

                                    </button>

                                ))}

                            </div>

                        </div>

                        {/* Image Upload */}

                        {headerType === "IMAGE" && (

                            <div>

                                <label className="mb-2 block text-sm font-medium">

                                    Sample Image (Required by Meta)

                                </label>

                                <div className="rounded-2xl border-2 border-dashed border-gray-300 p-8">

                                    {headerImage ? (

                                        <div>

                                            <img
                                                src={headerImage}
                                                className="mb-4 max-h-80 w-full rounded-xl border bg-gray-50 object-contain"
                                            />
                                            <div className="flex gap-5 text-sm">

                                                <label
                                                    htmlFor="template-image-upload"
                                                    className="cursor-pointer font-medium text-[#635BFF] hover:underline"
                                                >
                                                    Replace
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="font-medium text-red-500 hover:underline"
                                                >
                                                    Remove
                                                </button>

                                            </div>

                                        </div>

                                    ) : (

                                        <div className="text-center">

                                            <ImageIcon className="mx-auto mb-4 h-10 w-10 text-gray-400" />

                                            <p className="mb-4 text-sm text-gray-500">

                                                Upload Header Image

                                            </p>

                                            <>
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
                                            </>

                                        </div>

                                    )}

                                </div>

                            </div>

                        )}

                        {/* Header Text */}

                        {headerType === "TEXT" && (

                            <div>

                                <label className="mb-2 block text-sm font-medium">

                                    Header Text

                                </label>

                                <input
                                    value={headerText}
                                    onChange={(e) => {
                                        setHeaderText(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    placeholder="Appointment Reminder"
                                    className="w-full rounded-xl border px-4 py-3"
                                />

                            </div>

                        )}

                        {/* Body */}

                        <div>

                            <label className="mb-2 flex items-center gap-2 text-sm font-medium">

                                <FileText className="h-4 w-4" />

                                Message Body

                            </label>

                            <textarea
                                rows={8}
                                value={body}

                                onChange={(e) => {
                                    setBody(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Hi {{1}}, welcome to Dispaz..."
                                className="w-full rounded-xl border px-4 py-3 leading-7"
                            />

                        </div>

                        {/* Footer */}

                        <div>

                            <label className="mb-2 block text-sm font-medium">

                                Footer

                            </label>

                            <input
                                value={footer}

                                onChange={(e) => {
                                    setFooter(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Powered by Dispaz"
                                className="w-full rounded-xl border px-4 py-3"
                            />

                        </div>
                        {/* Action Buttons */}

                        <div>

                            <div className="mb-3 flex items-center justify-between">

                                <label className="text-sm font-medium">

                                    Action Buttons

                                </label>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setButtons([
                                            ...buttons,
                                            {
                                                type: "QUICK_REPLY",
                                                text: "",
                                            },
                                        ]);
                                        setIsDirty(true);;
                                    }
                                    }
                                    className="rounded-lg bg-[#635BFF] px-3 py-2 text-xs font-medium text-white hover:bg-[#5148ff]"
                                >

                                    + Add Button

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

                                <div className="space-y-4">

                                    {Array.isArray(buttons) &&
                                        buttons.map((button, index) => (

                                            <div
                                                key={index}
                                                className="rounded-2xl border bg-gray-50 p-4"
                                            >

                                                <div className="grid grid-cols-12 gap-3">

                                                    <div className="col-span-4">

                                                        <select
                                                            value={button.type}
                                                            onChange={(e) => {

                                                                const updated =
                                                                    [...buttons];

                                                                updated[index].type =
                                                                    e.target.value;

                                                                setButtons(updated);

                                                            }}
                                                            className="w-full rounded-xl border px-3 py-2 text-sm"
                                                        >

                                                            <option value="QUICK_REPLY">

                                                                Quick Reply

                                                            </option>

                                                            <option value="URL">

                                                                Visit Website

                                                            </option>

                                                            <option value="PHONE_NUMBER">

                                                                Call Phone

                                                            </option>

                                                        </select>

                                                    </div>

                                                    <div className="col-span-7">

                                                        <input
                                                            value={button.text}
                                                            onChange={(e) => {

                                                                const updated =
                                                                    [...buttons];

                                                                updated[index].text =
                                                                    e.target.value;

                                                                setButtons(updated);

                                                            }}
                                                            placeholder="Button Text"
                                                            className="w-full rounded-xl border px-3 py-2 text-sm"
                                                        />

                                                    </div>

                                                    <div className="col-span-1">

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setButtons(
                                                                    buttons.filter(
                                                                        (_, i) =>
                                                                            i !== index
                                                                    )
                                                                );

                                                            }}
                                                            className="rounded-xl border px-3 py-2 text-red-500 hover:bg-red-50"
                                                        >

                                                            ×

                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        ))}

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
                                    onClick={handleClose}
                                    className="rounded-xl border px-6 py-3 text-sm font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={async () => {

                                        await saveTemplate();

                                        onClose();

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

                {/* RIGHT PANEL STARTS IN PART 2 */}
                {/* RIGHT PANEL */}

                <div className="flex-1 bg-[#EEF2F7]">

                    <div className="flex h-full items-center justify-center p-8">

                        <WhatsAppPreview
                            template={{
                                headerType,
                                headerText,
                                headerImage,
                                body,
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