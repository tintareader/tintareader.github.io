// Charles Joseph Minard: the panel as a carte figurative. Each quantity is a
// band whose width is in proportion to its number of words, with the number
// written along it; a second variable runs in a strip beneath, tied to the
// band by thin drop lines.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'minard',
  designer: 'Charles Joseph Minard',
  title: 'Figurative map of a text',
  known: 'Flow maps, above all the 1869 map of Napoleon\'s army shrinking on its march to Moscow and back.',
  idea: 'Minard drew a quantity as a band whose width is the quantity, and let it split as parts left it. Here the words of the text, the lookups and the words you know are bands drawn to scale, with their numbers written along them. Your progress in this text runs in a strip beneath, like his temperatures.',
  how: [
    'Can I read this? The text\'s words enter as one band and split into known, learning and new, each as wide as its count. A scale beneath marks workable and comfortable, and a drop line shows where your share known falls.',
    'What will help most? The lookups run down as a pink band, drawn four times larger. Each new word that comes back peels off as a thread as wide as its count, with its gloss, and what is left is written at the end. The button and the share after learning them sit below.',
    'Am I getting better? The words you know form a band that widens day by day, with the last week bracketed. This text\'s share known runs as a line beneath, tied to the band by drop lines, like Minard\'s temperatures.',
  ],
  type: 'Old Standard TT (Alexey Kryukov, from Google Fonts), a revival of late 19th-century book and map faces, in roman, italic and bold.',
};

export const fonts = [
  { family: 'Old Standard TT', style: 'normal', weight: '400', file: 'OldStandardTT-normal-400.woff2' },
  { family: 'Old Standard TT', style: 'italic', weight: '400', file: 'OldStandardTT-italic-400.woff2' },
  { family: 'Old Standard TT', style: 'normal', weight: '700', file: 'OldStandardTT-normal-700.woff2' },
];

const W = 355;
const f = (n) => (Math.round(n * 10) / 10).toString();
const DAY = 864e5;
const dayOf = (iso) => Date.parse(iso + 'T12:00:00Z') / DAY;

