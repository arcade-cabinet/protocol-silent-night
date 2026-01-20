/**
 * Shared Types for Protocol: Silent Night
 * Used by both web and mobile apps via @protocol-silent-night/game-core
 */

// Game state machine
export type GameState =
  | 'MENU'
  | 'BRIEFING'
  | 'PHASE_1'
  | 'BOSS_TRANSITION'
  | 'BOSS_FIGHT'
  | 'VICTORY'
  | 'GAME_OVER';

// Player classes
export type ClassType = 'santa' | 'elf' | 'bumble';

// Bullet types
export type BulletType = 'cannon' | 'smg' | 'star' | 'snowball' | 'ice_shard';

// Obstacle types
export type ObstacleType =
  | 'tree'
  | 'present_red'
  | 'present_green'
  | 'candy_cane'
  | 'pillar'
  | 'snowman'
  | 'rocks'
  | 'bench'
  | 'lantern'
  | 'snow_pile';

// Enemy types
export type EnemyType = 'minion' | 'boss';

// Vector3 for positions (platform-agnostic)
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Color3 for colors (platform-agnostic)
export interface Color3 {
  r: number;
  g: number;
  b: number;
}

// Player state
export interface PlayerState {
  classType: ClassType;
  position: Vector3;
  hp: number;
  maxHp: number;
  speed: number;
  level: number;
  xp: number;
  xpToNext: number;
}

// Enemy entity
export interface Enemy {
  id: string;
  type: EnemyType;
  position: Vector3;
  hp: number;
  maxHp: number;
  speed: number;
  pointValue: number;
  damage: number;
}

// Bullet/projectile entity
export interface Bullet {
  id: string;
  type: BulletType;
  position: Vector3;
  velocity: Vector3;
  damage: number;
  ownerId: string;
  ttl: number; // Time to live in ms
}

// Obstacle (terrain decoration with collision)
export interface ChristmasObstacle {
  id: string;
  type: ObstacleType;
  position: Vector3;
  rotation?: number;
  scale?: number;
  radius: number;
  height: number;
}

// Class definition from DDL
export interface ClassDefinition {
  type: ClassType;
  name: string;
  role: string;
  hp: number;
  speed: number;
  weaponType: string;
  passive: string;
  ultimate: string;
  description?: string;
  color?: string;
}

// Weapon definition from DDL
export interface WeaponDefinition {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  bulletType: BulletType;
  bulletSpeed: number;
  bulletSize: number;
  bulletColor: string;
  spreadAngle?: number;
  projectileCount?: number;
  piercing?: boolean;
  explosive?: boolean;
  explosionRadius?: number;
}

// Evolution definition from DDL
export interface EvolutionDefinition {
  id: string;
  name: string;
  baseWeapon: string;
  damage: number;
  fireRate: number;
  bulletType: BulletType;
  bulletSpeed: number;
  bulletSize: number;
  bulletColor: string;
  effects?: string[];
}

// Enemy definition from DDL
export interface EnemyDefinition {
  type: EnemyType;
  hp: number;
  speed: number;
  damage: number;
  pointValue: number;
  xpValue: number;
  color?: string;
}

// Spawn configuration from DDL
export interface SpawnConfig {
  initialMinions: number;
  maxMinions: number;
  spawnRate: number;
  spawnRateIncrease: number;
  killsForBoss: number;
  hitRadiusMinion: number;
  hitRadiusBoss: number;
}

// Terrain configuration from DDL
export interface TerrainConfig {
  gridSize: number;
  cubeSize: number;
  noiseScale: number;
  minHeight: number;
  maxHeight: number;
  baseColor: string;
  snowColor: string;
  snowThreshold: number;
}

// Obstacle definition from DDL
export interface ObstacleDefinition {
  type: ObstacleType;
  count: number;
  heightRange: [number, number];
  radius: number;
  colors?: string[];
}

// Theme lighting config from DDL
export interface LightingConfig {
  ambient: {
    color: string;
    intensity: number;
  };
  moonlight: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
  rimLight?: {
    color: string;
    intensity: number;
    position: [number, number, number];
  };
}

// Theme fog config from DDL
export interface FogConfig {
  color: string;
  near: number;
  far: number;
  density?: number;
}

// Theme sky config from DDL
export interface SkyConfig {
  topColor: string;
  bottomColor: string;
  starCount?: number;
  auroraEnabled?: boolean;
  moonEnabled?: boolean;
}

// Post-processing config from DDL
export interface PostProcessingConfig {
  bloom: {
    threshold: number;
    intensity: number;
    radius: number;
  };
  vignette?: {
    intensity: number;
    offset: number;
  };
  chromaticAberration?: {
    offset: number;
  };
}

// Complete theme from DDL
export interface ThemeDefinition {
  name: string;
  lighting: LightingConfig;
  fog: FogConfig;
  sky: SkyConfig;
  postProcessing: PostProcessingConfig;
}

// Game statistics
export interface GameStats {
  score: number;
  kills: number;
  nicePoints: number;
  level: number;
  timeSurvived: number;
  damageDealt: number;
  damageTaken: number;
}

// Input state (for mobile touch controls)
export interface InputState {
  moveDirection: Vector3;
  aimDirection: Vector3;
  isFiring: boolean;
  isUsingUltimate: boolean;
}
