import { Page } from '@playwright/test';

// Helper to navigate and wait for loading screen to disappear
export async function navigateAndWaitForLoad(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Wait for loading screen to disappear
  const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
  if (await loadingScreen.isVisible()) {
    await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
  }

  // Additional wait for transition animation
  await page.waitForTimeout(2000);
}

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
  const button = page.locator('button', { hasText: name });
  // Wait for button to be visible
  await button.waitFor({ state: 'visible', timeout: 10000 });
  // Removed scrollIntoViewIfNeeded as it causes instability in CI
  // Use standard click which attempts to scroll if needed
  await button.click();
}

// Helper to start mission robustly
export async function startMission(page: Page) {
  const button = page.locator('button', { hasText: 'COMMENCE OPERATION' });
  // Mission briefing has a typing animation (~4s) plus potential CI slowness
  await button.waitFor({ state: 'visible', timeout: 45000 });
  await button.click();
}
