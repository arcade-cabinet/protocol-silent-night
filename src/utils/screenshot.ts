/**
 * Screenshot utility
 * Provides helper to check if game should be paused for screenshot capture in E2E tests
 */

declare global {
  interface Window {
    __pauseGameForScreenshot?: boolean;
  }
}

/**
 * Check if the game loop should be paused for screenshot capture
 * Used in E2E visual regression tests to ensure stable screenshots
 */
export function isGamePausedForScreenshot(): boolean {
  return typeof window !== 'undefined' && window.__pauseGameForScreenshot === true;
}
