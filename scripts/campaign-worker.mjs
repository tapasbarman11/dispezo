/** Dispezo's built-in scheduled broadcast runner. No n8n required. */

const apiUrl = (process.env.DISPAZ_API_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const secret = process.env.DISPAZ_BROADCAST_WORKER_SECRET;
const intervalMs = Math.max(15_000, Number(process.env.DISPAZ_WORKER_INTERVAL_MS || 30_000));
const batchSize = Math.min(100, Math.max(1, Number(process.env.DISPAZ_WORKER_BATCH_SIZE || 50)));
const campaignLimit = Math.min(10, Math.max(1, Number(process.env.DISPAZ_WORKER_CAMPAIGN_LIMIT || 3)));

if (!secret) {
  console.error("DISPAZ_BROADCAST_WORKER_SECRET is required.");
  process.exit(1);
}

let stopping = false;
let running = false;

async function tick() {
  if (stopping || running) return;
  running = true;
  try {
    const response = await fetch(`${apiUrl}/api/campaigns/worker`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dispaz-worker-secret": secret,
      },
      body: JSON.stringify({ batchSize, limit: campaignLimit }),
    });
    const body = await response.text();
    if (!response.ok) {
      console.error(`Worker API ${response.status}: ${body}`);
      return;
    }
    const result = JSON.parse(body);
    if (result.results?.length) {
      console.log(`[${new Date().toISOString()}] processed ${result.results.length} campaign(s)`);
    }
  } catch (error) {
    console.error("Worker tick failed:", error);
  } finally {
    running = false;
  }
}

function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.log(`Received ${signal}; stopping Dispezo campaign worker.`);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log(`Dispezo campaign worker started. API=${apiUrl}, interval=${intervalMs}ms, batch=${batchSize}, campaigns/tick=${campaignLimit}`);
await tick();
setInterval(tick, intervalMs);