// I. The text's words, splitting by status.
function q1(D) {
  const s = 0.25;                                   // one unit of width for four words
  const T = D.total * s, Tk = D.counts.k * s, Tl = D.counts.l * s, Tu = D.counts.u * s;
  const y0 = 16, xf = 104, xr = 64;                 // top of trunk, fork, length of the bend
  const kc = y0 + Tk / 2, lc = y0 + Tk + Tl / 2, uc = y0 + Tk + Tl + Tu / 2;
  const up = 7, dl = 13, du = 27;                   // known rises, learning and new fall away
  const xLe = 196, xUe = 196;                       // where the learning and new threads end
  const bend = (yc, dy, xEnd) => `M0 ${f(yc)}H${xf}C${xf + xr / 2} ${f(yc)} ${xf + xr / 2} ${f(yc + dy)} ${xf + xr} ${f(yc + dy)}H${xEnd}`;
  const kPath = bend(kc, -up, W), lPath = bend(lc, dl, xLe), uPath = bend(uc, du, xUe);
  const lw = Math.max(1, Tl), ky = kc - up;
  // the scale beneath: share of running words known, 0 to 100
  const sy = y0 + T + du + 27, X = (p) => p / 100 * W;
  const xp = X(D.pct), xw = X(D.thresholds.workable), xc = X(D.thresholds.comfortable);
  const ticks = Array.from({ length: 11 }, (_, i) => `<line x1="${f(X(i * 10))}" x2="${f(X(i * 10))}" y1="${sy}" y2="${sy + (i % 5 ? 3 : 5)}"/>`).join('');
  const h = sy + 32;
  return `<svg class="mn-q1" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="${D.total} words: ${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new. ${D.pct}% known; workable from ${D.thresholds.workable}% at ${D.level}, comfortable from ${D.thresholds.comfortable}%.">
    <text class="mn-num" x="1" y="${y0 - 5}"><tspan class="mn-b">${D.total}</tspan> words</text>
    <g class="mn-edge" fill="none">
      <path d="${kPath}" stroke-width="${f(Tk + 1.2)}"/>
    </g>
    <path class="mn-kband" d="${kPath}" stroke-width="${f(Tk)}" fill="none"/>
    <path class="mn-uband" d="${uPath}" stroke-width="${f(Tu)}" fill="none"/>
    <path class="mn-lband" d="${lPath}" stroke-width="${f(lw)}" fill="none"/>
    <text class="mn-in" x="${xf + xr + 10}" y="${f(ky + 4.5)}"><tspan class="mn-big">${D.counts.k}</tspan> known</text>
    <text class="mn-lab" x="${xLe + 6}" y="${f(lc + dl + 3.8)}"><tspan class="mn-n">${D.counts.l}</tspan> learning</text>
    <text class="mn-lab mn-pk" x="${xUe + 6}" y="${f(uc + du + 4)}"><tspan class="mn-n">${D.counts.u}</tspan> new</text>
    <line class="mn-drop" x1="${f(xp)}" x2="${f(xp)}" y1="${f(ky + Tk / 2)}" y2="${sy - 3}"/>
    <g class="mn-axis">
      <line x1="0" x2="${W}" y1="${sy}" y2="${sy}"/>${ticks}
      <line class="mn-mark" x1="${f(xw)}" x2="${f(xw)}" y1="${sy - 5}" y2="${sy + 7}"/>
      <line class="mn-mark" x1="${f(xc)}" x2="${f(xc)}" y1="${sy - 5}" y2="${sy + 7}"/>
    </g>
    <circle class="mn-dot" cx="${f(xp)}" cy="${sy}" r="3"/>
    <text class="mn-lab mn-b" x="${f(xp - 6)}" y="${sy - 6}" text-anchor="end">${D.pct}% known</text>
    <text class="mn-lab" x="${f(xw)}" y="${sy + 19}" text-anchor="middle">${D.thresholds.workable}% <tspan class="mn-it">workable at ${esc(D.level)}</tspan></text>
    <text class="mn-lab" x="${W}" y="${sy + 19}" text-anchor="end">${D.thresholds.comfortable}% <tspan class="mn-it">comfortable</tspan></text>
    <text class="mn-lab mn-d" x="0" y="${sy + 19}">0%</text>
  </svg>`;
}

// II. The lookups, from which each returning word peels off.
function q2(D) {
  const s = 1;                                       // four times the scale of I
  const rows = D.repeated, n = rows.length;
  const B = D.lookups * s, rest = D.lookups - D.repeatedTokens;
  const ty = 18, rh = 21, r0 = ty + 24, r = 9;
  const xw = 92, xg = 170;
  let right = B, out = '', labs = '';
  rows.forEach((w, i) => {
    const wd = w.count * s, xc = right - wd / 2, yc = r0 + i * rh;
    out += `<path d="M${f(xc)} ${ty}V${f(yc - r)}Q${f(xc)} ${f(yc)} ${f(xc + r)} ${f(yc)}H${xw - 8}" stroke-width="${f(wd)}"/>`;
    labs += `<text class="mn-cnt" x="${f((B + r + xw - 8) / 2 + 2)}" y="${f(yc - 4)}" text-anchor="middle">${w.count}×</text>`
      + `<text class="mn-word" x="${xw}" y="${f(yc + 4.5)}">${esc(w.word)}</text>`
      + `<text class="mn-gloss" x="${xg}" y="${f(yc + 4)}">${esc(w.gloss)}</text>`;
    right -= wd;
  });
  const yEnd = r0 + (n - 1) * rh + 26;
  out += `<path d="M${f(right / 2)} ${ty}V${yEnd}" stroke-width="${f(right)}"/>`;
  const h = yEnd + 2;
  return `<svg class="mn-q2" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="${D.lookups} lookups. ${rows.map(w => `${w.word}, ${w.count} times, ${w.gloss}`).join('; ')}. Together ${D.repeatedTokens} of the ${D.lookups}; ${rest} remain.">
    <g class="mn-uband" fill="none">${out}</g>
    <text class="mn-num" x="1" y="${ty - 5}"><tspan class="mn-b">${D.lookups}</tspan> lookups</text>
    <text class="mn-in mn-on" x="${f(right / 2)}" y="${yEnd - 6}" text-anchor="middle">${rest}</text>
    <text class="mn-lab mn-it mn-d" x="${xw}" y="${yEnd - 6}">left once these are known</text>
    ${labs}
  </svg>`;
}

