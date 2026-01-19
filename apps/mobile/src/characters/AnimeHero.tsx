/**
 * @fileoverview Main character component factory for Protocol: Silent Night
 * @module characters/AnimeHero
 *
 * Creates complete anime-style mech characters from DDL configuration.
 * Assembles torso, limbs, face, skeleton, and customizations into a
 * fully animated character entity.
 */

import {
  Scene,
  Mesh,
  TransformNode,
  Vector3,
  Color3,
  StandardMaterial,
  PointLight,
} from '@babylonjs/core';
import type { PlayerClassConfig } from '@protocol-silent-night/game-core';
import type {
  AnimeHeroProps,
  AnimeHeroResult,
  JointName,
  FaceConfig,
} from './CharacterTypes';
import {
  createTorsoMesh,
  createSimpleTorsoMesh,
  DEFAULT_TORSO_CONFIG,
} from './ProceduralTorso';
import {
  createArm,
  createLeg,
  DEFAULT_ARM_CONFIG,
  DEFAULT_LEG_CONFIG,
} from './ProceduralLimbs';
import {
  createAnimeFaceHead,
  updateFaceExpression,
  DEFAULT_FACE_CONFIG,
  type FaceExpression,
} from './AnimeFace';
import {
  createCharacterSkeleton,
  attachMeshToJoint,
} from './CharacterSkeleton';
import { createAnimationController } from './CharacterAnimations';
import {
  buildCustomizations,
  getWeaponGroup,
  setMuzzleFlashIntensity,
} from './CustomizationBuilder';

/**
 * Options for character creation
 */
export interface CreateAnimeHeroOptions {
  /** Use simplified meshes for better performance */
  lowDetail?: boolean;
  /** Show skeleton debug visualization */
  debugSkeleton?: boolean;
  /** Initial face expression */
  expression?: FaceExpression;
}

/**
 * Default options
 */
const DEFAULT_OPTIONS: CreateAnimeHeroOptions = {
  lowDetail: false,
  debugSkeleton: false,
  expression: 'determined',
};

/**
 * Maps character class to face configuration
 */
function getFaceConfigForClass(config: PlayerClassConfig): Partial<FaceConfig> {
  switch (config.type) {
    case 'santa':
      return {
        eyeStyle: 'round',
        eyeColor: '#00ffff',
        baseColor: '#ffccaa',
        showMouth: true,
      };
    case 'elf':
      return {
        eyeStyle: 'visor',
        eyeColor: '#00ffcc',
        baseColor: '#222222',
        showMouth: false,
      };
    case 'bumble':
      return {
        eyeStyle: 'angular',
        eyeColor: '#ff4444',
        baseColor: '#dddddd',
        showMouth: true,
      };
    default:
      return DEFAULT_FACE_CONFIG;
  }
}

/**
 * Creates an anime hero character from DDL configuration
 *
 * @param props - Character creation props
 * @param options - Optional configuration
 * @returns Complete character with mesh, skeleton, and update function
 */
