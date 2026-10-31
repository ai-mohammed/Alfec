// Scroll reveals. Content is visible without this script: Base.astro adds the
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
