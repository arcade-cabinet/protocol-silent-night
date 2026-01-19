/**
 * BulletVisuals - Mesh templates for each bullet type
 *
 * Creates reusable mesh templates optimized for SolidParticleSystem cloning.
 * Each template is disposed after being used as a prototype.
 *
 * Performance target: Templates are lightweight with minimal vertex counts
 * to support 200+ active bullets at 60fps on mobile.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  VertexData,
  Vector3,
} from '@babylonjs/core';

/**
 * Bullet type visual configurations
 */
export interface BulletVisualConfig {
  baseColor: Color3;
  emissiveColor: Color3;
  size: number;
  segments?: number;
}

export const BULLET_CONFIGS: Record<string, BulletVisualConfig> = {
  cannon: {
    baseColor: new Color3(0.2, 0.05, 0.05),
    emissiveColor: new Color3(1, 0.3, 0.1), // Red-orange glow
    size: 0.8,
    segments: 1, // Low-poly for performance
  },
  smg: {
    baseColor: new Color3(0.05, 0.2, 0.25),
    emissiveColor: new Color3(0, 0.9, 1), // Cyan glow
    size: 0.3,
    segments: 6,
  },
  star: {
    baseColor: new Color3(0.3, 0.25, 0.05),
    emissiveColor: new Color3(1, 0.85, 0.2), // Gold glow
    size: 0.5,
  },
  snowball: {
    baseColor: new Color3(0.8, 0.9, 1),
    emissiveColor: new Color3(0.6, 0.8, 1), // Icy blue glow
    size: 0.6,
    segments: 1,
  },
  ornament: {
    baseColor: new Color3(0.3, 0.05, 0.1),
    emissiveColor: new Color3(0.9, 0.2, 0.3), // Red ornament glow
    size: 0.7,
    segments: 2,
  },
  lightning: {
    baseColor: new Color3(0.1, 0.05, 0.3),
    emissiveColor: new Color3(0.8, 0.5, 1), // Purple electric glow
    size: 0.25,
    segments: 4,
  },
  jingle: {
    baseColor: new Color3(0.25, 0.2, 0.05),
    emissiveColor: new Color3(1, 0.8, 0.3), // Golden bell glow
    size: 0.35,
    segments: 1,
  },
};

/**
 * Create a material for bullets with emissive glow
 */
function createBulletMaterial(
  scene: Scene,
  name: string,
  config: BulletVisualConfig
): StandardMaterial {
  const material = new StandardMaterial(`${name}BulletMat`, scene);
  material.diffuseColor = config.baseColor;
  material.emissiveColor = config.emissiveColor;
  material.specularColor = new Color3(0.5, 0.5, 0.5);
  material.specularPower = 32;
  // Disable backface culling for better visibility at all angles
  material.backFaceCulling = true;
  return material;
}

/**
 * Create cannon bullet template - Heavy coal projectile (icosphere)
 * Used by: cannon, snowball, ornament
 */
export function createCannonBulletTemplate(scene: Scene): Mesh {
  const config = BULLET_CONFIGS.cannon;
  const mesh = MeshBuilder.CreateIcoSphere(
    'cannonBulletTemplate',
    {
      radius: config.size,
      subdivisions: config.segments,
      flat: true, // Flat shading for coal-like appearance
    },
    scene
  );
  mesh.material = createBulletMaterial(scene, 'cannon', config);
  return mesh;
}

/**
 * Create SMG bullet template - Rapid plasma bolt (capsule)
 * Used by: smg, light_string, harpoon
 */
export function createSmgBulletTemplate(scene: Scene): Mesh {
  const config = BULLET_CONFIGS.smg;
  const mesh = MeshBuilder.CreateCapsule(
    'smgBulletTemplate',
    {
      radius: config.size * 0.5,
      height: config.size * 2,
      tessellation: config.segments,
      subdivisions: 1,
    },
    scene
  );
  mesh.material = createBulletMaterial(scene, 'smg', config);
  // Rotate to face forward by default
  mesh.rotation.x = Math.PI / 2;
  mesh.bakeCurrentTransformIntoVertices();
  return mesh;
}

