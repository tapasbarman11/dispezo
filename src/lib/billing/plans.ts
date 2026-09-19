import pool from "@/lib/db";

export type PlanCode = "FREE" | "STARTER" | "GROWTH" | "SCALE";

export const PLAN_LIMITS: Record<PlanCode, {
  teamMembers: number | null;
  whatsappNumbers: number;
  broadcastRecipients: number;
  googleReviewAutoresponder: boolean;
}> = {
  FREE: { teamMembers: 2, whatsappNumbers: 1, broadcastRecipients: 500, googleReviewAutoresponder: false },
  STARTER: { teamMembers: null, whatsappNumbers: 2, broadcastRecipients: 5_000, googleReviewAutoresponder: false },
  GROWTH: { teamMembers: null, whatsappNumbers: 5, broadcastRecipients: 50_000, googleReviewAutoresponder: true },
  SCALE: { teamMembers: null, whatsappNumbers: 10, broadcastRecipients: 250_000, googleReviewAutoresponder: true },
};

export function normalizePlan(value: unknown): PlanCode {
  const plan = String(value || "FREE").toUpperCase();
  return plan in PLAN_LIMITS ? (plan as PlanCode) : "FREE";
}

export async function getOrganizationPlan(organizationId: string) {
  const result = await pool.query(
    `SELECT plan_code AS "planCode", subscription_status AS "subscriptionStatus"
     FROM organizations WHERE id=$1 LIMIT 1`,
    [organizationId]
  );
  if (!result.rows.length) throw new Error("Organization not found.");
  const planCode = normalizePlan(result.rows[0].planCode);
  return {
    planCode,
    subscriptionStatus: result.rows[0].subscriptionStatus || "ACTIVE",
    limits: PLAN_LIMITS[planCode],
  };
}
