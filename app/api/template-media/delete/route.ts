import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function DELETE(req: NextRequest) {
    try {
        const { imagePath } = await req.json();

        if (!imagePath) {
            return NextResponse.json({
                success: false,
                message: "Image path missing."
            }, { status: 400 });
        }

        // imagePath now looks like "/api/uploads/templates-media/xxx.png"
        // (or the old "/uploads/templates-media/xxx.png" for legacy rows).
        // Strip either prefix to get the real relative path on disk,
        // which lives under public/uploads/...
        const relativePath = imagePath
            .replace(/^\/api\/uploads\//, "uploads/")
            .replace(/^\/uploads\//, "uploads/");

        const filePath = path.join(
            process.cwd(),
            "public",
            relativePath
        );

        await fs.unlink(filePath);

        return NextResponse.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        return NextResponse.json({
            success: false
        });
    }
}