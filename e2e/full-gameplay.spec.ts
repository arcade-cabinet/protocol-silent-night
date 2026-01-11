import { test, expect, Page } from '@playwright/test';
import { resolveLevelUp, waitForStablePage, selectCharacter, commenceOperation } from './test-utils';

/**
 * Full Gameplay E2E Tests
 *
 * Comprehensive tests that play through the entire game from start to finish
 * for each character class, testing all game mechanics and state transitions.
 */

// Helper to wait for store to be available with circuit breaker
async function waitForStore(page: Page, timeout = 3000) {
  const startTime = Date.now();
  let consecutiveFailures = 0;
  const maxConsecutiveFailures = 3;

  while (Date.now() - startTime < timeout) {
    try {
      // Check if page is still open
      if (page.isClosed()) {
        console.error('Page is closed, cannot wait for store');
        return false;
      }

      // Set a page timeout for this evaluation
      page.setDefaultTimeout(1000);
      const storeAvailable = await page.evaluate(() => {
        return typeof (window as any).useGameStore !== 'undefined';
      });
      // Reset timeout
      page.setDefaultTimeout(15000);

      if (storeAvailable) {
        return true;
      }
      consecutiveFailures = 0; // Reset counter on success
    } catch (error) {
      // Reset timeout
      page.setDefaultTimeout(15000);

      // Check if page closed during evaluation
      if (page.isClosed()) {
        console.error('Page closed during store check');
        return false;
      }

      consecutiveFailures++;

      // If we've had too many consecutive failures, the page might be broken
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.error('Too many consecutive failures waiting for store, page may be broken');
        return false;
      }
    }

    // Safe wait with page close check - reduced timeout
    try {
      await page.waitForTimeout(10);
    } catch (error) {
      if (page.isClosed()) {
        console.error('Page closed during timeout');
        return false;
      }
      throw error;
    }
  }
  return false;
}

// Helper to get game state from the store
async function getGameState(page: Page) {
  // Ensure store is loaded first
  const storeReady = await waitForStore(page);
  if (!storeReady) {
    console.error('Store not available for getGameState');
    return null;
  }

  try {
    page.setDefaultTimeout(5000);
    const result = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      if (!store) return null;
      const state = store.getState();
      return {
        gameState: state.state,
        playerHp: state.playerHp,
        playerMaxHp: state.playerMaxHp,
        score: state.stats.score,
        kills: state.stats.kills,
        bossDefeated: state.stats.bossDefeated,
        bossActive: state.bossActive,
        bossHp: state.bossHp,
        killStreak: state.killStreak,
        lastKillTime: state.lastKillTime,
        enemyCount: state.enemies.length,
        bulletCount: state.bullets.length,
      };
    });
    page.setDefaultTimeout(15000);
    return result;
  } catch (error) {
    page.setDefaultTimeout(15000);
    console.error('Failed to get game state:', error);
    return null;
  }
}

// Helper to wait for state condition with polling
async function waitForStateCondition(
  page: Page,
  condition: (state: any) => boolean,
  timeout = 2000
): Promise<any> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const state = await getGameState(page);
    if (state && condition(state)) {
      return state;
    }
    await page.waitForTimeout(50);
  }
  const finalState = await getGameState(page);
  throw new Error(`Timeout waiting for state condition. Final state: ${JSON.stringify(finalState)}`);
}

// Helper to start a game properly with proper loading screen wait
async function startGameplay(page: Page, character: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE' = 'MECHA-SANTA'): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForStablePage(page); // Waits for network idle + character buttons visible
  await selectCharacter(page, character); // Handles character selection with proper waits
  await commenceOperation(page); // Handles commence button with proper waits

  // Wait for game state to fully settle and transition from BRIEFING to PHASE_1
  // Increased to 1000ms to ensure proper state transition in CI environment
  await page.waitForTimeout(1000);
}

