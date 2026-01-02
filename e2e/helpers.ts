import { Page, expect } from '@playwright/test';

/**
 * Waits for the game to be ready (loading screen to finish).
 */
export async function waitForGameReady(page: Page) {
  // Wait for loading screen to disappear (2s minimum + buffer)
  await page.waitForTimeout(2500);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
}

/**
 * Selects a character and starts the game, handling the mission briefing sequence.
 */
export async function startGame(page: Page, characterName: string) {
  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName, 'i') });
  await characterButton.waitFor({ state: 'visible', timeout: 60000 });
  await characterButton.click({ force: true, timeout: 60000 });

  // Wait for COMMENCE OPERATION button to appear
  // The button appears after briefing animation completes (5-6 lines at 600ms + 500ms delay)
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  try {
    await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    // Ensure the button is stable and clickable
    await page.waitForTimeout(500);
    await commenceButton.click({ timeout: 60000 });
  } catch (error) {
    if (!page.isClosed()) {
        try {
            console.log('Available buttons:', await page.locator('button').allInnerTexts());
            console.log('Page content:', await page.content());
        } catch (e) {
            console.log('Failed to log debug info:', e);
        }
    }
    throw error;
  }

  // Wait for game phase to start
  await page.waitForTimeout(1000);
}
