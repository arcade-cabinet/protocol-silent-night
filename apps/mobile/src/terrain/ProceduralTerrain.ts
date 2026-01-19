/**
 * @fileoverview Procedural terrain generation using BabylonJS
 * @module terrain/ProceduralTerrain
 *
 * Creates a voxel-style terrain mesh using procedural noise.
 * Replaces @jbcom/strata with pure BabylonJS implementation.
 */

import {
  type Scene,
  Mesh,
  MeshBuilder,
  VertexData,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';

import { noise2D, fbm2D, createSeededNoise } from './NoiseGenerator';
import { createTerrainMaterial, type TerrainMaterialConfig } from './TerrainMaterial';

/**
 * Configuration for terrain generation
 */
export interface TerrainConfig {
  /** Grid size (number of cells per side) */
  gridSize: number;
  /** Size of each voxel cube */
  cubeSize: number;
  /** Maximum height of cubes */
  cubeHeight: number;
  /** Scale factor for primary noise */
  noiseScale: number;
  /** Scale factor for detail noise */
  detailNoiseScale: number;
  /** Multiplier for height values */
  heightMultiplier: number;
  /** Multiplier for detail height */
  detailHeightMultiplier: number;
  /** Base elevation offset */
  baseElevation: number;
  /** Chance of glitch cube (0-1) */
  glitchChance: number;
  /** Height threshold for obstacles */
  obstacleThreshold: number;
  /** Optional seed for deterministic generation */
  seed?: number;
}

/**
 * Default terrain configuration matching terrain.json
 */
export const DEFAULT_TERRAIN_CONFIG: TerrainConfig = {
  gridSize: 80,
  cubeSize: 1.8,
  cubeHeight: 4,
  noiseScale: 0.1,
  detailNoiseScale: 0.05,
  heightMultiplier: 2,
  detailHeightMultiplier: 1.5,
  baseElevation: -3,
  glitchChance: 0.005,
  obstacleThreshold: 0.4,
};

/**
 * Result of terrain creation
 */
export interface TerrainResult {
  /** The terrain mesh */
  mesh: Mesh;
  /** Get height at world coordinates */
  getHeightAt: (x: number, z: number) => number;
  /** Get height data array */
  heightData: Float32Array;
  /** Check if position is valid for obstacle placement */
  isObstaclePosition: (x: number, z: number) => boolean;
  /** Dispose of all resources */
  dispose: () => void;
}

/**
 * Height data cache for efficient lookups
 */
interface HeightCache {
  data: Float32Array;
  gridSize: number;
  cubeSize: number;
  offset: number;
}

/**
 * Creates a procedural terrain mesh with voxel-style cubes
 *
 * @param scene - BabylonJS scene
 * @param config - Terrain configuration
 * @param materialConfig - Optional material configuration
 * @returns TerrainResult with mesh and utility functions
 *
 * @example
 * ```typescript
 * const terrain = createTerrain(scene, {
 *   gridSize: 80,
 *   cubeSize: 1.8,
 *   noiseScale: 0.1,
 * });
 *
 * // Get height at position
 * const y = terrain.getHeightAt(player.position.x, player.position.z);
 *
 * // Cleanup
 * terrain.dispose();
 * ```
 */
export function createTerrain(
  scene: Scene,
  config: Partial<TerrainConfig> = {},
  materialConfig: TerrainMaterialConfig = {}
): TerrainResult {
  const cfg = { ...DEFAULT_TERRAIN_CONFIG, ...config };
  const { gridSize, cubeSize, noiseScale, detailNoiseScale } = cfg;
  const { heightMultiplier, detailHeightMultiplier, baseElevation } = cfg;

  // Create noise functions (seeded if provided)
  const noiseFn = cfg.seed !== undefined
    ? createSeededNoise(cfg.seed)
    : { noise2D, fbm: fbm2D };

  // Calculate terrain bounds
  const halfGrid = gridSize / 2;
  const offset = halfGrid * cubeSize;

  // Generate height data
  const heightData = new Float32Array(gridSize * gridSize);
  const obstacleMap = new Uint8Array(gridSize * gridSize);

  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = z * gridSize + x;

      // World position
      const wx = (x - halfGrid) * cubeSize;
      const wz = (z - halfGrid) * cubeSize;

      // Primary noise
      const primary = noiseFn.noise2D(wx * noiseScale, wz * noiseScale);

      // Detail noise
      const detail = noiseFn.noise2D(wx * detailNoiseScale, wz * detailNoiseScale);

      // Combined height
      const height =
        primary * heightMultiplier +
        detail * detailHeightMultiplier +
        baseElevation;

      heightData[idx] = height;

      // Mark obstacle positions (high enough areas)
      if (height > cfg.obstacleThreshold) {
        obstacleMap[idx] = 1;
      }
    }
  }

  // Create height cache for lookup
  const heightCache: HeightCache = {
    data: heightData,
    gridSize,
    cubeSize,
    offset,
  };

  // Build terrain mesh
  const mesh = createVoxelTerrainMesh(scene, cfg, heightData);

  // Apply material
  mesh.material = createTerrainMaterial(scene, {
    gridSpacing: cubeSize * 2,
    ...materialConfig,
  });

  // Height lookup function
  const getHeightAt = (x: number, z: number): number => {
    return getHeightFromCache(heightCache, x, z);
  };

  // Obstacle position check
  const isObstaclePosition = (x: number, z: number): boolean => {
    const gx = Math.floor((x + offset) / cubeSize);
    const gz = Math.floor((z + offset) / cubeSize);

    if (gx < 0 || gx >= gridSize || gz < 0 || gz >= gridSize) {
      return false;
    }

    return obstacleMap[gz * gridSize + gx] === 1;
  };

  // Dispose function
  const dispose = (): void => {
    mesh.dispose();
  };

  return {
    mesh,
    getHeightAt,
    heightData,
    isObstaclePosition,
    dispose,
  };
}

