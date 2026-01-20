/**
 * Shared Game Store (Zustand)
 * Used by both web and mobile apps
 */

import { create } from 'zustand';
import type {
  GameState,
  ClassType,
  PlayerState,
  Enemy,
  Bullet,
  ChristmasObstacle,
} from './types';

interface GameStore {
  // Game state
  state: GameState;
  setState: (state: GameState) => void;

  // Player
  selectedClass: ClassType | null;
  selectClass: (classType: ClassType) => void;
  playerPosition: { x: number; y: number; z: number };
  setPlayerPosition: (pos: { x: number; y: number; z: number }) => void;
  playerHp: number;
  maxHp: number;
  setPlayerHp: (hp: number) => void;
  playerLevel: number;
  playerXp: number;
  xpToNext: number;
  addXp: (amount: number) => void;

  // Combat stats
  score: number;
  kills: number;
  addKill: (xpValue: number) => void;
  nicePoints: number;
  addNicePoints: (amount: number) => void;

  // Enemies
  enemies: Enemy[];
  setEnemies: (enemies: Enemy[]) => void;
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, damage: number) => void;

  // Bullets
  bullets: Bullet[];
  setBullets: (bullets: Bullet[]) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;

  // Obstacles (terrain)
  obstacles: ChristmasObstacle[];
  setObstacles: (obstacles: ChristmasObstacle[]) => void;

  // Boss
  bossHp: number;
  maxBossHp: number;
  setBossHp: (hp: number) => void;
  isBossActive: boolean;
  activateBoss: () => void;

  // Game flow
  reset: () => void;
  startGame: () => void;
  gameOver: () => void;
  victory: () => void;
}

const INITIAL_STATE = {
  state: 'MENU' as GameState,
  selectedClass: null,
  playerPosition: { x: 0, y: 0, z: 0 },
  playerHp: 100,
  maxHp: 100,
  playerLevel: 1,
  playerXp: 0,
  xpToNext: 100,
  score: 0,
  kills: 0,
  nicePoints: 0,
  enemies: [],
  bullets: [],
  obstacles: [],
  bossHp: 0,
  maxBossHp: 1000,
  isBossActive: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...INITIAL_STATE,

  setState: (state) => set({ state }),

  selectClass: (classType) => set({ selectedClass: classType }),

  setPlayerPosition: (pos) => set({ playerPosition: pos }),

  setPlayerHp: (hp) => set({ playerHp: Math.max(0, hp) }),

  addXp: (amount) => {
    const { playerXp, xpToNext, playerLevel } = get();
    let newXp = playerXp + amount;
    let newLevel = playerLevel;
    let newXpToNext = xpToNext;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = Math.floor(newXpToNext * 1.5);
    }

    set({
      playerXp: newXp,
      playerLevel: newLevel,
      xpToNext: newXpToNext,
    });
  },

  addKill: (xpValue) => {
    const { kills, score } = get();
    set({
      kills: kills + 1,
      score: score + xpValue * 10,
    });
    get().addXp(xpValue);
  },

  addNicePoints: (amount) => {
    set({ nicePoints: get().nicePoints + amount });
  },

  setEnemies: (enemies) => set({ enemies }),

  addEnemy: (enemy) => set({ enemies: [...get().enemies, enemy] }),

  removeEnemy: (id) => set({ enemies: get().enemies.filter((e) => e.id !== id) }),

  damageEnemy: (id, damage) => {
    const enemies = get().enemies.map((e) =>
      e.id === id ? { ...e, hp: Math.max(0, e.hp - damage) } : e
    );
    set({ enemies });
  },

  setBullets: (bullets) => set({ bullets }),

  addBullet: (bullet) => set({ bullets: [...get().bullets, bullet] }),

  removeBullet: (id) => set({ bullets: get().bullets.filter((b) => b.id !== id) }),

  setObstacles: (obstacles) => set({ obstacles }),

  setBossHp: (hp) => set({ bossHp: Math.max(0, hp) }),

  activateBoss: () => set({ isBossActive: true, bossHp: get().maxBossHp }),

  reset: () => set(INITIAL_STATE),

  startGame: () => set({ state: 'BRIEFING' }),

  gameOver: () => set({ state: 'GAME_OVER' }),

  victory: () => set({ state: 'VICTORY' }),
}));
