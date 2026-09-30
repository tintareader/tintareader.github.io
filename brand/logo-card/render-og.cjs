const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto("file://" + __dirname + "/og-card.html"); await page.waitForTimeout(500);
  await page.screenshot({ path: __dirname + "/og.png", clip: { x: 0, y: 0, width: 1200, height: 630 } });
  await browser.close(); console.log("wrote og.png");
})();
