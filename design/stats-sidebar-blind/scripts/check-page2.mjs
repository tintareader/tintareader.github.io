import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
for (const [name, opts] of [['desk', { viewport: { width: 1280, height: 900 } }], ['tablet', { viewport: { width: 820, height: 1000 } }], ['phone', { viewport: { width: 390, height: 844 } }]]) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(e.message));
  await page.goto('file:///home/user/tinta-blind-work/review/check/wrapped.html', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth, imgs: document.images.length, broken: [...document.images].filter(i => i.complete && !i.naturalWidth && i.src).length }));
  // lightbox works
  await page.locator('img[data-zoom]').first().click();
  const open = await page.evaluate(() => !document.getElementById('lb').hidden);
  await page.keyboard.press('Escape');
  const closed = await page.evaluate(() => document.getElementById('lb').hidden);
  console.log(name, JSON.stringify(r), 'lightbox open/close', open, closed, errs.length ? errs : 'no errors');
  await ctx.close();
}
await browser.close();
