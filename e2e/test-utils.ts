import { Page } from '@playwright/test';

/**
 * Test utilities for E2E tests
 */

/**
 * Disables CSS animations and transitions to ensure elements become stable
 * for screenshots and interactions
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
}

/**
 * Waits for page to be fully loaded and stable
 */
export async function waitForStablePage(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * Selects a character and waits for briefing screen
 */
export async function selectCharacter(
  page: Page,
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE'
): Promise<void> {
  // Wait for character button to be visible
  const button = page.getByRole('button', { name: new RegExp(characterName) });
  await button.waitFor({ state: 'visible', timeout: 15000 });

  // Small wait to ensure button is fully interactive
  await page.waitForTimeout(500);

  // Click the character button
  await button.click({ force: true });

  // Wait for briefing screen to appear
  await page.getByText('MISSION BRIEFING').waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Clicks the commence operation button and waits for game to start
 */
export async function commenceOperation(page: Page): Promise<void> {
  // Wait for briefing animations (100ms per line in test mode * ~6 lines + 50ms for button = ~650ms)
  // Adding buffer for rendering and stability
  await page.waitForTimeout(2000);

  // Wait for button to be visible with increased timeout for CI
  const button = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await button.waitFor({ state: 'visible', timeout: 30000 });

  // Extra wait to ensure button is fully interactive
  await page.waitForTimeout(500);

  // Click the button
  await button.click({ force: true });

  // Wait for game to initialize
  await page.waitForTimeout(3000);
}

/**
 * Complete flow to start a game with a character
 */
export async function startGame(
  page: Page,
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE'
): Promise<void> {
  await selectCharacter(page, characterName);
  await commenceOperation(page);
}

/**
 * Resolves any pending level-up state by selecting the first available upgrade
 * Retries multiple times to handle timing issues
 */
export async function resolveLevelUp(page: Page): Promise<void> {
  // Wait a bit for any state transitions to settle
  await page.waitForTimeout(500);

  // Try up to 5 times with delays to handle timing issues
  for (let attempt = 0; attempt < 5; attempt++) {
    const state = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store?.getState?.()?.state;
    });

    if (state === 'LEVEL_UP') {
      // Get available upgrades and select the first one
      const upgradeId = await page.evaluate(() => {
        const store = (window as any).useGameStore;
        const choices = store?.getState?.()?.runProgress?.upgradeChoices || [];
        return choices[0]?.id;
      });

      if (upgradeId) {
        await page.evaluate((id) => {
          const store = (window as any).useGameStore;
          store?.getState?.()?.selectLevelUpgrade?.(id);
        }, upgradeId);
        // Wait for state transition
        await page.waitForTimeout(800);

        // Verify the state changed
        const newState = await page.evaluate(() => {
          const store = (window as any).useGameStore;
          return store?.getState?.()?.state;
        });

        // If still in LEVEL_UP, retry
        if (newState === 'LEVEL_UP') {
          await page.waitForTimeout(500);
          continue;
        } else {
          // Successfully resolved
          return;
        }
      }
    } else {
      // Not in LEVEL_UP state, nothing to resolve
      return;
    }
  }
}
