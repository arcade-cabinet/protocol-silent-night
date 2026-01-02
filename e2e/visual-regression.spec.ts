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

// Increase timeout for all tests in this file
test.setTimeout(60000);

// Helper function to stabilize the page before screenshots
async function stabilizePage(page) {
  // Wait for all network requests to complete
  await page.waitForLoadState('networkidle');

  // Wait for dynamic content to settle
  await page.waitForTimeout(500);

  // Ensure all animations are truly disabled via CSS injection
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

  // Wait for any remaining font rendering
  await page.waitForFunction(() => document.fonts.ready);
}

test.describe('Visual Regression - Character Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Wait for loading screen to disappear - critical for slow CI environments
    // Using a very long timeout as SwiftShader compilation can be slow
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
    // Additional wait for transition animation
    await page.waitForTimeout(2000);
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
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
  });

  test('should render Santa gameplay correctly', async ({ page }) => {
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

    // Wait for game to load
    await page.waitForTimeout(10000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('santa-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf gameplay correctly', async ({ page }) => {
    // Select Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.waitFor({ state: 'visible', timeout: 15000 });
    await elfButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

    // Wait for game to load
    await page.waitForTimeout(10000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('elf-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble gameplay correctly', async ({ page }) => {
    // Select Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.waitFor({ state: 'visible', timeout: 15000 });
    await bumbleButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

    // Wait for game to load
    await page.waitForTimeout(10000);

    // Take gameplay snapshot
    await expect(page).toHaveScreenshot('bumble-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Visual Regression - HUD Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
  });

  test('should render HUD correctly during gameplay', async ({ page }) => {
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

    await page.waitForTimeout(8000);

    // Take HUD snapshot
    await expect(page).toHaveScreenshot('hud-display.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render score and objectives correctly', async ({ page }) => {
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

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
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
  });

  test('should render character movement correctly', async ({ page }) => {
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

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
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

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
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
  });

  test('should render combat with enemies', async ({ page }) => {
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

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
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.waitFor({ state: 'visible', timeout: 15000 });
    await elfButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

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
    await page.goto('/', { waitUntil: 'networkidle' });
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
  });

  test('should render game over screen', async ({ page }) => {
    // Start game
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

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
    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }
  });

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }

    await stabilizePage(page);

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.2,
      animations: 'disabled',
      fullPage: true,
      scale: 'css',
      timeout: 30000,
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

    // Wait for game to initialize
    await page.waitForTimeout(10000);
    await stabilizePage(page);

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.2,
      fullPage: true,
      scale: 'css',
      timeout: 30000,
    });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
    if (await loadingScreen.isVisible()) {
      await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
    }

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.waitFor({ state: 'visible', timeout: 15000 });
    await santaButton.click({ force: true, timeout: 15000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 15000 });
    await commenceButton.click({ timeout: 15000 });

    await page.waitForTimeout(10000);

    // Touch controls should be visible
    // Wait for FIRE button using explicit DOM check for robustness
    await page.waitForFunction(() => {
      const button = document.querySelector('[role="button"][aria-label*="FIRE"], button:has-text("FIRE")');
      // @ts-ignore
      return button && window.getComputedStyle(button).display !== 'none';
    }, { timeout: 30000 }).catch(() => {
      console.log('Explicit DOM check timed out, falling back to locator');
    });

    const fireButton = page.getByRole('button', { name: /FIRE/ });
    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.2,
      scale: 'css',
    });
  });
});
