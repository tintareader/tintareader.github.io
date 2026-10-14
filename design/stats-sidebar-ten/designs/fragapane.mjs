// Federica Fragapane: the panel as three small plants, drawn with thin lines.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'fragapane',
  designer: 'Federica Fragapane',
  title: 'Seeds, petals and sprouts',
  known: 'Data drawn as petals, stems and seeds, with thin lines and small careful labels.',
  idea: 'Each fact becomes a small plant whose size is the number. The text is a seed head of 262 seeds, the returning words are the petals of one flower, and progress is rows of sprouts. A key shows how to read a petal, and every number is written next to its shape.',
  how: [
    'Can I read this? The 262 words are seeds on a half circle, sorted known, learning, new. The arc runs from 0% to 100% known; the 60% and 95% marks are nodes on it.',
    'What will help most? Each returning new word is a pink petal. Its length is how often it appears, with one seed for each time. The button adds all seven.',
    'Am I getting better? Each day read since 18 Aug is a sprout; its height from the ground is the value. This text grows toward the 95% line, and the last seven days of words known are drawn thicker.',
  ],
  type: 'Raleway (Google Fonts, served from fonts/) for labels and numbers; the app\'s reading font for the Spanish words.',
};

export const fonts = [
  { family: 'Raleway', style: 'normal', weight: '300 700', file: 'Raleway-normal-300_700.woff2' },
  { family: 'Raleway', style: 'italic', weight: '300 700', file: 'Raleway-italic-300_700.woff2' },
];

const W = 367; // the panel is 399 px; 16 px gutters
const n1 = (v) => (Math.round(v * 10) / 10).toString();
const P = (x, y) => `${n1(x)} ${n1(y)}`;
const rad = (deg) => deg * Math.PI / 180;

// A petal of length L along angle a (degrees, screen space) from (x, y): pointed at the base, round at the tip.
function petal(x, y, L, a, bw) {
  const c = Math.cos(rad(a)), s = Math.sin(rad(a));
  const T = (u, v) => P(x + u * c - v * s, y + u * s + v * c); // u along, v across
  return `M${T(0, 0)} C${T(L * 0.22, bw * 1.05)} ${T(L * 0.55, bw)} ${T(L * 0.8, bw * 0.82)} C${T(L * 0.95, bw * 0.7)} ${T(L, bw * 0.34)} ${T(L, 0)} C${T(L, -bw * 0.34)} ${T(L * 0.95, -bw * 0.7)} ${T(L * 0.8, -bw * 0.82)} C${T(L * 0.55, -bw)} ${T(L * 0.22, -bw * 1.05)} ${T(0, 0)}Z`;
}
// A leaf: pointed at both ends.
function leaf(x, y, L, a, bw) {
  const c = Math.cos(rad(a)), s = Math.sin(rad(a));
  const T = (u, v) => P(x + u * c - v * s, y + u * s + v * c);
  return `M${T(0, 0)} C${T(L * 0.3, bw * 1.3)} ${T(L * 0.7, bw * 1.1)} ${T(L, 0)} C${T(L * 0.7, -bw * 1.1)} ${T(L * 0.3, -bw * 1.3)} ${T(0, 0)}Z`;
}

// 1 in 8, as a small blossom of eight petals with one pink.
function blossom(n) {
  const c = 14, out = [];
  for (let i = 0; i < n; i++) {
    const a = -90 + i * 360 / n;
    out.push(`<path d="${petal(c, c, 11.5, a, 2.8)}" class="${i === 0 ? 'fr-lu' : 'fr-lk'}"/>`);
  }
  return `<svg class="fr-blossom" viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">${out.join('')}<circle cx="${c}" cy="${c}" r="1.6" class="fr-bcore"/></svg>`;
}

