import { alternatesFor, SITE } from './routes.mjs';

/**
 * hreflang links for one sitemap entry. French and English pages use different slugs,
 * so the pairing comes from the route table rather than from a shared path prefix.
 * @param {string} url absolute page URL
 */
export function sitemapAlternates(url) {
  const alt = alternatesFor(new URL(url).pathname);
  if (!alt) return [];
  return [
    { lang: 'fr', url: SITE + alt.fr },
    { lang: 'en', url: SITE + alt.en },
    { lang: 'x-default', url: SITE + alt.fr },
  ];
}
