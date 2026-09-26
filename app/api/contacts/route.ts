import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session-context";
import { createContactService, deleteContactsService, listContactsService } from "@/lib/api/contacts/service";

export async function GET(req: NextRequest) {
  try {
    const context = await getSessionContext();
    if (!context) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page") || "1");
    const pageSize = Number(url.searchParams.get("pageSize") || "25");
    const search = url.searchParams.get("search") || "";
    const tag = url.searchParams.get("tag") || "";
    const result = await listContactsService(context.organizationId, { page, pageSize, search, tag });

    return NextResponse.json({
      success: true,
      ...result,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(result.total / pageSize)),
    });
  } catch (error: any) {
    console.error("Contacts GET error", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to load contacts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const context = await getSessionContext();
    if (!context) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const contact = await createContactService(context.organizationId, body);
    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch (error: any) {
    console.error("Contacts POST error", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to create contact." }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const context = await getSessionContext();
    if (!context) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];
    if (!ids.length) return NextResponse.json({ success: false, message: "No contacts selected." }, { status: 400 });

    const deleted = await deleteContactsService(ids, context.organizationId);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error("Contacts DELETE error", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to delete contacts." }, { status: 500 });
  }
}
