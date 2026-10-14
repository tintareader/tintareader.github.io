// Explore: New text flow, text chooser, theme toggle (light), Words tab columns.
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
  console.log(`=== ${name} ===\n${text.slice(0, 2000)}`);
};
// toolbar buttons
const tb = await page.$$eval('button', els => els.filter(e => e.offsetParent && e.getBoundingClientRect().top < 44).map(e => `${e.className} | aria=${e.getAttribute('aria-label')} | title=${e.title} | ${e.innerText.trim()}`));
console.log(tb.join('\n'));
// theme toggle
const theme = page.locator('button[aria-label*="theme" i], button[title*="theme" i], button[aria-label*="light" i], button[aria-label*="dark" i]');
console.log('theme buttons:', await theme.count());
if (await theme.count()) { await theme.first().click(); await page.waitForTimeout(600); }
await dump('10-light', null);
console.log('ita-theme now:', await page.evaluate(() => localStorage.getItem('ita-theme')), 'html attrs:', await page.evaluate(() => [...document.documentElement.attributes].map(a => `${a.name}=${a.value}`).join(' ')));
// Choose text dropdown
await page.click('button:has-text("Un café, por favor")').catch(e => console.log('no title button', e.message));
await page.waitForTimeout(600);
await dump('11-choose-text', null);
await page.keyboard.press('Escape');
// New text
await page.click('button:has-text("New text")');
await page.waitForTimeout(800);
await dump('12-new-text', null);
await page.keyboard.press('Escape');
await ctx.close();
