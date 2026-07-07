"use client";
import { BRAND } from "@/config/branding";
import Image from "next/image";
import {
    CheckCheck,
    BadgeCheck,
    Image as ImageIcon,
    Video,
    Phone,
    MoreVertical,
    Smile,
    Paperclip,
    Camera,
    Mic,
} from "lucide-react";
interface Button {

    type: string;

    text: string;

}

interface Props {

    template: {

        headerType?: string;

        headerText?: string;

        headerImage?: string;

        body: string;

        footer?: string;

        buttons?: Button[];

    };

    size?: "normal" | "large";

}

export default function WhatsAppPreview({

    template,

    size = "normal",

}: Props) {
    const phoneWidth =
        size === "large"
            ? "w-[320px]"
            : "w-[340px]";

    const chatHeight =
        size === "large"
            ? "h-[500px]"
            : "h-[480px]";
    return (

        <div
            className={`mx-auto ${phoneWidth} overflow-hidden rounded-[32px] border-8 border-gray-900 bg-[#ECE5DD] shadow-2xl`}>

            {/* Phone Header */}

            <div className="flex items-center justify-between bg-[#075E54] px-4 py-3 text-white">

                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-1">
                        <Image
                            src={BRAND.logo}
                            alt={BRAND.name}
                            fill={false}
                            width={37}
                            height={37}
                            className="object-contain"
                        />
                    </div>
                    <div>

                        <div className="flex items-center gap-1 font-semibold">

                            {BRAND.name}

                            <BadgeCheck
                                className="ml-1 h-4 w-4 fill-[#53BDEB] text-[#53BDEB]"
                            />
                        </div>

                        <div className="text-xs opacity-90">

                            online

                        </div>

                    </div>

                </div>

                <div className="flex items-center gap-4">

                    <Video className="h-5 w-5" />

                    <Phone className="h-5 w-5" />

                    <MoreVertical className="h-5 w-5" />

                </div>

            </div>

            {/* Chat */}

            <div
                className={`${chatHeight} overflow-y-auto p-4`}>

                <div className="rounded-2xl rounded-tl-md rounded-tl-md bg-[#DCF8C6] p-2 shadow-[0_2px_4px_rgba(0,0,0,0.15)]">

                    {/* Image */}

                    {template.headerImage && (

                        <img
                            src={template.headerImage}
                            alt=""
                            className="w-full rounded-lg object-contain bg-white"
                        />

                    )}

                    {/* Placeholder */}

                    {!template.headerImage &&
                        template.headerType === "IMAGE" && (

                            <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-gray-200">

                                <ImageIcon className="h-12 w-12 text-gray-500" />

                            </div>

                        )}

                    {/* Header */}

                    {template.headerText && (

                        <h3 className="mb-3 text-base font-semibold tracking-wide text-gray-900">

                            {template.headerText}

                        </h3>

                    )}

                    {/* Body */}

                    <p className="whitespace-pre-wrap text-[14px] leading-6 text-gray-800">

                        {template.body}

                    </p>

                    {/* Footer */}

                    {template.footer && (

                        <div className="mt-4 border-t border-gray-300 pt-3 text-xs text-gray-500">

                            {template.footer}

                        </div>

                    )}

                    {/* Buttons */}

                    {template.buttons &&
                        template.buttons.length > 0 && (

                            <div className="mt-4 space-y-2">

                                {template.buttons.map(

                                    (
                                        button,
                                        index
                                    ) => (

                                        <button
                                            key={index}
                                            className="w-full rounded-xl border border-[#B7DFC4] bg-white py-2 text-sm font-medium text-[#00A884]"
                                        >

                                            {button.text}

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                    {/* Time */}

                    <div className="mt-3 flex justify-end">

                        <span className="mr-1 text-[11px] text-gray-500">

                            11:45 AM

                        </span>

                        <CheckCheck
                            className="h-4 w-4 text-[#53BDEB]"
                        />

                    </div>

                </div>

            </div>
            {/* Chat Footer */}

            <div className="flex items-center gap-3 border-t bg-[#F0F2F5] px-3 py-3">

                <Smile className="h-6 w-6 text-gray-500" />

                <div className="flex flex-1 items-center rounded-full bg-white px-4 py-2">

                    <span className="flex-1 text-sm text-gray-400">

                        Type a message

                    </span>

                    <Paperclip className="mr-3 h-5 w-5 text-gray-500" />

                    <Camera className="h-5 w-5 text-gray-500" />

                </div>

                <div className="rounded-full bg-[#00A884] p-2">

                    <Mic className="h-5 w-5 text-white" />

                </div>

            </div>
        </div >

    );

}