/**
 * Create a 5-point star mesh geometry
 * Points alternate between outer and inner radius
 */
function createStarGeometry(
  outerRadius: number,
  innerRadius: number,
  depth: number,
  points: number = 5
): VertexData {
  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const angleStep = (Math.PI * 2) / points;
  const halfAngle = angleStep / 2;

  // Front face center
  positions.push(0, 0, depth / 2);
  normals.push(0, 0, 1);
  uvs.push(0.5, 0.5);

  // Front face star points
  for (let i = 0; i < points; i++) {
    // Outer point
    const outerAngle = i * angleStep - Math.PI / 2;
    positions.push(
      Math.cos(outerAngle) * outerRadius,
      Math.sin(outerAngle) * outerRadius,
      depth / 2
    );
    normals.push(0, 0, 1);
    uvs.push(0.5 + Math.cos(outerAngle) * 0.5, 0.5 + Math.sin(outerAngle) * 0.5);

    // Inner point
    const innerAngle = outerAngle + halfAngle;
    positions.push(
      Math.cos(innerAngle) * innerRadius,
      Math.sin(innerAngle) * innerRadius,
      depth / 2
    );
    normals.push(0, 0, 1);
    uvs.push(0.5 + Math.cos(innerAngle) * 0.5, 0.5 + Math.sin(innerAngle) * 0.5);
  }

  // Back face center
  const backCenterIdx = positions.length / 3;
  positions.push(0, 0, -depth / 2);
  normals.push(0, 0, -1);
  uvs.push(0.5, 0.5);

  // Back face star points
  for (let i = 0; i < points; i++) {
    const outerAngle = i * angleStep - Math.PI / 2;
    positions.push(
      Math.cos(outerAngle) * outerRadius,
      Math.sin(outerAngle) * outerRadius,
      -depth / 2
    );
    normals.push(0, 0, -1);
    uvs.push(0.5 + Math.cos(outerAngle) * 0.5, 0.5 + Math.sin(outerAngle) * 0.5);

    const innerAngle = outerAngle + halfAngle;
    positions.push(
      Math.cos(innerAngle) * innerRadius,
      Math.sin(innerAngle) * innerRadius,
      -depth / 2
    );
    normals.push(0, 0, -1);
    uvs.push(0.5 + Math.cos(innerAngle) * 0.5, 0.5 + Math.sin(innerAngle) * 0.5);
  }

  // Front face triangles (fan from center)
  for (let i = 0; i < points * 2; i++) {
    const current = i + 1;
    const next = (i + 1) % (points * 2) + 1;
    indices.push(0, current, next);
  }

  // Back face triangles (reversed winding)
  for (let i = 0; i < points * 2; i++) {
    const current = backCenterIdx + 1 + i;
    const next = backCenterIdx + 1 + ((i + 1) % (points * 2));
    indices.push(backCenterIdx, next, current);
  }

  // Side faces (connect front and back)
  for (let i = 0; i < points * 2; i++) {
    const frontCurrent = i + 1;
    const frontNext = (i + 1) % (points * 2) + 1;
    const backCurrent = backCenterIdx + 1 + i;
    const backNext = backCenterIdx + 1 + ((i + 1) % (points * 2));

    // Two triangles per side quad
    indices.push(frontCurrent, backCurrent, backNext);
    indices.push(frontCurrent, backNext, frontNext);
  }

  const vertexData = new VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.uvs = uvs;

  return vertexData;
}

/**
 * Create star bullet template - 5-point star projectile
 * Used by: star, candy_cane, gingerbread, jingle_bell, quantum_gift
 */
export function createStarBulletTemplate(scene: Scene): Mesh {
  const config = BULLET_CONFIGS.star;
  const mesh = new Mesh('starBulletTemplate', scene);

  const vertexData = createStarGeometry(
    config.size, // Outer radius
    config.size * 0.4, // Inner radius
    config.size * 0.3 // Depth
  );
  vertexData.applyToMesh(mesh);

  mesh.material = createBulletMaterial(scene, 'star', config);
  return mesh;
}

