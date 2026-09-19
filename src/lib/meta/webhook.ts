import pool from "@/lib/db";
import { recordMessageStatus } from "@/lib/api/campaigns/tracking";

/** Current scope: no Inbox storage. Status webhooks update direct activity and broadcast aggregates. */
export async function processWebhook(payload: any) {
  if (!payload?.entry) return;
  for (const entry of payload.entry) {
    const wabaId = entry.id;
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      try {
        if (value.statuses) for (const status of value.statuses) await handleStatus(status);
        if (change.field === "smb_app_state_sync") await handleContactStateSync(wabaId, value);
      } catch (error) {
        console.error(`Webhook handler failed for field ${change.field}:`, error);
      }
    }
  }
}

async function handleStatus(status: any) {
  const campaignId = await recordMessageStatus(status.id, status.status, status.errors?.[0]?.title || status.errors?.[0]?.message);
  if (campaignId) return;
  const normalized = status.status === "failed" ? "Failed" : status.status === "delivered" ? "Delivered" : status.status === "read" ? "Read" : status.status === "sent" ? "Sent" : status.status;
  await pool.query(
    `UPDATE messages SET status=$1,
       delivered_at=CASE WHEN $1='Delivered' THEN COALESCE(delivered_at,NOW()) ELSE delivered_at END,
       read_at=CASE WHEN $1='Read' THEN COALESCE(read_at,NOW()) ELSE read_at END
     WHERE whatsapp_message_id=$2 AND message_source='DIRECT_API'`,
    [normalized, status.id]
  );
}

async function getAccountByWabaId(wabaId: string) {
  const result = await pool.query(`SELECT organization_id FROM whatsapp_accounts WHERE waba_id=$1 LIMIT 1`, [wabaId]);
  return result.rows[0]?.organization_id as string | undefined;
}

async function handleContactStateSync(wabaId: string, value: any) {
  const organizationId = await getAccountByWabaId(wabaId);
  if (!organizationId) return;
  for (const item of value.state_sync ?? []) {
    if (item.type !== "contact") continue;
    const phone = item.contact?.phone_number;
    if (!phone) continue;
    if (item.action === "remove") {
      await pool.query(`DELETE FROM contacts WHERE organization_id=$1 AND phone=$2`, [organizationId, phone]);
      continue;
    }
    const name = item.contact?.full_name || item.contact?.first_name || null;
    const updated = await pool.query(`UPDATE contacts SET name=COALESCE($3,name), updated_at=NOW() WHERE organization_id=$1 AND phone=$2`, [organizationId, phone, name]);
    if (!updated.rowCount) {
      await pool.query(`INSERT INTO contacts (id,organization_id,name,phone,tag,source,custom_fields,created_at,updated_at) VALUES (gen_random_uuid(),$1,$2,$3,'WhatsApp Contacts','coexistence_sync','{}'::jsonb,NOW(),NOW())`, [organizationId,name,phone]);
    }
  }
}
