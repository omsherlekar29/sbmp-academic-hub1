/* SBMP Academic Hub · Om Sherlekar (B053) · CSE-B · (c) 2026 */

export function initTheme(){
  // Apply saved theme (safety net in case inline script didn't run)
  const stored = localStorage.getItem('sbmp-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);

  // Wire up the toggle button (retry until it exists)
  let attempts = 0;
  function attach(){
    const btn = document.getElementById('theme-toggle');
    if (btn && !btn.dataset.wired){
      btn.dataset.wired = '1';
      btn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('sbmp-theme', next);
      });
      return;
    }
    if (attempts++ < 20) setTimeout(attach, 100);
  }
  attach();
}