import { Page, expect } from '@playwright/test';

// Cache to avoid redundant checks
const storeCheckedPages = new WeakSet<Page>();

// Helper to ensure store is available
export async function waitForStore(page: Page, timeout = 60000) {
  if (storeCheckedPages.has(page)) return;

  try {
    await page.waitForFunction(
      () => typeof (window as any).useGameStore !== 'undefined',
      null,
      { timeout, polling: 100 }
    );

    // Additional verification that store is functional
    const isFunctional = await page.evaluate(() => {
      try {
        const store = (window as any).useGameStore;
        return store && typeof store.getState === 'function';
      } catch {
        return false;
      }
    });

    if (!isFunctional) {
      throw new Error('Store is defined but not functional (getState missing)');
    }

    storeCheckedPages.add(page);

  } catch (error) {
    console.log('Warning: useGameStore not found within timeout');
    // Check if store initialization failed in the app
    const storeError = await page.evaluate(() => (window as any).storeInitError).catch(() => null);
    if (storeError) {
      throw new Error(`Store initialization failed: ${storeError}`);
    }
    throw error;
  }
}

// Helper to get game state from the store
export async function getGameState(page: Page) {
  await waitForStore(page);

  return page.evaluate(() => {
    try {
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
    } catch (error) {
      console.error('Failed to get game state:', error);
      return null;
    }
  });
}

// Helper to wait for specific game state
export async function waitForGameState(page: Page, targetState: string, timeout = 30000) {
  await waitForStore(page, timeout);

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
  // Rely on getGameState or explicit waitForStore in test setup to ensure store availability
  // Avoiding redundant checks here for performance in loops

  return page.evaluate(async ({ action, args }) => {
    try {
      // biome-ignore lint/suspicious/noExplicitAny: Accessing global store for testing
      const store = (window as any).useGameStore;
      if (!store) return false;

      // Add timeout guard to prevent infinite loops
      const timeout = setTimeout(() => {
        throw new Error('Store action timeout');
      }, 5000);

      const state = store.getState();
      if (typeof state[action] === 'function') {
        try {
          const result = state[action](...args);
          clearTimeout(timeout);
          // If action returns a promise, ensure it resolves
          if (result instanceof Promise) {
            await result;
          }
          return true;
        } catch (actionError) {
          console.error(`Store action ${action} failed execution:`, actionError);
          clearTimeout(timeout);
          return false;
        }
      }
      clearTimeout(timeout);
      return false;
    } catch (error) {
      console.error('Store action failed:', error);
      return false;
    }
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
  }, { timeout: 10000 }).toBeGreaterThanOrEqual(targetKills);
}

// Helper to wait for loading screen to complete
export async function waitForLoadingScreen(page: Page) {
  const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
  // Initial check if loading screen is present
  if (await loadingScreen.isVisible()) {
    // Wait for it to disappear with generous timeout for CI
    await loadingScreen.waitFor({ state: 'detached', timeout: 60000 });
  }
}

// Helper to select character robustly
export async function selectCharacter(page: Page, name: string) {
  // Ensure loading is complete before attempting interaction
  await waitForLoadingScreen(page);

  const button = page.locator('button', { hasText: name });
  // Wait for button to be visible with increased timeout for CI
  await button.waitFor({ state: 'visible', timeout: 30000 });

  // Force click without actionability checks to avoid hanging on scrollIntoView
  // This is necessary because SPA navigation can interfere with normal click flow
  await button.click({ force: true, noWaitAfter: true });
}

// Helper to start mission robustly
export async function startMission(page: Page) {
  const button = page.locator('button', { hasText: 'COMMENCE OPERATION' });
  // Mission briefing has a typing animation (~4s) plus potential CI slowness
  await button.waitFor({ state: 'visible', timeout: 45000 });

  // Use click with timeout and noWaitAfter to prevent navigation waiting in SPA
  // The timeout ensures we don't hang indefinitely if the button becomes unresponsive
  await button.click({ timeout: 5000, noWaitAfter: true });
}

// Helper to wait for game to be initialized and playable
export async function waitForGameReady(page: Page, timeout = 50000) {
  await waitForStore(page, timeout);

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

// Helper to auto-dismiss level-up screens by selecting first available upgrade
export async function autoDismissLevelUp(page: Page) {
  const state = await getGameState(page);
  if (state?.gameState !== 'LEVEL_UP') return;

  await page.evaluate(() => {
    // biome-ignore lint/suspicious/noExplicitAny: Accessing global store
    const store = (window as any).useGameStore;
    if (!store) return;

    const { runProgress, state: gameState } = store.getState();
    if (gameState !== 'LEVEL_UP') return;

    const choices = runProgress.upgradeChoices;
    if (choices && choices.length > 0) {
      // Select the first upgrade to continue
      store.getState().selectLevelUpgrade(choices[0].id);
    }
  });
}
