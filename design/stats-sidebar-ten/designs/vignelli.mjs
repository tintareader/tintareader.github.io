// Massimo Vignelli: the Unigrid way. One six-column grid, a black band at the
// head of each question, two typefaces in four sizes, and one colour. The
// colour is the app's new-word pink, so it means one thing only: new.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'vignelli',
  designer: 'Massimo Vignelli',
  title: 'One grid, three bands',
  known: 'Modernist designer of the Unigrid system for the US National Park Service, the Knoll and Heller identities, and The Vignelli Canon.',
  idea: 'Vignelli designed everything on one grid, with two typefaces, few sizes and one accent colour. Here a six-column grid runs through all three questions, each headed by a black band as on a Park Service brochure, with big Bodoni numerals for the data and a grotesque for the words. The accent is the app\'s new-word pink in place of his red, so it marks new words and nothing else.',
  how: [
    'Can I read this? The verdict comes first, in bold. Two big numerals follow: about 1 in 8 words is new, and 86% are known. One bar shows known, learning and new against the two marks, and the counts sit under it on the same grid.',
    'What will help most? The seven words make a ruled table in three grid columns: word, times, meaning. A total line adds up the times: 16 of your 33 lookups. The button sits under the word column, and 92% sits under the meaning column at the size of the numerals above.',
    'Am I getting better? Two columns, one for each measure, with the same parts in the same order: label, numeral, line, note. They line up with the two numerals in the first question.',
  ],
  type: 'Libre Bodoni (Pablo Impallari) for numerals and Spanish words, in place of Bodoni. Inter Tight (Rasmus Andersson) for everything else, in place of Helvetica. Both from Google Fonts.',
};

export const fonts = [
  { family: 'Inter Tight', style: 'normal', weight: '400 800', file: 'InterTight-normal-400_800.woff2' },
  { family: 'Libre Bodoni', style: 'normal', weight: '400 700', file: 'LibreBodoni-normal-400_700.woff2' },
];

// The grid: 408 px panel, 16 px margins, six 56 px columns with 8 px gutters.
const COL = 56, GUT = 8, W = 6 * COL + 5 * GUT; // 376
const span = (n) => n * COL + (n - 1) * GUT;      // 1→56, 3→184, 6→376

function line(points, w, h, label) {
  const t0 = Date.parse(points[0].d), t1 = Date.parse(points.at(-1).d);
  const vs = points.map(p => p.v), lo = Math.min(...vs), hi = Math.max(...vs);
  const pad = 3;
  const xy = points.map(p => [((Date.parse(p.d) - t0) / (t1 - t0 || 1)) * (w - pad), pad + (1 - (p.v - lo) / (hi - lo || 1)) * (h - 2 * pad)]);
  const d = xy.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
  const [ex, ey] = xy.at(-1);
  return `<svg class="vg-line" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
    <line x1="0" x2="${w}" y1="${h - 0.5}" y2="${h - 0.5}" class="vg-axis"/>
    <path d="${d}" fill="none" class="vg-trace"/>
    <rect x="${(ex - 3).toFixed(1)}" y="${(ey - 3).toFixed(1)}" width="6" height="6" class="vg-end"/>
  </svg>`;
}

function scale(D) {
  const H = 30, BY = 16, BH = 12;
  const segs = [];
  let x = 0;
  for (const [n, cls] of [[D.counts.k, 'vg-sk'], [D.counts.l, 'vg-sl'], [D.counts.u, 'vg-su']]) {
    if (!n) continue;
    const w = (n / D.total) * W;
    segs.push(`<rect x="${x.toFixed(1)}" y="${BY}" width="${Math.max(1, w - 1).toFixed(1)}" height="${BH}" class="${cls}"/>`);
    x += w;
  }
  const mark = (pct, text) => {
    const mx = (pct / 100) * W;
    return `<line x1="${mx.toFixed(1)}" x2="${mx.toFixed(1)}" y1="1" y2="${BY}" class="vg-tick"/><text x="${(mx - 5).toFixed(1)}" y="10" text-anchor="end">${text}</text>`;
  };
  const t = D.thresholds;
  return `<svg class="vg-scale" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${D.total} words: ${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new. Workable from ${t.workable}% at ${D.level}, comfortable from ${t.comfortable}%.">
    ${segs.join('')}
    ${mark(t.workable, `${t.workable}% workable at ${D.level}`)}
    ${mark(t.comfortable, `${t.comfortable}% comfortable`)}
  </svg>`;
}

