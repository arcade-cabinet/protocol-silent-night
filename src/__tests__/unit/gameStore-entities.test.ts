import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '@/store/gameStore';
import type { BulletData, EnemyData } from '@/types';

describe('GameStore - Bullet Management', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  const createMockBullet = (id: string, isEnemy = false): BulletData => ({
    id,
    mesh: new THREE.Object3D(),
    velocity: new THREE.Vector3(0, 0, 1),
    hp: 1,
    maxHp: 1,
    isActive: true,
    direction: new THREE.Vector3(0, 0, 1),
    isEnemy,
    damage: 10,
    life: 3,
    speed: 20,
    type: 'cannon',
  });

  describe('addBullet', () => {
    it('should add a bullet to the store', () => {
      const { addBullet } = useGameStore.getState();
      const bullet = createMockBullet('bullet-1');

      addBullet(bullet);

      expect(useGameStore.getState().bullets).toHaveLength(1);
      expect(useGameStore.getState().bullets[0].id).toBe('bullet-1');
    });

    it('should add multiple bullets', () => {
      const { addBullet } = useGameStore.getState();

      addBullet(createMockBullet('bullet-1'));
      addBullet(createMockBullet('bullet-2'));
      addBullet(createMockBullet('bullet-3'));

      expect(useGameStore.getState().bullets).toHaveLength(3);
    });

    it('should preserve bullet properties', () => {
      const { addBullet } = useGameStore.getState();
      const bullet = createMockBullet('bullet-1', true);
      bullet.damage = 25;
      bullet.speed = 30;

      addBullet(bullet);

      const storedBullet = useGameStore.getState().bullets[0];
      expect(storedBullet.isEnemy).toBe(true);
      expect(storedBullet.damage).toBe(25);
      expect(storedBullet.speed).toBe(30);
    });
  });

  describe('removeBullet', () => {
    it('should remove a bullet by id', () => {
      const { addBullet, removeBullet } = useGameStore.getState();

      addBullet(createMockBullet('bullet-1'));
      addBullet(createMockBullet('bullet-2'));

      removeBullet('bullet-1');

      const bullets = useGameStore.getState().bullets;
      expect(bullets).toHaveLength(1);
      expect(bullets[0].id).toBe('bullet-2');
    });

    it('should do nothing if bullet id not found', () => {
      const { addBullet, removeBullet } = useGameStore.getState();

      addBullet(createMockBullet('bullet-1'));

      removeBullet('non-existent');

      expect(useGameStore.getState().bullets).toHaveLength(1);
    });

    it('should handle removing from empty list', () => {
      const { removeBullet } = useGameStore.getState();

      removeBullet('bullet-1');

      expect(useGameStore.getState().bullets).toHaveLength(0);
    });
  });

  describe('updateBullets', () => {
    it('should update all bullets using updater function', () => {
      const { addBullet, updateBullets } = useGameStore.getState();

      addBullet(createMockBullet('bullet-1'));
      addBullet(createMockBullet('bullet-2'));

      updateBullets((bullets) => bullets.map((b) => ({ ...b, life: b.life - 1 })));

      const bullets = useGameStore.getState().bullets;
      expect(bullets[0].life).toBe(2);
      expect(bullets[1].life).toBe(2);
    });

    it('should filter bullets using updater function', () => {
      const { addBullet, updateBullets } = useGameStore.getState();

      addBullet(createMockBullet('bullet-1'));
      addBullet(createMockBullet('bullet-2'));
      addBullet(createMockBullet('bullet-3'));

      updateBullets((bullets) => bullets.filter((b) => b.id !== 'bullet-2'));

      const bullets = useGameStore.getState().bullets;
      expect(bullets).toHaveLength(2);
      expect(bullets.find((b) => b.id === 'bullet-2')).toBeUndefined();
    });
  });
});

