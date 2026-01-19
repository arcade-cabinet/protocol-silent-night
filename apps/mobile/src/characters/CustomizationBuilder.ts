/**
 * @fileoverview DDL-driven customization mesh builder for BabylonJS
 * @module characters/CustomizationBuilder
 *
 * Interprets the customizations array from classes.json DDL and
 * generates corresponding BabylonJS meshes attached to joints.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  TransformNode,
  StandardMaterial,
  Color3,
  PointLight,
  Vector3,
} from '@babylonjs/core';
import type {
  JointName,
  CharacterCustomization,
  CustomizationMaterial,
  ChildCustomization,
  GroupCustomization,
} from './CharacterTypes';

/**
 * Result from building customizations
 */
export interface CustomizationResult {
  /** All created meshes */
  meshes: Mesh[];
  /** All created lights */
  lights: PointLight[];
  /** Transform nodes for groups */
  groups: TransformNode[];
  /** Dispose all resources */
  dispose: () => void;
}

/**
 * Creates a StandardMaterial from DDL material specification
 */
function createMaterialFromSpec(
  scene: Scene,
  name: string,
  spec: CustomizationMaterial
): StandardMaterial {
  const material = new StandardMaterial(name, scene);

  // Base color
  const color = Color3.FromHexString(spec.color);
  material.diffuseColor = color;

  // Emissive (glow)
  if (spec.emissive) {
    const emissiveColor = Color3.FromHexString(spec.emissive);
    const intensity = spec.emissiveIntensity ?? 1.0;
    material.emissiveColor = emissiveColor.scale(intensity);
  }

  // Metalness (approximated with specular)
  if (spec.metalness !== undefined) {
    const metalness = spec.metalness;
    material.specularColor = new Color3(metalness, metalness, metalness);
    material.specularPower = 128 * metalness;
  } else {
    material.specularColor = new Color3(0.2, 0.2, 0.2);
    material.specularPower = 32;
  }

  // Roughness (approximated with specular power)
  if (spec.roughness !== undefined) {
    material.specularPower = Math.max(4, (1 - spec.roughness) * 128);
  }

  // Transparency
  if (spec.transparent && spec.opacity !== undefined) {
    material.alpha = spec.opacity;
  }

  return material;
}

/**
 * Creates a sphere mesh from DDL specification
 */
function createSphereMesh(
  scene: Scene,
  name: string,
  args: [number, number, number],
  material: CustomizationMaterial
): Mesh {
  const [diameter, segments] = args;

  const mesh = MeshBuilder.CreateSphere(
    name,
    {
      diameter,
      segments: Math.max(4, Math.min(32, segments)),
    },
    scene
  );

  mesh.material = createMaterialFromSpec(scene, `${name}_mat`, material);
  return mesh;
}

/**
 * Creates a box mesh from DDL specification
 */
function createBoxMesh(
  scene: Scene,
  name: string,
  args: [number, number, number],
  material: CustomizationMaterial
): Mesh {
  const [width, height, depth] = args;

  const mesh = MeshBuilder.CreateBox(
    name,
    { width, height, depth },
    scene
  );

  mesh.material = createMaterialFromSpec(scene, `${name}_mat`, material);
  return mesh;
}

/**
 * Creates a cone mesh from DDL specification
 */
function createConeMesh(
  scene: Scene,
  name: string,
  args: [number, number, number],
  material: CustomizationMaterial
): Mesh {
  const [diameterBottom, height, tessellation] = args;

  // BabylonJS CreateCylinder can make cones with diameterTop=0
  const mesh = MeshBuilder.CreateCylinder(
    name,
    {
      diameterTop: 0,
      diameterBottom,
      height,
      tessellation: Math.max(3, Math.min(32, tessellation)),
    },
    scene
  );

  mesh.material = createMaterialFromSpec(scene, `${name}_mat`, material);
  return mesh;
}

/**
 * Creates a cylinder mesh from DDL specification
 */
