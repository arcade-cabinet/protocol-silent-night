import { create } from 'zustand';
import * as THREE from 'three';
import type {
  GameState,
  PlayerClassType,
  PlayerClassConfig,
  GameStats,
  InputState,
  BulletData,
  EnemyData,
} from '@/types';
import { PLAYER_CLASSES, CONFIG } from '@/types';
import { AudioManager } from '@/audio/AudioManager';
import { triggerHaptic, HapticPatterns } from '@/utils/haptics';

// High score persistence key
const HIGH_SCORE_KEY = 'protocol-silent-night-highscore';

interface GameStore {
  // Game State
  state: GameState;
  setState: (state: GameState) => void;

  // Player
  playerClass: PlayerClassConfig | null;
  playerHp: number;
  playerMaxHp: number;
  playerPosition: THREE.Vector3;
  playerRotation: number;
  selectClass: (type: PlayerClassType) => void;
  damagePlayer: (amount: number) => void;
  setPlayerPosition: (position: THREE.Vector3) => void;
  setPlayerRotation: (rotation: number) => void;

  // Stats
  stats: GameStats;
  addKill: (points: number) => void;
  resetStats: () => void;

  // Input
  input: InputState;
  setMovement: (x: number, y: number) => void;
  setFiring: (isFiring: boolean) => void;
  setJoystick: (active: boolean, origin?: { x: number; y: number }) => void;

  // Entities
  bullets: BulletData[];
  enemies: EnemyData[];
  addBullet: (bullet: BulletData) => void;
  removeBullet: (id: string) => void;
  addEnemy: (enemy: EnemyData) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, damage: number) => boolean; // returns true if killed
  updateBullets: (updater: (bullets: BulletData[]) => BulletData[]) => void;
  updateEnemies: (updater: (enemies: EnemyData[]) => EnemyData[]) => void;

  // Boss
  bossHp: number;
  bossMaxHp: number;
  bossActive: boolean;
  spawnBoss: () => void;
  damageBoss: (amount: number) => boolean; // returns true if killed

  // Effects
  screenShake: number;
  triggerShake: (intensity: number) => void;

  // High Scores (persisted to localStorage)
  highScore: number;
  updateHighScore: () => void;

  // Damage Flash
  damageFlash: boolean;
  
  // Kill Streak
  killStreak: number;
  lastKillTime: number;
  
  // Reset
  reset: () => void;
}

