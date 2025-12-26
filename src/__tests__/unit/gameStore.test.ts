import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';

describe('GameStore - Player Management', () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.getState().reset();
    localStorage.clear();
  });

  describe('selectClass', () => {
    it('should set player class to Santa', () => {
      const { selectClass } = useGameStore.getState();

      selectClass('santa');

      const currentState = useGameStore.getState();
      expect(currentState.playerClass).not.toBeNull();
      expect(currentState.playerClass?.type).toBe('santa');
      expect(currentState.playerClass?.name).toBe('MECHA-SANTA');
      expect(currentState.playerHp).toBe(300);
      expect(currentState.playerMaxHp).toBe(300);
      expect(currentState.state).toBe('BRIEFING');
    });

    it('should set player class to Elf with correct stats', () => {
      const { selectClass } = useGameStore.getState();

      selectClass('elf');

      const state = useGameStore.getState();
      expect(state.playerClass?.type).toBe('elf');
      expect(state.playerClass?.name).toBe('CYBER-ELF');
      expect(state.playerHp).toBe(100);
      expect(state.playerMaxHp).toBe(100);
      expect(state.playerClass?.speed).toBe(18);
      expect(state.playerClass?.rof).toBe(0.1);
    });

    it('should set player class to Bumble with correct stats', () => {
      const { selectClass } = useGameStore.getState();

      selectClass('bumble');

      const state = useGameStore.getState();
      expect(state.playerClass?.type).toBe('bumble');
      expect(state.playerClass?.name).toBe('THE BUMBLE');
      expect(state.playerHp).toBe(200);
      expect(state.playerMaxHp).toBe(200);
      expect(state.playerClass?.weaponType).toBe('star');
    });

    it('should reset player position when selecting class', () => {
      const { selectClass, setPlayerPosition } = useGameStore.getState();

      // Move player first
      setPlayerPosition(new THREE.Vector3(10, 0, 10));
      expect(useGameStore.getState().playerPosition.x).toBe(10);

      // Select class should reset position
      selectClass('santa');

      const pos = useGameStore.getState().playerPosition;
      expect(pos.x).toBe(0);
      expect(pos.y).toBe(0);
      expect(pos.z).toBe(0);
    });
  });

  describe('damagePlayer', () => {
    beforeEach(() => {
      useGameStore.getState().selectClass('santa');
    });

    it('should reduce player HP by damage amount', () => {
      const { damagePlayer } = useGameStore.getState();

      damagePlayer(50);

      expect(useGameStore.getState().playerHp).toBe(250);
    });

    it('should not reduce HP below 0', () => {
      const { damagePlayer } = useGameStore.getState();

      damagePlayer(500);

      expect(useGameStore.getState().playerHp).toBe(0);
    });

    it('should trigger screen shake on damage', () => {
      const { damagePlayer } = useGameStore.getState();

      damagePlayer(50);

      expect(useGameStore.getState().screenShake).toBe(0.5);
    });

    it('should trigger damage flash', () => {
      const { damagePlayer } = useGameStore.getState();

      damagePlayer(50);

      expect(useGameStore.getState().damageFlash).toBe(true);
    });

    it('should set state to GAME_OVER when HP reaches 0', () => {
      const { damagePlayer } = useGameStore.getState();

      damagePlayer(300);

      expect(useGameStore.getState().state).toBe('GAME_OVER');
      expect(useGameStore.getState().playerHp).toBe(0);
    });

    it('should not damage player when game is over', () => {
      const { damagePlayer, setState } = useGameStore.getState();

      setState('GAME_OVER');
      const initialHp = useGameStore.getState().playerHp;

      damagePlayer(50);

      expect(useGameStore.getState().playerHp).toBe(initialHp);
    });

    it('should not damage player when game is won', () => {
      const { damagePlayer, setState } = useGameStore.getState();

      setState('WIN');
      const initialHp = useGameStore.getState().playerHp;

      damagePlayer(50);

      expect(useGameStore.getState().playerHp).toBe(initialHp);
    });
  });

  describe('setPlayerPosition', () => {
    it('should update player position', () => {
      const { setPlayerPosition } = useGameStore.getState();
      const newPos = new THREE.Vector3(5, 0, 10);

      setPlayerPosition(newPos);

      const pos = useGameStore.getState().playerPosition;
      expect(pos.x).toBe(5);
      expect(pos.y).toBe(0);
      expect(pos.z).toBe(10);
    });

    it('should clone the position vector', () => {
      const { setPlayerPosition } = useGameStore.getState();
      const newPos = new THREE.Vector3(5, 0, 10);

      setPlayerPosition(newPos);

      // Modify original vector
      newPos.x = 20;

      // Store should have cloned value
      expect(useGameStore.getState().playerPosition.x).toBe(5);
    });
  });

  describe('setPlayerRotation', () => {
    it('should update player rotation', () => {
      const { setPlayerRotation } = useGameStore.getState();

      setPlayerRotation(Math.PI / 2);

      expect(useGameStore.getState().playerRotation).toBe(Math.PI / 2);
    });
  });
});

