import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session-context";
import { syncTemplates } from "@/lib/api/templates/sync";

export async function POST() {
  try {
    const context = await getSessionContext();
    if (!context) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const result = await syncTemplates(context.organizationId);
    return NextResponse.json({
      success: true,
      changed: result.changed,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Template sync error:", error);
    return NextResponse.json(
      { success: false, changed: false, message: error.message || "Failed to sync templates." },
      { status: 500 }
    );
  }
}
