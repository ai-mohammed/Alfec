// Single source of truth for every localized URL. Plain ESM so astro.config.mjs can import it too.

export const SITE = 'https://alfec.net';
/** @type {readonly ['fr', 'en']} */
export const LOCALES = ['fr', 'en'];
export const DEFAULT_LOCALE = 'fr';

/** Stable trade keys, in the order ALFEC lists its trades (01 to 06). */
export const TRADE_KEYS = /** @type {const} */ (['climatique', 'incendie', 'desenfumage', 'electricite', 'froid', 'industriel']);

export const TRADE_SLUGS = {
  climatique: { fr: 'genie-climatique', en: 'hvac' },
  incendie: { fr: 'protection-detection-incendie', en: 'fire-protection-detection' },
  desenfumage: { fr: 'desenfumage', en: 'smoke-control' },
  electricite: { fr: 'electricite-regulation', en: 'electrical-controls' },
  froid: { fr: 'froid-industriel', en: 'industrial-refrigeration' },
  industriel: { fr: 'genie-industriel', en: 'industrial-engineering' },
};

export const PAGES = {
  home: { fr: '/', en: '/en/' },
  company: { fr: '/entreprise/', en: '/en/company/' },
  trades: { fr: '/metiers/', en: '/en/expertise/' },
  projects: { fr: '/realisations/', en: '/en/projects/' },
  contact: { fr: '/contact/', en: '/en/contact/' },
  thanks: { fr: '/contact/merci/', en: '/en/contact/thank-you/' },
  sendError: { fr: '/contact/erreur/', en: '/en/contact/error/' },
};

/**
 * @param {keyof typeof PAGES} page
 * @param {'fr' | 'en'} lang
 */
export function pagePath(page, lang) {
  return PAGES[page][lang];
}

/**
 * @param {keyof typeof TRADE_SLUGS} trade
 * @param {'fr' | 'en'} lang
 */
export function tradePath(trade, lang) {
  return `${PAGES.trades[lang]}${TRADE_SLUGS[trade][lang]}/`;
}

/** Every localized page as a [fr, en] path pair. */
export function allPathPairs() {
  const pairs = Object.values(PAGES).map((p) => [p.fr, p.en]);
  for (const key of TRADE_KEYS) pairs.push([tradePath(key, 'fr'), tradePath(key, 'en')]);
  return pairs;
}

/**
 * The same page in both languages, or null when the path is not a localized page (e.g. the 404).
 * @param {string} pathname
 * @returns {{ fr: string, en: string } | null}
 */
export function alternatesFor(pathname) {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const pair = allPathPairs().find(([fr, en]) => fr === path || en === path);
  return pair ? { fr: pair[0], en: pair[1] } : null;
}
