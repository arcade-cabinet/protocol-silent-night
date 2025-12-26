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
 * Roguelike upgrade definition
 */
export interface RoguelikeUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or symbol
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'offensive' | 'defensive' | 'utility' | 'special';
  maxStacks: number;
  effect: {
    type: 'damage' | 'speed' | 'health' | 'rof' | 'lifesteal' | 'aoe' | 'crit' | 'shield' | 'xp' | 'special';
    value: number;
    isPercent?: boolean;
  };
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
  /** Active upgrade effects (id -> stack count) */
  activeUpgrades: Record<string, number>;
  /** Current wave number */
  wave: number;
  /** Time survived in seconds */
  timeSurvived: number;
  /** Is level up choice pending */
  pendingLevelUp: boolean;
  /** Available upgrade choices */
  upgradeChoices: RoguelikeUpgrade[];
}

/**
 * Roguelike upgrade pool
 */
export const ROGUELIKE_UPGRADES: RoguelikeUpgrade[] = [
  // Offensive
  {
    id: 'coal_fury',
    name: 'Coal Fury',
    description: '+15% damage',
    icon: '🔥',
    rarity: 'common',
    category: 'offensive',
    maxStacks: 5,
    effect: { type: 'damage', value: 0.15, isPercent: true },
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    description: '+20% fire rate',
    icon: '⚡',
    rarity: 'common',
    category: 'offensive',
    maxStacks: 4,
    effect: { type: 'rof', value: 0.2, isPercent: true },
  },
  {
    id: 'frost_piercing',
    name: 'Frost Piercing',
    description: '+25% critical chance',
    icon: '❄️',
    rarity: 'rare',
    category: 'offensive',
    maxStacks: 3,
    effect: { type: 'crit', value: 0.25, isPercent: true },
  },
  {
    id: 'naughty_list',
    name: 'Naughty List',
    description: '+40% damage to bosses',
    icon: '📜',
    rarity: 'epic',
    category: 'offensive',
    maxStacks: 2,
    effect: { type: 'damage', value: 0.4, isPercent: true },
  },
  {
    id: 'star_explosion',
    name: 'Star Explosion',
    description: 'Projectiles explode on hit',
    icon: '💥',
    rarity: 'legendary',
    category: 'offensive',
    maxStacks: 1,
    effect: { type: 'aoe', value: 3 },
  },
  // Defensive
  {
    id: 'candy_armor',
    name: 'Candy Armor',
    description: '+20 max HP',
    icon: '🍬',
    rarity: 'common',
    category: 'defensive',
    maxStacks: 5,
    effect: { type: 'health', value: 20 },
  },
  {
    id: 'gingerbread_shield',
    name: 'Gingerbread Shield',
    description: 'Absorbs next hit every 10s',
    icon: '🛡️',
    rarity: 'rare',
    category: 'defensive',
    maxStacks: 2,
    effect: { type: 'shield', value: 1 },
  },
  {
    id: 'eggnog_regen',
    name: 'Eggnog Regeneration',
    description: 'Heal 1% HP per second',
    icon: '🥛',
    rarity: 'rare',
    category: 'defensive',
    maxStacks: 3,
    effect: { type: 'health', value: 0.01, isPercent: true },
  },
  {
    id: 'mistletoe_lifesteal',
    name: 'Mistletoe Lifesteal',
    description: '8% damage dealt as healing',
    icon: '🌿',
    rarity: 'epic',
    category: 'defensive',
    maxStacks: 2,
    effect: { type: 'lifesteal', value: 0.08, isPercent: true },
  },
  // Utility
  {
    id: 'reindeer_speed',
    name: 'Reindeer Speed',
    description: '+12% movement speed',
    icon: '🦌',
    rarity: 'common',
    category: 'utility',
    maxStacks: 4,
    effect: { type: 'speed', value: 0.12, isPercent: true },
  },
  {
    id: 'christmas_spirit',
    name: 'Christmas Spirit',
    description: '+30% XP gain',
    icon: '✨',
    rarity: 'common',
    category: 'utility',
    maxStacks: 3,
    effect: { type: 'xp', value: 0.3, isPercent: true },
  },
  {
    id: 'workshop_efficiency',
    name: 'Workshop Efficiency',
    description: '+15% all stats',
    icon: '🔧',
    rarity: 'legendary',
    category: 'utility',
    maxStacks: 1,
    effect: { type: 'special', value: 0.15, isPercent: true },
  },
  // Special
  {
    id: 'krampus_curse',
    name: "Krampus' Curse",
    description: '+50% damage, -25% HP',
    icon: '👹',
    rarity: 'epic',
    category: 'special',
    maxStacks: 1,
    effect: { type: 'special', value: 0.5, isPercent: true },
  },
  {
    id: 'santas_blessing',
    name: "Santa's Blessing",
    description: 'Revive once with 50% HP',
    icon: '🎅',
    rarity: 'legendary',
    category: 'special',
    maxStacks: 1,
    effect: { type: 'special', value: 0.5, isPercent: true },
  },
];

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
