// Paula Scher: the type is the chart.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'scher',
  designer: 'Paula Scher',
  title: 'Type at its true size',
  known: 'Pentagram partner; the Public Theater posters and identity, loud wood-type grotesques at clashing sizes, and her painted typographic maps.',
  idea: 'Scher makes the words the picture. Here size carries meaning: the answers are huge, each question shouts its key word, and monte, which comes back twice as often as the other new words, is set at twice their size. Black and white, with the app\'s new-word pink as the one hot colour.',
  how: [
    'Can I read this? A pink 1 and a black 8, both huge, say how many words are new, with the share known beside them. The verdict runs the full width in wide capitals. A solid band shows known, learning and new words, with ticks at the workable and comfortable marks.',
    'What will help most? The seven new words are stacked in pink, each set at a size in proportion to how often it appears: 13 px per appearance, so monte is twice the size of the rest. Each has its count and gloss. The button and the share after learning them sit under monte.',
    'Am I getting better? The first and current share for this text are set at sizes in proportion to their values, next to the words-known total. Thick lines on one date axis show both daily histories, with the start date and this week\'s gain under them.',
  ],
  type: 'Archivo (Omnibus-Type, from Google Fonts), one variable family used at three widths: extra condensed black for numbers and the new words, extended black for headings and captions, normal width for small text.',
};

export const fonts = [
  { family: 'Archivo', style: 'normal', weight: '100 900', file: 'Archivo-normal-100_900.woff2' },
];

// A line on a date axis, drawn as a thick painted stroke.
function line(rows, val, w, h, pad) {
  const t0 = Date.parse(rows[0].d), t1 = Date.parse(rows.at(-1).d);
  const vs = rows.map(val), lo = Math.min(...vs), hi = Math.max(...vs);
  const pts = rows.map(r => [pad + ((Date.parse(r.d) - t0) / (t1 - t0)) * (w - 2 * pad), pad + (1 - (val(r) - lo) / (hi - lo || 1)) * (h - 2 * pad)]);
  return { d: pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' '), end: pts.at(-1) };
}

