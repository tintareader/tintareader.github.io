// Amanda Cox: the panel as three small annotated graphics. Each question gets
// a headline that states the finding, one chart, and short notes placed on
// the chart with thin leader lines. Grey for context, ink for the subject,
// pink only for new words.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'cox',
  designer: 'Amanda Cox',
  title: 'You are here',
  known: 'Charts at The New York Times and The Upshot that explain themselves through direct annotation.',
  idea: 'Each question is answered by a headline that states the finding, then one small chart that proves it. Short notes sit on the charts with thin leader lines, so there are no legends to decode. Grey is context, ink is the subject, and pink only ever means a new word.',
  how: [
    'Can I read this? The headline gives the answer: about 1 word in 8 is new, and at A2 that is readable with lookups. Below it, the text is drawn as 262 dashes in reading order. Notes point at a new word and a learning word and give the counts. Then 86% sits on a scale, with notes at 60% and 95%.',
    'What will help most? The seven returning words, grouped by how often they come back (four times, twice each), with dots for each time. A short line says they are 16 of the 33 lookups. The button sits on the left of the same scale, which shows the step from 86% now to 92%.',
    'Am I getting better? Two small charts side by side, labelled at their ends instead of with axes: this text from 77% to 86% since 18 Aug, and words known up to 1,751. On the second, the last week is drawn darker and marked +118.',
  ],
  type: 'Libre Franklin (Google Fonts, a free Franklin Gothic) for labels and notes; Newsreader (Google Fonts) for headlines and the Spanish words.',
};

export const fonts = [
  { family: 'Libre Franklin', style: 'normal', weight: '300 800', file: 'LibreFranklin-normal-300_800.woff2' },
  { family: 'Newsreader', style: 'normal', weight: '400 700', file: 'Newsreader-normal-400_700.woff2' },
];

const W = 367; // content width: the 399 px panel less 16 px gutters
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const word = (n) => NUM[n] ?? String(n);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const times = (n) => n === 1 ? 'once' : n === 2 ? 'twice' : `${word(n)} times`;
const f1 = (n) => (+n).toFixed(1);

