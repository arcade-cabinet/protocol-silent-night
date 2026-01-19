/**
 * @fileoverview Terrain system exports
 * @module terrain
 *
 * Procedural terrain generation for Protocol: Silent Night.
 * Uses pure BabylonJS with custom noise functions.
 */

// Noise generation
export {
  noise2D,
  noise3D,
  fbm,
  fbm2D,
  ridgeNoise,
  turbulence,
  cellularNoise,
  createSeededNoise,
} from './NoiseGenerator';

// Terrain materials
export {
  createTerrainMaterial,
  createAdvancedTerrainMaterial,
  createSimpleTerrainMaterial,
  createGridTexture,
  CyberpunkPalette,
  type TerrainMaterialConfig,
} from './TerrainMaterial';

// Procedural terrain
export {
  createTerrain,
  createFlatTerrain,
  updateTerrainConfig,
  DEFAULT_TERRAIN_CONFIG,
  type TerrainConfig,
  type TerrainResult,
} from './ProceduralTerrain';
