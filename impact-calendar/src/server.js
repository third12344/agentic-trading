require('dotenv').config();
const path = require('path');
const express = require('express');
const cron = require('node-cron');

const { createClient } = require('./smartsheetClient');
const { DataStore } = require('./dataStore');

const PORT = process.env.PORT || 3000;
const START_DATE = process.env.START_DATE || '2026-09-20';
const SYNC_INTERVAL_MINUTES = Number(process.env.SYNC_INTERVAL_MINUTES || 15);
const MOCK_MODE = String(process.env.MOCK_MODE).toLowerCase() === 'true';

if (!MOCK_MODE && (!process.env.SMARTSHEET_API_TOKEN || !process.env.SMARTSHEET_SHEET_ID)) {
  const message =
    'Missing SMARTSHEET_API_TOKEN or SMARTSHEET_SHEET_ID. Set MOCK_MODE=true to run with sample data instead.';
  if (require.main === module) {
    // Running as a long-lived process (Render, local): fail fast at startup.
    console.error(message);
    process.exit(1);
  }
  // Running as an imported serverless function (e.g. Vercel): exiting the
  // process isn't appropriate here, so just warn -- requests will fail
  // until the env vars are set.
  console.error(message);
}

const smartsheetClient = MOCK_MODE
  ? null
  : createClient(process.env.SMARTSHEET_API_TOKEN);

const store = new DataStore({
  startDate: START_DATE,
  smartsheetClient,
  sheetId: process.env.SMARTSHEET_SHEET_ID,
  mockMode: MOCK_MODE,
});

const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));

function parseListParam(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// On a long-lived host the background timer in start() keeps this fresh.
// On a serverless host (no timer survives between invocations) this lazy
// check re-syncs on request instead, so both deployment styles work from
// the same codebase.
async function ensureFresh() {
  const staleMs = Math.max(1, SYNC_INTERVAL_MINUTES) * 60 * 1000;
  const age = store.lastSynced ? Date.now() - new Date(store.lastSynced).getTime() : Infinity;
  if (age > staleMs) {
    try {
      await store.sync();
    } catch (err) {
      console.error('Lazy sync failed:', err.message);
    }
  }
}

app.get('/api/meta', async (req, res) => {
  await ensureFresh();
  res.json(store.getMeta());
});

app.get('/api/jobs', async (req, res) => {
  await ensureFresh();
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  if (!year || !month) {
    return res.status(400).json({ error: 'year and month query params are required' });
  }
  const jobs = store.getJobs({
    year,
    month,
    technicians: parseListParam(req.query.technicians),
    projectTypes: parseListParam(req.query.projectTypes),
  });
  res.json({ jobs });
});

app.get('/api/unassigned', async (req, res) => {
  await ensureFresh();
  const jobs = store.getUnassigned({
    technicians: parseListParam(req.query.technicians),
    projectTypes: parseListParam(req.query.projectTypes),
  });
  res.json({ jobs });
});

app.post('/api/sync', async (req, res) => {
  try {
    const count = await store.sync();
    res.json({ ok: true, count, lastSynced: store.lastSynced });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message || String(err) });
  }
});

async function start() {
  try {
    await store.sync();
    console.log(`Initial sync complete: ${store.rows.length} rows loaded.`);
  } catch (err) {
    console.error('Initial sync failed, starting with empty data set:', err.message);
  }

  const cronExpression = `*/${Math.max(1, SYNC_INTERVAL_MINUTES)} * * * *`;
  cron.schedule(cronExpression, async () => {
    try {
      const count = await store.sync();
      console.log(`Synced ${count} rows at ${store.lastSynced}`);
    } catch (err) {
      console.error('Background sync failed:', err.message);
    }
  });

  app.listen(PORT, () => {
    console.log(`Impact Company calendar running at http://localhost:${PORT}`);
    console.log(MOCK_MODE ? 'Running in MOCK_MODE with sample data.' : `Syncing sheet ${process.env.SMARTSHEET_SHEET_ID} every ${SYNC_INTERVAL_MINUTES} min.`);
  });
}

if (require.main === module) {
  // Running directly (Render, local, any traditional Node host): keep a
  // long-lived process with a background sync timer.
  start();
}

// Running as an imported serverless function (e.g. Vercel): no background
// timer survives between invocations, so freshness is instead handled by
// ensureFresh() on each request above.
module.exports = app;
