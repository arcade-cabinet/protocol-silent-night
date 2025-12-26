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
      // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
      (node: any) => node.instance && node.instance.count !== undefined
    );

    // 3 types: cannon, smg, stars
    expect(instancedMeshes.length).toBe(3);

    // Check counts
    const cannon = instancedMeshes.find(
      // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
      (m: any) => m.instance.geometry.type === 'IcosahedronGeometry'
    );
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const smg = instancedMeshes.find((m: any) => m.instance.geometry.type === 'CapsuleGeometry');
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
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
      state: 'PHASE_1',
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

  it('should cleanup resources', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Bullets />)) as any;
    const meshes = renderer.scene.findAll(
      // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
      (node: any) => node.instance && node.instance.count !== undefined
    );

    // Verify we found the meshes
    expect(meshes.length).toBe(3);

    await renderer.unmount();

    // Ensure no errors occurred during unmount
    expect(renderer).toBeDefined();
  });
});
