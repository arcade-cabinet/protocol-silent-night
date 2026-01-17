/**
 * Data Definition Language (DDL) exports
 *
 * All game content is defined in JSON files and exported here.
 * This provides a data-driven architecture where game balance
 * and content can be modified without changing code.
 *
 * Platform-agnostic: Works with both Three.js (web) and BabylonJS (mobile)
 */

import type {
  EnemyConfig,
  EnemyType,
  ObstacleTypeConfig,
  PlayerClassConfig,
  PlayerClassType,
  RoguelikeUpgrade,
  WeaponConfig,
  WeaponEvolutionConfig,
} from '../types';
import AUDIO_DATA from './audio.json';
import BRIEFING_DATA from './briefing.json';
import CLASSES_DATA from './classes.json';
import CONFIG_DATA from './config.json';
import ENEMIES_DATA from './enemies.json';
import TERRAIN_DATA from './terrain.json';
import THEMES_DATA from './themes.json';
import UPGRADES_DATA from './upgrades.json';
import WEAPONS_DATA from './weapons.json';
import WORKSHOP_DATA from './workshop.json';

/** Game configuration settings (spawn rates, difficulty scaling, etc.) */
export const CONFIG = CONFIG_DATA;

/** Player character class definitions with stats, visual config, and starting weapons */
export const PLAYER_CLASSES = CLASSES_DATA as Record<PlayerClassType, PlayerClassConfig>;

/** Roguelike upgrade definitions for level-up choices */
export const ROGUELIKE_UPGRADES = UPGRADES_DATA as RoguelikeUpgrade[];

/** Weapon definitions with damage, fire rate, and behavior patterns */
export const WEAPONS = WEAPONS_DATA.weapons as Record<string, WeaponConfig>;

/** Weapon evolution configurations (mega/ultimate versions unlocked via upgrades) */
export const WEAPON_EVOLUTIONS = WEAPONS_DATA.evolutions as Record<string, WeaponEvolutionConfig>;

/** Enemy configurations and spawn weights */
export const ENEMIES = ENEMIES_DATA as Record<EnemyType, EnemyConfig> & {
  spawnConfig: Record<string, number>;
};

/** Terrain configuration for procedural generation */
export const TERRAIN_CONFIG = TERRAIN_DATA.terrain;

/** Obstacle type definitions (presents, trees, candy canes, pillars) */
export const OBSTACLE_TYPES = TERRAIN_DATA.obstacles as unknown as Record<
  string,
  ObstacleTypeConfig
>;

/** Workshop items (weapon unlocks, skins, permanent upgrades) */
export const WORKSHOP = WORKSHOP_DATA;

/** Mission briefing text for pre-game screen */
export const BRIEFING = BRIEFING_DATA;

/** Visual theme configurations */
export const THEMES = THEMES_DATA;

/** Audio file mappings and configurations */
export const AUDIO = AUDIO_DATA;
