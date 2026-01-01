import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper to safely click an element with proper scrolling and waits.
 * Useful for mobile viewports where elements might be off-screen.
 */
export async function safeClick(locator: Locator, options: { timeout?: number } = {}): Promise<void> {
  const timeout = options.timeout || 45000; // Increased from 30s to 45s for CI stability

  // Check if page is closed before attempting interaction
  if (locator.page().isClosed()) {
    throw new Error('Page is already closed');
  }

  try {
    // Ensure element is visible and clickable before attempting
    await locator.waitFor({ state: 'visible', timeout });
    await locator.scrollIntoViewIfNeeded({ timeout });
  } catch (e) {
    // Check if page closed during wait/scroll
    if (locator.page().isClosed()) {
      throw new Error('Page is already closed');
    }
    // Fallback: try clicking without scrolling if scroll fails
    console.warn('Scroll/Wait failed, attempting direct click');
  }

  // Stabilization wait after scroll - check page not closed first
  if (!locator.page().isClosed()) {
    await locator.page().waitForTimeout(1000); // Increased from 500ms to 1000ms
    await locator.click({ timeout });
  } else {
    throw new Error('Page is already closed');
  }
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
