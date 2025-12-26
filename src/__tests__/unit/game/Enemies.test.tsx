import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Enemies } from '@/game/Enemies';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

describe('Enemies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      enemies: [],
      state: 'PHASE_1',
      playerPosition: new THREE.Vector3(0, 0, 0),
    });
  });

  it('should move enemies towards player in useFrame', () => {
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
      playerPosition: new THREE.Vector3(0, 0, 0),
    });

    render(<Enemies />);

    const callback = vi.mocked(useFrame).mock.calls[0][0];
    callback({ clock: { elapsedTime: 0 } } as any, 0.1);

    const state = useGameStore.getState();
    // Should have moved towards origin
    expect(state.enemies[0].mesh.position.x).toBeLessThan(10);
  });

  it('should damage player on collision', () => {
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
    enemy.mesh.position.set(0.5, 0, 0); // Very close to player at (0,0,0)

    useGameStore.setState({
      enemies: [enemy],
      playerPosition: new THREE.Vector3(0, 0, 0),
      playerHp: 100,
    });

    const damagePlayerSpy = vi.spyOn(useGameStore.getState(), 'damagePlayer');

    render(<Enemies />);

    const callback = vi.mocked(useFrame).mock.calls[0][0];
    callback({ clock: { elapsedTime: 0 } } as any, 0.1);

    expect(damagePlayerSpy).toHaveBeenCalledWith(10);
  });
});
