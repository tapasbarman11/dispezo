
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userResult = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [session.user.email]
  );

  if (userResult.rows.length === 0) {
    return NextResponse.json(
      {},
      { status: 404 }
    );
  }

  const userId = userResult.rows[0].id;

  const orgResult = await pool.query(
    `
    SELECT
      name,
      business_type,
      website
    FROM organizations
    WHERE owner_user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId]
  );

  if (orgResult.rows.length === 0) {
    return NextResponse.json({});
  }

  return NextResponse.json(
    orgResult.rows[0]
  );
}