# Impact Company Job Calendar

An interactive monthly calendar for The Impact Company's assigned field work,
synced read-only from Smartsheet. Includes a separate "Unassigned Work" tab
for jobs that still need a technician and date.

This app never writes to Smartsheet. The only Smartsheet SDK call used
anywhere in the code is `sheets.getSheet` (see `src/smartsheetClient.js`) —
add/update/delete row methods are never imported.

## What it does

This is wired to **"Scheduling - The Impact Company"** (sheet ID
`2675304775870340`), read via the Smartsheet connector to confirm the real
column layout:

| Our field | Smartsheet column |
|---|---|
| Store number | `NSN` |
| Project | computed: `Project Type` — `Store <NSN>` |
| Project type | `Project Type` |
| Technician | `Lead Assigned` |
| Location | `Address` + `City` + `State` + `Zip Code`, combined |
| Date | `Project Date` |
| Time assigned | `Time` |
| Time projection | `Estimated Hours On Site` |

- Pulls rows from the sheet on a timer (default every 15 min).
- A row is dropped entirely if `Status` is `Cancelled`, `Duplicate`, or
  `Move to Back Up File` — those aren't real pending work.
- A row with a real `Project Date` before `START_DATE` (default
  2026-09-20) is dropped as old backlog — the sheet has ~3,000 historical
  rows this keeps out. A row with no date yet (blank, or free text like
  `"first available"`) is always kept, since that's exactly the kind of
  still-needs-scheduling work the Unassigned tab is for.
- Splits the remaining rows into:
  - **Assigned** (has both `Lead Assigned` and a real `Project Date`) →
    shown on the calendar.
  - **Unassigned** (missing either) → shown on the Unassigned Work tab,
    along with which of the two (technician/date) is missing.
- Calendar shows, per job, at a glance: time assigned, technician, store #,
  and (on click) location, project, and time projection.
- Filterable by technician (`Lead Assigned`'s real names) and by project
  type (`Project Type`'s real picklist values).

If you ever point this at a different sheet, or Impact Company's sheet
structure changes, edit `src/columnMapping.js` — it's a plain alias list,
matched case-insensitively against column titles, so adding a new header
name doesn't require touching any other code.

## 1. Get Smartsheet API access

1. In Smartsheet, share the target sheet with a dedicated account (or your
   own) at **Viewer** permission. A Viewer-level account can read the sheet
   but Smartsheet will reject any write attempt from it at the platform
   level — this is a real enforcement layer, not just app-level discipline.
2. Log in as that account, go to **Account > Apps & Integrations > API
   Access**, and generate a new access token.

## 2. Configure

```
cp .env.example .env
```

Fill in `SMARTSHEET_API_TOKEN` (the sheet ID and start date are already
filled in). Adjust `START_DATE` if you want a different cutoff.

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

This app talks to Smartsheet directly via the API token above at runtime —
it doesn't need the Claude connector to function. The Claude-side
Smartsheet connector (claude.ai → Settings → Connectors) is already
connected on this account and was used to read the real column layout
above directly from the sheet, without needing an API token for that step.
It's handy going forward for ad hoc questions about the sheet in chat, or
for re-checking the schema if Impact Company's sheet columns change.

## Deploying

Any Node-capable host works (a small VPS, Render, Railway, etc.). Set the
same environment variables from `.env.example` there, and make sure the
process is kept alive (e.g. via `pm2` or the platform's process manager) so
the background sync keeps running.
