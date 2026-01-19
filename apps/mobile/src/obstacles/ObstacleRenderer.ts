/**
 * @fileoverview Obstacle instancing system using SolidParticleSystem
 * @module obstacles/ObstacleRenderer
 *
 * Efficiently renders large numbers of obstacles using BabylonJS
 * SolidParticleSystem for instanced rendering.
 */

import {
  type Scene,
  type Mesh,
  SolidParticleSystem,
  type SolidParticle,
  Color3,
  Color4,
  StandardMaterial,
} from '@babylonjs/core';

import { createCyberpunkTree, createSimpleCyberpunkTree } from './CyberpunkTree';
import { createCyberpunkPresent, createSimpleCyberpunkPresent } from './CyberpunkPresent';
import { createCyberpunkCandyCane, createSimpleCyberpunkCandyCane } from './CyberpunkCandyCane';
import { createCyberpunkPillar, createSimpleCyberpunkPillar } from './CyberpunkPillar';

/**
 * Obstacle types supported by the renderer
 */
export type ObstacleType = 'tree' | 'present' | 'candy_cane' | 'pillar';

/**
 * Configuration for a single obstacle instance
 */
export interface ObstacleConfig {
  /** Type of obstacle */
  type: ObstacleType;
  /** World position */
  position: { x: number; y: number; z: number };
  /** Scale factors */
  scale?: { x: number; y: number; z: number };
  /** Y-axis rotation in radians */
  rotation?: number;
  /** Color override (hex string) */
  color?: string;
  /** Collision radius */
  radius?: number;
  /** Height for collision detection */
  height?: number;
}

/**
 * Obstacle type configuration from terrain.json
 */
export interface ObstacleTypeConfig {
  type: ObstacleType;
  color: string;
  heightRange: [number, number];
  radius: number;
  scale: [number, number, number];
  yOffset: number;
}

/**
 * Result of creating an obstacle system
 */
export interface ObstacleSystemResult {
  /** Update function to call each frame (for animations) */
  update: (deltaTime: number) => void;
  /** Get all obstacles for collision detection */
  getObstacles: () => ObstacleConfig[];
  /** Check collision at position */
  checkCollision: (x: number, z: number, radius: number) => boolean;
  /** Add obstacles dynamically */
  addObstacles: (obstacles: ObstacleConfig[]) => void;
  /** Remove obstacle by index */
  removeObstacle: (index: number) => void;
  /** Dispose all resources */
  dispose: () => void;
}

/**
 * Configuration for the obstacle system
 */
export interface ObstacleSystemConfig {
  /** Use simplified meshes for better performance */
  useSimpleMeshes?: boolean;
  /** Enable per-frame updates for animations */
  enableAnimations?: boolean;
  /** Maximum number of each obstacle type */
  maxPerType?: number;
}

/**
 * Default system configuration
 */
const DEFAULT_SYSTEM_CONFIG: ObstacleSystemConfig = {
  useSimpleMeshes: false,
  enableAnimations: true,
  maxPerType: 500,
};

/**
 * Creates an obstacle rendering system using SolidParticleSystem
 *
 * Uses BabylonJS SPS for efficient instanced rendering of obstacles.
 * Supports multiple obstacle types with collision detection.
 *
 * @param scene - BabylonJS scene
 * @param obstacles - Array of obstacle configurations
 * @param config - System configuration
 * @returns ObstacleSystemResult with update and utility functions
 *
 * @example
 * ```typescript
 * const obstacles = [
 *   { type: 'tree', position: { x: 5, y: 0, z: 3 } },
 *   { type: 'present', position: { x: -2, y: 0, z: 7 }, color: '#ff0066' },
 * ];
 *
 * const system = createObstacleSystem(scene, obstacles);
 *
 * // In render loop
 * scene.onBeforeRenderObservable.add(() => {
 *   system.update(engine.getDeltaTime() / 1000);
 * });
 *
 * // Collision detection
 * if (system.checkCollision(player.x, player.z, 0.5)) {
 *   // Handle collision
 * }
 * ```
 */
