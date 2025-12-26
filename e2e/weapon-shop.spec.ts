import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Weapon Shop and Unlockable Weapons
 * Tests the weapon shop UI, purchasing weapons with Nice Points, and weapon selection
 */

const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

test.describe('Weapon Shop and Unlockable Weapons', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start fresh
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
  });

  test('should display weapon shop button on menu screen', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    
    // Check that Nice Points are displayed (should be 0 initially)
    await expect(shopButton).toContainText('0 NP');
  });

  test('should open weapon shop modal when clicking shop button', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    
    await shopButton.click();
    
    // Modal should appear
    const modalTitle = page.getByRole('heading', { name: /WEAPON SHOP/i });
    await expect(modalTitle).toBeVisible();
    
    // Check that Nice Points display is visible
    await expect(page.getByText(/Nice Points:/i)).toBeVisible();
  });

  test('should display all 7 unlockable weapons in shop', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    await shopButton.click();
    
    // Wait for modal to appear
    await expect(page.getByRole('heading', { name: /WEAPON SHOP/i })).toBeVisible();
    
    // Check for all 7 unlockable weapons
    const weaponNames = [
      'Snowball Launcher',
      'Candy Cane Staff',
      'Ornament Bomb',
      'Light String Whip',
      'Gingerbread Turret',
      'Jingle Bell Shotgun',
      'Quantum Gift Box',
    ];
    
    for (const weaponName of weaponNames) {
      await expect(page.getByText(weaponName)).toBeVisible();
    }
  });

  test('should display weapon costs correctly', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    await shopButton.click();
    
    await expect(page.getByRole('heading', { name: /WEAPON SHOP/i })).toBeVisible();
    
    // Check specific weapon costs
    await expect(page.getByText(/500 NP/)).toBeVisible(); // Snowball Launcher
    await expect(page.getByText(/750 NP/)).toBeVisible(); // Candy Cane Staff
    await expect(page.getByText(/1000 NP/)).toBeVisible(); // Ornament Bomb
    await expect(page.getByText(/2000 NP/)).toBeVisible(); // Quantum Gift Box
  });

  test('should show weapons as locked when insufficient Nice Points', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    await shopButton.click();
    
    await expect(page.getByRole('heading', { name: /WEAPON SHOP/i })).toBeVisible();
    
    // All weapons should be locked initially (0 NP)
    const lockedButtons = page.getByRole('button', { name: /LOCKED/i });
    const count = await lockedButtons.count();
    expect(count).toBe(7); // All 7 unlockable weapons should be locked
  });

  test('should close weapon shop modal when clicking close button', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    await shopButton.click();
    
    const modalTitle = page.getByRole('heading', { name: /WEAPON SHOP/i });
    await expect(modalTitle).toBeVisible();
    
    // Click close button
    const closeButton = page.locator('.closeButton, button:has-text("✕")').first();
    await closeButton.click();
    
    // Modal should disappear
    await expect(modalTitle).not.toBeVisible();
  });

  test('should allow unlocking weapon with sufficient Nice Points', async ({ page }) => {
    // Set Nice Points to 1000 using localStorage
    await page.evaluate(() => {
      const metaProgress = {
        nicePoints: 1000,
        totalPointsEarned: 1000,
        runsCompleted: 0,
        bossesDefeated: 0,
        unlockedWeapons: ['cannon', 'smg', 'star'],
        unlockedSkins: [],
        permanentUpgrades: {},
        highScore: 0,
        totalKills: 0,
        totalDeaths: 0,
      };
      localStorage.setItem('protocol-silent-night-meta-progress', JSON.stringify(metaProgress));
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    
    // Should show 1000 NP
    await expect(shopButton).toContainText('1000 NP');
    
    await shopButton.click();
    await expect(page.getByRole('heading', { name: /WEAPON SHOP/i })).toBeVisible();
    
    // Find and click unlock button for Snowball Launcher (500 NP)
    const unlockButton = page.getByRole('button', { name: /UNLOCK.*500 NP/i }).first();
    await expect(unlockButton).toBeEnabled();
    await unlockButton.click();
    
    // Should now show as unlocked
    await expect(page.getByText(/✓ UNLOCKED/i).first()).toBeVisible();
    
    // Nice Points should be deducted (1000 - 500 = 500)
    await expect(page.getByText(/Nice Points:.*500/)).toBeVisible();
  });

  test('should persist unlocked weapons after page reload', async ({ page }) => {
    // Set up unlocked weapon in localStorage
    await page.evaluate(() => {
      const metaProgress = {
        nicePoints: 500,
        totalPointsEarned: 1000,
        runsCompleted: 0,
        bossesDefeated: 0,
        unlockedWeapons: ['cannon', 'smg', 'star', 'snowball'],
        unlockedSkins: [],
        permanentUpgrades: {},
        highScore: 0,
        totalKills: 0,
        totalDeaths: 0,
      };
      localStorage.setItem('protocol-silent-night-meta-progress', JSON.stringify(metaProgress));
    });
    await page.reload();
    await page.waitForTimeout(2000);
    
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await shopButton.click();
    
    await expect(page.getByRole('heading', { name: /WEAPON SHOP/i })).toBeVisible();
    
    // Snowball Launcher should show as unlocked
    const unlockedWeapons = page.getByText(/✓ UNLOCKED/i);
    const count = await unlockedWeapons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display weapon stats (damage and ROF)', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    await shopButton.click();
    
    await expect(page.getByRole('heading', { name: /WEAPON SHOP/i })).toBeVisible();
    
    // Check that weapon stats are displayed
    await expect(page.getByText(/DMG:/i).first()).toBeVisible();
    await expect(page.getByText(/ROF:/i).first()).toBeVisible();
  });

  test('should display weapon descriptions', async ({ page }) => {
    const shopButton = page.getByRole('button', { name: /WEAPON SHOP/i });
    await expect(shopButton).toBeVisible({ timeout: 10000 });
    await shopButton.click();
    
    await expect(page.getByRole('heading', { name: /WEAPON SHOP/i })).toBeVisible();
    
    // Check for weapon descriptions
    await expect(page.getByText(/Freezes enemies on impact/i)).toBeVisible(); // Snowball
    await expect(page.getByText(/360° melee attack/i)).toBeVisible(); // Candy Cane
    await expect(page.getByText(/area-of-effect damage/i)).toBeVisible(); // Ornament
  });
});
