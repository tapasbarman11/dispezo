import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadContacts } from "@/lib/api/contacts/service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId as string | undefined;
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get("file");
    const tag = String(formData.get("tag") || "").trim();
    if (!(file instanceof File)) return NextResponse.json({ success: false, message: "No CSV file uploaded." }, { status: 400 });
    if (!tag) return NextResponse.json({ success: false, message: "Audience/tag is required." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ success: false, message: "CSV must be 10 MB or smaller." }, { status: 400 });
    const result = await uploadContacts(organizationId, await file.text(), tag);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Contact CSV upload error", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to upload CSV." }, { status: 400 });
  }
}
