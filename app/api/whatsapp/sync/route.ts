import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { syncWhatsApp } from "@/lib/api/whatsapp/sync";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const organizationId = (
      session.user as { organizationId: string }
    ).organizationId;

    const result = await syncWhatsApp(
      organizationId
    );

    return NextResponse.json({
      success: true,

      connection: result.connection,

      templates: result.templates,

      activity: result.activity,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        connection: null,
        templates: [],
        activity: [],
        message:
          error instanceof Error
            ? error.message
            : "Unable to sync WhatsApp.",
      },
      {
        status: 500,
      }
    );

  }
}