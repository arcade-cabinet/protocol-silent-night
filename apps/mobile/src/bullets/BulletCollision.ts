/**
 * BulletCollision - Hit detection utilities for projectiles
 *
 * Provides fast collision detection between bullets and enemies/bosses.
 * Uses simple sphere-sphere and sphere-box checks optimized for mobile performance.
 *
 * All collision checks avoid allocating new Vector3 objects in hot paths
 * to minimize garbage collection pressure.
 */

import type { Vector3 } from '@babylonjs/core';

/**
 * Check sphere-sphere collision between a bullet and an enemy
 *
 * @param bulletPos - Center position of the bullet
 * @param bulletRadius - Collision radius of the bullet
 * @param enemyPos - Center position of the enemy
 * @param enemyRadius - Collision radius of the enemy
 * @returns true if collision detected
 */
export function checkBulletEnemyCollision(
  bulletPos: Vector3,
  bulletRadius: number,
  enemyPos: Vector3,
  enemyRadius: number
): boolean {
  // Calculate squared distance (avoids sqrt for performance)
  const dx = bulletPos.x - enemyPos.x;
  const dy = bulletPos.y - enemyPos.y;
  const dz = bulletPos.z - enemyPos.z;
  const distanceSquared = dx * dx + dy * dy + dz * dz;

  // Check against combined radii squared
  const combinedRadius = bulletRadius + enemyRadius;
  return distanceSquared <= combinedRadius * combinedRadius;
}

/**
 * Boss hitbox definition for AABB collision
 */
export interface BossHitbox {
  width: number;
  height: number;
  depth: number;
}

/**
 * Check sphere-AABB collision between a bullet and a boss
 *
 * Uses the closest point on the AABB to the sphere center technique
 * for accurate collision detection with larger boss hitboxes.
 *
 * @param bulletPos - Center position of the bullet
 * @param bulletRadius - Collision radius of the bullet
 * @param bossPos - Center position of the boss
 * @param bossHitbox - AABB dimensions of the boss hitbox
 * @returns true if collision detected
 */
export function checkBulletBossCollision(
  bulletPos: Vector3,
  bulletRadius: number,
  bossPos: Vector3,
  bossHitbox: BossHitbox
): boolean {
  // Calculate half-extents of the AABB
  const halfWidth = bossHitbox.width / 2;
  const halfHeight = bossHitbox.height / 2;
  const halfDepth = bossHitbox.depth / 2;

  // Find the closest point on the AABB to the sphere center
  const closestX = Math.max(
    bossPos.x - halfWidth,
    Math.min(bulletPos.x, bossPos.x + halfWidth)
  );
  const closestY = Math.max(
    bossPos.y - halfHeight,
    Math.min(bulletPos.y, bossPos.y + halfHeight)
  );
  const closestZ = Math.max(
    bossPos.z - halfDepth,
    Math.min(bulletPos.z, bossPos.z + halfDepth)
  );

  // Calculate squared distance from closest point to sphere center
  const dx = bulletPos.x - closestX;
  const dy = bulletPos.y - closestY;
  const dz = bulletPos.z - closestZ;
  const distanceSquared = dx * dx + dy * dy + dz * dz;

  // Check if within bullet radius
  return distanceSquared <= bulletRadius * bulletRadius;
}

/**
 * Entity definition for batch collision checking
 */
export interface CollisionEntity {
  id: string;
  position: Vector3;
  radius: number;
}

/**
 * Bullet definition for batch collision checking
 */
export interface CollisionBullet {
  id: string;
  position: Vector3;
  radius: number;
}

/**
 * Collision result returned from batch checking
 */
export interface CollisionResult {
  bulletId: string;
  enemyId: string;
}

/**
 * Batch check collisions between multiple bullets and enemies
 *
 * Optimized for checking many bullets against many enemies.
 * Uses early-exit when a bullet hits to avoid redundant checks.
 *
 * @param bullets - Array of bullets to check
 * @param enemies - Array of enemies to check against
 * @returns Array of collision results (bullet-enemy pairs that collided)
 */
