import { openApp, statsTab } from './app.mjs';
for (const theme of ['dark', 'light']) {
  const { browser, page } = await openApp({ theme, state: 'state-reading.json', scale: 2 });
  const gotIt = page.getByRole('button', { name: 'Got it' });
  if (await gotIt.count()) { await gotIt.first().click(); await page.waitForTimeout(300); }
  await statsTab(page, 'text');
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await page.evaluate(() => document.activeElement?.blur()); await page.mouse.move(5, 895);
  await page.screenshot({ path: `out/before-closed-${theme}.png` });
  await page.locator('.page .w', { hasText: /^olía$/ }).click(); await page.waitForTimeout(500);
  await page.evaluate(() => document.activeElement?.blur()); await page.mouse.move(5, 895);
  await page.screenshot({ path: `out/before-card-${theme}.png` });
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  await statsTab(page, 'all');
  await page.evaluate(() => document.activeElement?.blur()); await page.mouse.move(5, 895);
  await page.screenshot({ path: `out/before-overall-${theme}.png` });
  await browser.close();
}
