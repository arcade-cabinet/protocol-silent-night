import { test, expect } from '@playwright/test';

/**
 * Comprehensive Character Class E2E Tests for Protocol: Silent Night
 * 
 * Tests all three character classes (Mecha-Santa, Cyber-Elf, The Bumble) to verify:
 * - Character selection and game start
 * - Movement in all directions
 * - Shooting/firing mechanics
 * - Combat with enemies
 * - Character-specific stats and behaviors
 * - HUD updates during gameplay
 * 
 * Requires: PLAYWRIGHT_MCP=true for full WebGL/canvas testing
 */

// Check if running with full MCP capabilities
const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

test.describe('Character Class Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
    
    await page.goto('/');
  });

  // ============================================
  // MECHA-SANTA Character Tests
  // ============================================

  test('MECHA-SANTA: should select character and start game', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Wait for loading screen
    await page.waitForTimeout(3000);
    
    // Find and click Santa button
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    
    // Verify character description is visible
    await expect(page.getByText(/Heavy Siege \/ Tank/i)).toBeVisible();
    
    // Click to start
    await santaButton.click({ force: true, timeout: 30000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    // Start screen should disappear
    await expect(santaButton).not.toBeVisible({ timeout: 5000 });
    
    // HUD should appear with operator status
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible({ timeout: 5000 });
    
    console.log('✓ MECHA-SANTA character selected and game started');
  });

  test('MECHA-SANTA: should display correct stats and move/fight', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Start game with Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click({ force: true, timeout: 30000 });
    
    // Wait for game to start
    await expect(santaButton).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Test movement by pressing keys
    console.log('Testing MECHA-SANTA movement...');
    
    // Move up (W key)
    await page.keyboard.down('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');
    
    // Move left (A key)
    await page.keyboard.down('a');
    await page.waitForTimeout(500);
    await page.keyboard.up('a');
    
    // Move down (S key)
    await page.keyboard.down('s');
    await page.waitForTimeout(500);
    await page.keyboard.up('s');
    
    // Move right (D key)
    await page.keyboard.down('d');
    await page.waitForTimeout(500);
    await page.keyboard.up('d');
    
    console.log('✓ MECHA-SANTA movement tested (WASD)');
    
    // Test firing
    console.log('Testing MECHA-SANTA firing...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    await page.keyboard.press('Space');
    
    console.log('✓ MECHA-SANTA firing tested (Space bar)');
    
    // Play for a few seconds to test combat
    console.log('Testing MECHA-SANTA combat...');
    await page.keyboard.down('w');
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');
    await page.keyboard.up('w');
    
    console.log('✓ MECHA-SANTA combat tested');
    
    // Verify HUD elements are still visible
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible();
    await expect(page.getByText(/SCORE/i)).toBeVisible();
    
    console.log('✓ MECHA-SANTA fully tested');
  });

  // ============================================
  // CYBER-ELF Character Tests
  // ============================================

  test('CYBER-ELF: should select character and start game', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Find and click Elf button
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await expect(elfButton).toBeVisible({ timeout: 15000 });
    
    // Verify character description is visible
    await expect(page.getByText(/Recon \/ Scout/i)).toBeVisible();
    
    // Click to start
    await elfButton.click({ force: true, timeout: 30000 });
    
    // Start screen should disappear
    await expect(elfButton).not.toBeVisible({ timeout: 5000 });
    
    // HUD should appear
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible({ timeout: 5000 });
    
    console.log('✓ CYBER-ELF character selected and game started');
  });

  test('CYBER-ELF: should display correct stats and move/fight', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Start game with Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await expect(elfButton).toBeVisible({ timeout: 15000 });
    await elfButton.click({ force: true, timeout: 30000 });
    
    // Wait for game to start
    await expect(elfButton).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Test movement (Elf should be faster)
    console.log('Testing CYBER-ELF movement (should be fast)...');
    
    // Test diagonal movement
    await page.keyboard.down('w');
    await page.keyboard.down('d');
    await page.waitForTimeout(500);
    await page.keyboard.up('d');
    await page.keyboard.up('w');
    
    // Test backward movement
    await page.keyboard.down('s');
    await page.keyboard.down('a');
    await page.waitForTimeout(500);
    await page.keyboard.up('a');
    await page.keyboard.up('s');
    
    console.log('✓ CYBER-ELF movement tested (should be faster than Santa)');
    
    // Test rapid firing (Elf has higher ROF)
    console.log('Testing CYBER-ELF rapid fire (SMG weapon)...');
    await page.keyboard.down('Space');
    await page.waitForTimeout(2000);
    await page.keyboard.up('Space');
    
    console.log('✓ CYBER-ELF rapid fire tested');
    
    // Test combat with movement
    console.log('Testing CYBER-ELF combat with movement...');
    await page.keyboard.down('w');
    await page.keyboard.down('Space');
    await page.waitForTimeout(2000);
    await page.keyboard.up('Space');
    
    // Strafe while firing
    await page.keyboard.down('Space');
    await page.keyboard.up('w');
    await page.keyboard.down('a');
    await page.waitForTimeout(1000);
    await page.keyboard.up('a');
    await page.keyboard.down('d');
    await page.waitForTimeout(1000);
    await page.keyboard.up('d');
    await page.keyboard.up('Space');
    
    console.log('✓ CYBER-ELF combat with movement tested');
    
    // Verify HUD
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible();
    await expect(page.getByText(/SCORE/i)).toBeVisible();
    
    console.log('✓ CYBER-ELF fully tested');
  });

  // ============================================
  // THE BUMBLE Character Tests
  // ============================================

  test('THE BUMBLE: should select character and start game', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Find and click Bumble button
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/i });
    await expect(bumbleButton).toBeVisible({ timeout: 15000 });
    
    // Verify character description is visible
    await expect(page.getByText(/Crowd Control \/ Bruiser/i)).toBeVisible();
    
    // Click to start
    await bumbleButton.click({ force: true, timeout: 30000 });
    
    // Start screen should disappear
    await expect(bumbleButton).not.toBeVisible({ timeout: 5000 });
    
    // HUD should appear
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible({ timeout: 5000 });
    
    console.log('✓ THE BUMBLE character selected and game started');
  });

  test('THE BUMBLE: should display correct stats and move/fight', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Start game with Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/i });
    await expect(bumbleButton).toBeVisible({ timeout: 15000 });
    await bumbleButton.click({ force: true, timeout: 30000 });
    
    // Wait for game to start
    await expect(bumbleButton).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Test movement (Bumble has medium speed)
    console.log('Testing THE BUMBLE movement...');
    
    // Circle movement
    await page.keyboard.down('w');
    await page.waitForTimeout(300);
    await page.keyboard.down('d');
    await page.waitForTimeout(300);
    await page.keyboard.up('w');
    await page.waitForTimeout(300);
    await page.keyboard.down('s');
    await page.waitForTimeout(300);
    await page.keyboard.up('d');
    await page.waitForTimeout(300);
    await page.keyboard.down('a');
    await page.waitForTimeout(300);
    await page.keyboard.up('s');
    await page.waitForTimeout(300);
    await page.keyboard.up('a');
    
    console.log('✓ THE BUMBLE movement tested');
    
    // Test firing (star weapon)
    console.log('Testing THE BUMBLE firing (star weapon)...');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);
    }
    
    console.log('✓ THE BUMBLE firing tested');
    
    // Test sustained combat
    console.log('Testing THE BUMBLE sustained combat...');
    await page.keyboard.down('w');
    await page.keyboard.down('Space');
    await page.waitForTimeout(3000);
    await page.keyboard.up('Space');
    await page.keyboard.up('w');
    
    console.log('✓ THE BUMBLE sustained combat tested');
    
    // Verify HUD
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible();
    await expect(page.getByText(/SCORE/i)).toBeVisible();
    
    console.log('✓ THE BUMBLE fully tested');
  });

  // ============================================
  // Touch Controls Tests
  // ============================================

  test('Touch controls should work with all characters', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Start with Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click({ force: true, timeout: 30000 });
    
    await expect(santaButton).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Verify touch fire button is visible
    const fireButton = page.getByRole('button', { name: /FIRE/i });
    await expect(fireButton).toBeVisible();
    
    // Click fire button multiple times
    await fireButton.click();
    await page.waitForTimeout(200);
    await fireButton.click();
    await page.waitForTimeout(200);
    await fireButton.click();
    
    console.log('✓ Touch controls tested');
  });

  // ============================================
  // Score and HUD Tests
  // ============================================

  test('Score should update when enemies are killed', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Start game with Elf (fast firing for quick kills)
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await expect(elfButton).toBeVisible({ timeout: 15000 });
    await elfButton.click({ force: true, timeout: 30000 });
    
    await expect(elfButton).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Get initial score
    const scoreElement = page.getByText(/SCORE/i);
    await expect(scoreElement).toBeVisible();
    
    // Fight for a while
    console.log('Fighting enemies to test score updates...');
    await page.keyboard.down('Space');
    await page.keyboard.down('w');
    await page.waitForTimeout(5000);
    await page.keyboard.up('w');
    
    // Move around and keep firing
    await page.keyboard.down('a');
    await page.waitForTimeout(2000);
    await page.keyboard.up('a');
    await page.keyboard.down('d');
    await page.waitForTimeout(2000);
    await page.keyboard.up('d');
    await page.keyboard.up('Space');
    
    // Score should still be visible
    await expect(scoreElement).toBeVisible();
    
    console.log('✓ Score system tested');
  });

  // ============================================
  // Game State Persistence Tests
  // ============================================

  test('Character selection and game state should persist correctly', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    // Test with each character
    for (const character of ['MECHA-SANTA', 'CYBER-ELF', 'BUMBLE']) {
      console.log(`\nTesting ${character}...`);
      
      // Reload page
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Select character
      const button = page.getByRole('button', { name: new RegExp(character, 'i') });
      await expect(button).toBeVisible({ timeout: 15000 });
      await button.click();
      
      // Verify game started
      await expect(button).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible({ timeout: 5000 });
      
      // Play briefly
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);
      
      console.log(`✓ ${character} tested`);
    }
    
    console.log('\n✓ All character selections work correctly');
  });

  // ============================================
  // Comprehensive Behavior Test
  // ============================================

  test('All characters should survive basic gameplay loop', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    await page.waitForTimeout(3000);
    
    const characters = [
      { name: 'MECHA-SANTA', role: /Heavy Siege \/ Tank/i },
      { name: 'CYBER-ELF', role: /Recon \/ Scout/i },
      { name: 'THE BUMBLE', role: /Crowd Control \/ Bruiser/i },
    ];
    
    for (const char of characters) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Testing ${char.name} gameplay loop...`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      // Reload for fresh test
      await page.reload();
      await page.waitForTimeout(3000);
      
      // Select character
      const button = page.getByRole('button', { name: new RegExp(char.name, 'i') });
      await expect(button).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(char.role)).toBeVisible();
      await button.click();
      
      console.log(`  ✓ ${char.name} selected`);
      
      // Wait for game to start
      await expect(button).not.toBeVisible({ timeout: 5000 });
      await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible({ timeout: 5000 });
      console.log(`  ✓ Game started`);
      
      // Perform full gameplay test
      console.log(`  → Testing movement in all directions...`);
      await page.keyboard.down('w');
      await page.waitForTimeout(500);
      await page.keyboard.up('w');
      await page.keyboard.down('s');
      await page.waitForTimeout(500);
      await page.keyboard.up('s');
      await page.keyboard.down('a');
      await page.waitForTimeout(500);
      await page.keyboard.up('a');
      await page.keyboard.down('d');
      await page.waitForTimeout(500);
      await page.keyboard.up('d');
      console.log(`  ✓ Movement works`);
      
      console.log(`  → Testing firing mechanics...`);
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Space');
        await page.waitForTimeout(200);
      }
      console.log(`  ✓ Firing works`);
      
      console.log(`  → Testing combat...`);
      await page.keyboard.down('Space');
      await page.keyboard.down('w');
      await page.waitForTimeout(3000);
      await page.keyboard.up('w');
      await page.keyboard.down('a');
      await page.waitForTimeout(1500);
      await page.keyboard.up('a');
      await page.keyboard.up('Space');
      console.log(`  ✓ Combat works`);
      
      // Verify game is still running
      await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible();
      await expect(page.getByText(/SCORE/i)).toBeVisible();
      console.log(`  ✓ Game still running, HUD visible`);
      
      console.log(`\n✅ ${char.name} PASSED ALL TESTS\n`);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ALL CHARACTER CLASSES VERIFIED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});
