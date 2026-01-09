import ReactTestRenderer from '@react-three/test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Enemies } from '@/game/Enemies';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';

// Mock Strata
vi.mock('@jbcom/strata', () => ({
  noise3D: vi.fn(() => 0),
  fbm: vi.fn(() => 0),
}));

// Mock Data
vi.mock('@/data', async () => {
  // biome-ignore lint/suspicious/noExplicitAny: mocking
  const actual = (await vi.importActual('@/data')) as any;
  return {
    ...actual,
    TERRAIN_CONFIG: {
      ...actual.TERRAIN_CONFIG,
      gridSize: 10,
    },
  };
});

// Mock Three.js to avoid issues in headless env
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
  };
});

describe('Spawning Logic', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllMocks();
  }, 10000);

  it('Enemies should spawn when state transitions to PHASE_1', async () => {
    useGameStore.setState({ state: 'MENU' });

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types
    const renderer = (await ReactTestRenderer.create(<Enemies />)) as any;

    await ReactTestRenderer.act(async () => {
      useGameStore.setState({ state: 'PHASE_1' });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    const enemies = useGameStore.getState().enemies;
    expect(enemies.length).toBeGreaterThan(0);

    await renderer.unmount();
  }, 10000);

  it('Obstacles should spawn if noise is above threshold', async () => {
    const { noise3D } = await import('@jbcom/strata');
    vi.mocked(noise3D).mockReturnValue(0.95);

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;

    await ReactTestRenderer.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    const obstacles = useGameStore.getState().obstacles;
    expect(obstacles.length).toBeGreaterThan(0);

    await renderer.unmount();
  }, 10000);

  it('selectLevelUpgrade should return to previous state', async () => {
    useGameStore.setState({ state: 'PHASE_BOSS' });

    useGameStore.getState().levelUp();
    expect(useGameStore.getState().state).toBe('LEVEL_UP');

    const choices = useGameStore.getState().runProgress.upgradeChoices;
    expect(choices.length).toBeGreaterThan(0);

    useGameStore.getState().selectLevelUpgrade(choices[0].id);
    expect(useGameStore.getState().state).toBe('PHASE_BOSS');
  }, 10000);
});