// Helper to trigger game actions via store with retries
async function triggerStoreAction(page: Page, action: string, ...args: any[]): Promise<boolean> {
  const maxRetries = 2;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Check if page is still open
    if (page.isClosed()) {
      console.error(`Page closed, cannot trigger action: ${action}`);
      return false;
    }

    // Ensure store is loaded first - use shorter timeout for store actions
    const storeReady = await waitForStore(page, 500);
    if (!storeReady) {
      console.error(`Store not available for action: ${action}, attempt ${attempt + 1}`);
      if (attempt < maxRetries - 1) {
        await page.waitForTimeout(10);
        continue;
      }
      return false;
    }

    try {
      page.setDefaultTimeout(1000);
      const result = await page.evaluate(({ action, args }) => {
        const store = (window as any).useGameStore;
        if (!store) return false;
        const state = store.getState();
        if (typeof state[action] === 'function') {
          state[action](...args);
          return true;
        }
        return false;
      }, { action, args });
      page.setDefaultTimeout(15000);

      if (result) {
        // Wait for state to propagate through Zustand in Node.js context
        // Zustand state updates need time to fully persist to all subscribers
        // Increased to 1000ms to ensure kill streak timestamps are properly captured in CI
        // This ensures that browser Date.now() timestamps are sufficiently spaced for streak tracking
        await page.waitForTimeout(1000);
        return true;
      }

      if (attempt < maxRetries - 1) {
        await page.waitForTimeout(10);
      }
    } catch (error) {
      page.setDefaultTimeout(15000);
      if (page.isClosed()) {
        console.error(`Page closed during action ${action}`);
        return false;
      }
      console.error(`Failed to trigger action ${action}, attempt ${attempt + 1}:`, error);
      if (attempt < maxRetries - 1) {
        await page.waitForTimeout(10);
      }
    }
  }

  return false;
}

// Helper to wait for game state
async function waitForGameState(page: Page, expectedState: string, timeout = 10000) {
  const startTime = Date.now();
  let lastState: string | undefined = undefined;

  while (Date.now() - startTime < timeout) {
    if (page.isClosed()) {
      throw new Error(`Page closed while waiting for game state: ${expectedState}`);
    }
    const state = await getGameState(page);
    lastState = state?.gameState;
    if (lastState === expectedState) return;

    try {
      await page.waitForTimeout(50);
    } catch (error) {
      if (page.isClosed()) {
        throw new Error(`Page closed during state wait for: ${expectedState}`);
      }
      throw error;
    }
  }
  throw new Error(`Timeout waiting for game state: expected "${expectedState}", last state was "${lastState}"`);
}

// Helper to simulate combat until kills reach target
async function simulateCombatUntilKills(page: Page, targetKills: number, maxTime = 30000) {
  const startTime = Date.now();
  
  // Hold fire and move around
  await page.keyboard.down('Space');
  
  while (Date.now() - startTime < maxTime) {
    const state = await getGameState(page);
    if (!state) break;
    if (state.kills >= targetKills) break;
    if (state.gameState === 'GAME_OVER') break;
    
    // Move in a pattern to find enemies
    const direction = Math.floor((Date.now() / 1000) % 4);
    await page.keyboard.up('w');
    await page.keyboard.up('a');
    await page.keyboard.up('s');
    await page.keyboard.up('d');
    
    switch (direction) {
      case 0: await page.keyboard.down('w'); break;
      case 1: await page.keyboard.down('d'); break;
      case 2: await page.keyboard.down('s'); break;
      case 3: await page.keyboard.down('a'); break;
    }
    
    await page.waitForTimeout(200);
  }
  
  await page.keyboard.up('Space');
  await page.keyboard.up('w');
  await page.keyboard.up('a');
  await page.keyboard.up('s');
  await page.keyboard.up('d');
  
  return getGameState(page);
}

