import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { getConnection } from "@/lib/api/whatsapp/service";
import { metaGET } from "@/lib/meta/client";

export async function GET() {
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

    const organizationId = (session.user as any).organizationId;

    const account = await getConnection(organizationId);

    if (!account) {
      return NextResponse.json(
        {
          success: false,
          message: "WhatsApp account not connected.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken = decrypt(account.access_token);

    const response = await metaGET<{
      data: Array<{
        id: string;
        name: string;
        language: string;
        status: string;
        category: string;
      }>;
    }>(
      `/${account.waba_id}/message_templates`,
      accessToken
    );

    const templates = response.data.map((template) => ({
      id: template.id,
      name: template.name,
      language: template.language,
      status: template.status,
      category: template.category,
    }));

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to fetch templates.",
      },
      {
        status: 500,
      }
    );
  }
}