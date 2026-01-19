/**
 * @fileoverview Zod schema for player class configurations
 * @module schemas/class
 *
 * Validates the structure of classes.json DDL file
 */

import { z } from 'zod';

/**
 * Material configuration for customization meshes
 */
export const MaterialSchema = z.object({
  color: z.string(),
  roughness: z.number().optional(),
  metalness: z.number().optional(),
  emissive: z.string().optional(),
  emissiveIntensity: z.number().optional(),
  transparent: z.boolean().optional(),
  opacity: z.number().optional(),
});

/**
 * Point light configuration (for muzzle flashes, etc.)
 */
export const PointLightSchema = z.object({
  name: z.string(),
  type: z.literal('pointLight'),
  args: z.tuple([z.string(), z.number(), z.number()]),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

/**
 * Mesh customization with geometry and material
 */
export const MeshCustomizationSchema = z.object({
  name: z.string(),
  type: z.enum(['sphere', 'cone', 'box', 'torus', 'cylinder']),
  args: z.array(z.number()),
  material: MaterialSchema.optional(),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  scale: z.tuple([z.number(), z.number(), z.number()]).optional(),
});

/**
 * Group customization containing child meshes or lights
 */
export const GroupCustomizationSchema = z.object({
  joint: z.string().optional(),
  name: z.string(),
  type: z.literal('group'),
  position: z.tuple([z.number(), z.number(), z.number()]).optional(),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  children: z.array(z.union([MeshCustomizationSchema, PointLightSchema])).optional(),
});

/**
 * Scale customization for joint adjustments
 */
export const ScaleCustomizationSchema = z.object({
  joint: z.string(),
  type: z.literal('scale'),
  scale: z.tuple([z.number(), z.number(), z.number()]),
});

/**
 * Joint-attached mesh customization
 */
export const JointMeshCustomizationSchema = MeshCustomizationSchema.extend({
  joint: z.string(),
});

/**
 * Union of all customization types
 */
export const CustomizationSchema = z.union([
  GroupCustomizationSchema,
  ScaleCustomizationSchema,
  JointMeshCustomizationSchema,
]);

/**
 * Fur rendering options for character visuals
 */
export const FurOptionsSchema = z.object({
  baseColor: z.string(),
  tipColor: z.string(),
  layerCount: z.number().int().positive(),
  spacing: z.number().positive(),
  windStrength: z.number(),
  gravityDroop: z.number().optional(),
});

/**
 * Player class type enum
 */
export const PlayerClassTypeSchema = z.enum(['santa', 'elf', 'bumble']);

/**
 * Weapon type enum
 */
export const WeaponTypeSchema = z.enum([
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
 * Single player class configuration
 */
export const PlayerClassConfigSchema = z.object({
  type: PlayerClassTypeSchema,
  name: z.string(),
  role: z.string(),
  hp: z.number().int().positive(),
  speed: z.number().positive(),
  rof: z.number().positive(),
  damage: z.number().positive(),
  color: z.string(),
  scale: z.number().positive(),
  weaponType: WeaponTypeSchema,
  furOptions: FurOptionsSchema,
  customizations: z.array(CustomizationSchema).optional(),
});

/**
 * Complete classes.json schema (record of class types to configs)
 */
export const ClassesSchema = z.record(PlayerClassTypeSchema, PlayerClassConfigSchema);

/** Inferred types from schemas */
export type Material = z.infer<typeof MaterialSchema>;
export type FurOptions = z.infer<typeof FurOptionsSchema>;
export type Customization = z.infer<typeof CustomizationSchema>;
export type PlayerClassConfigValidated = z.infer<typeof PlayerClassConfigSchema>;
export type ClassesData = z.infer<typeof ClassesSchema>;
