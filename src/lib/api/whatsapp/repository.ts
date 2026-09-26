import pool from "@/lib/db";

export interface WhatsAppConnection {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  business_manager_id: string | null;
  business_id?: string | null;
  waba_id: string;
  phone_number_id: string;
  access_token: string;
  phone_number: string;
  display_name: string;
  meta_business_name: string;
  verified_name?: string | null;
  quality_rating: string;
  messaging_limit: string;
  status: string;
  webhook_status: string;
  coexistence_enabled: boolean;
  is_coexistence?: boolean;
  token_expires_at: Date | null;
  connected_at: Date;
  last_synced_at: Date | null;
}

export async function getConnections(organizationId: string): Promise<WhatsAppConnection[]> {
  const r = await pool.query(
    `SELECT * FROM whatsapp_accounts
      WHERE organization_id = $1
        AND COALESCE(status, 'connected') <> 'deleted'
      ORDER BY CASE WHEN COALESCE(status, 'connected') = 'connected' THEN 0 ELSE 1 END,
               last_synced_at DESC NULLS LAST,
               connected_at DESC NULLS LAST`,
    [organizationId]
  );
  return r.rows;
}

export async function getConnection(organizationId: string) {
  return (await getConnections(organizationId))[0] ?? null;
}

/**
 * Compatibility lookup for accounts created before organization membership
 * became the source of truth. If the signed-in user owns the current
 * organization and an older account was stored against that user's previous
 * organization, repair the mapping once and return the account.
 */
export async function getConnectionForUser(organizationId: string, userId: string) {
  const current = await getConnection(organizationId);
  if (current) return current;

  const legacy = await pool.query(
    `SELECT wa.*
       FROM whatsapp_accounts wa
       JOIN organizations old_org ON old_org.id = wa.organization_id
       JOIN organizations current_org ON current_org.id = $1
      WHERE wa.created_by_user_id = $2
        AND COALESCE(wa.status, 'connected') <> 'deleted'
        AND current_org.owner_user_id = $2
      ORDER BY wa.last_synced_at DESC NULLS LAST,
               wa.connected_at DESC NULLS LAST
      LIMIT 1`,
    [organizationId, userId]
  );

  const account = legacy.rows[0];
  if (!account) return null;

  await pool.query(
    `UPDATE whatsapp_accounts
        SET organization_id = $1,
            updated_at = NOW()
      WHERE id = $2`,
    [organizationId, account.id]
  );

  return { ...account, organization_id: organizationId };
}

export async function getConnectionCount(organizationId: string) {
  const r = await pool.query(
    `SELECT COUNT(*)::int AS count FROM whatsapp_accounts
      WHERE organization_id = $1
        AND COALESCE(status, 'connected') <> 'deleted'`,
    [organizationId]
  );
  return Number(r.rows[0]?.count || 0);
}

export async function isConnected(organizationId: string) {
  return (await getConnectionCount(organizationId)) > 0;
}

export interface SaveConnectionInput {
  organizationId: string; createdByUserId: string; businessId: string; businessName: string;
  wabaId: string; phoneNumberId: string; displayPhoneNumber: string; verifiedName: string;
  accessToken: string; qualityRating: string; messagingLimit: string; appId?: string; tokenType?: string;
}

export async function saveConnection(data: SaveConnectionInput) {
  const r = await pool.query(
    `INSERT INTO whatsapp_accounts
      (organization_id, created_by_user_id, business_manager_id, meta_business_name,
       waba_id, phone_number_id, access_token, phone_number, display_name,
       quality_rating, messaging_limit, status, webhook_status, connected_at, last_synced_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'connected','active',NOW(),NOW())
     ON CONFLICT(phone_number_id) DO UPDATE SET
       organization_id=EXCLUDED.organization_id, created_by_user_id=EXCLUDED.created_by_user_id,
       business_manager_id=EXCLUDED.business_manager_id, meta_business_name=EXCLUDED.meta_business_name,
       waba_id=EXCLUDED.waba_id, access_token=EXCLUDED.access_token, phone_number=EXCLUDED.phone_number,
       display_name=EXCLUDED.display_name, quality_rating=EXCLUDED.quality_rating,
       messaging_limit=EXCLUDED.messaging_limit, status='connected', webhook_status='active', last_synced_at=NOW()
     RETURNING *`,
    [data.organizationId,data.createdByUserId,data.businessId,data.businessName,data.wabaId,data.phoneNumberId,
     data.accessToken,data.displayPhoneNumber,data.verifiedName,data.qualityRating,data.messagingLimit]
  );
  return r.rows[0];
}

export async function updateConnection(organizationId: string, updates: Record<string, unknown>) {
  const fields: string[] = [];
  const values: unknown[] = [];
  Object.entries(updates).forEach(([key, value], index) => {
    fields.push(`${key} = $${index + 2}`);
    values.push(value);
  });
  if (!fields.length) return;
  values.unshift(organizationId);
  await pool.query(`UPDATE whatsapp_accounts SET ${fields.join(", ")} WHERE organization_id = $1`, values);
}

export async function deleteConnection(organizationId: string, id?: string) {
  if (id) {
    await pool.query(`DELETE FROM whatsapp_accounts WHERE id=$1 AND organization_id=$2`, [id, organizationId]);
    return;
  }
  await pool.query(`DELETE FROM whatsapp_accounts WHERE organization_id=$1`, [organizationId]);
}

export async function updateLastSynced(organizationId: string) {
  await pool.query(`UPDATE whatsapp_accounts SET last_synced_at=NOW(), updated_at=NOW() WHERE organization_id=$1`, [organizationId]);
}
