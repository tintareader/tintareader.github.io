// Builds the six Tinta logo concepts: one SVG per mark and a showcase page.
// Usage: node build.mjs [out-dir] [fragment-dir]
// The optional second argument also writes the page as a head-plus-body
// fragment (artifact.html) for publishing where the host supplies the skeleton.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] || "brand/logo-concepts";
const SCRATCH = process.argv[3];
mkdirSync(OUT, { recursive: true });

// The app's own palette (assets/index-*.css): --ink, --c-unknown, --c-learning, --c-derived, --bg.
const LIGHT = { ink: "#1b1f24", pink: "#b8246a", amber: "#995104", teal: "#0b6f86", ground: "#f6f7f4", dim: "#8994a3", line: "#d8dcd4", panel: "#ffffff" };
const DARK  = { ink: "#c5ccd4", pink: "#ff5277", amber: "#e6b94f", teal: "#5aa9e6", ground: "#101318", dim: "#5e676f", line: "#273039", panel: "#1c2129" };

// Rounded rectangle as path data (so it can be a hole in an evenodd path).
const rr = (x, y, w, h, r) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;

// Superellipse (n = 5, like the app's icon.svg) centred on 32.
function squircle(r, n = 5, steps = 96) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t), s = Math.sin(t);
    const x = 32 + r * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = 32 + r * Math.sign(s) * Math.abs(s) ** (2 / n);
    pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

