// Maps our internal field names to the possible column header names Smartsheet
// might use. Add your sheet's exact header text to the matching alias list if
// none of the defaults match -- no other code needs to change.
const FIELD_ALIASES = {
  project: ['Project', 'Project Name', 'Job', 'Job Name', 'Task Name'],
  projectType: ['Project Type', 'Type', 'Job Type', 'Work Type'],
  technician: ['Technician', 'Assigned To', 'Tech', 'Assignee'],
  storeNumber: ['Store #', 'Store Number', 'Store No.', 'Store'],
  location: ['Location', 'Address', 'Site', 'Site Address'],
  date: ['Date', 'Scheduled Date', 'Install Date', 'Service Date'],
  timeAssigned: ['Time', 'Scheduled Time', 'Time Assigned', 'Start Time'],
  timeProjection: [
    'Time Projection',
    'Estimated Duration',
    'Duration',
    'Est. Time',
    'Projected Hours',
  ],
  dateAdded: ['Date Added', 'Created', 'Created Date', 'Row Created'],
  status: ['Status'],
};

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

module.exports = { FIELD_ALIASES, buildColumnIndex };
