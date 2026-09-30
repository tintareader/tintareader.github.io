// Builds the Tinta card identity from one definition: the mark (the word
// card reduced to two bars), the wordmark (the card: "tinta" over
// "reader"), the lockup, the favicon, the app icons, and the usage guide.
//
//   node brand/logo-card/build.mjs brand/logo-card [guide-fragment-dir]
//
// Text is pre-outlined into wordmark-paths.json (brand/logo/outline.py), so
// no file here depends on an installed font. PNG and ICO rendering happens
// in render.cjs, which this script does not call.
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
// The unknown word: pink, 26 × 14 at (12, 19). Its meaning: ink, 40 × 7 at
// (12, 37), half the height, 4 below. Both start on the same left edge.
// The mark is 40 wide and 25 tall, centred on (32, 31.5).
const rr = (x, y, w, h, r) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 -${r} ${r}h-${w - 2 * r}a${r} ${r} 0 0 1 -${r} -${r}v-${h - 2 * r}a${r} ${r} 0 0 1 ${r} -${r}z`;
export const WORD = rr(12, 19, 26, 14, 4.5);
export const MEANING = rr(12, 37, 40, 7, 3.5);
export const MARK = { x: 12, y: 19, w: 40, h: 25 };
export const markTwoColour = (ink, pink) => `<path fill="${pink}" d="${WORD}"/><path fill="${ink}" d="${MEANING}"/>`;
export const markOneColour = (ink) => `<path fill="${ink}" d="${WORD}${MEANING}"/>`;

const svg = (w, h, vb, inner, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}"${extra}>\n${inner}\n</svg>\n`;
const scheme = (l, d) => `<style>:root{--ink:${l.ink};--pink:${l.pink}}@media (prefers-color-scheme:dark){:root{--ink:${d.ink};--pink:${d.pink}}}</style>`;

