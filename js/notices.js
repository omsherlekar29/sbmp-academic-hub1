/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { NOTICES } from '../data/notices.js';
import { CALENDAR_EVENTS } from '../data/calendar.js';
import { downloadICS } from './calendar-ics.js';

export function initNotices(){
  const h = document.getElementById('notices-root');
  if (!h) return;
  const sorted = [...NOTICES].sort((a,b) => b.date.localeCompare(a.date));
  if (!sorted.length){ h.innerHTML = '<div class="task-empty">No notices available yet.</div>'; return; }
  h.innerHTML = sorted.map(n => noticeHTML(n)).join('');
  bindCal(h);
}

export function initHomeNotices(){
  const h = document.getElementById('home-notices');
  if (!h) return;
  const sorted = [...NOTICES].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);
  h.innerHTML = sorted.map(n => noticeHTML(n)).join('');
  bindCal(h);
}

function noticeHTML(n){
  const d = new Date(n.date);
  const day = d.getDate().toString().padStart(2, '0');
  const mon = d.toLocaleString('en-IN', { month: 'short' }).slice(0, 3);
  return `<article class="notice-item">
    <div class="notice-date"><span class="d">${day}</span><span class="m">${mon}</span></div>
    <div class="notice-body">
      <div class="notice-title">${esc(n.title)}</div>
      <div class="notice-summary">${esc(n.summary)}</div>
      <div class="notice-meta">
        <span class="badge">${n.category}</span>
        <button class="notice-cal-btn" data-title="${esc(n.title)}" data-date="${n.date}" data-summary="${esc(n.summary)}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          Add to Calendar
        </button>
      </div>
    </div>
  </article>`;
}

function bindCal(container){
  container.querySelectorAll('.notice-cal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      downloadICS({
        title: btn.dataset.title,
        description: btn.dataset.summary,
        date: btn.dataset.date,
        durationHours: 2
      });
    });
  });
}

export function initCalendarStrip(){
  const h = document.getElementById('calendar-strip');
  if (!h) return;
  const u = CALENDAR_EVENTS.filter(e => new Date(e.date) >= new Date(new Date().toDateString())).slice(0, 8);
  if (!u.length){ h.innerHTML = ''; return; }
  h.innerHTML = u.map(e => {
    const d = new Date(e.date);
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    return `<div class="calendar-card">
      <div class="cc-date">${label}</div>
      <div class="cc-label">${esc(e.label)}</div>
      <button class="calendar-add-btn" data-title="${esc(e.label)}" data-date="${e.date}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add
      </button>
    </div>`;
  }).join('');
  h.querySelectorAll('.calendar-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      downloadICS({ title: btn.dataset.title, description: '', date: btn.dataset.date, durationHours: 2 });
    });
  });
}

function esc(s){ if (!s) return ''; return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }