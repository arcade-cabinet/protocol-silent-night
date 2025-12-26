import type {
  EnemyConfig,
  EnemyType,
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

export const CONFIG = CONFIG_DATA;
export const PLAYER_CLASSES = CLASSES_DATA as Record<PlayerClassType, PlayerClassConfig>;
export const ROGUELIKE_UPGRADES = UPGRADES_DATA as RoguelikeUpgrade[];
export const WEAPONS = WEAPONS_DATA.weapons as Record<string, WeaponConfig>;
export const WEAPON_EVOLUTIONS = WEAPONS_DATA.evolutions as Record<string, WeaponEvolutionConfig>;
export const ENEMIES = ENEMIES_DATA as Record<EnemyType, EnemyConfig> & { spawnConfig: Record<string, number> };
export const TERRAIN_CONFIG = TERRAIN_DATA.terrain;
export const OBSTACLE_TYPES = TERRAIN_DATA.obstacles as Record<string, ObstacleTypeConfig>;
export const WORKSHOP = WORKSHOP_DATA;
export const BRIEFING = BRIEFING_DATA;
export const THEMES = THEMES_DATA;
export const AUDIO = AUDIO_DATA;
