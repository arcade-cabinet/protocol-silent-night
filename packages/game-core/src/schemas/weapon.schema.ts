/**
 * @fileoverview Zod schema for weapon configurations
 * @module schemas/weapon
 *
 * Validates the structure of weapons.json DDL file
 */

import { z } from 'zod';

/**
 * Bullet visual type enum
 */
export const BulletTypeSchema = z.enum(['cannon', 'smg', 'star']);

/**
 * Weapon behavior type enum
 */
export const WeaponBehaviorSchema = z.enum([
  'freeze',
  'melee',
  'aoe',
  'chain',
  'turret',
  'spread',
  'random',
]);

/**
 * Weapon ID enum (all available weapons)
 */
export const WeaponIdSchema = z.enum([
  'cannon',
  'smg',
  'star',
  'snowball',
  'candy_cane',
  'ornament',
  'light_string',
  'gingerbread',
  'jingle_bell',
  'quantum_gift',
  'harpoon',
]);

/**
 * Single weapon configuration
 */
export const WeaponConfigSchema = z.object({
  id: WeaponIdSchema,
  name: z.string(),
  description: z.string(),
  cost: z.number().int().nonnegative(),
  icon: z.string(),
  damage: z.number().positive(),
  rof: z.number().positive(),
  speed: z.number().nonnegative(),
  life: z.number().positive(),
  bulletType: BulletTypeSchema,
  behavior: WeaponBehaviorSchema.optional(),
  projectileCount: z.number().int().positive().optional(),
  spreadAngle: z.number().positive().optional(),
  penetration: z.boolean().optional(),
});

/**
 * Weapon evolution ID enum
 */
export const WeaponEvolutionIdSchema = z.enum([
  'mega-coal-mortar',
  'plasma-storm',
  'supernova-burst',
  'blizzard-cannon',
  'peppermint-tornado',
  'winter-solstice-spear',
  'holiday-supernova',
  'tesla-tinsel',
  'frosted-fortress',
  'cathedral-chimes',
  'ultimate-present',
]);

/**
 * Evolution modifiers
 */
export const EvolutionModifiersSchema = z.object({
  damageMultiplier: z.number().positive().optional(),
  rofMultiplier: z.number().positive().optional(),
  speedMultiplier: z.number().positive().optional(),
  projectileCount: z.number().int().positive().optional(),
  spreadAngle: z.number().positive().optional(),
  size: z.number().positive().optional(),
  penetration: z.boolean().optional(),
  explosive: z.boolean().optional(),
  hasShield: z.boolean().optional(),
});

/**
 * Weapon evolution configuration
 */
export const WeaponEvolutionConfigSchema = z.object({
  id: WeaponEvolutionIdSchema,
  name: z.string(),
  baseWeapon: WeaponIdSchema,
  minLevel: z.number().int().positive(),
  modifiers: EvolutionModifiersSchema,
});

/**
 * Complete weapons.json schema
 */
export const WeaponsSchema = z.object({
  weapons: z.record(z.string(), WeaponConfigSchema),
  evolutions: z.record(z.string(), WeaponEvolutionConfigSchema),
});

/** Inferred types from schemas */
export type BulletType = z.infer<typeof BulletTypeSchema>;
export type WeaponBehavior = z.infer<typeof WeaponBehaviorSchema>;
export type WeaponId = z.infer<typeof WeaponIdSchema>;
export type WeaponConfigValidated = z.infer<typeof WeaponConfigSchema>;
export type WeaponEvolutionId = z.infer<typeof WeaponEvolutionIdSchema>;
export type EvolutionModifiers = z.infer<typeof EvolutionModifiersSchema>;
export type WeaponEvolutionConfigValidated = z.infer<typeof WeaponEvolutionConfigSchema>;
export type WeaponsData = z.infer<typeof WeaponsSchema>;
