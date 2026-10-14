// Build review/index.html from each design's `meta` and the curator's notes.
// Run after harness/shoot.mjs (CARD=1) and harness/prep.py:
//   node review/build.mjs
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildData, fmt, dShort } from '../harness/data.mjs';
import { notes, across } from './notes.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// In the order of the work each designer is known for.
const ORDER = ['minard', 'dubois', 'beck', 'rams', 'vignelli', 'kare', 'scher', 'cox', 'fragapane', 'chalabi'];
const SHORT = { minard: 'Minard', dubois: 'Du Bois', beck: 'Beck', rams: 'Rams', vignelli: 'Vignelli', kare: 'Kare', scher: 'Scher', cox: 'Cox', fragapane: 'Fragapane', chalabi: 'Chalabi' };
const D = buildData('tortuga');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (name) => fs.existsSync(`${ROOT}review/img/${name}.webp`) ? `img/${name}.webp` : null;

const designs = [];
for (const id of ORDER) {
  const f = `${ROOT}designs/${id}.mjs`;
  if (!fs.existsSync(f)) continue;
  const { meta } = await import(pathToFileURL(f).href);
  designs.push({ ...meta, id, note: notes[id] });
}
const ref = (await import(pathToFileURL(`${ROOT}designs/reference.mjs`).href)).meta;

const shot = (id, theme, alt, cls = '') => {
  const src = img(`${id}-${theme}-panel`);
  return src ? `<img class="shot ${cls}" src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async" data-zoom="${src}">` : `<div class="shot missing">No ${theme} image yet</div>`;
};
const views = (id, name) => {
  const out = [];
  for (const [key, label] of [['', 'In the app'], ['-card', 'Word card open']]) {
    for (const theme of ['light', 'dark']) {
      const src = img(`${id}${key}-${theme}${key ? '-panel' : ''}`);
      if (src) out.push(`<button class="view" type="button" data-zoom="${src}" data-alt="${esc(`${name}: ${label.toLowerCase()}, ${theme}`)}">${label}, ${theme}</button>`);
    }
  }
  return out.join('');
};

const contact = [{ id: 'reference', designer: 'Today', title: 'The recommended panel' }, ...designs].map(d => {
  const l = img(`${d.id}-light-panel`), k = img(`${d.id}-dark-panel`);
  return `<a class="sheet-item${d.id === 'reference' ? ' is-ref' : ''}" href="#${d.id === 'reference' ? 'brief' : d.id}">
      <span class="sheet-frame">${l ? `<img class="th-light" src="${l}" alt="" loading="lazy" decoding="async">` : ''}${k ? `<img class="th-dark" src="${k}" alt="" loading="lazy" decoding="async">` : ''}</span>
      <span class="sheet-name">${esc(d.designer)}</span><span class="sheet-title">${esc(d.title)}</span></a>`;
}).join('\n    ');

const sections = designs.map((d, i) => `
<section class="design" id="${d.id}" aria-labelledby="${d.id}-h">
  <div class="d-text">
    <p class="d-who">${esc(d.designer)}</p>
    <h3 id="${d.id}-h">${esc(d.title)}</h3>
    <p class="d-known">${esc(d.known)}</p>
    <p class="d-idea">${esc(d.idea)}</p>
    <dl class="d-how">
      ${(d.how ?? []).map((h, j) => { const m = h.match(/^([^?]+\?)\s*(.*)$/); return `<div><dt>${esc(m ? m[1] : ['Can I read this?', 'What will help most?', 'Am I getting better?'][j])}</dt><dd>${esc(m ? m[2] : h)}</dd></div>`; }).join('\n      ')}
    </dl>
    <p class="d-type"><span>Type</span> ${esc(d.type)}</p>
    ${d.note ? `<div class="d-note"><p class="d-note-h">Notes for choosing</p><p><b>Works:</b> ${esc(d.note.works)}</p><p><b>Watch:</b> ${esc(d.note.watch)}</p></div>` : ''}
    <div class="d-views">${views(d.id, d.designer)}</div>
  </div>
  <div class="d-shots">
    <figure>${shot(d.id, 'light', `${d.designer}: the panel, light theme`)}<figcaption>Light</figcaption></figure>
    <figure>${shot(d.id, 'dark', `${d.designer}: the panel, dark theme`)}<figcaption>Dark</figcaption></figure>
  </div>
</section>`).join('\n');

