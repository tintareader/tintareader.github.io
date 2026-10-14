// Dieter Rams: the panel as a Braun instrument. Three soft-cornered modules,
// one per question. A graduated scale with a pointer, readouts in light
// numerals, a perforated grille of the text's words, two recorder tapes, and
// one coloured key.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'rams',
  designer: 'Dieter Rams',
  title: 'Instrument',
  known: 'Braun products from 1955 to 1995, and ten principles of good design: less, but better.',
  idea: 'Rams made radios and calculators whose faces show only what is needed: a scale, a readout, one coloured key. Here the panel is such a face. Grey, white and black do the work, pink marks new words, and green marks the one key to press.',
  how: [
    'Can I read this? A grille with one hole per word, in reading order, with the new words lit pink. Below it, the verdict, a readout of the share known, and a tuning scale with a pointer between the two marks.',
    'What will help most? The returning words in a table, each with a small level meter and a count. Then the one green key, and what knowing the words would give.',
    'Am I getting better? Two recorder tapes side by side: this text since the first day, and words known, with the last seven days bracketed.',
  ],
  type: 'Geist, from Google Fonts: a Swiss grotesque close to the Akzidenz lettering on Braun products. One family, with the light weight for readouts.',
};

export const fonts = [
  { family: 'Geist', style: 'normal', weight: '300 700', file: 'Geist-normal-300_700.woff2' },
];

const W = 339; // inner width of a module: 399 − 2×16 gutter − 2×1 edge − 2×13 padding
const f1 = (n) => (Math.round(n * 10) / 10).toString();

// 1 · The grille: one hole per running word, in reading order.
function grille(D) {
  const cols = 38, n = D.tokens.length, rows = Math.ceil(n / cols), p = W / cols;
  const r = { k: 1.5, l: 2.4, u: 2.85 };
  const cls = { k: 'r-dk', l: 'r-dl', u: 'r-du' };
  const dots = D.tokens.map((t, i) => {
    const s = cls[t.s] ? t.s : 'k';
    return `<circle cx="${f1((i % cols + .5) * p)}" cy="${f1((Math.floor(i / cols) + .5) * p)}" r="${r[s]}" class="${cls[s]}"/>`;
  }).join('');
  const h = rows * p;
  return `<svg class="r-grille" viewBox="0 0 ${W} ${f1(h)}" width="${W}" height="${f1(h)}" role="img" aria-label="The text's ${n} words in reading order: ${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new">${dots}</svg>`;
}

// 1 · The tuning scale: 0–100% known, a pointer, and the two marks.
function scale(D) {
  const padL = 4, padR = 14, L = W - padL - padR, x = (p) => padL + p / 100 * L;
  const base = 31;
  let ticks = '', nums = '';
  for (let p = 0; p <= 100; p++) {
    const h = p % 10 === 0 ? 11 : p % 5 === 0 ? 7 : 4;
    ticks += `<line x1="${f1(x(p))}" x2="${f1(x(p))}" y1="${base - h}" y2="${base}" class="${p % 10 ? 'r-tk' : 'r-tk r-tk10'}"/>`;
    if (p % 10 === 0) nums += `<text x="${f1(x(p))}" y="10" text-anchor="middle">${p}</text>`;
  }
  const wk = D.thresholds.workable, cf = D.thresholds.comfortable;
  const tri = (p) => `<path d="M${f1(x(p))} ${base + 4} l4 6 h-8 z" class="r-mark"/>`;
  const px = f1(x(D.pct));
  return `<svg class="r-scale" viewBox="0 0 ${W} 70" width="${W}" height="70" role="img" aria-label="Scale of words known, 0 to 100%. Pointer at ${D.pct}%. Marks at ${wk}%, workable at ${D.level}, and ${cf}%, comfortable.">
    ${nums}${ticks}
    <line x1="${x(0)}" x2="${x(100)}" y1="${base + .5}" y2="${base + .5}" class="r-base"/>
    ${tri(wk)}${tri(cf)}
    <text x="${f1(x(wk))}" y="56" text-anchor="middle" class="r-ml">${wk}%</text>
    <text x="${f1(x(wk))}" y="68" text-anchor="middle">workable at ${esc(D.level)}</text>
    <text x="${f1(x(cf))}" y="56" text-anchor="middle" class="r-ml">${cf}%</text>
    <text x="${f1(x(cf))}" y="68" text-anchor="middle">comfortable</text>
    <line x1="${px}" x2="${px}" y1="15" y2="${base + 9}" class="r-ptr"/>
  </svg>`;
}

