// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { sitemapAlternates } from './src/i18n/sitemap.mjs';

export default defineConfig({
  site: 'https://alfec.net',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(contact\/(merci|erreur)|en\/contact\/(thank-you|error))\/$/.test(page),
      serialize: (item) => ({ ...item, links: sitemapAlternates(item.url) }),
    }),
  ],
});
