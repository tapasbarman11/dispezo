import pool from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { metaPOST } from "@/lib/meta/client";
import { getConnection } from "@/lib/api/whatsapp/repository";
import {
  getCampaign,
  getVariableConfig,
  markCampaignStarted,
  finalizeCampaign,
  updateCampaignAggregateFromTracking,
  updateCampaignError,
} from "./repository";
import { recordMessageSent, maybeFinalizeCampaign } from "./tracking";
import { getContactsByTag, Contact } from "@/lib/api/contacts/repository";
import { getTemplateByName } from "./template";
import { maybeSyncMetaPricing } from "@/lib/meta/pricing";

const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_CAMPAIGN_LIMIT = 3;

type MetaSendResponse = { messages?: Array<{ id: string }> };

type VariableMap = Record<string, string>;

type WorkerResult = {
  campaign: any;
  processed: number;
  remaining: number;
  completed: boolean;
};

function valueFor(contact: Contact, field: string): string {
  if (field === "name") return contact.name ?? "";
  if (field === "phone") return contact.phone;
  if (field === "email") return contact.email ?? "";
  return String(contact.customFields?.[field] ?? "");
}

function buildParameters(
  contact: Contact,
  vars: string[],
  mapping: VariableMap,
  manual: VariableMap
) {
  return vars.map((variable) => {
    const source = mapping[variable];
    const text = source === "__manual__"
      ? String(manual[variable] ?? "")
      : valueFor(contact, source || "");
    return { type: "text", text };
  });
}

function templateVariables(body: string | null | undefined) {
  return [...new Set(
    Array.from((body ?? "").matchAll(/\{\{(\d+)\}\}/g)).map((m) => m[1])
  )].sort((a, b) => Number(a) - Number(b));
}

async function recordContactFailure(
  campaignId: string,
  organizationId: string,
  phone: string,
  reason: string
) {
  await pool.query(
    `INSERT INTO broadcast_message_tracking
      (id,campaign_id,organization_id,phone,status,failed_at,failed_reason,created_at,updated_at)
     VALUES (gen_random_uuid(),$1,$2,$3,'failed',NOW(),$4,NOW(),NOW())
     ON CONFLICT DO NOTHING`,
    [campaignId, organizationId, phone, reason.slice(0, 1000)]
  );
}

export async function executeCampaignBatch(
  campaignId: string,
  organizationId: string,
  batchSize = DEFAULT_BATCH_SIZE
): Promise<WorkerResult> {
  const campaign = await getCampaign(campaignId, organizationId);
  if (!campaign) throw new Error("Campaign not found.");
  if (campaign.status === "COMPLETED") {
    return { campaign, processed: 0, remaining: 0, completed: true };
  }

  const template = await getTemplateByName(organizationId, campaign.templateName);
  if (!template) throw new Error("Template not found.");
  if ((template.status ?? "").toUpperCase() !== "APPROVED") {
    throw new Error("Only approved templates can be broadcast.");
  }

  const connection = await getConnection(organizationId);
  if (!connection) throw new Error("WhatsApp connection not found.");
  const accessToken = decrypt(connection.access_token);

  await markCampaignStarted(campaignId);

  const contacts = (await getContactsByTag(organizationId, campaign.audienceTag ?? ""))
    .slice(0, campaign.totalContacts);
  const tracked = await pool.query(
    `SELECT phone FROM broadcast_message_tracking WHERE campaign_id=$1`,
    [campaignId]
  );
  const processedPhones = new Set(tracked.rows.map((row: any) => row.phone));
  const pending = contacts
    .filter((contact) => !processedPhones.has(contact.phone))
    .slice(0, Math.max(1, batchSize));

  const config = await getVariableConfig(campaignId, organizationId);
  const mapping: VariableMap = config?.variable_mapping ?? {};
  const manual: VariableMap = config?.manual_variable_values ?? {};
  const vars = templateVariables(template.body);

  for (const contact of pending) {
    try {
      const components: any[] = [];
      if (vars.length) {
        components.push({
          type: "body",
          parameters: buildParameters(contact, vars, mapping, manual),
        });
      }

      const payload: any = {
        messaging_product: "whatsapp",
        to: contact.phone,
        type: "template",
        template: {
          name: template.name,
          language: { code: template.language || "en_US" },
          components,
        },
      };

      const response = await metaPOST<MetaSendResponse>(
        `/${connection.phone_number_id}/messages`,
        accessToken,
        payload
      );
      const messageId = response.messages?.[0]?.id;
      if (!messageId) throw new Error("Meta did not return a message ID.");
      await recordMessageSent(campaignId, organizationId, contact.phone, messageId);
    } catch (error: any) {
      await recordContactFailure(
        campaignId,
        organizationId,
        contact.phone,
        String(error?.message ?? "Send failed")
      );
    }
  }

  await updateCampaignAggregateFromTracking(campaignId);
  const completed = await maybeFinalizeCampaign(campaignId);
  const trackedCount = await pool.query(
    `SELECT COUNT(*)::int AS count FROM broadcast_message_tracking WHERE campaign_id=$1`,
    [campaignId]
  );
  const remaining = Math.max(
    0,
    contacts.length - Number(trackedCount.rows[0]?.count ?? 0)
  );

  if (!completed && remaining === 0) {
    await finalizeCampaign(campaignId);
  }

  return {
    campaign: await getCampaign(campaignId, organizationId),
    processed: pending.length,
    remaining,
    completed: completed || remaining === 0,
  };
}

/**
 * Claims due campaigns using PostgreSQL row locks, then processes each claim.
 * The claim is released before Meta calls, so the long-running send does not
 * hold a database transaction open. A short-lived advisory lock prevents a
 * second worker from processing the same campaign at the same time.
 */
export async function executeDueCampaigns(
  limit = DEFAULT_CAMPAIGN_LIMIT,
  batchSize = DEFAULT_BATCH_SIZE
) {
  await maybeSyncMetaPricing("INR");
  await pool.query(`DELETE FROM broadcast_message_tracking WHERE expires_at < NOW()`);

  const client = await pool.connect();
  let rows: Array<{ id: string; organization_id: string }> = [];
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `SELECT id, organization_id
       FROM campaigns
       WHERE (status='SCHEDULED' AND scheduled_at <= NOW())
          OR status='IN_PROGRESS'
       ORDER BY COALESCE(scheduled_at, started_at, created_at) ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [limit]
    );
    rows = result.rows;
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }

  const results: any[] = [];
  for (const row of rows) {
    const lockClient = await pool.connect();
    let locked = false;
    try {
      const lock = await lockClient.query(
        `SELECT pg_try_advisory_lock(hashtext($1)) AS locked`,
        [row.id]
      );
      locked = Boolean(lock.rows[0]?.locked);
      if (!locked) continue;

      results.push(
        await executeCampaignBatch(row.id, row.organization_id, batchSize)
      );
    } catch (error: any) {
      await updateCampaignError(row.id, error?.message ?? "Worker failed");
      results.push({ id: row.id, error: error?.message ?? "Worker failed" });
    } finally {
      if (locked) {
        await lockClient.query(
          `SELECT pg_advisory_unlock(hashtext($1))`,
          [row.id]
        ).catch(() => undefined);
      }
      lockClient.release();
    }
  }

  return results;
}