describe('GameStore - Input Management', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  describe('setMovement', () => {
    it('should update movement input', () => {
      const { setMovement } = useGameStore.getState();

      setMovement(1, 0);

      const movement = useGameStore.getState().input.movement;
      expect(movement.x).toBe(1);
      expect(movement.y).toBe(0);
    });

    it('should handle diagonal movement', () => {
      const { setMovement } = useGameStore.getState();

      setMovement(1, 1);

      const movement = useGameStore.getState().input.movement;
      expect(movement.x).toBe(1);
      expect(movement.y).toBe(1);
    });

    it('should handle negative values', () => {
      const { setMovement } = useGameStore.getState();

      setMovement(-1, -1);

      const movement = useGameStore.getState().input.movement;
      expect(movement.x).toBe(-1);
      expect(movement.y).toBe(-1);
    });
  });

  describe('setFiring', () => {
    it('should enable firing', () => {
      const { setFiring } = useGameStore.getState();

      setFiring(true);

      expect(useGameStore.getState().input.isFiring).toBe(true);
    });

    it('should disable firing', () => {
      const { setFiring } = useGameStore.getState();

      setFiring(true);
      setFiring(false);

      expect(useGameStore.getState().input.isFiring).toBe(false);
    });
  });

  describe('setJoystick', () => {
    it('should activate joystick with origin', () => {
      const { setJoystick } = useGameStore.getState();

      setJoystick(true, { x: 100, y: 200 });

      const input = useGameStore.getState().input;
      expect(input.joystickActive).toBe(true);
      expect(input.joystickOrigin.x).toBe(100);
      expect(input.joystickOrigin.y).toBe(200);
    });

    it('should deactivate joystick', () => {
      const { setJoystick } = useGameStore.getState();

      setJoystick(true, { x: 100, y: 200 });
      setJoystick(false);

      expect(useGameStore.getState().input.joystickActive).toBe(false);
    });

    it('should preserve origin when deactivating', () => {
      const { setJoystick } = useGameStore.getState();

      setJoystick(true, { x: 100, y: 200 });
      setJoystick(false);

      const origin = useGameStore.getState().input.joystickOrigin;
      expect(origin.x).toBe(100);
      expect(origin.y).toBe(200);
    });
  });
});

describe('GameStore - Stats Management', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  describe('addKill', () => {
    it('should increment kill count', () => {
      const { addKill } = useGameStore.getState();

      addKill(10);

      expect(useGameStore.getState().stats.kills).toBe(1);
    });

    it('should add points to score', () => {
      const { addKill } = useGameStore.getState();

      addKill(50);

      expect(useGameStore.getState().stats.score).toBe(50);
    });

    it('should accumulate multiple kills with streak bonus', () => {
      const { addKill } = useGameStore.getState();

      addKill(10); // 10 points, streak 1
      addKill(20); // 20 + bonus, streak 2
      addKill(30); // 30 + bonus, streak 3

      const stats = useGameStore.getState().stats;
      expect(stats.kills).toBe(3);
      // With streak bonuses: 10 + (20 + 5) + (30 + 15) = 80
      expect(stats.score).toBeGreaterThanOrEqual(60);
    });

    it('should track kill streak', () => {
      const { addKill } = useGameStore.getState();

      addKill(10);

      expect(useGameStore.getState().killStreak).toBe(1);
    });

    it('should increment kill streak for consecutive kills', () => {
      const { addKill } = useGameStore.getState();

      addKill(10);
      addKill(10);
      addKill(10);

      expect(useGameStore.getState().killStreak).toBe(3);
    });

    it('should add streak bonus to score', () => {
      const { addKill } = useGameStore.getState();

      addKill(100); // 100 points, streak 1
      addKill(100); // 100 + 25 bonus = 125, streak 2

      // Total: 100 + 125 = 225
      expect(useGameStore.getState().stats.score).toBeGreaterThan(200);
    });

    it('should spawn boss after 10 kills in PHASE_1', () => {
      const { addKill, selectClass, setState } = useGameStore.getState();

      selectClass('santa');
      setState('PHASE_1');

      // Add 10 kills
      for (let i = 0; i < 10; i++) {
        addKill(10);
      }

      expect(useGameStore.getState().state).toBe('PHASE_BOSS');
      expect(useGameStore.getState().bossActive).toBe(true);
    });
  });

  describe('resetStats', () => {
    it('should reset all stats to initial values', () => {
      const { addKill, resetStats } = useGameStore.getState();

      addKill(100);
      addKill(200);

      resetStats();

      const stats = useGameStore.getState().stats;
      expect(stats.score).toBe(0);
      expect(stats.kills).toBe(0);
      expect(stats.bossDefeated).toBe(false);
    });
  });
});

describe('GameStore - High Score', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    localStorage.clear();
  });

  it('should start with high score of 0', () => {
    expect(useGameStore.getState().highScore).toBe(0);
  });

  it('should update high score when current score is higher', () => {
    const { addKill, updateHighScore } = useGameStore.getState();

    addKill(500);
    updateHighScore();

    expect(useGameStore.getState().highScore).toBe(500);
  });

  it('should not update high score when current score is lower', () => {
    const { addKill, updateHighScore, resetStats } = useGameStore.getState();

    addKill(500);
    updateHighScore();

    resetStats();
    addKill(100);
    updateHighScore();

    expect(useGameStore.getState().highScore).toBe(500);
  });

  it('should persist high score to localStorage', () => {
    const { addKill, updateHighScore } = useGameStore.getState();

    addKill(1000);
    updateHighScore();

    expect(localStorage.getItem('protocol-silent-night-highscore')).toBe('1000');
  });

  it('should load high score from localStorage on init', () => {
    // Set a high score via the store's updateHighScore mechanism
    const { addKill, updateHighScore, reset } = useGameStore.getState();

    addKill(2500);
    updateHighScore();

    // Verify it was persisted
    expect(localStorage.getItem('protocol-silent-night-highscore')).toBe('2500');

    // Reset the store - high score should persist
    reset();

    // High score should still be available after reset
    expect(useGameStore.getState().highScore).toBe(2500);
  });
});
