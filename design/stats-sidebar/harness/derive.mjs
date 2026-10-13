// Everything the mockups show, derived from data.json (read out of the running app by extract.mjs).
// Nothing here is typed in by hand except the root of each non-Known form, which is what the
// app's own Words tab lists for this text.
import fs from 'node:fs';

const ROOT = {
  Lupe: 'lupe', velas: 'vela', ofrenda: 'ofrenda', mole: 'mole', fumaba: 'fumar', 'riéndose': 'reír',
  'olía': 'oler', pedazo: 'pedazo', rieron: 'reír', sed: 'sed', marcan: 'marcar', 'probé': 'probar', sabor: 'sabor',
};
// Marked in the reading session, before the screenshots (read1.mjs): their roots in the Words tab.
const MARKED_TODAY = ['lupe', 'lleno', 'vela', 'ofrenda', 'fruta', 'tequila', 'cigarro', 'fumar', 'muchísimo', 'oler'];

export function derive(file = 'data.json') {
  const raw = JSON.parse(fs.readFileSync(new URL(file, import.meta.url), 'utf8'));
  const seq = raw.text.seq.map(x => ({ ...x }));
  let sn = -1, last = null;
  for (const x of seq) { if (x.s !== last) { sn++; last = x.s; } x.sn = sn; }
  const count = arr => arr.reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), { k: 0, l: 0, u: 0, i: 0 });
  const run = { ...count(seq.map(x => x.st)), total: seq.length };
  const uniq = { ...count(raw.text.roots.map(r => r.st)), total: raw.text.roots.length };
  const byRoot = Object.fromEntries(raw.text.roots.map(r => [r.root, r]));
  const group = st => {
    const m = new Map();
    seq.forEach((x, i) => {
      if (x.st !== st) return;
      const root = ROOT[x.w] ?? x.w.toLowerCase();
      if (!m.has(root)) m.set(root, { root, n: 0, first: i, forms: [], gloss: (byRoot[root]?.gloss || '').split(';')[0].replace(/\s*\(.*\)/, ''), level: byRoot[root]?.level ?? 0 });
      const g = m.get(root); g.n++; if (!g.forms.includes(x.w)) g.forms.push(x.w);
    });
    return [...m.values()];
  };
  const newWords = group('u');
  const learning = group('l');
  const pctOf = n => Math.floor(n / run.total * 100);
  const sentences = [];
  seq.forEach((x, i) => { (sentences[x.sn] ||= { p: x.p, words: [] }).words.push({ ...x, i }); });
  const pos = seq.findIndex(x => x.w === 'olía');
  const hist = raw.overall.history;
  const day = d => Date.parse(d + 'T00:00:00Z');
  const kAt = t => { let k = hist[0].k; for (const h of hist) if (day(h.d) <= t) k = h.k; return k; };
  const today = day(hist[hist.length - 1].d);
  const weeks = [];
  for (let w = 6; w >= 0; w--) weeks.push(kAt(today - w * 7 * 864e5) - kAt(today - (w + 1) * 7 * 864e5));
  const days = [];
  for (let t = day(hist[0].d), prev = null; t <= today; t += 864e5) {
    const h = hist.find(e => day(e.d) === t);
    days.push({ d: new Date(t).toISOString().slice(0, 10), gain: h ? (prev == null ? 0 : h.k - prev) : null });
    if (h) prev = h.k;
  }
  const active30 = days.slice(-30).filter(d => d.gain !== null).length;
  const cov = Object.fromEntries(raw.overall.coverage.map(c => {
    const [k, of] = c.val.split('·')[0].split('/').map(s => +s.replace(/[^\d]/g, ''));
    return [c.label, { k, of }];
  }));
  const vocabRow = label => raw.overall.rows.find(r => r[0] === label)?.[1] ?? '';
  return {
    title: raw.text.title,
    seq, sentences, run, uniq, newWords, learning,
    pct: pctOf(run.k), pctExact: run.k / run.total * 100,
    opened: raw.text.openedPct, openedExact: (run.k - 5) / run.total * 100,
    ifNew: pctOf(run.k + run.u), ifAll: pctOf(run.k + run.u + run.l),
    pos, posSentence: seq[pos].sn,
    markedToday: MARKED_TODAY,
    bands: raw.text.bands,
    vocab: { k: +vocabRow('Known').split('·')[0].replace(/[^\d]/g, ''), l: +vocabRow('Learning').split('·')[0].replace(/[^\d]/g, '') },
    history: hist, days, weeks, active30,
    week: weeks[weeks.length - 1], avgWeek: Math.round(weeks.reduce((a, b) => a + b, 0) / weeks.length),
    since: { d: hist[0].d, gain: hist[hist.length - 1].k - hist[0].k },
    todayGain: hist[hist.length - 1].k - hist[hist.length - 2].k,
    cov,
  };
}

// Reading-comfort bands. Guidance, not cut-offs: comprehension rises steadily with coverage
// (Schmitt, Jiang & Grabe 2011); 95% is Laufer's minimum, 98% Hu & Nation's unassisted figure,
// and 90% is the floor Tinta's own level stories are written to.
export const BANDS = [
  { from: 0, to: 90, name: 'Hard', note: 'more than 1 word in 10 is unfamiliar' },
  { from: 90, to: 95, name: 'Stretch', note: 'about 1 in 12; tap as you go' },
  { from: 95, to: 98, name: 'Comfortable', note: 'about 1 in 25' },
  { from: 98, to: 100.01, name: 'Easy', note: '1 in 50 or fewer' },
];
export const bandOf = p => BANDS.find(b => p >= b.from && p < b.to);

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const D = derive();
  const { seq, sentences, ...rest } = D;
  console.log(JSON.stringify({ ...rest, sentences: sentences.map(s => s.words.length) }, null, 1).slice(0, 4000));
}
