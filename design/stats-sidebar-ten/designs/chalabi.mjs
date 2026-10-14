// Mona Chalabi: hand-drawn data illustration. Every mark is drawn in code with
// a fixed seed, so the wobble is the same on every render, and every count is
// still counted: eight scribbled words with one circled, one tally stroke per
// appearance, lines that follow the real daily numbers.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'chalabi',
  designer: 'Mona Chalabi',
  title: 'Circled in pencil',
  known: 'Data journalist and illustrator who draws statistics by hand and keeps the person behind the number in view.',
  idea: 'Chalabi draws numbers instead of plotting them, but the drawing still has to be right: things are counted, lengths are measured. Here the panel reads like a learner\'s pencil notes in the margin of a paperback, with the new word circled the way you would circle it in a book. It is ink on the light page and chalk on the dark one.',
  how: [
    'Can I read this? Eight scribbled words on a ruled line, one circled in pink: that is 1 in 8, or 33 lookups in 262 words. The verdict is a drawn label. A hand-drawn strip shows known (hatched), learning and new words at their true widths, with the 60% and 95% marks pencilled across it.',
    'What will help most? The seven new words that come back, each with one tally stroke per appearance (monte gets four) and its meaning. A brace notes that they are 16 of the 33 lookups. The button is drawn, with a pencil shadow, but it is a real button.',
    'Am I getting better? Two hand-drawn lines follow the real daily numbers, with notes at their ends: this text from 77% to 86% since 18 Aug, and words known climbing to 1,751. The last week of that line is drawn over again and bracketed as +118.',
  ],
  type: 'Caveat for headings and margin notes, Patrick Hand for words and numbers. Both from Google Fonts, inlined by the harness.',
};

export const fonts = [
  { family: 'Caveat', style: 'normal', weight: '400 700', file: 'Caveat-normal-400_700.woff2' },
  { family: 'Patrick Hand', style: 'normal', weight: '400', file: 'PatrickHand-normal-400.woff2' },
];

// ---------------------------------------------------------------- the hand
// Seeded random numbers, so the drawing never changes between renders.
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n1 = (v) => (Math.round(v * 10) / 10).toString();
const jit = (r, a) => (r() - 0.5) * 2 * a;