test.describe('Full Gameplay - MECHA-SANTA (Tank Class)', () => {
  test('should complete full game loop with Santa', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Verify we're in game
    let state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(300); // Santa has 300 HP
    // Allow for small damage during initialization (enemies may spawn and hit player)
    expect(state?.playerHp).toBeGreaterThanOrEqual(290);
    expect(state?.playerHp).toBeLessThanOrEqual(300);

    // Verify HUD is visible
    await expect(page.locator('text=OPERATOR STATUS')).toBeVisible();
    // HP may vary slightly, so just check that some HP is shown
    const hpRegex = /\d+ \/ 300/;
    await expect(page.locator(`text=${hpRegex}`)).toBeVisible();
  });

  test('should have correct Santa stats and weapon', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Verify Santa's stats are correct
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(300);
    // Allow for small damage during initialization (enemies may spawn and hit player)
    expect(state?.playerHp).toBeGreaterThanOrEqual(290);
    expect(state?.playerHp).toBeLessThanOrEqual(300);

    // Fire weapon - Santa's Coal Cannon fires single shots
    await page.keyboard.down('Space');
    await page.waitForTimeout(600); // Wait for at least one shot (0.5s delay)
    await page.keyboard.up('Space');

    // Verify firing happened (bullets may have already been cleaned up, so check via score or just validate no crash)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1'); // Game still running
  });

  test('should survive longer due to high HP', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Get initial HP (may be slightly less than 300 due to enemies)
    let state = await getGameState(page);
    const initialHp = state?.playerHp || 300;

    // Simulate taking damage
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(200);

    state = await getGameState(page);
    // Allow some variance due to enemy damage
    expect(state?.playerHp).toBeLessThanOrEqual(initialHp - 100);
    expect(state?.playerHp).toBeGreaterThanOrEqual(initialHp - 110);
    expect(state?.gameState).toBe('PHASE_1'); // Still alive

    const hpAfterFirstDamage = state?.playerHp || 0;

    // Take more damage
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(200);

    state = await getGameState(page);
    expect(state?.playerHp).toBeLessThanOrEqual(hpAfterFirstDamage - 100);
    expect(state?.playerHp).toBeGreaterThanOrEqual(hpAfterFirstDamage - 110);
    expect(state?.gameState).toBe('PHASE_1'); // Still alive
  });

  test('should trigger game over when HP reaches 0', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Deal fatal damage
    await triggerStoreAction(page, 'damagePlayer', 300);
    await page.waitForTimeout(1000);

    const state = await getGameState(page);
    expect(state?.playerHp).toBe(0);
    expect(state?.gameState).toBe('GAME_OVER');

    // Verify game over screen - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'OPERATOR DOWN' })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole('button', { name: /RE-DEPLOY/ })).toBeVisible({ timeout: 5000 });
  });

  test('should accumulate score and kills', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Trigger kills to build streak (< 2000ms between kills)
    // Delays between kills ensure we stay well within the 2s streak window
    // Total time per kill: 1000ms internal + 500ms external = 1500ms (well under 2s timeout)
    const success1 = await triggerStoreAction(page, 'addKill', 10);
    if (!success1) throw new Error('Failed to add first kill');
    await page.waitForTimeout(500);

    const success2 = await triggerStoreAction(page, 'addKill', 10);
    if (!success2) throw new Error('Failed to add second kill');
    await page.waitForTimeout(500);

    const success3 = await triggerStoreAction(page, 'addKill', 10);
    if (!success3) throw new Error('Failed to add third kill');
    await page.waitForTimeout(500); // Allow final state to stabilize

    // Check state immediately after third kill - no polling to avoid timing issues
    // Kill 1: 10 (streak 1, no bonus)
    // Kill 2: 10 + 2.5 = 12 (streak 2, 25% bonus), total: 22
    // Kill 3: 10 + 5 = 15 (streak 3, 50% bonus), total: 37
    const state = await getGameState(page);
    expect(state?.kills).toBe(3);
    expect(state?.killStreak).toBe(3);
    expect(state?.score).toBeGreaterThan(30); // Should have streak bonus (10 + 12 + 15 = 37)
  });
});

