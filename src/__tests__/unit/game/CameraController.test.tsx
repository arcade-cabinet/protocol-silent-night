import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { CameraController } from '@/game/CameraController';
import { useGameStore } from '@/store/gameStore';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

// Mock R3F
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: new THREE.PerspectiveCamera(),
  })),
}));

describe('CameraController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGameStore.setState({
      playerPosition: new THREE.Vector3(0, 0, 0),
      screenShake: 0,
      state: 'PHASE_1',
    });
  });

  it('should update camera position in useFrame', () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 0);
    vi.mocked(useThree).mockReturnValue({ camera } as any);

    useGameStore.setState({
      playerPosition: new THREE.Vector3(10, 0, 10),
    });

    render(<CameraController />);

    const callback = vi.mocked(useFrame).mock.calls[0][0];
    // Call multiple times to simulate lerp
    for (let i = 0; i < 10; i++) {
      callback({ clock: { elapsedTime: 0 } } as any, 0.1);
    }

    // Camera should have moved towards player position
    expect(camera.position.x).toBeGreaterThan(0);
    expect(camera.position.z).toBeGreaterThan(0);
  });

  it('should handle screen shake decay', () => {
    useGameStore.setState({
      screenShake: 1.0,
    });

    render(<CameraController />);

    const callback = vi.mocked(useFrame).mock.calls[0][0];
    callback({ clock: { elapsedTime: 0 } } as any, 0.1);

    expect(useGameStore.getState().screenShake).toBeLessThan(1.0);
  });
});
