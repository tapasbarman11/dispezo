import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/session-context";
import { getConnectionForUser } from "@/lib/api/whatsapp/repository";

export async function GET() {
  try {
    const context = await getSessionContext();
    if (!context) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const account = await getConnectionForUser(context.organizationId, context.userId);
    if (!account) {
      return NextResponse.json({ success: true, connection: null });
    }

    return NextResponse.json({
      success: true,
      connection: {
        connected: true,
        businessName: account.meta_business_name,
        phoneNumber: account.phone_number,
        verifiedName: account.display_name,
        qualityRating: account.quality_rating,
        messagingLimit: account.messaging_limit,
        webhookStatus: account.webhook_status,
        connectedAt: account.connected_at,
        lastSyncedAt: account.last_synced_at,
        wabaId: account.waba_id,
        phoneNumberId: account.phone_number_id,
      },
    });
  } catch (error: any) {
    console.error("WhatsApp status error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load WhatsApp connection." },
      { status: 500 }
    );
  }
}
