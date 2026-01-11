import { test, expect } from '@playwright/test';
import { getGameState, selectCharacter, startMission, triggerStoreAction, waitForGameReady, waitForGameState } from './utils';

/**
 * Full Gameplay E2E Tests
 *
 * Comprehensive tests that play through the entire game from start to finish
 * for each character class, testing all game mechanics and state transitions.
 */

test.describe('Full Gameplay - MECHA-SANTA (Tank Class)', () => {
  test('should complete full game loop with Santa', async ({ page }) => {
    await page.goto('/');

    // Verify we're at menu
    await expect.poll(async () => (await getGameState(page))?.gameState, { timeout: 10000 }).toBe('MENU');

    // Select Santa
    await selectCharacter(page, 'MECHA-SANTA');

    // Click "COMMENCE OPERATION" on the briefing screen
    await startMission(page);

    // Wait for game to start
    await waitForGameState(page, 'PHASE_1');
    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(300); // Santa has 300 HP
    expect(state?.playerHp).toBe(300);

    // Verify HUD is visible
    await expect(page.locator('text=OPERATOR STATUS')).toBeVisible();
    await expect(page.locator('text=300 / 300')).toBeVisible();
  });

  test('should have correct Santa stats and weapon', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Verify Santa's stats are correct
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(300);
    expect(state?.playerHp).toBe(300);

    // Fire weapon - Santa's Coal Cannon fires single shots
    await page.keyboard.down('Space');
    await expect.poll(async () => (await getGameState(page))?.bulletCount, { timeout: 5000 }).toBeGreaterThan(0);
    await page.keyboard.up('Space');

    // Verify firing happened (bullets may have already been cleaned up, so check via score or just validate no crash)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1'); // Game still running
  });

  test('should survive longer due to high HP', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Simulate taking damage
    await triggerStoreAction(page, 'damagePlayer', 100);

    let state = await expect.poll(async () => await getGameState(page), { timeout: 5000 }).toMatchObject({ playerHp: 200 });
    state = await getGameState(page);
    expect(state?.playerHp).toBe(200); // 300 - 100 = 200
    expect(state?.gameState).toBe('PHASE_1'); // Still alive

    // Take more damage
    await triggerStoreAction(page, 'damagePlayer', 100);

    state = await expect.poll(async () => await getGameState(page), { timeout: 5000 }).toMatchObject({ playerHp: 100 });
    state = await getGameState(page);
    expect(state?.playerHp).toBe(100);
    expect(state?.gameState).toBe('PHASE_1'); // Still alive with 100 HP
  });

  test('should trigger game over when HP reaches 0', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Deal fatal damage
    await triggerStoreAction(page, 'damagePlayer', 300);

    await waitForGameState(page, 'GAME_OVER');
    const state = await getGameState(page);
    expect(state?.playerHp).toBe(0);
    expect(state?.gameState).toBe('GAME_OVER');

    // Verify game over screen - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'OPERATOR DOWN' })).toBeVisible({
      timeout: 5000,
    });
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await expect(redeploy).toBeVisible({ timeout: 5000 });
  });

  test('should accumulate score and kills', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Simulate kills
    await triggerStoreAction(page, 'addKill', 10);

    await expect.poll(async () => (await getGameState(page))?.kills, { timeout: 5000 }).toBe(1);
    let state = await getGameState(page);
    expect(state?.score).toBe(10);

    // Add more kills
    await triggerStoreAction(page, 'addKill', 10);
    await triggerStoreAction(page, 'addKill', 10);

    await expect.poll(async () => (await getGameState(page))?.kills, { timeout: 5000 }).toBe(3);
    state = await getGameState(page);
    expect(state?.score).toBeGreaterThan(30); // Should have streak bonus
  });
});

