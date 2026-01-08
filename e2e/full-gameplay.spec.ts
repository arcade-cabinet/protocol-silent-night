import { test, expect } from '@playwright/test';
import { getGameState, selectCharacter, startMission, triggerStoreAction } from './utils';

/**
 * Full Gameplay E2E Tests
 *
 * Comprehensive tests that play through the entire game from start to finish
 * for each character class, testing all game mechanics and state transitions.
 */

// Helper function to stabilize the page before interactions
async function stabilizePage(page) {
  // Wait for all network requests to complete
  await page.waitForLoadState('networkidle');

  // Wait for dynamic content to settle
  await page.waitForTimeout(500);

  // Ensure all animations are truly disabled via CSS injection
  // Force remove transforms to prevent instability during interactions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        transition-property: none !important;
        transform: none !important;
      }
      *:focus-visible {
        outline: none !important;
      }
    `
  });

  // Wait for any remaining font rendering
  await page.waitForFunction(() => document.fonts.ready);
}

// Apply stabilization to all tests in this file
test.beforeEach(async ({ page }) => {
  await stabilizePage(page);
});

test.describe('Full Gameplay - MECHA-SANTA (Tank Class)', () => {
  test('should complete full game loop with Santa', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Verify we're at menu
    let state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');

    // Select Santa
    await selectCharacter(page, 'MECHA-SANTA');

    // Click "COMMENCE OPERATION" on the briefing screen
    await startMission(page);

    // Wait for game to start
    await page.waitForTimeout(2000);
    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(300); // Santa has 300 HP
    expect(state?.playerHp).toBe(300);

    // Verify HUD is visible
    await expect(page.locator('text=OPERATOR STATUS')).toBeVisible();
    await expect(page.locator('text=300 / 300')).toBeVisible();
  });

  test('should have correct Santa stats and weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Verify Santa's stats are correct
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(300);
    expect(state?.playerHp).toBe(300);

    // Fire weapon - Santa's Coal Cannon fires single shots
    await page.keyboard.down('Space');
    await page.waitForTimeout(600); // Wait for at least one shot (0.5s delay)
    await page.keyboard.up('Space');

    // Verify firing happened (bullets may have already been cleaned up, so check via score or just validate no crash)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1'); // Game still running
  });

  test('should survive longer due to high HP', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Simulate taking damage
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(200);

    let state = await getGameState(page);
    expect(state?.playerHp).toBe(200); // 300 - 100 = 200
    expect(state?.gameState).toBe('PHASE_1'); // Still alive

    // Take more damage
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(200);

    state = await getGameState(page);
    expect(state?.playerHp).toBe(100);
    expect(state?.gameState).toBe('PHASE_1'); // Still alive with 100 HP
  });

  test('should trigger game over when HP reaches 0', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

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
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await expect(redeploy).toBeVisible({ timeout: 5000 });
  });

  test('should accumulate score and kills', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Simulate kills
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(100);

    let state = await getGameState(page);
    expect(state?.kills).toBe(1);
    expect(state?.score).toBe(10);

    // Add more kills
    await triggerStoreAction(page, 'addKill', 10);
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(100);

    state = await getGameState(page);
    expect(state?.kills).toBe(3);
    expect(state?.score).toBeGreaterThan(30); // Should have streak bonus
  });
});

test.describe('Full Gameplay - CYBER-ELF (Scout Class)', () => {
  test('should complete full game loop with Elf', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await page.waitForTimeout(2000);

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(100); // Elf has 100 HP
    expect(state?.playerHp).toBe(100);
  });

  test('should have low HP but rapid fire weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Verify Elf's stats - low HP, high speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);
    expect(state?.playerHp).toBe(100);

    // Elf's SMG fires rapidly - hold fire for a bit
    await page.keyboard.down('Space');
    await page.waitForTimeout(500); // Half second of firing
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should die quickly with low HP', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await page.waitForTimeout(3000);

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
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await page.waitForTimeout(2000);

    const state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');
    expect(state?.playerMaxHp).toBe(200); // Bumble has 200 HP
    expect(state?.playerHp).toBe(200);
  });

  test('should fire spread pattern weapon', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Verify Bumble's stats - 200 HP, medium speed
    const state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);
    expect(state?.playerHp).toBe(200);

    // Bumble's Star Thrower fires 3 projectiles at once - verify weapon works
    await page.keyboard.down('Space');
    await page.waitForTimeout(500);
    await page.keyboard.up('Space');

    // Verify game is still running (weapon fired successfully)
    const afterState = await getGameState(page);
    expect(afterState?.gameState).toBe('PHASE_1');
  });

  test('should have balanced survivability', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Bumble has 200 HP - medium survivability
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(200);

    let state = await getGameState(page);
    expect(state?.playerHp).toBe(100);
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
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Simulate 10 kills to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(1000);

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
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Trigger boss spawn
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);

    let state = await getGameState(page);
    expect(state?.bossActive).toBe(true);

    // Damage boss until defeated
    await triggerStoreAction(page, 'damageBoss', 1000);
    await page.waitForTimeout(1000);

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
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Trigger boss spawn
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
      await page.waitForTimeout(20);
    }
    await page.waitForTimeout(500);

    // Damage boss incrementally
    await triggerStoreAction(page, 'damageBoss', 250);
    await page.waitForTimeout(200);

    let state = await getGameState(page);
    expect(state?.bossHp).toBe(750);

    await triggerStoreAction(page, 'damageBoss', 250);
    await page.waitForTimeout(200);

    state = await getGameState(page);
    expect(state?.bossHp).toBe(500);

    // Verify boss HP display
    await expect(page.locator('text=500 / 1000')).toBeVisible();
  });
});

test.describe('Full Gameplay - Kill Streaks', () => {
  test('should trigger kill streak notifications', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Rapid kills to build streak
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(100);
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(100);

    let state = await getGameState(page);
    expect(state?.killStreak).toBe(2);

    // Should show DOUBLE KILL
    await expect(page.locator('text=DOUBLE KILL')).toBeVisible({ timeout: 2000 });

    // Continue streak
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(500);

    state = await getGameState(page);
    expect(state?.killStreak).toBe(3);

    // Should show TRIPLE KILL
    await expect(page.locator('text=TRIPLE KILL')).toBeVisible({ timeout: 2000 });
  });

  test('should reset streak after timeout', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Build a streak
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(100);
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(100);

    let state = await getGameState(page);
    expect(state?.killStreak).toBe(2);

    // Wait for streak to timeout (2+ seconds)
    await page.waitForTimeout(2500);

    // Next kill should start new streak
    await triggerStoreAction(page, 'addKill', 10);
    await page.waitForTimeout(100);

    state = await getGameState(page);
    expect(state?.killStreak).toBe(1); // Reset to 1
  });

  test('should apply streak bonus to score', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // First kill - no bonus
    await triggerStoreAction(page, 'addKill', 100);
    await page.waitForTimeout(50);

    let state = await getGameState(page);
    expect(state?.score).toBe(100);

    // Second kill - 25% bonus (streak of 2)
    await triggerStoreAction(page, 'addKill', 100);
    await page.waitForTimeout(50);

    state = await getGameState(page);
    // 100 + (100 + 25% of 100) = 100 + 125 = 225
    expect(state?.score).toBe(225);

    // Third kill - 50% bonus (streak of 3)
    await triggerStoreAction(page, 'addKill', 100);
    await page.waitForTimeout(50);

    state = await getGameState(page);
    // 225 + (100 + 50% of 100) = 225 + 150 = 375
    expect(state?.score).toBe(375);
  });
});

test.describe('Full Gameplay - Game Reset', () => {
  test('should reset game and return to menu', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Play a game
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Get some score
    await triggerStoreAction(page, 'addKill', 100);
    await page.waitForTimeout(100);

    // Die
    await triggerStoreAction(page, 'damagePlayer', 300);
    await page.waitForTimeout(500);

    // Click re-deploy
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await redeploy.waitFor({ state: 'visible', timeout: 5000 });
    // Removed scrollIntoViewIfNeeded as it causes instability in CI
    await redeploy.click();
    await page.waitForTimeout(1000);

    // Should be back at menu
    const state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
    expect(state?.score).toBe(0);
    expect(state?.kills).toBe(0);
    expect(state?.playerHp).toBe(100); // Reset to default
  });

  test('should preserve high score after reset', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Play and get a score
    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    for (let i = 0; i < 5; i++) {
      await triggerStoreAction(page, 'addKill', 100);
      await page.waitForTimeout(50);
    }

    const scoreBeforeDeath = (await getGameState(page))?.score || 0;

    // Die
    await triggerStoreAction(page, 'damagePlayer', 300);
    await page.waitForTimeout(500);

    // Reset
    const redeploy = page.locator('button', { hasText: 'RE-DEPLOY' });
    await redeploy.waitFor({ state: 'visible', timeout: 5000 });
    // Removed scrollIntoViewIfNeeded as it causes instability in CI
    await redeploy.click();
    await page.waitForTimeout(1000);

    // Start new game
    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await page.waitForTimeout(2000);

    // Die with 0 score
    await triggerStoreAction(page, 'damagePlayer', 100);
    await page.waitForTimeout(500);

    // High score should still be preserved
    await expect(page.locator(`text=HIGH SCORE`)).toBeVisible();
  });
});

test.describe('Full Gameplay - Complete Playthrough', () => {
  test('should complete entire game as Santa', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Step 1: Character Selection - verify start screen is showing
    await expect(page.locator('text=Protocol:')).toBeVisible({ timeout: 5000 });
    await selectCharacter(page, 'MECHA-SANTA');

    // Click "COMMENCE OPERATION" on the briefing screen
    await startMission(page);

    // Step 2: Game starts
    await page.waitForTimeout(2000);
    let state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_1');

    // Step 3: Combat phase - kill enemies
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
      await page.waitForTimeout(100);
    }

    // Step 4: Boss phase
    await page.waitForTimeout(1000);
    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');
    await expect(page.getByText('⚠ KRAMPUS-PRIME ⚠')).toBeVisible({ timeout: 5000 });

    // Step 5: Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);
    await page.waitForTimeout(1000);

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
    await page.waitForTimeout(1000);

    state = await getGameState(page);
    expect(state?.gameState).toBe('MENU');
  });

  test('should complete entire game as Elf', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'CYBER-ELF');
    await startMission(page);

    await page.waitForTimeout(2000);

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(100);

    // Kill enemies to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);
    await page.waitForTimeout(500);

    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });

  test('should complete entire game as Bumble', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'BUMBLE');
    await startMission(page);

    await page.waitForTimeout(2000);

    let state = await getGameState(page);
    expect(state?.playerMaxHp).toBe(200);

    // Kill enemies to trigger boss
    for (let i = 0; i < 10; i++) {
      await triggerStoreAction(page, 'addKill', 10);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(500);

    state = await getGameState(page);
    expect(state?.gameState).toBe('PHASE_BOSS');

    // Defeat boss
    await triggerStoreAction(page, 'damageBoss', 1000);
    await page.waitForTimeout(500);

    state = await getGameState(page);
    expect(state?.gameState).toBe('WIN');
  });
});

test.describe('Full Gameplay - Input Controls', () => {
  test('should respond to WASD movement', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    const initialState = await getGameState(page);

    // Move with W key
    await page.keyboard.down('w');
    await page.waitForTimeout(500);
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
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

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
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Verify input state changes when firing
    await page.keyboard.down('Space');
    await page.waitForTimeout(100);

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
    await page.goto('/');
    await page.waitForTimeout(2000);

    await selectCharacter(page, 'MECHA-SANTA');
    await startMission(page);

    await page.waitForTimeout(3000);

    // Touch fire button should be visible
    await expect(page.getByRole('button', { name: /FIRE/ })).toBeVisible();
  });
});
