/**
 * Utilities for handling screenshots in tests.
 *
 * Provides mechanisms to pause the game loop during visual regression tests
 * to ensure deterministic rendering of WebGL scenes.
 */

// Extend window interface
declare global {
  interface Window {
    __pauseGameForScreenshot?: boolean;
  }
}

/**
 * Checks if the game should be paused for a screenshot.
 * Used inside animation loops (useFrame) to freeze rendering.
 */
export const isGamePausedForScreenshot = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.__pauseGameForScreenshot === true;
};
