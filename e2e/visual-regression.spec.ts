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

// Global timeout for this file to accommodate slow CI rendering
test.setTimeout(120000);

const waitForOverlays = async (page: any) => {
  await page.waitForLoadState('networkidle').catch(() => {});

  // Wait for loading screen to disappear
  await page.getByText('INITIALIZING SYSTEMS').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

  await page.waitForFunction(() => {
    const overlays = document.querySelectorAll('[role="dialog"], .modal, .overlay, .popup');
    return Array.from(overlays).every(el => el === null || (el as HTMLElement).style.display === 'none' || !(el as HTMLElement).offsetParent);
  }, { timeout: 10000 }).catch(() => {});
};

test.describe('Visual Regression - Character Selection', () => {
  test('should match character selection screen', async ({ page }) => {
    await page.goto('/');
    await waitForOverlays(page);

    // Take snapshot of character selection
    await expect(page).toHaveScreenshot('character-selection.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should show Santa character card correctly', async ({ page }) => {
    await page.goto('/');
    await waitForOverlays(page);

    const santaCard = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaCard.waitFor({ state: 'visible', timeout: 30000 });
    await expect(santaCard).toHaveScreenshot('santa-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });

  test('should show Elf character card correctly', async ({ page }) => {
    await page.goto('/');
    await waitForOverlays(page);

    const elfCard = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfCard.waitFor({ state: 'visible', timeout: 30000 });
    await expect(elfCard).toHaveScreenshot('elf-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });

  test('should show Bumble character card correctly', async ({ page }) => {
    await page.goto('/');
    await waitForOverlays(page);

    const bumbleCard = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleCard.waitFor({ state: 'visible', timeout: 30000 });
    await expect(bumbleCard).toHaveScreenshot('bumble-card.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
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
    await waitForOverlays(page);
    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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
    await waitForOverlays(page);
    await elfButton.evaluate((e: HTMLElement) => e.click());

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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
    await waitForOverlays(page);
    await bumbleButton.evaluate((e: HTMLElement) => e.click());

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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
    await waitForOverlays(page);
    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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
    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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
    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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
    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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

    await waitForOverlays(page);
    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay (needed for combat scenario)
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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
    await waitForOverlays(page);
    await elfButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

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

    await waitForOverlays(page);
    await santaButton.evaluate((e: HTMLElement) => e.click());
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
    });
  });
});

test.describe('Visual Regression - Responsive Design', () => {
  test.setTimeout(120000); // Extended timeout for slow CI environments

  test('should render correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    // Wait for network idle to ensure assets/fonts are loaded
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(3000); // Allow extra time for animations to settle

    await expect(page).toHaveScreenshot('mobile-menu.png', {
      maxDiffPixelRatio: 0.4, // Higher threshold for mobile menu due to rendering variations
      timeout: 30000,
      animations: 'disabled',
    });
  });

  test('should render mobile gameplay correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });

    await waitForOverlays(page);
    await waitForOverlays(page);
    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });

    await page.waitForFunction(() => {
      const overlays = document.querySelectorAll('[role="dialog"], .modal, .overlay, .popup');
      return Array.from(overlays).every(el => el === null || (el as HTMLElement).style.display === 'none' || !(el as HTMLElement).offsetParent);
    }, { timeout: 5000 }).catch(() => {});
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

    await page.waitForTimeout(5000);

    // Pause game for stable screenshot
    await page.evaluate(() => { window.__pauseGameForScreenshot = true; });
    await page.waitForTimeout(500); // Wait for freeze

    await expect(page).toHaveScreenshot('mobile-gameplay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      animations: 'disabled',
    });

    // Resume game
    await page.evaluate(() => { window.__pauseGameForScreenshot = false; });
  });

  test('should render touch controls on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(3000);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });

    // Wait for any overlays to disappear
    await page.waitForFunction(() => {
      const overlays = document.querySelectorAll('[role="dialog"], .modal, .overlay, .popup');
      return Array.from(overlays).every(el => el === null || (el as HTMLElement).style.display === 'none' || !(el as HTMLElement).offsetParent);
    }, { timeout: 5000 }).catch(() => {});

    await santaButton.evaluate((e: HTMLElement) => e.click());

    // Click COMMENCE OPERATION to enter gameplay
    const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceBtn.waitFor({ state: 'visible', timeout: 30000 });

    await page.waitForFunction(() => {
      const overlays = document.querySelectorAll('[role="dialog"], .modal, .overlay, .popup');
      return Array.from(overlays).every(el => el === null || (el as HTMLElement).style.display === 'none' || !(el as HTMLElement).offsetParent);
    }, { timeout: 5000 }).catch(() => {});
    await commenceBtn.evaluate((e: HTMLElement) => e.click());

    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(5000); // Increased from 3000 to allow game to fully load

    // Touch controls should be visible
    const fireButton = page.getByRole('button', { name: /FIRE/ });
    await expect(fireButton).toHaveScreenshot('touch-fire-button.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 30000,
    });
  });
});
