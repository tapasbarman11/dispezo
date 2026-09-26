import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function getSessionContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const sessionUser = session.user as any;

  // Prefer the organization already resolved by NextAuth, but always have
  // a DB fallback. This makes APIs resilient immediately after onboarding
  // and for older browser sessions whose JWT predates organization creation.
  if (sessionUser.organizationId && sessionUser.id) {
    return {
      session,
      userId: String(sessionUser.id),
      organizationId: String(sessionUser.organizationId),
      role: sessionUser.role ?? "OWNER",
      planCode: sessionUser.planCode ?? "FREE",
    };
  }

  const result = await pool.query(
    `
    SELECT
      u.id,
      COALESCE(m.organization_id, o.id) AS organization_id,
      COALESCE(m.role, 'OWNER') AS role,
      COALESCE(org.plan_code, 'FREE') AS plan_code
    FROM users u
    LEFT JOIN organizations o
      ON o.owner_user_id = u.id
     AND o.is_default = true
    LEFT JOIN LATERAL (
      SELECT om.organization_id, om.role
      FROM organization_members om
      JOIN organizations mo ON mo.id = om.organization_id
      WHERE om.user_id = u.id
        AND om.status = 'ACTIVE'
      ORDER BY
        CASE WHEN om.role = 'OWNER' THEN 0 ELSE 1 END,
        mo.is_default DESC,
        om.created_at ASC
      LIMIT 1
    ) m ON true
    LEFT JOIN organizations org
      ON org.id = COALESCE(m.organization_id, o.id)
    WHERE u.email = $1
    LIMIT 1
    `,
    [session.user.email]
  );

  if (!result.rows.length || !result.rows[0].organization_id) {
    return null;
  }

  const row = result.rows[0];
  return {
    session,
    userId: String(row.id),
    organizationId: String(row.organization_id),
    role: row.role ?? "OWNER",
    planCode: row.plan_code ?? "FREE",
  };
}
