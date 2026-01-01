import { Page, Locator, expect } from '@playwright/test';

/**
 * Helper to safely click an element with proper scrolling and waits.
 * Useful for mobile viewports where elements might be off-screen.
 */
export async function safeClick(locator: Locator, options: { timeout?: number } = {}): Promise<void> {
  const timeout = options.timeout || 30000;

  // Wait for the element to be visible first
  await locator.waitFor({ state: 'visible', timeout });

  // Try to scroll into view, but don't fail if animations prevent stability
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
  } catch (e) {
    // If scroll fails due to instability, try evaluating scroll manually
    await locator.evaluate((el) => {
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
  }

  // Stabilization wait after scroll
  await locator.page().waitForTimeout(1000);

  // Click with force option to bypass actionability checks if needed
  await locator.click({ timeout, force: false });
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

  // Additional wait for initial render to stabilize
  await page.waitForTimeout(500);

  // Select character - wait for it to be visible first
  const characterButton = page.getByRole('button', { name: new RegExp(characterName) });
  await characterButton.waitFor({ state: 'visible', timeout: 15000 });
  await safeClick(characterButton);

  // Wait for mission briefing to appear
  await page.waitForTimeout(1000);

  // Click commence operation
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
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
