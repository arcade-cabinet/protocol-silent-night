import { test, expect } from '@playwright/test';
import { selectCharacterAndStartMission, captureGameplaySnapshot } from './test-helpers';

/**
 * Component Snapshot Tests
 *
 * Tests individual 3D game components and their rendering
 * using Playwright's visual comparison capabilities
 *
 * Requires: PLAYWRIGHT_MCP=true for WebGL/canvas rendering
 */

// Check if running with full MCP capabilities
const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

const VISUAL_THRESHOLD = 0.3; // 30% diff tolerance for WebGL rendering variations in CI

test.describe('Component Snapshots - 3D Character Rendering', () => {
  // Increase timeout for all tests in this suite due to WebGL rendering
  test.setTimeout(120000); // Increased for WebGL rendering + screenshot stabilization

  test.beforeEach(async () => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
  });

  test('should render Santa character model', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await selectCharacterAndStartMission(page, /MECHA-SANTA/);

    await page.waitForTimeout(8000); // Increased wait for WebGL stabilization

    // Focus on character by centering view
    await page.evaluate(() => {
      // Center camera on player
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.filter = 'none';
      }
    });

    await page.waitForTimeout(1000); // Additional wait after DOM manipulation

    await expect(page).toHaveScreenshot('santa-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });

  test('should render Elf character model', async ({ page }) => {
    await captureGameplaySnapshot(page, /CYBER-ELF/, 'elf-character-render.png');
  });

  test('should render Bumble character model', async ({ page }) => {
    await captureGameplaySnapshot(page, /BUMBLE/, 'bumble-character-render.png');
  });
});

test.describe('Component Snapshots - Terrain and Environment', () => {
  test.setTimeout(120000); // Increased for WebGL rendering + screenshot stabilization

  test.beforeEach(async () => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
  });

  test('should render terrain correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await selectCharacterAndStartMission(page, /MECHA-SANTA/);

    await page.waitForTimeout(8000); // Increased wait for WebGL stabilization

    // Move to see terrain better
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');

    await page.keyboard.down('a');
    await page.waitForTimeout(1000);
    await page.keyboard.up('a');

    await page.waitForTimeout(1000); // Wait for movement to settle

    await expect(page).toHaveScreenshot('terrain-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });

  test('should render lighting and atmosphere', async ({ page }) => {
    await captureGameplaySnapshot(page, /MECHA-SANTA/, 'lighting-atmosphere.png');
  });
});

test.describe('Component Snapshots - Enemy Rendering', () => {
  test.setTimeout(120000); // Increased for WebGL rendering + screenshot stabilization

  test.beforeEach(async () => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
  });

  test('should render enemies when spawned', async ({ page }) => {
    await captureGameplaySnapshot(page, /MECHA-SANTA/, 'enemies-spawned.png', {
      preSnapshotWait: 10000, // Extra wait for enemy spawns
    });
  });

  test('should render enemy death effects', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await selectCharacterAndStartMission(page, /MECHA-SANTA/);

    await page.waitForTimeout(10000); // Increased wait for WebGL stabilization

    // Fire at enemies
    await page.keyboard.down('Space');
    await page.waitForTimeout(2000);
    await page.keyboard.up('Space');

    await page.waitForTimeout(1000); // Wait for effects to render

    await expect(page).toHaveScreenshot('enemy-death-effects.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });
});

test.describe('Component Snapshots - Weapon Effects', () => {
  test.setTimeout(120000); // Increased for WebGL rendering + screenshot stabilization

  test.beforeEach(async () => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
  });

  test('should render Santa cannon weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await selectCharacterAndStartMission(page, /MECHA-SANTA/);
    await page.waitForTimeout(8000);

    // Fire weapon and capture projectiles
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('santa-cannon-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });

  test('should render Elf SMG weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await selectCharacterAndStartMission(page, /CYBER-ELF/);
    await page.waitForTimeout(8000);

    // Fire SMG (rapid fire)
    await page.keyboard.down('Space');
    await page.waitForTimeout(1000);
    await page.keyboard.up('Space');

    await page.waitForTimeout(500); // Wait for projectiles to render

    await expect(page).toHaveScreenshot('elf-smg-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });

  test('should render Bumble star weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await selectCharacterAndStartMission(page, /BUMBLE/);
    await page.waitForTimeout(8000);

    // Fire star weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('bumble-star-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });
});

test.describe('Component Snapshots - Particle Effects', () => {
  test.setTimeout(120000); // Increased for WebGL rendering + screenshot stabilization

  test.beforeEach(async () => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
  });

  test('should render hit particles on impact', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await selectCharacterAndStartMission(page, /MECHA-SANTA/);

    await page.waitForTimeout(10000); // Increased wait for WebGL stabilization

    // Fire and wait for hits
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');

    await page.waitForTimeout(500); // Wait for particles to render

    await expect(page).toHaveScreenshot('hit-particles.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });
});

test.describe('Component Snapshots - Camera System', () => {
  test.setTimeout(120000); // Increased for WebGL rendering + screenshot stabilization

  test.beforeEach(async () => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
  });

  test('should render correct camera perspective', async ({ page }) => {
    await captureGameplaySnapshot(page, /MECHA-SANTA/, 'camera-perspective.png');
  });

  test('should render camera following player movement', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await selectCharacterAndStartMission(page, /MECHA-SANTA/);

    await page.waitForTimeout(8000); // Increased wait for WebGL stabilization

    // Move in a pattern
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    await page.waitForTimeout(2000);
    await page.keyboard.up('d');
    await page.keyboard.up('w');

    await page.waitForTimeout(1000); // Wait for camera to settle

    await expect(page).toHaveScreenshot('camera-following.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });
});

test.describe('Component Snapshots - UI Overlays', () => {
  test.setTimeout(120000); // Increased for WebGL rendering + screenshot stabilization

  test.beforeEach(async () => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
  });

  test('should render damage flash effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await selectCharacterAndStartMission(page, /CYBER-ELF/);

    await page.waitForTimeout(10000); // Increased wait for WebGL stabilization

    // Trigger damage by getting close to enemies
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot('damage-flash-overlay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });

  test('should render kill streak notification', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);

    await selectCharacterAndStartMission(page, /MECHA-SANTA/);

    await page.waitForTimeout(8000); // Increased wait for WebGL stabilization

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

    await page.waitForTimeout(1500); // Increased wait for notification animation

    await expect(page).toHaveScreenshot('kill-streak-notification.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
      timeout: 40000,
    });
  });
});
