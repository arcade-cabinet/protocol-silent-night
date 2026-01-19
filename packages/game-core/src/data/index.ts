/**
 * Data Definition Language (DDL) exports
 *
 * All game content is defined in JSON files and exported here.
 * This provides a data-driven architecture where game balance
 * and content can be modified without changing code.
 *
 * Platform-agnostic: Works with both Three.js (web) and BabylonJS (mobile)
 *
 * Note: All DDLs are validated at load time using Zod schemas
 */

import { ClassesSchema } from '../schemas/class.schema';
import { EnemiesSchema } from '../schemas/enemy.schema';
import { TerrainSchema } from '../schemas/terrain.schema';
import { ThemesSchema } from '../schemas/theme.schema';
import { WeaponsSchema } from '../schemas/weapon.schema';
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

/**
 * Validate DDL data at load time
 * This provides runtime type safety and catches data errors early
 */
const validatedClasses = ClassesSchema.parse(CLASSES_DATA);
const validatedEnemies = EnemiesSchema.parse(ENEMIES_DATA);
const validatedTerrain = TerrainSchema.parse(TERRAIN_DATA);
const validatedThemes = ThemesSchema.parse(THEMES_DATA);
const validatedWeapons = WeaponsSchema.parse(WEAPONS_DATA);

/** Game configuration settings (spawn rates, difficulty scaling, etc.) */
export const CONFIG = CONFIG_DATA;

/** Player character class definitions with stats, visual config, and starting weapons */
export const PLAYER_CLASSES = validatedClasses;

/** Roguelike upgrade definitions for level-up choices */
export const ROGUELIKE_UPGRADES = UPGRADES_DATA;

/** Weapon definitions with damage, fire rate, and behavior patterns */
export const WEAPONS = validatedWeapons.weapons;

/** Weapon evolution configurations (mega/ultimate versions unlocked via upgrades) */
export const WEAPON_EVOLUTIONS = validatedWeapons.evolutions;

/** Enemy configurations and spawn weights */
export const ENEMIES = validatedEnemies;

/** Terrain configuration for procedural generation */
export const TERRAIN_CONFIG = validatedTerrain.terrain;

/** Obstacle type definitions (presents, trees, candy canes, pillars) */
export const OBSTACLE_TYPES = validatedTerrain.obstacles;

/** Workshop items (weapon unlocks, skins, permanent upgrades) */
export const WORKSHOP = WORKSHOP_DATA;

/** Mission briefing text for pre-game screen */
export const BRIEFING = BRIEFING_DATA;

/** Visual theme configurations */
export const THEMES = validatedThemes;

/** Audio file mappings and configurations */
export const AUDIO = AUDIO_DATA;