// --- 1. The text as dashes, in reading order -------------------------------
function textMap(D) {
  const FW = 214, CH = 1.8, GAP = 2.6, LH = 8.4, top = 3;
  const marks = []; let x = 0, line = 0;
  for (const t of D.tokens) {
    const w = Math.max(2.4, [...t.t].length * CH);
    if (x > 0 && x + w > FW) { x = 0; line++; }
    marks.push({ x, y: top + line * LH, w, s: t.s });
    x += w + GAP;
  }
  const H = top + (line + 1) * LH;
  const cls = { u: 'cx-u', l: 'cx-l', k: 'cx-k' };
  // Shape as well as colour: known words are thin, new words thick, learning words hollow.
  const dash = (m) => {
    if (m.s === 'l') return `<rect class="cx-l" x="${f1(m.x + 0.6)}" y="${f1(m.y + 0.6)}" width="${f1(m.w - 1.2)}" height="3.2" rx="1.6"/>`;
    const h = m.s === 'u' ? 4.4 : 2.2;
    return `<rect class="${cls[m.s] ?? 'cx-k'}" x="${f1(m.x)}" y="${f1(m.y + (4.4 - h) / 2)}" width="${f1(m.w)}" height="${h}" rx="${h / 2}"/>`;
  };
  // Notes in the right margin; the new and learning notes each point at one dash.
  const NX = FW + 24;
  // Leaders leave the dash from below and run right along the gap between lines.
  const gapY = (m) => m.y + 6.3;
  // The rightmost dash of a status whose line gap falls in [lo, hi], else the nearest one.
  const target = (s, lo, hi) => {
    const c = marks.filter(m => m.s === s), off = (m) => Math.max(0, lo - gapY(m), gapY(m) - hi);
    return c.reduce((b, m) => !b || off(m) < off(b) || (off(m) === off(b) && m.x + m.w > b.x + b.w) ? m : b, null);
  };
  const leader = (m, ty) => {
    if (!m) return '';
    const cx = m.x + m.w / 2, gy = gapY(m);
    const bend = Math.abs(gy - ty) < 1 ? '' : ` H${f1(FW + 8)} L${f1(FW + 16)} ${f1(ty)}`;
    return `<path class="cx-lead" d="M${f1(cx)} ${f1(m.y + 5.2)} V${f1(gy)}${bend} H${f1(NX - 5)}"/>`;
  };
  const tU = target('u', 38, 47), yU = tU ? gapY(tU) + 4 : 47;
  const tL = target('l', yU + 48, H), yL = tL ? Math.max(gapY(tL) + 4, yU + 48) : yU + 48;
  const SH = Math.max(H + 2, yL + 22);
  const tspans = (y, rows) => rows.map((r, i) => `<tspan x="${NX}" ${i ? 'dy="14"' : ''} ${r[1] ? `class="${r[1]}"` : ''}>${r[0]}</tspan>`).join('');
  return `<svg class="cx-map" viewBox="0 0 ${W} ${SH}" width="${W}" height="${SH}" role="img" aria-label="The text's ${D.total} words as dashes in reading order: ${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new, so ${D.lookups} lookups in ${D.total} words.">
    <g>${marks.map(dash).join('')}</g>
    <text class="cx-note" y="10">${tspans(10, [['Each dash is a word,'], ['in reading order.']])}</text>
    ${leader(tU, yU - 4)}
    <text class="cx-note" y="${yU}">${tspans(yU, [[`${D.counts.u} new to you,`, 'cx-tu'], [`so ${D.lookups} lookups`], [`in ${D.total} words`]])}</text>
    ${leader(tL, yL - 4)}
    <text class="cx-note" y="${yL}">${tspans(yL, [[`${D.counts.l} learning`, 'cx-tl']])}</text>
    <text class="cx-note" y="${yL + 18}"><tspan x="${NX}">The rest: </tspan><tspan class="cx-tk">${D.counts.k} known</tspan></text>
  </svg>`;
}

// --- The 50-100% scale, used twice -----------------------------------------
const LO = 50, HI = 100;
const sx = (v) => ((v - LO) / (HI - LO)) * (W - 8) + 4;

function scaleNow(D) {
  const th = D.thresholds, x60 = sx(th.workable), x95 = sx(th.comfortable), xp = sx(D.pct), ay = 38;
  return `<svg class="cx-scale" viewBox="0 0 ${W} 74" width="${W}" height="74" role="img" aria-label="${D.pct}% of the running words known. ${th.workable}% is workable at ${D.level}; ${th.comfortable}% is comfortable.">
    <line class="cx-axis" x1="${sx(LO)}" x2="${sx(HI)}" y1="${ay}" y2="${ay}"/>
    <rect class="cx-band" x="${f1(x60)}" y="${ay - 3}" width="${f1(sx(HI) - x60)}" height="6" rx="1"/>
    <line class="cx-tick" x1="${f1(x60)}" x2="${f1(x60)}" y1="${ay - 9}" y2="${ay + 3}"/>
    <line class="cx-tick" x1="${f1(x95)}" x2="${f1(x95)}" y1="${ay - 9}" y2="${ay + 3}"/>
    <text class="cx-note" x="${f1(x60 - 3)}" y="${ay - 14}"><tspan class="cx-b">${th.workable}%</tspan> is workable at ${D.level}</text>
    <text class="cx-note" x="${f1(x95 + 3)}" y="${ay - 14}" text-anchor="end"><tspan class="cx-b">${th.comfortable}%</tspan> is comfortable</text>
    <text class="cx-ax" x="${sx(LO)}" y="${ay + 15}">${LO}%</text>
    <text class="cx-ax" x="${sx(HI)}" y="${ay + 15}" text-anchor="end">${HI}%</text>
    <circle class="cx-dot" cx="${f1(xp)}" cy="${ay}" r="5.5"/>
    <path class="cx-lead" d="M${f1(xp)} ${ay + 7} V${ay + 20}"/>
    <text class="cx-note" x="${f1(xp)}" y="${ay + 32}" text-anchor="middle"><tspan class="cx-strong">You are here: ${D.pct}% known</tspan></text>
  </svg>`;
}

