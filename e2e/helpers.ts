import { Page, expect } from '@playwright/test';

/**
 * Waits for the game to be ready (loading screen to finish).
 */
export async function waitForGameReady(page: Page) {
  // Wait for loading screen to disappear (2s minimum + buffer)
  await page.waitForTimeout(2500);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

/**
 * Selects a character and starts the game, handling the mission briefing sequence.
 */
export async function startGame(page: Page, characterName: string) {
  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName, 'i') });
  await characterButton.waitFor({ state: 'visible', timeout: 30000 });
  await characterButton.click({ force: true, timeout: 30000 });

  // Wait for briefing animation to complete (5-6 lines at 600ms + 500ms for button)
  // We explicitly wait here to ensure the animation logic has time to run
  await page.waitForTimeout(5000);

  // Click COMMENCE OPERATION
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 30000 });
  await commenceButton.click({ timeout: 30000 });

  // Wait for game phase to start
  await page.waitForTimeout(1000);
}
