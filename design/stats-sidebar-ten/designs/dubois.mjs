// W.E.B. Du Bois and the Atlanta University students: the data portraits made
// for the 1900 Paris Exposition. Flat colour, lettered capitals, a spiral that
// coils a long quantity into a small space, proportional bars, small circular
// legends, and titles that state the subject in full.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'dubois',
  designer: 'W.E.B. Du Bois',
  title: 'One reader and one text, in three plates',
  known: 'The hand-drawn charts of Black life in Georgia that he and his Atlanta University students made for the 1900 Paris Exposition.',
  idea: 'Du Bois drew statistics as plates: a title that names the subject in full, one bold figure in flat colour, and a small legend of coloured circles. Here each question is one plate on a parchment ground, or on the dark app ground in the dark theme. The text\'s words coil into a spiral, the way his population counts did, and every number is lettered in capitals next to its shape.',
  how: [
    'Can I read this? The 262 words run in reading order along a band that starts at the left and coils into a spiral. New words are pink flecks in it, about one in eight. A circle legend gives the counts, and a proportional bar shows 86% known against the marks for workable and comfortable.',
    'What will help most? Each word that comes back gets a short pink bar with one block for each time it appears, then its count and its gloss. A gold button adds the seven to Learning. Next to it: knowing them, 92% of this text.',
    'Am I getting better? Two flat stepped shapes share one time line, from 18 Aug to today: this text\'s share known, and words known counted from zero. The last week\'s gain is green, with a green strip under the week.',
  ],
  type: 'Mohave (Tokotype, from Google Fonts) for titles, the large figures and the button: narrow capitals with a lettered feel. Sofia Sans Condensed (Lettersoup, from Google Fonts) for legends, glosses and small labels.',
};

export const fonts = [
  { family: 'Mohave', style: 'normal', weight: '300 700', file: 'Mohave-normal-300_700.woff2' },
  { family: 'Sofia Sans Condensed', style: 'normal', weight: '400 800', file: 'SofiaSansCondensed-normal-400_800.woff2' },
];

const W = 363; // content width: the 399 px panel less two 18 px gutters
const CHART_X = 120; // where the daily shapes start in question 3
const f1 = (n) => (Math.round(n * 10) / 10).toString();

// ---- The 262 words as a band: a straight lead-in along the bottom, then a coil.
function spiral(D) {
  const band = 10, pitch = 13.5, Rout = 71, rIn = 13;
  const cx = W - Rout - band / 2, cy = Rout + band / 2;
  // Sample the centre line: the tail from x=0 to the bottom of the coil, then the coil, anticlockwise.
  const pts = [[0, cy + Rout], [cx, cy + Rout]];
  const Phi = 2 * Math.PI * (Rout - rIn) / pitch;
  for (let phi = 0.02; phi <= Phi; phi += 0.02) {
    const r = Rout - pitch * phi / (2 * Math.PI), a = Math.PI / 2 - phi;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const acc = [0];
  for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = acc.at(-1);
  const at = (s) => {
    let lo = 0, hi = acc.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (acc[m] <= s) lo = m; else hi = m; }
    const t = (s - acc[lo]) / ((acc[hi] - acc[lo]) || 1);
    return [pts[lo][0] + t * (pts[hi][0] - pts[lo][0]), pts[lo][1] + t * (pts[hi][1] - pts[lo][1]), lo];
  };
  const seg = (s0, s1) => {
    const a = at(s0), b = at(s1), out = [a];
    for (let i = a[2] + 1; i <= b[2]; i++) out.push(pts[i]);
    out.push(b);
    return out.map((q, i) => `${i ? 'L' : 'M'}${f1(q[0])} ${f1(q[1])}`).join('');
  };
  const n = D.tokens.length, L = total / n;
  // Runs of learning and new words, drawn over one known-coloured band.
  const runs = [];
  D.tokens.forEach((tok, i) => {
    const s = tok.s === 'u' ? 'u' : tok.s === 'l' ? 'l' : 'k';
    if (s === 'k') return;
    const last = runs.at(-1);
    if (last && last.s === s && last.end === i) last.end = i + 1; else runs.push({ s, start: i, end: i + 1 });
  });
  const marks = runs.map(r => `<path d="${seg(r.start * L, r.end * L)}" class="db-${r.s}"/>`).join('');
  const H = Math.ceil(cy + Rout + band / 2 + 1);
  return `<svg class="db-coil" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="The ${n} words of this text in reading order, along a band that coils into a spiral: ${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new, about 1 word in ${D.oneIn}."><g fill="none" stroke-width="${band}" stroke-linejoin="round"><path d="${seg(0, total)}" class="db-kb"/>${marks}</g></svg>`;
}

