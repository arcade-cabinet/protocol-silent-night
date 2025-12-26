import { act, render } from '@testing-library/react';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Enemies } from '@/game/Enemies';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((_cb) => {
    // We can manually trigger the callback in tests if needed
    return null;
  }),
  useThree: vi.fn(() => ({
    camera: new THREE.PerspectiveCamera(),
    scene: new THREE.Scene(),
    gl: {
      capabilities: { isWebGL2: true },
      setAnimationLoop: vi.fn(),
    },
  })),
}));

// Mock Strata
vi.mock('@jbcom/strata', () => ({
  noise3D: vi.fn(() => 0),
  fbm: vi.fn(() => 0),
}));

// Mock InstancedMinions and other subcomponents to avoid R3F rendering issues in unit tests
vi.mock('@/game/Enemies', async () => {
  const actual = await vi.importActual('@/game/Enemies');
  return {
    ...actual,
    InstancedMinions: () => null,
    BossRenderer: () => null,
  };
});

describe('Spawning Logic', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllMocks();
  });

  it('Enemies should spawn when state transitions to PHASE_1', async () => {
    vi.useFakeTimers();
    // Start in MENU
    useGameStore.setState({ state: 'MENU' });

    render(<Enemies />);

    // Transition to PHASE_1
    act(() => {
      useGameStore.setState({ state: 'PHASE_1' });
    });

    // Enemies.tsx has a useEffect that spawns initial minions
    // It uses setTimeout with i * 200. For 5 minions, that's up to 1000ms.
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const enemies = useGameStore.getState().enemies;
    expect(enemies.length).toBeGreaterThan(0);
    vi.useRealTimers();
  });

  it('Obstacles should spawn if noise is above threshold', async () => {
    const strata = await import('@jbcom/strata');
    // Mock noise to be high
    vi.mocked(strata.noise3D).mockReturnValue(0.95);

    render(<Terrain />);

    const obstacles = useGameStore.getState().obstacles;
    expect(obstacles.length).toBeGreaterThan(0);
  });

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
  });
});
