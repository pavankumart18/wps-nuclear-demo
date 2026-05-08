// app.js — WeldAssign AI · NPCIL SM-11 Demo
// Uses EMBEDDED_DATA global from data-embedded.js and matching functions from matching.js

// ─── Icons (inline SVG strings) ──────────────────────────────────────────────
const IC = {
  check:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 11 4 12 2 16"/></svg>`,
  x:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  warn:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  check_circ:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  lock:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  user:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  copy:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  download:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  file_chk:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  wrench:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
  alert_circ:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

function icon(name, cls='') {
  const src = IC[name] || '';
  return src ? src.replace('<svg ', `<svg class="icon ${cls}" `) : '';
}

// ─── Welder Avatar Helpers ────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  '#38bdf8','#22c55e','#a855f7','#f59e0b','#ef4444',
  '#14b8a6','#ec4899','#6366f1','#fb923c','#84cc16',
];
function welderInitials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0,2).map(p => p[0]).join('').toUpperCase();
}
function welderAvatarColor(id) {
  const n = parseInt((id || '0').replace(/\D/g,'')) || 0;
  return AVATAR_PALETTE[n % AVATAR_PALETTE.length];
}
function welderExpYears(id) {
  const n = parseInt((id || '100').replace(/\D/g,'')) || 100;
  return 3 + (n % 17);
}
function welderLastWeld(id) {
  const n = parseInt((id || '1').replace(/\D/g,'')) || 1;
  const daysAgo = n % 28;
  const d = new Date('2026-05-07');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().substring(0,10);
}

// ─── Location Enrichment ──────────────────────────────────────────────────────
const LOCATION_LABELS = {
  'Bay 1':            'Reactor Bldg · Bay 1 · Zone A',
  'Bay 2':            'Turbine Hall · Bay 2 · Zone B',
  'Bay 3':            'Auxiliary Bldg · Bay 3 · Zone C',
  'Field Maintenance':'Open Area · Field Maint.',
  'QA Hold Area':     'QA Hold Bay · Inspection',
};
function enrichLocation(loc) {
  return LOCATION_LABELS[loc] || loc;
}

// ─── State ────────────────────────────────────────────────────────────────────
const S = {
  section: 'data-ingestion',
  data: null,
  selectedJob: null,
  wpsRecord: null,
  validationResult: null,
  qualMappings: [],
  matchResult: null,
  exceptions: [],
  approvedWelder: null,
  // UI state
  showRejected: false,
  showAllWelders: false,
  shiftFilter: 'all',
  priorityFilter: 'all',
  statusFilter: 'all',
  wpsFilter: 'all',
  searchQuery: '',
  wpsPage: 1,
  wpsTab: 'qualification',
  guidedOn: true,
  guidedStep: 0,
  // Disruption simulation
  activeDisruptions: [],
  availableDisruptions: [
    { id: 'maria_sick', label: 'Maria Chen — Sick Leave Today', welderIds: ['W-104'], type: 'welder_unavailable', icon: '🤒' },
    { id: 'crane_down', label: 'Crane #2 — 2hr Downtime', locations: ['Bay 1'], type: 'equipment_downtime', icon: '🏗️' },
    { id: 'omar_called', label: 'Omar Ruiz — Called to Unit 4', welderIds: ['W-153'], type: 'welder_unavailable', icon: '📢' },
  ],
  dataIngestionDone: false,
};

// Named demo welders — pinned in matching table regardless of showRejected
const DEMO_WELDER_IDS = ['W-104','W-153','W-117','W-145','W-166','W-171','W-190','W-132'];

const DEMO_STEPS = [
  { section: 'shift-planner',   hint: 'Step 1 — Select JOB-001 (★ Demo) from the job table',                         target: 'job-row-JOB-001' },
  { section: 'shift-planner',   hint: 'Step 2 — Click "Analyze WPS" to extract welding procedure fields via AI',      target: 'btn-analyze-wps' },
  { section: 'wps-extraction',  hint: 'Step 3 — Review extracted fields (◉ = used for matching). Click "Validate Job Against WPS"', target: 'btn-validate-wps' },
  { section: 'validation',      hint: 'Step 4 — All 8 checks pass for JOB-001. Click "Find Required Qualification"',  target: 'btn-find-qual' },
  { section: 'qual-mapping',    hint: 'Step 5 — Preferred ticket Q-SM11-SMAW-P1P1-ALL-FR identified. Click "Match Welders"', target: 'btn-match-welders' },
  { section: 'welder-matching', hint: 'Step 6 — Click Maria Chen to see why she is the top recommendation',           target: 'welder-row-W-104' },
  { section: 'welder-matching', hint: 'Step 7 — Click David Patel to see the limited-ticket thickness rejection',     target: 'welder-row-W-117' },
  { section: 'welder-matching', hint: 'Step 8 — Click Aisha Khan to see the GTAW→SMAW process mismatch rejection',   target: 'welder-row-W-145' },
  { section: 'welder-matching', hint: 'Step 9 — Click "Approve" on Maria Chen to generate the Execution Ticket',     target: 'btn-approve-W-104' },
  { section: 'execution-ticket',hint: 'Step 10 — Weld Execution Ticket generated. Full audit trail. Download or copy', target: 'btn-download-ticket' },
];

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigate(section, opts = {}) {
  S.section = section;
  updateNav();
  updateGuidedBar();
  render();
  if (!opts.noScroll) {
    const el = document.getElementById('main-content');
    if (el) el.scrollTop = 0;
  }
}

function updateNav() {
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.section === S.section);
  });
}

function updateTopbar() {
  const info = document.getElementById('topbar-job-info');
  if (!info) return;
  if (!S.selectedJob) {
    info.innerHTML = `<span class="topbar-hint">No job selected — select a job from the Shift Planner</span>`;
  } else {
    const j = S.selectedJob;
    info.innerHTML = `
      <span class="topbar-job-tag">${esc(j.job_id)}</span>
      <span class="topbar-job-desc">${esc(j.job_description)}</span>
      ${badgeHtml(statusColor(j.status), j.status)}
    `;
  }
  if (window.lucide) lucide.createIcons({ nodes: [info] });
}

function updateGuidedBar() {
  const bar = document.getElementById('guided-bar');
  const tog = document.getElementById('guided-toggle');
  if (!bar) return;
  if (!S.guidedOn) {
    bar.classList.remove('visible');
    tog.classList.remove('on');
    return;
  }
  tog.classList.add('on');
  bar.classList.add('visible');
  const step = DEMO_STEPS[S.guidedStep] || DEMO_STEPS[DEMO_STEPS.length - 1];
  document.getElementById('guided-step-num').textContent = (S.guidedStep + 1) + ' / ' + DEMO_STEPS.length;
  document.getElementById('guided-hint').textContent = step.hint;
}

function toggleGuided() {
  S.guidedOn = !S.guidedOn;
  updateGuidedBar();
  if (S.guidedOn) applyGuidedHighlight();
}

function guidedNext() {
  if (S.guidedStep < DEMO_STEPS.length - 1) {
    S.guidedStep++;
    const step = DEMO_STEPS[S.guidedStep];
    if (step.section !== S.section) navigate(step.section);
    else { updateGuidedBar(); applyGuidedHighlight(); }
  }
}

function guidedPrev() {
  if (S.guidedStep > 0) {
    S.guidedStep--;
    const step = DEMO_STEPS[S.guidedStep];
    if (step.section !== S.section) navigate(step.section);
    else { updateGuidedBar(); applyGuidedHighlight(); }
  }
}

function advanceGuided(section) {
  const next = DEMO_STEPS.findIndex((s, i) => i > S.guidedStep && s.section === section);
  if (next !== -1) S.guidedStep = next;
  updateGuidedBar();
}

function applyGuidedHighlight() {
  document.querySelectorAll('.guided-highlight').forEach(el => el.classList.remove('guided-highlight'));
  if (!S.guidedOn) return;
  const step = DEMO_STEPS[S.guidedStep];
  if (!step || !step.target) return;
  const el = document.getElementById(step.target);
  if (el) el.classList.add('guided-highlight');
}

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  const el = document.getElementById('main-content');
  if (!S.data) {
    el.innerHTML = `<div class="loading-state"><div class="loading-spinner"></div><p>Loading data…</p></div>`;
    return;
  }
  switch (S.section) {
    case 'data-ingestion':   el.innerHTML = renderDataIngestion(); break;
    case 'shift-planner':    el.innerHTML = renderShiftPlanner(); break;
    case 'wps-extraction':   el.innerHTML = renderWPSExtraction(); break;
    case 'validation':       el.innerHTML = renderValidation(); break;
    case 'qual-mapping':     el.innerHTML = renderQualMapping(); break;
    case 'welder-matching':  el.innerHTML = renderWelderMatching(); break;
    case 'exceptions':       el.innerHTML = renderExceptions(); break;
    case 'execution-ticket': el.innerHTML = renderExecutionTicket(); break;
    default: el.innerHTML = `<div class="locked-state"><div class="locked-icon">${icon('lock')}</div><p class="locked-title">Section not found</p></div>`;
  }
  if (window.lucide) lucide.createIcons({ nodes: [el] });
  applyGuidedHighlight();
}

// ─── HTML Helpers ─────────────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function badgeHtml(color, text) {
  return `<span class="badge badge-${color}">${esc(text)}</span>`;
}

function statusColor(status) {
  if (!status) return 'gray';
  const s = status.toLowerCase();
  if (s.includes('recommended')) return 'green';
  if (s.includes('eligible'))    return 'blue';
  if (s.includes('backup'))      return 'amber';
  if (s.includes('conditional')) return 'amber';
  if (s.includes('exception') || s.includes('engineering')) return 'purple';
  if (s.includes('rejected') || s.includes('fail'))         return 'red';
  if (s.includes('expired'))     return 'red';
  if (s.includes('unavailable')) return 'gray';
  if (s.includes('needs assignment')) return 'blue';
  if (s.includes('needs review'))     return 'amber';
  if (s.includes('ready'))    return 'green';
  if (s.includes('assigned')) return 'green';
  if (s.includes('pass'))     return 'green';
  if (s.includes('warning'))  return 'amber';
  return 'gray';
}

function checkIcon(status) {
  const cls = status === 'pass' ? 'check-pass' : status === 'fail' ? 'check-fail' : 'check-warn';
  const sym = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '!';
  return `<div class="check-icon-wrap ${cls}">${sym}</div>`;
}

function constraintResultHtml(result) {
  const cls = result === 'pass' ? 'cr-pass' : result === 'fail' ? 'cr-fail' : 'cr-warn';
  const sym = result === 'pass' ? '✓ Pass' : result === 'fail' ? '✗ Fail' : '⚠ Warn';
  return `<span class="${cls}">${sym}</span>`;
}

// ─── Section: Data Ingestion ──────────────────────────────────────────────────
function renderDataIngestion() {
  if (S.dataIngestionDone) {
    return `
      <div class="section-head">
        <div>
          <div class="section-title">Data Ingestion Complete</div>
          <div class="section-sub">All data sources analyzed · Ready for shift planning</div>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary" onclick="navigate('shift-planner')">
            <i data-lucide="layout-dashboard"></i> Go to Shift Planner
          </button>
        </div>
      </div>
      ${renderIngestionSummary()}
    `;
  }
  return `
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:24px">
      <div style="text-align:center">
        <div style="font-size:48px;margin-bottom:8px;filter:drop-shadow(0 0 12px rgba(56,189,248,.3))">📊</div>
        <div style="font-size:22px;font-weight:700;color:var(--text);margin-bottom:6px">Upload Welding Data</div>
        <div style="font-size:14px;color:var(--muted);max-width:400px;margin:0 auto 24px">
          Upload your Excel workbook or connect to your data sources. AI will analyze and extract all relevant information.
        </div>
      </div>
      <div style="display:flex;gap:14px">
        <button class="btn btn-primary btn-lg" onclick="runDataIngestion()" id="btn-upload-data" style="padding:14px 32px;font-size:15px">
          <i data-lucide="upload"></i> Analyze welding_demo_input_data.xlsx
        </button>
        <label class="btn btn-secondary btn-lg" style="padding:14px 32px;font-size:15px;cursor:pointer">
          <i data-lucide="file-plus"></i> Upload Custom File
          <input type="file" accept=".xlsx,.xls,.csv" style="display:none" onchange="runDataIngestion()">
        </label>
      </div>
      <div style="font-size:11px;color:var(--dim);margin-top:8px">Supports .xlsx, .xls, and .csv formats · Data is processed locally</div>
    </div>
  `;
}

function renderIngestionSummary() {
  const jobCount = S.data ? S.data.jobs.length : 80;
  const welderCount = S.data ? S.data.welders.length : 50;
  const wpsCount = S.data ? S.data.wps.length : 12;
  const contradictions = S.exceptions.filter(e => e.type === 'wps_contradiction').length;
  const incompleteWelders = S.data ? S.data.welders.filter(w => w.data_completeness).length : 0;

  return `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px">
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:28px;font-weight:800;color:var(--accent);font-family:var(--mono)">${jobCount}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">Jobs Extracted</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:28px;font-weight:800;color:var(--c-green);font-family:var(--mono)">${welderCount}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">Welders Loaded</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:28px;font-weight:800;color:var(--c-amber);font-family:var(--mono)">${wpsCount}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">WPS Documents</div>
      </div>
      <div class="card" style="text-align:center;padding:20px;border-color:rgba(239,68,68,.3)">
        <div style="font-size:28px;font-weight:800;color:var(--c-red);font-family:var(--mono)">${contradictions + incompleteWelders}</div>
        <div style="font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-top:4px">Issues Detected</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px">
      <div class="card" style="border-color:rgba(239,68,68,.25)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="width:28px;height:28px;border-radius:6px;background:rgba(239,68,68,.1);display:flex;align-items:center;justify-content:center;font-size:14px">⚡</div>
          <div style="font-size:13px;font-weight:700;color:var(--text)">Contradictions Found</div>
        </div>
        <div style="font-size:12px;color:var(--muted);line-height:1.6">
          AI detected <strong style="color:var(--c-red)">${contradictions} WPS contradiction(s)</strong> where document notes 
          conflict with stated parameter ranges. These require engineering review before assignment.
        </div>
      </div>
      <div class="card" style="border-color:rgba(245,158,11,.25)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="width:28px;height:28px;border-radius:6px;background:rgba(245,158,11,.1);display:flex;align-items:center;justify-content:center;font-size:14px">📋</div>
          <div style="font-size:13px;font-weight:700;color:var(--text)">Incomplete Records</div>
        </div>
        <div style="font-size:12px;color:var(--muted);line-height:1.6">
          <strong style="color:var(--c-amber)">${incompleteWelders} welder(s)</strong> have incomplete documentation — 
          missing weld logs, qualification certificates, or continuity records. System flags these for review rather than guessing.
        </div>
      </div>
    </div>

    <div class="alert alert-blue" style="margin-bottom:16px">
      <i data-lucide="info"></i>
      <div><strong>Data Extracted from Excel</strong><br>
      All job schedules, welder qualifications, WPS parameters, and qualification matrices were parsed from 
      <code style="font-family:var(--mono);background:rgba(56,189,248,.1);padding:1px 5px;border-radius:3px">welding_demo_input_data.xlsx</code>. 
      The system identified data quality issues automatically — no manual inspection required.</div>
    </div>
  `;
}

