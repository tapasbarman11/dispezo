import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAudiences } from "@/lib/api/contacts/service";

export async function GET() {

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

        const audiences = await getAudiences(organizationId);

        return NextResponse.json({
            success: true,
            audiences,
        });

    } catch (err: any) {

        console.error("Get audiences error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to load audiences." },
            { status: 500 }
        );

    }

}