export function html(D) {
  const v = D.verdict;
  const rows = D.repeated.map(r => `
      <li class="vg-g"><span class="vg-w vg-c12" lang="es">${esc(r.word)}</span><span class="vg-x vg-c3">${r.count}×</span><span class="vg-gl vg-c46">${esc(r.gloss)}</span></li>`).join('');
  const series = D.series.map(p => ({ d: p.d, v: p.v }));
  const hist = D.history.map(p => ({ d: p.d, v: p.k }));
  return `
<div class="mp mp-vignelli">
  <section class="vg-s">
    <h2 class="vg-band">Can I read this?</h2>
    <p class="vg-verdict vg-in"><b>${esc(v.label)}</b> at ${D.level}</p>
    <div class="vg-g vg-figs">
      <div class="vg-fig vg-c13"><span class="vg-kick">About</span><span class="vg-num">1 in ${D.oneIn}</span><span class="vg-cap">words is new to you</span></div>
      <div class="vg-fig vg-c46"><span class="vg-kick">Known</span><span class="vg-num">${D.pct}<span class="vg-pc">%</span></span><span class="vg-cap">of the running words</span></div>
    </div>
    <div class="vg-in">${scale(D)}</div>
    <div class="vg-g vg-counts">
      <div class="vg-c1"><b>${fmt(D.counts.k)}</b><span>known</span></div>
      <div class="vg-c2"><b class="vg-l">${fmt(D.counts.l)}</b><span>learning</span></div>
      <div class="vg-c3"><b class="vg-u">${fmt(D.counts.u)}</b><span>new</span></div>
      <div class="vg-c46"><b>${D.lookups} lookups</b><span>in ${fmt(D.total)} words</span></div>
    </div>
  </section>

  <section class="vg-s">
    <h2 class="vg-band">What will help most?</h2>
    <p class="vg-sub vg-in">New words that come back in this text</p>
    <ol class="vg-list">${rows}
      <li class="vg-g vg-sum"><span class="vg-x vg-c3">${D.repeatedTokens}</span><span class="vg-c46">of your ${D.lookups} lookups</span></li>
    </ol>
    <div class="vg-g vg-act">
      <div class="vg-c13 vg-do"><button class="vg-btn" type="button"><span>${esc(D.action)}</span><span class="vg-plus" aria-hidden="true">+</span></button></div>
      <div class="vg-fig vg-c46"><span class="vg-num">${D.after}<span class="vg-pc">%</span></span><span class="vg-cap">of this text, knowing them</span></div>
    </div>
  </section>

  <section class="vg-s">
    <h2 class="vg-band">Am I getting better?</h2>
    <div class="vg-g vg-figs">
      <div class="vg-fig vg-c13"><span class="vg-kick">This text</span><span class="vg-num"><small>${D.firstPct}% →</small> ${D.pct}<span class="vg-pc">%</span></span>${line(series, span(3), 24, `This text: ${D.firstPct}% known on ${dShort(D.since)}, ${D.pct}% now`)}<span class="vg-cap">since ${dShort(D.since)}</span></div>
      <div class="vg-fig vg-c46"><span class="vg-kick">Words known</span><span class="vg-num">${fmt(D.known)}</span>${line(hist, span(3), 24, `Words known: ${fmt(D.history[0].k)} on ${dShort(D.history[0].d)}, ${fmt(D.known)} now`)}<span class="vg-cap">+${fmt(D.gain7)} this week</span></div>
    </div>
  </section>

  <p class="vg-foot vg-in"><a href="#stats">${esc(D.more)}<span aria-hidden="true"> →</span></a></p>
</div>`;
}