async function runDataIngestion() {
  await showLoading('📊', 'Analyzing Excel Workbook', [
    'Opening welding_demo_input_data.xlsx…',
    'Scanning worksheet tabs — Jobs, Welders, WPS, Qualifications…',
    'Extracting 80 job records from Schedule sheet…',
    'Parsing 50 welder qualification records…',
    'Analyzing 12 WPS documents for parameter extraction…',
    'Cross-referencing qualification matrices…',
    'Detecting data quality issues…',
    'Found contradiction: WPS-001 notes conflict with thickness range…',
    'Found incomplete records: 2 welders missing documentation…',
    'Building structured decision model…',
    'Data ingestion complete.',
  ], 4500);

  S.dataIngestionDone = true;
  render();
  hideLoading();
  showToast('Data analysis complete — ' + S.data.jobs.length + ' jobs, ' + S.data.welders.length + ' welders loaded', 'info');
}

// ─── Disruption Simulation ────────────────────────────────────────────────────
function renderDisruptionPanel() {
  return `
    <div class="disruption-panel" style="margin-bottom:16px;padding:14px 16px;background:linear-gradient(135deg,rgba(245,158,11,.05),rgba(239,68,68,.05));border:1px solid rgba(245,158,11,.2);border-radius:var(--radius)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <span style="font-size:14px">🔄</span>
        <span style="font-size:12px;font-weight:700;color:var(--c-amber);letter-spacing:.5px;text-transform:uppercase">Live Disruption Simulation</span>
        <span style="font-size:10px;color:var(--dim);margin-left:auto">Toggle to see system response</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${S.availableDisruptions.map(d => {
          const active = S.activeDisruptions.includes(d.id);
          return `
            <button class="btn ${active ? 'btn-danger' : 'btn-ghost'} btn-sm"
                    style="font-size:11px;${active ? 'background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.4);color:var(--c-red)' : ''}"
                    onclick="toggleDisruption('${d.id}')">
              <span style="margin-right:4px">${d.icon}</span> ${d.label}
              <span style="margin-left:4px;font-size:10px">${active ? '✕ Active' : '○'}</span>
            </button>`;
        }).join('')}
      </div>
      ${S.activeDisruptions.length > 0 ? `
        <div class="alert alert-amber" style="margin-top:10px;font-size:12px;padding:8px 12px">
          <i data-lucide="alert-triangle"></i>
          <div><strong>${S.activeDisruptions.length} active disruption(s)</strong> — 
          System has automatically re-ranked candidates and adjusted job priorities. 
          ${getDisruptionImpactSummary()}</div>
        </div>` : ''}
    </div>
  `;
}

function toggleDisruption(id) {
  const idx = S.activeDisruptions.indexOf(id);
  if (idx === -1) S.activeDisruptions.push(id);
  else S.activeDisruptions.splice(idx, 1);
  
  // Re-run matching if we have results
  if (S.matchResult && S.selectedJob && S.wpsRecord && S.qualMappings.length) {
    S.matchResult = matchWelders(S.selectedJob, S.wpsRecord, S.data.qualMapping, S.data.qualMatrix, getEffectiveWelders(), S.data.pqr);
  }
  render();
  
  const d = S.availableDisruptions.find(x => x.id === id);
  if (d) {
    const active = S.activeDisruptions.includes(id);
    showToast(active ? `⚠ Disruption active: ${d.label}` : `✓ Disruption cleared: ${d.label}`, active ? 'warn' : 'info');
  }
}

function getEffectiveWelders() {
  if (!S.data) return [];
  let welders = [...S.data.welders];
  
  for (const dId of S.activeDisruptions) {
    const d = S.availableDisruptions.find(x => x.id === dId);
    if (!d) continue;
    if (d.type === 'welder_unavailable' && d.welderIds) {
      welders = welders.map(w => {
        if (d.welderIds.includes(w.welder_id)) {
          return { ...w, availability_status: `Unavailable — ${d.label}` };
        }
        return w;
      });
    }
  }
  return welders;
}

function getDisruptionImpactSummary() {
  const impacts = [];
  for (const dId of S.activeDisruptions) {
    const d = S.availableDisruptions.find(x => x.id === dId);
    if (!d) continue;
    if (d.type === 'welder_unavailable' && d.welderIds) {
      const names = d.welderIds.map(id => {
        const w = S.data?.welders.find(w => w.welder_id === id);
        return w ? w.welder_name : id;
      });
      impacts.push(`${names.join(', ')} unavailable — next eligible candidate auto-promoted.`);
    }
    if (d.type === 'equipment_downtime' && d.locations) {
      const jobsAffected = S.data?.jobs.filter(j => d.locations.includes(j.location)).length || 0;
      impacts.push(`${jobsAffected} jobs in ${d.locations.join(', ')} delayed — schedule re-prioritized.`);
    }
  }
  return impacts.join(' ');
}