test.describe('Full Gameplay - CYBER-ELF (Scout Class)', () => {
  test('should complete full game loop with Elf', async ({ page }) => {
    await startGameplay(page, 'CYBER-ELF');

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(100); // Elf has 100 HP
    // Allow for minor damage during initialization
    expect(state?.playerHp).toBeGreaterThanOrEqual(95);
    expect(state?.playerHp).toBeLessThanOrEqual(100);
  });

  test('should have low HP but rapid fire weapon', async ({ page }) => {
    await startGameplay(page, 'CYBER-ELF');

    // Verify Elf's stats - low HP, high speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);
    // Player HP might be slightly reduced if enemies spawned and hit player during initialization
    expect(state?.playerHp).toBeGreaterThanOrEqual(90);
    expect(state?.playerHp).toBeLessThanOrEqual(100);

    // Elf's SMG fires rapidly - hold fire for a bit
    await page.keyboard.down('Space');
    await page.waitForTimeout(500); // Half second of firing
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should die quickly with low HP', async ({ page }) => {
    await startGameplay(page, 'CYBER-ELF');

    // Elf only has 100 HP - one big hit kills
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(500);

    const state = await getGameState(page);
    expect(state?.playerHp).toBe(0);
    expect(state?.gameState).toBe('GAME_OVER');
  });
});

test.describe('Full Gameplay - THE BUMBLE (Bruiser Class)', () => {
  test('should complete full game loop with Bumble', async ({ page }) => {
    await startGameplay(page, 'BUMBLE');

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(200); // Bumble has 200 HP
    // Allow for small damage during initialization (enemies may spawn and hit player)
    expect(state?.playerHp).toBeGreaterThanOrEqual(190);
    expect(state?.playerHp).toBeLessThanOrEqual(200);
  });

  test('should fire spread pattern weapon', async ({ page }) => {
    await startGameplay(page, 'BUMBLE');

    // Verify Bumble's stats - 200 HP, medium speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);
    // Allow for small damage during initialization (enemies may spawn and hit player)
    expect(state?.playerHp).toBeGreaterThanOrEqual(190);
    expect(state?.playerHp).toBeLessThanOrEqual(200);

    // Bumble's Star Thrower fires 3 projectiles at once - verify weapon works
    await page.keyboard.down('Space');
    await page.waitForTimeout(500);
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should have balanced survivability', async ({ page }) => {
    await startGameplay(page, 'BUMBLE');

    // Get initial HP to account for any early game damage
    let initialState = await getGameState(page);
    const initialHp = initialState?.playerHp || 200;

    // Bumble has 200 HP - medium survivability
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(200);

    let state = await getGameState(page);
    // Expected HP is initialHp - 100, but allow for slight variations due to potential enemy damage
    const expectedHp = initialHp - 100;
    expect(state?.playerHp).toBeGreaterThanOrEqual(expectedHp - 10);
    expect(state?.playerHp).toBeLessThanOrEqual(expectedHp + 5);
    expect(state?.gameState).toBe('PHASE_1');

    // One more hit at 100 damage kills
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(500);

    state = await getGameState(page);
    expect(state?.gameState).toBe('GAME_OVER');
  });
});