// 1. The text as a half seed head: 262 seeds on an arc that runs from 0% to 100% known.
function seedHead(D) {
  const R = 106, cx = 178, cy = 136, H = 154;
  const N = D.total, c = D.counts;
  const order = [...Array(c.k).fill('k'), ...Array(c.l).fill('l'), ...Array(c.u).fill('u')];
  const pt = (f, r) => { const a = Math.PI * (1 - f); return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
  const hairs = { k: [], l: [], u: [] }, seeds = [];
  let nu = 0;
  order.forEach((s, i) => {
    const f = (i + 0.5) / N;
    const len = s === 'k' ? 8 : s === 'l' ? 12 : [12, 17, 22, 27][nu++ % 4];
    const [x0, y0] = pt(f, R + 3), [x1, y1] = pt(f, R + 3 + len);
    hairs[s].push(`M${P(x0, y0)}L${P(x1, y1)}`);
    if (s === 'u') seeds.push(`<circle cx="${n1(x1)}" cy="${n1(y1)}" r="1.45"/>`);
    if (s === 'l') seeds.push(`<circle cx="${n1(x1)}" cy="${n1(y1)}" r="1.45" class="fr-ls"/>`);
  });
  const arc = (f0, f1, r) => { const [a, b] = pt(f0, r), [x, y] = pt(f1, r); return `M${P(a, b)} A${r} ${r} 0 0 1 ${P(x, y)}`; };
  const pk = D.pct / 100, wk = D.thresholds.workable / 100, cf = D.thresholds.comfortable / 100;
  const [kx, ky] = pt(pk, R), [wx, wy] = pt(wk, R), [fx, fy] = pt(cf, R);
  const [kLx, kLy] = pt(0.2, R + 18);
  const [lLx, lLy] = pt((c.k + c.l / 2) / N, R + 21);
  const [uLx, uLy] = pt((c.k + c.l + c.u * 0.5) / N, R + 35);
  const [wLx, wLy] = pt(wk, R + 19);
  const bx = cx - 40, by = cy - 34;   // the big number
  const aria = `${N} words as seeds on a half circle: ${c.k} known, ${c.l} learning, ${c.u} new. ${D.pct}% known; ${D.thresholds.workable}% is workable at ${D.level}, ${D.thresholds.comfortable}% is comfortable.`;
  return `<svg class="fr-head" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
  <path d="${hairs.k.join('')}" class="fr-hk"/>
  <path d="${hairs.l.join('')}" class="fr-hl"/>
  <path d="${hairs.u.join('')}" class="fr-hu"/>
  <g class="fr-seed">${seeds.join('')}</g>
  <path d="${arc(0, pk, R)}" class="fr-arc"/>
  <path d="${arc(pk, 1, R)}" class="fr-arc fr-arc-rest"/>
  <line x1="${n1(cx - R)}" x2="${n1(cx + R)}" y1="${cy}" y2="${cy}" class="fr-ground"/>
  <text x="${n1(cx - R)}" y="${cy + 14}" text-anchor="middle" class="fr-t">0%</text>
  <text x="${n1(cx + R)}" y="${cy + 14}" text-anchor="middle" class="fr-t">100%</text>
  <path d="M${P(...pt(wk, R + 4))}L${P(...pt(wk, R + 15))}" class="fr-tick"/>
  <circle cx="${n1(wx)}" cy="${n1(wy)}" r="3.1" class="fr-node"/>
  <circle cx="${n1(fx)}" cy="${n1(fy)}" r="3.1" class="fr-node"/>
  <path d="M${n1(bx + 50)} ${n1(ky)}H${n1(kx - 6)}" class="fr-lead-line"/>
  <circle cx="${n1(kx)}" cy="${n1(ky)}" r="3.6" class="fr-here"/>
  <text x="${n1(wLx + 3)}" y="${n1(wLy + 1)}" class="fr-t"><tspan class="fr-tb">${D.thresholds.workable}%</tspan> workable at ${D.level}</text>
  <text x="${n1(fx - 8)}" y="${n1(fy - 1)}" text-anchor="end" class="fr-t fr-tb">${D.thresholds.comfortable}%</text>
  <text x="${n1(fx - 8)}" y="${n1(fy + 12)}" text-anchor="end" class="fr-t">comfortable</text>
  <text x="${n1(bx)}" y="${n1(by)}" text-anchor="middle" class="fr-big">${D.pct}<tspan class="fr-big-pc" dx="1">%</tspan></text>
  <text x="${n1(bx)}" y="${n1(by + 16)}" text-anchor="middle" class="fr-t">of words known</text>
  <text x="${n1(kLx - 3)}" y="${n1(kLy)}" text-anchor="end" class="fr-t"><tspan class="fr-tb">${c.k}</tspan> known</text>
  <text x="${n1(lLx + 4)}" y="${n1(lLy)}" class="fr-t fr-tlearn"><tspan class="fr-tb">${c.l}</tspan> learning</text>
  <text x="${n1(uLx + 4)}" y="${n1(uLy + 4)}" class="fr-t fr-tnew"><tspan class="fr-tb">${c.u}</tspan> new</text>
</svg>`;
}

// 2. The returning words as one flower: petal length = times it appears, one seed per time.
function flower(D) {
  const u = 19, bw = 7, H = 204, cx = 156, cy = 122;
  const n = D.repeated.length, step = 360 / n;
  const parts = [], labels = [];
  D.repeated.forEach((r, i) => {
    const a = -128 + i * step, L = r.count * u;
    const c = Math.cos(rad(a)), s = Math.sin(rad(a));
    parts.push(`<path d="${petal(cx, cy, L, a, bw)}" class="fr-petal"/>`);
    parts.push(`<path d="M${P(cx, cy)}L${P(cx + c * (L - 3), cy + s * (L - 3))}" class="fr-vein"/>`);
    for (let k = 0; k < r.count; k++) {
      const d = (k + 0.6) * u;
      parts.push(`<circle cx="${n1(cx + c * d)}" cy="${n1(cy + s * d)}" r="1.9" class="fr-pseed"/>`);
    }
    const ax = cx + c * (L + 7), ay = cy + s * (L + 7);
    const anchor = c > 0.3 ? 'start' : c < -0.3 ? 'end' : 'middle';
    const y1 = s < -0.55 ? ay - 17 : s > 0.55 ? ay + 12 : ay - 1;
    labels.push(`<text x="${n1(ax)}" y="${n1(y1)}" text-anchor="${anchor}" class="fr-w"><tspan lang="es">${esc(r.word)}</tspan><tspan class="fr-x" dx="3">${r.count}×</tspan></text>`);
    labels.push(`<text x="${n1(ax)}" y="${n1(y1 + 13.5)}" text-anchor="${anchor}" class="fr-t fr-gl">${esc(r.gloss)}</text>`);
  });
  // How to read: one petal, annotated.
  const kx = 262, ky = 11, kL = 2 * u, kc = ky + 17;
  const key = `<g class="fr-key">
    <text x="${kx}" y="${ky}" class="fr-t fr-kh">how to read</text>
    <path d="${petal(kx, kc, kL, 0, bw)}" class="fr-petal"/>
    <path d="M${P(kx, kc)}L${P(kx + kL - 3, kc)}" class="fr-vein"/>
    <circle cx="${n1(kx + 0.6 * u)}" cy="${kc}" r="1.9" class="fr-pseed"/>
    <circle cx="${n1(kx + 1.6 * u)}" cy="${kc}" r="1.9" class="fr-pseed"/>
    <text x="${kx + kL + 6}" y="${kc + 4}" class="fr-t">a new word</text>
    <path d="M${kx} ${kc + 10}v3h${kL}v-3" class="fr-tick"/>
    <text x="${kx}" y="${kc + 26}" class="fr-t">length: how often</text>
    <text x="${kx}" y="${kc + 39}" class="fr-t">it comes back,</text>
    <text x="${kx}" y="${kc + 52}" class="fr-t">one seed per time</text>
  </g>`;
  const aria = `${n} new words that come back: ` + D.repeated.map(r => `${r.word} ${r.count} times, ${r.gloss}`).join('; ');
  return `<svg class="fr-flower" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(aria)}">
  ${parts.join('')}
  <circle cx="${cx}" cy="${cy}" r="3.2" class="fr-core"/>
  ${labels.join('')}
  ${key}
</svg>`;
}

// 3. Progress as a row of sprouts: one per day read, its height from the ground is the value.
function sprouts(points, w, h, opts) {
  const { max, aria, weekFrom, goal } = opts;
  const pl = 3, pr = 4, pt = goal ? 10 : 5;
  const t0 = points[0].t, t1 = points.at(-1).t;
  const X = (t) => pl + (t - t0) / (t1 - t0) * (w - pl - pr);
  const Y = (v) => h - (v / max) * (h - pt);
  const lines = { old: [], wk: [] }, dots = [];
  points.forEach((p, i) => {
    const x = X(p.t), y = Y(p.v), last = i === points.length - 1;
    const inWeek = weekFrom != null && p.t >= weekFrom;
    (inWeek ? lines.wk : lines.old).push(`M${P(x, h)}V${n1(y + (last ? 3 : 1))}`);
    if (!last) dots.push(`<circle cx="${n1(x)}" cy="${n1(y)}" r="1.25"${inWeek ? ' class="fr-dwk"' : ''}/>`);
  });
  const ex = X(t1), ey = Y(points.at(-1).v);
  return `<svg class="fr-stem" viewBox="0 0 ${w} ${h + 1}" width="${w}" height="${h + 1}" role="img" aria-label="${esc(aria)}">
    <path d="${lines.old.join('')}" class="fr-sprout"/>
    <path d="${lines.wk.join('')}" class="fr-sprout fr-sprout-wk"/>
    <g class="fr-sdot">${dots.join('')}</g>
    <circle cx="${n1(ex)}" cy="${n1(ey)}" r="3.2" class="fr-bud"/>
    ${goal ? `<line x1="0" x2="${w}" y1="${n1(Y(goal.v))}" y2="${n1(Y(goal.v))}" class="fr-goal"/><text x="${w}" y="${n1(Y(goal.v) - 3)}" text-anchor="end" class="fr-t">${esc(goal.label)}</text>` : ''}
    <line x1="0" x2="${w}" y1="${h + 0.4}" y2="${h + 0.4}" class="fr-soil"/>
  </svg>`;
}

export function html(D) {
  const v = D.verdict;
  const tSeries = D.series.map(q => ({ t: Date.parse(q.d), v: q.v }));
  const tHist = D.history.map(q => ({ t: Date.parse(q.d), v: q.k }));
  const lastT = tHist.at(-1).t, weekFrom = lastT - 7 * 864e5;
  const sw = 170, sh = 66;
  const s1 = sprouts(tSeries, sw, sh, { max: 100, goal: { v: D.thresholds.comfortable, label: `${D.thresholds.comfortable}% comfortable` }, aria: `This text: ${D.firstPct}% known on ${dShort(D.since)}, ${D.pct}% now, one sprout per day read; the dotted line is ${D.thresholds.comfortable}%, comfortable.` });
  const s2 = sprouts(tHist, sw, sh, { max: D.known, weekFrom, aria: `Words known: ${fmt(D.history[0].k)} on ${dShort(D.history[0].d)}, ${fmt(D.known)} now, one sprout per day read; ${D.gain7} more this week, drawn thicker.` });
  return `
<div class="mp mp-fragapane">
  <section class="fr-q fr-q1">
    <h3 class="fr-h"><span class="fr-n">1</span>Can I read this?</h3>
    <p class="fr-lead">About 1 word in ${D.oneIn} is new to you ${blossom(D.oneIn)}</p>
    ${seedHead(D)}
    <p class="fr-verdict"><span class="fr-vl">${esc(v.label)}</span><span class="fr-va">at ${D.level}</span><span class="fr-vs">${D.lookups} lookups in ${D.total} words</span></p>
  </section>
  <section class="fr-q fr-q2">
    <h3 class="fr-h"><span class="fr-n">2</span>What will help most?</h3>
    <p class="fr-sub">${D.repeated.length} new words come back in this text: ${D.repeatedTokens} of your ${D.lookups} lookups.</p>
    ${flower(D)}
    <div class="fr-act"><button class="btn fr-btn" type="button"><svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M6 1.5v9M1.5 6h9"/></svg>${esc(D.action)}</button><span class="fr-after">Knowing them: <b>${D.after}%</b> of this text</span></div>
  </section>
  <section class="fr-q fr-q3">
    <h3 class="fr-h"><span class="fr-n">3</span>Am I getting better?</h3>
    <div class="fr-stems">
      <figure class="fr-fig">
        <figcaption class="fr-cap">This text</figcaption>
        <div class="fr-vals"><span class="fr-from">${D.firstPct}%</span><span class="fr-arrow" aria-hidden="true">→</span><b>${D.pct}%</b></div>
        ${s1}
        <div class="fr-foot">since ${dShort(D.since)}</div>
      </figure>
      <figure class="fr-fig">
        <figcaption class="fr-cap">Words known</figcaption>
        <div class="fr-vals"><b>${fmt(D.known)}</b></div>
        ${s2}
        <div class="fr-foot"><span class="fr-wk" aria-hidden="true"></span>+${D.gain7} this week</div>
      </figure>
    </div>
  </section>
  <a class="fr-more" href="#stats">${esc(D.more)}<span aria-hidden="true"> →</span></a>
</div>`;
}

export const css = `
.mp-fragapane {
  --fr-line: #8b96a4;
  --fr-hair: rgba(197, 204, 212, .5);
  --fr-label: #9aa4b1;
  --fr-stem: #8fcfa6;
  --fr-petal: color-mix(in srgb, var(--c-unknown) 17%, transparent);
  font-family: 'Raleway', var(--font-ui);
  font-variant-numeric: lining-nums tabular-nums;
  color: var(--ink);
  padding: 2px 16px 14px;
}
:root[data-theme="light"] .mp-fragapane {
  --fr-line: #858d86;
  --fr-hair: rgba(27, 31, 36, .42);
  --fr-label: #5e676f;
  --fr-stem: #2f7a55;
  --fr-petal: color-mix(in srgb, var(--c-unknown) 13%, transparent);
}
.mp-fragapane * { box-sizing: border-box; }
.mp-fragapane p, .mp-fragapane h3, .mp-fragapane figure { margin: 0; }
.mp-fragapane .fr-q { padding-top: 22px; }
.mp-fragapane .fr-q1 { padding-top: 6px; }
.mp-fragapane .fr-h { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--fr-label); }
.mp-fragapane .fr-n { display: inline-grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--fr-line); font-size: 10.5px; letter-spacing: 0; font-weight: 500; color: var(--ink); }
.mp-fragapane .fr-lead { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 18px; font-weight: 400; letter-spacing: -.005em; color: var(--ink); }
.mp-fragapane .fr-bcore { fill: var(--panel); stroke: var(--ink); stroke-width: .8; }
.mp-fragapane .fr-lk { fill: none; stroke: var(--ink); stroke-width: .75; }
.mp-fragapane .fr-lu { fill: var(--c-unknown); stroke: var(--c-unknown); stroke-width: .75; }
.mp-fragapane .fr-head { margin-top: 4px; }
.mp-fragapane .fr-arc { fill: none; stroke: var(--ink); stroke-width: 1.1; }
.mp-fragapane .fr-arc-rest { stroke: var(--fr-line); stroke-width: .8; stroke-dasharray: 2 2.5; }
.mp-fragapane .fr-hk { fill: none; stroke: var(--fr-hair); stroke-width: .6; }
.mp-fragapane .fr-hl { fill: none; stroke: var(--c-learning); stroke-width: .8; }
.mp-fragapane .fr-hu { fill: none; stroke: var(--c-unknown); stroke-width: .7; }
.mp-fragapane .fr-seed circle { fill: var(--c-unknown); }
.mp-fragapane .fr-seed .fr-ls { fill: var(--c-learning); }
.mp-fragapane .fr-ground { stroke: var(--fr-line); stroke-width: .6; stroke-dasharray: 1 2.5; }
.mp-fragapane .fr-node { fill: var(--panel); stroke: var(--ink); stroke-width: 1; }
.mp-fragapane .fr-here { fill: var(--ink); }
.mp-fragapane .fr-tick { fill: none; stroke: var(--fr-line); stroke-width: .7; }
.mp-fragapane .fr-t { font: 400 10.5px 'Raleway', var(--font-ui); fill: var(--fr-label); }
.mp-fragapane .fr-tb { font-weight: 700; fill: var(--ink); }
.mp-fragapane .fr-tnew .fr-tb { fill: var(--c-unknown); }
.mp-fragapane .fr-tlearn .fr-tb { fill: var(--c-learning); }
.mp-fragapane .fr-big { font: 300 40px 'Raleway', var(--font-ui); fill: var(--ink); letter-spacing: -.02em; }
.mp-fragapane .fr-big-pc { font-size: 22px; }
.mp-fragapane .fr-verdict { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 7px; margin-top: 6px; font-size: 12.5px; color: var(--fr-label); }
.mp-fragapane .fr-vl { font-size: 14px; font-weight: 600; color: var(--ink); }
.mp-fragapane .fr-vs { flex-basis: 100%; }
.mp-fragapane .fr-sub { margin-top: 6px; font-size: 12px; color: var(--fr-label); }
.mp-fragapane .fr-petal { fill: var(--fr-petal); stroke: var(--c-unknown); stroke-width: .9; }
.mp-fragapane .fr-vein { stroke: var(--c-unknown); stroke-width: .5; opacity: .7; }
.mp-fragapane .fr-pseed { fill: var(--c-unknown); }
.mp-fragapane .fr-core { fill: var(--panel); stroke: var(--c-unknown); stroke-width: 1; }
.mp-fragapane .fr-w { font: 15px var(--font-read); fill: var(--c-unknown); }
.mp-fragapane .fr-x { font: 600 10.5px 'Raleway', var(--font-ui); fill: var(--ink); }
.mp-fragapane .fr-gl { font-style: italic; }
.mp-fragapane .fr-kh { font-style: italic; font-weight: 600; fill: var(--ink); }
.mp-fragapane .fr-lead-line { fill: none; stroke: var(--fr-line); stroke-width: .7; stroke-dasharray: 1.5 2; }
.mp-fragapane .fr-act { display: flex; align-items: center; gap: 12px; margin-top: 2px; }
.mp-fragapane .fr-btn { gap: 6px; padding: 6px 13px 6px 11px; border-radius: 16px !important; font: 600 12.5px 'Raleway', var(--font-ui); color: var(--ink); border-color: var(--c-unknown); box-shadow: 0 1px 0 var(--card-line), 0 1px 3px var(--shadow); }
.mp-fragapane .fr-btn svg path { stroke: var(--c-unknown); stroke-width: 1.4; fill: none; }
.mp-fragapane .fr-after { font-size: 12.5px; color: var(--fr-label); }
.mp-fragapane .fr-after b { color: var(--ink); font-weight: 700; }
.mp-fragapane .fr-stems { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; margin-top: 8px; }
.mp-fragapane .fr-fig { min-width: 0; }
.mp-fragapane .fr-cap { font-size: 12px; font-weight: 600; color: var(--ink); }
.mp-fragapane .fr-vals { display: flex; align-items: baseline; gap: 5px; margin: 1px 0 2px; font-size: 13px; color: var(--fr-label); }
.mp-fragapane .fr-vals b { font-size: 17px; font-weight: 500; color: var(--ink); }
.mp-fragapane .fr-stem { width: 100%; height: auto; }
.mp-fragapane .fr-sdot circle { fill: var(--fr-stem); }
.mp-fragapane .fr-sprout { fill: none; stroke: var(--fr-stem); stroke-width: .7; opacity: .55; }
.mp-fragapane .fr-sprout-wk { stroke-width: 1.3; opacity: 1; }
.mp-fragapane .fr-goal { stroke: var(--fr-line); stroke-width: .7; stroke-dasharray: 1.5 2.5; }
.mp-fragapane .fr-soil { stroke: var(--fr-line); stroke-width: .8; }
.mp-fragapane .fr-bud { fill: var(--fr-stem); }
.mp-fragapane .fr-foot { display: flex; align-items: center; gap: 6px; margin-top: 4px; font-size: 11px; color: var(--fr-label); }
.mp-fragapane .fr-wk { position: relative; width: 1.3px; height: 11px; margin: 0 2px 0 3px; background: var(--fr-stem); }
.mp-fragapane .fr-wk::before { content: ''; position: absolute; left: -1.6px; top: -2px; width: 4.5px; height: 4.5px; border-radius: 50%; background: var(--fr-stem); }
.mp-fragapane .fr-more { display: inline-block; margin-top: 16px; color: var(--accent); font: 600 12.5px/1.3 'Raleway', var(--font-ui); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
`;