// ---- The proportional bar: known, learning, new, with the two marks under it.
function scale(D) {
  const H = 22, y = 0, t = D.thresholds;
  let x = 0; const segs = [];
  for (const [k, n] of [['k', D.counts.k], ['l', D.counts.l], ['u', D.counts.u]]) {
    if (!n) continue;
    const w = n / D.total * W;
    segs.push(`<rect x="${f1(x)}" y="${y}" width="${f1(w)}" height="${H}" class="db-f${k}"/>`);
    x += w;
  }
  const kx = D.counts.k / D.total * W;
  const wx = t.workable / 100 * W, cxp = t.comfortable / 100 * W;
  return `<svg class="db-scale" viewBox="0 0 ${W} 42" width="${W}" height="42" role="img" aria-label="${D.pct}% of the running words known. Marks: ${t.workable}% workable at ${D.level}, ${t.comfortable}% comfortable.">
  ${segs.join('')}
  <text x="${f1(kx - 8)}" y="${y + 15.5}" text-anchor="end" class="db-inbar">${D.pct}% KNOWN</text>
  <path d="M${f1(wx)} ${H + 2}V${H + 8}M${f1(cxp)} ${H + 2}V${H + 8}" class="db-tick"/>
  <text x="${f1(wx)}" y="${H + 19}" text-anchor="middle" class="db-mark">${t.workable}% WORKABLE AT ${esc(D.level)}</text>
  <text x="${W}" y="${H + 19}" text-anchor="end" class="db-mark">${t.comfortable}% COMFORTABLE</text>
</svg>`;
}

// ---- Daily shapes on one shared time line.
function timeline(D) {
  const t0 = Date.parse(D.since), t1 = Date.parse(D.history.at(-1).d);
  const span = Math.round((t1 - t0) / 864e5) + 1;
  const CW = W - CHART_X, step = CW / span;
  const xOf = (d) => Math.round((Date.parse(d) - t0) / 864e5) * step;
  // A stepped shape: each day you read holds its value until the next one.
  const stepped = (pts, H, yOf, x0 = 0) => {
    const run = pts.filter(p => xOf(p.d) + step > x0);
    let d = `M${f1(Math.max(x0, xOf(run[0].d)))} ${H}`;
    run.forEach((p, i) => {
      const xb = i < run.length - 1 ? xOf(run[i + 1].d) : CW;
      d += `V${f1(yOf(p))}H${f1(xb)}`;
    });
    return d + `V${H}Z`;
  };
  // This text: share known, on a cut scale from a round floor under the lowest value.
  // The floor is lettered at the base, with a break mark, so the cut is plain to see.
  const H1 = 44, vs = D.series.map(s => s.v), floor = Math.floor((Math.min(...vs) - 4) / 5) * 5, top = Math.max(...vs);
  const textShape = `<path d="${stepped(D.series, H1, p => H1 - (p.v - floor) / (top - floor) * H1)}" class="db-ct"/>`
    + `<text x="5" y="${H1 - 4.5}" class="db-base">${floor}%</text>`
    + `<path d="M31 ${H1 + 0.5}l4 -9M36 ${H1 + 0.5}l4 -9" class="db-break"/>`;
  // Words known: from zero; the gain of the last seven days in green on top.
  const H2 = 48, kmax = Math.max(...D.history.map(h => h.k)), base = D.known - D.gain7;
  const yK = p => H2 - p.k / kmax * H2, yBase = H2 - base / kmax * H2;
  const weekX = CW - 7 * step;
  const gain = D.history.filter(h => Date.parse(h.d) > t1 - 7 * 864e5);
  const knownShape = `<path d="${stepped(D.history, H2, yK)}" class="db-ck"/><path d="${stepped(gain, yBase, p => Math.min(yBase, yK(p)), weekX)}" class="db-cg"/><rect x="${f1(weekX)}" y="${H2 + 3}" width="${f1(CW - weekX)}" height="3.5" class="db-cg"/>`;
  const textSvg = `<svg class="db-cols" viewBox="0 0 ${CW} ${H1}" width="${CW}" height="${H1}" role="img" aria-label="This text, share of words known on each day you read: ${D.firstPct}% on ${dShort(D.since)}, ${D.pct}% now. The scale starts at ${floor}%, not zero.">${textShape}</svg>`;
  const knownSvg = `<svg class="db-cols" viewBox="0 0 ${CW} ${H2 + 7}" width="${CW}" height="${H2 + 7}" role="img" aria-label="Words known on each day you read, from ${fmt(D.history[0].k)} on ${dShort(D.since)} to ${fmt(D.known)} now; ${D.gain7} gained this week.">${knownShape}</svg>`;
  return { textSvg, knownSvg };
}

