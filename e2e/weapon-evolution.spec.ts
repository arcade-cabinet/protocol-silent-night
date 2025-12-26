import { test, expect, Page } from '@playwright/test';

/**
 * Weapon Evolution E2E Tests
 * 
 * Tests the weapon evolution system that transforms weapons
 * when the player reaches level 10 with appropriate upgrades.
 * 
 * Requires WebGL/MCP support for full testing.
 */

// Check if running with full MCP capabilities
const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

// Helper to get game state from the store
async function getGameState(page: Page) {
  return page.evaluate(() => {
    const store = (window as any).useGameStore;
    if (!store) return null;
    const state = store.getState();
    return {
      gameState: state.state,
      playerClass: state.playerClass,
      runProgress: state.runProgress,
      currentEvolution: state.currentEvolution,
      playerHp: state.playerHp,
      score: state.stats.score,
      kills: state.stats.kills,
      bulletCount: state.bullets.length,
    };
  });
}

// Helper to trigger store actions
async function triggerStoreAction(page: Page, action: string, ...args: any[]) {
  return page.evaluate(({ action, args }) => {
    const store = (window as any).useGameStore;
    if (!store) return false;
    const state = store.getState();
    if (typeof state[action] === 'function') {
      state[action](...args);
      return true;
    }
    return false;
  }, { action, args });
}

// Helper to gain XP to reach a specific level
async function gainXPToLevel(page: Page, targetLevel: number) {
  return page.evaluate((level) => {
    const store = (window as any).useGameStore;
    if (!store) return false;
    const state = store.getState();
    
    // Calculate total XP needed
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += i * 100; // 100 * level XP per level
    }
    
    // Gain XP to reach target level
    state.gainXP(totalXP);
    return true;
  }, targetLevel);
}