function renderShiftPlanner() {
  const allJobs = S.data.jobs;
  const shifts     = ['all', ...new Set(allJobs.map(j => j.shift))].sort();
  const priorities = ['all', ...new Set(allJobs.map(j => j.priority))].sort();
  const statuses   = ['all', ...new Set(allJobs.map(j => j.status))].sort();
  const wpsList    = ['all', ...new Set(allJobs.map(j => j.wps_id))].sort();

  const filtered = allJobs.filter(j => {
    if (S.shiftFilter    !== 'all' && j.shift    !== S.shiftFilter)    return false;
    if (S.priorityFilter !== 'all' && j.priority !== S.priorityFilter) return false;
    if (S.statusFilter   !== 'all' && j.status   !== S.statusFilter)   return false;
    if (S.wpsFilter      !== 'all' && j.wps_id   !== S.wpsFilter)      return false;
    if (S.searchQuery) {
      const q = S.searchQuery.toLowerCase();
      if (!j.job_id.toLowerCase().includes(q) &&
          !j.work_order.toLowerCase().includes(q) &&
          !j.job_description.toLowerCase().includes(q) &&
          !j.wps_id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selectOpts = (arr, val) => arr.map(v =>
    `<option value="${esc(v)}" ${v===val?'selected':''}>${v === 'all' ? 'All' : esc(v)}</option>`
  ).join('');

  const rows = filtered.map(j => {
    const isSelected = S.selectedJob?.job_id === j.job_id;
    const isDemo     = j.job_id === 'JOB-001';
    const wpsRec     = S.data.wps.find(w => w.wps_id === j.wps_id);
    const tooltip    = wpsRec ? esc(`${wpsRec.source_wps_no} — ${wpsRec.welding_process_root || ''}`) : '';
    const priorityColor = { Critical: 'red', High: 'red', Medium: 'amber', Low: 'gray' }[j.priority] || 'gray';

    const jointId = 'WJ-' + j.work_order.replace('WO-','');
    const locLabel = enrichLocation(j.location);

    return `
      <tr class="${isSelected ? 'selected' : ''}" id="job-row-${j.job_id}"
          data-action="select-job" data-job-id="${esc(j.job_id)}">
        <td>
          <div style="display:flex;flex-direction:column;gap:2px">
            <span class="text-mono text-accent">${esc(j.job_id)}</span>
            ${isDemo ? '<span class="demo-pill">★ Demo</span>' : ''}
          </div>
        </td>
        <td>
          <div class="text-mono text-muted" style="font-size:11px">${esc(j.work_order)}</div>
          <div style="font-size:9.5px;color:var(--dim);font-family:var(--mono)">${esc(jointId)}</div>
        </td>
        <td data-tooltip="${tooltip}" class="text-mono" style="font-size:12px">${esc(j.wps_id)}</td>
        <td style="max-width:220px">
          <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">${esc(j.job_description)}</div>
          <div style="font-size:10px;color:var(--dim);margin-top:2px">${esc(locLabel)}</div>
        </td>
        <td class="text-mono" style="font-size:12px">${j.thickness_mm} mm</td>
        <td>${badgeHtml('gray', j.required_position)}</td>
        <td>${badgeHtml('gray', j.shift)}</td>
        <td>${badgeHtml(priorityColor, j.priority)}</td>
        <td>${badgeHtml(statusColor(j.status), j.status)}</td>
      </tr>`;
  }).join('');

  const statsNeeds = allJobs.filter(j => j.status === 'Needs assignment').length;
  const statsHigh  = allJobs.filter(j => j.priority === 'High' || j.priority === 'Critical').length;

  return `
    <div class="section-head">
      <div>
        <div class="section-title">Shift Planner</div>
        <div class="section-sub">Shift A · 2026-05-07 · ${allJobs.length} jobs scheduled</div>
      </div>
      <div class="section-actions">
        <span class="badge badge-blue">${statsNeeds} need assignment</span>
        <span class="badge badge-amber">${statsHigh} high priority</span>
      </div>
    </div>

    <div class="filters-bar">
      <i data-lucide="search" style="width:14px;height:14px;color:var(--dim)"></i>
      <input class="search-input" type="text" placeholder="Search job / WPS / description…"
             value="${esc(S.searchQuery)}"
             oninput="S.searchQuery=this.value; render()">
      <select class="filter-select" onchange="S.shiftFilter=this.value; render()">
        ${selectOpts(shifts, S.shiftFilter)}
      </select>
      <select class="filter-select" onchange="S.priorityFilter=this.value; render()">
        ${selectOpts(priorities, S.priorityFilter)}
      </select>
      <select class="filter-select" onchange="S.statusFilter=this.value; render()">
        ${selectOpts(statuses, S.statusFilter)}
      </select>
      <select class="filter-select" onchange="S.wpsFilter=this.value; render()" title="Filter by WPS">
        ${wpsList.map(v => `<option value="${esc(v)}" ${v===S.wpsFilter?'selected':''}>${v === 'all' ? 'All WPS' : esc(v)}</option>`).join('')}
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Work Order</th>
            <th>WPS</th>
            <th>Description</th>
            <th>Thickness</th>
            <th>Position</th>
            <th>Shift</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${filtered.length === 0 ? `<div style="text-align:center;padding:32px;color:var(--muted)">No jobs match filters</div>` : ''}

    ${S.selectedJob ? renderJobQuickCard() : ''}
  `;
}

function renderJobQuickCard() {
  const j = S.selectedJob;
  const wpsRec = S.data.wps.find(w => w.wps_id === j.wps_id);
  return `
    <div style="margin-top:20px">
      <div class="card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px">
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--text)">${esc(j.job_id)}
              <span style="font-size:13px;font-weight:400;color:var(--muted);margin-left:8px">${esc(j.work_order)}</span>
            </div>
            <div style="font-size:13px;color:var(--muted);margin-top:3px">${esc(j.job_description)}</div>
          </div>
          <div style="display:flex;gap:8px;flex-shrink:0">
            <button id="btn-analyze-wps" class="btn btn-primary" onclick="analyzeWPS()">
              <i data-lucide="file-text"></i> Analyze WPS
            </button>
            <button class="btn btn-secondary" onclick="openJobDrawer()">
              <i data-lucide="info"></i> Details
            </button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
          ${quickStat('WPS', j.wps_id + (wpsRec ? ` · ${wpsRec.welding_process_root}` : ''))}
          ${quickStat('Thickness', j.thickness_mm + ' mm')}
          ${quickStat('Position', j.required_position)}
          ${quickStat('Shift', j.shift)}
          ${quickStat('Priority', j.priority)}
        </div>
      </div>
    </div>
  `;
}

function quickStat(label, val) {
  return `
    <div style="background:var(--surface-hi);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px">
      <div style="font-size:10px;font-weight:600;color:var(--dim);letter-spacing:.4px;text-transform:uppercase">${esc(label)}</div>
      <div style="font-size:13px;font-weight:600;color:var(--text);margin-top:3px;font-family:var(--mono)">${esc(val)}</div>
    </div>`;
}

// ─── Section: WPS Extraction ──────────────────────────────────────────────────
function renderWPSExtraction() {
  if (!S.selectedJob || !S.wpsRecord) {
    return lockedState('lock', 'No Job Selected',
      'Select a job from the Shift Planner and click "Analyze WPS" to view extraction results.');
  }

  const wps = S.wpsRecord;
  const confPct = ((wps.extraction_confidence || 0.97) * 100).toFixed(0);
  const needsReview = wps.extraction_review_required;
  const confBadge = needsReview
    ? `<span class="wps-conf-badge warn">⚠ ${confPct}% — Review Required</span>`
    : `<span class="wps-conf-badge">✓ ${confPct}% Confidence</span>`;

  const tabs = [
    { id: 'qualification', label: 'Qualification Drivers' },
    { id: 'execution',     label: 'Execution Parameters' },
    { id: 'consumables',   label: 'Consumables' },
    { id: 'notes',         label: 'Notes & Flags' },
  ];

  const tabBar = tabs.map(t =>
    `<div class="tab ${S.wpsTab === t.id ? 'active' : ''}"
          data-action="wps-tab" data-tab="${t.id}">${t.label}</div>`
  ).join('');

  const thumbs = [1,2,3].map(p => `
    <div class="pdf-thumb ${S.wpsPage === p ? 'active' : ''}"
         data-action="wps-page" data-page="${p}">
      <div class="pdf-thumb-doc">${buildThumbContent(p)}</div>
      <div class="pdf-thumb-label">Page ${p}</div>
    </div>`).join('');

  return `
    <div class="section-head">
      <div>
        <div class="section-title">WPS Extraction</div>
        <div class="section-sub">Source: ${esc(wps.source_wps_no)} · ${esc(wps.wps_id)} · ${confBadge}</div>
      </div>
      <div class="section-actions">
        <button id="btn-validate-wps" class="btn btn-primary" onclick="runValidation()">
          <i data-lucide="check-circle"></i> Validate Job Against WPS
        </button>
      </div>
    </div>

    ${needsReview ? `
      <div class="alert alert-amber" style="margin-bottom:16px">
        <i data-lucide="alert-triangle"></i>
        <span>Extraction confidence below threshold on some fields — human review recommended before production use.</span>
      </div>` : ''}

    <div class="wps-layout">
      <!-- Left: PDF viewer -->
      <div class="pdf-panel">
        <div class="pdf-thumbs">${thumbs}</div>
        <div class="pdf-viewer" id="pdf-viewer">
          ${buildWPSDocPage(wps, S.wpsPage)}
        </div>
      </div>

      <!-- Right: Extracted fields -->
      <div class="wps-fields-panel">
        <div class="tab-bar">${tabBar}</div>
        ${renderWPSTabContent(wps, S.wpsTab)}
        <div style="margin-top:16px;display:flex;justify-content:flex-end">
          <button id="btn-validate-wps2" class="btn btn-primary btn-lg" onclick="runValidation()">
            <i data-lucide="check-circle"></i> Validate Job Against WPS
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderWPSTabContent(wps, tab) {
  if (tab === 'qualification') {
    return `
      <div style="margin-bottom:10px;font-size:12px;color:var(--muted)">
        Fields highlighted <span style="color:var(--accent);font-weight:700">◉</span> in the document are used for matching.
      </div>
      <div class="field-grid">
        ${fld('WPS No.', wps.source_wps_no, true, 'Page 1 · Sec 1', 'Matching: WPS identity')}
        ${fld('Qualification Status', wps.qualification_status, true, 'Page 1 · Sec 1', 'Matching: must be Qualified')}
        ${fld('Supporting PQR', wps.supporting_pqr_no, true, 'Page 1 · Sec 1', 'Matching: PQR support check')}
        ${fld('Process (Root)', wps.welding_process_root, true, 'Page 1 · Sec 2', 'Matching: process requirement')}
        ${fld('Base Material From', wps.base_material_from, true, 'Page 1 · Sec 4', 'Matching: material group')}
        ${fld('Base Material To', wps.base_material_to, true, 'Page 1 · Sec 4', 'Matching: material group')}
        ${fld('Min Thickness (mm)', wps.groove_thickness_min_mm, true, 'Page 1 · Sec 4', 'Matching: thickness range lower bound')}
        ${fld('Max Thickness (mm)', wps.groove_thickness_max_mm, true, 'Page 1 · Sec 4', 'Matching: thickness range upper bound')}
        ${fld('Positions (Groove)', wps.positions_groove, true, 'Page 1 · Sec 5', 'Matching: position coverage')}
        ${fld('Weld Progression', wps.weld_progression, true, 'Page 1 · Sec 5', 'Matching: progression requirement')}
        ${fld('PWHT Required', wps.pwht_required ? 'Yes' : 'No', true, 'Page 2 · Sec 6', 'Matching: PWHT capability check')}
        ${fld('Preheat Min (°C)', wps.preheat_min_c, false, 'Page 2 · Sec 6', 'Execution only — not a matching variable')}
      </div>`;
  }
  if (tab === 'execution') {
    return `<div class="field-grid">
      ${fld('Filler Specification', wps.filler_specification, false, 'Page 1 · Sec 6')}
      ${fld('AWS Classification', wps.aws_classification, false, 'Page 1 · Sec 6')}
      ${fld('F-Number', wps.f_no, false, 'Page 1 · Sec 6')}
      ${fld('A-Number', wps.a_no, false, 'Page 1 · Sec 6')}
      ${fld('Polarity', wps.polarity, false, 'Page 2 · Sec 8')}
      ${fld('Travel Speed', wps.travel_speed_range_mm_min, false, 'Page 2 · Sec 8')}
      ${fld('Current (DC/AC)', 'DC', false, 'Page 2 · Sec 8')}
      ${fld('Root Technique', wps.root_bead_technique, false, 'Page 2 · Sec 9')}
      ${fld('Fill Technique', wps.subsequent_bead_technique, false, 'Page 2 · Sec 9')}
      ${fld('Back Gouging', wps.back_gouging_method, false, 'Page 2 · Sec 9')}
      ${fld('Cleaning', wps.cleaning_method, false, 'Page 2 · Sec 9')}
      ${fld('Peening', wps.peening_allowed ? 'Allowed' : 'Not allowed', false, 'Page 2 · Sec 9')}
    </div>`;
  }
  if (tab === 'consumables') {
    const cons = S.data.consumables.filter(c => c.wps_id === wps.wps_id);
    if (!cons.length) return `<div style="color:var(--muted);font-size:13px;padding:20px 0">No consumables reference data for this WPS.</div>`;
    const rows = cons.map((c,i) => `
      <tr>
        <td class="text-mono text-accent" style="font-size:11px">${esc(c.pass_type || 'Pass ' + (i+1))}</td>
        <td class="text-mono" style="font-size:11px">${esc(c.filler_specification)}</td>
        <td class="text-mono" style="font-size:11px">${esc(c.filler_class)}</td>
        <td>${esc(c.filler_size_mm)} mm</td>
        <td class="text-mono" style="font-size:11px">${esc(c.amps_min)}–${esc(c.amps_max)} A / ${esc(c.volts_min)}–${esc(c.volts_max)} V</td>
        <td>${esc(c.shielding_gas || 'NA')}</td>
      </tr>`).join('');
    return `<div class="table-wrap"><table>
      <thead><tr><th>Pass Type</th><th>Specification</th><th>Filler Class</th><th>Size</th><th>Amps / Volts</th><th>Shielding Gas</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  }
  if (tab === 'notes') {
    return `
      <div style="display:flex;flex-direction:column;gap:10px">
        ${wps.extraction_review_required ? `
          <div class="alert alert-amber">
            <i data-lucide="alert-triangle"></i>
            <div><strong>Extraction Review Required</strong><br>
            Some fields may have reduced confidence. Review highlighted fields in the document before assigning to production work.</div>
          </div>` : ''}
        <div class="alert alert-blue">
          <i data-lucide="info"></i>
          <div><strong>Notch Toughness Note</strong><br>
          If job requires notch toughness qualification, ensure the welder qualification test used a vertical uphill coupon position (3G, 5G, or 6G).</div>
        </div>
        <div class="alert alert-blue">
          <i data-lucide="info"></i>
          <div><strong>Suitability Check</strong><br>
          User must check specifications and drawings for suitability and obtain WPS acceptance approval before use in production.</div>
        </div>
        ${fld('Extraction Confidence', ((wps.extraction_confidence || 0.97)*100).toFixed(0) + '%',
              wps.extraction_confidence < 0.95, 'wps_extracted_parameters.csv', '')}
        ${fld('Review Required', wps.extraction_review_required ? 'Yes' : 'No',
              wps.extraction_review_required, 'wps_extracted_parameters.csv', '')}
      </div>`;
  }
  return '';
}

function fld(label, value, highlight=false, source='', tooltip='') {
  const tip = tooltip ? ` data-tooltip="${esc(source + (tooltip ? ' · ' + tooltip : ''))}"` : (source ? ` data-tooltip="${esc(source)}"` : '');
  const confPct = S.wpsRecord ? Math.round((S.wpsRecord.extraction_confidence || 0.97) * 100) : 97;
  const needsReview = S.wpsRecord?.extraction_review_required;
  const confBadge = needsReview
    ? `<span class="field-conf-badge" style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(245,158,11,.12);color:#f59e0b;font-family:var(--mono);margin-left:4px">⚠ ${confPct}%</span>`
    : `<span class="field-conf-badge" style="font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(2,132,199,.1);color:#0284c7;font-family:var(--mono);margin-left:4px">${confPct}%</span>`;
  return `
    <div class="field-row"${tip}>
      <div class="field-label">${esc(label)}</div>
      <div class="field-value${highlight ? ' hi' : ''}">${esc(value ?? '—')}${source ? confBadge : ''}</div>
      ${source ? `<div class="field-conf">${highlight ? '◉ Used for matching' : ''}</div>` : ''}
    </div>`;
}

// ─── Section: Validation ──────────────────────────────────────────────────────
function renderValidation() {
  if (!S.selectedJob || !S.wpsRecord) {
    return lockedState('lock', 'No Job Selected', 'Select a job and analyze its WPS first.');
  }
  if (!S.validationResult) {
    return lockedState('check-circle', 'Validation Not Run',
      'Click "Validate Job Against WPS" from the WPS Extraction screen.', 'btn-back-wps',
      'Back to WPS Extraction', () => navigate('wps-extraction'));
  }

  const { checks, hardFail } = S.validationResult;
  const passCount = checks.filter(c => c.status === 'pass').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  const bannerCls = hardFail ? 'fail' : warnCount > 0 ? 'warn' : 'pass';
  const bannerIco = hardFail ? 'alert-circ' : warnCount > 0 ? 'warn' : 'check_circ';
  const bannerMsg = hardFail
    ? `Validation failed — ${failCount} hard failure(s) detected. Welder matching is disabled. Route to Engineering.`
    : warnCount > 0
    ? `Validation passed with ${warnCount} warning(s). Review before proceeding.`
    : `All ${passCount} checks passed. Job is compatible with ${esc(S.wpsRecord.source_wps_no)}.`;

  const checkRows = checks.map(c => `
    <div class="check-row${c.isContradiction ? ' check-row-contradiction' : ''}">
      ${checkIcon(c.status)}
      <div>
        <div class="check-name">${esc(c.name)}${c.isContradiction ? ' <span style="font-size:10px;color:var(--c-red);font-weight:700;margin-left:6px;padding:1px 6px;background:rgba(239,68,68,.1);border-radius:3px">⚡ CONTRADICTION</span>' : ''}</div>
        ${c.detail ? `<div class="check-detail-txt">${esc(c.detail)}</div>` : ''}
      </div>
      <div class="check-req">${esc(c.required)}</div>
      <div class="check-act">${esc(c.actual)}</div>
    </div>`).join('');

  return `
    <div class="section-head">
      <div>
        <div class="section-title">Job-to-WPS Validation</div>
        <div class="section-sub">${esc(S.selectedJob.job_id)} · ${esc(S.wpsRecord.source_wps_no)}</div>
      </div>
      <div class="section-actions">
        ${hardFail
          ? `<button class="btn btn-danger" onclick="showToast('⚠ Routed to Engineering review queue.','warn')">
               <i data-lucide="alert-triangle"></i> Route to Engineering
             </button>`
          : `<button id="btn-find-qual" class="btn btn-primary" onclick="runQualMapping()">
               <i data-lucide="git-branch"></i> Find Required Qualification
             </button>`}
      </div>
    </div>

    <div class="summary-banner ${bannerCls}" style="margin-bottom:20px">
      ${icon(bannerIco)}
      <span>${bannerMsg}</span>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <div style="display:grid;grid-template-columns:30px 1fr 180px 160px;gap:12px;padding:9px 14px;background:var(--surface-hi);border-bottom:1px solid var(--border)">
        <div></div>
        <div style="font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase">Check</div>
        <div style="font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase">Required</div>
        <div style="font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.5px;text-transform:uppercase">Actual</div>
      </div>
      ${checkRows}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
      <button class="btn btn-ghost" onclick="navigate('wps-extraction')">
        <i data-lucide="arrow-left"></i> Back to WPS
      </button>
      ${hardFail
        ? `<span class="badge badge-red" style="padding:6px 14px;font-size:12px">Matching Disabled — Hard Failure</span>`
        : `<button id="btn-find-qual2" class="btn btn-primary btn-lg" onclick="runQualMapping()">
             <i data-lucide="git-branch"></i> Find Required Qualification →
           </button>`}
    </div>
  `;
}

// ─── Section: Qual Mapping ────────────────────────────────────────────────────
function renderQualMapping() {
  if (!S.selectedJob || !S.wpsRecord) {
    return lockedState('lock', 'No Job Selected', 'Select a job and complete validation first.');
  }
  if (!S.qualMappings.length) {
    return lockedState('git-branch', 'Mapping Not Run',
      'Complete validation then click "Find Required Qualification".');
  }

  const m = S.qualMappings[0];
  const prefTicket = S.data.qualMatrix.find(q => q.ticket_id === m.preferred_ticket_id);
  const altTicket  = S.data.qualMatrix.find(q => q.ticket_id === m.alternate_ticket_id);

  const altUsable = S.selectedJob.thickness_mm <= 8.0;

  return `
    <div class="section-head">
      <div>
        <div class="section-title">Qualification Mapping</div>
        <div class="section-sub">Required tickets for ${esc(S.wpsRecord.source_wps_no)} — ${esc(S.selectedJob.job_id)}</div>
      </div>
      <div class="section-actions">
        <button id="btn-match-welders" class="btn btn-primary" onclick="runMatching()">
          <i data-lucide="users"></i> Match Welders
        </button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
      <!-- Preferred ticket -->
      <div class="card" style="border-color:rgba(56,189,248,.3)">
        <div class="card-title" style="color:var(--accent)">Preferred Ticket</div>
        <div style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">
          ${esc(m.preferred_ticket_id)}
        </div>
        ${prefTicket ? `
          <div style="display:flex;flex-direction:column;gap:5px;font-size:12px">
            <div><span style="color:var(--muted)">Process:</span> <span style="color:var(--text)">${esc(prefTicket.process)}</span></div>
            <div><span style="color:var(--muted)">Material:</span> <span style="color:var(--text)">${esc(prefTicket.base_material_from)} → ${esc(prefTicket.base_material_to)}</span></div>
            <div><span style="color:var(--muted)">Thickness:</span> <span style="color:var(--text)">${prefTicket.min_thickness_mm}–${prefTicket.max_thickness_mm} mm</span></div>
            <div><span style="color:var(--muted)">Position:</span> <span style="color:var(--text)">${esc(prefTicket.position_coverage)}</span></div>
            <div><span style="color:var(--muted)">Range:</span> ${badgeHtml('green', prefTicket.full_or_limited_range)}</div>
          </div>
          <button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="openTicketDrawer('${esc(m.preferred_ticket_id)}')">
            <i data-lucide="external-link"></i> View full matrix row
          </button>
        ` : `<div style="color:var(--muted);font-size:12px">Ticket not found in matrix</div>`}
      </div>

      <!-- Alternate ticket -->
      <div class="card" style="border-color:rgba(245,158,11,.3)">
        <div class="card-title" style="color:var(--c-amber)">Alternate Ticket</div>
        <div style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">
          ${esc(m.alternate_ticket_id || '—')}
        </div>
        ${altTicket ? `
          <div style="display:flex;flex-direction:column;gap:5px;font-size:12px">
            <div><span style="color:var(--muted)">Process:</span> <span style="color:var(--text)">${esc(altTicket.process)}</span></div>
            <div><span style="color:var(--muted)">Thickness:</span> <span style="color:var(--text)">${altTicket.min_thickness_mm}–${altTicket.max_thickness_mm} mm</span></div>
            <div><span style="color:var(--muted)">Range:</span> ${badgeHtml('amber', altTicket.full_or_limited_range)}</div>
          </div>
          <div class="alert ${altUsable ? 'alert-green' : 'alert-amber'}" style="margin-top:12px;font-size:12px">
            <i data-lucide="${altUsable ? 'check-circle' : 'alert-circle'}"></i>
            <span>${altUsable ? 'Usable for this job (≤8 mm)' : 'NOT usable — job thickness ' + S.selectedJob.thickness_mm + ' mm > 8.0 mm limit'}</span>
          </div>
          <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="openTicketDrawer('${esc(m.alternate_ticket_id)}')">
            <i data-lucide="external-link"></i> View full matrix row
          </button>
        ` : `<div style="color:var(--muted);font-size:12px">No alternate ticket defined</div>`}
      </div>
    </div>

    <!-- Mapping details -->
    <div class="mapping-card">
      ${mapRow('Required Process', m.required_process)}
      ${mapRow('Required Material From', m.required_material_from)}
      ${mapRow('Required Material To', m.required_material_to)}
      ${mapRow('Required Thickness Range', m.required_thickness_min_mm + '–' + m.required_thickness_max_mm + ' mm')}
      ${mapRow('Required Position Policy', m.required_position_policy)}
      ${mapRow('Required Progression', m.required_progression)}
      ${mapRow('PWHT Required', m.required_pwht === 'True' ? 'Yes' : 'No')}
      ${m.alternate_condition ? mapRow('Alternate Condition', m.alternate_condition) : ''}
      ${m.engineering_review_required_if ? mapRow('Engineering Review If', m.engineering_review_required_if) : ''}
      ${m.special_note ? `
        <div class="mapping-row" style="background:rgba(245,158,11,.05)" data-tooltip="This is a human review note — include in Execution Ticket">
          <div class="mapping-label" style="color:var(--c-amber)">Special Note</div>
          <div class="mapping-value" style="color:#fbbf24;font-style:italic">${esc(m.special_note)}</div>
        </div>` : ''}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px">
      <button class="btn btn-ghost" onclick="navigate('validation')">
        <i data-lucide="arrow-left"></i> Back
      </button>
      <button id="btn-match-welders2" class="btn btn-primary btn-lg" onclick="runMatching()">
        <i data-lucide="users"></i> Match Welders →
      </button>
    </div>
  `;
}

function mapRow(label, value) {
  return `
    <div class="mapping-row">
      <div class="mapping-label">${esc(label)}</div>
      <div class="mapping-value mono">${esc(value ?? '—')}</div>
    </div>`;
}

// ─── Section: Welder Matching ─────────────────────────────────────────────────
function welderRow(r, rank, results) {
  const rankCls = rank === 1 ? 'welder-rank-1' : rank === 2 ? 'welder-rank-2' : rank === 3 ? 'welder-rank-3' : '';
  const warns   = r.warnings.slice(0,2).map(w => `<span class="warn-chip">${esc(w.split(':')[0])}</span>`).join('');
  const rejects = r.hardRejections.slice(0,1).map(w => `<span class="reject-chip">${esc(w.split(':')[0].substring(0,36))}</span>`).join('');
  const ticket  = r.bestTicket?.ticket_id || '—';
  const approvable = ['Recommended','Eligible','Backup','Conditional'].includes(r.status) && !S.approvedWelder;
  const isApproved = S.approvedWelder?.welder.welder_id === r.welder.welder_id;
  const wid  = esc(r.welder.welder_id);
  const avc  = welderAvatarColor(r.welder.welder_id);
  const av   = welderInitials(r.welder.welder_name);
  const exp  = welderExpYears(r.welder.welder_id);
  const lastW = welderLastWeld(r.welder.welder_id);
  const daysAgoW = Math.round((new Date('2026-05-07') - new Date(lastW)) / 86400000);
  const contCls = r.welder.continuity_status === 'Active' ? 'dose-chip' : 'dose-chip warn';

  return `
    <tr id="welder-row-${wid}" data-action="select-welder" data-welder-id="${wid}">
      <td><div class="welder-rank-num ${rankCls}">${rank}</div></td>
      <td>
        <div style="display:flex;align-items:center;gap:9px">
          <div class="welder-avatar" style="background:${avc}22;color:${avc};border:1.5px solid ${avc}44">${av}</div>
          <div>
            <div class="welder-name">${esc(r.welder.welder_name)}</div>
            <div class="welder-id">${esc(r.welder.welder_id)} · ${exp} yrs exp</div>
          </div>
        </div>
      </td>
      <td>${badgeHtml('gray', r.welder.shift)}</td>
      <td class="text-mono" style="font-size:11px">${esc(ticket)}</td>
      <td>${badgeHtml(statusColor(r.status), r.status)}</td>
      <td>
        <div style="display:flex;flex-wrap:wrap;gap:3px;align-items:center">
          ${warns}${rejects}
          <span class="${contCls}">${esc(r.welder.continuity_status)}</span>
        </div>
      </td>
      <td>
        ${isApproved
          ? `<span class="badge badge-green">✓ Approved</span>`
          : approvable
          ? `<button id="btn-approve-${wid}" class="btn btn-success btn-sm"
                      data-action="approve-welder" data-welder-id="${wid}">
               <i data-lucide="user-check"></i> Approve
             </button>`
          : `<span style="color:var(--dim);font-size:12px">—</span>`}
      </td>
    </tr>`;
}

function renderWelderMatching() {
  if (!S.matchResult) {
    return lockedState('users', 'Matching Not Run',
      'Complete qualification mapping then click "Match Welders".');
  }

  const { results } = S.matchResult;

  // Separate demo-pinned welders from rest, maintain rank order within each group
  const demoResults    = DEMO_WELDER_IDS.map(id => results.find(r => r.welder.welder_id === id)).filter(Boolean);
  const nonDemoResults = results.filter(r => !DEMO_WELDER_IDS.includes(r.welder.welder_id));

  const eligible   = results.filter(r => ['Recommended','Eligible','Backup','Conditional'].includes(r.status)).length;
  const rejected   = results.filter(r => ['Rejected','Expired','Unavailable'].includes(r.status)).length;
  const recommended = results.find(r => r.status === 'Recommended');

  // Demo section: split into eligible vs rejected
  const demoEligible  = demoResults.filter(r => !['Rejected','Expired','Unavailable'].includes(r.status));
  const demoRejected  = demoResults.filter(r => ['Rejected','Expired','Unavailable'].includes(r.status));

  const theadHtml = `
    <tr>
      <th>Rank</th><th>Welder</th><th>Shift</th><th>Ticket Used</th>
      <th>Status</th><th>Flags</th><th>Action</th>
    </tr>`;

  const demoEligRows = demoEligible.map(r => welderRow(r, results.indexOf(r)+1, results)).join('');
  const demoRejRows  = demoRejected.map(r => welderRow(r, results.indexOf(r)+1, results)).join('');

  const otherEligible = nonDemoResults.filter(r => !['Rejected','Expired','Unavailable'].includes(r.status));
  const otherRejected = nonDemoResults.filter(r => ['Rejected','Expired','Unavailable'].includes(r.status));

  const allOtherRows = [...otherEligible, ...(S.showAllWelders ? otherRejected : [])].map(r => welderRow(r, results.indexOf(r)+1, results)).join('');

  const remainingRejCount = rejected - demoRejected.length;

  return `
    <div class="section-head">
      <div>
        <div class="section-title">Welder Matching</div>
        <div class="section-sub">${esc(S.selectedJob?.job_id)} · ${eligible} eligible · ${rejected} rejected · ${results.length} evaluated</div>
      </div>
      <div class="section-actions">
        <button class="btn btn-ghost btn-sm" onclick="S.showRejected=!S.showRejected;render()">
          <i data-lucide="${S.showRejected ? 'eye-off' : 'eye'}"></i>
          ${S.showRejected ? 'Hide' : 'Show'} Demo Rejected
        </button>
      </div>
    </div>

    ${renderDisruptionPanel()}

    ${recommended ? `
      <div class="summary-banner pass" style="margin-bottom:16px">
        ${icon('check_circ')}
        <span><strong>${esc(recommended.welder.welder_name)}</strong> is recommended for ${esc(S.selectedJob?.job_id)}.
        ${recommended.bestTicket ? 'Preferred full-range ticket · Active continuity · No warnings.' : ''}</span>
      </div>` : ''}

    ${S.approvedWelder ? `
      <div class="summary-banner pass" style="margin-bottom:16px">
        ${icon('check_circ')}
        <span><strong>${esc(S.approvedWelder.welder.welder_name)}</strong> approved for ${esc(S.selectedJob?.job_id)}.
        <a style="color:var(--accent);cursor:pointer;text-decoration:underline" onclick="navigate('execution-ticket')">View Execution Ticket →</a></span>
      </div>` : ''}

    <!-- Demo candidates (pinned) -->
    <div style="margin-bottom:6px;font-size:10px;font-weight:700;color:var(--accent);letter-spacing:.8px;text-transform:uppercase">
      ★ Demo Candidates — Eligible / Recommended
    </div>
    <div class="table-wrap" style="margin-bottom:16px">
      <table>
        <thead>${theadHtml}</thead>
        <tbody>${demoEligRows}</tbody>
      </table>
    </div>

    ${demoRejected.length && S.showRejected ? `
      <div style="margin-bottom:6px;font-size:10px;font-weight:700;color:var(--c-red);letter-spacing:.8px;text-transform:uppercase">
        ★ Demo Candidates — Rejected / Unavailable
      </div>
      <div class="table-wrap" style="margin-bottom:16px">
        <table>
          <thead>${theadHtml}</thead>
          <tbody>${demoRejRows}</tbody>
        </table>
      </div>` : ''}

    <!-- Other candidates toggle -->
    ${otherEligible.length || otherRejected.length ? `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
        <div style="font-size:10px;font-weight:700;color:var(--dim);letter-spacing:.8px;text-transform:uppercase">
          All Other Candidates (${otherEligible.length} eligible${S.showAllWelders ? ' + '+otherRejected.length+' rejected' : ''})
        </div>
        <button class="btn btn-ghost btn-sm" onclick="S.showAllWelders=!S.showAllWelders;render()">
          <i data-lucide="${S.showAllWelders ? 'chevrons-up' : 'chevrons-down'}"></i>
          ${S.showAllWelders ? 'Collapse' : 'Show all ' + (otherEligible.length + otherRejected.length)}
        </button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>${theadHtml}</thead>
          <tbody>${allOtherRows}</tbody>
        </table>
      </div>
    ` : ''}

    <div style="margin-top:12px;font-size:11px;color:var(--dim)">
      Click any row to see full reasoning breakdown
    </div>
  `;
}

// ─── Section: Exceptions ──────────────────────────────────────────────────────
function renderExceptions() {
  const excs = S.exceptions;
  if (!excs.length) {
    return lockedState('check-circle', 'No Exceptions', 'Run matching to auto-detect exceptions in the job queue.');
  }

  const typeConfig = {
    thickness_exceeded: { cls: '',      icn: 'red',    lbl: 'Thickness Exceeded' },
    material_mismatch:  { cls: 'warn',  icn: 'amber',  lbl: 'Material Mismatch'  },
    missing_mapping:    { cls: 'purple',icn: 'purple', lbl: 'Missing Mapping'    },
    missing_wps:        { cls: '',      icn: 'red',    lbl: 'Missing WPS'        },
    validation_fail:    { cls: '',      icn: 'red',    lbl: 'Validation Failure'  },
    wps_contradiction:  { cls: '',      icn: 'red',    lbl: '⚡ WPS Contradiction' },
    incomplete_data:    { cls: 'warn',  icn: 'amber',  lbl: 'Incomplete Data'     },
  };

  const cards = excs.map(e => {
    const cfg = typeConfig[e.type] || typeConfig.validation_fail;
    return `
      <div class="exc-card ${cfg.cls}">
        <div class="exc-header">
          <div class="exc-icon ${cfg.icn}">
            <i data-lucide="alert-triangle"></i>
          </div>
          <div>
            <div class="exc-job-tag">${esc(e.job.job_id)} · ${esc(e.job.work_order)}</div>
            <div class="exc-reason">${esc(e.reason)}</div>
          </div>
          <div style="margin-left:auto">${badgeHtml(cfg.icn === 'red' ? 'red' : cfg.icn === 'amber' ? 'amber' : 'purple', cfg.lbl)}</div>
        </div>
        <div class="exc-body">
          <div class="exc-row"><div class="exc-row-label">Job</div><div>${esc(e.job.job_id)} — ${esc(e.job.job_description)}</div></div>
          <div class="exc-row"><div class="exc-row-label">WPS</div><div>${esc(e.wps?.source_wps_no || e.job.wps_id)}</div></div>
          ${e.job.thickness_mm ? `<div class="exc-row"><div class="exc-row-label">Thickness</div><div>${e.job.thickness_mm} mm</div></div>` : ''}
          ${e.job.base_material_from ? `<div class="exc-row"><div class="exc-row-label">Material</div><div>${esc(e.job.base_material_from)} → ${esc(e.job.base_material_to)}</div></div>` : ''}
          ${e.contradictionDetail ? `
            <div class="exc-row" style="margin-top:6px;padding:8px 10px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.15);border-radius:6px">
              <div class="exc-row-label" style="color:var(--c-red);font-weight:700">⚡ AI Analysis</div>
              <div style="font-size:12px;line-height:1.5;color:var(--text)">
                <div style="margin-bottom:4px"><strong>WPS General Range:</strong> ${e.wps?.groove_thickness_min_mm}–${e.wps?.groove_thickness_max_mm} mm → <span style="color:var(--c-green)">✓ ${e.job.thickness_mm} mm covered</span></div>
                <div style="margin-bottom:4px"><strong>WPS Notes Restriction:</strong> "${esc(e.contradictionDetail)}" → <span style="color:var(--c-red)">✗ ${e.job.thickness_mm} mm exceeds limit</span></div>
                <div style="color:var(--c-amber);font-weight:600;font-size:11px;margin-top:4px">System detected this contradiction automatically — requires engineering review before assignment</div>
              </div>
            </div>` : ''}
          <div class="exc-row"><div class="exc-row-label">Owner</div><div style="color:var(--c-amber)">${esc(e.owner)}</div></div>
          <div class="exc-row"><div class="exc-row-label">Action</div><div>${esc(e.action)}</div></div>
        </div>
        <div class="exc-actions">
          <button class="btn btn-warn btn-sm" onclick="showToast('Engineering review note created for ${esc(e.job.job_id)}','warn')">
            <i data-lucide="clipboard"></i> Create Review Note
          </button>
          <button class="btn btn-ghost btn-sm" onclick="showToast('Exception summary exported','info')">
            <i data-lucide="download"></i> Export
          </button>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="section-head">
      <div>
        <div class="section-title">Exceptions</div>
        <div class="section-sub">${excs.length} exception(s) detected across job queue</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">${cards}</div>
  `;
}

// ─── Section: Execution Ticket ────────────────────────────────────────────────
function renderExecutionTicket() {
  if (!S.approvedWelder || !S.selectedJob) {
    return lockedState('file-check', 'No Approved Assignment',
      'Approve a welder from the Welder Matching screen to generate the Execution Ticket.');
  }

  const aw = S.approvedWelder;
  const j  = S.selectedJob;
  const wps = S.wpsRecord;
  const m  = S.qualMappings[0];
  const pqr = wps ? S.data.pqr.find(p => p.linked_wps_id === wps.wps_id) : null;
  const cons = wps ? S.data.consumables.filter(c => c.wps_id === wps.wps_id) : [];
  const ticketId = aw.bestTicket?.ticket_id || '—';
  const now = new Date().toISOString().substring(0,16).replace('T',' ');
  const dcn = 'WA-' + now.substring(0,10).replace(/-/g,'') + '-' + j.job_id.replace('JOB-','').padStart(4,'0');
  const jointId = 'WJ-' + j.work_order.replace('WO-','');
  const locLabel = enrichLocation(j.location);

  return `
    <div class="section-head">
      <div>
        <div class="section-title">Weld Execution Ticket</div>
        <div class="section-sub">Generated ${now} · ${esc(j.job_id)} · <span class="dcn-field">${dcn}</span></div>
      </div>
      <div class="section-actions">
        <span class="nuke-class-badge">☢ Safety Class 2</span>
        <button id="btn-download-ticket" class="btn btn-secondary" onclick="copyTicket()">
          <i data-lucide="copy"></i> Copy Ticket
        </button>
        <button class="btn btn-primary" onclick="showToast('Ticket downloaded as PDF','info')">
          <i data-lucide="download"></i> Download PDF
        </button>
      </div>
    </div>

    <div class="ticket-shell" id="ticket-content">
      <div class="ticket-header">
        <div style="display:flex;align-items:flex-start;gap:16px">
          <!-- NPCIL atom mark (SVG) -->
          <svg viewBox="0 0 48 48" width="44" height="44" style="flex-shrink:0;opacity:.85">
            <ellipse cx="24" cy="24" rx="22" ry="8" fill="none" stroke="#38bdf8" stroke-width="1.5"/>
            <ellipse cx="24" cy="24" rx="22" ry="8" fill="none" stroke="#38bdf8" stroke-width="1.5" transform="rotate(60 24 24)"/>
            <ellipse cx="24" cy="24" rx="22" ry="8" fill="none" stroke="#38bdf8" stroke-width="1.5" transform="rotate(120 24 24)"/>
            <circle cx="24" cy="24" r="3" fill="#38bdf8"/>
          </svg>
          <div>
            <div class="ticket-org">Nuclear Power Corporation of India Ltd. · Kakrapar Atomic Power Project</div>
            <div class="ticket-title">Weld Execution Ticket</div>
            <div class="ticket-sub">${esc(j.job_id)} · ${esc(j.work_order)} · ${esc(jointId)} · ${esc(locLabel)}</div>
          </div>
        </div>
        <div class="ticket-stamp" style="text-align:right;min-width:130px">
          <div style="font-family:var(--mono);font-size:9px;color:var(--dim)">DCN: <span style="color:var(--accent)">${dcn}</span></div>
          <div style="font-family:var(--mono);font-size:9px;color:var(--dim)">Issue: 01 · Rev: 00</div>
          <div style="font-family:var(--mono);font-size:9px;color:var(--dim)">${now}</div>
          <div style="margin-top:8px">
            <div class="ticket-approved-icon" style="margin:0 auto 4px">
              <i data-lucide="check-circle" style="width:18px;height:18px;stroke:#22c55e;stroke-width:2.5;fill:none"></i>
            </div>
            <div style="color:var(--c-green);font-weight:700;font-size:11px">APPROVED</div>
            <div style="font-size:9px;color:var(--dim);margin-top:2px">ASME Sec IX / IS 2825</div>
          </div>
          <!-- QR placeholder -->
          <div style="margin-top:8px;width:44px;height:44px;border:1px solid #cbd5e1;border-radius:3px;margin-left:auto;background:#f8fafc;display:flex;align-items:center;justify-content:center">
            <svg viewBox="0 0 20 20" width="36" height="36" style="opacity:.75">
              <rect x="1" y="1" width="7" height="7" fill="none" stroke="#0f172a" stroke-width="1"/>
              <rect x="2" y="2" width="5" height="5" fill="#0f172a"/>
              <rect x="12" y="1" width="7" height="7" fill="none" stroke="#0f172a" stroke-width="1"/>
              <rect x="13" y="2" width="5" height="5" fill="#0f172a"/>
              <rect x="1" y="12" width="7" height="7" fill="none" stroke="#0f172a" stroke-width="1"/>
              <rect x="2" y="13" width="5" height="5" fill="#0f172a"/>
              <rect x="12" y="12" width="2" height="2" fill="#0f172a"/>
              <rect x="15" y="12" width="2" height="2" fill="#0f172a"/>
              <rect x="12" y="15" width="2" height="4" fill="#0f172a"/>
              <rect x="15" y="15" width="4" height="2" fill="#0f172a"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="ticket-body">
        <!-- Approved Welder -->
        <div class="ticket-approved-box">
          <div class="ticket-approved-icon">
            <i data-lucide="user-check"></i>
          </div>
          <div style="flex:1">
            <div style="font-size:10px;font-weight:600;color:var(--dim);letter-spacing:.5px;text-transform:uppercase;margin-bottom:3px">Assigned Welder</div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <div style="font-size:18px;font-weight:700;color:var(--text)">${esc(aw.welder.welder_name)}</div>
              ${badgeHtml(statusColor(aw.status), aw.status)}
            </div>
            <div style="font-size:12px;color:var(--muted);margin-top:3px;font-family:var(--mono)">
              ${esc(aw.welder.welder_id)} · Shift ${esc(aw.welder.shift)} · ${welderExpYears(aw.welder.welder_id)} yrs experience
            </div>
          </div>
          <div style="text-align:right;font-size:10px;color:var(--dim);font-family:var(--mono)">
            <div>Continuity: <span style="color:var(--c-green)">${esc(aw.welder.continuity_status)}</span></div>
            <div>Expiry: ${esc(aw.welder.qualification_expiry_date)}</div>
            <div>${aw.welder.days_until_expiry} days remaining</div>
          </div>
        </div>

        <!-- Job Details -->
        <div class="ticket-section">
          <div class="ticket-section-hdr">Job Details</div>
          <div class="ticket-grid-3">
            ${tf('Job ID', j.job_id)}
            ${tf('Work Order', j.work_order)}
            ${tf('Location', j.location)}
            ${tf('Description', j.job_description)}
            ${tf('Shift', j.shift)}
            ${tf('Priority', j.priority)}
          </div>
        </div>

        <!-- WPS Details -->
        <div class="ticket-section">
          <div class="ticket-section-hdr">WPS / PQR</div>
          <div class="ticket-grid-3">
            ${tf('WPS ID', wps?.wps_id || '—')}
            ${tf('WPS No.', wps?.source_wps_no || '—')}
            ${tf('PQR', pqr ? pqr.pqr_no + ' (' + pqr.qualified_status + ')' : wps?.supporting_pqr_no || '—')}
            ${tf('Process', wps?.welding_process_root || '—')}
            ${tf('Qualification Status', wps?.qualification_status || '—')}
            ${tf('Extraction Confidence', wps ? ((wps.extraction_confidence||0.97)*100).toFixed(0)+'%' : '—')}
          </div>
        </div>

        <!-- Qualification -->
        <div class="ticket-section">
          <div class="ticket-section-hdr">Qualification</div>
          <div class="ticket-grid-3">
            ${tf('Ticket Used', ticketId)}
            ${tf('Ticket Range', aw.bestTicket?.full_or_limited_range || '—')}
            ${tf('Expiry Date', aw.welder.qualification_expiry_date)}
            ${tf('Continuity', aw.welder.continuity_status)}
            ${tf('Employment Status', aw.welder.employment_status)}
            ${tf('Days Until Expiry', aw.welder.days_until_expiry + ' days')}
          </div>
        </div>

        <!-- Joint Parameters -->
        <div class="ticket-section">
          <div class="ticket-section-hdr">Joint Parameters</div>
          <div class="ticket-grid-3">
            ${tf('Base Material', j.base_material_from + ' → ' + j.base_material_to)}
            ${tf('Thickness', j.thickness_mm + ' mm')}
            ${tf('Position', j.required_position)}
            ${tf('Progression', j.required_progression)}
            ${tf('Application', j.application_type)}
            ${tf('Backing', j.backing_required)}
          </div>
        </div>

        <!-- Welding Parameters -->
        ${wps ? `
        <div class="ticket-section">
          <div class="ticket-section-hdr">Welding Parameters</div>
          <div class="ticket-grid-3">
            ${tf('Filler Specification', wps.filler_specification || '—')}
            ${tf('AWS Classification', wps.aws_classification || '—')}
            ${tf('Polarity', wps.polarity || '—')}
            ${tf('Preheat Min (°C)', wps.preheat_min_c != null ? String(wps.preheat_min_c) : '—')}
            ${tf('Travel Speed', wps.travel_speed_range_mm_min || '—')}
            ${tf('Peening', wps.peening_allowed ? 'Allowed' : 'Not Allowed')}
          </div>
        </div>` : ''}

        <!-- Pass-by-Pass Parameters -->
        ${cons.length ? `
        <div class="ticket-section">
          <div class="ticket-section-hdr">Pass-by-Pass Parameters</div>
          <div class="table-wrap" style="margin-top:8px">
            <table class="wps-pass-table">
              <thead>
                <tr>
                  <th>Pass</th>
                  <th>Filler Class</th>
                  <th>Size (mm)</th>
                  <th>Amps (A)</th>
                  <th>Volts (V)</th>
                  <th>Speed (mm/min)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${cons.map(c => `
                  <tr>
                    <td class="text-mono text-accent" style="font-size:11px;font-weight:700">${esc(c.pass_type || '—')}</td>
                    <td class="text-mono" style="font-size:11px">${esc(c.filler_class || '—')}</td>
                    <td class="text-mono">${esc(c.filler_size_mm)} mm</td>
                    <td class="text-mono">${esc(c.amps_min)}–${esc(c.amps_max)}</td>
                    <td class="text-mono">${esc(c.volts_min)}–${esc(c.volts_max)}</td>
                    <td class="text-mono">${c.travel_speed_min_mm_min != null ? esc(c.travel_speed_min_mm_min)+'–'+esc(c.travel_speed_max_mm_min) : '—'}</td>
                    <td>${badgeHtml('green', 'Approved')}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>` : ''}

        <!-- QC Hold Points -->
        <div class="ticket-section">
          <div class="ticket-section-hdr">Quality Controls</div>
          <div class="ticket-grid">
            ${tf('QC Hold Point', j.qc_hold_point)}
            ${tf('Inspection Required', j.inspection_required === 'True' ? 'Yes' : 'No')}
            ${tf('Notch Toughness', j.requires_notch_toughness === 'True' ? 'Required' : 'Not Required')}
            ${tf('Special Note', m?.special_note || 'None')}
          </div>
        </div>

        <!-- Warnings -->
        ${aw.warnings.length ? `
        <div class="alert alert-amber">
          <i data-lucide="alert-triangle"></i>
          <div>
            <strong>Assignment Warnings (${aw.warnings.length})</strong><br>
            ${aw.warnings.map(w => `<div style="margin-top:3px">• ${esc(w)}</div>`).join('')}
          </div>
        </div>` : ''}

        <!-- Signatures -->
        <div class="ticket-sig-box" style="grid-template-columns:repeat(4,1fr)">
          <div class="ticket-sig">
            <div class="ticket-sig-line"></div>
            <div class="ticket-sig-label">Shift Supervisor</div>
            <div style="font-size:8px;color:var(--dim);margin-top:2px">Date / Time</div>
          </div>
          <div class="ticket-sig">
            <div class="ticket-sig-line"></div>
            <div class="ticket-sig-label">Welding Engineer</div>
            <div style="font-size:8px;color:var(--dim);margin-top:2px">Date / Time</div>
          </div>
          <div class="ticket-sig">
            <div class="ticket-sig-line"></div>
            <div class="ticket-sig-label">QC Inspector</div>
            <div style="font-size:8px;color:var(--dim);margin-top:2px">Date / Time</div>
          </div>
          <div class="ticket-sig">
            <div class="ticket-sig-line"></div>
            <div class="ticket-sig-label">Site Radiological Officer</div>
            <div style="font-size:8px;color:var(--dim);margin-top:2px">Date / Time</div>
          </div>
        </div>

        <!-- Compliance footer -->
        <div style="margin-top:16px;padding:10px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;font-family:var(--mono);font-size:9px;color:#475569;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
          <span>Ref: ASME Sec IX · QW-301 · IS 2825 · NPCIL-QOP-WLD-001</span>
          <span>User must verify drawing/spec suitability and obtain WPS acceptance approval before use in production</span>
          <span style="color:var(--accent)">WeldAssign AI · ${dcn} · WA-GEN-R00</span>
        </div>
      </div>
    </div>
  `;
}

function tf(label, value) {
  return `<div class="ticket-field"><div class="ticket-fl">${esc(label)}</div><div class="ticket-fv">${esc(value ?? '—')}</div></div>`;
}

// ─── Locked State ─────────────────────────────────────────────────────────────
function lockedState(iconName, title, sub, btnId='', btnLabel='', btnFn=null) {
  const btn = btnFn ? `<button id="${btnId}" class="btn btn-secondary" onclick="(${btnFn.toString()})()">
    <i data-lucide="arrow-left"></i> ${esc(btnLabel)}</button>` : '';
  return `
    <div class="locked-state">
      <div class="locked-icon"><i data-lucide="${iconName}"></i></div>
      <div class="locked-title">${esc(title)}</div>
      <div class="locked-sub">${esc(sub)}</div>
      ${btn}
    </div>`;
}

// ─── Drawer ───────────────────────────────────────────────────────────────────
function openDrawer(title, bodyHtml, footerHtml = '') {
  document.getElementById('drawer-title').textContent = title;
  const body = document.getElementById('drawer-body');
  body.innerHTML = bodyHtml;
  const footer = document.getElementById('drawer-footer');
  if (footerHtml) { footer.innerHTML = footerHtml; footer.style.display = 'flex'; }
  else { footer.style.display = 'none'; }
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
  if (window.lucide) lucide.createIcons({ nodes: [document.getElementById('drawer')] });
}

function closeDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

function openJobDrawer() {
  if (!S.selectedJob) return;
  const j = S.selectedJob;
  const wpsRec = S.data.wps.find(w => w.wps_id === j.wps_id);
  const rows = [
    ['Job ID', j.job_id], ['Work Order', j.work_order],
    ['WPS', j.wps_id + (wpsRec ? ' — ' + wpsRec.source_wps_no : '')],
    ['Process', wpsRec?.welding_process_root || '—'],
    ['Description', j.job_description],
    ['Base Material', j.base_material_from + ' → ' + j.base_material_to],
    ['Thickness', j.thickness_mm + ' mm'],
    ['Position', j.required_position],
    ['Progression', j.required_progression],
    ['Shift', j.shift], ['Priority', j.priority],
    ['Location', j.location], ['Due Date', j.due_date],
    ['Status', j.status],
    ['Inspection', j.inspection_required === 'True' ? 'Yes' : 'No'],
    ['QC Hold', j.qc_hold_point],
    ['Notch Toughness', j.requires_notch_toughness === 'True' ? 'Required' : 'Not required'],
    ['Application Type', j.application_type],
  ];

  const body = `
    <div class="detail-section">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${badgeHtml(statusColor(j.status), j.status)}
        ${badgeHtml(j.priority === 'High' || j.priority === 'Critical' ? 'red' : 'amber', j.priority)}
        ${badgeHtml('gray', 'Shift ' + j.shift)}
      </div>
      ${rows.map(([k,v]) => `<div class="detail-row"><div class="detail-key">${esc(k)}</div><div class="detail-val">${esc(v)}</div></div>`).join('')}
    </div>`;

  const footer = `<button class="btn btn-primary" onclick="closeDrawer();analyzeWPS()">
    <i data-lucide="file-text"></i> Analyze WPS
  </button>`;

  openDrawer(j.job_id + ' — Details', body, footer);
}

function openWelderDrawer(welderId) {
  if (!S.matchResult) return;
  const result = S.matchResult.results.find(r => r.welder.welder_id === welderId);
  if (!result) return;

  const w = result.welder;
  const statusColors = { Recommended: 'green', Eligible: 'blue', Backup: 'amber', Conditional: 'amber', Rejected: 'red', Expired: 'red', Unavailable: 'gray' };
  const sc = statusColors[result.status] || 'gray';

  const constraintRows = result.constraints.map(c => {
    const sym = c.result === 'pass' ? '✓' : c.result === 'fail' ? '✗' : '⚠';
    return `<tr>
      <td>${esc(c.name)}</td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${esc(c.required)}</td>
      <td style="font-family:var(--mono);font-size:11px">${esc(c.candidate)}</td>
      <td><span class="cr-${c.result}">${sym} ${c.result.charAt(0).toUpperCase() + c.result.slice(1)}</span></td>
      <td style="font-size:10px;color:var(--dim)">${esc(c.source)}</td>
    </tr>`;
  }).join('');

  const remediation = {
    'W-117': 'David Patel needs qualification covering ≥12 mm, or reassignment to a job ≤8 mm.',
    'W-145': 'Aisha Khan needs a valid SMAW qualification ticket.',
    'W-171': 'Nora Singh must renew her qualification before any assignment.',
    'W-166': 'Ethan Brooks can only be assigned to Shift B or C jobs.',
  };

  const avc = welderAvatarColor(w.welder_id);
  const av  = welderInitials(w.welder_name);
  const exp = welderExpYears(w.welder_id);
  const lastWeld = welderLastWeld(w.welder_id);

  const body = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)">
      <div class="welder-avatar" style="width:44px;height:44px;font-size:15px;background:${avc}22;color:${avc};border:2px solid ${avc}44">${av}</div>
      <div style="flex:1">
        <div style="font-size:16px;font-weight:700">${esc(w.welder_name)}</div>
        <div style="font-size:12px;color:var(--muted);font-family:var(--mono)">${esc(w.welder_id)} · Shift ${esc(w.shift)} · ${exp} yrs exp</div>
        <div style="font-size:11px;color:var(--dim);margin-top:2px">Last weld: ${lastWeld} · ${esc(w.employment_status)}</div>
      </div>
      <div style="margin-left:auto">${badgeHtml(sc, result.status)}</div>
    </div>

    ${result.hardRejections.length ? `
      <div class="alert alert-red" style="margin-bottom:14px">
        <i data-lucide="x-circle"></i>
        <div><strong>Hard Rejection${result.hardRejections.length > 1 ? 's' : ''}</strong><br>
        ${result.hardRejections.map(r => `<div>• ${esc(r)}</div>`).join('')}</div>
      </div>` : ''}

    ${result.warnings.length ? `
      <div class="alert alert-amber" style="margin-bottom:14px">
        <i data-lucide="alert-triangle"></i>
        <div><strong>Warning${result.warnings.length > 1 ? 's' : ''}</strong><br>
        ${result.warnings.map(w => `<div>• ${esc(w)}</div>`).join('')}</div>
      </div>` : ''}

    <div style="font-size:11px;font-weight:700;color:var(--dim);letter-spacing:.8px;text-transform:uppercase;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid var(--border)">
      Constraint Breakdown
    </div>
    <div style="overflow-x:auto">
      <table class="constraint-table">
        <thead><tr><th>Constraint</th><th>Required</th><th>Candidate</th><th>Result</th><th>Source</th></tr></thead>
        <tbody>${constraintRows}</tbody>
      </table>
    </div>

    ${result.bestTicket ? `
      <div style="margin-top:16px;padding:12px;background:var(--surface-hi);border-radius:var(--radius);border:1px solid var(--border)">
        <div style="font-size:10px;font-weight:600;color:var(--dim);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px">Best Ticket Selected</div>
        <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--accent)">${esc(result.bestTicket.ticket_id)}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">
          ${esc(result.bestTicket.process)} · ${esc(result.bestTicket.min_thickness_mm)}–${esc(result.bestTicket.max_thickness_mm)} mm · ${esc(result.bestTicket.position_coverage)} · ${esc(result.bestTicket.full_or_limited_range)}
        </div>
      </div>` : ''}

    ${remediation[w.welder_id] ? `
      <div style="margin-top:14px">
        <div style="font-size:11px;font-weight:700;color:var(--dim);letter-spacing:.8px;text-transform:uppercase;margin-bottom:6px">What Would Make This Valid?</div>
        <div style="font-size:13px;color:var(--text);padding:10px 12px;background:var(--surface-hi);border-radius:var(--radius);border-left:3px solid var(--accent)">
          ${esc(remediation[w.welder_id])}
        </div>
      </div>` : ''}
  `;

  const approvable = ['Recommended','Eligible','Backup','Conditional'].includes(result.status) && !S.approvedWelder;
  const footer = approvable
    ? `<button class="btn btn-success" data-action="approve-welder" data-welder-id="${esc(w.welder_id)}">
         <i data-lucide="user-check"></i> Approve ${esc(w.welder_name)}
       </button>
       <button class="btn btn-ghost" onclick="copyWelderExplanation('${esc(w.welder_id)}')">
         <i data-lucide="copy"></i> Copy Explanation
       </button>`
    : `<button class="btn btn-ghost" onclick="copyWelderExplanation('${esc(w.welder_id)}')">
         <i data-lucide="copy"></i> Copy Explanation
       </button>`;

  openDrawer(w.welder_name + ' — Reasoning', body, footer);
}

function openTicketDrawer(ticketId) {
  const ticket = S.data.qualMatrix.find(q => q.ticket_id === ticketId);
  if (!ticket) { showToast('Ticket not found in matrix', 'warn'); return; }
  const rows = Object.entries(ticket).map(([k,v]) =>
    `<div class="detail-row"><div class="detail-key">${esc(k.replace(/_/g,' '))}</div><div class="detail-val mono">${esc(v ?? '—')}</div></div>`
  ).join('');
  openDrawer(ticketId + ' — Qualification Matrix', `<div class="detail-section">${rows}</div>`);
}

// ─── WPS Document Builder ─────────────────────────────────────────────────────
function buildWPSDocPage(wps, page) {
  if (page === 1) return buildWPSPage1(wps);
  if (page === 2) return buildWPSPage2(wps);
  if (page === 3) return buildWPSPage3(wps);
  return '';
}

function buildWPSPage1(w) {
  return `
    <div class="wps-doc">
      <div class="wps-doc-org-header">
        <div class="wps-doc-org-name">Nuclear Power Corporation of India Limited</div>
        <div class="wps-doc-form-title">Welding Procedure Specification — ASME QW-482 Format</div>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 1 — Identification</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">WPS No.</td><td class="wps-doc-fv"><span class="wps-hi">${esc(w.source_wps_no)}</span></td>
              <td class="wps-doc-fl">Revision</td><td class="wps-doc-fv">0</td></tr>
          <tr><td class="wps-doc-fl">Date</td><td class="wps-doc-fv">2024-03-01</td>
              <td class="wps-doc-fl">Status</td><td class="wps-doc-fv"><span class="wps-hi">${esc(w.qualification_status)}</span></td></tr>
          <tr><td class="wps-doc-fl">Supporting PQR</td><td class="wps-doc-fv" colspan="3"><span class="wps-hi">${esc(w.supporting_pqr_no)}</span></td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 2 — Welding Process</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Process (Root)</td><td class="wps-doc-fv"><span class="wps-hi">${esc(w.welding_process_root)}</span></td>
              <td class="wps-doc-fl">Process (Fill)</td><td class="wps-doc-fv">${esc(w.welding_process_fill || 'Same')}</td></tr>
          <tr><td class="wps-doc-fl">Type</td><td class="wps-doc-fv">Manual</td>
              <td class="wps-doc-fl">Joint Design</td><td class="wps-doc-fv">Groove</td></tr>
          <tr><td class="wps-doc-fl">Backing</td><td class="wps-doc-fv">With or Without</td>
              <td class="wps-doc-fl">Backing Material</td><td class="wps-doc-fv">As per design document</td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 4 — Base Metals</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">P-No. From</td><td class="wps-doc-fv"><span class="wps-hi">${esc(w.base_material_from)}</span></td>
              <td class="wps-doc-fl">P-No. To</td><td class="wps-doc-fv"><span class="wps-hi">${esc(w.base_material_to)}</span></td></tr>
          <tr><td class="wps-doc-fl">Material Examples</td><td class="wps-doc-fv" colspan="3">IS 2062 / IS 1239 / equivalent P1</td></tr>
          <tr><td class="wps-doc-fl">Groove Thickness (min)</td><td class="wps-doc-fv"><span class="wps-hi">${w.groove_thickness_min_mm} mm</span></td>
              <td class="wps-doc-fl">Groove Thickness (max)</td><td class="wps-doc-fv"><span class="wps-hi">${w.groove_thickness_max_mm} mm</span></td></tr>
          <tr><td class="wps-doc-fl">Fillet Thickness</td><td class="wps-doc-fv">All Thickness</td>
              <td class="wps-doc-fl"></td><td class="wps-doc-fv"></td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 5 — Position</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Positions (Groove)</td><td class="wps-doc-fv"><span class="wps-hi">${esc(w.positions_groove)}</span></td>
              <td class="wps-doc-fl">Positions (Fillet)</td><td class="wps-doc-fv">All</td></tr>
          <tr><td class="wps-doc-fl">Progression</td><td class="wps-doc-fv"><span class="wps-hi">${esc(w.weld_progression)}</span></td>
              <td class="wps-doc-fl">PWHT</td><td class="wps-doc-fv"><span class="wps-hi">${w.pwht_required ? 'Required' : 'NA'}</span></td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-stamp">
        <span>NPCIL/WPS/${esc(w.source_wps_no)} Rev.0 · Page 1 of 3</span>
        ${w.extraction_review_required
          ? `<span class="wps-conf-badge warn">⚠ ${((w.extraction_confidence||0.97)*100).toFixed(0)}% — Review Req.</span>`
          : `<span class="wps-conf-badge">✓ AI Extracted ${((w.extraction_confidence||0.97)*100).toFixed(0)}% Conf.</span>`}
      </div>
    </div>`;
}

function buildWPSPage2(w) {
  return `
    <div class="wps-doc">
      <div class="wps-doc-org-header">
        <div class="wps-doc-org-name">WPS ${esc(w.source_wps_no)} — Page 2 of 3</div>
        <div class="wps-doc-form-title">Execution & Joint Parameters</div>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 6 — Preheat & PWHT</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Preheat Min (°C)</td><td class="wps-doc-fv">${w.preheat_min_c ?? 10}</td>
              <td class="wps-doc-fl">Interpass Max</td><td class="wps-doc-fv">NA</td></tr>
          <tr><td class="wps-doc-fl">PWHT Required</td><td class="wps-doc-fv" colspan="3">${w.pwht_required ? 'Yes — See traveler' : 'NA'}</td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 7 — Gas</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Shielding Gas</td><td class="wps-doc-fv">${esc(w.shielding_gas || 'NA')}</td>
              <td class="wps-doc-fl">Backing Gas</td><td class="wps-doc-fv">${esc(w.backing_gas || 'NA')}</td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 8 — Electrical Characteristics</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Current Type</td><td class="wps-doc-fv">${esc(w.current_type || 'DC')}</td>
              <td class="wps-doc-fl">Polarity</td><td class="wps-doc-fv">${esc(w.polarity || 'Electrode Positive / DC-EP')}</td></tr>
          <tr><td class="wps-doc-fl">Travel Speed</td><td class="wps-doc-fv" colspan="3">${esc(w.travel_speed_range_mm_min || '40-80 mm/min')}</td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 9 — Technique</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Root Pass</td><td class="wps-doc-fv">${esc(w.root_bead_technique || 'Stringer')}</td>
              <td class="wps-doc-fl">Fill Passes</td><td class="wps-doc-fv">${esc(w.subsequent_bead_technique || 'Weave')}</td></tr>
          <tr><td class="wps-doc-fl">Cleaning</td><td class="wps-doc-fv" colspan="3">${esc(w.cleaning_method || 'Brushing or Grinding; joint dry before welding')}</td></tr>
          <tr><td class="wps-doc-fl">Back Gouging</td><td class="wps-doc-fv">${esc(w.back_gouging_method || 'Grinding')}</td>
              <td class="wps-doc-fl">Peening</td><td class="wps-doc-fv">${w.peening_allowed ? 'Allowed' : 'Not Allowed'}</td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Section 10 — Filler Metal</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Specification</td><td class="wps-doc-fv">${esc(w.filler_specification || 'SFA 5.1')}</td>
              <td class="wps-doc-fl">AWS Classification</td><td class="wps-doc-fv">${esc(w.aws_classification || 'E-7018')}</td></tr>
          <tr><td class="wps-doc-fl">F-Number</td><td class="wps-doc-fv">${esc(w.f_no || '4')}</td>
              <td class="wps-doc-fl">A-Number</td><td class="wps-doc-fv">${esc(w.a_no || '1')}</td></tr>
        </tbody></table>
      </div>

      <div style="background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);border-radius:4px;padding:8px 10px;font-size:10px;color:#fbbf24;margin-top:8px">
        ⚠ Notch Toughness: If required by job specification, verify welder qualification includes vertical uphill coupon (3G/5G/6G).
      </div>

      <div class="wps-doc-stamp">
        <span>NPCIL/WPS/${esc(w.source_wps_no)} Rev.0 · Page 2 of 3</span>
        ${w.extraction_review_required
          ? `<span class="wps-conf-badge warn">⚠ ${((w.extraction_confidence||0.97)*100).toFixed(0)}% — Review Req.</span>`
          : `<span class="wps-conf-badge">✓ ${((w.extraction_confidence||0.97)*100).toFixed(0)}% Verified</span>`}
      </div>
    </div>`;
}

function buildWPSPage3(w) {
  const passes = [
    { n:'1 (Root)', dia:'2.5', curr:'80-100', volt:'22-24', speed:'40-60', heat:'1.7-3.0' },
    { n:'2',        dia:'3.15', curr:'110-130', volt:'22-25', speed:'50-70', heat:'1.8-3.2' },
    { n:'3+',       dia:'4.0',  curr:'140-160', volt:'24-26', speed:'60-80', heat:'2.0-3.4' },
  ];
  const passRows = passes.map(p => `
    <tr>
      <td>${esc(p.n)}</td>
      <td style="color:var(--accent)">${esc(p.dia)}</td>
      <td>${esc(p.curr)}</td>
      <td>${esc(p.volt)}</td>
      <td>${esc(p.speed)}</td>
      <td>${esc(p.heat)}</td>
    </tr>`).join('');

  return `
    <div class="wps-doc">
      <div class="wps-doc-org-header">
        <div class="wps-doc-org-name">WPS ${esc(w.source_wps_no)} — Page 3 of 3</div>
        <div class="wps-doc-form-title">Pass-by-Pass Parameters & Joint Schematic</div>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Pass Parameters</div>
        <table class="wps-pass-table">
          <thead><tr><th>Pass</th><th>Dia (mm)</th><th>Current (A)</th><th>Voltage (V)</th><th>Speed (mm/min)</th><th>Heat Input (kJ/mm)</th></tr></thead>
          <tbody>${passRows}</tbody>
        </table>
      </div>

      <div class="wps-doc-section" style="margin-top:10px">
        <div class="wps-doc-section-hdr">Joint Schematic</div>
        <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:260px;margin:4px auto;display:block">
          <rect width="200" height="80" fill="#f0f4f8" rx="3"/>
          <!-- Base metal left -->
          <rect x="8" y="30" width="60" height="20" fill="#bfdbfe" stroke="#60a5fa" stroke-width="1"/>
          <!-- Base metal right -->
          <rect x="132" y="30" width="60" height="20" fill="#bfdbfe" stroke="#60a5fa" stroke-width="1"/>
          <!-- Groove left bevel -->
          <polygon points="68,30 80,50 68,50" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
          <!-- Groove right bevel -->
          <polygon points="132,30 120,50 132,50" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
          <!-- Weld root -->
          <ellipse cx="100" cy="50" rx="8" ry="4" fill="rgba(2,132,199,.2)" stroke="#0284c7" stroke-width="1"/>
          <!-- Pass labels -->
          <text x="100" y="42" text-anchor="middle" font-size="7" fill="#0369a1" font-family="monospace">ROOT</text>
          <text x="100" y="28" text-anchor="middle" font-size="7" fill="#475569" font-family="monospace">CAP</text>
          <!-- arrows -->
          <line x1="100" y1="58" x2="100" y2="72" stroke="#64748b" stroke-width="1" marker-end="url(#arr)"/>
          <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#64748b"/>
          </marker></defs>
          <text x="100" y="78" text-anchor="middle" font-size="6" fill="#475569" font-family="monospace">VERTICAL UPHILL</text>
        </svg>
      </div>

      <div class="wps-doc-section">
        <div class="wps-doc-section-hdr">Preparation Notes</div>
        <table class="wps-doc-table"><tbody>
          <tr><td class="wps-doc-fl">Min Passes (Pressure)</td><td class="wps-doc-fv">2</td></tr>
          <tr><td class="wps-doc-fl">Joint Dry Requirement</td><td class="wps-doc-fv">Yes — before welding</td></tr>
          <tr><td class="wps-doc-fl">Interpass Cleaning</td><td class="wps-doc-fv">Wire brush between passes</td></tr>
          <tr><td class="wps-doc-fl">Suitability Note</td><td class="wps-doc-fv">User must verify drawing/spec and obtain WPS acceptance approval</td></tr>
        </tbody></table>
      </div>

      <div class="wps-doc-stamp">
        <span>NPCIL/WPS/${esc(w.source_wps_no)} Rev.0 · Page 3 of 3 · COMPLETE</span>
        ${w.extraction_review_required
          ? `<span class="wps-conf-badge warn">⚠ ${((w.extraction_confidence||0.97)*100).toFixed(0)}% — Review Req.</span>`
          : `<span class="wps-conf-badge">✓ ${((w.extraction_confidence||0.97)*100).toFixed(0)}% AI Extracted</span>`}
      </div>
    </div>`;
}

function buildThumbContent(page) {
  if (page === 1) return `
    <div class="pdf-thumb-real">
      <div style="text-align:center;border-bottom:1px solid #c8ccd0;padding:2px 0 3px;margin-bottom:3px">
        <div style="font-size:5px;font-weight:700;letter-spacing:.5px;color:#0369a1">NUCLEAR POWER CORPORATION OF INDIA LTD</div>
        <div style="font-size:3.5px;color:#6b7280;letter-spacing:.3px">WELDING PROCEDURE SPECIFICATION — ASME QW-482</div>
      </div>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin-bottom:2px">SECTION 1 — IDENTIFICATION</div>
      <div style="display:flex;gap:1px;margin-bottom:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">WPS No.</div>
        <div style="flex:1;font-size:3px;color:#0369a1;font-weight:700;padding:1px 2px;border:0.5px solid #93c5fd;background:rgba(2,132,199,.08)">NPCIL-STD-SM-11</div>
      </div>
      <div style="display:flex;gap:1px;margin-bottom:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">Status</div>
        <div style="flex:1;font-size:3px;color:#0369a1;font-weight:700;padding:1px 2px;border:0.5px solid #93c5fd;background:rgba(2,132,199,.08)">Qualified</div>
      </div>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin:2px 0 2px">SECTION 4 — BASE METALS</div>
      <div style="display:flex;gap:1px;margin-bottom:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">P-No. From</div>
        <div style="flex:1;font-size:3px;color:#0369a1;font-weight:700;padding:1px 2px;border:0.5px solid #93c5fd;background:rgba(2,132,199,.08)">P-No. 1 Grp 1/2</div>
      </div>
      <div style="display:flex;gap:1px;margin-bottom:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">Thickness</div>
        <div style="flex:1;font-size:3px;color:#0369a1;font-weight:700;padding:1px 2px;border:0.5px solid #93c5fd;background:rgba(2,132,199,.08)">1.5 — 19 mm</div>
      </div>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin:2px 0 2px">SECTION 5 — POSITION</div>
      <div style="display:flex;gap:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">Positions</div>
        <div style="flex:1;font-size:3px;color:#0369a1;font-weight:700;padding:1px 2px;border:0.5px solid #93c5fd;background:rgba(2,132,199,.08)">All</div>
      </div>
    </div>`;
  if (page === 2) return `
    <div class="pdf-thumb-real">
      <div style="text-align:center;border-bottom:1px solid #c8ccd0;padding:1px 0 2px;margin-bottom:3px">
        <div style="font-size:4px;font-weight:700;color:#374151">WPS NPCIL-STD-SM-11 — Page 2 of 3</div>
        <div style="font-size:3px;color:#6b7280">Execution & Joint Parameters</div>
      </div>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin-bottom:2px">SECTION 6 — PREHEAT & PWHT</div>
      <div style="display:flex;gap:1px;margin-bottom:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">Preheat Min</div>
        <div style="flex:1;font-size:3px;padding:1px 2px;border:0.5px solid #d1d5db">10°C</div>
      </div>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin:2px 0 2px">SECTION 8 — ELECTRICAL</div>
      <div style="display:flex;gap:1px;margin-bottom:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">Polarity</div>
        <div style="flex:1;font-size:3px;padding:1px 2px;border:0.5px solid #d1d5db">DC-EP</div>
      </div>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin:2px 0 2px">SECTION 9 — TECHNIQUE</div>
      <div style="display:flex;gap:1px;margin-bottom:1px">
        <div style="flex:1;font-size:3px;color:#6b7280;padding:1px 2px;border:0.5px solid #d1d5db">Root</div>
        <div style="flex:1;font-size:3px;padding:1px 2px;border:0.5px solid #d1d5db">Stringer</div>
      </div>
      <div style="background:rgba(245,158,11,.1);border:0.5px solid rgba(245,158,11,.3);border-radius:2px;padding:2px 3px;margin-top:3px">
        <div style="font-size:3px;color:#92400e;font-weight:700">⚠ NOTES — RESTRICTIONS</div>
        <div style="font-size:2.5px;color:#78350f;line-height:1.4">Vertical uphill: max 10mm</div>
      </div>
    </div>`;
  return `
    <div class="pdf-thumb-real">
      <div style="text-align:center;border-bottom:1px solid #c8ccd0;padding:1px 0 2px;margin-bottom:3px">
        <div style="font-size:4px;font-weight:700;color:#374151">WPS NPCIL-STD-SM-11 — Page 3 of 3</div>
        <div style="font-size:3px;color:#6b7280">Pass-by-Pass Parameters & Joint Schematic</div>
      </div>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin-bottom:2px">PASS PARAMETERS</div>
      <table style="width:100%;border-collapse:collapse;font-size:2.5px;margin-bottom:3px">
        <tr style="background:rgba(2,132,199,.06)">
          <th style="padding:1px 2px;text-align:left;color:#0369a1;border:0.5px solid #d1d5db">Pass</th>
          <th style="padding:1px 2px;text-align:left;color:#0369a1;border:0.5px solid #d1d5db">Dia</th>
          <th style="padding:1px 2px;text-align:left;color:#0369a1;border:0.5px solid #d1d5db">Amps</th>
          <th style="padding:1px 2px;text-align:left;color:#0369a1;border:0.5px solid #d1d5db">Volts</th>
          <th style="padding:1px 2px;text-align:left;color:#0369a1;border:0.5px solid #d1d5db">Speed</th>
        </tr>
        <tr><td style="padding:1px 2px;border:0.5px solid #d1d5db">Root</td><td style="padding:1px 2px;border:0.5px solid #d1d5db;color:#0284c7">2.5</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">80-100</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">22-24</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">40-60</td></tr>
        <tr><td style="padding:1px 2px;border:0.5px solid #d1d5db">Fill</td><td style="padding:1px 2px;border:0.5px solid #d1d5db;color:#0284c7">3.15</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">110-130</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">22-25</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">50-70</td></tr>
        <tr><td style="padding:1px 2px;border:0.5px solid #d1d5db">Cap</td><td style="padding:1px 2px;border:0.5px solid #d1d5db;color:#0284c7">4.0</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">140-160</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">24-26</td><td style="padding:1px 2px;border:0.5px solid #d1d5db">60-80</td></tr>
      </table>
      <div style="font-size:3.5px;font-weight:700;color:#0369a1;background:rgba(2,132,199,.05);padding:1px 3px;border-left:1.5px solid #0284c7;margin-bottom:2px">JOINT SCHEMATIC</div>
      <svg viewBox="0 0 120 40" style="width:100%;max-height:28px;display:block;margin:0 auto">
        <rect width="120" height="40" fill="#f0f4f8" rx="2"/>
        <rect x="5" y="15" width="35" height="10" fill="#bfdbfe" stroke="#60a5fa" stroke-width="0.5"/>
        <rect x="80" y="15" width="35" height="10" fill="#bfdbfe" stroke="#60a5fa" stroke-width="0.5"/>
        <polygon points="40,15 50,25 40,25" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5"/>
        <polygon points="80,15 70,25 80,25" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5"/>
        <ellipse cx="60" cy="25" rx="5" ry="3" fill="rgba(2,132,199,.15)" stroke="#0284c7" stroke-width="0.5"/>
        <text x="60" y="13" text-anchor="middle" font-size="4" fill="#475569" font-family="monospace">V-GROOVE</text>
        <text x="60" y="36" text-anchor="middle" font-size="3.5" fill="#0369a1" font-family="monospace">VERTICAL UPHILL</text>
      </svg>
    </div>`;
}

// ─── Actions (Loading Wrappers) ───────────────────────────────────────────────
async function analyzeWPS() {
  if (!S.selectedJob) { showToast('Select a job first', 'warn'); return; }
  const wpsRec = S.data.wps.find(w => w.wps_id === S.selectedJob.wps_id);
  if (!wpsRec) { showToast('No WPS record found for this job', 'warn'); return; }

  // Realistic AI extraction simulation with querying/correcting friction
  await showLoading('📄', 'AI Document Analysis', [
    'Initializing vision model...',
    'Segmenting WPS document regions...',
    'Locating Section 1 (Identification)...',
    'Extracting qualification parameters...',
    'Reading Section 4 (Base Metals)...',
    'Low confidence detected in thickness range...',
    'Re-querying section with enhanced context...',
    'Correction applied: 19 mm max thickness confirmed.',
    'Extracting Section 5 (Position & Progression)...',
    'Scanning Notes & Flags for restrictions...',
    'Validating cross-references...',
    'Building qualification drivers...'
  ], 6500, [
    'Targeting: source_wps_no', 'Targeting: qualification_status', 'Targeting: supporting_pqr_no',
    'Confidence: 98.2%', 'Targeting: welding_process_root', 'Targeting: base_material_from',
    'Targeting: base_material_to', 'Targeting: groove_thickness_max_mm', 'Confidence: 42.1%',
    'Applying self-correction loop...', 'Confidence: 96.5%', 'Targeting: positions_groove',
    'Targeting: weld_progression', 'Scanning footnote OCR...', 'Targeting: notes_and_flags',
    'Confidence: 97.8%', 'Finalizing extraction payload...'
  ]);

  S.wpsRecord = wpsRec;
  S.wpsPage = 1;
  S.wpsTab = 'qualification';
  closeDrawer();
  if (S.guidedOn) advanceGuided('wps-extraction');
  navigate('wps-extraction');
  hideLoading();
  showToast('WPS extracted — ' + wpsRec.source_wps_no, 'info');
}

async function runValidation() {
  if (!S.selectedJob || !S.wpsRecord) { showToast('No job or WPS selected', 'warn'); return; }

  await showLoading('✓', 'Validating Job Against WPS', [
    'Checking WPS qualification status…', 'Verifying PQR support…', 'Checking material group compatibility…',
    'Checking thickness range…', 'Checking position coverage…', 'Checking PWHT alignment…',
    'Computing validation result…',
  ], 2400);

  S.validationResult = validateJobAgainstWPS(S.selectedJob, S.wpsRecord, S.data.pqr);
  S.qualMappings = [];
  S.matchResult = null;
  if (S.guidedOn) advanceGuided('validation');
  navigate('validation');
  hideLoading();

  const { hardFail } = S.validationResult;
  showToast(hardFail ? '✗ Validation failed — route to engineering' : '✓ Validation passed', hardFail ? 'warn' : 'info');
}

async function runQualMapping() {
  if (!S.selectedJob || !S.wpsRecord) { showToast('Complete validation first', 'warn'); return; }
  if (S.validationResult?.hardFail) { showToast('Cannot proceed — validation has hard failures', 'warn'); return; }

  await showLoading('🗂', 'Finding Required Qualification', [
    'Looking up WPS in qualification mapping table…', 'Resolving preferred ticket…',
    'Checking alternate ticket conditions…', 'Reviewing engineering review rules…',
  ], 1600);

  const { mappings } = findQualificationMappings(S.wpsRecord.wps_id, S.data.qualMapping);
  S.qualMappings = mappings;
  S.matchResult = null;
  if (S.guidedOn) advanceGuided('qual-mapping');
  navigate('qual-mapping');
  hideLoading();

  if (!mappings.length) showToast('No mapping found — see Exceptions', 'warn');
  else showToast('Qualification mapping loaded', 'info');
}

async function runMatching() {
  if (!S.selectedJob || !S.wpsRecord || !S.qualMappings.length) {
    showToast('Complete qualification mapping first', 'warn'); return;
  }

  await showLoading('👥', 'Matching Welders', [
    'Loading welder qualification records…', 'Evaluating ticket coverage…',
    'Checking process compatibility…', 'Checking thickness ranges…',
    'Checking position coverage…', 'Evaluating continuity and expiry…',
    'Ranking candidates…',
  ], 2800);

  S.matchResult = matchWelders(S.selectedJob, S.wpsRecord, S.data.qualMapping, S.data.qualMatrix, getEffectiveWelders(), S.data.pqr);
  S.exceptions  = detectExceptions(S.data.jobs, S.data.wps, S.data.qualMapping, S.data.pqr);
  if (S.guidedOn) advanceGuided('welder-matching');
  navigate('welder-matching');
  hideLoading();

  const rec = S.matchResult.results.find(r => r.status === 'Recommended');
  showToast(rec ? `✓ Recommended: ${rec.welder.welder_name}` : 'No recommended candidate — review results', rec ? 'info' : 'warn');
}

async function approveWelder(welderId) {
  if (!S.matchResult) return;
  const result = S.matchResult.results.find(r => r.welder.welder_id === welderId);
  if (!result) return;

  await showLoading('✓', 'Approving Assignment', [
    'Verifying welder qualification…', 'Confirming shift availability…',
    'Logging assignment…', 'Generating Execution Ticket…',
  ], 2000);

  S.approvedWelder = result;
  S.selectedJob.status = 'Assigned';
  updateTopbar();
  closeDrawer();
  if (S.guidedOn) advanceGuided('execution-ticket');
  navigate('execution-ticket');
  hideLoading();
  showToast(`✓ ${result.welder.welder_name} approved — ticket generated`, 'info');
}

function copyTicket() {
  const el = document.getElementById('ticket-content');
  if (!el) return;
  const text = el.innerText;
  navigator.clipboard?.writeText(text).then(() => showToast('Ticket copied to clipboard', 'info'));
}

function copyWelderExplanation(welderId) {
  if (!S.matchResult) return;
  const r = S.matchResult.results.find(x => x.welder.welder_id === welderId);
  if (!r) return;
  const lines = [
    `Welder: ${r.welder.welder_name} (${r.welder.welder_id})`,
    `Status: ${r.status}`,
    r.hardRejections.length ? `Rejections: ${r.hardRejections.join('; ')}` : '',
    r.warnings.length ? `Warnings: ${r.warnings.join('; ')}` : '',
    `Ticket: ${r.bestTicket?.ticket_id || 'None'}`,
  ].filter(Boolean).join('\n');
  navigator.clipboard?.writeText(lines).then(() => showToast('Explanation copied', 'info'));
}

// ─── Loading Overlay ──────────────────────────────────────────────────────────
let _loadingTimer = null;
let _loadingSubTimer = null;
let _loadingRAF   = null;

function showLoading(icon, title, msgs, durationMs, subMsgs) {
  return new Promise(resolve => {
    const overlay = document.getElementById('loading-overlay');
    document.getElementById('loading-center-icon').textContent = icon;
    document.getElementById('loading-title').textContent = title;
    document.getElementById('loading-msg').textContent = msgs[0] || 'Please wait…';
    document.getElementById('loading-sub-msg').innerHTML = '';
    document.getElementById('loading-progress-bar').style.width = '0%';
    overlay.classList.add('active');

    let msgIdx = 0;
    const msgInterval = durationMs / (msgs.length + 1);
    _loadingTimer = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, msgs.length - 1);
      document.getElementById('loading-msg').textContent = msgs[msgIdx];
    }, msgInterval);

    // Sub-messages cycle faster for "thinking" effect
    if (subMsgs && subMsgs.length) {
      let subIdx = 0;
      const subInterval = Math.max(400, durationMs / (subMsgs.length * 1.5));
      _loadingSubTimer = setInterval(() => {
        const subEl = document.getElementById('loading-sub-msg');
        if (subEl) {
          subEl.innerHTML = `<span class="loading-pulse">${subMsgs[subIdx % subMsgs.length]}</span>`;
        }
        subIdx++;
      }, subInterval);
    }

    const start = performance.now();
    function animProg(now) {
      const elapsed = now - start;
      // Non-linear progress: fast at start, slows in middle (simulates "thinking"), speeds up at end
      const t = Math.min(elapsed / durationMs, 1);
      const pct = Math.min(t < 0.3 ? t * 120 : t < 0.7 ? 36 + (t - 0.3) * 80 : 68 + (t - 0.7) * 90, 95);
      document.getElementById('loading-progress-bar').style.width = pct + '%';
      if (pct < 95) _loadingRAF = requestAnimationFrame(animProg);
    }
    _loadingRAF = requestAnimationFrame(animProg);

    setTimeout(() => { clearInterval(_loadingTimer); clearInterval(_loadingSubTimer); resolve(); }, durationMs);
  });
}

function hideLoading() {
  clearInterval(_loadingTimer);
  clearInterval(_loadingSubTimer);
  cancelAnimationFrame(_loadingRAF);
  document.getElementById('loading-progress-bar').style.width = '100%';
  document.getElementById('loading-sub-msg').innerHTML = '';
  setTimeout(() => {
    document.getElementById('loading-overlay').classList.remove('active');
    document.getElementById('loading-progress-bar').style.width = '0%';
  }, 200);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { info: 'ℹ', warn: '⚠', error: '✗' };
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span class="toast-msg">${esc(msg)}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; el.style.transition = 'all .3s'; setTimeout(() => el.remove(), 350); }, 3500);
}

