// Scroll reveals and number counters. Content is visible without this script: Base.astro adds the
// .js class inline and removes it again if this module never marks the page with .motion.

const root = document.documentElement;
root.classList.add('motion');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const reveals = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduce || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
  );
  reveals.forEach((el) => io.observe(el));
}

// <span data-count="22">22</span> counts up from zero the first time it is seen.
if (!reduce && 'IntersectionObserver' in window) {
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    if (!end) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        el.textContent = '0';
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
  });
}
