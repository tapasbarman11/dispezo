"use client";

import { X } from "lucide-react";

import WhatsAppPreview from "./WhatsAppPreview";

interface Props {

    open: boolean;

    template: any;

    onClose: () => void;

}

export default function TemplatePreviewModal({

    open,

    template,

    onClose,

}: Props) {

    if (!open || !template) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

            <div className="max-h-[90vh] w-[430px] overflow-hidden rounded-3xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b px-6 py-5">

                    <div>

                        <h2 className="text-lg font-semibold">

                            {template.name}

                        </h2>

                        <p className="mt-1 text-sm text-gray-500">

                            WhatsApp Template Preview

                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl p-2 hover:bg-gray-100"
                    >

                        <X className="h-5 w-5" />

                    </button>

                </div>

                <div className="flex max-h-[calc(90vh-96px)] items-center justify-center overflow-y-auto bg-[#ECE5DD] p-6">

                    <WhatsAppPreview
                        template={template}
                         size="large"
                    />

                </div>

            </div>

        </div>

    );

}