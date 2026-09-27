import { expect, test } from '@playwright/test';

// The three URLs indexed from the previous site must keep resolving (contract B01–B03, B05).
const noFollow = { maxRedirects: 0 };

test('root serves the French home', async ({ request }) => {
  const res = await request.get('/', noFollow);
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain('<html lang="fr"');
});

test('/index.php?lg=en redirects permanently to /en/', async ({ request }) => {
  const res = await request.get('/index.php?lg=en', noFollow);
  expect(res.status()).toBe(301);
  expect(res.headers().location).toBe('/en/');
});

test('/index.php?lg=fr and /index.php redirect permanently to /', async ({ request }) => {
  for (const url of ['/index.php?lg=fr', '/index.php', '/index.php?lg=contact']) {
    const res = await request.get(url, noFollow);
    expect(res.status(), url).toBe(301);
    expect(res.headers().location).toBe('/');
  }
});

test('old confirmation URLs lead to the new confirmation pages', async ({ request }) => {
  const fr = await request.get('/index.php?msg=success', noFollow);
  expect(fr.status()).toBe(303);
  expect(fr.headers().location).toBe('/contact/merci/');
  const en = await request.get('/index.php?msg=success_en&lg=en', noFollow);
  expect(en.headers().location).toBe('/en/contact/thank-you/');
  const other = await request.get('/index.php?msg=error', noFollow);
  expect(other.headers().location).toBe('/contact/');
});

test('the confirmation keeps the original wording in each language', async ({ page }) => {
  await page.goto('/contact/merci/');
  await expect(page.locator('h1')).toHaveText('Votre message a bien été envoyé.');
  await expect(page.getByText('Nous vous répondrons dès que possible.')).toBeVisible();
  await page.goto('/en/contact/thank-you/');
  await expect(page.locator('h1')).toHaveText('Your message has been sent.');
  await expect(page.getByText('We will answer you as soon as possible.')).toBeVisible();
});