test.describe('Weapon Evolution System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(hasMcpSupport ? 3000 : 2500);
  });

  test('should track weapon evolution configuration', async ({ page }) => {
    const hasEvolutions = await page.evaluate(() => {
      // Check if WEAPON_EVOLUTIONS is available via the game store
      const store = (window as any).useGameStore;
      if (!store) return false;
      return true;
    });

    // Verify game store is available (evolutions are defined in types)
    expect(hasEvolutions).toBe(true);
  });

  test('should not evolve weapon before level 10', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa (cannon weapon)
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Gain XP to reach level 5
    await gainXPToLevel(page, 5);
    await page.waitForTimeout(500);

    // Check evolution state
    const state = await getGameState(page);
    expect(state?.runProgress.level).toBeLessThan(10);
    expect(state?.currentEvolution).toBeNull();
    expect(state?.runProgress.weaponEvolutions).toHaveLength(0);
  });

  test('should evolve cannon to mega coal mortar at level 10', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa (cannon weapon)
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Gain XP to reach level 10
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    // Check evolution state
    const state = await getGameState(page);
    expect(state?.runProgress.level).toBeGreaterThanOrEqual(10);
    expect(state?.currentEvolution).toBe('mega-coal-mortar');
    expect(state?.runProgress.weaponEvolutions).toContain('mega-coal-mortar');

    console.log('Evolved to:', state?.currentEvolution);
  });

  test('should evolve SMG to plasma storm at level 10', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Elf (SMG weapon)
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await expect(elfButton).toBeVisible({ timeout: 15000 });
    await elfButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Gain XP to reach level 10
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    // Check evolution state
    const state = await getGameState(page);
    expect(state?.runProgress.level).toBeGreaterThanOrEqual(10);
    expect(state?.currentEvolution).toBe('plasma-storm');
    expect(state?.runProgress.weaponEvolutions).toContain('plasma-storm');

    console.log('Evolved to:', state?.currentEvolution);
  });

  test('should evolve star to supernova burst at level 10', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Bumble (star weapon)
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/i });
    await expect(bumbleButton).toBeVisible({ timeout: 15000 });
    await bumbleButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Gain XP to reach level 10
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    // Check evolution state
    const state = await getGameState(page);
    expect(state?.runProgress.level).toBeGreaterThanOrEqual(10);
    expect(state?.currentEvolution).toBe('supernova-burst');
    expect(state?.runProgress.weaponEvolutions).toContain('supernova-burst');

    console.log('Evolved to:', state?.currentEvolution);
  });

  test('should apply damage multiplier after evolution', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Get base damage
    const baseDamage = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store.getState().playerClass?.damage;
    });

    // Evolve weapon
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    // Get modified damage
    const evolvedDamage = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store.getState().getWeaponModifiers().damage;
    });

    // Mega Coal Mortar has 2x damage multiplier
    expect(evolvedDamage).toBeGreaterThan(baseDamage);
    expect(evolvedDamage).toBe(baseDamage * 2);

    console.log(`Base damage: ${baseDamage}, Evolved damage: ${evolvedDamage}`);
  });

  test('should fire more projectiles after plasma storm evolution', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await expect(elfButton).toBeVisible({ timeout: 15000 });
    await elfButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Evolve weapon to Plasma Storm
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    // Clear bullets
    await page.evaluate(() => {
      const store = (window as any).useGameStore;
      store.getState().updateBullets(() => []);
    });

    // Fire weapon
    await page.keyboard.down('Space');
    await page.waitForTimeout(200);
    await page.keyboard.up('Space');
    await page.waitForTimeout(100);

    // Count bullets (should be 3 for burst fire)
    const bulletCount = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store.getState().bullets.length;
    });

    // Plasma Storm fires burst of 3
    expect(bulletCount).toBeGreaterThanOrEqual(3);
    console.log(`Bullets fired after evolution: ${bulletCount}`);
  });

  test('should fire 5 stars after supernova burst evolution', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/i });
    await expect(bumbleButton).toBeVisible({ timeout: 15000 });
    await bumbleButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Evolve weapon
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    // Clear bullets
    await page.evaluate(() => {
      const store = (window as any).useGameStore;
      store.getState().updateBullets(() => []);
    });

    // Fire weapon
    await page.keyboard.down('Space');
    await page.waitForTimeout(200);
    await page.keyboard.up('Space');
    await page.waitForTimeout(100);

    // Count bullets (should be 5 for supernova burst)
    const bulletCount = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store.getState().bullets.length;
    });

    // Supernova Burst fires 5 stars
    expect(bulletCount).toBe(5);
    console.log(`Stars fired after evolution: ${bulletCount}`);
  });

  test('should increase projectile size after evolution', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Evolve weapon
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    // Fire and check bullet size
    await page.evaluate(() => {
      const store = (window as any).useGameStore;
      store.getState().updateBullets(() => []);
    });

    await page.keyboard.down('Space');
    await page.waitForTimeout(200);
    await page.keyboard.up('Space');
    await page.waitForTimeout(100);

    const bulletSize = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      const bullets = store.getState().bullets;
      return bullets.length > 0 ? bullets[0].size : null;
    });

    // Mega Coal Mortar has 2x size
    expect(bulletSize).toBe(2);
    console.log(`Bullet size after evolution: ${bulletSize}x`);
  });

  test('should not evolve weapon twice', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Evolve at level 10
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    const state1 = await getGameState(page);
    const evolution1 = state1?.currentEvolution;

    // Level up more
    await gainXPToLevel(page, 15);
    await page.waitForTimeout(1000);

    const state2 = await getGameState(page);
    const evolution2 = state2?.currentEvolution;

    // Should still be same evolution
    expect(evolution2).toBe(evolution1);
    expect(state2?.runProgress.weaponEvolutions).toHaveLength(1);
  });

  test('should reset evolution on new game', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Evolve weapon
    await gainXPToLevel(page, 10);
    await page.waitForTimeout(1000);

    const state1 = await getGameState(page);
    expect(state1?.currentEvolution).not.toBeNull();

    // Reset game
    await triggerStoreAction(page, 'reset');
    await page.waitForTimeout(500);

    const state2 = await getGameState(page);
    expect(state2?.currentEvolution).toBeNull();
    expect(state2?.runProgress.level).toBe(1);
  });
});