// A drop: apex at (cx, ay), bulb centred (cx, cy) with radius r.
const drop = (cx, ay, cy, r) => {
  const k = (cy - ay) * 0.42;
  return `M${cx} ${ay}C${cx} ${ay} ${cx + r} ${cy - k} ${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}C${cx - r} ${cy - k} ${cx} ${ay} ${cx} ${ay}Z`;
};
// An arc on a circle, angles in degrees clockwise from the top.
const arc = (cx, cy, r, a0, a1) => {
  const pt = (a) => { const t = ((a - 90) * Math.PI) / 180; return `${(cx + r * Math.cos(t)).toFixed(2)} ${(cy + r * Math.sin(t)).toFixed(2)}`; };
  return `M${pt(a0)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${pt(a1)}`;
};
// An ink blot: a circle with three slow waves on its radius.
function blob(cx, cy, base, steps = 120) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = base + 3 * Math.sin(3 * t + 0.6) + 1.8 * Math.sin(5 * t + 2.1) + 1.2 * Math.sin(7 * t + 1.0);
    pts.push(`${(cx + r * Math.cos(t)).toFixed(2)} ${(cy + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
// A sentence wrapped into a ring: word lengths in degrees, one of them pink.
function ringOfWords(cx, cy, r, w, words, pinkAt) {
  const gap = (360 - words.reduce((a, b) => a + b, 0)) / words.length;
  const cap = ((w / 2) / r) * (180 / Math.PI);
  let a = -gap / 2 + gap; let out = "";
  words.forEach((len, i) => {
    out += `<path fill="none" stroke="var(--${i === pinkAt ? "pink" : "ink"})" stroke-width="${w}" stroke-linecap="round" d="${arc(cx, cy, r, a + cap, a + len - cap)}"/>`;
    a += len + gap;
  });
  return out;
}

// Each mark: 64×64 viewBox, colours as CSS variables so one definition serves
// both palettes and the one-colour test (--pink: var(--ink)).
const DROP = "M32 7C32 7 50 25 50 38A18 18 0 1 1 14 38C14 25 32 7 32 7Z";
const concepts = [
  {
    id: "drop", n: 1, name: "Drop",
    idea: "A drop of ink with a text inside it: two lines, one word unknown. The name, literally, holding what the app does.",
    works: "Reads as “tinta” at once, and the organic outline stands out in a row of square app icons.",
    watch: "The inner lines close up at 16 px and leave a drop with a pink dash. Fine for a favicon, but the story needs 32 px and up.",
    mark: `<path fill="var(--ink)" fill-rule="evenodd" d="${DROP}${rr(23, 30, 18, 5, 2.5)}${rr(23, 41, 8, 5, 2.5)}"/>
      <path fill="var(--pink)" d="${rr(34, 41, 9, 5, 2.5)}"/>`,
  },
  {
    id: "tbar", n: 2, name: "T of words",
    idea: "The initial built from the reading view: a line of three words with the unknown one in pink, and the stem hanging from it like the card that opens when you tap.",
    works: "The clearest at 16 px, a monogram and the mechanic in one shape, and the nearest relative of the current icon, so the least risky move.",
    watch: "Block monograms are common. In one colour the tapped-word story goes and it is just a T.",
    mark: `<path fill="var(--ink)" d="${rr(9, 13, 14, 10, 3)}${rr(41, 13, 14, 10, 3)}${rr(26, 26, 12, 26, 3)}"/>
      <path fill="var(--pink)" d="${rr(26, 13, 12, 10, 3)}"/>`,
  },
  {
    id: "bookmark", n: 3, name: "Dipped bookmark",
    idea: "A bookmark dipped in ink. Reading and tinta in one silhouette; the pink meniscus is the ink line.",
    works: "A silhouette nobody else has, still two clear tones at 16 px, and no letter in it, so it works the same beside Arabic and Mandarin.",
    watch: "Bookmark icons mean “save” in many apps. The pink dip is what makes this one Tinta’s, so it can never be dropped in a one-colour use.",
    mark: `<path fill="var(--ink)" d="M18 11a3 3 0 0 1 3-3h22a3 3 0 0 1 3 3v45l-14-10-14 10z"/>
      <path fill="var(--pink)" d="M18 40.5Q32 35.5 46 40.5V56L32 46 18 56z"/>`,
  },
  {
    id: "line", n: 4, name: "Tinta, reader",
    idea: "The wordmark is the logo. The name is treated as a text in the app: to an English speaker “tinta” is the unknown word and “reader” is known. The mark is that line reduced to two blocks.",
    works: "It explains the product on sight, and a wordmark-first identity suits a website and a link preview.",
    watch: "The two blocks are thin on their own; on a phone home screen they need the wordmark nearby. The point lands only for English speakers.",
    mark: `<path fill="var(--pink)" d="${rr(8, 26, 21, 12, 3.5)}"/>
      <path fill="var(--ink)" d="${rr(32, 26, 24, 12, 3.5)}"/>`,
    wordmark: `<span style="color:var(--pink)">tinta</span> <span>reader</span>`,
    lower: true,
  },
  {
    id: "stroke", n: 5, name: "Stroke",
    idea: "A lowercase t drawn in one pen stroke, ending where the ink pools into a pink blot.",
    works: "Warm and handmade, the most “reading a book” of the six, and the stroke keeps its weight at small sizes.",
    watch: "The blot can read as a full stop after the t. The stroke weight wants tuning per size.",
    mark: `<path fill="none" stroke="var(--ink)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" d="M30 9V42Q30 52 39 52Q45 52 48 47M19 25H42"/>
      <circle cx="49" cy="47" r="6.5" fill="var(--pink)"/>`,
  },
  {
    id: "nib", n: 6, name: "Nib",
    idea: "A nib pointing down, its breather hole in pink and the slit cut through to the tip.",
    works: "The classic sign of ink: formal, credible, and the best of the six in one colour.",
    watch: "A nib says writing, and Tinta is for reading. It is also the most borrowed shape here; several writing apps use one.",
    mark: `<path fill="var(--ink)" fill-rule="evenodd" d="M21 8H43Q48 8 47 14L46 26Q44 40 32 58Q20 40 18 26L17 14Q16 8 21 8Z M30.8 34H33.2V60H30.8Z"/>
      <circle cx="32" cy="29" r="4.5" fill="var(--pink)"/>`,
  },
  // ---- round two ----
  {
    id: "drop-two-words", n: "1a", round: 2, group: "drop", name: "Drop, two words",
    idea: "The drop from concept 1 holding the line from concept 4: pink “tinta”, and the known word cut out of the ink. One mark for both favourites.",
    works: "One line instead of two, so it holds at 16 px where the first drop lost its lines.",
    watch: "The cut-out word is only as visible as the contrast between the ink and the icon ground.",
    mark: `<path fill="var(--ink)" fill-rule="evenodd" d="${DROP}${rr(36, 35.5, 10, 7, 3.5)}"/>
      <path fill="var(--pink)" d="${rr(19, 35.5, 14, 7, 3.5)}"/>`,
    wordmark: `<span style="color:var(--pink)">tinta</span> <span>reader</span>`, lower: true, withMark: true,
  },
  {
    id: "drop-on-a-line", n: "1b", round: 2, group: "drop", name: "Drop on a line",
    idea: "The drop about to land on a line of text, and the word under it already pink. The moment the app makes: ink meets a word.",
    works: "It tells a small story, and the drop and the line stay two clear shapes at every size.",
    watch: "Two elements is one more than a 16 px favicon likes; the drop shrinks to a dot.",
    mark: `<path fill="var(--ink)" d="${drop(32, 5, 23, 9.5)}${rr(7, 41, 13, 9, 3)}${rr(44, 41, 13, 9, 3)}"/>
      <path fill="var(--pink)" d="${rr(23, 41, 18, 9, 3)}"/>`,
  },
  {
    id: "card", n: "4a", round: 2, group: "line", name: "The card",
    idea: "“Tinta, reader” as the word card: the unknown word above, its meaning beneath, left-aligned. The lockup is the card the app opens on a tap.",
    works: "The stacked lockup is the most distinctive wordmark of the set, and the mark has more mass than two blocks side by side.",
    watch: "Two stacked bars alone can read as a list icon. The top one has to stay pink.",
    mark: `<path fill="var(--pink)" d="${rr(12, 19, 25, 12, 4)}"/>
      <path fill="var(--ink)" d="${rr(12, 36, 40, 9, 3.5)}"/>`,
    lockupHtml: `<span class="stack"><span class="w1">tinta</span><span class="w2">reader</span></span>`,
  },
  {
    id: "tap", n: "4b", round: 2, group: "line", name: "The tap",
    idea: "“tinta” as the tapped word: pink inside the selection ring the app draws, “reader” plain beside it. The mark is that ring around a pink word.",
    works: "The ring gives the small mark an edge to hold at 16 px, and it is the app's own gesture.",
    watch: "A rounded outline is close to a button. The ring wants to stay thin beside the wordmark.",
    mark: `<rect x="10" y="20" width="44" height="24" rx="8" fill="none" stroke="var(--ink)" stroke-width="3.5"/>
      <path fill="var(--pink)" d="${rr(18, 27, 28, 10, 3.5)}"/>`,
    lockupHtml: `<span class="ringed">tinta</span> <span>reader</span>`, lower: true,
  },
  {
    id: "blot", n: 7, round: 2, group: "new", name: "Blot",
    idea: "A splash of ink with the text showing through, the unknown word pink. The drop's wilder sibling.",
    works: "The most organic shape of the set and unmistakable at any size.",
    watch: "A blot has to be drawn once, well, by hand; an irregular outline looks accidental when its balance is off.",
    mark: `<path fill="var(--ink)" fill-rule="evenodd" d="${blob(32, 33, 21)}${rr(22, 27.5, 20, 5, 2.5)}${rr(22, 37.5, 8, 5, 2.5)}"/>
      <circle cx="55" cy="12" r="2.6" fill="var(--ink)"/><circle cx="9" cy="51" r="2" fill="var(--ink)"/>
      <path fill="var(--pink)" d="${rr(33, 37.5, 10, 5, 2.5)}"/>`,
  },
  {
    id: "dripping-t", n: 8, round: 2, group: "new", name: "Dripping T",
    idea: "A solid T with a drop of ink falling from the end of its crossbar.",
    works: "The initial and the drop in one, and still one shape at 16 px.",
    watch: "The drip is small. Below 24 px it becomes a pink dot beside the T.",
    mark: `<path fill="var(--ink)" d="${rr(8, 12, 48, 10, 2.5)}${rr(27, 20, 10, 32, 2.5)}"/>
      <path fill="var(--pink)" d="${drop(49, 21, 33, 6)}"/>`,
  },
  {
    id: "ring", n: 9, round: 2, group: "new", name: "Ring of words",
    idea: "A sentence wrapped into a ring: six words of different lengths, one of them unknown. “Know what you can read”, as a shape.",
    works: "Unlike any reading app's icon, and the gaps close at small sizes into a ring with one pink segment.",
    watch: "It reads as a progress ring at first glance. The pink has to stay the odd one out.",
    mark: ringOfWords(32, 32, 20, 8, [44, 30, 56, 36, 60, 40], 3),
  },
  {
    id: "glasses", n: 10, round: 2, group: "new", name: "Glasses",
    idea: "Reading glasses with one lens tinted ink pink: the reader, and what the app colours for them.",
    works: "The friendliest of the set, and the only one that says “reader” before “ink”.",
    watch: "The most playful, so it sets a lighter tone than the serif wordmark.",
    mark: `<circle cx="45" cy="34" r="10" fill="var(--pink)"/>
      <circle cx="19" cy="34" r="10" fill="none" stroke="var(--ink)" stroke-width="4"/>
      <circle cx="45" cy="34" r="10" fill="none" stroke="var(--ink)" stroke-width="4"/>
      <path fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round" d="M29 32Q32 27 35 32M8 31L4 26M56 31L60 26"/>`,
  },
];
const fileName = (c) => `${String(c.n).replace(/^\d+/, (m) => m.padStart(2, "0"))}-${c.id}.svg`;

