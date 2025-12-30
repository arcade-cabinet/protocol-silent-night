import { test } from '@playwright/test';

test('check ui content', async ({ page }) => {
  page.on('console', msg => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

  await page.goto('/');
  await page.waitForTimeout(5000);
  
  const html = await page.evaluate(() => document.body.innerHTML);
  console.log('HTML content length:', html.length);
  console.log('Is MECHA-SANTA visible?', html.includes('MECHA-SANTA'));
  
  const isPlaywright = await page.evaluate(() => (navigator.webdriver || (window as any).isPlaywright));
  console.log('isPlaywright in browser:', isPlaywright);
});
