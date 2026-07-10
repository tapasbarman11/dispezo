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

    const organizationId =
      (session.user as { organizationId: string }).organizationId;

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

    const {
      phoneNumber,
      templateName,
      language = "en_US",
      components,
    } = await req.json();

    if (!phoneNumber || !templateName) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and template are required.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken = decrypt(
      account.access_token
    );

    // Upload any image to Meta and replace link with media_id
    if (components && components.length > 0) {
      for (const comp of components) {
        if (comp.type === "header" && comp.parameters?.[0]?.type === "image") {
          const imgParam = comp.parameters[0];
          if (imgParam.image?.link) {
            // Read the local file and upload to Meta
            const fs = await import("fs");
            const path = await import("path");
            const localPath = imgParam.image.link.replace(/^https?:\/\/[^/]+/, "");
            const filePath = path.join(process.cwd(), "public", localPath);

            if (fs.existsSync(filePath)) {
              const fileBuffer = fs.readFileSync(filePath);
              const formData = new FormData();
              formData.append("messaging_product", "whatsapp");
              formData.append("file", new Blob([fileBuffer], { type: "image/png" }), "header.png");

              const uploadRes = await fetch(
                `https://graph.facebook.com/v23.0/${account.phone_number_id}/media`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${accessToken}` },
                  body: formData,
                }
              );
              const uploadJson = await uploadRes.json();

              if (uploadJson.id) {
                // Replace link with media_id
                delete imgParam.image.link;
                imgParam.image.id = uploadJson.id;
              }
            }
          }
        }
      }
    }

    const payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: language,
        },
      },
    };

    // Add components (variables, image header, buttons) if provided
    if (components && components.length > 0) {
      payload.template.components = components;
    }

    console.log("===== SEND MESSAGE =====");
    console.log(
      JSON.stringify(payload, null, 2)
    );

    const response = await metaPOST<any>(
      `/${account.phone_number_id}/messages`,
      accessToken,
      payload
    );

    console.log("===== META RESPONSE =====");
    console.log(
      JSON.stringify(response, null, 2)
    );

    const messageId =
      response?.messages?.[0]?.id ?? null;

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
        messageId ? "Sent" : "Failed",
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
          error?.message ??
          "Unable to send message.",
      },
      {
        status: 500,
      }
    );

  }
}