import { test, expect } from '@playwright/test';
import { getGameState, selectCharacter, startMission, triggerStoreAction } from './utils';

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
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    // Select Santa
    await selectCharacter(page, 'MECHA-SANTA');

    // Click "COMMENCE OPERATION" on the briefing screen
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(300); // Santa has 300 HP
    expect(state?.playerHp).toBe(300);

    // Verify HUD is visible
    await expect(page.locator('text=OPERATOR STATUS')).toBeVisible();
    await expect(page.locator('text=300 / 300')).toBeVisible();
  });

  test('should have correct Santa stats and weapon', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Verify Santa's stats are correct
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(300);
    expect(state?.playerHp).toBe(300);

    // Fire weapon - Santa's Coal Cannon fires single shots
    await page.keyboard.down('Space');
    // Wait for bullet to be created
    await expect.poll(async () => (await getGameState(page))?.bulletCount).toBeGreaterThan(0);
    await page.keyboard.up('Space');

    // Verify firing happened (bullets may have already been cleaned up, so check via score or just validate no crash)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1'); // Game still running
  });

  test('should survive longer due to high HP', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Simulate taking damage
    await triggerStoreAction(page, 'damagePlayer', 100);
    // Wait for HP to update
    await expect.poll(async () => (await getGameState(page))?.playerHp).toBe(200);

    let state = await getGameState(page);
    expect(state?.playerHp).toBe(200); // 300 - 100 = 200
    expect(state?.gameState).toBe('PHASE_1'); // Still alive

    // Take more damage
    await triggerStoreAction(page, 'damagePlayer', 100);
    // Wait for HP to update
    await expect.poll(async () => (await getGameState(page))?.playerHp).toBe(100);

    state = await getGameState(page);
    expect(state?.playerHp).toBe(100);
    expect(state?.gameState).toBe('PHASE_1'); // Still alive with 100 HP
  });

  test('should trigger game over when HP reaches 0', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Deal fatal damage
    await triggerStoreAction(page, 'damagePlayer', 300);
    // Wait for game over state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('GAME_OVER');

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

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Simulate kills
    await triggerStoreAction(page, 'addKill', 10);
    // Wait for kill count to update
    await expect.poll(async () => (await getGameState(page))?.kills).toBe(1);

    let state = await getGameState(page);
    expect(state?.kills).toBe(1);
    expect(state?.score).toBe(10);

    // Add more kills
    await triggerStoreAction(page, 'addKill', 10);
    await triggerStoreAction(page, 'addKill', 10);
    // Wait for kill count to update
    await expect.poll(async () => (await getGameState(page))?.kills).toBe(3);

    state = await getGameState(page);
    expect(state?.kills).toBe(3);
    expect(state?.score).toBeGreaterThan(30); // Should have streak bonus
  });
});

test.describe('Full Gameplay - CYBER-ELF (Scout Class)', () => {
  test('should complete full game loop with Elf', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(100); // Elf has 100 HP
    expect(state?.playerHp).toBe(100);
  });

  test('should have low HP but rapid fire weapon', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Verify Elf's stats - low HP, high speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);
    expect(state?.playerHp).toBe(100);

    // Elf's SMG fires rapidly - hold fire for a bit
    await page.keyboard.down('Space');
    // Wait for multiple bullets to be created (rapid fire)
    await expect.poll(async () => (await getGameState(page))?.bulletCount).toBeGreaterThan(3);
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should die quickly with low HP', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Elf only has 100 HP - one big hit kills
    await triggerStoreAction(page, 'damagePlayer', 100);
    // Wait for game over state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('GAME_OVER');

    const state = await getGameState(page);
    expect(state?.playerHp).toBe(0);
    expect(state?.gameState).toBe('GAME_OVER');
  });
});

test.describe('Full Gameplay - THE BUMBLE (Bruiser Class)', () => {
  test('should complete full game loop with Bumble', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(200); // Bumble has 200 HP
    expect(state?.playerHp).toBe(200);
  });

  test('should fire spread pattern weapon', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Verify Bumble's stats - 200 HP, medium speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);
    expect(state?.playerHp).toBe(200);

    // Bumble's Star Thrower fires 3 projectiles at once - verify weapon works
    await page.keyboard.down('Space');
    // Wait for bullets to be created (spread pattern creates 3 at once)
    await expect.poll(async () => (await getGameState(page))?.bulletCount).toBeGreaterThan(0);
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should have balanced survivability', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Bumble has 200 HP - medium survivability
    await triggerStoreAction(page, 'damagePlayer', 100);
    // Wait for HP to update
    await expect.poll(async () => (await getGameState(page))?.playerHp).toBe(100);

    let state = await getGameState(page);
    expect(state?.playerHp).toBe(100);
    expect(state?.gameState).toBe('PHASE_1');

    // One more hit at 100 damage kills
    await triggerStoreAction(page, 'damagePlayer', 100);
    // Wait for game over state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('GAME_OVER');

    state = await getGameState(page);
    expect(state?.gameState).toBe('GAME_OVER');
  });
});

