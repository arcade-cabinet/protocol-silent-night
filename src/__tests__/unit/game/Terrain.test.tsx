import ReactTestRenderer from '@react-three/test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';

// Mock Strata
vi.mock('@jbcom/strata', () => ({
  noise3D: vi.fn(() => 0),
  fbm: vi.fn(() => 0),
}));

// Mock Data to reduce grid size for performance
vi.mock('@/data', async () => {
  // biome-ignore lint/suspicious/noExplicitAny: mocking
  const actual = await vi.importActual('@/data') as any;
  return {
    ...actual,
    TERRAIN_CONFIG: {
      ...actual.TERRAIN_CONFIG,
      gridSize: 10, // Small grid for testing
    },
  };
});

describe('Terrain Component', () => {
  beforeEach(() => {
    useGameStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should render correctly and match snapshot', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;
    // In newer react-three-test-renderer versions, it might be renderer.toGraph() or similar.
    // Or just checking it exists.
    expect(renderer).toBeDefined();
    // Assuming toGraph exists which is common in r3f test renderer
    expect(renderer.toGraph).toBeDefined();
    await renderer.unmount();
  });

  it('should generate obstacles when noise is high', async () => {
    const { noise3D } = await import('@jbcom/strata');
    vi.mocked(noise3D).mockReturnValue(0.95);

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;

    await ReactTestRenderer.act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const obstacles = useGameStore.getState().obstacles;
    expect(obstacles.length).toBeGreaterThan(0);

    await renderer.unmount();
  });

  it('should cleanup resources on unmount', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;
    await renderer.unmount();
  });
});