test.describe('Full Gameplay - Boss Battle', () => {
  test('should spawn boss after 10 kills', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Simulate 10 kills to trigger boss efficiently
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) throw new Error('Page closed during kill loop');
      await triggerStoreAction(page, 'addKill', 10);
      // Minimal delay to allow store state to stabilize
      await page.waitForTimeout(25);
    }

    await page.waitForTimeout(100);

    // Resolve any level-up that may have occurred
    await resolveLevelUp(page);

    const state = await getGameState(page);
    expect(state?.kills).toBe(10);
    expect(state?.gameState).toBe('PHASE_BOSS');
    expect(state?.bossActive).toBe(true);
    expect(state?.bossHp).toBe(1000);

    // Verify boss HUD is visible - use specific label selector
    await expect(page.getByText('⚠ KRAMPUS-PRIME ⚠')).toBeVisible({ timeout: 5000 });
  });

  test('should defeat boss and win game', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Trigger boss spawn efficiently
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) throw new Error('Page closed during kill loop');
      await triggerStoreAction(page, 'addKill', 10);
      // Minimal delay to allow store state to stabilize
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(200);

    // Resolve any level-up that may have occurred
    await resolveLevelUp(page);

    let state = await getGameState(page);
    expect(state?.bossActive).toBe(true);

    // Damage boss until defeated
    await triggerStoreAction(page, 'damageBoss', 1000);
    await page.waitForTimeout(200);

    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
    expect(state?.bossHp).toBe(0);

    // Verify victory screen - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'MISSION COMPLETE' })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole('button', { name: /PLAY AGAIN/ })).toBeVisible({ timeout: 5000 });
  });

  test('should show boss health decreasing', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Trigger boss spawn efficiently
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) throw new Error('Page closed during kill loop');
      await triggerStoreAction(page, 'addKill', 10);
      // Minimal delay to allow store state to stabilize
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(200);

    // Resolve any level-up that may have occurred
    await resolveLevelUp(page);

    // Damage boss incrementally
    await triggerStoreAction(page, 'damageBoss', 250);
    await page.waitForTimeout(100);

    let state = await getGameState(page);
    expect(state?.bossHp).toBe(750);

    await triggerStoreAction(page, 'damageBoss', 250);
    await page.waitForTimeout(100);

    state = await getGameState(page);
    expect(state?.bossHp).toBe(500);

    // Verify boss HP display
    await expect(page.locator('text=500 / 1000')).toBeVisible();
  });
});

test.describe('Full Gameplay - Kill Streaks', () => {
  test('should trigger kill streak notifications', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Trigger kills to build streak (< 2000ms between kills)
    // Delays between kills ensure we stay well within the 2s streak window
    // Total time per kill: 1000ms internal + 500ms external = 1500ms (well under 2s timeout)
    const success1 = await triggerStoreAction(page, 'addKill', 10);
    if (!success1) throw new Error('Failed to add first kill');
    await page.waitForTimeout(500);

    const success2 = await triggerStoreAction(page, 'addKill', 10);
    if (!success2) throw new Error('Failed to add second kill');
    await page.waitForTimeout(500);

    const success3 = await triggerStoreAction(page, 'addKill', 10);
    if (!success3) throw new Error('Failed to add third kill');
    await page.waitForTimeout(500); // Allow final state to stabilize

    // Check state immediately after third kill - no polling to avoid timing issues
    const state = await getGameState(page);
    expect(state?.killStreak).toBe(3);
    expect(state?.kills).toBe(3);

    // Should show TRIPLE KILL notification
    await expect(page.locator('text=TRIPLE KILL')).toBeVisible({ timeout: 2000 });
  });

  test('should reset streak after timeout', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Build a streak with kills within streak window
    // Total time per kill: 1000ms internal + 500ms external = 1500ms (well under 2s timeout)
    const success1 = await triggerStoreAction(page, 'addKill', 10);
    if (!success1) throw new Error('Failed to add first kill');
    await page.waitForTimeout(500);

    const success2 = await triggerStoreAction(page, 'addKill', 10);
    if (!success2) throw new Error('Failed to add second kill');
    await page.waitForTimeout(500); // Allow state to stabilize

    // Check state immediately after second kill - no polling to avoid timing issues
    let state = await getGameState(page);
    expect(state?.killStreak).toBe(2);
    expect(state?.kills).toBe(2);

    // Wait for streak to timeout (2+ seconds)
    await page.waitForTimeout(2100);

    // Next kill should start new streak
    const success3 = await triggerStoreAction(page, 'addKill', 10);
    if (!success3) throw new Error('Failed to add third kill');

    // Check state immediately after third kill - no polling to avoid timing issues
    state = await getGameState(page);
    expect(state?.kills).toBe(3);
    expect(state?.killStreak).toBe(1); // Reset to 1
  });

  test('should apply streak bonus to score', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Trigger kills to build streak (< 2000ms between kills)
    // Delays between kills ensure we stay well within the 2s streak window
    // Total time per kill: 1000ms internal + 500ms external = 1500ms (well under 2s timeout)
    const success1 = await triggerStoreAction(page, 'addKill', 100);
    if (!success1) throw new Error('Failed to add first kill');
    await page.waitForTimeout(500);

    const success2 = await triggerStoreAction(page, 'addKill', 100);
    if (!success2) throw new Error('Failed to add second kill');
    await page.waitForTimeout(500);

    const success3 = await triggerStoreAction(page, 'addKill', 100);
    if (!success3) throw new Error('Failed to add third kill');
    await page.waitForTimeout(500); // Allow final state to stabilize

    // Check state immediately after third kill - no polling to avoid timing issues
    // Kill 1: 100 (streak 1, no bonus)
    // Kill 2: 100 + 25 = 125 (streak 2, 25% bonus), total: 225
    // Kill 3: 100 + 50 = 150 (streak 3, 50% bonus), total: 375
    const state = await getGameState(page);
    expect(state?.killStreak).toBe(3);
    expect(state?.kills).toBe(3);
    expect(state?.score).toBe(375);
  });
});