/**
 * Create snowball bullet template - Icy spherical projectile
 */
export function createSnowballBulletTemplate(scene: Scene): Mesh {
  const config = BULLET_CONFIGS.snowball;
  const mesh = MeshBuilder.CreateIcoSphere(
    'snowballBulletTemplate',
    {
      radius: config.size,
      subdivisions: config.segments,
      flat: false, // Smooth for ice-like appearance
    },
    scene
  );
  mesh.material = createBulletMaterial(scene, 'snowball', config);
  return mesh;
}

/**
 * Create ornament bullet template - Explosive spherical projectile
 */
export function createOrnamentBulletTemplate(scene: Scene): Mesh {
  const config = BULLET_CONFIGS.ornament;
  const mesh = MeshBuilder.CreateIcoSphere(
    'ornamentBulletTemplate',
    {
      radius: config.size,
      subdivisions: config.segments,
      flat: false,
    },
    scene
  );
  mesh.material = createBulletMaterial(scene, 'ornament', config);
  return mesh;
}

/**
 * Create lightning bullet template - Electric energy bolt
 */
export function createLightningBulletTemplate(scene: Scene): Mesh {
  const config = BULLET_CONFIGS.lightning;
  const mesh = MeshBuilder.CreateCapsule(
    'lightningBulletTemplate',
    {
      radius: config.size * 0.3,
      height: config.size * 3,
      tessellation: config.segments,
      subdivisions: 1,
    },
    scene
  );
  mesh.material = createBulletMaterial(scene, 'lightning', config);
  mesh.rotation.x = Math.PI / 2;
  mesh.bakeCurrentTransformIntoVertices();
  return mesh;
}

/**
 * Create jingle bell bullet template - Small golden projectile
 */
export function createJingleBulletTemplate(scene: Scene): Mesh {
  const config = BULLET_CONFIGS.jingle;
  const mesh = MeshBuilder.CreateIcoSphere(
    'jingleBulletTemplate',
    {
      radius: config.size,
      subdivisions: config.segments,
      flat: true,
    },
    scene
  );
  mesh.material = createBulletMaterial(scene, 'jingle', config);
  return mesh;
}

/**
 * Bullet type to template creator mapping
 */
export type BulletTemplateCreator = (scene: Scene) => Mesh;

export const BULLET_TEMPLATE_CREATORS: Record<string, BulletTemplateCreator> = {
  cannon: createCannonBulletTemplate,
  smg: createSmgBulletTemplate,
  star: createStarBulletTemplate,
  snowball: createSnowballBulletTemplate,
  ornament: createOrnamentBulletTemplate,
  lightning: createLightningBulletTemplate,
  jingle: createJingleBulletTemplate,
};

/**
 * Get the visual bullet type for a weapon's bulletType
 * Maps weapon bulletType to visual template type
 */
export function getVisualBulletType(weaponBulletType: string): string {
  // Direct mappings based on weapons.json bulletType values
  switch (weaponBulletType) {
    case 'cannon':
      return 'cannon';
    case 'smg':
      return 'smg';
    case 'star':
      return 'star';
    default:
      return 'cannon'; // Default fallback
  }
}

/**
 * Get bullet radius for collision detection based on bullet type
 */
export function getBulletRadius(bulletType: string): number {
  const config = BULLET_CONFIGS[bulletType];
  return config ? config.size : 0.5;
}

/**
 * Create all bullet templates and return a map
 * Useful for pre-warming the SPS with all bullet types
 */
export function createAllBulletTemplates(scene: Scene): Map<string, Mesh> {
  const templates = new Map<string, Mesh>();
  for (const [type, creator] of Object.entries(BULLET_TEMPLATE_CREATORS)) {
    templates.set(type, creator(scene));
  }
  return templates;
}
