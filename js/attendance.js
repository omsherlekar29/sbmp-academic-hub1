/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_COLORS } from '../data/timetable.js';
import { ATTENDANCE_RULES, SUBJECT_TYPES, TYPE_LABELS, getAttendanceStatus } from '../data/attendance-config.js';

var KEY = 'sbmp-attendance-v2';

/* ---------- STORAGE ---------- */

function load() {
  try {
    var raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return raw;
  } catch (e) { return {}; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

function getSubjectEntries(data, code) {
  if (!data[code] || typeof data[code] !== 'object') return {};
  return data[code];
}

/* ---------- METRICS ---------- */

function computeForSubject(data, code) {
  var subject = getSubjectEntries(data, code);
  var types = SUBJECT_TYPES[code] || ['CL'];
  var perType = {};
  var total = 0;
  var present = 0;

  for (var i = 0; i < types.length; i++) {
    var t = types[i];
    var entries = Array.isArray(subject[t]) ? subject[t] : [];
    var p = 0;
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].status === 'present') p++;
    }
    var tt = entries.length;
    perType[t] = {
      total: tt,
      present: p,
      percent: tt > 0 ? Math.round(p / tt * 1000) / 10 : null
    };
    total += tt;
    present += p;
  }

  var percent = total > 0 ? Math.round(present / total * 1000) / 10 : null;
  return { perType: perType, total: total, present: present, absent: total - present, percent: percent };
}

function classesToRecover(stats) {
  if (stats.percent === null || stats.percent >= ATTENDANCE_RULES.minimum) return 0;
  return Math.max(0, Math.ceil((0.75 * stats.total - stats.present) / 0.25));
}

function classesCanSkip(stats) {
  if (stats.percent === null || stats.total === 0) return 0;
  return Math.max(0, Math.floor(stats.present / 0.75 - stats.total));
}

/* ---------- DASHBOARD (pages/attendance.html) ---------- */

