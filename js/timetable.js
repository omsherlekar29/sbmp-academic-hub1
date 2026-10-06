/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { DAYS, TIME_SLOTS, TIMETABLE_DIV_B } from '../data/timetable.js';

var BATCH_KEY = 'sbmp-batch-preference';
var activeBatch = 'ALL';
var selectedDay = 'Monday';
var isMobile = false;

try {
  var saved = localStorage.getItem(BATCH_KEY);
  if (saved === 'S1' || saved === 'S2' || saved === 'ALL') {
    activeBatch = saved;
  }
} catch (e) { /* ignore */ }

export function initTimetable() {
  var root = document.getElementById('timetable-root');
  if (!root) return;

  checkMobile();
  window.addEventListener('resize', function () {
    var was = isMobile;
    checkMobile();
    if (was !== isMobile) {
      renderControls();
      renderGrid();
    }
  });

  renderControls();
  renderGrid();
}

function checkMobile() {
  isMobile = window.innerWidth < 900;
}

function renderControls() {
  var c = document.getElementById('tt-controls');
  if (!c) return;

  var html = '';
  html += '<div class="tt-tabs" role="tablist">';
  html += '<button class="tt-tab ' + (activeBatch === 'ALL' ? 'active' : '') + '" data-batch="ALL">Full Division B</button>';
  html += '<button class="tt-tab ' + (activeBatch === 'S1' ? 'active' : '') + '" data-batch="S1">Batch S1</button>';
  html += '<button class="tt-tab ' + (activeBatch === 'S2' ? 'active' : '') + '" data-batch="S2">Batch S2</button>';
  html += '</div>';
  html += '<button class="btn btn-secondary btn-sm" onclick="window.print()" style="margin-left:auto;">Print</button>';
  html += '<div class="badge badge-primary">AY 2026-27</div>';

  c.innerHTML = html;

  var tabs = c.querySelectorAll('.tt-tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', onTabClick);
  }
}

function onTabClick(e) {
  activeBatch = e.currentTarget.getAttribute('data-batch');
  try { localStorage.setItem(BATCH_KEY, activeBatch); } catch (err) { /* ignore */ }

  var tabs = document.querySelectorAll('.tt-tab');
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i] === e.currentTarget) tabs[i].classList.add('active');
    else tabs[i].classList.remove('active');
  }
  renderGrid();
}

function currentSlot() {
  var now = new Date();
  var day = now.toLocaleDateString('en-US', { weekday: 'long' });
  var t = now.getHours() * 60 + now.getMinutes();
  var slots = [
    ['08:00 - 09:00', 480, 540], ['09:00 - 10:00', 540, 600],
    ['10:00 - 11:00', 600, 660], ['11:00 - 12:00', 660, 720],
    ['12:00 - 01:00', 720, 780], ['01:00 - 02:00', 780, 840],
    ['02:00 - 03:00', 840, 900], ['03:00 - 04:00', 900, 960],
    ['04:00 - 05:00', 960, 1020]
  ];
  for (var i = 0; i < slots.length; i++) {
    if (t >= slots[i][1] && t < slots[i][2]) {
      return { day: day, label: slots[i][0] };
    }
  }
  return null;
}

function getEntries(day, slot) {
  var cell = TIMETABLE_DIV_B[day][slot];
  if (!cell) return [{ type: 'FREE' }];
  if (Array.isArray(cell)) return cell;
  return [cell];
}

function getSpecial(day, slot) {
  var cell = TIMETABLE_DIV_B[day][slot];
  if (!cell || Array.isArray(cell)) return null;
  if (cell.type === 'RECESS' || cell.type === 'LIBRARY') return cell;
  return null;
}

/* Is this slot the FIRST hour of a 2-hour lab?
   True when the SAME lab (same code + same batch) also exists in the next slot. */
