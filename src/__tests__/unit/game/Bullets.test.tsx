import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Bullets } from '@/game/Bullets';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock THREE.InstancedMesh.prototype.setMatrixAt
vi.mock('three', async () => {
  const actual = await vi.importActual('three') as any;
  const InstancedMesh = actual.InstancedMesh;
  InstancedMesh.prototype.setMatrixAt = vi.fn();
  // Ensure instanceMatrix exists
  Object.defineProperty(InstancedMesh.prototype, 'instanceMatrix', {
    get: () => ({ needsUpdate: false }),
    configurable: true
  });
  return actual;
});

describe('Bullets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      bullets: [],
      enemies: [],
    });
  });

  it('should update bullet positions when useFrame is called', () => {
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

    useGameStore.setState({
      bullets: [bullet],
    });

    render(<Bullets />);

    // Get the useFrame callback
    const useFrameMock = vi.mocked(useFrame);
    expect(useFrameMock).toHaveBeenCalled();
    const callback = useFrameMock.mock.calls[0][0];

    // Call the callback with a delta time of 0.1s
    callback({ clock: { elapsedTime: 0 } } as any, 0.1);

    const state = useGameStore.getState();
    // Position should be initial + direction * speed * delta = 0 + 1 * 10 * 0.1 = 1
    expect(state.bullets[0].mesh.position.x).toBeCloseTo(1);
    expect(state.bullets[0].life).toBeCloseTo(0.9);
  });

  it('should remove bullets when life expires', () => {
    const bullet = {
      id: 'test-bullet',
      mesh: new THREE.Object3D(),
      velocity: new THREE.Vector3(10, 0, 0),
      direction: new THREE.Vector3(1, 0, 0),
      speed: 10,
      life: 0.05, // Expiring soon
      isActive: true,
      hp: 1,
      maxHp: 1,
      isEnemy: false,
      damage: 10,
      type: 'cannon' as const,
    };

    useGameStore.setState({
      bullets: [bullet],
    });

    render(<Bullets />);

    const callback = vi.mocked(useFrame).mock.calls[0][0];
    callback({ clock: { elapsedTime: 0 } } as any, 0.1);

    const state = useGameStore.getState();
    expect(state.bullets).toHaveLength(0);
  });

  it('should handle collisions with enemies', () => {
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
    bullet.mesh.position.set(5, 0, 5);

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
    enemy.mesh.position.set(5, 0, 5); // Same position

    useGameStore.setState({
      bullets: [bullet],
      enemies: [enemy],
    });

    const damageEnemySpy = vi.spyOn(useGameStore.getState(), 'damageEnemy');

    render(<Bullets />);

    const callback = vi.mocked(useFrame).mock.calls[0][0];
    callback({ clock: { elapsedTime: 0 } } as any, 0.1);

    expect(damageEnemySpy).toHaveBeenCalled();
    const state = useGameStore.getState();
    expect(state.bullets).toHaveLength(0); // Bullet removed on hit
  });
});
