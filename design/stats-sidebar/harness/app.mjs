import { chromium } from './pw.mjs';
import fs from 'node:fs';
export async function openApp({ theme = 'dark', state = 'state-seeded.json', width = 1440, height = 900, scale = 2 } = {}) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('pageerror:', e.message));
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.getByText('Spanish', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.getByText('Skip to the app').click();
  await page.waitForTimeout(2500);
  const st = JSON.parse(fs.readFileSync(state, 'utf8'));
  st.theme = theme;
  await page.evaluate(async ({ s, theme }) => {
    const db = await new Promise(res => { const r = indexedDB.open('ita'); r.onsuccess = () => res(r.result); });
    await new Promise(res => { const tx = db.transaction('state', 'readwrite'); tx.objectStore('state').put(s, 'ita_v2_state'); tx.oncomplete = res; });
    localStorage.setItem('ita-theme', theme);
  }, { s: JSON.stringify(st), theme });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const notNow = page.getByRole('button', { name: 'Not now' });
  if (await notNow.count()) { await notNow.first().click(); await page.waitForTimeout(300); }
  return { browser, ctx, page };
}
export async function readState(page) {
  return JSON.parse(await page.evaluate(async () => {
    const db = await new Promise(res => { const r = indexedDB.open('ita'); r.onsuccess = () => res(r.result); });
    return await new Promise(res => { const r = db.transaction('state').objectStore('state').get('ita_v2_state'); r.onsuccess = () => res(r.result); });
  }));
}
export async function statsTab(page, scope = 'text') {
  await page.locator('.sidetab', { hasText: 'Stats' }).click();
  await page.waitForTimeout(400);
  await page.getByRole('tab', { name: scope === 'text' ? 'This text' : 'Overall' }).click();
  await page.waitForTimeout(400);
}
