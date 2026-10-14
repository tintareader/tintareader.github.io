// First look at the app: load, screenshot, dump visible text and buttons.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const OUT = '/home/user/tinta-blind-work/explore';
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
page.on('requestfailed', r => console.log('request failed:', r.url(), r.failure()?.errorText));
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/01-first-load.png` });
const text = await page.evaluate(() => document.body.innerText);
console.log('--- body text ---\n', text.slice(0, 3000));
const buttons = await page.$$eval('button, a, [role=tab]', els => els.map(e => `${e.tagName} ${e.className} | ${(e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 60)}`));
console.log('--- buttons ---\n', buttons.join('\n'));
await browser.close();
