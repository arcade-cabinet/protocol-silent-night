/**
 * Game Scene
 * Main 3D scene containing all game elements
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useGameStore } from '@/store/gameStore';
import { PlayerController } from '@/characters';
import { Terrain } from './Terrain';
import { Bullets } from './Bullets';
import { Enemies } from './Enemies';
import { Lighting } from './Lighting';
import { CameraController } from './CameraController';

export function GameScene() {
  const state = useGameStore((s) => s.state);

  return (
    <Canvas
      shadows
      gl={{
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{
        fov: 60,
        near: 0.1,
        far: 150,
        position: [0, 25, 20],
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <Suspense fallback={null}>
        {/* Core Systems */}
        <CameraController />
        <Lighting />

        {/* World */}
        <Terrain />

        {/* Entities (only when game is active) */}
        {state !== 'MENU' && (
          <>
            <PlayerController />
            <Bullets />
            <Enemies />
          </>
        )}

        {/* Post Processing - Bloom for neon glow */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.2}
            radius={0.5}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
