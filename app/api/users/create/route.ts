import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    await pool.query(
      `
      INSERT INTO users (
        email,
        google_id,
        full_name,
        phone,
        country_code,
        country,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        avatar_url,
        is_email_verified,
        is_phone_verified,
        phone_verified_at,
        last_login,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        true,
        true,
        NOW(),
        NOW(),
        NOW()
      )
      ON CONFLICT (email)
      DO UPDATE SET
        google_id = EXCLUDED.google_id,
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        country_code = EXCLUDED.country_code,
        country = EXCLUDED.country,
        address_line_1 = EXCLUDED.address_line_1,
        address_line_2 = EXCLUDED.address_line_2,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        postal_code = EXCLUDED.postal_code,
        avatar_url = EXCLUDED.avatar_url,
        is_phone_verified = true,
        phone_verified_at = NOW(),
        last_login = NOW(),
        updated_at = NOW()
      `,
      [
        session.user.email,
        (session.user as any)?.googleId || null,
        session.user.name || "",
        body.phone,
        body.countryCode,
        body.country,
        body.addressLine1,
        body.addressLine2 || null,
        body.city,
        body.state,
        body.postalCode,
        session.user.image || null,
      ]
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("PROFILE SAVE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}