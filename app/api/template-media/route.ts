import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPG, PNG and WEBP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum image size is 5 MB.",
        },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name);

    const filename = `${randomUUID()}${extension}`;
    console.log("Generated filename:", filename);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "templates-media"
    );
    console.log("Upload directory:", uploadDir);
    await fs.mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    await fs.writeFile(path.join(uploadDir, filename), buffer);
    console.log("File saved successfully");
    console.log(path.join(uploadDir, filename));
    return NextResponse.json({
      success: true,
      path: `/api/uploads/templates-media/${filename}`,
      name: filename,
      originalName: file.name,
      type: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Media Upload Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}