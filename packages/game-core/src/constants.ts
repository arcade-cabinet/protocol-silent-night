/**
 * Game constants and configuration values
 */

/**
 * Maximum stat values for character display
 * Used for calculating stat bar widths in UI
 */
export const MAX_STAT_VALUES = {
  HP: 300,
  SPEED: 20,
  DAMAGE: 50,
} as const;

/**
 * Game balance constants
 */
export const GAME_CONSTANTS = {
  /** Target frames per second */
  TARGET_FPS: 60,
  /** XP required for first level up */
  BASE_XP_REQUIREMENT: 100,
  /** XP multiplier per level */
  XP_SCALE_FACTOR: 1.2,
  /** Minimum time between enemy spawns (ms) */
  MIN_SPAWN_INTERVAL: 500,
  /** Maximum enemies on screen */
  MAX_ENEMIES: 100,
} as const;
