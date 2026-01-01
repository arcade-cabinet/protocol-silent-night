import { test, expect, type Page } from '@playwright/test';

/**
 * Visual Regression Tests for Protocol: Silent Night
 *
 * Uses Playwright's screenshot comparison to validate visual rendering
 * of 3D game components, characters, and gameplay scenarios.
 *
 * Run with: PLAYWRIGHT_MCP=true pnpm test:e2e
 */

const VISUAL_THRESHOLD = 0.2; // 20% diff tolerance for WebGL rendering variations

// Increase timeout for all tests in this file
test.setTimeout(60000);

/**
 * Wait for the game loading screen to disappear and ensure the page is ready.
 * Critical for CI environments using SwiftShader software rendering, which is
 * significantly slower than hardware-accelerated rendering.
 *
 * @param page - Playwright page instance
 * @param additionalWait - Optional milliseconds to wait after loading screen disappears
 */
async function waitForGameReady(page: Page, additionalWait = 0): Promise<void> {
  const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
  if (await loadingScreen.isVisible()) {
    await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
  }
  if (additionalWait > 0) {
    await page.waitForTimeout(additionalWait);
  }
}

/**
 * Navigate to the application and wait for it to be ready.
 *
 * @param page - Playwright page instance
 * @param additionalWait - Optional milliseconds to wait after page load
 */
async function gotoAndWaitForReady(page: Page, additionalWait = 0): Promise<void> {
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForGameReady(page, additionalWait);
}

/**
 * Select a character and wait for the button to be ready.
 *
 * @param page - Playwright page instance
 * @param characterName - Name of the character to select
 * @param useForce - Whether to use force click (bypasses actionability checks)
 */
async function selectCharacter(
  page: Page,
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE',
  useForce = false
): Promise<void> {
  const button = page.getByRole('button', { name: new RegExp(characterName) });
  await button.waitFor({ state: 'visible', timeout: 15000 });
  await button.click({ force: useForce, timeout: 15000 });
}

/**
 * Click the COMMENCE OPERATION button on the mission briefing screen.
 *
 * @param page - Playwright page instance
 */
async function commenceOperation(page: Page): Promise<void> {
  const button = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await button.waitFor({ state: 'visible', timeout: 15000 });
  await button.click({ timeout: 15000 });
}

test.describe('Visual Regression - Character Selection', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page, 2000);
  });

  test('should match character selection screen', async ({ page }) => {
    // Wait for fonts and styles to load
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);

    // Take snapshot of character selection
    await expect(page).toHaveScreenshot('character-selection.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      animations: 'disabled',
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaCard.waitFor({ state: 'visible', timeout: 10000 });
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    const elfCard = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfCard.waitFor({ state: 'visible', timeout: 10000 });
    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    const bumbleCard = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleCard.waitFor({ state: 'visible', timeout: 10000 });
    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - Game Start', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render Santa gameplay correctly', async ({ page }) => {
    await selectCharacter(page, 'MECHA-SANTA');
    await commenceOperation(page);
    await page.waitForTimeout(10000);

    await expect(page).toHaveScreenshot('santa-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf gameplay correctly', async ({ page }) => {
    await selectCharacter(page, 'CYBER-ELF', true);
    await commenceOperation(page);
    await page.waitForTimeout(10000);

    await expect(page).toHaveScreenshot('elf-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble gameplay correctly', async ({ page }) => {
    await selectCharacter(page, 'BUMBLE', true);
    await commenceOperation(page);
    await page.waitForTimeout(10000);

    await expect(page).toHaveScreenshot('bumble-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - HUD Elements', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render HUD correctly during gameplay', async ({ page }) => {
    await selectCharacter(page, 'MECHA-SANTA', true);
    await page.waitForTimeout(8000);

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    await selectCharacter(page, 'MECHA-SANTA', true);
    await page.waitForTimeout(8000);

    // Move and fire to generate some score
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('hud-with-activity.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - Game Movement', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render character movement correctly', async ({ page }) => {
    await selectCharacter(page, 'MECHA-SANTA', true);
    await page.waitForTimeout(8000);

    // Move character
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    await expect(page).toHaveScreenshot('character-moved.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render firing animation correctly', async ({ page }) => {
    await selectCharacter(page, 'MECHA-SANTA', true);
    await page.waitForTimeout(8000);

    // Fire weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('firing-animation.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - Combat Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render combat with enemies', async ({ page }) => {
    await selectCharacter(page, 'MECHA-SANTA', true);
    await page.waitForTimeout(8000);

    // Wait for enemies to spawn and engage
    await page.keyboard.down('Space');
    await page.waitForTimeout(5000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('combat-scenario.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render player taking damage', async ({ page }) => {
    await selectCharacter(page, 'CYBER-ELF', true);
    await page.waitForTimeout(8000);

    // Wait for potential damage from enemies
    await page.waitForTimeout(8000);

    await expect(page).toHaveScreenshot('player-damaged.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - End Game States', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render game over screen', async ({ page }) => {
    await selectCharacter(page, 'MECHA-SANTA', true);
    await page.waitForTimeout(8000);

    // Trigger game over by evaluating state (for testing purposes)
    await page.evaluate(() => {
      type GameWindow = Window & {
        useGameStore?: {
          getState(): {
            damagePlayer: (amount: number) => void;
          };
        };
      };

      const gameWindow = window as GameWindow;
      gameWindow.useGameStore?.getState().damagePlayer(300);
    });

    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('game-over-screen.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await waitForGameReady(page);
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForGameReady(page);

    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => document.fonts.ready);

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      animations: 'disabled',
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForGameReady(page);

    await selectCharacter(page, 'MECHA-SANTA', true);

    // Wait for game to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await waitForGameReady(page);

    await selectCharacter(page, 'MECHA-SANTA', true);
    await page.waitForTimeout(10000);

    // Touch controls should be visible
    const fireButton = page.getByRole('button', { name: /FIRE/ });
    await fireButton.waitFor({ state: 'visible', timeout: 15000 });
    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});
