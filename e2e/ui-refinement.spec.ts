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
  // Skip these tests until baseline snapshots are generated for Linux platform
  // These tests pass locally on macOS but need Linux baselines for CI
  test.skip('should render character cards with correct heights', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check all character cards using role-based selector
    const cards = page.getByRole('button', { name: /MECHA-SANTA|CYBER-ELF|THE BUMBLE/ });
    await expect(cards).toHaveCount(3);

    // Take a snapshot of the entire start screen
    await expect(page).toHaveScreenshot('character-cards-container.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test.skip('should render character stats consistently', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check Santa card stats specifically using role-based selector
    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await expect(santaCard).toHaveScreenshot('santa-card-stats.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});
