import { Page, Locator } from '@playwright/test';

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

// Helper to stabilize page before screenshots
export async function stabilizePage(page: Page) {
  // Wait for all network requests to complete
  await page.waitForLoadState('networkidle');

  // Wait for dynamic content to settle
  await page.waitForTimeout(500);

  // Ensure all animations are truly disabled via CSS injection
  // Also suppress focus outlines to prevent visual regression failures
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      *:focus-visible {
        outline: none !important;
      }
    `
  });

  // Wait for any remaining font rendering
  await page.waitForFunction(() => document.fonts.ready);
}

// Helper to wait for element stability before interaction
export async function waitForElementStability(page: Page, locator: Locator) {
  await locator.waitFor({ state: 'attached', timeout: 10000 });
  await locator.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(200); // Extra buffer for animations
  return locator;
}

// Helper to wait for loading screen to disappear
export async function waitForLoadingScreen(page: Page) {
  const loadingScreen = page.getByText('INITIALIZING SYSTEMS');
  if (await loadingScreen.isVisible()) {
    await loadingScreen.waitFor({ state: 'hidden', timeout: 45000 });
  }
  // Additional wait for transition animation
  await page.waitForTimeout(2000);
}

// Helper to select character robustly with force click option
export async function selectCharacter(page: Page, name: string, options: { force?: boolean } = {}) {
  const button = page.getByRole('button', { name: new RegExp(name, 'i') });
  await button.waitFor({ state: 'visible', timeout: 30000 });
  await button.click({ force: options.force, timeout: 30000 });
}

// Helper to start mission robustly with force click option
export async function startMission(page: Page, options: { force?: boolean } = {}) {
  const button = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await button.waitFor({ state: 'visible', timeout: 45000 });
  await button.click({ force: options.force, timeout: 30000 });
}

// Helper to setup page for visual regression tests
export async function setupVisualTest(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  await waitForLoadingScreen(page);
  await stabilizePage(page);
}
