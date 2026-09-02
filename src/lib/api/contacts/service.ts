import { insertContacts, listTags, ContactInput } from "./repository";

//-----------------------------------------------------
// Parse a raw CSV string into contact rows
//-----------------------------------------------------
// Expected columns (case-insensitive header match):
//   name, phone, email
// Only "phone" is required. Extra columns are ignored.
//-----------------------------------------------------

export function parseContactsCsv(
    csvText: string,
    tag: string
): ContactInput[] {

    const lines = csvText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length === 0) return [];

    const header = lines[0]
        .split(",")
        .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

    const nameIdx = header.indexOf("name");
    const phoneIdx = header.indexOf("phone");
    const emailIdx = header.indexOf("email");

    if (phoneIdx === -1) {

        throw new Error(
            "CSV must include a 'phone' column."
        );

    }

    const rows: ContactInput[] = [];

    for (let i = 1; i < lines.length; i++) {

        const cols = lines[i]
            .split(",")
            .map((c) => c.trim().replace(/"/g, ""));

        const phone = cols[phoneIdx];

        if (!phone) continue;

        rows.push({
            name: nameIdx !== -1 ? cols[nameIdx] : undefined,
            phone,
            email: emailIdx !== -1 ? cols[emailIdx] : undefined,
            tag,
        });

    }

    return rows;

}

//-----------------------------------------------------
// Upload contacts under a named tag/audience
//-----------------------------------------------------

export async function uploadContacts(
    organizationId: string,
    csvText: string,
    tag: string
): Promise<{ parsed: number; inserted: number }> {

    if (!tag || !tag.trim()) {

        throw new Error(
            "Audience name is required."
        );

    }

    const rows = parseContactsCsv(csvText, tag.trim());

    if (rows.length === 0) {

        throw new Error(
            "No valid contact rows found in CSV."
        );

    }

    const inserted = await insertContacts(
        organizationId,
        rows
    );

    return {
        parsed: rows.length,
        inserted,
    };

}

//-----------------------------------------------------
// Get available audiences (tags) for this org
//-----------------------------------------------------

export async function getAudiences(
    organizationId: string
) {

    return listTags(organizationId);

}
