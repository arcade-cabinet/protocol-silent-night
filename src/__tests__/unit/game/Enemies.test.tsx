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

    // Start from MENU state, then transition to PHASE_1 to trigger game start timer
    useGameStore.setState({
      enemies: [enemy],
      playerHp: 100,
      state: 'MENU',
    });

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Enemies />)) as any;

    // Transition to PHASE_1 to start the grace period timer
    useGameStore.setState({ state: 'PHASE_1' });

    // Allow component to react to state change
    await renderer.advanceFrames(1, 0.1);

    // Advance frames to exceed the 8-second grace period (8000ms)
    // Each frame advances by 100ms, so 100 frames = 10 seconds
    await renderer.advanceFrames(100, 0.1);

    const state = useGameStore.getState();
    expect(state.playerHp).toBeLessThan(100);

    await renderer.unmount();
  });
});
