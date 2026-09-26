import pool from "@/lib/db";

export const META_PRICING_DOCS_URL =
  process.env.META_WHATSAPP_PRICING_DOCS_URL ||
  "https://business.whatsapp.com/products/platform-pricing";

type RateRow = {
  currency: string;
  marketCode: string;
  countryCode: string | null;
  marketName: string;
  category: string;
  rate: number | null;
  effectiveFrom: string | null;
};

type TierRow = RateRow & {
  tierFrom: number;
  tierTo: number | null;
  discountPercent: number | null;
};

function norm(v: string) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_–—-]+/g, " ");
}

function num(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v.replace(/,/g, "").replace(/%/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (!quoted && ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (!quoted && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && next === "\n") i += 1;
      row.push(cell);
      cell = "";
      if (row.some((v) => v.trim())) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }

  row.push(cell);
  if (row.some((v) => v.trim())) rows.push(row);
  return rows;
}

function effectiveDate(text: string): string | null {
  const match = text.match(/effective\s+([A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
  if (!match) return null;
  const date = new Date(match[1]);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function marketCode(name: string): string {
  const key = norm(name);
  const map: Record<string, string> = {
    india: "IN",
    argentina: "AR",
    brazil: "BR",
    chile: "CL",
    colombia: "CO",
    egypt: "EG",
    france: "FR",
    germany: "DE",
    "hong kong": "HK",
    hungary: "HU",
    indonesia: "ID",
    israel: "IL",
    italy: "IT",
    malaysia: "MY",
    mexico: "MX",
    netherlands: "NL",
    nigeria: "NG",
    pakistan: "PK",
    peru: "PE",
    russia: "RU",
    "saudi arabia": "SA",
    "south africa": "ZA",
    spain: "ES",
    turkey: "TR",
    "united arab emirates": "AE",
    "united kingdom": "GB",
    "north america": "NA",
    "rest of africa": "ROA",
    "rest of asia pacific": "ROAP",
    "rest of central and eastern europe": "ROCEE",
    "rest of latin america": "ROLA",
    "rest of middle east": "ROME",
    "rest of western europe": "ROWE",
  };
  return map[key] || key.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

function headerIndex(rows: string[][]) {
  return rows.findIndex((row) => {
    const header = row.map(norm).join("|");
    return header.includes("market") && header.includes("currency");
  });
}

function parseRates(text: string, currency: string): RateRow[] {
  const rows = parseCsv(text);
  const index = headerIndex(rows);
  if (index < 0) throw new Error("Meta rate CSV header not found.");

  const effectiveFrom = effectiveDate(text);
  const output: RateRow[] = [];
  const categories = [
    "MARKETING",
    "UTILITY",
    "AUTHENTICATION",
    "AUTHENTICATION_INTERNATIONAL",
    "SERVICE",
  ];

  for (const row of rows.slice(index + 1)) {
    const market = (row[0] || "").trim();
    if (!market || norm(market) === "market") continue;

    const code = marketCode(market);
    categories.forEach((category, categoryIndex) => {
      if (row[categoryIndex + 2] !== undefined) {
        output.push({
          currency,
          marketCode: code,
          countryCode: code.length === 2 ? code : null,
          marketName: market,
          category,
          rate: num(row[categoryIndex + 2]),
          effectiveFrom,
        });
      }
    });
  }

  return output;
}

function parseTiers(text: string, currency: string): TierRow[] {
  const rows = parseCsv(text);
  const index = headerIndex(rows);
  if (index < 0) throw new Error("Meta volume-tier CSV header not found.");

  const effectiveFrom = effectiveDate(text);
  const output: TierRow[] = [];
  const groups = [
    ["UTILITY", 0],
    ["AUTHENTICATION", 5],
    ["AUTHENTICATION_INTERNATIONAL", 10],
  ] as const;

  for (const row of rows.slice(index + 1)) {
    const market = (row[0] || "").trim();
    if (!market || norm(market) === "market") continue;

    const code = marketCode(market);
    const values = row.slice(2);

    for (const [category, offset] of groups) {
      const tierFrom = num(values[offset]);
      const rate = num(values[offset + 3]);
      const rawTo = (values[offset + 1] || "").trim();
      const tierTo = !rawTo || /^(--|n\/a)$/i.test(rawTo) ? null : num(rawTo);
      const discountPercent = num(values[offset + 4]);

      if (tierFrom === null || rate === null) continue;

      output.push({
        currency,
        marketCode: code,
        countryCode: code.length === 2 ? code : null,
        marketName: market,
        category,
        tierFrom,
        tierTo,
        rate,
        discountPercent,
        effectiveFrom,
      });
    }
  }

  return output;
}

async function download(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "user-agent": "Dispezo Meta pricing sync/1.0",
      accept: "text/csv,text/plain,*/*",
    },
  });

  if (!response.ok) {
    throw new Error("Meta pricing download failed (" + response.status + ")");
  }

  return response.text();
}

async function sources(currency: string) {
  const ratesKey = "META_WHATSAPP_" + currency + "_RATES_CSV_URL";
  const tiersKey = "META_WHATSAPP_" + currency + "_VOLUME_TIERS_CSV_URL";
  const ratesUrl = process.env[ratesKey];
  const tiersUrl = process.env[tiersKey];

  if (!ratesUrl || !tiersUrl) {
    throw new Error(
      "Set " +
        ratesKey +
        " and " +
        tiersKey +
        " to Meta's current official CSV download URLs."
    );
  }

  const [ratesText, tiersText] = await Promise.all([
    download(ratesUrl),
    download(tiersUrl),
  ]);

  return { ratesUrl, tiersUrl, ratesText, tiersText };
}

export async function syncMetaPricing(currency = "INR") {
  const source = await sources(currency);
  const rates = parseRates(source.ratesText, currency);
  const tiers = parseTiers(source.tiersText, currency);
  const indiaRates = rates.filter((rate) => rate.marketCode === "IN");

  if (
    !indiaRates.some((rate) => rate.category === "MARKETING" && rate.rate !== null) ||
    !indiaRates.some((rate) => rate.category === "UTILITY" && rate.rate !== null)
  ) {
    throw new Error("Meta rate CSV validation failed for India.");
  }

  if (!tiers.some((tier) => tier.marketCode === "IN" && tier.category === "UTILITY")) {
    throw new Error("Meta volume-tier CSV validation failed for India.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      ["meta-pricing-" + currency]
    );

    await client.query("DELETE FROM whatsapp_volume_tiers WHERE currency=$1", [currency]);
    await client.query("DELETE FROM whatsapp_rate_cards WHERE currency=$1", [currency]);

    for (const rate of rates) {
      await client.query(
        "INSERT INTO whatsapp_rate_cards(currency,market_code,country_code,market_name,category,rate,effective_from,source_url,synced_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,NOW())",
        [
          rate.currency,
          rate.marketCode,
          rate.countryCode,
          rate.marketName,
          rate.category,
          rate.rate,
          rate.effectiveFrom,
          source.ratesUrl,
        ]
      );
    }

    for (const tier of tiers) {
      await client.query(
        "INSERT INTO whatsapp_volume_tiers(currency,market_code,country_code,market_name,category,tier_from,tier_to,rate,discount_percent,effective_from,source_url,synced_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())",
        [
          tier.currency,
          tier.marketCode,
          tier.countryCode,
          tier.marketName,
          tier.category,
          tier.tierFrom,
          tier.tierTo,
          tier.rate,
          tier.discountPercent,
          tier.effectiveFrom,
          source.tiersUrl,
        ]
      );
    }

    const effectiveFrom = rates.find((rate) => rate.effectiveFrom)?.effectiveFrom || null;

    await client.query(
      "INSERT INTO meta_pricing_sync_state(currency,last_successful_sync_at,last_effective_from,rates_source_url,tiers_source_url,last_error,updated_at) VALUES($1,NOW(),$2,$3,$4,NULL,NOW()) ON CONFLICT(currency) DO UPDATE SET last_successful_sync_at=NOW(),last_effective_from=EXCLUDED.last_effective_from,rates_source_url=EXCLUDED.rates_source_url,tiers_source_url=EXCLUDED.tiers_source_url,last_error=NULL,updated_at=NOW()",
      [currency, effectiveFrom, source.ratesUrl, source.tiersUrl]
    );

    await client.query("COMMIT");
    return { currency, rates: rates.length, tiers: tiers.length, effectiveFrom };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    await pool
      .query(
        "UPDATE meta_pricing_sync_state SET last_error=$2,updated_at=NOW() WHERE currency=$1",
        [currency, String(error).slice(0, 2000)]
      )
      .catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function maybeSyncMetaPricing(currency = "INR") {
  const result = await pool.query(
    "SELECT last_successful_sync_at FROM meta_pricing_sync_state WHERE currency=$1 LIMIT 1",
    [currency]
  );

  const last = result.rows[0]?.last_successful_sync_at
    ? new Date(result.rows[0].last_successful_sync_at)
    : null;

  if (last && Date.now() - last.getTime() < 86400000) {
    return { skipped: true };
  }

  try {
    return await syncMetaPricing(currency);
  } catch (error) {
    console.error("Meta pricing sync failed; keeping last successful rates:", error);
    return { failed: true };
  }
}

export async function getMetaPricingSnapshot(
  currency = "INR",
  marketCode = "IN"
) {
  const [rates, tiers, sync] = await Promise.all([
    pool.query(
      'SELECT category,rate,effective_from AS "effectiveFrom" FROM whatsapp_rate_cards WHERE currency=$1 AND market_code=$2 ORDER BY category',
      [currency, marketCode]
    ),
    pool.query(
      'SELECT category,tier_from AS "tierFrom",tier_to AS "tierTo",rate,discount_percent AS "discountPercent" FROM whatsapp_volume_tiers WHERE currency=$1 AND market_code=$2 ORDER BY category,tier_from',
      [currency, marketCode]
    ),
    pool.query(
      'SELECT last_successful_sync_at AS "lastSuccessfulSyncAt",last_effective_from AS "effectiveFrom",last_error AS "lastError" FROM meta_pricing_sync_state WHERE currency=$1 LIMIT 1',
      [currency]
    ),
  ]);

  return {
    currency,
    marketCode,
    rates: rates.rows,
    tiers: tiers.rows,
    sync: sync.rows[0] || null,
  };
}

export async function getMetaRate(
  categoryName: string,
  volumeMessages = 0,
  currency = "INR",
  marketCode = "IN"
) {
  const category = categoryName.toUpperCase();

  if (
    volumeMessages > 0 &&
    ["UTILITY", "AUTHENTICATION", "AUTHENTICATION_INTERNATIONAL"].includes(category)
  ) {
    const tier = await pool.query(
      "SELECT rate FROM whatsapp_volume_tiers WHERE currency=$1 AND market_code=$2 AND category=$3 AND tier_from <= $4 AND (tier_to IS NULL OR tier_to >= $4) ORDER BY tier_from DESC LIMIT 1",
      [currency, marketCode, category, volumeMessages]
    );

    if (tier.rows[0]?.rate != null) return Number(tier.rows[0].rate);
  }

  const rate = await pool.query(
    "SELECT rate FROM whatsapp_rate_cards WHERE currency=$1 AND market_code=$2 AND category=$3 LIMIT 1",
    [currency, marketCode, category]
  );

  return rate.rows[0]?.rate == null ? 0 : Number(rate.rows[0].rate);
}