// III. Words known over time, with this text's share known in a strip beneath.
function q3(D) {
  const H = D.history, S = D.series;
  const d0 = dayOf(S[0].d), d1 = dayOf(S.at(-1).d), X0 = 26, X1 = W - 4;
  const X = (iso) => X0 + (dayOf(iso) - d0) / (d1 - d0) * (X1 - X0);
  const s = 1 / 48, maxT = D.known * s;
  const yb = 22 + maxT / 2;
  const top = H.map(p => `${f(X(p.d))} ${f(yb - p.k * s / 2)}`), bot = H.map(p => `${f(X(p.d))} ${f(yb + p.k * s / 2)}`).reverse();
  const band = `M${top.join('L')}L${bot.join('L')}Z`;
  // the last seven days, bracketed
  const wk = new Date((d1 - 7) * DAY).toISOString().slice(0, 10);
  const xa = X(wk), xb = X(S.at(-1).d), by = yb - maxT / 2 - 5;
  // the strip
  const lo = D.firstPct - 1, hi = D.pct + 1;
  const ys0 = yb + maxT / 2 + 22, ys1 = ys0 + 40;
  const Y = (v) => ys1 - (v - lo) / (hi - lo) * (ys1 - ys0);
  const line = S.map((p, i) => `${i ? 'L' : 'M'}${f(X(p.d))} ${f(Y(p.v))}`).join('');
  // drop lines at the first day, the last, and two between
  const pick = [0, 1 / 3, 2 / 3, 1].map(t => S.reduce((b, p) => Math.abs(dayOf(p.d) - (d0 + t * (d1 - d0))) < Math.abs(dayOf(b.d) - (d0 + t * (d1 - d0))) ? p : b, S[0]));
  const kAt = (iso) => { const t = dayOf(iso); let p = H[0]; for (const q of H) if (dayOf(q.d) <= t) p = q; return p.k; };
  const drops = pick.map((p, i) => {
    const x = X(p.d), y = Y(p.v), last = i === pick.length - 1;
    return `<line class="mn-drop" x1="${f(x)}" x2="${f(x)}" y1="${f(yb + kAt(p.d) * s / 2)}" y2="${f(y - 3)}"/>`
      + `<circle class="mn-dot" cx="${f(x)}" cy="${f(y)}" r="${last ? 3 : 2.2}"/>`
      + `<text class="mn-lab${last ? ' mn-b' : ''}" x="${f(x - 5)}" y="${f(y - 3)}" text-anchor="end">${p.v}%</text>`
      + `<text class="mn-lab mn-it mn-d" x="${last ? W : f(x)}" y="${f(ys1 + 15)}" text-anchor="${last ? 'end' : 'middle'}">${dShort(p.d)}</text>`;
  }).join('');
  const h = ys1 + 19;
  return `<svg class="mn-q3" viewBox="0 0 ${W} ${h}" width="${W}" height="${h}" role="img" aria-label="Words known: ${fmt(D.known)}, up ${D.gain7} this week; daily since ${dShort(H[0].d)}. This text: ${D.firstPct}% known on ${dShort(D.since)}, ${D.pct}% now.">
    <path class="mn-kband mn-fill" d="${band}"/>
    <path class="mn-bracket" d="M${f(xa)} ${f(by + 3)}V${f(by)}H${f(xb)}V${f(by + 3)}" fill="none"/>
    <text class="mn-lab" x="${f(xb)}" y="${f(by - 6)}" text-anchor="end"><tspan class="mn-b">+${D.gain7}</tspan> this week</text>
    <text class="mn-in" x="${f(xb - 8)}" y="${f(yb + 4.5)}" text-anchor="end"><tspan class="mn-big">${fmt(D.known)}</tspan> words known</text>
    <path class="mn-line" d="${line}" fill="none"/>
    ${drops}
    <text class="mn-lab" x="${W}" y="${f(ys1 - 2)}" text-anchor="end">This text: ${D.firstPct}% → ${D.pct}% since ${dShort(D.since)}</text>
  </svg>`;
}

