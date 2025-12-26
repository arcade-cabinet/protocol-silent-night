/**
 * Camera Controller
 * Follows player with smooth interpolation, screen shake, pinch-to-zoom, and gyroscopic tilt
 */

import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

const DEFAULT_CAMERA_HEIGHT = 25;
const DEFAULT_CAMERA_DISTANCE = 20;
const LERP_SPEED = 5;

// Zoom constraints
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;

const MENU_CAMERA_POS = new THREE.Vector3(0, 30, 30);
const LOOK_TARGET = new THREE.Vector3();

export function CameraController() {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, DEFAULT_CAMERA_HEIGHT, DEFAULT_CAMERA_DISTANCE));

  // Zoom and tilt state
  const zoomRef = useRef(1.0);
  const gyroOffsetRef = useRef(new THREE.Vector3());
  const pinchStartRef = useRef<number | null>(null);
  const initialZoomRef = useRef(1.0);

  const { playerPosition, screenShake, state } = useGameStore();

  // Handle pinch-to-zoom
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartRef.current = Math.hypot(dx, dy);
      initialZoomRef.current = zoomRef.current;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);

      const scale = currentDistance / pinchStartRef.current;
      zoomRef.current = THREE.MathUtils.clamp(
        initialZoomRef.current / scale, // Pinch out (fingers apart) => zoom out (camera further)
        MIN_ZOOM,
        MAX_ZOOM
      );
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchStartRef.current = null;
  }, []);

  // Handle gyroscopic tilt
  const handleDeviceOrientation = useCallback(
    (e: DeviceOrientationEvent) => {
      if (state === 'MENU' || state === 'BRIEFING') return;

      // gamma: left/right tilt (-90 to 90)
      // beta: front/back tilt (-180 to 180)
      const gamma = e.gamma || 0;
      const beta = e.beta || 0;

      // Normalize and apply subtle offset
      // Clamp values to reasonable range for subtle effect
      const maxTilt = 4; // Max camera offset
      gyroOffsetRef.current.set(
        THREE.MathUtils.clamp((gamma / 45) * maxTilt, -maxTilt, maxTilt),
        0,
        THREE.MathUtils.clamp(((beta - 45) / 45) * maxTilt, -maxTilt, maxTilt) // Assume phone held at ~45 degrees
      );
    },
    [state]
  );

  // Handle mouse wheel for desktop zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.1 : -0.1;
    zoomRef.current = THREE.MathUtils.clamp(zoomRef.current + delta, MIN_ZOOM, MAX_ZOOM);
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Touch events for pinch-to-zoom
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse wheel for desktop
    window.addEventListener('wheel', handleWheel, { passive: true });

    // Request gyroscope permission on iOS 13+
    let isCancelled = false;
    const requestGyroPermission = async () => {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        // Check if requestPermission exists (iOS 13+)
        typeof (
          DeviceOrientationEvent as typeof DeviceOrientationEvent & {
            requestPermission?: () => Promise<string>;
          }
        ).requestPermission === 'function'
      ) {
        try {
          const permission = await (
            DeviceOrientationEvent as typeof DeviceOrientationEvent & {
              requestPermission: () => Promise<string>;
            }
          ).requestPermission();
          if (permission === 'granted' && !isCancelled) {
            window.addEventListener('deviceorientation', handleDeviceOrientation, {
              passive: true,
            });
          }
        } catch {
          // Permission denied or error
        }
      } else if (!isCancelled) {
        // Non-iOS or older browsers - just add listener
        window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
      }
    };

    requestGyroPermission();

    return () => {
      isCancelled = true;
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel, handleDeviceOrientation]);

  useFrame((_, delta) => {
    if (state === 'MENU' || state === 'BRIEFING') {
      // Menu camera - static elevated view with slow rotation
      camera.position.lerp(MENU_CAMERA_POS, delta * 2);
      camera.lookAt(0, 0, 0);
      return;
    }

    // Calculate zoomed camera height and distance
    const cameraHeight = DEFAULT_CAMERA_HEIGHT * zoomRef.current;
    const cameraDistance = DEFAULT_CAMERA_DISTANCE * zoomRef.current;

    // Calculate target position (following player + gyro offset)
    targetRef.current.set(
      playerPosition.x + gyroOffsetRef.current.x,
      cameraHeight,
      playerPosition.z + cameraDistance + gyroOffsetRef.current.z
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
    LOOK_TARGET.set(playerPosition.x, 0, playerPosition.z);
    camera.lookAt(LOOK_TARGET);
  });

  return null;
}