// 3 · A recorder tape: the daily trace on a baseline; a bracket can mark a span.
function tape(pts, w, h, { week } = {}) {
  const t0 = Date.parse(pts[0].d), t1 = Date.parse(pts.at(-1).d);
  const vals = pts.map(q => q.v), lo = Math.min(...vals), hi = Math.max(...vals);
  const padx = 3, base = h - 7, top = 4, bot = base - 4;
  const X = (d) => padx + (Date.parse(d) - t0) / (t1 - t0) * (w - 2 * padx);
  const Y = (v) => bot - (v - lo) / (hi - lo || 1) * (bot - top);
  const line = pts.map((q, i) => `${i ? 'L' : 'M'}${f1(X(q.d))} ${f1(Y(q.v))}`).join(' ');
  let band = '';
  if (week) {
    const xa = X(week.from), xb = X(pts.at(-1).d);
    band = `<rect x="${f1(xa)}" y="0" width="${f1(xb - xa)}" height="${base}" class="r-week"/>
      <path d="M${f1(xa)} ${base + 2.5} V${h - .5} H${f1(xb)} V${base + 2.5}" class="r-brk"/>`;
  }
  const a = pts[0], z = pts.at(-1);
  return `${band}<line x1="0" x2="${w}" y1="${base + .5}" y2="${base + .5}" class="r-base"/>
    <path d="${line}" class="r-trace"/>
    <circle cx="${f1(X(a.d))}" cy="${f1(Y(a.v))}" r="2.2" class="r-first"/>
    <circle cx="${f1(X(z.d))}" cy="${f1(Y(z.v))}" r="2.6" class="r-now"/>`;
}

export function html(D) {
  const v = D.verdict;
  const maxN = Math.max(...D.repeated.map(r => r.count));
  const rows = D.repeated.map(r => `<tr>
      <th scope="row" class="r-w">${esc(r.word)}</th>
      <td class="r-lvl" aria-label="${r.count} times">${Array.from({ length: maxN }, (_, i) => `<i class="${i < r.count ? 'on' : ''}"></i>`).join('')}</td>
      <td class="r-g">${esc(r.gloss)}</td>
      <td class="r-n">${r.count}×</td>
    </tr>`).join('');

  // the last seven days on the words-known tape
  const lastT = Date.parse(D.history.at(-1).d);
  const wkFrom = new Date(lastT - 7 * 864e5).toISOString().slice(0, 10);
  const TW = 157, TH = 36;
  const tapeText = `<svg class="r-tape" viewBox="0 0 ${TW} ${TH}" width="${TW}" height="${TH}" role="img" aria-label="Share of this text known, per day since ${dShort(D.since)}: ${D.firstPct}% to ${D.pct}%">${tape(D.series, TW, TH)}</svg>`;
  const tapeKnown = `<svg class="r-tape" viewBox="0 0 ${TW} ${TH}" width="${TW}" height="${TH}" role="img" aria-label="Words known, per day since ${dShort(D.history[0].d)}: now ${fmt(D.known)}, ${D.gain7 >= 0 ? '+' : ''}${D.gain7} in the last seven days">${tape(D.history.map(q => ({ d: q.d, v: q.k })), TW, TH, { week: { from: wkFrom } })}</svg>`;

  return `
<div class="mp mp-rams">
  <section class="r-mod">
    <h3 class="r-h"><span class="r-no">1</span>Can I read this?</h3>
    <p class="r-lead">About 1 word in ${D.oneIn} is new to you</p>
    ${grille(D)}
    <ul class="r-legend">
      <li><i class="r-sw r-sk"></i><b>${fmt(D.counts.k)}</b> known</li>
      <li><i class="r-sw r-sl"></i><b>${fmt(D.counts.l)}</b> learning</li>
      <li><i class="r-sw r-su"></i><b>${fmt(D.counts.u)}</b> new</li>
    </ul>
    <div class="r-verdict">
      <div class="r-vl">
        <div class="r-vt">${esc(v.label)}</div>
        <div class="r-vs">at ${esc(D.level)} · ${D.lookups} lookups in ${fmt(D.total)} words</div>
      </div>
      <div class="r-ro"><span class="r-big">${D.pct}</span><span class="r-pc">%</span><span class="r-rl">known</span></div>
    </div>
    ${scale(D)}
  </section>

  <section class="r-mod">
    <h3 class="r-h"><span class="r-no">2</span>What will help most?</h3>
    <p class="r-sub">New words that come back in this text</p>
    <table class="r-tbl"><tbody>${rows}</tbody></table>
    <div class="r-act">
      <button class="r-key" type="button">${esc(D.action)}</button>
      <div class="r-after"><span class="r-rl">Knowing them</span><span><b class="r-mid">${D.after}%</b> of this text</span></div>
    </div>
  </section>

  <section class="r-mod">
    <h3 class="r-h"><span class="r-no">3</span>Am I getting better?</h3>
    <div class="r-twin">
      <div class="r-meter">
        <div class="r-rl">This text</div>
        <div class="r-mv"><span class="r-was">${D.firstPct}%</span><span class="r-arr" aria-hidden="true">→</span><span class="r-sr"> to </span><span>${D.pct}%</span></div>
        ${tapeText}
        <div class="r-note">since ${dShort(D.since)}</div>
      </div>
      <div class="r-meter">
        <div class="r-rl">Words known</div>
        <div class="r-mv"><span>${fmt(D.known)}</span></div>
        ${tapeKnown}
        <div class="r-note r-end">${D.gain7 >= 0 ? '+' : ''}${fmt(D.gain7)} this week</div>
      </div>
    </div>
  </section>

  <a class="r-more" href="#stats">${esc(D.more)}<span aria-hidden="true"> →</span></a>
</div>`;
}

