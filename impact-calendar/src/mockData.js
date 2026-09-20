// Sample rows so the app can be explored before Smartsheet credentials exist.
// Dates are relative to START_DATE so the demo stays meaningful over time.
function buildMockRows(startDateStr) {
  const start = new Date(startDateStr + 'T00:00:00');
  const addDays = (n) => {
    const d = new Date(start);
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  };

  const technicians = ['J. Rivera', 'M. Chen', 'A. Patel', 'D. Okafor'];
  const projectTypes = ['Install', 'Repair', 'Inspection', 'Maintenance'];

  const rows = [];
  let id = 1;

  const assigned = [
    { d: 0, tech: 0, type: 0, store: '4021', loc: 'Austin, TX', time: '8:00 AM', proj: '3 hrs' },
    { d: 1, tech: 1, type: 1, store: '1187', loc: 'Denver, CO', time: '10:30 AM', proj: '1.5 hrs' },
    { d: 1, tech: 2, type: 2, store: '2299', loc: 'Tampa, FL', time: '1:00 PM', proj: '45 min' },
    { d: 3, tech: 0, type: 3, store: '0587', loc: 'Reno, NV', time: '9:00 AM', proj: '2 hrs' },
    { d: 4, tech: 3, type: 0, store: '3312', loc: 'Columbus, OH', time: '7:30 AM', proj: '4 hrs' },
    { d: 6, tech: 1, type: 0, store: '5502', loc: 'Boise, ID', time: '11:00 AM', proj: '3 hrs' },
    { d: 8, tech: 2, type: 1, store: '1740', loc: 'Fresno, CA', time: '2:00 PM', proj: '1 hr' },
    { d: 10, tech: 0, type: 2, store: '6621', loc: 'Tulsa, OK', time: '8:30 AM', proj: '30 min' },
    { d: 12, tech: 3, type: 3, store: '4455', loc: 'Spokane, WA', time: '9:30 AM', proj: '2.5 hrs' },
    { d: 15, tech: 1, type: 0, store: '2210', loc: 'Akron, OH', time: '10:00 AM', proj: '3 hrs' },
  ];

  for (const j of assigned) {
    rows.push({
      id: id++,
      project: `${projectTypes[j.type]} - Store ${j.store}`,
      projectType: projectTypes[j.type],
      technician: technicians[j.tech],
      storeNumber: j.store,
      location: j.loc,
      date: addDays(j.d),
      timeAssigned: j.time,
      timeProjection: j.proj,
      dateAdded: addDays(j.d - 3),
      status: 'Assigned',
    });
  }

  const unassigned = [
    { type: 0, store: '7789', loc: 'Salem, OR', added: 0 },
    { type: 1, store: '3020', loc: 'Provo, UT', added: 1 },
    { type: 2, store: '9911', loc: 'Erie, PA', added: 2 },
    { type: 0, store: '4488', loc: 'Macon, GA', added: 5 },
  ];

  for (const j of unassigned) {
    rows.push({
      id: id++,
      project: `${projectTypes[j.type]} - Store ${j.store}`,
      projectType: projectTypes[j.type],
      technician: '',
      storeNumber: j.store,
      location: j.loc,
      date: '',
      timeAssigned: '',
      timeProjection: '',
      dateAdded: addDays(j.added),
      status: 'Unassigned',
    });
  }

  return rows;
}

module.exports = { buildMockRows };