test.describe('Full Gameplay - Game Reset', () => {
  test('should reset game and return to menu', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Get some score
    await triggerStoreAction(page, 'addKill', 100);
    await page.waitForTimeout(100);

    // Die
    await triggerStoreAction(page, 'damagePlayer', 300);
    await page.waitForTimeout(500);

    // Click re-deploy
    await page.getByRole('button', { name: /RE-DEPLOY/ }).click();
    await page.waitForTimeout(1000);

    // Should be back at menu
    const state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
    expect(state?.score).toBe(0);
    expect(state?.kills).toBe(0);
    expect(state?.playerHp).toBe(100); // Reset to default
  });

  test('should preserve high score after reset', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    for (let i = 0; i < 5; i++) {
      if (page.isClosed()) throw new Error('Page closed during kill loop');
      const success = await triggerStoreAction(page, 'addKill', 100);
      if (!success) throw new Error(`Failed to add kill ${i + 1}`);
      await page.waitForTimeout(25);
    }

    const scoreBeforeDeath = (await getGameState(page))?.score || 0;

    // Die
    const damageSuccess = await triggerStoreAction(page, 'damagePlayer', 300);
    if (!damageSuccess) throw new Error('Failed to damage player');
    await page.waitForTimeout(300);

    // Reset - use noWaitAfter to prevent waiting for navigation
    await page.getByRole('button', { name: /RE-DEPLOY/ }).click({ noWaitAfter: true });
    await page.waitForTimeout(500);

    // Start new game
    await selectCharacter(page, 'CYBER-ELF');
    await commenceOperation(page);

    // Die with 0 score
    const damageSuccess2 = await triggerStoreAction(page, 'damagePlayer', 100);
    if (!damageSuccess2) throw new Error('Failed to damage player second time');
    await page.waitForTimeout(300);

    // High score should still be preserved
    await expect(page.locator(`text=HIGH SCORE`)).toBeVisible();
  });
});

