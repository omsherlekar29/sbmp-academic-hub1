/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { SUBJECTS } from '../data/subjects.js';
import { NOTES } from '../data/notes.js';
import { SUBJECT_COLORS } from '../data/timetable.js';

export function initDownloadsPage(){
  const host = document.getElementById('downloads-root');
  if (!host) return;

  let filterSubject = 'all';
  let query = '';

  function render(){
    // Flatten
    let all = [];
    Object.keys(NOTES).forEach(code => {
      NOTES[code].forEach(n => all.push({ ...n, subject: code }));
    });

    // Filter
    if (filterSubject !== 'all') all = all.filter(x => x.subject === filterSubject);
    if (query){
      const q = query.toLowerCase();
      all = all.filter(x =>
        x.title.toLowerCase().includes(q) ||
        x.file.toLowerCase().includes(q) ||
        (SUBJECTS[x.subject]?.name || '').toLowerCase().includes(q)
      );
    }

    const filtersHTML = `
      <div class="dl-filters">
        <button class="dl-filter ${filterSubject === 'all' ? 'active' : ''}" data-subject="all">All</button>
        ${Object.keys(NOTES).map(code => {
          const s = SUBJECTS[code];
          if (!s) return '';
          return `<button class="dl-filter ${filterSubject === code ? 'active' : ''}" data-subject="${code}">${s.short || s.name}</button>`;
        }).join('')}
      </div>
    `;

    const searchHTML = `
      <div class="dl-search">
        <input id="dl-search-input" type="search" placeholder="Search files…" value="${query}">
      </div>
    `;

    if (!all.length){
      host.innerHTML = `
        ${filtersHTML}
        ${searchHTML}
        <div class="task-empty" style="margin-top:20px;">No files found.</div>
      `;
    } else {
      host.innerHTML = `
        ${filtersHTML}
        ${searchHTML}
        <div class="resources-grid" style="margin-top:20px;">
          ${all.map(n => {
            const s = SUBJECTS[n.subject];
            const ext = (n.file.split('.').pop() || '').toLowerCase();
            const kind = (n.type || ext).toUpperCase();
            const cls = ext === 'pdf' ? 'res-pdf'
                      : (ext === 'pptx' || ext === 'ppt') ? 'res-ppt'
                      : (ext === 'docx' || ext === 'doc') ? 'res-doc'
                      : 'res-file';
            const url = `../resources/${s.slug}/${n.file}`;
            const color = SUBJECT_COLORS[n.subject] || '#0f2557';
            return `<a class="resource-card" href="${url}" download rel="noopener" style="border-left:4px solid ${color};">
              <div class="res-icon ${cls}"><span class="res-ext">${kind}</span></div>
              <div class="res-body">
                <div class="res-title">${n.title}</div>
                <div class="res-meta">${s.name}${n.size ? ' · ' + n.size : ''}</div>
              </div>
              <div class="res-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>
              </div>
            </a>`;
          }).join('')}
        </div>
      `;
    }

    host.querySelectorAll('.dl-filter').forEach(btn => {
      btn.addEventListener('click', () => { filterSubject = btn.dataset.subject; render(); });
    });
    const input = document.getElementById('dl-search-input');
    if (input){
      input.addEventListener('input', e => { query = e.target.value; render(); });
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  render();
}