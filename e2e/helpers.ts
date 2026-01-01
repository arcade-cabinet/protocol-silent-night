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
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE',
  options: { waitForStableGame?: boolean } = {}
): Promise<void> {
  // Check if page is still open
  if (page.isClosed()) {
    throw new Error('Page is already closed before starting character selection');
  }

  // Initial animation wait - reduced
  await page.waitForTimeout(1200);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
    // Continue even if networkidle times out
  });

  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName) });
  await characterButton.waitFor({ state: 'visible', timeout: 25000 });
  await safeClick(characterButton, { timeout: 25000 });

  // Wait for briefing to appear - reduced
  try {
    // Wait for briefing screen selector instead of fixed wait
    await page.waitForSelector('text=MISSION BRIEFING', { timeout: 8000 });
  } catch {
    await page.waitForTimeout(600);
  }

  // Click commence operation
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 25000 });
  await safeClick(commenceButton, { timeout: 25000 });

  // Wait for game to initialize - replaced with selector wait
  try {
    // Wait for game HUD or canvas instead of fixed wait
    await page.waitForSelector('canvas', { timeout: 12000 });

    // If requested, wait for game state to stabilize (important for HP checks)
    if (options.waitForStableGame) {
      await page.waitForTimeout(800);
      // Wait for game state to be PHASE_1 and stable
      await waitForGamePhase(page, 'PHASE_1', 8000);
    }
  } catch (error) {
    // Fallback to fixed wait if selector fails
    if (!page.isClosed()) {
      await page.waitForTimeout(1500);
    } else {
      throw new Error('Page closed during game initialization');
    }
  }
}

/**
 * Wait for game to reach a specific phase with retry logic
 */
export async function waitForGamePhase(
  page: Page,
  expectedPhase: string,
  timeout = 10000
): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const gameState = await page.evaluate(() => {
        const store = (window as any).useGameStore;
        if (!store) return null;
        const state = store.getState();
        return {
          state: state.state,
          playerHp: state.playerHp,
          playerMaxHp: state.playerMaxHp,
        };
      });

      if (gameState?.state === expectedPhase && gameState?.playerHp === gameState?.playerMaxHp) {
        return true;
      }
    } catch {
      // Continue retrying
    }
    await page.waitForTimeout(100);
  }
  return false;
}

/**
 * Sets up a standard mobile viewport for testing.
 */
export async function setupMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
}
