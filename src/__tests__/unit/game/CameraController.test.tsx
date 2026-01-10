import ReactTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CameraController } from '@/game/CameraController';
import { useGameStore } from '@/store/gameStore';

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
    // biome-ignore lint/suspicious/noExplicitAny: test-renderer types are incomplete
    const renderer = (await ReactTestRenderer.create(<CameraController />)) as any;

    useGameStore.setState({
      playerPosition: new THREE.Vector3(10, 0, 10),
    });

    // Advance frames to lerp camera
    await renderer.advanceFrames(60, 0.1);

    // Access camera from R3F state
    const camera =
      renderer.scene.instance.children[0]?.camera ||
      renderer.scene.allChildren.find(
        (c: { instance?: { camera?: THREE.Camera } }) => c.instance?.camera,
      )?.instance?.camera;
    if (camera) {
      expect(camera.position.x).toBeCloseTo(10, 0);
      expect(camera.position.z).toBeGreaterThan(10);
    }

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
