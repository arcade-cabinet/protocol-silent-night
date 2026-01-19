/**
 * @fileoverview Character skeleton and bone hierarchy for BabylonJS
 * @module characters/CharacterSkeleton
 *
 * Creates a skeletal structure for character animation.
 * Uses BabylonJS Skeleton and Bone classes for rigging.
 */

import {
  type Scene,
  Skeleton,
  Bone,
  TransformNode,
  Vector3,
  Matrix,
  Quaternion,
  Space,
} from '@babylonjs/core';
import {
  type JointName,
  type BoneDefinition,
  DEFAULT_BONE_HIERARCHY,
} from './CharacterTypes';

/**
 * Options for skeleton creation
 */
export interface SkeletonOptions {
  /** Scale factor for all bone positions */
  scale: number;
  /** Custom bone hierarchy (optional) */
  boneHierarchy?: BoneDefinition[];
  /** Whether to create debug visualization */
  debug?: boolean;
}

/**
 * Default skeleton options
 */
export const DEFAULT_SKELETON_OPTIONS: SkeletonOptions = {
  scale: 1.0,
  debug: false,
};

/**
 * Result of skeleton creation
 */
export interface SkeletonResult {
  /** The BabylonJS skeleton */
  skeleton: Skeleton;
  /** Map of bone names to Bone objects */
  bones: Map<JointName, Bone>;
  /** Map of joint names to TransformNodes for attaching meshes */
  joints: Map<JointName, TransformNode>;
  /** Root transform node */
  rootNode: TransformNode;
  /** Update skeleton pose */
  updatePose: (
    jointRotations: Partial<Record<JointName, Vector3>>
  ) => void;
  /** Reset to bind pose */
  resetPose: () => void;
  /** Dispose all resources */
  dispose: () => void;
}

/**
 * Creates a character skeleton with bone hierarchy
 *
 * @param scene - BabylonJS scene
 * @param name - Name for the skeleton
 * @param options - Skeleton creation options
 * @returns Skeleton result with bones and joint nodes
 */
export function createCharacterSkeleton(
  scene: Scene,
  name: string,
  options: Partial<SkeletonOptions> = {}
): SkeletonResult {
  const fullOptions: SkeletonOptions = {
    ...DEFAULT_SKELETON_OPTIONS,
    ...options,
  };
  const { scale, debug } = fullOptions;
  const hierarchy = options.boneHierarchy ?? DEFAULT_BONE_HIERARCHY;

  // Create the skeleton
  const skeleton = new Skeleton(`${name}_skeleton`, `${name}_skeletonId`, scene);

  // Create root transform node
  const rootNode = new TransformNode(`${name}_root`, scene);

  // Maps for storing bones and joints
  const bones = new Map<JointName, Bone>();
  const joints = new Map<JointName, TransformNode>();

  // Store initial bone positions for reset
  const initialPositions = new Map<JointName, Vector3>();
  const initialRotations = new Map<JointName, Quaternion>();

  // Create bones based on hierarchy
  for (const boneDef of hierarchy) {
    const parentBone = boneDef.parent ? bones.get(boneDef.parent) : null;

    // Calculate scaled position
    const position = new Vector3(
      boneDef.position[0] * scale,
      boneDef.position[1] * scale,
      boneDef.position[2] * scale
    );

    // Create bone rest matrix
    const restMatrix = Matrix.Translation(position.x, position.y, position.z);

    // Apply initial rotation if specified
    if (boneDef.rotation) {
      const rotation = Quaternion.FromEulerAngles(
        boneDef.rotation[0],
        boneDef.rotation[1],
        boneDef.rotation[2]
      );
      const rotMatrix = Matrix.FromQuaternionToRef(rotation, new Matrix());
      restMatrix.multiplyToRef(rotMatrix, restMatrix);
      initialRotations.set(boneDef.name, rotation);
    } else {
      initialRotations.set(boneDef.name, Quaternion.Identity());
    }

    // Create the bone
    const bone = new Bone(
      boneDef.name,
      skeleton,
      parentBone ?? undefined,
      restMatrix
    );

    bones.set(boneDef.name, bone);
    initialPositions.set(boneDef.name, position.clone());

    // Create corresponding transform node for mesh attachment
    const jointNode = new TransformNode(`${name}_joint_${boneDef.name}`, scene);

    if (boneDef.parent) {
      const parentJoint = joints.get(boneDef.parent);
      if (parentJoint) {
        jointNode.parent = parentJoint;
      }
    } else {
      jointNode.parent = rootNode;
    }

    jointNode.position = position;
    if (boneDef.rotation) {
      jointNode.rotationQuaternion = Quaternion.FromEulerAngles(
        boneDef.rotation[0],
        boneDef.rotation[1],
        boneDef.rotation[2]
      );
    }

    joints.set(boneDef.name, jointNode);
  }

  // Debug visualization
  if (debug) {
    createDebugVisualization(scene, joints, scale);
  }

  /**
   * Updates joint rotations
   */
  const updatePose = (
    jointRotations: Partial<Record<JointName, Vector3>>
  ): void => {
    for (const [jointName, rotation] of Object.entries(jointRotations)) {
      const joint = joints.get(jointName as JointName);
      const bone = bones.get(jointName as JointName);

      if (joint && bone) {
        // Apply rotation to transform node
        const quat = Quaternion.FromEulerAngles(
          rotation.x,
          rotation.y,
          rotation.z
        );

        // Combine with initial rotation
        const initialQuat =
          initialRotations.get(jointName as JointName) ?? Quaternion.Identity();
        const finalQuat = initialQuat.multiply(quat);

        joint.rotationQuaternion = finalQuat;

        // Update bone rotation
        bone.setRotationQuaternion(finalQuat, Space.LOCAL);
      }
    }
  };

  /**
   * Resets skeleton to bind pose
   */
  const resetPose = (): void => {
    for (const boneDef of hierarchy) {
      const joint = joints.get(boneDef.name);
      const bone = bones.get(boneDef.name);
      const initialPos = initialPositions.get(boneDef.name);
      const initialRot = initialRotations.get(boneDef.name);

      if (joint && initialPos) {
        joint.position = initialPos.clone();
      }
      if (joint && initialRot) {
        joint.rotationQuaternion = initialRot.clone();
      }
      if (bone && initialRot) {
        bone.setRotationQuaternion(initialRot.clone(), Space.LOCAL);
      }
    }
  };

  /**
   * Disposes all skeleton resources
   */
  const dispose = (): void => {
    skeleton.dispose();
    rootNode.dispose();
    for (const joint of joints.values()) {
      joint.dispose();
    }
  };

  return {
    skeleton,
    bones,
    joints,
    rootNode,
    updatePose,
    resetPose,
    dispose,
  };
}