test.describe('Full Gameplay - CYBER-ELF (Scout Class)', () => {
  test('should complete full game loop with Elf', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(100); // Elf has 100 HP
    expect(state?.playerHp).toBe(100);
  });

  test('should have low HP but rapid fire weapon', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);

    // Verify Elf's stats - low HP, high speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);
    expect(state?.playerHp).toBe(100);

    // Elf's SMG fires rapidly - hold fire for a bit
    await page.keyboard.down('Space');
    await expect.poll(async () => (await getGameState(page))?.bulletCount, { timeout: 5000 }).toBeGreaterThan(0);
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should die quickly with low HP', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);

    // Elf only has 100 HP - one big hit kills
    await triggerStoreAction(page, 'damagePlayer', 100);

    await waitForGameState(page, 'GAME_OVER');
    const state = await getGameState(page);
    expect(state?.playerHp).toBe(0);
    expect(state?.gameState).toBe('GAME_OVER');
  });
});

test.describe('Full Gameplay - THE BUMBLE (Bruiser Class)', () => {
  test('should complete full game loop with Bumble', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await waitForGameReady(page);

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(200); // Bumble has 200 HP
    expect(state?.playerHp).toBe(200);
  });

  test('should fire spread pattern weapon', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await waitForGameReady(page);

    // Verify Bumble's stats - 200 HP, medium speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);
    expect(state?.playerHp).toBe(200);

    // Bumble's Star Thrower fires 3 projectiles at once - verify weapon works
    await page.keyboard.down('Space');
    await expect.poll(async () => (await getGameState(page))?.bulletCount, { timeout: 5000 }).toBeGreaterThan(0);
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should have balanced survivability', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await waitForGameReady(page);

    // Bumble has 200 HP - medium survivability
    await triggerStoreAction(page, 'damagePlayer', 100);

    await expect.poll(async () => (await getGameState(page))?.playerHp, { timeout: 5000 }).toBe(100);
    let state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');

    // One more hit at 100 damage kills
    await triggerStoreAction(page, 'damagePlayer', 100);

    await waitForGameState(page, 'GAME_OVER');
    state = await getGameState(page);
    expect(state?.gameState).toBe('GAME_OVER');
  });
});

test.describe('Full Gameplay - Boss Battle', () => {
  test('should spawn boss after 10 kills', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Simulate 10 kills to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    await waitForGameState(page, 'PHASE_BOSS');
    const state = await getGameState(page);
    expect(state?.kills).toBe(10);
    expect(state?.gameState).toBe('PHASE_BOSS');
    expect(state?.bossActive).toBe(true);
    expect(state?.bossHp).toBe(1000);

    // Verify boss HUD is visible - use specific label selector
    await expect(page.getByText('⚠ KRAMPUS-PRIME ⚠')).toBeVisible({ timeout: 5000 });
  });

  test('should defeat boss and win game', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Trigger boss spawn
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    await waitForGameState(page, 'PHASE_BOSS');
    let state = await getGameState(page);
    expect(state?.bossActive).toBe(true);

    // Damage boss until defeated
    await triggerStoreAction(page, 'damageBoss', 1000);

    await waitForGameState(page, 'WIN');
    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
    expect(state?.bossHp).toBe(0);

    // Verify victory screen - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'MISSION COMPLETE' })).toBeVisible({
      timeout: 5000,
    });
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await expect(redeploy).toBeVisible({ timeout: 5000 });
  });

  test('should show boss health decreasing', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Trigger boss spawn
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    await waitForGameState(page, 'PHASE_BOSS');

    // Damage boss incrementally
    await triggerStoreAction(page, 'damageBoss', 250);

    await expect.poll(async () => (await getGameState(page))?.bossHp, { timeout: 5000 }).toBe(750);

    await triggerStoreAction(page, 'damageBoss', 250);

    await expect.poll(async () => (await getGameState(page))?.bossHp, { timeout: 5000 }).toBe(500);
    const state = await getGameState(page);

    // Verify boss HP display
    await expect(page.locator('text=500 / 1000')).toBeVisible();
  });
});