writeFileSync(join(OUT, "mark.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${scheme(LIGHT, DARK)}${markTwoColour("var(--ink)", "var(--pink)")}`));
writeFileSync(join(OUT, "mark-light.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${markTwoColour(LIGHT.ink, LIGHT.pink)}`));
writeFileSync(join(OUT, "mark-dark.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${markTwoColour(DARK.ink, DARK.pink)}`));
writeFileSync(join(OUT, "mark-mono.svg"), svg(64, 64, "0 0 64 64", `<title>Tinta</title>${markOneColour("currentColor")}`));
// The favicon: the bare mark filling the width of a 32 px box, no frame.
export const FAVICON_VB = "8 7.5 48 48";
writeFileSync(join(OUT, "icon.svg"), svg(32, 32, FAVICON_VB, `<title>Tinta</title>${scheme(LIGHT, DARK)}${markTwoColour("var(--ink)", "var(--pink)")}`));

// ---------- the app icon ----------
// As the current icon: a superellipse (n = 5) on the light ground with a
// margin, the mark inside it. maskable: full-bleed ground, the mark inside
// the 80 % safe circle.
function squircle(cx, r, n = 5, steps = 96) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    pts.push(`${(cx + r * Math.sign(c) * Math.abs(c) ** (2 / n)).toFixed(2)} ${(cx + r * Math.sign(s) * Math.abs(s) ** (2 / n)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
export const SQ = squircle(32, 26);
export const ICON_SCALE = 0.75, MASK_SCALE = 0.66;
export const iconInner = (pal, opts = {}) => {
  const frame = opts.bleed
    ? `<rect width="64" height="64" fill="url(#g)"/>`
    : `<path d="${SQ}" fill="url(#g)"/><path d="${SQ}" fill="none" stroke="#000" stroke-opacity="${pal === DARK ? 0.35 : 0.2}" stroke-width="0.5"/>`;
  const top = pal === DARK ? "#1c2129" : "#ffffff", bottom = pal === DARK ? "#101318" : "#eceee9";
  const s = opts.scale || ICON_SCALE;
  return `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>
${frame}<g transform="translate(32 32) scale(${s}) translate(-32 -31.5)">${markTwoColour(pal.ink, pal.pink)}</g>`;
};
writeFileSync(join(OUT, "app-icon.svg"), svg(512, 512, "0 0 64 64", iconInner(LIGHT)));
writeFileSync(join(OUT, "app-icon-dark.svg"), svg(512, 512, "0 0 64 64", iconInner(DARK)));
writeFileSync(join(OUT, "app-icon-maskable.svg"), svg(512, 512, "0 0 64 64", iconInner(LIGHT, { bleed: true, scale: MASK_SCALE })));
writeFileSync(join(OUT, "apple-touch-icon.svg"), svg(180, 180, "0 0 64 64", iconInner(LIGHT, { bleed: true, scale: ICON_SCALE })));

// ---------- the wordmark: the card ----------
// "tinta" in Charter Regular, pink; "reader" in Source Sans 3 Regular, ink,
// at half the size, left-aligned beneath, its top 0.14 em below the baseline.
const paths = JSON.parse(readFileSync(join(HERE, "wordmark-paths.json"), "utf8"));
const headScale = 0.1, subScale = 0.05, GAP_EM = 14;          // units: 1 = 1 % of the headword em
const headBox = paths.tinta.bbox.map((v) => v * headScale);
const subBox = paths.reader.bbox.map((v) => v * subScale);
const headTop = headBox[1];
const subBase = GAP_EM - subBox[1];
const cardW = Math.max(headBox[2], subBox[2]) - Math.min(headBox[0], subBox[0]);
const cardH = subBase + subBox[3] - headTop;
const cardX0 = Math.min(headBox[0], subBox[0]);
export const CARD = { w: cardW, h: cardH, headH: -headTop, readerTop: GAP_EM, readerH: subBox[3] - subBox[1] };
export const wordmarkInner = (ink, pink, x = 0, y = 0) =>
  `<g transform="translate(${(x - cardX0).toFixed(2)} ${(y - headTop).toFixed(2)})">
  <path fill="${pink}" transform="scale(${headScale})" d="${paths.tinta.d}"/>
  <path fill="${ink}" transform="translate(0 ${subBase.toFixed(2)}) scale(${subScale})" d="${paths.reader.d}"/>
</g>`;
const PAD = 8;
const wmVB = `0 0 ${(cardW + 2 * PAD).toFixed(1)} ${(cardH + 2 * PAD).toFixed(1)}`;
const wm = (inner) => svg(Math.round((cardW + 2 * PAD) * 2), Math.round((cardH + 2 * PAD) * 2), wmVB, inner);
writeFileSync(join(OUT, "wordmark.svg"), wm(`<title>Tinta Reader</title>${scheme(LIGHT, DARK)}${wordmarkInner("var(--ink)", "var(--pink)", PAD, PAD)}`));
writeFileSync(join(OUT, "wordmark-light.svg"), wm(`<title>Tinta Reader</title>${wordmarkInner(LIGHT.ink, LIGHT.pink, PAD, PAD)}`));
writeFileSync(join(OUT, "wordmark-dark.svg"), wm(`<title>Tinta Reader</title>${wordmarkInner(DARK.ink, DARK.pink, PAD, PAD)}`));

// ---------- the lockup: mark beside the card ----------
// The mark stands 0.62 of the card block's height, centred on it; the gap
// between them is 0.22 of that height.
export const LOCK = { markRatio: 0.62, gapRatio: 0.22 };
const markH = cardH * LOCK.markRatio, markScale = markH / MARK.h, markW = MARK.w * markScale;
const GAP = cardH * LOCK.gapRatio, markY = (cardH - markH) / 2;
export const LOCKUP = { w: markW + GAP + cardW, h: cardH, markW, markH, markY, gap: GAP };
export const lockupInner = (ink, pink, x = 0, y = 0) =>
  `<g transform="translate(${x} ${(y + markY).toFixed(2)}) scale(${markScale.toFixed(4)}) translate(-${MARK.x} -${MARK.y})">${markTwoColour(ink, pink)}</g>${wordmarkInner(ink, pink, x + markW + GAP, y)}`;
const luVB = `0 0 ${(LOCKUP.w + 2 * PAD).toFixed(1)} ${(LOCKUP.h + 2 * PAD).toFixed(1)}`;
const lu = (inner) => svg(Math.round((LOCKUP.w + 2 * PAD) * 2), Math.round((LOCKUP.h + 2 * PAD) * 2), luVB, inner);
writeFileSync(join(OUT, "lockup.svg"), lu(`<title>Tinta Reader</title>${scheme(LIGHT, DARK)}${lockupInner("var(--ink)", "var(--pink)", PAD, PAD)}`));
writeFileSync(join(OUT, "lockup-light.svg"), lu(`<title>Tinta Reader</title>${lockupInner(LIGHT.ink, LIGHT.pink, PAD, PAD)}`));
writeFileSync(join(OUT, "lockup-dark.svg"), lu(`<title>Tinta Reader</title>${lockupInner(DARK.ink, DARK.pink, PAD, PAD)}`));

console.log("mark, icons, wordmark and lockup written to", OUT, "card", { w: cardW.toFixed(1), h: cardH.toFixed(1) }, "lockup", { w: LOCKUP.w.toFixed(1) });

if (process.env.GUIDE !== "0") {
  const { buildGuide } = await import("./guide.mjs");
  buildGuide({ OUT, FRAG, LIGHT, DARK, markTwoColour, markOneColour, wordmarkInner, lockupInner, CARD, LOCKUP, LOCK, MARK, WORD, MEANING, FAVICON_VB, ICON_SCALE, MASK_SCALE, iconInner });
}