export function html(D) {
  return `
<div class="mp mp-minard"><div class="mn-sheet">
  <header class="mn-title">
    <h2>Figurative map of this text and of your progress</h2>
    <p>Each band is as wide as the number of words it carries, and the number is written along it. Pink marks the words new to you.</p>
  </header>

  <section>
    <h3 class="mn-h"><span>I.</span> Can I read this?</h3>
    <p class="mn-lead">About 1 word in ${D.oneIn} is new to you.</p>
    <p class="mn-verdict"><i>${esc(D.verdict.label)}</i>, at ${esc(D.level)} <span class="mn-sep">·</span> ${D.lookups} lookups in ${D.total} words</p>
    ${q1(D)}
  </section>

  <section>
    <h3 class="mn-h"><span>II.</span> What will help most?</h3>
    <p class="mn-cap">New words that come back in this text, at four times the scale of I.</p>
    ${q2(D)}
    <div class="mn-act"><button class="mn-btn" type="button">${esc(D.action)}</button><span>Knowing them: <b>${D.after}%</b> of this text</span></div>
  </section>

  <section>
    <h3 class="mn-h"><span>III.</span> Am I getting better?</h3>
    ${q3(D)}
  </section>

  <a class="mn-more" href="#stats">${esc(D.more)}<span aria-hidden="true"> →</span></a>
</div></div>`;
}

