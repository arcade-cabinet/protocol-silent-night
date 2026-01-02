import { Page } from '@playwright/test';

/**
 * Stabilizes the page before taking screenshots to ensure consistent visual regression tests.
 * This function:
 * - Waits for network idle
 * - Disables all animations
 * - Suppresses focus outlines
 * - Blurs any focused elements
 * - Waits for fonts to load
 */
export async function stabilizePage(page: Page): Promise<void> {
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
      *:focus, *:focus-visible, *:focus-within {
        outline: none !important;
        box-shadow: none !important;
        border-color: inherit !important;
      }
      button:focus, button:focus-visible,
      a:focus, a:focus-visible,
      [role="button"]:focus, [role="button"]:focus-visible {
        outline: none !important;
        box-shadow: none !important;
        border: inherit !important;
      }
    `
  });

  // Explicitly blur any focused elements to prevent focus outlines
  await page.evaluate(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
  });

  // Wait for any remaining font rendering
  await page.waitForFunction(() => document.fonts.ready);
}
