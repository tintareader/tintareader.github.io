import { openApp, statsTab, readState } from './app.mjs';
import fs from 'node:fs';
const { browser, page } = await openApp({ theme: 'dark', scale: 1 });
const gotIt = page.getByRole('button', { name: 'Got it' });
if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(300); }
async function mark(word, key, nth = 0) {
  const el = page.locator('.page .w', { hasText: new RegExp('^' + word + '$') }).nth(nth);
  await el.click();
  await page.waitForTimeout(250);
  await page.keyboard.press(key);
  await page.waitForTimeout(350);
}
await statsTab(page, 'text');
const before = await page.locator('.headfig').innerText();
await mark('Lupe', '4');
await mark('llena', '1');
await mark('velas', '2');
await mark('ofrenda', '2');
await mark('fruta', '1');
await mark('tequila', '1');
await mark('cigarros', '1');
await mark('fumaba', '2');
await mark('Muchísimo', '1');
await mark('olía', '2');
await page.waitForTimeout(800);
const after = await page.locator('.headfig').innerText();
console.log('before', before, 'after', after);
console.log(await page.locator('.sidescroll').innerText());
const seq = await page.evaluate(() => [...document.querySelectorAll('.page .w')].map(e => (([...e.classList].find(x => /^w-[a-z]$/.test(x)) || '?').slice(2)) + ':' + e.textContent));
console.log(seq.filter(x => !x.startsWith('k:')).join('  '));
const st = await readState(page);
fs.writeFileSync('state-reading.json', JSON.stringify(st));
console.log('history tail', JSON.stringify(st.byLang.es.history.slice(-3)));
await page.screenshot({ path: 'out/13-reading.png' });
await statsTab(page, 'all');
console.log('=====');
console.log(await page.locator('.sidescroll').innerText());
await page.screenshot({ path: 'out/14-reading-overall.png' });
await browser.close();
