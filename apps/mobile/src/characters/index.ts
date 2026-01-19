/**
 * @fileoverview BabylonJS Procedural Character System
 * @module characters
 *
 * Protocol: Silent Night - Anime-style mech character generation
 *
 * This module provides a complete procedural character system that:
 * - Generates anime-style mech characters from DDL JSON configuration
 * - Creates meshes using BabylonJS primitives (no external assets required)
 * - Supports skeletal animation for walk, idle, and fire states
 * - Renders 2D anime faces using DynamicTexture
 * - Applies class-specific customizations (hats, weapons, etc.)
 *
 * @example
 * ```typescript
 * import { createAnimeHero } from '@/characters';
 * import { classes } from '@protocol-silent-night/game-core/data';
 *
 * const character = createAnimeHero({
 *   scene,
 *   config: classes.santa,
 *   position: { x: 0, y: 0, z: 0 }
 * });
 *
 * // In game loop
 * character.update(deltaTime, isMoving, isFiring);
 *
 * // Cleanup
 * character.dispose();
 * ```
 */

// Main character factory
export {
  createAnimeHero,
  getWeaponSpawnPoint,
  setCharacterFacing,
  setCharacterPosition,
  getCharacterPosition,
  type CreateAnimeHeroOptions,
} from './AnimeHero';

// Type definitions
export {
  type MeshPrimitiveType,
  type JointName,
  type CustomizationMaterial,
  type CharacterCustomization,
  type AnimeHeroProps,
  type AnimeHeroResult,
  type TorsoConfig,
  type LimbConfig,
  type FaceConfig,
  type AnimationState,
  type BoneDefinition,
  DEFAULT_BONE_HIERARCHY,
} from './CharacterTypes';

// Torso generation
export {
  createTorsoMesh,
  createSimpleTorsoMesh,
  createChestPlate,
  createBackMount,
  DEFAULT_TORSO_CONFIG,
} from './ProceduralTorso';

// Limb generation
export {
  createLimbSegment,
  createJointSphere,
  createArm,
  createLeg,
  createHand,
  DEFAULT_ARM_CONFIG,
  DEFAULT_LEG_CONFIG,
} from './ProceduralLimbs';

// Face rendering
export {
  createFaceTexture,
  createAnimeFaceHead,
  updateFaceExpression,
  DEFAULT_FACE_CONFIG,
  type FaceExpression,
} from './AnimeFace';

// Skeleton and rigging
export {
  createCharacterSkeleton,
  getJointWorldPosition,
  attachMeshToJoint,
  createIKChain,
  type SkeletonOptions,
  type SkeletonResult,
} from './CharacterSkeleton';

// Animation system
export {
  createAnimationController,
  createBobAnimation,
  applyProceduralWalkCycle,
  playWeaponRecoil,
  ANIMATION_CONFIGS,
  type AnimationConfig,
  type AnimationController,
} from './CharacterAnimations';

// Customization building
export {
  buildCustomizations,
  setMuzzleFlashIntensity,
  findCustomizationMesh,
  getWeaponGroup,
  type CustomizationResult,
} from './CustomizationBuilder';
