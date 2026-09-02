import pool from "@/lib/db";

//-----------------------------------------------------
// Google Business Accounts
//-----------------------------------------------------

export async function getGoogleAccount(organizationId: string) {
    const result = await pool.query(
        `
        SELECT
            id, organization_id AS "organizationId",
            google_account_id AS "googleAccountId",
            location_id AS "locationId",
            location_name AS "locationName",
            business_name AS "businessName",
            address, rating,
            access_token AS "accessToken",
            refresh_token AS "refreshToken",
            connected_at AS "connectedAt",
            last_synced_at AS "lastSyncedAt"
        FROM google_business_accounts
        WHERE organization_id = $1
        `,
        [organizationId]
    );
    return result.rows[0] || null;
}

export async function upsertGoogleAccount(data: {
    organizationId: string;
    googleAccountId: string;
    locationId: string;
    locationName?: string;
    businessName?: string;
    address?: string;
    rating?: number;
    accessToken: string;
    refreshToken: string;
}) {
    const result = await pool.query(
        `
        INSERT INTO google_business_accounts
            (id, organization_id, google_account_id, location_id, location_name,
             business_name, address, rating, access_token, refresh_token, connected_at)
        VALUES
            (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (organization_id) DO UPDATE SET
            google_account_id = EXCLUDED.google_account_id,
            location_id = EXCLUDED.location_id,
            location_name = EXCLUDED.location_name,
            business_name = EXCLUDED.business_name,
            address = EXCLUDED.address,
            rating = EXCLUDED.rating,
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            connected_at = NOW()
        RETURNING id
        `,
        [
            data.organizationId, data.googleAccountId, data.locationId,
            data.locationName || null, data.businessName || null,
            data.address || null, data.rating || null,
            data.accessToken, data.refreshToken,
        ]
    );
    return result.rows[0];
}

export async function deleteGoogleAccount(organizationId: string) {
    await pool.query(
        `DELETE FROM google_business_accounts WHERE organization_id = $1`,
        [organizationId]
    );
}

//-----------------------------------------------------
// Auto-responder config
//-----------------------------------------------------

export async function getConfig(organizationId: string) {
    const result = await pool.query(
        `
        SELECT
            id, organization_id AS "organizationId",
            business_phone AS "businessPhone",
            services, negative_reply_template AS "negativeReplyTemplate",
            notification_email AS "notificationEmail",
            enabled
        FROM gmb_autoresponder_config
        WHERE organization_id = $1
        `,
        [organizationId]
    );
    return result.rows[0] || null;
}

export async function upsertConfig(data: {
    organizationId: string;
    businessPhone?: string;
    services?: string[];
    negativeReplyTemplate?: string;
    notificationEmail?: string;
    enabled?: boolean;
}) {
    const result = await pool.query(
        `
        INSERT INTO gmb_autoresponder_config
            (id, organization_id, business_phone, services, negative_reply_template,
             notification_email, enabled, created_at, updated_at)
        VALUES
            (gen_random_uuid(), $1, $2, $3, $4, $5, COALESCE($6, true), NOW(), NOW())
        ON CONFLICT (organization_id) DO UPDATE SET
            business_phone = COALESCE(EXCLUDED.business_phone, gmb_autoresponder_config.business_phone),
            services = COALESCE(EXCLUDED.services, gmb_autoresponder_config.services),
            negative_reply_template = COALESCE(EXCLUDED.negative_reply_template, gmb_autoresponder_config.negative_reply_template),
            notification_email = COALESCE(EXCLUDED.notification_email, gmb_autoresponder_config.notification_email),
            enabled = COALESCE($6, gmb_autoresponder_config.enabled),
            updated_at = NOW()
        RETURNING id
        `,
        [
            data.organizationId,
            data.businessPhone ?? null,
            data.services ?? null,
            data.negativeReplyTemplate ?? null,
            data.notificationEmail ?? null,
            data.enabled ?? null,
        ]
    );
    return result.rows[0];
}

//-----------------------------------------------------
// All enabled configs (for n8n)
//-----------------------------------------------------

export async function listEnabledConfigsForN8n() {
    const result = await pool.query(
        `
        SELECT
            gba.organization_id AS "organizationId",
            gba.google_account_id AS "googleAccountId",
            gba.location_id AS "locationId",
            gba.business_name AS "businessName",
            gba.access_token AS "accessToken",
            gba.refresh_token AS "refreshToken",
            c.business_phone AS "businessPhone",
            c.services,
            c.negative_reply_template AS "negativeReplyTemplate",
            c.notification_email AS "notificationEmail"
        FROM google_business_accounts gba
        JOIN gmb_autoresponder_config c
            ON c.organization_id = gba.organization_id
        WHERE c.enabled = true
        `
    );
    return result.rows;
}

//-----------------------------------------------------
// Activity log
//-----------------------------------------------------

export async function insertActivity(data: {
    organizationId: string;
    locationId: string;
    reviewId: string;
    reviewerName?: string;
    reviewText?: string;
    starRating?: string;
    sentiment?: string;
    replySent: boolean;
    replyText?: string;
}) {
    await pool.query(
        `
        INSERT INTO gmb_activity
            (id, organization_id, location_id, review_id, reviewer_name,
             review_text, star_rating, sentiment, reply_sent, reply_text,
             replied_at, created_at)
        VALUES
            (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9,
             CASE WHEN $8 THEN NOW() ELSE NULL END, NOW())
        ON CONFLICT DO NOTHING
        `,
        [
            data.organizationId, data.locationId, data.reviewId,
            data.reviewerName || null, data.reviewText || null,
            data.starRating || null, data.sentiment || null,
            data.replySent, data.replyText || null,
        ]
    );
}

export async function getActivityStats(organizationId: string) {
    const result = await pool.query(
        `
        SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE sentiment = 'POSITIVE')::int AS positive,
            COUNT(*) FILTER (WHERE sentiment = 'NEUTRAL')::int AS neutral,
            COUNT(*) FILTER (WHERE sentiment = 'NEGATIVE')::int AS negative,
            COUNT(*) FILTER (WHERE reply_sent = true)::int AS replied
        FROM gmb_activity
        WHERE organization_id = $1
        AND created_at > NOW() - INTERVAL '30 days'
        `,
        [organizationId]
    );
    return result.rows[0];
}

export async function listActivity(
    organizationId: string,
    page: number,
    pageSize: number
) {
    const offset = (page - 1) * pageSize;
    const [rows, count] = await Promise.all([
        pool.query(
            `
            SELECT
                id, reviewer_name AS "reviewerName", star_rating AS "starRating",
                sentiment, reply_sent AS "replySent", replied_at AS "repliedAt",
                created_at AS "createdAt"
            FROM gmb_activity
            WHERE organization_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [organizationId, pageSize, offset]
        ),
        pool.query(
            `SELECT COUNT(*)::int AS total FROM gmb_activity WHERE organization_id = $1`,
            [organizationId]
        ),
    ]);
    return { activity: rows.rows, total: count.rows[0].total };
}
