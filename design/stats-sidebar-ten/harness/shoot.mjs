// Put a design into the running app's Stats tab and photograph it in the app's
// light and dark themes: the whole window and the sidebar alone.
//
//   node harness/shoot.mjs beck rams          -> out/beck-light.png, out/beck-light-panel.png, ...
//   CARD=1 node harness/shoot.mjs beck         also with the word card for "monte" open (-card)
//   THEMES=light node harness/shoot.mjs beck   one theme only
//
// Needs the site served from the repository root on port 4273:
//   npx serve -l 4273 -s .
// Each run starts a fresh browser, loads the simulated reader from
// ../stats-sidebar-blind/data/state-sam.json and opens La tortuga gigante.
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildData } from './data.mjs';

const PW = process.env.PW ?? '/opt/node22/lib/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);
const HERE = fileURLToPath(new URL('.', import.meta.url));
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = process.env.OUT ?? `${ROOT}out/`;
const URL_ = process.env.APP ?? 'http://localhost:4273/';
const THEMES = (process.env.THEMES ?? 'light,dark').split(',');
fs.mkdirSync(OUT, { recursive: true });

const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: node harness/shoot.mjs <design-id> ...'); process.exit(1); }
const D = buildData('tortuga');
const state = fs.readFileSync(`${ROOT}../stats-sidebar-blind/data/state-sam.json`, 'utf8');
const base = fs.readFileSync(`${HERE}base.css`, 'utf8');
const b64 = (p) => fs.readFileSync(p).toString('base64');
const fontFace = (f) => `@font-face { font-family: "${f.family}"; font-style: ${f.style ?? 'normal'}; font-weight: ${f.weight ?? '400'}; font-display: block; src: url(data:font/woff2;base64,${b64(`${ROOT}fonts/${f.file}`)}) format("woff2"); }`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await ctx.clock.setFixedTime(new Date('2026-10-13T18:45:00Z'));
const page = await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
page.on('pageerror', e => console.log('page error:', e.message));

// Load the reader, then open the text with no word selected and the Stats tab showing.
await page.goto(URL_, { waitUntil: 'networkidle' });
await page.evaluate(async (state) => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('ita'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  await new Promise((res, rej) => { const tx = db.transaction('state', 'readwrite'); tx.objectStore('state').put(state, 'ita_v2_state'); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  db.close();
}, state);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('button.titlebtn');
await page.waitForTimeout(800);
if (!(await page.locator('button.titlebtn').innerText()).includes(D.title)) {
  await page.click('button.titlebtn');
  await page.waitForTimeout(300);
  await page.locator(`.titlemenu [role=option][aria-label^="${D.title} ·"]`).click();
  await page.waitForTimeout(1200);
}
const gotIt = page.locator('button:has-text("Got it")');
if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(200); }
await page.keyboard.press('Escape');
await page.click('button.sidetab:has-text("Stats")');
await page.waitForTimeout(300);

async function setTheme(theme) {
  const cur = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark');
  if (cur !== theme) {
    await page.click(theme === 'light' ? 'button[aria-label="Switch to light mode"]' : 'button[aria-label="Switch to dark mode"]');
    await page.waitForTimeout(400);
  }
}

for (const id of ids) {
  const mod = await import(pathToFileURL(`${ROOT}designs/${id}.mjs`).href + `?t=${Date.now()}`);
  const css = (mod.fonts ?? []).map(fontFace).join('\n') + '\n' + base + '\n' + (mod.css ?? '');
  const html = mod.html(D);
  await page.evaluate(({ css, html }) => {
    document.getElementById('mock-style')?.remove();
    const st = document.createElement('style'); st.id = 'mock-style'; st.textContent = css; document.head.appendChild(st);
    const side = document.querySelector('.side');
    let mp = document.getElementById('mock-panel');
    if (!mp) { mp = document.createElement('div'); mp.id = 'mock-panel'; side.appendChild(mp); }
    mp.innerHTML = html;
    side.classList.add('mocking');
  }, { css, html });
  await page.evaluate(() => document.fonts.ready);
  const variants = process.env.CARD ? ['', '-card'] : [''];
  for (const v of variants) {
    if (v === '-card') { await page.locator('.reader .w', { hasText: 'monte' }).first().click(); await page.waitForTimeout(500); }
    for (const theme of THEMES) {
      await setTheme(theme);
      await page.waitForTimeout(250);
      await page.screenshot({ path: `${OUT}${id}${v}-${theme}.png` });
      await page.locator('.side').screenshot({ path: `${OUT}${id}${v}-${theme}-panel.png` });
      const m = await page.evaluate(() => {
        const mp = document.getElementById('mock-panel');
        const wide = [...mp.querySelectorAll('*')].filter(el => el.getBoundingClientRect().right > mp.getBoundingClientRect().right + 0.5).map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '')).slice(0, 5);
        const kids = [...mp.children].map(el => el.getBoundingClientRect());
        const used = kids.length ? Math.max(...kids.map(r => r.bottom)) - mp.getBoundingClientRect().top : 0;
        return { w: mp.clientWidth, h: mp.clientHeight, used: Math.round(used), scrolls: mp.scrollHeight > mp.clientHeight + 1, wide };
      });
      console.log(`${id}${v} ${theme}: panel ${m.w}×${m.h}px, design ${m.used}px tall${m.scrolls ? ' (SCROLLS)' : ''}${m.wide.length ? `, past the right edge: ${m.wide.join(', ')}` : ''}`);
    }
    if (v === '-card') { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
  }
}
await browser.close();