function scaleAfter(D) {
  // The same scale as above, drawn only where it matters, to the right of the button.
  const th = D.thresholds, xp = sx(D.pct), xa = sx(D.after), x95 = sx(th.comfortable), ay = 31, x0 = 182;
  return `<svg class="cx-scale cx-after" viewBox="0 0 ${W} 54" width="${W}" height="54" role="img" aria-label="Knowing them: ${D.after}% of this text, up from ${D.pct}% now. ${th.comfortable}% is comfortable.">
    <defs><linearGradient id="cx-fade" x1="0" x2="1"><stop offset="0" stop-color="var(--cx-grey2)" stop-opacity="0"/><stop offset="1" stop-color="var(--cx-grey2)"/></linearGradient></defs>
    <rect x="${x0}" y="${ay - 0.5}" width="40" height="1" fill="url(#cx-fade)"/>
    <line class="cx-axis" x1="${x0 + 40}" x2="${sx(HI)}" y1="${ay}" y2="${ay}"/>
    <line class="cx-tick cx-faint" x1="${f1(x95)}" x2="${f1(x95)}" y1="${ay - 5}" y2="${ay + 5}"/>
    <text class="cx-ax" x="${f1(x95)}" y="${ay + 18}" text-anchor="middle">${th.comfortable}%</text>
    <path class="cx-arrow" d="M${f1(xp + 6)} ${ay} H${f1(xa - 6)}"/>
    <path class="cx-arrowhead" d="M${f1(xa - 9)} ${ay - 3.5} L${f1(xa - 4.5)} ${ay} L${f1(xa - 9)} ${ay + 3.5}"/>
    <circle class="cx-ring" cx="${f1(xp)}" cy="${ay}" r="4.5"/>
    <circle class="cx-dot" cx="${f1(xa)}" cy="${ay}" r="5.5"/>
    <text class="cx-note" x="${f1(xp)}" y="${ay + 18}" text-anchor="middle">${D.pct}% now</text>
    <path class="cx-lead" d="M${f1(xa)} ${ay - 7} V${ay - 15}"/>
    <text class="cx-note" x="${W}" y="${ay - 19}" text-anchor="end">Knowing them: <tspan class="cx-strong">${D.after}%</tspan> of this text</text>
  </svg>`;
}

// --- 3. Small multiples ----------------------------------------------------
function lineChart({ pts, lo, hi, w, h, endLabel, startLabel, aria, weekFrom, note, ref }) {
  const t0 = Date.parse(pts[0].d), t1 = Date.parse(pts.at(-1).d);
  const px = (d) => ((Date.parse(d) - t0) / (t1 - t0)) * w;
  const py = (v) => h - ((v - lo) / (hi - lo)) * h;
  const P = pts.map(p => [px(p.d), py(p.v)]);
  const path = (a) => a.map((q, i) => `${i ? 'L' : 'M'}${f1(q[0])} ${f1(q[1])}`).join(' ');
  const last = P.at(-1), first = P[0];
  let week = '';
  if (weekFrom) {
    const i = pts.findIndex(p => Date.parse(p.d) >= Date.parse(weekFrom));
    const seg = P.slice(Math.max(0, i));
    week = `<path class="cx-line cx-week" d="${path(seg)}"/>`;
  }
  return `<svg class="cx-sm" viewBox="0 0 ${w + 40} ${h + 14}" width="${w + 40}" height="${h + 14}" role="img" aria-label="${esc(aria)}">
    <g transform="translate(2 8)">
      ${ref ? `<line class="cx-ref" x1="0" x2="${w}" y1="${f1(py(ref.v))}" y2="${f1(py(ref.v))}"/><text class="cx-ax" x="${w + 6}" y="${f1(py(ref.v) + 4)}">${ref.label}</text>` : ''}
      <path class="cx-line ${weekFrom ? 'cx-ctx' : ''}" d="${path(P)}"/>
      ${week}
      <circle class="cx-end0" cx="${f1(first[0])}" cy="${f1(first[1])}" r="2.4"/>
      <circle class="cx-end" cx="${f1(last[0])}" cy="${f1(last[1])}" r="3.2"/>
      ${startLabel ? `<text class="cx-note" x="${f1(first[0])}" y="${f1(first[1] - 10)}">${startLabel}</text>` : ''}
      <text class="cx-endl" x="${f1(last[0] + 6)}" y="${f1(last[1] + 4)}">${endLabel}</text>
      ${note ?? ''}
    </g>
  </svg>`;
}