export function createAnimeHero(
  props: AnimeHeroProps,
  options: CreateAnimeHeroOptions = {}
): AnimeHeroResult {
  const { scene, config, position } = props;
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Character scale from config
  const scale = config.scale ?? 1.0;
  const color = config.color ?? '#3a3a4a';

  // Create skeleton and joint hierarchy
  const skeletonResult = createCharacterSkeleton(
    scene,
    config.type,
    {
      scale,
      debug: opts.debugSkeleton,
    }
  );

  const { joints, rootNode, skeleton } = skeletonResult;

  // Position the character
  rootNode.position = new Vector3(position.x, position.y, position.z);

  // Create torso
  const torsoConfig = {
    ...DEFAULT_TORSO_CONFIG,
    scale,
  };

  const torso = opts.lowDetail
    ? createSimpleTorsoMesh(scene, torsoConfig, color)
    : createTorsoMesh(scene, torsoConfig, color);

  attachMeshToJoint(torso, joints, 'torso');

  // Create head with anime face
  const faceConfig = getFaceConfigForClass(config);
  const headResult = createAnimeFaceHead(
    scene,
    faceConfig,
    0.2 * scale
  );

  attachMeshToJoint(headResult.mesh, joints, 'head');

  // Set initial expression
  if (opts.expression) {
    updateFaceExpression(scene, headResult.texture, faceConfig, opts.expression);
  }

  // Create hips mesh
  const hips = createHipsMesh(scene, scale, color);
  attachMeshToJoint(hips, joints, 'hips');

  // Create arms
  const armConfig = {
    ...DEFAULT_ARM_CONFIG,
    scale,
  };

  const leftArm = createArm(scene, armConfig, color, false);
  const rightArm = createArm(scene, armConfig, color, true);

  // Attach arms at shoulder level
  const armLJoint = joints.get('armL');
  const armRJoint = joints.get('armR');

  if (armLJoint) {
    leftArm.parent = armLJoint;
    leftArm.position = Vector3.Zero();
  }

  if (armRJoint) {
    rightArm.parent = armRJoint;
    rightArm.position = Vector3.Zero();
  }

  // Create legs
  const legConfig = {
    ...DEFAULT_LEG_CONFIG,
    scale,
  };

  const leftLeg = createLeg(scene, legConfig, color, false);
  const rightLeg = createLeg(scene, legConfig, color, true);

  // Attach legs at hip level
  const legLJoint = joints.get('legL');
  const legRJoint = joints.get('legR');

  if (legLJoint) {
    leftLeg.parent = legLJoint;
    leftLeg.position = Vector3.Zero();
  }

  if (legRJoint) {
    rightLeg.parent = legRJoint;
    rightLeg.position = Vector3.Zero();
  }

  // Build customizations from DDL
  let customizationResult: {
    meshes: Mesh[];
    lights: PointLight[];
    groups: TransformNode[];
    dispose: () => void;
  } = {
    meshes: [],
    lights: [],
    groups: [],
    dispose: () => {},
  };

  if (config.customizations && config.customizations.length > 0) {
    customizationResult = buildCustomizations(
      scene,
      config.customizations,
      joints,
      scale
    );
  }

  // Create animation controller
  const animController = createAnimationController(
    scene,
    joints,
    config.speed / 12 // Normalize speed (12 is baseline)
  );

  // Track firing state for muzzle flash
  let isFiringActive = false;
  let muzzleFlashTimer = 0;

  /**
   * Update function called each frame
   */
  const update = (
    deltaTime: number,
    isMoving: boolean,
    isFiring: boolean
  ): void => {
    // Update animations
    animController.update(deltaTime, isMoving, isFiring);

    // Handle muzzle flash
    if (isFiring && !isFiringActive) {
      isFiringActive = true;
      muzzleFlashTimer = 0.1; // Flash duration

      // Turn on muzzle flash
      setMuzzleFlashIntensity(
        customizationResult.lights,
        'muzzle_flash',
        2.0
      );
    }

    if (isFiringActive) {
      muzzleFlashTimer -= deltaTime;
      if (muzzleFlashTimer <= 0) {
        isFiringActive = false;
        setMuzzleFlashIntensity(
          customizationResult.lights,
          'muzzle_flash',
          0
        );
      }
    }

    // Update face expression based on state
    if (isFiring) {
      updateFaceExpression(scene, headResult.texture, faceConfig, 'determined');
    } else if (isMoving) {
      updateFaceExpression(scene, headResult.texture, faceConfig, 'neutral');
    }
  };

  /**
   * Dispose all character resources
   */
  const dispose = (): void => {
    // Dispose meshes
    torso.dispose();
    hips.dispose();
    headResult.mesh.dispose();
    headResult.texture.dispose();
    headResult.material.dispose();

    // Dispose limbs
    leftArm.dispose();
    rightArm.dispose();
    leftLeg.dispose();
    rightLeg.dispose();

    // Dispose customizations
    customizationResult.dispose();

    // Dispose animations
    animController.dispose();

    // Dispose skeleton
    skeletonResult.dispose();
  };

  // Return the complete character
  return {
    root: rootNode,
    mesh: torso,
    skeleton,
    joints,
    update,
    dispose,
  };
}

/**
 * Creates hips mesh to connect torso and legs
 */
function createHipsMesh(
  scene: Scene,
  scale: number,
  color: string
): Mesh {
  const { MeshBuilder } = require('@babylonjs/core');

  const hips = MeshBuilder.CreateBox(
    'hips',
    {
      width: 0.3 * scale,
      height: 0.15 * scale,
      depth: 0.2 * scale,
    },
    scene
  );

  const material = new StandardMaterial('hipsMat', scene);
  material.diffuseColor = Color3.FromHexString(color).scale(0.9);
  material.specularColor = new Color3(0.3, 0.3, 0.35);
  hips.material = material;

  return hips;
}

/**
 * Gets the weapon spawn point for projectiles
 *
 * @param result - AnimeHeroResult
 * @returns World position for projectile spawn
 */
export function getWeaponSpawnPoint(result: AnimeHeroResult): Vector3 {
  // Try to find weapon group in arm
  const armR = result.joints.get('armR');
  if (armR) {
    // Get world position offset forward from arm
    const pos = armR.getAbsolutePosition();
    const forward = armR.forward.scale(0.5);
    return pos.add(forward);
  }

  // Fallback to character position
  return result.root.position.clone();
}

/**
 * Sets character facing direction
 *
 * @param result - AnimeHeroResult
 * @param direction - Direction vector (will be normalized)
 */
export function setCharacterFacing(
  result: AnimeHeroResult,
  direction: Vector3
): void {
  if (direction.length() < 0.001) return;

  const normalized = direction.normalize();
  const angle = Math.atan2(normalized.x, normalized.z);
  result.root.rotation.y = angle;
}

/**
 * Sets character position
 *
 * @param result - AnimeHeroResult
 * @param position - New position
 */
export function setCharacterPosition(
  result: AnimeHeroResult,
  position: Vector3
): void {
  result.root.position = position;
}

/**
 * Gets character current position
 *
 * @param result - AnimeHeroResult
 * @returns Current world position
 */
export function getCharacterPosition(result: AnimeHeroResult): Vector3 {
  return result.root.position.clone();
}

// Re-export types for convenience
export type { AnimeHeroProps, AnimeHeroResult, FaceExpression };
