/**
 * EnemyManager - Main enemy orchestration system
 *
 * Manages spawning, updating, and destruction of all enemies.
 * Coordinates between minion SPS and boss mesh systems.
 */

import { Scene, Vector3 } from '@babylonjs/core';

import {
  calculateEnemyMovement,
  calculateSeparation,
  calculateBossMovement,
  determineBossPhase,
  checkCollisionSimple,
  getSpawnPosition,
  batchUpdatePositions,
} from './EnemyAI';
import { createMinionSPS, type MinionSPSResult } from './InstancedMinions';
import { createBossMesh, type BossMeshResult } from './BossMesh';

/**
 * Enemy instance data structure
 * Used for both minions (in SPS) and boss
 */
export interface EnemyInstance {
  /** Unique identifier */
  id: string;
  /** Enemy type from enemies.json */
  type: 'minion' | 'boss';
  /** World position */
  position: { x: number; y: number; z: number };
  /** Current velocity */
  velocity: { x: number; y: number; z: number };
  /** Current health points */
  hp: number;
  /** Maximum health points */
  maxHp: number;
  /** Base movement speed */
  speed: number;
  /** Damage dealt on contact */
  damage: number;
  /** Points awarded when killed */
  pointValue: number;
  /** Whether this enemy is active */
  isActive: boolean;
  /** Timer for damage cooldown (milliseconds) */
  lastDamageTime: number;
  /** Boss-specific: current AI phase */
  phase?: 'chase' | 'barrage';
  /** Boss-specific: time in current phase */
  phaseTime?: number;
}

/**
 * Enemy configuration from enemies.json
 */
export interface EnemyConfig {
  minion: {
    type: 'minion';
    hp: number;
    speed: number;
    damage: number;
    pointValue: number;
  };
  boss: {
    type: 'boss';
    hp: number;
    speed: number;
    damage: number;
    pointValue: number;
  };
  spawnConfig: {
    initialMinions: number;
    minionSpawnRadiusMin: number;
    minionSpawnRadiusMax: number;
    damageCooldown: number;
    knockbackForce: number;
    hitRadiusMinion: number;
    hitRadiusBoss: number;
  };
}

/**
 * Result from creating the enemy manager
 */
export interface EnemyManagerResult {
  /** Spawn a new enemy at position (returns enemy ID) */
  spawn: (type: 'minion' | 'boss', position: Vector3) => string;
  /** Spawn multiple minions around a center point */
  spawnWave: (count: number, centerPosition: Vector3) => string[];
  /** Update all enemies (call every frame) */
  update: (deltaTime: number, playerPosition: Vector3) => EnemyUpdateResult;
  /** Deal damage to an enemy (returns true if killed) */
  damage: (id: string, amount: number) => boolean;
  /** Get all active enemies */
  getEnemies: () => EnemyInstance[];
  /** Get a specific enemy by ID */
  getEnemy: (id: string) => EnemyInstance | undefined;
  /** Get the boss instance (if spawned) */
  getBoss: () => EnemyInstance | undefined;
  /** Check if any enemy is colliding with position */
  checkCollisions: (
    position: Vector3,
    radius: number
  ) => { enemy: EnemyInstance; damage: number } | null;
  /** Get total enemy count */
  getCount: () => { minions: number; boss: boolean; total: number };
  /** Dispose all resources */
  dispose: () => void;
}

/**
 * Result from update() call
 */
export interface EnemyUpdateResult {
  /** IDs of enemies that died this frame */
  killed: string[];
  /** Total points from kills */
  pointsEarned: number;
  /** Number of active enemies */
  activeCount: number;
}

/**
 * Create the enemy manager system
 *
 * @param scene - BabylonJS scene
 * @param config - Enemy configuration from enemies.json
 * @returns EnemyManagerResult with control functions
 */
