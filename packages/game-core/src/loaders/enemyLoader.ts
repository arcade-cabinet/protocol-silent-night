/**
 * @fileoverview Loader for enemy configurations
 * @module loaders/enemyLoader
 *
 * Loads and validates enemies.json DDL file with Zod schema validation.
 * Provides type-safe access to enemy configurations and spawn settings.
 */

import {
  EnemiesSchema,
  type EnemiesData,
  type EnemyConfigValidated,
  type SpawnConfig,
} from '../schemas';
import enemiesData from '../data/enemies.json';

/**
 * Cached validated enemies data
 */
let cachedEnemies: EnemiesData | null = null;

/**
 * Load and validate enemy configurations from enemies.json
 *
 * @returns Validated enemies data including spawn config
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const enemies = loadEnemies();
 * console.log(enemies.minion.hp); // 30
 * console.log(enemies.spawnConfig.initialMinions); // 5
 * ```
 */
export function loadEnemies(): EnemiesData {
  if (cachedEnemies) {
    return cachedEnemies;
  }

  cachedEnemies = EnemiesSchema.parse(enemiesData);
  return cachedEnemies;
}

/**
 * Load a specific enemy configuration by type
 *
 * @param type - The enemy type to load ('minion' or 'boss')
 * @returns The validated enemy configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const boss = loadEnemyByType('boss');
 * console.log(boss.hp); // 1000
 * ```
 */
export function loadEnemyByType(type: 'minion' | 'boss'): EnemyConfigValidated {
  const enemies = loadEnemies();
  return enemies[type];
}

/**
 * Load spawn configuration
 *
 * @returns The validated spawn configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const spawn = loadSpawnConfig();
 * console.log(spawn.minionSpawnRadiusMax); // 35
 * ```
 */
export function loadSpawnConfig(): SpawnConfig {
  const enemies = loadEnemies();
  return enemies.spawnConfig;
}

/**
 * Get all available enemy types
 *
 * @returns Array of available enemy type identifiers
 *
 * @example
 * ```typescript
 * const types = getEnemyTypes(); // ['minion', 'boss']
 * ```
 */
export function getEnemyTypes(): Array<'minion' | 'boss'> {
  return ['minion', 'boss'];
}

/**
 * Validate enemies data without caching (useful for testing)
 *
 * @param data - Raw data to validate
 * @returns Validated enemies data
 * @throws {ZodError} If validation fails
 */
export function validateEnemies(data: unknown): EnemiesData {
  return EnemiesSchema.parse(data);
}

/**
 * Clear the cached enemies data (useful for hot reloading)
 */
export function clearEnemiesCache(): void {
  cachedEnemies = null;
}
