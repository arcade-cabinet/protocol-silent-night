import { Page } from '@playwright/test';

// Helper to get game state from the store
export async function getGameState(page: Page) {
  return page.evaluate(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Accessing global store for testing
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
      enemyCount: state.enemies.length,
      bulletCount: state.bullets.length,
    };
  });
}

// Helper to trigger game actions via store
// biome-ignore lint/suspicious/noExplicitAny: Generic args for store actions
export async function triggerStoreAction(page: Page, action: string, ...args: any[]) {
  return page.evaluate(({ action, args }) => {
    // biome-ignore lint/suspicious/noExplicitAny: Accessing global store for testing
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

// Helper to select character robustly
export async function selectCharacter(page: Page, name: string) {
  // Wait for the game store to be available first
  await page.waitForFunction(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Accessing global store for testing
    return (window as any).useGameStore !== undefined;
  }, { timeout: 20000 });

  const button = page.locator('button', { hasText: name });
  // Wait for button to be visible with increased timeout for CI
  await button.waitFor({ state: 'visible', timeout: 40000 });
  // Removed scrollIntoViewIfNeeded as it causes instability in CI
  // Use force click to bypass potential overlays and increased timeout
  await button.click({ timeout: 15000, force: true });
}

// Helper to start mission robustly
export async function startMission(page: Page) {
  const button = page.locator('button', { hasText: 'COMMENCE OPERATION' });
  // Mission briefing has a typing animation (lines * 600ms + 500ms)
  // Wait for button to be visible with increased timeout for CI
  await button.waitFor({ state: 'visible', timeout: 50000 });
  // Add small delay to ensure button animations complete
  await page.waitForTimeout(500);
  // Use force click to bypass animation stability checks and increased timeout
  await button.click({ force: true, timeout: 20000 });
}
