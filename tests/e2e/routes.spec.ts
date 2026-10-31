import { expect, test } from '@playwright/test';

// Every localized page, its language, its counterpart and its SEO head.
const pairs: [string, string][] = [
  ['/', '/en/'],
  ['/entreprise/', '/en/company/'],
  ['/metiers/', '/en/expertise/'],
  ['/metiers/genie-climatique/', '/en/expertise/hvac/'],
  ['/metiers/protection-detection-incendie/', '/en/expertise/fire-protection-detection/'],
  ['/metiers/desenfumage/', '/en/expertise/smoke-control/'],
  ['/metiers/electricite-regulation/', '/en/expertise/electrical-controls/'],
  ['/metiers/froid-industriel/', '/en/expertise/industrial-refrigeration/'],
  ['/metiers/genie-industriel/', '/en/expertise/industrial-engineering/'],
  ['/realisations/', '/en/projects/'],
  ['/contact/', '/en/contact/'],
];

for (const [fr, en] of pairs) {
  for (const [path, lang, other] of [
    [fr, 'fr', en],
    [en, 'en', fr],
  ] as const) {
    test(`${path} renders in ${lang} with a complete head`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page).toHaveTitle(/ALFEC/);
      expect(await page.locator('h1').count()).toBe(1);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(50);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://alfec.net${path}`);
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang === 'fr' ? 'en' : 'fr'}"]`)).toHaveAttribute(
        'href',
        `https://alfec.net${other}`,
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/alfec\.net\//);
      const images = await page.locator('img').evaluateAll((els) =>
        els.filter((el) => !el.closest('[aria-hidden="true"]') && el.getAttribute('alt') === null).length,
      );
      expect(images, 'every image declares alt text').toBe(0);
      expect(errors, 'no console errors').toEqual([]);
    });
  }
}

test('the language switch leads to the same page in the other language', async ({ page }) => {
  await page.goto('/metiers/desenfumage/');
  await page.locator('header .lang').click();
  await expect(page).toHaveURL(/\/en\/expertise\/smoke-control\/$/);
  await page.locator('header .lang').click();
  await expect(page).toHaveURL(/\/metiers\/desenfumage\/$/);
});

test('structured data is valid JSON describing ALFEC', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(raw ?? '{}');
  expect(data['@type']).toBe('Organization');
  expect(data.address.addressLocality).toContain('Oran');
  expect(data.sameAs).toContain('https://www.linkedin.com/company/alfec/');
});

test('sitemap lists both languages with alternates and excludes status pages', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBeTruthy();
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).toContain('<loc>https://alfec.net/</loc>');
  expect(sitemap).toContain('<loc>https://alfec.net/en/expertise/smoke-control/</loc>');
  expect(sitemap).toContain('hreflang="en" href="https://alfec.net/en/company/"');
  expect(sitemap).not.toContain('merci');
  expect(sitemap).not.toContain('thank-you');
});

test('robots.txt points to the sitemap', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://alfec.net/sitemap-index.xml');
});

test('unknown pages answer 404 with a way back', async ({ page }) => {
  const response = await page.goto('/presentation.php');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /Retour à l’accueil/ })).toBeVisible();
});