function createCylinderMesh(
  scene: Scene,
  name: string,
  args: [number, number, number, number],
  material: CustomizationMaterial
): Mesh {
  const [diameterTop, diameterBottom, height, tessellation] = args;

  const mesh = MeshBuilder.CreateCylinder(
    name,
    {
      diameterTop,
      diameterBottom,
      height,
      tessellation: Math.max(3, Math.min(32, tessellation)),
    },
    scene
  );

  mesh.material = createMaterialFromSpec(scene, `${name}_mat`, material);
  return mesh;
}

/**
 * Creates a torus mesh from DDL specification
 */
function createTorusMesh(
  scene: Scene,
  name: string,
  args: [number, number, number, number],
  material: CustomizationMaterial
): Mesh {
  const [diameter, thickness, tessellation, radialSegments] = args;

  const mesh = MeshBuilder.CreateTorus(
    name,
    {
      diameter,
      thickness,
      tessellation: Math.max(3, Math.min(32, tessellation)),
    },
    scene
  );

  mesh.material = createMaterialFromSpec(scene, `${name}_mat`, material);
  return mesh;
}

/**
 * Creates a point light from DDL specification
 */
function createPointLightFromSpec(
  scene: Scene,
  name: string,
  args: [string, number, number],
  position?: [number, number, number]
): PointLight {
  const [colorHex, intensity, range] = args;

  const light = new PointLight(
    name,
    position ? new Vector3(position[0], position[1], position[2]) : Vector3.Zero(),
    scene
  );

  light.diffuse = Color3.FromHexString(colorHex);
  light.intensity = intensity;
  light.range = range;

  return light;
}

/**
 * Applies position, rotation, and scale transforms to a node
 */
function applyTransforms(
  node: TransformNode | Mesh | PointLight,
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale?: [number, number, number]
): void {
  if (position) {
    node.position = new Vector3(position[0], position[1], position[2]);
  }

  if (rotation && 'rotation' in node) {
    node.rotation = new Vector3(rotation[0], rotation[1], rotation[2]);
  }

  if (scale && 'scaling' in node) {
    node.scaling = new Vector3(scale[0], scale[1], scale[2]);
  }
}

/**
 * Builds a single child customization (within a group)
 */
function buildChildCustomization(
  scene: Scene,
  child: ChildCustomization,
  parentGroup: TransformNode,
  meshes: Mesh[],
  lights: PointLight[]
): void {
  const name = child.name ?? `child_${Date.now()}`;

  if (child.type === 'pointLight') {
    const light = createPointLightFromSpec(
      scene,
      name,
      child.args,
      child.position
    );
    light.parent = parentGroup;
    lights.push(light);
    return;
  }

  let mesh: Mesh | null = null;

  switch (child.type) {
    case 'sphere':
      mesh = createSphereMesh(scene, name, child.args, child.material);
      break;
    case 'box':
      mesh = createBoxMesh(scene, name, child.args, child.material);
      break;
    case 'cone':
      mesh = createConeMesh(scene, name, child.args, child.material);
      break;
    case 'cylinder':
      mesh = createCylinderMesh(scene, name, child.args, child.material);
      break;
    case 'torus':
      mesh = createTorusMesh(scene, name, child.args, child.material);
      break;
  }

  if (mesh) {
    mesh.parent = parentGroup;
    applyTransforms(
      mesh,
      child.position,
      child.rotation,
      child.scale
    );
    meshes.push(mesh);
  }
}

/**
 * Builds a group customization with its children
 */
function buildGroupCustomization(
  scene: Scene,
  group: GroupCustomization,
  parentJoint: TransformNode,
  meshes: Mesh[],
  lights: PointLight[],
  groups: TransformNode[]
): void {
  const groupNode = new TransformNode(
    group.name ?? `group_${Date.now()}`,
    scene
  );
  groupNode.parent = parentJoint;

  applyTransforms(
    groupNode,
    group.position,
    group.rotation,
    group.scale
  );

  groups.push(groupNode);

  // Build children
  if (group.children) {
    for (const child of group.children) {
      buildChildCustomization(scene, child, groupNode, meshes, lights);
    }
  }
}

