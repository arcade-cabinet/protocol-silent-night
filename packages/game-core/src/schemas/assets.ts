/**
 * Asset manifest schema - Zod validation for scalable content pipeline
 */
import { z } from 'zod';

/**
 * Model configuration schema
 */
export const ModelConfigSchema = z.object({
  type: z.enum(['glb', 'gltf', 'fbx']),
  path: z.string(),
  fallback: z.enum(['procedural', 'none']).optional(),
  scale: z.number().positive().default(1.0),
});

/**
 * Texture set schema
 */
export const TextureSetSchema = z.object({
  diffuse: z.string().optional(),
  normal: z.string().optional(),
  emissive: z.string().optional(),
  roughness: z.string().optional(),
  metallic: z.string().optional(),
  ao: z.string().optional(),
});

/**
 * Animation set schema
 */
export const AnimationSetSchema = z.object({
  idle: z.string().optional(),
  run: z.string().optional(),
  attack: z.string().optional(),
  death: z.string().optional(),
  special: z.string().optional(),
});

/**
 * Sound set schema
 */
export const SoundSetSchema = z.record(z.string(), z.string());

/**
 * Character asset schema
 */
export const CharacterAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: ModelConfigSchema,
  textures: TextureSetSchema.optional(),
  animations: AnimationSetSchema.optional(),
  sounds: SoundSetSchema.optional(),
  portrait: z.string().optional(),
});

/**
 * Enemy asset schema
 */
export const EnemyAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  model: ModelConfigSchema,
  variants: z.array(z.string()).optional(),
  phases: z.number().positive().optional(),
  sounds: SoundSetSchema.optional(),
});

/**
 * Projectile configuration schema
 */
export const ProjectileConfigSchema = z.object({
  type: z.enum(['single', 'spread', 'rapid', 'melee', 'beam', 'homing']),
  count: z.number().positive().optional(),
  color: z.string(),
  trail: z.boolean().optional(),
  aoe: z.boolean().optional(),
});

/**
 * Weapon asset schema
 */
export const WeaponAssetSchema = z.object({
  id: z.string(),
  model: z.string().nullable(),
  projectile: ProjectileConfigSchema,
  sounds: SoundSetSchema.optional(),
});

/**
 * Fog configuration schema
 */
export const FogConfigSchema = z.object({
  color: z.string(),
  density: z.number().min(0).max(1),
});

/**
 * Environment configuration schema
 */
export const EnvironmentConfigSchema = z.object({
  skybox: z.string().optional(),
  fog: FogConfigSchema.optional(),
  ambient: z.string().optional(),
});

/**
 * Terrain configuration schema
 */
export const TerrainConfigSchema = z.object({
  type: z.enum(['procedural', 'arena', 'static']),
  config: z.string(),
});

/**
 * Level asset schema
 */
export const LevelAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  terrain: TerrainConfigSchema,
  environment: EnvironmentConfigSchema,
  waves: z.number().min(0),
  boss: z.boolean(),
  music: z.string().optional(),
});

/**
 * UI sounds schema
 */
export const UISoundsSchema = z.object({
  click: z.string().optional(),
  hover: z.string().optional(),
  confirm: z.string().optional(),
  cancel: z.string().optional(),
  victory: z.string().optional(),
  defeat: z.string().optional(),
  level_complete: z.string().optional(),
});

/**
 * External source schema
 */
export const ExternalSourceSchema = z.object({
  base_path: z.string(),
  license: z.string(),
  categories: z.array(z.string()),
});

/**
 * Complete asset manifest schema
 */
export const AssetManifestSchema = z.object({
  $schema: z.string().optional(),
  version: z.string(),
  description: z.string().optional(),
  characters: z.record(z.string(), CharacterAssetSchema),
  enemies: z.record(z.string(), EnemyAssetSchema),
  weapons: z.record(z.string(), WeaponAssetSchema),
  levels: z.record(z.string(), LevelAssetSchema),
  ui: z.object({
    sounds: UISoundsSchema,
  }),
  external_sources: z.record(z.string(), ExternalSourceSchema).optional(),
});

/**
 * Type exports
 */
export type ModelConfig = z.infer<typeof ModelConfigSchema>;
export type TextureSet = z.infer<typeof TextureSetSchema>;
export type AnimationSet = z.infer<typeof AnimationSetSchema>;
export type SoundSet = z.infer<typeof SoundSetSchema>;
export type CharacterAsset = z.infer<typeof CharacterAssetSchema>;
export type EnemyAsset = z.infer<typeof EnemyAssetSchema>;
export type ProjectileConfig = z.infer<typeof ProjectileConfigSchema>;
export type WeaponAsset = z.infer<typeof WeaponAssetSchema>;
export type FogConfig = z.infer<typeof FogConfigSchema>;
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;
export type TerrainConfig = z.infer<typeof TerrainConfigSchema>;
export type LevelAsset = z.infer<typeof LevelAssetSchema>;
export type UISounds = z.infer<typeof UISoundsSchema>;
export type ExternalSource = z.infer<typeof ExternalSourceSchema>;
export type AssetManifest = z.infer<typeof AssetManifestSchema>;
