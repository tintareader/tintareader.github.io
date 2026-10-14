// Harry Beck: the panel as an Underground diagram. Lines run only flat,
// upright or at 45 degrees; stops are evenly spaced; stations are ticks,
// words that come back are linked interchange rings; a key explains the marks.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'beck',
  designer: 'Harry Beck',
  title: 'Line diagram',
  known: 'The 1933 London Underground diagram.',
  idea: 'Beck drew the order of stations, not the distance between them, and kept every line flat, upright or at 45 degrees. Here the text and your progress are drawn the same way: evenly spaced stops, ticks for stations, linked rings for interchanges, and a key at the foot.',
  how: [
    'Can I read this? Eight evenly spaced stops, the eighth a pink new word, give the 1 in 8. A single line in three colours carries the 227, 2 and 33 words, with the 60% and 95% marks as stations and a tick where you are, at 86%.',
    'What will help most? A pink line with one stop for each new word that comes back. Each stop has one ring for every time the word appears, joined like an interchange. The line ends at the button and the 92% it would bring.',
    'Am I getting better? Two lines run from 18 Aug to today, one stop per reading day. They only climb at 45 degrees: one step for each point of this text, and one for each 100 words known. Both end in rings joined as one interchange: today.',
  ],
  type: 'Cabin (Google Fonts, SIL Open Font License), a humanist sans drawn after Edward Johnston and Eric Gill, for all lettering.',
};

export const fonts = [{ family: 'Cabin', style: 'normal', weight: '400 700', file: 'Cabin-normal-400_700.woff2' }];

const hsw = (...cls) => `<svg class="bk-hsw" viewBox="0 0 22 ${cls.length * 6 - 1}" width="22" height="${cls.length * 6 - 1}" aria-hidden="true">${cls.map((c, i) => `<rect class="${c}" x="0" y="${i * 6}" width="22" height="4.5"/>`).join('')}</svg>`;
const STEP = 100; // words known per step up in the progress diagram
const n1 = (v) => (Math.round(v * 10) / 10).toString();

// A line that only runs flat or at 45 degrees: one stop per day, evenly
// spaced; each change of level is one diagonal step that ends on its day.
function stairs(levels, x0, x1, yBase, h) {
  const n = levels.length, dx = (x1 - x0) / (n - 1), l0 = levels[0];
  let d = `M${n1(x0)} ${n1(yBase)}`, y = yBase;
  for (let i = 1; i < n; i++) {
    const x = x0 + i * dx, ny = yBase - (levels[i] - l0) * h, rise = y - ny;
    if (rise > 0) {
      const diag = Math.min(rise, dx);
      d += ` L${n1(x - diag)} ${n1(y)} L${n1(x)} ${n1(y - diag)}`;
      if (rise > diag) d += ` L${n1(x)} ${n1(ny)}`;
    } else if (i === n - 1) d += ` L${n1(x)} ${n1(ny)}`;
    y = ny;
  }
  return { d, end: [x1, y] };
}

