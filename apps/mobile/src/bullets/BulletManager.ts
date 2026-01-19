/**
 * BulletManager - Main bullet orchestration system
 *
 * Manages the lifecycle of all bullets in the game:
 * - Firing new bullets from weapons
 * - Updating bullet positions each frame
 * - Collision detection with enemies
 * - Cleanup of expired bullets
 *
 * Uses object pooling and SPS for optimal mobile performance.
 * Target: 200+ active bullets at 60fps.
 */

import { Scene, Vector3 } from '@babylonjs/core';
import {
  BulletSPSManager,
  type BulletInstance,
} from './InstancedBullets';
import {
  SpatialHashGrid,
  type CollisionEntity,
  type CollisionResult,
  isWithinBounds,
} from './BulletCollision';
import { getBulletRadius, getVisualBulletType } from './BulletVisuals';

/**
 * Configuration for creating bullets
 */
export interface BulletConfig {
  type: string;
  speed: number;
  damage: number;
  life: number;
  scale?: number;
  penetration?: boolean;
}

/**
 * Enemy data for collision checking
 */
export interface EnemyData {
  id: string;
  position: Vector3;
  radius: number;
}

/**
 * Event callbacks for bullet system
 */
export interface BulletManagerEvents {
  onBulletHit?: (bulletId: string, enemyId: string, damage: number) => void;
  onBulletExpired?: (bulletId: string) => void;
}

/**
 * Statistics for debugging and optimization
 */
export interface BulletManagerStats {
  activeBullets: number;
  bulletsPerType: Record<string, number>;
  collisionsThisFrame: number;
  bulletsExpiredThisFrame: number;
}

/**
 * Result of creating a bullet manager
 */
export interface BulletManagerResult {
  /**
   * Fire a bullet from a position in a direction
   */
  fire: (
    type: string,
    origin: Vector3,
    direction: Vector3,
    damage: number,
    config?: Partial<BulletConfig>
  ) => string;

  /**
   * Fire multiple bullets (spread pattern)
   */
  fireSpread: (
    type: string,
    origin: Vector3,
    direction: Vector3,
    damage: number,
    count: number,
    spreadAngle: number,
    config?: Partial<BulletConfig>
  ) => string[];

  /**
   * Update all bullets - call once per frame
   */
  update: (deltaTime: number) => void;

  /**
   * Get all active bullets
   */
  getBullets: () => BulletInstance[];

  /**
   * Check collisions with enemies
   */
  checkCollisions: (enemies: EnemyData[]) => CollisionResult[];

  /**
   * Remove a specific bullet
   */
  removeBullet: (bulletId: string) => void;

  /**
   * Get statistics
   */
  getStats: () => BulletManagerStats;

  /**
   * Clean up resources
   */
  dispose: () => void;
}

/**
 * Default bullet configurations by weapon type
 */
const DEFAULT_BULLET_CONFIGS: Record<string, BulletConfig> = {
  cannon: {
    type: 'cannon',
    speed: 25,
    damage: 40,
    life: 3.0,
    scale: 1.0,
  },
  smg: {
    type: 'smg',
    speed: 45,
    damage: 8,
    life: 1.5,
    scale: 1.0,
  },
  star: {
    type: 'star',
    speed: 35,
    damage: 18,
    life: 2.5,
    scale: 1.0,
  },
  snowball: {
    type: 'snowball',
    speed: 30,
    damage: 25,
    life: 2.5,
    scale: 1.0,
  },
  ornament: {
    type: 'ornament',
    speed: 20,
    damage: 50,
    life: 2.0,
    scale: 1.2,
  },
  lightning: {
    type: 'lightning',
    speed: 40,
    damage: 30,
    life: 2.0,
    scale: 1.0,
  },
  jingle: {
    type: 'jingle',
    speed: 30,
    damage: 12,
    life: 1.5,
    scale: 0.8,
  },
};

/**
 * Generate a unique bullet ID
 */
let bulletIdCounter = 0;
function generateBulletId(): string {
  return `bullet_${++bulletIdCounter}`;
}

/**
 * Create the bullet manager system
 *
 * @param scene - BabylonJS scene
 * @param events - Optional event callbacks
 * @param maxBulletsPerType - Max bullets per visual type (default 100)
 * @returns Bullet manager interface
 */
