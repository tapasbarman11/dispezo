import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session-context";
import { syncWhatsApp } from "@/lib/api/whatsapp/sync";

export async function POST() {
  try {
    const context = await getSessionContext();

    if (!context) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await syncWhatsApp(context.organizationId);

    return NextResponse.json({
      success: true,
      connection: result.connection,
      templates: result.templates,
      activity: result.activity,
    });
  } catch (error) {
    console.error("WhatsApp sync error:", error);
    return NextResponse.json(
      {
        success: false,
        connection: null,
        templates: [],
        activity: [],
        message: error instanceof Error ? error.message : "Unable to sync WhatsApp.",
      },
      { status: 500 }
    );
  }
}