export function initAttendanceDashboard() {
  var host = document.getElementById('attendance-dashboard');
  if (!host) return;

  render();

  window.addEventListener('sbmp:attendance-updated', render);

  function render() {
    var data = load();

    var rows = '';
    for (var i = 0; i < SUBJECT_ORDER.length; i++) {
      var code = SUBJECT_ORDER[i];
      var s = SUBJECTS[code];
      var stats = computeForSubject(data, code);
      var status = getAttendanceStatus(stats.percent);
      var recover = classesToRecover(stats);
      var skip = classesCanSkip(stats);
      var color = SUBJECT_COLORS[code] || '#0a1f4a';

      var breakdown = '';
      var types = Object.keys(stats.perType);
      for (var j = 0; j < types.length; j++) {
        var t = types[j];
        var pt = stats.perType[t];
        if (pt.total === 0) continue;
        breakdown += '<div class="att-type-row">' +
          '<span class="att-type-label">' + (TYPE_LABELS[t] || t) + '</span>' +
          '<span class="att-type-stat">' + pt.present + '/' + pt.total + ' · ' + pt.percent + '%</span>' +
          '</div>';
      }

      var hint = '—';
      if (recover > 0) hint = 'Attend ' + recover + ' more';
      else if (skip > 0) hint = 'Can skip ' + skip;
      else if (stats.total > 0) hint = 'On track';

      rows += '<tr>' +
        '<td>' +
          '<div class="att-subj">' +
            '<span class="att-dot" style="background:' + color + '"></span>' +
            '<div>' +
              '<div class="att-subj-name">' + s.name + '</div>' +
              '<div class="att-subj-code">' + s.code + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="att-breakdown">' + breakdown + '</div>' +
        '</td>' +
        '<td class="att-num">' + stats.present + '</td>' +
        '<td class="att-num">' + stats.absent + '</td>' +
        '<td class="att-num">' + stats.total + '</td>' +
        '<td class="att-num"><strong>' + (stats.percent === null ? '—' : stats.percent + '%') + '</strong></td>' +
        '<td><span class="att-badge ' + status.cls + '">' + status.label + '</span></td>' +
        '<td><div class="att-hint">' + hint + '</div></td>' +
        '<td><a class="btn btn-ghost btn-sm" href="../subjects/' + s.slug + '.html#attendance">Open</a></td>' +
        '</tr>';
    }

    var grandTotal = 0;
    var grandPresent = 0;
    for (var k = 0; k < SUBJECT_ORDER.length; k++) {
      var st = computeForSubject(data, SUBJECT_ORDER[k]);
      grandTotal += st.total;
      grandPresent += st.present;
    }
    var overall = grandTotal > 0 ? Math.round(grandPresent / grandTotal * 1000) / 10 : null;
    var overallStatus = getAttendanceStatus(overall);
    var overallRecover = 0;
    if (overall !== null && overall < 75) {
      overallRecover = Math.max(0, Math.ceil((0.75 * grandTotal - grandPresent) / 0.25));
    }

    host.innerHTML = '' +
      '<div class="att-summary">' +
        '<div class="att-summary-main">' +
          '<div class="att-summary-label">Overall Attendance</div>' +
          '<div class="att-summary-value">' + (overall === null ? '—' : overall + '%') + '</div>' +
          '<div class="att-badge ' + overallStatus.cls + '" style="margin-top:8px">' + overallStatus.label + '</div>' +
        '</div>' +
        '<div class="att-summary-stats">' +
          '<div><span>' + grandPresent + '</span><label>Present</label></div>' +
          '<div><span>' + (grandTotal - grandPresent) + '</span><label>Absent</label></div>' +
          '<div><span>' + grandTotal + '</span><label>Total</label></div>' +
          '<div><span>' + overallRecover + '</span><label>To 75%</label></div>' +
        '</div>' +
        '<div class="att-summary-actions">' +
          '<button class="btn btn-secondary btn-sm" id="att-export">Export CSV</button>' +
          '<button class="btn btn-ghost btn-sm" id="att-reset-all" style="color:var(--danger)">Reset All</button>' +
        '</div>' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data att-table">' +
          '<thead><tr>' +
            '<th>Subject</th><th>Present</th><th>Absent</th><th>Total</th><th>%</th>' +
            '<th>Status</th><th>Next move</th><th></th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>' +
      '</div>';

    var exportBtn = document.getElementById('att-export');
    if (exportBtn) exportBtn.addEventListener('click', exportCSV);

    var resetBtn = document.getElementById('att-reset-all');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (!confirm('Reset ALL attendance data? This cannot be undone.')) return;
        save({});
        render();
      });
    }
  }

  function exportCSV() {
    var data = load();
    var lines = ['Subject Code,Subject,Type,Present,Total,Percent'];
    for (var i = 0; i < SUBJECT_ORDER.length; i++) {
      var code = SUBJECT_ORDER[i];
      var s = SUBJECTS[code];
      var stats = computeForSubject(data, code);
      var types = Object.keys(stats.perType);
      for (var j = 0; j < types.length; j++) {
        var t = types[j];
        var pt = stats.perType[t];
        if (pt.total === 0) continue;
        lines.push([code, '"' + s.name + '"', t, pt.present, pt.total, pt.percent].join(','));
      }
      lines.push([code, '"' + s.name + '"', 'COMBINED', stats.present, stats.total, stats.percent].join(','));
    }
    var csv = lines.join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sbmp-attendance-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}

/* ---------- PER-SUBJECT PANEL (subject pages) ---------- */

