import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactTestRenderer from '@react-three/test-renderer';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

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
    const renderer = await ReactTestRenderer.create(<Terrain />);
    expect(renderer.scene).toBeDefined();
    
    // Test count: WORLD_SIZE is 80, so 80*80 = 6400 instances
    const instancedMesh = renderer.allChildren.find(
      (child) => child.type === 'InstancedMesh'
    );
    expect(instancedMesh).toBeDefined();
    expect(instancedMesh.instance.count).toBe(6400);

    await renderer.unmount();
  });

  it('should generate obstacles when noise is high', async () => {
    const strata = await import('@jbcom/strata');
    // Mock noise to trigger obstacle (isObstacle > 0.92)
    (strata.noise3D as any).mockImplementation((x: number, z: number, w: number) => {
      if (w === 0) return 0.95; // isObstacle
      return 0.5;
    });

    const renderer = await ReactTestRenderer.create(<Terrain />);
    
    const state = useGameStore.getState();
    expect(state.obstacles.length).toBeGreaterThan(0);
    
    // Check if ChristmasObstacleMesh components are rendered
    // They are individual meshes
    const obstacles = renderer.allChildren.filter(
      (child) => child.instance.type === 'Mesh' && child.instance.material.type === 'MeshStandardMaterial'
    );
    expect(obstacles.length).toBeGreaterThan(0);

    await renderer.unmount();
  });

  it('should cleanup resources on unmount', async () => {
    const renderer = await ReactTestRenderer.create(<Terrain />);
    
    // Spy on dispose methods of geometries and materials
    const terrainMesh = renderer.allChildren.find(
      (child) => child.type === 'InstancedMesh'
    ).instance;
    
    const disposeGeoSpy = vi.spyOn(terrainMesh.geometry, 'dispose');
    const disposeMatSpy = vi.spyOn(terrainMesh.material, 'dispose');

    await renderer.unmount();
    
    // R3F handles automatic disposal of objects in the scene graph
    expect(disposeGeoSpy).toHaveBeenCalled();
    expect(disposeMatSpy).toHaveBeenCalled();
  });
});