// A smooth path through points (Catmull-Rom as cubic Béziers).
function curve(pts, closed = false) {
  const p = closed ? [pts.at(-1), ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts.at(-1)];
  let d = `M${n1(p[1][0])} ${n1(p[1][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [a, b, c, e] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    d += `C${n1(b[0] + (c[0] - a[0]) / 6)} ${n1(b[1] + (c[1] - a[1]) / 6)} ${n1(c[0] - (e[0] - b[0]) / 6)} ${n1(c[1] - (e[1] - b[1]) / 6)} ${n1(c[0])} ${n1(c[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

// A line from one point to another, as a hand draws it: a slight bow, a little tremor.
function hline(r, x1, y1, x2, y2, amp = 0.8, step = 16) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1, n = Math.max(2, Math.round(len / step));
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len, bow = jit(r, amp * 1.2);
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, o = bow * Math.sin(Math.PI * t) + jit(r, i === 0 || i === n ? amp * 0.3 : amp * 0.6);
    pts.push([x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o]);
  }
  return curve(pts);
}

// A box drawn as four strokes that overshoot their corners a little.
function hbox(r, x, y, w, h, amp = 0.7, over = 2) {
  return [
    hline(r, x - over * r(), y + jit(r, 0.5), x + w + over * r(), y + jit(r, 0.5), amp),
    hline(r, x + w + jit(r, 0.5), y - over * r(), x + w + jit(r, 0.5), y + h + over * r(), amp),
    hline(r, x + w + over * r(), y + h + jit(r, 0.5), x - over * r(), y + h + jit(r, 0.5), amp),
    hline(r, x + jit(r, 0.5), y + h + over * r(), x + jit(r, 0.5), y - over * r(), amp),
  ].join(' ');
}

// A closed, slightly lumpy rounded shape (for fills and buttons). Points are
// spaced evenly round the outline so the smoothing never overshoots a corner.
function blob(r, x, y, w, h, rad, amp = 0.6, step = 7) {
  rad = Math.min(rad, w / 2, h / 2);
  const segs = [
    [x + rad, y, x + w - rad, y], ['a', x + w - rad, y + rad, -Math.PI / 2],
    [x + w, y + rad, x + w, y + h - rad], ['a', x + w - rad, y + h - rad, 0],
    [x + w - rad, y + h, x + rad, y + h], ['a', x + rad, y + h - rad, Math.PI / 2],
    [x, y + h - rad, x, y + rad], ['a', x + rad, y + rad, Math.PI],
  ];
  const pts = [], wob = jit(r, amp);
  for (const sg of segs) {
    if (sg[0] === 'a') {
      const [, cx, cy, a0] = sg, n = Math.max(1, Math.round((rad * Math.PI / 2) / step));
      for (let i = 0; i < n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push([cx + Math.cos(a) * rad + jit(r, amp * 0.4), cy + Math.sin(a) * rad + jit(r, amp * 0.4)]); }
    } else {
      const [x1, y1, x2, y2] = sg, len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.round(len / step));
      const nx = -(y2 - y1) / (len || 1), ny = (x2 - x1) / (len || 1), bow = jit(r, amp);
      for (let i = 0; i < n; i++) { const t = i / n, o = bow * Math.sin(Math.PI * t) + jit(r, amp * 0.35); pts.push([x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o]); }
    }
  }
  return curve(pts, true);
}

// A pencil circle round something: one loop that does not quite meet itself.
function ring(r, cx, cy, rx, ry) {
  const n = 22, turns = 1.14, a0 = -2.4 + jit(r, 0.3), pts = [];
  for (let i = 0; i <= n * turns; i++) {
    const a = a0 + (i / n) * Math.PI * 2, k = 1 + jit(r, 0.035) + (i / (n * turns)) * 0.09;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return curve(pts);
}

// A word in joined-up handwriting nobody could read: loops for e and l,
// humps for n and u, the odd tall letter, all leaning a little.
function scribble(r, x, y, letters, lw = 6) {
  const a = lw / (2 * Math.PI), pts = [];
  const kind = Array.from({ length: letters + 1 }, () => { const q = r(); return q < 0.2 ? [8.5 + r() * 2.5, 1.9] : q < 0.55 ? [4.2 + r() * 1.2, 1.5] : [3.6 + r() * 1.4, 0.35]; });
  for (let t = 0; t <= letters * 2 * Math.PI + 1e-6; t += 0.36) {
    const i = Math.min(letters - 1, Math.floor(t / (2 * Math.PI))), f = t / (2 * Math.PI) - i;
    const e = f < 0.5 ? 0 : (f - 0.5) * 2;
    const h = kind[i][0] * (1 - e) + kind[i + 1][0] * e, c = kind[i][1] * (1 - e) + kind[i + 1][1] * e;
    const yy = y - h * (0.5 - 0.5 * Math.cos(t));
    pts.push([x + a * t - c * Math.sin(t) + (y - yy) * 0.22, yy + jit(r, 0.15)]);
  }
  return curve(pts);
}

// A curly brace, drawn down the right of a list.
function brace(r, x, y1, y2, d = 6) {
  const m = (y1 + y2) / 2;
  const top = [[x, y1], [x + d * 0.7, y1 + 3], [x + d * 0.8, m - 8], [x + d * 1.5, m]];
  const bot = [[x + d * 1.5, m], [x + d * 0.8, m + 8], [x + d * 0.7, y2 - 3], [x, y2]];
  return curve(top.map(([a, b]) => [a + jit(r, 0.4), b])) + ' ' + curve(bot.map(([a, b]) => [a + jit(r, 0.4), b]));
}

const date = (d) => Date.parse(d + 'T12:00:00Z');

// ---------------------------------------------------------------- the panel
export function html(D) {
  const W = 367;

  // 1. Eight scribbled words on a ruled line, one circled.
  const r1 = rng(8);
  const lens = Array.from({ length: D.oneIn }, () => 2 + Math.floor(r1() * 5));
  const unit = 6.2, gap0 = 13, ringPad = 12;
  const natural = lens.reduce((s, l) => s + l * unit, 0) + gap0 * (D.oneIn - 1) + ringPad;
  const scale = Math.min(1, (W - 10) / natural);
  let sx = 3, scrib = '', ringd = '';
  lens.forEach((l, i) => {
    const w = l * unit * scale, isNew = i === D.oneIn - 1;
    if (isNew) sx += 4;
    const d = scribble(r1, sx, 24, l, unit * scale);
    scrib += `<path d="${d}" class="${isNew ? 'ch-pink' : 'ch-ink'}" stroke-width="${isNew ? 1.7 : 1.5}"/>`;
    if (isNew) ringd = `<path d="${ring(r1, sx + w / 2 + 1, 19, w / 2 + 10, 13.5)}" class="ch-pink" stroke-width="1.6"/>`;
    sx += w + gap0 * scale;
  });
  const rule = `<path d="${hline(r1, 0, 28.5, W, 28.5, 0.6, 40)}" class="ch-faint" stroke-width="1"/>`;
  const scribSvg = `<svg class="ch-scrib" viewBox="0 0 ${W} 36" width="${W}" height="36" role="img" aria-label="${D.oneIn} words on a line; one of them, circled, is new to you">${rule}${scrib}${ringd}</svg>`;

  // 1. The strip: every running word, at its true share of the width.
  const r2 = rng(17), BY = 26, BH = 14;
  const xk = (D.counts.k / D.total) * W, xl = ((D.counts.k + D.counts.l) / D.total) * W;
  const x60 = (D.thresholds.workable / 100) * W, x95 = (D.thresholds.comfortable / 100) * W;
  let hatch = '';
  for (let x = -BH; x < xk; x += 4.2) {
    const x1 = Math.max(0, x), y1 = BY + BH - (x1 - x), x2 = Math.min(xk - 1.5, x + BH), y2 = BY + BH - (x2 - x);
    if (x2 > x1 + 1) hatch += `M${n1(x1 + jit(r2, 0.3))} ${n1(y1)}L${n1(x2 + jit(r2, 0.3))} ${n1(y2)}`;
  }
  const knownFill = `<path d="${hatch}" class="ch-hatch" stroke-width="1.1"/>`;
  const learnFill = `<path d="${blob(r2, xk + 0.3, BY + 1, Math.max(2.2, xl - xk), BH - 2, 0.8, 0.3)}" class="ch-amber-fill"/>`;
  const newFill = `<path d="${blob(r2, xl + 1.5, BY + 1, W - xl - 2.5, BH - 2, 2, 0.6)}" class="ch-pink-fill"/>`;
  const outline = `<path d="${hbox(r2, 0, BY, W, BH, 0.6, 2.5)}" class="ch-ink" stroke-width="1.3"/>`;
  const tick = (x) => { const d = hline(r2, x, BY - 5, x, BY + BH + 9, 0.4, 6); return `${x < xk - 3 ? `<path d="${d}" class="ch-knock" stroke-width="4.5"/>` : ''}<path d="${d}" class="ch-ink" stroke-width="1.5" stroke-dasharray="3 2.5"/>`; };
  const arrow = `<path d="${curve([[xk - 52, 9], [xk - 22, 6], [xk - 6, 12], [xk - 1, BY - 3]].map(([a, b]) => [a + jit(r2, 0.6), b]))}" class="ch-ink" stroke-width="1.2"/><path d="M${n1(xk - 5)} ${BY - 8}L${n1(xk - 0.6)} ${BY - 2.5}L${n1(xk + 3.6)} ${BY - 8.5}" class="ch-ink" stroke-width="1.2"/>`;
  const sw = (x, y, cls) => cls === 'hatch'
    ? `<path d="${hbox(r2, x, y - 8, 9, 9, 0.3, 0.8)}" class="ch-ink" stroke-width="1"/><path d="M${x + 1} ${y - 1}L${x + 6} ${y - 7}M${x + 4} ${y}L${x + 9} ${y - 6}" class="ch-hatch" stroke-width="1"/>`
    : `<path d="${blob(r2, x, y - 8, 9, 9, 2.5, 0.4)}" class="ch-${cls}-fill"/>`;
  const L1 = BY + BH + 22, L2 = L1 + 15;
  const bar = `<svg class="ch-bar" viewBox="0 0 ${W} ${L2 + 4}" width="${W}" height="${L2 + 4}" role="img" aria-label="${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new of ${D.total} words: ${D.pct}% known. Workable from ${D.thresholds.workable}% at ${D.level}, comfortable from ${D.thresholds.comfortable}%.">
    <text x="${n1(xk - 56)}" y="13" text-anchor="end" class="ch-note"><tspan class="ch-num">${D.pct}%</tspan> known</text>${arrow}
    ${knownFill}${learnFill}${newFill}${outline}${tick(x60)}${tick(x95)}
    ${sw(0, L1, 'hatch')}<text x="14" y="${L1}" class="ch-lab">${D.counts.k} known</text>
    ${sw(0, L2, 'amber')}<text x="14" y="${L2}" class="ch-lab">${D.counts.l} learning</text>
    ${sw(78, L2, 'pink')}<text x="92" y="${L2}" class="ch-lab ch-pink-t">${D.counts.u} new</text>
    <text x="${n1(x60)}" y="${L1}" text-anchor="middle" class="ch-lab"><tspan class="ch-b">${D.thresholds.workable}%</tspan></text>
    <text x="${n1(x60)}" y="${L2}" text-anchor="middle" class="ch-lab">workable at ${D.level}</text>
    <text x="${W}" y="${L1}" text-anchor="end" class="ch-lab"><tspan class="ch-b">${D.thresholds.comfortable}%</tspan></text>
    <text x="${W}" y="${L2}" text-anchor="end" class="ch-lab">comfortable</text>
  </svg>`;

  // 2. Tally strokes, one per appearance; every fifth crosses the four before it.
  const r3 = rng(29);
  const tally = (n) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const g = Math.floor(i / 5), j = i % 5, x = 3 + g * 30 + j * 6;
      d += j === 4 ? hline(r3, x - 25, 13, x + 1, 4, 0.5, 8) : hline(r3, x + jit(r3, 0.6), 3 + jit(r3, 0.8), x + jit(r3, 0.8), 16 + jit(r3, 0.6), 0.5, 6);
      d += ' ';
    }
    const w = 6 + Math.ceil(n / 5) * 30;
    return `<svg class="ch-tally" viewBox="0 0 ${w} 19" width="${w}" height="19" role="img" aria-label="${n} times"><path d="${d}" class="ch-pink ch-tal" stroke-width="2"/></svg>`;
  };
  const LW = W - 68, r3b = rng(37);
  const rules = `<svg class="ch-rules" viewBox="0 0 ${LW} ${D.repeated.length * 25}" width="${LW}" height="${D.repeated.length * 25}" aria-hidden="true">${D.repeated.slice(1).map((_, i) => `<path d="${hline(r3b, 0, (i + 1) * 25 - 0.5, LW - 2, (i + 1) * 25 - 0.5 + jit(r3b, 0.6), 0.5, 36)}" class="ch-faint" stroke-width="1"/>`).join('')}</svg>`;
  const rows = D.repeated.map((x, i) => `<li><span class="ch-w">${esc(x.word)}</span>${tally(x.count)}<span class="ch-g">${esc(x.gloss)}</span></li>`).join('');
  const rowH = 25, listH = D.repeated.length * rowH;
  const r4 = rng(41);
  const braceSvg = `<svg class="ch-brace" viewBox="0 0 64 ${listH}" width="64" height="${listH}" role="img" aria-label="These ${D.repeated.length} words are ${D.repeatedTokens} of your ${D.lookups} lookups">
    <path d="${brace(r4, 2, 6, listH - 6, 6)}" class="ch-ink" stroke-width="1.3"/>
    <text x="17" y="${listH / 2 - 12}" class="ch-note"><tspan class="ch-num">${D.repeatedTokens}</tspan> of</text>
    <text x="17" y="${listH / 2 + 6}" class="ch-note">your ${D.lookups}</text>
    <text x="17" y="${listH / 2 + 23}" class="ch-note">lookups</text>
  </svg>`;

  // the button: drawn, with a pencil shadow, but a real button
  const r5 = rng(53);
  const btnBg = `<svg class="ch-btn-bg" viewBox="0 0 170 40" preserveAspectRatio="none" aria-hidden="true">
    <path d="${blob(r5, 3.5, 5, 165, 34, 9, 0.7)}" class="ch-btn-shadow"/>
    <path d="${blob(r5, 1, 1, 164, 34, 9, 0.7)}" class="ch-btn-face"/>
    <path d="${blob(r5, 1, 1, 164, 34, 9, 0.9)}" class="ch-ink" stroke-width="1.4" vector-effect="non-scaling-stroke"/>
  </svg>`;

  // 3. Two lines that follow the real days, notes written at their ends.
  const CW = 172, CH = 100, TOP = 30, BOT = 80;
  const plot = (pts, lo, hi, seed) => {
    const r = rng(seed), t0 = date(pts[0].d), t1 = date(pts.at(-1).d);
    const X = (d) => 5 + ((date(d) - t0) / (t1 - t0)) * (CW - 12), Y = (v) => TOP + (1 - (v - lo) / (hi - lo)) * (BOT - TOP);
    const xy = pts.map((p) => [X(p.d), Y(p.v)]);
    return { xy, X, Y, r, d: curve(xy.map(([x, y], i) => [x + jit(r, 0.25), y + (i === 0 || i === xy.length - 1 ? 0 : jit(r, 0.7))])) };
  };
  const axis = (r) => `<path d="${hline(r, 0, BOT + 6.5, CW, BOT + 6.5, 0.5, 30)}" class="ch-faint" stroke-width="1"/>`;

  const sv = D.series.map((p) => p.v);
  const p1 = plot(D.series, Math.min(...sv), Math.max(...sv), 61);
  const [ax, ay] = p1.xy[0], [bx, by] = p1.xy.at(-1);
  const chart1 = `<svg class="ch-chart" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-label="This text: ${D.firstPct}% known on ${dShort(D.since)}, ${D.pct}% now, day by day">
    ${axis(p1.r)}
    <path d="${p1.d}" class="ch-ink" stroke-width="1.8"/>
    <circle cx="${n1(ax)}" cy="${n1(ay)}" r="2.6" class="ch-dot-o"/><circle cx="${n1(bx)}" cy="${n1(by)}" r="3.2" class="ch-dot"/>
    <text x="${n1(ax - 3)}" y="${n1(ay - 12)}" class="ch-lab">${D.firstPct}%</text>
    <text x="${n1(bx + 3)}" y="${n1(by - 9)}" text-anchor="end" class="ch-big-n">${D.pct}%</text>
    <text x="0" y="${CH - 1}" class="ch-lab ch-dim-t">since ${dShort(D.since)}</text>
  </svg>`;

  const hist = D.history.map((h) => ({ d: h.d, v: h.k }));
  const hv = hist.map((h) => h.v);
  const p2 = plot(hist, Math.min(...hv), Math.max(...hv), 67);
  const [cx2, cy2] = p2.xy.at(-1);
  const wk = new Date(date(hist.at(-1).d) - 7 * 864e5).toISOString().slice(0, 10);
  const xw = p2.X(wk);
  // this week's stretch of the line, gone over again, and bracketed on the ground line
  const weekPts = p2.xy.filter((q, i) => hist[i].d >= wk);
  const weekLine = weekPts.length > 1 ? `<path d="${curve(weekPts)}" class="ch-ink" stroke-width="3.4"/>` : '';
  const gy = BOT + 6.5;
  const weekBr = `<path d="${curve([[xw, gy - 4], [xw + 1.5, gy + 2], [(xw + cx2) / 2, gy + 2.6], [cx2 - 1.5, gy + 2], [cx2, gy - 4]])}" class="ch-ink" stroke-width="1.3"/>`;
  const chart2 = `<svg class="ch-chart" viewBox="0 0 ${CW} ${CH}" width="${CW}" height="${CH}" role="img" aria-label="Words known: ${fmt(D.history[0].k)} on ${dShort(D.history[0].d)}, ${fmt(D.known)} now; +${D.gain7} in the last week">
    ${axis(p2.r)}
    <path d="${p2.d}" class="ch-ink" stroke-width="1.8"/>${weekLine}${weekBr}
    <circle cx="${n1(p2.xy[0][0])}" cy="${n1(p2.xy[0][1])}" r="2.6" class="ch-dot-o"/><circle cx="${n1(cx2)}" cy="${n1(cy2)}" r="3.2" class="ch-dot"/>
    <text x="${n1(cx2 + 3)}" y="${n1(cy2 - 9)}" text-anchor="end" class="ch-big-n">${fmt(D.known)}</text>
    <text x="${CW}" y="${CH - 1}" text-anchor="end" class="ch-lab"><tspan class="ch-b">+${D.gain7}</tspan> this week</text>
  </svg>`;

  // a wobbly underline for the link
  const r6 = rng(71);
  const ul = `<svg class="ch-ul" viewBox="0 0 150 6" preserveAspectRatio="none" aria-hidden="true"><path d="${hline(r6, 1, 3, 149, 3.4, 0.8, 18)}" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg>`;

  const r7 = rng(83);
  const tagBox = `<svg class="ch-tag-bg" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true"><path d="${blob(r7, 1, 1, 158, 28, 6, 0.5)}" class="ch-wash"/><path d="${hbox(r7, 1, 1, 158, 28, 0.5, 2)}" class="ch-ink" stroke-width="1.3" vector-effect="non-scaling-stroke"/></svg>`;

  const better = D.pct > D.firstPct && D.gain7 > 0;
  return `
<div class="mp mp-chalabi">
  <svg class="ch-defs" width="0" height="0" aria-hidden="true"><defs>
    <filter id="chalabi-chalk" filterUnits="userSpaceOnUse" x="-40" y="-40" width="480" height="240">
      <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.1 1.95" result="g"/>
      <feComposite in="d" in2="g" operator="in"/>
    </filter>
    <filter id="chalabi-pen" filterUnits="userSpaceOnUse" x="-40" y="-40" width="480" height="240">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs></svg>
  <section class="ch-q">
    <h3 class="ch-h">Can I read this?</h3>
    <p class="ch-big">About <span class="ch-hl">1 word in ${D.oneIn}</span> is new to you</p>
    ${scribSvg}
    <p class="ch-aside">that's ${D.lookups} lookups in ${D.total} words</p>
    <div class="ch-verdict"><span class="ch-tag">${tagBox}<span>${esc(D.verdict.label)}</span></span><span class="ch-at">at ${D.level}</span></div>
    ${bar}
  </section>
  <section class="ch-q">
    <h3 class="ch-h">What will help most?</h3>
    <p class="ch-sub">New words that keep coming back <span class="ch-key">(one stroke = one time)</span></p>
    <div class="ch-listwrap"><div class="ch-listbox">${rules}<ul class="ch-list">${rows}</ul></div>${braceSvg}</div>
    <div class="ch-act"><button class="ch-btn" type="button">${btnBg}<span>${esc(D.action)}</span></button><p class="ch-after">Knowing them:<br><span class="ch-num">${D.after}%</span> of this text</p></div>
  </section>
  <section class="ch-q">
    <h3 class="ch-h">Am I getting better?${better ? ' <span class="ch-yes">Short answer: yes.</span>' : ''}</h3>
    <div class="ch-charts">
      <figure><figcaption>This text</figcaption>${chart1}</figure>
      <figure><figcaption>Words known</figcaption>${chart2}</figure>
    </div>
  </section>
  <a class="ch-more" href="#stats">${esc(D.more)} →${ul}</a>
</div>`;
}

