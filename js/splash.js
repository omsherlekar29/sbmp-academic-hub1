/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export function initSplash() {
  var splash = document.getElementById('splash-screen');
  if (!splash) return;

  if (!document.documentElement.classList.contains('splash-active')) {
    document.documentElement.style.overflow = '';
    return;
  }

  document.documentElement.style.overflow = 'hidden';

  var reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* ignore */ }

  var HOLD_MS = reduced ? 900 : 1700;
  var EXIT_MS = reduced ? 200 : 450;

  setTimeout(function () {
    splash.classList.add('splash-out');
    setTimeout(function () {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
      document.documentElement.classList.remove('splash-active');
      document.documentElement.style.overflow = '';
    }, EXIT_MS);
  }, HOLD_MS);
}