/**
 * Builds all customizations for a character
 *
 * @param scene - BabylonJS scene
 * @param customizations - Array of customization specs from DDL
 * @param joints - Map of joint transform nodes
 * @param scale - Character scale factor
 * @returns Customization result with meshes and dispose function
 */
export function buildCustomizations(
  scene: Scene,
  customizations: unknown[],
  joints: Map<JointName, TransformNode>,
  scale: number = 1.0
): CustomizationResult {
  const meshes: Mesh[] = [];
  const lights: PointLight[] = [];
  const groups: TransformNode[] = [];

  for (const customization of customizations) {
    const custom = customization as CharacterCustomization;

    // Get parent joint
    const parentJoint = joints.get(custom.joint);
    if (!parentJoint) {
      console.warn(`Joint ${custom.joint} not found for customization`);
      continue;
    }

    // Handle scale-only customization
    if (custom.type === 'scale') {
      if (custom.scale) {
        parentJoint.scaling = new Vector3(
          custom.scale[0],
          custom.scale[1],
          custom.scale[2]
        );
      }
      continue;
    }

    // Handle group customization
    if (custom.type === 'group') {
      buildGroupCustomization(
        scene,
        custom as GroupCustomization,
        parentJoint,
        meshes,
        lights,
        groups
      );
      continue;
    }

    // Handle point light
    if (custom.type === 'pointLight') {
      const light = createPointLightFromSpec(
        scene,
        custom.name ?? `light_${Date.now()}`,
        custom.args,
        custom.position
      );
      light.parent = parentJoint;
      lights.push(light);
      continue;
    }

    // Handle mesh primitives
    const name = custom.name ?? `custom_${Date.now()}`;
    let mesh: Mesh | null = null;

    switch (custom.type) {
      case 'sphere':
        mesh = createSphereMesh(scene, name, custom.args, custom.material);
        break;
      case 'box':
        mesh = createBoxMesh(scene, name, custom.args, custom.material);
        break;
      case 'cone':
        mesh = createConeMesh(scene, name, custom.args, custom.material);
        break;
      case 'cylinder':
        mesh = createCylinderMesh(scene, name, custom.args, custom.material);
        break;
      case 'torus':
        mesh = createTorusMesh(scene, name, custom.args, custom.material);
        break;
    }

    if (mesh) {
      mesh.parent = parentJoint;
      applyTransforms(
        mesh,
        custom.position,
        custom.rotation,
        custom.scale
      );

      // Apply character scale
      mesh.scaling.scaleInPlace(scale);

      meshes.push(mesh);
    }
  }

  /**
   * Dispose all customization resources
   */
  const dispose = (): void => {
    for (const mesh of meshes) {
      mesh.dispose();
    }
    for (const light of lights) {
      light.dispose();
    }
    for (const group of groups) {
      group.dispose();
    }
  };

  return {
    meshes,
    lights,
    groups,
    dispose,
  };
}

/**
 * Updates muzzle flash intensity (for firing animation)
 *
 * @param lights - Array of point lights
 * @param muzzleFlashName - Name of the muzzle flash light
 * @param intensity - New intensity (0 = off)
 */
export function setMuzzleFlashIntensity(
  lights: PointLight[],
  muzzleFlashName: string = 'muzzle_flash',
  intensity: number
): void {
  const muzzleFlash = lights.find((l) => l.name.includes(muzzleFlashName));
  if (muzzleFlash) {
    muzzleFlash.intensity = intensity;
  }
}

/**
 * Finds a customization mesh by name
 *
 * @param meshes - Array of meshes
 * @param name - Name to search for
 * @returns Found mesh or undefined
 */
export function findCustomizationMesh(
  meshes: Mesh[],
  name: string
): Mesh | undefined {
  return meshes.find((m) => m.name === name);
}

/**
 * Gets the weapon group transform for a character
 * Useful for attaching projectile spawn points
 *
 * @param groups - Array of group transform nodes
 * @returns Weapon group or undefined
 */
export function getWeaponGroup(
  groups: TransformNode[]
): TransformNode | undefined {
  return groups.find((g) => g.name.includes('weapon_group'));
}
