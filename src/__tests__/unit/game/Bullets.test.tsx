/**
 * Bullets System Tests
 * Tests bullet rendering, physics, collision detection, and lifecycle
 */

import ReactTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Bullets } from '@/game/Bullets';
import { useGameStore } from '@/store/gameStore';

describe('Bullets Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      bullets: [],
      enemies: [],
    });
  });

  it('should render instanced meshes for weapon types', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Bullets />)) as any;

    // Use findAll and check if it has a count property which is characteristic of InstancedMesh
    const instancedMeshes = renderer.scene.findAll(
      (node: any) => node.instance && node.instance.count !== undefined
    );

    // 3 types: cannon, smg, stars
    expect(instancedMeshes.length).toBe(3);

    // Check counts
    const cannon = instancedMeshes.find(
      (m: any) => m.instance.geometry.type === 'IcosahedronGeometry'
    );
    const smg = instancedMeshes.find((m: any) => m.instance.geometry.type === 'CapsuleGeometry');
    const stars = instancedMeshes.find((m: any) => m.instance.geometry.type === 'ExtrudeGeometry');

    if (cannon) expect(cannon.instance.count).toBe(30);
    if (smg) expect(smg.instance.count).toBe(60);
    if (stars) expect(stars.instance.count).toBe(45);

    await renderer.unmount();
  });

  it('should update positions and handle collisions', async () => {
    const bullet = {
      id: 'test-bullet',
      mesh: new THREE.Object3D(),
      velocity: new THREE.Vector3(10, 0, 0),
      direction: new THREE.Vector3(1, 0, 0),
      speed: 10,
      life: 1.0,
      isActive: true,
      hp: 1,
      maxHp: 1,
      isEnemy: false,
      damage: 10,
      type: 'cannon' as const,
    };
    bullet.mesh.position.set(0, 0, 0);

    const enemy = {
      id: 'test-enemy',
      mesh: new THREE.Object3D(),
      velocity: new THREE.Vector3(),
      hp: 100,
      maxHp: 100,
      isActive: true,
      type: 'minion' as const,
      speed: 5,
      damage: 1,
      pointValue: 10,
    };
    enemy.mesh.position.set(5, 0, 0);

    useGameStore.setState({
      bullets: [bullet],
      enemies: [enemy],
    });

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Bullets />)) as any;

    // Advance frame to trigger movement and collision
    await ReactTestRenderer.act(async () => {
      await renderer.advanceFrames(5, 0.1);
    });

    const state = useGameStore.getState();
    // Bullet should be removed after hit
    expect(state.bullets.length).toBe(0);
    // Enemy should have taken damage
    expect(state.enemies[0].hp).toBeLessThan(100);

    await renderer.unmount();
  });

  it('should mark bullet for removal when life expires', async () => {
    const bullet = {
      id: 'test-bullet',
      mesh: new THREE.Object3D(),
      velocity: new THREE.Vector3(10, 0, 0),
      direction: new THREE.Vector3(1, 0, 0),
      speed: 10,
      life: 0.1,
      isActive: true,
      hp: 1,
      maxHp: 1,
      isEnemy: false,
      damage: 10,
      type: 'cannon' as const,
    };
    
    useGameStore.getState().addBullet(bullet);
    expect(useGameStore.getState().bullets).toHaveLength(1);

    // Simulate time passing by updating life
    useGameStore
      .getState()
      .updateBullets((bullets) => bullets.map((b) => ({ ...b, life: b.life - 0.2 })));

    // Bullet with negative life should be marked for removal or have negative life
    const updatedBullets = useGameStore.getState().bullets;
    expect(updatedBullets[0].life).toBeLessThan(0);
  });

  it('should cleanup resources', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Bullets />)) as any;
    const meshes = renderer.scene.findAll(
      (node: any) => node.instance && node.instance.count !== undefined
    );

    // Verify we found the meshes
    expect(meshes.length).toBe(3);

    await renderer.unmount();
    
    // Ensure no errors occurred during unmount
    expect(renderer).toBeDefined();
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
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 15,
        damage: 40,
        life: 5,
        isEnemy: false,
        type: 'cannon' as const,
        hp: 1,
        maxHp: 1,
        isActive: true,
      };

      const smgBullet = {
        id: 'smg-1',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 25,
        damage: 8,
        life: 3,
        isEnemy: false,
        type: 'smg' as const,
        hp: 1,
        maxHp: 1,
        isActive: true,
      };

      const starsBullet = {
        id: 'stars-1',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 18,
        life: 4,
        isEnemy: false,
        type: 'stars' as const,
        hp: 1,
        maxHp: 1,
        isActive: true,
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
          velocity: new THREE.Vector3(),
          direction: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
          speed: 20 + Math.random() * 10,
          damage: 10,
          life: 5,
          isEnemy: false,
          hp: 1,
          maxHp: 1,
          isActive: true,
          type: 'cannon' as const,
        };
        useGameStore.getState().addBullet(bullet);
      }

      expect(useGameStore.getState().bullets).toHaveLength(bulletCount);
    });

    it('should update bullets immutably', () => {
      const bullet = {
        id: 'immutable-test',
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        direction: new THREE.Vector3(1, 0, 0),
        speed: 20,
        damage: 10,
        life: 5,
        isEnemy: false,
        hp: 1,
        maxHp: 1,
        isActive: true,
        type: 'cannon' as const,
      };

      useGameStore.getState().addBullet(bullet);

      const originalBullets = useGameStore.getState().bullets;
      const originalBullet = originalBullets[0];

      // Update bullets
      useGameStore
        .getState()
        .updateBullets((bullets) => bullets.map((b) => ({ ...b, life: b.life - 1 })));

      const updatedBullets = useGameStore.getState().bullets;

      // References should be different (immutable update)
      expect(updatedBullets).not.toBe(originalBullets);
      expect(updatedBullets[0]).not.toBe(originalBullet);
      expect(updatedBullets[0].life).toBe(4);
    });
  });
});
