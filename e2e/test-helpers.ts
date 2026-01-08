import { type Page, expect } from '@playwright/test';

/**
 * Options for character selection and mission start
 */
export interface SelectCharacterOptions {
  /** Timeout for character button visibility (default: undefined - uses Playwright default) */
  characterVisibilityTimeout?: number;
  /** Wait time before clicking character button (default: 500ms) */
  preClickWait?: number;
  /** Timeout for character button click (default: 15000ms) */
  characterClickTimeout?: number;
  /** Wait time for briefing screen transition (default: 1000ms) */
  briefingTransitionWait?: number;
  /** Timeout for COMMENCE button visibility (default: 20000ms) */
  commenceVisibilityTimeout?: number;
  /** Wait time before clicking COMMENCE button (default: 0ms) */
  preCommenceClickWait?: number;
  /** Timeout for COMMENCE button click (default: 15000ms) */
  commenceClickTimeout?: number;
}

/**
 * Selects a character and waits for the mission briefing screen to appear.
 * Does NOT click the COMMENCE OPERATION button.
 *
 * Use this when you want to test the briefing UI itself without starting gameplay.
 *
 * @param page - The Playwright page object
 * @param characterName - A string matching the character button name (e.g., "MECHA-SANTA")
 * @param options - Optional configuration for timeouts and waits
 */
export async function selectCharacterToBriefing(
  page: Page,
  characterName: string,
  options: {
    preClickWait?: number;
    characterVisibilityTimeout?: number;
    characterClickTimeout?: number;
    briefingTransitionWait?: number;
    briefingTimeout?: number;
  } = {}
): Promise<void> {
  const {
    preClickWait = 1000,
    characterVisibilityTimeout = 20000,
    characterClickTimeout = 20000,
    briefingTransitionWait = 2000,
    briefingTimeout = 15000,
  } = options;

  await page.waitForTimeout(preClickWait);
  const characterButton = page.locator(`button:has-text("${characterName}")`);
  await expect(characterButton).toBeVisible({ timeout: characterVisibilityTimeout });
  await characterButton.click({ force: true, timeout: characterClickTimeout });

  // Wait for briefing screen transition
  await page.waitForTimeout(briefingTransitionWait);
  await page.waitForSelector('text=MISSION BRIEFING', { timeout: briefingTimeout });
}

/**
 * Selects a character and starts the mission by clicking through the briefing screen.
 *
 * This helper consolidates the common pattern of:
 * 1. Clicking a character selection button
 * 2. Waiting for the briefing screen transition
 * 3. Clicking the "COMMENCE OPERATION" button
 *
 * @param page - The Playwright page object
 * @param characterName - A RegExp matching the character button name (e.g., /MECHA-SANTA/)
 * @param options - Optional configuration for timeouts and waits
 */
export async function selectCharacterAndStartMission(
  page: Page,
  characterName: RegExp,
  options: SelectCharacterOptions = {}
): Promise<void> {
  const {
    characterVisibilityTimeout,
    preClickWait = 500,
    characterClickTimeout = 15000,
    briefingTransitionWait = 1000,
    commenceVisibilityTimeout = 20000,
    preCommenceClickWait = 0,
    commenceClickTimeout = 15000,
  } = options;

  // Select character
  const characterButton = page.getByRole('button', { name: characterName });
  if (characterVisibilityTimeout !== undefined) {
    await expect(characterButton).toBeVisible({ timeout: characterVisibilityTimeout });
  } else {
    await expect(characterButton).toBeVisible();
  }
  await page.waitForTimeout(preClickWait);
  await characterButton.click({ force: true, timeout: characterClickTimeout });

  // Wait for briefing screen transition
  await page.waitForTimeout(briefingTransitionWait);

  // Click "COMMENCE OPERATION" on the briefing screen
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await expect(commenceButton).toBeVisible({ timeout: commenceVisibilityTimeout });
  if (preCommenceClickWait > 0) {
    await page.waitForTimeout(preCommenceClickWait);
  }

  // Use simple click if timeout is 0, otherwise use force click with timeout
  if (commenceClickTimeout === 0) {
    await commenceButton.click();
  } else {
    await commenceButton.click({ force: true, timeout: commenceClickTimeout });
  }
}
