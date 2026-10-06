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
  setTimeout(initAnimations, 100);
}

function initSubjectsPreview() {
  var sp = document.getElementById('subjects-preview');
  if (!sp) return;
  var html = '';
  for (var i = 0; i < SUBJECT_ORDER.length; i++) {
    var code = SUBJECT_ORDER[i];
    var s = SUBJECTS[code];
    var color = SUBJECT_COLORS[code] || '#0a1f4a';
    html += '<a class="subject-card" href="subjects/' + s.slug + '.html" style="--subject-color:' + color + ';">';
    html += '<div class="code">' + s.code + '</div>';
    html += '<h3>' + s.name + '</h3>';
    html += '<div class="meta"><span>' + s.category + '</span><span>&middot;</span><span>' + s.units.length + ' Units</span></div>';
    html += '</a>';
  }
  sp.innerHTML = html;
}

function initBackToTop() {
  if (document.querySelector('.back-to-top')) return;

  var btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var visible = false;
  function update() {
    var show = window.scrollY > 400;
    if (show !== visible) {
      visible = show;
      if (visible) btn.classList.add('show');
      else btn.classList.remove('show');
    }
  }
  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}