describe('GameStore - Enemy Management', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
  });

  const createMockEnemy = (id: string, hp = 100): EnemyData => ({
    id,
    mesh: new THREE.Object3D(),
    velocity: new THREE.Vector3(),
    hp,
    maxHp: hp,
    isActive: true,
    type: 'minion',
    speed: 5,
    damage: 10,
    pointValue: 50,
  });

  describe('addEnemy', () => {
    it('should add an enemy to the store', () => {
      const { addEnemy } = useGameStore.getState();
      const enemy = createMockEnemy('enemy-1');

      addEnemy(enemy);

      expect(useGameStore.getState().enemies).toHaveLength(1);
      expect(useGameStore.getState().enemies[0].id).toBe('enemy-1');
    });

    it('should add multiple enemies', () => {
      const { addEnemy } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1'));
      addEnemy(createMockEnemy('enemy-2'));
      addEnemy(createMockEnemy('enemy-3'));

      expect(useGameStore.getState().enemies).toHaveLength(3);
    });

    it('should preserve enemy type and stats', () => {
      const { addEnemy } = useGameStore.getState();
      const enemy = createMockEnemy('boss-1', 1000);
      enemy.type = 'boss';
      enemy.pointValue = 1000;

      addEnemy(enemy);

      const storedEnemy = useGameStore.getState().enemies[0];
      expect(storedEnemy.type).toBe('boss');
      expect(storedEnemy.hp).toBe(1000);
      expect(storedEnemy.pointValue).toBe(1000);
    });
  });

  describe('removeEnemy', () => {
    it('should remove an enemy by id', () => {
      const { addEnemy, removeEnemy } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1'));
      addEnemy(createMockEnemy('enemy-2'));

      removeEnemy('enemy-1');

      const enemies = useGameStore.getState().enemies;
      expect(enemies).toHaveLength(1);
      expect(enemies[0].id).toBe('enemy-2');
    });

    it('should do nothing if enemy id not found', () => {
      const { addEnemy, removeEnemy } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1'));

      removeEnemy('non-existent');

      expect(useGameStore.getState().enemies).toHaveLength(1);
    });
  });

  describe('damageEnemy', () => {
    it('should reduce enemy HP', () => {
      const { addEnemy, damageEnemy } = useGameStore.getState();
      const enemy = createMockEnemy('enemy-1', 100);

      addEnemy(enemy);
      damageEnemy('enemy-1', 30);

      const damaged = useGameStore.getState().enemies[0];
      expect(damaged.hp).toBe(70);
    });

    it('should return false when enemy survives', () => {
      const { addEnemy, damageEnemy } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1', 100));
      const killed = damageEnemy('enemy-1', 30);

      expect(killed).toBe(false);
      expect(useGameStore.getState().enemies).toHaveLength(1);
    });

    it('should remove enemy and return true when HP reaches 0', () => {
      const { addEnemy, damageEnemy } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1', 100));
      const killed = damageEnemy('enemy-1', 100);

      expect(killed).toBe(true);
      expect(useGameStore.getState().enemies).toHaveLength(0);
    });

    it('should remove enemy when damage exceeds HP', () => {
      const { addEnemy, damageEnemy } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1', 100));
      const killed = damageEnemy('enemy-1', 150);

      expect(killed).toBe(true);
      expect(useGameStore.getState().enemies).toHaveLength(0);
    });

    it('should add kill and points when enemy is killed', () => {
      const { addEnemy, damageEnemy } = useGameStore.getState();
      const enemy = createMockEnemy('enemy-1', 100);
      enemy.pointValue = 75;

      addEnemy(enemy);
      damageEnemy('enemy-1', 100);

      const stats = useGameStore.getState().stats;
      expect(stats.kills).toBe(1);
      expect(stats.score).toBe(75);
    });

    it('should return false for non-existent enemy', () => {
      const { damageEnemy } = useGameStore.getState();

      const killed = damageEnemy('non-existent', 50);

      expect(killed).toBe(false);
    });

    it('should handle multiple enemies being damaged', () => {
      const { addEnemy, damageEnemy } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1', 100));
      addEnemy(createMockEnemy('enemy-2', 100));
      addEnemy(createMockEnemy('enemy-3', 100));

      damageEnemy('enemy-1', 50);
      damageEnemy('enemy-2', 100);
      damageEnemy('enemy-3', 30);

      const enemies = useGameStore.getState().enemies;
      expect(enemies).toHaveLength(2); // enemy-2 was killed
      expect(enemies.find((e) => e.id === 'enemy-1')?.hp).toBe(50);
      expect(enemies.find((e) => e.id === 'enemy-3')?.hp).toBe(70);
    });
  });

  describe('updateEnemies', () => {
    it('should update all enemies using updater function', () => {
      const { addEnemy, updateEnemies } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1', 100));
      addEnemy(createMockEnemy('enemy-2', 100));

      updateEnemies((enemies) => enemies.map((e) => ({ ...e, hp: e.hp - 10 })));

      const enemies = useGameStore.getState().enemies;
      expect(enemies[0].hp).toBe(90);
      expect(enemies[1].hp).toBe(90);
    });

    it('should filter enemies using updater function', () => {
      const { addEnemy, updateEnemies } = useGameStore.getState();

      addEnemy(createMockEnemy('enemy-1'));
      addEnemy(createMockEnemy('enemy-2'));
      addEnemy(createMockEnemy('enemy-3'));

      updateEnemies((enemies) => enemies.filter((e) => e.id !== 'enemy-2'));

      const enemies = useGameStore.getState().enemies;
      expect(enemies).toHaveLength(2);
      expect(enemies.find((e) => e.id === 'enemy-2')).toBeUndefined();
    });
  });
});

