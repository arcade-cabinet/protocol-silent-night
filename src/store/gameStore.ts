import * as THREE from 'three';
import { create } from 'zustand';
import { AudioManager } from '@/audio/AudioManager';
import type {
  BulletData,
  ChristmasObstacle,
  EnemyData,
  GameState,
  GameStats,
  InputState,
  MetaProgressData,
  PlayerClassConfig,
  PlayerClassType,
  RunProgressData,
  WeaponEvolutionType,
} from '@/types';
import { CONFIG, PLAYER_CLASSES, WEAPON_EVOLUTIONS } from '@/types';
import { HapticPatterns, triggerHaptic } from '@/utils/haptics';

// Persistence keys
const HIGH_SCORE_KEY = 'protocol-silent-night-highscore';
const META_PROGRESS_KEY = 'protocol-silent-night-meta-progress';

interface GameStore {
  // Game State
  state: GameState;
  setState: (state: GameState) => void;
  missionBriefing: {
    title: string;
    objective: string;
    intel: string[];
  };

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

  // Meta-Progression
  metaProgress: MetaProgressData;
  earnNicePoints: (amount: number) => void;
  spendNicePoints: (amount: number) => boolean;
  unlockWeapon: (weaponId: string) => void;
  unlockSkin: (skinId: string) => void;
  upgradePermanent: (upgradeId: string) => void;
  updateMetaProgress: (updater: (data: MetaProgressData) => MetaProgressData) => void;

  // Run-Progression (XP/Leveling)
  runProgress: RunProgressData;
  gainXP: (amount: number) => void;
  levelUp: () => void;
  selectLevelUpgrade: (upgradeId: string) => void;

  // Weapon Evolution
  currentEvolution: WeaponEvolutionType | null;
  evolveWeapon: (evolutionType: WeaponEvolutionType) => void;
  checkEvolutionAvailability: () => WeaponEvolutionType | null;
  getWeaponModifiers: () => PlayerClassConfig;

  // Input
  input: InputState;
  setMovement: (x: number, y: number) => void;
  setFiring: (isFiring: boolean) => void;
  setJoystick: (active: boolean, origin?: { x: number; y: number }) => void;

  // Entities
  bullets: BulletData[];
  enemies: EnemyData[];
  obstacles: ChristmasObstacle[];
  addBullet: (bullet: BulletData) => void;
  removeBullet: (id: string) => void;
  addEnemy: (enemy: EnemyData) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, damage: number) => boolean; // returns true if killed
  updateBullets: (updater: (bullets: BulletData[]) => BulletData[]) => void;
  updateEnemies: (updater: (enemies: EnemyData[]) => EnemyData[]) => void;
  setObstacles: (obstacles: ChristmasObstacle[]) => void;

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

