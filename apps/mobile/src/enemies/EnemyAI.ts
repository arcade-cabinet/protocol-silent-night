/**
 * EnemyAI - Movement and targeting logic for enemies
 *
 * Handles enemy pathfinding, player tracking, and collision detection.
 * Optimized for mobile performance with simple but effective AI.
 */

import { Vector3 } from '@babylonjs/core';

import type { EnemyInstance } from './EnemyManager';

/**
 * Configuration for enemy movement behavior
 */
export interface EnemyMovementConfig {
  /** Base movement speed multiplier */
  speedMultiplier: number;
  /** How quickly enemies accelerate toward target */
  acceleration: number;
  /** Maximum turn rate in radians per second */
  maxTurnRate: number;
  /** Separation distance from other enemies */
  separationRadius: number;
  /** Strength of separation force */
  separationStrength: number;
}

const DEFAULT_MOVEMENT_CONFIG: EnemyMovementConfig = {
  speedMultiplier: 1.0,
  acceleration: 0.8,
  maxTurnRate: Math.PI * 2,
  separationRadius: 2.0,
  separationStrength: 0.5,
};

/**
 * Calculate the desired velocity for an enemy moving toward the player
 *
 * @param enemy - The enemy instance to calculate movement for
 * @param playerPosition - Current player world position
 * @param deltaTime - Time elapsed since last frame in seconds
 * @param config - Optional movement configuration overrides
 * @returns New velocity vector for the enemy
 */
export function calculateEnemyMovement(
  enemy: EnemyInstance,
  playerPosition: Vector3,
  deltaTime: number,
  config: Partial<EnemyMovementConfig> = {}
): Vector3 {
  const cfg = { ...DEFAULT_MOVEMENT_CONFIG, ...config };

  // Get current enemy position as Vector3
  const enemyPos = new Vector3(
    enemy.position.x,
    enemy.position.y,
    enemy.position.z
  );

  // Calculate direction to player
  const toPlayer = playerPosition.subtract(enemyPos);
  const distanceToPlayer = toPlayer.length();

  // Avoid division by zero
  if (distanceToPlayer < 0.001) {
    return new Vector3(0, 0, 0);
  }

  // Normalize direction
  const desiredDirection = toPlayer.normalize();

  // Calculate desired velocity based on enemy speed and config
  const speed = enemy.speed * cfg.speedMultiplier;
  const desiredVelocity = desiredDirection.scale(speed);

  // Current velocity as Vector3
  const currentVelocity = new Vector3(
    enemy.velocity.x,
    enemy.velocity.y,
    enemy.velocity.z
  );

  // Smoothly interpolate toward desired velocity (steering behavior)
  const steering = desiredVelocity.subtract(currentVelocity);
  const maxSteeringForce = cfg.acceleration * deltaTime * speed;

  // Limit steering force
  if (steering.length() > maxSteeringForce) {
    steering.normalize().scaleInPlace(maxSteeringForce);
  }

  // Apply steering to current velocity
  const newVelocity = currentVelocity.add(steering);

  // Clamp to maximum speed
  if (newVelocity.length() > speed) {
    newVelocity.normalize().scaleInPlace(speed);
  }

  return newVelocity;
}

/**
 * Calculate separation force to prevent enemy overlap
 *
 * @param enemy - The enemy to calculate separation for
 * @param otherEnemies - All other enemies in the scene
 * @param config - Movement configuration
 * @returns Separation force vector
 */
export function calculateSeparation(
  enemy: EnemyInstance,
  otherEnemies: EnemyInstance[],
  config: Partial<EnemyMovementConfig> = {}
): Vector3 {
  const cfg = { ...DEFAULT_MOVEMENT_CONFIG, ...config };
  const separation = new Vector3(0, 0, 0);
  let neighborCount = 0;

  const enemyPos = new Vector3(
    enemy.position.x,
    enemy.position.y,
    enemy.position.z
  );

  for (const other of otherEnemies) {
    if (other.id === enemy.id || !other.isActive) continue;

    const otherPos = new Vector3(
      other.position.x,
      other.position.y,
      other.position.z
    );

    const distance = Vector3.Distance(enemyPos, otherPos);

    if (distance < cfg.separationRadius && distance > 0.001) {
      // Calculate repulsion vector (away from neighbor)
      const repulsion = enemyPos.subtract(otherPos).normalize();
      // Weight by inverse distance (closer = stronger)
      repulsion.scaleInPlace((cfg.separationRadius - distance) / cfg.separationRadius);
      separation.addInPlace(repulsion);
      neighborCount++;
    }
  }

  if (neighborCount > 0) {
    separation.scaleInPlace(cfg.separationStrength / neighborCount);
  }

  return separation;
}

/**
 * Check if an enemy is colliding with the player
 *
 * @param enemyPosition - World position of the enemy
 * @param playerPosition - World position of the player
 * @param radius - Collision radius to check
 * @returns True if collision detected
 */
