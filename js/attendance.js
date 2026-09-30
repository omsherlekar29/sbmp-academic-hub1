/* SBMP Academic Hub · Om Sherlekar (B053) · CSE-B · (c) 2026 */

import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_COLORS } from '../data/timetable.js';
import { ATTENDANCE_RULES, SUBJECT_TYPES, TYPE_LABELS, getAttendanceStatus } from '../data/attendance-config.js';

const KEY = 'sbmp-attendance-v2';

// ---------- STORAGE ----------
// Format: { [subjectCode]: { [type]: [{ date, status }, ...] } }
// Example:
// {
//   "EMT268901": {
//     "TH": [{date:"2026-08-15", status:"present"}, ...],
//     "TU": [...]
//   },
//   ...
// }

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch(e) { return {}; }
}
function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

// ---------- METRICS ----------
function computeForSubject(data, code) {
  const subject = data[code] || {};
  const types = SUBJECT_TYPES[code] || ['CL'];
  const perType = {};
  let total = 0, present = 0;

  types.forEach(t => {
    const entries = Array.isArray(subject[t]) ? subject[t] : [];
    const p = entries.filter(e => e.status === 'present').length;
    const tt = entries.length;
    perType[t] = { total: tt, present: p, percent: tt > 0 ? Math.round(p / tt * 1000) / 10 : null };
    total += tt;
    present += p;
  });

  const percent = total > 0 ? Math.round(present / total * 1000) / 10 : null;
  return { perType, total, present, absent: total - present, percent };
}

function classesToRecover(stats) {
  if (stats.percent === null || stats.percent >= ATTENDANCE_RULES.minimum) return 0;
  return Math.max(0, Math.ceil((0.75 * stats.total - stats.present) / 0.25));
}
function classesCanSkip(stats) {
  if (stats.percent === null || stats.total === 0) return 0;
  return Math.max(0, Math.floor(stats.present / 0.75 - stats.total));
}