export function html(D) {
  const W = 367; // the 399 px panel less 16 px each side
  const k = D.counts.k, l = D.counts.l, u = D.counts.u, T = D.total;

  // 1 in 8: eight evenly spaced stops; the eighth is a new word.
  const sp = 18, ex = (i) => 2 + i * sp;
  const eTicks = Array.from({ length: D.oneIn }, (_, i) => i === D.oneIn - 1
    ? `<rect class="bk-new" x="${ex(i) - 2}" y="2" width="4" height="20"/>`
    : `<rect class="bk-kfill" x="${ex(i) - 1.75}" y="4" width="3.5" height="8"/>`).join('');
  const eight = `<svg class="bk-eight-svg" viewBox="0 0 ${ex(D.oneIn - 1) + 4} 24" width="${ex(D.oneIn - 1) + 4}" height="24" role="img" aria-label="Eight evenly spaced stops, the eighth a new word: about 1 word in ${D.oneIn} is new">
    <rect class="bk-kfill" x="0" y="11" width="${ex(D.oneIn - 1)}" height="6"/>${eTicks}</svg>`;

  // The text as one line in three colours, with the two marks as stations.
  const xs = (p) => p / 100 * W;
  const wk = k / T * W, wl = (k + l) / T * W, Ly = 30, Lh = 7;
  const seg = (x0, x1, cls) => x1 - x0 > 0.5 ? `<rect class="${cls}" x="${n1(x0)}" y="${Ly - Lh / 2}" width="${n1(Math.max(1.5, x1 - x0))}" height="${Lh}"/>` : '';
  const xw = xs(D.thresholds.workable), xc = xs(D.thresholds.comfortable), xp = xs(D.pct);
  const scale = `<svg class="bk-scale" viewBox="0 0 ${W} 58" width="${W}" height="58" role="img" aria-label="${D.verdict.label} at ${D.level}. ${D.pct}% of the running words known: ${k} known, ${l} learning, ${u} new. Workable from ${D.thresholds.workable}% at ${D.level}, comfortable from ${D.thresholds.comfortable}%.">
    <text class="bk-verdict" x="0" y="13">${esc(D.verdict.label)}<tspan class="bk-at" dx="5">at ${esc(D.level)}</tspan></text>
    <text class="bk-here" x="${n1(xp)}" y="12" text-anchor="middle">${D.pct}% known</text>
    ${seg(0, wk - 1, 'bk-kfill')}${seg(wk + 1, wl - 1, 'bk-lfill')}${seg(wl + 1, W, 'bk-new')}
    <rect class="bk-tick" x="${n1(xw - 1.5)}" y="${Ly + Lh / 2}" width="3" height="6"/>
    <rect class="bk-tick" x="${n1(xc - 1.5)}" y="${Ly + Lh / 2}" width="3" height="6"/>
    <text class="bk-stn" x="${n1(xw + 1.5)}" y="53" text-anchor="end">${D.thresholds.workable}% workable at ${esc(D.level)}</text>
    <text class="bk-stn" x="${n1(xc + 1.5)}" y="53" text-anchor="end">${D.thresholds.comfortable}% comfortable</text>
    <rect class="bk-here-t" x="${n1(xp - 1.5)}" y="${Ly - Lh / 2 - 6}" width="3" height="6"/>
  </svg>`;
  const sw = (cls) => `<svg class="bk-sw" viewBox="0 0 16 6" width="16" height="6" aria-hidden="true"><rect class="${cls}" x="0" y="0" width="16" height="6"/></svg>`;
  const counts = `<ul class="bk-counts"><li>${sw('bk-kfill')}<span><b>${k}</b> known</span></li><li>${sw('bk-lfill')}<span><b>${l}</b> learning</span></li><li>${sw('bk-new')}<span><b>${u}</b> new</span></li></ul>`;

  // The words that come back: one stop each, one ring per appearance.
  const RS = 16, RX = 9;
  const maxN = Math.max(...D.repeated.map(r => r.count));
  const svgW = RX + (maxN - 1) * RS + 9;
  const rings = (n) => {
    const xe = RX + (n - 1) * RS;
    let s = `<line class="bk-pline" x1="${RX}" y1="0" x2="${RX}" y2="28"/>`;
    if (n > 1) s += `<line class="bk-conn" x1="${RX}" y1="14" x2="${xe}" y2="14"/>`;
    for (let j = 0; j < n; j++) s += `<circle class="bk-ring-u" cx="${RX + j * RS}" cy="14" r="5"/>`;
    return s;
  };
  const stops = D.repeated.map(r => `<li class="bk-stop"><svg viewBox="0 0 ${svgW} 28" width="${svgW}" height="28" role="img" aria-label="${esc(r.word)}: ${r.count} times in this text">${rings(r.count)}</svg><span class="bk-w">${esc(r.word)}</span><span class="bk-g">${esc(r.gloss)}</span></li>`).join('');
  const termTop = `<svg viewBox="0 0 ${svgW} 22" width="${svgW}" height="22" aria-hidden="true"><line class="bk-pline" x1="${RX}" y1="9" x2="${RX}" y2="22"/><rect class="bk-new" x="${RX - 7}" y="7.5" width="14" height="3.5"/></svg>`;
  const termEnd = `<svg viewBox="0 0 ${RX + 18} 44" width="${RX + 18}" height="44" aria-hidden="true"><path class="bk-pline bk-bend" d="M${RX} 0 V10 L${RX + 12} 22 H${RX + 19}"/></svg>`;

  // Progress: two lines from the first reading day to today.
  const J0 = 4, J1 = W - 128, H1 = 5.5, H2 = 4.5;
  const tv = D.series.map(q => q.v), kv = D.history.map(h => Math.floor(h.k / STEP));
  const yA = 18 + (Math.max(...tv) - tv[0]) * H1, yB = yA + 48;
  const A = stairs(tv, J0, J1, yA, H1), B = stairs(kv, J0, J1, yB, H2);
  const yAx = yB + 18, JH = yAx + 16;
  const nd = D.history.length, ddx = (J1 - J0) / (nd - 1);
  const dayTicks = D.history.map((_, i) => `<rect x="${n1(J0 + i * ddx - .6)}" y="${n1(yAx - 3)}" width="1.2" height="3"/>`).join('');
  const RC = J1 + 16;
  const journey = `<svg class="bk-journey" viewBox="0 0 ${W} ${JH}" width="${W}" height="${n1(JH)}" role="img" aria-label="This text: ${D.firstPct}% known on ${dShort(D.since)}, ${D.pct}% today. Words known: ${fmt(D.known)} today, up ${D.gain7} this week. One stop per reading day.">
    <path class="bk-aline" d="${A.d}"/><rect class="bk-a" x="${J0 - 1.75}" y="${n1(yA - 7)}" width="3.5" height="14"/>
    <line class="bk-conn-k" x1="${n1(A.end[0])}" y1="${n1(A.end[1])}" x2="${n1(B.end[0])}" y2="${n1(B.end[1])}"/>
    <circle class="bk-ring-a" cx="${n1(A.end[0])}" cy="${n1(A.end[1])}" r="5.5"/>
    <text class="bk-rl" x="${RC}" y="${n1(A.end[1] - 10)}">This text</text>
    <text class="bk-rv" x="${RC}" y="${n1(A.end[1] + 9)}"><tspan class="bk-from">${D.firstPct}% →</tspan> ${D.pct}%</text>
    <path class="bk-bline" d="${B.d}"/><rect class="bk-b" x="${J0 - 1.75}" y="${n1(yB - 7)}" width="3.5" height="14"/>
    <circle class="bk-ring-b" cx="${n1(B.end[0])}" cy="${n1(B.end[1])}" r="5.5"/>
    <text class="bk-rl" x="${RC}" y="${n1(B.end[1] - 10)}">Words known</text>
    <text class="bk-rv" x="${RC}" y="${n1(B.end[1] + 9)}">${fmt(D.known)}</text>
    <text class="bk-gain" x="${RC}" y="${n1(B.end[1] + 25)}">+${D.gain7} this week</text>
    <g class="bk-days">${dayTicks}</g>
    <text class="bk-date" x="${J0 - 2}" y="${n1(JH - 2)}">${dShort(D.since)}</text>
    <text class="bk-date" x="${J1 + 2}" y="${n1(JH - 2)}" text-anchor="end">Today</text>
  </svg>`;

  const key = `<div class="bk-key" role="note" aria-label="Key">
    <span class="bk-key-t">Key</span><div class="bk-key-i">
    <span class="bk-ki"><svg viewBox="0 0 22 14" width="22" height="14" aria-hidden="true"><rect class="bk-kfill" x="0" y="7" width="22" height="3.5"/><rect class="bk-new" x="9.25" y="0" width="3.5" height="14"/></svg>New word</span>
    <span class="bk-ki"><svg viewBox="0 0 30 14" width="30" height="14" aria-hidden="true"><line class="bk-conn" x1="7" y1="7" x2="23" y2="7"/><circle class="bk-ring-u" cx="7" cy="7" r="5"/><circle class="bk-ring-u" cx="23" cy="7" r="5"/></svg>One ring each time it appears</span>
    <span class="bk-ki"><svg viewBox="0 0 22 14" width="22" height="14" aria-hidden="true"><path class="bk-aline" d="M0 11 L7 11 L13 5 L22 5"/></svg>Each step up: 1 point, or ${STEP} words</span>
  </div></div>`;

  return `
<div class="mp mp-beck">
  <section class="bk-q">
    <h3 class="bk-h">${hsw('bk-kfill')}Can I read this?</h3>
    <p class="bk-lead">About 1 word in ${D.oneIn} is new to you</p>
    <div class="bk-eight">${eight}<span><b>${D.lookups}</b> lookups in <b>${T}</b> words</span></div>
    ${scale}
    ${counts}
  </section>
  <section class="bk-q">
    <h3 class="bk-h">${hsw('bk-new')}What will help most?</h3>
    <ol class="bk-route">
      <li class="bk-term">${termTop}<span class="bk-sub">New words that come back in this text</span></li>
      ${stops}
      <li class="bk-term bk-term-end">${termEnd}<button class="bk-btn" type="button">${esc(D.action)}</button><span class="bk-after">Knowing them: <b>${D.after}%</b> of this text</span></li>
    </ol>
  </section>
  <section class="bk-q">
    <h3 class="bk-h">${hsw('bk-a', 'bk-b')}Am I getting better?</h3>
    ${journey}
  </section>
  ${key}
  <a class="bk-more" href="#stats">${esc(D.more)}<span aria-hidden="true"> →</span></a>
</div>`;
}