export function html(D) {
  const back = D.repeated.map(r => {
    const unit = 18, bw = r.count * unit;
    const notches = Array.from({ length: r.count - 1 }, (_, i) => `<line x1="${(i + 1) * unit}" x2="${(i + 1) * unit}" y1="0" y2="12"/>`).join('');
    return `<li><span class="db-w" lang="es">${esc(r.word)}</span><span class="db-n"><svg viewBox="0 0 ${bw} 12" width="${bw}" height="12" aria-hidden="true"><rect width="${bw}" height="12"/>${notches}</svg><b>${r.count}×</b></span><span class="db-g">${esc(r.gloss)}</span></li>`;
  }).join('');
  const { textSvg, knownSvg } = timeline(D);
  return `
<div class="mp mp-dubois">
  <section class="db-plate">
    <h2 class="db-t">Can I read this?</h2>
    <p class="db-s">The ${D.total} words of this text, in reading order.</p>
    <div class="db-hero">
      ${spiral(D)}
      <div class="db-say">
        <p class="db-big">About 1 word in ${D.oneIn} is <span class="db-nw">new</span> to you.</p>
        <p class="db-lk">${D.lookups} lookups in ${D.total} words.</p>
        <ul class="db-legend">
          <li><i class="db-dk"></i><b>${D.counts.k}</b> known</li>
          <li><i class="db-dl"></i><b>${D.counts.l}</b> learning</li>
          <li><i class="db-du"></i><b>${D.counts.u}</b> new</li>
        </ul>
      </div>
    </div>
    <p class="db-verdict">${esc(D.verdict.label)}, at ${esc(D.level)}.</p>
    ${scale(D)}
  </section>

  <section class="db-plate">
    <h2 class="db-t">What will help most?</h2>
    <p class="db-s">New words that come back in this text: ${D.repeatedTokens} of your ${D.lookups} lookups.</p>
    <ul class="db-back">${back}</ul>
    <div class="db-act">
      <button class="db-btn" type="button">${esc(D.action)}</button>
      <p class="db-after"><span>Knowing them:</span> <b>${D.after}%</b> <span>of this text</span></p>
    </div>
  </section>

  <section class="db-plate">
    <h2 class="db-t">Am I getting better?</h2>
    <p class="db-s">Each day you read, ${dShort(D.since)} to today.</p>
    <div class="db-row">
      <p class="db-rt"><span class="db-rl">This text</span><span class="db-rv">${D.firstPct}% <span class="db-ar">→</span> ${D.pct}%</span><span class="db-rn">since ${dShort(D.since)}</span></p>
      ${textSvg}
    </div>
    <div class="db-row">
      <p class="db-rt"><span class="db-rl">Words known</span><span class="db-rv">${fmt(D.known)}</span><span class="db-rn db-gain">+${D.gain7} this week</span></p>
      ${knownSvg}
    </div>
    <div class="db-axis"><span>${dShort(D.since)}</span><span>Today</span></div>
  </section>

  <a class="db-more" href="#stats">${esc(D.more)}<span aria-hidden="true"> →</span></a>
</div>`;
}

