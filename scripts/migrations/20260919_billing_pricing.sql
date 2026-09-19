-- Dispezo billing, team membership, WhatsApp-number limits and Meta pricing
-- Run once against the existing PostgreSQL database.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS plan_code TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ;

UPDATE organizations
SET plan_code = UPPER(COALESCE(NULLIF(plan_code, ''), 'FREE'))
WHERE plan_code IS NULL OR plan_code = '';

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER','ADMIN','MEMBER')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INVITED','SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS organization_members_user_idx
  ON organization_members(user_id, status);

CREATE INDEX IF NOT EXISTS organization_members_org_idx
  ON organization_members(organization_id, status);

INSERT INTO organization_members (organization_id, user_id, role, status)
SELECT o.id, o.owner_user_id, 'OWNER', 'ACTIVE'
FROM organizations o
WHERE o.owner_user_id IS NOT NULL
ON CONFLICT (organization_id, user_id) DO UPDATE
SET role = 'OWNER', status = 'ACTIVE', updated_at = NOW();

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'whatsapp_accounts'::regclass
      AND contype = 'u'
      AND pg_get_constraintdef(oid) ILIKE 'UNIQUE (organization_id)'
  LOOP
    EXECUTE format('ALTER TABLE whatsapp_accounts DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'whatsapp_accounts'
      AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
      AND indexdef ILIKE '%(organization_id)%'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', r.indexname);
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS whatsapp_accounts_phone_number_id_uidx
  ON whatsapp_accounts(phone_number_id);

CREATE INDEX IF NOT EXISTS whatsapp_accounts_org_idx
  ON whatsapp_accounts(organization_id, status);

CREATE TABLE IF NOT EXISTS whatsapp_rate_cards (
  currency TEXT NOT NULL,
  market_code TEXT NOT NULL,
  country_code TEXT,
  market_name TEXT NOT NULL,
  category TEXT NOT NULL,
  rate NUMERIC(18,8),
  effective_from DATE,
  source_url TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (currency, market_code, category)
);

CREATE INDEX IF NOT EXISTS whatsapp_rate_cards_country_idx
  ON whatsapp_rate_cards(country_code, currency, category);

CREATE TABLE IF NOT EXISTS whatsapp_volume_tiers (
  currency TEXT NOT NULL,
  market_code TEXT NOT NULL,
  country_code TEXT,
  market_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tier_from BIGINT NOT NULL,
  tier_to BIGINT,
  rate NUMERIC(18,8) NOT NULL,
  discount_percent NUMERIC(8,4),
  effective_from DATE,
  source_url TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (currency, market_code, category, tier_from)
);

CREATE INDEX IF NOT EXISTS whatsapp_volume_tiers_lookup_idx
  ON whatsapp_volume_tiers(currency, market_code, category, tier_from);

CREATE TABLE IF NOT EXISTS meta_pricing_sync_state (
  currency TEXT PRIMARY KEY,
  last_successful_sync_at TIMESTAMPTZ,
  last_effective_from DATE,
  rates_source_url TEXT,
  tiers_source_url TEXT,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO meta_pricing_sync_state(currency)
VALUES ('INR')
ON CONFLICT (currency) DO NOTHING;
