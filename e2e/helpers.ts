import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper to safely click an element with proper scrolling and waits.
 * Useful for mobile viewports where elements might be off-screen.
 */
export async function safeClick(locator: Locator, options: { timeout?: number } = {}): Promise<void> {
  const timeout = options.timeout || 45000;

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

  if (locator.page().isClosed()) {
    throw new Error('Page is already closed');
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
  // Initial animation wait - reduced
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');

  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName) });
  await characterButton.waitFor({ state: 'visible', timeout: 30000 });
  await safeClick(characterButton);

  // Wait for briefing to appear - reduced
  try {
    // Wait for briefing screen selector instead of fixed wait
    await page.waitForSelector('text=MISSION BRIEFING', { timeout: 10000 });
  } catch {
    await page.waitForTimeout(800);
  }

  // Click commence operation
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 30000 });
  await safeClick(commenceButton);

  // Wait for game to initialize - replaced with selector wait
  try {
    // Wait for game HUD or canvas instead of fixed wait
    await page.waitForSelector('canvas', { timeout: 15000 });
  } catch {
    await page.waitForTimeout(2000);
  }
}

/**
 * Sets up a standard mobile viewport for testing.
 */
export async function setupMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
}
