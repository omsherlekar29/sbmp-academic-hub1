/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { NOTICES } from '../data/notices.js';
import { CALENDAR_EVENTS } from '../data/calendar.js';
import { downloadICS } from './calendar-ics.js';

export function initNotices() {
  var h = document.getElementById('notices-root');
  if (!h) return;
  var sorted = NOTICES.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
  if (!sorted.length) { h.innerHTML = '<div class="task-empty">No notices available yet.</div>'; return; }
  var html = '';
  for (var i = 0; i < sorted.length; i++) html += noticeHTML(sorted[i]);
  h.innerHTML = html;
  bindCal(h);
}

export function initHomeNotices() {
  var h = document.getElementById('home-notices');
  if (!h) return;
  var sorted = NOTICES.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);
  var html = '';
  for (var i = 0; i < sorted.length; i++) html += noticeHTML(sorted[i]);
  h.innerHTML = html;
  bindCal(h);
}

function noticeHTML(n) {
  var d = new Date(n.date);
  var day = String(d.getDate()).padStart(2, '0');
  var mon = d.toLocaleString('en-IN', { month: 'short' }).slice(0, 3);
  var isMulti = n.endDate && n.endDate !== n.date;
  return '<article class="notice-item">' +
    '<div class="notice-date"><span class="d">' + day + '</span><span class="m">' + mon + '</span></div>' +
    '<div class="notice-body">' +
      '<div class="notice-title">' + esc(n.title) + '</div>' +
      '<div class="notice-summary">' + esc(n.summary) + '</div>' +
      '<div class="notice-meta">' +
        '<span class="badge">' + n.category + '</span>' +
        (isMulti ? '<span class="badge" style="background:var(--gold-soft);color:var(--gold-hover);">Multi-day</span>' : '') +
        '<button class="notice-cal-btn" data-title="' + esc(n.title) + '" data-date="' + n.date + '" data-end="' + (n.endDate || '') + '" data-summary="' + esc(n.summary) + '">' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' +
          'Add to Calendar' +
        '</button>' +
      '</div>' +
    '</div>' +
  '</article>';
}

function bindCal(container) {
  var btns = container.querySelectorAll('.notice-cal-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function (e) {
      var btn = e.currentTarget;
      downloadICS({
        title: btn.getAttribute('data-title'),
        description: btn.getAttribute('data-summary'),
        date: btn.getAttribute('data-date'),
        endDate: btn.getAttribute('data-end') || undefined,
        location: 'SBMP Campus'
      });
    });
  }
}

export function initCalendarStrip() {
  var h = document.getElementById('calendar-strip');
  if (!h) return;
  var now = new Date();
  now.setHours(0, 0, 0, 0);
  var upcoming = [];
  for (var i = 0; i < CALENDAR_EVENTS.length; i++) {
    var e = CALENDAR_EVENTS[i];
    var ed = new Date(e.date);
    if (ed.getTime() >= now.getTime()) upcoming.push(e);
  }
  upcoming = upcoming.slice(0, 8);
  if (!upcoming.length) { h.innerHTML = ''; return; }
  var html = '';
  for (var j = 0; j < upcoming.length; j++) {
    var ev = upcoming[j];
    var d = new Date(ev.date);
    var label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    html += '<div class="calendar-card">' +
      '<div class="cc-date">' + label + '</div>' +
      '<div class="cc-label">' + esc(ev.label) + '</div>' +
      '<button class="calendar-add-btn" data-title="' + esc(ev.label) + '" data-date="' + ev.date + '" data-end="' + (ev.endDate || '') + '">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
        'Add' +
      '</button>' +
    '</div>';
  }
  h.innerHTML = html;
  var btns = h.querySelectorAll('.calendar-add-btn');
  for (var k = 0; k < btns.length; k++) {
    btns[k].addEventListener('click', function (e) {
      var btn = e.currentTarget;
      downloadICS({
        title: btn.getAttribute('data-title'),
        date: btn.getAttribute('data-date'),
        endDate: btn.getAttribute('data-end') || undefined,
        location: 'SBMP Campus'
      });
    });
  }
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}