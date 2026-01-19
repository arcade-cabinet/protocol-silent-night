/**
 * @fileoverview Type definitions for procedural character system
 * @module characters/CharacterTypes
 *
 * These types define the structure for DDL-driven character customizations
 * that work with BabylonJS procedural mesh generation.
 */

import type { Scene, Mesh, Skeleton, TransformNode } from '@babylonjs/core';
import type { PlayerClassConfig } from '@protocol-silent-night/game-core';

/**
 * Supported mesh primitive types for customizations
 */
export type MeshPrimitiveType =
  | 'sphere'
  | 'box'
  | 'cone'
  | 'cylinder'
  | 'torus'
  | 'group'
  | 'scale'
  | 'pointLight';

/**
 * Joint attachment points on the character skeleton
 */
export type JointName =
  | 'root'
  | 'hips'
  | 'torso'
  | 'head'
  | 'armL'
  | 'armR'
  | 'legL'
  | 'legR'
  | 'handL'
  | 'handR'
  | 'footL'
  | 'footR';

/**
 * Material properties for customization meshes
 */
export interface CustomizationMaterial {
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
}

/**
 * Base customization properties shared by all types
 */
export interface BaseCustomization {
  joint: JointName;
  name?: string;
  type: MeshPrimitiveType;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

/**
 * Sphere customization (e.g., beard, pom-pom, eyes)
 */
export interface SphereCustomization extends BaseCustomization {
  type: 'sphere';
  args: [number, number, number]; // [diameter, segments, segments]
  material: CustomizationMaterial;
}

/**
 * Box customization (e.g., visor, buckle)
 */
export interface BoxCustomization extends BaseCustomization {
  type: 'box';
  args: [number, number, number]; // [width, height, depth]
  material: CustomizationMaterial;
}

/**
 * Cone customization (e.g., hat, ears, horns)
 */
export interface ConeCustomization extends BaseCustomization {
  type: 'cone';
  args: [number, number, number]; // [diameterBottom, height, tessellation]
  material: CustomizationMaterial;
}

/**
 * Cylinder customization (e.g., cannon barrel)
 */
export interface CylinderCustomization extends BaseCustomization {
  type: 'cylinder';
  args: [number, number, number, number]; // [diameterTop, diameterBottom, height, tessellation]
  material: CustomizationMaterial;
}

/**
 * Torus customization (e.g., belt, hat trim)
 */
export interface TorusCustomization extends BaseCustomization {
  type: 'torus';
  args: [number, number, number, number]; // [diameter, thickness, tessellation, radialSegments]
  material: CustomizationMaterial;
}

/**
 * Group customization - contains child meshes
 */
export interface GroupCustomization extends BaseCustomization {
  type: 'group';
  children: ChildCustomization[];
}

/**
 * Scale customization - modifies joint scale
 */
export interface ScaleCustomization extends Omit<BaseCustomization, 'name'> {
  type: 'scale';
}

/**
 * Point light customization (e.g., muzzle flash)
 */
export interface PointLightCustomization extends BaseCustomization {
  type: 'pointLight';
  args: [string, number, number]; // [color, intensity, range]
}

/**
 * Child customization within a group
 */
export type ChildCustomization =
  | Omit<SphereCustomization, 'joint'>
  | Omit<BoxCustomization, 'joint'>
  | Omit<ConeCustomization, 'joint'>
  | Omit<CylinderCustomization, 'joint'>
  | Omit<TorusCustomization, 'joint'>
  | PointLightChildCustomization;

/**
 * Point light as a child of a group
 */
export interface PointLightChildCustomization {
  name: string;
  type: 'pointLight';
  args: [string, number, number];
  position?: [number, number, number];
}

/**
 * Union of all customization types
 */
export type CharacterCustomization =
  | SphereCustomization
  | BoxCustomization
  | ConeCustomization
  | CylinderCustomization
  | TorusCustomization
  | GroupCustomization
  | ScaleCustomization
  | PointLightCustomization;

/**
 * Props for creating an anime hero character
 */
export interface AnimeHeroProps {
  scene: Scene;
  config: PlayerClassConfig;
  position: { x: number; y: number; z: number };
}

/**
 * Result of creating an anime hero
 */
export interface AnimeHeroResult {
  /** Root transform node containing all meshes */
  root: TransformNode;
  /** Main body mesh */
  mesh: Mesh;
  /** Animation skeleton */
  skeleton: Skeleton;
  /** Joint transform nodes for attaching customizations */
  joints: Map<JointName, TransformNode>;
  /** Update function called each frame */
  update: (deltaTime: number, isMoving: boolean, isFiring: boolean) => void;
  /** Dispose all resources */
  dispose: () => void;
}

/**
 * Configuration for torso generation
 */
export interface TorsoConfig {
  /** Base width at hips */
  hipWidth: number;
  /** Width at shoulder level */
  shoulderWidth: number;
  /** Total height of torso */
  height: number;
  /** Depth front to back */
  depth: number;
  /** Number of segments for smooth curves */
  segments: number;
  /** Scale modifier from class config */
  scale: number;
}

/**
 * Configuration for limb generation
 */
export interface LimbConfig {
  /** Upper segment length (arm/thigh) */
  upperLength: number;
  /** Lower segment length (forearm/shin) */
  lowerLength: number;
  /** Radius at joint */
  jointRadius: number;
  /** Radius at extremity */
  endRadius: number;
  /** Tube tessellation */
  tessellation: number;
  /** Scale modifier */
  scale: number;
}

/**
 * Configuration for anime face
 */
export interface FaceConfig {
  /** Texture resolution */
  textureSize: number;
  /** Eye style */
  eyeStyle: 'round' | 'angular' | 'visor';
  /** Primary eye color (hex) */
  eyeColor: string;
  /** Skin/face base color (hex) */
  baseColor: string;
  /** Whether to show mouth */
  showMouth: boolean;
}

/**
 * Animation state for characters
 */
export interface AnimationState {
  /** Current animation name */
  current: 'idle' | 'walk' | 'fire';
  /** Animation progress (0-1) */
  progress: number;
  /** Blend weight with previous animation */
  blendWeight: number;
  /** Previous animation for blending */
  previous: 'idle' | 'walk' | 'fire' | null;
}

/**
 * Bone hierarchy definition
 */
export interface BoneDefinition {
  name: JointName;
  parent: JointName | null;
  position: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Default bone hierarchy for humanoid characters
 */
export const DEFAULT_BONE_HIERARCHY: BoneDefinition[] = [
  { name: 'root', parent: null, position: [0, 0, 0] },
  { name: 'hips', parent: 'root', position: [0, 0.8, 0] },
  { name: 'torso', parent: 'hips', position: [0, 0.4, 0] },
  { name: 'head', parent: 'torso', position: [0, 0.5, 0] },
  { name: 'armL', parent: 'torso', position: [0.25, 0.4, 0] },
  { name: 'armR', parent: 'torso', position: [-0.25, 0.4, 0] },
  { name: 'handL', parent: 'armL', position: [0, -0.4, 0] },
  { name: 'handR', parent: 'armR', position: [0, -0.4, 0] },
  { name: 'legL', parent: 'hips', position: [0.12, 0, 0] },
  { name: 'legR', parent: 'hips', position: [-0.12, 0, 0] },
  { name: 'footL', parent: 'legL', position: [0, -0.5, 0] },
  { name: 'footR', parent: 'legR', position: [0, -0.5, 0] },
];
