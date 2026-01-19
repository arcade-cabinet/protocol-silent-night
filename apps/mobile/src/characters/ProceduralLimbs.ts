/**
 * @fileoverview Procedural limb mesh generation using BabylonJS
 * @module characters/ProceduralLimbs
 *
 * Creates arms and legs using tube meshes with curved paths.
 * Supports segmented limbs with joints for animation.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
  TransformNode,
  Path3D,
} from '@babylonjs/core';
import type { LimbConfig } from './CharacterTypes';

/**
 * Default arm configuration
 */
export const DEFAULT_ARM_CONFIG: LimbConfig = {
  upperLength: 0.3,
  lowerLength: 0.25,
  jointRadius: 0.06,
  endRadius: 0.04,
  tessellation: 8,
  scale: 1.0,
};

/**
 * Default leg configuration
 */
export const DEFAULT_LEG_CONFIG: LimbConfig = {
  upperLength: 0.35,
  lowerLength: 0.35,
  jointRadius: 0.08,
  endRadius: 0.06,
  tessellation: 8,
  scale: 1.0,
};

/**
 * Generates a curved path for natural limb shape
 * Adds slight bend at the joint for more organic look
 */
function generateLimbPath(
  length: number,
  segments: number = 6,
  bendAmount: number = 0.02,
  isLower: boolean = false
): Vector3[] {
  const points: Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = -t * length; // Limbs extend downward

    // Add subtle curve for natural look
    // Upper limbs bend slightly outward, lower bend forward
    let xOffset = 0;
    let zOffset = 0;

    if (!isLower) {
      // Upper segment - slight outward curve
      xOffset = Math.sin(t * Math.PI) * bendAmount;
    } else {
      // Lower segment - slight forward curve
      zOffset = Math.sin(t * Math.PI) * bendAmount * 0.5;
    }

    points.push(new Vector3(xOffset, y, zOffset));
  }

  return points;
}

/**
 * Radius function for limb tubes
 * Creates tapered limbs from joint to end
 */
function limbRadiusFunction(
  jointRadius: number,
  endRadius: number
): (i: number, distance: number) => number {
  return (i: number, distance: number): number => {
    // Simple linear interpolation
    const t = distance;
    return jointRadius + (endRadius - jointRadius) * t;
  };
}

/**
 * Creates a single limb segment (upper or lower)
 *
 * @param scene - BabylonJS scene
 * @param name - Mesh name
 * @param config - Limb configuration
 * @param isLower - Whether this is a lower segment (forearm/shin)
 * @param color - Limb color
 * @returns The generated limb mesh
 */
export function createLimbSegment(
  scene: Scene,
  name: string,
  length: number,
  jointRadius: number,
  endRadius: number,
  tessellation: number = 8,
  isLower: boolean = false,
  color: string = '#3a3a4a'
): Mesh {
  // Generate the path
  const path = generateLimbPath(length, 6, 0.015, isLower);

  // Create the tube mesh with varying radius
  const limb = MeshBuilder.CreateTube(
    name,
    {
      path,
      radiusFunction: (i: number, _distance: number) => {
        const t = i / (path.length - 1);
        return jointRadius + (endRadius - jointRadius) * t;
      },
      tessellation,
      sideOrientation: Mesh.DOUBLESIDE,
      cap: Mesh.CAP_ALL,
      updatable: false,
    },
    scene
  );

  // Create material
  const material = new StandardMaterial(`${name}Mat`, scene);
  const c3 = Color3.FromHexString(color);
  material.diffuseColor = c3;
  material.specularColor = new Color3(0.3, 0.3, 0.35);
  material.specularPower = 32;
  limb.material = material;

  return limb;
}

/**
 * Creates a joint sphere (elbow, knee, etc.)
 *
 * @param scene - BabylonJS scene
 * @param name - Mesh name
 * @param radius - Joint radius
 * @param color - Joint color
 * @returns The generated joint mesh
 */
export function createJointSphere(
  scene: Scene,
  name: string,
  radius: number,
  color: string = '#4a4a5a'
): Mesh {
  const joint = MeshBuilder.CreateSphere(
    name,
    {
      diameter: radius * 2,
      segments: 8,
    },
    scene
  );

  const material = new StandardMaterial(`${name}Mat`, scene);
  const c3 = Color3.FromHexString(color);
  material.diffuseColor = c3;
  material.specularColor = new Color3(0.4, 0.4, 0.45);
  material.specularPower = 48;
  joint.material = material;

  return joint;
}

/**
 * Creates a complete arm (shoulder, upper, elbow, lower, wrist)
 *
 * @param scene - BabylonJS scene
 * @param config - Arm configuration
 * @param color - Primary arm color
 * @param isRight - Whether this is the right arm (affects position)
 * @returns Transform node containing all arm parts
 */
