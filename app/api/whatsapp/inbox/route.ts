import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { getConnectionByOrganization } from "@/lib/api/whatsapp/service";
import { metaPOST } from "@/lib/meta/client";
import pool from "@/lib/db";

function messagePreview(payload: any, direction?: string) {
  const type = payload?.type;

  if (type === "text") return payload?.text?.body ?? "";
  if (type === "image") return "📷 Image";
  if (type === "video") return "🎥 Video";
  if (type === "audio") return "🎵 Audio";
  if (type === "document") return `📎 ${payload?.document?.filename ?? "Document"}`;
  if (type === "sticker") return "😊 Sticker";
  if (type === "location") return "📍 Location";
  if (type === "contacts") return "👤 Contact";
  if (direction === "outbound") return "WhatsApp message";
  return "Message";
}

function serializeMessage(row: any) {
  const payload = row.payload ?? {};
  return {
    id: row.id,
    wamid: row.whatsapp_message_id,
    phone: row.phone,
    direction: row.direction ?? "inbound",
    status: row.status ?? "received",
    type: payload.type ?? "text",
    text: messagePreview(payload, row.direction),
    payload,
    time: row.sent_at ? new Date(row.sent_at).toISOString() : null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const organizationId = (session.user as { organizationId: string }).organizationId;
    const phone = req.nextUrl.searchParams.get("phone");

    const conversationsResult = await pool.query(
      `
      WITH latest AS (
        SELECT DISTINCT ON (m.phone)
          m.phone,
          m.direction,
          m.status,
          m.payload,
          m.sent_at,
          m.whatsapp_message_id
        FROM messages m
        WHERE m.organization_id = $1
          AND m.phone IS NOT NULL
          AND m.phone <> ''
        ORDER BY m.phone, m.sent_at DESC
      )
      SELECT
        l.phone,
        COALESCE(c.name, l.phone) AS contact_name,
        l.direction,
        l.status,
        l.payload,
        l.sent_at,
        l.whatsapp_message_id,
        (
          SELECT COUNT(*)
          FROM messages um
          WHERE um.organization_id = $1
            AND um.phone = l.phone
            AND um.direction = 'inbound'
        ) AS inbound_count,
        (
          SELECT COUNT(*)
          FROM messages tm
          WHERE tm.organization_id = $1
            AND tm.phone = l.phone
        ) AS message_count
      FROM latest l
      LEFT JOIN contacts c
        ON c.organization_id = $1
       AND c.phone = l.phone
      ORDER BY l.sent_at DESC NULLS LAST
      `,
      [organizationId]
    );

    const conversations = conversationsResult.rows.map((row) => ({
      phone: row.phone,
      name: row.contact_name || row.phone,
      direction: row.direction ?? "inbound",
      status: row.status ?? "received",
      preview: messagePreview(row.payload, row.direction),
      time: row.sent_at ? new Date(row.sent_at).toISOString() : null,
      messageId: row.whatsapp_message_id,
      inboundCount: Number(row.inbound_count ?? 0),
      messageCount: Number(row.message_count ?? 0),
    }));

    let messages: any[] = [];

    if (phone) {
      const result = await pool.query(
        `
        SELECT
          id,
          phone,
          whatsapp_message_id,
          status,
          direction,
          payload,
          sent_at
        FROM messages
        WHERE organization_id = $1
          AND phone = $2
        ORDER BY sent_at ASC NULLS LAST
        LIMIT 200
        `,
        [organizationId, phone]
      );

      messages = result.rows.map(serializeMessage);
    }

    return NextResponse.json({
      success: true,
      conversations,
      messages,
    });
  } catch (error: any) {
    console.error("Inbox GET failed:", error);

    return NextResponse.json(
      { success: false, message: error?.message ?? "Unable to load inbox." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const organizationId = (session.user as { organizationId: string }).organizationId;
    const { phone, text } = await req.json();

    if (!phone || !text?.trim()) {
      return NextResponse.json(
        { success: false, message: "Phone number and message are required." },
        { status: 400 }
      );
    }

    const account = await getConnectionByOrganization(organizationId);

    if (!account) {
      return NextResponse.json(
        { success: false, message: "WhatsApp account not connected." },
        { status: 400 }
      );
    }

    const accessToken = decrypt(account.access_token);

    const response = await metaPOST<any>(
      `/${account.phone_number_id}/messages`,
      accessToken,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: false,
          body: text.trim(),
        },
      }
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
        direction,
        payload,
        sent_at
      )
      VALUES
      ($1, NULL, $2, NULL, $3, $4, 'outbound', $5, NOW())
      `,
      [
        organizationId,
        phone,
        messageId,
        messageId ? "Sent" : "Failed",
        JSON.stringify({
          type: "text",
          text: { body: text.trim() },
        }),
      ]
    );

    return NextResponse.json({
      success: true,
      messageId,
    });
  } catch (error: any) {
    console.error("Inbox POST failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message ?? "Unable to send message.",
      },
      { status: 500 }
    );
  }
}