function isLabStart(day, slot) {
  var idx = TIME_SLOTS.indexOf(slot);
  if (idx === TIME_SLOTS.length - 1) return false;
  var nextSlot = TIME_SLOTS[idx + 1];
  var curLabs = getEntries(day, slot).filter(function (e) { return e.type === 'CLASS' && e.mode === 'LL'; });
  var nextLabs = getEntries(day, nextSlot).filter(function (e) { return e.type === 'CLASS' && e.mode === 'LL'; });
  if (curLabs.length === 0 || nextLabs.length === 0) return false;
  for (var i = 0; i < curLabs.length; i++) {
    for (var j = 0; j < nextLabs.length; j++) {
      if (curLabs[i].code === nextLabs[j].code && curLabs[i].batch === nextLabs[j].batch) return true;
    }
  }
  return false;
}

/* Was this slot already rendered as the 2nd row of a rowspan from above?
   True only when every relevant lab in this slot is the SAME lab (code+batch)
   as in the previous slot. Otherwise it's a NEW lab that must be rendered. */
function isAlreadyCoveredByRowspan(day, slot) {
  var idx = TIME_SLOTS.indexOf(slot);
  if (idx === 0) return false;
  var prevSlot = TIME_SLOTS[idx - 1];
  var curLabs = getEntries(day, slot).filter(function (e) { return e.type === 'CLASS' && e.mode === 'LL'; });
  var prevLabs = getEntries(day, prevSlot).filter(function (e) { return e.type === 'CLASS' && e.mode === 'LL'; });
  if (curLabs.length === 0 || prevLabs.length === 0) return false;

  var relevant = curLabs;
  if (activeBatch === 'S1' || activeBatch === 'S2') {
    relevant = curLabs.filter(function (l) { return l.batch === activeBatch; });
    if (relevant.length === 0) return false;
  }

  for (var i = 0; i < relevant.length; i++) {
    var lab = relevant[i];
    var found = false;
    for (var j = 0; j < prevLabs.length; j++) {
      if (prevLabs[j].code === lab.code && prevLabs[j].batch === lab.batch) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

function renderGrid() {
  var root = document.getElementById('timetable-root');
  if (!root) return;

  if (isMobile) {
    renderMobileView(root);
  } else {
    renderDesktopView(root);
  }
}

/* Desktop: wide grid */
function renderDesktopView(root) {
  var cur = currentSlot();
  var html = '<div class="tt-wrap"><table class="tt-table">';

  html += '<thead><tr><th class="tt-th-time">Time</th>';
  for (var d = 0; d < DAYS.length; d++) {
    html += '<th class="tt-th-day">' + DAYS[d] + '</th>';
  }
  html += '</tr></thead><tbody>';

  for (var i = 0; i < TIME_SLOTS.length; i++) {
    var slot = TIME_SLOTS[i];
    html += '<tr><td class="tt-td-time">' + slot + '</td>';

    for (var j = 0; j < DAYS.length; j++) {
      var day = DAYS[j];
      if (isAlreadyCoveredByRowspan(day, slot)) continue;

      var isNow = cur && day === cur.day && slot === cur.label;
      html += renderCell(day, slot, isNow);
    }
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  root.innerHTML = html;
}

/* Mobile: day picker + vertical list */
function renderMobileView(root) {
  var cur = currentSlot();
  var html = '<div class="tt-mobile">';

  html += '<div class="tt-day-tabs">';
  for (var d = 0; d < DAYS.length; d++) {
    var active = DAYS[d] === selectedDay ? ' active' : '';
    html += '<button class="tt-day-tab' + active + '" data-day="' + DAYS[d] + '">' + DAYS[d].slice(0, 3) + '</button>';
  }
  html += '</div>';

  html += '<div class="tt-mobile-list">';
  for (var i = 0; i < TIME_SLOTS.length; i++) {
    var slot = TIME_SLOTS[i];

    if (isAlreadyCoveredByRowspan(selectedDay, slot)) continue;

    var isNow = cur && selectedDay === cur.day && slot === cur.label;
    html += renderMobileCell(selectedDay, slot, isNow);
  }
  html += '</div></div>';

  root.innerHTML = html;

  var dayTabs = root.querySelectorAll('.tt-day-tab');
  for (var k = 0; k < dayTabs.length; k++) {
    dayTabs[k].addEventListener('click', function (e) {
      selectedDay = e.currentTarget.getAttribute('data-day');
      renderGrid();
    });
  }
}

function renderMobileCell(day, slot, isNow) {
  var special = getSpecial(day, slot);
  if (special && special.type === 'RECESS') {
    return '<div class="ttm-row ttm-recess"><div class="ttm-time">' + slot + '</div><div class="ttm-body">RECESS</div></div>';
  }
  if (special && special.type === 'LIBRARY') {
    return '<div class="ttm-row ttm-library"><div class="ttm-time">' + slot + '</div><div class="ttm-body">LIBRARY</div></div>';
  }

  var isStart = isLabStart(day, slot);
  var rowspanClass = isStart ? ' ttm-lab-2h' : '';
  var nowClass = isNow ? ' now-cell' : '';

  if (activeBatch === 'S1' || activeBatch === 'S2') {
    var lab = null;
    var entries = getEntries(day, slot);
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].type === 'CLASS' && entries[i].mode === 'LL' && entries[i].batch === activeBatch) {
        lab = entries[i];
        break;
      }
    }
    if (lab) {
      return '<div class="ttm-row ttm-class' + rowspanClass + nowClass + '">' +
        '<div class="ttm-time">' + slot + '</div>' +
        '<div class="ttm-body">' +
          '<div class="ttm-code">' + lab.code + '</div>' +
          '<div class="ttm-name">' + shortName(lab.name) + ' · Lab</div>' +
          '<div class="ttm-meta">' + lab.faculty + ' · ' + lab.room + '</div>' +
        '</div></div>';
    }
    var reg = null;
    for (var m = 0; m < entries.length; m++) {
      var e = entries[m];
      if (e.type === 'CLASS' && e.mode !== 'LL' && (e.batch === 'ALL' || e.batch === activeBatch)) {
        reg = e;
        break;
      }
    }
    if (reg) {
      return '<div class="ttm-row ttm-class' + nowClass + '">' +
        '<div class="ttm-time">' + slot + '</div>' +
        '<div class="ttm-body">' +
          '<div class="ttm-code">' + reg.code + '</div>' +
          '<div class="ttm-name">' + reg.name + '</div>' +
          '<div class="ttm-meta">' + reg.faculty + ' · ' + reg.room + ' · ' + reg.mode + '</div>' +
        '</div></div>';
    }
    return '<div class="ttm-row ttm-free"><div class="ttm-time">' + slot + '</div><div class="ttm-body">—</div></div>';
  }

  var allEntries = getEntries(day, slot);
  var labs = allEntries.filter(function (x) { return x.type === 'CLASS' && x.mode === 'LL'; });
  var regs = allEntries.filter(function (x) { return x.type === 'CLASS' && x.mode !== 'LL'; });

  if (labs.length > 0) {
    var body = '';
    for (var n = 0; n < labs.length; n++) {
      var labEntry = labs[n];
      body += '<div class="ttm-lab-block">';
      body += '<span class="ttm-lab-tag">' + labEntry.batch + '</span>';
      body += '<div class="ttm-code">' + labEntry.code + '</div>';
      body += '<div class="ttm-name">' + shortName(labEntry.name) + ' · Lab</div>';
      body += '<div class="ttm-meta">' + labEntry.faculty + ' · ' + labEntry.room + '</div>';
      body += '</div>';
    }
    return '<div class="ttm-row ttm-class ttm-lab' + rowspanClass + nowClass + '">' +
      '<div class="ttm-time">' + slot + '</div>' +
      '<div class="ttm-body">' + body + '</div></div>';
  }

  if (regs.length > 0) {
    var r = regs[0];
    return '<div class="ttm-row ttm-class' + nowClass + '">' +
      '<div class="ttm-time">' + slot + '</div>' +
      '<div class="ttm-body">' +
        '<div class="ttm-code">' + r.code + '</div>' +
        '<div class="ttm-name">' + r.name + '</div>' +
        '<div class="ttm-meta">' + r.faculty + ' · ' + r.room + ' · ' + r.mode + '</div>' +
      '</div></div>';
  }

  return '<div class="ttm-row ttm-free"><div class="ttm-time">' + slot + '</div><div class="ttm-body">—</div></div>';
}

function renderCell(day, slot, isNow) {
  var special = getSpecial(day, slot);
  if (special && special.type === 'RECESS') return '<td class="tt-td recess">RECESS</td>';
  if (special && special.type === 'LIBRARY') return '<td class="tt-td library">LIBRARY</td>';

  var isStart = isLabStart(day, slot);
  var rowspan = isStart ? ' rowspan="2"' : '';
  var nowCls = isNow ? ' now-cell' : '';

  if (activeBatch === 'S1' || activeBatch === 'S2') {
    var entries = getEntries(day, slot);
    var lab = null;
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].type === 'CLASS' && entries[i].mode === 'LL' && entries[i].batch === activeBatch) {
        lab = entries[i];
        break;
      }
    }
    if (lab) {
      return '<td class="tt-td lab-cell' + nowCls + '"' + rowspan + '>' +
        '<div class="code">' + lab.code + '</div>' +
        '<div class="name">' + shortName(lab.name) + ' LL</div>' +
        '<div class="meta">' + lab.faculty + ' · ' + lab.room + ' · ' + activeBatch + '</div>' +
        '</td>';
    }
    var reg = null;
    for (var j = 0; j < entries.length; j++) {
      var e = entries[j];
      if (e.type === 'CLASS' && e.mode !== 'LL' && (e.batch === 'ALL' || e.batch === activeBatch)) {
        reg = e;
        break;
      }
    }
    if (reg) {
      return '<td class="tt-td' + nowCls + '">' +
        '<div class="code">' + reg.code + '</div>' +
        '<div class="name">' + reg.name + '</div>' +
        '<div class="meta">' + reg.faculty + ' · ' + reg.room + ' · ' + reg.mode + '</div>' +
        '</td>';
    }
    return '<td class="tt-td free">—</td>';
  }

  var allEntries = getEntries(day, slot);
  var labs = allEntries.filter(function (x) { return x.type === 'CLASS' && x.mode === 'LL'; });
  var regs = allEntries.filter(function (x) { return x.type === 'CLASS' && x.mode !== 'LL'; });

  if (labs.length > 0) {
    var s1 = null, s2 = null;
    for (var k = 0; k < labs.length; k++) {
      if (labs[k].batch === 'S1') s1 = labs[k];
      if (labs[k].batch === 'S2') s2 = labs[k];
    }
    if (s1 && s2) {
      return '<td class="tt-td lab-cell' + nowCls + '"' + rowspan + '>' +
        '<div class="lab-block"><div class="lab-tag">S1</div>' +
          '<div class="code">' + s1.code + '</div>' +
          '<div class="name">' + shortName(s1.name) + ' LL</div>' +
          '<div class="meta">' + s1.faculty + ' · ' + s1.room + '</div>' +
        '</div>' +
        '<div class="lab-block"><div class="lab-tag">S2</div>' +
          '<div class="code">' + s2.code + '</div>' +
          '<div class="name">' + shortName(s2.name) + ' LL</div>' +
          '<div class="meta">' + s2.faculty + ' · ' + s2.room + '</div>' +
        '</div></td>';
    }
    var one = s1 || s2;
    return '<td class="tt-td lab-cell' + nowCls + '"' + rowspan + '>' +
      '<div class="lab-tag">' + one.batch + '</div>' +
      '<div class="code">' + one.code + '</div>' +
      '<div class="name">' + shortName(one.name) + ' LL</div>' +
      '<div class="meta">' + one.faculty + ' · ' + one.room + '</div>' +
      '</td>';
  }

  if (regs.length > 0) {
    var r = regs[0];
    return '<td class="tt-td' + nowCls + '">' +
      '<div class="code">' + r.code + '</div>' +
      '<div class="name">' + r.name + '</div>' +
      '<div class="meta">' + r.faculty + ' · ' + r.room + ' · ' + r.mode + '</div>' +
      '</td>';
  }

  return '<td class="tt-td free">—</td>';
}

function shortName(n) {
  return n
    .replace('Engineering Mathematics', 'Engg Math')
    .replace('Engineering Graphics', 'Engg Graphics')
    .replace('Fundamentals of Computing System', 'Fund. Computing')
    .replace('Communication Skills', 'Comm. Skills')
    .replace('Universal Human Values', 'UHV')
    .replace('Website Designing', 'Web Design')
    .replace('Applied Science', 'Applied Sci');
}