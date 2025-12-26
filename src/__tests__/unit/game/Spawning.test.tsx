import ReactTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Enemies } from '@/game/Enemies';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';

// Mock Strata
vi.mock('@jbcom/strata', () => ({
  noise3D: vi.fn(() => 0),
  fbm: vi.fn(() => 0),
}));

describe('Spawning Logic', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllMocks();
  }, 10000); // Higher timeout for setup

  it('Enemies should spawn when state transitions to PHASE_1', async () => {
    // Start in MENU
    useGameStore.setState({ state: 'MENU' });

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types
    const renderer = (await ReactTestRenderer.create(<Enemies />)) as any;

    // Transition to PHASE_1
    await ReactTestRenderer.act(async () => {
      useGameStore.setState({ state: 'PHASE_1' });
      // Enemies.tsx initial spawn uses setTimeout with i * 200
      // We need to wait for these timeouts to finish.
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    const enemies = useGameStore.getState().enemies;
    expect(enemies.length).toBeGreaterThan(0);

    await renderer.unmount();
  }, 10000); // Higher timeout for test

  it('Obstacles should spawn if noise is above threshold', async () => {
    const strata = await import('@jbcom/strata');
    // Mock noise to be high
    vi.mocked(strata.noise3D).mockReturnValue(0.95);

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;

    // Wait for useEffect to run and update state
    await ReactTestRenderer.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    const obstacles = useGameStore.getState().obstacles;
    expect(obstacles.length).toBeGreaterThan(0);

    await renderer.unmount();
  }, 10000);

  it('selectLevelUpgrade should return to previous state', async () => {
    // Start in PHASE_BOSS
    useGameStore.setState({ state: 'PHASE_BOSS' });

    // Trigger level up
    useGameStore.getState().levelUp();
    expect(useGameStore.getState().state).toBe('LEVEL_UP');
    expect(useGameStore.getState().previousState).toBe('PHASE_BOSS');

    // Select upgrade
    const mockUpgrade = { id: 'test', name: 'Test', maxStacks: 1 };
    // Mock the data
    const data = await import('@/data');
    // biome-ignore lint/suspicious/noExplicitAny: necessary for mock data
    (data.ROGUELIKE_UPGRADES as any).push(mockUpgrade);

    useGameStore.getState().selectLevelUpgrade('test');

    // Should return to PHASE_BOSS
    expect(useGameStore.getState().state).toBe('PHASE_BOSS');
  }, 10000);
});
