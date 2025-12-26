import { describe, it, expect, vi } from 'vitest';
import ReactTestRenderer from '@react-three/test-renderer';
import { ElfCharacter } from '@/characters/ElfCharacter';

// Mock Strata
vi.mock('@jbcom/strata', () => {
  const mockJoint = () => ({
    mesh: new THREE.Group(),
    group: new THREE.Group(),
  });
  return {
    createCharacter: vi.fn(() => ({
      root: new THREE.Group(),
      joints: {
        head: mockJoint(),
        torso: mockJoint(),
        armL: mockJoint(),
        armR: mockJoint(),
        legL: mockJoint(),
        legR: mockJoint(),
        hips: mockJoint(),
      },
      state: { speed: 0, maxSpeed: 10 },
    })),
    animateCharacter: vi.fn(),
    updateFurUniforms: vi.fn(),
  };
});

describe('ElfCharacter', () => {
  it('should render and handle useFrame', async () => {
    let renderer: any;
    await ReactTestRenderer.act(async () => {
      renderer = await ReactTestRenderer.create(
        <ElfCharacter isMoving={true} isFiring={true} />
      );
    });
    
    expect(renderer!.scene).toBeDefined();

    await ReactTestRenderer.act(async () => {
      await renderer!.advanceFrames(1, 0.1);
    });

    await ReactTestRenderer.act(async () => {
      renderer!.unmount();
    });
  });
});
