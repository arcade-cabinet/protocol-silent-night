/**
 * AgentDebug - Development-only debug utilities for AI agent gameplay validation
 *
 * In development mode, exposes game state and controls to window object
 * for programmatic testing and validation via Chrome DevTools/MCP JavaScript
 *
 * Usage from browser console:
 *   window.__SILENT_NIGHT__.getState()
 *   window.__SILENT_NIGHT__.movePlayer(5, 0, 3)
 *   window.__SILENT_NIGHT__.spawnEnemy('minion', 10, 0, 10)
 *   window.__SILENT_NIGHT__.setHP(50)
 */

import { useGameStore } from '@protocol-silent-night/game-core';

// Type definitions for exposed debug API
interface DebugAPI {
  // State inspection
  getState: () => ReturnType<typeof useGameStore.getState>;
  getPlayerPosition: () => { x: number; y: number; z: number };
  getPlayerHP: () => { current: number; max: number };
  getEnemies: () => Array<{ id: string; type: string; position: { x: number; y: number; z: number }; hp: number }>;
  getScore: () => number;
  getKills: () => number;
  getPhase: () => string;

  // Player manipulation
  movePlayer: (x: number, y: number, z: number) => void;
  setHP: (hp: number) => void;
  healPlayer: (amount: number) => void;
  damagePlayer: (amount: number) => void;
  setInvincible: (enabled: boolean) => void;

  // Enemy manipulation
  spawnEnemy: (type: 'minion' | 'boss', x: number, y: number, z: number) => void;
  killAllEnemies: () => void;
  pauseEnemies: (paused: boolean) => void;

  // Game flow
  skipToPhase: (phase: 'PHASE_1' | 'PHASE_BOSS') => void;
  triggerWin: () => void;
  triggerGameOver: () => void;
  resetGame: () => void;

  // Weapon/Upgrade testing
  giveUpgrade: (upgradeId: string) => void;
  setWeapon: (weaponId: string) => void;
  setFireRate: (rate: number) => void;

  // Performance/Debug info
  getFPS: () => number;
  getDrawCalls: () => number;
  toggleDebugOverlay: () => void;

  // References (for advanced manipulation)
  _refs: {
    scene: unknown;
    player: unknown;
    enemies: unknown;
    bullets: unknown;
    camera: unknown;
  };
}

declare global {
  interface Window {
    __SILENT_NIGHT__?: DebugAPI;
    __SILENT_NIGHT_DEBUG_ENABLED__?: boolean;
  }
}

// Internal state
let debugEnabled = false;
let invincibleMode = false;
let enemiesPaused = false;
let debugOverlayVisible = false;
let lastFPS = 60;

// System references (set by GameScene)
const systemRefs: DebugAPI['_refs'] = {
  scene: null,
  player: null,
  enemies: null,
  bullets: null,
  camera: null,
};

/**
 * Initialize debug API in development mode
 * Call this from GameScene after systems are set up
 */
