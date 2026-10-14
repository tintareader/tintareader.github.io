// Inject each sidebar design into the running app (Stats tab) and screenshot it
// in the app's dark and light themes. Usage: node shoot.mjs [design ...]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import { buildData, designs } from '/home/user/tinta-blind-work/mock/render.mjs';

const PROFILE = '/home/user/tinta-blind-work/profile-sam';
const SHOTS = '/home/user/tinta-blind-work/shots';
fs.mkdirSync(SHOTS, { recursive: true });
const want = process.argv.slice(2);
const list = want.length ? want : ['baseline', ...Object.keys(designs)];
const slug = process.env.TEXT ?? 'tortuga';
const D = buildData(slug);

const b64 = (p) => fs.readFileSync(p).toString('base64');
const fontCss = `
@font-face { font-family: "Mock Jost"; font-weight: 300 700; src: url(data:font/woff2;base64,${b64('/home/user/tinta-blind-work/fonts/Jost-latin.woff2')}) format("woff2"); }
@font-face { font-family: "Mock Fraunces"; font-style: italic; font-weight: 300 500; src: url(data:font/woff2;base64,${b64('/home/user/tinta-blind-work/fonts/Fraunces-latin.woff2')}) format("woff2"); }
@font-face { font-family: "DM Sans"; font-weight: 400 700; src: url("/assets/pro-dm-sans-aa530716b0.woff2") format("woff2"); }
.side.mocking .sidescroll { display: none !important; }
`;
const css = fs.readFileSync('/home/user/tinta-blind-work/mock/panels.css', 'utf8');

const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await ctx.clock.setFixedTime(new Date('2026-10-13T18:45:00Z'));
const page = ctx.pages()[0] ?? await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

async function setTheme(theme) {
  const cur = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
  if (cur !== theme) {
    await page.click(theme === 'light' ? 'button[aria-label="Switch to light mode"]' : 'button[aria-label="Switch to dark mode"]');
    await page.waitForTimeout(500);
  }
}
async function openText(title) {
  const cur = await page.locator('button.titlebtn').innerText();
  if (cur.includes(title)) return;
  await page.click('button.titlebtn');
  await page.waitForTimeout(300);
  await page.locator(`.titlemenu [role=option][aria-label^="${title} ·"]`).click();
  await page.waitForTimeout(1200);
}
await openText(D.title);
// No word selected, text scrolled to the top, Stats tab open.
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
const closeCard = page.locator('.side button[aria-label="Close"], .side button[title="Close"]');
if (await closeCard.count()) { await closeCard.first().click(); await page.waitForTimeout(200); }
await page.click('button.sidetab:has-text("Stats")');
await page.waitForTimeout(300);
await page.evaluate(() => { for (const el of document.querySelectorAll('.reader, .reader *')) if (el.scrollTop) el.scrollTop = 0; window.scrollTo(0, 0); });
await page.addStyleTag({ content: fontCss + css });
await page.evaluate(() => document.fonts.ready);

for (let name of list) {
  const withCard = name.endsWith('+card');
  if (withCard) name = name.replace('+card', '');
  if (name === 'baseline' || name === 'baseline-overall') {
    await page.evaluate(() => { document.querySelector('.side')?.classList.remove('mocking'); document.getElementById('mock-panel')?.remove(); });
    await page.click(name === 'baseline' ? 'button.scopetab:has-text("This text")' : 'button.scopetab:has-text("Overall")');
  } else {
    const html = designs[name](D);
    await page.evaluate((html) => {
      const side = document.querySelector('.side');
      let mp = document.getElementById('mock-panel');
      if (!mp) { mp = document.createElement('div'); mp.id = 'mock-panel'; side.appendChild(mp); }
      mp.innerHTML = html;
      side.classList.add('mocking');
    }, html);
  }
  await page.evaluate(() => document.fonts.ready);
  if (withCard) {
    await page.locator('.reader .w', { hasText: process.env.CARD_WORD ?? 'monte' }).first().click();
    await page.waitForTimeout(500);
  }
  for (const theme of ['dark', 'light']) {
    await setTheme(theme);
    await page.waitForTimeout(350);
    const tag = (slug === 'tortuga' ? '' : `-${slug}`) + (withCard ? '-card' : '');
    await page.screenshot({ path: `${SHOTS}/${name}${tag}-${theme}.png` });
    await page.locator('.side').screenshot({ path: `${SHOTS}/${name}${tag}-${theme}-panel.png` });
    const over = await page.evaluate(() => { const mp = document.getElementById('mock-panel'); return mp ? { scrollH: mp.scrollHeight, clientH: mp.clientHeight } : null; });
    console.log(name, theme, over ? `panel content ${over.scrollH}px in ${over.clientH}px` : '');
  }
  if (withCard) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
}
await setTheme('dark');
await ctx.close();
