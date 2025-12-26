import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Tests for Nice Points Currency System
 * 
 * Tests the Nice Points earning, persistence, and display functionality.
 * 
 * Run with MCP: PLAYWRIGHT_MCP=true pnpm test:e2e
 * Run headless: pnpm test:e2e
 */

// Check if running with full MCP capabilities
const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

// Helper to get Nice Points data from the store
async function getNicePointsData(page: Page) {
  return page.evaluate(() => {
    const store = (window as any).useGameStore;
    if (!store) return null;
    const state = store.getState();
    return {
      nicePoints: state.metaProgress.nicePoints,
      totalPointsEarned: state.metaProgress.totalPointsEarned,
      sessionNicePoints: state.sessionNicePoints,
      bossesDefeated: state.metaProgress.bossesDefeated,
      totalKills: state.metaProgress.totalKills,
    };
  });
}

// Helper to trigger store actions
async function triggerStoreAction(page: Page, action: string, ...args: any[]) {
  return page.evaluate(({ action, args }) => {
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

// Helper to get localStorage meta progress
async function getMetaProgressFromStorage(page: Page) {
  return page.evaluate(() => {
    const stored = localStorage.getItem('protocol-silent-night-meta-progress');
    return stored ? JSON.parse(stored) : null;
  });
}

test.describe('Nice Points Currency System', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(hasMcpSupport ? 3000 : 2000);
  });

  test('should initialize with 0 Nice Points', async ({ page }) => {
    const npData = await getNicePointsData(page);
    
    expect(npData).not.toBeNull();
    expect(npData?.nicePoints).toBe(0);
    expect(npData?.totalPointsEarned).toBe(0);
    expect(npData?.sessionNicePoints).toBe(0);
  });

  test('should display Nice Points on start screen', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    // Wait for the start screen to load
    await page.waitForTimeout(3000);

    // Look for Nice Points display
    const nicePointsLabel = page.getByText(/NICE POINTS:/i);
    await expect(nicePointsLabel).toBeVisible({ timeout: 10000 });

    // Check that it shows 0 initially
    const nicePointsValue = page.locator('.nicePointsValue');
    await expect(nicePointsValue).toBeVisible();
    await expect(nicePointsValue).toHaveText('0');
  });

  test('should earn +10 Nice Points per kill', async ({ page }) => {
    // Set up game state
    await triggerStoreAction(page, 'selectClass', 'santa');
    await triggerStoreAction(page, 'setState', 'PHASE_1');
    
    const beforeNP = await getNicePointsData(page);
    
    // Simulate a kill
    await triggerStoreAction(page, 'addKill', 100);
    
    const afterNP = await getNicePointsData(page);
    
    // Should earn +10 NP for the kill
    expect(afterNP?.sessionNicePoints).toBe(10);
    expect(afterNP?.nicePoints).toBe((beforeNP?.nicePoints || 0) + 10);
  });

  test('should earn streak bonuses for consecutive kills', async ({ page }) => {
    await triggerStoreAction(page, 'selectClass', 'elf');
    await triggerStoreAction(page, 'setState', 'PHASE_1');
    
    // First kill: +10 NP (no streak)
    await triggerStoreAction(page, 'addKill', 100);
    let npData = await getNicePointsData(page);
    expect(npData?.sessionNicePoints).toBe(10);
    
    // Second kill (2x streak): +10 base + 5 streak = +15 NP
    await page.waitForTimeout(100); // Within streak timeout
    await triggerStoreAction(page, 'addKill', 100);
    npData = await getNicePointsData(page);
    expect(npData?.sessionNicePoints).toBe(25); // 10 + 15
    
    // Third kill (3x streak): +10 base + 10 streak = +20 NP
    await page.waitForTimeout(100);
    await triggerStoreAction(page, 'addKill', 100);
    npData = await getNicePointsData(page);
    expect(npData?.sessionNicePoints).toBe(45); // 10 + 15 + 20
    
    // Wait for streak to reset
    await page.waitForTimeout(2500);
    
    // Fourth kill (streak reset): +10 NP
    await triggerStoreAction(page, 'addKill', 100);
    npData = await getNicePointsData(page);
    expect(npData?.sessionNicePoints).toBe(55); // 45 + 10
  });

  test('should earn +500 Nice Points for boss defeat', async ({ page }) => {
    await triggerStoreAction(page, 'selectClass', 'santa');
    await triggerStoreAction(page, 'setState', 'PHASE_BOSS');
    await triggerStoreAction(page, 'spawnBoss');
    
    const beforeNP = await getNicePointsData(page);
    
    // Defeat boss (1000 HP)
    await triggerStoreAction(page, 'damageBoss', 1000);
    
    const afterNP = await getNicePointsData(page);
    
    // Should earn +500 NP for boss defeat
    expect(afterNP?.sessionNicePoints).toBe((beforeNP?.sessionNicePoints || 0) + 500);
    expect(afterNP?.bossesDefeated).toBe((beforeNP?.bossesDefeated || 0) + 1);
  });

  test('should persist Nice Points to localStorage', async ({ page }) => {
    await triggerStoreAction(page, 'selectClass', 'bumble');
    await triggerStoreAction(page, 'setState', 'PHASE_1');
    
    // Earn some Nice Points
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);
    
    // Check that it's persisted to localStorage
    const storedData = await getMetaProgressFromStorage(page);
    expect(storedData).not.toBeNull();
    expect(storedData.nicePoints).toBeGreaterThan(0);
    expect(storedData.totalPointsEarned).toBeGreaterThan(0);
    
    // Reload page and verify persistence
    await page.reload();
    await page.waitForTimeout(2000);
    
    const npDataAfterReload = await getNicePointsData(page);
    expect(npDataAfterReload?.nicePoints).toBe(storedData.nicePoints);
  });

  test('should display Nice Points earned in EndScreen', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    await page.waitForTimeout(3000);

    // Start game
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click();

    // Start mission
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    // Wait for game to start
    await page.waitForTimeout(1000);

    // Simulate some kills
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);

    // Trigger game over
    await triggerStoreAction(page, 'damagePlayer', 1000);

    // Wait for end screen
    await page.waitForTimeout(1000);

    // Check for Nice Points display
    const nicePointsEarned = page.getByText(/NICE POINTS EARNED/i);
    await expect(nicePointsEarned).toBeVisible({ timeout: 5000 });

    const totalNicePoints = page.getByText(/TOTAL NICE POINTS/i);
    await expect(totalNicePoints).toBeVisible();

    // Verify session NP is shown
    const npData = await getNicePointsData(page);
    expect(npData?.sessionNicePoints).toBeGreaterThan(0);
  });

  test('should reset session Nice Points on replay', async ({ page }) => {
    await triggerStoreAction(page, 'selectClass', 'elf');
    await triggerStoreAction(page, 'setState', 'PHASE_1');
    
    // Earn some Nice Points
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);
    
    let npData = await getNicePointsData(page);
    const earnedNP = npData?.sessionNicePoints || 0;
    expect(earnedNP).toBeGreaterThan(0);
    
    // Reset/replay
    await triggerStoreAction(page, 'reset');
    
    // Session NP should be reset to 0
    npData = await getNicePointsData(page);
    expect(npData?.sessionNicePoints).toBe(0);
    
    // But total NP should be preserved
    expect(npData?.nicePoints).toBe(earnedNP);
  });

  test('should accumulate Nice Points across multiple runs', async ({ page }) => {
    // Run 1
    await triggerStoreAction(page, 'selectClass', 'santa');
    await triggerStoreAction(page, 'setState', 'PHASE_1');
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);
    
    let npData = await getNicePointsData(page);
    const run1NP = npData?.nicePoints || 0;
    
    // Reset for run 2
    await triggerStoreAction(page, 'reset');
    
    // Run 2
    await triggerStoreAction(page, 'selectClass', 'elf');
    await triggerStoreAction(page, 'setState', 'PHASE_1');
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);
    await triggerStoreAction(page, 'addKill', 100);
    
    npData = await getNicePointsData(page);
    const run2NP = npData?.nicePoints || 0;
    
    // Total should have accumulated
    expect(run2NP).toBeGreaterThan(run1NP);
  });

  test('should show earned NP with proper formatting on end screen', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    await page.waitForTimeout(3000);

    // Start and play game
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await expect(elfButton).toBeVisible({ timeout: 15000 });
    await elfButton.click();

    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    await page.waitForTimeout(1000);

    // Simulate earning 50 NP (5 kills, no streak)
    for (let i = 0; i < 5; i++) {
      await triggerStoreAction(page, 'addKill', 100);
      await page.waitForTimeout(2500); // Reset streak each time
    }

    // End game
    await triggerStoreAction(page, 'damagePlayer', 1000);
    await page.waitForTimeout(1000);

    // Check formatting (should show +50)
    const earnedText = page.locator('text=/\\+\\d+/').first();
    await expect(earnedText).toBeVisible({ timeout: 5000 });
  });
});