export function initSubjectAttendance(code) {
  var host = document.getElementById('subject-attendance');
  if (!host) return;

  render();

  window.addEventListener('sbmp:attendance-updated', render);

  function render() {
    var data = load();
    var stats = computeForSubject(data, code);
    var status = getAttendanceStatus(stats.percent);
    var recover = classesToRecover(stats);
    var skip = classesCanSkip(stats);
    var today = new Date().toISOString().slice(0, 10);
    var types = SUBJECT_TYPES[code] || ['CL'];

    var typeBlocks = '';
    for (var i = 0; i < types.length; i++) {
      var t = types[i];
      var pt = stats.perType[t];
      var tStatus = getAttendanceStatus(pt.percent);
      var entries = (data[code] && Array.isArray(data[code][t])) ? data[code][t].slice() : [];
      entries.sort(function (a, b) { return b.date.localeCompare(a.date); });

      var historyHTML = '';
      if (entries.length > 0) {
        var rows = '';
        var limit = Math.min(entries.length, 15);
        for (var j = 0; j < limit; j++) {
          var e = entries[j];
          var displayDate = e.date.indexOf('pdf-') === 0
            ? 'From college report'
            : new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
          rows += '<div class="att-history-row">' +
            '<span class="att-history-date">' + displayDate + '</span>' +
            '<span class="att-badge ' + (e.status === 'present' ? 'att-safe' : 'att-critical') + '">' +
              (e.status === 'present' ? 'Present' : 'Absent') +
            '</span>' +
            '<button class="att-del" data-type="' + t + '" data-date="' + e.date + '" aria-label="Delete">×</button>' +
            '</div>';
        }
        historyHTML = '<details class="att-history"' + (entries.length <= 3 ? ' open' : '') + '>' +
          '<summary>Recent ' + (TYPE_LABELS[t] || t) + ' entries (' + entries.length + ')</summary>' +
          '<div class="att-history-list">' + rows + '</div>' +
          '</details>';
      }

      typeBlocks += '<div class="att-type-block">' +
        '<div class="att-type-head">' +
          '<div class="att-type-name">' + (TYPE_LABELS[t] || t) + ' <span class="att-type-code">' + t + '</span></div>' +
          '<div class="att-type-right">' +
            '<span class="att-type-percent">' + (pt.percent === null ? '—' : pt.percent + '%') + '</span>' +
            '<span class="att-badge ' + tStatus.cls + '">' + tStatus.label + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="att-type-counts">' + pt.present + ' attended · ' + (pt.total - pt.present) + ' missed · ' + pt.total + ' total</div>' +
        '<div class="att-actions">' +
          '<button class="btn btn-primary btn-sm" data-mark="present" data-type="' + t + '">Mark Present (Today)</button>' +
          '<button class="btn btn-secondary btn-sm" data-mark="absent" data-type="' + t + '">Mark Absent (Today)</button>' +
        '</div>' +
        historyHTML +
        '</div>';
    }

    var overallHint = '';
    if (recover > 0) overallHint = 'Attend ' + recover + ' consecutive classes to reach 75%.';
    else if (skip > 0) overallHint = 'You can skip up to ' + skip + ' classes and stay above 75%.';
    else if (stats.total > 0) overallHint = 'You are on track.';
    else overallHint = 'No attendance recorded yet.';

    host.innerHTML = '' +
      '<div class="section-head">' +
        '<h2>Attendance Tracker</h2>' +
        '<span class="text-mute" style="font-size:.85rem">Overall: ' + (stats.percent === null ? '—' : stats.percent + '%') + '</span>' +
      '</div>' +
      '<div class="att-panel">' +
        '<div class="att-panel-head">' +
          '<div class="att-panel-stat">' +
            '<div class="att-panel-percent">' + (stats.percent === null ? '—' : stats.percent + '%') + '</div>' +
            '<span class="att-badge ' + status.cls + '">' + status.label + '</span>' +
          '</div>' +
          '<div class="att-panel-detail">' +
            '<div><strong>' + stats.present + '</strong> present · <strong>' + stats.absent + '</strong> absent · <strong>' + stats.total + '</strong> total</div>' +
            '<div class="att-hint">' + overallHint + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="att-type-blocks">' + typeBlocks + '</div>' +
        '<div class="att-panel-footer">' +
          '<button class="btn btn-ghost btn-sm" id="att-reset-subject" style="color:var(--danger)">Reset this subject</button>' +
        '</div>' +
      '</div>';

    var markBtns = host.querySelectorAll('[data-mark]');
    for (var m = 0; m < markBtns.length; m++) {
      markBtns[m].addEventListener('click', function (e) {
        var btn = e.currentTarget;
        addEntry(btn.getAttribute('data-type'), today, btn.getAttribute('data-mark'));
      });
    }

    var delBtns = host.querySelectorAll('.att-del');
    for (var n = 0; n < delBtns.length; n++) {
      delBtns[n].addEventListener('click', function (e) {
        removeEntry(e.currentTarget.getAttribute('data-type'), e.currentTarget.getAttribute('data-date'));
      });
    }

    var resetSubjectBtn = document.getElementById('att-reset-subject');
    if (resetSubjectBtn) {
      resetSubjectBtn.addEventListener('click', function () {
        if (!confirm('Reset attendance for this subject? This cannot be undone.')) return;
        var d = load();
        delete d[code];
        save(d);
        render();
        window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
      });
    }
  }

  function addEntry(type, date, status) {
    var data = load();
    if (!data[code]) data[code] = {};
    if (!Array.isArray(data[code][type])) data[code][type] = [];
    var found = -1;
    for (var i = 0; i < data[code][type].length; i++) {
      if (data[code][type][i].date === date) { found = i; break; }
    }
    if (found >= 0) data[code][type][found].status = status;
    else data[code][type].push({ date: date, status: status });
    save(data);
    render();
    window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
  }

  function removeEntry(type, date) {
    var data = load();
    if (!data[code] || !Array.isArray(data[code][type])) return;
    data[code][type] = data[code][type].filter(function (e) { return e.date !== date; });
    save(data);
    render();
    window.dispatchEvent(new CustomEvent('sbmp:attendance-updated'));
  }
}

/* ---------- PUBLIC HELPERS (used by pdf-import.js) ---------- */

export function getAttendanceRaw() { return load(); }
export function saveAttendanceRaw(data) { save(data); }