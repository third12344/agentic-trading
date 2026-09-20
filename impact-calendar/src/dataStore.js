const { buildColumnIndex, EXCLUDED_STATUSES } = require('./columnMapping');
const { buildMockRows } = require('./mockData');

function cellText(row, columnId) {
  if (columnId === undefined) return '';
  const cell = row.cells.find((c) => c.columnId === columnId);
  if (!cell) return '';
  return (cell.displayValue ?? cell.value ?? '').toString().trim();
}

// Smartsheet returns TEXT_NUMBER cells like "10552.0" or "92134.0" -- strip
// the trailing ".0" so store numbers/zips display the way they're written.
function cleanNumericText(text) {
  return text.replace(/\.0$/, '');
}

// Project Date is sometimes free text like "first available" rather than a
// real date. Treat anything that doesn't parse as "no date yet" rather than
// erroring or defaulting to some other date.
function normalizeDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function formatHours(raw) {
  if (!raw) return '';
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  const value = Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `${value} hr${n === 1 ? '' : 's'}`;
}

function buildLocation(address, city, state, zip) {
  const cityStateZip = [city, [state, zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return [address, cityStateZip].filter(Boolean).join(', ');
}

function mapSheetToRows(sheet) {
  const index = buildColumnIndex(sheet.columns);
  return sheet.rows
    .map((row) => {
      const storeNumber = cleanNumericText(cellText(row, index.storeNumber));
      const projectType = cellText(row, index.projectType);
      const explicitProject = cellText(row, index.project);
      const zip = cleanNumericText(cellText(row, index.zip));
      return {
        id: row.id,
        project: explicitProject || [projectType, storeNumber && `Store ${storeNumber}`].filter(Boolean).join(' — '),
        projectType,
        technician: cellText(row, index.technician),
        storeNumber,
        location: buildLocation(
          cellText(row, index.address),
          cellText(row, index.city),
          cellText(row, index.state),
          zip
        ),
        date: normalizeDate(cellText(row, index.date)),
        timeAssigned: cellText(row, index.timeAssigned),
        timeProjection: formatHours(cellText(row, index.timeProjection)),
        status: cellText(row, index.status),
      };
    })
    .filter((r) => r.storeNumber || r.projectType || r.technician || r.date);
}

class DataStore {
  constructor({ startDate, smartsheetClient, sheetId, mockMode }) {
    this.startDate = startDate;
    this.smartsheetClient = smartsheetClient;
    this.sheetId = sheetId;
    this.mockMode = mockMode;
    this.rows = [];
    this.lastSynced = null;
    this.lastError = null;
  }

  async sync() {
    try {
      let rows;
      if (this.mockMode) {
        rows = buildMockRows(this.startDate);
      } else {
        const sheet = await this.smartsheetClient.fetchSheet(this.sheetId);
        rows = mapSheetToRows(sheet);
      }
      const cutoff = this.startDate;
      this.rows = rows
        .filter((r) => !EXCLUDED_STATUSES.includes(r.status))
        // A row with a real date before the cutoff is old backlog -- skip it.
        // A row with no date yet (blank, or free text like "first available")
        // is still-pending work and stays in, headed for the Unassigned tab.
        .filter((r) => !r.date || r.date >= cutoff);
      this.lastSynced = new Date().toISOString();
      this.lastError = null;
    } catch (err) {
      this.lastError = err.message || String(err);
      throw err;
    }
    return this.rows.length;
  }

  isUnassigned(row) {
    return !row.technician || !row.date;
  }

  getMeta() {
    const technicians = new Set();
    const projectTypes = new Set();
    for (const r of this.rows) {
      if (r.technician) technicians.add(r.technician);
      if (r.projectType) projectTypes.add(r.projectType);
    }
    return {
      technicians: [...technicians].sort(),
      projectTypes: [...projectTypes].sort(),
      lastSynced: this.lastSynced,
      lastError: this.lastError,
      totalRows: this.rows.length,
      startDate: this.startDate,
      mockMode: this.mockMode,
    };
  }

  getJobs({ year, month, technicians, projectTypes }) {
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
    return this.rows
      .filter((r) => !this.isUnassigned(r))
      .filter((r) => r.date.startsWith(monthPrefix))
      .filter((r) => !technicians?.length || technicians.includes(r.technician))
      .filter((r) => !projectTypes?.length || projectTypes.includes(r.projectType))
      .sort((a, b) => (a.date + a.timeAssigned).localeCompare(b.date + b.timeAssigned));
  }

  getUnassigned({ technicians, projectTypes }) {
    return this.rows
      .filter((r) => this.isUnassigned(r))
      .filter((r) => !projectTypes?.length || projectTypes.includes(r.projectType))
      .filter((r) => !technicians?.length || technicians.includes(r.technician))
      .sort((a, b) => a.project.localeCompare(b.project));
  }
}

module.exports = { DataStore, mapSheetToRows };
