import { create } from 'zustand';
import type { GameState, GameStats, PlayerClassType } from '../types';

/**
 * Game state store using Zustand
 *
 * Manages current game session state:
 * - Player stats (HP, score, kills)
 * - Game state machine
 * - Current wave/phase
 *
 * Separated from meta-progression (which is in metaStore)
 */

interface PlayerState {
  classType: PlayerClassType;
  hp: number;
  maxHp: number;
  position: { x: number; y: number; z: number };
}

interface InputState {
  movement: { x: number; y: number };
  isFiring: boolean;
}

interface GameStoreState {
  // Game state machine
  gameState: GameState;

  // Player state
  player: PlayerState;

  // Game stats
  stats: GameStats;

  // Wave/phase info
  wave: number;
  phase: 'PHASE_1' | 'PHASE_BOSS' | null;

  // Time tracking
  timeSurvived: number;

  // Input state (for mobile)
  input: InputState;

  // Screen shake intensity (0-1)
  screenShake: number;

  // Actions
  setGameState: (state: GameState) => void;
  initializePlayer: (classType: PlayerClassType, maxHp: number) => void;
  updatePlayerHp: (hp: number) => void;
  updatePlayerPosition: (x: number, y: number, z: number) => void;
  damagePlayer: (amount: number) => void;
  incrementKills: () => void;
  addScore: (points: number) => void;
  addKill: (points: number) => void;
  setWave: (wave: number) => void;
  setPhase: (phase: 'PHASE_1' | 'PHASE_BOSS' | null) => void;
  updateTime: (deltaTime: number) => void;
  setMovement: (x: number, y: number) => void;
  setFiring: (firing: boolean) => void;
  triggerScreenShake: (intensity: number) => void;
  resetGame: () => void;
}

const initialState = {
  gameState: 'MENU' as GameState,
  player: {
    classType: 'santa' as PlayerClassType,
    hp: 100,
    maxHp: 100,
    position: { x: 0, y: 0, z: 0 },
  },
  stats: {
    score: 0,
    kills: 0,
    bossDefeated: false,
  },
  wave: 1,
  phase: null as 'PHASE_1' | 'PHASE_BOSS' | null,
  timeSurvived: 0,
  input: {
    movement: { x: 0, y: 0 },
    isFiring: false,
  },
  screenShake: 0,
};

/**
 * useGameStore - Main game state store
 *
 * @example
 * ```typescript
 * const { player, stats, updatePlayerHp } = useGameStore();
 * updatePlayerHp(player.hp - 10); // Take damage
 * ```
 */
export const useGameStore = create<GameStoreState>((set) => ({
  ...initialState,

  setGameState: (gameState) => set({ gameState }),

  initializePlayer: (classType, maxHp) =>
    set({
      player: {
        classType,
        hp: maxHp,
        maxHp,
        position: { x: 0, y: 0, z: 0 },
      },
    }),

  updatePlayerHp: (hp) =>
    set((state) => ({
      player: { ...state.player, hp: Math.max(0, Math.min(hp, state.player.maxHp)) },
    })),

  updatePlayerPosition: (x, y, z) =>
    set((state) => ({
      player: { ...state.player, position: { x, y, z } },
    })),

  damagePlayer: (amount) =>
    set((state) => ({
      player: {
        ...state.player,
        hp: Math.max(0, state.player.hp - amount),
      },
      screenShake: Math.min(1, state.screenShake + amount / 50),
    })),

  incrementKills: () =>
    set((state) => ({
      stats: { ...state.stats, kills: state.stats.kills + 1 },
    })),

  addScore: (points) =>
    set((state) => ({
      stats: { ...state.stats, score: state.stats.score + points },
    })),

  addKill: (points) =>
    set((state) => ({
      stats: {
        ...state.stats,
        kills: state.stats.kills + 1,
        score: state.stats.score + points,
      },
    })),

  setWave: (wave) => set({ wave }),

  setPhase: (phase) => set({ phase }),

  updateTime: (deltaTime) =>
    set((state) => ({
      timeSurvived: state.timeSurvived + deltaTime,
      // Decay screen shake over time
      screenShake: Math.max(0, state.screenShake - deltaTime * 2),
    })),

  setMovement: (x, y) =>
    set((state) => ({
      input: { ...state.input, movement: { x, y } },
    })),

  setFiring: (isFiring) =>
    set((state) => ({
      input: { ...state.input, isFiring },
    })),

  triggerScreenShake: (intensity) =>
    set((state) => ({
      screenShake: Math.min(1, state.screenShake + intensity),
    })),

  resetGame: () => set(initialState),
}));
