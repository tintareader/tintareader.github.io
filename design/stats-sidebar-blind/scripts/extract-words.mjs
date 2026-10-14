// For each text, read the Words tab (More columns) for New and Learning words:
// word, gloss, count in this text, as the app lists them. Output: data/words-<slug>.json
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
  await page.click('button.sidetab:has-text("Words")');
  const res = {};
  for (const st of ['New', 'Learning']) {
    await page.click(`button.tab[aria-label^="${st}"]`);
    await page.waitForTimeout(300);
    const more = page.locator('text=More columns');
    if (await more.count()) { await more.click(); await page.waitForTimeout(300); }
    res[st] = await page.evaluate(() => [...document.querySelectorAll('.wlist .wrow')].map(r => ({
      word: r.querySelector('.wbtn span[lang]')?.innerText.trim(),
      gloss: r.querySelector('.wgloss')?.innerText.trim() ?? '',
      nums: [...r.querySelectorAll('.num')].map(n => ({ cls: n.className, text: n.innerText.trim(), title: n.getAttribute('title') })),
    })));
    const fewer = page.locator('text=Fewer columns');
    if (await fewer.count()) { await fewer.click(); await page.waitForTimeout(200); }
  }
  await page.click('button.tab[aria-label^="All"]');
  fs.writeFileSync(`/home/user/tinta-blind-work/data/words-${slug}.json`, JSON.stringify(res, null, 1));
  console.log(slug, 'new', res.New.length, 'learning', res.Learning.length, JSON.stringify(res.New[0]), JSON.stringify(res.Learning));
}
await ctx.close();
