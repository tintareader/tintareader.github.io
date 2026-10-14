// Susan Kare: the panel as three small 1984 Macintosh windows. One-bit pixels
// on an exact grid, a Chicago-like bitmap face, striped title bars, a default
// push button with its thick ring, dithered fills for areas. Colour only where
// it carries meaning: pink for new words, amber for learning.
import { esc, fmt, dShort } from '../harness/data.mjs';

export const meta = {
  id: 'kare',
  designer: 'Susan Kare',
  title: 'Three windows, one bit',
  known: 'The icons and bitmap fonts of the first Macintosh, 1984.',
  idea: 'Kare drew with very few pixels on a square grid, so that a small picture could be read at a glance and had some humour in it. Here every mark sits on whole pixels, in black and white, and each question gets its own small Mac window with a striped title bar. Pink is the only colour that matters: it marks new words, as it does in the text.',
  how: [
    'Can I read this? The 1 in 8 is said in large bitmap type and shown as a line of eight word tiles, the last one pink with a question mark. A page under a magnifying glass, which finds a pink word, stands beside the verdict and the counts. One bar holds the 227 known, 2 learning and 33 new words, with tab-stop marks at 60% and 95%, as on the MacWrite ruler.',
    'What will help most? Each word that comes back is listed in pink, with one pip for each time it appears and its gloss. The button is the Mac default button with its thick ring; beside it, 92% in large type.',
    'Am I getting better? Two stepped pixel lines over a dithered grey, from 18 Aug to today, with small square handles at each end as in MacDraw. A pointing hand shows the way to all your statistics.',
  ],
  type: 'Jersey 10 (Google Fonts, SIL Open Font License), a bitmap face on a whole-pixel grid, set at exactly 1 and 2 pixels per font pixel, standing in for Chicago. Icons are drawn here as pixel art.',
};

export const fonts = [{ family: 'Jersey 10', style: 'normal', weight: '400', file: 'Jersey10-normal-400.woff2' }];

