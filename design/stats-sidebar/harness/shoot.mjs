// Inject each design into the running app's Stats tab and photograph it, light and dark,
// with the word card closed and open.
import { openApp, statsTab } from './app.mjs';
import { derive } from './derive.mjs';
import { designs } from './designs.mjs';
import fs from 'node:fs';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const themes = process.argv[3] ? process.argv[3].split(',') : ['dark', 'light'];
const states = process.argv[4] ? process.argv[4].split(',') : ['closed', 'card'];
const D = derive();
const CLS = { few: 'mk-few', tufte: 'mk-tufte', felton: 'mk-felton', isotype: 'mk-iso', posavec: 'mk-posa', zhuo: 'mk-zhuo' };
fs.mkdirSync('out', { recursive: true });
async function inject(page, d) {
  await page.evaluate(({ css, html, cls }) => {
    document.querySelectorAll('.mk-style, .mk').forEach(e => e.remove());
    const sc = document.querySelector('.side .sidescroll');
    sc.style.display = 'none';
    const st = document.createElement('style'); st.className = 'mk-style'; st.textContent = css; document.head.appendChild(st);
    const box = document.createElement('div'); box.className = 'sidescroll mk ' + cls; box.innerHTML = html;
    sc.after(box);
  }, { css: d.css, html: d.html(D), cls: CLS[d.id] });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(250);
}
for (const theme of themes) {
  const { browser, page } = await openApp({ theme, state: 'state-reading.json', scale: 2 });
  const gotIt = page.getByRole('button', { name: 'Got it' });
  if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(300); }
  await statsTab(page, 'text');
  for (const st of states) {
    if (st === 'card') { await page.locator('.page .w', { hasText: /^olía$/ }).click(); await page.waitForTimeout(500); }
    else { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
    await page.evaluate(() => document.activeElement?.blur());
    await page.mouse.move(5, 895);
    for (const d of designs.filter(d => !only || only.includes(d.id))) {
      await inject(page, d);
      const base = `out/${d.id}-${theme}-${st}`;
      await page.screenshot({ path: base + '.png' });
      if (st === 'closed') await page.locator('.side').screenshot({ path: base + '-side.png' });
      const h = await page.evaluate(() => { const m = document.querySelector('.mk'); return [m.scrollHeight, m.clientHeight]; });
      console.log(d.id, theme, st, 'content/visible height', h.join('/'));
    }
    await page.evaluate(() => { document.querySelectorAll('.mk-style, .mk').forEach(e => e.remove()); const sc = document.querySelector('.side .sidescroll'); if (sc) sc.style.display = ''; });
  }
  await browser.close();
}