test.describe('Full Gameplay - Boss Battle', () => {
  test('should spawn boss after 10 kills', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Simulate 10 kills to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    // Wait for boss phase to trigger
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_BOSS');

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

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Trigger boss spawn
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }
    // Wait for boss phase
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_BOSS');

    let state = await getGameState(page);
    expect(state?.bossActive).toBe(true);

    // Damage boss until defeated
    await triggerStoreAction(page, 'damageBoss', 1000);
    // Wait for win state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('WIN');

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

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Trigger boss spawn
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }
    // Wait for boss phase
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_BOSS');

    // Damage boss incrementally
    await triggerStoreAction(page, 'damageBoss', 250);
    // Wait for boss HP to update
    await expect.poll(async () => (await getGameState(page))?.bossHp).toBe(750);

    let state = await getGameState(page);
    expect(state?.bossHp).toBe(750);

    await triggerStoreAction(page, 'damageBoss', 250);
    // Wait for boss HP to update
    await expect.poll(async () => (await getGameState(page))?.bossHp).toBe(500);

    state = await getGameState(page);
    expect(state?.bossHp).toBe(500);

    // Verify boss HP display
    await expect(page.locator('text=500 / 1000')).toBeVisible();
  });
});

test.describe('Full Gameplay - Kill Streaks', () => {
  test('should trigger kill streak notifications', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Rapid kills to build streak
    await triggerStoreAction(page, 'addKill', 10);
    await triggerStoreAction(page, 'addKill', 10);
    // Wait for kill streak to update
    await expect.poll(async () => (await getGameState(page))?.killStreak).toBe(2);

    let state = await getGameState(page);
    expect(state?.killStreak).toBe(2);

    // Should show DOUBLE KILL
    await expect(page.locator('text=DOUBLE KILL')).toBeVisible({ timeout: 2000 });

    // Continue streak
    await triggerStoreAction(page, 'addKill', 10);
    // Wait for kill streak to update
    await expect.poll(async () => (await getGameState(page))?.killStreak).toBe(3);

    state = await getGameState(page);
    expect(state?.killStreak).toBe(3);

    // Should show TRIPLE KILL
    await expect(page.locator('text=TRIPLE KILL')).toBeVisible({ timeout: 2000 });
  });

  test('should reset streak after timeout', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Build a streak
    await triggerStoreAction(page, 'addKill', 10);
    await triggerStoreAction(page, 'addKill', 10);
    // Wait for kill streak to update
    await expect.poll(async () => (await getGameState(page))?.killStreak).toBe(2);

    let state = await getGameState(page);
    expect(state?.killStreak).toBe(2);

    // Wait for streak to timeout (2+ seconds) - using page.waitForFunction for time-based waiting
    await page.waitForFunction(() => {
      return new Promise(resolve => setTimeout(() => resolve(true), 2500));
    });

    // Next kill should start new streak
    await triggerStoreAction(page, 'addKill', 10);
    // Wait for kill streak to reset and update
    await expect.poll(async () => (await getGameState(page))?.killStreak).toBe(1);

    state = await getGameState(page);
    expect(state?.killStreak).toBe(1); // Reset to 1
  });

  test('should apply streak bonus to score', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // First kill - no bonus
    await triggerStoreAction(page, 'addKill', 100);
    // Wait for score to update
    await expect.poll(async () => (await getGameState(page))?.score).toBe(100);

    let state = await getGameState(page);
    expect(state?.score).toBe(100);

    // Second kill - 25% bonus (streak of 2)
    await triggerStoreAction(page, 'addKill', 100);
    // Wait for score to update
    await expect.poll(async () => (await getGameState(page))?.score).toBe(225);

    state = await getGameState(page);
    // 100 + (100 + 25% of 100) = 100 + 125 = 225
    expect(state?.score).toBe(225);

    // Third kill - 50% bonus (streak of 3)
    await triggerStoreAction(page, 'addKill', 100);
    // Wait for score to update
    await expect.poll(async () => (await getGameState(page))?.score).toBe(375);

    state = await getGameState(page);
    // 225 + (100 + 50% of 100) = 225 + 150 = 375
    expect(state?.score).toBe(375);
  });
});

