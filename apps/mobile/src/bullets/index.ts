/**
 * Bullet System - BabylonJS projectile management for Protocol: Silent Night
 *
 * This module provides a complete bullet/projectile system optimized for
 * mobile performance in survivors-like gameplay.
 *
 * Features:
 * - SolidParticleSystem for instanced rendering (200+ bullets at 60fps)
 * - Spatial hash grid for efficient collision detection
 * - Multiple bullet types with unique visuals per weapon
 * - Object pooling to minimize garbage collection
 * - Glow effects for emissive projectiles
 *
 * Usage:
 * ```tsx
 * import { createBulletManager } from '@/src/bullets';
 *
 * // In your game scene setup
 * const bulletManager = createBulletManager(scene, {
 *   onBulletHit: (bulletId, enemyId, damage) => {
 *     // Apply damage to enemy
 *   },
 * });
 *
 * // In game loop
 * bulletManager.update(deltaTime);
 * bulletManager.checkCollisions(enemies);
 *
 * // Fire bullets
 * bulletManager.fire('cannon', playerPos, direction, weaponDamage);
 * bulletManager.fireSpread('star', playerPos, direction, damage, 3, 0.2);
 * ```
 *
 * @module bullets
 */

// Main manager
export {
  createBulletManager,
  type BulletManagerResult,
  type BulletConfig,
  type EnemyData,
  type BulletManagerEvents,
  type BulletManagerStats,
} from './BulletManager';

// SPS and instancing
export {
  createBulletSPS,
  BulletSPSManager,
  createBulletTrailSPS,
  type BulletInstance,
  type BulletSPSConfig,
  type BulletSPSResult,
} from './InstancedBullets';

// Collision detection
export {
  checkBulletEnemyCollision,
  checkBulletBossCollision,
  batchCheckCollisions,
  SpatialHashGrid,
  isWithinBounds,
  distanceSquared,
  distanceSquared2D,
  type BossHitbox,
  type CollisionEntity,
  type CollisionBullet,
  type CollisionResult,
} from './BulletCollision';

// Visual templates
export {
  createCannonBulletTemplate,
  createSmgBulletTemplate,
  createStarBulletTemplate,
  createSnowballBulletTemplate,
  createOrnamentBulletTemplate,
  createLightningBulletTemplate,
  createJingleBulletTemplate,
  createAllBulletTemplates,
  getVisualBulletType,
  getBulletRadius,
  BULLET_CONFIGS,
  BULLET_TEMPLATE_CREATORS,
  type BulletVisualConfig,
  type BulletTemplateCreator,
} from './BulletVisuals';