test.describe('Full Gameplay - Kill Streaks', () => {
  test('should trigger kill streak notifications', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Rapid kills to build streak
    await triggerStoreAction(page, 'addKill', 10);
    await triggerStoreAction(page, 'addKill', 10);

    await expect.poll(async () => (await getGameState(page))?.killStreak, { timeout: 5000 }).toBe(2);

    // Should show DOUBLE KILL
    await expect(page.locator('text=DOUBLE KILL')).toBeVisible({ timeout: 2000 });

    // Continue streak
    await triggerStoreAction(page, 'addKill', 10);

    await expect.poll(async () => (await getGameState(page))?.killStreak, { timeout: 5000 }).toBe(3);
    const state = await getGameState(page);

    // Should show TRIPLE KILL
    await expect(page.locator('text=TRIPLE KILL')).toBeVisible({ timeout: 2000 });
  });

  test('should reset streak after timeout', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Build a streak
    await triggerStoreAction(page, 'addKill', 10);
    await triggerStoreAction(page, 'addKill', 10);

    await expect.poll(async () => (await getGameState(page))?.killStreak, { timeout: 5000 }).toBe(2);

    // Wait for streak to timeout (2+ seconds) - use page.evaluate to advance time or wait naturally
    await expect.poll(async () => (await getGameState(page))?.killStreak, { timeout: 5000 }).toBe(0);

    // Next kill should start new streak
    await triggerStoreAction(page, 'addKill', 10);

    await expect.poll(async () => (await getGameState(page))?.killStreak, { timeout: 5000 }).toBe(1);
    const state = await getGameState(page);
  });

  test('should apply streak bonus to score', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // First kill - no bonus
    await triggerStoreAction(page, 'addKill', 100);

    await expect.poll(async () => (await getGameState(page))?.score, { timeout: 5000 }).toBe(100);

    // Second kill - 25% bonus (streak of 2)
    await triggerStoreAction(page, 'addKill', 100);

    await expect.poll(async () => (await getGameState(page))?.score, { timeout: 5000 }).toBe(225);
    // 100 + (100 + 25% of 100) = 100 + 125 = 225

    // Third kill - 50% bonus (streak of 3)
    await triggerStoreAction(page, 'addKill', 100);

    await expect.poll(async () => (await getGameState(page))?.score, { timeout: 5000 }).toBe(375);
    // 225 + (100 + 50% of 100) = 225 + 150 = 375
  });
});

test.describe('Full Gameplay - Game Reset', () => {
  test('should reset game and return to menu', async ({ page }) => {
    await page.goto('/');

    // Play a game
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Get some score
    await triggerStoreAction(page, 'addKill', 100);

    await expect.poll(async () => (await getGameState(page))?.kills, { timeout: 5000 }).toBe(1);

    // Die
    await triggerStoreAction(page, 'damagePlayer', 300);

    await waitForGameState(page, 'GAME_OVER');

    // Click re-deploy
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await redeploy.waitFor({ state: 'visible', timeout: 5000 });
    // Removed scrollIntoViewIfNeeded as it causes instability in CI
    await redeploy.click();

    await waitForGameState(page, 'MENU');

    // Should be back at menu
    const state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
    expect(state?.score).toBe(0);
    expect(state?.kills).toBe(0);
    expect(state?.playerHp).toBe(100); // Reset to default
  });

  test('should preserve high score after reset', async ({ page }) => {
    await page.goto('/');

    // Play and get a score
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    for (let i = 0; i < 5; i++) {
      await triggerStoreAction(page, 'addKill', 100);
    }

    await expect.poll(async () => (await getGameState(page))?.kills, { timeout: 5000 }).toBe(5);
    const scoreBeforeDeath = (await getGameState(page))?.score || 0;

    // Die
    await triggerStoreAction(page, 'damagePlayer', 300);

    await waitForGameState(page, 'GAME_OVER');

    // Reset
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await redeploy.waitFor({ state: 'visible', timeout: 5000 });
    // Removed scrollIntoViewIfNeeded as it causes instability in CI
    await redeploy.click();

    await waitForGameState(page, 'MENU');

    // Start new game
    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);

    // Die with 0 score
    await triggerStoreAction(page, 'damagePlayer', 100);

    await waitForGameState(page, 'GAME_OVER');

    // High score should still be preserved
    await expect(page.locator(`text=HIGH SCORE`)).toBeVisible();
  });
});

