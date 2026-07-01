import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

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

        const result = await pool.query(
            `
  SELECT
      id,
      phone,
      template_name,
      whatsapp_message_id,
      status,
      sent_at
  FROM messages
  WHERE organization_id = $1
  ORDER BY sent_at DESC
  LIMIT 20
  `,
            [organizationId]
        );

        return NextResponse.json({
            success: true,
            messages: result.rows.map((row) => ({
                id: row.id,
                recipient: row.phone,
                template: row.template_name,
                status: row.status,
                messageId: row.whatsapp_message_id,
                time: row.sent_at,
            })),
        });

    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            {
                status: 500,
            }
        );
    }
}