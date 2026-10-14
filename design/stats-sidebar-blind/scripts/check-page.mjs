import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const url = 'file:///home/user/tinta-blind-work/review/check/wrapped.html';
const browser = await chromium.launch();
for (const [name, opts] of [['desk-light', { viewport: { width: 1280, height: 900 }, colorScheme: 'light' }], ['desk-dark', { viewport: { width: 1280, height: 900 }, colorScheme: 'dark' }], ['phone-light', { viewport: { width: 390, height: 844 }, colorScheme: 'light', deviceScaleFactor: 2 }]]) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') console.log(name, 'console error:', m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth, h: document.documentElement.scrollHeight, fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((v, i, a) => a.indexOf(v) === i) }));
  console.log(name, JSON.stringify(info));
  await page.screenshot({ path: `/home/user/tinta-blind-work/review/check/${name}.png`, fullPage: true });
  await ctx.close();
}
await browser.close();
