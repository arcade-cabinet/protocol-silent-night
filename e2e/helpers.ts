import type { Page, Locator } from '@playwright/test';

/**
 * E2E Test Helpers
 * Utilities for common test interactions with improved reliability
 */

/**
 * Safely click a button with retry logic and scroll handling
 * Addresses timeout issues on mobile viewports
 */
export async function safeClick(locator: Locator, options?: { timeout?: number }): Promise<void> {
  const timeout = options?.timeout || 15000;

  // Ensure element is in viewport
  await locator.scrollIntoViewIfNeeded({ timeout });

  // Small delay to ensure scroll completes and element is stable
  await locator.page().waitForTimeout(500);

  // Click with extended timeout
  await locator.click({ timeout });
}

/**
 * Select a character and start game with improved mobile support
 */
export async function selectCharacterAndStart(
  page: Page,
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE'
): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName) });
  await safeClick(characterButton);

  // Click "COMMENCE OPERATION" on the briefing screen
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await safeClick(commenceButton);
}

/**
 * Initialize page for mobile viewport tests
 */
export async function setupMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Extra time for mobile rendering
}
