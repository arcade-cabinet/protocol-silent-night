/**
 * Asset Loaders Module
 *
 * Provides unified loading for:
 * - GLB characters (Meshy-generated)
 * - PBR textures (AmbientCG)
 * - Fallback procedural generation
 */

export {
  loadGLBCharacter,
  hasGLBCharacter,
  GLBCharacterController,
  type LoadedCharacter,
  type CharacterAnimations,
} from './GLBCharacterLoader';

export {
  loadPBRTextureSet,
  createPBRMaterialFromTextures,
  createPBRMaterial,
  getAvailableTextures,
  preloadCategory,
  createCyberpunkGroundMaterial,
  createIcyGroundMaterial,
  createMetalPanelMaterial,
  createSciFiTileMaterial,
  type PBRTextureSet,
  type PBRMaterialOptions,
  type TextureCategory,
} from './PBRTextureLoader';

export {
  loadSkybox,
  loadMobileSkybox,
  loadHDRSkybox,
  createGradientSkybox,
  getAvailableSkyboxes,
  hasSkyboxPreset,
  type SkyboxOptions,
  type SkyboxResult,
  type SkyboxPreset,
} from './SkyboxLoader';
