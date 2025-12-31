/**
 * @fileoverview Type definitions for Protocol: Silent Night
 * @module types
 */

import type * as THREE from 'three';

/**
 * Game state machine states
 */
export type GameState =
  | 'MENU'
  | 'BRIEFING'
  | 'PHASE_1'
  | 'PHASE_BOSS'
  | 'WIN'
  | 'GAME_OVER'
  | 'LEVEL_UP';

/**
 * Available player character classes
 */
export type PlayerClassType = 'santa' | 'elf' | 'bumble';

/**
 * Weapon identifiers
 */
export type WeaponType =
  | 'cannon'
  | 'smg'
  | 'star'
  | 'snowball'
  | 'candy_cane'
  | 'ornament'
  | 'light_string'
  | 'gingerbread'
  | 'jingle_bell'
  | 'quantum_gift';

/**
 * Configuration for a player character class
 */
export interface PlayerClassConfig {
  type: PlayerClassType;
  name: string;
  role: string;
  hp: number;
  speed: number;
  rof: number;
  damage: number;
  color: string;
  scale: number;
  weaponType: WeaponType;
  furOptions: {
    baseColor: string;
    tipColor: string;
    layerCount: number;
    spacing: number;
    windStrength: number;
    gravityDroop?: number;
  };
  customizations?: unknown[];
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
 */
export interface WeaponEvolutionConfig {
  id: WeaponEvolutionType;
  name: string;
  baseWeapon: WeaponType;
  minLevel: number;
  requiredUpgrades?: string[];
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
 * Weapon configuration
 */
export interface WeaponConfig {
  id: WeaponType;
  name: string;
  description: string;
  cost: number;
  icon: string;
  damage: number;
  rof: number;
  speed: number;
  life: number;
  behavior?: BulletData['behavior'];
  projectileCount?: number;
  spreadAngle?: number;
  bulletType: 'cannon' | 'smg' | 'star';
}

/**
 * Enemy configuration
 */
export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;
  damage: number;
  pointValue: number;
}

/**
 * Enemy type identifiers
 */
export type EnemyType = 'minion' | 'boss';

/**
 * Base entity data
 */
export interface EntityData {
  id: string;
  mesh: THREE.Object3D;
  velocity: THREE.Vector3;
  hp: number;
  maxHp: number;
  isActive: boolean;
}

/**
 * Projectile data
 */
export interface BulletData extends EntityData {
  direction: THREE.Vector3;
  isEnemy: boolean;
  damage: number;
  life: number;
  speed: number;
  type?: WeaponType;
  evolutionType?: WeaponEvolutionType;
  size?: number;
  penetration?: boolean;
  explosive?: boolean;
  behavior?: 'freeze' | 'melee' | 'aoe' | 'chain' | 'turret' | 'spread' | 'random';
}

/**
 * Enemy entity data
 */
export interface EnemyData extends EntityData {
  type: EnemyType;
  speed: number;
  damage: number;
  pointValue: number;
  attackTimer?: number;
  phase?: 'chase' | 'barrage';
}

/**
 * Christmas object types
 */
export type ChristmasObjectType = 'present' | 'tree' | 'candy_cane' | 'pillar';

/**
 * Data for Christmas-themed terrain obstacles
 */
export interface ChristmasObstacle {
  position: THREE.Vector3;
  type: ChristmasObjectType;
  radius: number;
  height: number;
  color: THREE.Color;
}

/**
 * Player input state
 */
export interface InputState {
  movement: { x: number; y: number };
  isFiring: boolean;
  joystickActive: boolean;
  joystickOrigin: { x: number; y: number };
}

/**
 * Player statistics
 */
export interface GameStats {
  score: number;
  kills: number;
  bossDefeated: boolean;
}

/**
 * Meta-progression data
 */
export interface MetaProgressData {
  nicePoints: number;
  totalPointsEarned: number;
  runsCompleted: number;
  bossesDefeated: number;
  unlockedWeapons: string[];
  unlockedSkins: string[];
  permanentUpgrades: Record<string, number>;
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
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'offensive' | 'defensive' | 'utility' | 'special' | 'christmas';
  maxStacks: number;
  stats?: Record<string, { value: number; type: 'multiply' | 'add' | 'percent' }>;
  special?: string[];
}

/**
 * Progress data for current run
 */
export interface RunProgressData {
  xp: number;
  level: number;
  selectedUpgrades: string[];
  weaponEvolutions: WeaponEvolutionType[];
  activeUpgrades: Record<string, number>;
  wave: number;
  timeSurvived: number;
  pendingLevelUp: boolean;
  upgradeChoices: RoguelikeUpgrade[];
}

/**
 * Mission briefing line
 */
export interface BriefingLine {
  label: string;
  text: string;
  accent?: boolean;
  warning?: boolean;
}

/**
 * Obstacle type configuration
 */
export interface ObstacleTypeConfig {
  type: ChristmasObjectType;
  color: number | string;
  heightRange: [number, number];
  radius: number;
  scale: [number, number, number];
  yOffset: number;
}

/**
 * Skin definition
 */
export interface SkinConfig {
  id: string;
  name: string;
  cost: number;
  character: PlayerClassType;
  description: string;
  colors?: {
    skin?: string;
    primary?: string;
    secondary?: string;
    accent?: string;
    fur?: {
      baseColor: string;
      tipColor: string;
    };
  };
}

/**
 * Permanent upgrade definition
 */
export interface PermanentUpgradeConfig {
  id: string;
  name: string;
  cost: number;
  tier: 1 | 2 | 3;
  maxLevel: number;
  description: string;
}

/**
 * Workshop weapon unlock
 */
export interface WeaponUnlock {
  id: WeaponType;
  name: string;
  cost: number;
  type: string;
  damage: string;
  fireRate: string;
  special: string;
  flavor: string;
}

/**
 * Helper to get bullet type from weapon type
 */
export const getBulletTypeFromWeapon = (weaponType: WeaponType): 'cannon' | 'smg' | 'star' => {
  switch (weaponType) {
    case 'cannon':
    case 'ornament':
    case 'snowball':
      return 'cannon';
    case 'smg':
    case 'light_string':
      return 'smg';
    default:
      return 'star';
  }
};

/**
 * Seeded pseudo-random number generator for deterministic gameplay.
 */
export class SeededRandom {
  private state: number;

  constructor(seed?: number) {
    if (seed !== undefined) {
      this.state = seed;
    } else if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      this.state = array[0] % 999999;
    } else {
      this.state = Math.floor(Math.random() * 999999);
    }
  }

  /**
   * Returns a random float between 0 and 1.
   */
  next(): number {
    this.state = (this.state * 9301 + 49297) % 233280;
    return this.state / 233280;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random element from an array.
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}
