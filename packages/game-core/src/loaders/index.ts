/**
 * DDL Loaders with Zod validation
 * Load and validate game configuration from JSON files
 *
 * Re-exports all loader functions from individual modules
 */

// Class loaders
export {
  loadClasses,
  loadClassByType,
  getClassTypes,
  validateClasses,
  clearClassesCache,
} from './classLoader';

// Enemy loaders
export {
  loadEnemies,
  loadEnemyByType,
  loadSpawnConfig,
  getEnemyTypes,
  validateEnemies,
  clearEnemiesCache,
} from './enemyLoader';

// Terrain loaders
export {
  loadTerrain,
  loadTerrainConfig,
  loadObstacles,
  loadObstacleByKey,
  getObstacleKeys,
  validateTerrain,
  clearTerrainCache,
} from './terrainLoader';

// Theme loaders
export {
  loadThemes,
  loadThemeByName,
  loadDefaultTheme,
  loadLightingConfig,
  loadSkyConfig,
  loadPostProcessingConfig,
  getThemeNames,
  validateThemes,
  clearThemesCache,
} from './themeLoader';

// Weapon loaders
export {
  loadWeapons,
  loadAllWeapons,
  loadWeaponById,
  loadAllEvolutions,
  loadEvolutionById,
  getEvolutionsForWeapon,
  getWeaponIds,
  getEvolutionIds,
  getWeaponsByCost,
  validateWeapons,
  clearWeaponsCache,
} from './weaponLoader';

// Types are available from the main package export or from schemas directly
// Avoid re-exporting here to prevent conflicts with ./types

/**
 * Clear all loader caches (useful for hot reloading)
 */
export function clearAllCaches(): void {
  // Import the clear functions dynamically to avoid circular deps
  const { clearClassesCache } = require('./classLoader');
  const { clearEnemiesCache } = require('./enemyLoader');
  const { clearTerrainCache } = require('./terrainLoader');
  const { clearThemesCache } = require('./themeLoader');
  const { clearWeaponsCache } = require('./weaponLoader');

  clearClassesCache();
  clearEnemiesCache();
  clearTerrainCache();
  clearThemesCache();
  clearWeaponsCache();
}
