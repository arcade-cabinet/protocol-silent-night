/**
 * @fileoverview DDL loader exports with Zod validation
 * @module loaders
 *
 * Provides type-safe loaders for all game data definition files.
 * Each loader validates JSON data against Zod schemas at runtime.
 */

// Import cache clearing functions for use in clearAllCaches
import { clearClassesCache } from './classLoader';
import { clearEnemiesCache } from './enemyLoader';
import { clearTerrainCache } from './terrainLoader';
import { clearThemesCache } from './themeLoader';
import { clearWeaponsCache } from './weaponLoader';

// Class loaders
export {
  clearClassesCache,
  getClassTypes,
  loadClassByType,
  loadClasses,
  validateClasses,
} from './classLoader';

// Enemy loaders
export {
  clearEnemiesCache,
  getEnemyTypes,
  loadEnemies,
  loadEnemyByType,
  loadSpawnConfig,
  validateEnemies,
} from './enemyLoader';

// Terrain loaders
export {
  clearTerrainCache,
  getObstacleKeys,
  loadObstacleByKey,
  loadObstacles,
  loadTerrain,
  loadTerrainConfig,
  validateTerrain,
} from './terrainLoader';

// Theme loaders
export {
  clearThemesCache,
  getThemeNames,
  loadDefaultTheme,
  loadLightingConfig,
  loadPostProcessingConfig,
  loadSkyConfig,
  loadThemeByName,
  loadThemes,
  validateThemes,
} from './themeLoader';

// Weapon loaders
export {
  clearWeaponsCache,
  getEvolutionIds,
  getEvolutionsForWeapon,
  getWeaponIds,
  getWeaponsByCost,
  loadAllEvolutions,
  loadAllWeapons,
  loadEvolutionById,
  loadWeaponById,
  loadWeapons,
  validateWeapons,
} from './weaponLoader';

/**
 * Clear all cached loader data
 * Useful for hot reloading or testing scenarios
 */
export function clearAllCaches(): void {
  clearClassesCache();
  clearEnemiesCache();
  clearTerrainCache();
  clearThemesCache();
  clearWeaponsCache();
}
