import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session-context";
import { loadTemplates } from "@/lib/api/templates/service";

export async function GET() {
  try {
    const context = await getSessionContext();
    if (!context) {
      return NextResponse.json({ success: false, templates: [], message: "Unauthorized" }, { status: 401 });
    }

    const templates = await loadTemplates(context.organizationId);
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    console.error("Get template status error:", error);
    return NextResponse.json(
      { success: false, templates: [], message: error.message || "Failed to load templates." },
      { status: 500 }
    );
  }
}
