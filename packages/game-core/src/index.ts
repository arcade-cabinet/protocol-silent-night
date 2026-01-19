/**
 * @protocol-silent-night/game-core
 *
 * Shared game logic for Protocol: Silent Night
 * Platform-agnostic core that can be used by web (Three.js/R3F) and mobile (BabylonJS RN)
 */

export * from './constants';
export * from './data';
export * from './loaders';
// Export schemas with explicit re-exports to avoid conflicts with types
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
  EnemiesSchema,
  EnemyConfigSchema,
  EnemyTypeSchema,
  SpawnConfigSchema,
  type EnemiesData,
  type EnemyConfigValidated,
  type SpawnConfig,
  ObstacleConfigSchema,
  ObstacleTypeSchema,
  TerrainConfigSchema,
  TerrainSchema,
  type ObstacleConfig,
  type ObstacleType,
  type TerrainConfigValidated,
  type TerrainData,
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
} from './schemas';
export * from './store';
export * from './types';
export * from './utils';
