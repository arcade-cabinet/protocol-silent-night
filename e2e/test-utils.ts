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
  await button.waitFor({ state: 'visible', timeout: 30000 });

  // Wait to ensure button is fully interactive and layout is stable
  await page.waitForTimeout(1000);

  // Try clicking with retries
  let clicked = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await button.click({ timeout: 10000, force: true });
      clicked = true;
      break;
    } catch (error) {
      console.error(`Click attempt ${attempt + 1} failed:`, error);
      if (attempt < 2) {
        await page.waitForTimeout(500);
      } else {
        throw error;
      }
    }
  }

  if (!clicked) {
    throw new Error(`Failed to click character button ${characterName}`);
  }

  // Wait for briefing screen to appear
  await page.getByText('MISSION BRIEFING').waitFor({ state: 'visible', timeout: 20000 });
}

/**
 * Clicks the commence operation button and waits for game to start
 */
export async function commenceOperation(page: Page): Promise<void> {
  // Wait for briefing animations (100ms per line in test mode * ~6 lines + 50ms for button = ~650ms)
  // Adding buffer for rendering and stability - increased for slow CI
  await page.waitForTimeout(3000);

  // Wait for button to be visible with increased timeout for CI
  const button = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await button.waitFor({ state: 'visible', timeout: 45000 });

  // Extra wait to ensure button is fully interactive
  await page.waitForTimeout(1000);

  // Click with retries
  let clicked = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await button.click({ timeout: 10000, force: true });
      clicked = true;
      break;
    } catch (error) {
      console.error(`Commence click attempt ${attempt + 1} failed:`, error);
      if (attempt < 2) {
        await page.waitForTimeout(500);
      } else {
        throw error;
      }
    }
  }

  if (!clicked) {
    throw new Error('Failed to click COMMENCE OPERATION button');
  }

  // Wait for game to initialize - increased for WebGL setup on CI
  await page.waitForTimeout(5000);
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
  // Check if page is closed before starting
  if (page.isClosed()) {
    console.error('Page is closed, cannot resolve level up');
    return;
  }

  // Wait a bit for any state transitions to settle
  try {
    await page.waitForTimeout(500);
  } catch (error) {
    if (page.isClosed()) {
      console.error('Page closed during initial wait');
      return;
    }
    throw error;
  }

  // Try up to 5 times with delays to handle timing issues
  for (let attempt = 0; attempt < 5; attempt++) {
    // Check if page is still open
    if (page.isClosed()) {
      console.error('Page closed during level up resolution');
      return;
    }

    try {
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

          // Wait for state transition with page close check
          try {
            await page.waitForTimeout(800);
          } catch (error) {
            if (page.isClosed()) {
              console.error('Page closed during state transition wait');
              return;
            }
            throw error;
          }

          // Verify the state changed
          const newState = await page.evaluate(() => {
            const store = (window as any).useGameStore;
            return store?.getState?.()?.state;
          });

          // If still in LEVEL_UP, retry
          if (newState === 'LEVEL_UP') {
            try {
              await page.waitForTimeout(500);
            } catch (error) {
              if (page.isClosed()) {
                console.error('Page closed during retry wait');
                return;
              }
              throw error;
            }
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
    } catch (error) {
      if (page.isClosed()) {
        console.error('Page closed during level up evaluation');
        return;
      }
      // Log error but continue trying
      console.error(`Level up resolution attempt ${attempt + 1} failed:`, error);
    }
  }
}
