import { act } from '@testing-library/react';
import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import type { BulletData, EnemyData } from '@/types';

describe('Game Flow Integration Tests', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    localStorage.clear();
  });

  describe('Complete Game Flow - Santa', () => {
    it('should complete full game flow from start to boss spawn', () => {
      const store = useGameStore.getState();
      // 1. Start in MENU state
      expect(store.state).toBe('MENU');

      // 2. Select Santa character
      store.selectClass('santa');

      let state = useGameStore.getState();
      expect(state.state).toBe('BRIEFING');

      // 2b. Transition to PHASE_1 (simulating briefing completion)
      store.setState('PHASE_1');
      // Set high level to avoid level up system interruptions
      useGameStore.setState({
        runProgress: { ...useGameStore.getState().runProgress, level: 100 },
      });

      state = useGameStore.getState();
      expect(state.state).toBe('PHASE_1');
      expect(state.playerClass?.type).toBe('santa');
      expect(state.playerHp).toBe(300);

      // 3. Kill 10 enemies to trigger boss
      for (let i = 0; i < 10; i++) {
        store.addKill(50);
      }

      state = useGameStore.getState();
      // 4. Boss should spawn
      expect(state.state).toBe('PHASE_BOSS');
      expect(state.bossActive).toBe(true);
      expect(state.stats.kills).toBe(10);

      // 5. Defeat boss
      const killed = store.damageBoss(1000);

      state = useGameStore.getState();
      // 6. Boss Defeated
      expect(killed).toBe(true);
      expect(state.state).toBe('WIN');
      expect(state.stats.bossDefeated).toBe(true);
    });

    it('should handle player death before boss', () => {
      // Select character
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('PHASE_1');

      // Kill some enemies
      useGameStore.getState().addKill(50);
      useGameStore.getState().addKill(50);
      useGameStore.getState().addKill(50);

      // Player takes fatal damage
      useGameStore.getState().damagePlayer(300);

      const state = useGameStore.getState();
      expect(state.state).toBe('GAME_OVER');
      expect(state.playerHp).toBe(0);
      expect(state.stats.kills).toBe(3);
    });
  });

  describe('Combat Scenarios', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.selectClass('elf'); // Use fast firing Elf
    });

    it('should handle bullet-enemy collision scenario', () => {
      const store = useGameStore.getState();

      // Create enemy
      const enemy: EnemyData = {
        id: 'enemy-1',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        hp: 50,
        maxHp: 50,
        isActive: true,
        type: 'minion',
        speed: 5,
        damage: 10,
        pointValue: 25,
      };

      store.addEnemy(enemy);

      // Fire bullet
      const bullet: BulletData = {
        id: 'bullet-1',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        hp: 1,
        maxHp: 1,
        isActive: true,
        direction: new THREE.Vector3(0, 0, 1),
        isEnemy: false,
        damage: 10,
        life: 3,
        speed: 20,
      };

      store.addBullet(bullet);

      // Bullet hits enemy (5 hits to kill with 10 damage each)
      const initialScore = useGameStore.getState().stats.score;

      store.damageEnemy('enemy-1', 10);
      store.damageEnemy('enemy-1', 10);
      store.damageEnemy('enemy-1', 10);
      store.damageEnemy('enemy-1', 10);
      const killed = store.damageEnemy('enemy-1', 10);

      expect(killed).toBe(true);
      expect(useGameStore.getState().enemies).toHaveLength(0);
      expect(useGameStore.getState().stats.kills).toBe(1);
      expect(useGameStore.getState().stats.score).toBeGreaterThan(initialScore);
    });

    it('should handle multiple enemies dying simultaneously', () => {
      const store = useGameStore.getState();

      // Spawn 5 enemies
      for (let i = 0; i < 5; i++) {
        store.addEnemy({
          id: `enemy-${i}`,
          mesh: new THREE.Object3D(),
          velocity: new THREE.Vector3(),
          hp: 10,
          maxHp: 10,
          isActive: true,
          type: 'minion',
          speed: 5,
          damage: 10,
          pointValue: 20,
        });
      }

      // Kill all enemies
      for (let i = 0; i < 5; i++) {
        store.damageEnemy(`enemy-${i}`, 10);
      }

      expect(useGameStore.getState().enemies).toHaveLength(0);
      expect(useGameStore.getState().stats.kills).toBe(5);
      // Kill streak bonuses should apply
      expect(useGameStore.getState().killStreak).toBeGreaterThan(1);
    });

    it('should handle enemy-player collision', () => {
      const store = useGameStore.getState();
      const initialHp = useGameStore.getState().playerHp;

      // Spawn enemy
      store.addEnemy({
        id: 'enemy-1',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        hp: 50,
        maxHp: 50,
        isActive: true,
        type: 'minion',
        speed: 5,
        damage: 15,
        pointValue: 25,
      });

      // Enemy collides with player
      store.damagePlayer(15);

      expect(useGameStore.getState().playerHp).toBe(initialHp - 15);
      expect(useGameStore.getState().screenShake).toBeGreaterThan(0);
      expect(useGameStore.getState().damageFlash).toBe(true);
    });
  });

  describe('Character Class Progression', () => {
    it('should handle Elf full combat scenario', () => {
      const store = useGameStore.getState();
      store.selectClass('elf');
      // Set high level to avoid level up system interruptions
      useGameStore.setState({
        runProgress: { ...useGameStore.getState().runProgress, level: 100 },
      });
      store.setState('PHASE_1');

      const state = useGameStore.getState();

      // Elf stats: low HP (100), high speed (18), high ROF (0.1)
      expect(state.playerClass?.hp).toBe(100);
      expect(state.playerClass?.speed).toBe(18);
      expect(state.playerClass?.rof).toBe(0.1);

      // Elf should be able to kill enemies quickly with rapid fire
      for (let i = 0; i < 15; i++) {
        store.addKill(10);
      }

      expect(useGameStore.getState().stats.kills).toBe(15);
      expect(useGameStore.getState().state).toBe('PHASE_BOSS');
    });

    it('should handle Bumble tank gameplay', () => {
      const store = useGameStore.getState();
      store.selectClass('bumble');
      store.setState('PHASE_1');

      const state = useGameStore.getState();

      // Bumble stats: medium HP (200), medium speed (12), star weapon
      expect(state.playerClass?.hp).toBe(200);
      expect(state.playerClass?.weaponType).toBe('star');

      // Bumble can take more hits
      store.damagePlayer(50);
      store.damagePlayer(50);

      expect(useGameStore.getState().playerHp).toBe(100);
      expect(useGameStore.getState().state).toBe('PHASE_1'); // Still alive
    });

    it('should handle Santa heavy gameplay', () => {
      const store = useGameStore.getState();
      store.selectClass('santa');
      store.setState('PHASE_1');

      const state = useGameStore.getState();

      // Santa stats: highest HP (300), slow (9), high damage (40), cannon
      expect(state.playerClass?.hp).toBe(300);
      expect(state.playerClass?.damage).toBe(40);
      expect(state.playerClass?.weaponType).toBe('cannon');

      // Santa can tank damage
      store.damagePlayer(100);
      store.damagePlayer(100);

      expect(useGameStore.getState().playerHp).toBe(100);
      expect(useGameStore.getState().state).toBe('PHASE_1'); // Still fighting
    });
  });

  describe('Boss Fight Integration', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.selectClass('santa');
      // Set high level before kills to avoid level up system interruptions
      useGameStore.setState({
        runProgress: { ...useGameStore.getState().runProgress, level: 100 },
      });
      store.setState('PHASE_1');

      // Trigger boss spawn
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().addKill(50);
      }
    });

    it('should handle full boss fight', () => {
      const store = useGameStore.getState();
      act(() => {
        // Ensure boss is active
        useGameStore.getState().spawnBoss();
      });

      expect(useGameStore.getState().bossActive).toBe(true);
      expect(useGameStore.getState().state).toBe('PHASE_BOSS');

      act(() => {
        // Damage boss in chunks
        store.damageBoss(200); // 800 HP left
      });
      expect(useGameStore.getState().bossHp).toBe(800);

      act(() => {
        store.damageBoss(300); // 500 HP left
      });
      expect(useGameStore.getState().bossHp).toBe(500);

      act(() => {
        store.damageBoss(250); // 250 HP left
      });
      expect(useGameStore.getState().bossHp).toBe(250);

      // Final blow
      let killed = false;
      act(() => {
        killed = store.damageBoss(250);
      });

      expect(killed).toBe(true);
      expect(useGameStore.getState().state).toBe('WIN');
      expect(useGameStore.getState().stats.bossDefeated).toBe(true);
    });

    it('should handle player death during boss fight', () => {
      // Transition to boss fight
      useGameStore.getState().selectClass('santa');
      useGameStore.getState().setState('PHASE_BOSS');
      useGameStore.getState().bossActive = true;

      // Damage boss
      useGameStore.getState().damageBoss(500);
      expect(useGameStore.getState().bossHp).toBe(500);

      // Player takes fatal damage
      useGameStore.getState().damagePlayer(300);

      expect(useGameStore.getState().state).toBe('GAME_OVER');
      expect(useGameStore.getState().bossActive).toBe(true); // Boss still alive
    });
  });

  describe('High Score Persistence Integration', () => {
    it('should persist high score through game restart', () => {
      const store = useGameStore.getState();

      // First game
      store.selectClass('elf');
      for (let i = 0; i < 10; i++) {
        store.addKill(100);
      }
      store.damageBoss(1000); // Win

      const firstScore = useGameStore.getState().stats.score;
      expect(firstScore).toBeGreaterThan(1000);

      // Score should be saved
      expect(localStorage.getItem('protocol-silent-night-highscore')).toBeTruthy();

      // Reset for new game
      store.reset();

      // High score should persist
      expect(useGameStore.getState().highScore).toBe(firstScore);

      // Play again with lower score
      store.selectClass('santa');
      store.addKill(50);
      store.damagePlayer(300); // Game over

      // High score should not change
      expect(useGameStore.getState().highScore).toBe(firstScore);
    });

    it('should update high score only when beaten', () => {
      const store = useGameStore.getState();

      // First game - score 500
      store.selectClass('santa');
      for (let i = 0; i < 10; i++) {
        store.addKill(50);
      }
      store.updateHighScore();

      const firstHighScore = useGameStore.getState().highScore;

      // Second game - higher score
      store.reset();
      store.selectClass('santa');
      for (let i = 0; i < 15; i++) {
        store.addKill(100);
      }
      store.updateHighScore();

      const newHighScore = useGameStore.getState().highScore;
      expect(newHighScore).toBeGreaterThan(firstHighScore);
    });
  });

  describe('Kill Streak System Integration', () => {
    beforeEach(() => {
      const store = useGameStore.getState();
      store.selectClass('elf'); // High ROF for rapid kills
    });

    it('should build and maintain kill streak', () => {
      const store = useGameStore.getState();

      // Rapid kills build streak
      store.addKill(100);
      expect(useGameStore.getState().killStreak).toBe(1);

      store.addKill(100);
      expect(useGameStore.getState().killStreak).toBe(2);

      store.addKill(100);
      expect(useGameStore.getState().killStreak).toBe(3);

      // Score should have streak bonuses
      const score = useGameStore.getState().stats.score;
      expect(score).toBeGreaterThan(300); // More than base 300
    });

    it('should provide increasing bonuses for longer streaks', () => {
      const store = useGameStore.getState();

      // Kill 5 enemies rapidly
      for (let i = 0; i < 5; i++) {
        store.addKill(100);
      }

      const streak = useGameStore.getState().killStreak;
      const score = useGameStore.getState().stats.score;

      expect(streak).toBe(5);
      // Score should be significantly higher than 500 due to bonuses
      expect(score).toBeGreaterThan(600);
    });
  });

  describe('Game State Transitions', () => {
    it('should transition through all game states correctly', () => {
      const store = useGameStore.getState();

      // MENU -> BRIEFING -> PHASE_1
      expect(store.state).toBe('MENU');
      store.selectClass('santa');
      expect(useGameStore.getState().state).toBe('BRIEFING');
      store.setState('PHASE_1');
      expect(useGameStore.getState().state).toBe('PHASE_1');

      // Set high level to avoid level-up system interruptions
      useGameStore.setState({
        runProgress: { ...useGameStore.getState().runProgress, level: 100 },
      });

      // PHASE_1 -> PHASE_BOSS
      for (let i = 0; i < 10; i++) {
        store.addKill(50);
      }
      expect(useGameStore.getState().state).toBe('PHASE_BOSS');

      // PHASE_BOSS -> WIN
      store.damageBoss(1000);
      expect(useGameStore.getState().state).toBe('WIN');

      // Loop continues... but for this test we check reset
      store.reset();
      expect(useGameStore.getState().state).toBe('MENU');
    });

    it('should handle GAME_OVER state transition', () => {
      const store = useGameStore.getState();

      store.selectClass('elf');
      store.setState('PHASE_1');
      expect(useGameStore.getState().state).toBe('PHASE_1');

      // Player dies
      store.damagePlayer(100);
      expect(useGameStore.getState().state).toBe('GAME_OVER');

      // Can reset to play again
      store.reset();
      expect(useGameStore.getState().state).toBe('MENU');
    });
  });
});
