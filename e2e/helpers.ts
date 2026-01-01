import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper to safely click an element with proper scrolling and waits.
 * Useful for mobile viewports where elements might be off-screen.
 */
export async function safeClick(locator: Locator, options: { timeout?: number } = {}): Promise<void> {
  const timeout = options.timeout || 30000;

  try {
    await locator.scrollIntoViewIfNeeded({ timeout });
  } catch (e) {
    // Fallback: try clicking without scrolling if scroll fails
    console.warn('Scroll into view failed, attempting direct click');
  }

  // Stabilization wait after scroll - with error handling for closed pages
  try {
    await locator.page().waitForTimeout(500);
  } catch (e) {
    // If page is closed, fail fast
    throw new Error(`Page was closed during safeClick: ${e}`);
  }

  await locator.click({ timeout });
}

/**
 * Standardized flow to select a character and start the game.
 * Handles the "COMMENCE OPERATION" click sequence.
 */
export async function selectCharacterAndStart(
  page: Page,
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE'
): Promise<void> {
  await page.waitForLoadState('networkidle');

  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName) });
  await safeClick(characterButton);

  // Click commence operation
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await safeClick(commenceButton);

  // Wait for game to initialize
  await page.waitForTimeout(2000);
}

/**
 * Sets up a standard mobile viewport for testing.
 */
export async function setupMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
}
