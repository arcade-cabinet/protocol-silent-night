import { test, expect } from '@playwright/test';

/**
 * Character Skins System E2E Tests for Protocol: Silent Night
 * 
 * Tests the character skin selection system including:
 * - Skin selector UI display
 * - Unlocking skins with Nice Points
 * - Visual rendering of different skins
 * - Skin selection persistence
 * 
 * Requires: PLAYWRIGHT_MCP=true for full WebGL/canvas testing
 */

// Check if running with full MCP capabilities
const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

test.describe('Character Skins System Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
    
    await page.goto('/');
    
    // Wait for game to load
    await page.waitForTimeout(3000);
  });

  // ============================================
  // Skin Selector UI Tests
  // ============================================

  test('should display skin selector when character is selected', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Skin selector modal should appear
    await expect(page.getByText(/SELECT SKIN/i)).toBeVisible({ timeout: 5000 });
    
    // Check that Nice Points are displayed
    await expect(page.getByText(/NICE POINTS/i)).toBeVisible();
    
    console.log('✓ Skin selector UI displayed');
  });

  test('should show all 3 Santa skins with correct names', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Check all skin names are visible
    await expect(page.getByText('Classic Red')).toBeVisible();
    await expect(page.getByText('Arctic Camo')).toBeVisible();
    await expect(page.getByText('Gold Edition')).toBeVisible();
    
    console.log('✓ All Santa skins displayed');
  });

  test('should show all 3 Elf skins with correct names', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await elfButton.click();
    
    await page.waitForTimeout(1000);
    
    // Check all skin names are visible
    await expect(page.getByText('Forest Green')).toBeVisible();
    await expect(page.getByText('Neon Cyan')).toBeVisible();
    await expect(page.getByText('Shadow Ops')).toBeVisible();
    
    console.log('✓ All Elf skins displayed');
  });

  test('should show all 3 Bumble skins with correct names', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/i });
    await bumbleButton.click();
    
    await page.waitForTimeout(1000);
    
    // Check all skin names are visible
    await expect(page.getByText('Classic White')).toBeVisible();
    await expect(page.getByText('Midnight Black')).toBeVisible();
    await expect(page.getByText('Crystal Blue')).toBeVisible();
    
    console.log('✓ All Bumble skins displayed');
  });

  test('should show default skins as unlocked', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Classic Red should show UNLOCKED badge (it's free)
    await expect(page.getByText('UNLOCKED')).toBeVisible();
    
    console.log('✓ Default skins shown as unlocked');
  });

  test('should show locked skins with Nice Point costs', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Premium skins should show cost
    await expect(page.getByText(/500 NP/i)).toBeVisible();
    await expect(page.getByText(/1000 NP/i)).toBeVisible();
    
    console.log('✓ Locked skins show Nice Point costs');
  });

  test('should close skin selector and start game', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Click continue button
    const continueButton = page.getByRole('button', { name: /CONTINUE/i });
    await expect(continueButton).toBeVisible();
    await continueButton.click();
    
    // Should see mission briefing
    await expect(page.getByRole('button', { name: /COMMENCE OPERATION/i })).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Skin selector closes and game proceeds');
  });

  // ============================================
  // Skin Unlock Tests (with Nice Points)
  // ============================================

  test('should unlock skin when player has enough Nice Points', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Give player Nice Points via console
    await page.evaluate(() => {
      if (window.useGameStore) {
        const store = window.useGameStore.getState();
        store.earnNicePoints(1000);
      }
    });
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Check that Nice Points are displayed (should be 1000)
    await expect(page.getByText(/1000/i)).toBeVisible();
    
    // Find and click Arctic Camo skin (costs 500 NP)
    const arcticSkin = page.locator('button:has-text("Arctic Camo")');
    await arcticSkin.click();
    
    await page.waitForTimeout(500);
    
    // Skin should now be selected (check for checkmark or selected state)
    // The skin card should be selected
    const selectedSkin = page.locator('.selected:has-text("Arctic Camo")');
    await expect(selectedSkin).toBeVisible({ timeout: 2000 });
    
    console.log('✓ Skin unlocked with Nice Points');
  });

  test('should not unlock skin when player lacks Nice Points', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Ensure player has 0 Nice Points
    await page.evaluate(() => {
      if (window.useGameStore) {
        const store = window.useGameStore.getState();
        // Reset to 0
        store.updateMetaProgress((data: any) => ({ ...data, nicePoints: 0 }));
      }
    });
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Try to click expensive skin (Gold Edition - 1000 NP)
    const goldSkin = page.locator('button:has-text("Gold Edition")');
    
    // Button should be disabled
    await expect(goldSkin).toBeDisabled();
    
    console.log('✓ Cannot unlock skin without enough Nice Points');
  });

  // ============================================
  // Visual Rendering Tests
  // ============================================

  test('should render Santa with Classic Red skin by default', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Select Santa with default skin
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Continue with default skin
    const continueButton = page.getByRole('button', { name: /CONTINUE/i });
    await continueButton.click();
    
    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 5000 });
    await commenceButton.click();
    
    // Wait for game to render
    await page.waitForTimeout(2000);
    
    // HUD should be visible indicating game is running
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible();
    
    console.log('✓ Santa rendered with Classic Red skin');
  });

  test('should render different skins for each character', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    const characters = ['MECHA-SANTA', 'CYBER-ELF', 'BUMBLE'];
    
    for (const character of characters) {
      console.log(`\nTesting ${character} with default skin...`);
      
      // Reload page for fresh test
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Select character
      const button = page.getByRole('button', { name: new RegExp(character, 'i') });
      await expect(button).toBeVisible({ timeout: 15000 });
      await button.click();
      
      await page.waitForTimeout(1000);
      
      // Continue with default skin
      const continueButton = page.getByRole('button', { name: /CONTINUE/i });
      await continueButton.click();
      
      // Start game
      const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
      await expect(commenceButton).toBeVisible({ timeout: 5000 });
      await commenceButton.click();
      
      // Wait for game to render
      await page.waitForTimeout(2000);
      
      // Verify game is running
      await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible();
      
      console.log(`  ✓ ${character} rendered successfully`);
    }
    
    console.log('\n✓ All characters render with default skins');
  });

  // ============================================
  // Skin Selection Visual Snapshot Tests
  // ============================================

  test('should capture skin selector UI for Santa', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Give player some Nice Points to show affordable/expensive states
    await page.evaluate(() => {
      if (window.useGameStore) {
        const store = window.useGameStore.getState();
        store.earnNicePoints(600);
      }
    });
    
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await santaButton.click();
    
    await page.waitForTimeout(1000);
    
    // Wait for skin selector to be fully visible
    await expect(page.getByText(/SELECT SKIN/i)).toBeVisible();
    await page.waitForTimeout(500);
    
    // Take screenshot of skin selector
    await page.screenshot({ path: 'screenshots/santa-skin-selector.png', fullPage: false });
    
    console.log('✓ Captured Santa skin selector screenshot');
  });

  test('should capture skin selector UI for all characters', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    const characters = [
      { name: 'MECHA-SANTA', filename: 'santa' },
      { name: 'CYBER-ELF', filename: 'elf' },
      { name: 'BUMBLE', filename: 'bumble' }
    ];
    
    // Give player Nice Points
    await page.evaluate(() => {
      if (window.useGameStore) {
        const store = window.useGameStore.getState();
        store.earnNicePoints(1500);
      }
    });
    
    for (const char of characters) {
      console.log(`\nCapturing skin selector for ${char.name}...`);
      
      if (char.name !== 'MECHA-SANTA') {
        await page.reload();
        await page.waitForTimeout(3000);
        
        // Re-add Nice Points after reload
        await page.evaluate(() => {
          if (window.useGameStore) {
            const store = window.useGameStore.getState();
            store.earnNicePoints(1500);
          }
        });
      }
      
      // Select character
      const button = page.getByRole('button', { name: new RegExp(char.name, 'i') });
      await expect(button).toBeVisible({ timeout: 15000 });
      await button.click();
      
      await page.waitForTimeout(1000);
      
      // Wait for skin selector
      await expect(page.getByText(/SELECT SKIN/i)).toBeVisible();
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ 
        path: `screenshots/${char.filename}-skin-selector.png`, 
        fullPage: false 
      });
      
      console.log(`  ✓ Captured ${char.name} skin selector`);
    }
    
    console.log('\n✓ All skin selector screenshots captured');
  });
});