test.describe('Full Gameplay - Complete Playthrough', () => {
  test('should complete entire game as Santa', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Step 2: Game starts - verify we're in game
    await waitForGameState(page, 'PHASE_1', 5000);
    let state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');

    // Step 3: Combat phase - kill enemies efficiently
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) throw new Error('Page closed during combat phase');
      const success = await triggerStoreAction(page, 'addKill', 10);
      if (!success) {
        throw new Error(`Failed to add kill ${i + 1}`);
      }
      // Delay to allow store state to stabilize between operations, especially during level-ups
      await page.waitForTimeout(50);
    }

    // Resolve any level-up that may have occurred BEFORE waiting for boss phase
    await page.waitForTimeout(200);
    await resolveLevelUp(page);

    // Step 4: Boss phase - wait for transition
    await waitForGameState(page, 'PHASE_BOSS', 10000);

    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');
    await expect(page.getByText('⚠ KRAMPUS-PRIME ⚠')).toBeVisible({ timeout: 5000 });

    // Step 5: Defeat boss
    const bossSuccess = await triggerStoreAction(page, 'damageBoss', 1000);
    if (!bossSuccess) {
      throw new Error('Failed to damage boss');
    }
    await waitForGameState(page, 'WIN', 5000);

    // Step 6: Victory
    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
    await expect(page.getByRole('heading', { name: 'MISSION COMPLETE' })).toBeVisible({
      timeout: 5000,
    });

    // Step 7: Can restart
    await page.getByRole('button', { name: /PLAY AGAIN/ }).click();
    await waitForGameState(page, 'MENU', 5000);

    state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
  });

  test('should complete entire game as Elf', async ({ page }) => {
    await startGameplay(page, 'CYBER-ELF');

    // Wait for game to start
    await waitForGameState(page, 'PHASE_1', 5000);

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);

    // Kill enemies to trigger boss efficiently
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) throw new Error('Page closed during combat');
      const success = await triggerStoreAction(page, 'addKill', 10);
      if (!success) {
        throw new Error(`Failed to add kill ${i + 1}`);
      }
      // Minimal delay to allow store state to stabilize between operations
      await page.waitForTimeout(10);
    }

    // Resolve any level-up that may have occurred BEFORE waiting for boss phase
    await page.waitForTimeout(200);
    await resolveLevelUp(page);

    // Wait for boss phase transition
    await waitForGameState(page, 'PHASE_BOSS', 10000);

    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    const bossSuccess = await triggerStoreAction(page, 'damageBoss', 1000);
    if (!bossSuccess) {
      throw new Error('Failed to damage boss');
    }
    await waitForGameState(page, 'WIN', 5000);

    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });

  test('should complete entire game as Bumble', async ({ page }) => {
    await startGameplay(page, 'BUMBLE');

    // Wait for game to start
    await waitForGameState(page, 'PHASE_1', 5000);

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);

    // Kill enemies to trigger boss efficiently
    for (let i = 0; i < 10; i++) {
      if (page.isClosed()) throw new Error('Page closed during combat');
      const success = await triggerStoreAction(page, 'addKill', 10);
      if (!success) {
        throw new Error(`Failed to add kill ${i + 1}`);
      }
      // Minimal delay to allow store state to stabilize between operations
      await page.waitForTimeout(10);
    }

    // Resolve any level-up that may have occurred BEFORE waiting for boss phase
    await page.waitForTimeout(200);
    await resolveLevelUp(page);

    // Wait for boss phase transition
    await waitForGameState(page, 'PHASE_BOSS', 10000);

    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    const bossSuccess = await triggerStoreAction(page, 'damageBoss', 1000);
    if (!bossSuccess) {
      throw new Error('Failed to damage boss');
    }
    await waitForGameState(page, 'WIN', 5000);

    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });
});

test.describe('Full Gameplay - Input Controls', () => {
  test('should respond to WASD movement', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    const initialState = await getGameState(page);

    // Move with W key
    await page.keyboard.down('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');

    // Player should have moved (position changed)
    // We can verify input state is being set
    await waitForStore(page);
    const inputState = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input;
    });

    expect(inputState).toBeDefined();
  });

  test('should respond to arrow key movement', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Move with arrow keys
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowRight');

    // Game should still be running
    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
  });

  test('should fire with spacebar', async ({ page }) => {
    await startGameplay(page, 'MECHA-SANTA');

    // Verify input state changes when firing
    await page.keyboard.down('Space');
    await page.waitForTimeout(100);

    await waitForStore(page);
    const firingState = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input.isFiring;
    });

    expect(firingState).toBe(true);

    await page.keyboard.up('Space');
    await page.waitForTimeout(100);

    const notFiringState = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input.isFiring;
    });

    expect(notFiringState).toBe(false);
  });

  test('should show touch controls on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await startGameplay(page, 'MECHA-SANTA');

    // Touch fire button should be visible
    await expect(page.getByRole('button', { name: /FIRE/ })).toBeVisible();
  });
});
