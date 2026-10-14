// Look at the Stats tab, the side menu and the settings.
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
  console.log(`=== ${name} ===\n${text.slice(0, 3000)}`);
};
await page.click('button.sidetab:has-text("Stats")');
await page.waitForTimeout(600);
await dump('06-stats-text', '.side');
await page.click('button.scopetab:has-text("Overall")');
await page.waitForTimeout(600);
await dump('07-stats-overall', '.side');
// The side menu
const more = page.locator('.sidehead button[aria-label]');
console.log('sidehead buttons:', await more.evaluateAll(els => els.map(e => e.getAttribute('aria-label'))));
await page.click('button.sidetab:has-text("Words")');
await page.waitForTimeout(400);
const menuBtn = page.locator('.sidehead button', { hasText: '…' });
console.log('menu count', await menuBtn.count());
const allSideBtns = await page.$$eval('.sidehead button', els => els.map(e => `${e.className} | ${e.getAttribute('aria-label')} | ${e.innerText}`));
console.log(allSideBtns.join('\n'));
await ctx.close();
