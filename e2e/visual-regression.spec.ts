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
const SCREENSHOT_TIMEOUT = 30000; // 30 second timeout for WebGL screenshot operations

test.describe('Visual Regression - Character Selection', () => {
  test('should match character selection screen', async ({ page }) => {
    await page.goto('/');

    // Wait for fonts and styles to load
    await page.waitForTimeout(3000);

    // Take snapshot of character selection
    await expect(page).toHaveScreenshot('character-selection.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const elfCard = page.getByRole('button', { name: /CYBER-ELF/ });
    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const bumbleCard = page.getByRole('button', { name: /BUMBLE/ });
    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Visual Regression - Game Start', () => {
  test('should render Santa gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    // Wait for game to load
    await page.waitForTimeout(5000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('santa-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render Elf gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    // Wait for game to load
    await page.waitForTimeout(5000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('elf-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render Bumble gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    // Wait for game to load
    await page.waitForTimeout(5000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('bumble-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Visual Regression - HUD Elements', () => {
  test('should render HUD correctly during gameplay', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);

    // Move and fire to generate some score
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('hud-with-activity.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Visual Regression - Game Movement', () => {
  test('should render character movement correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);

    // Move character
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    await expect(page).toHaveScreenshot('character-moved.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render firing animation correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);

    // Fire weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('firing-animation.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Visual Regression - Combat Scenarios', () => {
  test('should render combat with enemies', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);

    // Wait for enemies to spawn and engage
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('combat-scenario.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render player taking damage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);

    // Wait for potential damage from enemies
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot('player-damaged.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Visual Regression - End Game States', () => {
  test('should render game over screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Start game
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

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

    await expect(page).toHaveScreenshot('game-over-screen.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for fonts and styles to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.scrollIntoViewIfNeeded();
    await santaButton.click({ timeout: 15000 });

    // Wait for briefing to appear and click COMMENCE OPERATION
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.scrollIntoViewIfNeeded();
    await santaButton.click({ timeout: 15000 });

    // Wait for briefing to appear and click COMMENCE OPERATION
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(3000);

    // Touch controls should be visible
    const fireButton = page.getByRole('button', { name: /FIRE/ });
    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});