export function createBulletManager(
  scene: Scene,
  events?: BulletManagerEvents,
  maxBulletsPerType: number = 100
): BulletManagerResult {
  // Active bullets map
  const bullets = new Map<string, BulletInstance>();

  // SPS manager for rendering
  const spsManager = new BulletSPSManager(scene, maxBulletsPerType);

  // Spatial hash for collision broadphase
  const spatialHash = new SpatialHashGrid(10);

  // Pre-warm common bullet types
  spsManager.warmUp(['cannon', 'smg', 'star']);

  // Stats tracking
  let collisionsThisFrame = 0;
  let bulletsExpiredThisFrame = 0;

  // Reusable vectors to avoid allocation
  const tempVelocity = new Vector3();

  /**
   * Fire a single bullet
   */
  const fire = (
    type: string,
    origin: Vector3,
    direction: Vector3,
    damage: number,
    config?: Partial<BulletConfig>
  ): string => {
    const id = generateBulletId();

    // Get base config for this bullet type
    const baseConfig = DEFAULT_BULLET_CONFIGS[type] || DEFAULT_BULLET_CONFIGS.cannon;

    // Merge with overrides
    const bulletConfig: BulletConfig = {
      ...baseConfig,
      ...config,
      type: getVisualBulletType(type),
      damage,
    };

    // Normalize direction and calculate velocity
    const normalizedDir = direction.normalize();
    const velocity = normalizedDir.scale(bulletConfig.speed);

    // Create bullet instance
    const bullet: BulletInstance = {
      id,
      type: bulletConfig.type,
      position: origin.clone(),
      velocity: velocity.clone(),
      damage: bulletConfig.damage,
      life: bulletConfig.life,
      maxLife: bulletConfig.life,
      scale: bulletConfig.scale,
    };

    bullets.set(id, bullet);

    // Ensure SPS exists for this type
    spsManager.getOrCreateSPS(bullet.type);

    return id;
  };

  /**
   * Fire multiple bullets in a spread pattern
   */
  const fireSpread = (
    type: string,
    origin: Vector3,
    direction: Vector3,
    damage: number,
    count: number,
    spreadAngle: number,
    config?: Partial<BulletConfig>
  ): string[] => {
    const ids: string[] = [];

    // Normalize base direction
    const baseDir = direction.normalize();

    // Calculate angle between each projectile
    const angleStep = spreadAngle / (count - 1);
    const startAngle = -spreadAngle / 2;

    for (let i = 0; i < count; i++) {
      // Calculate rotation angle for this bullet
      const angle = count === 1 ? 0 : startAngle + i * angleStep;

      // Rotate direction around Y axis
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const rotatedDir = new Vector3(
        baseDir.x * cos - baseDir.z * sin,
        baseDir.y,
        baseDir.x * sin + baseDir.z * cos
      );

      const id = fire(type, origin, rotatedDir, damage, config);
      ids.push(id);
    }

    return ids;
  };

  /**
   * Update all bullets each frame
   */
  const update = (deltaTime: number): void => {
    bulletsExpiredThisFrame = 0;
    const toRemove: string[] = [];

    // Update each bullet
    bullets.forEach((bullet, id) => {
      // Decrease life
      bullet.life -= deltaTime;

      // Check if expired
      if (bullet.life <= 0) {
        toRemove.push(id);
        bulletsExpiredThisFrame++;
        events?.onBulletExpired?.(id);
        return;
      }

      // Update position
      tempVelocity.copyFrom(bullet.velocity).scaleInPlace(deltaTime);
      bullet.position.addInPlace(tempVelocity);

      // Check bounds
      if (!isWithinBounds(bullet.position, 60)) {
        toRemove.push(id);
        bulletsExpiredThisFrame++;
        events?.onBulletExpired?.(id);
      }
    });

    // Remove expired bullets
    for (const id of toRemove) {
      bullets.delete(id);
    }

    // Update SPS rendering
    const bulletArray: BulletInstance[] = [];
    bullets.forEach((b) => bulletArray.push(b));
    spsManager.updateAll(bulletArray);
  };

  /**
   * Get all active bullets
   */
  const getBullets = (): BulletInstance[] => {
    const result: BulletInstance[] = [];
    bullets.forEach((b) => result.push(b));
    return result;
  };

  /**
   * Check collisions with enemies
   */
  const checkCollisions = (enemies: EnemyData[]): CollisionResult[] => {
    collisionsThisFrame = 0;

    // Clear spatial hash
    spatialHash.clear();

    // Insert bullets into spatial hash
    for (const bullet of bullets.values()) {
      spatialHash.insertBullet({
        id: bullet.id,
        position: bullet.position,
        radius: getBulletRadius(bullet.type),
      });
    }

    // Insert enemies into spatial hash
    for (const enemy of enemies) {
      spatialHash.insertEnemy({
        id: enemy.id,
        position: enemy.position,
        radius: enemy.radius,
      });
    }

    // Perform collision checks
    const results = spatialHash.checkCollisions();
    collisionsThisFrame = results.length;

    // Process collisions
    for (const result of results) {
      const bullet = bullets.get(result.bulletId);
      if (bullet) {
        // Notify of hit
        events?.onBulletHit?.(result.bulletId, result.enemyId, bullet.damage);

        // Remove bullet (unless it has penetration)
        const config = DEFAULT_BULLET_CONFIGS[bullet.type];
        if (!config?.penetration) {
          bullets.delete(result.bulletId);
        }
      }
    }

    return results;
  };

  /**
   * Remove a specific bullet
   */
  const removeBullet = (bulletId: string): void => {
    bullets.delete(bulletId);
  };

  /**
   * Get statistics
   */
  const getStats = (): BulletManagerStats => {
    const bulletsPerType: Record<string, number> = {};
    bullets.forEach((bullet) => {
      bulletsPerType[bullet.type] = (bulletsPerType[bullet.type] || 0) + 1;
    });

    return {
      activeBullets: bullets.size,
      bulletsPerType,
      collisionsThisFrame,
      bulletsExpiredThisFrame,
    };
  };

  /**
   * Clean up resources
   */
  const dispose = (): void => {
    bullets.clear();
    spsManager.dispose();
  };

  return {
    fire,
    fireSpread,
    update,
    getBullets,
    checkCollisions,
    removeBullet,
    getStats,
    dispose,
  };
}

/**
 * Hook for using bullet manager in React components
 *
 * Usage:
 * ```tsx
 * function GameScene() {
 *   const { scene } = useBabylon();
 *   const bulletManagerRef = useRef<BulletManagerResult | null>(null);
 *
 *   useEffect(() => {
 *     if (scene) {
 *       bulletManagerRef.current = createBulletManager(scene, {
 *         onBulletHit: (bulletId, enemyId, damage) => {
 *           // Handle hit
 *         },
 *       });
 *     }
 *     return () => bulletManagerRef.current?.dispose();
 *   }, [scene]);
 *
 *   // In game loop
 *   bulletManagerRef.current?.update(deltaTime);
 *   bulletManagerRef.current?.checkCollisions(enemies);
 * }
 * ```
 */
