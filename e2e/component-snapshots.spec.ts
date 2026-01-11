import { test, expect } from '@playwright/test';
import { selectCharacter, startMission } from './utils';

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

    // Start with Santa
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

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

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for game to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    await expect(page).toHaveScreenshot('elf-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble character model', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    // Wait for game to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    await expect(page).toHaveScreenshot('bumble-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Terrain and Environment', () => {
  test('should render terrain correctly', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    // Move to see terrain better
    await page.keyboard.down('w');
    // Wait for movement to register
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input?.up === true;
    });
    await page.keyboard.up('w');

    await page.keyboard.down('a');
    // Wait for movement to register
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input?.left === true;
    });
    await page.keyboard.up('a');

    await expect(page).toHaveScreenshot('terrain-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render lighting and atmosphere', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    await expect(page).toHaveScreenshot('lighting-atmosphere.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Enemy Rendering', () => {
  test('should render enemies when spawned', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.enemies && state.enemies.length > 0;
    }, null, { timeout: 10000 });

    await expect(page).toHaveScreenshot('enemies-spawned.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render enemy death effects', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.enemies && state.enemies.length > 0;
    }, null, { timeout: 10000 });

    // Fire at enemies
    await page.keyboard.down('Space');
    // Wait for bullets to be created
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.bullets && state.bullets.length > 0;
    });
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('enemy-death-effects.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Weapon Effects', () => {
  test('should render Santa cannon weapon', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to be ready
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    // Fire weapon and capture projectiles
    await page.keyboard.press('Space');
    // Wait for bullet to be created
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.bullets && state.bullets.length > 0;
    });

    await expect(page).toHaveScreenshot('santa-cannon-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf SMG weapon', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for game to be ready
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    // Fire SMG (rapid fire)
    await page.keyboard.down('Space');
    // Wait for multiple bullets to be created
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.bullets && state.bullets.length > 3;
    });
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('elf-smg-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble star weapon', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    // Wait for game to be ready
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    // Fire star weapon
    await page.keyboard.press('Space');
    // Wait for bullets to be created (spread pattern creates multiple)
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.bullets && state.bullets.length > 0;
    });

    await expect(page).toHaveScreenshot('bumble-star-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Particle Effects', () => {
  test('should render hit particles on impact', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.enemies && state.enemies.length > 0;
    }, null, { timeout: 10000 });

    // Fire and wait for hits
    await page.keyboard.down('Space');
    // Wait for bullets to be created and give time for potential hits
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.bullets && state.bullets.length > 5;
    });
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('hit-particles.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Camera System', () => {
  test('should render correct camera perspective', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    await expect(page).toHaveScreenshot('camera-perspective.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render camera following player movement', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to render
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

    // Move in a pattern
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    // Wait for movement to register
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const input = store?.getState().input;
      return input?.up === true && input?.right === true;
    });
    await page.keyboard.up('d');
    await page.keyboard.up('w');

    await expect(page).toHaveScreenshot('camera-following.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - UI Overlays', () => {
  test('should render damage flash effect', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for enemies to spawn
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.enemies && state.enemies.length > 0;
    }, null, { timeout: 10000 });

    // Trigger damage by getting close to enemies - wait for potential collision
    await page.waitForFunction(() => {
      return new Promise(resolve => setTimeout(() => resolve(true), 5000));
    });

    await expect(page).toHaveScreenshot('damage-flash-overlay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render kill streak notification', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to be ready
    await page.waitForFunction(() => {
      const canvas = document.querySelector('canvas');
      return canvas && canvas.width > 0 && canvas.height > 0;
    });

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

    // Wait for kill streak notification to appear
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      const state = store?.getState();
      return state?.killStreak >= 3;
    });

    await expect(page).toHaveScreenshot('kill-streak-notification.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});
