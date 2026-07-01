import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { getConnectionByOrganization } from "@/lib/api/whatsapp/service";
import { metaPOST } from "@/lib/meta/client";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
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

    const account = await getConnectionByOrganization(
      organizationId
    );

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

    const body = await req.json();

    const {
      phoneNumber,
      templateName,
      language = "en_US",
    } = body;

    if (!phoneNumber || !templateName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Phone number and template are required.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken = decrypt(
      account.access_token
    );

    const payload = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: language,
        },
      },
    };

    const response = await metaPOST<any>(
      `/${account.phone_number_id}/messages`,
      accessToken,
      payload
    );
    const messageId = response?.messages?.[0]?.id ?? null;

    await pool.query(
      `
  INSERT INTO messages
  (
    organization_id,
    campaign_id,
    phone,
    template_name,
    whatsapp_message_id,
    status,
    sent_at
  )
  VALUES
  (
    $1,$2,$3,$4,$5,$6,NOW()
  )
  `,
      [
        organizationId,
        null,
        phoneNumber,
        templateName,
        messageId,
        response?.messages?.length ? "Sent" : "Failed",
      ]
    );
    return NextResponse.json({
      success: true,
      messageId,
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to send message.",
      },
      {
        status: 500,
      }
    );
  }
}