export function html(D) {
  const W = 367, f = (n) => n.toFixed(1); // 399 px panel less 16 px gutters
  const c = D.counts, T = D.total, th = D.thresholds;
  const xK = c.k / T * W, xL = (c.k + c.l) / T * W;
  const xw = th.workable / 100 * W, xc = th.comfortable / 100 * W;
  const band = `<svg class="sc-band" viewBox="0 0 ${W} 60" width="${W}" height="60" role="img" aria-label="${T} words: ${c.k} known, ${c.l} learning, ${c.u} new. Marks at ${th.workable}% workable at ${D.level} and ${th.comfortable}% comfortable.">
    <text x="${f(xw - 5)}" y="10" text-anchor="end" class="sc-tk">${th.workable}% workable at ${D.level}</text>
    <text x="${f(xc - 5)}" y="10" text-anchor="end" class="sc-tk">${th.comfortable}% comfortable</text>
    <line x1="${f(xw)}" x2="${f(xw)}" y1="1" y2="17" class="sc-tick"/>
    <line x1="${f(xc)}" x2="${f(xc)}" y1="1" y2="17" class="sc-tick"/>
    <rect x="0" y="16" width="${f(xK)}" height="28" class="sc-fk"/>
    <rect x="${f(xK)}" y="16" width="${f(xL - xK)}" height="28" class="sc-fl"/>
    <rect x="${f(xL)}" y="16" width="${f(W - xL)}" height="28" class="sc-fu"/>
    <text x="9" y="35" class="sc-in">${c.k} known</text>
    <text x="${f(xL + (W - xL) / 2)}" y="35" text-anchor="middle" class="sc-in sc-in-u">${c.u} new</text>
    <line x1="${f((xK + xL) / 2)}" x2="${f((xK + xL) / 2)}" y1="44" y2="50" class="sc-tick"/>
    <text x="${f((xK + xL) / 2 + 3)}" y="59" text-anchor="end" class="sc-tk">${c.l} learning</text>
  </svg>`;

  const unit = 13; // font size per appearance in the text: 2× = 26px, 4× = 52px
  const [first, ...rest] = D.repeated;
  const wd = (r) => `<span class="sc-wd" style="font-size:${r.count * unit}px">${esc(r.word)}</span>`;

  const SW = (W - 16) / 2;
  const s1 = line(D.series, r => r.v, SW, 30, 4.5);
  const s2 = line(D.history, r => r.k, SW, 30, 4.5);
  const spark = (s, label) => `<svg class="sc-spark" viewBox="0 0 ${SW} 30" width="${SW}" height="30" role="img" aria-label="${label}"><path d="${s.d}" class="sc-ln"/><circle cx="${f(s.end[0])}" cy="${f(s.end[1])}" r="4" class="sc-dot"/></svg>`;
  const big3 = 46; // 77% and 86% sized in proportion to their values

  return `
<div class="mp mp-scher"><div class="sc">
  <h2 class="sc-h">Can I <em>read</em> this?</h2>
  <div class="sc-pair">
    <div class="sc-onein">
      <span class="sc-cap sc-about">About</span>
      <span class="sc-n sc-u">1</span><span class="sc-wordin">word<br>in</span><span class="sc-n">${D.oneIn}</span>
      <span class="sc-cap">is new to you</span>
    </div>
    <div class="sc-pct">
      <span class="sc-n">${D.pct}</span><span class="sc-pc">%</span>
      <span class="sc-cap">of the words known</span>
    </div>
  </div>
  <div class="sc-verdict">${esc(D.verdict.label)}</div>
  <div class="sc-look"><b>at ${D.level}</b> · ${D.lookups} lookups in ${D.total} words</div>
  ${band}

  <h2 class="sc-h">What will <em>help</em> most?</h2>
  <div class="sc-cap sc-sub">New words that come back in this text</div>
  <div class="sc-words">
    <div class="sc-mon">
      ${wd(first)}<div class="sc-note"><b>${first.count}×</b> ${esc(first.gloss)}</div>
      <button class="sc-btn" type="button">${esc(D.action)}</button>
      <div class="sc-after"><span class="sc-cap">Knowing them:</span><span class="sc-n2">${D.after}%</span><span class="sc-cap">of this<br>text</span></div>
    </div>
    <ul class="sc-stack">${rest.map(r => `<li>${wd(r)}<span class="sc-note"><b>${r.count}×</b> ${esc(r.gloss)}</span></li>`).join('')}</ul>
  </div>

  <h2 class="sc-h">Am I getting <em>better?</em></h2>
  <div class="sc-pair sc-prog">
    <div>
      <div class="sc-cap">This text</div>
      <div class="sc-pv"><span class="sc-n3 sc-from" style="font-size:${f(big3 * D.firstPct / D.pct)}px">${D.firstPct}%</span><span class="sc-arr">→</span><span class="sc-n3" style="font-size:${big3}px">${D.pct}%</span></div>
      ${spark(s1, `This text, share of words known by day: ${D.firstPct}% on ${dShort(D.since)}, ${D.pct}% now`)}
      <div class="sc-pn">since ${dShort(D.since)}</div>
    </div>
    <div>
      <div class="sc-cap">Words known</div>
      <div class="sc-pv"><span class="sc-n3" style="font-size:${big3}px">${fmt(D.known)}</span></div>
      ${spark(s2, `Words known by day: ${fmt(D.history[0].k)} on ${dShort(D.history[0].d)}, ${fmt(D.known)} now`)}
      <div class="sc-pn">+${D.gain7} this week</div>
    </div>
  </div>
  <a class="sc-more" href="#stats">${esc(D.more)}<span aria-hidden="true"> →</span></a>
</div></div>`;
}

