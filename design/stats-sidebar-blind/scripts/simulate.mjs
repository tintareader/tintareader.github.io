// Replay the simulated learner day by day in the real app under a fake clock,
// so the app records its own daily history (state.byLang.es.history).
// Usage: node simulate.mjs [maxDays]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const PROFILE = '/home/user/tinta-blind-work/profile-sam';
const SHOTS = '/home/user/tinta-blind-work/explore/sim';
fs.mkdirSync(SHOTS, { recursive: true });
const plan = JSON.parse(fs.readFileSync('/home/user/tinta-blind-work/persona/plan.json', 'utf8'));
const maxDays = Number(process.argv[2] ?? plan.length);
const startAt = Number(process.argv[3] ?? 0);

const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
const page = ctx.pages()[0] ?? await ctx.newPage();
page.on('console', m => { if (m.type() === 'error') console.log('console error:', m.text()); });
page.on('dialog', d => { console.log('dialog:', d.message()); d.accept(); });

async function readState() {
  return page.evaluate(async () => {
    const db = await new Promise((res, rej) => { const r = indexedDB.open('ita'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const tx = db.transaction('state', 'readonly');
    const v = await new Promise(res => { const r = tx.objectStore('state').get('ita_v2_state'); r.onsuccess = () => res(r.result); });
    db.close();
    const s = typeof v === 'string' ? JSON.parse(v) : v;
    const es = s?.byLang?.es;
    if (!es) return null;
    const counts = { k: 0, l: 0, i: 0, u: 0 };
    for (const st of Object.values(es.statuses ?? {})) {
      const code = typeof st === 'string' ? st : (st?.s ?? st?.status ?? '?');
      counts[code] = (counts[code] ?? 0) + 1;
    }
    return { counts, history: es.history, sample: Object.entries(es.statuses ?? {}).slice(0, 2) };
  });
}

async function waitSaved() {
  for (let i = 0; i < 40; i++) {
    const t = await page.evaluate(() => document.querySelector('.titlebar, header')?.innerText ?? document.body.innerText.slice(0, 400));
    if (/\bsaved\b/.test(t) && !/saving/.test(t)) return;
    await page.waitForTimeout(250);
  }
}

async function openWordMenu() {
  await page.click('button.sidetab:has-text("Words")');
  await page.click('button.wmenubtn');
  await page.waitForTimeout(250);
}

for (let i = startAt; i < Math.min(plan.length, startAt + maxDays); i++) {
  const day = plan[i];
  await ctx.clock.setFixedTime(new Date(`${day.date}T18:00:00Z`));
  await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  if (i === 0) {
    // First run: pick Spanish, start, skip the tour.
    if (await page.locator('button.fr-tile:has-text("Spanish")').count()) {
      await page.click('button.fr-tile:has-text("Spanish")');
      await page.click('button.fr-go');
      await page.waitForTimeout(1500);
    }
    const skip = page.locator('text=Skip the tour');
    if (await skip.count()) { await skip.first().click(); await page.waitForTimeout(1200); }
    const gotIt = page.locator('text=Got it');
    if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(300); }
  }
  const notNow = page.locator('button:has-text("Not now")');
  if (await notNow.count()) { await notNow.first().click(); await page.waitForTimeout(300); }
  if (day.topN) {
    await openWordMenu();
    await page.screenshot({ path: `${SHOTS}/menu-${day.date}.png` });
    await page.click(`button:has-text("Top ${day.topN}")`);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SHOTS}/after-top-${day.date}.png` });
    // A confirmation may appear in the page.
    const confirm = page.locator('.helpbox button.qbtn.primary, .overlay button.primary');
    if (await confirm.count()) {
      console.log('confirm text:', (await page.locator('.helpbox, .overlay').first().innerText()).replace(/\s+/g, ' ').slice(0, 300));
      await confirm.first().click();
      await page.waitForTimeout(800);
    }
  }
  if (day.csv) {
    await openWordMenu();
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 5000 }),
      page.click('button:has-text("Import…")'),
    ]);
    await chooser.setFiles(day.csv);
    await page.waitForTimeout(700);
    const dlg = page.locator('.vxbox');
    if (i < 2) await page.screenshot({ path: `${SHOTS}/import-${day.date}.png` });
    const choice = dlg.locator('text=As in the file');
    await choice.first().click();
    await dlg.locator('button.qbtn.primary').click();
    await page.waitForTimeout(900);
  }
  await waitSaved();
  await page.waitForTimeout(400);
  const st = await readState();
  console.log(day.date, JSON.stringify(st?.counts), 'history points:', st?.history?.length, 'last:', JSON.stringify(st?.history?.at(-1)));
  if (i === startAt) console.log('status sample:', JSON.stringify(st?.sample));
}
await ctx.close();
