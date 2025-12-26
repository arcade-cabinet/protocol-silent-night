import { test, expect } from '@playwright/test';

/**
 * Santa's Workshop E2E Tests
 * 
 * Tests the Santa's Workshop hub screen functionality including:
 * - Opening/closing the workshop
 * - Viewing weapons, skins, and upgrades tabs
 * - Purchase flow with Nice Points
 * - Unlock states (locked, unlocked, maxed)
 */

test.describe('Santas Workshop - UI Navigation', () => {
  test('should display workshop button on main menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check if workshop button exists
    const workshopButton = page.getByRole('button', { name: /SANTA'S WORKSHOP/i });
    await expect(workshopButton).toBeVisible();
  });

  test('should open workshop modal when button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Click workshop button
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Check if workshop modal is visible
    const workshopTitle = page.getByRole('heading', { name: /Santa's Workshop/i });
    await expect(workshopTitle).toBeVisible();

    // Check if tabs are visible
    await expect(page.getByRole('button', { name: 'Weapons' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skins' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upgrades' })).toBeVisible();
  });

  test('should close workshop when X button is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Close workshop
    const closeButton = page.getByRole('button', { name: '✕' });
    await closeButton.click();

    await page.waitForTimeout(500);

    // Workshop should not be visible
    const workshopTitle = page.getByRole('heading', { name: /Santa's Workshop/i });
    await expect(workshopTitle).not.toBeVisible();
  });
});

test.describe('Santas Workshop - Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);
  });

  test('should display weapons tab by default', async ({ page }) => {
    // Check for weapon cards
    await expect(page.getByRole('heading', { name: 'Snowball Launcher' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Candy Cane Staff' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ornament Bomb Launcher' })).toBeVisible();
  });

  test('should switch to skins tab', async ({ page }) => {
    // Click skins tab
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Skins')) {
          btn.click();
          break;
        }
      }
    });

    await page.waitForTimeout(500);

    // Check for skin cards
    await expect(page.getByRole('heading', { name: 'Frosty Titan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Neon Recon' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Crystal Yeti' })).toBeVisible();
  });

  test('should switch to upgrades tab', async ({ page }) => {
    // Click upgrades tab
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Upgrades')) {
          btn.click();
          break;
        }
      }
    });

    await page.waitForTimeout(500);

    // Check for tier headings and upgrades
    await expect(page.getByRole('heading', { name: 'Tier 1' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Extra Ammo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tough Skin' })).toBeVisible();
  });
});

test.describe('Santas Workshop - Nice Points Display', () => {
  test('should display current Nice Points balance', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Check Nice Points display
    const nicePointsLabel = page.locator('text=Nice Points:');
    await expect(nicePointsLabel).toBeVisible();

    // Should show 0 by default (or whatever the user has)
    const nicePointsValue = page.locator('text=Nice Points:').locator('..').locator('text=/\\d+/');
    await expect(nicePointsValue).toBeVisible();
  });
});

test.describe('Santas Workshop - Purchase Flow', () => {
  test('should show insufficient NP for expensive items', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Expensive items should show "INSUFFICIENT NP"
    const insufficientButtons = page.getByRole('button', { name: 'INSUFFICIENT NP' });
    await expect(insufficientButtons.first()).toBeVisible();
  });

  test('should allow purchase when enough Nice Points', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Give player Nice Points
    await page.evaluate(() => {
      const store = (window as any).useGameStore?.getState();
      if (store) {
        store.earnNicePoints(1000);
      }
    });

    await page.waitForTimeout(500);

    // Navigate to upgrades tab
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Upgrades')) {
          btn.click();
          break;
        }
      }
    });

    await page.waitForTimeout(500);

    // Should show UPGRADE buttons for affordable items
    const upgradeButtons = page.getByRole('button', { name: 'UPGRADE' });
    await expect(upgradeButtons.first()).toBeVisible();

    // Get initial Nice Points
    const initialNP = await page.evaluate(() => {
      const store = (window as any).useGameStore?.getState();
      return store?.metaProgress.nicePoints || 0;
    });

    // Click first upgrade button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const upgradeBtn = buttons.find(btn => btn.textContent === 'UPGRADE');
      if (upgradeBtn) (upgradeBtn as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Nice Points should decrease
    const newNP = await page.evaluate(() => {
      const store = (window as any).useGameStore?.getState();
      return store?.metaProgress.nicePoints || 0;
    });

    expect(newNP).toBeLessThan(initialNP);

    // Level should increase
    const levelText = page.locator('text=/Level: [1-9]/').first();
    await expect(levelText).toBeVisible();
  });

  test('should show unlocked state for weapons', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Give Nice Points and unlock a weapon
    await page.evaluate(() => {
      const store = (window as any).useGameStore?.getState();
      if (store) {
        store.earnNicePoints(1000);
        store.unlockWeapon('snowball');
      }
    });

    await page.waitForTimeout(500);

    // Should show UNLOCKED badge
    const unlockedBadge = page.locator('text=✓ UNLOCKED').first();
    await expect(unlockedBadge).toBeVisible();
  });
});

test.describe('Santas Workshop - Visual Regression', () => {
  test('should match weapons tab snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Take snapshot (only in MCP mode with WebGL)
    if (process.env.PLAYWRIGHT_MCP) {
      await expect(page).toHaveScreenshot('workshop-weapons-tab-e2e.png', {
        maxDiffPixelRatio: 0.2,
      });
    }
  });

  test('should match skins tab snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Switch to skins tab
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Skins')) {
          btn.click();
          break;
        }
      }
    });

    await page.waitForTimeout(500);

    // Take snapshot (only in MCP mode with WebGL)
    if (process.env.PLAYWRIGHT_MCP) {
      await expect(page).toHaveScreenshot('workshop-skins-tab-e2e.png', {
        maxDiffPixelRatio: 0.2,
      });
    }
  });

  test('should match upgrades tab snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Open workshop
    await page.evaluate(() => {
      const button = document.querySelector('button[class*="workshopBtn"]');
      if (button) (button as HTMLButtonElement).click();
    });

    await page.waitForTimeout(500);

    // Switch to upgrades tab
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.includes('Upgrades')) {
          btn.click();
          break;
        }
      }
    });

    await page.waitForTimeout(500);

    // Take snapshot (only in MCP mode with WebGL)
    if (process.env.PLAYWRIGHT_MCP) {
      await expect(page).toHaveScreenshot('workshop-upgrades-tab-e2e.png', {
        maxDiffPixelRatio: 0.2,
      });
    }
  });
});