export const css = `
.mp-dubois {
  --db-ground: transparent;
  --db-ink: #ecdfc6;
  --db-dim: #b9a888;
  --db-track: #2d2923;
  --db-gold: #f0b429;
  --db-gold-edge: #9c6f0c;
  --db-gold-ink: #1b1611;
  --db-green: #62b26f;
  --db-blue: #6f93e4;
  --db-link: #a9bdf0;
  --db-cut: #161a20;
  --db-lt: "Mohave", var(--font-ui);
  --db-sm: "Sofia Sans Condensed", var(--font-ui);
  box-sizing: border-box;
  background: var(--db-ground);
  /* the ground fills the whole panel; the scrolling panel clips the spread */
  box-shadow: 0 0 0 1200px var(--db-ground);
  color: var(--db-ink);
  font-family: var(--db-sm);
  padding: 10px 18px 16px;
}
:root[data-theme="light"] .mp-dubois {
  --db-ground: #ede0c6;
  --db-ink: #1e1914;
  --db-dim: #6a5034;
  --db-track: #dcc8a4;
  --db-gold: #eaa81c;
  --db-gold-edge: #9a6a08;
  --db-gold-ink: #1e1914;
  --db-green: #2f7a45;
  --db-blue: #26427f;
  --db-link: #26427f;
  --db-cut: #ede0c6;
}
.mp-dubois p, .mp-dubois ul, .mp-dubois h2 { margin: 0; padding: 0; }
.mp-dubois ul { list-style: none; }
.mp-dubois .db-plate + .db-plate { margin-top: 21px; }
.mp-dubois .db-t { font: 600 18px/1 var(--db-lt); letter-spacing: .07em; text-transform: uppercase; text-align: center; color: var(--db-ink); }
.mp-dubois .db-s { font: 500 11px/1.3 var(--db-sm); letter-spacing: .07em; text-transform: uppercase; text-align: center; color: var(--db-dim); margin-top: 5px; }

/* 1 */
.mp-dubois .db-hero { position: relative; margin-top: 12px; }
.mp-dubois .db-coil .db-kb { stroke: var(--db-ink); }
.mp-dubois .db-coil .db-u { stroke: var(--c-unknown); }
.mp-dubois .db-coil .db-l { stroke: var(--db-gold); }
.mp-dubois .db-say { position: absolute; left: 0; top: 0; width: 190px; }
.mp-dubois .db-big { font: 600 23px/1.04 var(--db-lt); letter-spacing: .03em; text-transform: uppercase; }
.mp-dubois .db-nw { color: var(--c-unknown); }
.mp-dubois .db-lk { font: 500 12px/1.2 var(--db-sm); letter-spacing: .06em; text-transform: uppercase; color: var(--db-dim); margin-top: 6px; }
.mp-dubois .db-legend { margin-top: 10px; display: grid; gap: 3px; }
.mp-dubois .db-legend li { display: flex; align-items: center; gap: 7px; font: 500 12px/1.2 var(--db-sm); letter-spacing: .06em; text-transform: uppercase; }
.mp-dubois .db-legend b { font-weight: 700; font-variant-numeric: tabular-nums; min-width: 22px; text-align: right; }
.mp-dubois .db-legend i { width: 11px; height: 11px; border-radius: 50%; flex: none; }
.mp-dubois .db-dk { background: var(--db-ink); }
.mp-dubois .db-dl { background: var(--db-gold); }
.mp-dubois .db-du { background: var(--c-unknown); }
.mp-dubois .db-verdict { font: 600 17px/1.1 var(--db-lt); letter-spacing: .05em; text-transform: uppercase; margin: 12px 0 6px; }
.mp-dubois .db-scale .db-fk { fill: var(--db-ink); }
.mp-dubois .db-scale .db-fl { fill: var(--db-gold); }
.mp-dubois .db-scale .db-fu { fill: var(--c-unknown); }
.mp-dubois .db-scale .db-inbar { font: 600 12px var(--db-sm); letter-spacing: .08em; fill: var(--db-cut); }
.mp-dubois .db-scale .db-tick { stroke: var(--db-ink); stroke-width: 1.5; }
.mp-dubois .db-scale .db-mark { font: 500 11px var(--db-sm); letter-spacing: .06em; fill: var(--db-dim); }

/* 2 */
.mp-dubois .db-back { margin-top: 10px; display: grid; }
.mp-dubois .db-back li { display: grid; grid-template-columns: 86px 108px 1fr; align-items: center; height: 21px; }
.mp-dubois .db-w { font: 650 16px/1 var(--db-sm); color: var(--c-unknown); }
.mp-dubois .db-n { display: flex; align-items: center; gap: 6px; }
.mp-dubois .db-n rect { fill: var(--c-unknown); }
.mp-dubois .db-n line { stroke: var(--db-cut); stroke-width: 2; }
.mp-dubois .db-n b { font: 600 14px/1 var(--db-lt); letter-spacing: .03em; }
.mp-dubois .db-g { font: 500 11.5px/1.1 var(--db-sm); letter-spacing: .06em; text-transform: uppercase; color: var(--db-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-dubois .db-act { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.mp-dubois .db-btn { font: 600 15px/1 var(--db-lt); letter-spacing: .07em; text-transform: uppercase; color: var(--db-gold-ink); background: var(--db-gold); border: 0; border-radius: 3px; padding: 9px 14px 8px; box-shadow: 0 3px 0 var(--db-gold-edge); cursor: pointer; white-space: nowrap; }
.mp-dubois .db-btn:hover { filter: brightness(1.06); }
.mp-dubois .db-btn:active { transform: translateY(2px); box-shadow: 0 1px 0 var(--db-gold-edge); }
.mp-dubois .db-after { font: 500 12px/1.2 var(--db-sm); letter-spacing: .06em; text-transform: uppercase; color: var(--db-dim); }
.mp-dubois .db-after b { font: 600 19px/1 var(--db-lt); color: var(--db-ink); letter-spacing: .02em; }

/* 3 */
.mp-dubois .db-row { display: grid; grid-template-columns: ${CHART_X}px 1fr; align-items: end; margin-top: 10px; }
.mp-dubois .db-rt { display: grid; gap: 4px; }
.mp-dubois .db-rl { font: 600 12px/1 var(--db-sm); letter-spacing: .08em; text-transform: uppercase; }
.mp-dubois .db-rv { font: 600 22px/1 var(--db-lt); letter-spacing: .02em; }
.mp-dubois .db-ar { font-family: var(--db-sm); font-weight: 500; color: var(--db-dim); }
.mp-dubois .db-rn { font: 500 11.5px/1 var(--db-sm); letter-spacing: .06em; text-transform: uppercase; color: var(--db-dim); }
.mp-dubois .db-gain { color: var(--db-green); font-weight: 700; }
.mp-dubois .db-ct { fill: var(--db-blue); }
.mp-dubois .db-base { font: 700 11px var(--db-sm); letter-spacing: .04em; fill: var(--db-cut); }
.mp-dubois .db-break { fill: none; stroke: var(--db-cut); stroke-width: 2; }
.mp-dubois .db-ck { fill: var(--db-ink); }
.mp-dubois .db-cg { fill: var(--db-green); }
.mp-dubois .db-axis { display: flex; justify-content: space-between; margin: 2px 0 0 ${CHART_X}px; font: 500 11px/1 var(--db-sm); letter-spacing: .06em; text-transform: uppercase; color: var(--db-dim); }

.mp-dubois .db-more { display: inline-block; margin-top: 14px; font: 600 15px/1 var(--db-lt); letter-spacing: .07em; text-transform: uppercase; color: var(--db-link); text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 4px; }
`;
