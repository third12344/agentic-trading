# Impact Company Job Calendar

An interactive monthly calendar for The Impact Company's assigned field work,
synced read-only from Smartsheet. Includes a separate "Unassigned Work" tab
for jobs that still need a technician and date.

This app never writes to Smartsheet. The only Smartsheet SDK call used
anywhere in the code is `sheets.getSheet` (see `src/smartsheetClient.js`) —
add/update/delete row methods are never imported.

## What it does

- Pulls rows from one Smartsheet sheet on a timer (default every 15 min).
- Ignores anything scheduled/added before `START_DATE` (default
  2026-09-20), so the thousands of older rows in the sheet are never loaded.
- Splits rows into:
  - **Assigned** (has both a technician and a date) → shown on the calendar.
  - **Unassigned** (missing technician and/or date) → shown on the
    Unassigned Work tab.
- Calendar shows, per job, at a glance: time assigned, technician, store #,
  and (on click) location, project, and time projection.
- Filterable by technician and by project type (multi-select chips).

## 1. Get Smartsheet API access

1. In Smartsheet, share the target sheet with a dedicated account (or your
   own) at **Viewer** permission. A Viewer-level account can read the sheet
   but Smartsheet will reject any write attempt from it at the platform
   level — this is a real enforcement layer, not just app-level discipline.
2. Log in as that account, go to **Account > Apps & Integrations > API
   Access**, and generate a new access token.
3. Get the sheet's numeric ID: open the sheet, **File/Sheet menu >
   Properties**.

## 2. Configure

```
cp .env.example .env
```

Fill in `SMARTSHEET_API_TOKEN` and `SMARTSHEET_SHEET_ID`. Adjust
`START_DATE` if needed.

Open `src/columnMapping.js` and check the alias lists against your sheet's
actual column headers. The defaults cover common naming (`Technician`,
`Project Type`, `Store #`, `Location`, `Date`, `Time`, `Time Projection`,
`Project`), but if your sheet uses different headers, just add them to the
matching alias array — no other code needs to change.

## 3. Run

```
npm install
npm start
```

Visit http://localhost:3000.

To try the UI immediately with sample data, before Smartsheet credentials
are ready:

```
npm run dev
```

## Connecting Smartsheet to Claude (separate from this app)

This app talks to Smartsheet directly via the API token above — it doesn't
need Claude at runtime. Separately, if you also want Claude (in chat) to be
able to look at this Smartsheet directly — e.g. to help debug the column
mapping, or answer ad hoc questions about the sheet — connect the
Smartsheet connector to your claude.ai account:

1. Go to claude.ai → Settings → Connectors.
2. Find **Smartsheet** and connect it, authorizing with the account you
   want Claude to see the sheet as (a Viewer-only account, for the same
   read-only reasoning as above).
3. Enable it for this chat if prompted.

Once connected, tell Claude the sheet name and it can inspect the real
column headers directly, which is the fastest way to finalize
`columnMapping.js`.

## Deploying

Any Node-capable host works (a small VPS, Render, Railway, etc.). Set the
same environment variables from `.env.example` there, and make sure the
process is kept alive (e.g. via `pm2` or the platform's process manager) so
the background sync keeps running.
