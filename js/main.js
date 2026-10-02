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

window.__sbmpLoaded = true;
console.log('[SBMP] main.js loaded');

function boot(){
  console.log('[SBMP] boot() running');
  try { initSplash(); } catch(e){ console.error('Splash:', e); }
  try { renderLayout(); } catch(e){ console.error('Layout:', e); }
  try { initTheme(); } catch(e){ console.error('Theme:', e); }
  try { initClock(); } catch(e){ console.error('Clock:', e); }
  try { initHomeNotices(); } catch(e){ console.error('Notices:', e); }
  try { initCalendarStrip(); } catch(e){ console.error('Calendar:', e); }
  try { initSubjectsPreview(); } catch(e){ console.error('Subjects:', e); }
  try { initAttendanceDashboard(); } catch(e){ console.error('Attendance:', e); }
  try { initBackToTop(); } catch(e){ console.error('BackTop:', e); }
  setTimeout(initAnimations, 100);
  console.log('[SBMP] boot() done');
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
   Back-to-top — fully self-contained (styles injected by JS)
   ============================================================ */
function initBackToTop(){
  console.log('[SBMP] initBackToTop called');

  // Remove any existing (in case of double-init)
  document.querySelectorAll('.sbmp-top-btn').forEach(el => el.remove());

  // Inject styles once
  if (!document.getElementById('sbmp-top-styles')){
    const style = document.createElement('style');
    style.id = 'sbmp-top-styles';
    style.textContent = `
      .sbmp-top-btn{
        position:fixed !important;
        left:18px !important;
        bottom:80px !important;
        z-index:99998 !important;
        width:48px;height:48px;
        border-radius:50%;
        border:1px solid rgba(184,135,58,.35);
        background:linear-gradient(135deg,#0a1f4a 0%,#05122e 100%);
        color:#e8c368;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;
        box-shadow:0 8px 24px rgba(10,31,74,.30);
        opacity:0;
        transform:translateY(14px) scale(.9);
        pointer-events:none;
        transition:opacity .4s cubic-bezier(.19,1,.22,1), transform .4s cubic-bezier(.19,1,.22,1), box-shadow .35s;
      }
      .sbmp-top-btn.show{
        opacity:1 !important;
        transform:translateY(0) scale(1) !important;
        pointer-events:auto !important;
      }
      .sbmp-top-btn:hover{
        transform:translateY(-3px) scale(1.05) !important;
        box-shadow:0 14px 34px rgba(10,31,74,.38);
        color:#f0d27e;
      }
      @media(max-width:600px){
        .sbmp-top-btn{width:42px !important;height:42px !important;left:14px !important;bottom:70px !important;}
      }
      @media print{.sbmp-top-btn{display:none !important}}
    `;
    document.head.appendChild(style);
  }

  const btn = document.createElement('button');
  btn.className = 'sbmp-top-btn';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  let visible = false;
  function update(){
    const show = window.scrollY > 400;
    if (show !== visible){
      visible = show;
      btn.classList.toggle('show', visible);
      console.log('[SBMP] Back-top visible:', visible);
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  setTimeout(update, 100);

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  console.log('[SBMP] Back-top button created');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}