// Screenshots of a piste: node scripts/pistes-shoot.mjs <piste> <outDir> [widths...]
import { chromium } from '@playwright/test';
const [piste, outDir, ...ws] = process.argv.slice(2);
const widths = ws.length ? ws.map(Number) : [1440, 390];
const base = process.env.BASE_URL || 'http://127.0.0.1:8090';
const browser = await chromium.launch();
for (const w of widths) {
  const mobile = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${base}/${piste}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/${piste}-${w}-fold.png` });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
  await page.waitForTimeout(1600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth, h: document.documentElement.scrollHeight }));
  await page.screenshot({ path: `${outDir}/${piste}-${w}-full.png`, fullPage: true });
  console.log(piste, w, JSON.stringify(m), errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no console errors');
  await ctx.close();
}
await browser.close();