// ---------- DASHBOARD (pages/attendance.html) ----------
export function initAttendanceDashboard() {
  const host = document.getElementById('attendance-dashboard');
  if (!host) return;
  render();

  window.addEventListener('sbmp:attendance-updated', render);

  function render() {
    const data = load();

    const rows = SUBJECT_ORDER.map(code => {
      const s = SUBJECTS[code];
      const stats = computeForSubject(data, code);
      const status = getAttendanceStatus(stats.percent);
      const recover = classesToRecover(stats);
      const skip = classesCanSkip(stats);
      const color = SUBJECT_COLORS[code] || '#0f2557';

      const breakdown = Object.keys(stats.perType).map(t => {
        const pt = stats.perType[t];
        if (pt.total === 0) return '';
        return `<div class="att-type-row">
          <span class="att-type-label">${TYPE_LABELS[t] || t}</span>
          <span class="att-type-stat">${pt.present}/${pt.total} · ${pt.percent}%</span>
        </div>`;
      }).filter(Boolean).join('');

      return `
        <tr>
          <td>
            <div class="att-subj">
              <span class="att-dot" style="background:${color}"></span>
              <div>
                <div class="att-subj-name">${s.name}</div>
                <div class="att-subj-code">${s.code}</div>
              </div>
            </div>
            <div class="att-breakdown">${breakdown}</div>
          </td>
          <td class="att-num">${stats.present}</td>
          <td class="att-num">${stats.absent}</td>
          <td class="att-num">${stats.total}</td>
          <td class="att-num"><strong>${stats.percent === null ? '—' : stats.percent + '%'}</strong></td>
          <td><span class="att-badge ${status.cls}">${status.label}</span></td>
          <td>
            <div class="att-hint">
              ${recover > 0 ? `Attend ${recover} more` :
                (skip > 0 ? `Can skip ${skip}` : (stats.total > 0 ? 'On track' : '—'))}
            </div>
          </td>
          <td>
            <a class="btn btn-ghost btn-sm" href="../subjects/${s.slug}.html#attendance">Open</a>
          </td>
        </tr>
      `;
    }).join('');

    let grandTotal = 0, grandPresent = 0;
    SUBJECT_ORDER.forEach(code => {
      const st = computeForSubject(data, code);
      grandTotal += st.total;
      grandPresent += st.present;
    });
    const overall = grandTotal > 0 ? Math.round(grandPresent / grandTotal * 1000) / 10 : null;
    const overallStatus = getAttendanceStatus(overall);
    const overallRecover = overall !== null && overall < 75
      ? Math.max(0, Math.ceil((0.75 * grandTotal - grandPresent) / 0.25)) : 0;

    host.innerHTML = `
      <div class="att-summary">
        <div class="att-summary-main">
          <div class="att-summary-label">Overall Attendance</div>
          <div class="att-summary-value">${overall === null ? '—' : overall + '%'}</div>
          <div class="att-badge ${overallStatus.cls}" style="margin-top:8px">${overallStatus.label}</div>
        </div>
        <div class="att-summary-stats">
          <div><span>${grandPresent}</span><label>Present</label></div>
          <div><span>${grandTotal - grandPresent}</span><label>Absent</label></div>
          <div><span>${grandTotal}</span><label>Total</label></div>
          <div><span>${overallRecover}</span><label>To 75%</label></div>
        </div>
        <div class="att-summary-actions">
          <button class="btn btn-secondary btn-sm" id="att-export">Export CSV</button>
          <button class="btn btn-ghost btn-sm" id="att-reset-all" style="color:var(--danger)">Reset All</button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data att-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Total</th>
              <th>%</th>
              <th>Status</th>
              <th>Next move</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    document.getElementById('att-export')?.addEventListener('click', exportCSV);
    document.getElementById('att-reset-all')?.addEventListener('click', () => {
      if (!confirm('Reset ALL attendance data? This cannot be undone.')) return;
      save({});
      render();
    });
  }

  function exportCSV() {
    const data = load();
    const lines = ['Subject Code,Subject,Type,Present,Total,Percent'];
    SUBJECT_ORDER.forEach(code => {
      const s = SUBJECTS[code];
      const stats = computeForSubject(data, code);
      Object.keys(stats.perType).forEach(t => {
        const pt = stats.perType[t];
        if (pt.total === 0) return;
        lines.push([code, `"${s.name}"`, t, pt.present, pt.total, pt.percent].join(','));
      });
      lines.push([code, `"${s.name}"`, 'COMBINED', stats.present, stats.total, stats.percent].join(','));
    });
    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sbmp-attendance-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// ---------- PER-SUBJECT PANEL (subject pages) ----------
export function initSubjectAttendance(code) {
  const host = document.getElementById('subject-attendance');
  if (!host) return;
  render();

  window.addEventListener('sbmp:attendance-updated', render);

  function render() {
    const data = load();
    const stats = computeForSubject(data, code);
    const status = getAttendanceStatus(stats.percent);
    const recover = classesToRecover(stats);
    const skip = classesCanSkip(stats);
    const today = new Date().toISOString().slice(0, 10);
    const types = SUBJECT_TYPES[code] || ['CL'];

    const typeBlocks = types.map(t => {
      const pt = stats.perType[t];
      const tStatus = getAttendanceStatus(pt.percent);
      const entries = (data[code] && data[code][t]) ? data[code][t].slice().sort((a,b) => b.date.localeCompare(a.date)) : [];
      return `
        <div class="att-type-block">
          <div class="att-type-head">
            <div class="att-type-name">${TYPE_LABELS[t] || t} <span class="att-type-code">${t}</span></div>
            <div class="att-type-right">
              <span class="att-type-percent">${pt.percent === null ? '—' : pt.percent + '%'}</span>
              <span class="att-badge ${tStatus.cls}">${tStatus.label}</span>
            </div>
          </div>
          <div class="att-type-counts">${pt.present} attended · ${pt.total - pt.present} missed · ${pt.total} total</div>
          <div class="att-actions">
            <button class="btn btn-primary btn-sm" data-mark="present" data-type="${t}">Mark Present (Today)</button>
            <button class="btn btn-secondary btn-sm" data-mark="absent" data-type="${t}">Mark Absent (Today)</button>
          </div>
          ${entries.length ? `
            <details class="att-history" ${entries.length <= 3 ? 'open' : ''}>
              <summary>Recent ${TYPE_LABELS[t]} entries (${entries.length})</summary>
              <div class="att-history-list">
                ${entries.slice(0, 15).map(e => `
                  <div class="att-history-row">
                    <span class="att-history-date">${e.date.startsWith('pdf-') ? 'From college report' : new Date(e.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
                    <span class="att-badge ${e.status === 'present' ? 'att-safe' : 'att-critical'}">${e.status === 'present' ? 'Present' : 'Absent'}</span>
                    <button class="att-del" data-type="${t}" data-date="${e.date}" aria-label="Delete">×</button>
                  </div>
                `).join('')}
              </div>
            </details>
          ` : ''}
        </div>
      `;
    }).join('');

    host.innerHTML = `
      <div class="section-head">
        <h2>Attendance Tracker</h2>
        <span class="text-mute" style="font-size:.85rem">Overall: ${stats.percent === null ? '—' : stats.percent + '%'}</span>
      </div>
      <div class="att-panel">
        <div class="att-panel-head">
          <div class="att-panel-stat">
            <div class="att-panel-percent">${stats.percent === null ? '—' : stats.percent + '%'}</div>
            <span class="att-badge ${status.cls}">${status.label}</span>
          </div>
          <div class="att-panel-detail">
            <div><strong>${stats.present}</strong> present · <strong>${stats.absent}</strong> absent · <strong>${stats.total}</strong> total</div>
            <div class="att-hint">
              ${recover > 0 ? `Attend ${recover} consecutive classes to reach 75%.` :
                (skip > 0 ? `You can skip up to ${skip} classes and stay above 75%.` :
                (stats.total > 0 ? 'You are on track.' : 'No attendance recorded yet.'))}
            </div>
          </div>
        </div>
        <div class="att-type-blocks">${typeBlocks}</div>
        <div class="att-panel-footer">
          <button class="btn btn-ghost btn-sm" id="att-reset-subject" style="color:var(--danger)">Reset this subject</button>
        </div>
      </div>
    `;

    host.querySelectorAll('[data-mark]').forEach(btn => {
      btn.addEventListener('click', () => {
        addEntry(btn.dataset.type, today, btn.dataset.mark);
      });
    });

    host.querySelectorAll('.att-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        removeEntry(e.target.dataset.type, e.target.dataset.date);
      });
    });

    document.getElementById('att-reset-subject')?.addEventListener('click', () => {
      if (!confirm('Reset attendance for this subject? This cannot be undone.')) return;
      const data = load();
      delete data[code];
      save(data);
      render();
      window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
    });
  }

  function addEntry(type, date, status) {
    const data = load();
    if (!data[code]) data[code] = {};
    if (!Array.isArray(data[code][type])) data[code][type] = [];
    const idx = data[code][type].findIndex(e => e.date === date);
    if (idx >= 0) data[code][type][idx].status = status;
    else data[code][type].push({ date, status });
    save(data);
    render();
    window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
  }

  function removeEntry(type, date) {
    const data = load();
    if (!data[code] || !Array.isArray(data[code][type])) return;
    data[code][type] = data[code][type].filter(e => e.date !== date);
    save(data);
    render();
    window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
  }
}

// ---------- PUBLIC HELPERS (used by pdf-import.js) ----------
export function getAttendanceRaw() { return load(); }
export function saveAttendanceRaw(data) { save(data); }