// Load high score from localStorage
const loadHighScore = (): number => {
  try {
    const stored = localStorage.getItem(HIGH_SCORE_KEY);
    return stored ? Number.parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

// Save high score to localStorage
const saveHighScore = (score: number): void => {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {
    // Silently fail if localStorage is not available
  }
};

const initialState = {
  state: 'MENU' as GameState,
  missionBriefing: {
    title: 'OPERATION: SILENT NIGHT',
    objective: 'Neutralize hostile Grinch-Bots and eliminate Krampus-Prime',
    intel: [
      'Enemy forces: Grinch-Bot scouts + Krampus-Prime command unit',
      'Hostiles are aggressive - eliminate on sight',
      'Defeat 10 Grinch-Bots to draw out Krampus-Prime',
    ],
  },
  playerClass: null,
  playerHp: 100,
  playerMaxHp: 100,
  playerPosition: new THREE.Vector3(0, 0, 0),
  playerRotation: 0,
  stats: { score: 0, kills: 0, bossDefeated: false },
  input: {
    movement: { x: 0, y: 0 },
    isFiring: false,
    joystickActive: false,
    joystickOrigin: { x: 0, y: 0 },
  },
  bullets: [],
  enemies: [],
  bossHp: 1000,
  bossMaxHp: 1000,
  bossActive: false,
  screenShake: 0,
  highScore: loadHighScore(),
  damageFlash: false,
  killStreak: 0,
  lastKillTime: 0,
};

// Extend Window interface for e2e testing
declare global {
  interface Window {
    useGameStore?: typeof useGameStore;
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  setState: (state) => set({ state }),

  selectClass: (type) => {
    const config = PLAYER_CLASSES[type];
    set({
      playerClass: config,
      playerHp: config.hp,
      playerMaxHp: config.hp,
      state: 'BRIEFING',
      playerPosition: new THREE.Vector3(0, 0, 0),
      playerRotation: 0,
    });
    
    // Play UI select sound
    AudioManager.playSFX('ui_select');
  },

  damagePlayer: (amount) => {
    const { playerHp, state } = get();
    if (state === 'GAME_OVER' || state === 'WIN') return;

    const newHp = Math.max(0, playerHp - amount);
    set({ playerHp: newHp, screenShake: 0.5, damageFlash: true });
    
    // Haptic and audio feedback
    if (amount >= 20) {
      triggerHaptic(HapticPatterns.DAMAGE_HEAVY);
      AudioManager.playSFX('player_damage_heavy');
    } else {
      triggerHaptic(HapticPatterns.DAMAGE_LIGHT);
      AudioManager.playSFX('player_damage_light');
    }

    // Clear damage flash after short delay
    setTimeout(() => {
      set({ damageFlash: false });
    }, 150);

    if (newHp <= 0) {
      get().updateHighScore();
      set({ state: 'GAME_OVER' });
      AudioManager.playSFX('defeat');
      AudioManager.playMusic('defeat');
    }
  },

  setPlayerPosition: (position) => set({ playerPosition: position.clone() }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),

  addKill: (points) => {
    const { stats, state, enemies, lastKillTime, killStreak } = get();
    const now = Date.now();
    const newKills = stats.kills + 1;
    
    // Kill streak: if within 2 seconds of last kill, increment streak
    const streakTimeout = 2000;
    const newStreak = (now - lastKillTime < streakTimeout) ? killStreak + 1 : 1;
    
    // Bonus points for kill streaks
    const streakBonus = newStreak > 1 ? Math.floor(points * (newStreak - 1) * 0.25) : 0;
    const newScore = stats.score + points + streakBonus;

    set({
      stats: { ...stats, kills: newKills, score: newScore },
      killStreak: newStreak,
      lastKillTime: now,
    });
    
    // Audio and haptic feedback
    AudioManager.playSFX('enemy_defeated');
    triggerHaptic(HapticPatterns.ENEMY_DEFEATED);
    
    if (newStreak > 1 && newStreak % 3 === 0) {
      AudioManager.playSFX('streak_start');
    }

    // Check if we should spawn boss
    if (newKills >= CONFIG.WAVE_REQ && state === 'PHASE_1') {
      // Check if boss is already active or any boss enemy exists
      const hasBoss = enemies.some((e) => e.type === 'boss');
      if (!hasBoss) {
        get().spawnBoss();
      }
    }
  },

  resetStats: () => set({ stats: { score: 0, kills: 0, bossDefeated: false } }),

  setMovement: (x, y) =>
    set((state) => ({
      input: { ...state.input, movement: { x, y } },
    })),

  setFiring: (isFiring) =>
    set((state) => ({
      input: { ...state.input, isFiring },
    })),

  setJoystick: (active, origin) =>
    set((state) => ({
      input: {
        ...state.input,
        joystickActive: active,
        joystickOrigin: origin || state.input.joystickOrigin,
      },
    })),

  addBullet: (bullet) => {
    set((state) => ({
      bullets: [...state.bullets, bullet],
    }));
    
    // Play weapon-specific sound and haptic
    const weaponType = bullet.type || 'cannon';
    if (weaponType === 'smg') {
      AudioManager.playSFX('weapon_smg');
      triggerHaptic(HapticPatterns.FIRE_LIGHT);
    } else if (weaponType === 'stars') {
      AudioManager.playSFX('weapon_stars');
      triggerHaptic(HapticPatterns.FIRE_MEDIUM);
    } else {
      AudioManager.playSFX('weapon_cannon');
      triggerHaptic(HapticPatterns.FIRE_HEAVY);
    }
  },

  removeBullet: (id) =>
    set((state) => ({
      bullets: state.bullets.filter((b) => b.id !== id),
    })),

  updateBullets: (updater) =>
    set((state) => ({
      bullets: updater(state.bullets),
    })),

  addEnemy: (enemy) =>
    set((state) => ({
      enemies: [...state.enemies, enemy],
    })),

  removeEnemy: (id) =>
    set((state) => ({
      enemies: state.enemies.filter((e) => e.id !== id),
    })),

  damageEnemy: (id, damage) => {
    const { enemies } = get();
    const enemy = enemies.find((e) => e.id === id);
    if (!enemy) return false;

    const newHp = enemy.hp - damage;
    
    // Play hit sound
    AudioManager.playSFX('enemy_hit');
    
    if (newHp <= 0) {
      get().removeEnemy(id);
      get().addKill(enemy.pointValue);
      return true;
    }

    set({
      enemies: enemies.map((e) => (e.id === id ? { ...e, hp: newHp } : e)),
    });
    return false;
  },

  updateEnemies: (updater) =>
    set((state) => ({
      enemies: updater(state.enemies),
    })),

  spawnBoss: () => {
    const { enemies, addEnemy } = get();
    
    // Check if boss already exists
    if (enemies.some((e) => e.type === 'boss')) return;
    
    // Spawn boss at random position
    const angle = Math.random() * Math.PI * 2;
    const radius = 30;
    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      4,
      Math.sin(angle) * radius
    );
    
    // Add boss to enemies array for collision detection
    addEnemy({
      id: 'boss-krampus',
      mesh: (() => { const obj = new THREE.Object3D(); obj.position.copy(position); return obj; })(),
      velocity: new THREE.Vector3(),
      hp: 1000,
      maxHp: 1000,
      isActive: true,
      type: 'boss',
      speed: 3,
      damage: 5,
      pointValue: 1000,
    });
    
    set({
      state: 'PHASE_BOSS',
      bossActive: true,
      bossHp: 1000,
      bossMaxHp: 1000,
    });
    
    // Play boss music and announce
    AudioManager.playSFX('boss_appear');
    AudioManager.playMusic('boss');
  },

  damageBoss: (amount) => {
    const { bossHp } = get();
    const newHp = Math.max(0, bossHp - amount);
    set({ bossHp: newHp, screenShake: 0.3 });
    
    // Play boss hit sound
    AudioManager.playSFX('boss_hit');

    if (newHp <= 0) {
      set({
        state: 'WIN',
        bossActive: false,
        stats: { ...get().stats, bossDefeated: true },
      });
      get().updateHighScore();
      
      // Victory audio
      AudioManager.playSFX('boss_defeated');
      AudioManager.playSFX('victory');
      AudioManager.playMusic('victory');
      return true;
    }
    return false;
  },

  triggerShake: (intensity) => set({ screenShake: intensity }),

  updateHighScore: () => {
    const { stats, highScore } = get();
    if (stats.score > highScore) {
      saveHighScore(stats.score);
      set({ highScore: stats.score });
    }
  },

  reset: () =>
    set({
      ...initialState,
      highScore: get().highScore, // Preserve high score
      playerPosition: new THREE.Vector3(0, 0, 0),
    }),
}));

// Expose store on window for e2e testing
if (typeof window !== 'undefined') {
  window.useGameStore = useGameStore;
}
