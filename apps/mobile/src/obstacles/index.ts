/**
 * @fileoverview Obstacle system exports
 * @module obstacles
 *
 * Christmas-themed cyberpunk obstacles for Protocol: Silent Night.
 * Uses BabylonJS SolidParticleSystem for efficient instanced rendering.
 */

// Obstacle meshes
export {
  createCyberpunkTree,
  createSimpleCyberpunkTree,
  type CyberpunkTreeConfig,
} from './CyberpunkTree';

export {
  createCyberpunkPresent,
  createSimpleCyberpunkPresent,
  type CyberpunkPresentConfig,
} from './CyberpunkPresent';

export {
  createCyberpunkCandyCane,
  createSimpleCyberpunkCandyCane,
  createCustomStripeCandyCane,
  type CyberpunkCandyCaneConfig,
} from './CyberpunkCandyCane';

export {
  createCyberpunkPillar,
  createSimpleCyberpunkPillar,
  createGlitchedPillar,
  type CyberpunkPillarConfig,
} from './CyberpunkPillar';

// Obstacle rendering system
export {
  createObstacleSystem,
  generateObstaclesFromTerrain,
  createCollisionGrid,
  type ObstacleType,
  type ObstacleConfig,
  type ObstacleTypeConfig,
  type ObstacleSystemResult,
  type ObstacleSystemConfig,
} from './ObstacleRenderer';
