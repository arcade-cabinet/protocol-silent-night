/**
 * Lighting System
 * Provides atmospheric lighting for the game
 * Data-driven configuration from themes.json
 */

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import THEMES from '@/data/themes.json';
import { isGamePausedForScreenshot } from '@/utils/screenshot';

export function Lighting() {
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const theme = THEMES.default.lighting;

  useFrame((state) => {
    if (isGamePausedForScreenshot()) return;
    // Subtle light animation
    if (moonLightRef.current && theme.moonlight.animation) {
      const time = state.clock.elapsedTime;
      const { intensityRange, speed } = theme.moonlight.animation;
      const range = intensityRange[1] - intensityRange[0];
      moonLightRef.current.intensity =
        intensityRange[0] + (Math.sin(time * speed) * 0.5 + 0.5) * range;
    }
  });

  return (
    <>
      {/* Ambient Light - Very dim for atmosphere */}
      <ambientLight intensity={theme.ambient.intensity} color={theme.ambient.color} />

      {/* Blue Moonlight - Main directional light */}
      <directionalLight
        ref={moonLightRef}
        color={theme.moonlight.color}
        intensity={theme.moonlight.intensity}
        position={theme.moonlight.position as [number, number, number]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Rim Light - Subtle cyan from behind */}
      <directionalLight
        color={theme.rim.color}
        intensity={theme.rim.intensity}
        position={theme.rim.position as [number, number, number]}
      />

      {/* Ground Bounce Light */}
      <hemisphereLight
        args={[theme.hemisphere.skyColor, theme.hemisphere.groundColor, theme.hemisphere.intensity]}
      />

      {/* Fog for depth */}
      <fogExp2 attach="fog" args={[theme.fog.color, theme.fog.density]} />
    </>
  );
}
