// Capture the current Stats tab (This text, Overall) for each text in dark and light,
// and record the numbers the app shows. Output: shots/baseline-*.png, data/app-numbers.json
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const PROFILE = '/home/user/tinta-blind-work/profile-sam';
const SHOTS = '/home/user/tinta-blind-work/shots';
const DATA = '/home/user/tinta-blind-work/data';
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(DATA, { recursive: true });

const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await ctx.clock.setFixedTime(new Date('2026-10-13T18:40:00Z'));
const page = ctx.pages()[0] ?? await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

async function setTheme(theme) {
  const cur = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
  if (cur !== theme) {
    await page.click(theme === 'light' ? 'button[aria-label="Switch to light mode"]' : 'button[aria-label="Switch to dark mode"]');
    await page.waitForTimeout(400);
  }
}
async function openText(title) {
  await page.click('button.titlebtn');
  await page.waitForTimeout(400);
  await page.locator(`.titlemenu [role=option][aria-label^="${title} ·"]`).click();
  await page.waitForTimeout(1200);
}
const out = {};
const titles = ['La tortuga gigante', 'Don Quijote, capítulo 1', 'La cena a las diez', 'La ofrenda', 'Un mate en la oficina'];
for (const title of titles) {
  await openText(title).catch(e => console.log('open failed', title, e.message));
  await page.click('button.sidetab:has-text("Stats")');
  await page.click('button.scopetab:has-text("This text")');
  await page.waitForTimeout(500);
  const textStats = await page.locator('.side').innerText();
  await page.click('button.scopetab:has-text("Overall")');
  await page.waitForTimeout(500);
  const overall = await page.locator('.side').innerText();
  out[title] = { textStats, overall };
  console.log(`== ${title}\n${textStats.replace(/\n+/g, ' | ')}`);
}
console.log(`== overall\n${out['La tortuga gigante'].overall.replace(/\n+/g, ' | ')}`);
fs.writeFileSync(`${DATA}/app-numbers.json`, JSON.stringify(out, null, 1));

// Baseline screenshots on the main text.
await openText('La tortuga gigante');
for (const theme of ['dark', 'light']) {
  await setTheme(theme);
  await page.click('button.sidetab:has-text("Stats")');
  await page.click('button.scopetab:has-text("This text")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/baseline-text-${theme}.png` });
  await page.click('button.scopetab:has-text("Overall")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/baseline-overall-${theme}.png` });
}
await setTheme('dark');
await ctx.close();
