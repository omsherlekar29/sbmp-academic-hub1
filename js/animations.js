/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export function initAnimations(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const selectors = '.card, .quick-tile, .subject-card, .notice-item, .calendar-card, .unit, .resource-card';
  const targets = document.querySelectorAll(selectors);
  targets.forEach(el => el.classList.add('anim-init'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('anim-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

  targets.forEach(el => io.observe(el));
}