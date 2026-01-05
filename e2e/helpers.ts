import { Page, Locator } from '@playwright/test';

/**
 * Disables all CSS animations and transitions to ensure stable element interactions.
 */
export async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation: none !important;
        transition: none !important;
      }
    `
  });
}

/**
 * Standard page setup for E2E tests:
 * - Navigates to home
 * - Disables animations
 * - Waits for network stability
 */
export async function setupPage(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await disableAnimations(page);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Initial stability buffer
}

/**
 * Robust click helper that handles stability issues in CI environments.
 * Follows the pattern: Wait for attached -> Wait for visibility -> Stability buffer -> Force Click -> State buffer
 *
 * Automatically detects COMMENCE OPERATION button and applies extended timeout.
 */
export async function safeClick(page: Page, locator: Locator, options: { timeout?: number } = {}) {
  let timeout = options.timeout || 30000; // Default timeout for CI

  // Check if this is a button role with COMMENCE OPERATION text pattern
  // This is done by checking the locator's options
  const locatorStr = locator.toString();
  const isCommenceButton = /COMMENCE OPERATION/i.test(locatorStr);

  if (isCommenceButton) {
    // COMMENCE OPERATION button has animated reveal - needs extended timeout
    timeout = Math.max(timeout, 45000);

    // Wait for briefing screen to appear first
    try {
      await page.waitForSelector('text=MISSION BRIEFING', { timeout, state: 'visible' });
    } catch {
      // Briefing might already be visible, continue
    }
  }

  // Wait for element to be in the DOM
  await locator.waitFor({ state: 'attached', timeout });

  // Wait for element to be visible
  await locator.waitFor({ state: 'visible', timeout });

  // Wait for element to be stable (not animating)
  await page.waitForTimeout(500);

  // Ensure element is still attached and visible before clicking
  const isAttached = await locator.count() > 0;
  if (!isAttached) {
    throw new Error('Element detached before click');
  }

  // Click with force to bypass any overlays
  await locator.click({ force: true, timeout });

  // State transition buffer
  await page.waitForTimeout(1000);
}

/**
 * Waits for the mission briefing screen and commence button to be ready.
 * The briefing has animated lines that take time to reveal, so we need to wait longer.
 */
export async function waitForBriefingButton(page: Page, timeout = 45000) {
  // First wait for the briefing screen to appear
  await page.waitForSelector('text=MISSION BRIEFING', { timeout, state: 'visible' });

  // Wait for the commence button to appear (it shows after all lines are revealed)
  // Each line takes ~600ms, plus final 500ms delay, so could be 5+ seconds
  const commenceButton = page.getByRole('button', { name: /COMMENCE OPERATION/i });
  await commenceButton.waitFor({ state: 'attached', timeout });
  await commenceButton.waitFor({ state: 'visible', timeout });

  return commenceButton;
}

/**
 * Selects a mech and clicks the commence button to start the game.
 * This handles the full flow from mech selection to game start.
 */
export async function selectMechAndCommence(page: Page, mechName: string) {
  // Select the mech
  const mechButton = page.getByRole('button', { name: new RegExp(mechName, 'i') });
  await safeClick(page, mechButton);

  // Wait for network to settle after navigation
  await page.waitForLoadState('networkidle');

  // Wait for and click the commence button
  const commenceButton = await waitForBriefingButton(page);
  await safeClick(page, commenceButton);

  // Wait for game to start
  await page.waitForTimeout(2000);
}
