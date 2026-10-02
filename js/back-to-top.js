/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export function initBackToTop(){
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  `;
  document.body.appendChild(btn);

  let visible = false;
  function check(){
    const show = window.scrollY > 500;
    if (show !== visible){
      visible = show;
      btn.classList.toggle('show', visible);
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  check();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}