export function createObstacleSystem(
  scene: Scene,
  obstacles: ObstacleConfig[],
  config: ObstacleSystemConfig = {}
): ObstacleSystemResult {
  const cfg = { ...DEFAULT_SYSTEM_CONFIG, ...config };

  // Group obstacles by type
  const obstaclesByType = groupObstaclesByType(obstacles);

  // Create SPS for each type
  const systems: Map<ObstacleType, {
    sps: SolidParticleSystem;
    mesh: Mesh;
    obstacles: ObstacleConfig[];
  }> = new Map();

  // Track all obstacles for collision
  let allObstacles: ObstacleConfig[] = [...obstacles];

  // Animation state
  let animationTime = 0;

  // Create template meshes and SPS for each type
  for (const [type, typeObstacles] of obstaclesByType.entries()) {
    if (typeObstacles.length === 0) continue;

    const templateMesh = createTemplateMesh(scene, type, cfg.useSimpleMeshes!);
    const sps = new SolidParticleSystem(`sps_${type}`, scene, { updatable: cfg.enableAnimations });

    // Add shapes to SPS
    sps.addShape(templateMesh, typeObstacles.length);

    // Build the SPS mesh
    const mesh = sps.buildMesh();

    // Apply material
    mesh.material = createObstacleMaterial(scene, type);

    // Initialize particle positions
    sps.initParticles = () => {
      typeObstacles.forEach((obstacle, i) => {
        const particle = sps.particles[i];
        setParticleFromConfig(particle, obstacle);
      });
    };

    sps.initParticles();
    sps.setParticles();

    // Dispose template (no longer needed after SPS is built)
    templateMesh.dispose();

    systems.set(type, { sps, mesh, obstacles: typeObstacles });
  }

  // Update function for animations
  const update = (deltaTime: number): void => {
    if (!cfg.enableAnimations) return;

    animationTime += deltaTime;

    // Update each SPS with animations
    for (const [type, system] of systems.entries()) {
      system.sps.updateParticle = (particle) => {
        // Subtle floating animation for presents
        if (type === 'present') {
          const originalY = system.obstacles[particle.idx]?.position.y ?? 0;
          particle.position.y = originalY + Math.sin(animationTime * 2 + particle.idx) * 0.1;
        }

        // Rotation animation for candy canes
        if (type === 'candy_cane') {
          particle.rotation.y += deltaTime * 0.5;
        }

        return particle;
      };

      system.sps.setParticles();
    }
  };

  // Get all obstacles
  const getObstacles = (): ObstacleConfig[] => {
    return allObstacles;
  };

  // Collision detection
  const checkCollision = (x: number, z: number, radius: number): boolean => {
    for (const obstacle of allObstacles) {
      const obsRadius = obstacle.radius ?? 1;
      const dx = x - obstacle.position.x;
      const dz = z - obstacle.position.z;
      const distSq = dx * dx + dz * dz;
      const minDist = radius + obsRadius;

      if (distSq < minDist * minDist) {
        return true;
      }
    }
    return false;
  };

  // Add obstacles dynamically
  const addObstacles = (newObstacles: ObstacleConfig[]): void => {
    // This is expensive - rebuilds SPS
    // For better performance, pre-allocate max particles
    allObstacles = [...allObstacles, ...newObstacles];

    // Rebuild affected systems
    const newByType = groupObstaclesByType(newObstacles);

    for (const [type, typeObstacles] of newByType.entries()) {
      const existing = systems.get(type);
      if (existing) {
        // Would need to rebuild SPS - expensive
        // For now, just track for collision
        existing.obstacles.push(...typeObstacles);
      }
    }
  };

  // Remove obstacle
  const removeObstacle = (index: number): void => {
    if (index >= 0 && index < allObstacles.length) {
      allObstacles.splice(index, 1);
      // Note: SPS mesh is not updated - would require rebuild
    }
  };

  // Dispose
  const dispose = (): void => {
    for (const system of systems.values()) {
      system.sps.dispose();
      system.mesh.dispose();
    }
    systems.clear();
    allObstacles = [];
  };

  return {
    update,
    getObstacles,
    checkCollision,
    addObstacles,
    removeObstacle,
    dispose,
  };
}

/**
 * Groups obstacles by their type
 */
function groupObstaclesByType(
  obstacles: ObstacleConfig[]
): Map<ObstacleType, ObstacleConfig[]> {
  const map = new Map<ObstacleType, ObstacleConfig[]>();

  for (const obstacle of obstacles) {
    const list = map.get(obstacle.type) ?? [];
    list.push(obstacle);
    map.set(obstacle.type, list);
  }

  return map;
}

/**
 * Creates a template mesh for a given obstacle type
 */
function createTemplateMesh(scene: Scene, type: ObstacleType, useSimple: boolean): Mesh {
  switch (type) {
    case 'tree':
      return useSimple
        ? createSimpleCyberpunkTree(scene)
        : createCyberpunkTree(scene);
    case 'present':
      return useSimple
        ? createSimpleCyberpunkPresent(scene)
        : createCyberpunkPresent(scene);
    case 'candy_cane':
      return useSimple
        ? createSimpleCyberpunkCandyCane(scene)
        : createCyberpunkCandyCane(scene);
    case 'pillar':
      return useSimple
        ? createSimpleCyberpunkPillar(scene)
        : createCyberpunkPillar(scene);
    default:
      // Default to a simple box
      return createSimpleCyberpunkPresent(scene);
  }
}

/**
 * Creates material for obstacle type
 */
