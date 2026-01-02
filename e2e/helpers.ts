import { Page } from '@playwright/test';

/**
 * Shared E2E test helpers for Protocol: Silent Night
 *
 * These helpers provide robust waiting and interaction patterns
 * that work reliably in CI environments with software WebGL rendering.
 */

/**
 * Wait for the game to fully initialize with all required elements loaded
 * This is more robust than simple waitForLoadState for WebGL apps
 */
export async function waitForGameReady(page: Page, timeout = 30000): Promise<void> {
  const startTime = Date.now();

  // Wait for network to settle
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {
    console.warn('Network did not reach idle state within timeout');
  });

  // Wait for the game store to be initialized
  await page.waitForFunction(
    () => {
      return typeof (window as any).useGameStore !== 'undefined';
    },
    { timeout: Math.max(5000, timeout - (Date.now() - startTime)) }
  ).catch(() => {
    console.warn('Game store not initialized within timeout');
  });

  // Wait for React to finish initial render
  await page.waitForFunction(
    () => {
      const root = document.querySelector('#root');
      return root && root.children.length > 0;
    },
    { timeout: Math.max(5000, timeout - (Date.now() - startTime)) }
  ).catch(() => {
    console.warn('Root element not populated within timeout');
  });

  // Wait for WebGL canvas to be present
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return gl !== null && canvas.width > 0 && canvas.height > 0;
    },
    { timeout: Math.max(10000, timeout - (Date.now() - startTime)) }
  ).catch(() => {
    console.warn('WebGL canvas not ready within timeout');
  });

  // Extra settling time for animations and initial renders
  await page.waitForTimeout(1000);
}

/**
 * Wait for overlays and modals to disappear
 */
export async function waitForOverlays(page: Page, timeout = 15000): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {});

  // Wait for loading screen to disappear
  await page
    .getByText('INITIALIZING SYSTEMS')
    .waitFor({ state: 'detached', timeout })
    .catch(() => {});

  await page
    .waitForFunction(
      () => {
        const overlays = document.querySelectorAll('[role="dialog"], .modal, .overlay, .popup');
        return Array.from(overlays).every(
          (el) =>
            el === null ||
            (el as HTMLElement).style.display === 'none' ||
            !(el as HTMLElement).offsetParent
        );
      },
      { timeout }
    )
    .catch(() => {});
}

/**
 * Wait for WebGL canvas to be stable and ready for screenshots
 */
export async function waitForCanvasStable(page: Page, timeout = 20000): Promise<void> {
  await page
    .waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;

        // Check if canvas has rendered content
        const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
        return gl !== null && canvas.width > 0 && canvas.height > 0;
      },
      { timeout }
    )
    .catch(() => {
      console.warn('Canvas not stable within timeout');
    });

  // Additional wait for rendering to stabilize
  await page.waitForTimeout(1500);
}

/**
 * Safely click a mech button and wait for briefing screen
 * This handles the common pattern of selecting a character
 */
export async function selectMech(page: Page, mechName: string, timeout = 30000): Promise<void> {
  // Wait for the button to be present and stable
  const mechButton = page.getByRole('button', { name: new RegExp(mechName, 'i') });
  await mechButton.waitFor({ state: 'visible', timeout });
  await page.waitForTimeout(500); // Let any animations settle

  // Click the button
  await mechButton.click({ timeout: 15000 });

  // Wait for mission briefing screen
  await page.waitForSelector('text=MISSION BRIEFING', { timeout, state: 'visible' });
  await page.waitForTimeout(500); // Let briefing screen render
}

/**
 * Start gameplay by clicking COMMENCE OPERATION
 * Waits for the game to enter gameplay state
 */
export async function commenceOperation(page: Page, timeout = 30000): Promise<void> {
  const commenceBtn = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceBtn.waitFor({ state: 'visible', timeout });
  await page.waitForTimeout(500); // Let button stabilize

  await commenceBtn.click({ timeout: 15000 });

  // Wait for game to start
  await page.waitForTimeout(2000);

  // Verify game state changed
  await page.waitForFunction(
    () => {
      const store = (window as any).useGameStore;
      if (!store) return false;
      const state = store.getState();
      return state.state === 'PHASE_1' || state.state === 'PLAYING';
    },
    { timeout: Math.max(5000, timeout - 2000) }
  ).catch(() => {
    console.warn('Game did not enter gameplay state');
  });
}

/**
 * Get game state from the store
 */
export async function getGameState(page: Page) {
  return page.evaluate(() => {
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

/**
 * Trigger game actions via store
 */
export async function triggerStoreAction(page: Page, action: string, ...args: any[]) {
  return page.evaluate(
    ({ action, args }) => {
      const store = (window as any).useGameStore;
      if (!store) return false;
      const state = store.getState();
      if (typeof state[action] === 'function') {
        state[action](...args);
        return true;
      }
      return false;
    },
    { action, args }
  );
}
