// Playwright, from the PW environment variable or the installed package.
export const { chromium } = await import(process.env.PW ?? 'playwright');
