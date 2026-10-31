// Shared behaviour for the three homepage pistes: scroll reveals, counters, map, mobile menu,
// photo rails, demo links and the piste switcher. Each piste styles the hooks itself.
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  if (reduce) root.classList.add('reduce');

  // Scroll reveals: elements start visible without JS; with JS they rise in once.
  function reveal(scope) {
    var els = (scope || document).querySelectorAll('[data-reveal]:not(.in)');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
        e.target.dispatchEvent(new CustomEvent('revealed'));
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Counters: <span data-count="22">22</span> counts up when revealed.
  function counters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseInt(el.getAttribute('data-count'), 10);
      if (reduce || !('IntersectionObserver' in window) || !end) return;
      el.textContent = '0';
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        var t0 = performance.now(), dur = 1400;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  // Map of the 22 wilayas. opts: { lines: bool, labels: bool, hqLabel: string }
  function map(el, opts) {
    var M = window.ALFEC_MAP;
    if (!M || !el) return;
    opts = opts || {};
    var hq = M.points.filter(function (p) { return p.hq; })[0];
    var s = '<svg viewBox="-20 -30 ' + (M.w + 40) + ' ' + (M.h + 50) + '" role="img" aria-label="Carte de l’Algérie montrant les 22 wilayas d’intervention d’ALFEC, dont le siège à Oran">';
    s += '<path class="map-outline" d="' + M.outline + '"/>';
    if (opts.lines) {
      M.points.forEach(function (p, i) {
        if (p.hq) return;
        var mx = (hq.x + p.x) / 2, my = Math.min(hq.y, p.y) - 30 - Math.abs(p.x - hq.x) * 0.08;
        s += '<path class="map-line" style="--i:' + i + '" d="M' + hq.x + ' ' + hq.y + 'Q' + mx + ' ' + my + ' ' + p.x + ' ' + p.y + '" pathLength="1"/>';
      });
    }
    M.points.forEach(function (p, i) {
      if (p.hq) return;
      s += '<circle class="map-pt" style="--i:' + i + '" cx="' + p.x + '" cy="' + p.y + '" r="5"><title>' + p.name + '</title></circle>';
    });
    s += '<circle class="map-hq-ring" cx="' + hq.x + '" cy="' + hq.y + '" r="14"/>';
    s += '<circle class="map-hq" cx="' + hq.x + '" cy="' + hq.y + '" r="7"><title>Oran, siège</title></circle>';
    if (opts.hqLabel) s += '<text class="map-label" x="' + (hq.x + 20) + '" y="' + (hq.y - 18) + '">' + opts.hqLabel + '</text>';
    s += '</svg>';
    el.innerHTML = s;
  }

  // Sticky header state
  function header() {
    var h = document.querySelector('[data-header]');
    if (!h) return;
    var on = function () { h.classList.toggle('scrolled', window.scrollY > 24); };
    on();
    window.addEventListener('scroll', on, { passive: true });
  }

  // Mobile menu
  function menu() {
    var btn = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-menu]');
    if (!btn || !panel) return;
    function set(open) {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    btn.addEventListener('click', function () { set(!document.body.classList.contains('menu-open')); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { set(false); btn.focus(); }
    });
  }

  // Horizontal rails with previous / next buttons
  function rails() {
    document.querySelectorAll('[data-rail]').forEach(function (rail) {
      var id = rail.id;
      var prev = document.querySelector('[data-rail-prev="' + id + '"]');
      var next = document.querySelector('[data-rail-next="' + id + '"]');
      function step() {
        var card = rail.firstElementChild;
        var gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
        return card ? card.getBoundingClientRect().width + gap : rail.clientWidth * 0.8;
      }
      function sync() {
        if (prev) prev.disabled = rail.scrollLeft < 4;
        if (next) next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4;
      }
      if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
      if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
      rail.addEventListener('scroll', sync, { passive: true });
      window.addEventListener('resize', sync);
      sync();
    });
  }

  // Links to pages that are not part of the mock-up
  function demoLinks() {
    var toast = document.createElement('div');
    toast.className = 'demo-toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
    var timer;
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href="#"]');
      if (!a) return;
      e.preventDefault();
      toast.textContent = 'Cette page n’est pas maquettée dans cette piste.';
      toast.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    });
  }

  // Piste switcher, for presenting the three pistes side by side
  function switcher() {
    var current = document.body.getAttribute('data-piste');
    if (!current) return;
    var pistes = [['a', 'Chantier'], ['b', 'Signature'], ['c', 'Grands projets']];
    var nav = document.createElement('nav');
    nav.className = 'piste-switch';
    nav.setAttribute('aria-label', 'Pistes graphiques');
    var html = '<a class="ps-home" href="../">Pistes</a>';
    pistes.forEach(function (p) {
      html += '<a href="../' + p[0] + '/"' + (p[0] === current ? ' aria-current="page"' : '') + '><b>' + p[0].toUpperCase() + '</b><span>' + p[1] + '</span></a>';
    });
    nav.innerHTML = html;
    document.body.appendChild(nav);
  }

  window.ALFEC = { reveal: reveal, map: map, reduce: reduce };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-map]').forEach(function (el) {
      map(el, { lines: el.hasAttribute('data-map-lines'), hqLabel: el.getAttribute('data-map-label') || '' });
    });
    header();
    menu();
    rails();
    counters();
    demoLinks();
    switcher();
    reveal();
  });
})();