export function html(D) {
  const rep = D.repeated;
  // Group the returning words by how often they come back.
  const groups = [];
  for (const r of rep) { const g = groups.find(g => g.n === r.count); g ? g.words.push(r) : groups.push({ n: r.count, words: [r] }); }
  groups.sort((a, b) => b.n - a.n);
  const pips = (n) => `<span class="cx-pips" role="img" aria-label="${n} times">${'<i></i>'.repeat(n)}</span>`;
  const item = (r, big) => `<li class="${big ? 'cx-big' : ''}"><span class="cx-w">${esc(r.word)}</span>${pips(r.count)}<span class="cx-g">${esc(r.gloss)}</span></li>`;
  const groupsHtml = groups.map(g => `
    <div class="cx-grp">
      <div class="cx-gl">${g.words.length === 1 ? cap(times(g.n)) : cap(times(g.n)) + ' each'}</div>
      <ul class="${g.words.length > 1 ? 'cx-two' : ''}" style="grid-template-rows: repeat(${Math.ceil(g.words.length / 2)}, auto)">${g.words.map(r => item(r, g.words.length === 1)).join('')}</ul>
    </div>`).join('');

  const textUp = D.pct > D.firstPct, knownUp = D.gain7 > 0;
  const hed3 = textUp && knownUp ? 'Yes, on both counts.' : textUp || knownUp ? 'Yes, on one count.' : 'Not yet.';

  // Words known: highlight the last seven days.
  const lastT = Date.parse(D.history.at(-1).d);
  const weekFrom = new Date(lastT - 7 * 864e5).toISOString().slice(0, 10);
  const hist = D.history.map(h => ({ d: h.d, v: h.k }));
  const SW = 132, SH = 52;
  const hiK = Math.max(...hist.map(h => h.v));
  const wx = ((Date.parse(weekFrom) - Date.parse(hist[0].d)) / (lastT - Date.parse(hist[0].d))) * SW;
  const wy = SH - (hist.find(h => Date.parse(h.d) >= Date.parse(weekFrom)).v / hiK) * SH;
  const weekNote = `<path class="cx-lead" d="M${f1(wx + 4)} ${f1(wy + 4)} V${f1(wy + 18)}"/><text class="cx-note" x="${f1(wx + 4 + 12)}" y="${f1(wy + 31)}" text-anchor="end"><tspan class="cx-b">+${D.gain7}</tspan> this week</text>`;
  const smText = lineChart({
    pts: D.series, lo: Math.min(...D.series.map(s => s.v)) - 3, hi: D.thresholds.comfortable, w: SW, h: SH,
    startLabel: `${D.firstPct}%`, endLabel: `${D.pct}%`, ref: { v: D.thresholds.comfortable, label: `${D.thresholds.comfortable}%` },
    aria: `This text: ${D.firstPct}% known on ${dShort(D.since)}, ${D.pct}% now.`,
  });
  const smKnown = lineChart({
    pts: hist, lo: 0, hi: hiK, w: SW, h: SH, endLabel: fmt(D.known), weekFrom, note: weekNote,
    aria: `Words known: ${fmt(D.known)}, up ${D.gain7} this week.`,
  });

  return `
<div class="mp mp-cox">
  <section class="cx-q">
    <p class="cx-kick">Can I read this?</p>
    <h3 class="cx-hed">About 1 word in ${D.oneIn} is new to you. <span>At ${D.level}, that’s ${D.verdict.label.toLowerCase()}.</span></h3>
    ${textMap(D)}
    ${scaleNow(D)}
  </section>
  <section class="cx-q">
    <p class="cx-kick">What will help most?</p>
    <h3 class="cx-hed">${cap(word(rep.length))} new words keep coming back.</h3>
    <p class="cx-dek">Together they’re ${D.repeatedTokens} of your ${D.lookups} lookups.</p>
    ${groupsHtml}
    <div class="cx-act">${scaleAfter(D)}<button class="cx-btn" type="button">${esc(D.action)}</button></div>
  </section>
  <section class="cx-q">
    <p class="cx-kick">Am I getting better?</p>
    <h3 class="cx-hed">${hed3}</h3>
    <div class="cx-multi">
      <figure><figcaption>This text <span>share known, since ${dShort(D.since)}</span></figcaption>${smText}</figure>
      <figure><figcaption>Words known <span>since ${dShort(D.history[0].d)}</span></figcaption>${smKnown}</figure>
    </div>
  </section>
  <a class="cx-more" href="#stats">${D.more} <span aria-hidden="true">→</span></a>
</div>`;
}

