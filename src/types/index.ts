/**
 * @fileoverview Type definitions for Protocol: Silent Night
 * @module types
 */

import type * as THREE from 'three';

/**
 * Game state machine states
 */
export type GameState = 'MENU' | 'BRIEFING' | 'PHASE_1' | 'PHASE_BOSS' | 'WIN' | 'GAME_OVER' | 'LEVEL_UP';

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
  color: number;
  scale: number;
  weaponType: WeaponType;
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
  effect: {
    type: 'damage' | 'speed' | 'health' | 'rof' | 'lifesteal' | 'aoe' | 'crit' | 'shield' | 'xp' | 'special';
    value: number;
    isPercent?: boolean;
  };
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
 * Skin definition
 */
export interface SkinConfig {
  id: string;
  name: string;
  cost: number;
  character: PlayerClassType;
  description: string;
  colors: {
    skin?: number;
    primary?: number;
    secondary?: number;
    accent?: number;
    fur?: {
      base: [number, number, number];
      tip: [number, number, number];
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
