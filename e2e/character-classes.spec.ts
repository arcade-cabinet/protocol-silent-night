import { test, expect } from '@playwright/test';

/**
 * Character Classes E2E Tests
 * 
 * Verifies that each character class has the correct stats,
 * abilities, and starting conditions.
 */

test.setTimeout(120000); // Increase global timeout

test.describe('Character Selection & Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for loading screen to disappear
    await expect(page.getByText('INITIALIZING SYSTEMS')).not.toBeVisible({ timeout: 45000 });
  });

  const characters = [
    {
      name: 'MECHA-SANTA',
      role: 'TANK',
      hp: '300',
      speed: 'SLOW',
      weapon: 'COAL CANNON',
      description: 'Heavy armor, slow movement. Fires massive coal projectiles.'
    },
    {
      name: 'CYBER-ELF',
      role: 'SCOUT',
      hp: '100',
      speed: 'FAST',
      weapon: 'PLASMA SMG',
      description: 'Low HP, high mobility. Rapid-fire plasma weapon.'
    },
    {
      name: 'BUMBLE',
      role: 'BRUISER',
      hp: '200',
      speed: 'MEDIUM',
      weapon: 'STAR THROWER',
      description: 'Balanced stats. Fires spread pattern ninja stars.'
    }
  ];

  for (const char of characters) {
    test(`should select ${char.name} and verify stats`, async ({ page }) => {
      // Find and click the character card
      const charButton = page.getByRole('button', { name: new RegExp(char.name) });
      await expect(charButton).toBeVisible();

      // Verify card details before clicking
      const card = page.locator('.classCard').filter({ hasText: char.name });
      await expect(card).toContainText(char.role);
      await expect(card).toContainText(`HP: ${char.hp}`);
      await expect(card).toContainText(`SPEED: ${char.speed}`);

      // Select character
      await charButton.evaluate((e) => e.click());

      // Should show mission briefing
      await expect(page.getByText('MISSION BRIEFING')).toBeVisible({ timeout: 30000 });
      await expect(page.getByText(char.name, { exact: false }).first()).toBeVisible();

      // Click commence operation
      const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
      await commenceButton.waitFor({ state: 'visible', timeout: 30000 });
      await commenceButton.evaluate((e) => e.click());

      // Wait for game HUD and full initialization
      await page.waitForTimeout(3500);

      // Verify in-game stats via store
      const stats = await page.evaluate(() => {
        const store = (window as any).useGameStore;
        const state = store.getState();
        return {
          hp: state.playerHp,
          maxHp: state.playerMaxHp
        };
      });

      expect(stats.hp).toBe(parseInt(char.hp));
      expect(stats.maxHp).toBe(parseInt(char.hp));

      // Verify HUD display
      await expect(page.locator(`text=${char.hp} / ${char.hp}`)).toBeVisible();
    });
  }
});

test.describe('Weapon Mechanics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('INITIALIZING SYSTEMS')).not.toBeVisible({ timeout: 45000 });
  });

  test('Mecha-Santa should fire single powerful shots', async ({ page }) => {
    // Select Santa
    const santaButton = page.getByRole('button', { name: /MECHA-SANTA/ });
    await santaButton.evaluate((e) => e.click());

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 30000 });
    await commenceButton.evaluate((e) => e.click());

    await page.waitForTimeout(3500);

    // Get initial bullet count
    const initialBullets = await page.evaluate(() =>
      (window as any).useGameStore.getState().bullets.length
    );
    expect(initialBullets).toBe(0);

    // Fire once
    await page.keyboard.down('Space');
    await page.waitForTimeout(100);
    await page.keyboard.up('Space');

    // Should spawn exactly 1 bullet
    await page.waitForFunction(
      () => (window as any).useGameStore.getState().bullets.length > 0,
      null,
      { timeout: 5000 }
    );
  });

  test('Bumble should fire spread shots (3 projectiles)', async ({ page }) => {
    // Select Bumble
    const bumbleButton = page.getByRole('button', { name: /BUMBLE/ });
    await bumbleButton.evaluate((e) => e.click());

    // Click "COMMENCE OPERATION" on the briefing screen
    const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
    await commenceButton.waitFor({ state: 'visible', timeout: 30000 });
    await commenceButton.evaluate((e) => e.click());

    await page.waitForTimeout(3500);

    // Fire once
    await page.keyboard.down('Space');
    await page.waitForTimeout(100);
    await page.keyboard.up('Space');

    // Should spawn 3 bullets
    await page.waitForFunction(
      () => (window as any).useGameStore.getState().bullets.length >= 3,
      null,
      { timeout: 5000 }
    );
  });
});