describe('GameStore - Boss Management', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    useGameStore.getState().selectClass('santa');
  });

  describe('spawnBoss', () => {
    it('should activate boss state', () => {
      const { spawnBoss } = useGameStore.getState();

      spawnBoss();

      expect(useGameStore.getState().bossActive).toBe(true);
      expect(useGameStore.getState().state).toBe('PHASE_BOSS');
    });

    it('should set boss HP to max', () => {
      const { spawnBoss } = useGameStore.getState();

      spawnBoss();

      expect(useGameStore.getState().bossHp).toBe(1000);
      expect(useGameStore.getState().bossMaxHp).toBe(1000);
    });

    it('should add boss to enemies array', () => {
      const { spawnBoss } = useGameStore.getState();

      spawnBoss();

      const enemies = useGameStore.getState().enemies;
      expect(enemies).toHaveLength(1);
      expect(enemies[0].type).toBe('boss');
      expect(enemies[0].id).toBe('boss-krampus');
    });

    it('should not spawn multiple bosses', () => {
      const { spawnBoss } = useGameStore.getState();

      spawnBoss();
      spawnBoss();

      const enemies = useGameStore.getState().enemies;
      expect(enemies).toHaveLength(1);
    });
  });

  describe('damageBoss', () => {
    beforeEach(() => {
      useGameStore.getState().spawnBoss();
    });

    it('should reduce boss HP', () => {
      const { damageBoss } = useGameStore.getState();

      damageBoss(100);

      expect(useGameStore.getState().bossHp).toBe(900);
    });

    it('should trigger screen shake', () => {
      const { damageBoss } = useGameStore.getState();

      damageBoss(100);

      expect(useGameStore.getState().screenShake).toBe(0.3);
    });

    it('should return false when boss survives', () => {
      const { damageBoss } = useGameStore.getState();

      const killed = damageBoss(100);

      expect(killed).toBe(false);
      expect(useGameStore.getState().bossActive).toBe(true);
    });

    it('should return true when boss is killed', () => {
      const { damageBoss } = useGameStore.getState();

      const killed = damageBoss(1000);

      expect(killed).toBe(true);
    });

    it('should set state to WIN when boss is killed', () => {
      const { damageBoss } = useGameStore.getState();
      const initialWave = useGameStore.getState().runProgress.wave;

      damageBoss(1000);

      const state = useGameStore.getState();
      expect(state.state).toBe('WIN');
      expect(state.bossActive).toBe(false);
      expect(state.runProgress.wave).toBe(initialWave + 1);
    });

    it('should mark boss as defeated in stats', () => {
      const { damageBoss } = useGameStore.getState();

      damageBoss(1000);

      expect(useGameStore.getState().stats.bossDefeated).toBe(true);
    });

    it('should update high score when boss is killed', () => {
      const { addKill, damageBoss } = useGameStore.getState();

      addKill(500);
      damageBoss(1000);

      expect(useGameStore.getState().highScore).toBe(500);
    });

    it('should not reduce HP below 0', () => {
      const { damageBoss } = useGameStore.getState();

      damageBoss(1500);

      expect(useGameStore.getState().bossHp).toBe(0);
    });
  });
});
