/**
 * Common test utilities for E2E tests
 */

import { Page } from '@playwright/test';

/**
 * Wait for the loading screen to disappear
 * The loading screen shows "INITIALIZING SYSTEMS" and blocks the main UI
 */
export async function waitForLoadingScreen(page: Page, timeout = 15000) {
  // Wait for the loading screen to appear first (it might not be there immediately)
  try {
    await page.waitForSelector('text=INITIALIZING SYSTEMS', {
      timeout: 2000,
      state: 'visible'
    });
  } catch {
    // Loading screen might have already disappeared, that's fine
    return;
  }

  // Now wait for it to disappear - use detached state to handle when element is removed from DOM
  try {
    await page.waitForSelector('text=INITIALIZING SYSTEMS', {
      timeout,
      state: 'detached'
    });
  } catch {
    // Fallback: check if it's actually gone by trying to find it
    const isStillVisible = await page.locator('text=INITIALIZING SYSTEMS').isVisible().catch(() => false);
    if (isStillVisible) {
      throw new Error('Loading screen did not disappear within timeout');
    }
  }

  // Give a small buffer for React to re-render
  await page.waitForTimeout(200);
}