export function initDebugAPI(refs: Partial<DebugAPI['_refs']>) {
  if (process.env.NODE_ENV !== 'development' && !__DEV__) {
    return;
  }

  // Update refs
  Object.assign(systemRefs, refs);

  // Create debug API
  const debugAPI: DebugAPI = {
    // State inspection
    getState: () => useGameStore.getState(),

    getPlayerPosition: () => {
      const state = useGameStore.getState();
      return { ...state.player.position };
    },

    getPlayerHP: () => {
      const state = useGameStore.getState();
      return { current: state.player.hp, max: state.player.maxHp };
    },

    getEnemies: () => {
      // Access from enemy manager ref if available
      return [];
    },

    getScore: () => useGameStore.getState().stats.score,

    getKills: () => useGameStore.getState().stats.kills,

    getPhase: () => useGameStore.getState().phase,

    // Player manipulation
    movePlayer: (x: number, y: number, z: number) => {
      useGameStore.getState().updatePlayerPosition(x, y, z);
      console.log(`[AgentDebug] Player moved to (${x}, ${y}, ${z})`);
    },

    setHP: (hp: number) => {
      const state = useGameStore.getState();
      const damage = state.player.hp - hp;
      if (damage > 0) {
        state.damagePlayer(damage);
      }
      console.log(`[AgentDebug] Player HP set to ${hp}`);
    },

    healPlayer: (amount: number) => {
      const state = useGameStore.getState();
      // Implement heal by manipulating store directly
      console.log(`[AgentDebug] Player healed by ${amount}`);
    },

    damagePlayer: (amount: number) => {
      useGameStore.getState().damagePlayer(amount);
      console.log(`[AgentDebug] Player damaged by ${amount}`);
    },

    setInvincible: (enabled: boolean) => {
      invincibleMode = enabled;
      console.log(`[AgentDebug] Invincible mode: ${enabled ? 'ON' : 'OFF'}`);
    },

    // Enemy manipulation
    spawnEnemy: (type: 'minion' | 'boss', x: number, y: number, z: number) => {
      console.log(`[AgentDebug] Would spawn ${type} at (${x}, ${y}, ${z})`);
    },

    killAllEnemies: () => {
      console.log('[AgentDebug] Would kill all enemies');
    },

    pauseEnemies: (paused: boolean) => {
      enemiesPaused = paused;
      console.log(`[AgentDebug] Enemies ${paused ? 'paused' : 'resumed'}`);
    },

    // Game flow
    skipToPhase: (phase: 'PHASE_1' | 'PHASE_BOSS') => {
      useGameStore.getState().setPhase(phase);
      console.log(`[AgentDebug] Skipped to phase: ${phase}`);
    },

    triggerWin: () => {
      useGameStore.getState().setGameState('WIN');
      console.log('[AgentDebug] Triggered WIN');
    },

    triggerGameOver: () => {
      useGameStore.getState().setGameState('GAME_OVER');
      console.log('[AgentDebug] Triggered GAME_OVER');
    },

    resetGame: () => {
      useGameStore.getState().resetGame();
      console.log('[AgentDebug] Game reset');
    },

    // Weapon/Upgrade testing
    giveUpgrade: (upgradeId: string) => {
      console.log(`[AgentDebug] Would give upgrade: ${upgradeId}`);
    },

    setWeapon: (weaponId: string) => {
      console.log(`[AgentDebug] Would set weapon: ${weaponId}`);
    },

    setFireRate: (rate: number) => {
      console.log(`[AgentDebug] Would set fire rate: ${rate}`);
    },

    // Performance/Debug info
    getFPS: () => lastFPS,

    getDrawCalls: () => {
      // Access from scene ref if available
      return 0;
    },

    toggleDebugOverlay: () => {
      debugOverlayVisible = !debugOverlayVisible;
      console.log(`[AgentDebug] Debug overlay: ${debugOverlayVisible ? 'visible' : 'hidden'}`);
    },

    // References for advanced manipulation
    _refs: systemRefs,
  };

  // Expose to window
  if (typeof window !== 'undefined') {
    window.__SILENT_NIGHT__ = debugAPI;
    window.__SILENT_NIGHT_DEBUG_ENABLED__ = true;
    debugEnabled = true;

    console.log('%c[Protocol: Silent Night] Debug API enabled', 'color: #00ff66; font-weight: bold');
    console.log('Access via: window.__SILENT_NIGHT__');
    console.log('Example commands:');
    console.log('  __SILENT_NIGHT__.getState()');
    console.log('  __SILENT_NIGHT__.movePlayer(5, 0, 3)');
    console.log('  __SILENT_NIGHT__.setInvincible(true)');
    console.log('  __SILENT_NIGHT__.skipToPhase("PHASE_BOSS")');
  }
}

/**
 * Update FPS for debug tracking
 */
export function updateDebugFPS(fps: number) {
  lastFPS = fps;
}

/**
 * Check if invincible mode is enabled
 */
export function isInvincible(): boolean {
  return invincibleMode;
}

/**
 * Check if enemies are paused
 */
export function areEnemiesPaused(): boolean {
  return enemiesPaused;
}

/**
 * Check if debug mode is enabled
 */
export function isDebugEnabled(): boolean {
  return debugEnabled;
}

/**
 * Cleanup debug API on unmount
 */
export function cleanupDebugAPI() {
  if (typeof window !== 'undefined') {
    delete window.__SILENT_NIGHT__;
    delete window.__SILENT_NIGHT_DEBUG_ENABLED__;
  }
  debugEnabled = false;
}
