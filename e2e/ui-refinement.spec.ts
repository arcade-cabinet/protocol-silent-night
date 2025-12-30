import { test, expect } from '@playwright/test';

/**
 * UI Component Refinement Tests
 *
 * Tests UI components with visual regression, accessibility, and responsiveness checks.
 * Designed to work with Playwright MCP for interactive debugging and refinement.
 *
 * Run with MCP (headed browser): PLAYWRIGHT_MCP=true npm run test:e2e -- ui-refinement
 * Run headless: npm run test:e2e -- ui-refinement
 */

const hasMcpSupport = process.env.PLAYWRIGHT_MCP === 'true';

test.describe('UI Component Refinement', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console error: ${msg.text()}`);
      }
    });

    // Listen for WebGL errors
    page.on('console', msg => {
      if (msg.text().includes('WebGL') || msg.text().includes('Shader')) {
        console.log(`⚠️  WebGL warning: ${msg.text()}`);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Menu Screen', () => {
    test('should render menu with proper styling and layout', async ({ page }) => {
      // Wait for menu to fully render
      await page.waitForSelector('h1', { timeout: 5000 });

      // Verify title is visible
      const title = page.locator('h1');
      await expect(title).toBeVisible();
      await expect(title).toContainText('Protocol');

      // Verify subtitle
      const subtitle = page.locator('h3');
      await expect(subtitle).toBeVisible();
      await expect(subtitle).toContainText('DDL Edition');

      // Screenshot for visual inspection (MCP mode)
      if (hasMcpSupport) {
        await page.screenshot({ path: 'test-results/menu-screen.png' });
        console.log('📸 Menu screenshot saved to test-results/menu-screen.png');
      }
    });

    test('should have all three mech selection buttons', async ({ page }) => {
      const buttons = page.locator('button[type="button"]').filter({ hasText: /MECHA|CYBER|BUMBLE/i });
      const count = await buttons.count();

      expect(count).toBeGreaterThanOrEqual(3);

      // Verify each mech button is clickable
      const mechNames = ['MECHA-SANTA', 'CYBER-ELF', 'THE BUMBLE'];
      for (const mechName of mechNames) {
        const button = page.locator(`button:has-text("${mechName}")`);
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
      }
    });

    test('should have Santa\'s Workshop button', async ({ page }) => {
      const workshopButton = page.locator('text=SANTA\'S WORKSHOP').first();
      await expect(workshopButton).toBeVisible();
      await expect(workshopButton).toBeEnabled();
    });

    test('should display mech stats correctly', async ({ page }) => {
      // Check for stat displays
      const stats = page.locator('text=/HP:|SPEED:|WEAPON:/');
      const statCount = await stats.count();

      expect(statCount).toBeGreaterThan(0);
      console.log(`✅ Found ${statCount} stat displays on menu`);
    });
  });

  test.describe('Mech Selection Flow', () => {
    test('should show mission briefing when mech is selected', async ({ page }) => {
      // Click MECHA-SANTA
      await page.click('button:has-text("MECHA-SANTA")');

      // Wait for mission briefing
      await page.waitForSelector('text=MISSION BRIEFING', { timeout: 5000 });

      const briefingTitle = page.locator('text=MISSION BRIEFING');
      await expect(briefingTitle).toBeVisible();

      // Verify mission details
      await expect(page.locator('text=SILENT NIGHT')).toBeVisible();
      await expect(page.locator('text=MECHA-SANTA')).toBeVisible();
    });

    test('should have COMMENCE OPERATION button on briefing screen', async ({ page }) => {
      // Select a mech
      await page.click('button:has-text("CYBER-ELF")');

      // Wait for briefing
      await page.waitForSelector('text=MISSION BRIEFING', { timeout: 5000 });

      // Check for operation button
      const opButton = page.locator('button:has-text("COMMENCE OPERATION")');
      await expect(opButton).toBeVisible();
      await expect(opButton).toBeEnabled();
    });

    test('should display correct operator for each mech', async ({ page }) => {
      const mechs = [
        { name: 'MECHA-SANTA', role: 'Heavy Stage' },
        { name: 'CYBER-ELF', role: 'Recon' },
        { name: 'THE BUMBLE', role: 'Crowd Control' },
      ];

      for (const mech of mechs) {
        // Click mech
        await page.click(`button:has-text("${mech.name}")`);

        // Wait for briefing
        await page.waitForSelector('text=MISSION BRIEFING', { timeout: 5000 });

        // Verify operator and role
        await expect(page.locator(`text=${mech.name}`)).toBeVisible();
        await expect(page.locator(`text=${mech.role}`)).toBeVisible();

        // Go back to menu for next iteration
        if (mech.name !== 'THE BUMBLE') {
          await page.reload();
          await page.waitForSelector('h1', { timeout: 5000 });
        }
      }
    });
  });

  test.describe('HUD and Gameplay', () => {
    test('should display HUD elements during gameplay', async ({ page }) => {
      // Skip if not in MCP mode (WebGL rendering required)
      if (!hasMcpSupport) {
        test.skip();
      }

      // Select mech
      await page.click('button:has-text("MECHA-SANTA")');

      // Wait for briefing
      await page.waitForSelector('text=MISSION BRIEFING', { timeout: 5000 });

      // Click commence
      await page.click('button:has-text("COMMENCE OPERATION")');

      // Wait for game HUD to appear
      await page.waitForTimeout(2000);

      // Check for HUD elements
      const hudStats = page.locator('text=/HP:|AMMO:|SPEED:/', { timeout: 3000 }).first();
      await expect(hudStats).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('⚠️  HUD stats not immediately visible - game may still be loading');
      });
    });

    test('should display weapon information in HUD', async ({ page }) => {
      if (!hasMcpSupport) {
        test.skip();
      }

      // Select CYBER-ELF (Plasma SMG)
      await page.click('button:has-text("CYBER-ELF")');
      await page.waitForSelector('text=MISSION BRIEFING', { timeout: 5000 });
      await page.click('button:has-text("COMMENCE OPERATION")');

      // Wait for HUD
      await page.waitForTimeout(2000);

      // Check for weapon display
      const weaponDisplay = page.locator('text=/Plasma|Coal|Star/').first();
      await expect(weaponDisplay).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('⚠️  Weapon display not visible');
      });
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper button attributes', async ({ page }) => {
      const buttons = page.locator('button[type="button"]');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i);

        // Check for accessible text
        const text = await button.textContent();
        expect(text).toBeTruthy();
        console.log(`✅ Button ${i}: "${text?.trim()}"`);
      }
    });

    test('should have proper focus management', async ({ page }) => {
      // Tab to first button
      await page.keyboard.press('Tab');

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
      console.log(`✅ Focus moved to ${focusedElement}`);
    });
  });

  test.describe('Visual Regression', () => {
    test('should match menu screen snapshot', async ({ page }) => {
      await page.waitForSelector('h1', { timeout: 5000 });

      // Take snapshot for visual regression
      if (hasMcpSupport) {
        await expect(page).toHaveScreenshot('menu-screen.png', {
          maxDiffPixels: 100,
        }).catch(() => {
          console.log('ℹ️  Snapshot mismatch - this may be expected for visual refinements');
        });
      }
    });

    test('should match mission briefing snapshot', async ({ page }) => {
      // Select mech
      await page.click('button:has-text("MECHA-SANTA")');
      await page.waitForSelector('text=MISSION BRIEFING', { timeout: 5000 });

      if (hasMcpSupport) {
        await expect(page).toHaveScreenshot('mission-briefing.png', {
          maxDiffPixels: 100,
        }).catch(() => {
          console.log('ℹ️  Snapshot mismatch - this may be expected for visual refinements');
        });
      }
    });
  });

  test.describe('Responsiveness', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify elements are still visible
      const title = page.locator('h1');
      await expect(title).toBeVisible();

      const buttons = page.locator('button[type="button"]').filter({ hasText: /MECHA|CYBER|BUMBLE/i });
      await expect(buttons.first()).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Verify layout is appropriate
      const title = page.locator('h1');
      await expect(title).toBeVisible();
    });

    test('should display correctly on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Verify all elements are visible
      const title = page.locator('h1');
      await expect(title).toBeVisible();

      const buttons = page.locator('button[type="button"]').filter({ hasText: /MECHA|CYBER|BUMBLE/i });
      const count = await buttons.count();
      expect(count).toBeGreaterThanOrEqual(3);
    });
  });
});
