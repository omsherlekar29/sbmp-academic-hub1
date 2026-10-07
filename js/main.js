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
import { initCountdown } from './countdown.js';

function boot() {
  initSplash();
  renderLayout();
  initTheme();
  initClock();
  initHomeNotices();
  initCalendarStrip();
  initSubjectsPreview();
  initCountdown();
  initAttendanceDashboard();
  initBackToTop();
  setTimeout(initAnimations, 120);
}

function initSubjectsPreview() {
  var sp = document.getElementById('subjects-preview');
  if (!sp) return;
  var html = '';
  for (var i = 0; i < SUBJECT_ORDER.length; i++) {
    var code = SUBJECT_ORDER[i];
    var s = SUBJECTS[code];
    var color = SUBJECT_COLORS[code] || '#0a1f4a';
    html += '<a class="subject-card" href="subjects/' + s.slug + '.html" style="--subject-color:' + color + ';">' +
      '<div class="code">' + s.code + '</div>' +
      '<h3>' + s.name + '</h3>' +
      '<div class="meta"><span>' + s.category + '</span><span>&middot;</span><span>' + s.units.length + ' Units</span></div>' +
    '</a>';
  }
  sp.innerHTML = html;
}

/* ==========================================================
   BACK TO TOP — self-contained, styles injected by JS
   ========================================================== */
function initBackToTop() {
  /* Remove any previous instance */
  var existing = document.querySelectorAll('.sbmp-top');
  for (var x = 0; x < existing.length; x++) existing[x].parentNode.removeChild(existing[x]);

  /* Inject styles once */
  if (!document.getElementById('sbmp-top-css')) {
    var style = document.createElement('style');
    style.id = 'sbmp-top-css';
    style.textContent =
      '.sbmp-top{position:fixed;left:20px;bottom:90px;z-index:99998;width:46px;height:46px;' +
      'border-radius:50%;border:1px solid rgba(184,135,58,.4);' +
      'background:linear-gradient(135deg,#0a1f4a 0%,#05122e 100%);color:#e8c368;' +
      'display:flex;align-items:center;justify-content:center;cursor:pointer;' +
      'box-shadow:0 8px 24px rgba(10,31,74,.32);' +
      'opacity:0;transform:translateY(16px) scale(.9);pointer-events:none;' +
      'transition:opacity .35s ease,transform .35s cubic-bezier(.2,.9,.3,1),box-shadow .25s ease}' +
      '.sbmp-top.sbmp-show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}' +
      '.sbmp-top:hover{transform:translateY(-3px) scale(1.06);box-shadow:0 14px 34px rgba(10,31,74,.42);color:#f0d27e}' +
      '.sbmp-top:active{transform:translateY(-1px) scale(1.02)}' +
      '@media (max-width:600px){.sbmp-top{width:40px;height:40px;left:14px;bottom:80px}}' +
      '@media print{.sbmp-top{display:none !important}}';
    document.head.appendChild(style);
  }

  /* Build the button */
  var btn = document.createElement('button');
  btn.className = 'sbmp-top';
  btn.setAttribute('type', 'button');
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  /* Show / hide based on scroll */
  var shown = false;
  function check() {
    var y = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    var shouldShow = y > 300;
    if (shouldShow !== shown) {
      shown = shouldShow;
      if (shown) btn.classList.add('sbmp-show');
      else btn.classList.remove('sbmp-show');
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  check();

  /* Click → smooth scroll */
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}