/**
 * Creates debug visualization spheres at joint positions
 */
function createDebugVisualization(
  scene: Scene,
  joints: Map<JointName, TransformNode>,
  scale: number
): void {
  const { MeshBuilder, StandardMaterial, Color3 } = require('@babylonjs/core');

  const debugMaterial = new StandardMaterial('jointDebugMat', scene);
  debugMaterial.diffuseColor = new Color3(1, 0, 0);
  debugMaterial.emissiveColor = new Color3(0.5, 0, 0);

  for (const [name, joint] of joints.entries()) {
    const debugSphere = MeshBuilder.CreateSphere(
      `debug_${name}`,
      { diameter: 0.05 * scale },
      scene
    );
    debugSphere.material = debugMaterial;
    debugSphere.parent = joint;
  }
}

/**
 * Gets the world position of a joint
 *
 * @param joints - Joint map
 * @param jointName - Name of joint
 * @returns World position vector
 */
export function getJointWorldPosition(
  joints: Map<JointName, TransformNode>,
  jointName: JointName
): Vector3 {
  const joint = joints.get(jointName);
  if (!joint) {
    return Vector3.Zero();
  }
  return joint.getAbsolutePosition();
}

/**
 * Attaches a mesh to a joint
 *
 * @param mesh - Mesh to attach
 * @param joints - Joint map
 * @param jointName - Target joint name
 * @param offset - Position offset from joint
 */
export function attachMeshToJoint(
  mesh: TransformNode,
  joints: Map<JointName, TransformNode>,
  jointName: JointName,
  offset?: Vector3
): void {
  const joint = joints.get(jointName);
  if (!joint) {
    console.warn(`Joint ${jointName} not found`);
    return;
  }

  mesh.parent = joint;
  if (offset) {
    mesh.position = offset;
  }
}

/**
 * Creates IK (Inverse Kinematics) chain for a limb
 * Simple two-bone IK solver
 *
 * @param joints - Joint map
 * @param startJoint - Start joint (e.g., shoulder/hip)
 * @param midJoint - Middle joint (e.g., elbow/knee)
 * @param endJoint - End joint (e.g., wrist/ankle)
 * @returns Function to solve IK to target position
 */
export function createIKChain(
  joints: Map<JointName, TransformNode>,
  startJoint: JointName,
  midJoint: JointName,
  endJoint: JointName
): (target: Vector3, poleTarget?: Vector3) => void {
  const start = joints.get(startJoint);
  const mid = joints.get(midJoint);
  const end = joints.get(endJoint);

  if (!start || !mid || !end) {
    console.warn('IK chain joints not found');
    return () => {};
  }

  // Get bone lengths
  const upperLength = mid.position.length();
  const lowerLength = end.position.length();
  const chainLength = upperLength + lowerLength;

  return (target: Vector3, _poleTarget?: Vector3): void => {
    const startPos = start.getAbsolutePosition();
    const toTarget = target.subtract(startPos);
    const distance = Math.min(toTarget.length(), chainLength * 0.999);

    if (distance < 0.001) return;

    // Calculate joint angles using law of cosines
    const a = upperLength;
    const b = lowerLength;
    const c = distance;

    // Angle at mid joint
    const midAngle = Math.acos(
      Math.max(
        -1,
        Math.min(1, (a * a + b * b - c * c) / (2 * a * b))
      )
    );

    // Angle at start joint
    const startAngle = Math.acos(
      Math.max(
        -1,
        Math.min(1, (a * a + c * c - b * b) / (2 * a * c))
      )
    );

    // Calculate rotation to point at target
    const direction = toTarget.normalize();
    const defaultDir = new Vector3(0, -1, 0); // Default pointing down
    const rotationAxis = Vector3.Cross(defaultDir, direction).normalize();
    const rotationAngle = Math.acos(
      Math.max(-1, Math.min(1, Vector3.Dot(defaultDir, direction)))
    );

    // Apply rotations
    if (rotationAxis.length() > 0.001) {
      start.rotationQuaternion = Quaternion.RotationAxis(
        rotationAxis,
        rotationAngle + startAngle
      );
    }

    // Bend at mid joint
    mid.rotationQuaternion = Quaternion.RotationAxis(
      new Vector3(1, 0, 0), // Bend around X axis
      Math.PI - midAngle
    );
  };
}
