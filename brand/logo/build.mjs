// Builds the Tinta logo assets from one definition: the mark (the drop
// holding the two-word line), the wordmark (the card: "tinta" over
// "reader"), the lockup, the favicon, the app icons, and the usage guide.
//
//   node brand/logo/build.mjs brand/logo [guide-fragment-dir]
//
// Text is pre-outlined into wordmark-paths.json (see outline.py), so no
// file here depends on an installed font. PNG and ICO rendering happens in
// render.cjs, which this script does not call.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = process.argv[2] || HERE;
const FRAG = process.argv[3];
mkdirSync(OUT, { recursive: true });

// The app's tokens (assets/index-*.css): --ink, --c-unknown, --bg.
export const LIGHT = { ink: "#1b1f24", pink: "#b8246a", ground: "#f6f7f4", dim: "#8994a3" };
export const DARK = { ink: "#c5ccd4", pink: "#ff5277", ground: "#101318", dim: "#5e676f" };

// ---------- the mark, on a 64-unit grid ----------
// Drop: rounded apex at (32, 7), 50° opening, bulb centred (32, 38.5) r 19.
// Line: the unknown word (pink) x 17–33, the known word (cut out) x 36–47,
// both 8 tall with fully round ends, centred on the bulb.
const rr = (x, y, w, h, r) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
export const DROP = "M31.3 6.9A1 1 0 0 1 32.7 6.9C34.8 11.8 51 26 51 38.5A19 19 0 1 1 13 38.5C13 26 29.2 11.8 31.3 6.9Z";
export const KNOWN = rr(36, 35, 11, 8, 4);
export const UNKNOWN = rr(17, 35, 16, 8, 4);
// Two-colour: the drop with the known word cut out, the unknown word in pink.
export const markTwoColour = (ink, pink) =>
  `<path fill="${ink}" fill-rule="evenodd" d="${DROP}${KNOWN}"/><path fill="${pink}" d="${UNKNOWN}"/>`;
// One colour: both words cut out of the drop.
export const markOneColour = (ink) => `<path fill="${ink}" fill-rule="evenodd" d="${DROP}${KNOWN}${UNKNOWN}"/>`;

