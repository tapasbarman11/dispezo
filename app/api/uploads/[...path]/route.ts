import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
};

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: segments } = await params;

    // Prevent path traversal
    const safeSegments = segments.filter(
        (s) => s !== ".." && s !== "."
    );

    const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        ...safeSegments
    );

    try {
        const file = await readFile(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        return new NextResponse(file, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "File not found" },
            { status: 404 }
        );
    }
}