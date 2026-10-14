// Dump localStorage keys and IndexedDB databases/stores of the explore profile.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const PROFILE = process.argv[2] ?? '/home/user/tinta-blind-work/profile-explore';
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 1440, height: 900 } });
const page = ctx.pages()[0] ?? await ctx.newPage();
await page.goto('http://localhost:4273/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const ls = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k).slice(0, 300)])));
console.log('localStorage:', JSON.stringify(ls, null, 1));
const idb = await page.evaluate(async () => {
  const dbs = await indexedDB.databases();
  const out = [];
  for (const d of dbs) {
    const db = await new Promise((res, rej) => { const r = indexedDB.open(d.name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const stores = [...db.objectStoreNames];
    const info = {};
    for (const s of stores) {
      const tx = db.transaction(s, 'readonly');
      const st = tx.objectStore(s);
      const keys = await new Promise(res => { const r = st.getAllKeys(); r.onsuccess = () => res(r.result); });
      const sample = await new Promise(res => { const r = st.getAll(null, 3); r.onsuccess = () => res(r.result); });
      info[s] = { count: keys.length, keys: keys.slice(0, 20), sample: JSON.stringify(sample).slice(0, 1500) };
    }
    out.push({ name: d.name, version: d.version, info });
    db.close();
  }
  return out;
});
console.log('indexedDB:', JSON.stringify(idb, null, 1));
await ctx.close();
