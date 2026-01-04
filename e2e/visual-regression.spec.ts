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

test.describe('Visual Regression - Character Selection', () => {
  test('should match character selection screen', async ({ page }) => {
    await page.goto('/');

    // Wait for fonts and styles to load
    await page.waitForTimeout(2000);

    // Take snapshot of character selection
    await expect(page).toHaveScreenshot('character-selection.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const santaCard = page.locator('button[aria-label^="Select MECHA-SANTA"]');
    await santaCard.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const elfCard = page.locator('button[aria-label^="Select CYBER-ELF"]');
    await elfCard.waitFor({ state: 'visible', timeout: 15000 });
    await elfCard.scrollIntoViewIfNeeded({ timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Increased wait for layout stability
    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 500, // Tolerance for minor layout differences
      animations: 'disabled',
      timeout: 30000,
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const bumbleCard = page.locator('button[aria-label^="Select THE BUMBLE"]');
    await bumbleCard.waitFor({ state: 'visible', timeout: 15000 });
    await bumbleCard.scrollIntoViewIfNeeded({ timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Increased wait for layout stability
    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      maxDiffPixels: 500, // Tolerance for minor layout differences
      animations: 'disabled',
      timeout: 30000,
    });
  });
});

test.describe('Visual Regression - Game Start', () => {
  test('should render Santa gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      // Take a screenshot on failure to debug the page state
      await page.screenshot({ path: 'commence-button-not-found.png' });
      // Re-throw the error to fail the test
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    // Wait for game to load
    await page.waitForTimeout(5000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('santa-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await elfButton.waitFor({ state: 'visible', timeout: 30000 });
    await elfButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-elf.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    // Wait for game to load
    await page.waitForTimeout(5000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('elf-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await bumbleButton.waitFor({ state: 'visible', timeout: 30000 });
    await bumbleButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-bumble.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    // Wait for game to load
    await page.waitForTimeout(5000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('bumble-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - HUD Elements', () => {
  test('should render HUD correctly during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-hud.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);
    await page.waitForURL(/\/game/, { timeout: 20000 }).catch(() => {}); // Wait for potential URL change or just proceed if SPA
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });

    await page.waitForTimeout(3000);

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-score.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    await page.waitForTimeout(3000);

    // Move and fire to generate some score
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('hud-with-activity.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });
});

test.describe('Visual Regression - Game Movement', () => {
  test('should render character movement correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-move.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    await page.waitForTimeout(3000);

    // Move character
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    await expect(page).toHaveScreenshot('character-moved.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render firing animation correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-fire.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    await page.waitForTimeout(3000);

    // Fire weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('firing-animation.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - Combat Scenarios', () => {
  test('should render combat with enemies', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-combat.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    await page.waitForTimeout(5000);

    // Wait for enemies to spawn and engage
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('combat-scenario.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render player taking damage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await elfButton.waitFor({ state: 'visible', timeout: 30000 });
    await elfButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-damage.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    await page.waitForTimeout(5000);

    // Wait for potential damage from enemies
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot('player-damaged.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - End Game States', () => {
  test('should render game over screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Start game
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-gameover.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    await page.waitForTimeout(3000);

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
    // Add font loading check
    await page.waitForFunction(() => {
      return document.fonts.ready;
    }, { timeout: 30000 });

    await expect(page).toHaveScreenshot('game-over-screen.png', {
      maxDiffPixelRatio: 0.1, // Increase from VISUAL_THRESHOLD to 10%
      threshold: 0.3,
      animations: 'disabled',
      timeout: 30000, // Increase timeout from default 10s to 30s
      caret: 'hide'
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixels: 50000, // Add absolute pixel threshold
      maxDiffPixelRatio: 0.2, // Increased tolerance for mobile rendering
      timeout: 30000,
      animations: 'disabled',
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    // Wait for any loading overlay to disappear
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }); // Wait for navigation/transition

    // Click "COMMENCE OPERATION" on the briefing screen
    // Add explicit wait and retry logic for buttons
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-mobile.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);
    await page.waitForURL(/\/game/, { timeout: 20000 }).catch(() => {}); // Wait for potential URL change or just proceed if SPA
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000); // Increase from 2000 to 3000
    await page.waitForLoadState('networkidle'); // Add this line
    await page.waitForTimeout(1000); // Add extra wait after networkidle

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: 0.05, // Reduce from 0.10 to 5%
      timeout: 30000,
      animations: 'disabled',
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await page.locator('[data-testid="loading-overlay"]').waitFor({ state: 'detached' }).catch(() => {});
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    try {
      await commenceButton.waitFor({ state: 'visible', timeout: 90000 });
    } catch (e) {
      await page.screenshot({ path: 'commence-button-not-found-touch.png' });
      throw e;
    }
    await commenceButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(500);

    await page.waitForTimeout(3000);

    // Touch controls should be visible
    const fireButton = page.getByRole('button', { name: /FIRE/ });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow UI to fully settle

    // Use page screenshot with clip for stability instead of element screenshot
    const box = await fireButton.boundingBox();
    if (!box) throw new Error('Fire button not found');

    await expect(page).toHaveScreenshot('touch-fire-button.png', {
      clip: box,
      maxDiffPixelRatio: 0.06,
      animations: 'disabled',
      timeout: 30000,
    });
  });
});
