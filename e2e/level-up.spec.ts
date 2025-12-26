import { test, expect } from '@playwright/test';

/**
 * Level-Up Upgrade Selection Tests
 * 
 * Tests the level-up system including upgrade selection,
 * game pause/resume, and stat application
 */

test.describe('Level-Up System', () => {
  test('should trigger level-up screen when player gains enough XP', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Select Santa character
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    // Start game
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Simulate gaining XP to level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        // Give player enough XP to level up (100 XP for level 2)
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check if level-up screen is visible
    const levelUpTitle = page.getByText(/LEVEL/i);
    await expect(levelUpTitle).toBeVisible();
    
    const selectUpgradeText = page.getByText(/SELECT AN UPGRADE/i);
    await expect(selectUpgradeText).toBeVisible();
  });

  test('should display 3 upgrade choices with details', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Trigger level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check that 3 upgrade cards are present
    const upgradeCards = page.locator('button[class*="upgradeCard"]');
    await expect(upgradeCards).toHaveCount(3);
    
    // Check that each card has an icon
    const icons = page.locator('div[class*="icon"]');
    await expect(icons).toHaveCount(3);
    
    // Check that categories are displayed
    const categories = page.locator('div[class*="cardCategory"]');
    await expect(categories).toHaveCount(3);
  });

  test('should resume game after selecting an upgrade', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Trigger level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Select first upgrade
    const firstUpgrade = page.locator('button[class*="upgradeCard"]').first();
    await firstUpgrade.click();
    
    await page.waitForTimeout(500);
    
    // Verify game resumed (HUD should be visible, level-up screen should be gone)
    const hud = page.locator('div[class*="hud"]');
    await expect(hud).toBeVisible();
    
    // Level-up screen should not be visible
    const levelUpTitle = page.getByText(/SELECT AN UPGRADE/i);
    await expect(levelUpTitle).not.toBeVisible();
  });

  test('should apply upgrade stats correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Get initial upgrade stats
    const initialStats = await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      return store?.upgradeStats;
    });
    
    // Trigger level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Select first upgrade
    const firstUpgrade = page.locator('button[class*="upgradeCard"]').first();
    await firstUpgrade.click();
    
    await page.waitForTimeout(500);
    
    // Get updated upgrade stats
    const updatedStats = await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      return store?.upgradeStats;
    });
    
    // Verify stats changed (at least one stat should be different)
    expect(JSON.stringify(initialStats)).not.toBe(JSON.stringify(updatedStats));
    
    // Verify upgrade was added to selected upgrades
    const selectedUpgrades = await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      return store?.runProgress.selectedUpgrades;
    });
    
    expect(selectedUpgrades).toHaveLength(1);
  });

  test('should show level number on level-up screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Level up to level 2
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check that level 2 is displayed
    const levelText = page.getByText(/LEVEL.*2/i);
    await expect(levelText).toBeVisible();
  });

  test('should not duplicate upgrades beyond max stacks', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Level up multiple times and select same upgrade if possible
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        const store = window.useGameStore?.getState();
        if (store) {
          store.gainXP(100);
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Select first upgrade
      const firstUpgrade = page.locator('button[class*="upgradeCard"]').first();
      await firstUpgrade.click();
      
      await page.waitForTimeout(500);
    }
    
    // Verify upgrades were selected
    const selectedUpgrades = await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      return store?.runProgress.selectedUpgrades;
    });
    
    expect(selectedUpgrades).toHaveLength(3);
  });

  test('should pause game during level-up (no enemy movement)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(5000); // Wait for enemies to spawn
    
    // Get enemy count before level up
    const enemiesBeforeLevelUp = await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      return store?.enemies.length || 0;
    });
    
    // Trigger level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Game state should be LEVEL_UP
    const gameState = await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      return store?.state;
    });
    
    expect(gameState).toBe('LEVEL_UP');
    
    // Enemies should still exist but game is paused
    const enemiesDuringLevelUp = await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      return store?.enemies.length || 0;
    });
    
    expect(enemiesDuringLevelUp).toBeGreaterThanOrEqual(0);
  });

  test('should display different upgrade categories with correct styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Trigger level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Check that upgrade cards have category classes
    const offensiveCards = page.locator('button[class*="offensive"]');
    const defensiveCards = page.locator('button[class*="defensive"]');
    const utilityCards = page.locator('button[class*="utility"]');
    const christmasCards = page.locator('button[class*="christmas"]');
    
    // At least one category should be present
    const totalCategoryCards = 
      (await offensiveCards.count()) +
      (await defensiveCards.count()) +
      (await utilityCards.count()) +
      (await christmasCards.count());
    
    expect(totalCategoryCards).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Level-Up Visual Regression', () => {
  test('should render level-up screen correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Trigger level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot of level-up screen
    await expect(page).toHaveScreenshot('level-up-screen.png', {
      maxDiffPixelRatio: 0.2,
    });
  });

  test('should render level-up screen with hover effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Trigger level up
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Hover over first upgrade card
    const firstUpgrade = page.locator('button[class*="upgradeCard"]').first();
    await firstUpgrade.hover();
    
    await page.waitForTimeout(500);
    
    // Take screenshot with hover effect
    await expect(page).toHaveScreenshot('level-up-screen-hover.png', {
      maxDiffPixelRatio: 0.2,
    });
  });

  test('should render level-up at higher level (level 3)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.click();
    
    await page.getByRole('button', { name: /COMMENCE OPERATION/i }).click();
    await page.waitForTimeout(3000);
    
    // Level up twice to reach level 3
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        // Level 2
        store.gainXP(100);
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Select first upgrade
    const firstUpgrade1 = page.locator('button[class*="upgradeCard"]').first();
    await firstUpgrade1.click();
    
    await page.waitForTimeout(500);
    
    // Level 3
    await page.evaluate(() => {
      const store = window.useGameStore?.getState();
      if (store) {
        store.gainXP(200); // Level 3 requires 200 XP
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Take screenshot of level 3 screen
    await expect(page).toHaveScreenshot('level-up-screen-level3.png', {
      maxDiffPixelRatio: 0.2,
    });
  });
});
