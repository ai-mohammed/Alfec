import { expect, test } from '@playwright/test';

// Contract: Site Navigation & Language (unspa feature 63df9922), as redesigned.

const pages = ['/', '/entreprise/', '/metiers/', '/metiers/electricite-regulation/', '/realisations/', '/contact/', '/en/', '/en/company/', '/en/projects/', '/en/contact/'];

test('desktop header reaches every section and marks the current one', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Navigation principale' }).first();
  await nav.getByRole('link', { name: 'Métiers' }).click();
  await expect(page).toHaveURL(/\/metiers\/$/);
  await expect(nav.getByRole('link', { name: 'Métiers' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'Réalisations' }).click();
  await expect(page).toHaveURL(/\/realisations\/$/);
  await page.getByRole('link', { name: 'Parler de votre projet' }).first().click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await page.getByRole('link', { name: 'ALFEC, retour à l’accueil' }).first().click();
  await expect(page).toHaveURL(/\/$/);
});

test('the home trade panels open each trade page', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('#metiers .panel a');
  await expect(links).toHaveCount(6);
  await links.nth(2).click();
  await expect(page).toHaveURL(/\/metiers\/desenfumage\/$/);
  await expect(page.locator('h1')).toContainText('Désenfumage');
});

test('hovering or focusing a trade panel opens it', async ({ page }) => {
  await page.goto('/');
  const panel = (k: string) => page.locator(`#metiers .panel[data-k="${k}"]`);
  await expect(panel('climatique')).toHaveClass(/open/);
  await panel('froid').hover();
  await expect(panel('froid')).toHaveClass(/open/);
  await expect(panel('climatique')).not.toHaveClass(/open/);
  await panel('industriel').locator('a').focus();
  await expect(panel('industriel')).toHaveClass(/open/);
});

test('the opening photos can be chosen and the headline is the one ALFEC chose', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText(/À chaque défi technique, la solution adaptée\./);
  const segs = page.locator('[data-hero] .seg');
  await expect(segs).toHaveCount(4);
  await segs.nth(2).click();
  await expect(segs.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-hero] .slide').nth(2)).toHaveClass(/on/);
});

test('trade pages link to their neighbours', async ({ page }) => {
  await page.goto('/metiers/genie-climatique/');
  await page.getByRole('link', { name: /Métier suivant/ }).click();
  await expect(page).toHaveURL(/protection-detection-incendie\/$/);
  await page.getByRole('link', { name: /Métier précédent/ }).click();
  await expect(page).toHaveURL(/genie-climatique\/$/);
});

test('the photo viewer opens, pages through and returns focus', async ({ page }) => {
  await page.goto('/metiers/electricite-regulation/');
  const first = page.locator('.gallery .thumb').first();
  await first.click();
  const viewer = page.locator('dialog[data-viewer]').first();
  await expect(viewer).toBeVisible();
  const count = viewer.locator('[data-count]');
  await expect(count).toHaveText(/^1 sur \d+$/);
  await viewer.getByRole('button', { name: 'Photo suivante' }).click();
  await expect(count).toHaveText(/^2 sur/);
  await page.keyboard.press('ArrowLeft');
  await expect(count).toHaveText(/^1 sur/);
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(first).toBeFocused();
});

test('a gallery photo stays in place after the viewer closes', async ({ page }) => {
  await page.goto('/realisations/');
  const first = page.locator('.gallery .thumb').first();
  await first.click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Fermer' }).click();
  await expect(first.locator('img')).toHaveCount(1);
  expect((await first.boundingBox())?.height ?? 0).toBeGreaterThan(100);
});

test('the contact map loads only on request', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.locator('.map iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Afficher la carte' }).click();
  await expect(page.locator('.map iframe')).toHaveAttribute('src', /openstreetmap\.org\/export\/embed/);
});

test('social links open in a new tab safely', async ({ page }) => {
  await page.goto('/');
  for (const name of ['LinkedIn', 'Facebook', 'YouTube']) {
    const link = page.locator('footer').getByRole('link', { name });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('mobile menu is a real button with state, Escape and focus return @mobile', async ({ page }) => {
  await page.goto('/');
  const toggle = page.locator('[data-menu-toggle]');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const drawer = page.locator('#site-menu');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Accueil' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await drawer.getByRole('link', { name: 'Entreprise' }).click();
  await expect(page).toHaveURL(/\/entreprise\/$/);
  await expect(page.locator('#site-menu')).toBeHidden();
});

test('mobile menu opens full height when the page is scrolled @mobile', async ({ page }) => {
  await page.goto('/realisations/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.locator('[data-menu-toggle]').click();
  const drawer = page.locator('#site-menu');
  await expect(drawer.getByRole('link', { name: 'Contact' })).toBeVisible();
  expect((await drawer.boundingBox())?.height ?? 0).toBeGreaterThan(400);
});

test('mobile menu switches language from the drawer @mobile', async ({ page }) => {
  await page.goto('/realisations/');
  await page.locator('[data-menu-toggle]').click();
  await page.locator('#site-menu').getByRole('link', { name: 'Read this page in English' }).click();
  await expect(page).toHaveURL(/\/en\/projects\/$/);
});

for (const width of [1440, 1280, 1024, 768, 390]) {
  test(`no horizontal overflow at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const path of pages) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
    await context.close();
  });
}

test('touch targets in the header and footer are at least 44px @mobile', async ({ page }) => {
  await page.goto('/');
  const small = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('header a, header button, .enquiry a.btn, footer .lang')]
      .filter((el) => el.offsetParent !== null)
      .map((el) => ({ text: el.textContent?.trim(), h: el.getBoundingClientRect().height }))
      .filter((r) => r.h < 44),
  );
  expect(small).toEqual([]);
});
