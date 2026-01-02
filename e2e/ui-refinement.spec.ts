import { test, expect, type Page } from '@playwright/test';

/**
 * UI Refinement Visual Regression Tests
 *
 * Tests specific UI components that have been refined or adjusted
 * to ensure visual consistency.
 */

const VISUAL_THRESHOLD = 0.2;
const SCREENSHOT_TIMEOUT = 30000;

/**
 * Helper function to wait for loading screen to disappear and ensure game is ready
 */
async function waitForGameReady(page: Page) {
  // Wait for loading screen to disappear (it has a minimum 2s duration)
  await page.waitForTimeout(2500);

  // Wait for networkidle to ensure all resources are loaded
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
    // Ignore timeout - some animations might keep network busy
  });
}

/**
 * Helper function to start game by selecting character and clicking commence
 */
async function startGame(page: Page, characterName: string) {
  // Select character
  const characterButton = page.getByRole('button', { name: new RegExp(characterName, 'i') });
  await characterButton.waitFor({ state: 'visible', timeout: 10000 });
  await characterButton.click({ force: true, timeout: 10000 });

  // Wait for briefing animation to complete
  // Briefing shows multiple lines at 600ms intervals + 500ms for button appearance
  // Typical briefing has 5-6 lines, so ~4000ms total
  await page.waitForTimeout(5000);

  // Click "COMMENCE OPERATION" button
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 10000 });
  await commenceButton.click({ timeout: 10000 });

  // Wait for game to start
  await page.waitForTimeout(1000);
}

test.describe('UI Refinement - Character Cards', () => {
  test('should render character cards with correct heights', async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);

    // Check all character cards
    const cards = page.locator('.classCard');
    await expect(cards).toHaveCount(3);

    // Take a snapshot of just the cards container
    const container = page.locator('.classContainer');
    await expect(container).toHaveScreenshot('character-cards-container.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render character stats consistently', async ({ page }) => {
    await page.goto('/');
    await waitForGameReady(page);

    // Check Santa card stats specifically
    const santaCard = page.locator('.classCard').first();
    await expect(santaCard).toHaveScreenshot('santa-card-stats.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});
