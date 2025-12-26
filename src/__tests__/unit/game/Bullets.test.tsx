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
    const renderer = await ReactTestRenderer.create(<Bullets />);

    const instancedMeshes = renderer.allChildren.filter((child) => child.type === 'InstancedMesh');

    // 3 types: cannon, smg, stars
    expect(instancedMeshes.length).toBe(3);

    // Check counts
    const cannon = instancedMeshes.find((m) => m.instance.geometry.type === 'IcosahedronGeometry');
    const smg = instancedMeshes.find((m) => m.instance.geometry.type === 'CapsuleGeometry');
    const stars = instancedMeshes.find((m) => m.instance.geometry.type === 'ExtrudeGeometry');

    expect(cannon.instance.count).toBe(30);
    expect(smg.instance.count).toBe(60);
    expect(stars.instance.count).toBe(45);

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

    const renderer = await ReactTestRenderer.create(<Bullets />);

    // Advance frame to trigger movement and collision
    // 0.1s * 10 speed = 1 unit. We need 0.5s to hit enemy at 5 units
    await renderer.advanceFrames(5, 0.1);

    const state = useGameStore.getState();
    // Bullet should be removed after hit
    expect(state.bullets.length).toBe(0);
    // Enemy should have taken damage (100 - 10 = 90)
    expect(state.enemies[0].hp).toBe(90);

    await renderer.unmount();
  });

  it('should cleanup resources', async () => {
    const renderer = await ReactTestRenderer.create(<Bullets />);
    const meshes = renderer.allChildren.filter((c) => c.type === 'InstancedMesh');

    const spies = meshes.map((m) => vi.spyOn(m.instance.geometry, 'dispose'));

    await renderer.unmount();
    for (const spy of spies) {
      expect(spy).toHaveBeenCalled();
    }
  });
});