export function createEnemyManager(
  scene: Scene,
  config: EnemyConfig
): EnemyManagerResult {
  // Enemy storage
  const enemies = new Map<string, EnemyInstance>();
  let nextEnemyId = 0;
  let bossId: string | null = null;

  // Create subsystems
  const minionSPS: MinionSPSResult = createMinionSPS(scene, {
    maxCount: 150,
  });

  let bossMesh: BossMeshResult | null = null;

  // Helper to generate unique ID
  const generateId = (): string => {
    return `enemy_${nextEnemyId++}`;
  };

  /**
   * Spawn a new enemy
   */
  const spawn = (type: 'minion' | 'boss', position: Vector3): string => {
    const id = generateId();
    const baseConfig = type === 'minion' ? config.minion : config.boss;

    const enemy: EnemyInstance = {
      id,
      type,
      position: { x: position.x, y: position.y, z: position.z },
      velocity: { x: 0, y: 0, z: 0 },
      hp: baseConfig.hp,
      maxHp: baseConfig.hp,
      speed: baseConfig.speed,
      damage: baseConfig.damage,
      pointValue: baseConfig.pointValue,
      isActive: true,
      lastDamageTime: 0,
    };

    if (type === 'boss') {
      enemy.phase = 'chase';
      enemy.phaseTime = 0;

      // Create boss mesh
      bossMesh = createBossMesh(scene);
      bossMesh.setPosition(position);
      bossId = id;
    }

    enemies.set(id, enemy);
    return id;
  };

  /**
   * Spawn a wave of minions around a center point
   */
  const spawnWave = (count: number, centerPosition: Vector3): string[] => {
    const ids: string[] = [];
    const { minionSpawnRadiusMin, minionSpawnRadiusMax } = config.spawnConfig;

    for (let i = 0; i < count; i++) {
      const spawnPos = getSpawnPosition(
        centerPosition,
        minionSpawnRadiusMin,
        minionSpawnRadiusMax
      );
      ids.push(spawn('minion', spawnPos));
    }

    return ids;
  };

  /**
   * Update all enemies
   */
  const update = (
    deltaTime: number,
    playerPosition: Vector3
  ): EnemyUpdateResult => {
    const result: EnemyUpdateResult = {
      killed: [],
      pointsEarned: 0,
      activeCount: 0,
    };

    const activeEnemies: EnemyInstance[] = [];

    // Collect active enemies and update velocities
    for (const enemy of enemies.values()) {
      if (!enemy.isActive) continue;

      activeEnemies.push(enemy);
      result.activeCount++;

      if (enemy.type === 'minion') {
        // Calculate minion movement
        const newVelocity = calculateEnemyMovement(
          enemy,
          playerPosition,
          deltaTime
        );

        // Add separation to avoid clumping
        const separation = calculateSeparation(enemy, activeEnemies);
        newVelocity.addInPlace(separation);

        enemy.velocity.x = newVelocity.x;
        enemy.velocity.y = newVelocity.y;
        enemy.velocity.z = newVelocity.z;
      } else if (enemy.type === 'boss' && bossMesh) {
        // Update boss phase
        enemy.phaseTime = (enemy.phaseTime || 0) + deltaTime;
        const newPhase = determineBossPhase(
          enemy.hp,
          enemy.maxHp,
          enemy.phase || 'chase',
          enemy.phaseTime
        );

        if (newPhase !== enemy.phase) {
          enemy.phase = newPhase;
          enemy.phaseTime = 0;

          // Trigger animations on phase change
          if (newPhase === 'barrage') {
            bossMesh.playBarrageAnimation();
          }
        }

        // Calculate boss movement
        const bossVelocity = calculateBossMovement(
          enemy,
          playerPosition,
          deltaTime,
          enemy.phase || 'chase'
        );

        enemy.velocity.x = bossVelocity.x;
        enemy.velocity.y = bossVelocity.y;
        enemy.velocity.z = bossVelocity.z;

        // Update rage mode
        const hpPercent = enemy.hp / enemy.maxHp;
        bossMesh.setRageMode(hpPercent < 0.25);
        bossMesh.setHealthPercent(hpPercent);
      }
    }

    // Batch update positions
    batchUpdatePositions(activeEnemies, deltaTime);

    // Update visual systems
    minionSPS.updateParticles(activeEnemies);

    // Update boss mesh position
    if (bossMesh && bossId) {
      const boss = enemies.get(bossId);
      if (boss && boss.isActive) {
        bossMesh.setPosition(
          new Vector3(boss.position.x, boss.position.y, boss.position.z)
        );

        // Face the player
        const dx = playerPosition.x - boss.position.x;
        const dz = playerPosition.z - boss.position.z;
        bossMesh.setRotation(Math.atan2(dx, dz));
      }
    }

    return result;
  };

  /**
   * Deal damage to an enemy
   */
  const damage = (id: string, amount: number): boolean => {
    const enemy = enemies.get(id);
    if (!enemy || !enemy.isActive) return false;

    enemy.hp -= amount;

    // Flash effect for boss
    if (enemy.type === 'boss' && bossMesh) {
      bossMesh.playDamageFlash();
    }

    // Check for death
    if (enemy.hp <= 0) {
      enemy.isActive = false;

      if (enemy.type === 'boss' && bossMesh) {
        bossMesh.dispose();
        bossMesh = null;
        bossId = null;
      }

      return true;
    }

    return false;
  };

  /**
   * Get all active enemies
   */
  const getEnemies = (): EnemyInstance[] => {
    return Array.from(enemies.values()).filter((e) => e.isActive);
  };

  /**
   * Get a specific enemy
   */
  const getEnemy = (id: string): EnemyInstance | undefined => {
    return enemies.get(id);
  };

  /**
   * Get the boss instance
   */
  const getBoss = (): EnemyInstance | undefined => {
    if (!bossId) return undefined;
    return enemies.get(bossId);
  };

  /**
   * Check for collisions with enemies
   */
  const checkCollisions = (
    position: Vector3,
    radius: number
  ): { enemy: EnemyInstance; damage: number } | null => {
    const now = Date.now();
    const playerPos = { x: position.x, y: position.y, z: position.z };

    for (const enemy of enemies.values()) {
      if (!enemy.isActive) continue;

      // Check cooldown
      if (now - enemy.lastDamageTime < config.spawnConfig.damageCooldown) {
        continue;
      }

      const hitRadius =
        enemy.type === 'boss'
          ? config.spawnConfig.hitRadiusBoss
          : config.spawnConfig.hitRadiusMinion;

      const totalRadius = radius + hitRadius;

      if (checkCollisionSimple(enemy.position, playerPos, totalRadius)) {
        enemy.lastDamageTime = now;
        return { enemy, damage: enemy.damage };
      }
    }

    return null;
  };

  /**
   * Get enemy counts
   */
  const getCount = (): { minions: number; boss: boolean; total: number } => {
    let minions = 0;
    let boss = false;

    for (const enemy of enemies.values()) {
      if (!enemy.isActive) continue;
      if (enemy.type === 'minion') minions++;
      if (enemy.type === 'boss') boss = true;
    }

    return {
      minions,
      boss,
      total: minions + (boss ? 1 : 0),
    };
  };

  /**
   * Dispose all resources
   */
  const dispose = () => {
    enemies.clear();
    minionSPS.dispose();

    if (bossMesh) {
      bossMesh.dispose();
      bossMesh = null;
    }

    bossId = null;
  };

  return {
    spawn,
    spawnWave,
    update,
    damage,
    getEnemies,
    getEnemy,
    getBoss,
    checkCollisions,
    getCount,
    dispose,
  };
}

/**
 * React hook for using the enemy manager in a component
 * (Simplified version - full implementation would use useEffect for cleanup)
 */
export function useEnemyManager(
  scene: Scene | null,
  config: EnemyConfig
): EnemyManagerResult | null {
  if (!scene) return null;
  return createEnemyManager(scene, config);
}
