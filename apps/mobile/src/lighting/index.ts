/**
 * @fileoverview BabylonJS lighting and atmosphere system for Protocol: Silent Night
 * @module lighting
 *
 * This module provides a complete lighting and atmosphere system for the
 * cyberpunk Christmas night aesthetic. All settings are driven by DDL
 * configuration (themes.json).
 *
 * @example
 * ```typescript
 * import {
 *   createLightingSystem,
 *   createProceduralSky,
 *   setupFog,
 *   setupPostProcessing,
 *   createGlowLayer,
 *   createNeonMaterial,
 *   getDefaultThemeConfig,
 * } from './lighting';
 *
 * // Load theme config (or use default)
 * const theme = getDefaultThemeConfig();
 *
 * // Create lighting system
 * const lighting = createLightingSystem({ scene, theme });
 *
 * // Create sky dome
 * const sky = createProceduralSky({
 *   scene,
 *   config: theme.sky,
 *   enableAurora: true,
 * });
 *
 * // Setup fog
 * setupFog(scene, theme.lighting.fog);
 *
 * // Setup post-processing
 * const postProcess = setupPostProcessing({
 *   scene,
 *   camera,
 *   config: theme.postProcessing,
 *   mobileOptimized: true,
 * });
 *
 * // Create glow layer for neon effects
 * const glowSystem = createGlowLayer({ scene });
 *
 * // Create neon material
 * const neonSign = createNeonMaterial(scene, 'sign', '#ff00ff', 1.5);
 *
 * // In render loop
 * function update(deltaTime: number) {
 *   lighting.update(deltaTime);
 *   sky.update?.(deltaTime);
 * }
 *
 * // Cleanup
 * function dispose() {
 *   lighting.dispose();
 *   sky.dispose();
 *   postProcess.dispose();
 *   glowSystem.dispose();
 * }
 * ```
 */

// Types
export type {
  // Color and position types
  HexColor,
  Position3D,

  // Light configuration types
  LightAnimationConfig,
  AmbientLightConfig,
  MoonlightConfig,
  RimLightConfig,
  HemisphereLightConfig,
  LightingConfig,

  // Fog configuration types
  BasicFogConfig,
  VolumetricFogConfig,

  // Sky configuration types
  SkyConfig,
  GradientSkyConfig,

  // Post-processing types
  BloomConfig,
  PostProcessConfig,

  // Theme configuration
  ThemeConfig,

  // Result types
  LightingSystemResult,
  ProceduralSkyResult,
  PostProcessingResult,
  GlowSystemResult,

  // Props types
  LightingSystemProps,
  ProceduralSkyProps,
  PostProcessingProps,
  GlowSystemProps,
} from './LightingTypes';

// Lighting system
export {
  createLightingSystem,
  hexToColor3,
  enableShadowReceiver,
  enableShadowCaster,
  getDefaultThemeConfig,
} from './LightingSystem';

// Procedural sky
export {
  createProceduralSky,
  getDefaultGradientColors,
  updateSkyColors,
  updateAuroraIntensity,
  updateStarVisibility,
} from './ProceduralSky';

// Fog system
export {
  setupFog,
  clearFog,
  setFogDensity,
  setFogColor,
  createVolumetricFog,
  getDefaultFogConfig,
  getDefaultVolumetricFogConfig,
  FogMode,
} from './VolumetricFog';
export type { VolumetricFogResult } from './VolumetricFog';

// Post-processing
export {
  setupPostProcessing,
  getDefaultPostProcessConfig,
  applyLowEndSettings,
  applyHighEndSettings,
  applyPreset,
  PostProcessPresets,
} from './PostProcessing';

// Neon effects
export {
  createNeonMaterial,
  createNeonPBRMaterial,
  createGlowLayer,
  createNeonMaterialSet,
  setNeonIntensity,
  createPulsingNeon,
  createFlickeringNeon,
  NeonColors,
} from './NeonEffects';
