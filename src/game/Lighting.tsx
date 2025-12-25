/**
 * Lighting System
 * Provides atmospheric lighting for the game
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

export function Lighting() {
  const moonLightRef = useRef<THREE.DirectionalLight>(null);

  useFrame((state) => {
    // Subtle light animation
    if (moonLightRef.current) {
      const time = state.clock.elapsedTime;
      moonLightRef.current.intensity = 0.8 + Math.sin(time * 0.5) * 0.2;
    }
  });

  return (
    <>
      {/* Ambient Light - Very dim for atmosphere */}
      <ambientLight intensity={0.1} color={0xffffff} />

      {/* Blue Moonlight - Main directional light */}
      <directionalLight
        ref={moonLightRef}
        color={0x4455ff}
        intensity={1}
        position={[-20, 50, -20]}
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
      <directionalLight color={0x00ffcc} intensity={0.3} position={[20, 30, 40]} />

      {/* Ground Bounce Light */}
      <hemisphereLight args={[0x0a0a20, 0x000000, 0.4]} />

      {/* Fog for depth */}
      <fogExp2 attach="fog" args={[0x050505, 0.025]} />
    </>
  );
}
