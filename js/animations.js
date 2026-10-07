/* SBMP Academic Hub · Team TechNova · (c) 2026 */

export function initAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---- Scroll reveal — subtle and smooth ---- */
  if ('IntersectionObserver' in window) {
    var selectors = [
      '.card', '.quick-tile', '.subject-card', '.notice-item',
      '.calendar-card', '.unit', '.resource-card', '.team-card',
      '.stat-block', '.att-type-block'
    ];
    var targets = [];
    for (var s = 0; s < selectors.length; s++) {
      var found = document.querySelectorAll(selectors[s]);
      for (var i = 0; i < found.length; i++) targets.push(found[i]);
    }

    for (var t = 0; t < targets.length; t++) targets[t].classList.add('anim-init');

    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) {
          entries[e].target.classList.add('anim-in');
          io.unobserve(entries[e].target);
        }
      }
    }, { rootMargin: '0px 0px -20px 0px', threshold: 0.05 });

    for (var o = 0; o < targets.length; o++) io.observe(targets[o]);
  }

  /* ---- Stagger children when a grid or list enters the viewport ---- */
  var staggerTargets = document.querySelectorAll('.quick-tiles, .resources-grid, .team-grid, .stats-grid');
  if (staggerTargets.length && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (entries[e].isIntersecting) {
          entries[e].target.classList.add('stagger-in');
          io2.unobserve(entries[e].target);
        }
      }
    }, { rootMargin: '0px 0px -20px 0px', threshold: 0.05 });

    for (var st = 0; st < staggerTargets.length; st++) {
      staggerTargets[st].classList.add('stagger-init');
      io2.observe(staggerTargets[st]);
    }
  }
}