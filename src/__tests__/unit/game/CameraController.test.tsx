import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactTestRenderer from '@react-three/test-renderer';
import { CameraController } from '@/game/CameraController';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';

describe('CameraController Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      playerPosition: new THREE.Vector3(0, 0, 0),
      screenShake: 0,
      state: 'PHASE_1',
    });
  });

  it('should follow player position', async () => {
    const renderer = await ReactTestRenderer.create(<CameraController />);
    
    useGameStore.setState({
      playerPosition: new THREE.Vector3(10, 0, 10),
    });

    // Advance frames to lerp camera
    await renderer.advanceFrames(60, 0.1);

    // Access camera from R3F state
    const camera = renderer.scene.allChildren[0].instance.camera;
    expect(camera.position.x).toBeCloseTo(10, 0);
    expect(camera.position.z).toBeGreaterThan(10); 

    await renderer.unmount();
  });

  it('should handle screen shake decay', async () => {
    useGameStore.setState({
      screenShake: 1.0,
    });

    const renderer = await ReactTestRenderer.create(<CameraController />);
    
    await renderer.advanceFrames(1, 0.1);

    const state = useGameStore.getState();
    expect(state.screenShake).toBeLessThan(1.0);

    await renderer.unmount();
  });
});