export function checkPlayerCollision(
  enemyPosition: Vector3,
  playerPosition: Vector3,
  radius: number
): boolean {
  // Use XZ plane distance for top-down collision (ignore Y axis)
  const dx = enemyPosition.x - playerPosition.x;
  const dz = enemyPosition.z - playerPosition.z;
  const distanceSquared = dx * dx + dz * dz;

  return distanceSquared <= radius * radius;
}

/**
 * Check collision using simple position objects (for performance)
 *
 * @param enemyPos - Enemy position with x, y, z properties
 * @param playerPos - Player position with x, y, z properties
 * @param radius - Collision radius
 * @returns True if collision detected
 */
export function checkCollisionSimple(
  enemyPos: { x: number; y: number; z: number },
  playerPos: { x: number; y: number; z: number },
  radius: number
): boolean {
  const dx = enemyPos.x - playerPos.x;
  const dz = enemyPos.z - playerPos.z;
  return dx * dx + dz * dz <= radius * radius;
}

/**
 * Calculate boss-specific movement with attack patterns
 *
 * @param boss - The boss enemy instance
 * @param playerPosition - Current player position
 * @param deltaTime - Time elapsed since last frame
 * @param phase - Current boss phase ('chase' or 'barrage')
 * @returns New velocity for the boss
 */
export function calculateBossMovement(
  boss: EnemyInstance,
  playerPosition: Vector3,
  _deltaTime: number,
  phase: 'chase' | 'barrage'
): Vector3 {
  const bossPos = new Vector3(
    boss.position.x,
    boss.position.y,
    boss.position.z
  );

  const toPlayer = playerPosition.subtract(bossPos);
  const distance = toPlayer.length();

  if (phase === 'barrage') {
    // During barrage phase, boss moves slower and tries to maintain distance
    const optimalDistance = 15;

    if (distance < optimalDistance) {
      // Move away from player
      const awayDirection = toPlayer.normalize().scale(-1);
      return awayDirection.scale(boss.speed * 0.5);
    } else if (distance > optimalDistance + 5) {
      // Move toward player slowly
      const towardDirection = toPlayer.normalize();
      return towardDirection.scale(boss.speed * 0.3);
    }

    // At optimal distance, strafe around player
    const strafeDirection = new Vector3(-toPlayer.z, 0, toPlayer.x).normalize();
    return strafeDirection.scale(boss.speed * 0.4);
  }

  // Chase phase - aggressive movement toward player
  if (distance < 0.001) {
    return new Vector3(0, 0, 0);
  }

  const direction = toPlayer.normalize();
  return direction.scale(boss.speed);
}

/**
 * Determine if boss should switch phases based on game state
 *
 * @param bossHp - Current boss HP
 * @param maxHp - Maximum boss HP
 * @param currentPhase - Current movement phase
 * @param timeSincePhaseChange - Time in current phase (seconds)
 * @returns Recommended phase
 */
export function determineBossPhase(
  bossHp: number,
  maxHp: number,
  currentPhase: 'chase' | 'barrage',
  timeSincePhaseChange: number
): 'chase' | 'barrage' {
  const hpPercent = bossHp / maxHp;

  // Below 50% HP, switch phases more frequently
  const phaseChangeDuration = hpPercent < 0.5 ? 5 : 8;

  // Force barrage phase at certain HP thresholds
  if (hpPercent < 0.75 && hpPercent > 0.7) return 'barrage';
  if (hpPercent < 0.5 && hpPercent > 0.45) return 'barrage';
  if (hpPercent < 0.25 && hpPercent > 0.2) return 'barrage';

  // Time-based phase switching
  if (timeSincePhaseChange > phaseChangeDuration) {
    return currentPhase === 'chase' ? 'barrage' : 'chase';
  }

  return currentPhase;
}

/**
 * Get a random spawn position around the player at specified radius
 *
 * @param playerPosition - Center position to spawn around
 * @param minRadius - Minimum spawn distance from player
 * @param maxRadius - Maximum spawn distance from player
 * @returns Spawn position vector
 */
export function getSpawnPosition(
  playerPosition: Vector3,
  minRadius: number,
  maxRadius: number
): Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const radius = minRadius + Math.random() * (maxRadius - minRadius);

  return new Vector3(
    playerPosition.x + Math.cos(angle) * radius,
    0, // Spawn on ground
    playerPosition.z + Math.sin(angle) * radius
  );
}

/**
 * Batch update enemy positions for performance
 * Modifies enemies in place to avoid allocations
 *
 * @param enemies - Array of enemy instances to update
 * @param deltaTime - Time elapsed since last frame
 */
export function batchUpdatePositions(
  enemies: EnemyInstance[],
  deltaTime: number
): void {
  for (const enemy of enemies) {
    if (!enemy.isActive) continue;

    enemy.position.x += enemy.velocity.x * deltaTime;
    enemy.position.y += enemy.velocity.y * deltaTime;
    enemy.position.z += enemy.velocity.z * deltaTime;
  }
}