function createObstacleMaterial(scene: Scene, type: ObstacleType): StandardMaterial {
  const mat = new StandardMaterial(`obstacleMat_${type}`, scene);

  switch (type) {
    case 'tree':
      mat.diffuseColor = new Color3(0, 0.67, 0.27);
      mat.emissiveColor = new Color3(0, 0.3, 0.13);
      break;
    case 'present':
      mat.diffuseColor = new Color3(1, 0, 0.27);
      mat.emissiveColor = new Color3(0.5, 0, 0.13);
      break;
    case 'candy_cane':
      mat.diffuseColor = new Color3(1, 0.27, 0.47);
      mat.emissiveColor = new Color3(0.5, 0.13, 0.23);
      break;
    case 'pillar':
      mat.diffuseColor = new Color3(0, 1, 0.8);
      mat.emissiveColor = new Color3(0, 0.5, 0.4);
      break;
  }

  mat.specularColor = new Color3(0.2, 0.2, 0.2);
  return mat;
}

/**
 * Sets particle properties from obstacle config
 */
function setParticleFromConfig(particle: SolidParticle, obstacle: ObstacleConfig): void {
  particle.position.set(
    obstacle.position.x,
    obstacle.position.y,
    obstacle.position.z
  );

  if (obstacle.scale) {
    particle.scaling.set(
      obstacle.scale.x,
      obstacle.scale.y,
      obstacle.scale.z
    );
  }

  if (obstacle.rotation !== undefined) {
    particle.rotation.y = obstacle.rotation;
  }

  // Color override (affects particle color in SPS)
  if (obstacle.color) {
    const color = hexToColor4(obstacle.color);
    particle.color = color;
  }
}

/**
 * Converts hex color to Color4
 */
function hexToColor4(hex: string): Color4 {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return new Color4(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
      1
    );
  }
  return new Color4(1, 1, 1, 1);
}

/**
 * Generates obstacles from terrain data
 *
 * @param terrainHeightFn - Function to get terrain height at position
 * @param terrainSize - Size of terrain in world units
 * @param obstacleTypes - Obstacle type configurations
 * @param density - Obstacle density (0-1)
 * @param seed - Random seed for deterministic generation
 * @returns Array of obstacle configurations
 */
export function generateObstaclesFromTerrain(
  terrainHeightFn: (x: number, z: number) => number,
  terrainSize: number,
  obstacleTypes: Record<string, ObstacleTypeConfig>,
  density: number = 0.1,
  seed: number = 12345
): ObstacleConfig[] {
  const obstacles: ObstacleConfig[] = [];
  const halfSize = terrainSize / 2;
  const spacing = 5; // Minimum spacing between obstacles

  // Seeded random
  let state = seed;
  const random = (): number => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };

  const typeKeys = Object.keys(obstacleTypes);

  for (let z = -halfSize; z < halfSize; z += spacing) {
    for (let x = -halfSize; x < halfSize; x += spacing) {
      // Random offset within cell
      const ox = x + (random() - 0.5) * spacing;
      const oz = z + (random() - 0.5) * spacing;

      // Check if obstacle should spawn
      if (random() > density) continue;

      // Get terrain height
      const height = terrainHeightFn(ox, oz);

      // Skip low areas
      if (height < 0) continue;

      // Select random obstacle type
      const typeKey = typeKeys[Math.floor(random() * typeKeys.length)];
      const typeConfig = obstacleTypes[typeKey];

      // Calculate obstacle height
      const [minH, maxH] = typeConfig.heightRange;
      const obstacleHeight = minH + random() * (maxH - minH);

      obstacles.push({
        type: typeConfig.type,
        position: {
          x: ox,
          y: height + typeConfig.yOffset,
          z: oz,
        },
        scale: {
          x: typeConfig.scale[0],
          y: typeConfig.scale[1] * (obstacleHeight / maxH),
          z: typeConfig.scale[2],
        },
        rotation: random() * Math.PI * 2,
        color: typeConfig.color,
        radius: typeConfig.radius,
        height: obstacleHeight,
      });
    }
  }

  return obstacles;
}

/**
 * Creates a simple collision grid for fast lookups
 */
export function createCollisionGrid(
  obstacles: ObstacleConfig[],
  cellSize: number = 10
): {
  checkCell: (x: number, z: number) => ObstacleConfig[];
} {
  const grid = new Map<string, ObstacleConfig[]>();

  // Build grid
  for (const obstacle of obstacles) {
    const cellX = Math.floor(obstacle.position.x / cellSize);
    const cellZ = Math.floor(obstacle.position.z / cellSize);
    const key = `${cellX},${cellZ}`;

    const cell = grid.get(key) ?? [];
    cell.push(obstacle);
    grid.set(key, cell);
  }

  return {
    checkCell: (x: number, z: number): ObstacleConfig[] => {
      const cellX = Math.floor(x / cellSize);
      const cellZ = Math.floor(z / cellSize);

      // Check current cell and neighbors
      const results: ObstacleConfig[] = [];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const key = `${cellX + dx},${cellZ + dz}`;
          const cell = grid.get(key);
          if (cell) {
            results.push(...cell);
          }
        }
      }

      return results;
    },
  };
}
