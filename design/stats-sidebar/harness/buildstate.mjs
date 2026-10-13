// Build a realistic seven-week Spanish learner state from the app's own band sets.
import fs from 'node:fs';
const s500 = JSON.parse(fs.readFileSync('base-500.json', 'utf8'));
const s1500 = JSON.parse(fs.readFileSync('base-1500.json', 'utf8'));
const K500 = Object.keys(s500.byLang.es.statuses);
const band2 = Object.keys(s1500.byLang.es.statuses).filter(k => !(k in s500.byLang.es.statuses));
// ranks 1501-4000 from the pack
const ranks = new Map();
for (const line of fs.readFileSync(new URL('../../../packs/es/ranks.txt', import.meta.url), 'utf8').split('\n')) {
  if (line.startsWith('#') || !line.trim()) continue;
  for (const pair of line.split('|')) { const i = pair.lastIndexOf(':'); if (i > 0) ranks.set(pair.slice(0, i), +pair.slice(i + 1)); }
}
const set1500 = new Set(Object.keys(s1500.byLang.es.statuses));
const band3 = [...ranks].filter(([w, r]) => r > 1500 && r <= 4000 && !set1500.has(w)).map(([w]) => w);
const band4 = [...ranks].filter(([w, r]) => r > 4000 && r <= 9000 && !set1500.has(w)).map(([w]) => w);
// seeded rng
let seed = 20261013; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (arr, p) => arr.filter(() => rnd() < p);
const known = new Set([...K500, ...pick(band2, 0.52), ...pick(band3, 0.07), ...pick(band4, 0.012)]);
const learningPool = [...pick(band2.filter(w => !known.has(w)), 0.05), ...pick(band3.filter(w => !known.has(w)), 0.012)];
const statuses = {};
for (const w of known) statuses[w] = 'k';
for (const w of learningPool) statuses[w] = 'l';
// a few the reader chose to ignore (interjections / names)
for (const w of ['ja', 'eh', 'mm']) if (ranks.has(w) && !statuses[w]) statuses[w] = 'i';
const counts = Object.values(statuses).reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), {});
console.log('band2', band2.length, 'band3', band3.length, 'band4', band4.length, 'counts', counts);
// history: started 2026-08-24 with the Top 500 (k=611), growing to today's counts, with gap days
const start = Date.UTC(2026, 7, 24), today = Date.UTC(2026, 9, 12);
const days = Math.round((today - start) / 864e5);
const hist = [];
const kEnd = counts.k, lEnd = counts.l;
for (let i = 0; i <= days; i++) {
  const d = new Date(start + i * 864e5).toISOString().slice(0, 10);
  if (i > 0 && i < days && rnd() < 0.3) continue; // gaps: days not marked
  const t = i / days;
  const ease = t < 0.15 ? t * 0.8 : 0.12 + (t - 0.15) * (0.88 / 0.85); // slow first week, then steadier
  const k = Math.round(611 + (kEnd - 611) * Math.min(1, ease + (rnd() - 0.5) * 0.01));
  const l = Math.max(0, Math.round(lEnd * Math.min(1, 0.25 + t * 0.9) + (rnd() - 0.5) * 6));
  hist.push({ d, k, l });
}
// monotonic known
for (let i = 1; i < hist.length; i++) hist[i].k = Math.max(hist[i].k, hist[i - 1].k);
hist[hist.length - 1].k = kEnd; hist[hist.length - 1].l = lEnd;
const st = JSON.parse(JSON.stringify(s500));
const es = st.byLang.es;
es.statuses = statuses;
es.history = hist;
es.activeId = 'sample.2';
const ts = Date.UTC(2026, 9, 12, 9);
es.clock = { s: Object.fromEntries(Object.keys(statuses).map(w => [w, ts])), h: Object.fromEntries(hist.map(h => [h.d, Date.parse(h.d + 'T20:00:00Z')])) };
fs.writeFileSync('state-seeded.json', JSON.stringify(st));
console.log('history points', hist.length, hist.slice(0, 4), hist.slice(-3));
