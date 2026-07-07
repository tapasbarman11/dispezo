import pool from "@/lib/db";
import {
    Template,
    SaveTemplateInput,
} from "@/lib/types";

function mapTemplate(row: any): Template {

    return {

        id: row.id,

        organizationId: row.organization_id,

        name: row.name,

        category: row.category,

        language: row.language,

        headerType: row.header_type,

        headerText: row.header_text,

        headerImage: row.sample_media_path ?? row.header_image,
        sampleMediaPath: row.sample_media_path,
        sampleMediaName: row.sample_media_name,
        sampleMediaType: row.sample_media_type,

        body: row.body,

        footer: row.footer,

        buttons:

            typeof row.buttons === "string"

                ? JSON.parse(row.buttons)

                : (row.buttons ?? []),

        metaTemplateId: row.meta_template_id,

        status: row.meta_status,

        isPublished: row.is_published,

        version: row.version,

        publishedAt: row.published_at,

        lastSyncedAt: row.last_synced_at,

        createdAt: row.created_at,

        updatedAt: row.updated_at,

    };

}

// -----------------------------------------------------
// Get All Templates
// -----------------------------------------------------

export async function getTemplates(
    organizationId: string
): Promise<Template[]> {

    const result = await pool.query(
        `
        SELECT *
        FROM template_library
        WHERE organization_id=$1
        ORDER BY updated_at DESC
        `,
        [organizationId]
    );

    return result.rows.map(mapTemplate);

}

// -----------------------------------------------------
// Get Single Template
// -----------------------------------------------------

export async function getTemplate(
    id: string
): Promise<Template | null> {

    const result = await pool.query(
        `
        SELECT *
        FROM template_library
        WHERE id=$1
        LIMIT 1
        `,
        [id]
    );

    if (!result.rows.length) {

        return null;

    }

    return mapTemplate(
        result.rows[0]
    );

}

// -----------------------------------------------------
// Create Draft
// -----------------------------------------------------

export async function saveTemplate(
    data: SaveTemplateInput
): Promise<Template> {
    console.log("SAVE INPUT", data);
    const result = await pool.query(
        `
        INSERT INTO template_library
        (
            organization_id,
            name,
            category,
            language,
            header_type,
            header_text,
           header_image, 
           sample_media_path,
           sample_media_name,
           sample_media_type,
           body,
           footer,
           buttons,
           meta_status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'DRAFT'
        )
        RETURNING *
        `,
        [
            data.organizationId,
            data.name,
            data.category,
            data.language,
            data.headerType,
            data.headerText,
            data.headerImage,
            data.sampleMediaPath,
            data.sampleMediaName,
            data.sampleMediaType,
            data.body,
            data.footer,
            JSON.stringify(data.buttons ?? []),
        ]
    );

    return mapTemplate(result.rows[0]);

}

// -----------------------------------------------------
// Update Draft
// -----------------------------------------------------

export async function updateTemplate(
    id: string,
    data: SaveTemplateInput
): Promise<Template> {
    console.log("UPDATE INPUT", data);
    const result = await pool.query(
        `
        UPDATE template_library
        SET

            name=$2,

            category=$3,

            language=$4,

            header_type=$5,

            header_text=$6,

           header_image=$7,
           sample_media_path=$8,
           sample_media_name=$9,
           sample_media_type=$10,
           body=$11,
           footer=$12,
           buttons=$13,
           updated_at=NOW()

        WHERE id=$1

        RETURNING *
        `,
        [
            id,

            data.name,

            data.category,

            data.language,

            data.headerType,

            data.headerText,

            data.headerImage,

            data.sampleMediaPath,
            data.sampleMediaName,
            data.sampleMediaType,

            data.body,

            data.footer,

            JSON.stringify(data.buttons ?? []),

        ]
    );

    return mapTemplate(result.rows[0]);

}

// -----------------------------------------------------
// Delete
// -----------------------------------------------------

export async function deleteTemplate(
    id: string
): Promise<void> {

    await pool.query(
        `
        DELETE
        FROM template_library
        WHERE id=$1
        `,
        [id]
    );

}

// -----------------------------------------------------
// Upsert Meta Template
// -----------------------------------------------------