export const css = `
.mp-chalabi {
  --ch-ink: var(--ink);
  --ch-soft: color-mix(in srgb, var(--ink) 30%, transparent);
  --ch-wash: color-mix(in srgb, #5fbfae 20%, transparent);
  --ch-btn: #6cc4b4;
  --ch-btn-ink: #101318;
  --ch-btn-shadow: #24524b;
  font-family: "Patrick Hand", var(--font-ui);
  color: var(--ink);
  padding: 2px 16px 12px;
}
:root[data-theme="light"] .mp-chalabi {
  --ch-soft: color-mix(in srgb, var(--ink) 26%, transparent);
  --ch-wash: color-mix(in srgb, #4fb3a2 22%, transparent);
  --ch-btn: #86d0c2;
  --ch-btn-shadow: var(--ink);
}
.mp-chalabi * { box-sizing: border-box; }
.mp-chalabi p, .mp-chalabi h3, .mp-chalabi ul, .mp-chalabi figure { margin: 0; padding: 0; }
.mp-chalabi .ch-defs { position: absolute; width: 0; height: 0; overflow: hidden; }
.mp-chalabi svg path { fill: none; stroke-linecap: round; stroke-linejoin: round; filter: url(#chalabi-chalk); }
:root[data-theme="light"] .mp-chalabi svg path { filter: url(#chalabi-pen); }
.mp-chalabi .ch-btn-bg path, .mp-chalabi .ch-tag-bg path, .mp-chalabi .ch-ul path { filter: none; }
.mp-chalabi .ch-ink { stroke: var(--ink); }
.mp-chalabi .ch-pink { stroke: var(--c-unknown); }
.mp-chalabi .ch-faint { stroke: var(--ch-soft); }
.mp-chalabi .ch-hatch { stroke: var(--band-k); }
.mp-chalabi path.ch-pink-fill { fill: var(--c-unknown); }
.mp-chalabi path.ch-amber-fill { fill: var(--band-l); }
.mp-chalabi path.ch-wash { fill: var(--ch-wash); }
.mp-chalabi .ch-dot { fill: var(--ink); }
.mp-chalabi path.ch-knock { stroke: var(--panel); filter: none; }
.mp-chalabi .ch-dot-o { fill: var(--panel); stroke: var(--ink); stroke-width: 1.4; }
.mp-chalabi svg text { font-family: "Patrick Hand", var(--font-ui); fill: var(--ink); }
.mp-chalabi .ch-lab { font-size: 13px; fill: var(--ui); }
.mp-chalabi .ch-b { font-size: 14px; fill: var(--ink); }
.mp-chalabi .ch-note { font-family: "Caveat", var(--font-ui); font-size: 18px; font-weight: 600; }
.mp-chalabi .ch-num { font-family: "Patrick Hand", var(--font-ui); font-size: 19px; }
.mp-chalabi .ch-pink-t { fill: var(--c-unknown); }
.mp-chalabi .ch-dim-t { fill: var(--dim); }
.mp-chalabi .ch-big-n { font-size: 23px; fill: var(--ink); }

.mp-chalabi .ch-q { padding-top: 10px; }
.mp-chalabi .ch-q + .ch-q { padding-top: 24px; }
.mp-chalabi .ch-h { font-family: "Caveat", var(--font-ui); font-weight: 700; font-size: 25px; line-height: 1.05; color: var(--ink); letter-spacing: .005em; }
.mp-chalabi .ch-yes { font-weight: 500; font-size: 20px; color: var(--dim); margin-inline-start: 4px; }
.mp-chalabi .ch-big { font-size: 20px; line-height: 1.2; margin-top: 3px; color: var(--ink); }
.mp-chalabi .ch-hl { color: var(--c-unknown); }
.mp-chalabi .ch-scrib { margin-top: 2px; }
.mp-chalabi .ch-aside { font-family: "Caveat", var(--font-ui); font-size: 18px; font-weight: 500; color: var(--dim); text-align: right; margin-top: -2px; line-height: 1; }
.mp-chalabi .ch-verdict { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.mp-chalabi .ch-tag { position: relative; display: inline-block; padding: 3px 12px 2px; font-size: 17px; color: var(--ink); }
.mp-chalabi .ch-tag > span { position: relative; }
.mp-chalabi .ch-tag-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.mp-chalabi .ch-at { font-size: 16px; color: var(--ui); }
.mp-chalabi .ch-bar { margin-top: 2px; }

.mp-chalabi .ch-sub { font-size: 15px; color: var(--ui); margin-top: 3px; }
.mp-chalabi .ch-key { color: var(--dim); font-size: 13.5px; }
.mp-chalabi .ch-listwrap { display: flex; align-items: flex-start; gap: 4px; margin-top: 4px; }
.mp-chalabi .ch-listbox { position: relative; flex: 1; }
.mp-chalabi .ch-rules { position: absolute; left: 0; top: 0; }
.mp-chalabi .ch-list { position: relative; list-style: none; }
.mp-chalabi .ch-list li { display: grid; grid-template-columns: 84px 40px 1fr; align-items: center; column-gap: 8px; height: 25px; }
.mp-chalabi .ch-w { color: var(--c-unknown); font-size: 18px; line-height: 1; }
.mp-chalabi .ch-g { color: var(--ui); font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-chalabi .ch-act { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.mp-chalabi .ch-btn { position: relative; border: 0; background: none; padding: 9px 20px 13px 18px; font: 18px/1 "Patrick Hand", var(--font-ui); color: var(--ch-btn-ink); cursor: pointer; white-space: nowrap; }
.mp-chalabi .ch-btn > span { position: relative; }
.mp-chalabi .ch-btn-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.mp-chalabi .ch-btn-face { fill: var(--ch-btn); }
.mp-chalabi .ch-btn-shadow { fill: var(--ch-btn-shadow); }
.mp-chalabi .ch-btn:hover .ch-btn-face { filter: brightness(1.05); }
.mp-chalabi .ch-btn:active { transform: translate(2px, 3px); }
.mp-chalabi .ch-btn:active .ch-btn-shadow { opacity: 0; }
.mp-chalabi .ch-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 10px; }
.mp-chalabi .ch-after { font-size: 15px; color: var(--ui); line-height: 1.15; }
.mp-chalabi .ch-after .ch-num { color: var(--ink); font-size: 22px; }

.mp-chalabi .ch-charts { display: grid; grid-template-columns: 172px 172px; justify-content: space-between; margin-top: 6px; }
.mp-chalabi figcaption { font-size: 15px; color: var(--ui); margin-bottom: 2px; }

.mp-chalabi .ch-more { position: relative; display: inline-block; margin-top: 16px; font-size: 17px; color: var(--accent); text-decoration: none; padding-bottom: 3px; }
.mp-chalabi .ch-ul { position: absolute; left: 0; right: 0; bottom: -2px; width: 100%; height: 6px; }
.mp-chalabi .ch-ul path { stroke: var(--accent); }
.mp-chalabi .ch-more:hover .ch-ul path { stroke-width: 2.2; }
.mp-chalabi .ch-more:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
`;
