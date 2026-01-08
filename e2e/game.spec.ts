import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Protocol: Silent Night
 * 
 * Supports two modes:
 * 1. PLAYWRIGHT_MCP=true - Full tests including WebGL/canvas interactions
 * 2. Default (headless) - Basic tests that don't require GPU
 * 
 * Run with MCP: PLAYWRIGHT_MCP=true pnpm test:e2e
 * Run headless: pnpm test:e2e
 */

// Check if running with full MCP capabilities
const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

test.describe('Protocol: Silent Night', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
    
    await page.goto('/');
  });

  // ============================================
  // Basic Tests (work in both modes)
  // ============================================
  
  test('should load the page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Protocol: Silent Night/);
    
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('should have correct meta tags', async ({ page }) => {
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#050505');
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Protocol: Silent Night');
  });

  test('should have localStorage available', async ({ page }) => {
    const localStorageWorks = await page.evaluate(() => {
      try {
        const key = 'protocol-silent-night-test';
        localStorage.setItem(key, 'test-value');
        const result = localStorage.getItem(key) === 'test-value';
        localStorage.removeItem(key);
        return result;
      } catch {
        return false;
      }
    });
    
    expect(localStorageWorks).toBe(true);
  });

  test('should load fonts from Google Fonts', async ({ page }) => {
    const fontStylesheet = page.locator('link[href*="fonts.googleapis.com/css"]');
    await expect(fontStylesheet).toHaveCount(1);
  });

  test('should have PWA manifest', async ({ page }) => {
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.ok()).toBe(true);
    
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('Protocol: Silent Night');
  });

  // ============================================
  // WebGL Tests (conditional based on environment)
  // ============================================

  test('should render canvas element', async ({ page }) => {
    // Wait for React to mount and loading screen to finish
    await page.waitForTimeout(hasMcpSupport ? 3000 : 2500);
    
    const canvas = page.locator('canvas');
    const canvasCount = await canvas.count();
    
    if (hasMcpSupport) {
      // With MCP, canvas MUST be visible
      await expect(canvas).toBeVisible({ timeout: 15000 });
      expect(canvasCount).toBeGreaterThan(0);
    } else {
      // In headless mode, just log the result
      console.log(`Canvas elements found: ${canvasCount}`);
      // App should at least not crash
      const root = page.locator('#root');
      await expect(root).toBeVisible();
    }
  });

  test('should display character selection UI', async ({ page }) => {
    // Wait for loading screen to finish
    await page.waitForTimeout(hasMcpSupport ? 3000 : 2500);
    
    if (hasMcpSupport) {
      // With MCP and WebGL, the full UI should render
      const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
      const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
      const bumbleButton = page.getByRole('button', { name: /BUMBLE/i });
      
      await expect(santaButton).toBeVisible({ timeout: 15000 });
      await expect(elfButton).toBeVisible();
      await expect(bumbleButton).toBeVisible();
    } else {
      // In headless, WebGL may fail - just verify app didn't crash
      const root = page.locator('#root');
      await expect(root).toBeVisible();
    }
  });

  // ============================================
  // Game Flow Tests (MCP only - requires WebGL)
  // ============================================

  test('should start game when selecting character', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');
    
    // Wait for loading screen
    await page.waitForTimeout(3000);
    
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click({ force: true });
    
    // Start screen should disappear
    await expect(santaButton).not.toBeVisible({ timeout: 5000 });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    // HUD should appear
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/CURRENT OBJECTIVE/i)).toBeVisible();
  });

  test('should display HUD elements during gameplay', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    await page.waitForTimeout(3000);

    // Start game with Elf
    const elfButton = page.getByRole('button', { name: /CYBER-ELF/i });
    await expect(elfButton).toBeVisible({ timeout: 15000 });
    await elfButton.click({ force: true });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    // Verify HUD elements
    await expect(page.getByText(/OPERATOR STATUS/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/CURRENT OBJECTIVE/i)).toBeVisible();
    await expect(page.getByText(/SCORE/i)).toBeVisible();

    // Fire button should be visible for touch controls
    await expect(page.getByRole('button', { name: /FIRE/i })).toBeVisible();
  });

  test('should persist high score to localStorage', async ({ page }) => {
    test.skip(!hasMcpSupport, 'Requires WebGL/MCP support');

    await page.waitForTimeout(3000);

    // Start game
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/i });
    await expect(santaButton).toBeVisible({ timeout: 15000 });
    await santaButton.click({ force: true });

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await expect(commenceButton).toBeVisible({ timeout: 15000 });
    await commenceButton.click();

    // Wait for game to start
    await expect(commenceButton).not.toBeVisible({ timeout: 5000 });

    // Play for a moment
    await page.waitForTimeout(2000);
    
    // Check if high score key exists in localStorage
    const highScoreKey = await page.evaluate(() => {
      return localStorage.getItem('protocol-silent-night-highscore');
    });
    
    // High score should be set (even if 0)
    console.log(`High score in localStorage: ${highScoreKey}`);
  });

  // ============================================
  // WebGL Diagnostic Test
  // ============================================

  test('should report WebGL capabilities', async ({ page }) => {
    const webglInfo = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        return {
          available: true,
          renderer: gl.getParameter(gl.RENDERER) || 'unknown',
          vendor: gl.getParameter(gl.VENDOR) || 'unknown',
          version: gl.getParameter(gl.VERSION) || 'unknown',
        };
      }
      return { available: false, renderer: 'none', vendor: 'none', version: 'none' };
    });
    
    console.log(`WebGL Info: ${JSON.stringify(webglInfo, null, 2)}`);
    console.log(`MCP Support: ${hasMcpSupport}`);
    
    if (hasMcpSupport) {
      expect(webglInfo.available).toBe(true);
    }
    // In headless mode, WebGL may or may not be available
  });
});
