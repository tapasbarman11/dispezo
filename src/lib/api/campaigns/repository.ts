import pool from "@/lib/db";

//-----------------------------------------------------
// Types
//-----------------------------------------------------

export interface Campaign {
    id: string;
    campaignName: string;
    templateName: string;
    status: string;
    totalContacts: number;
    deliveredCount: number;
    failedCount: number;
    cost: number;
    audienceTag: string | null;
    executedAt: Date | null;
    createdAt: Date;
    organizationId: string;
}

export interface CreateCampaignInput {
    organizationId: string;
    campaignName: string;
    templateName: string;
    totalContacts: number;
    audienceTag: string;
}

//-----------------------------------------------------
// Create a campaign row
//-----------------------------------------------------

export async function createCampaign(
    data: CreateCampaignInput
): Promise<Campaign> {

    const result = await pool.query(
        `
        INSERT INTO campaigns
            (
                id,
                organization_id,
                campaign_name,
                template_name,
                status,
                total_contacts,
                delivered_count,
                failed_count,
                cost,
                audience_tag,
                created_at
            )
        VALUES
            (
                gen_random_uuid(), $1, $2, $3, 'QUEUED', $4, 0, 0, 0, $5, NOW()
            )
        RETURNING
            id,
            organization_id AS "organizationId",
            campaign_name AS "campaignName",
            template_name AS "templateName",
            status,
            total_contacts AS "totalContacts",
            delivered_count AS "deliveredCount",
            failed_count AS "failedCount",
            cost,
            audience_tag AS "audienceTag",
            executed_at AS "executedAt",
            created_at AS "createdAt"
        `,
        [
            data.organizationId,
            data.campaignName,
            data.templateName,
            data.totalContacts,
            data.audienceTag,
        ]
    );

    return result.rows[0];

}

//-----------------------------------------------------
// List campaigns (paginated)
//-----------------------------------------------------

export async function listCampaigns(
    organizationId: string,
    page: number,
    pageSize: number
): Promise<{ campaigns: Campaign[]; total: number }> {

    const offset = (page - 1) * pageSize;

    const [rowsResult, countResult] = await Promise.all([

        pool.query(
            `
            SELECT
                id,
                organization_id AS "organizationId",
                campaign_name AS "campaignName",
                template_name AS "templateName",
                status,
                total_contacts AS "totalContacts",
                delivered_count AS "deliveredCount",
                failed_count AS "failedCount",
                cost,
                audience_tag AS "audienceTag",
                executed_at AS "executedAt",
                created_at AS "createdAt"
            FROM campaigns
            WHERE
                organization_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [organizationId, pageSize, offset]
        ),

        pool.query(
            `
            SELECT COUNT(*)::int AS total
            FROM campaigns
            WHERE organization_id = $1
            `,
            [organizationId]
        ),

    ]);

    return {
        campaigns: rowsResult.rows,
        total: countResult.rows[0].total,
    };

}