/**
 * Gets height at world coordinates from cache
 */
function getHeightFromCache(cache: HeightCache, x: number, z: number): number {
  const { data, gridSize, cubeSize, offset } = cache;

  // Convert world coords to grid coords
  const gx = (x + offset) / cubeSize;
  const gz = (z + offset) / cubeSize;

  // Get integer cell coordinates
  const x0 = Math.floor(gx);
  const z0 = Math.floor(gz);
  const x1 = Math.min(x0 + 1, gridSize - 1);
  const z1 = Math.min(z0 + 1, gridSize - 1);

  // Clamp to valid range
  const cx0 = Math.max(0, Math.min(x0, gridSize - 1));
  const cz0 = Math.max(0, Math.min(z0, gridSize - 1));
  const cx1 = Math.max(0, Math.min(x1, gridSize - 1));
  const cz1 = Math.max(0, Math.min(z1, gridSize - 1));

  // Get fractional part for interpolation
  const fx = gx - x0;
  const fz = gz - z0;

  // Bilinear interpolation
  const h00 = data[cz0 * gridSize + cx0];
  const h10 = data[cz0 * gridSize + cx1];
  const h01 = data[cz1 * gridSize + cx0];
  const h11 = data[cz1 * gridSize + cx1];

  const h0 = h00 * (1 - fx) + h10 * fx;
  const h1 = h01 * (1 - fx) + h11 * fx;

  return h0 * (1 - fz) + h1 * fz;
}

/**
 * Creates a voxel-style terrain mesh from height data
 */
