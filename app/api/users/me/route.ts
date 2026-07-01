
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json(
            { authenticated: false },
            { status: 401 }
        );
    }

    const result = await pool.query(
        `
    SELECT
      phone,
      country,
      country_code,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
        [session.user.email]
    );

    if (result.rows.length === 0) {
        return NextResponse.json(
            { exists: false }
        );
    }

    return NextResponse.json({
        authenticated: true,
        exists: true,
        ...result.rows[0],
    });
}