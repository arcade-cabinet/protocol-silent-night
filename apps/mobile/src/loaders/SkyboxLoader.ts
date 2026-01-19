/**
 * Skybox Loader
 *
 * Loads HDRI environment maps from AmbientCG assets.
 * Supports both HDR (.exr) for high quality and tonemapped (.jpg) for mobile performance.
 */

import {
  type Scene,
  CubeTexture,
  HDRCubeTexture,
  Texture,
  MeshBuilder,
  StandardMaterial,
  Color3,
  type Mesh,
} from '@babylonjs/core';

// ============================================================================
// TYPES
// ============================================================================

export interface SkyboxOptions {
  /** Use HDR (.exr) format for better quality, or tonemapped (.jpg) for performance */
  useHDR?: boolean;
  /** Size of the skybox mesh (default: 1000) */
  size?: number;
  /** Rotation offset in radians */
  rotation?: number;
  /** Exposure adjustment for HDR (default: 1.0) */
  exposure?: number;
}

export interface SkyboxResult {
  mesh: Mesh;
  texture: CubeTexture | HDRCubeTexture | Texture;
  dispose: () => void;
}

// Available skybox presets
export type SkyboxPreset =
  | 'night_clear'       // EveningSkyHDRI001A - Clear night sky
  | 'night_clouds'      // EveningSkyHDRI005A - Cloudy evening
  | 'night_industrial'  // EveningSkyHDRI010A - Industrial twilight
  | 'environment_dark'  // EveningEnvironmentHDRI001 - Dark environment
  | 'environment_blue'; // EveningEnvironmentHDRI003 - Blue hour environment

// Mapping of presets to file names
const SKYBOX_FILES: Record<SkyboxPreset, string> = {
  night_clear: 'EveningSkyHDRI001A_1K',
  night_clouds: 'EveningSkyHDRI005A_1K',
  night_industrial: 'EveningSkyHDRI010A_1K',
  environment_dark: 'EveningEnvironmentHDRI001_1K',
  environment_blue: 'EveningEnvironmentHDRI003_1K',
};

// ============================================================================
// LOADER
// ============================================================================

/**
 * Load a skybox from HDRI preset
 *
 * @example
 * ```typescript
 * const skybox = loadSkybox(scene, 'night_industrial', { useHDR: false });
 *
 * // Later, cleanup
 * skybox.dispose();
 * ```
 */
export function loadSkybox(
  scene: Scene,
  preset: SkyboxPreset,
  options: SkyboxOptions = {}
): SkyboxResult {
  const { useHDR = false, size = 1000, rotation = 0, exposure = 1.0 } = options;
  const fileName = SKYBOX_FILES[preset];
  const basePath = '../../assets/skyboxes/';

  // Create skybox mesh
  const mesh = MeshBuilder.CreateBox('skybox', { size }, scene);
  mesh.infiniteDistance = true;
  mesh.renderingGroupId = 0;

  // Create material
  const material = new StandardMaterial('skybox_material', scene);
  material.backFaceCulling = false;
  material.disableLighting = true;

  let texture: CubeTexture | HDRCubeTexture | Texture;

  if (useHDR) {
    // Use HDR for better quality (larger file size)
    texture = new HDRCubeTexture(
      `${basePath}${fileName}_HDR.exr`,
      scene,
      512, // Resolution
      false, // noMipmap
      true, // generateHarmonics
      false, // gammaSpace
      false, // reserved
      undefined,
      undefined
    );

    // Apply exposure
    scene.environmentIntensity = exposure;
  } else {
    // Use tonemapped JPEG for mobile performance
    texture = new Texture(`${basePath}${fileName}_TONEMAPPED.jpg`, scene);
    texture.coordinatesMode = Texture.SPHERICAL_MODE;
    material.emissiveTexture = texture;
    material.emissiveColor = new Color3(1, 1, 1);
  }

  // Apply rotation if specified
  if (rotation !== 0) {
    mesh.rotation.y = rotation;
  }

  // Set as reflection texture for PBR materials
  if (useHDR && texture instanceof HDRCubeTexture) {
    scene.environmentTexture = texture;
  }

  material.reflectionTexture = texture instanceof CubeTexture || texture instanceof HDRCubeTexture
    ? texture
    : null;
  mesh.material = material;

  return {
    mesh,
    texture,
    dispose: () => {
      mesh.dispose();
      material.dispose();
      texture.dispose();
    },
  };
}

/**
 * Load skybox using the tonemapped version (optimized for mobile)
 */
export function loadMobileSkybox(
  scene: Scene,
  preset: SkyboxPreset
): SkyboxResult {
  return loadSkybox(scene, preset, { useHDR: false });
}

/**
 * Load skybox using HDR version (better quality for high-end devices)
 */
export function loadHDRSkybox(
  scene: Scene,
  preset: SkyboxPreset,
  exposure = 1.0
): SkyboxResult {
  return loadSkybox(scene, preset, { useHDR: true, exposure });
}

/**
 * Create a simple gradient skybox (for levels without HDRI)
 */
export function createGradientSkybox(
  scene: Scene,
  topColor: Color3 = new Color3(0.039, 0.063, 0.102), // Dark blue
  bottomColor: Color3 = new Color3(0.102, 0.039, 0.039), // Dark red
  size = 1000
): SkyboxResult {
  const mesh = MeshBuilder.CreateBox('gradient_skybox', { size }, scene);
  mesh.infiniteDistance = true;
  mesh.renderingGroupId = 0;

  const material = new StandardMaterial('gradient_skybox_material', scene);
  material.backFaceCulling = false;
  material.disableLighting = true;

  // Use emissive color for gradient effect
  // For a proper gradient, you'd use a custom shader or texture
  material.emissiveColor = Color3.Lerp(bottomColor, topColor, 0.5);

  mesh.material = material;

  // Create dummy texture for interface compatibility
  const texture = new Texture('', scene);

  return {
    mesh,
    texture,
    dispose: () => {
      mesh.dispose();
      material.dispose();
    },
  };
}

/**
 * Get all available skybox presets
 */
export function getAvailableSkyboxes(): SkyboxPreset[] {
  return Object.keys(SKYBOX_FILES) as SkyboxPreset[];
}

/**
 * Check if a skybox preset exists
 */
export function hasSkyboxPreset(preset: string): preset is SkyboxPreset {
  return preset in SKYBOX_FILES;
}
