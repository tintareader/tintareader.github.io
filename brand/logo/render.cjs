// Renders the raster assets from the SVGs build.mjs writes: the app icons
// as PNG and the favicon as a PNG-in-ICO. Needs Playwright's Chromium.
//   node brand/logo/render.cjs brand/logo
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs"), path = require("node:path");
const OUT = process.argv[2] || __dirname;
const jobs = [
  ["app-icon.svg", "icon-512.png", 512], ["app-icon.svg", "icon-192.png", 192],
  ["app-icon-maskable.svg", "maskable-512.png", 512], ["apple-touch-icon.svg", "apple-touch-icon.png", 180],
  ["icon.svg", "favicon-32.png", 32], ["icon.svg", "favicon-16.png", 16],
];
(async () => {
  const browser = await chromium.launch();
  for (const [src, dst, size] of jobs) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const svg = fs.readFileSync(path.join(OUT, src), "utf8").replace(/<style>[\s\S]*?<\/style>/, "");
    await page.setContent(`<html><body style="margin:0;background:transparent"><img width="${size}" height="${size}" src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}"></body></html>`);
    await page.screenshot({ path: path.join(OUT, dst), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
  }
  await browser.close();
  // favicon.ico: the 16 and 32 px PNGs in an ICO container (every current browser reads PNG entries).
  const pngs = ["favicon-16.png", "favicon-32.png"].map((f) => fs.readFileSync(path.join(OUT, f)));
  const dir = Buffer.alloc(6); dir.writeUInt16LE(0, 0); dir.writeUInt16LE(1, 2); dir.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length; const entries = [];
  for (const [i, png] of pngs.entries()) {
    const size = [16, 32][i], e = Buffer.alloc(16);
    e.writeUInt8(size, 0); e.writeUInt8(size, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
    entries.push(e); offset += png.length;
  }
  fs.writeFileSync(path.join(OUT, "favicon.ico"), Buffer.concat([dir, ...entries, ...pngs]));
  console.log("rendered", jobs.map((j) => j[1]).join(", "), "and favicon.ico");
})();
