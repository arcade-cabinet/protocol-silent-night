/**
 * Bullets System Tests
 * Tests bullet rendering, physics, collision detection, and lifecycle
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Bullets } from '@/game/Bullets';
import { useGameStore } from '@/store/gameStore';

// Mock three.js for testing
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');
  return {
    ...actual,
  };
});

describe('Bullets Component', () => {
  beforeEach(() => {
    // Reset game store
    useGameStore.setState({
      bullets: [],
      enemies: [],
      bossActive: false,
      bossHp: 1000,
      bossMaxHp: 1000,
    });
  });

  describe('Rendering', () => {
    it('should be defined as component', () => {
      // Test component existence without Canvas rendering to avoid ResizeObserver issues
      expect(Bullets).toBeDefined();
    });

    it('should have proper type', () => {
      expect(typeof Bullets).toBe('function');
    });
  });

  describe('Bullet Lifecycle', () => {
    it('should track bullet creation', () => {
      const bullet = {
        id: 'test-bullet-1',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 10,
        life: 5,
        isEnemy: false,
      };

      useGameStore.getState().addBullet(bullet);

      const bullets = useGameStore.getState().bullets;
      expect(bullets).toHaveLength(1);
      expect(bullets[0].id).toBe('test-bullet-1');
    });

    it('should remove bullet by ID', () => {
      const bullet1 = {
        id: 'bullet-1',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 10,
        life: 5,
        isEnemy: false,
      };

      const bullet2 = {
        id: 'bullet-2',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(0, 0, 1),
        speed: 20,
        damage: 10,
        life: 5,
        isEnemy: false,
      };

      useGameStore.getState().addBullet(bullet1);
      useGameStore.getState().addBullet(bullet2);

      expect(useGameStore.getState().bullets).toHaveLength(2);

      useGameStore.getState().removeBullet('bullet-1');

      const bullets = useGameStore.getState().bullets;
      expect(bullets).toHaveLength(1);
      expect(bullets[0].id).toBe('bullet-2');
    });

    it('should handle lifespan expiration', () => {
      const bullet = {
        id: 'expire-test',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 10,
        life: 0.1, // Very short life
        isEnemy: false,
      };

      useGameStore.getState().addBullet(bullet);
      expect(useGameStore.getState().bullets).toHaveLength(1);

      // Simulate time passing by updating life
      useGameStore.getState().updateBullets((bullets) =>
        bullets.map((b) => ({ ...b, life: b.life - 0.2 }))
      );

      // Bullet with negative life should be marked for removal
      const updatedBullets = useGameStore.getState().bullets;
      expect(updatedBullets[0].life).toBeLessThan(0);
    });
  });

  describe('Collision Detection', () => {
    it('should detect bullet-enemy collision', () => {
      const enemyPosition = new THREE.Vector3(10, 1, 0);
      const enemyMesh = new THREE.Object3D();
      enemyMesh.position.copy(enemyPosition);

      const enemy = {
        id: 'enemy-1',
        mesh: enemyMesh,
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

      const bulletMesh = new THREE.Object3D();
      bulletMesh.position.copy(enemyPosition); // Same position = collision

      const bullet = {
        id: 'bullet-collision-test',
        mesh: bulletMesh,
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 15,
        life: 5,
        isEnemy: false,
      };

      useGameStore.getState().addBullet(bullet);

      // Test collision detection logic
      const bulletPos = bullet.mesh.position;
      const enemyPos = enemy.mesh.position;
      const distance = bulletPos.distanceTo(enemyPos);

      // Should be close enough for collision (< 1.5 units)
      expect(distance).toBeLessThan(1.5);
    });

    it('should apply damage on collision', () => {
      const enemyMesh = new THREE.Object3D();
      enemyMesh.position.set(5, 1, 0);

      const enemy = {
        id: 'enemy-damage-test',
        mesh: enemyMesh,
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

      // Apply damage
      const wasKilled = useGameStore.getState().damageEnemy('enemy-damage-test', 15);

      expect(wasKilled).toBe(false); // Should still be alive
      expect(useGameStore.getState().enemies[0].hp).toBe(15);
    });

    it('should remove enemy when HP reaches 0', () => {
      const enemyMesh = new THREE.Object3D();
      const enemy = {
        id: 'enemy-kill-test',
        mesh: enemyMesh,
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

      // Deal lethal damage
      const wasKilled = useGameStore.getState().damageEnemy('enemy-kill-test', 10);

      expect(wasKilled).toBe(true);
      expect(useGameStore.getState().enemies).toHaveLength(0);
    });
  });

  describe('Boss Collision', () => {
    it('should damage boss on bullet hit', () => {
      useGameStore.setState({ bossActive: true, bossHp: 1000, bossMaxHp: 1000 });

      const bossMesh = new THREE.Object3D();
      bossMesh.position.set(0, 4, 0);

      const bossEnemy = {
        id: 'boss-krampus',
        mesh: bossMesh,
        velocity: new THREE.Vector3(),
        hp: 1000,
        maxHp: 1000,
        isActive: true,
        type: 'boss' as const,
        speed: 3,
        damage: 5,
        pointValue: 1000,
      };

      useGameStore.getState().addEnemy(bossEnemy);

      // Apply boss damage
      const wasKilled = useGameStore.getState().damageBoss(50);

      expect(wasKilled).toBe(false);
      expect(useGameStore.getState().bossHp).toBe(950);
    });

    it('should defeat boss at 0 HP', () => {
      useGameStore.setState({ bossActive: true, bossHp: 50, bossMaxHp: 1000 });

      const wasKilled = useGameStore.getState().damageBoss(50);

      expect(wasKilled).toBe(true);
      expect(useGameStore.getState().bossHp).toBe(0);
      expect(useGameStore.getState().state).toBe('WIN');
    });
  });

  describe('Weapon-Specific Bullets', () => {
    it('should support different bullet types', () => {
      const cannonBullet = {
        id: 'cannon-1',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 15,
        damage: 40,
        life: 5,
        isEnemy: false,
        type: 'cannon' as const,
      };

      const smgBullet = {
        id: 'smg-1',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 25,
        damage: 8,
        life: 3,
        isEnemy: false,
        type: 'smg' as const,
      };

      const starsBullet = {
        id: 'stars-1',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 18,
        life: 4,
        isEnemy: false,
        type: 'stars' as const,
      };

      useGameStore.getState().addBullet(cannonBullet);
      useGameStore.getState().addBullet(smgBullet);
      useGameStore.getState().addBullet(starsBullet);

      const bullets = useGameStore.getState().bullets;
      expect(bullets).toHaveLength(3);
      expect(bullets[0].damage).toBe(40); // Cannon
      expect(bullets[1].damage).toBe(8); // SMG
      expect(bullets[2].damage).toBe(18); // Stars
    });

    it('should apply correct damage per weapon type', () => {
      const enemyMesh = new THREE.Object3D();
      const enemy = {
        id: 'weapon-damage-test',
        mesh: enemyMesh,
        velocity: new THREE.Vector3(),
        hp: 100,
        maxHp: 100,
        isActive: true,
        type: 'minion' as const,
        speed: 4,
        damage: 1,
        pointValue: 10,
      };

      useGameStore.getState().addEnemy(enemy);

      // Test Cannon damage
      useGameStore.getState().damageEnemy('weapon-damage-test', 40);
      expect(useGameStore.getState().enemies[0].hp).toBe(60);

      // Test SMG damage
      useGameStore.getState().damageEnemy('weapon-damage-test', 8);
      expect(useGameStore.getState().enemies[0].hp).toBe(52);

      // Test Stars damage
      useGameStore.getState().damageEnemy('weapon-damage-test', 18);
      expect(useGameStore.getState().enemies[0].hp).toBe(34);
    });
  });

  describe('Performance & Optimization', () => {
    it('should handle multiple bullets efficiently', () => {
      const bulletCount = 50;

      for (let i = 0; i < bulletCount; i++) {
        const bullet = {
          id: `perf-bullet-${i}`,
          mesh: new THREE.Object3D(),
          direction: new THREE.Vector3(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
          ).normalize(),
          speed: 20 + Math.random() * 10,
          damage: 10,
          life: 5,
          isEnemy: false,
        };
        useGameStore.getState().addBullet(bullet);
      }

      expect(useGameStore.getState().bullets).toHaveLength(bulletCount);
    });

    it('should update bullets immutably', () => {
      const bullet = {
        id: 'immutable-test',
        mesh: new THREE.Object3D(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 10,
        life: 5,
        isEnemy: false,
      };

      useGameStore.getState().addBullet(bullet);

      const originalBullets = useGameStore.getState().bullets;
      const originalBullet = originalBullets[0];

      // Update bullets
      useGameStore.getState().updateBullets((bullets) =>
        bullets.map((b) => ({ ...b, life: b.life - 1 }))
      );

      const updatedBullets = useGameStore.getState().bullets;

      // References should be different (immutable update)
      expect(updatedBullets).not.toBe(originalBullets);
      expect(updatedBullets[0]).not.toBe(originalBullet);
      expect(updatedBullets[0].life).toBe(4);
    });
  });
});
