import ReactTestRenderer from '@react-three/test-renderer';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';

// Mock Strata noise
vi.mock('@jbcom/strata', () => ({
  noise3D: vi.fn(() => 0.5),
  fbm: vi.fn(() => 0.5),
}));

describe('Terrain Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      obstacles: [],
    });
  });

  it('should render correctly and match snapshot', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;
    expect(renderer).toBeDefined();

    // Test count: WORLD_SIZE is 80, so 80*80 = 6400 instances
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const instancedMesh = renderer.scene.children.find((child: any) => child.type === 'InstancedMesh');
    if (instancedMesh) {
      expect(instancedMesh.count).toBe(6400);
    }

    await renderer.unmount();
  });

  it('should generate obstacles when noise is high', async () => {
    const strata = await import('@jbcom/strata');
    // Mock noise to trigger obstacle (isObstacle > 0.92)
    vi.mocked(strata.noise3D).mockImplementation((_x: number, _z: number, w: number) => {
      if (w === 0) return 0.95; // isObstacle
      return 0.5;
    });

    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;

    const state = useGameStore.getState();
    expect(state.obstacles.length).toBeGreaterThan(0);

    // Check if ChristmasObstacleMesh components are rendered
    // They are individual meshes
    const obstacles = renderer.scene.children.filter(
      // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
      (child: any) =>
        child.type === 'Mesh' && child.material?.type === 'MeshStandardMaterial'
    );
    expect(obstacles.length).toBeGreaterThan(0);

    await renderer.unmount();
  });

  it('should cleanup resources on unmount', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<Terrain />)) as any;

    // Spy on dispose methods of geometries and materials
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const terrainMesh = renderer.scene.children.find(
      (child: any) => child.type === 'InstancedMesh'
    );
    
    if (terrainMesh) {
      const disposeGeoSpy = vi.spyOn(terrainMesh.geometry, 'dispose');
      const disposeMatSpy = vi.spyOn(terrainMesh.material, 'dispose');

      await renderer.unmount();
      
      // R3F handles automatic disposal of objects in the scene graph
      expect(disposeGeoSpy).toHaveBeenCalled();
      expect(disposeMatSpy).toHaveBeenCalled();
    } else {
      await renderer.unmount();
    }
  });
});