export function createArm(
  scene: Scene,
  config: Partial<LimbConfig> = {},
  color: string = '#3a3a4a',
  isRight: boolean = true
): TransformNode {
  const fullConfig: LimbConfig = { ...DEFAULT_ARM_CONFIG, ...config };
  const {
    upperLength,
    lowerLength,
    jointRadius,
    endRadius,
    tessellation,
    scale,
  } = fullConfig;

  // Create arm root transform
  const armRoot = new TransformNode(isRight ? 'armR' : 'armL', scene);

  // Shoulder joint
  const shoulder = createJointSphere(
    scene,
    `${isRight ? 'shoulderR' : 'shoulderL'}`,
    jointRadius * 1.2,
    color
  );
  shoulder.parent = armRoot;

  // Upper arm
  const upperArm = createLimbSegment(
    scene,
    `${isRight ? 'upperArmR' : 'upperArmL'}`,
    upperLength,
    jointRadius,
    jointRadius * 0.8,
    tessellation,
    false,
    color
  );
  upperArm.parent = armRoot;
  upperArm.position.y = -jointRadius * 0.5;

  // Elbow joint
  const elbowJoint = new TransformNode(
    isRight ? 'elbowJointR' : 'elbowJointL',
    scene
  );
  elbowJoint.parent = armRoot;
  elbowJoint.position.y = -upperLength - jointRadius * 0.5;

  const elbow = createJointSphere(
    scene,
    `${isRight ? 'elbowR' : 'elbowL'}`,
    jointRadius * 0.9,
    color
  );
  elbow.parent = elbowJoint;

  // Lower arm (forearm)
  const lowerArm = createLimbSegment(
    scene,
    `${isRight ? 'forearmR' : 'forearmL'}`,
    lowerLength,
    jointRadius * 0.8,
    endRadius,
    tessellation,
    true,
    color
  );
  lowerArm.parent = elbowJoint;

  // Wrist/Hand joint
  const handJoint = new TransformNode(isRight ? 'handR' : 'handL', scene);
  handJoint.parent = elbowJoint;
  handJoint.position.y = -lowerLength;

  const wrist = createJointSphere(
    scene,
    `${isRight ? 'wristR' : 'wristL'}`,
    endRadius * 1.2,
    color
  );
  wrist.parent = handJoint;

  // Apply scale
  armRoot.scaling.setAll(scale);

  return armRoot;
}

/**
 * Creates a complete leg (hip, thigh, knee, shin, ankle)
 *
 * @param scene - BabylonJS scene
 * @param config - Leg configuration
 * @param color - Primary leg color
 * @param isRight - Whether this is the right leg
 * @returns Transform node containing all leg parts
 */
export function createLeg(
  scene: Scene,
  config: Partial<LimbConfig> = {},
  color: string = '#3a3a4a',
  isRight: boolean = true
): TransformNode {
  const fullConfig: LimbConfig = { ...DEFAULT_LEG_CONFIG, ...config };
  const {
    upperLength,
    lowerLength,
    jointRadius,
    endRadius,
    tessellation,
    scale,
  } = fullConfig;

  // Create leg root transform
  const legRoot = new TransformNode(isRight ? 'legR' : 'legL', scene);

  // Hip joint
  const hip = createJointSphere(
    scene,
    `${isRight ? 'hipR' : 'hipL'}`,
    jointRadius * 1.1,
    color
  );
  hip.parent = legRoot;

  // Upper leg (thigh)
  const thigh = createLimbSegment(
    scene,
    `${isRight ? 'thighR' : 'thighL'}`,
    upperLength,
    jointRadius,
    jointRadius * 0.85,
    tessellation,
    false,
    color
  );
  thigh.parent = legRoot;
  thigh.position.y = -jointRadius * 0.5;

  // Knee joint
  const kneeJoint = new TransformNode(
    isRight ? 'kneeJointR' : 'kneeJointL',
    scene
  );
  kneeJoint.parent = legRoot;
  kneeJoint.position.y = -upperLength - jointRadius * 0.5;

  const knee = createJointSphere(
    scene,
    `${isRight ? 'kneeR' : 'kneeL'}`,
    jointRadius * 0.95,
    color
  );
  knee.parent = kneeJoint;

  // Lower leg (shin)
  const shin = createLimbSegment(
    scene,
    `${isRight ? 'shinR' : 'shinL'}`,
    lowerLength,
    jointRadius * 0.85,
    endRadius,
    tessellation,
    true,
    color
  );
  shin.parent = kneeJoint;

  // Ankle/Foot joint
  const footJoint = new TransformNode(isRight ? 'footR' : 'footL', scene);
  footJoint.parent = kneeJoint;
  footJoint.position.y = -lowerLength;

  // Foot (simple box for now)
  const foot = MeshBuilder.CreateBox(
    `${isRight ? 'footMeshR' : 'footMeshL'}`,
    {
      width: endRadius * 2.5,
      height: endRadius * 1.5,
      depth: endRadius * 4,
    },
    scene
  );
  foot.parent = footJoint;
  foot.position.y = -endRadius * 0.5;
  foot.position.z = endRadius * 0.5;

  const footMat = new StandardMaterial(
    `${isRight ? 'footMatR' : 'footMatL'}`,
    scene
  );
  const c3 = Color3.FromHexString(color);
  footMat.diffuseColor = c3.scale(0.9);
  footMat.specularColor = new Color3(0.3, 0.3, 0.35);
  foot.material = footMat;

  // Apply scale
  legRoot.scaling.setAll(scale);

  return legRoot;
}

/**
 * Creates hand/claw mesh for detailed characters
 *
 * @param scene - BabylonJS scene
 * @param size - Hand size multiplier
 * @param color - Hand color
 * @returns Hand mesh
 */
export function createHand(
  scene: Scene,
  size: number = 1.0,
  color: string = '#4a4a5a'
): Mesh {
  // Simple blocky hand for mech style
  const hand = MeshBuilder.CreateBox(
    'hand',
    {
      width: 0.06 * size,
      height: 0.08 * size,
      depth: 0.04 * size,
    },
    scene
  );

  const material = new StandardMaterial('handMat', scene);
  const c3 = Color3.FromHexString(color);
  material.diffuseColor = c3;
  material.specularColor = new Color3(0.4, 0.4, 0.45);
  hand.material = material;

  return hand;
}
