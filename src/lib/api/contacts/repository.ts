import pool from "@/lib/db";

export interface Contact {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  tag: string | null;
  source: string | null;
  customFields: Record<string, string>;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface ContactInput {
  name?: string;
  phone: string;
  email?: string;
  tag?: string | null;
  customFields?: Record<string, string>;
}

function mapContact(row: any): Contact {
  return {
    id: row.id,
    name: row.name ?? null,
    phone: row.phone,
    email: row.email ?? null,
    tag: row.tag ?? null,
    source: row.source ?? null,
    customFields: row.custom_fields ?? {},
    organizationId: row.organization_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  };
}

export async function listContacts(
  organizationId: string,
  opts: { page: number; pageSize: number; search?: string; tag?: string }
): Promise<{ contacts: Contact[]; total: number }> {
  const page = Math.max(1, opts.page);
  const pageSize = Math.min(100, Math.max(1, opts.pageSize));
  const offset = (page - 1) * pageSize;
  const search = (opts.search ?? "").trim();
  const tag = (opts.tag ?? "").trim();

  const values: unknown[] = [organizationId];
  const where = ["organization_id = $1"];

  if (search) {
    values.push(`%${search}%`);
    where.push(`(name ILIKE $${values.length} OR phone ILIKE $${values.length} OR email ILIKE $${values.length} OR tag ILIKE $${values.length} OR custom_fields::text ILIKE $${values.length})`);
  }
  if (tag) {
    values.push(tag);
    where.push(`tag = $${values.length}`);
  }

  const countValues = [...values];
  const listValues = [...values, pageSize, offset];
  const whereSql = where.join(" AND ");

  const [count, rows] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM contacts WHERE ${whereSql}`, countValues),
    pool.query(
      `SELECT id, organization_id, name, phone, email, tag, source, custom_fields, created_at, updated_at
       FROM contacts WHERE ${whereSql}
       ORDER BY created_at DESC LIMIT $${listValues.length - 1} OFFSET $${listValues.length}`,
      listValues
    ),
  ]);

  return { contacts: rows.rows.map(mapContact), total: count.rows[0].total };
}

export async function getContact(id: string, organizationId: string): Promise<Contact | null> {
  const result = await pool.query(
    `SELECT id, organization_id, name, phone, email, tag, source, custom_fields, created_at, updated_at
     FROM contacts WHERE id=$1 AND organization_id=$2 LIMIT 1`,
    [id, organizationId]
  );
  return result.rows.length ? mapContact(result.rows[0]) : null;
}

export async function createContact(organizationId: string, data: ContactInput): Promise<Contact> {
  const result = await pool.query(
    `INSERT INTO contacts
       (id, organization_id, name, phone, email, tag, source, custom_fields, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'manual', $6::jsonb, NOW(), NOW())
     RETURNING id, organization_id, name, phone, email, tag, source, custom_fields, created_at, updated_at`,
    [organizationId, data.name?.trim() || null, data.phone.trim(), data.email?.trim() || null, data.tag?.trim() || null, JSON.stringify(data.customFields ?? {})]
  );
  return mapContact(result.rows[0]);
}

export async function updateContact(id: string, organizationId: string, data: ContactInput): Promise<Contact | null> {
  const result = await pool.query(
    `UPDATE contacts SET
       name=$3, phone=$4, email=$5, tag=$6, custom_fields=$7::jsonb, updated_at=NOW()
     WHERE id=$1 AND organization_id=$2
     RETURNING id, organization_id, name, phone, email, tag, source, custom_fields, created_at, updated_at`,
    [id, organizationId, data.name?.trim() || null, data.phone.trim(), data.email?.trim() || null, data.tag?.trim() || null, JSON.stringify(data.customFields ?? {})]
  );
  return result.rows.length ? mapContact(result.rows[0]) : null;
}

export async function deleteContact(id: string, organizationId: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM contacts WHERE id=$1 AND organization_id=$2`, [id, organizationId]);
  return (result.rowCount ?? 0) > 0;
}

export async function deleteContacts(ids: string[], organizationId: string): Promise<number> {
  if (!ids.length) return 0;
  const result = await pool.query(
    `DELETE FROM contacts WHERE organization_id=$1 AND id = ANY($2::uuid[])`,
    [organizationId, ids]
  );
  return result.rowCount ?? 0;
}

export async function listTags(organizationId: string): Promise<Array<{ tag: string; count: number }>> {
  const result = await pool.query(
    `SELECT tag, COUNT(*)::int AS count FROM contacts
     WHERE organization_id=$1 AND tag IS NOT NULL AND tag <> ''
     GROUP BY tag ORDER BY tag ASC`,
    [organizationId]
  );
  return result.rows;
}

export async function getContactsByTag(organizationId: string, tag: string): Promise<Contact[]> {
  const result = await pool.query(
    `SELECT id, organization_id, name, phone, email, tag, source, custom_fields, created_at, updated_at
     FROM contacts WHERE organization_id=$1 AND tag=$2 ORDER BY created_at ASC`,
    [organizationId, tag]
  );
  return result.rows.map(mapContact);
}

export async function insertContacts(organizationId: string, contacts: ContactInput[]): Promise<number> {
  let inserted = 0;
  for (const c of contacts) {
    if (!c.phone?.trim()) continue;
    try {
      await pool.query(
        `INSERT INTO contacts
          (id, organization_id, name, phone, email, tag, source, custom_fields, created_at, updated_at)
         VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,'csv_upload',$6::jsonb,NOW(),NOW())`,
        [organizationId, c.name?.trim() || null, c.phone.trim(), c.email?.trim() || null, c.tag?.trim() || null, JSON.stringify(c.customFields ?? {})]
      );
      inserted++;
    } catch (error) {
      console.error("Contact insert failed", { phone: c.phone }, error);
    }
  }
  return inserted;
}
