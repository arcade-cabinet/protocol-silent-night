import { test, expect } from '@playwright/test';

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
    await page.waitForTimeout(3000);
    
    // Start with Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);
    
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
    await page.waitForTimeout(3000);
    
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);
    
    await expect(page).toHaveScreenshot('elf-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble character model', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);
    
    await expect(page).toHaveScreenshot('bumble-character-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Terrain and Environment', () => {
  test('should render terrain correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);
    
    // Move to see terrain better
    await page.keyboard.down('w');
    await page.waitForTimeout(2000);
    await page.keyboard.up('w');
    
    await page.keyboard.down('a');
    await page.waitForTimeout(1000);
    await page.keyboard.up('a');
    
    await expect(page).toHaveScreenshot('terrain-render.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render lighting and atmosphere', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);
    
    await expect(page).toHaveScreenshot('lighting-atmosphere.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Enemy Rendering', () => {
  test('should render enemies when spawned', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(8000); // Wait for enemy spawns
    
    await expect(page).toHaveScreenshot('enemies-spawned.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render enemy death effects', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    await page.waitForTimeout(8000);
    
    // Fire at enemies
    await page.keyboard.down('Space');
    await page.waitForTimeout(2000);
    await page.keyboard.up('Space');
    
    await expect(page).toHaveScreenshot('enemy-death-effects.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Weapon Effects', () => {
  test('should render Santa cannon weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);
    
    // Fire weapon and capture projectiles
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('santa-cannon-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf SMG weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);
    
    // Fire SMG (rapid fire)
    await page.keyboard.down('Space');
    await page.waitForTimeout(1000);
    await page.keyboard.up('Space');
    
    await expect(page).toHaveScreenshot('elf-smg-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble star weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);
    
    // Fire star weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('bumble-star-fire.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Particle Effects', () => {
  test('should render hit particles on impact', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    await page.waitForTimeout(8000);
    
    // Fire and wait for hits
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');
    
    await expect(page).toHaveScreenshot('hit-particles.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Camera System', () => {
  test('should render correct camera perspective', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);
    
    await expect(page).toHaveScreenshot('camera-perspective.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render camera following player movement', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(3000);
    
    // Move in a pattern
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    await page.waitForTimeout(2000);
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
    await page.waitForTimeout(3000);
    
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(8000);
    
    // Trigger damage by getting close to enemies
    await page.waitForTimeout(5000);
    
    await expect(page).toHaveScreenshot('damage-flash-overlay.png', {
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render kill streak notification', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();

    await page.waitForTimeout(5000);
    
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
    });
  });
});
