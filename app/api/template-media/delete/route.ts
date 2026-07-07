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

        const filePath = path.join(
            process.cwd(),
            "public",
            imagePath
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