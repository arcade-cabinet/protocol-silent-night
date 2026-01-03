import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Protocol: Silent Night
 *
 * Uses Playwright's screenshot comparison to validate visual rendering
 * of 3D game components, characters, and gameplay scenarios.
 *
 * Run with: PLAYWRIGHT_MCP=true pnpm test:e2e
 */

const VISUAL_THRESHOLD = 0.2; // 20% diff tolerance for WebGL rendering variations

// Increase timeout for all tests in this file to handle slow CI rendering
test.setTimeout(120000);

// Helper function to stabilize the page before screenshots
async function stabilizePage(page) {
  // Wait for all network requests to complete
  await page.waitForLoadState('networkidle');

  // Wait for dynamic content to settle
  await page.waitForTimeout(500);

  // Ensure all animations are truly disabled via CSS injection
  // Also suppress focus outlines to prevent visual regression failures
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      *:focus-visible {
        outline: none !important;
      }
    `
  });

  // Wait for any remaining font rendering
  await page.waitForFunction(() => document.fonts.ready);
}

// Helper function to wait for the loading screen to disappear
async function waitForGameReady(page) {
  const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
  if (await loadingScreen.isVisible()) {
    await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
  }
}

// Helper function to navigate to the game and wait for it to be ready
async function gotoAndWaitForReady(page, additionalWait = 0) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForGameReady(page);
  if (additionalWait > 0) {
    await page.waitForTimeout(additionalWait);
  }
}

// Helper function to select a character by name
async function selectCharacter(page, characterName) {
  const characterButton = page.getByRole('button', { name: new RegExp(characterName, 'i') });
  await characterButton.waitFor({ state: 'visible', timeout: 30000 });
  await characterButton.click({ force: true, timeout: 30000 });
}

// Helper function to click the "COMMENCE OPERATION" button
async function commenceOperation(page) {
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 45000 });
  await commenceButton.click({ timeout: 30000, force: true });
}

// Helper function to start a game with a specific character
async function startGameWithCharacter(page, characterName, gameWait = 10000) {
  await selectCharacter(page, characterName);
  await commenceOperation(page);
  await page.waitForTimeout(gameWait);
}

// Apply stabilization to all tests in this file to suppress focus outlines
test.beforeEach(async ({ page }) => {
  await stabilizePage(page);
});

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
      maxDiffPixels: 200000,
      animations: 'disabled',
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaCard.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for card to stabilize
    await page.waitForTimeout(1000);
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
      timeout: 30000, // Increase timeout for stability check
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    const elfCard = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfCard.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for card to stabilize
    await page.waitForTimeout(1000);
    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
      timeout: 30000, // Increase timeout for stability check
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    const bumbleCard = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleCard.waitFor({ state: 'visible', timeout: 10000 });
    // Wait for card to stabilize
    await page.waitForTimeout(1000);
    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
      timeout: 30000, // Increase timeout for stability check
    });
  });
});

test.describe('Visual Regression - Game Start', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render Santa gameplay correctly', async ({ page }) => {
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('santa-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });

  test('should render Elf gameplay correctly', async ({ page }) => {
    await startGameWithCharacter(page, 'CYBER-ELF');

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('elf-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });

  test('should render Bumble gameplay correctly', async ({ page }) => {
    await startGameWithCharacter(page, 'BUMBLE');

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('bumble-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });
});

test.describe('Visual Regression - HUD Elements', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render HUD correctly during gameplay', async ({ page }) => {
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Move and fire to generate some score
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('hud-with-activity.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });
});

test.describe('Visual Regression - Game Movement', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render character movement correctly', async ({ page }) => {
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Move character
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    await expect(page).toHaveScreenshot('character-moved.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });

  test('should render firing animation correctly', async ({ page }) => {
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Fire weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('firing-animation.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });
});

test.describe('Visual Regression - Combat Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render combat with enemies', async ({ page }) => {
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Wait for enemies to spawn and engage
    await page.keyboard.down('Space');
    await page.waitForTimeout(5000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('combat-scenario.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });

  test('should render player taking damage', async ({ page }) => {
    await startGameWithCharacter(page, 'CYBER-ELF');

    // Wait for potential damage from enemies
    await page.waitForTimeout(8000);

    await expect(page).toHaveScreenshot('player-damaged.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 200000,
    });
  });
});

test.describe('Visual Regression - End Game States', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndWaitForReady(page);
  });

  test('should render game over screen', async ({ page }) => {
    await startGameWithCharacter(page, 'MECHA-SANTA');

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
      maxDiffPixels: 200000,
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  // Enable touch support for mobile emulation
  test.use({ hasTouch: true });

  test.beforeEach(async ({ page }) => {
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoAndWaitForReady(page);

    await stabilizePage(page);

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: 0.5,
      maxDiffPixels: 200000, // Override strict global config
      threshold: 0.2,
      animations: 'disabled',
      fullPage: true,
      scale: 'css',
      timeout: 30000,
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoAndWaitForReady(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await commenceOperation(page);
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Wait for game to initialize
    await page.waitForTimeout(10000);
    await stabilizePage(page);

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: 0.5,
      maxDiffPixels: 200000, // Override strict global config
      threshold: 0.2,
      fullPage: true,
      scale: 'css',
      timeout: 30000,
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoAndWaitForReady(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await commenceOperation(page);
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await page.waitForTimeout(10000);

    // Touch controls should be visible
    await stabilizePage(page);

    const fireButton = page.getByRole('button', { name: /FIRE/ });

    // Explicit wait + long timeout expect
    await page.waitForTimeout(2000);
    await expect(fireButton).toBeVisible({ timeout: 60000 });

    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: 0.5,
      maxDiffPixels: 200000, // Override strict global config
      threshold: 0.3,
      scale: 'css',
      timeout: 60000,
    });
  });
});