export const css = `
.mp-minard {
  --mn-paper: #1d1a15; --mn-ink: #e9dec8; --mn-dim: #b3a68f; --mn-line: #c9b691; --mn-frame: #8d7d61;
  --mn-tan: #a98f68; --mn-on-tan: #17130e; --mn-btn: #2a251d; --mn-on-pink: #1d1a15;
  box-sizing: border-box; min-height: calc(100% - 12px); margin: 6px; padding: 3px;
  border: 1px solid var(--mn-frame); background: var(--mn-paper); display: flex; flex-direction: column;
  font-family: "Old Standard TT", Georgia, serif; color: var(--mn-ink);
}
:root[data-theme="light"] .mp-minard {
  --mn-paper: #f4ecdc; --mn-ink: #2b2219; --mn-dim: #6c5d49; --mn-line: #5e4b36; --mn-frame: #5e4b36;
  --mn-tan: #dcc39b; --mn-on-tan: #2b2219; --mn-btn: #fbf6ec; --mn-on-pink: #fbf6ec;
}
.mp-minard .mn-sheet { flex: 1; border: .5px solid var(--mn-frame); padding: 10px 11px 9px; display: flex; flex-direction: column; }
.mp-minard .mn-title { text-align: center; margin-bottom: 4px; }
.mp-minard .mn-title h2 { margin: 0; font-weight: 400; font-size: 14px; line-height: 1.25; letter-spacing: .01em; }
.mp-minard .mn-title p { margin: 4px 6px 0; font-style: italic; font-size: 11px; line-height: 1.35; color: var(--mn-dim); }
.mp-minard section { margin-top: 11px; }
.mp-minard .mn-h { display: flex; align-items: baseline; gap: 6px; margin: 0 0 4px; font-weight: 400; font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--mn-ink); }
.mp-minard .mn-h span { letter-spacing: .04em; }
.mp-minard .mn-h::after { content: ""; flex: 1; border-top: .5px solid var(--mn-line); transform: translateY(-3px); opacity: .7; }
.mp-minard .mn-lead { margin: 2px 0 0; font-size: 18px; line-height: 1.25; }
.mp-minard .mn-verdict { margin: 2px 0 4px; font-size: 12.5px; color: var(--mn-dim); }
.mp-minard .mn-verdict i { color: var(--mn-ink); font-size: 13px; }
.mp-minard .mn-sep { margin: 0 3px; }
.mp-minard .mn-cap { margin: 0 0 4px; font-size: 11px; line-height: 1.35; font-style: italic; color: var(--mn-dim); }
.mp-minard svg text { font-family: "Old Standard TT", Georgia, serif; fill: var(--mn-ink); }
.mp-minard .mn-lab { font-size: 11px; }
.mp-minard .mn-num { font-size: 11.5px; }
.mp-minard .mn-n, .mp-minard .mn-b { font-weight: 700; }
.mp-minard .mn-it { font-style: italic; }
.mp-minard .mn-d { fill: var(--mn-dim); }
.mp-minard .mn-pk { fill: var(--c-unknown); }
.mp-minard .mn-in { font-size: 12.5px; fill: var(--mn-on-tan); }
.mp-minard .mn-in.mn-on { fill: var(--mn-on-pink); font-size: 11px; font-weight: 700; }
.mp-minard .mn-big { font-size: 15px; font-weight: 700; }
.mp-minard .mn-edge path { stroke: var(--mn-line); }
.mp-minard .mn-kband { stroke: var(--mn-tan); }
.mp-minard .mn-kband.mn-fill { fill: var(--mn-tan); stroke: var(--mn-line); stroke-width: .6; }
.mp-minard .mn-uband, .mp-minard .mn-uband path { stroke: var(--c-unknown); }
.mp-minard .mn-lband { stroke: var(--band-l); }
.mp-minard .mn-drop { stroke: var(--mn-ink); stroke-width: .6; }
.mp-minard .mn-axis line { stroke: var(--mn-ink); stroke-width: .6; }
.mp-minard .mn-axis .mn-mark { stroke-width: 1; }
.mp-minard .mn-dot { fill: var(--mn-ink); }
.mp-minard .mn-line { stroke: var(--mn-ink); stroke-width: 1; }
.mp-minard .mn-bracket { stroke: var(--mn-ink); stroke-width: .7; }
.mp-minard .mn-cnt { font-size: 11px; font-weight: 700; fill: var(--c-unknown); }
.mp-minard .mn-word { font-size: 14px; fill: var(--c-unknown); font-style: italic; }
.mp-minard .mn-gloss { font-size: 12px; fill: var(--mn-dim); }
.mp-minard .mn-act { display: flex; align-items: center; gap: 12px; margin: 6px 0 6px; font-size: 13px; color: var(--mn-dim); }
.mp-minard .mn-act b { color: var(--mn-ink); font-size: 14px; }
.mp-minard .mn-btn { font: 13px/1 "Old Standard TT", Georgia, serif; color: var(--mn-ink); background: var(--mn-btn); border: 1px solid var(--mn-line); border-radius: 3px; padding: 7px 12px 6px; box-shadow: 0 2px 0 var(--mn-line); cursor: pointer; }
.mp-minard .mn-btn:hover { background: var(--mn-paper); }
.mp-minard .mn-btn:active { transform: translateY(1px); box-shadow: 0 1px 0 var(--mn-line); }
.mp-minard .mn-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mp-minard .mn-more { margin-top: auto; align-self: flex-end; padding-top: 6px; font-size: 13px; color: var(--accent); text-decoration: underline; text-underline-offset: 2px; text-decoration-thickness: .5px; }
`;