// ---------- standalone SVG files (adapt to the viewer's colour scheme) ----------
for (const c of concepts) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <title>Tinta logo concept ${c.n}: ${c.name}</title>
  <style>
    :root{--ink:${LIGHT.ink};--pink:${LIGHT.pink}}
    @media (prefers-color-scheme:dark){:root{--ink:${DARK.ink};--pink:${DARK.pink}}}
  </style>
  ${c.mark.replace(/\n\s+/g, "\n  ")}
</svg>
`;
  writeFileSync(join(OUT, fileName(c)), svg);
}

// ---------- showcase page ----------
const SQ = squircle(31);
const symbols = concepts.map((c) => `<symbol id="m-${c.id}" viewBox="0 0 64 64">${c.mark}</symbol>`).join("\n");
const use = (c, size, cls = "") => `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><use href="#m-${c.id}"/></svg>`;
const icon = (c, size) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><use href="#sq" fill="var(--icon-fill)" stroke="var(--icon-line)" stroke-width="0.75"/><g transform="translate(32 32) scale(0.74) translate(-32 -32)"><use href="#m-${c.id}"/></g></svg>`;

const panel = (c, theme) => `
  <div class="panel ${theme}">
    <div class="hero">${use(c, 128, "mark")}</div>
    <div class="lockup ${c.lower ? "lower" : ""}">${c.lower && !c.withMark ? "" : use(c, 44)}${c.lockupHtml || `<span class="word">${c.wordmark || "Tinta"}</span>`}</div>
    <div class="row">
      <div class="proof"><div class="icons">${icon(c, 64)}${icon(c, 32)}${icon(c, 16)}${use(c, 16)}</div><span class="cap">App icon 64 · 32 · 16, favicon</span></div>
      <div class="proof"><div class="mono">${use(c, 40)}</div><span class="cap">One colour</span></div>
    </div>
  </div>`;

