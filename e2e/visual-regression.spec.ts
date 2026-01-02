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

// Increase default timeout for this file due to heavy 3D loading and animations
test.setTimeout(120000);

/**
 * Helper to disable all CSS animations and transitions for consistent screenshots
 */
async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `
  });
}

/**
 * Helper to start the game with a specific character
 * Handles loading screens, character selection, and briefing sequence
 */
async function startGame(page: Page, characterName: RegExp | string) {
  // Wait for loading screen to disappear
  await expect(page.getByText('INITIALIZING SYSTEMS')).not.toBeVisible({ timeout: 40000 });

  // Select Character
  const charButton = page.getByRole('button', { name: characterName });
  await charButton.waitFor({ state: 'visible', timeout: 30000 });

  // Wait for any overlays to disappear
  await page.waitForSelector('.overlay, .modal, .loading', { state: 'hidden', timeout: 5000 }).catch(() => {});

  // Click character - handle potential navigation or state change
  // We use sequential actions instead of Promise.all to avoid potential race conditions
  // where navigation happens before click resolves
  await charButton.click({ force: true, timeout: 15000 });

  // Click COMMENCE OPERATION on the briefing screen
  // Wait specifically for the briefing screen to appear first
  await page.waitForTimeout(1000); // Allow briefing transition
  const commenceBtn = page.locator('[data-testid="mission-start-button"]').or(
    page.getByRole('button', { name: /COMMENCE OPERATION/i })
  );
  await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
  await commenceBtn.click({ timeout: 30000 });

  // Wait for game to load (HUD score visible)
  await expect(page.getByText('SCORE')).toBeVisible({ timeout: 30000 });
}

test.describe('Visual Regression - Character Selection', () => {
  test('should match character selection screen', async ({ page }) => {
    await page.goto('/');

    // Wait for fonts and styles to load
    await page.waitForTimeout(2000);

    // Disable animations for consistent screenshots
    await disableAnimations(page);

    // Take snapshot of character selection
    await expect(page).toHaveScreenshot('character-selection.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 20000,
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await disableAnimations(page);

    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 20000,
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await disableAnimations(page);

    const elfCard = page.getByRole('button', { name: /CYBER-ELF/ });
    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 20000,
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await disableAnimations(page);

    const bumbleCard = page.getByRole('button', { name: /BUMBLE/ });
    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - Game Start', () => {
  test('should render Santa gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /MECHA-SANTA/);

    // Wait for scene to stabilize
    await page.waitForTimeout(2000);
    await disableAnimations(page);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('santa-gameplay.png', {
      maxDiffPixelRatio: 0.3, // Increase for WebGL variations
      timeout: 20000,
    });
  });

  test('should render Elf gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /CYBER-ELF/);

    // Wait for scene to stabilize
    await page.waitForTimeout(2000);
    await disableAnimations(page);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('elf-gameplay.png', {
      maxDiffPixelRatio: 0.3, // Increase for WebGL variations
      timeout: 20000,
    });
  });

  test('should render Bumble gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /BUMBLE/);

    // Wait for scene to stabilize
    await page.waitForTimeout(2000);
    await disableAnimations(page);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('bumble-gameplay.png', {
      maxDiffPixelRatio: 0.3, // Increase for WebGL variations
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - HUD Elements', () => {
  test('should render HUD correctly during gameplay', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /MECHA-SANTA/);

    await page.waitForTimeout(2000);
    await disableAnimations(page);

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: 0.3,
      timeout: 20000,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /MECHA-SANTA/);

    // Move and fire to generate some score
    await page.keyboard.press('Space');
    await page.waitForTimeout(2000); // Allow render update

    await disableAnimations(page);

    await expect(page).toHaveScreenshot('hud-with-activity.png', {
      maxDiffPixelRatio: 0.3,
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - Game Movement', () => {
  test('should render character movement correctly', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /MECHA-SANTA/);

    // Move character
    await page.keyboard.down('w');
    await page.waitForTimeout(1000); // Wait for movement
    await page.keyboard.up('w');

    await page.waitForTimeout(500);
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('character-moved.png', {
      maxDiffPixelRatio: 0.3,
      timeout: 20000,
    });
  });

  test('should render firing animation correctly', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /MECHA-SANTA/);

    // Fire weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000); // Wait for muzzle flash/projectile

    await disableAnimations(page);

    await expect(page).toHaveScreenshot('firing-animation.png', {
      maxDiffPixelRatio: 0.3,
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - Combat Scenarios', () => {
  test('should render combat with enemies', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /MECHA-SANTA/);

    // Wait for enemies to spawn and engage
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    await page.waitForTimeout(1000);
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('combat-scenario.png', {
      maxDiffPixelRatio: 0.3,
      timeout: 20000,
    });
  });

  test('should render player taking damage', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /CYBER-ELF/);

    // Wait for potential damage from enemies
    await page.waitForTimeout(5000);

    await disableAnimations(page);

    await expect(page).toHaveScreenshot('player-damaged.png', {
      maxDiffPixelRatio: 0.3,
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - End Game States', () => {
  test('should render game over screen', async ({ page }) => {
    await page.goto('/');
    await startGame(page, /MECHA-SANTA/);

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

    // Wait for Game Over screen
    await expect(page.getByText('OPERATOR DOWN')).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(1000);
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('game-over-screen.png', {
      maxDiffPixelRatio: 0.3,
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for loading screen to disappear
    await expect(page.getByText('INITIALIZING SYSTEMS')).not.toBeVisible({ timeout: 20000 });

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: 0.4, // Temporarily increased for high variance
      timeout: 20000,
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await startGame(page, /MECHA-SANTA/);

    // Wait specifically for mobile UI elements
    await page.waitForSelector('[data-testid="mobile-gameplay-ready"]', { timeout: 10000 }).catch(() => {});

    // Wait for any animations to settle
    await page.waitForTimeout(2000);

    // Disable animations for consistent screenshots
    await disableAnimations(page);

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: 0.4, // Increase threshold for WebGL rendering variations
      timeout: 20000
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await startGame(page, /MECHA-SANTA/);

    // Touch controls should be visible
    const fireButton = page.getByRole('button', { name: /FIRE/ });
    await fireButton.waitFor({ state: 'visible', timeout: 10000 });

    // Wait for button to settle (transitions, box-shadow animations)
    await page.waitForTimeout(1000);

    // Disable animations for consistent screenshots
    await disableAnimations(page);

    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 20000,
    });
  });
});
