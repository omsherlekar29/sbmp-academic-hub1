/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_COLORS } from '../data/timetable.js';
import { NOTES } from '../data/notes.js';
import { initSubjectAttendance } from './attendance.js';

function subjPrefix(){
  const p = window.location.pathname;
  if (p.includes('/pages/') || p.includes('/subjects/')) return '../';
  return '';
}

export function initSubjectDirectory(){
  const h = document.getElementById('subjects-grid');
  if (!h) return;
  const s = document.getElementById('subject-search');
  const render = (q='') => {
    const ql = q.toLowerCase();
    const list = SUBJECT_ORDER.filter(c => {
      const sub = SUBJECTS[c];
      return !q || sub.name.toLowerCase().includes(ql) || c.toLowerCase().includes(ql);
    });
    if (!list.length){ h.innerHTML = '<div class="task-empty" style="grid-column:1/-1;">No subjects match your search.</div>'; return; }
    h.innerHTML = list.map(c => {
      const sub = SUBJECTS[c];
      const co = SUBJECT_COLORS[c] || '#0f2557';
      return `<a class="subject-card" href="${subjPrefix()}subjects/${sub.slug}.html" style="--subject-color:${co};">
        <div class="code">${sub.code}</div>
        <h3>${sub.name}</h3>
        <div class="meta"><span>${sub.category}</span><span>·</span><span>${sub.units.length} Units</span><span>·</span><span>Credits ${sub.credits}</span></div>
      </a>`;
    }).join('');
  };
  render();
  if (s) s.addEventListener('input', e => render(e.target.value));
}

export function renderSubjectDetail(code, mount){
  const h = document.querySelector(mount);
  if (!h) return;
  const s = SUBJECTS[code];
  if (!s){ h.innerHTML = '<div class="alert alert-danger">Subject not found.</div>'; return; }
  const co = SUBJECT_COLORS[code] || '#0f2557';
  const books = s.resources_books || [];
  const notes = NOTES[code] || [];

  h.innerHTML = `
  <header class="subject-hero" style="border-top:4px solid ${co};">
    <div class="container">
      <div class="breadcrumbs"><a href="${subjPrefix()}pages/subjects.html">Subjects</a><span class="sep">/</span><span>${s.name}</span></div>
      <div class="code">${s.code}</div>
      <h1 style="margin-bottom:8px;">${s.name} <span class="cat">${s.category}</span></h1>
      <p class="lede">${s.objective}</p>
    </div>
  </header>

  <div class="container">
    <div class="grid grid-3" style="margin-bottom:30px;">
      <div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">Credits</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">${s.credits}</div></div>
      <div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">Duration</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">${s.duration}</div></div>
      <div class="card"><div class="text-mute" style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;">IKS Hours</div><div style="font-family:var(--font-head);font-size:1.5rem;font-weight:700;">${s.ikkHrs}</div></div>
    </div>

    <section class="section" id="subject-attendance"></section>

    ${notes.length ? `
      <section class="section">
        <div class="section-head">
          <h2>Download Notes &amp; Resources</h2>
          <span class="text-mute" style="font-size:.85rem">${notes.length} file${notes.length===1?'':'s'} available</span>
        </div>
        <div class="resources-grid">
          ${notes.map(n => {
            const ext = (n.file.split('.').pop() || '').toLowerCase();
            const kind = (n.type || ext).toUpperCase();
            const cls = ext === 'pdf' ? 'res-pdf' : (ext === 'pptx' || ext === 'ppt') ? 'res-ppt' : (ext === 'docx' || ext === 'doc') ? 'res-doc' : 'res-file';
            const url = `${subjPrefix()}resources/${s.slug}/${n.file}`;
            return `<a class="resource-card" href="${url}" download rel="noopener">
              <div class="res-icon ${cls}"><span class="res-ext">${kind}</span></div>
              <div class="res-body">
                <div class="res-title">${n.title}</div>
                <div class="res-meta">${kind}${n.size ? ' · ' + n.size : ''}</div>
              </div>
              <div class="res-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg></div>
            </a>`;
          }).join('')}
        </div>
      </section>
    ` : ''}

    <section class="section"><h2>Course Outcomes</h2><ol>${s.outcomes.map(o => `<li style="margin-bottom:6px;">${o}</li>`).join('')}</ol></section>

    <section class="section"><h2>Units</h2>
      ${s.units.map(u => `
        <details class="unit" ${u.no === 1 ? 'open' : ''}>
          <summary><span class="unit-no">${u.no}</span><span>${u.title}</span>${u.hours ? `<span class="hours">${u.hours} hrs</span>` : ''}</summary>
          <div class="unit-body"><ul>${u.topics.map(t => `<li>${t}</li>`).join('')}</ul></div>
        </details>
      `).join('')}
    </section>

    ${s.practicals ? `
      <section class="section"><h2>Practicals / Tutorials</h2>
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Sr.</th><th>Title</th><th>Hrs</th><th>CO</th></tr></thead>
          <tbody>${s.practicals.map((p,i) => `<tr><td>${i+1}</td><td>${p.title}</td><td>${p.hrs}</td><td><span class="badge">${p.co}</span></td></tr>`).join('')}</tbody>
        </table></div>
      </section>
    ` : ''}

    ${s.tutorials ? `<section class="section"><h2>Tutorials</h2><ul>${s.tutorials.map(t => `<li>${t}</li>`).join('')}</ul></section>` : ''}

    ${books.length ? `
      <section class="section"><h2>Recommended Books</h2>
        <div class="grid grid-2">
          ${books.map(r => `<div class="card card-tight"><div style="font-weight:600;">${r.title}</div><div class="text-mute" style="font-size:.85rem;">${r.author}</div><div class="text-mute" style="font-size:.78rem;">${r.pub}</div></div>`).join('')}
        </div>
      </section>
    ` : ''}

    <section class="section">
      <div class="section-head"><h2>Subject Task Planner</h2><span class="text-mute" style="font-size:.85rem;">Saved locally in your browser</span></div>
      <div id="subject-planner-form"></div>
      <div id="subject-task-list" class="task-list" style="margin-top:14px;"></div>
    </section>
  </div>`;

  initSubjectAttendance(code);
}