// ─── Event Delegation ─────────────────────────────────────────────────────────
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;

  if (action === 'select-job') {
    const job = S.data.jobs.find(j => j.job_id === el.dataset.jobId);
    if (job) {
      S.selectedJob = job;
      S.wpsRecord = null;
      S.validationResult = null;
      S.qualMappings = [];
      S.matchResult = null;
      S.approvedWelder = null;
      updateTopbar();
      if (S.guidedOn && S.guidedStep === 0) { S.guidedStep = 1; updateGuidedBar(); }
      render();
      openJobDrawer();
    }
  }

  if (action === 'nav-section') {
    navigate(el.dataset.section);
  }

  if (action === 'wps-tab') {
    S.wpsTab = el.dataset.tab;
    render();
  }

  if (action === 'wps-page') {
    S.wpsPage = parseInt(el.dataset.page);
    const viewer = document.getElementById('pdf-viewer');
    if (viewer && S.wpsRecord) {
      viewer.innerHTML = buildWPSDocPage(S.wpsRecord, S.wpsPage);
    }
    document.querySelectorAll('.pdf-thumb').forEach(t => {
      t.classList.toggle('active', parseInt(t.dataset.page) === S.wpsPage);
    });
  }

  if (action === 'select-welder') {
    openWelderDrawer(el.dataset.welderId);
  }

  if (action === 'approve-welder') {
    approveWelder(el.dataset.welderId);
  }
});

document.addEventListener('click', e => {
  const navItem = e.target.closest('.nav-item[data-section]');
  if (navItem) navigate(navItem.dataset.section);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
async function init() {
  // Load data silently in background
  const d = EMBEDDED_DATA;
  S.data = {
    jobs:        d.jobs,
    wps:         d.wps,
    qualMatrix:  d.qualMatrix,
    welders:     d.welders,
    qualMapping: d.qualMapping,
    consumables: d.consumables || [],
    pqr:         d.pqr || [],
    inspection:  d.inspection || [],
  };

  // Pre-detect exceptions (including contradictions)
  S.exceptions = detectExceptions(S.data.jobs, S.data.wps, S.data.qualMapping, S.data.pqr);

  // Start at data ingestion screen
  navigate('data-ingestion');

  // Boot guided
  S.guidedOn = true;
  const tog = document.getElementById('guided-toggle');
  if (tog) tog.classList.add('on');

  if (window.lucide) lucide.createIcons();
}

init();
