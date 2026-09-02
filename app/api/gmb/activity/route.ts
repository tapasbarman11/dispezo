import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listActivity, insertActivity } from "@/lib/api/gmb/repository";

//-----------------------------------------------------
// GET — paginated activity list, for the Dispezo UI
//-----------------------------------------------------

export async function GET(req: NextRequest) {

    try {

        const session = await getServerSession(authOptions);

        const organizationId = (session?.user as any)?.organizationId;

        if (!organizationId) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = 10;

        const { activity, total } = await listActivity(
            organizationId, page, pageSize
        );

        return NextResponse.json({
            success: true,
            activity,
            total,
            page,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        });

    } catch (err: any) {

        console.error("GMB activity GET error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to load activity." },
            { status: 500 }
        );

    }

}

//-----------------------------------------------------
// POST — n8n logs each review it processes
//-----------------------------------------------------

export async function POST(req: NextRequest) {

    try {

        const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");

        if (!apiKey || apiKey !== process.env.GMB_N8N_API_KEY) {

            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const body = await req.json();

        const {
            organizationId, locationId, reviewId, reviewerName,
            reviewText, starRating, sentiment, replySent, replyText,
        } = body;

        if (!organizationId || !locationId || !reviewId) {

            return NextResponse.json(
                { success: false, message: "organizationId, locationId, and reviewId are required." },
                { status: 400 }
            );

        }

        await insertActivity({
            organizationId, locationId, reviewId, reviewerName,
            reviewText, starRating, sentiment,
            replySent: !!replySent, replyText,
        });

        return NextResponse.json({ success: true });

    } catch (err: any) {

        console.error("GMB activity POST error:", err);

        return NextResponse.json(
            { success: false, message: "Failed to log activity." },
            { status: 500 }
        );

    }

}
