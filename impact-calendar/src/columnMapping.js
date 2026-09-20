// Maps our internal field names to the possible column header names Smartsheet
// might use. The defaults below already match "Scheduling - The Impact
// Company" (NSN, Project Date, Time, Estimated Hours On Site, Lead Assigned,
// Address/City/State/Zip Code, Status, Project Type). If you point this at a
// different sheet, add its exact header text to the matching alias list --
// no other code needs to change.
const FIELD_ALIASES = {
  project: ['Project', 'Project Name', 'Job', 'Job Name', 'Task Name'],
  projectType: ['Project Type', 'Type', 'Job Type', 'Work Type'],
  technician: ['Lead Assigned', 'Technician', 'Assigned To', 'Tech', 'Assignee'],
  storeNumber: ['NSN', 'Store #', 'Store Number', 'Store No.', 'Store'],
  address: ['Address', 'Site Address'],
  city: ['City'],
  state: ['State'],
  zip: ['Zip Code', 'Zip', 'Postal Code'],
  date: ['Project Date', 'Date', 'Scheduled Date', 'Install Date', 'Service Date'],
  timeAssigned: ['Time', 'Scheduled Time', 'Time Assigned', 'Start Time'],
  timeProjection: [
    'Estimated Hours On Site',
    'Time Projection',
    'Estimated Duration',
    'Duration',
    'Est. Time',
    'Projected Hours',
  ],
  status: ['Status'],
};

// Statuses that represent dead/non-actionable rows -- never shown on the
// calendar or the unassigned tab.
const EXCLUDED_STATUSES = ['Cancelled', 'Duplicate', 'Move to Back Up File'];

// Builds { fieldName: columnId } by matching Smartsheet's actual column
// titles against the alias lists above (case-insensitive).
function buildColumnIndex(columns) {
  const byTitle = new Map(columns.map((c) => [c.title.trim().toLowerCase(), c.id]));
  const index = {};
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (const alias of aliases) {
      const id = byTitle.get(alias.trim().toLowerCase());
      if (id !== undefined) {
        index[field] = id;
        break;
      }
    }
  }
  return index;
}

module.exports = { FIELD_ALIASES, EXCLUDED_STATUSES, buildColumnIndex };
