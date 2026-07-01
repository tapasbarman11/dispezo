
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          authenticated: false,
        },
        { status: 401 }
      );
    }

    const userResult = await pool.query(
      `
      SELECT
        id,
        is_phone_verified
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({
        authenticated: true,
        profileCompleted: false,
        organizationCount: 0,
        whatsappCount: 0,
        completionPercent: 0,
        currentStep: 1,
      });
    }

    const user = userResult.rows[0];

    const profileCompleted =
      user.is_phone_verified === true;

    const orgResult = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM organizations
      WHERE owner_user_id = $1
      `,
      [user.id]
    );

    const organizationCount =
      orgResult.rows[0].count;

    const whatsappResult = await pool.query(
      `
  SELECT COUNT(*)::int AS count
  FROM whatsapp_accounts
  WHERE organization_id IN (
      SELECT id
      FROM organizations
      WHERE owner_user_id = $1
  )
  `,
      [user.id]
    );

    const whatsappCount =
      whatsappResult.rows[0].count;

    let completedSteps = 0;

    if (profileCompleted)
      completedSteps++;

    if (organizationCount > 0)
      completedSteps++;

    if (whatsappCount > 0)
      completedSteps++;

    const completionPercent =
      Math.round(
        (completedSteps / 3) * 100
      );

    let currentStep = 1;

    if (!profileCompleted) {
      currentStep = 1;
    } else if (
      organizationCount === 0
    ) {
      currentStep = 2;
    } else if (
      whatsappCount === 0
    ) {
      currentStep = 3;
    } else {
      currentStep = 4;
    }

    return NextResponse.json({
      authenticated: true,
      profileCompleted,
      organizationCount,
      whatsappCount,
      completionPercent,
      currentStep,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 500 }
    );
  }
}