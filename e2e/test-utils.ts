import { Page } from '@playwright/test';

/**
 * Test utilities for E2E tests
 */

/**
 * Disables CSS animations and transitions to ensure elements become stable
 * for screenshots and interactions
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
}

/**
 * Waits for page to be fully loaded and stable
 */
export async function waitForStablePage(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

/**
 * Selects a character and waits for briefing screen
 */
export async function selectCharacter(
  page: Page,
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE'
): Promise<void> {
  // Wait for character button to be visible
  const button = page.getByRole('button', { name: new RegExp(characterName) });
  await button.waitFor({ state: 'visible', timeout: 15000 });

  // Click the character button
  await button.click({ force: true });

  // Wait for briefing screen to appear
  await page.getByText('MISSION BRIEFING').waitFor({ state: 'visible', timeout: 15000 });
}

/**
 * Clicks the commence operation button and waits for game to start
 */
export async function commenceOperation(page: Page): Promise<void> {
  // Wait for briefing animations (600ms per line * ~6 lines + 500ms for button)
  await page.waitForTimeout(5000);

  // Wait for button to be visible
  const button = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await button.waitFor({ state: 'visible', timeout: 15000 });

  // Click the button
  await button.click({ force: true });

  // Wait for game to initialize
  await page.waitForTimeout(3000);
}

/**
 * Complete flow to start a game with a character
 */
export async function startGame(
  page: Page,
  characterName: 'MECHA-SANTA' | 'CYBER-ELF' | 'BUMBLE'
): Promise<void> {
  await selectCharacter(page, characterName);
  await commenceOperation(page);
}
