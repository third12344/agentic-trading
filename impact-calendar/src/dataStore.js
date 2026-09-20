const { buildColumnIndex } = require('./columnMapping');
const { buildMockRows } = require('./mockData');

function cellText(row, columnId) {
  if (columnId === undefined) return '';
  const cell = row.cells.find((c) => c.columnId === columnId);
  if (!cell) return '';
  return (cell.displayValue ?? cell.value ?? '').toString().trim();
}

function normalizeDate(raw) {
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function mapSheetToRows(sheet) {
  const index = buildColumnIndex(sheet.columns);
  return sheet.rows.map((row) => ({
    id: row.id,
    project: cellText(row, index.project),
    projectType: cellText(row, index.projectType),
    technician: cellText(row, index.technician),
    storeNumber: cellText(row, index.storeNumber),
    location: cellText(row, index.location),
    date: normalizeDate(cellText(row, index.date)),
    timeAssigned: cellText(row, index.timeAssigned),
    timeProjection: cellText(row, index.timeProjection),
    dateAdded: normalizeDate(cellText(row, index.dateAdded)) || undefined,
    status: cellText(row, index.status),
  }));
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
      this.rows = rows.filter((r) => {
        const anchor = r.date || r.dateAdded || '';
        return anchor >= cutoff;
      });
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
      .sort((a, b) => (a.dateAdded || '').localeCompare(b.dateAdded || ''));
  }
}

module.exports = { DataStore, mapSheetToRows };
