import type * as THREE from 'three';

// Game States
export type GameState = 'MENU' | 'PHASE_1' | 'PHASE_BOSS' | 'WIN' | 'GAME_OVER';

// Player Classes
export type PlayerClassType = 'santa' | 'elf' | 'bumble';

export interface PlayerClassConfig {
  type: PlayerClassType;
  name: string;
  role: string;
  hp: number;
  speed: number;
  rof: number; // Rate of fire (seconds between shots)
  damage: number;
  color: number;
  scale: number;
  weaponType: 'cannon' | 'smg' | 'star';
  furColor: {
    base: [number, number, number];
    tip: [number, number, number];
  };
}

// Enemy Types
export type EnemyType = 'minion' | 'boss';

export interface EnemyConfig {
  type: EnemyType;
  hp: number;
  speed: number;
  damage: number;
  pointValue: number;
}

// Entity Data
export interface EntityData {
  id: string;
  mesh: THREE.Object3D;
  velocity: THREE.Vector3;
  hp: number;
  maxHp: number;
  isActive: boolean;
}

export interface BulletData extends EntityData {
  direction: THREE.Vector3;
  isEnemy: boolean;
  damage: number;
  life: number;
  speed: number;
}

export interface EnemyData extends EntityData {
  type: EnemyType;
  speed: number;
  damage: number;
  pointValue: number;
  attackTimer?: number;
  phase?: 'chase' | 'barrage';
}

// Input State
export interface InputState {
  movement: { x: number; y: number };
  isFiring: boolean;
  joystickActive: boolean;
  joystickOrigin: { x: number; y: number };
}

// Game Stats
export interface GameStats {
  score: number;
  kills: number;
  bossDefeated: boolean;
}

// Configuration Constants
export const CONFIG = {
  WORLD_SIZE: 80,
  WAVE_REQ: 10, // Kills required to spawn boss
  MAX_MINIONS: 15,
  SPAWN_INTERVAL: 2000, // ms between minion spawns
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

// Player Class Definitions
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
