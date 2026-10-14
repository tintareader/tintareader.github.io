// Second replay of the same simulated learner, in a fresh profile, that also
// records how much of each text the app says is known after every day.
// The two test texts are pasted on day 1, so the app can score them throughout.
// Output: data/coverage-by-day.json  ({date, known, learning, texts: {title: pct}})
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const PROFILE = '/home/user/tinta-blind-work/profile-sam-series';
const plan = JSON.parse(fs.readFileSync('/home/user/tinta-blind-work/persona/plan.json', 'utf8'));
const texts = [
  { title: 'La tortuga gigante', file: '/home/user/tinta-blind-work/texts/quiroga-tortuga.txt' },
  { title: 'Don Quijote, capítulo 1', file: '/home/user/tinta-blind-work/texts/quijote-cap1.txt' },
];
fs.rmSync(PROFILE, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
const page = ctx.pages()[0] ?? await ctx.newPage();
page.on('dialog', d => d.accept());

async function openWordMenu() {
  await page.click('button.sidetab:has-text("Words")');
  await page.click('button.wmenubtn');
  await page.waitForTimeout(250);
}
async function readChooser() {
  await page.click('button.titlebtn');
  await page.waitForTimeout(300);
  const labels = await page.$$eval('.titlemenu [role=option]', els => els.map(e => e.getAttribute('aria-label')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const out = {};
  for (const l of labels) {
    const m = /^(.*) · (\d+)% known$/.exec(l ?? '');
    if (m) out[m[1]] = Number(m[2]);
  }
  return out;
}
const series = [];
for (let i = 0; i < plan.length; i++) {
  const day = plan[i];
  await ctx.clock.setFixedTime(new Date(`${day.date}T18:00:00Z`));
  await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  if (i === 0) {
    await page.click('button.fr-tile:has-text("Spanish")');
    await page.click('button.fr-go');
    await page.waitForTimeout(1500);
    const skip = page.locator('text=Skip the tour');
    if (await skip.count()) { await skip.first().click(); await page.waitForTimeout(1000); }
    const gotIt = page.locator('text=Got it');
    if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(300); }
    for (const t of texts) {
      await page.click('button:has-text("New text")');
      await page.waitForTimeout(600);
      await page.locator('input[placeholder^="Title"]').fill(t.title);
      await page.locator('textarea').last().fill(fs.readFileSync(t.file, 'utf8').trim());
      await page.click('button:has-text("Save & analyse")');
      await page.waitForTimeout(1200);
    }
    // Before marking anything: the starting point.
    series.push({ date: day.date, stage: 'before', texts: await readChooser() });
  }
  const notNow = page.locator('button:has-text("Not now")');
  if (await notNow.count()) { await notNow.first().click(); await page.waitForTimeout(300); }
  if (day.topN) {
    await openWordMenu();
    await page.click(`button:has-text("Top ${day.topN}")`);
    await page.waitForTimeout(800);
  }
  if (day.csv) {
    await openWordMenu();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }),
      page.click('button:has-text("Import…")'),
    ]);
    await chooser.setFiles(day.csv);
    await page.waitForTimeout(600);
    const dlg = page.locator('.vxbox');
    await dlg.locator('text=As in the file').first().click();
    await dlg.locator('button.qbtn.primary').click();
    await page.waitForTimeout(900);
  }
  const cov = await readChooser();
  series.push({ date: day.date, texts: cov });
  console.log(day.date, JSON.stringify(cov));
}
fs.writeFileSync('/home/user/tinta-blind-work/data/coverage-by-day.json', JSON.stringify(series, null, 1));
await ctx.close();
