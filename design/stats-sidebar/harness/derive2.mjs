// Round 2: what each panel shows once taps, not coverage bands, are the measure.
// Text figures are read out of the running app (extract.mjs). The reading log is
// ILLUSTRATIVE: Tinta keeps no per-text log yet, so these sixteen past texts stand
// in for what the device would record (length, new words when opened, finished or not).
import fs from 'node:fs';

export const LOG = [
  { d: '2026-08-24', words: 180, taps: 22, done: true },
  { d: '2026-08-26', words: 240, taps: 26, done: true },
  { d: '2026-08-29', words: 310, taps: 41, done: true },
  { d: '2026-09-01', words: 520, taps: 92, done: false },
  { d: '2026-09-05', words: 260, taps: 24, done: true },
  { d: '2026-09-08', words: 400, taps: 44, done: true },
  { d: '2026-09-11', words: 150, taps: 33, done: false },
  { d: '2026-09-15', words: 620, taps: 52, done: true },
  { d: '2026-09-18', words: 350, taps: 29, done: true },
  { d: '2026-09-20', words: 1400, taps: 126, done: false },
  { d: '2026-09-24', words: 480, taps: 38, done: true },
  { d: '2026-09-28', words: 300, taps: 18, done: true },
  { d: '2026-10-02', words: 700, taps: 58, done: true },
  { d: '2026-10-05', words: 220, taps: 11, done: true },
  { d: '2026-10-09', words: 410, taps: 25, done: true },
  { d: '2026-10-12', words: 330, taps: 12, done: true },
].map(t => ({ ...t, per100: t.taps / t.words * 100 }));

const median = a => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

export function logStats(log = LOG) {
  const fin = log.filter(t => t.done), stop = log.filter(t => !t.done);
  return {
    log, fin, stop,
    limit: Math.max(...fin.map(t => t.per100)), usual: median(fin.map(t => t.per100)),
    mostTaps: Math.max(...fin.map(t => t.taps)), usualTaps: median(fin.map(t => t.taps)),
  };
}

// One text, as the panel sees it. `pos` is the reader's place (the selected word), `openedTaps`
// the New count the app showed before this session's marks.
export function text(file, { posWord = null, openedTaps = null } = {}) {
  const raw = JSON.parse(fs.readFileSync(new URL(file, import.meta.url), 'utf8'));
  const seq = raw.text.seq.map(x => ({ ...x }));
  let sn = -1, last = null;
  for (const x of seq) { if (x.s !== last) { sn++; last = x.s; } x.sn = sn; }
  const sentences = [];
  seq.forEach((x, i) => { (sentences[x.sn] ||= { p: x.p, words: [] }).words.push({ ...x, i }); });
  const run = seq.reduce((m, x) => (m[x.st] = (m[x.st] || 0) + 1, m), { k: 0, l: 0, u: 0, i: 0 });
  run.total = seq.length;
  const surface = r => seq[r.first - 1]?.w ?? r.root;
  const roots = raw.text.roots.map(r => ({ ...r, form: surface(r), gloss: (r.gloss || '').split(';')[0].replace(/\s*\(.*\)/, '').trim() }));
  // An unlisted word written with a capital is almost always a name: Tinta can offer to set it aside.
  for (const r of roots) r.name = r.level === 0 && /^\p{Lu}/u.test(r.form);
  const byFirst = (a, b) => a.first - b.first;
  const newWords = roots.filter(r => r.st === 'u').sort(byFirst);
  const learning = roots.filter(r => r.st === 'l').sort(byFirst);
  const pos = posWord ? seq.findIndex(x => x.w === posWord) : -1;
  const ahead = seq.filter((x, i) => i > pos && x.st === 'u').length;
  const nextIdx = seq.findIndex((x, i) => i > pos && x.st === 'u');
  const passed = posWord ? newWords.filter(r => r.first - 1 < pos) : [];
  const taps = run.u;
  return {
    title: raw.text.title, seq, sentences, run, roots, newWords, learning,
    uniq: { u: newWords.length, l: learning.length, total: roots.length },
    taps, per100: taps / run.total * 100, every: run.total / taps,
    openedTaps: openedTaps ?? taps, openedPer100: (openedTaps ?? taps) / run.total * 100,
    pos, posSentence: pos >= 0 ? seq[pos].sn : -1, ahead,
    next: nextIdx >= 0 ? { w: seq[nextIdx].w, i: nextIdx, sentencesOn: pos >= 0 ? seq[nextIdx].sn - seq[pos].sn : seq[nextIdx].sn } : null,
    passed,
    history: raw.overall.history,
    vocab: +raw.overall.rows.find(r => r[0] === 'Known')[1].split('·')[0].replace(/[^\d]/g, ''),
  };
}

export function verdict(per100, S) {
  if (per100 > S.limit) return { key: 'over', text: 'Denser than any text you’ve finished' };
  const lighter = S.fin.filter(t => t.per100 > per100).length;
  if (lighter >= Math.ceil(S.fin.length * 0.75)) return { key: 'light', text: 'Lighter than most texts you finish', lighter };
  return { key: 'usual', text: 'Like the texts you usually finish', lighter };
}

export function load() {
  const S = logStats();
  // La ofrenda, mid-read: opened with 22 New occurrences (the app's own Total bar), now 8.
  const A = text('data.json', { posWord: 'olía', openedTaps: 22 });
  // Un mate en la oficina, just opened.
  const M = text('data-mate.json');
  return { A, M, S };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const { A, M, S } = load();
  const brief = T => ({ title: T.title, run: T.run, taps: T.taps, per100: +T.per100.toFixed(1), every: +T.every.toFixed(1), openedTaps: T.openedTaps, ahead: T.ahead, next: T.next, passed: T.passed.map(r => r.root + '×' + r.freq), newWords: T.newWords.map(r => `${r.root}×${r.freq}${r.name ? '(name)' : ''}`), learning: T.learning.map(r => r.root), verdictNow: verdict(T.per100, S), verdictOpened: verdict(T.openedPer100, S) });
  console.log(JSON.stringify({ A: brief(A), M: brief(M), S: { limit: +S.limit.toFixed(1), usual: +S.usual.toFixed(1), mostTaps: S.mostTaps, usualTaps: S.usualTaps, fin: S.fin.length, stop: S.stop.map(t => [t.words, t.taps, +t.per100.toFixed(1)]) } }, null, 1));
}
