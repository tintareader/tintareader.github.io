// Extract the reading view's word tokens (status per running word, in order, with paragraph breaks)
// for each text, as the app renders them. Output: data/tokens-<slug>.json
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const PROFILE = '/home/user/tinta-blind-work/profile-sam';
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
await ctx.clock.setFixedTime(new Date('2026-10-13T18:40:00Z'));
const page = ctx.pages()[0] ?? await ctx.newPage();
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const titles = { 'La tortuga gigante': 'tortuga', 'Don Quijote, capítulo 1': 'quijote', 'La cena a las diez': 'cena', 'Un mate en la oficina': 'mate', 'La ofrenda': 'ofrenda' };
for (const [title, slug] of Object.entries(titles)) {
  await page.click('button.titlebtn');
  await page.waitForTimeout(300);
  await page.locator(`.titlemenu [role=option][aria-label^="${title} ·"]`).click();
  await page.waitForTimeout(1000);
  const toks = await page.evaluate(() => {
    const pg = document.querySelector('.reader .page');
    const out = [];
    let para = 0;
    const walker = document.createTreeWalker(pg, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const el = n.parentElement;
      const w = el.closest('.w');
      if (w) {
        if (w.dataset.done) continue;
        w.dataset.done = '1';
        const st = [...w.classList].find(c => /^w-/.test(c))?.slice(2);
        out.push({ t: w.innerText, s: st, p: para, phr: w.classList.contains('in-phr') });
      } else if (/\n/.test(n.textContent)) {
        para++;
      }
    }
    pg.querySelectorAll('[data-done]').forEach(e => delete e.dataset.done);
    // block-level paragraphs?
    const blocks = [...pg.children].filter(c => getComputedStyle(c).display === 'block').length;
    return { out, blocks };
  });
  // Paragraph grouping fallback: use the source text's blank lines
  fs.writeFileSync(`/home/user/tinta-blind-work/data/tokens-${slug}.json`, JSON.stringify(toks.out));
  const c = toks.out.reduce((a, t) => (a[t.s] = (a[t.s] || 0) + 1, a), {});
  console.log(slug, toks.out.length, JSON.stringify(c), 'paras', new Set(toks.out.map(t => t.p)).size, 'blocks', toks.blocks);
}
await ctx.close();
