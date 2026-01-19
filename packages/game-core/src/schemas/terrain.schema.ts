/**
 * @fileoverview Zod schema for terrain configurations
 * @module schemas/terrain
 *
 * Validates the structure of terrain.json DDL file
 */

import { z } from 'zod';

/**
 * Terrain generation parameters
 */
export const TerrainConfigSchema = z.object({
  gridSize: z.number().int().positive(),
  cubeSize: z.number().positive(),
  cubeHeight: z.number().positive(),
  noiseScale: z.number().positive(),
  detailNoiseScale: z.number().positive(),
  heightMultiplier: z.number().positive(),
  detailHeightMultiplier: z.number().positive(),
  baseElevation: z.number(),
  glitchChance: z.number().min(0).max(1),
  obstacleThreshold: z.number().min(0).max(1),
});

/**
 * Obstacle type enum
 */
export const ObstacleTypeSchema = z.enum(['present', 'tree', 'candy_cane', 'pillar']);

/**
 * Single obstacle configuration
 */
export const ObstacleConfigSchema = z.object({
  type: ObstacleTypeSchema,
  color: z.string(),
  heightRange: z.tuple([z.number().positive(), z.number().positive()]),
  radius: z.number().positive(),
  scale: z.tuple([z.number(), z.number(), z.number()]),
  yOffset: z.number(),
});

/**
 * Complete terrain.json schema
 */
export const TerrainSchema = z.object({
  terrain: TerrainConfigSchema,
  obstacles: z.record(z.string(), ObstacleConfigSchema),
});

/** Inferred types from schemas */
export type ObstacleType = z.infer<typeof ObstacleTypeSchema>;
export type TerrainConfigValidated = z.infer<typeof TerrainConfigSchema>;
export type ObstacleConfig = z.infer<typeof ObstacleConfigSchema>;
export type TerrainData = z.infer<typeof TerrainSchema>;
