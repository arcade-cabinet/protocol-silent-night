import { test, expect } from '@playwright/test';

/**
 * UI Refinement Visual Regression Tests
 *
 * Tests specific UI components that have been refined or adjusted
 * to ensure visual consistency.
 */

const VISUAL_THRESHOLD = 0.2;
const SCREENSHOT_TIMEOUT = 60000;

test.describe('UI Refinement - Character Cards', () => {
  test('should render character cards with correct heights', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

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
    await page.waitForTimeout(2000);

    // Check Santa card stats specifically
    const santaCard = page.locator('.classCard').first();
    await expect(santaCard).toHaveScreenshot('santa-card-stats.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});