const section = (c) => `
<section class="concept" id="${c.id}">
  <div class="text">
    <h2><span class="num">${c.n}</span>${c.name}</h2>
    <p class="idea">${c.idea}</p>
    <dl>
      <dt>Works because</dt><dd>${c.works}</dd>
      <dt>Watch for</dt><dd>${c.watch}</dd>
    </dl>
  </div>
  <div class="sheet">${panel(c, "light")}${panel(c, "dark")}</div>
</section>`;

const style = `
<style>
  /* One column, each concept as a text block beside a two-panel proof sheet
     (light palette, dark palette) that uses the app's own colours. */
  :root {
    --bg: #eceee9; --fg: #1b1f24; --muted: #5e676f; --rule: #d0d4cc; --accent: #b8246a;
    --font-display: "Charter", "Bitstream Charter", "Iowan Old Style", "Palatino", "Literata", Georgia, serif;
    --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0b0e12; --fg: #dde2e8; --muted: #8994a3; --rule: #273039; --accent: #ff5277; color-scheme: dark } }
  :root[data-theme="dark"] { --bg: #0b0e12; --fg: #dde2e8; --muted: #8994a3; --rule: #273039; --accent: #ff5277; color-scheme: dark }
  html { background: var(--bg) }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.55 var(--font-body); }
  .wrap { max-width: 1080px; margin: 0 auto; padding-block: 40px 64px; padding-inline: 20px; }
  header { max-width: 60ch; margin-bottom: 40px }
  h1 { font: 600 34px/1.15 var(--font-display); letter-spacing: -0.01em; margin: 0 0 12px; text-wrap: balance }
  header p { margin: 0 0 8px; color: var(--muted) }
  header p strong { color: var(--fg); font-weight: 600 }
  .concept { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.8fr); gap: 24px 36px; padding-block: 32px; border-top: 1px solid var(--rule); scroll-margin-top: 16px }
  .concept .text { min-width: 0 }
  h2 { font: 600 24px/1.2 var(--font-display); margin: 0 0 10px; display: flex; align-items: baseline; gap: 10px }
  .num { font: 500 13px/1 var(--font-body); color: var(--accent); letter-spacing: 0.08em; border: 1px solid currentColor; border-radius: 999px; padding: 4px 8px; }
  .idea { margin: 0 0 16px; font-size: 16px }
  dl { margin: 0; display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 6px 14px; font-size: 14px }
  dt { color: var(--muted); font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase; padding-top: 3px }
  dd { margin: 0 }
  .sheet { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; min-width: 0 }
  .panel { border-radius: 10px; padding: 20px; display: grid; gap: 18px; justify-items: start; border: 1px solid var(--p-line); background: var(--p-ground); color: var(--p-ink) }
  .panel.light { --ink: ${LIGHT.ink}; --pink: ${LIGHT.pink}; --p-ground: ${LIGHT.ground}; --p-ink: ${LIGHT.ink}; --p-line: ${LIGHT.line}; --p-dim: ${LIGHT.dim}; --icon-fill: #f4f5f2; --icon-line: rgba(0,0,0,.18) }
  .panel.dark  { --ink: ${DARK.ink};  --pink: ${DARK.pink};  --p-ground: ${DARK.ground};  --p-ink: ${DARK.ink};  --p-line: ${DARK.line};  --p-dim: ${DARK.dim};  --icon-fill: #1a1f27; --icon-line: rgba(255,255,255,.12) }
  .hero { width: 100%; display: flex; justify-content: center; padding-block: 8px }
  .lockup { display: flex; align-items: center; gap: 12px; font: 600 38px/1 var(--font-display); letter-spacing: -0.015em; color: var(--p-ink) }
  .lockup.lower { font-weight: 500; font-size: 36px }
  .stack { display: grid; line-height: 1; font-weight: 500 }
  .stack .w1 { color: var(--pink); font-size: 40px; letter-spacing: -0.01em }
  .stack .w2 { font-size: 21px; margin-top: 4px }
  .ringed { color: var(--pink); border: 2px solid var(--p-ink); border-radius: 9px; padding: 0.02em 0.16em 0.04em; margin-right: 0.05em }
  .row { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; width: 100%; flex-wrap: wrap }
  .proof { display: grid; gap: 6px; justify-items: start }
  .icons { display: flex; align-items: flex-end; gap: 12px }
  .icons > svg:last-child { margin-left: 6px }
  .mono { --pink: var(--ink); display: flex; align-items: flex-end }
  .lineup { padding-block: 32px 0; border-top: 1px solid var(--rule) }
  .lineup h2 { margin-bottom: 6px }
  .lineup > p { margin: 0 0 16px; color: var(--muted); max-width: 60ch }
  .lineup-row { justify-items: center; gap: 14px 12px; margin-bottom: 12px }
  .lineup-row.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) }
  .lineup-row.cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)) }
  .lineup-cell { display: flex; align-items: flex-end; gap: 8px }
  .cap { font: 11.5px/1.3 var(--font-body); color: var(--p-dim) }
  .lineup-cell .cap { align-self: center; margin-left: 4px }
  .toc { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 16px; font-size: 13.5px }
  .toc a { color: var(--accent); text-decoration: none; border-bottom: 1px solid transparent }
  .toc a:hover { border-bottom-color: currentColor }
  h2.round { font-size: 30px; margin: 24px 0 6px; padding-top: 28px; border-top: 2px solid var(--fg) }
  .lead { margin: 0 0 8px; color: var(--muted); max-width: 60ch }
  .lead a { color: var(--accent) }
  h3.group { font: 500 12.5px/1 var(--font-body); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin: 36px 0 -20px }
  .verdict { padding-block: 32px 0; border-top: 1px solid var(--rule); max-width: 66ch }
  .verdict h2 { margin-bottom: 10px }
  .verdict p { margin: 0 0 10px }
  .verdict a { color: var(--accent) }
  .files { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--rule); color: var(--muted); font-size: 13px }
  .files code { font: 12.5px/1.4 ui-monospace, Menlo, monospace }
  a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
  @media (max-width: 860px) {
    .concept { grid-template-columns: minmax(0, 1fr) }
    .lineup-row.cols-4, .lineup-row.cols-6 { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) }
  }
  @media (max-width: 560px) {
    .sheet { grid-template-columns: minmax(0, 1fr) }
    .lockup { font-size: 32px }
    h1 { font-size: 28px }
  }
  @media (prefers-reduced-motion: no-preference) { a { transition: color .15s } }
</style>`;

