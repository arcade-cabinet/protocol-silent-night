import { test, expect, Page } from '@playwright/test';

/**
 * Visual Regression Tests for Protocol: Silent Night
 *
 * Uses Playwright's screenshot comparison to validate visual rendering
 * of 3D game components, characters, and gameplay scenarios.
 *
 * Run with: PLAYWRIGHT_MCP=true pnpm test:e2e
 */

const VISUAL_THRESHOLD = 0.2; // 20% diff tolerance for WebGL rendering variations
const CLICK_TIMEOUT = 10000; // Increased timeout for clicks

/**
 * Wait for loading screen to be completely hidden and start screen to be ready
 * The loading screen has minDuration of 1500ms + CSS animation (1.4s delay + 0.5s fadeOut) = 3.4s total
 * The start screen has a 0.5s fadeIn animation
 */
async function waitForLoadingScreen(page: Page) {
  // Wait for loading screen CSS animation to complete
  // minDuration (1500ms) + animation delay (1400ms) + fadeOut (500ms) = 3400ms
  await page.waitForTimeout(3500);

  // Wait for the start screen to be visible and interactive
  // Use a more reliable selector that waits for any character selection button
  await page.waitForSelector('[class*="classCard"]', { state: 'visible', timeout: 15000 });

  // Additional wait to ensure all buttons are fully interactive after CSS transitions
  await page.waitForTimeout(1000);
}

test.describe('Visual Regression - Character Selection', () => {
  test('should match character selection screen', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);
    
    // Take snapshot of character selection
    await expect(page).toHaveScreenshot('character-selection.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);
    
    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);
    
    const elfCard = page.getByRole('button', { name: /CYBER-ELF/ });
    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);
    
    const bumbleCard = page.getByRole('button', { name: /BUMBLE/ });
    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - Game Start', () => {
  test('should render Santa gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    // Wait for game to fully load and render
    await page.waitForTimeout(6000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('santa-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    // Select Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    // Wait for game to fully load and render
    await page.waitForTimeout(6000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('elf-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    // Select Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    // Wait for game to fully load and render
    await page.waitForTimeout(6000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('bumble-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - HUD Elements', () => {
  test('should render HUD correctly during gameplay', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Move and fire to generate some score
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('hud-with-activity.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - Game Movement', () => {
  test('should render character movement correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

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
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

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
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(3000);

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
    await waitForLoadingScreen(page);

    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(3000);

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
    await waitForLoadingScreen(page);

    // Start game
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

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
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForLoadingScreen(page);

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 15000,
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    // Wait for game to fully load
    await page.waitForTimeout(6000);

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ noWaitAfter: true });

    // Wait for briefing screen to appear
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    // Wait for game to fully load and touch controls to appear
    await page.waitForTimeout(6000);

    // Touch controls should be visible
    const fireButton = page.getByRole('button', { name: /FIRE/ });
    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});