// ---------- pixel art ----------
// '#' ink, 'o' paper, 'p' new-word pink, 'a' learning amber, anything else clear.
const FILL = { '#': 'var(--k-ink)', o: 'var(--k-paper)', p: 'var(--c-unknown)', a: 'var(--band-l)' };
function rects(rows, s = 1, ox = 0, oy = 0) {
  let out = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (!FILL[c]) { x++; continue; }
      let e = x; while (row[e + 1] === c) e++;
      out += `<rect x="${ox + x * s}" y="${oy + y * s}" width="${(e - x + 1) * s}" height="${s}" fill="${FILL[c]}"/>`;
      x = e + 1;
    }
  });
  return out;
}
const art = (str) => str.trim().split('\n').map(r => r.trim());
function bitmap(rows, { s = 1, cls = '', label = '' } = {}) {
  const w = Math.max(...rows.map(r => r.length)) * s, h = rows.length * s;
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg class="${cls}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" ${a11y}>${rects(rows, s)}</svg>`;
}

const GLASSES = art(`
  .#..............#.
  #................#
  #.#####....#####.#
  ##ooooo#..#ooooo##
  .#ooooo####ooooo#.
  .#ooooo#..#ooooo#.
  .#ooooo#..#ooooo#.
  ..#####....#####..
`);
const BULB = art(`
  ...#####...
  .##ooooo##.
  .#ooooooo#.
  #oo##oooo#.
  #o#ooooooo#
  #o#ooooooo#
  #ooooooooo#
  .#ooooooo#.
  .#oo#o#oo#.
  ..#oo#oo#..
  ...#o#o#...
  ...#####...
  ...#ooo#...
  ...#####...
  ....###....
`);
const SPROUT = art(`
  .......####.
  .##...#ooo#.
  #oo#..#oo#..
  #ooo#.#o#...
  .#oo#.##....
  ..###.#.....
  .....##.....
  .....#......
  ###########.
  #ooooooooo#.
  .#ooooooo#..
  .#ooooooo#..
  ..#######...
`);
const ARROW = art(`
  ....##....
  .....##...
  ......##..
  #########.
  #########.
  ......##..
  .....##...
  ....##....
`);
const HAND = art(`
  .....####..........
  ....#oooo#.........
  ##.#oooooo########.
  #o#oooooooooooooooo#
  #o#oooooo##########.
  #o#oooooooo#........
  #o#ooooo####........
  #o#oooooooo#........
  #o#ooooo####........
  #o#oooooooo#........
  ##.#ooooo###........
  ....#######.........
`);
const QMARK = art(`
  .####.
  ##..##
  ....##
  ...##.
  ..##..
  ..##..
  ......
  ..##..
  ..##..
`);
const TAB_DOWN = art(`
  #########
  .#######.
  ..#####..
  ...###...
  ....#....
`);
// The verdict, 32 x 32: a page of text under a magnifying glass that finds a pink word.
const LOOKUP = art(`
  ................................
  ...##############...............
  ...#oooooooooooo##..............
  ...#oooooooooooo#o#.............
  ...#oooooooooooo#oo#............
  ...#oooooooooooo#ooo#...........
  ...#oo###o#####o#oooo#..........
  ...#oooooooooooo#######.........
  ...#ooooooooooooooooooo.........
  ...#oo#####o#ooo######ooo.......
  ...#oooooooooo##########oo......
  ...#ooooooooo###oooooo###oo.....
  ...#oo####oo###oooooooo###oo....
  ...#ooooooo###oooooooooo###o....
  ...#ooooooo##oooooooooooo##oo...
  ...#oo###o##oooooooooooooo##o...
  ...#oooooo##oppppppppppppo##o...
  ...#oooooo##oppppppppppppo##o...
  ...#oo##oo##oppppppppppppo##o...
  ...#oooooo##oppppppppppppo##o...
  ...#oooooo##oooooooooooooo##o...
  ...#oo###oo##oooooooooooo##oo...
  ...#ooooooo###oooooooooo###o....
  ...#oooooooo###oooooooo###oo....
  ...#oo###o#oo###oooooo######o...
  ...#oooooooooo##########o####o..
  ...#oooooooooooo######oooo####o.
  ...#oo####o####oooooooo...o####o
  ...#oooooooooooooooooo#....o####
  ...#oooooooooooooooooo#.....o###
  ...####################......ooo
  ................................
`);

// A word as a tile: a slab with its corner pixels taken off; a mark is cut out of it.
function tile(w, h, c, mark) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    const inset = (y === 0 || y === h - 1) ? 1 : 0;
    rows.push('.'.repeat(inset) + c.repeat(w - 2 * inset) + '.'.repeat(inset));
  }
  if (mark) {
    const mx = Math.floor((w - mark[0].length) / 2), my = Math.floor((h - mark.length) / 2);
    mark.forEach((r, j) => { const row = rows[my + j].split(''); [...r].forEach((ch, i) => { if (ch === '#') row[mx + i] = 'o'; }); rows[my + j] = row.join(''); });
  }
  return rows;
}

// Stepped corner insets for a rounded rectangle of radius r, one row per pixel.
function insets(r) {
  const out = [];
  for (let i = 0; i < r; i++) { const v = Math.ceil(r - Math.sqrt(r * r - (r - i - 0.5) ** 2) - 0.25); if (v > 0) out.push(v); }
  return out;
}
function stepClip(r) {
  const s = insets(r), n = s.length, P = [];
  const X = (v) => (v ? `${v}px` : '0'), RX = (v) => `calc(100% - ${v}px)`;
  P.push(`0 ${X(n)}`);
  for (let i = n - 1; i >= 0; i--) { P.push(`${X(s[i])} ${X(i + 1)}`, `${X(s[i])} ${X(i)}`); }
  for (let i = 0; i < n; i++) { P.push(`${RX(s[i])} ${X(i)}`, `${RX(s[i])} ${X(i + 1)}`); }
  P.push(`100% ${X(n)}`, `100% ${RX(n)}`);
  for (let i = n - 1; i >= 0; i--) { P.push(`${RX(s[i])} ${RX(i + 1)}`, `${RX(s[i])} ${RX(i)}`); }
  for (let i = 0; i < n; i++) { P.push(`${X(s[i])} ${RX(i)}`, `${X(s[i])} ${RX(i + 1)}`); }
  P.push(`0 ${RX(n)}`);
  return `clip-path: polygon(${P.join(', ')});`;
}

// A stepped line over a dithered fill, x by date. Handles on both ends.
function stepChart(pts, W, H, label) {
  const t0 = Date.parse(pts[0].d), t1 = Date.parse(pts.at(-1).d);
  const vals = pts.map(p => p.v), lo = Math.min(...vals), hi = Math.max(...vals);
  const top = 3, bot = H - 3, span = bot - top;
  const xs = pts.map(p => 2 + Math.round((Date.parse(p.d) - t0) / (t1 - t0) * (W - 5)));
  const ys = pts.map(p => bot - Math.round((p.v - lo) / (hi - lo || 1) * span));
  const col = Array(W).fill(null);
  for (let i = 0; i < pts.length; i++) { const x1 = i + 1 < pts.length ? xs[i + 1] : xs[i] + 1; for (let x = xs[i]; x < x1; x++) col[x] = ys[i]; }
  let fill = '', line = '';
  let prev = null;
  for (let x = 0; x < W; x++) {
    const y = col[x]; if (y == null) continue;
    fill += `<rect x="${x}" y="${y}" width="1" height="${H - y}" fill="url(#kd-${label.id})"/>`;
    if (prev != null && prev !== y) { const a = Math.min(prev, y), b = Math.max(prev, y); line += `<rect x="${x}" y="${a}" width="1" height="${b - a + 1}"/>`; }
    line += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    prev = y;
  }
  const hx0 = xs[0], hy0 = ys[0], hx1 = xs.at(-1), hy1 = ys.at(-1);
  const handle = (x, y) => `<rect x="${x - 2}" y="${y - 2}" width="5" height="5" fill="var(--k-ink)"/>`;
  return `<svg class="k-chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" role="img" aria-label="${esc(label.text)}">
    <defs><pattern id="kd-${label.id}" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="1" height="1" fill="var(--k-ink)"/></pattern></defs>
    <rect x="0" y="${H - 1}" width="${W}" height="1" fill="var(--k-ink)"/>
    ${fill}<g fill="var(--k-ink)">${line}</g>${handle(hx0, hy0)}${handle(hx1, hy1)}
  </svg>`;
}

// Geometry, in CSS pixels (one Mac pixel each): the panel is 399 wide; each
// window is 378 with its frame and casts a 1-pixel shadow; content is 352.
const CW = 352;

export function html(D) {
  const v = D.verdict;
  // 1. A line of eight word tiles, widths taken from the text's first words.
  const lens = D.tokens.slice(0, D.oneIn).map(t => Math.min(7, Math.max(2, [...t.t].length)));
  const tiles = lens.map((n, i) => {
    const isNew = i === D.oneIn - 1, w = isNew ? 24 : n * 6 + 6;
    return bitmap(tile(w, 18, isNew ? 'p' : '#', isNew ? QMARK : null));
  }).join('');
  const tileRow = `<div class="k-tiles" role="img" aria-label="A line of ${D.oneIn} words: ${D.oneIn - 1} known, 1 new">${tiles}</div>`;

  // The scale: 227 known, 2 learning, 33 new in one bar; tab stops at the two thresholds.
  const BW = CW, inner = BW - 2;
  const kx = Math.round(D.counts.k / D.total * inner), lx = Math.round((D.counts.k + D.counts.l) / D.total * inner);
  const wx = 1 + Math.round(D.thresholds.workable / 100 * inner), cx = 1 + Math.round(D.thresholds.comfortable / 100 * inner);
  const cut = (x) => `<rect x="${x}" y="7" width="1" height="10" fill="var(--k-paper)"/>`;
  const bar = `<svg class="k-bar" width="${BW}" height="18" viewBox="0 0 ${BW} 18" shape-rendering="crispEdges" role="img" aria-label="${D.pct}% known: ${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new. Workable from ${D.thresholds.workable}% at ${D.level}, comfortable from ${D.thresholds.comfortable}%.">
      ${rects(TAB_DOWN, 1, wx - 4, 0)}${rects(TAB_DOWN, 1, cx - 4, 0)}
      <rect x="0" y="6" width="${BW}" height="12" fill="var(--k-ink)"/>
      <rect x="1" y="7" width="${inner}" height="10" fill="var(--k-paper)"/>
      <rect x="1" y="7" width="${kx}" height="10" fill="var(--k-ink)"/>
      <rect x="${1 + kx}" y="7" width="${lx - kx}" height="10" fill="var(--band-l)"/>
      <rect x="${1 + lx}" y="7" width="${inner - lx}" height="10" fill="var(--c-unknown)"/>
      ${cut(wx)}${cut(cx)}
    </svg>`;
  const sw = (c) => bitmap(Array.from({ length: 10 }, () => c.repeat(10)), { cls: 'k-sw' });

  // 2. The words that come back, one pip per time each appears.
  const pips = (n) => bitmap([...Array(6)].map(() => Array.from({ length: n }, () => 'pppppp').join('..')), { cls: 'k-pips', label: `${n} times in this text` });
  const rows = D.repeated.map(r => `<li><span class="k-w">${esc(r.word)}</span>${pips(r.count)}<span class="k-g">${esc(r.gloss)}</span></li>`).join('');

  // 3. Two stepped lines.
  const half = (CW - 16) / 2;
  const c1 = stepChart(D.series, half, 36, { id: 'tx', text: `This text, share of words known: ${D.firstPct}% on ${dShort(D.since)}, ${D.pct}% now` });
  const c2 = stepChart(D.history.map(h => ({ d: h.d, v: h.k })), half, 36, { id: 'wk', text: `Words known: ${fmt(D.history[0].k)} on ${dShort(D.history[0].d)}, ${fmt(D.known)} now` });

  const win = (icon, title, body) => `<section class="k-win"><h3 class="k-tb"><span class="k-tt">${icon}<span>${title}</span></span></h3><div class="k-body">${body}</div></section>`;

  return `
<div class="mp mp-kare">
  ${win(bitmap(GLASSES, { cls: 'k-ti' }), 'Can I read this?', `
    <p class="k-big">About 1 word in ${D.oneIn}<br>is new to you</p>
    ${tileRow}
    <div class="k-verdict">${bitmap(LOOKUP, { cls: 'k-icon', label: 'A page under a magnifying glass that finds a new word' })}
      <div><p>${esc(v.label)} at ${D.level}</p>
      <p>${D.pct}% known · ${D.lookups} lookups in ${D.total} words</p></div>
    </div>
    <div class="k-marks" style="--w:${wx}px;--c:${cx}px"><span class="k-m1">${D.thresholds.workable}% workable at ${D.level}</span><span class="k-m2">${D.thresholds.comfortable}% comfortable</span></div>
    ${bar}
    <p class="k-key"><span>${sw('#')}${D.counts.k} known</span><span>${sw('a')}${D.counts.l} learning</span><span>${sw('p')}${D.counts.u} new</span></p>
  `)}
  ${win(bitmap(BULB, { cls: 'k-ti' }), 'What will help most?', `
    <p class="k-sub">New words that come back in this text</p>
    <ul class="k-list">${rows}</ul>
    <div class="k-act"><button class="k-btn" type="button"><span class="k-b1"><span class="k-b2"><span class="k-b3">${esc(D.action)}</span></span></span></button>
      <p>Knowing them:<br><span class="k-num">${D.after}%</span> of this text</p></div>
  `)}
  ${win(bitmap(SPROUT, { cls: 'k-ti' }), 'Am I getting better?', `
    <div class="k-prog">
      <div><p>This text</p><p class="k-pv"><span>${D.firstPct}%</span>${bitmap(ARROW, { label: 'to' })}<span class="k-num">${D.pct}%</span></p>${c1}<p class="k-pn">since ${dShort(D.since)}</p></div>
      <div><p>Words known</p><p class="k-pv"><span class="k-num">${fmt(D.known)}</span></p>${c2}<p class="k-pn">+${D.gain7} this week</p></div>
    </div>
  `)}
  <a class="k-more" href="#stats">${bitmap(HAND)}<span class="k-ml">${esc(D.more)}</span>${bitmap(ARROW)}</a>
</div>`;
}

const STRIPES = [3, 5, 7, 9, 11, 13, 15].map(y => `linear-gradient(var(--k-ink), var(--k-ink)) 2px ${y}px / calc(100% - 4px) 1px no-repeat`).join(',\n  ');

export const css = `
.mp-kare { --k-ink: #f4f4f0; --k-paper: #000; --k-fs: calc(1400px / 75); --k-fs2: calc(2800px / 75);
  font-family: "Jersey 10", var(--font-ui); font-size: var(--k-fs); line-height: 16px; color: var(--k-ink);
  font-synthesis: none; -webkit-font-smoothing: none; padding: 10px 11px 12px 10px; }
:root[data-theme="light"] .mp-kare { --k-ink: #000; --k-paper: #fff; }
.mp-kare p, .mp-kare h3, .mp-kare ul { margin: 0; padding: 0; font: inherit; }
.mp-kare svg { flex: none; }
.mp-kare .k-win { width: 378px; box-sizing: border-box; background: var(--k-paper); border: 1px solid var(--k-ink); box-shadow: 1px 1px 0 var(--k-ink); margin-bottom: 12px; }
.mp-kare .k-tb { height: 19px; border-bottom: 1px solid var(--k-ink); display: flex; justify-content: center; align-items: center;
  background: ${STRIPES}; }
.mp-kare .k-tt { display: flex; align-items: center; gap: 6px; background: var(--k-paper); padding: 0 8px; height: 19px; }
.mp-kare .k-body { padding: 12px 12px 14px; }
.mp-kare .k-big { font-size: var(--k-fs2); line-height: 32px; margin-bottom: 12px; }
.mp-kare .k-tiles { display: flex; gap: 6px; margin-bottom: 14px; }
.mp-kare .k-verdict { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
.mp-kare .k-marks { position: relative; height: 16px; margin-bottom: 1px; white-space: nowrap; }
.mp-kare .k-marks span { position: absolute; top: 0; }
.mp-kare .k-m1 { right: calc(100% - var(--w) - 5px); }
.mp-kare .k-m2 { right: calc(100% - var(--c) - 5px); }
.mp-kare .k-bar { margin-bottom: 8px; }
.mp-kare .k-key { display: flex; gap: 16px; }
.mp-kare .k-key span:first-child { margin-right: auto; }
.mp-kare .k-key span { display: flex; align-items: center; gap: 6px; }
.mp-kare .k-sub { margin-bottom: 6px; }
.mp-kare .k-list { list-style: none; }
.mp-kare .k-list li { display: grid; grid-template-columns: 96px 52px 1fr; align-items: center; height: 24px; border-bottom: 1px dotted var(--k-ink); }
.mp-kare .k-list li:last-child { border-bottom: 0; }
.mp-kare .k-w { color: var(--c-unknown); }
.mp-kare .k-g { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mp-kare .k-act { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
.mp-kare .k-act .k-num { vertical-align: -3px; }
.mp-kare .k-btn { font: inherit; color: var(--k-ink); border: 0; padding: 3px; background: var(--k-ink); cursor: pointer; ${stepClip(10)} }
.mp-kare .k-b1 { display: block; padding: 1px; background: var(--k-paper); ${stepClip(7)} }
.mp-kare .k-b2 { display: block; padding: 1px; background: var(--k-ink); ${stepClip(6)} }
.mp-kare .k-b3 { display: block; padding: 5px 14px 5px; background: var(--k-paper); ${stepClip(5)} }
.mp-kare .k-btn:active .k-b3 { background: var(--k-ink); color: var(--k-paper); }
.mp-kare .k-btn:focus-visible { outline: 1px dotted var(--k-ink); outline-offset: 2px; }
.mp-kare .k-prog { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.mp-kare .k-pv { display: flex; align-items: center; gap: 6px; height: 32px; margin-bottom: 6px; }
.mp-kare .k-num { font-size: var(--k-fs2); line-height: 32px; }
.mp-kare .k-pn { margin-top: 6px; }
.mp-kare .k-more { display: inline-flex; align-items: center; gap: 8px; color: var(--k-ink); text-decoration: none; margin: 2px 0 0 2px; }
.mp-kare .k-ml { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
.mp-kare .k-more:hover .k-ml { text-decoration-style: dotted; }
`;