const words = D.repeated.map(r => `<i>${esc(r.word)}</i> ${r.count}×`).join(', ');
const acrossRows = (across?.rows ?? []).map(r => `<tr><td><a href="#${r.id}">${esc(designs.find(d => d.id === r.id)?.designer ?? r.id)}</a></td><td>${esc(r.device)}</td><td>${esc(r.glance)}</td><td>${esc(r.build)}</td></tr>`).join('\n        ');

const page = `<title>The Stats Panel, Ten Ways</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400..700&family=Fraunces:opsz,wght@9..144,500..700&family=Literata:opsz,ital,wght@7..72,0,400..600;7..72,1,400&display=swap">
<style>
/* Layout: a reading column for the words; full-width rows for the contact sheet and each designer's pair of panels. Tinta's own faces and colours. */
:root {
  --bg: #fcfcfa; --surface: #f3f4f0; --panel: #eceee9; --ink: #1b1f24; --text: #2c3238; --dim: #5e676f;
  --line: #d8dcd4; --accent: #3d5a99; --new: #b03a64; --scrim: rgba(16, 19, 24, .86); --shadow: rgba(20, 24, 30, .10);
  --f-display: "Fraunces", Georgia, "Times New Roman", serif;
  --f-body: "Literata", Georgia, "Times New Roman", serif;
  --f-ui: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #101318; --surface: #14181e; --panel: #161a20; --ink: #e6eaee; --text: #c5ccd4; --dim: #8f99a7;
    --line: #273039; --accent: #a8b8d8; --new: #ff5277; --scrim: rgba(4, 6, 10, .9); --shadow: rgba(0, 0, 0, .45); color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #101318; --surface: #14181e; --panel: #161a20; --ink: #e6eaee; --text: #c5ccd4; --dim: #8f99a7;
  --line: #273039; --accent: #a8b8d8; --new: #ff5277; --scrim: rgba(4, 6, 10, .9); --shadow: rgba(0, 0, 0, .45); color-scheme: dark;
}
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--text); font: 400 17px/1.6 var(--f-body); margin: 0; }
.wrap { max-width: 1180px; margin: 0 auto; padding-inline: 24px; }
.col { max-width: 66ch; }
a { color: var(--accent); text-underline-offset: 2px; }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 4px; }
h1, h2, h3 { font-family: var(--f-display); color: var(--ink); font-weight: 600; letter-spacing: -.012em; text-wrap: balance; }
h1 { font-size: clamp(2.3rem, 5.4vw, 3.6rem); line-height: 1.04; margin: .15em 0 .3em; }
h2 { font-size: clamp(1.55rem, 3vw, 2.05rem); line-height: 1.15; margin: 0 0 .5em; }
h3 { font-size: 1.5rem; line-height: 1.2; margin: 0 0 .35em; }
p { margin: 0 0 .9em; }
.eyebrow { font: 500 .78rem/1.3 var(--f-ui); letter-spacing: .1em; text-transform: uppercase; color: var(--dim); margin: 0; }
.lede { font-size: 1.16rem; line-height: 1.55; max-width: 62ch; }
.ui { font-family: var(--f-ui); }
.note { font: 400 .88rem/1.5 var(--f-ui); color: var(--dim); }
header.top { padding-block: 44px 20px; }
section.block { padding-block: 52px 12px; border-top: 1px solid var(--line); }
nav.toc { display: flex; flex-wrap: wrap; gap: 6px 18px; margin-top: 16px; font: 500 .92rem/1.4 var(--f-ui); }
nav.toc a { text-decoration: none; } nav.toc a:hover { text-decoration: underline; }

/* The brief: the fixed facts beside the panel they come from. */
.brief { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 300px); gap: 40px; align-items: start; }
.facts { display: grid; gap: 14px; margin: 6px 0 18px; }
.facts > div { display: grid; grid-template-columns: 11.5em minmax(0, 1fr); gap: 4px 16px; padding-top: 12px; border-top: 1px solid var(--line); font: 400 .95rem/1.5 var(--f-ui); }
.facts dt { font-weight: 600; color: var(--ink); }
.facts dd { margin: 0; }
.facts i { font-family: var(--f-body); color: var(--new); }
.rules { font: 400 .92rem/1.55 var(--f-ui); padding-left: 1.1em; margin: 0; }
.rules li { margin-bottom: 4px; }

/* Contact sheet. The theme switch only swaps which screenshots show. */
.sheet-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; padding: 2px; background: var(--surface); font: 500 .88rem/1 var(--f-ui); }
.seg button { font: inherit; color: var(--dim); background: none; border: 0; border-radius: 6px; padding: 7px 12px; cursor: pointer; }
.seg button[aria-pressed="true"] { background: var(--bg); color: var(--ink); box-shadow: 0 1px 2px var(--shadow); }
.sheet { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 22px 16px; }
.sheet-item { display: grid; gap: 4px; text-decoration: none; color: var(--text); min-width: 0; }
.sheet-frame { display: block; aspect-ratio: 800 / 1700; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); box-shadow: 0 1px 2px var(--shadow); max-width: 100%; }
.sheet-frame img { display: block; width: 100%; height: auto; }
.sheet-item:hover .sheet-frame { border-color: var(--accent); }
.sheet-name { font: 600 .9rem/1.25 var(--f-ui); color: var(--ink); margin-top: 4px; }
.sheet-title { font: 400 .82rem/1.3 var(--f-ui); color: var(--dim); }
.is-ref .sheet-name { color: var(--dim); }
body[data-shots="light"] .th-dark, body[data-shots="dark"] .th-light { display: none; }

/* One designer: words on the left, the panel in both themes on the right. */
.design { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 640px); gap: 40px; padding-block: 48px; border-top: 1px dashed var(--line); scroll-margin-top: 12px; }
.d-who { font: 600 .8rem/1.3 var(--f-ui); letter-spacing: .1em; text-transform: uppercase; color: var(--new); margin-bottom: 6px; }
.d-known { font: 400 .92rem/1.5 var(--f-ui); color: var(--dim); }
.d-idea { font-size: 1.02rem; }
.d-how { margin: 0 0 14px; display: grid; gap: 10px; font: 400 .92rem/1.5 var(--f-ui); }
.d-how dt { font-weight: 600; color: var(--ink); }
.d-how dd { margin: 0; }
.d-type { font: 400 .86rem/1.5 var(--f-ui); color: var(--dim); }
.d-type span { font-weight: 600; color: var(--text); }
.d-note { border-left: 2px solid var(--line); padding: 2px 0 2px 14px; margin: 14px 0; font: 400 .9rem/1.5 var(--f-ui); }
.d-note p { margin-bottom: .45em; }
.d-note-h { font-weight: 600; color: var(--ink); }
.d-views { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.view { font: 500 .84rem/1 var(--f-ui); color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 7px; padding: 8px 11px; cursor: zoom-in; }
.view:hover { border-color: var(--accent); }
.d-shots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
figure { margin: 0; }
figcaption { font: 400 .8rem/1.4 var(--f-ui); color: var(--dim); margin-top: 6px; }
.shot { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); box-shadow: 0 1px 2px var(--shadow); cursor: zoom-in; }
.shot.missing { aspect-ratio: 1 / 2; display: grid; place-items: center; color: var(--dim); font: .85rem var(--f-ui); cursor: default; }

table { border-collapse: collapse; width: 100%; font: 400 .9rem/1.45 var(--f-ui); }
th, td { text-align: left; vertical-align: top; padding: 9px 10px; border-bottom: 1px solid var(--line); }
th { font-weight: 600; color: var(--ink); font-size: .78rem; letter-spacing: .05em; text-transform: uppercase; }
.tablewrap { overflow-x: auto; margin: 10px 0 18px; }
.tablewrap > table { min-width: 680px; }
footer { padding-block: 36px 60px; border-top: 1px solid var(--line); margin-top: 36px; }

/* Lightbox */
.lb { position: fixed; inset: 0; background: var(--scrim); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 10; }
.lb img { max-width: 100%; max-height: 100%; border-radius: 6px; box-shadow: 0 10px 40px rgba(0, 0, 0, .5); }
.lb button { position: absolute; top: calc(12px + env(safe-area-inset-top, 0px)); right: 12px; font: 600 .9rem/1 var(--f-ui); padding: 9px 12px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); cursor: pointer; }
@media (max-width: 900px) {
  .brief, .design { grid-template-columns: minmax(0, 1fr); }
  .brief figure { max-width: 300px; }
}
@media (max-width: 560px) {
  .wrap { padding-inline: 16px; }
  body { font-size: 16px; }
  .facts > div { grid-template-columns: minmax(0, 1fr); }
  .sheet { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .d-shots { gap: 10px; }
}
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
</style>

<header class="top wrap">
  <p class="eyebrow">Tinta Reader · design study · 14 October 2026</p>
  <h1>The Stats Panel, Ten Ways</h1>
  <p class="lede">The three-question panel says the right things. Here ten designers each show exactly the same facts, in their own way, built into the running app in its light and dark themes.</p>
  <nav class="toc" aria-label="Contents"><a href="#sheet">All ten</a><a href="#brief">What stays the same</a>${designs.map(d => `<a href="#${d.id}">${esc(SHORT[d.id] ?? d.designer)}</a>`).join('')}<a href="#across">Reading across</a><a href="#method">How this was made</a></nav>
</header>

<section class="block" id="sheet" aria-labelledby="sheet-h">
  <div class="wrap">
    <div class="sheet-bar">
      <h2 id="sheet-h" style="margin:0">All ten, side by side</h2>
      <div class="seg" role="group" aria-label="Screenshots"><button type="button" data-shots="light" aria-pressed="true">Light</button><button type="button" data-shots="dark" aria-pressed="false">Dark</button></div>
    </div>
    <div class="sheet">
    ${contact}
    </div>
    <p class="note" style="margin-top:14px">Each panel as it sits under the app’s Words / Stats / Letters tabs, with no word selected. Select one to read about it.</p>
  </div>
</section>

<section class="block" id="brief" aria-labelledby="brief-h">
  <div class="wrap brief">
    <div class="col">
      <h2 id="brief-h">What stays the same</h2>
      <p>Every design shows these facts, read from the app for the same reader and text, and nothing else: no new statistics, none left out. The three questions keep their order; each designer words the headings and lays them out in their own way.</p>
      <dl class="facts">
        <div><dt>Can I read this?</dt><dd>About 1 word in ${D.oneIn} is new to you. ${esc(D.verdict.label)}, for an ${D.level} reader. ${D.pct}% known: ${D.lookups} lookups in ${D.total} words (${D.counts.k} known, ${D.counts.l} learning, ${D.counts.u} new). Marks at ${D.thresholds.workable}% workable at ${D.level} and ${D.thresholds.comfortable}% comfortable.</dd></div>
        <div><dt>What will help most?</dt><dd>The new words that come back in this text: ${words}, each with its gloss. A button, “${esc(D.action)}”. Knowing them: ${D.after}% of this text.</dd></div>
        <div><dt>Am I getting better?</dt><dd>This text ${D.firstPct}% → ${D.pct}% since ${dShort(D.since)}. Words known ${fmt(D.known)}, +${D.gain7} this week, each with its daily history.</dd></div>
        <div><dt>Footer</dt><dd>A link to all your statistics.</dd></div>
      </dl>
      <p class="ui" style="font-size:.95rem;font-weight:600;color:var(--ink);margin-bottom:.4em">The frame</p>
      <ul class="rules">
        <li>399 × 817 px in the reader’s right-hand column at a 1440 × 900 window, with no scrolling.</li>
        <li>New words in the app’s pink, so the panel agrees with the text; every other colour is the designer’s.</li>
        <li>Light and dark, from the app’s own switch. Status never by colour alone; text at least 10.5 px.</li>
      </ul>
    </div>
    <figure>
      ${shot('reference', 'light', 'The recommended panel, light theme', 'th-light')}${shot('reference', 'dark', 'The recommended panel, dark theme', 'th-dark')}
      <figcaption>The recommended panel from the independent round, which sets the content.</figcaption>
    </figure>
  </div>
</section>

<section class="block" id="designs" aria-label="The ten designs">
  <div class="wrap">
    <h2>Ten designers</h2>
    <p class="col">In the order of the work each is known for, from an 1869 flow map to illustrated data journalism. Each is a reading of the designer’s published work applied to this panel, not something they made or endorsed.</p>
${sections}
  </div>
</section>

<section class="block" id="across" aria-labelledby="across-h">
  <div class="wrap">
    <h2 id="across-h">Reading across the ten</h2>
    <div class="col">${(across?.intro ?? []).map(p => `<p>${p}</p>`).join('')}</div>
    ${acrossRows ? `<div class="tablewrap"><table>
      <thead><tr><th>Designer</th><th>The device</th><th>Read at a glance</th><th>To build</th></tr></thead>
      <tbody>
        ${acrossRows}
      </tbody></table></div>` : ''}
    <div class="col">${(across?.outro ?? []).map(p => `<p>${p}</p>`).join('')}</div>
  </div>
</section>

<section class="block" id="method" aria-labelledby="method-h">
  <div class="wrap col">
    <h2 id="method-h">How this was made</h2>
    <p><b>The numbers</b> are the app’s own, for the simulated reader of the independent round: an A2 Spanish learner seven weeks in, reading the opening of Horacio Quiroga’s “La tortuga gigante”. The 1-in-8 figure, the 92% after learning the seven words and the week’s gain are arithmetic on the app’s figures. The A2 level, the 60% and 95% marks, the button and the link are that round’s proposals, not features of the app.</p>
    <p><b>The designs</b> were made by ten separate agents, one per designer, from the same brief and the same data object, so no figure is typed in by hand. Each panel is HTML and SVG placed into the published app in place of the Stats tab’s content, then photographed with Playwright in headless Chromium at 1440 × 900, 2× density. Fonts come from Google Fonts and are inlined, because the app’s Content Security Policy allows no other font host.</p>
    <p><b>The designers</b> did not make these. Each panel applies what their published work does to a problem they never worked on.</p>
    <p class="note">The scripts, data and full-size screenshots are in <code>design/stats-sidebar-ten/</code> on the branch <code>claude/gifted-faraday-dhccef</code>.</p>
  </div>
</section>

<footer class="wrap note">Tinta Reader · design study, not part of the app.</footer>

<div class="lb" id="lb" hidden role="dialog" aria-modal="true" aria-label="Enlarged screenshot"><img alt=""><button type="button">Close</button></div>
<script>
(function () {
  var body = document.body, segBtns = document.querySelectorAll('.seg button');
  function setShots(t) {
    body.setAttribute('data-shots', t);
    segBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-shots') === t)); });
    try { localStorage.setItem('tinta-ten-shots', t); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem('tinta-ten-shots'); } catch (e) {}
  var root = document.documentElement.getAttribute('data-theme');
  var dark = root ? root === 'dark' : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  setShots(saved || (dark ? 'dark' : 'light'));
  segBtns.forEach(function (b) { b.addEventListener('click', function () { setShots(b.getAttribute('data-shots')); }); });

  var lb = document.getElementById('lb'), big = lb.querySelector('img'), close = lb.querySelector('button'), last = null;
  function open(src, alt) { big.src = src; big.alt = alt || ''; lb.hidden = false; close.focus(); }
  function shut() { lb.hidden = true; big.removeAttribute('src'); if (last) last.focus(); }
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-zoom]');
    if (t && !lb.contains(t)) { last = t; open(t.getAttribute('data-zoom'), t.getAttribute('data-alt') || t.getAttribute('alt')); }
  });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === close) shut(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) shut(); });
})();
</script>
`;
fs.writeFileSync(`${ROOT}review/index.html`, page);
console.log(`review/index.html: ${designs.length} designs (${designs.map(d => d.id).join(', ')})`);
