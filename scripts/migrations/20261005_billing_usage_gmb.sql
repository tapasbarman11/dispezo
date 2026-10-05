-- Dispezo monthly message usage + Google Business Profile connection support.
-- Run once against the existing PostgreSQL database.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS plan_code TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'ACTIVE';

CREATE TABLE IF NOT EXISTS organization_message_usage (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  usage_month DATE NOT NULL,
  messages_sent BIGINT NOT NULL DEFAULT 0 CHECK (messages_sent >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, usage_month)
);

CREATE INDEX IF NOT EXISTS organization_message_usage_month_idx
  ON organization_message_usage(usage_month, organization_id);

-- Backfill the current month's successful WhatsApp submissions so the new
-- quota starts from the real usage already present in the database.
WITH current_usage AS (
  SELECT organization_id, COUNT(*)::BIGINT AS messages_sent
  FROM messages
  WHERE sent_at >= DATE_TRUNC('month', NOW())
    AND UPPER(COALESCE(status, '')) NOT IN ('FAILED', 'FAILURE')
    AND message_source = 'DIRECT_API'
  GROUP BY organization_id
  UNION ALL
  SELECT organization_id, COUNT(*)::BIGINT AS messages_sent
  FROM broadcast_message_tracking
  WHERE sent_at >= DATE_TRUNC('month', NOW())
  GROUP BY organization_id
), totals AS (
  SELECT organization_id, SUM(messages_sent)::BIGINT AS messages_sent
  FROM current_usage
  GROUP BY organization_id
)
INSERT INTO organization_message_usage (organization_id, usage_month, messages_sent)
SELECT organization_id, DATE_TRUNC('month', NOW())::DATE, messages_sent
FROM totals
ON CONFLICT (organization_id, usage_month) DO UPDATE
SET messages_sent = EXCLUDED.messages_sent,
    updated_at = NOW();

-- Google Business Profile tables used by the existing GMB connection page/API.
CREATE TABLE IF NOT EXISTS google_business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  google_account_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  location_name TEXT,
  business_name TEXT,
  address TEXT,
  rating NUMERIC(3,2),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  UNIQUE (organization_id)
);

ALTER TABLE google_business_accounts
  ADD COLUMN IF NOT EXISTS location_name TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS access_token TEXT,
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS google_business_accounts_location_idx
  ON google_business_accounts(location_id);

CREATE TABLE IF NOT EXISTS gmb_autoresponder_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_phone TEXT,
  services TEXT[] NOT NULL DEFAULT '{}',
  negative_reply_template TEXT,
  notification_email TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id)
);

CREATE TABLE IF NOT EXISTS gmb_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  reviewer_name TEXT,
  review_text TEXT,
  star_rating TEXT,
  sentiment TEXT,
  reply_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS gmb_activity_review_uidx
  ON gmb_activity(organization_id, location_id, review_id);

CREATE INDEX IF NOT EXISTS gmb_activity_org_created_idx
  ON gmb_activity(organization_id, created_at DESC);