export const css = `
.mp-vignelli {
  --vg-rule: color-mix(in srgb, var(--ink) 24%, transparent);
  font-family: "Inter Tight", var(--font-ui);
  font-size: 12.5px; line-height: 16px; font-weight: 400;
  color: var(--ink);
  font-variant-numeric: lining-nums;
  padding: 6px 0 12px;
}
.mp-vignelli * { box-sizing: border-box; }
.mp-vignelli p, .mp-vignelli h2, .mp-vignelli ol { margin: 0; padding: 0; }
.mp-vignelli .vg-in { margin-inline: 16px; }
.mp-vignelli .vg-g { display: grid; grid-template-columns: repeat(6, ${COL}px); column-gap: ${GUT}px; margin-inline: 16px; }
.mp-vignelli .vg-c1 { grid-column: 1; }
.mp-vignelli .vg-c2 { grid-column: 2; }
.mp-vignelli .vg-c3 { grid-column: 3; }
.mp-vignelli .vg-c12 { grid-column: 1 / span 2; }
.mp-vignelli .vg-c13 { grid-column: 1 / span 3; }
.mp-vignelli .vg-c46 { grid-column: 4 / span 3; }

/* The band */
.mp-vignelli .vg-s + .vg-s { margin-top: 20px; }
.mp-vignelli .vg-band { height: 28px; padding: 0 16px; background: var(--ink); color: var(--panel); font: 700 17px/28px "Inter Tight", var(--font-ui); letter-spacing: -.01em; }

/* Type */
.mp-vignelli .vg-kick { font-weight: 600; }
.mp-vignelli .vg-cap { color: var(--dim); }
.mp-vignelli .vg-num { font-family: "Libre Bodoni", serif; font-size: 48px; line-height: 40px; font-weight: 400; letter-spacing: -.02em; white-space: nowrap; margin-top: 6px; }
.mp-vignelli .vg-num small { font: 400 17px/1 "Inter Tight", var(--font-ui); letter-spacing: 0; vertical-align: baseline; }
.mp-vignelli .vg-pc { font-size: 28px; line-height: 0; vertical-align: 13px; margin-left: 2px; }
.mp-vignelli .vg-u { color: var(--c-unknown); }
.mp-vignelli .vg-l { color: var(--c-learning); }

/* 1 */
.mp-vignelli .vg-verdict { margin-top: 12px; font-size: 17px; line-height: 22px; }
.mp-vignelli .vg-verdict b { font-weight: 700; }
.mp-vignelli .vg-figs { margin-top: 10px; }
.mp-vignelli .vg-fig { display: flex; flex-direction: column; }
.mp-vignelli .vg-scale { margin-top: 12px; }
.mp-vignelli .vg-scale text { font: 500 11px "Inter Tight", var(--font-ui); fill: var(--ink); }
.mp-vignelli .vg-tick { stroke: var(--ink); stroke-width: 1; }
.mp-vignelli .vg-sk { fill: var(--band-k); }
.mp-vignelli .vg-sl { fill: var(--band-l); }
.mp-vignelli .vg-su { fill: var(--c-unknown); }
.mp-vignelli .vg-counts { margin-top: 6px; }
.mp-vignelli .vg-counts div { display: flex; flex-direction: column; }
.mp-vignelli .vg-counts b { font-size: 17px; line-height: 22px; font-weight: 700; }
.mp-vignelli .vg-counts span { font-size: 11px; line-height: 14px; color: var(--dim); }

/* 2 */
.mp-vignelli .vg-sub { margin-top: 10px; font-weight: 600; }
.mp-vignelli .vg-list { list-style: none; margin-top: 6px; border-top: 2px solid var(--ink); margin-inline: 16px; }
.mp-vignelli .vg-list li { margin: 0; align-items: baseline; height: 22px; padding-top: 1px; border-bottom: 1px solid var(--vg-rule); }
.mp-vignelli .vg-w { color: var(--c-unknown); font: 400 17px/20px "Libre Bodoni", serif; }
.mp-vignelli .vg-x { font-weight: 700; font-variant-numeric: tabular-nums; }
.mp-vignelli .vg-gl { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-vignelli .vg-act { margin-top: 12px; }
.mp-vignelli .vg-do { display: flex; flex-direction: column; }
.mp-vignelli .vg-list li:nth-last-child(2) { border-bottom-color: var(--ink); }
.mp-vignelli .vg-list li.vg-sum { border-bottom: 0; }
.mp-vignelli .vg-list li.vg-sum { height: 24px; padding-top: 4px; }
.mp-vignelli .vg-btn { margin-top: 6px; width: ${span(3)}px; height: 40px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; border: 0; border-radius: 0; background: var(--ink); color: var(--panel); font: 700 12.5px/1 "Inter Tight", var(--font-ui); text-align: left; cursor: pointer; }
.mp-vignelli .vg-plus { font-size: 17px; font-weight: 400; }
.mp-vignelli .vg-btn:active { transform: translateY(1px); }
.mp-vignelli .vg-btn:hover { background: color-mix(in srgb, var(--ink) 85%, var(--panel)); }

/* 3 */
.mp-vignelli .vg-line { margin-top: 6px; margin-bottom: 4px; }
.mp-vignelli .vg-axis { stroke: var(--vg-rule); stroke-width: 1; }
.mp-vignelli .vg-trace { stroke: var(--ink); stroke-width: 1.5; stroke-linejoin: round; }
.mp-vignelli .vg-end { fill: var(--ink); }

/* Footer */
.mp-vignelli .vg-foot { margin-top: 16px; padding-top: 8px; border-top: 2px solid var(--ink); }
.mp-vignelli .vg-foot a { color: var(--ink); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
`;
