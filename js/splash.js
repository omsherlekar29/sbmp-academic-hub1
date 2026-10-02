/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export function initSplash(){
  // Only on homepage
  if (!document.getElementById('clock-host')) return;
  // Once per session
  if (sessionStorage.getItem('sbmp-splash') === '1') return;
  sessionStorage.setItem('sbmp-splash', '1');

  const splash = document.createElement('div');
  splash.className = 'splash';
  splash.innerHTML = `
    <div class="splash-inner">
      <div class="splash-mark">TN</div>
      <div class="splash-team">TechNova</div>
      <div class="splash-divider"></div>
      <div class="splash-project">SBMP Academic Hub</div>
      <div class="splash-bar"><div class="splash-bar-fill"></div></div>
    </div>
  `;
  document.body.appendChild(splash);

  setTimeout(() => {
    splash.classList.add('splash-out');
    setTimeout(() => splash.remove(), 600);
  }, 1800);
}