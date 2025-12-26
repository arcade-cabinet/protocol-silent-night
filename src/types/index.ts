/**
 * @fileoverview Type definitions and constants for Protocol: Silent Night
 * @module types
 */

import type * as THREE from 'three';

/**
 * Game state machine states
 * @description Represents the current phase of the game
 */
export type GameState = 'MENU' | 'BRIEFING' | 'PHASE_1' | 'PHASE_BOSS' | 'WIN' | 'GAME_OVER';

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
  weaponType: 'cannon' | 'smg' | 'star' | 'snowball' | 'candy-cane';
  /** Fur rendering colors as RGB tuples (0-1 range) */
  furColor: {
    base: [number, number, number];
    tip: [number, number, number];
  };
}

/**
 * Weapon evolution identifiers
 */
export type WeaponEvolutionType =
  | 'mega-coal-mortar'
  | 'plasma-storm'
  | 'supernova-burst'
  | 'blizzard-cannon'
  | 'peppermint-tornado';

/**
 * Configuration for weapon evolution
 * @interface WeaponEvolutionConfig
 */
export interface WeaponEvolutionConfig {
  /** Unique identifier for evolution */
  id: WeaponEvolutionType;
  /** Display name */
  name: string;
  /** Base weapon type that can evolve */
  baseWeapon: PlayerClassConfig['weaponType'];
  /** Minimum level required */
  minLevel: number;
  /** Required upgrade selections (if any) */
  requiredUpgrades?: string[];
  /** Stat modifiers applied on evolution */
  modifiers: {
    damageMultiplier?: number;
    rofMultiplier?: number;
    speedMultiplier?: number;
    projectileCount?: number;
    spreadAngle?: number;
    size?: number;
    penetration?: boolean;
    explosive?: boolean;
  };
}

/**
 * Helper to get bullet type from weapon type
 */
export const getBulletTypeFromWeapon = (
  weaponType: PlayerClassConfig['weaponType']
): 'cannon' | 'smg' | 'stars' | 'snowball' | 'candy-cane' => {
  switch (weaponType) {
    case 'cannon':
      return 'cannon';
    case 'smg':
      return 'smg';
    case 'star':
      return 'stars';
    case 'snowball':
      return 'snowball';
    case 'candy-cane':
      return 'candy-cane';
    default:
      return 'stars';
  }
};

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
  type?: 'cannon' | 'smg' | 'stars' | 'snowball' | 'candy-cane';
  /** Evolution type if weapon is evolved */
  evolutionType?: WeaponEvolutionType;
  /** Size multiplier for visual scaling */
  size?: number;
  /** Whether bullet has penetration */
  penetration?: boolean;
  /** Whether bullet is explosive */
  explosive?: boolean;
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
 * Christmas object types with distinct appearances
 */
export type ChristmasObjectType = 'present' | 'tree' | 'candy_cane' | 'pillar';

/**
 * Data for Christmas-themed terrain obstacles
 */
export interface ChristmasObstacle {
  position: THREE.Vector3;
  type: ChristmasObjectType;
  radius: number; // collision radius
  height: number;
  color: THREE.Color;
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
 * Meta-progression data (persisted across runs)
 * @interface MetaProgressData
 */
export interface MetaProgressData {
  /** Universal currency earned through gameplay */
  nicePoints: number;
  /** Total currency earned over all time */
  totalPointsEarned: number;
  /** Total number of game runs completed */
  runsCompleted: number;
  /** Total number of bosses defeated */
  bossesDefeated: number;

  /** Unlocked weapon IDs */
  unlockedWeapons: string[];
  /** Unlocked character skin IDs */
  unlockedSkins: string[];

  /** Permanent upgrades (upgrade ID -> level) */
  permanentUpgrades: Record<string, number>;

  /** Historical statistics */
  highScore: number;
  totalKills: number;
  totalDeaths: number;
}

/**
 * Progress data for the current active run
 * @interface RunProgressData
 */
export interface RunProgressData {
  /** Experience points earned in current run */
  xp: number;
  /** Current player level in run */
  level: number;
  /** IDs of upgrades selected during this run */
  selectedUpgrades: string[];
  /** IDs of weapon evolutions unlocked this run */
  weaponEvolutions: string[];
}

/**
 * Global game configuration constants
 */
export const CONFIG = {
  /** Size of the game world (NxN grid) */
  WORLD_SIZE: 80,
  /** Kills required to trigger boss spawn */
  WAVE_REQ: 10,
  /** Maximum concurrent minions */
  MAX_MINIONS: 12,
  /** Milliseconds between minion spawns */
  SPAWN_INTERVAL: 2500,
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

/**
 * Weapon evolution configurations
 * @constant
 */
export const WEAPON_EVOLUTIONS: Record<WeaponEvolutionType, WeaponEvolutionConfig> = {
  'mega-coal-mortar': {
    id: 'mega-coal-mortar',
    name: 'Mega Coal Mortar',
    baseWeapon: 'cannon',
    minLevel: 10,
    modifiers: {
      damageMultiplier: 2.0,
      size: 2.0,
      explosive: true,
      rofMultiplier: 0.8, // Slightly slower
    },
  },
  'plasma-storm': {
    id: 'plasma-storm',
    name: 'Plasma Storm',
    baseWeapon: 'smg',
    minLevel: 10,
    modifiers: {
      damageMultiplier: 1.5,
      projectileCount: 3, // Burst of 3
      rofMultiplier: 1.2, // Faster fire rate
    },
  },
  'supernova-burst': {
    id: 'supernova-burst',
    name: 'Supernova Burst',
    baseWeapon: 'star',
    minLevel: 10,
    modifiers: {
      damageMultiplier: 1.8,
      projectileCount: 5, // More stars
      spreadAngle: 0.3, // Wider spread
      size: 1.5,
    },
  },
  'blizzard-cannon': {
    id: 'blizzard-cannon',
    name: 'Blizzard Cannon',
    baseWeapon: 'snowball',
    minLevel: 10,
    modifiers: {
      damageMultiplier: 1.6,
      speedMultiplier: 1.3,
      penetration: true,
    },
  },
  'peppermint-tornado': {
    id: 'peppermint-tornado',
    name: 'Peppermint Tornado',
    baseWeapon: 'candy-cane',
    minLevel: 10,
    modifiers: {
      damageMultiplier: 1.7,
      projectileCount: 6, // Spiral pattern
      speedMultiplier: 1.1,
    },
  },
};
