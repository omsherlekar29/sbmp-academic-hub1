/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { SUBJECTS } from '../data/subjects.js';
import { SUBJECT_COLORS } from '../data/timetable.js';
import { NOTES } from '../data/notes.js';
import { initSubjectAttendance } from './attendance.js';

function escapeHTML(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

export function renderSubjectDetail(code, mountSelector) {
  var mount = document.querySelector(mountSelector);
  if (!mount) return;

  var s = SUBJECTS[code];
  if (!s) {
    mount.innerHTML = '<div class="alert alert-danger">Subject not found.</div>';
    return;
  }

  var color = SUBJECT_COLORS[code] || '#0a1f4a';
  var notes = (NOTES && NOTES[code]) ? NOTES[code] : [];
  var books = s.resources_books || s.resources || [];

  /* Since subjects live in /subjects/, all links need '../' prefix */
  var prefix = '../';

  var heroHTML = '' +
    '<header class="subject-hero" style="border-top:4px solid ' + color + ';">' +
      '<div class="container">' +
        '<div class="breadcrumbs">' +
          '<a href="' + prefix + 'pages/subjects.html">Subjects</a>' +
          '<span class="sep">/</span><span>' + s.name + '</span>' +
        '</div>' +
        '<div class="code">' + s.code + '</div>' +
        '<h1 style="margin-bottom:8px;">' + s.name + ' <span class="cat">' + s.category + '</span></h1>' +
        '<p class="lede">' + s.objective + '</p>' +
        '<button class="btn btn-secondary btn-sm no-print" id="subject-print-btn" style="margin-top:18px;" aria-label="Print this subject page">Print Subject</button>' +
      '</div>' +
    '</header>';

  var metaHTML = '' +
    '<div class="grid grid-3" style="margin-bottom:30px;">' +
      '<div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">Credits</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">' + s.credits + '</div></div>' +
      '<div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">Duration</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">' + s.duration + '</div></div>' +
      '<div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">IKS Hours</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">' + (s.ikkHrs || 0) + '</div></div>' +
    '</div>';

  var notesHTML = '';
  if (notes.length > 0) {
    var noteCards = '';
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      var ext = (n.file.split('.').pop() || '').toLowerCase();
      var kind = (n.type || ext).toUpperCase();
      var cls = 'res-file';
      if (ext === 'pdf') cls = 'res-pdf';
      else if (ext === 'pptx' || ext === 'ppt') cls = 'res-ppt';
      else if (ext === 'docx' || ext === 'doc') cls = 'res-doc';
      var url = prefix + 'resources/' + s.slug + '/' + n.file;
      noteCards += '<a class="resource-card" href="' + url + '" download rel="noopener">' +
        '<div class="res-icon ' + cls + '"><span class="res-ext">' + kind + '</span></div>' +
        '<div class="res-body"><div class="res-title">' + escapeHTML(n.title) + '</div>' +
        '<div class="res-meta">' + kind + (n.size ? ' · ' + n.size : '') + '</div></div>' +
        '<div class="res-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg></div>' +
      '</a>';
    }
    notesHTML = '<section class="section"><div class="section-head"><h2>Download Notes &amp; Resources</h2>' +
      '<span class="text-mute" style="font-size:.85rem">' + notes.length + ' file' + (notes.length === 1 ? '' : 's') + ' available</span></div>' +
      '<div class="resources-grid">' + noteCards + '</div></section>';
  }

  var outcomesHTML = '<section class="section"><h2>Course Outcomes</h2><ol>';
  for (var oi = 0; oi < s.outcomes.length; oi++) outcomesHTML += '<li style="margin-bottom:6px;">' + s.outcomes[oi] + '</li>';
  outcomesHTML += '</ol></section>';

  var unitsHTML = '<section class="section"><h2>Units</h2>';
  for (var ui = 0; ui < s.units.length; ui++) {
    var u = s.units[ui];
    var topicsHTML = '';
    for (var ti = 0; ti < u.topics.length; ti++) topicsHTML += '<li>' + u.topics[ti] + '</li>';
    unitsHTML += '<details class="unit"' + (u.no === 1 ? ' open' : '') + '>' +
      '<summary><span class="unit-no">' + u.no + '</span><span>' + u.title + '</span>' +
      (u.hours ? '<span class="hours">' + u.hours + ' hrs</span>' : '') + '</summary>' +
      '<div class="unit-body"><ul>' + topicsHTML + '</ul></div></details>';
  }
  unitsHTML += '</section>';

  var practicalsHTML = '';
  if (s.practicals && s.practicals.length > 0) {
    var rows = '';
    for (var pi = 0; pi < s.practicals.length; pi++) {
      var p = s.practicals[pi];
      rows += '<tr><td>' + (pi + 1) + '</td><td>' + p.title + '</td><td>' + p.hrs + '</td><td><span class="badge">' + p.co + '</span></td></tr>';
    }
    practicalsHTML = '<section class="section"><h2>Practicals / Tutorials</h2><div class="table-wrap"><table class="data">' +
      '<thead><tr><th>Sr.</th><th>Title</th><th>Hrs</th><th>CO</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  var tutorialsHTML = '';
  if (s.tutorials && s.tutorials.length > 0) {
    var tItems = '';
    for (var tji = 0; tji < s.tutorials.length; tji++) tItems += '<li>' + s.tutorials[tji] + '</li>';
    tutorialsHTML = '<section class="section"><h2>Tutorials</h2><ul>' + tItems + '</ul></section>';
  }

  var booksHTML = '';
  if (books.length > 0) {
    var bookCards = '';
    for (var bi = 0; bi < books.length; bi++) {
      var b = books[bi];
      bookCards += '<div class="card card-tight"><div style="font-weight:600;">' + escapeHTML(b.title) + '</div>' +
        '<div class="text-mute" style="font-size:.85rem;">' + escapeHTML(b.author) + '</div>' +
        '<div class="text-mute" style="font-size:.78rem;">' + escapeHTML(b.pub) + '</div></div>';
    }
    booksHTML = '<section class="section"><h2>Recommended Books</h2><div class="grid grid-2">' + bookCards + '</div></section>';
  }

  var attendanceHTML = '<section class="section" id="subject-attendance"></section>';
  var plannerHTML = '<section class="section no-print">' +
    '<div class="section-head"><h2>Subject Task Planner</h2><span class="text-mute" style="font-size:.85rem;">Saved locally in your browser</span></div>' +
    '<div id="subject-planner-form"></div>' +
    '<div id="subject-task-list" class="task-list" style="margin-top:14px;"></div></section>';

  mount.innerHTML = heroHTML + '<div class="container">' +
    metaHTML + attendanceHTML + notesHTML + outcomesHTML +
    unitsHTML + practicalsHTML + tutorialsHTML + booksHTML + plannerHTML + '</div>';

  var printBtn = document.getElementById('subject-print-btn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  initSubjectAttendance(code);
}