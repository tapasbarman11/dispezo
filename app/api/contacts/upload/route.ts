import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadContacts } from "@/lib/api/contacts/service";

export async function POST(req: NextRequest) {

    try {

        const session = await getServerSession(authOptions);

        const organizationId =
            (session?.user as any)?.organizationId;

        if (!organizationId) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const formData = await req.formData();

        const file = formData.get("file") as File | null;
        const tag = formData.get("tag") as string | null;

        if (!file) {

            return NextResponse.json(
                { success: false, message: "No file uploaded." },
                { status: 400 }
            );

        }

        if (!tag || !tag.trim()) {

            return NextResponse.json(
                { success: false, message: "Audience name is required." },
                { status: 400 }
            );

        }

        const csvText = await file.text();

        const result = await uploadContacts(
            organizationId,
            csvText,
            tag
        );

        return NextResponse.json({
            success: true,
            ...result,
        });

    } catch (err: any) {

        console.error("Contact upload error:", err);

        return NextResponse.json(
            {
                success: false,
                message: err.message || "Failed to upload contacts.",
            },
            { status: 500 }
        );

    }

}