function createVoxelTerrainMesh(
  scene: Scene,
  config: TerrainConfig,
  heightData: Float32Array
): Mesh {
  const { gridSize, cubeSize, cubeHeight, glitchChance } = config;
  const halfGrid = gridSize / 2;

  // Estimate vertex/index counts (will be exact after generation)
  // Each visible cube face has 4 vertices and 6 indices
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  let vertexCount = 0;

  // Pseudo-random for glitch effect
  const glitchSeed = config.seed ?? 12345;
  let glitchState = glitchSeed;
  const nextGlitch = (): number => {
    glitchState = (glitchState * 9301 + 49297) % 233280;
    return glitchState / 233280;
  };

  // Generate cubes
  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = z * gridSize + x;
      const height = heightData[idx];

      // World position (center of cube)
      const wx = (x - halfGrid) * cubeSize;
      const wz = (z - halfGrid) * cubeSize;

      // Cube dimensions
      const halfCube = cubeSize / 2;
      let cubeH = cubeHeight;

      // Apply glitch effect randomly
      const isGlitch = nextGlitch() < glitchChance;
      if (isGlitch) {
        cubeH *= 1.5 + nextGlitch() * 0.5;
      }

      // Base Y position
      const baseY = height;

      // Add cube faces
      // Top face (always visible)
      addFace(
        positions,
        normals,
        uvs,
        indices,
        vertexCount,
        // Vertices (counter-clockwise from above)
        wx - halfCube, baseY + cubeH, wz + halfCube,
        wx + halfCube, baseY + cubeH, wz + halfCube,
        wx + halfCube, baseY + cubeH, wz - halfCube,
        wx - halfCube, baseY + cubeH, wz - halfCube,
        // Normal (up)
        0, 1, 0
      );
      vertexCount += 4;

      // Check neighbors for side faces
      const heightLeft = x > 0 ? heightData[idx - 1] : -Infinity;
      const heightRight = x < gridSize - 1 ? heightData[idx + 1] : -Infinity;
      const heightFront = z > 0 ? heightData[idx - gridSize] : -Infinity;
      const heightBack = z < gridSize - 1 ? heightData[idx + gridSize] : -Infinity;

      // Front face (negative Z)
      if (heightFront < baseY + cubeH * 0.5) {
        addFace(
          positions,
          normals,
          uvs,
          indices,
          vertexCount,
          wx - halfCube, baseY, wz - halfCube,
          wx + halfCube, baseY, wz - halfCube,
          wx + halfCube, baseY + cubeH, wz - halfCube,
          wx - halfCube, baseY + cubeH, wz - halfCube,
          0, 0, -1
        );
        vertexCount += 4;
      }

      // Back face (positive Z)
      if (heightBack < baseY + cubeH * 0.5) {
        addFace(
          positions,
          normals,
          uvs,
          indices,
          vertexCount,
          wx + halfCube, baseY, wz + halfCube,
          wx - halfCube, baseY, wz + halfCube,
          wx - halfCube, baseY + cubeH, wz + halfCube,
          wx + halfCube, baseY + cubeH, wz + halfCube,
          0, 0, 1
        );
        vertexCount += 4;
      }

      // Left face (negative X)
      if (heightLeft < baseY + cubeH * 0.5) {
        addFace(
          positions,
          normals,
          uvs,
          indices,
          vertexCount,
          wx - halfCube, baseY, wz + halfCube,
          wx - halfCube, baseY, wz - halfCube,
          wx - halfCube, baseY + cubeH, wz - halfCube,
          wx - halfCube, baseY + cubeH, wz + halfCube,
          -1, 0, 0
        );
        vertexCount += 4;
      }

      // Right face (positive X)
      if (heightRight < baseY + cubeH * 0.5) {
        addFace(
          positions,
          normals,
          uvs,
          indices,
          vertexCount,
          wx + halfCube, baseY, wz - halfCube,
          wx + halfCube, baseY, wz + halfCube,
          wx + halfCube, baseY + cubeH, wz + halfCube,
          wx + halfCube, baseY + cubeH, wz - halfCube,
          1, 0, 0
        );
        vertexCount += 4;
      }
    }
  }

  // Create mesh from vertex data
  const mesh = new Mesh('terrain', scene);
  const vertexData = new VertexData();

  vertexData.positions = positions;
  vertexData.normals = normals;
  vertexData.uvs = uvs;
  vertexData.indices = indices;

  vertexData.applyToMesh(mesh);

  // Enable shadows
  mesh.receiveShadows = true;

  return mesh;
}

/**
 * Adds a quad face to the vertex arrays
 */
function addFace(
  positions: number[],
  normals: number[],
  uvs: number[],
  indices: number[],
  baseIndex: number,
  // Vertices
  x0: number, y0: number, z0: number,
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  x3: number, y3: number, z3: number,
  // Normal
  nx: number, ny: number, nz: number
): void {
  // Add positions
  positions.push(x0, y0, z0);
  positions.push(x1, y1, z1);
  positions.push(x2, y2, z2);
  positions.push(x3, y3, z3);

  // Add normals (same for all vertices of face)
  for (let i = 0; i < 4; i++) {
    normals.push(nx, ny, nz);
  }

  // Add UVs
  uvs.push(0, 0);
  uvs.push(1, 0);
  uvs.push(1, 1);
  uvs.push(0, 1);

  // Add indices (two triangles)
  indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
  indices.push(baseIndex, baseIndex + 2, baseIndex + 3);
}

/**
 * Creates a flat terrain for testing or low-detail mode
 *
 * @param scene - BabylonJS scene
 * @param size - Size of terrain in world units
 * @param subdivisions - Number of subdivisions
 * @returns TerrainResult with flat terrain
 */
export function createFlatTerrain(
  scene: Scene,
  size: number = 100,
  subdivisions: number = 1
): TerrainResult {
  const mesh = MeshBuilder.CreateGround(
    'flatTerrain',
    { width: size, height: size, subdivisions },
    scene
  );

  const material = new StandardMaterial('flatTerrainMat', scene);
  material.diffuseColor = new Color3(0.06, 0.06, 0.1);
  material.specularColor = new Color3(0, 0, 0);
  mesh.material = material;

  return {
    mesh,
    getHeightAt: () => 0,
    heightData: new Float32Array(1),
    isObstaclePosition: () => false,
    dispose: () => mesh.dispose(),
  };
}

/**
 * Updates terrain configuration (regenerates mesh)
 *
 * @param scene - BabylonJS scene
 * @param terrain - Existing terrain result
 * @param newConfig - New configuration values
 * @returns New TerrainResult (old mesh is disposed)
 */
export function updateTerrainConfig(
  scene: Scene,
  terrain: TerrainResult,
  newConfig: Partial<TerrainConfig>
): TerrainResult {
  terrain.dispose();
  return createTerrain(scene, newConfig);
}
