/**
 * Common test utilities for E2E tests
 */

import { Page, Locator } from '@playwright/test';

/**
 * Wait for the loading screen to disappear
 * The loading screen shows "INITIALIZING SYSTEMS" and blocks the main UI
 */
export async function waitForLoadingScreen(page: Page, timeout = 20000) {
  console.log('[waitForLoadingScreen] Starting...');

  // Wait for the loading screen to appear first (it might not be there immediately)
  try {
    console.log('[waitForLoadingScreen] Waiting for loading screen to appear...');
    await page.waitForSelector('text=INITIALIZING SYSTEMS', {
      timeout: 3000,
      state: 'visible'
    });
    console.log('[waitForLoadingScreen] Loading screen appeared');
  } catch {
    console.log('[waitForLoadingScreen] Loading screen did not appear - checking if already gone...');
    // Loading screen might have already disappeared, check if main UI is ready
    const h1Visible = await page.locator('h1').isVisible().catch(() => false);
    if (h1Visible) {
      console.log('[waitForLoadingScreen] Main UI already visible, skipping wait');
      return;
    }
  }

  // Now wait for it to disappear - use detached state to handle when element is removed from DOM
  try {
    console.log('[waitForLoadingScreen] Waiting for loading screen to disappear...');
    await page.waitForSelector('text=INITIALIZING SYSTEMS', {
      timeout,
      state: 'detached'
    });
    console.log('[waitForLoadingScreen] Loading screen disappeared');
  } catch (e) {
    console.log('[waitForLoadingScreen] Detached wait timed out, checking visibility...');
    // Fallback: check if it's actually gone by trying to find it
    const isStillVisible = await page.locator('text=INITIALIZING SYSTEMS').isVisible().catch(() => false);
    if (isStillVisible) {
      console.error('[waitForLoadingScreen] ERROR: Loading screen still visible!');
      throw new Error('Loading screen did not disappear within timeout');
    }
    console.log('[waitForLoadingScreen] Loading screen not visible, continuing...');
  }

  // Give a buffer for React to re-render and ensure UI is fully interactive
  await page.waitForTimeout(1000);
  console.log('[waitForLoadingScreen] Waited 1000ms for React re-render');

  // Additional check: ensure the main UI is visible and ready
  try {
    console.log('[waitForLoadingScreen] Checking for main UI elements...');
    await page.waitForSelector('h1, canvas', { timeout: 5000, state: 'visible' });
    console.log('[waitForLoadingScreen] Main UI elements detected!');
  } catch (e) {
    // If neither h1 nor canvas is visible, something went wrong
    const pageContent = await page.content();
    console.error('[waitForLoadingScreen] ERROR: Main UI elements not detected!');
    console.error('[waitForLoadingScreen] Page content length:', pageContent.length);
    // Log first 500 chars of body
    const bodyMatch = pageContent.match(/<body[^>]*>([\s\S]{0,500})/);
    if (bodyMatch) {
      console.error('[waitForLoadingScreen] Body preview:', bodyMatch[1]);
    }
    throw new Error('Main UI elements not detected after loading screen');
  }

  console.log('[waitForLoadingScreen] Complete!');
}

/**
 * Safely click a button with proper wait and visibility checks
 * Handles buttons that might be covered by loading screens or animations
 */
export async function safeClick(locator: Locator, options?: { timeout?: number }) {
  const timeout = options?.timeout || 15000;

  // Wait for the element to be visible and ready
  await locator.waitFor({ state: 'visible', timeout });

  // Ensure it's actionable (not covered by another element)
  await locator.click({ timeout });
}
