// Inspect the reading view DOM (word element classes) and the Words tab columns.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const PROFILE = '/home/user/tinta-blind-work/profile-sam';
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
await ctx.clock.setFixedTime(new Date('2026-10-13T18:40:00Z'));
const page = ctx.pages()[0] ?? await ctx.newPage();
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const close = page.locator('.side button[aria-label="Close"], .card button[aria-label="Close"]');
console.log('close buttons', await close.count());
// Reading DOM sample
const sample = await page.evaluate(() => {
  const reader = document.querySelector('.reader, .read, main, .textcol') || document.body;
  const first = [...document.querySelectorAll('p')].find(p => p.innerText.includes('Había una vez'));
  return { readerClass: reader.className, para: first ? first.outerHTML.slice(0, 2500) : null };
});
console.log(JSON.stringify(sample, null, 1));
await ctx.close();
