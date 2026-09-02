import pool from "@/lib/db";

//-----------------------------------------------------
// Types
//-----------------------------------------------------

export interface Contact {
    id: string;
    name: string | null;
    phone: string;
    email: string | null;
    tag: string | null;
    source: string | null;
    organizationId: string;
    createdAt: Date;
}

export interface ContactInput {
    name?: string;
    phone: string;
    email?: string;
    tag: string;
}

//-----------------------------------------------------
// Bulk insert contacts (from CSV upload)
//-----------------------------------------------------

export async function insertContacts(
    organizationId: string,
    contacts: ContactInput[]
): Promise<number> {

    if (contacts.length === 0) return 0;

    let inserted = 0;

    // Insert one by one to skip bad rows without failing the whole batch.
    // For very large CSVs this could be optimized to a single multi-row
    // INSERT, but per-row keeps error handling simple and safe.
    for (const c of contacts) {

        if (!c.phone || !c.phone.trim()) continue;

        try {

            await pool.query(
                `
                INSERT INTO contacts
                    (id, organization_id, name, phone, email, tag, source, created_at)
                VALUES
                    (gen_random_uuid(), $1, $2, $3, $4, $5, 'csv_upload', NOW())
                `,
                [
                    organizationId,
                    c.name?.trim() || null,
                    c.phone.trim(),
                    c.email?.trim() || null,
                    c.tag,
                ]
            );

            inserted++;

        } catch (err) {

            console.error("Failed to insert contact row:", c, err);

        }

    }

    return inserted;

}

//-----------------------------------------------------
// List distinct tags (audiences) with contact counts
//-----------------------------------------------------

export async function listTags(
    organizationId: string
): Promise<Array<{ tag: string; count: number }>> {

    const result = await pool.query(
        `
        SELECT
            tag,
            COUNT(*)::int AS count
        FROM contacts
        WHERE
            organization_id = $1
        AND
            tag IS NOT NULL
        GROUP BY tag
        ORDER BY tag ASC
        `,
        [organizationId]
    );

    return result.rows;

}

//-----------------------------------------------------
// Get contacts by tag (the actual send list for a campaign)
//-----------------------------------------------------

export async function getContactsByTag(
    organizationId: string,
    tag: string
): Promise<Contact[]> {

    const result = await pool.query(
        `
        SELECT
            id,
            organization_id AS "organizationId",
            name,
            phone,
            email,
            tag,
            source,
            created_at AS "createdAt"
        FROM contacts
        WHERE
            organization_id = $1
        AND
            tag = $2
        ORDER BY created_at ASC
        `,
        [organizationId, tag]
    );

    return result.rows;

}