export const css = `
.mp-rams {
  --r-plate: #1b1e23;
  --r-edge: #2c3138;
  --r-rule: #272b31;
  --r-off: #343a42;
  --r-ink: var(--ink);
  --r-dim: var(--dim);
  --r-tick: #77818d;
  --r-week: rgba(197, 204, 212, .1);
  --r-key: #2f7a46;
  --r-key-ink: #ffffff;
  --r-hole: var(--band-k);
  font-family: 'Geist', var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--r-ink);
  padding: 6px 16px 10px;
  display: flex; flex-direction: column; gap: 8px;
}
:root[data-theme="light"] .mp-rams {
  --r-plate: #f7f7f4;
  --r-edge: #d3d6ce;
  --r-rule: #e1e3dd;
  --r-off: #d6d9d1;
  --r-tick: #4f565d;
  --r-week: rgba(27, 31, 36, .07);
}
.mp-rams * { box-sizing: border-box; }
.mp-rams .r-mod { background: var(--r-plate); border: 1px solid var(--r-edge); border-radius: 12px; padding: 12px 13px 13px; }
.mp-rams .r-h { display: flex; align-items: baseline; gap: 8px; margin: 0 0 8px; font-size: 12px; font-weight: 600; color: var(--r-ink); letter-spacing: .005em; }
.mp-rams .r-no { font-weight: 500; color: var(--r-dim); }
.mp-rams p { margin: 0; }
.mp-rams .r-lead { font-size: 16px; font-weight: 500; letter-spacing: -.01em; line-height: 1.2; margin-bottom: 10px; }
.mp-rams .r-grille .r-dk { fill: var(--r-hole); }
.mp-rams .r-grille .r-dl { fill: var(--band-l); }
.mp-rams .r-grille .r-du { fill: var(--c-unknown); }
.mp-rams .r-legend { list-style: none; margin: 8px 0 0; padding: 0; display: flex; gap: 18px; font-size: 11.5px; color: var(--r-dim); }
.mp-rams .r-legend li { display: flex; align-items: center; }
.mp-rams .r-legend b { margin: 0 4px 0 6px; }
.mp-rams .r-legend b { color: var(--r-ink); font-weight: 600; }
.mp-rams .r-sw { display: inline-block; border-radius: 50%; }
.mp-rams .r-sk { width: 3.2px; height: 3.2px; background: var(--r-hole); }
.mp-rams .r-sl { width: 5px; height: 5px; background: var(--band-l); }
.mp-rams .r-su { width: 6px; height: 6px; background: var(--c-unknown); }
.mp-rams .r-verdict { display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid var(--r-rule); margin-top: 10px; padding-top: 9px; }
.mp-rams .r-vt { font-size: 14px; font-weight: 600; }
.mp-rams .r-vs { font-size: 11.5px; color: var(--r-dim); margin-top: 3px; }
.mp-rams .r-ro { display: grid; grid-template-columns: auto auto; align-items: baseline; justify-items: start; column-gap: 1px; }
.mp-rams .r-big { font-size: 30px; font-weight: 300; line-height: .9; letter-spacing: -.02em; }
.mp-rams .r-pc { font-size: 14px; font-weight: 400; }
.mp-rams .r-ro .r-rl { grid-column: 1 / -1; justify-self: end; margin-top: 2px; }
.mp-rams .r-rl { font-size: 10.5px; color: var(--r-dim); letter-spacing: .02em; }
.mp-rams .r-scale { margin-top: 10px; }
.mp-rams svg text { font: 10.5px 'Geist', var(--font-ui); fill: var(--r-dim); font-variant-numeric: tabular-nums; }
.mp-rams svg .r-ml { fill: var(--r-ink); font-weight: 600; }
.mp-rams .r-tk { stroke: var(--r-tick); stroke-width: .7; }
.mp-rams .r-tk10 { stroke: var(--r-ink); stroke-width: 1; }
.mp-rams .r-base { stroke: var(--r-tick); stroke-width: 1; }
.mp-rams .r-mark { fill: var(--r-ink); }
.mp-rams .r-ptr { stroke: var(--r-ink); stroke-width: 2.2; stroke-linecap: round; }
.mp-rams .r-sub { font-size: 11.5px; color: var(--r-dim); margin: -4px 0 4px; }
.mp-rams .r-tbl { width: 100%; border-collapse: collapse; }
.mp-rams .r-tbl tr + tr > * { border-top: 1px solid var(--r-rule); }
.mp-rams .r-tbl th, .mp-rams .r-tbl td { padding: 2px 0; height: 23px; text-align: left; font-weight: 400; vertical-align: middle; }
.mp-rams .r-w { width: 92px; color: var(--c-unknown); font-size: 13.5px; font-weight: 500 !important; }
.mp-rams .r-lvl { width: 34px; white-space: nowrap; font-size: 0; }
.mp-rams .r-lvl i { display: inline-block; width: 3px; height: 10px; margin-right: 3px; border-radius: 1px; background: var(--r-off); vertical-align: middle; }
.mp-rams .r-lvl i.on { background: var(--c-unknown); }
.mp-rams .r-g { color: var(--r-dim); font-size: 12px; padding-left: 24px !important; }
.mp-rams .r-n { text-align: right !important; font-size: 12px; color: var(--r-ink); width: 30px; }
.mp-rams .r-act { display: flex; align-items: center; gap: 14px; margin-top: 10px; }
.mp-rams .r-key { appearance: none; border: 0; cursor: pointer; font: 600 12.5px 'Geist', var(--font-ui); color: var(--r-key-ink); background: var(--r-key); min-width: 136px; padding: 0 14px; height: 33px; border-radius: 8px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.2), inset 0 -2px 0 rgba(0,0,0,.22), 0 1px 2px rgba(0,0,0,.25); }
.mp-rams .r-key:active { box-shadow: inset 0 1px 2px rgba(0,0,0,.3); transform: translateY(1px); }
.mp-rams .r-key:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mp-rams .r-after { display: flex; flex-direction: column; gap: 1px; font-size: 12px; color: var(--r-dim); }
.mp-rams .r-mid { font-size: 15px; font-weight: 500; color: var(--r-ink); }
.mp-rams .r-twin { display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; position: relative; }
.mp-rams .r-twin::before { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; border-left: 1px solid var(--r-rule); }
.mp-rams .r-mv { font-size: 22px; font-weight: 300; letter-spacing: -.02em; margin: 2px 0 6px; display: flex; gap: 6px; align-items: baseline; }
.mp-rams .r-was { color: var(--r-dim); }
.mp-rams .r-arr { font-size: 14px; color: var(--r-dim); }
.mp-rams .r-tape .r-trace { fill: none; stroke: var(--r-ink); stroke-width: 1.3; stroke-linejoin: round; }
.mp-rams .r-tape .r-first { fill: var(--r-plate); stroke: var(--r-ink); stroke-width: 1.2; }
.mp-rams .r-tape .r-now { fill: var(--r-ink); }
.mp-rams .r-tape .r-week { fill: var(--r-week); }
.mp-rams .r-tape .r-brk { fill: none; stroke: var(--r-ink); stroke-width: 1; }
.mp-rams .r-note { font-size: 11.5px; color: var(--r-dim); margin-top: 4px; }
.mp-rams .r-end { text-align: right; }
.mp-rams .r-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mp-rams .r-more { align-self: flex-start; margin: 4px 0 0 2px; color: var(--accent); font-size: 12.5px; font-weight: 500; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
`;
