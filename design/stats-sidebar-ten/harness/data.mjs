// The facts the three-question panel shows, for La tortuga gigante and the
// simulated reader of ../stats-sidebar-blind. Every design gets this object and
// must show these facts, no more and no fewer (see ../README.md, "The brief").
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const DATA = fileURLToPath(new URL('../../stats-sidebar-blind/data/', import.meta.url));

export function buildData(slug = 'tortuga') {
  const m = JSON.parse(fs.readFileSync(`${DATA}mock-data.json`, 'utf8'));
  const series = JSON.parse(fs.readFileSync(`${DATA}coverage-by-day.json`, 'utf8'));
  const t = m.texts[slug], p = m.persona;
  const textSeries = series.filter(s => s.stage !== 'before').map(s => ({ d: s.date, v: s.texts[t.title] }));
  const v = verdict(t.headline, 'A2', t.total);
  return {
    title: t.title,
    // 1. Can I read this?
    total: t.total,                 // running words in the text: 262
    counts: t.counts,               // running words by status: k 227, l 2, u 33
    pct: t.headline,                // share of running words known: 86
    oneIn: t.one_in,                // about 1 word in 8 is new
    lookups: t.counts.u,            // 33 lookups (new running words)
    level: 'A2',
    verdict: v,                     // { key, label: 'Readable with lookups', line }
    thresholds: { workable: 60, comfortable: 95 },
    // 2. What will help most?
    repeated: t.repeated_new.map(r => ({ word: r.word, count: r.count, gloss: r.gloss.split(';')[0].trim() })),
    repeatedTokens: t.repeated_tokens,   // 16 of the 33 lookups
    after: t.after_repeated_pct,          // 92% known after learning them
    action: `Add ${t.repeated_new.length} to Learning`,
    // 3. Am I getting better?
    series: textSeries,             // this text's share known, per active day: 77 on 18 Aug ... 86 on 13 Oct
    firstPct: textSeries[0].v,
    since: textSeries[0].d,
    known: p.known,                 // 1,751 words known
    gain7: p.gain_7,                // +118 this week
    history: p.history,             // words known per active day: 613 on 18 Aug ... 1,751 on 13 Oct
    // Footer
    more: 'All your statistics',
    // Detail some designs may draw at word resolution: the same 262 words, in reading order.
    tokens: t.tokens.map(k => ({ t: k.t, s: k.s })),
  };
}

export function verdict(pct, level = 'A2', total = 0) {
  if (pct >= 98) return { key: 'easy', label: 'Easy' };
  if (pct >= 95) return { key: 'comfortable', label: 'Comfortable' };
  if (level === 'A1' && total <= 200) return { key: 'stretch', label: 'Short enough to work through' };
  if (pct >= 60) return { key: 'stretch', label: 'Readable with lookups' };
  return { key: 'hard', label: 'Hard going' };
}

// Helpers designs may share.
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const fmt = (n) => Number(n).toLocaleString('en-US');
export const dShort = (iso) => { const d = new Date(iso + 'T12:00:00Z'); return `${d.getUTCDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]}`; };
export const days = (iso, from) => Math.round((Date.parse(iso) - Date.parse(from)) / 864e5);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const D = buildData();
  console.log(JSON.stringify({ ...D, tokens: `(${D.tokens.length} tokens)` }, null, 1));
}
