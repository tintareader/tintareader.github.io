// Pull every number the mockups use out of the running app, so nothing is invented.
import { openApp, statsTab, readState } from './app.mjs';
import fs from 'node:fs';
const { browser, page } = await openApp({ theme: 'dark', state: 'state-reading.json', scale: 1 });
const data = { text: {}, overall: {} };
// Words tab: every root in this text with status, gloss, band
await page.locator('.sidetab', { hasText: 'Words' }).click();
await page.waitForTimeout(500);
data.text.roots = await page.evaluate(() => [...document.querySelectorAll('.wlist li.wrow')].map(li => {
  const bg = li.querySelector('.stdot')?.getAttribute('style') || '';
  const st = /c-known/.test(bg) ? 'k' : /c-learning/.test(bg) ? 'l' : /c-unknown/.test(bg) ? 'u' : /c-ignored/.test(bg) ? 'i' : /c-derived/.test(bg) ? 'd' : '?';
  const ticks = li.querySelectorAll('.bandticks i.f').length;
  const hasTicks = !!li.querySelector('.bandticks');
  return { root: li.querySelector('.wbtn span')?.textContent, st, gloss: li.querySelector('.wgloss')?.textContent || '', level: hasTicks ? 6 - ticks : 0 };
}));
// Reader: running words in order, with sentence and paragraph breaks
data.text.seq = await page.evaluate(() => {
  const out = []; let sent = 0, para = 0;
  for (const n of document.querySelector('.page').childNodes) {
    const el = n.nodeType === 1 ? n : null;
    const t = n.textContent || '';
    if (el && el.classList.contains('w')) {
      const st = ([...el.classList].find(x => /^w-[a-z]$/.test(x)) || 'w-?').slice(2);
      out.push({ w: t, st, s: sent, p: para, seg: +el.dataset.seg });
    } else {
      if (/\n\s*\n/.test(t)) { para++; sent++; }
      else if (/[.!?…]/.test(t) && out.length && out[out.length - 1].s === sent) sent++;
    }
  }
  return out;
});
data.text.title = await page.evaluate(() => document.querySelector('.page')?.getAttribute('aria-label'));
// Stats: This text
await statsTab(page, 'text');
data.text.headline = await page.locator('.headfig').innerText();
data.text.bars = await page.evaluate(() => [...document.querySelectorAll('.statbar')].map(sb => ({
  label: sb.querySelector('.srow .lab').textContent, total: sb.querySelector('.srow .val').textContent,
  parts: [...sb.querySelectorAll('.stackkey > span')].map(s => s.textContent.trim()) })));
data.text.bands = await page.evaluate(() => [...document.querySelectorAll('.srow.bars')].map(r => ({ label: r.querySelector('.lab').textContent, pct: r.querySelector('.val').textContent })));
// Stats: Overall
await statsTab(page, 'all');
data.overall.rows = await page.evaluate(() => [...document.querySelectorAll('.sidescroll .srow')].map(r => [r.querySelector('.lab')?.textContent, r.querySelector('.val')?.textContent]));
data.overall.coverage = await page.evaluate(() => [...document.querySelectorAll('.bandrow')].map(r => ({
  label: r.querySelector('.lab').textContent, val: r.querySelector('.val').textContent,
  l: parseFloat(r.querySelector('.bandfill.l').style.width), k: parseFloat(r.querySelector('.bandfill.k').style.width) })));
const st = await readState(page);
data.overall.history = st.byLang.es.history;
data.text.openedPct = 89; // measured: the headline when La ofrenda was opened, before this session's marks
fs.writeFileSync('data.json', JSON.stringify(data, null, 1));
const c = data.text.seq.reduce((m, x) => (m[x.st] = (m[x.st] || 0) + 1, m), {});
console.log('running', data.text.seq.length, c, 'sentences', new Set(data.text.seq.map(x => x.s)).size, 'paras', new Set(data.text.seq.map(x => x.p)).size);
console.log('roots', data.text.roots.length, data.text.roots.filter(r => r.st !== 'k').map(r => `${r.st}:${r.root}(${r.level})=${r.gloss}`).join(' | '));
console.log(JSON.stringify(data.text.bars), JSON.stringify(data.text.bands));
console.log(JSON.stringify(data.overall.rows), JSON.stringify(data.overall.coverage));
await browser.close();
