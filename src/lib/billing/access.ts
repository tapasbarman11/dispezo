import pool from "@/lib/db";
import { getOrganizationPlan, PLAN_LIMITS } from "./plans";

export async function getOrganizationMemberRole(organizationId: string, userId: string) {
  const result = await pool.query(
    `SELECT role FROM organization_members
     WHERE organization_id=$1 AND user_id=$2 AND status='ACTIVE' LIMIT 1`,
    [organizationId, userId]
  );
  return result.rows[0]?.role ?? null;
}

export async function requireOrgRole(
  organizationId: string,
  userId: string,
  roles: Array<"OWNER" | "ADMIN" | "MEMBER">
) {
  const role = await getOrganizationMemberRole(organizationId, userId);
  if (!role || !roles.includes(role)) throw new Error("You do not have permission to perform this action.");
  return role;
}

export async function assertCanAddTeamMember(organizationId: string) {
  const plan = await getOrganizationPlan(organizationId);
  if (plan.limits.teamMembers === null) return plan;

  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM organization_members
     WHERE organization_id=$1 AND status IN ('ACTIVE','INVITED')`,
    [organizationId]
  );
  const current = Number(result.rows[0]?.count || 0);
  if (current >= plan.limits.teamMembers) {
    throw new Error(`Your ${plan.planCode} plan allows ${plan.limits.teamMembers} team members. Upgrade your plan to add more.`);
  }
  return plan;
}

export async function assertCanAddWhatsAppNumber(organizationId: string, phoneNumberId?: string | null) {
  const plan = await getOrganizationPlan(organizationId);

  if (phoneNumberId) {
    const existing = await pool.query(
      `SELECT id FROM whatsapp_accounts
       WHERE organization_id=$1 AND phone_number_id=$2 LIMIT 1`,
      [organizationId, phoneNumberId]
    );
    if (existing.rows.length) return plan;
  }

  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM whatsapp_accounts
     WHERE organization_id=$1 AND COALESCE(status,'connected') <> 'deleted'`,
    [organizationId]
  );
  const current = Number(result.rows[0]?.count || 0);
  if (current >= plan.limits.whatsappNumbers) {
    throw new Error(`Your ${plan.planCode} plan allows ${plan.limits.whatsappNumbers} WhatsApp number(s). Upgrade your plan to add another number.`);
  }
  return plan;
}

export async function getPlanUsage(organizationId: string) {
  const [members, numbers] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM organization_members WHERE organization_id=$1 AND status='ACTIVE'`, [organizationId]),
    pool.query(`SELECT COUNT(*)::int AS count FROM whatsapp_accounts WHERE organization_id=$1 AND COALESCE(status,'connected') <> 'deleted'`, [organizationId]),
  ]);
  return {
    teamMembers: Number(members.rows[0]?.count || 0),
    whatsappNumbers: Number(numbers.rows[0]?.count || 0),
  };
}

export { PLAN_LIMITS };
