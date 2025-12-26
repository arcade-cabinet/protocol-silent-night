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
 * Character skin identifiers
 */
export type SkinId = 
  | 'santa-classic' | 'santa-arctic' | 'santa-gold'
  | 'elf-classic' | 'elf-neon' | 'elf-shadow'
  | 'bumble-classic' | 'bumble-midnight' | 'bumble-crystal';

/**
 * Character skin configuration
 * @interface SkinConfig
 */
export interface SkinConfig {
  /** Unique skin identifier */
  id: SkinId;
  /** Character class this skin belongs to */
  characterClass: PlayerClassType;
  /** Display name for the skin */
  name: string;
  /** Nice Points cost to unlock (0 = default/free) */
  cost: number;
  /** Primary color as hex number */
  color: number;
  /** Secondary accent color */
  accentColor?: number;
  /** Fur rendering colors as RGB tuples (0-1 range) */
  furColor: {
    base: [number, number, number];
    tip: [number, number, number];
  };
  /** Optional description */
  description?: string;
}

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
 * Helper to get bullet type from weapon type
 */
export const getBulletTypeFromWeapon = (
  weaponType: PlayerClassConfig['weaponType']
): 'cannon' | 'smg' | 'stars' => {
  switch (weaponType) {
    case 'cannon':
      return 'cannon';
    case 'smg':
      return 'smg';
    case 'star':
      return 'stars';
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
 * Character skin definitions
 * @constant
 */
export const CHARACTER_SKINS: Record<SkinId, SkinConfig> = {
  // MECHA-SANTA Skins
  'santa-classic': {
    id: 'santa-classic',
    characterClass: 'santa',
    name: 'Classic Red',
    cost: 0, // Default skin, always unlocked
    color: 0xff0044,
    accentColor: 0xffd700,
    furColor: {
      base: [0.5, 0.05, 0.05],
      tip: [0.8, 0.2, 0.2],
    },
    description: 'Traditional red armor with gold accents',
  },
  'santa-arctic': {
    id: 'santa-arctic',
    characterClass: 'santa',
    name: 'Arctic Camo',
    cost: 500,
    color: 0xccddff,
    accentColor: 0x88aacc,
    furColor: {
      base: [0.7, 0.8, 0.9],
      tip: [0.9, 0.95, 1.0],
    },
    description: 'Winter camouflage for stealth operations',
  },
  'santa-gold': {
    id: 'santa-gold',
    characterClass: 'santa',
    name: 'Gold Edition',
    cost: 1000,
    color: 0xffd700,
    accentColor: 0xffaa00,
    furColor: {
      base: [0.8, 0.6, 0.1],
      tip: [1.0, 0.85, 0.3],
    },
    description: 'Prestigious gold plating for elite operators',
  },

  // CYBER-ELF Skins
  'elf-classic': {
    id: 'elf-classic',
    characterClass: 'elf',
    name: 'Forest Green',
    cost: 0, // Default skin, always unlocked
    color: 0x00cc66,
    accentColor: 0x00ff88,
    furColor: {
      base: [0.0, 0.3, 0.15],
      tip: [0.2, 0.6, 0.4],
    },
    description: 'Classic forest operations color scheme',
  },
  'elf-neon': {
    id: 'elf-neon',
    characterClass: 'elf',
    name: 'Neon Cyan',
    cost: 500,
    color: 0x00ffcc,
    accentColor: 0x00ffff,
    furColor: {
      base: [0.0, 0.5, 0.5],
      tip: [0.3, 0.9, 0.9],
    },
    description: 'High-visibility cyberpunk aesthetic',
  },
  'elf-shadow': {
    id: 'elf-shadow',
    characterClass: 'elf',
    name: 'Shadow Ops',
    cost: 1000,
    color: 0x1a1a2e,
    accentColor: 0x6633cc,
    furColor: {
      base: [0.1, 0.1, 0.2],
      tip: [0.3, 0.2, 0.5],
    },
    description: 'Covert operations stealth variant',
  },

  // THE BUMBLE Skins
  'bumble-classic': {
    id: 'bumble-classic',
    characterClass: 'bumble',
    name: 'Classic White',
    cost: 0, // Default skin, always unlocked
    color: 0xeeeeee,
    accentColor: 0xffffff,
    furColor: {
      base: [0.7, 0.7, 0.7],
      tip: [1.0, 1.0, 1.0],
    },
    description: 'Iconic white fur of the abominable snowman',
  },
  'bumble-midnight': {
    id: 'bumble-midnight',
    characterClass: 'bumble',
    name: 'Midnight Black',
    cost: 500,
    color: 0x222222,
    accentColor: 0x444444,
    furColor: {
      base: [0.1, 0.1, 0.1],
      tip: [0.3, 0.3, 0.3],
    },
    description: 'Shadowy variant for night operations',
  },
  'bumble-crystal': {
    id: 'bumble-crystal',
    characterClass: 'bumble',
    name: 'Crystal Blue',
    cost: 1000,
    color: 0x4466ff,
    accentColor: 0x88aaff,
    furColor: {
      base: [0.3, 0.4, 0.8],
      tip: [0.6, 0.7, 1.0],
    },
    description: 'Crystalline ice armor with blue glow',
  },
};

/**
 * Get skins for a specific character class
 */
export function getSkinsForCharacter(characterClass: PlayerClassType): SkinConfig[] {
  return Object.values(CHARACTER_SKINS).filter(
    (skin) => skin.characterClass === characterClass
  );
}

/**
 * Get default skin ID for a character class
 */
export function getDefaultSkin(characterClass: PlayerClassType): SkinId {
  return `${characterClass}-classic` as SkinId;
}