export const css = `
.mp-scher {
  --s-ink: #f4f2ec; --s-rev: #121418; --s-dim: #b3bac3; --s-u: var(--c-unknown); --s-l: var(--band-l);
  --s-cond: "wdth" 62; --s-wide: "wdth" 125;
  padding: 4px 16px 12px;
}
:root[data-theme="light"] .mp-scher { --s-ink: #111215; --s-rev: #f7f7f3; --s-dim: #474c52; }
.mp-scher .sc { font-family: Archivo, var(--font-ui); font-variation-settings: "wdth" 100; color: var(--s-ink); }
.mp-scher .sc * { box-sizing: border-box; }
.mp-scher .sc-h { margin: 20px 0 10px; font: 900 19px/.8 Archivo; font-variation-settings: var(--s-wide); text-transform: uppercase; letter-spacing: -.01em; color: var(--s-ink); }
.mp-scher .sc-h em { font-style: normal; font-size: 38px; font-variation-settings: var(--s-cond); letter-spacing: 0; }
.mp-scher .sc-h:first-child { margin-top: 6px; }
.mp-scher .sc-n, .mp-scher .sc-pc, .mp-scher .sc-n2, .mp-scher .sc-n3, .mp-scher .sc-wd { font-weight: 900; font-variation-settings: var(--s-cond); line-height: .74; }
.mp-scher .sc-cap { font: 700 11.5px/1.2 Archivo; font-variation-settings: "wdth" 118; text-transform: uppercase; letter-spacing: .02em; }
.mp-scher .sc-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.mp-scher .sc-onein, .mp-scher .sc-pct { display: flex; flex-wrap: wrap; align-items: flex-end; align-content: flex-end; }
.mp-scher .sc-onein .sc-cap, .mp-scher .sc-pct .sc-cap { flex-basis: 100%; margin-top: 8px; }
.mp-scher .sc-onein .sc-about { margin: 0 0 8px; }
.mp-scher .sc-n { font-size: 130px; }
.mp-scher .sc-u { color: var(--s-u); }
.mp-scher .sc-wordin { font: 800 13px/1.05 Archivo; font-variation-settings: "wdth" 118; text-transform: uppercase; padding: 0 5px 0 6px; }
.mp-scher .sc-pc { font-size: 64px; }
.mp-scher .sc-verdict { margin-top: 18px; white-space: nowrap; font: 900 20.8px/.8 Archivo; font-variation-settings: var(--s-wide); text-transform: uppercase; letter-spacing: -.012em; }
.mp-scher .sc-look { font-size: 12.5px; margin: 8px 0 10px; color: var(--s-dim); }
.mp-scher .sc-look b { color: var(--s-ink); font-weight: 800; font-variation-settings: "wdth" 118; text-transform: uppercase; }
.mp-scher .sc-band .sc-tick { stroke: var(--s-ink); stroke-width: 2; }
.mp-scher .sc-band .sc-tk { font: 500 11px Archivo; fill: var(--s-dim); }
.mp-scher .sc-band .sc-in { font: 800 12.5px Archivo; text-transform: uppercase; fill: var(--s-rev); letter-spacing: .03em; }
.mp-scher .sc-band .sc-in-u { font-variation-settings: "wdth" 62; letter-spacing: .01em; }
.mp-scher .sc-fk { fill: var(--s-ink); } .mp-scher .sc-fl { fill: var(--s-l); } .mp-scher .sc-fu { fill: var(--s-u); }
.mp-scher .sc-sub { margin-bottom: 10px; }
.mp-scher .sc-words { display: grid; grid-template-columns: auto 1fr; gap: 0 14px; }
.mp-scher .sc-wd { color: var(--s-u); text-transform: uppercase; display: block; }
.mp-scher .sc-mon { display: flex; flex-direction: column; align-items: flex-start; }
.mp-scher .sc-mon .sc-note { margin: 8px 0 14px; }
.mp-scher .sc-stack { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: auto 1fr; gap: 9px 8px; align-items: last baseline; align-content: start; }
.mp-scher .sc-stack li { display: contents; }
.mp-scher .sc-note { font: 500 11.5px/1 Archivo; color: var(--s-dim); white-space: nowrap; }
.mp-scher .sc-note b { color: var(--s-ink); font-weight: 800; }
.mp-scher .sc-btn { margin-top: auto; font: 800 12.5px/1 Archivo; font-variation-settings: "wdth" 80; text-transform: uppercase; letter-spacing: .03em; white-space: nowrap; color: var(--s-rev); background: var(--s-ink); border: 2px solid var(--s-ink); padding: 10px 11px; cursor: pointer; box-shadow: 4px 4px 0 var(--s-dim); }
.mp-scher .sc-btn:hover { box-shadow: 5px 5px 0 var(--s-dim); transform: translate(-1px, -1px); }
.mp-scher .sc-btn:active { box-shadow: 1px 1px 0 var(--s-dim); transform: translate(3px, 3px); }
.mp-scher .sc-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.mp-scher .sc-after { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 6px 6px; margin-top: 14px; }
.mp-scher .sc-after .sc-cap:first-child { flex-basis: 100%; }
.mp-scher .sc-n2 { font-size: 38px; }
.mp-scher .sc-pv { display: flex; align-items: flex-end; gap: 4px; margin: 10px 0 8px; }
.mp-scher .sc-from { color: var(--s-dim); }
.mp-scher .sc-arr { font: 500 22px/1 Archivo; padding: 0 2px 6px; align-self: center; }
.mp-scher .sc-spark .sc-ln { fill: none; stroke: var(--s-ink); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }
.mp-scher .sc-spark .sc-dot { fill: var(--s-ink); }
.mp-scher .sc-pn { font: 500 12px/1.2 Archivo; color: var(--s-dim); margin-top: 4px; }
.mp-scher .sc-more { display: inline-block; margin-top: 14px; font: 700 13px/1.2 Archivo; color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
`;
