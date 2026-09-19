import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteContactService, getContactService, updateContactService } from "@/lib/api/contacts/service";

async function getOrg() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.organizationId as string | undefined;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const organizationId = await getOrg();
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const contact = await getContactService(id, organizationId);
    if (!contact) return NextResponse.json({ success: false, message: "Contact not found." }, { status: 404 });
    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to load contact." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const organizationId = await getOrg();
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const contact = await updateContactService(id, organizationId, await req.json());
    if (!contact) return NextResponse.json({ success: false, message: "Contact not found." }, { status: 404 });
    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to update contact." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const organizationId = await getOrg();
    if (!organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const deleted = await deleteContactService(id, organizationId);
    if (!deleted) return NextResponse.json({ success: false, message: "Contact not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || "Failed to delete contact." }, { status: 500 });
  }
}
