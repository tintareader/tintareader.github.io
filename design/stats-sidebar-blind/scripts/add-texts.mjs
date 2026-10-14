// Paste the test texts into the app as a reader would (New text > paste > Save & analyse).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const PROFILE = '/home/user/tinta-blind-work/profile-sam';
const SHOTS = '/home/user/tinta-blind-work/explore/sim';
const texts = [
  { title: 'La tortuga gigante', file: '/home/user/tinta-blind-work/texts/quiroga-tortuga.txt' },
  { title: 'Don Quijote, capítulo 1', file: '/home/user/tinta-blind-work/texts/quijote-cap1.txt' },
];
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
await ctx.clock.setFixedTime(new Date('2026-10-13T18:30:00Z'));
const page = ctx.pages()[0] ?? await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
for (const t of texts) {
  await page.click('button:has-text("New text")');
  await page.waitForTimeout(700);
  const fields = await page.$$eval('textarea, input[type=text], input:not([type]), [contenteditable=true]', els => els.map(e => `${e.tagName}.${e.className} placeholder=${e.getAttribute('placeholder')}`));
  console.log(fields.join('\n'));
  const title = page.locator('input[placeholder^="Title"]');
  if (await title.count()) await title.fill(t.title);
  const area = page.locator('textarea').last();
  await area.fill(fs.readFileSync(t.file, 'utf8').trim());
  await page.waitForTimeout(300);
  await page.click('button:has-text("Save & analyse")');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/added-${t.title.replace(/\W+/g, '-')}.png` });
}
await page.waitForTimeout(1000);
await ctx.close();
