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
  // Capture browser console logs to help diagnose issues
  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

  // Select character
  console.log(`Selecting character: ${characterName}`);
  const characterButton = page.getByRole('button', { name: new RegExp(characterName, 'i') });
  await characterButton.waitFor({ state: 'visible', timeout: 60000 });
  await characterButton.click({ force: true, timeout: 60000 });

  // Wait for character selection screen to disappear (briefing should appear)
  await characterButton.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {
    console.log('Warning: Character button did not disappear as expected');
  });

  // Wait for briefing animation to complete (6 lines at 600ms + 500ms for button = 4.1s)
  // Add buffer to ensure animation has time to complete
  await page.waitForTimeout(5000);

  // Click COMMENCE OPERATION
  try {
    // Ensure network is idle before waiting for button, as loading might be ongoing
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000); // Allow for any late animations

    console.log('Waiting for commence button...');
    if (!page.isClosed()) {
        try {
            console.log('DEBUG PAGE INFO:');
            console.log('URL:', page.url());
            console.log('Title:', await page.title());

            // Check for game container (root) presence
            const root = page.locator('#root');
            console.log('Root element exists:', await root.count() > 0);

            // Log ALL buttons currently on page
            const buttons = await page.locator('button').allInnerTexts();
            console.log('Visible buttons:', buttons);

            // Log body content preview (first 1000 chars)
            // const content = await page.content();
            // console.log('Page content preview:', content.substring(0, 1000));
        } catch (e) {
            console.log('Error logging debug info:', e);
        }
    }

    // Try primary selector first
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });

    // Fallback selector in case of text content issues
    const fallbackButton = page.locator('button:has-text("COMMENCE")');

    // Fallback using raw selector wait
    const rawSelectorWait = page.waitForSelector('button:has-text("COMMENCE")', { timeout: 120000 }).then(() => page.locator('button:has-text("COMMENCE")'));

    // Wait for either to appear with extended 120s timeout
    const button = await Promise.race([
        commenceButton.waitFor({ state: 'visible', timeout: 120000 }).then(() => commenceButton),
        fallbackButton.waitFor({ state: 'visible', timeout: 120000 }).then(() => fallbackButton),
        rawSelectorWait
    ]);

    // Final check before clicking
    console.log('Button found. Clicking...');
    await button.scrollIntoViewIfNeeded().catch(() => {}); // Try scroll if possible, ignore error if fails
    await button.click({ force: true, timeout: 60000 });
  } catch (error) {
    console.log('Start game failed. Final diagnostics:');
    if (!page.isClosed()) {
        try {
            console.log('Available buttons:', await page.locator('button').allInnerTexts());
            // console.log('Page content:', await page.content());
        } catch (e) {
            console.log('Failed to log debug info:', e);
        }
    }
    throw error;
  }

  // Wait for game phase to start
  await page.waitForTimeout(1000);
}