const svg = (w, h, vb, inner, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"${extra}>\n${inner}\n</svg>\n`;
const scheme = (l, d) => `<style>:root{--ink:${l.ink};--pink:${l.pink}}@media (prefers-color-scheme:dark){:root{--ink:${d.ink};--pink:${d.pink}}}</style>`;

writeFileSync(join(OUT, "mark.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${scheme(LIGHT, DARK)}${markTwoColour("var(--ink)", "var(--pink)")}`));
writeFileSync(join(OUT, "mark-light.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${markTwoColour(LIGHT.ink, LIGHT.pink)}`));
writeFileSync(join(OUT, "mark-dark.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${markTwoColour(DARK.ink, DARK.pink)}`));
writeFileSync(join(OUT, "mark-mono.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${markOneColour("currentColor")}`));
// The favicon: the bare mark filling a 32 px box, no frame. (icon.svg in the site.)
writeFileSync(join(OUT, "icon.svg"), svg(32, 32, "6 4 52 56", `<title>Tinta</title>${scheme(LIGHT, DARK)}${markTwoColour("var(--ink)", "var(--pink)")}`));

// ---------- the app icon ----------
// The existing icon: a superellipse (n = 5) on the light ground with a
// margin, the mark at 74 % inside it. maskable: full-bleed ground, the mark
// inside the 80 % safe circle.
function squircle(cx, r, n = 5, steps = 96) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    pts.push(`${(cx + r * Math.sign(c) * Math.abs(c) ** (2 / n)).toFixed(2)} ${(cx + r * Math.sign(s) * Math.abs(s) ** (2 / n)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
export const SQ = squircle(32, 26);
const iconInner = (pal, opts = {}) => {
  const frame = opts.bleed
    ? `<rect width="64" height="64" fill="url(#g)"/>`
    : `<path d="${SQ}" fill="url(#g)"/><path d="${SQ}" fill="none" stroke="#000" stroke-opacity="${pal === DARK ? 0.35 : 0.2}" stroke-width="0.5"/>`;
  const top = pal === DARK ? "#1c2129" : "#ffffff", bottom = pal.ground === LIGHT.ground ? "#eceee9" : "#101318";
  const s = opts.scale || 0.62;
  return `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
${frame}<g transform="translate(32 32) scale(${s}) translate(-32 -32)">${markTwoColour(pal.ink, pal.pink)}</g>`;
};
writeFileSync(join(OUT, "app-icon.svg"), svg(512, 512, "0 0 64 64", iconInner(LIGHT)));
writeFileSync(join(OUT, "app-icon-dark.svg"), svg(512, 512, "0 0 64 64", iconInner(DARK)));
writeFileSync(join(OUT, "app-icon-maskable.svg"), svg(512, 512, "0 0 64 64", iconInner(LIGHT, { bleed: true, scale: 0.56 })));
writeFileSync(join(OUT, "apple-touch-icon.svg"), svg(180, 180, "0 0 64 64", iconInner(LIGHT, { bleed: true, scale: 0.62 })));

// ---------- the wordmark: the card ----------
// "tinta" in Charter Regular, pink; "reader" in Source Sans 3 Regular, ink,
// at half the size, left-aligned beneath, with a gap of 0.14 em of the headword.
const paths = JSON.parse(readFileSync(join(HERE, "wordmark-paths.json"), "utf8"));
export const WORD = { head: 100, sub: 50, gap: 14 };            // units: 1 = 1 % of the headword em
const headScale = WORD.head / 1000, subScale = WORD.sub / 1000;
const headBox = paths.tinta.bbox.map((v) => v * headScale);   // [xmin, ymin(top, negative), xmax, ymax(bottom)]
const subBox = paths.reader.bbox.map((v) => v * subScale);
// Card block: origin at the headword's left ink edge and its top ink edge.
const headTop = headBox[1], headBase = 0;
const subTop = headBase + WORD.gap + (-subBox[1]) * 0 + 0;      // sub's ink top sits gap below the head baseline
const subBase = subTop - subBox[1];                             // baseline so that ink top is at subTop
const cardW = Math.max(headBox[2], subBox[2]) - Math.min(headBox[0], subBox[0]);
const cardH = subBase + subBox[3] - headTop;
const cardX0 = Math.min(headBox[0], subBox[0]);
export const CARD = { w: cardW, h: cardH };
export const wordmarkInner = (ink, pink, x = 0, y = 0) =>
  `<g transform="translate(${(x - cardX0).toFixed(2)} ${(y - headTop).toFixed(2)})">
  <path fill="${pink}" transform="scale(${headScale})" d="${paths.tinta.d}"/>
  <path fill="${ink}" transform="translate(${(subBox[0] * 0).toFixed(2)} ${subBase.toFixed(2)}) scale(${subScale})" d="${paths.reader.d}"/>
</g>`;
const PAD = 8;
const wmVB = `0 0 ${(cardW + 2 * PAD).toFixed(1)} ${(cardH + 2 * PAD).toFixed(1)}`;
const wm = (pal) => svg(Math.round((cardW + 2 * PAD) * 2), Math.round((cardH + 2 * PAD) * 2), wmVB, `<title>Tinta Reader</title>${wordmarkInner(pal.ink, pal.pink, PAD, PAD)}`);
writeFileSync(join(OUT, "wordmark.svg"), svg(Math.round((cardW + 2 * PAD) * 2), Math.round((cardH + 2 * PAD) * 2), wmVB, `<title>Tinta Reader</title>${scheme(LIGHT, DARK)}${wordmarkInner("var(--ink)", "var(--pink)", PAD, PAD)}`));
writeFileSync(join(OUT, "wordmark-light.svg"), wm(LIGHT));
writeFileSync(join(OUT, "wordmark-dark.svg"), wm(DARK));

// ---------- the lockup: mark beside the card ----------
// The mark is as tall as the card block; the gap between them is 0.3 of that height.
const markH = cardH, markScale = markH / 49.1;                  // the drop spans y 6.9–56 on its grid
const GAP = markH * 0.3;
const markW = 38 * markScale;                                   // x 13–51
export const LOCKUP = { w: markW + GAP + cardW, h: cardH };
export const lockupInner = (ink, pink, x = 0, y = 0) =>
  `<g transform="translate(${x} ${y}) scale(${markScale.toFixed(4)}) translate(-13 -6.9)">${markTwoColour(ink, pink)}</g>${wordmarkInner(ink, pink, x + markW + GAP, y)}`;
const luVB = `0 0 ${(LOCKUP.w + 2 * PAD).toFixed(1)} ${(LOCKUP.h + 2 * PAD).toFixed(1)}`;
const lu = (inner) => svg(Math.round((LOCKUP.w + 2 * PAD) * 2), Math.round((LOCKUP.h + 2 * PAD) * 2), luVB, inner);
writeFileSync(join(OUT, "lockup.svg"), lu(`<title>Tinta Reader</title>${scheme(LIGHT, DARK)}${lockupInner("var(--ink)", "var(--pink)", PAD, PAD)}`));
writeFileSync(join(OUT, "lockup-light.svg"), lu(`<title>Tinta Reader</title>${lockupInner(LIGHT.ink, LIGHT.pink, PAD, PAD)}`));
writeFileSync(join(OUT, "lockup-dark.svg"), lu(`<title>Tinta Reader</title>${lockupInner(DARK.ink, DARK.pink, PAD, PAD)}`));

console.log("mark, icons, wordmark and lockup written to", OUT, "card", CARD, "lockup", LOCKUP);

// The guide is built by guide.mjs, which imports the pieces above.
if (process.env.GUIDE !== "0") {
  const { buildGuide } = await import("./guide.mjs");
  buildGuide({ OUT, FRAG, LIGHT, DARK, markTwoColour, markOneColour, wordmarkInner, lockupInner, CARD, LOCKUP, SQ, DROP, KNOWN, UNKNOWN, iconInner });
}
