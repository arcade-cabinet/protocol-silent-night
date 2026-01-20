/**
 * @protocol-silent-night/game-core
 * Shared game logic, types, and assets for Protocol: Silent Night
 * Used by both web (BabylonJS + Reactylon) and mobile (BabylonJS React Native)
 */

// Types
export * from './types';

// Store
export { useGameStore } from './store';

// Loaders
export * from './loaders';

// Schema types (re-export commonly used types from schemas)
export type { PlayerClassConfigValidated as PlayerClassConfig } from './schemas';
export type { ClassesData, EnemiesData, TerrainData, ThemesData, WeaponsData } from './schemas';
export type { WeaponConfigValidated, WeaponEvolutionConfigValidated } from './schemas';

// Data (re-export JSON imports)
import classesData from './data/classes.json';
import enemiesData from './data/enemies.json';
import terrainData from './data/terrain.json';
import themesData from './data/themes.json';
import weaponsData from './data/weapons.json';

export const CLASSES = classesData;
export const ENEMIES = enemiesData;
export const TERRAIN = terrainData;
export const THEMES = themesData;
export const WEAPONS = weaponsData;

// Obstacle types shortcut
export const OBSTACLE_TYPES = terrainData.obstacles;
