import { describe, it, expect, vi } from 'vitest';
import ReactTestRenderer from '@react-three/test-renderer';
import { SantaCharacter } from '@/characters/SantaCharacter';

// Mock Strata
vi.mock('@jbcom/strata', async () => {
  const THREE = await import('three');
  return {
    createCharacter: vi.fn(() => ({
      root: new THREE.Group(),
      joints: {
        head: { mesh: new THREE.Group() },
        torso: { mesh: new THREE.Group() },
        armL: { mesh: new THREE.Group() },
        armR: { mesh: new THREE.Group(), group: new THREE.Group() },
        legL: { mesh: new THREE.Group() },
        legR: { mesh: new THREE.Group() },
        hips: { mesh: new THREE.Group() },
      },
      state: { speed: 0, maxSpeed: 10 },
    })),
    animateCharacter: vi.fn(),
    updateFurUniforms: vi.fn(),
  };
});

describe('SantaCharacter Component', () => {
  it('should render and animate', async () => {
    const renderer = await ReactTestRenderer.create(
      <SantaCharacter isMoving={true} isFiring={true} />
    );
    
    expect(renderer.scene).toBeDefined();
    
    // Advance frame to trigger useFrame logic
    await renderer.advanceFrames(1, 0.1);
    
    await renderer.unmount();
  });
});
