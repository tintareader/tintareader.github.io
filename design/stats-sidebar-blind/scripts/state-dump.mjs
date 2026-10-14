// Print the structure of the app's saved state (IndexedDB ita/state/ita_v2_state).
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';

const PROFILE = process.argv[2] ?? '/home/user/tinta-blind-work/profile-explore';
const OUTFILE = process.argv[3] ?? '/home/user/tinta-blind-work/explore/state.json';
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
const page = ctx.pages()[0] ?? await ctx.newPage();
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const raw = await page.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('ita'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const tx = db.transaction('state', 'readonly');
  const v = await new Promise(res => { const r = tx.objectStore('state').get('ita_v2_state'); r.onsuccess = () => res(r.result); });
  db.close();
  return v;
});
fs.writeFileSync(OUTFILE, typeof raw === 'string' ? raw : JSON.stringify(raw));
const s = typeof raw === 'string' ? JSON.parse(raw) : raw;
const shape = (o, depth = 0) => {
  if (Array.isArray(o)) return `Array(${o.length})` + (o.length ? ' of ' + shape(o[0], depth + 1) : '');
  if (o && typeof o === 'object') {
    if (depth > 4) return '{…}';
    const keys = Object.keys(o);
    if (keys.length > 25) return `Object(${keys.length} keys, e.g. ${keys.slice(0, 5).join(', ')}) values like ${shape(o[keys[0]], depth + 1)}`;
    return '{ ' + keys.map(k => `${k}: ${shape(o[k], depth + 1)}`).join(', ') + ' }';
  }
  return typeof o === 'string' ? `"${o.slice(0, 40)}"` : String(o);
};
console.log(shape(s));
await ctx.close();