export function batchCheckCollisions(
  bullets: CollisionBullet[],
  enemies: CollisionEntity[]
): CollisionResult[] {
  const results: CollisionResult[] = [];

  for (const bullet of bullets) {
    for (const enemy of enemies) {
      if (
        checkBulletEnemyCollision(
          bullet.position,
          bullet.radius,
          enemy.position,
          enemy.radius
        )
      ) {
        results.push({
          bulletId: bullet.id,
          enemyId: enemy.id,
        });
        // Bullet hit something - don't check more enemies for this bullet
        // (unless you want penetration, remove this break)
        break;
      }
    }
  }

  return results;
}

/**
 * Spatial hash cell for broadphase collision
 */
interface SpatialCell {
  bullets: CollisionBullet[];
  enemies: CollisionEntity[];
}

/**
 * Spatial hash grid for efficient broadphase collision detection
 *
 * Divides the world into a grid and only checks collisions
 * between objects in the same or adjacent cells.
 */
export class SpatialHashGrid {
  private cellSize: number;
  private cells: Map<string, SpatialCell>;

  constructor(cellSize: number = 10) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  /**
   * Get the cell key for a position
   */
  private getCellKey(x: number, z: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellZ = Math.floor(z / this.cellSize);
    return `${cellX},${cellZ}`;
  }

  /**
   * Get or create a cell
   */
  private getOrCreateCell(key: string): SpatialCell {
    let cell = this.cells.get(key);
    if (!cell) {
      cell = { bullets: [], enemies: [] };
      this.cells.set(key, cell);
    }
    return cell;
  }

  /**
   * Clear all cells for a new frame
   */
  clear(): void {
    this.cells.forEach((cell) => {
      cell.bullets.length = 0;
      cell.enemies.length = 0;
    });
  }

  /**
   * Insert a bullet into the grid
   */
  insertBullet(bullet: CollisionBullet): void {
    const key = this.getCellKey(bullet.position.x, bullet.position.z);
    const cell = this.getOrCreateCell(key);
    cell.bullets.push(bullet);
  }

  /**
   * Insert an enemy into the grid
   */
  insertEnemy(enemy: CollisionEntity): void {
    const key = this.getCellKey(enemy.position.x, enemy.position.z);
    const cell = this.getOrCreateCell(key);
    cell.enemies.push(enemy);
  }

  /**
   * Get adjacent cell keys (including diagonal)
   */
  private getAdjacentKeys(key: string): string[] {
    const [cellX, cellZ] = key.split(',').map(Number);
    const keys: string[] = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        keys.push(`${cellX + dx},${cellZ + dz}`);
      }
    }
    return keys;
  }

  /**
   * Check collisions using spatial hashing
   * Only checks bullets against enemies in the same or adjacent cells
   */
  checkCollisions(): CollisionResult[] {
    const results: CollisionResult[] = [];
    const checkedBullets = new Set<string>();

    this.cells.forEach((cell, key) => {
      if (cell.bullets.length === 0) return;

      // Get all enemies in this cell and adjacent cells
      const adjacentKeys = this.getAdjacentKeys(key);
      const nearbyEnemies: CollisionEntity[] = [];

      for (const adjKey of adjacentKeys) {
        const adjCell = this.cells.get(adjKey);
        if (adjCell && adjCell.enemies.length > 0) {
          nearbyEnemies.push(...adjCell.enemies);
        }
      }

      if (nearbyEnemies.length === 0) return;

      // Check each bullet in this cell against nearby enemies
      for (const bullet of cell.bullets) {
        if (checkedBullets.has(bullet.id)) continue;
        checkedBullets.add(bullet.id);

        for (const enemy of nearbyEnemies) {
          if (
            checkBulletEnemyCollision(
              bullet.position,
              bullet.radius,
              enemy.position,
              enemy.radius
            )
          ) {
            results.push({
              bulletId: bullet.id,
              enemyId: enemy.id,
            });
            break; // Bullet consumed
          }
        }
      }
    });

    return results;
  }
}

/**
 * Check if a point is within the playable area bounds
 *
 * @param position - Position to check
 * @param bounds - Half-size of the playable area
 * @returns true if within bounds
 */
export function isWithinBounds(
  position: Vector3,
  bounds: number = 50
): boolean {
  return (
    Math.abs(position.x) <= bounds &&
    Math.abs(position.z) <= bounds
  );
}

/**
 * Calculate distance squared between two points (no sqrt for performance)
 */
export function distanceSquared(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Calculate 2D distance squared (ignoring Y axis) for top-down games
 */
export function distanceSquared2D(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return dx * dx + dz * dz;
}