export const css = `
.mp-beck {
  --bk-blue: #86a6f4; --bk-green: #5cc98c; --bk-ring: var(--panel);
  font-family: Cabin, var(--font-ui); color: var(--ink);
  padding: 10px 16px 16px; font-variant-numeric: lining-nums tabular-nums;
}
:root[data-theme="light"] .mp-beck { --bk-blue: #1f4ea3; --bk-green: #13793d; }
.mp-beck * { box-sizing: border-box; }
.mp-beck .bk-q { margin: 0 0 20px; }
.mp-beck .bk-h { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 700 12px/1.2 Cabin, var(--font-ui); letter-spacing: .1em; text-transform: uppercase; color: var(--ink); }
.mp-beck .bk-lead { margin: 0 0 6px; font-size: 19px; font-weight: 600; line-height: 1.2; letter-spacing: -.005em; }
.mp-beck .bk-eight { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; font-size: 13px; color: var(--dim); }
.mp-beck .bk-eight b { color: var(--ink); font-weight: 600; }
.mp-beck .bk-kfill { fill: var(--band-k); }
.mp-beck .bk-lfill { fill: var(--band-l); }
.mp-beck .bk-new { fill: var(--c-unknown); }
.mp-beck .bk-tick { fill: var(--dim); }
.mp-beck svg text { font-family: Cabin, var(--font-ui); }
.mp-beck .bk-verdict { font-size: 14.5px; font-weight: 700; fill: var(--ink); }
.mp-beck .bk-at { font-weight: 400; fill: var(--dim); }
.mp-beck .bk-here { font-size: 12.5px; font-weight: 600; fill: var(--ink); }
.mp-beck .bk-stn { font-size: 11.5px; fill: var(--dim); }
.mp-beck .bk-here-t { fill: var(--ink); }
.mp-beck .bk-counts { list-style: none; margin: 4px 0 0; padding: 0; display: flex; gap: 16px; font-size: 12.5px; color: var(--dim); }
.mp-beck .bk-counts li { display: flex; align-items: center; gap: 6px; }
.mp-beck .bk-counts b { color: var(--ink); font-weight: 600; }
.mp-beck .bk-route { list-style: none; margin: 0; padding: 0; }
.mp-beck .bk-route li { display: flex; align-items: center; }
.mp-beck .bk-route svg { flex: 0 0 auto; margin-right: 10px; }
.mp-beck .bk-sub { font-size: 12.5px; color: var(--dim); margin-top: -4px; }
.mp-beck .bk-pline { stroke: var(--c-unknown); stroke-width: 5; }
.mp-beck .bk-conn { stroke: var(--c-unknown); stroke-width: 3.5; }
.mp-beck .bk-ring-u { fill: var(--bk-ring); stroke: var(--c-unknown); stroke-width: 2.2; }
.mp-beck .bk-stop { height: 28px; }
.mp-beck .bk-w { width: 82px; font-size: 15px; font-weight: 600; color: var(--c-unknown); }
.mp-beck .bk-g { flex: 1; font-size: 13px; color: var(--ui); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-beck .bk-term-end svg { margin-right: 0; }
.mp-beck .bk-bend { fill: none; stroke-linejoin: round; }
.mp-beck .bk-btn { white-space: nowrap; font: 600 13px/1 Cabin, var(--font-ui); color: var(--panel); background: var(--ink); border: 0; border-radius: 5px; padding: 9px 13px; cursor: pointer; box-shadow: 0 2px 0 var(--dim); }
.mp-beck .bk-after { margin-left: 12px; font-size: 13px; color: var(--dim); white-space: nowrap; }
.mp-beck .bk-after b { color: var(--ink); font-size: 14px; }
.mp-beck .bk-aline, .mp-beck .bk-bline { fill: none; stroke-width: 4.5; stroke-linejoin: round; }
.mp-beck .bk-aline { stroke: var(--bk-blue); }
.mp-beck .bk-bline { stroke: var(--bk-green); }
.mp-beck .bk-a { fill: var(--bk-blue); }
.mp-beck .bk-b { fill: var(--bk-green); }
.mp-beck .bk-ring-a, .mp-beck .bk-ring-b { fill: var(--bk-ring); stroke: var(--ink); stroke-width: 2.2; }
.mp-beck .bk-rl { font-size: 12px; fill: var(--dim); }
.mp-beck .bk-rv { font-size: 17px; font-weight: 700; fill: var(--ink); }
.mp-beck .bk-from { font-size: 13px; font-weight: 400; fill: var(--dim); }
.mp-beck .bk-gain { font-size: 12.5px; font-weight: 600; fill: var(--bk-green); }
.mp-beck .bk-days { fill: var(--faint); }
.mp-beck .bk-date { font-size: 11.5px; fill: var(--dim); }
.mp-beck .bk-key { display: flex; align-items: flex-start; gap: 12px; padding: 9px 12px; border: 1.5px solid var(--card-line); border-radius: 4px; font-size: 12px; color: var(--ui); }
.mp-beck .bk-key-t { font-weight: 700; letter-spacing: .1em; text-transform: uppercase; font-size: 11px; color: var(--ink); line-height: 18px; padding-right: 12px; border-right: 1.5px solid var(--card-line); align-self: stretch; }
.mp-beck .bk-key-i { display: flex; flex-wrap: wrap; gap: 6px 16px; }
.mp-beck .bk-ki { display: inline-flex; align-items: center; gap: 7px; line-height: 18px; }
.mp-beck .bk-conn-k { stroke: var(--ink); stroke-width: 3; }
.mp-beck .bk-more { display: inline-block; margin-top: 12px; color: var(--accent); font: 600 13px/1.3 Cabin, var(--font-ui); text-decoration: underline; text-underline-offset: 3px; }
`;
