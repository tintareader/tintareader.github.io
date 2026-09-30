// The usage guide, built from the same definitions as the assets.
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [h, l] = [lum(a), lum(b)].sort((x, y) => y - x); return ((h + 0.05) / (l + 0.05)).toFixed(1); };

export function buildGuide({ OUT, FRAG, LIGHT, DARK, markTwoColour, markOneColour, wordmarkInner, lockupInner, CARD, LOCKUP, SQ, DROP, KNOWN, UNKNOWN, iconInner }) {
  const PAD = 8;
  const mark = (size, extra = "") => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"${extra}>${markTwoColour("var(--ink)", "var(--pink)")}</svg>`;
  const mono = (size, colour) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${markOneColour(colour)}</svg>`;
  const wordmark = (h) => `<svg height="${h}" viewBox="0 0 ${(CARD.w + 2 * PAD).toFixed(1)} ${(CARD.h + 2 * PAD).toFixed(1)}" aria-label="tinta reader">${wordmarkInner("var(--ink)", "var(--pink)", PAD, PAD)}</svg>`;
  const lockup = (h) => `<svg height="${h}" viewBox="0 0 ${(LOCKUP.w + 2 * PAD).toFixed(1)} ${(LOCKUP.h + 2 * PAD).toFixed(1)}" aria-label="tinta reader">${lockupInner("var(--ink)", "var(--pink)", PAD, PAD)}</svg>`;
  const icon = (pal, size, opts) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${iconInner(pal, opts).replace(/id="g"/g, `id="g${size}${opts ? (opts.bleed ? "b" : "") + (opts.scale || "") : ""}${pal === DARK ? "d" : ""}"`).replace(/url\(#g\)/g, `url(#g${size}${opts ? (opts.bleed ? "b" : "") + (opts.scale || "") : ""}${pal === DARK ? "d" : ""})`)}</svg>`;
  const pair = (inner) => `<div class="sheet"><div class="panel light">${inner}</div><div class="panel dark">${inner}</div></div>`;

  // Construction diagram: grid, the outline, the key dimensions.
  const grid = Array.from({ length: 9 }, (_, i) => `<path d="M${i * 8} 0V64M0 ${i * 8}H64" stroke="var(--p-line)" stroke-width="0.25"/>`).join("");
  const construction = `<svg class="construction" viewBox="-14 -6 92 76" aria-hidden="true">
    ${grid}
    <path d="${DROP}" fill="none" stroke="var(--p-ink)" stroke-width="0.6"/>
    <path d="${KNOWN}" fill="none" stroke="var(--p-ink)" stroke-width="0.6"/>
    <path d="${UNKNOWN}" fill="none" stroke="var(--pink)" stroke-width="0.6"/>
    <circle cx="32" cy="38.5" r="19" fill="none" stroke="var(--p-dim)" stroke-width="0.3" stroke-dasharray="1 1"/>
    <path d="M32 38.5L51 38.5" stroke="var(--p-dim)" stroke-width="0.3"/><text x="41" y="37.2" font-size="3" fill="var(--p-dim)" text-anchor="middle">r 19</text>
    <path d="M32 7L21 24M32 7L43 24" stroke="var(--p-dim)" stroke-width="0.3" stroke-dasharray="1 1"/><text x="32" y="17" font-size="3" fill="var(--p-dim)" text-anchor="middle">50°</text>
    <path d="M55 35V43" stroke="var(--p-dim)" stroke-width="0.3"/><text x="56.5" y="40" font-size="3" fill="var(--p-dim)">8</text>
    <path d="M17 48H33M36 48H47" stroke="var(--p-dim)" stroke-width="0.3"/><text x="25" y="52" font-size="3" fill="var(--p-dim)" text-anchor="middle">16</text><text x="41.5" y="52" font-size="3" fill="var(--p-dim)" text-anchor="middle">11</text>
    <path d="M-6 6.9H13M-6 57.5H13" stroke="var(--p-dim)" stroke-width="0.3"/><path d="M-4 6.9V57.5" stroke="var(--p-dim)" stroke-width="0.3"/><text x="-6" y="33" font-size="3" fill="var(--p-dim)" text-anchor="end">49</text>
    <path d="M13 62V57.5M51 62V57.5M13 61H51" stroke="var(--p-dim)" stroke-width="0.3"/><text x="32" y="65.5" font-size="3" fill="var(--p-dim)" text-anchor="middle">38</text>
  </svg>`;
  // Clear space: the unknown word's length (16 units) on every side.
  const clearspace = `<svg class="construction" viewBox="-14 -12 92 90" aria-hidden="true">
    <rect x="-3" y="-9.1" width="70" height="82.6" fill="none" stroke="var(--p-dim)" stroke-width="0.4" stroke-dasharray="1.5 1.5"/>
    ${markTwoColour("var(--ink)", "var(--pink)")}
    <path d="M51 62.5H67" stroke="var(--pink)" stroke-width="2" stroke-linecap="round" opacity="0.6"/><text x="59" y="60" font-size="3" fill="var(--p-dim)" text-anchor="middle">16</text>
    <path d="M-3 -4.5H13" stroke="var(--pink)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <path d="M55 -9.1V6.9" stroke="var(--pink)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <path d="M-8 57.5V73.5" stroke="var(--pink)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  </svg>`;
  // Lockup proportions.
  const proportions = `<svg class="construction wide" viewBox="-4 -14 ${(LOCKUP.w + 12).toFixed(0)} ${(LOCKUP.h + 30).toFixed(0)}" aria-hidden="true">
    ${lockupInner("var(--ink)", "var(--pink)", 0, 0)}
    <rect x="0" y="0" width="${(LOCKUP.h * 38 / 49.1).toFixed(1)}" height="${LOCKUP.h.toFixed(1)}" fill="none" stroke="var(--p-dim)" stroke-width="0.6" stroke-dasharray="2 2"/>
    <rect x="${(LOCKUP.w - CARD.w).toFixed(1)}" y="0" width="${CARD.w.toFixed(1)}" height="${CARD.h.toFixed(1)}" fill="none" stroke="var(--p-dim)" stroke-width="0.6" stroke-dasharray="2 2"/>
    <path d="M-2 0V${LOCKUP.h.toFixed(1)}" stroke="var(--p-dim)" stroke-width="0.6"/><text x="-4" y="${(LOCKUP.h / 2 + 2).toFixed(1)}" font-size="6" fill="var(--p-dim)" text-anchor="end">h</text>
    <path d="M${(LOCKUP.h * 38 / 49.1).toFixed(1)} ${(LOCKUP.h + 8).toFixed(1)}H${(LOCKUP.w - CARD.w).toFixed(1)}" stroke="var(--p-dim)" stroke-width="0.6"/><text x="${((LOCKUP.h * 38 / 49.1 + LOCKUP.w - CARD.w) / 2).toFixed(1)}" y="${(LOCKUP.h + 16).toFixed(1)}" font-size="6" fill="var(--p-dim)" text-anchor="middle">0.3 h</text>
    <path d="M${(LOCKUP.w - CARD.w).toFixed(1)} -6H${LOCKUP.w.toFixed(1)}" stroke="var(--p-dim)" stroke-width="0.6"/><text x="${(LOCKUP.w - CARD.w / 2).toFixed(1)}" y="-9" font-size="6" fill="var(--p-dim)" text-anchor="middle">the card</text>
  </svg>`;

  // Don'ts.
  const wrong = (label, inner) => `<figure class="dont"><div class="panel light">${inner}</div><figcaption>${label}</figcaption></figure>`;
  const donts = [
    wrong("Don't make the drop pink. Only the unknown word is pink.", `<svg width="88" height="88" viewBox="0 0 64 64">${markTwoColour(LIGHT.pink, LIGHT.ink)}</svg>`),
    wrong("Don't outline it. The mark is a solid.", `<svg width="88" height="88" viewBox="0 0 64 64"><path d="${DROP}${KNOWN}" fill="none" stroke="${LIGHT.ink}" stroke-width="2"/><path d="${UNKNOWN}" fill="none" stroke="${LIGHT.pink}" stroke-width="2"/></svg>`),
    wrong("Don't tilt it. The drop always hangs straight.", `<svg width="88" height="88" viewBox="0 0 64 64"><g transform="rotate(-25 32 32)">${markTwoColour(LIGHT.ink, LIGHT.pink)}</g></svg>`),
    wrong("Don't recolour the words with the other reading states.", `<svg width="88" height="88" viewBox="0 0 64 64"><path fill="${LIGHT.ink}" d="${DROP}"/><path fill="#0b6f86" d="${KNOWN}"/><path fill="#995104" d="${UNKNOWN}"/></svg>`),
    wrong("Don't stretch it. Scale both axes together.", `<svg width="88" height="88" viewBox="0 0 64 64"><g transform="translate(32 32) scale(1.35 0.8) translate(-32 -32)">${markTwoColour(LIGHT.ink, LIGHT.pink)}</g></svg>`),
    wrong("Don't add shadows, gradients or a glossy highlight.", `<svg width="88" height="88" viewBox="0 0 64 64"><defs><linearGradient id="bad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a6270"/><stop offset="1" stop-color="#1b1f24"/></linearGradient></defs><path d="${DROP}" fill="${LIGHT.ink}" opacity="0.25" transform="translate(3 4)"/><path fill="url(#bad)" fill-rule="evenodd" d="${DROP}${KNOWN}"/><path fill="${LIGHT.pink}" d="${UNKNOWN}"/><ellipse cx="25" cy="22" rx="4" ry="6" fill="#fff" opacity="0.5"/></svg>`),
    wrong("Don't use the two-colour mark on pink or on any colour but the app's grounds.", `<div class="onpink">${mark(88)}</div>`),
    wrong("Don't put the mark inside another shape. On the app icon it sits on the ground alone.", `<svg width="88" height="88" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="${LIGHT.ink}" stroke-width="2"/><g transform="translate(32 32) scale(0.7) translate(-32 -32)">${markTwoColour(LIGHT.ink, LIGHT.pink)}</g></svg>`),
  ].join("");

  // In use: mocks.
  const tab = `<div class="tabbar" aria-hidden="true"><div class="tab active">${mark(16)}<span>Tinta Reader: read in the language you are learning</span></div><div class="tab"><span class="fav"></span><span>El País</span></div><div class="tab"><span class="fav"></span><span>Le Monde</span></div></div>`;
  const home = `<div class="home" aria-hidden="true">
    <div class="app">${icon(LIGHT, 60, { bleed: true, scale: 0.62 })}<span>Tinta</span></div>
    <div class="app"><span class="ph a"></span><span>Books</span></div>
    <div class="app"><span class="ph b"></span><span>Notes</span></div>
    <div class="app"><span class="ph c"></span><span>Dictionary</span></div>
  </div>`;
  const og = `<div class="ogwrap"><div class="og" aria-hidden="true">
    <div class="ogleft">
      ${lockup(64)}
      <h3>Read real texts in the language you’re learning</h3>
      <p>Paste an article, a story or a song. Every word is coloured by whether you know it. Tap one for its meaning.</p>
      <p class="langs">Spanish · French · Portuguese · Indonesian · Mandarin · Arabic · English</p>
      <p class="cta"><b>Free, in your browser, no sign-up</b> · tintareader.com</p>
    </div>
    <div class="ogright">
      <p class="sent">El gato <span class="tapped">come</span> pescado en la <span class="lrn">cocina</span> todos los días. Después <span class="unk">duerme</span> en el sofá mientras <span class="unk">llueve</span> fuera.</p>
      <div class="ogcard"><span class="hw">come</span><span class="gl">to eat · from <i>comer</i></span></div>
    </div>
  </div></div>`;
  const header = `<div class="pagehead" aria-hidden="true">${lockup(36)}<nav><span>Privacy</span><span>Support</span><span>Licences</span></nav></div>`;

  const style = `
<style>
  /* A reference document: one column of rules, each proved on the app's two
     palettes in the same panels as the concept sheet. */
  :root {
    --bg: #eceee9; --fg: #1b1f24; --muted: #5e676f; --rule: #d0d4cc; --accent: #b8246a; --card: #f6f7f4;
    --ink: ${LIGHT.ink}; --pink: ${LIGHT.pink};
    --font-display: "Charter", "Bitstream Charter", "Iowan Old Style", "Palatino", "Literata", Georgia, serif;
    --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    --font-mono: ui-monospace, Menlo, monospace;
  }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0b0e12; --fg: #dde2e8; --muted: #8994a3; --rule: #273039; --accent: #ff5277; --card: #161a20; --ink: ${DARK.ink}; --pink: ${DARK.pink}; color-scheme: dark } }
  :root[data-theme="dark"] { --bg: #0b0e12; --fg: #dde2e8; --muted: #8994a3; --rule: #273039; --accent: #ff5277; --card: #161a20; --ink: ${DARK.ink}; --pink: ${DARK.pink}; color-scheme: dark }
  html { background: var(--bg) }
  body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.55 var(--font-body) }
  .wrap { max-width: 1040px; margin: 0 auto; padding-block: 40px 64px; padding-inline: 20px }
  header { max-width: 62ch; margin-bottom: 8px }
  h1 { font: 600 34px/1.15 var(--font-display); letter-spacing: -0.01em; margin: 0 0 12px; text-wrap: balance }
  .lead { color: var(--muted); margin: 0 0 8px }
  .toc { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 16px 0 24px; font-size: 13.5px }
  .toc a, a { color: var(--accent) }
  .toc a { text-decoration: none; border-bottom: 1px solid transparent } .toc a:hover { border-bottom-color: currentColor }
  section { padding-block: 32px; border-top: 1px solid var(--rule); scroll-margin-top: 16px }
  h2 { font: 600 26px/1.2 var(--font-display); margin: 0 0 14px }
  h3 { font: 600 17px/1.3 var(--font-display); margin: 22px 0 8px }
  p { margin: 0 0 10px; max-width: 66ch } li { max-width: 66ch }
  ul { margin: 0 0 10px; padding-left: 20px } li + li { margin-top: 4px }
  .two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr); gap: 20px 36px; align-items: start }
  .two > * { min-width: 0 }
  .sheet { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; min-width: 0 }
  .panel { border-radius: 10px; padding: 22px; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 22px; border: 1px solid var(--p-line); background: var(--p-ground); color: var(--p-ink); min-height: 120px }
  .panel.light { --ink: ${LIGHT.ink}; --pink: ${LIGHT.pink}; --p-ground: ${LIGHT.ground}; --p-ink: ${LIGHT.ink}; --p-line: #d8dcd4; --p-dim: ${LIGHT.dim} }
  .panel.dark  { --ink: ${DARK.ink};  --pink: ${DARK.pink};  --p-ground: ${DARK.ground};  --p-ink: ${DARK.ink};  --p-line: #273039; --p-dim: ${DARK.dim} }
  .panel.tall { padding-block: 36px }
  .panel .col { display: grid; gap: 22px; justify-items: start }
  .panel .stack { display: grid; gap: 18px; justify-items: center; align-self: start }
  .cap { font: 11.5px/1.3 var(--font-body); color: var(--p-dim) }
  .construction { width: 100%; max-width: 360px; height: auto; display: block; font-family: var(--font-body) }
  .construction.wide { max-width: 100% }
  dl.anat { margin: 0; display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 8px 14px }
  dl.anat dt { font-weight: 600 } dl.anat dd { margin: 0 }
  .sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; vertical-align: -1px; margin-right: 6px; border: 1px solid rgba(128,128,128,.35) }
  table { border-collapse: collapse; font-size: 14px; margin: 0 0 12px; width: 100%; max-width: 640px }
  th, td { text-align: left; padding: 7px 10px 7px 0; border-bottom: 1px solid var(--rule); vertical-align: top }
  th { font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); font-weight: 500 }
  td.num { font-variant-numeric: tabular-nums } code { font: 13px var(--font-mono) }
  .grounds { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px }
  .ground { border-radius: 10px; padding: 22px 12px 14px; display: grid; justify-items: center; gap: 10px; font-size: 12px }
  .donts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px }
  .dont { margin: 0 } .dont .panel { min-height: 0; padding: 16px; position: relative } .dont figcaption { font-size: 13px; color: var(--muted); margin-top: 8px }
  .dont .panel::after { content: ""; position: absolute; top: 8px; right: 8px; width: 16px; height: 16px; border-radius: 50%; background: #c8102e; -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='8'/%3E%3Cpath d='M5 5l6 6M11 5l-6 6' stroke='black' stroke-width='1.8' fill='none'/%3E%3C/svg%3E") center/contain, none; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='8'/%3E%3Cpath d='M5 5l6 6M11 5l-6 6' stroke='black' stroke-width='1.8' fill='none'/%3E%3C/svg%3E") center/contain }
  .onpink { background: ${LIGHT.pink}; border-radius: 8px; padding: 6px; display: flex }
  .mocks { display: grid; gap: 22px }
  .mock { display: grid; gap: 8px } .mock .cap { color: var(--muted) }
  .tabbar { --ink: ${LIGHT.ink}; --pink: ${LIGHT.pink}; background: #dfe3dd; border-radius: 10px 10px 0 0; padding: 8px 8px 0; display: flex; gap: 2px; overflow: hidden }
  .tab { display: flex; align-items: center; gap: 8px; padding: 8px 14px; font-size: 12.5px; color: #4a525c; border-radius: 8px 8px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0 }
  .tab.active { background: #f6f7f4; color: #1b1f24; flex: 0 1 auto } .tab span { overflow: hidden; text-overflow: ellipsis }
  .fav { width: 14px; height: 14px; border-radius: 3px; background: #a8b0ba; flex: none }
  .home { background: linear-gradient(180deg, #1d2333, #0e1118); border-radius: 18px; padding: 26px 22px 20px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; justify-items: center; max-width: 380px }
  .app { display: grid; justify-items: center; gap: 7px; font-size: 11px; color: #dde2e8 }
  .app svg, .app .ph { width: 60px; height: 60px; border-radius: 22%; display: block }
  .ph.a { background: #4a5568 } .ph.b { background: #6b7280 } .ph.c { background: #374151 }
  .ogwrap { width: 100%; aspect-ratio: 1200 / 630; position: relative; overflow: hidden; border-radius: 10px; background: ${DARK.ground} }
  .og { position: absolute; top: 0; left: 0; width: 1200px; height: 630px; transform-origin: top left; display: grid; grid-template-columns: 1fr 440px; gap: 60px; padding: 56px 64px; box-sizing: border-box; color: #dde2e8; --ink: ${DARK.ink}; --pink: ${DARK.pink} }
  .og h3 { font: 700 54px/1.1 var(--font-display); margin: 28px 0 22px; color: #f2f4f7; letter-spacing: -0.01em }
  .og p { font-size: 22px; line-height: 1.5; color: #b6bdc6; max-width: 32ch } .og .langs { color: #8994a3; margin-top: 30px; font-size: 19px } .og .cta { font-size: 19px; color: #8994a3 } .og .cta b { color: #dde2e8 }
  .ogright { background: #161a20; border: 1px solid #273039; border-radius: 14px; padding: 30px; display: grid; align-content: space-between }
  .sent { font: 400 30px/1.55 var(--font-display); color: #c5ccd4; margin: 0 } .unk { color: ${DARK.pink} } .lrn { color: #e6b94f } .tapped { color: ${DARK.pink}; outline: 2px solid #3b5170; outline-offset: 2px; border-radius: 6px; background: #222c3b }
  .ogcard { background: #1c2129; border: 1px solid #36414e; border-radius: 12px; padding: 20px 24px; display: grid; gap: 8px }
  .ogcard .hw { font: 400 38px/1 var(--font-display); color: ${DARK.pink} } .ogcard .gl { font-size: 20px; color: #dde2e8 }
  .pagehead { background: var(--card); border: 1px solid var(--rule); border-radius: 10px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap }
  .pagehead nav { display: flex; gap: 18px; font-size: 14px; color: var(--muted) }
  table.files { max-width: 100% } .files td:first-child { width: 34% } .files code { overflow-wrap: anywhere }
  @media (max-width: 860px) { .two { grid-template-columns: minmax(0, 1fr) } .donts { grid-template-columns: repeat(2, minmax(0, 1fr)) } .grounds { grid-template-columns: repeat(2, minmax(0, 1fr)) } }
  @media (max-width: 560px) { .sheet { grid-template-columns: minmax(0, 1fr) } h1 { font-size: 28px } }
  a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
</style>`;

  const head = `<title>Tinta Logo Guide</title>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:wght@600;700&display=swap">${style}`;
  const body = `
<div class="wrap">
<header>
  <h1>Tinta logo: usage guide</h1>
  <p class="lead">The identity has three parts. The <strong>mark</strong> is a drop of ink holding a line of two words. The <strong>wordmark</strong> is the name set as the card the app opens when you tap a word. The <strong>lockup</strong> is the two side by side. This page says how each is built, where it goes and what not to do with it. Every colour is the app's own.</p>
  <nav class="toc"><a href="#mark">The mark</a><a href="#wordmark">The wordmark</a><a href="#lockups">Lockups</a><a href="#colour">Colour</a><a href="#size">Size and space</a><a href="#icons">App icon</a><a href="#donts">Don't</a><a href="#use">In use</a><a href="#files">Files</a><a href="#changes">What changed</a></nav>
</header>

<section id="mark">
  <h2>The mark</h2>
  <div class="two">
    <div>
      <p>A drop of ink (tinta) with one line of a text inside it: the first word unknown, the second known. It is the whole app in one shape: you read, and the words you do not know are coloured.</p>
      <dl class="anat">
        <dt>The drop</dt><dd>Ink, in the app's ink colour. The one thing that is always drawn.</dd>
        <dt>The unknown word</dt><dd>Pink, the colour the app gives a word you have not learned yet.</dd>
        <dt>The known word</dt><dd>Not drawn at all. It is the ground showing through the ink, the way a known word is plain text in the app.</dd>
      </dl>
      <h3>Construction</h3>
      <p>A 64-unit grid. The drop has a rounded apex at the top centre with a 50° opening, and a bulb of radius 19 whose centre sits at 38.5. The line of words is 8 units tall with fully round ends, on the bulb's centre. The unknown word is 16 long, the known word 11, with 3 between them. The mark is 38 wide and 49 tall.</p>
      <p>Always place the SVG. Never redraw or trace it.</p>
    </div>
    <div class="sheet"><div class="panel light tall">${mark(176)}</div><div class="panel dark tall">${mark(176)}</div><div class="panel light">${construction}</div><div class="panel light">${clearspace}<span class="cap" style="align-self:end">Clear space: the unknown word's length, on every side</span></div></div>
  </div>
</section>

<section id="wordmark">
  <h2>The wordmark</h2>
  <div class="two">
    <div>
      <p>The name set as the word card: <span style="color:var(--accent)">tinta</span> above, in the reading serif, pink because to most readers it is the unknown word; <em>reader</em> beneath, in the interface sans, ink, at half the size. It is what the app shows when you tap a word: the headword, then its meaning.</p>
      <ul>
        <li><strong>tinta</strong> in Charter Regular, one of the app's reading faces, lower case, no tracking.</li>
        <li><strong>reader</strong> in Source Sans 3 Regular, lower case, at 0.5 of the headword's size, left-aligned to the t's stem, its top 0.14 em below the headword's baseline.</li>
        <li>The card is always these two lines. Never “Tinta Reader” on one line in the wordmark, never “reader” alone, never a different weight.</li>
      </ul>
      <p>In the files the letters are outlines, so nothing depends on an installed font. Set the wordmark live only inside the app, with its own font tokens, where the system fonts are the point.</p>
    </div>
    <div class="sheet"><div class="panel light tall">${wordmark(120)}</div><div class="panel dark tall">${wordmark(120)}</div></div>
  </div>
</section>

<section id="lockups">
  <h2>Lockups</h2>
  <div class="two">
    <div>
      <p>Three forms, from fullest to smallest. Use the fullest one the space allows.</p>
      <ul>
        <li><strong>Lockup.</strong> The mark beside the card. The default wherever there is room: the site header, the link preview, the About screen, a slide.</li>
        <li><strong>Wordmark.</strong> The card alone, where the mark already appears nearby, or where the name matters more than the symbol, such as a footer.</li>
        <li><strong>Mark.</strong> Alone in the favicon, the app icon, avatars, and any space under 40 px tall.</li>
      </ul>
      <p>In the lockup the mark is exactly as tall as the card block, and the gap between them is 0.3 of that height. Nothing else ever sits between or beneath them.</p>
    </div>
    <div class="sheet">
      <div class="panel light tall"><div class="col">${lockup(64)}${wordmark(56)}${mark(48)}</div></div>
      <div class="panel dark tall"><div class="col">${lockup(64)}${wordmark(56)}${mark(48)}</div></div>
      <div class="panel light" style="grid-column: 1 / -1">${proportions}</div>
    </div>
  </div>
</section>

<section id="colour">
  <h2>Colour</h2>
  <div class="two">
    <div>
      <p>The mark and wordmark use three of the app's colours and nothing else. On the app's own grounds, use the two-colour form. Anywhere else, use the one-colour form: ink on a light surface, white on a dark or coloured one. In one colour both words are cut out of the drop.</p>
      <table>
        <tr><th>Role</th><th>Light</th><th>Dark</th><th>App token</th></tr>
        <tr><td>Ink</td><td><span class="sw" style="background:${LIGHT.ink}"></span><code>${LIGHT.ink}</code></td><td><span class="sw" style="background:${DARK.ink}"></span><code>${DARK.ink}</code></td><td><code>--ink</code></td></tr>
        <tr><td>Unknown</td><td><span class="sw" style="background:${LIGHT.pink}"></span><code>${LIGHT.pink}</code></td><td><span class="sw" style="background:${DARK.pink}"></span><code>${DARK.pink}</code></td><td><code>--c-unknown</code></td></tr>
        <tr><td>Ground</td><td><span class="sw" style="background:${LIGHT.ground}"></span><code>${LIGHT.ground}</code></td><td><span class="sw" style="background:${DARK.ground}"></span><code>${DARK.ground}</code></td><td><code>--bg</code></td></tr>
      </table>
      <table>
        <tr><th>Contrast on the ground</th><th>Light</th><th>Dark</th></tr>
        <tr><td>Ink</td><td class="num">${contrast(LIGHT.ink, LIGHT.ground)} : 1</td><td class="num">${contrast(DARK.ink, DARK.ground)} : 1</td></tr>
        <tr><td>Unknown</td><td class="num">${contrast(LIGHT.pink, LIGHT.ground)} : 1</td><td class="num">${contrast(DARK.pink, DARK.ground)} : 1</td></tr>
      </table>
      <p>Both pass the 4.5 : 1 text threshold, so the wordmark's pink line is readable at any size the guide allows. The pink belongs to the unknown word only. The drop is never pink, and the known word is never filled.</p>
    </div>
    <div class="grounds">
      <div class="ground" style="background:${LIGHT.ground};color:${LIGHT.dim};border:1px solid #d8dcd4">${mark(72)}Two colours, light ground</div>
      <div class="ground" style="background:${DARK.ground};color:${DARK.dim}"><svg width="72" height="72" viewBox="0 0 64 64">${markTwoColour(DARK.ink, DARK.pink)}</svg>Two colours, dark ground</div>
      <div class="ground" style="background:${LIGHT.pink};color:#ffd6e2">${mono(72, "#ffffff")}One colour, on pink</div>
      <div class="ground" style="background:#e9e4d6;color:#6b6250">${mono(72, LIGHT.ink)}One colour, on paper</div>
      <div class="ground" style="background:#3b4a5c;color:#b9c3cf">${mono(72, "#ffffff")}One colour, on a photo or a tint</div>
      <div class="ground" style="background:${LIGHT.ink};color:#8a939e">${mono(72, "#ffffff")}One colour, on ink</div>
      <div class="ground" style="background:#0b6f86;color:#bfe3ec">${mono(72, "#ffffff")}One colour, on any accent</div>
      <div class="ground" style="background:#fff;color:${LIGHT.dim};border:1px solid #d8dcd4">${mono(72, LIGHT.ink)}One colour, print and stamps</div>
    </div>
  </div>
</section>

<section id="size">
  <h2>Size and space</h2>
  <div class="two">
    <div>
      <table>
        <tr><th>Form</th><th>Smallest use</th><th>Where</th></tr>
        <tr><td>Mark</td><td class="num">16 px</td><td>Favicon, tab strip, list rows</td></tr>
        <tr><td>Mark</td><td class="num">24 px</td><td>Any interface use with room</td></tr>
        <tr><td>Wordmark</td><td class="num">40 px tall</td><td>The headword at 32 px, so “reader” stays legible at 16 px</td></tr>
        <tr><td>Lockup</td><td class="num">40 px tall</td><td>Same rule, the mark alongside</td></tr>
      </table>
      <p>Below 40 px tall, drop to the mark alone. Never shrink the wordmark to fit a toolbar. The app's toolbar keeps its text title as it is.</p>
      <p><strong>Clear space</strong> is the length of the unknown word, 16 units on the mark's grid, or a third of the mark's height, on every side. For the lockup and the wordmark, measure it from the mark's height in the same way. Nothing else enters that space: no text, no rule, no edge of a container.</p>
    </div>
    <div class="sheet">
      <div class="panel light"><div class="stack">${mark(64)}${mark(32)}${mark(24)}${mark(16)}<span class="cap">64 · 32 · 24 · 16 px</span></div></div>
      <div class="panel dark"><div class="stack">${mark(64)}${mark(32)}${mark(24)}${mark(16)}<span class="cap">64 · 32 · 24 · 16 px</span></div></div>
      <div class="panel light"><div class="stack">${lockup(64)}${lockup(40)}<span class="cap">Lockup at 64 and 40 px</span></div></div>
      <div class="panel dark"><div class="stack">${lockup(64)}${lockup(40)}<span class="cap">Lockup at 64 and 40 px</span></div></div>
    </div>
  </div>
</section>

<section id="icons">
  <h2>App icon and favicon</h2>
  <div class="two">
    <div>
      <p>The app icon keeps what the current one does: the mark on the light ground, inside the same superellipse with a margin, so it matches the installed icon on every platform. Three renderings, all from <code>app-icon.svg</code> and its siblings:</p>
      <ul>
        <li><strong>icon-512, icon-192.</strong> The superellipse with its margin, the mark at 62 % of the box. The mark itself is never masked.</li>
        <li><strong>maskable-512.</strong> Full-bleed ground, the mark at 56 % so it stays inside the 80 % safe circle Android cuts to.</li>
        <li><strong>apple-touch-icon.</strong> Full-bleed ground, the mark at 62 %. iOS rounds the corners itself.</li>
        <li><strong>favicon.</strong> The bare mark, no frame, filling the 32 px box. <code>icon.svg</code> follows the browser's colour scheme; <code>favicon.ico</code> carries 16 and 32 px for browsers that ask for it.</li>
      </ul>
      <p>A dark-ground icon exists as <code>app-icon-dark.svg</code> for a store listing or a dark launcher if the light one ever looks out of place. Ship one or the other, not both.</p>
    </div>
    <div class="sheet">
      <div class="panel light"><div class="stack">${icon(LIGHT, 96)}<span class="cap">icon-512 · icon-192</span></div><div class="stack"><div style="border-radius:50%;overflow:hidden;width:96px;height:96px">${icon(LIGHT, 96, { bleed: true, scale: 0.56 })}</div><span class="cap">maskable-512, masked</span></div><div class="stack"><div style="border-radius:22%;overflow:hidden;width:96px;height:96px">${icon(LIGHT, 96, { bleed: true, scale: 0.62 })}</div><span class="cap">apple-touch-icon</span></div></div>
      <div class="panel dark"><div class="stack">${icon(DARK, 96)}<span class="cap">app-icon-dark</span></div><div class="stack"><svg width="32" height="32" viewBox="6 4 52 56">${markTwoColour(DARK.ink, DARK.pink)}</svg><span class="cap">favicon 32</span></div><div class="stack"><svg width="16" height="16" viewBox="6 4 52 56">${markTwoColour(DARK.ink, DARK.pink)}</svg><span class="cap">favicon 16</span></div></div>
    </div>
  </div>
</section>

<section id="donts">
  <h2>Don't</h2>
  <div class="donts">${donts}</div>
</section>

<section id="use">
  <h2>In use</h2>
  <div class="mocks">
    <div class="mock">${tab}<span class="cap">The favicon in a tab strip, 16 px, beside the page title.</span></div>
    <div class="mock">${home}<span class="cap">The touch icon on a phone home screen, among other apps.</span></div>
    <div class="mock">${og}<span class="cap">The link preview (og.png) with the lockup in place of the old bars and “Tinta”.</span></div>
    <div class="mock">${header}<span class="cap">The header of the privacy, support and licences pages: the lockup at 36 px, the navigation beside it.</span></div>
  </div>
</section>

<section id="files">
  <h2>Files</h2>
  <p>Everything in <code>brand/logo/</code> is generated by <code>build.mjs</code> from one definition; <code>render.cjs</code> makes the PNGs and the ICO from the SVGs; <code>outline.py</code> turns the two words into paths.</p>
  <table class="files">
    <tr><th>File</th><th>What it is</th><th>Use it for</th></tr>
    <tr><td><code>mark.svg</code></td><td>The mark, follows the viewer's scheme</td><td>Web pages, docs, anywhere an SVG can be placed</td></tr>
    <tr><td><code>mark-light.svg</code>, <code>mark-dark.svg</code></td><td>The mark in fixed colours</td><td>Places that pick one palette, or that cannot read a media query</td></tr>
    <tr><td><code>mark-mono.svg</code></td><td>One colour, both words cut out, fills with <code>currentColor</code></td><td>Any surface that is not the app's ground; print; stamps</td></tr>
    <tr><td><code>wordmark.svg</code> and <code>-light</code>, <code>-dark</code></td><td>The card, outlined</td><td>Footers, credits, beside a mark already shown</td></tr>
    <tr><td><code>lockup.svg</code> and <code>-light</code>, <code>-dark</code></td><td>Mark beside the card, outlined</td><td>Headers, previews, slides, the About screen</td></tr>
    <tr><td><code>icon.svg</code>, <code>favicon.ico</code></td><td>The bare mark, 32 px box</td><td>The site's favicon; the ICO for browsers that want it</td></tr>
    <tr><td><code>icon-512.png</code>, <code>icon-192.png</code>, <code>maskable-512.png</code>, <code>apple-touch-icon.png</code></td><td>The app icon renderings</td><td>The manifest and the touch icon, same names as now</td></tr>
    <tr><td><code>app-icon.svg</code>, <code>app-icon-dark.svg</code>, <code>app-icon-maskable.svg</code>, <code>apple-touch-icon.svg</code></td><td>The sources of the PNGs</td><td>Regenerate at any size</td></tr>
  </table>
  <h3>Rollout</h3>
  <p>This site repository is regenerated on every publish, so the logo lives in the app repository's <code>docs/brand</code>, next to <code>og-card.html</code> and <code>build-icons.sh</code>. Move <code>brand/logo</code> there, point <code>build-icons.sh</code> at the new SVGs, swap the lockup into <code>og-card.html</code>, and publish. The manifest, the page markup and the icon file names do not change.</p>
</section>

<section id="changes">
  <h2>What changed from the concept, and what to consider next</h2>
  <ul>
    <li><strong>The apex.</strong> The concept's drop opened at 90°, which read as an onion at large sizes. It now opens at 50° with a rounded tip, and the bulb grew from radius 18 to 19.</li>
    <li><strong>The words.</strong> They are 8 units tall instead of 7, so the line still reads at 16 px, and the gap between them holds at a pixel.</li>
    <li><strong>One colour.</strong> The concept sheet's one-colour test simply painted the pink word ink, which made it vanish. The one-colour mark now cuts both words out, so the story survives a stamp or a monochrome print.</li>
    <li><strong>The card's second line.</strong> The concept set “reader” in the same serif. It is now in the interface sans, as the app's own card sets a word's meaning, which is what makes the lockup the card and not just two sizes of the name.</li>
    <li><strong>Fixed faces, outlined.</strong> Charter and Source Sans 3 are fixed and outlined in the files, so the wordmark has one shape everywhere rather than whatever serif and sans a device has.</li>
  </ul>
  <p>Worth trying before the rollout: put the touch icon on a real phone beside real apps in both appearances, since the light ground is a choice and the dark-ground icon is ready if it wins; and give the mark one small motion in the app, the drop settling as a text loads, since the shape is built to fall.</p>
</section>
</div>
<script>
  // The link-preview mock is designed at 1200 × 630 and scaled to its box.
  (function () {
    var wraps = document.querySelectorAll(".ogwrap");
    function fit() { wraps.forEach(function (w) { var og = w.firstElementChild; og.style.transform = "scale(" + (w.clientWidth / 1200) + ")"; }); }
    fit(); window.addEventListener("resize", fit);
  })();
</script>
`;
  writeFileSync(join(OUT, "guide.html"), `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="robots" content="noindex">\n${head}\n</head>\n<body>${body}</body>\n</html>\n`);
  if (FRAG) writeFileSync(join(FRAG, "guide-artifact.html"), head + body);
  console.log("guide written");
}
