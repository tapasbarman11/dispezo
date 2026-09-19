import pool from "@/lib/db";
import { finalizeCampaign, updateCampaignAggregateFromTracking } from "./repository";

export async function recordMessageSent(campaignId: string, organizationId: string, phone: string, messageId: string) {
  await pool.query(
    `INSERT INTO broadcast_message_tracking
      (id,campaign_id,organization_id,phone,whatsapp_message_id,status,sent_at,created_at,updated_at)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,'sent',NOW(),NOW(),NOW())
     ON CONFLICT (whatsapp_message_id) DO UPDATE SET status='sent', sent_at=COALESCE(broadcast_message_tracking.sent_at,NOW()), updated_at=NOW()`,
    [campaignId, organizationId, phone, messageId]
  );
}

export async function recordMessageStatus(messageId: string, status: string, reason?: string) {
  const normalized = status.toLowerCase();
  const result = await pool.query(
    `UPDATE broadcast_message_tracking SET
       status=$2,
       delivered_at=CASE WHEN $2='delivered' THEN COALESCE(delivered_at,NOW()) ELSE delivered_at END,
       read_at=CASE WHEN $2='read' THEN COALESCE(read_at,NOW()) ELSE read_at END,
       failed_at=CASE WHEN $2='failed' THEN COALESCE(failed_at,NOW()) ELSE failed_at END,
       failed_reason=CASE WHEN $2='failed' THEN COALESCE($3,failed_reason) ELSE failed_reason END,
       updated_at=NOW()
     WHERE whatsapp_message_id=$1
     RETURNING campaign_id`,
    [messageId, normalized, reason ?? null]
  );
  if (!result.rows.length) return null;
  const campaignId = result.rows[0].campaign_id as string;
  await updateCampaignAggregateFromTracking(campaignId);
  return campaignId;
}

export async function maybeFinalizeCampaign(campaignId: string) {
  const result = await pool.query(
    `SELECT total_contacts,
       COUNT(*) FILTER (WHERE sent_at IS NOT NULL)::int AS tracked_sent,
       COUNT(*) FILTER (WHERE failed_at IS NOT NULL)::int AS tracked_failed
     FROM campaigns c LEFT JOIN broadcast_message_tracking t ON t.campaign_id=c.id
     WHERE c.id=$1 GROUP BY c.id`, [campaignId]
  );
  if (!result.rows.length) return false;
  const row = result.rows[0];
  const finished = Number(row.tracked_sent) + Number(row.tracked_failed) >= Number(row.total_contacts);
  if (finished) {
    await updateCampaignAggregateFromTracking(campaignId);
    await finalizeCampaign(campaignId);
    // Keep short-lived message-id correlation so late Meta read/delivery webhooks
    // can still update campaign aggregates. A cleanup job can remove rows after expires_at.
  }
  return finished;
}
