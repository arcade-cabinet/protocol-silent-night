import { Page, expect } from '@playwright/test';

/**
 * Wait for the app to be fully loaded and store to be available
 * This is critical for CI environments where module loading can be slow
 *
 * Strategy: Wait for the React app to fully hydrate and render ANY UI.
 * Once React has rendered something visible, the store will be available
 * because it's imported by the App component.
 */
async function ensureStoreAvailable(page: Page, timeout = 30000) {
  // Wait for the React app to render any meaningful content
  // This is more reliable than checking window.useGameStore directly
  // because in production builds with code splitting, the store module
  // may load asynchronously after the main chunk.
  await page.waitForFunction(
    () => {
      // First check if the store is available
      // biome-ignore lint/suspicious/noExplicitAny: Accessing global store
      const storeAvailable = typeof (window as any).useGameStore !== 'undefined';
      if (!storeAvailable) return false;

      // Then verify React has rendered by checking for any game UI
      const hasButtons = document.querySelectorAll('button').length > 0;
      const hasCanvas = document.querySelector('canvas') !== null;
      const hasGameUI = hasButtons || hasCanvas;

      return hasGameUI;
    },
    null,
    { timeout }
  );
}

// Helper to get game state from the store
export async function getGameState(page: Page) {
  // First ensure the store is available
  await ensureStoreAvailable(page);

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

// Helper to wait for specific game state
export async function waitForGameState(page: Page, targetState: string, timeout = 10000) {
  await page.waitForFunction(
    (state) => {
      // biome-ignore lint/suspicious/noExplicitAny: Accessing global store
      const store = (window as any).useGameStore;
      return store?.getState().state === state;
    },
    targetState,
    { timeout }
  );
}

// Helper to trigger game actions via store
// biome-ignore lint/suspicious/noExplicitAny: Generic args for store actions
export async function triggerStoreAction(page: Page, action: string, ...args: any[]) {
  // First ensure the store is available
  await ensureStoreAvailable(page);

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

// Helper to simulate combat and verify kills
export async function simulateCombatUntilKills(page: Page, targetKills: number) {
  // Use evaluate to directly manipulate game state for stability
  // instead of trying to aim and shoot in WebGL via playwright actions
  await page.evaluate(async (target) => {
    // biome-ignore lint/suspicious/noExplicitAny: Accessing global store
    const store = (window as any).useGameStore;
    if (!store) return;

    // Reset stats first
    store.getState().resetStats();

    // Add kills directly
    for (let i = 0; i < target; i++) {
      store.getState().addKill(100); // 100 points per kill
      // Small delay to allow store updates to propagate if needed
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }, targetKills);

  // Verify the state updated
  await expect.poll(async () => {
    const state = await getGameState(page);
    return state?.kills;
  }, { timeout: 5000 }).toBeGreaterThanOrEqual(targetKills);
}

// Helper to wait for loading screen to complete
export async function waitForLoadingScreen(page: Page) {
  const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
  // Initial check if loading screen is present
  if (await loadingScreen.isVisible()) {
    // Wait for it to disappear with generous timeout for CI
    await loadingScreen.waitFor({ state: 'detached', timeout: 45000 });
  }
}

// Helper to select character robustly
export async function selectCharacter(page: Page, name: string) {
  // Ensure loading is complete before attempting interaction
  await waitForLoadingScreen(page);

  const button = page.locator('button', { hasText: name });
  // Wait for button to be visible with increased timeout for CI
  await button.waitFor({ state: 'visible', timeout: 30000 });
  // Removed scrollIntoViewIfNeeded as it causes instability in CI
  // Use force click to bypass potential overlays and increased timeout
  await button.click({ timeout: 15000, force: true });
}

// Helper to start mission robustly
export async function startMission(page: Page) {
  const button = page.locator('button', { hasText: 'COMMENCE OPERATION' });
  // Mission briefing has a typing animation (~4s) plus potential CI slowness
  await button.waitFor({ state: 'visible', timeout: 45000 });
  await button.click({ timeout: 15000, force: true });
}

// Helper to wait for game to be initialized and playable
export async function waitForGameReady(page: Page, timeout = 50000) {
  await page.waitForFunction(
    () => {
      // biome-ignore lint/suspicious/noExplicitAny: Accessing global store
      const store = (window as any).useGameStore;
      if (!store) return false;
      const state = store.getState().state;
      // Should be in a playable phase
      return ['PHASE_1', 'PHASE_2', 'PHASE_3', 'PHASE_BOSS'].includes(state);
    },
    null,
    { timeout }
  );
}
