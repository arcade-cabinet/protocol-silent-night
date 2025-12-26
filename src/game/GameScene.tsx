/**
 * Game Scene
 * Main 3D scene containing all game elements
 * Uses Strata components for sky, volumetrics, and enhanced visuals
 */

import { ProceduralSky, VolumetricFogMesh } from '@jbcom/strata';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense } from 'react';
import { PlayerController } from '@/characters';
import { useGameStore } from '@/store/gameStore';
import { Bullets } from './Bullets';
import { CameraController } from './CameraController';
import { Enemies } from './Enemies';
import { HitParticles } from './HitParticles';
import { Lighting } from './Lighting';
import { Terrain } from './Terrain';

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

        {/* Strata Procedural Sky - Night setting */}
        <ProceduralSky
          timeOfDay={{
            sunAngle: 10, // Near horizon for night (0-180 range required)
            sunIntensity: 0.1,
            ambientLight: 0.2,
            starVisibility: 0.8,
            fogDensity: 0.3,
          }}
          weather={{ intensity: 0.2 }}
          size={[500, 500]}
          distance={100}
        />

        {/* Strata Volumetric Fog for atmosphere */}
        <VolumetricFogMesh color={0x0a0a20} density={0.015} height={20} size={100} />

        {/* World */}
        <Terrain />

        {/* Entities (only when game is active - not menu or briefing) */}
        {state !== 'MENU' && state !== 'BRIEFING' && (
          <>
            <PlayerController />
            <Bullets />
            <Enemies />
            <HitParticles />
          </>
        )}

        {/* Post Processing - Bloom for neon glow */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} radius={0.5} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
