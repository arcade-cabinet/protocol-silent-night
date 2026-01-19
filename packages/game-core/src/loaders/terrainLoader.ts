/**
 * @fileoverview Loader for terrain configurations
 * @module loaders/terrainLoader
 *
 * Loads and validates terrain.json DDL file with Zod schema validation.
 * Provides type-safe access to terrain generation parameters and obstacle configs.
 */

import {
  TerrainSchema,
  type TerrainData,
  type TerrainConfigValidated,
  type ObstacleConfig,
} from '../schemas';
import terrainData from '../data/terrain.json';

/**
 * Cached validated terrain data
 */
let cachedTerrain: TerrainData | null = null;

/**
 * Load and validate terrain configuration from terrain.json
 *
 * @returns Validated terrain data including obstacles
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const terrain = loadTerrain();
 * console.log(terrain.terrain.gridSize); // 80
 * console.log(terrain.obstacles.tree.heightRange); // [4, 8]
 * ```
 */
export function loadTerrain(): TerrainData {
  if (cachedTerrain) {
    return cachedTerrain;
  }

  cachedTerrain = TerrainSchema.parse(terrainData);
  return cachedTerrain;
}

/**
 * Load terrain generation configuration
 *
 * @returns The validated terrain generation parameters
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const config = loadTerrainConfig();
 * console.log(config.noiseScale); // 0.1
 * ```
 */
export function loadTerrainConfig(): TerrainConfigValidated {
  const terrain = loadTerrain();
  return terrain.terrain;
}

/**
 * Load all obstacle configurations
 *
 * @returns Record of obstacle type to configuration
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const obstacles = loadObstacles();
 * console.log(obstacles.present_red.color); // '#ff0044'
 * ```
 */
export function loadObstacles(): Record<string, ObstacleConfig> {
  const terrain = loadTerrain();
  return terrain.obstacles;
}

/**
 * Load a specific obstacle configuration by key
 *
 * @param key - The obstacle key to load
 * @returns The validated obstacle configuration or undefined if not found
 * @throws {ZodError} If validation fails
 *
 * @example
 * ```typescript
 * const tree = loadObstacleByKey('tree');
 * console.log(tree?.radius); // 1.2
 * ```
 */
export function loadObstacleByKey(key: string): ObstacleConfig | undefined {
  const obstacles = loadObstacles();
  return obstacles[key];
}

/**
 * Get all available obstacle keys
 *
 * @returns Array of obstacle key identifiers
 *
 * @example
 * ```typescript
 * const keys = getObstacleKeys();
 * // ['present_red', 'present_green', 'tree', 'candy_cane', 'pillar']
 * ```
 */
export function getObstacleKeys(): string[] {
  const obstacles = loadObstacles();
  return Object.keys(obstacles);
}

/**
 * Validate terrain data without caching (useful for testing)
 *
 * @param data - Raw data to validate
 * @returns Validated terrain data
 * @throws {ZodError} If validation fails
 */
export function validateTerrain(data: unknown): TerrainData {
  return TerrainSchema.parse(data);
}

/**
 * Clear the cached terrain data (useful for hot reloading)
 */
export function clearTerrainCache(): void {
  cachedTerrain = null;
}