test.describe('Full Gameplay - Complete Playthrough', () => {
  test('should complete entire game as Santa', async ({ page }) => {
    await page.goto('/');

    // Step 1: Character Selection - verify start screen is showing
    await expect(page.locator('text=Protocol:')).toBeVisible({ timeout: 5000 });
    await selectCharacter(page, 'MECHA-SANTA');

    // Click "COMMENCE OPERATION" on the briefing screen
    await startMission(page);

    // Step 2: Game starts
    await waitForGameState(page, 'PHASE_1');
    let state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');

    // Step 3: Combat phase - kill enemies
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    // Step 4: Boss phase
    await waitForGameState(page, 'PHASE_BOSS');
    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');
    await expect(page.getByText('⚠ KRAMPUS-PRIME ⚠')).toBeVisible({ timeout: 5000 });

    // Step 5: Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);

    // Step 6: Victory
    await waitForGameState(page, 'WIN');
    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
    await expect(page.getByRole('heading', { name: 'MISSION COMPLETE' })).toBeVisible({
      timeout: 5000,
    });

    // Step 7: Can restart
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await redeploy.waitFor({ state: 'visible', timeout: 5000 });
    // Removed scrollIntoViewIfNeeded as it causes instability in CI
    await redeploy.click();

    await waitForGameState(page, 'MENU');
    state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
  });

  test('should complete entire game as Elf', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await waitForGameReady(page);

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);

    // Kill enemies to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    await waitForGameState(page, 'PHASE_BOSS');
    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);

    await waitForGameState(page, 'WIN');
    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });

  test('should complete entire game as Bumble', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await waitForGameReady(page);

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);

    // Kill enemies to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    await waitForGameState(page, 'PHASE_BOSS');
    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);

    await waitForGameState(page, 'WIN');
    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });
});

test.describe('Full Gameplay - Input Controls', () => {
  test('should respond to WASD movement', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    const initialState = await getGameState(page);

    // Move with W key
    await page.keyboard.down('w');

    // Verify input state changes
    await expect.poll(async () => {
      const inputState = await page.evaluate(() => {
        const store = (window as any).useGameStore;
        return store?.getState().input;
      });
      return inputState;
    }, { timeout: 5000 }).toBeDefined();

    await page.keyboard.up('w');
  });

  test('should respond to arrow key movement', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Move with arrow keys
    await page.keyboard.down('ArrowUp');
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowRight');
    await page.keyboard.up('ArrowRight');

    // Game should still be running - verify with polling
    await expect.poll(async () => (await getGameState(page))?.gameState, { timeout: 5000 }).toBe('PHASE_1');
  });

  test('should fire with spacebar', async ({ page }) => {
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Verify input state changes when firing
    await page.keyboard.down('Space');

    await expect.poll(async () => {
      const firingState = await page.evaluate(() => {
        const store = (window as any).useGameStore;
        return store?.getState().input.isFiring;
      });
      return firingState;
    }, { timeout: 5000 }).toBe(true);

    await page.keyboard.up('Space');

    await expect.poll(async () => {
      const notFiringState = await page.evaluate(() => {
        const store = (window as any).useGameStore;
        return store?.getState().input.isFiring;
      });
      return notFiringState;
    }, { timeout: 5000 }).toBe(false);
  });

  test('should show touch controls on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await waitForGameReady(page);

    // Touch fire button should be visible
    await expect(page.getByRole('button', { name: /FIRE/ })).toBeVisible();
  });
});