export const css = `
.mp-cox {
  --cx-grey: #4d5765; --cx-grey2: #303842; --cx-band: #222932; --cx-ctx: #5f6a78; --cx-note: var(--dim);
  --cx-sans: "Libre Franklin", var(--font-ui); --cx-serif: "Newsreader", Georgia, serif;
  font-family: var(--cx-sans); color: var(--ink); padding: 14px 16px 16px;
}
:root[data-theme="light"] .mp-cox { --cx-grey: #b3b8b0; --cx-grey2: #c4c8c0; --cx-band: #dfe2dc; --cx-ctx: #a2a79f; }
.mp-cox * { box-sizing: border-box; }
.mp-cox .cx-q { margin: 0 0 30px; }
.mp-cox .cx-kick { margin: 0 0 3px; font: 600 10.5px/1.2 var(--cx-sans); letter-spacing: .1em; text-transform: uppercase; color: var(--cx-note); }
.mp-cox .cx-hed { margin: 0 0 12px; font: 560 19.5px/1.2 var(--cx-serif); letter-spacing: -.003em; color: var(--ink); font-variation-settings: "opsz" 36; }
.mp-cox .cx-hed span { display: block; }
.mp-cox .cx-dek { margin: -6px 0 8px; font: 400 12.5px/1.35 var(--cx-sans); color: var(--cx-note); }
.mp-cox svg text { font-family: var(--cx-sans); }
.mp-cox .cx-k { fill: var(--cx-grey); }
.mp-cox .cx-l { fill: none; stroke: var(--band-l); stroke-width: 1.2; }
.mp-cox .cx-u { fill: var(--c-unknown); }
.mp-cox .cx-note { font-size: 11.5px; fill: var(--cx-note); }
.mp-cox .cx-tu { fill: var(--c-unknown); font-weight: 600; }
.mp-cox .cx-tl { fill: var(--c-learning); font-weight: 600; }
.mp-cox .cx-tk { fill: var(--ink); font-weight: 600; }
.mp-cox .cx-b { fill: var(--ink); font-weight: 600; }
.mp-cox .cx-strong { fill: var(--ink); font-weight: 700; }
.mp-cox .cx-lead { fill: none; stroke: var(--ink); stroke-width: .8; }
.mp-cox .cx-axis { stroke: var(--cx-grey2); stroke-width: 1; }
.mp-cox .cx-band { fill: var(--cx-band); }
.mp-cox .cx-tick { stroke: var(--ink); stroke-width: 1; }
.mp-cox .cx-faint { stroke: var(--cx-grey); }
.mp-cox .cx-ax { font-size: 10.5px; fill: var(--faint); }
.mp-cox .cx-dot { fill: var(--ink); stroke: var(--panel); stroke-width: 2; }
.mp-cox .cx-ring { fill: var(--panel); stroke: var(--cx-note); stroke-width: 1.5; }
.mp-cox .cx-arrow, .mp-cox .cx-arrowhead { fill: none; stroke: var(--ink); stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.mp-cox .cx-grp { display: grid; grid-template-columns: 74px 1fr; align-items: baseline; }
.mp-cox .cx-grp + .cx-grp { margin-top: 6px; }
.mp-cox .cx-gl { font: 400 11.5px/1.25 var(--cx-sans); color: var(--cx-note); text-align: right; padding: 0 9px 0 0; white-space: nowrap; }
.mp-cox .cx-grp ul { list-style: none; margin: 0; padding: 0 0 0 10px; border-left: 1px solid var(--cx-grey); display: grid; gap: 0 12px; }
.mp-cox .cx-grp ul.cx-two { grid-template-columns: 1fr 1fr; grid-auto-flow: column; }
.mp-cox .cx-grp li { display: flex; align-items: baseline; gap: 5px; white-space: nowrap; min-width: 0; }
.mp-cox .cx-w { font: 500 15.5px/1.3 var(--cx-serif); color: var(--c-unknown); font-variation-settings: "opsz" 16; }
.mp-cox .cx-big .cx-w { font-size: 19px; }
.mp-cox .cx-g { font-size: 11.5px; color: var(--cx-note); overflow: hidden; text-overflow: ellipsis; }
.mp-cox .cx-pips { display: inline-flex; gap: 2px; transform: translateY(-2px); }
.mp-cox .cx-pips i { width: 4px; height: 4px; border-radius: 50%; background: var(--c-unknown); }
/* The action: the button sits on the left end of the scale. */
.mp-cox .cx-act { position: relative; margin-top: 10px; }
.mp-cox .cx-act .cx-btn { position: absolute; left: 0; top: 15px; }
.mp-cox .cx-btn { font: 600 13px/1 var(--cx-sans); color: var(--panel); background: var(--ink); border: 0; border-radius: 3px; padding: 9px 14px; cursor: pointer; box-shadow: 0 1px 0 rgba(0,0,0,.25), 0 2px 6px rgba(0,0,0,.12); }
.mp-cox .cx-btn:hover { filter: brightness(1.12); }
.mp-cox .cx-btn:active { transform: translateY(1px); box-shadow: 0 0 0 rgba(0,0,0,.25); }
.mp-cox .cx-multi { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mp-cox figure { margin: 0; }
.mp-cox figcaption { font: 600 12px/1.25 var(--cx-sans); color: var(--ink); margin-bottom: 2px; }
.mp-cox figcaption span { display: block; font-weight: 400; color: var(--cx-note); font-size: 11.5px; }
.mp-cox .cx-line { fill: none; stroke: var(--ink); stroke-width: 1.75; stroke-linejoin: round; stroke-linecap: round; }
.mp-cox .cx-line.cx-ctx { stroke: var(--cx-ctx); }
.mp-cox .cx-line.cx-week { stroke: var(--ink); stroke-width: 2.5; }
.mp-cox .cx-end { fill: var(--ink); }
.mp-cox .cx-end0 { fill: var(--cx-ctx); }
.mp-cox .cx-endl { font-size: 12.5px; font-weight: 700; fill: var(--ink); }
.mp-cox .cx-ref { stroke: var(--cx-grey); stroke-dasharray: 2 3; }
.mp-cox .cx-more { display: inline-block; font: 500 12.5px/1.3 var(--cx-sans); color: var(--accent); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
`;
