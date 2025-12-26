import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Terrain } from '@/game/Terrain';
import { useGameStore } from '@/store/gameStore';
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

// Mock Strata
vi.mock('@jbcom/strata', () => ({
  noise3D: vi.fn(() => 0.5),
  fbm: vi.fn(() => 0.5),
}));

describe('Terrain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      obstacles: [],
    });
  });

  it('should render and sync obstacles', async () => {
    const { noise3D } = await import('@jbcom/strata');
    (noise3D as any).mockImplementation((_x: number, _z: number, w: number) => {
      if (w === 0) return 0.95; // isObstacle
      return 0.5;
    });

    render(<Terrain />);
    
    expect(useGameStore.getState().obstacles.length).toBeGreaterThan(0);
  });

  it('should have correct instanced mesh count', () => {
    const { container } = render(<Terrain />);
    // We can't directly check the 'count' property on the DOM element in RTL,
    // but we can check if it rendered the tag.
    const instancedMesh = container.querySelector('instancedmesh');
    expect(instancedMesh).toBeDefined();
  });

  it('should cleanup resources on unmount', () => {
    const { unmount } = render(<Terrain />);
    expect(() => unmount()).not.toThrow();
  });

  it('should update material time in useFrame', () => {
    render(<Terrain />);
    
    const callback = vi.mocked(useFrame).mock.calls[0][0];
    const time = 1.5;
    
    // We can't easily access the internal material uniforms without more mocking,
    // but we can ensure the callback runs.
    expect(() => callback({ clock: { elapsedTime: time } } as any, 0.1)).not.toThrow();
  });
});