export async function upsertMetaTemplate(
    template: {

        organizationId: string;

        metaTemplateId: string;

        name: string;

        category: string;

        language: string;

        body: string;

        footer?: string;

        headerType?: string;

        headerText?: string;

        headerImage?: string;

        buttons?: any;

        metaStatus: string;

    }

): Promise<Template> {

    //-------------------------------------------------
    // First try updating an existing draft by NAME
    //-------------------------------------------------

    const existing = await pool.query(
        `
        SELECT id
        FROM template_library
        WHERE
            organization_id = $1
        AND
            name = $2
        LIMIT 1
        `,
        [
            template.organizationId,
            template.name,
        ]
    );

    if (existing.rows.length) {

        const result = await pool.query(
            `
            UPDATE template_library
            SET

                meta_template_id = $2,

                category = $3,

                language = $4,

                header_type = $5,

                header_text = $6,

                header_image = $7,

                body = $8,

                footer = $9,

                buttons = $10,

                meta_status = $11,

                is_published = TRUE,

                published_at = NOW(),

                updated_at = NOW()

            WHERE id = $1

            RETURNING *
            `,
            [

                existing.rows[0].id,

                template.metaTemplateId,

                template.category,

                template.language,

                template.headerType,

                template.headerText,

                template.headerImage,

                template.body,

                template.footer,

                JSON.stringify(
                    template.buttons ?? []
                ),

                template.metaStatus,

            ]
        );

        return mapTemplate(result.rows[0]);

    }

    //-------------------------------------------------
    // Otherwise insert new template
    //-------------------------------------------------

    const result = await pool.query(
        `
        INSERT INTO template_library
        (
            organization_id,
            meta_template_id,
            name,
            category,
            language,
            header_type,
            header_text,
            header_image,
            body,
            footer,
            buttons,
            meta_status,
            is_published,
            published_at
        )

        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE,NOW()
        )

        RETURNING *
        `,
        [

            template.organizationId,

            template.metaTemplateId,

            template.name,

            template.category,

            template.language,

            template.headerType,

            template.headerText,

            template.headerImage,

            template.body,

            template.footer,

            JSON.stringify(
                template.buttons ?? []
            ),

            template.metaStatus,

        ]
    );

    return mapTemplate(
        result.rows[0]
    );

}
//-----------------------------------------------------
// Get Template By Id
//-----------------------------------------------------

export async function getTemplateById(
    id: string,
    organizationId: string
): Promise<Template | null> {

    const result = await pool.query(
        `
        SELECT *
        FROM template_library
        WHERE
            id=$1
        AND
            organization_id=$2
        LIMIT 1
        `,
        [
            id,
            organizationId,
        ]
    );

    if (!result.rows.length) {

        return null;

    }

    return mapTemplate(
        result.rows[0]
    );

}

//-----------------------------------------------------
// Delete Template
//-----------------------------------------------------

export async function deleteTemplateById(
    id: string,
    organizationId: string
): Promise<void> {

    await pool.query(
        `
        DELETE
        FROM template_library
        WHERE
            id=$1
        AND
            organization_id=$2
        `,
        [
            id,
            organizationId,
        ]
    );

}
//-----------------------------------------------------
// Duplicate Template
//-----------------------------------------------------

//-----------------------------------------------------
// Duplicate Template
//-----------------------------------------------------

export async function duplicateTemplate(
    id: string,
    organizationId: string
): Promise<Template> {

    //-------------------------------------------------
    // Load Original Template
    //-------------------------------------------------

    const original =
        await pool.query(
            `
            SELECT *
            FROM template_library
            WHERE
                id = $1
            AND
                organization_id = $2
            LIMIT 1
            `,
            [
                id,
                organizationId,
            ]
        );

    if (!original.rows.length) {

        throw new Error(
            "Template not found."
        );

    }

    const template =
        original.rows[0];

    //-------------------------------------------------
    // Generate Next Copy Name
    //-------------------------------------------------

    const baseName =
        template.name.replace(
            /_copy_\d+$/,
            ""
        );

    const existing =
        await pool.query(
            `
            SELECT name
            FROM template_library
            WHERE
                organization_id = $1
            AND
                name LIKE $2
            `,
            [
                organizationId,
                `${baseName}_copy_%`,
            ]
        );

    let nextNumber = 1;

    existing.rows.forEach((row) => {

        const match =
            row.name.match(
                /_copy_(\d+)$/
            );

        if (match) {

            nextNumber = Math.max(
                nextNumber,
                Number(match[1]) + 1
            );

        }

    });

    const newName =
        `${baseName}_copy_${nextNumber}`;

    //-------------------------------------------------
    // Create Duplicate
    //-------------------------------------------------

    const result =
        await pool.query(
            `
            INSERT INTO template_library
            (
                organization_id,
                name,
                category,
                language,
                header_type,
                header_text,
                header_image,
                body,
                footer,
                buttons,
                meta_status
            )

            VALUES
            (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'DRAFT'
            )

            RETURNING *
            `,
            [

                organizationId,

                newName,

                template.category,

                template.language,

                template.header_type,

                template.header_text,

                template.header_image,

                template.body,

                template.footer,

                template.buttons,

            ]
        );

    return mapTemplate(
        result.rows[0]
    );

}