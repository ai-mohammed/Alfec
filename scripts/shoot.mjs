// Screenshot helper: node scripts/shoot.mjs <outDir> <path> [widths...]
import { chromium } from '@playwright/test';
const [outDir, path = '/', ...ws] = process.argv.slice(2);
const widths = ws.length ? ws.map(Number) : [1440, 390];
const base = process.env.BASE_URL || 'http://127.0.0.1:4321';
const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 768 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(400);
  const slug = path.replace(/\//g, '_') || '_';
  await page.screenshot({ path: `${outDir}/${slug}-${w}-fold.png` });
  await page.screenshot({ path: `${outDir}/${slug}-${w}-full.png`, fullPage: true });
  const m = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth, h: document.documentElement.scrollHeight }));
  console.log(w, path, JSON.stringify(m), errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no console errors');
  await ctx.close();
}
await browser.close();
