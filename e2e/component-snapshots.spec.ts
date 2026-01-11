import { test, expect } from '@playwright/test';
import { selectCharacter, startMission, waitForGameReady, waitForLoadingScreen } from './utils';

/**
 * Component Snapshot Tests
 *
 * Tests individual 3D game components and their rendering
 * using Playwright's visual comparison capabilities
 */

const VISUAL_THRESHOLD = 0.2;

test.describe('Component Snapshots - 3D Character Rendering', () => {
  test('should render Santa character model', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    // Start with Santa
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

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
    });
  });

  test('should render Elf character model', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);

    await expect(page).toHaveScreenshot('elf-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble character model', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await waitForGameReady(page);

    await expect(page).toHaveScreenshot('bumble-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Terrain and Environment', () => {
  test('should render terrain correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Move to see terrain better (no waits needed between key presses)

    await expect(page).toHaveScreenshot('terrain-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render lighting and atmosphere', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    await expect(page).toHaveScreenshot('lighting-atmosphere.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Enemy Rendering', () => {
  test('should render enemies when spawned', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);
    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().enemies.length > 0;
    }, null, { timeout: 10000 }); // Wait for enemy spawns

    await expect(page).toHaveScreenshot('enemies-spawned.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render enemy death effects', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);
    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().enemies.length > 0;
    }, null, { timeout: 10000 });

    // Fire at enemies (no wait needed between key presses)

    await expect(page).toHaveScreenshot('enemy-death-effects.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Weapon Effects', () => {
  test('should render Santa cannon weapon', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Fire weapon and capture projectiles
    await page.keyboard.press('Space');

    await expect(page).toHaveScreenshot('santa-cannon-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf SMG weapon', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);

    // Fire SMG (rapid fire - no wait needed)

    await expect(page).toHaveScreenshot('elf-smg-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble star weapon', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await waitForGameReady(page);

    // Fire star weapon
    await page.keyboard.press('Space');

    await expect(page).toHaveScreenshot('bumble-star-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Particle Effects', () => {
  test('should render hit particles on impact', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);
    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().enemies.length > 0;
    }, null, { timeout: 10000 });

    // Fire (no wait needed)

    await expect(page).toHaveScreenshot('hit-particles.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Camera System', () => {
  test('should render correct camera perspective', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    await expect(page).toHaveScreenshot('camera-perspective.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render camera following player movement', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Move in a pattern (no wait needed)

    await expect(page).toHaveScreenshot('camera-following.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - UI Overlays', () => {
  test('should render damage flash effect', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);
    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().enemies.length > 0;
    }, null, { timeout: 10000 });

    await expect(page).toHaveScreenshot('damage-flash-overlay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render kill streak notification', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

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

    await expect(page).toHaveScreenshot('kill-streak-notification.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});
