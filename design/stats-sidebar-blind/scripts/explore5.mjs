// Open the word actions menu, the settings, and the text chooser.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const OUT = '/home/user/tinta-blind-work/explore';
const PROFILE = '/home/user/tinta-blind-work/profile-explore';
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
const page = ctx.pages()[0] ?? await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const dump = async (name, sel) => {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  const text = await page.evaluate((s) => (s ? document.querySelector(s) : document.body)?.innerText ?? '(none)', sel);
  console.log(`=== ${name} ===\n${text.slice(0, 4000)}`);
};
await page.click('button.sidetab:has-text("Words")');
await page.click('button.wmenubtn');
await page.waitForTimeout(500);
await dump('08-word-menu');
const items = await page.$$eval('[role=menu] *, .menu button, .wmenu button', els => els.map(e => `${e.tagName}.${e.className} | ${e.innerText?.trim().replace(/\s+/g, ' ')}`));
console.log(items.join('\n'));
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
// settings
await page.click('button[aria-label="Settings"], button[title="Settings"]').catch(async () => {
  const btns = await page.$$eval('.toolbar button, header button', els => els.map(e => `${e.className} | ${e.getAttribute('aria-label')} | ${e.title}`));
  console.log('toolbar buttons:', btns.join('\n'));
});
await page.waitForTimeout(800);
await dump('09-settings');
await ctx.close();
