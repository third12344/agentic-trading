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
  console.error(
    'Missing SMARTSHEET_API_TOKEN or SMARTSHEET_SHEET_ID. Set MOCK_MODE=true to run with sample data instead.'
  );
  process.exit(1);
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

app.get('/api/meta', (req, res) => {
  res.json(store.getMeta());
});

app.get('/api/jobs', (req, res) => {
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

app.get('/api/unassigned', (req, res) => {
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

start();
