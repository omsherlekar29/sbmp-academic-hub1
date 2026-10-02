/* SBMP Academic Hub · Team TechNova · (c) 2026 */

import { renderLayout } from './layout.js';
import { initTheme } from './theme.js';
import { initClock } from './clock.js';
import { initHomeNotices, initCalendarStrip } from './notices.js';
import { SUBJECTS, SUBJECT_ORDER } from '../data/subjects.js';
import { SUBJECT_COLORS } from '../data/timetable.js';
import { initAnimations } from './animations.js';
import { initAttendanceDashboard } from './attendance.js';
import { initSplash } from './splash.js';

function boot(){
  try { initSplash(); }               catch(e){ console.error('Splash error:', e); }
  try { renderLayout(); }             catch(e){ console.error('Layout error:', e); }
  try { initTheme(); }                catch(e){ console.error('Theme error:', e); }
  try { initClock(); }                catch(e){ console.error('Clock error:', e); }
  try { initHomeNotices(); }          catch(e){ console.error('Home notices error:', e); }
  try { initCalendarStrip(); }        catch(e){ console.error('Calendar error:', e); }
  try { initSubjectsPreview(); }      catch(e){ console.error('Subjects preview error:', e); }
  try { initAttendanceDashboard(); }  catch(e){ console.error('Attendance error:', e); }
  try { initBackToTop(); }            catch(e){ console.error('Back-to-top error:', e); }
  setTimeout(initAnimations, 100);
}

function initSubjectsPreview(){
  const sp = document.getElementById('subjects-preview');
  if (!sp) return;
  sp.innerHTML = SUBJECT_ORDER.map(c => {
    const s = SUBJECTS[c];
    const color = SUBJECT_COLORS[c] || '#0a1f4a';
    return `<a class="subject-card" href="subjects/${s.slug}.html" style="--subject-color:${color};">
      <div class="code">${s.code}</div>
      <h3>${s.name}</h3>
      <div class="meta"><span>${s.category}</span><span>&middot;</span><span>${s.units.length} Units</span></div>
    </a>`;
  }).join('');
}

/* ============================================================
   Back-to-Top Button — built inline, no separate module
   ============================================================ */
function initBackToTop(){
  if (document.querySelector('.back-to-top')) return;

  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  let visible = false;
  function update(){
    const show = window.scrollY > 500;
    if (show !== visible){
      visible = show;
      btn.classList.toggle('show', visible);
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}