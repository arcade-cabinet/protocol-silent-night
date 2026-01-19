/**
 * @fileoverview Zod schema exports for DDL validation
 * @module schemas
 *
 * Provides runtime validation schemas for all game data definition files.
 * Use these schemas to validate JSON data before using it in the game.
 */

// Class schemas
export {
  ClassesSchema,
  CustomizationSchema,
  FurOptionsSchema,
  GroupCustomizationSchema,
  JointMeshCustomizationSchema,
  MaterialSchema,
  MeshCustomizationSchema,
  PlayerClassConfigSchema,
  PlayerClassTypeSchema,
  PointLightSchema,
  ScaleCustomizationSchema,
  WeaponTypeSchema,
  type ClassesData,
  type Customization,
  type FurOptions,
  type Material,
  type PlayerClassConfigValidated,
} from './class.schema';

// Enemy schemas
export {
  EnemiesSchema,
  EnemyConfigSchema,
  EnemyTypeSchema,
  SpawnConfigSchema,
  type EnemiesData,
  type EnemyConfigValidated,
  type EnemyType,
  type SpawnConfig,
} from './enemy.schema';

// Terrain schemas
export {
  ObstacleConfigSchema,
  ObstacleTypeSchema,
  TerrainConfigSchema,
  TerrainSchema,
  type ObstacleConfig,
  type ObstacleType,
  type TerrainConfigValidated,
  type TerrainData,
} from './terrain.schema';

// Theme schemas
export {
  AmbientLightSchema,
  BloomConfigSchema,
  FogSchema,
  HemisphereLightSchema,
  LightingConfigSchema,
  MoonlightAnimationSchema,
  MoonlightSchema,
  Position3DSchema,
  PostProcessingConfigSchema,
  RimLightSchema,
  SkyConfigSchema,
  ThemeConfigSchema,
  ThemesSchema,
  VolumetricFogSchema,
  type LightingConfig,
  type Position3D,
  type PostProcessingConfig,
  type SkyConfig,
  type ThemeConfigValidated,
  type ThemesData,
} from './theme.schema';

// Weapon schemas
export {
  BulletTypeSchema,
  EvolutionModifiersSchema,
  WeaponBehaviorSchema,
  WeaponConfigSchema,
  WeaponEvolutionConfigSchema,
  WeaponEvolutionIdSchema,
  WeaponIdSchema,
  WeaponsSchema,
  type BulletType,
  type EvolutionModifiers,
  type WeaponBehavior,
  type WeaponConfigValidated,
  type WeaponEvolutionConfigValidated,
  type WeaponEvolutionId,
  type WeaponId,
  type WeaponsData,
} from './weapon.schema';