// Load meta-progression from localStorage
const loadMetaProgress = (): MetaProgressData => {
  try {
    const stored = localStorage.getItem(META_PROGRESS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load meta progress:', e);
  }

  return {
    nicePoints: 0,
    totalPointsEarned: 0,
    runsCompleted: 0,
    bossesDefeated: 0,
    unlockedWeapons: ['cannon', 'smg', 'star'], // Base weapons unlocked by default
    unlockedSkins: [],
    permanentUpgrades: {},
    highScore: 0,
    totalKills: 0,
    totalDeaths: 0,
  };
};

// Save meta-progression to localStorage
const saveMetaProgress = (data: MetaProgressData): void => {
  try {
    localStorage.setItem(META_PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save meta progress:', e);
  }
};

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

const initialMetaProgress = loadMetaProgress();

const initialState = {
  state: 'MENU' as GameState,
  missionBriefing: {
    title: 'SILENT NIGHT',
    objective: 'Neutralize hostile Grinch-Bots and eliminate Krampus-Prime',
    intel: [
      'Eliminate hostile Grinch-Bot forces',
      'Neutralize Krampus-Prime command unit',
      'Defeat 10 Grinch-Bots to draw out Krampus-Prime',
    ],
  },
  playerClass: null,
  playerHp: 100,
  playerMaxHp: 100,
  playerPosition: new THREE.Vector3(0, 0, 0),
  playerRotation: 0,
  stats: { score: 0, kills: 0, bossDefeated: false },
  metaProgress: initialMetaProgress,
  runProgress: {
    xp: 0,
    level: 1,
    selectedUpgrades: [],
    weaponEvolutions: [],
  },
  input: {
    movement: { x: 0, y: 0 },
    isFiring: false,
    joystickActive: false,
    joystickOrigin: { x: 0, y: 0 },
  },
  bullets: [],
  enemies: [],
  obstacles: [],
  bossHp: 1000,
  bossMaxHp: 1000,
  bossActive: false,
  screenShake: 0,
  highScore: loadHighScore(),
  damageFlash: false,
  killStreak: 0,
  lastKillTime: 0,
  currentEvolution: null,
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
      runProgress: {
        xp: 0,
        level: 1,
        selectedUpgrades: [],
        weaponEvolutions: [],
      },
    });

    // Play UI select sound
    AudioManager.playSFX('ui_select');
  },

  damagePlayer: (amount) => {
    const { playerHp, state, metaProgress } = get();
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
      const updatedMeta = {
        ...metaProgress,
        totalDeaths: metaProgress.totalDeaths + 1,
        runsCompleted: metaProgress.runsCompleted + 1,
      };
      set({ state: 'GAME_OVER', metaProgress: updatedMeta });
      saveMetaProgress(updatedMeta);
      AudioManager.playSFX('defeat');
      AudioManager.playMusic('defeat');
    }
  },

  setPlayerPosition: (position) => set({ playerPosition: position.clone() }),
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),

  addKill: (points) => {
    const { stats, state, enemies, lastKillTime, killStreak, metaProgress } = get();
    const now = Date.now();
    const newKills = stats.kills + 1;

    // Kill streak: if within 2 seconds of last kill, increment streak
    const streakTimeout = 2000;
    const newStreak = now - lastKillTime < streakTimeout ? killStreak + 1 : 1;

    // Bonus points for kill streaks
    const streakBonus = newStreak > 1 ? Math.floor(points * (newStreak - 1) * 0.25) : 0;
    const newScore = stats.score + points + streakBonus;

    // XP calculation: 10 XP per kill + streak bonus
    const xpGain = 10 + (newStreak > 1 ? (newStreak - 1) * 5 : 0);
    get().gainXP(xpGain);

    // Nice Points calculation: matches points or uses a specific formula
    // For now, let's say 1 Nice Point per 10 points scored
    const npGain = Math.floor((points + streakBonus) / 10);
    get().earnNicePoints(npGain);

    set({
      stats: { ...stats, kills: newKills, score: newScore },
      killStreak: newStreak,
      lastKillTime: now,
      metaProgress: {
        ...metaProgress,
        totalKills: metaProgress.totalKills + 1,
      },
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

  // Meta-Progression Actions
  earnNicePoints: (amount) => {
    const { metaProgress } = get();
    const updated = {
      ...metaProgress,
      nicePoints: metaProgress.nicePoints + amount,
      totalPointsEarned: metaProgress.totalPointsEarned + amount,
    };
    set({ metaProgress: updated });
    saveMetaProgress(updated);
  },

  spendNicePoints: (amount) => {
    const { metaProgress } = get();
    if (metaProgress.nicePoints >= amount) {
      const updated = {
        ...metaProgress,
        nicePoints: metaProgress.nicePoints - amount,
      };
      set({ metaProgress: updated });
      saveMetaProgress(updated);
      return true;
    }
    return false;
  },

  unlockWeapon: (weaponId) => {
    const { metaProgress } = get();
    if (!metaProgress.unlockedWeapons.includes(weaponId)) {
      const updated = {
        ...metaProgress,
        unlockedWeapons: [...metaProgress.unlockedWeapons, weaponId],
      };
      set({ metaProgress: updated });
      saveMetaProgress(updated);
    }
  },

  unlockSkin: (skinId) => {
    const { metaProgress } = get();
    if (!metaProgress.unlockedSkins.includes(skinId)) {
      const updated = {
        ...metaProgress,
        unlockedSkins: [...metaProgress.unlockedSkins, skinId],
      };
      set({ metaProgress: updated });
      saveMetaProgress(updated);
    }
  },

  upgradePermanent: (upgradeId) => {
    const { metaProgress } = get();
    const currentLevel = metaProgress.permanentUpgrades[upgradeId] || 0;
    const updated = {
      ...metaProgress,
      permanentUpgrades: {
        ...metaProgress.permanentUpgrades,
        [upgradeId]: currentLevel + 1,
      },
    };
    set({ metaProgress: updated });
    saveMetaProgress(updated);
  },

  updateMetaProgress: (updater) => {
    const updated = updater(get().metaProgress);
    set({ metaProgress: updated });
    saveMetaProgress(updated);
  },

  // Run-Progression Actions
  gainXP: (amount) => {
    const { runProgress } = get();
    const newXP = runProgress.xp + amount;
    // Simple level up curve: 100 * level
    const xpToNextLevel = runProgress.level * 100;

    if (newXP >= xpToNextLevel) {
      set({
        runProgress: {
          ...runProgress,
          xp: newXP - xpToNextLevel,
          level: runProgress.level + 1,
        },
      });
      get().levelUp();
    } else {
      set({
        runProgress: {
          ...runProgress,
          xp: newXP,
        },
      });
    }
  },

  levelUp: () => {
    // This will eventually trigger the LevelUp UI
    AudioManager.playSFX('ui_select');
    
    // Check if evolution is available at this level
    const availableEvolution = get().checkEvolutionAvailability();
    if (availableEvolution && !get().currentEvolution) {
      get().evolveWeapon(availableEvolution);
    }
    // TODO: set state to SHOW_LEVEL_UP if we implement a separate state for it
  },

  selectLevelUpgrade: (upgradeId) => {
    const { runProgress } = get();
    set({
      runProgress: {
        ...runProgress,
        selectedUpgrades: [...runProgress.selectedUpgrades, upgradeId],
      },
    });

    // Check if evolution is now available
    const availableEvolution = get().checkEvolutionAvailability();
    if (availableEvolution && !get().currentEvolution) {
      get().evolveWeapon(availableEvolution);
    }
  },

  // Weapon Evolution Actions
  evolveWeapon: (evolutionType) => {
    const { runProgress, playerClass } = get();
    
    if (!playerClass) return;
    
    const evolution = WEAPON_EVOLUTIONS[evolutionType];
    if (!evolution) return;

    // Add to weaponEvolutions array
    set({
      currentEvolution: evolutionType,
      runProgress: {
        ...runProgress,
        weaponEvolutions: [...runProgress.weaponEvolutions, evolutionType],
      },
    });

    // Play evolution sound
    AudioManager.playSFX('ui_select');
    triggerHaptic(HapticPatterns.FIRE_HEAVY);
  },

  checkEvolutionAvailability: () => {
    const { runProgress, playerClass, currentEvolution } = get();
    
    // Already evolved
    if (currentEvolution) return null;
    
    // Need to be at least level 10
    if (runProgress.level < 10) return null;
    
    if (!playerClass) return null;

    // Find matching evolution for current weapon
    for (const [evolutionId, config] of Object.entries(WEAPON_EVOLUTIONS)) {
      if (config.baseWeapon === playerClass.weaponType) {
        // Check if level requirement is met
        if (runProgress.level >= config.minLevel) {
          // Check required upgrades if any
          if (config.requiredUpgrades) {
            const hasAllUpgrades = config.requiredUpgrades.every((upgrade) =>
              runProgress.selectedUpgrades.includes(upgrade)
            );
            if (!hasAllUpgrades) continue;
          }
          
          return evolutionId as WeaponEvolutionType;
        }
      }
    }
    
    return null;
  },

  getWeaponModifiers: () => {
    const { playerClass, currentEvolution } = get();
    
    if (!playerClass) return playerClass as PlayerClassConfig;
    
    // No evolution, return base class
    if (!currentEvolution) return playerClass;
    
    const evolution = WEAPON_EVOLUTIONS[currentEvolution];
    if (!evolution) return playerClass;

    // Apply evolution modifiers
    const modifiers = evolution.modifiers;
    return {
      ...playerClass,
      damage: Math.round(playerClass.damage * (modifiers.damageMultiplier || 1)),
      rof: playerClass.rof * (modifiers.rofMultiplier || 1),
      speed: playerClass.speed * (modifiers.speedMultiplier || 1),
    };
  },

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

  setObstacles: (obstacles) => set({ obstacles }),

  spawnBoss: () => {
    const { enemies, addEnemy } = get();

    // Check if boss already exists
    if (enemies.some((e) => e.type === 'boss')) return;

    // Spawn boss at random position
    const angle = Math.random() * Math.PI * 2;
    const radius = 30;
    const position = new THREE.Vector3(Math.cos(angle) * radius, 4, Math.sin(angle) * radius);

    // Add boss to enemies array for collision detection
    addEnemy({
      id: 'boss-krampus',
      mesh: (() => {
        const obj = new THREE.Object3D();
        obj.position.copy(position);
        return obj;
      })(),
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
    const { bossHp, metaProgress } = get();
    const newHp = Math.max(0, bossHp - amount);
    set({ bossHp: newHp, screenShake: 0.3 });

    // Play boss hit sound
    AudioManager.playSFX('boss_hit');

    if (newHp <= 0) {
      const updatedMeta = {
        ...metaProgress,
        bossesDefeated: metaProgress.bossesDefeated + 1,
        runsCompleted: metaProgress.runsCompleted + 1,
      };
      set({
        state: 'WIN',
        bossActive: false,
        stats: { ...get().stats, bossDefeated: true },
        metaProgress: updatedMeta,
      });
      get().updateHighScore();
      saveMetaProgress(updatedMeta);

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
    const { stats, highScore, metaProgress } = get();
    if (stats.score > highScore) {
      saveHighScore(stats.score);
      const updatedMeta = {
        ...metaProgress,
        highScore: stats.score,
      };
      set({ highScore: stats.score, metaProgress: updatedMeta });
      saveMetaProgress(updatedMeta);
    }
  },

  reset: () =>
    set({
      ...initialState,
      highScore: get().highScore, // Preserve high score
      metaProgress: get().metaProgress, // Preserve meta progress
      playerPosition: new THREE.Vector3(0, 0, 0),
    }),
}));

// Expose store on window for e2e testing
if (typeof window !== 'undefined') {
  window.useGameStore = useGameStore;
}
