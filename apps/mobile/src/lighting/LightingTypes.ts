/**
 * @fileoverview Type definitions for DDL-driven lighting and atmosphere system
 * @module lighting/LightingTypes
 *
 * These types define the structure for theme configuration from themes.json
 * and work with BabylonJS lighting, fog, and post-processing systems.
 */

import type {
  Scene,
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  Mesh,
  DefaultRenderingPipeline,
  GlowLayer,
  Camera,
} from '@babylonjs/core';

/**
 * RGB color as hex string (e.g., "#4455ff")
 */
export type HexColor = string;

/**
 * Position as [x, y, z] array
 */
export type Position3D = [number, number, number];

/**
 * Animation configuration for pulsing/varying light
 */
export interface LightAnimationConfig {
  /** Range of intensity values [min, max] */
  intensityRange: [number, number];
  /** Animation speed multiplier */
  speed: number;
}

/**
 * Ambient light configuration
 */
export interface AmbientLightConfig {
  /** Light intensity (0-1) */
  intensity: number;
  /** Light color as hex string */
  color: HexColor;
}

/**
 * Moonlight (directional) configuration
 */
export interface MoonlightConfig {
  /** Light color as hex string */
  color: HexColor;
  /** Light intensity (0-2 typical) */
  intensity: number;
  /** World position of light source [x, y, z] */
  position: Position3D;
  /** Optional animation for flickering/pulsing */
  animation?: LightAnimationConfig;
}

/**
 * Rim light configuration for character highlights
 */
export interface RimLightConfig {
  /** Light color as hex string */
  color: HexColor;
  /** Light intensity (0-1) */
  intensity: number;
  /** World position [x, y, z] */
  position: Position3D;
}

/**
 * Hemisphere light configuration
 */
export interface HemisphereLightConfig {
  /** Sky color (top hemisphere) */
  skyColor: HexColor;
  /** Ground color (bottom hemisphere) */
  groundColor: HexColor;
  /** Light intensity (0-1) */
  intensity: number;
}

/**
 * Basic fog configuration
 */
export interface BasicFogConfig {
  /** Fog color as hex string */
  color: HexColor;
  /** Fog density (0.01-0.1 typical) */
  density: number;
}

/**
 * Volumetric fog configuration
 */
export interface VolumetricFogConfig {
  /** Fog color as hex string */
  color: HexColor;
  /** Fog density */
  density: number;
  /** Height cutoff for fog */
  height: number;
}

/**
 * Combined lighting configuration from DDL
 */
export interface LightingConfig {
  /** Ambient/fill light settings */
  ambient: AmbientLightConfig;
  /** Main directional moonlight */
  moonlight: MoonlightConfig;
  /** Optional rim light for character highlights */
  rim?: RimLightConfig;
  /** Hemisphere light for ambient */
  hemisphere?: HemisphereLightConfig;
  /** Basic fog settings */
  fog: BasicFogConfig;
}

/**
 * Sky configuration from DDL
 */
export interface SkyConfig {
  /** Sun angle in degrees (0-90) */
  sunAngle: number;
  /** Sun intensity (0-1) */
  sunIntensity: number;
  /** Ambient sky light (0-1) */
  ambientLight: number;
  /** Star visibility (0-1) */
  starVisibility: number;
  /** Sky fog density (0-1) */
  fogDensity: number;
  /** Weather effect intensity (0-1) */
  weatherIntensity: number;
  /** Volumetric fog settings */
  volumetricFog: VolumetricFogConfig;
}

/**
 * Gradient sky colors for procedural generation
 */
export interface GradientSkyConfig {
  /** Top of sky dome color */
  topColor: HexColor;
  /** Horizon color */
  horizonColor: HexColor;
  /** Ground reflection color */
  groundColor: HexColor;
}

/**
 * Bloom post-processing configuration
 */
export interface BloomConfig {
  /** Threshold for bloom activation (0-1) */
  luminanceThreshold: number;
  /** Smoothing of luminance falloff */
  luminanceSmoothing: number;
  /** Bloom intensity multiplier */
  intensity: number;
  /** Bloom radius/spread */
  radius: number;
}

/**
 * Post-processing configuration from DDL
 */
export interface PostProcessConfig {
  /** Bloom effect settings */
  bloom: BloomConfig;
}

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
  /** Lighting system settings */
  lighting: LightingConfig;
  /** Sky settings */
  sky: SkyConfig;
  /** Post-processing effects */
  postProcessing: PostProcessConfig;
}

/**
 * Result of creating the lighting system
 */
export interface LightingSystemResult {
  /** Ambient hemisphere light */
  ambientLight: HemisphericLight;
  /** Main directional moonlight */
  moonLight: DirectionalLight;
  /** Shadow generator attached to moonlight */
  shadowGenerator: ShadowGenerator;
  /** Optional rim light */
  rimLight?: DirectionalLight;
  /** Update function for animated lights */
  update: (deltaTime: number) => void;
  /** Dispose all lighting resources */
  dispose: () => void;
}

/**
 * Result of creating procedural sky
 */
export interface ProceduralSkyResult {
  /** Sky dome mesh */
  mesh: Mesh;
  /** Update for animated effects (aurora, etc.) */
  update?: (deltaTime: number) => void;
  /** Dispose sky resources */
  dispose: () => void;
}

/**
 * Result of setting up post-processing
 */
export interface PostProcessingResult {
  /** Default rendering pipeline */
  pipeline: DefaultRenderingPipeline;
  /** Set bloom intensity dynamically */
  setBloomIntensity: (intensity: number) => void;
  /** Set bloom threshold dynamically */
  setBloomThreshold: (threshold: number) => void;
  /** Enable/disable bloom */
  setBloomEnabled: (enabled: boolean) => void;
  /** Dispose post-processing resources */
  dispose: () => void;
}

/**
 * Result of creating glow layer
 */
export interface GlowSystemResult {
  /** Glow layer for selective bloom */
  glowLayer: GlowLayer;
  /** Add mesh to glow layer */
  addGlowMesh: (mesh: Mesh, color?: HexColor, intensity?: number) => void;
  /** Remove mesh from glow layer */
  removeGlowMesh: (mesh: Mesh) => void;
  /** Set overall glow intensity */
  setIntensity: (intensity: number) => void;
  /** Dispose glow resources */
  dispose: () => void;
}

/**
 * Props for lighting system creation
 */
export interface LightingSystemProps {
  /** BabylonJS scene */
  scene: Scene;
  /** Theme configuration from DDL */
  theme: ThemeConfig;
}

/**
 * Props for procedural sky creation
 */
export interface ProceduralSkyProps {
  /** BabylonJS scene */
  scene: Scene;
  /** Sky configuration */
  config: SkyConfig;
  /** Optional gradient colors override */
  gradientColors?: GradientSkyConfig;
  /** Enable aurora animation */
  enableAurora?: boolean;
}

/**
 * Props for post-processing setup
 */
export interface PostProcessingProps {
  /** BabylonJS scene */
  scene: Scene;
  /** Camera to attach pipeline to */
  camera: Camera;
  /** Post-processing configuration */
  config: PostProcessConfig;
  /** Mobile optimization (reduces quality for performance) */
  mobileOptimized?: boolean;
}

/**
 * Props for glow system creation
 */
export interface GlowSystemProps {
  /** BabylonJS scene */
  scene: Scene;
  /** Base glow intensity */
  intensity?: number;
  /** Blur kernel size (32 for mobile, 64 for desktop) */
  blurKernelSize?: number;
}
