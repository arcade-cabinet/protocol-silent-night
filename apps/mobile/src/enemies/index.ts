/**
 * Enemy System - BabylonJS enemy and combat implementation
 *
 * Provides high-performance enemy management for a survivors-like game.
 * Uses SolidParticleSystem for 100+ minions at 60fps on mobile.
 *
 * @module enemies
 *
 * @example
 * ```typescript
 * import { createEnemyManager, type EnemyConfig } from '@/enemies';
 *
 * // Load config from JSON
 * const config: EnemyConfig = await loadEnemiesJson();
 *
 * // Create manager
 * const manager = createEnemyManager(scene, config);
 *
 * // Spawn initial wave
 * manager.spawnWave(5, playerPosition);
 *
 * // In game loop
 * const result = manager.update(deltaTime, playerPosition);
 *
 * // Check for player damage
 * const collision = manager.checkCollisions(playerPosition, playerRadius);
 * if (collision) {
 *   player.takeDamage(collision.damage);
 * }
 *
 * // Cleanup
 * manager.dispose();
 * ```
 */

// Main manager
export {
  createEnemyManager,
  useEnemyManager,
  type EnemyInstance,
  type EnemyConfig,
  type EnemyManagerResult,
  type EnemyUpdateResult,
} from './EnemyManager';

// Instanced minion rendering
export {
  createMinionSPS,
  createSimpleMinionSPS,
  type MinionSPSConfig,
  type MinionSPSResult,
} from './InstancedMinions';

// Boss mesh and animations
export {
  createBossMesh,
  type BossConfig,
  type BossMeshResult,
} from './BossMesh';

// AI and movement
export {
  calculateEnemyMovement,
  calculateSeparation,
  calculateBossMovement,
  determineBossPhase,
  checkPlayerCollision,
  checkCollisionSimple,
  getSpawnPosition,
  batchUpdatePositions,
  type EnemyMovementConfig,
} from './EnemyAI';
