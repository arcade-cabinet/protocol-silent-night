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

  // Wait for briefing animation to complete (5-6 lines at 600ms + 500ms for button)
  // We explicitly wait here to ensure the animation logic has time to run
  await page.waitForTimeout(5000);

  // Click COMMENCE OPERATION
  try {
    // Ensure network is idle before waiting for button, as loading might be ongoing
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    console.log('Waiting for commence button...');
    if (!page.isClosed()) {
        console.log('Current page content preview:', (await page.content()).substring(0, 500));
    }

    // Try primary selector first
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });

    // Fallback selector in case of text content issues
    const fallbackButton = page.locator('button:has-text("COMMENCE")');

    // Wait for either to appear with extended 120s timeout
    const button = await Promise.race([
        commenceButton.waitFor({ state: 'visible', timeout: 120000 }).then(() => commenceButton),
        fallbackButton.waitFor({ state: 'visible', timeout: 120000 }).then(() => fallbackButton)
    ]);

    await button.click({ timeout: 60000 });
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
