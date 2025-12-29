import { test, expect } from '@playwright/test';

test('capture console logs', async ({ page }) => {
  page.on('console', msg => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
  page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

  await page.goto('/');
  await page.waitForTimeout(5000);
  
  console.log('Attempting to click MECHA-SANTA...');
  const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
  await expect(santaButton).toBeVisible();
  await santaButton.click({ timeout: 5000 }).catch(e => console.log(`Click failed: ${e.message}`));
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'debug-screenshot.png' });
});
