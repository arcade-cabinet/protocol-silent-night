import { test, expect, Page } from '@playwright/test';

/**
 * Component Snapshot Tests
 *
 * Tests individual 3D game components and their rendering
 * using Playwright's visual comparison capabilities
 */

const VISUAL_THRESHOLD = 0.25; // Increased for @react-three/fiber 9.5.0 rendering variations in CI
const CLICK_TIMEOUT = 30000; // Increased timeout for clicks in CI environments
const TRANSITION_TIMEOUT = 30000; // Timeout for waiting for screen transitions

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
  // Increased timeout for slower CI environments and mobile viewports
  await page.waitForSelector('[class*="classCard"]', { state: 'visible', timeout: 30000 });

  // Additional wait to ensure all buttons are fully interactive after CSS transitions
  await page.waitForTimeout(1500);
}

test.describe('Component Snapshots - 3D Character Rendering', () => {
  test('should render Santa character model', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    // Start with Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    // Wait for briefing screen
    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(4000);

    // Focus on character by centering view
    await page.evaluate(() => {
      // Center camera on player
      const canvas = document.querySelector('canvas');
      if (canvas) {
        canvas.style.filter = 'none';
      }
    });

    await expect(page).toHaveScreenshot('santa-character-render.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf character model', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(4000);

    await expect(page).toHaveScreenshot('elf-character-render.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble character model', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(4000);

    await expect(page).toHaveScreenshot('bumble-character-render.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Terrain and Environment', () => {
  test('should render terrain correctly', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(4000);

    // Move to see terrain better
    await page.keyboard.down('w');
    await page.waitForTimeout(1500);
    await page.keyboard.up('w');

    await page.keyboard.down('a');
    await page.waitForTimeout(1000);
    await page.keyboard.up('a');

    await expect(page).toHaveScreenshot('terrain-render.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render lighting and atmosphere', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(4000);

    await expect(page).toHaveScreenshot('lighting-atmosphere.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Enemy Rendering', () => {
  test('should render enemies when spawned', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(8000); // Wait for enemy spawns

    await expect(page).toHaveScreenshot('enemies-spawned.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render enemy death effects', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(8000);

    // Fire at enemies
    await page.keyboard.down('Space');
    await page.waitForTimeout(1500);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('enemy-death-effects.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Weapon Effects', () => {
  test('should render Santa cannon weapon', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(2500);

    // Fire weapon and capture projectiles
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('santa-cannon-fire.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Elf SMG weapon', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(2500);

    // Fire SMG (rapid fire)
    await page.keyboard.down('Space');
    await page.waitForTimeout(1000);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('elf-smg-fire.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render Bumble star weapon', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(2500);

    // Fire star weapon
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    await expect(page).toHaveScreenshot('bumble-star-fire.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Particle Effects', () => {
  test('should render hit particles on impact', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(8000);

    // Fire and wait for hits
    await page.keyboard.down('Space');
    await page.waitForTimeout(2500);
    await page.keyboard.up('Space');

    await expect(page).toHaveScreenshot('hit-particles.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - Camera System', () => {
  test('should render correct camera perspective', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(2500);

    await expect(page).toHaveScreenshot('camera-perspective.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render camera following player movement', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(2500);

    // Move in a pattern
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    await page.waitForTimeout(1500);
    await page.keyboard.up('d');
    await page.keyboard.up('w');

    await expect(page).toHaveScreenshot('camera-following.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});

test.describe('Component Snapshots - UI Overlays', () => {
  test('should render damage flash effect', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const elfButton = page.getByRole('button', { name: /CYBER-ELF/ });
    await elfButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(8000);

    // Trigger damage by getting close to enemies
    await page.waitForTimeout(4000);

    await expect(page).toHaveScreenshot('damage-flash-overlay.png', {
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });

  test('should render kill streak notification', async ({ page }) => {
    await page.goto('/');
    await waitForLoadingScreen(page);

    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click({ timeout: CLICK_TIMEOUT });

    // Additional wait after click to ensure state transition
    await page.waitForTimeout(1500);

    await page.waitForSelector('text=/COMMENCE OPERATION/i', { timeout: TRANSITION_TIMEOUT });
    await page.waitForTimeout(1500);

    // Click "COMMENCE OPERATION" on the briefing screen
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click({ timeout: CLICK_TIMEOUT });

    await page.waitForTimeout(4000);

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
      maxDiffPixels: 10000,
      maxDiffPixelRatio: VISUAL_THRESHOLD,
    });
  });
});
