// Get the app's own Top 500 and Top 1,500 known sets, plus a base state.
import { chromium } from './pw.mjs';
import fs from 'node:fs';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.getByText('Spanish', { exact: true }).click();
await page.waitForTimeout(600);
await page.getByText('Skip to the app').click();
await page.waitForTimeout(3000);
const readState = () => page.evaluate(async () => {
  const db = await new Promise(res => { const r = indexedDB.open('ita'); r.onsuccess = () => res(r.result); });
  return await new Promise(res => { const r = db.transaction('state').objectStore('state').get('ita_v2_state'); r.onsuccess = () => res(r.result); });
});
const mark = async (label) => {
  await page.locator('.wmenubtn').click();
  await page.waitForTimeout(300);
  await page.getByRole('menuitem', { name: new RegExp(label) }).click();
  await page.waitForTimeout(1500);
};
await mark('Top 500');
const s500 = JSON.parse(await readState());
await mark('Top 1,500');
const s1500 = JSON.parse(await readState());
fs.writeFileSync('base-500.json', JSON.stringify(s500));
fs.writeFileSync('base-1500.json', JSON.stringify(s1500));
console.log('500:', Object.keys(s500.byLang.es.statuses).length, '1500:', Object.keys(s1500.byLang.es.statuses).length);
console.log('texts:', s500.byLang.es.texts.map(t => t.id + '|' + t.title));
console.log('history', JSON.stringify(s1500.byLang.es.history), 'clock.h', JSON.stringify(s1500.byLang.es.clock.h));
await browser.close();
