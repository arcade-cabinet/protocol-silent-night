import { Page, Locator } from '@playwright/test';

/**
 * Disables all CSS animations and transitions to ensure stable element interactions.
 */
export async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation: none !important;
        transition: none !important;
      }
    `
  });
}

/**
 * Standard page setup for E2E tests:
 * - Navigates to home
 * - Disables animations
 * - Waits for network stability
 */
export async function setupPage(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await disableAnimations(page);
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.waitForTimeout(500); // Initial stability buffer - reduced for faster tests
}

/**
 * Robust click helper that handles stability issues in CI environments.
 * Follows the pattern: Wait for visibility -> Stability buffer -> Force Click -> State buffer
 */
export async function safeClick(page: Page, locator: Locator, options: { timeout?: number } = {}) {
  const timeout = options.timeout || 15000;

  await locator.waitFor({ state: 'visible', timeout });
  await page.waitForTimeout(300); // Stability buffer - reduced for faster tests
  await locator.click({ force: true, timeout });
  await page.waitForTimeout(500); // State transition buffer - reduced for faster tests
}
