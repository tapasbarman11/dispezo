
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
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const userId = userResult.rows[0].id;

    const existingOrg = await pool.query(
      `
      SELECT id
      FROM organizations
      WHERE owner_user_id = $1
      AND is_default = true
      LIMIT 1
      `,
      [userId]
    );

    // UPDATE EXISTING DEFAULT BUSINESS
    if (existingOrg.rows.length > 0) {
      const organizationId =
        existingOrg.rows[0].id;

      await pool.query(
        `
        UPDATE organizations
        SET
          name = $1,
          business_type = $2,
          website = $3,
          updated_at = NOW()
        WHERE id = $4
        `,
        [
          body.businessName,
          body.businessType,
          body.website || null,
          organizationId,
        ]
      );

      return NextResponse.json({
        success: true,
        organizationId,
        mode: "updated",
      });
    }

    // CREATE FIRST BUSINESS
    const organizationResult = await pool.query(
      `
      INSERT INTO organizations (
        name,
        business_type,
        website,
        owner_user_id,
        is_default,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        true,
        true,
        NOW(),
        NOW()
      )
      RETURNING id
      `,
      [
        body.businessName,
        body.businessType,
        body.website || null,
        userId,
      ]
    );

    return NextResponse.json({
      success: true,
      organizationId:
        organizationResult.rows[0].id,
      mode: "created",
    });
  } catch (error: any) {
    console.error(
      "CREATE ORGANIZATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error.message ||
          "Failed to create organization",
      },
      { status: 500 }
    );
  }
}