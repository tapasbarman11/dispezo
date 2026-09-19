import pool from "@/lib/db";

export type CampaignStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";

export interface Campaign {
  id: string;
  organizationId: string;
  campaignName: string;
  templateName: string;
  templateCategory: string | null;
  audienceTag: string | null;
  status: CampaignStatus;
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  readCount: number;
  unitCost: number;
  totalCost: number;
  scheduledAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  executionDurationMs: number | null;
  createdAt: Date;
  lastError: string | null;
}

export interface CreateCampaignInput {
  organizationId: string;
  campaignName: string;
  templateName: string;
  templateCategory: string;
  audienceTag: string;
  totalContacts: number;
  unitCost: number;
  variableMapping: Record<string, string>;
  manualVariableValues: Record<string, string>;
  scheduledAt?: Date | null;
}

const select = `
  SELECT id, organization_id AS "organizationId", campaign_name AS "campaignName",
    template_name AS "templateName", template_category AS "templateCategory",
    audience_tag AS "audienceTag", status, total_contacts AS "totalContacts",
    sent_count AS "sentCount", delivered_count AS "deliveredCount",
    failed_count AS "failedCount", read_count AS "readCount",
    unit_cost AS "unitCost", total_cost AS "totalCost",
    scheduled_at AS "scheduledAt", started_at AS "startedAt",
    completed_at AS "completedAt", execution_duration_ms AS "executionDurationMs",
    created_at AS "createdAt", last_error AS "lastError"
  FROM campaigns`;

export async function createCampaign(data: CreateCampaignInput): Promise<Campaign> {
  const status: CampaignStatus = data.scheduledAt ? "SCHEDULED" : "IN_PROGRESS";
  const result = await pool.query(
    `INSERT INTO campaigns
      (id, organization_id, campaign_name, template_name, template_category, audience_tag,
       status, total_contacts, sent_count, delivered_count, failed_count, read_count,
       unit_cost, total_cost, scheduled_at, started_at, variable_mapping,
       manual_variable_values, created_at)
     VALUES
      (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,0,0,0,0,$8,$7::numeric * $8::numeric,$9,
       CASE WHEN $9 IS NULL THEN NOW() ELSE NULL END,$10::jsonb,$11::jsonb,NOW())
     RETURNING ${select.replace(/^\s*SELECT[\s\S]*?\s+FROM campaigns$/, "*")}`,
    [data.organizationId, data.campaignName.trim(), data.templateName, data.templateCategory.toUpperCase(), data.audienceTag, status, data.totalContacts, data.unitCost, data.scheduledAt ?? null, JSON.stringify(data.variableMapping ?? {}), JSON.stringify(data.manualVariableValues ?? {})]
  );
  return mapCampaign(result.rows[0]);
}

function mapCampaign(row: any): Campaign {
  return {
    id: row.id, organizationId: row.organization_id, campaignName: row.campaign_name,
    templateName: row.template_name, templateCategory: row.template_category,
    audienceTag: row.audience_tag, status: row.status, totalContacts: Number(row.total_contacts ?? 0),
    sentCount: Number(row.sent_count ?? 0), deliveredCount: Number(row.delivered_count ?? 0),
    failedCount: Number(row.failed_count ?? 0), readCount: Number(row.read_count ?? 0),
    unitCost: Number(row.unit_cost ?? 0), totalCost: Number(row.total_cost ?? 0),
    scheduledAt: row.scheduled_at, startedAt: row.started_at, completedAt: row.completed_at,
    executionDurationMs: row.execution_duration_ms == null ? null : Number(row.execution_duration_ms),
    createdAt: row.created_at, lastError: row.last_error ?? null,
  };
}

export async function getCampaign(id: string, organizationId: string): Promise<Campaign | null> {
  const result = await pool.query(`${select} WHERE id=$1 AND organization_id=$2 LIMIT 1`, [id, organizationId]);
  return result.rows.length ? mapCampaign(result.rows[0]) : null;
}

export async function listCampaigns(organizationId: string, page: number, pageSize: number) {
  const offset = Math.max(0, page - 1) * pageSize;
  const [rows, count] = await Promise.all([
    pool.query(`${select} WHERE organization_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [organizationId, pageSize, offset]),
    pool.query(`SELECT COUNT(*)::int AS total FROM campaigns WHERE organization_id=$1`, [organizationId]),
  ]);
  return { campaigns: rows.rows.map(mapCampaign), total: count.rows[0].total as number };
}

export async function markCampaignStarted(id: string) {
  await pool.query(`UPDATE campaigns SET status='IN_PROGRESS', started_at=COALESCE(started_at,NOW()), last_error=NULL WHERE id=$1`, [id]);
}

export async function incrementSent(id: string) {
  await pool.query(`UPDATE campaigns SET sent_count=sent_count+1, updated_at=NOW() WHERE id=$1`, [id]);
}

export async function finalizeCampaign(id: string) {
  await pool.query(`UPDATE campaigns SET status='COMPLETED', completed_at=NOW(), execution_duration_ms=EXTRACT(EPOCH FROM (NOW()-COALESCE(started_at,NOW()))*1000)::bigint, updated_at=NOW() WHERE id=$1`, [id]);
}

export async function updateCampaignError(id: string, error: string) {
  await pool.query(`UPDATE campaigns SET last_error=$2, updated_at=NOW() WHERE id=$1`, [id, error.slice(0, 2000)]);
}

export async function updateCampaignAggregateFromTracking(id: string) {
  await pool.query(
    `UPDATE campaigns c SET
      sent_count = x.sent_count,
      delivered_count = x.delivered_count,
      failed_count = x.failed_count,
      read_count = x.read_count,
      total_cost = c.unit_cost * x.sent_count,
      updated_at = NOW()
     FROM (
       SELECT campaign_id,
         COUNT(*) FILTER (WHERE sent_at IS NOT NULL)::int AS sent_count,
         COUNT(*) FILTER (WHERE delivered_at IS NOT NULL)::int AS delivered_count,
         COUNT(*) FILTER (WHERE failed_at IS NOT NULL)::int AS failed_count,
         COUNT(*) FILTER (WHERE read_at IS NOT NULL)::int AS read_count
       FROM broadcast_message_tracking WHERE campaign_id=$1 GROUP BY campaign_id
     ) x WHERE c.id=x.campaign_id`, [id]
  );
}

export async function getVariableConfig(id: string, organizationId: string) {
  const result = await pool.query(`SELECT variable_mapping, manual_variable_values FROM campaigns WHERE id=$1 AND organization_id=$2`, [id, organizationId]);
  return result.rows[0] ?? null;
}
