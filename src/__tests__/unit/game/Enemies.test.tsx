import ReactTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
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
    // Mock Date.now to allow controlling time for grace period
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      // Ensure state allows damage
      state: 'PHASE_1'
    });

    // Start at specific time
    const startTime = Date.now();
    vi.setSystemTime(startTime);

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Enemies />)) as any;

    // Advance time past grace period
    vi.setSystemTime(startTime + 6000);

    // Advance frames
    await renderer.advanceFrames(5, 0.1);

    const state = useGameStore.getState();
    expect(state.playerHp).toBeLessThan(100);

    await renderer.unmount();
  });
});