const head = `<title>Tinta Logo Concepts</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:wght@500;600&display=swap">
${style}`;
const r1 = concepts.filter((c) => !c.round);
const r2 = concepts.filter((c) => c.round === 2);
const group = (g) => r2.filter((c) => c.group === g).map(section).join("\n");
const lineupRows = (theme, list) => `
  <div class="panel ${theme} lineup-row cols-${list.length > 6 ? 4 : 6}">
    ${list.map((c) => `<div class="lineup-cell">${icon(c, 48)}${icon(c, 24)}${use(c, 16)}<span class="cap">${c.n}</span></div>`).join("")}
  </div>`;

const body = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><path id="sq" d="${SQ}"/>${symbols}</svg>
<div class="wrap">
<header>
  <h1>Logo concepts for Tinta</h1>
  <p><strong>Tinta</strong> is ink in Spanish, Portuguese and Indonesian. The app colours every word of a text by whether you know it, and every concept below keeps to that palette: ink for a known word, pink for an unknown one.</p>
  <p>Each concept is proved on the light and the dark palette: the mark, the lockup with the wordmark set in the reading serif, the app icon at 64, 32 and 16 px, a bare 16 px favicon, and the mark in one colour.</p>
  <nav class="toc"><a href="#round-two">Round two</a><a href="#lineup">All at icon size</a><a href="#verdict">Recommendation</a><a href="#round-one">Round one</a></nav>
