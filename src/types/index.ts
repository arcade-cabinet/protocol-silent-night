/**
 * @fileoverview Type definitions and constants for Protocol: Silent Night
 * @module types
 */

import type * as THREE from 'three';

/**
 * Game state machine states
 * @description Represents the current phase of the game
 */
export type GameState = 'MENU' | 'PHASE_1' | 'PHASE_BOSS' | 'WIN' | 'GAME_OVER';

/**
 * Available player character classes
 */
export type PlayerClassType = 'santa' | 'elf' | 'bumble';

/**
 * Configuration for a player character class
 * @interface PlayerClassConfig
 */
export interface PlayerClassConfig {
  /** Unique identifier for the class */
  type: PlayerClassType;
  /** Display name (e.g., "MECHA-SANTA") */
  name: string;
  /** Role description (e.g., "Heavy Siege / Tank") */
  role: string;
  /** Maximum health points */
  hp: number;
  /** Movement speed in units per second */
  speed: number;
  /** Rate of fire - seconds between shots */
  rof: number;
  /** Damage per projectile hit */
  damage: number;
  /** Primary color as hex number */
  color: number;
  /** Character scale multiplier */
  scale: number;
  /** Weapon type determining projectile behavior */
  weaponType: 'cannon' | 'smg' | 'star';
  /** Fur rendering colors as RGB tuples (0-1 range) */
  furColor: {
    base: [number, number, number];
    tip: [number, number, number];
  };
}

/**
 * Enemy type identifiers
 */
export type EnemyType = 'minion' | 'boss';

/**
 * Configuration for enemy types
 * @interface EnemyConfig
 */
export interface EnemyConfig {
  /** Enemy type identifier */
  type: EnemyType;
  /** Maximum health points */
  hp: number;
  /** Movement speed in units per second */
  speed: number;
  /** Contact damage to player */
  damage: number;
  /** Score points awarded when killed */
  pointValue: number;
}

/**
 * Base entity data shared by all game entities
 * @interface EntityData
 */
export interface EntityData {
  /** Unique identifier */
  id: string;
  /** Three.js object for position tracking */
  mesh: THREE.Object3D;
  /** Current velocity vector */
  velocity: THREE.Vector3;
  /** Current health points */
  hp: number;
  /** Maximum health points */
  maxHp: number;
  /** Whether entity is currently active in game */
  isActive: boolean;
}

/**
 * Projectile data extending base entity
 * @interface BulletData
 * @extends EntityData
 */
export interface BulletData extends EntityData {
  /** Normalized direction vector */
  direction: THREE.Vector3;
  /** True if fired by enemy, false if player */
  isEnemy: boolean;
  /** Damage dealt on hit */
  damage: number;
  /** Remaining lifetime in seconds */
  life: number;
  /** Travel speed in units per second */
  speed: number;
  /** Weapon type that fired this bullet */
  type?: 'cannon' | 'smg' | 'stars';
}

/**
 * Enemy entity data extending base entity
 * @interface EnemyData
 * @extends EntityData
 */
export interface EnemyData extends EntityData {
  /** Enemy type (minion or boss) */
  type: EnemyType;
  /** Movement speed */
  speed: number;
  /** Contact damage */
  damage: number;
  /** Score value when killed */
  pointValue: number;
  /** Timer for attack patterns (boss only) */
  attackTimer?: number;
  /** Current AI phase (boss only) */
  phase?: 'chase' | 'barrage';
}

/**
 * Player input state from keyboard/touch
 * @interface InputState
 */
export interface InputState {
  /** Movement vector (-1 to 1 on each axis) */
  movement: { x: number; y: number };
  /** True when fire button is held */
  isFiring: boolean;
  /** True when touch joystick is being used */
  joystickActive: boolean;
  /** Screen coordinates of joystick origin */
  joystickOrigin: { x: number; y: number };
}

/**
 * Player statistics for current game session
 * @interface GameStats
 */
export interface GameStats {
  /** Current score */
  score: number;
  /** Total enemies killed */
  kills: number;
  /** Whether boss was defeated */
  bossDefeated: boolean;
}

/**
 * Global game configuration constants
 * @constant
 */
export const CONFIG = {
  /** Size of the game world (NxN grid) */
  WORLD_SIZE: 80,
  /** Kills required to trigger boss spawn */
  WAVE_REQ: 10,
  /** Maximum concurrent minions */
  MAX_MINIONS: 15,
  /** Milliseconds between minion spawns */
  SPAWN_INTERVAL: 2000,
  /** Color palette (hex values) */
  COLORS: {
    SANTA: 0xff0044,
    ELF: 0x00ffcc,
    BUMBLE: 0xeeeeee,
    ENEMY_MINION: 0x00ff00,
    ENEMY_BOSS: 0xff0044,
    BULLET_PLAYER: 0xffffaa,
    BULLET_ENEMY: 0xff0000,
  },
} as const;

/**
 * Player class definitions with stats and appearance
 * @constant
 */
export const PLAYER_CLASSES: Record<PlayerClassType, PlayerClassConfig> = {
  santa: {
    type: 'santa',
    name: 'MECHA-SANTA',
    role: 'Heavy Siege / Tank',
    hp: 300,
    speed: 9,
    rof: 0.5,
    damage: 40,
    color: CONFIG.COLORS.SANTA,
    scale: 1.4,
    weaponType: 'cannon',
    furColor: {
      base: [0.5, 0.05, 0.05],
      tip: [0.8, 0.2, 0.2],
    },
  },
  elf: {
    type: 'elf',
    name: 'CYBER-ELF',
    role: 'Recon / Scout',
    hp: 100,
    speed: 18,
    rof: 0.1,
    damage: 8,
    color: CONFIG.COLORS.ELF,
    scale: 0.8,
    weaponType: 'smg',
    furColor: {
      base: [0.0, 0.3, 0.25],
      tip: [0.2, 0.6, 0.5],
    },
  },
  bumble: {
    type: 'bumble',
    name: 'THE BUMBLE',
    role: 'Crowd Control / Bruiser',
    hp: 200,
    speed: 12,
    rof: 0.25,
    damage: 18,
    color: CONFIG.COLORS.BUMBLE,
    scale: 1.6,
    weaponType: 'star',
    furColor: {
      base: [0.7, 0.7, 0.7],
      tip: [1.0, 1.0, 1.0],
    },
  },
};
