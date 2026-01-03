import { test, expect } from '@playwright/test';

/**
 * Component Snapshot Tests
 *
 * Tests individual 3D game components and their rendering
 * using Playwright's visual comparison capabilities
 */

const VISUAL_THRESHOLD = 0.2;
const SCREENSHOT_TIMEOUT = 30000; // Increase timeout for CI stability

// Helper function to wait for the loading screen to disappear
async function waitForGameReady(page) {
  const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
  if (await loadingScreen.isVisible()) {
    await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
  }
}

// Helper function to navigate to the game and wait for it to be ready
async function gotoAndWaitForReady(page, additionalWait = 0) {
  await page.goto('/');
  await page.waitForTimeout(3000);
  if (additionalWait > 0) {
    await page.waitForTimeout(additionalWait);
  }
}

// Helper function to select a character by name
async function selectCharacter(page, characterName) {
  const characterButton = page.getByRole('button', { name: new RegExp(characterName, 'i') });
  await characterButton.click();
  await page.waitForTimeout(5000);
}

// Helper function to click the "COMMENCE OPERATION" button
async function commenceOperation(page) {
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'visible', timeout: 45000 });
  await commenceButton.click({ timeout: 15000 });
}

// Helper function to start a game with a specific character
async function startGameWithCharacter(page, characterName, gameWait = 5000) {
  await selectCharacter(page, characterName);
  await commenceOperation(page);
  await page.waitForTimeout(gameWait);
}

test.describe('Component Snapshots - 3D Character Rendering', () => {
  test('should render Santa character model', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Focus on character by centering view
    await page.evaluate(() => {
      // Center camera on player
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.filter = 'none';
      }
    });

    await expect(page).toHaveScreenshot('santa-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render Elf character model', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'CYBER-ELF');

    await expect(page).toHaveScreenshot('elf-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render Bumble character model', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'BUMBLE');

    await expect(page).toHaveScreenshot('bumble-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Component Snapshots - Terrain and Environment', () => {
  test('should render terrain correctly', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Move to see terrain better
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    await page.keyboard.down('a');
    await page.waitForTimeout(1000);
    await page.keyboard.up('a');

    await expect(page).toHaveScreenshot('terrain-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render lighting and atmosphere', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA');

    await expect(page).toHaveScreenshot('lighting-atmosphere.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Component Snapshots - Enemy Rendering', () => {
  test('should render enemies when spawned', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA', 8000);

    await expect(page).toHaveScreenshot('enemies-spawned.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render enemy death effects', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await selectCharacter(page, 'MECHA-SANTA');
    await page.waitForTimeout(3000);

    // Fire at enemies
    await page.keyboard.down('Space');
    await page.waitForTimeout(2000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('enemy-death-effects.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Component Snapshots - Weapon Effects', () => {
  test('should render Santa cannon weapon', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA', 3000);

    // Fire weapon and capture projectiles
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('santa-cannon-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render Elf SMG weapon', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'CYBER-ELF', 3000);

    // Fire SMG (rapid fire)
    await page.keyboard.down('Space');
    await page.waitForTimeout(1000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('elf-smg-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render Bumble star weapon', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'BUMBLE', 3000);

    // Fire star weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('bumble-star-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Component Snapshots - Particle Effects', () => {
  test('should render hit particles on impact', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await selectCharacter(page, 'MECHA-SANTA');
    await page.waitForTimeout(3000);

    // Fire and wait for hits
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('hit-particles.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Component Snapshots - Camera System', () => {
  test('should render correct camera perspective', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA', 3000);

    await expect(page).toHaveScreenshot('camera-perspective.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render camera following player movement', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA', 3000);

    // Move in a pattern
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    await page.waitForTimeout(2000);
    await page.keyboard.up('d');
    await page.keyboard.up('w');

    await expect(page).toHaveScreenshot('camera-following.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});

test.describe('Component Snapshots - UI Overlays', () => {
  test('should render damage flash effect', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'CYBER-ELF', 8000);

    // Trigger damage by getting close to enemies
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot('damage-flash-overlay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });

  test('should render kill streak notification', async ({ page }) => {
    await gotoAndWaitForReady(page);
    await startGameWithCharacter(page, 'MECHA-SANTA');

    // Trigger kill streak by rapid kills
    await page.evaluate(() => {
      // @ts-ignore
      const store = window.useGameStore?.getState();
      if (store) {
        store.addKill(50);
        store.addKill(50);
        store.addKill(50);
      }
    });

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('kill-streak-notification.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: SCREENSHOT_TIMEOUT,
    });
  });
});
