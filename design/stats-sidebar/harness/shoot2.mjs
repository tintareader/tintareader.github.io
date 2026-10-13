// Round 2: inject each panel into the running app, light and dark, word card closed and open.
import { openApp, statsTab } from './app.mjs';
import { load } from './derive2.mjs';
import { designs2 } from './designs2.mjs';
import fs from 'node:fs';
const only = process.argv[2] ? process.argv[2].split(',') : null;
const themes = process.argv[3] ? process.argv[3].split(',') : ['dark', 'light'];
const states = process.argv[4] ? process.argv[4].split(',') : ['closed', 'card'];
const { A, M, S } = load();
const SRC = { A: { state: 'state-reading.json', data: A, select: /^olía$/ }, M: { state: 'state-mate.json', data: M, select: /^mate$/ } };
fs.mkdirSync('out2', { recursive: true });
async function inject(page, d, T) {
  await page.evaluate(({ css, html, cls }) => {
    document.querySelectorAll('.mk-style, .mk').forEach(e => e.remove());
    const sc = document.querySelector('.side .sidescroll');
    sc.style.display = 'none';
    const st = document.createElement('style'); st.className = 'mk-style'; st.textContent = css; document.head.appendChild(st);
    const box = document.createElement('div'); box.className = 'sidescroll mk ' + cls; box.innerHTML = html;
    sc.after(box);
  }, { css: d.css, html: d.html(T, S), cls: d.cls });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.waitForTimeout(250);
}
for (const theme of themes) {
  for (const key of ['A', 'M']) {
    const list = designs2.filter(d => d.data === key && (!only || only.includes(d.id)));
    if (!list.length) continue;
    const { browser, page } = await openApp({ theme, state: SRC[key].state, scale: 2 });
    const gotIt = page.getByRole('button', { name: 'Got it' });
    if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(300); }
    await statsTab(page, 'text');
    for (const st of states) {
      if (st === 'card') { await page.locator('.page .w', { hasText: SRC[key].select }).first().click(); await page.waitForTimeout(500); }
      else { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }
      await page.evaluate(() => document.activeElement?.blur());
      await page.mouse.move(5, 895);
      for (const d of list) {
        await inject(page, d, SRC[key].data);
        await page.screenshot({ path: `out2/${d.id}-${theme}-${st}.png` });
        const h = await page.evaluate(() => { const m = document.querySelector('.mk'); return [m.scrollHeight, m.clientHeight]; });
        console.log(d.id, theme, st, 'content/visible', h.join('/'));
      }
      await page.evaluate(() => { document.querySelectorAll('.mk-style, .mk').forEach(e => e.remove()); const sc = document.querySelector('.side .sidescroll'); if (sc) sc.style.display = ''; });
    }
    await browser.close();
  }
}
