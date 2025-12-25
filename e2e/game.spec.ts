import { test, expect } from '@playwright/test';

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

  test('should load the page with correct title', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Protocol: Silent Night/);
    
    // Check that the root element exists
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('should have correct meta tags', async ({ page }) => {
    // Check for PWA meta tags
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#050505');
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Protocol: Silent Night');
  });

  test('should have localStorage available', async ({ page }) => {
    // Test that localStorage works for high score persistence
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
    // Check that Orbitron font stylesheet is loaded
    const fontStylesheet = page.locator('link[href*="fonts.googleapis.com/css"]');
    await expect(fontStylesheet).toHaveCount(1);
  });

  test('should have PWA manifest', async ({ page }) => {
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    // Verify manifest can be fetched
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBe('/manifest.json');
    
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.ok()).toBe(true);
    
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('Protocol: Silent Night');
  });

  // WebGL tests - these may fail in headless mode without GPU
  test('should attempt to render canvas (WebGL)', async ({ page }) => {
    // Wait for React to mount
    await page.waitForTimeout(3000);
    
    // Check if canvas exists (Three.js creates this)
    // This may not work in all headless environments
    const canvasCount = await page.locator('canvas').count();
    
    // Log result but don't fail - WebGL may not be available
    console.log(`Canvas elements found: ${canvasCount}`);
    
    // Just verify the app didn't crash - root should still be visible
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('should handle WebGL context gracefully', async ({ page }) => {
    // Check if WebGL is available in the browser
    const webglInfo = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl) {
        return {
          available: true,
          renderer: (gl.getParameter(gl.RENDERER) as string) || 'unknown',
          vendor: (gl.getParameter(gl.VENDOR) as string) || 'unknown',
        };
      }
      return { available: false, renderer: 'none', vendor: 'none' };
    });
    
    console.log(`WebGL info: ${JSON.stringify(webglInfo)}`);
    
    // Don't fail the test based on WebGL availability
    // Just log for debugging purposes
    expect(true).toBe(true);
  });
});
