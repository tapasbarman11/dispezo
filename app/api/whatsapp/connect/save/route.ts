import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import pool from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { saveConnection } from "@/lib/api/whatsapp/service";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
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

    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Access Token is required.",
        },
        {
          status: 400,
        }
      );
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        organization_id
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [session.user.email]
    );

    if (!userResult.rows.length) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const user = userResult.rows[0];

    const account = await saveConnection(
      accessToken,
      user.organization_id,
      user.id
    );

    return NextResponse.json({
      success: true,
      message: "WhatsApp Business connected successfully.",
      account,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to connect WhatsApp Business.",
      },
      {
        status: 500,
      }
    );
  }
}