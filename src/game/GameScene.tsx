/**
 * Game Scene
 * Main 3D scene containing all game elements
 * Uses Strata components for sky, volumetrics, and enhanced visuals
 * Data-driven configuration from themes.json
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
import THEMES from '@/data/themes.json';

export function GameScene() {
  const state = useGameStore((s) => s.state);
  const theme = THEMES.default;

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
            sunAngle: theme.sky.sunAngle,
            sunIntensity: theme.sky.sunIntensity,
            ambientLight: theme.sky.ambientLight,
            starVisibility: theme.sky.starVisibility,
            fogDensity: theme.sky.fogDensity,
          }}
          weather={{ intensity: theme.sky.weatherIntensity }}
          size={[500, 500]}
          distance={100}
        />

        {/* Strata Volumetric Fog for atmosphere */}
        <VolumetricFogMesh 
          color={theme.sky.volumetricFog.color} 
          density={theme.sky.volumetricFog.density} 
          height={theme.sky.volumetricFog.height} 
          size={100} 
        />

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
          <Bloom 
            luminanceThreshold={theme.postProcessing.bloom.luminanceThreshold} 
            luminanceSmoothing={theme.postProcessing.bloom.luminanceSmoothing} 
            intensity={theme.postProcessing.bloom.intensity} 
            radius={theme.postProcessing.bloom.radius} 
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
