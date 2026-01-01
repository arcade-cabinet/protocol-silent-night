/**
 * Common test utilities for E2E tests
 */

import { Page } from '@playwright/test';

/**
 * Wait for the loading screen to disappear
 * The loading screen shows "INITIALIZING SYSTEMS" and blocks the main UI
 */
export async function waitForLoadingScreen(page: Page, timeout = 10000) {
  // Wait for the loading screen to appear first (it might not be there immediately)
  try {
    await page.waitForSelector('text=INITIALIZING SYSTEMS', {
      timeout: 2000,
      state: 'visible'
    });
  } catch {
    // Loading screen might have already disappeared, that's fine
  }

  // Now wait for it to disappear
  await page.waitForSelector('text=INITIALIZING SYSTEMS', {
    timeout,
    state: 'hidden'
  });

  // Give a small buffer for React to re-render
  await page.waitForTimeout(100);
}
