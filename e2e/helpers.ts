import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper to safely click an element with proper scrolling and waits.
 * Useful for mobile viewports where elements might be off-screen.
 */
export async function safeClick(locator: Locator, options: { timeout?: number } = {}): Promise<void> {
  const timeout = options.timeout || 60000;

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

  // Stabilization wait after scroll
  if (!locator.page().isClosed()) {
    await locator.page().waitForTimeout(1000);
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
  await page.waitForTimeout(2000); // Wait for initial animations

  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName) });
  await characterButton.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1000); // Wait for element stability
  await safeClick(characterButton, { timeout: 60000 });

  // Wait for briefing screen
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Click commence operation with increased robustness
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1000); // Wait for element stability
  await safeClick(commenceButton, { timeout: 60000 });

  // Wait for game to initialize
  await page.waitForTimeout(3000);
}

/**
 * Sets up a standard mobile viewport for testing.
 */
export async function setupMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
}
