// Skip the tour and look at the full reader.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const OUT = '/home/user/tinta-blind-work/explore';
const PROFILE = '/home/user/tinta-blind-work/profile-explore';
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
const page = ctx.pages()[0] ?? await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const dump = async (name) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const text = await page.evaluate(() => document.body.innerText);
  console.log(`=== ${name} ===\n${text.slice(0, 2500)}`);
  const buttons = await page.$$eval('button, a, [role=tab], input, select', els => els.filter(e => e.offsetParent !== null).map(e => `${e.tagName} .${e.className} | ${(e.innerText || e.getAttribute('aria-label') || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 70)}`));
  console.log('--- controls ---\n' + buttons.join('\n'));
};
await dump('04-reload');
const skip = page.locator('text=Skip the tour');
if (await skip.count()) { await skip.first().click(); await page.waitForTimeout(1500); }
await dump('05-after-skip');
await ctx.close();