test.describe('Full Gameplay - Game Reset', () => {
  test('should reset game and return to menu', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    // Play a game
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Get some score
    await triggerStoreAction(page, 'addKill', 100);
    // Wait for kill to register
    await expect.poll(async () => (await getGameState(page))?.kills).toBeGreaterThan(0);

    // Die
    await triggerStoreAction(page, 'damagePlayer', 300);
    // Wait for game over
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('GAME_OVER');

    // Click re-deploy
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await redeploy.waitFor({ state: 'visible', timeout: 5000 });
    // Removed scrollIntoViewIfNeeded as it causes instability in CI
    await redeploy.click();
    // Wait for menu state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    // Should be back at menu
    const state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
    expect(state?.score).toBe(0);
    expect(state?.kills).toBe(0);
    expect(state?.playerHp).toBe(100); // Reset to default
  });

  test('should preserve high score after reset', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    // Play and get a score
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    for (let i = 0; i < 5; i++) {
      await triggerStoreAction(page, 'addKill', 100);
    }
    // Wait for all kills to register
    await expect.poll(async () => (await getGameState(page))?.kills).toBe(5);

    const scoreBeforeDeath = (await getGameState(page))?.score || 0;

    // Die
    await triggerStoreAction(page, 'damagePlayer', 300);
    // Wait for game over
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('GAME_OVER');

    // Reset
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await redeploy.waitFor({ state: 'visible', timeout: 5000 });
    // Removed scrollIntoViewIfNeeded as it causes instability in CI
    await redeploy.click();
    // Wait for menu state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    // Start new game
    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Die with 0 score
    await triggerStoreAction(page, 'damagePlayer', 100);
    // Wait for game over
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('GAME_OVER');

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

    // Step 2: Game starts - wait for PHASE_1
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');
    let state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');

    // Step 3: Combat phase - kill enemies
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }

    // Step 4: Boss phase - wait for state transition
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_BOSS');
    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');
    await expect(page.getByText('⚠ KRAMPUS-PRIME ⚠')).toBeVisible({ timeout: 5000 });

    // Step 5: Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);
    // Wait for win state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('WIN');

    // Step 6: Victory
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
    // Wait for menu state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
  });

  test('should complete entire game as Elf', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);

    // Kill enemies to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }
    // Wait for boss phase
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_BOSS');

    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);
    // Wait for win state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('WIN');

    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });

  test('should complete entire game as Bumble', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);

    // Kill enemies to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
    }
    // Wait for boss phase
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_BOSS');

    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);
    // Wait for win state
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('WIN');

    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });
});

test.describe('Full Gameplay - Input Controls', () => {
  test('should respond to WASD movement', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    const initialState = await getGameState(page);

    // Move with W key
    await page.keyboard.down('w');
    // Wait for input state to be set
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input?.up === true;
    });
    await page.keyboard.up('w');

    // Player should have moved (position changed)
    // We can verify input state is being set
    const inputState = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input;
    });

    expect(inputState).toBeDefined();
  });

  test('should respond to arrow key movement', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Move with arrow keys
    await page.keyboard.down('ArrowUp');
    // Wait for input state to be set
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input?.up === true;
    });
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowRight');
    // Wait for input state to be set
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input?.right === true;
    });
    await page.keyboard.up('ArrowRight');

    // Game should still be running
    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
  });

  test('should fire with spacebar', async ({ page }) => {
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Verify input state changes when firing
    await page.keyboard.down('Space');
    // Wait for input state to be set
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input?.isFiring === true;
    });

    const firingState = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input.isFiring;
    });

    expect(firingState).toBe(true);

    await page.keyboard.up('Space');
    // Wait for input state to be unset
    await page.waitForFunction(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input?.isFiring === false;
    });

    const notFiringState = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store?.getState().input.isFiring;
    });

    expect(notFiringState).toBe(false);
  });

  test('should show touch controls on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Wait for menu to be ready
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('MENU');

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    // Wait for game to start
    await expect.poll(async () => (await getGameState(page))?.gameState).toBe('PHASE_1');

    // Touch fire button should be visible
    await expect(page.getByRole('button', { name: /FIRE/ })).toBeVisible();
  });
});
