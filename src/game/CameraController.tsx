/**
 * Camera Controller
 * Follows player with smooth interpolation and screen shake
 */

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

const CAMERA_HEIGHT = 25;
const CAMERA_DISTANCE = 20;
const LERP_SPEED = 5;

export function CameraController() {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE));

  const { playerPosition, screenShake, state } = useGameStore();

  useFrame((_, delta) => {
    if (state === 'MENU') {
      // Menu camera - static elevated view
      camera.position.lerp(new THREE.Vector3(0, 30, 30), delta * 2);
      camera.lookAt(0, 0, 0);
      return;
    }

    // Calculate target position (following player)
    targetRef.current.set(
      playerPosition.x,
      CAMERA_HEIGHT,
      playerPosition.z + CAMERA_DISTANCE
    );

    // Apply screen shake
    if (screenShake > 0.01) {
      targetRef.current.x += (Math.random() - 0.5) * screenShake * 2;
      targetRef.current.y += (Math.random() - 0.5) * screenShake * 2;
      targetRef.current.z += (Math.random() - 0.5) * screenShake * 2;

      // Decay shake using getState to avoid re-render cycles
      const currentShake = useGameStore.getState().screenShake;
      useGameStore.setState({ screenShake: currentShake * 0.9 });
    }

    // Smooth follow
    camera.position.lerp(targetRef.current, LERP_SPEED * delta);

    // Look at player (slightly ahead)
    const lookTarget = new THREE.Vector3(
      playerPosition.x,
      0,
      playerPosition.z
    );
    camera.lookAt(lookTarget);
  });

  return null;
}
