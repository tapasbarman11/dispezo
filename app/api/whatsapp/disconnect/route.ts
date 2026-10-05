import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session-context";
import { updateConnection } from "@/lib/api/whatsapp/repository";

export async function POST() {
  try {
    const context = await getSessionContext();
    if (!context) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await updateConnection(context.organizationId, { status: "disconnected", webhook_status: "inactive", updated_at: new Date() });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("WhatsApp disconnect error:", error);
    return NextResponse.json({ success: false, message: error?.message || "Unable to disconnect WhatsApp." }, { status: 500 });
  }
}
