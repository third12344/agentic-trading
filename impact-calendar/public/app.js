const state = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  technicians: new Set(),
  projectTypes: new Set(),
  meta: { technicians: [], projectTypes: [] },
  activeTab: 'calendar',
};

const $ = (id) => document.getElementById(id);

function selectedListParam(set) {
  return [...set].join(',');
}

async function loadMeta() {
  const res = await fetch('/api/meta');
  state.meta = await res.json();
  renderFilterChips();
  renderSyncInfo();
}

function renderSyncInfo() {
  const { lastSynced, lastError, mockMode, totalRows } = state.meta;
  const when = lastSynced ? new Date(lastSynced).toLocaleString() : 'never';
  let text = `${totalRows ?? 0} jobs loaded · last synced ${when}`;
  if (mockMode) text += ' · sample data';
  if (lastError) text += ` · sync error: ${lastError}`;
  $('syncInfo').textContent = text;
}

function renderFilterChips() {
  renderChipGroup('techFilter', state.meta.technicians, state.technicians);
  renderChipGroup('typeFilter', state.meta.projectTypes, state.projectTypes);
}

function renderChipGroup(containerId, options, selectedSet) {
  const container = $(containerId);
  container.innerHTML = '';
  for (const opt of options) {
    const chip = document.createElement('button');
    chip.className = 'chip' + (selectedSet.has(opt) ? ' selected' : '');
    chip.textContent = opt;
    chip.onclick = () => {
      selectedSet.has(opt) ? selectedSet.delete(opt) : selectedSet.add(opt);
      renderFilterChips();
      refreshActiveTab();
    };
    container.appendChild(chip);
  }
}

function refreshActiveTab() {
  if (state.activeTab === 'calendar') loadCalendar();
  else loadUnassigned();
}

async function loadCalendar() {
  const params = new URLSearchParams({
    year: state.year,
    month: state.month,
    technicians: selectedListParam(state.technicians),
    projectTypes: selectedListParam(state.projectTypes),
  });
  const res = await fetch(`/api/jobs?${params}`);
  const { jobs } = await res.json();
  renderCalendar(jobs);
}

function renderCalendar(jobs) {
  const grid = $('calendarGrid');
  grid.innerHTML = '';
  const label = new Date(state.year, state.month - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
  $('monthLabel').textContent = label;

  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d) => {
    const h = document.createElement('div');
    h.className = 'day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  const jobsByDay = {};
  for (const j of jobs) {
    (jobsByDay[j.date] ??= []).push(j);
  }

  const firstOfMonth = new Date(state.year, state.month - 1, 1);
  const daysInMonth = new Date(state.year, state.month, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();

  for (let i = 0; i < leadingBlanks; i++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell outside';
    grid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${state.year}-${String(state.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const num = document.createElement('div');
    num.className = 'day-number';
    num.textContent = day;
    cell.appendChild(num);

    const dayJobs = jobsByDay[dateStr] || [];
    const visible = dayJobs.slice(0, 3);
    for (const job of visible) {
      const chip = document.createElement('div');
      chip.className = 'job-chip';
      chip.innerHTML = `<span class="t">${job.timeAssigned || ''}</span> ${job.technician} · #${job.storeNumber}`;
      chip.onclick = () => openModal(job);
      cell.appendChild(chip);
    }
    if (dayJobs.length > visible.length) {
      const more = document.createElement('div');
      more.className = 'more-note';
      more.textContent = `+${dayJobs.length - visible.length} more`;
      more.onclick = () => visible.length && openModal(dayJobs[visible.length]);
      cell.appendChild(more);
    }

    grid.appendChild(cell);
  }
}

async function loadUnassigned() {
  const params = new URLSearchParams({
    technicians: selectedListParam(state.technicians),
    projectTypes: selectedListParam(state.projectTypes),
  });
  const res = await fetch(`/api/unassigned?${params}`);
  const { jobs } = await res.json();
  renderUnassigned(jobs);
}

function renderUnassigned(jobs) {
  $('unassignedCount').textContent = jobs.length || '';
  const body = $('unassignedBody');
  body.innerHTML = '';
  $('unassignedEmpty').classList.toggle('hidden', jobs.length > 0);
  for (const j of jobs) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${j.project}</td>
      <td>${j.projectType}</td>
      <td>${j.storeNumber}</td>
      <td>${j.location}</td>
      <td>${j.dateAdded || ''}</td>
    `;
    body.appendChild(row);
  }
}

function openModal(job) {
  $('modalProject').textContent = job.project;
  $('modalTech').textContent = job.technician || '—';
  $('modalType').textContent = job.projectType || '—';
  $('modalStore').textContent = job.storeNumber || '—';
  $('modalLocation').textContent = job.location || '—';
  $('modalDate').textContent = job.date || '—';
  $('modalTime').textContent = job.timeAssigned || '—';
  $('modalProjection').textContent = job.timeProjection || '—';
  $('jobModal').classList.remove('hidden');
}

$('modalClose').onclick = () => $('jobModal').classList.add('hidden');
$('jobModal').addEventListener('click', (e) => {
  if (e.target.id === 'jobModal') $('jobModal').classList.add('hidden');
});

$('prevMonth').onclick = () => {
  state.month -= 1;
  if (state.month < 1) { state.month = 12; state.year -= 1; }
  loadCalendar();
};
$('nextMonth').onclick = () => {
  state.month += 1;
  if (state.month > 12) { state.month = 1; state.year += 1; }
  loadCalendar();
};

$('clearFilters').onclick = () => {
  state.technicians.clear();
  state.projectTypes.clear();
  renderFilterChips();
  refreshActiveTab();
};

document.querySelectorAll('.tab').forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.activeTab = btn.dataset.tab;
    $('calendarView').classList.toggle('hidden', state.activeTab !== 'calendar');
    $('unassignedView').classList.toggle('hidden', state.activeTab !== 'unassigned');
    refreshActiveTab();
  };
});

(async function init() {
  await loadMeta();
  await loadCalendar();
  await loadUnassigned();
})();
