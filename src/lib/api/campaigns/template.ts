import pool from "@/lib/db";

export async function getTemplateByName(organizationId: string, name: string) {
  const result = await pool.query(
    `SELECT id, organization_id, name, category, language, header_type, header_text, header_image, body, footer, buttons, meta_status AS status
     FROM template_library WHERE organization_id=$1 AND name=$2 LIMIT 1`,
    [organizationId, name]
  );
  return result.rows[0] ?? null;
}
