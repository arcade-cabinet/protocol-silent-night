/**
 * @fileoverview Zod schema for enemy configurations
 * @module schemas/enemy
 *
 * Validates the structure of enemies.json DDL file
 */

import { z } from 'zod';

/**
 * Enemy type enum
 */
export const EnemyTypeSchema = z.enum(['minion', 'boss']);

/**
 * Single enemy configuration
 */
export const EnemyConfigSchema = z.object({
  type: EnemyTypeSchema,
  hp: z.number().int().positive(),
  speed: z.number().positive(),
  damage: z.number().positive(),
  pointValue: z.number().int().nonnegative(),
});

/**
 * Spawn configuration for enemies
 */
export const SpawnConfigSchema = z.object({
  initialMinions: z.number().int().nonnegative(),
  minionSpawnRadiusMin: z.number().positive(),
  minionSpawnRadiusMax: z.number().positive(),
  damageCooldown: z.number().int().nonnegative(),
  knockbackForce: z.number(),
  hitRadiusMinion: z.number().positive(),
  hitRadiusBoss: z.number().positive(),
});

/**
 * Complete enemies.json schema
 */
export const EnemiesSchema = z.object({
  minion: EnemyConfigSchema,
  boss: EnemyConfigSchema,
  spawnConfig: SpawnConfigSchema,
});

/** Inferred types from schemas */
export type EnemyType = z.infer<typeof EnemyTypeSchema>;
export type EnemyConfigValidated = z.infer<typeof EnemyConfigSchema>;
export type SpawnConfig = z.infer<typeof SpawnConfigSchema>;
export type EnemiesData = z.infer<typeof EnemiesSchema>;
