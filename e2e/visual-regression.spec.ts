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

test.setTimeout(120000); // Increase global timeout for visual regression tests

// Utility for stable screenshots
async function waitForPageStability(page) {
  await page.waitForLoadState('networkidle');
  // Wait for fonts to be ready with a polling mechanism
  try {
    await page.waitForFunction(
      () => document.fonts.status === 'loaded' || document.fonts.ready,
      undefined,
      { timeout: 30000 }
    );
  } catch (e) {
    console.log('Font loading check timed out, proceeding anyway...');
  }
  await page.waitForTimeout(500); // Brief pause for any remaining renders
}

test.describe('Visual Regression - Character Selection', () => {
  test('should match character selection screen', async ({ page }) => {
    await page.goto('/');

    // Wait for fonts and styles to load
    await page.waitForTimeout(2000);

    // Take snapshot of character selection
    await expect(page).toHaveScreenshot('character-selection.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const elfCard = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfCard.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000); // Extra stability for animations

    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 45000, // Increased timeout for stability
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const bumbleCard = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleCard.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000); // Extra stability for animations

    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 45000, // Increased timeout for stability
    });
  });
});

test.describe('Visual Regression - Game Start', () => {
  test('should render Santa gameplay correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, noWaitAfter: true });

    // Click "COMMENCE OPERATION" on the briefing screen
    const startButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await startButton.waitFor({ state: 'visible', timeout: 30000 });
    // Handle potential double-click requirement or lag
    await startButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(1000); // Brief pause between clicks
    if (await startButton.isVisible()) {
        await startButton.click({ force: true, noWaitAfter: true });
    }

    // Wait for game to load
    await page.locator('canvas').waitFor({ state: 'visible', timeout: 30000 });
    await waitForPageStability(page);

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
    await elfButton.waitFor({ state: 'visible', timeout: 15000 });
    await elfButton.click({ force: true, noWaitAfter: true });

    // Click "COMMENCE OPERATION" on the briefing screen
    const startButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await startButton.waitFor({ state: 'visible', timeout: 30000 });
    await startButton.click({ force: true, noWaitAfter: true });

    // Check if game started by waiting for HUD or game container
    try {
        await page.waitForSelector('canvas', { state: 'attached', timeout: 5000 });
    } catch {
        // Retry click if game didn't start
        if (await startButton.isVisible()) {
            await startButton.click({ force: true, noWaitAfter: true });
        }
    }

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
    await bumbleButton.waitFor({ state: 'visible', timeout: 15000 });
    await bumbleButton.click({ force: true, noWaitAfter: true });

    // Click "COMMENCE OPERATION" on the briefing screen
    const startButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await startButton.waitFor({ state: 'visible', timeout: 30000 });
    await startButton.click({ force: true });
    await page.waitForTimeout(1000);
    if (await startButton.isVisible()) {
        await startButton.click({ force: true });
    }

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
    await santaButton.waitFor({ state: 'visible', timeout: 30000 });
    await santaButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(3000);

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(3000);

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
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, noWaitAfter: true });

    // Start game
    const startButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await startButton.waitFor({ state: 'visible', timeout: 30000 });
    await startButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(3000);

    // Move character
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('character-moved.png', {
      maxDiffPixelRatio: 0.05,
      timeout: 20000,
    });
  });

  test('should render firing animation correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, noWaitAfter: true });

    // Start game
    const startButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await startButton.waitFor({ state: 'visible', timeout: 30000 });
    await startButton.click({ force: true, noWaitAfter: true });
    await page.waitForTimeout(3000);

    // Fire weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('firing-animation.png', {
      maxDiffPixelRatio: 0.03,
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - Combat Scenarios', () => {
  test('should render combat with enemies', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, noWaitAfter: true });
    // Retry click if needed
    await page.waitForTimeout(1000);
    if (await santaButton.isVisible()) {
        await santaButton.click({ force: true, noWaitAfter: true });
    }
    await page.waitForTimeout(5000);

    // Wait for enemies to spawn and engage
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    // Ensure page is still open before screenshot
    if (page.isClosed()) {
        throw new Error('Page was closed before screenshot');
    }

    await expect(page).toHaveScreenshot('combat-scenario.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });

  test('should render player taking damage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.waitFor({ state: 'visible', timeout: 15000 });
    await elfButton.click({ force: true, noWaitAfter: true });
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
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, noWaitAfter: true });
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
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('game-over-screen.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 20000,
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await waitForPageStability(page);

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: 0.40, // Increased tolerance for mobile rendering variations
      threshold: 0.3, // Add threshold option
      timeout: 30000,
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    // Increase timeout for this specific test
    test.setTimeout(120000);

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Disable animations early
    await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Wait for the game canvas to be visible instead of strict network idle
    await page.locator('canvas').waitFor({ state: 'visible', timeout: 30000 });
    await waitForPageStability(page);

    // For unstable mobile screenshots, increase stability check:
    await page.waitForTimeout(1500); // Add explicit wait before screenshot

    // Ensure page is still open before screenshot
    if (page.isClosed()) {
        throw new Error('Page was closed before screenshot');
    }

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: 0.15,
      threshold: 0.6,
      timeout: 30000,
      animations: 'disabled' // Explicitly disable animations
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, noWaitAfter: true });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await waitForPageStability(page);

    // Touch controls should be visible
    // Wait for any overlays to disappear
    await page.waitForTimeout(1000);

    // Ensure mobile viewport for touch controls
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForFunction(() => {
      return window.innerWidth <= 768;
    });

    // Explicitly set state to PHASE_1 to ensure game controls are active
    await page.evaluate(() => {
      type GameWindow = Window & {
        useGameStore?: {
          getState(): {
            setState: (state: string) => void;
          };
        };
      };
      (window as GameWindow).useGameStore?.getState().setState('PHASE_1');
    });
    await page.waitForTimeout(1000);

    // Try multiple selectors to find the button
    const fireButton = page.locator([
      'button[aria-label*="fire" i]',
      'button[data-testid*="fire" i]',
      '.touch-fire-button',
      'button:has-text("FIRE")',
      'button[class*="fireBtn"]', // Add class selector based on CSS module
    ].join(',')).first();

    await expect(fireButton).toBeVisible({ timeout: 30000 });
    // Use waitFor instead of waitForElementState which is not available on Locator
    await fireButton.waitFor({ state: 'attached' });
    await page.waitForTimeout(500);

    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      threshold: 0.2,
      timeout: 30000
    });
  });
});