</header>

<h2 class="round" id="round-two">Round two</h2>
<p class="lead">Two variations each on the shortlisted <a href="#drop">Drop</a> and <a href="#line">Tinta, reader</a>, then four new directions.</p>
<h3 class="group">Drop, varied</h3>
${group("drop")}
<h3 class="group">Tinta, reader, varied</h3>
${group("line")}
<h3 class="group">Four new</h3>
${group("new")}

<section class="lineup" id="lineup">
  <h2>All fourteen at icon size</h2>
  <p>The test that matters most for a favicon and a home screen: which ones still say something at 24 and 16 px. Round two first, then round one.</p>
  ${lineupRows("light", r2)}
  ${lineupRows("dark", r2)}
  ${lineupRows("light", r1)}
  ${lineupRows("dark", r1)}
</section>

<section class="verdict" id="verdict">
  <h2>A recommendation</h2>
  <p><a href="#drop-two-words">Drop, two words</a> is the one mark that carries both favourites: the drop for “tinta”, the pink-and-known line for what the app does, and it survives 16 px. Pair it with the <a href="#card">card</a> lockup, pink “tinta” over “reader”, for the site and the link preview, and the mark alone for the icon.</p>
  <p>Of the four new, <a href="#ring">Ring of words</a> is the one worth a second look: the least like anything else on a home screen, and its story is the tagline. <a href="#blot">Blot</a> is the drop's wilder sibling if the drop feels too tidy.</p>
</section>

<h2 class="round" id="round-one">Round one</h2>
<p class="lead">The first six. Concepts 1 and 4 were shortlisted.</p>
${r1.map(section).join("\n")}

<p class="files">Files: <code>brand/logo-concepts/NN-name.svg</code>, one per mark, 64 px grid, colours follow the viewer's light or dark scheme. The site repo is regenerated on every publish, so a chosen mark belongs in <code>docs/brand</code> of the app repo.</p>
</div>
`;

if (SCRATCH) writeFileSync(join(SCRATCH, "artifact.html"), head + body);
writeFileSync(join(OUT, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
${head}
</head>
<body>${body}</body>
</html>
`);
console.log("built", concepts.length, "concepts into", OUT);
