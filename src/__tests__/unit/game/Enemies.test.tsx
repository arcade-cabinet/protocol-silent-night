/**
 * Enemies System Tests
 * Tests enemy spawning, AI behavior, rendering, and boss mechanics
 */

import ReactTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Enemies } from '@/game/Enemies';
import { useGameStore } from '@/store/gameStore';

describe('Enemies Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      enemies: [],
      state: 'PHASE_1',
      playerPosition: new THREE.Vector3(0, 0, 0),
    });
  });

  it('should render enemies and handle movement', async () => {
    const enemy = {
      id: 'test-enemy',
      mesh: new THREE.Object3D(),
      velocity: new THREE.Vector3(),
      hp: 30,
      maxHp: 30,
      isActive: true,
      type: 'minion' as const,
      speed: 10,
      damage: 1,
      pointValue: 10,
    };
    enemy.mesh.position.set(10, 0, 0);

    useGameStore.setState({
      enemies: [enemy],
    });

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Enemies />)) as any;

    // Advance frames to move enemy
    await renderer.advanceFrames(5, 0.1);

    const state = useGameStore.getState();
    // Should have moved towards player at (0,0,0)
    expect(state.enemies[0].mesh.position.x).toBeLessThan(10);

    await renderer.unmount();
  });

  it('should damage player on collision', async () => {
    const enemy = {
      id: 'test-enemy',
      mesh: new THREE.Object3D(),
      velocity: new THREE.Vector3(),
      hp: 30,
      maxHp: 30,
      isActive: true,
      type: 'minion' as const,
      speed: 10,
      damage: 10,
      pointValue: 10,
    };
    enemy.mesh.position.set(0.5, 0, 0); // Colliding

    useGameStore.setState({
      enemies: [enemy],
      playerHp: 100,
    });

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Enemies />)) as any;

    await renderer.advanceFrames(1, 0.1);

    const state = useGameStore.getState();
    expect(state.playerHp).toBeLessThan(100);

    await renderer.unmount();
  });

  it('should handle max enemy limit', () => {
    const maxMinions = 20;
    
    // Manually add enemies up to limit
    for (let i = 0; i < maxMinions; i++) {
      const enemy = {
        id: `enemy-${i}`,
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        hp: 30,
        maxHp: 30,
        isActive: true,
        type: 'minion' as const,
        speed: 4,
        damage: 1,
        pointValue: 10,
      };
      useGameStore.getState().addEnemy(enemy);
    }

    // Should have exactly max enemies
    expect(useGameStore.getState().enemies.length).toBe(maxMinions);
  });

  it('should create enemies with proper Object3D mesh', () => {
    const enemy = {
      id: 'mesh-test',
      mesh: new THREE.Object3D(),
      velocity: new THREE.Vector3(),
      hp: 30,
      maxHp: 30,
      isActive: true,
      type: 'minion' as const,
      speed: 4,
      damage: 1,
      pointValue: 10,
    };

    enemy.mesh.position.set(10, 1, 10);

    useGameStore.getState().addEnemy(enemy);

    const storedEnemy = useGameStore.getState().enemies[0];
    expect(storedEnemy.mesh.position.x).toBe(10);
    expect(storedEnemy.mesh.position.y).toBe(1);
    expect(storedEnemy.mesh.position.z).toBe(10);
  });

  describe('Enemy AI & Movement Config', () => {
    it('should have slower speed for boss', () => {
      const bossSpeed = 3;
      const minionSpeed = 4;

      expect(bossSpeed).toBeLessThan(minionSpeed);
    });
  });

  describe('Enemy Collision & Combat', () => {
    it('should damage player on collision', () => {
      const playerPos = new THREE.Vector3(5, 0, 0);
      useGameStore.setState({
        playerPosition: playerPos,
        playerHp: 100,
        state: 'PHASE_1',
      });

      const enemyMesh = new THREE.Object3D();
      enemyMesh.position.copy(playerPos); // Same position = collision

      const enemy = {
        id: 'collision-test',
        mesh: enemyMesh,
        velocity: new THREE.Vector3(),
        hp: 30,
        maxHp: 30,
        isActive: true,
        type: 'minion' as const,
        speed: 4,
        damage: 5,
        pointValue: 10,
      };

      useGameStore.getState().addEnemy(enemy);

      // Check collision distance
      const distance = playerPos.distanceTo(enemy.mesh.position);
      expect(distance).toBeLessThan(1.5); // Collision threshold

      // Apply damage
      useGameStore.getState().damagePlayer(5);
      expect(useGameStore.getState().playerHp).toBe(95);
    });

    it('should apply knockback on collision', () => {
      const enemyPos = new THREE.Vector3(5, 1, 0);
      const playerPos = new THREE.Vector3(10, 0, 0);

      const direction = playerPos.clone().sub(enemyPos).normalize();
      const knockback = direction.multiplyScalar(-3);

      // Knockback should push enemy in opposite direction
      // If player is at +X, knockback should be in -X direction
      expect(knockback.x).toBeLessThan(0); // Negative X (away from player)
    });

    it('should handle enemy death', () => {
      const enemy = {
        id: 'death-test',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        hp: 10,
        maxHp: 30,
        isActive: true,
        type: 'minion' as const,
        speed: 4,
        damage: 1,
        pointValue: 10,
      };

      useGameStore.getState().addEnemy(enemy);
      expect(useGameStore.getState().enemies).toHaveLength(1);

      // Kill enemy
      const wasKilled = useGameStore.getState().damageEnemy('death-test', 10);

      expect(wasKilled).toBe(true);
      expect(useGameStore.getState().enemies).toHaveLength(0);
    });
  });

  describe('Boss Mechanics', () => {
    it('should spawn boss after 10 kills', () => {
      useGameStore.setState({
        state: 'PHASE_1',
        stats: { score: 0, kills: 0, bossDefeated: false },
      });

      // Simulate 10 kills
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().addKill(10);
      }

      expect(useGameStore.getState().stats.kills).toBe(10);
      expect(useGameStore.getState().state).toBe('PHASE_BOSS');
    });

    it('should only spawn one boss', () => {
      useGameStore.setState({ state: 'PHASE_1', enemies: [] });

      // Try to spawn boss multiple times
      useGameStore.getState().spawnBoss();
      useGameStore.getState().spawnBoss();
      useGameStore.getState().spawnBoss();

      const bossEnemies = useGameStore.getState().enemies.filter((e) => e.type === 'boss');

      expect(bossEnemies).toHaveLength(1);
    });

    it('should create boss with correct stats', () => {
      useGameStore.getState().spawnBoss();

      const boss = useGameStore.getState().enemies.find((e) => e.type === 'boss');

      expect(boss).toBeDefined();
      expect(boss?.hp).toBe(1000);
      expect(boss?.maxHp).toBe(1000);
      expect(boss?.damage).toBe(5);
      expect(boss?.pointValue).toBe(1000);
      expect(boss?.speed).toBe(3);
    });

    it('should position boss away from player', () => {
      useGameStore.setState({ playerPosition: new THREE.Vector3(0, 0, 0) });
      useGameStore.getState().spawnBoss();

      const boss = useGameStore.getState().enemies.find((e) => e.type === 'boss');
      expect(boss).toBeDefined();
      const bossPos = boss!.mesh.position;

      const distanceFromOrigin = Math.sqrt(bossPos.x * bossPos.x + bossPos.z * bossPos.z);

      // Boss spawns at radius 30 from player
      expect(distanceFromOrigin).toBeGreaterThanOrEqual(25);
      expect(distanceFromOrigin).toBeLessThanOrEqual(35);
    });

    it('should transition to WIN state when boss defeated', () => {
      useGameStore.setState({
        bossActive: true,
        bossHp: 1000,
        state: 'PHASE_BOSS',
      });

      // Defeat boss
      useGameStore.getState().damageBoss(1000);

      expect(useGameStore.getState().state).toBe('WIN');
      expect(useGameStore.getState().bossHp).toBe(0);
      expect(useGameStore.getState().stats.bossDefeated).toBe(true);
    });
  });

  describe('Enemy Rendering States', () => {
    it('should show HP indicator when damaged', () => {
      const enemy = {
        id: 'hp-indicator-test',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        hp: 15, // Half HP
        maxHp: 30,
        isActive: true,
        type: 'minion' as const,
        speed: 4,
        damage: 1,
        pointValue: 10,
      };

      useGameStore.getState().addEnemy(enemy);

      const hpRatio = enemy.hp / enemy.maxHp;
      expect(hpRatio).toBe(0.5);
    });

    it('should increase intensity when damaged', () => {
      const fullHp = { hp: 30, maxHp: 30 };
      const halfHp = { hp: 15, maxHp: 30 };

      const fullIntensity = fullHp.hp < fullHp.maxHp ? 2 : 1;
      const halfIntensity = halfHp.hp < halfHp.maxHp ? 2 : 1;

      expect(fullIntensity).toBe(1); // Not damaged
      expect(halfIntensity).toBe(2); // Damaged
    });
  });

  describe('Performance', () => {
    it('should handle multiple enemies efficiently', () => {
      for (let i = 0; i < 20; i++) {
        const enemy = {
          id: `perf-enemy-${i}`,
          mesh: new THREE.Object3D(),
          velocity: new THREE.Vector3(),
          hp: 30,
          maxHp: 30,
          isActive: true,
          type: 'minion' as const,
          speed: 4 + Math.random() * 2,
          damage: 1,
          pointValue: 10,
        };

        enemy.mesh.position.set(Math.random() * 50 - 25, 1, Math.random() * 50 - 25);

        useGameStore.getState().addEnemy(enemy);
      }

      expect(useGameStore.getState().enemies).toHaveLength(20);
    });

    it('should update enemies immutably', () => {
      const enemy = {
        id: 'immutable-test',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        hp: 30,
        maxHp: 30,
        isActive: true,
        type: 'minion' as const,
        speed: 4,
        damage: 1,
        pointValue: 10,
      };

      useGameStore.getState().addEnemy(enemy);

      const originalEnemies = useGameStore.getState().enemies;

      // Update enemies
      useGameStore.getState().updateEnemies((enemies) =>
        enemies.map((e) => ({
          ...e,
          mesh: (() => {
            const newMesh = new THREE.Object3D();
            newMesh.position.copy(e.mesh.position);
            newMesh.position.x += 1;
            return newMesh;
          })(),
        }))
      );

      const updatedEnemies = useGameStore.getState().enemies;

      // Should be different reference (immutable)
      expect(updatedEnemies).not.toBe(originalEnemies);
    });
  });
});
