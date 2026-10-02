/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export function initSplash(){
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  // If html doesn't have .splash-active, the splash markup is hidden by CSS — do nothing.
  if (!document.documentElement.classList.contains('splash-active')) {
    // Safety: also ensure no scroll-lock remains
    document.documentElement.style.overflow = '';
    return;
  }

  // Lock scroll while the splash is on screen
  document.documentElement.style.overflow = 'hidden';

  // After the entrance animations finish, fade out
  const HOLD_MS = 2400;

  setTimeout(() => {
    splash.classList.add('splash-out');

    // After the exit transition, remove the element and release scroll
    setTimeout(() => {
      splash.remove();
      document.documentElement.classList.remove('splash-active');
      document.documentElement.style.overflow = '';
    }, 700);
  }, HOLD_MS);
}