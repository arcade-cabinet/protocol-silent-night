import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for AI feedback addressments
 */

const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

async function getGameState(page: Page) {
  return page.evaluate(() => {
    const store = (window as any).useGameStore;
    if (!store) return null;
    const state = store.getState();
    return {
      gameState: state.state,
      playerClass: state.playerClass,
      runProgress: state.runProgress,
      enemies: state.enemies.map((e: any) => ({
        id: e.id,
        type: e.type,
        rotation: e.mesh.rotation.y,
        position: [e.mesh.position.x, e.mesh.position.y, e.mesh.position.z]
      })),
      playerPosition: [state.playerPosition.x, state.playerPosition.y, state.playerPosition.z],
    };
  });
}

test.describe('AI Feedback Implementation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(hasMcpSupport ? 3000 : 2500);
  });

  test('should have centralized briefing lines in store', async ({ page }) => {
    // Select a class to trigger briefing
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Check briefing lines from store
    const briefingLines = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      return store.getState().getBriefingLines();
    });

    expect(briefingLines).toBeDefined();
    expect(briefingLines.length).toBeGreaterThan(0);
    expect(briefingLines[0].label).toBe('OPERATION');
    expect(briefingLines[1].label).toBe('OPERATOR');
    expect(briefingLines[1].text).toBe('MECHA-SANTA');
  });

  test('enemies should face the player', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(5000); // Wait longer for enemies to spawn and rotate

    const state = await getGameState(page);
    const enemies = state?.enemies || [];
    const playerPos = state?.playerPosition || [0, 0, 0];

    expect(enemies.length).toBeGreaterThan(0);

    for (const enemy of enemies) {
      // Calculate expected rotation to face player
      const dx = playerPos[0] - enemy.position[0];
      const dz = playerPos[2] - enemy.position[2];
      const expectedRotation = Math.atan2(dx, dz);
      
      // Check if enemy rotation is close to expected rotation
      // Allow for some difference due to smooth rotation (lerp)
      const diff = Math.abs(enemy.rotation - expectedRotation);
      const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
      
      // Tolerance 0.8 rad (~45 degrees) to allow for some lag/lerp
      expect(Math.abs(normalizedDiff)).toBeLessThan(0.8);
    }
  });

  test('boss should face the player', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start game
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    // Manually trigger boss spawn for testing
    await page.evaluate(() => {
      const store = (window as any).useGameStore;
      store.getState().spawnBoss();
    });

    await page.waitForTimeout(2000);

    const state = await getGameState(page);
    const boss = state?.enemies.find((e: any) => e.type === 'boss');
    const playerPos = state?.playerPosition || [0, 0, 0];

    expect(boss).toBeDefined();

    const dx = playerPos[0] - boss.position[0];
    const dz = playerPos[2] - boss.position[2];
    const expectedRotation = Math.atan2(dx, dz);
    
    const diff = Math.abs(boss.rotation - expectedRotation);
    const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
    
    expect(Math.abs(normalizedDiff)).toBeLessThan(0.8);
  });
});
