/**
 * @fileoverview Cyberpunk neon Christmas tree mesh
 * @module obstacles/CyberpunkTree
 *
 * Creates a stylized Christmas tree with neon accents for the
 * cyberpunk aesthetic. Used as template mesh for instancing.
 */

import {
  type Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  VertexData,
} from '@babylonjs/core';

/**
 * Configuration for cyberpunk tree
 */
export interface CyberpunkTreeConfig {
  /** Base height of tree */
  height: number;
  /** Base radius of tree */
  radius: number;
  /** Primary color (hex string) */
  color: string;
  /** Emissive intensity (0-1) */
  emissiveIntensity?: number;
  /** Number of tree tiers */
  tiers?: number;
}

/**
 * Default tree configuration
 */
const DEFAULT_TREE_CONFIG: CyberpunkTreeConfig = {
  height: 6,
  radius: 1.2,
  color: '#00aa44',
  emissiveIntensity: 0.3,
  tiers: 3,
};

/**
 * Converts hex color to Color3
 */
function hexToColor3(hex: string): Color3 {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return new Color3(
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    );
  }
  return new Color3(0, 0.67, 0.27); // Default green
}

/**
 * Creates a cyberpunk Christmas tree template mesh
 *
 * The tree consists of stacked cone tiers with a trunk,
 * styled with neon emissive edges.
 *
 * @param scene - BabylonJS scene
 * @param config - Tree configuration
 * @returns Template mesh for instancing
 *
 * @example
 * ```typescript
 * const treeTemplate = createCyberpunkTree(scene, {
 *   height: 6,
 *   color: '#00ff44',
 * });
 *
 * // Create instances
 * const instance = treeTemplate.createInstance('tree1');
 * instance.position.set(10, 0, 5);
 * ```
 */
export function createCyberpunkTree(
  scene: Scene,
  config: Partial<CyberpunkTreeConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_TREE_CONFIG, ...config };
  const { height, radius, color, emissiveIntensity, tiers } = cfg;

  // Create parent mesh for tree components
  const tree = new Mesh('cyberpunkTree', scene);

  // Create trunk
  const trunkHeight = height * 0.15;
  const trunkRadius = radius * 0.15;
  const trunk = MeshBuilder.CreateCylinder(
    'trunk',
    {
      height: trunkHeight,
      diameterTop: trunkRadius * 1.5,
      diameterBottom: trunkRadius * 2,
      tessellation: 6, // Hexagonal for cyberpunk look
    },
    scene
  );
  trunk.position.y = trunkHeight / 2;
  trunk.parent = tree;

  // Trunk material (dark with subtle glow)
  const trunkMat = new StandardMaterial('trunkMat', scene);
  trunkMat.diffuseColor = new Color3(0.15, 0.1, 0.05);
  trunkMat.emissiveColor = new Color3(0.3, 0.15, 0);
  trunk.material = trunkMat;

  // Create tiered cone sections
  const baseColor = hexToColor3(color);
  const tierHeight = (height - trunkHeight) / tiers!;

  for (let i = 0; i < tiers!; i++) {
    const tierRadius = radius * (1 - i * 0.25);
    const tierY = trunkHeight + i * tierHeight * 0.8 + tierHeight / 2;

    const tier = MeshBuilder.CreateCylinder(
      `tier${i}`,
      {
        height: tierHeight,
        diameterTop: tierRadius * 0.3,
        diameterBottom: tierRadius * 2,
        tessellation: 8, // Octagonal
      },
      scene
    );
    tier.position.y = tierY;
    tier.parent = tree;

    // Tier material with gradient emissive
    const tierMat = new StandardMaterial(`tierMat${i}`, scene);
    const tierBrightness = 1 - i * 0.15;
    tierMat.diffuseColor = baseColor.scale(tierBrightness);
    tierMat.emissiveColor = baseColor.scale(emissiveIntensity! * tierBrightness);
    tierMat.specularColor = new Color3(0.2, 0.2, 0.2);
    tier.material = tierMat;
  }

  // Create star on top
  const starY = trunkHeight + tiers! * tierHeight * 0.8 + tierHeight * 0.3;
  const star = createStar(scene, radius * 0.3);
  star.position.y = starY;
  star.parent = tree;

  // Star material (bright emissive)
  const starMat = new StandardMaterial('starMat', scene);
  starMat.diffuseColor = new Color3(1, 0.9, 0);
  starMat.emissiveColor = new Color3(1, 0.8, 0);
  starMat.specularColor = new Color3(1, 1, 1);
  star.material = starMat;

  // Add neon lights (small spheres)
  addNeonLights(tree, scene, height, radius, tiers!);

  return tree;
}

/**
 * Creates a simple 5-pointed star mesh
 */
function createStar(scene: Scene, size: number): Mesh {
  const points = 5;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  const depth = size * 0.2;

  const positions: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  // Create star points
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    positions.push(Math.cos(angle) * r, Math.sin(angle) * r, 0);
  }

  // Center point front
  positions.push(0, 0, depth);
  // Center point back
  positions.push(0, 0, -depth);

  const centerFront = points * 2;
  const centerBack = points * 2 + 1;

  // Front faces
  for (let i = 0; i < points * 2; i++) {
    const next = (i + 1) % (points * 2);
    indices.push(i, next, centerFront);
  }

  // Back faces
  for (let i = 0; i < points * 2; i++) {
    const next = (i + 1) % (points * 2);
    indices.push(next, i, centerBack);
  }

  // Create mesh
  const star = new Mesh('star', scene);
  const vertexData = new VertexData();

  vertexData.positions = positions;
  vertexData.indices = indices;

  // Compute normals
  VertexData.ComputeNormals(positions, indices, normals);
  vertexData.normals = normals;

  vertexData.applyToMesh(star);

  // Rotate to face up
  star.rotation.x = Math.PI / 2;

  return star;
}

/**
 * Adds small neon light spheres to tree
 */
function addNeonLights(
  parent: Mesh,
  scene: Scene,
  height: number,
  radius: number,
  tiers: number
): void {
  const colors = [
    new Color3(1, 0, 0.4), // Pink
    new Color3(0, 1, 0.8), // Cyan
    new Color3(1, 0.8, 0), // Yellow
    new Color3(0.4, 0, 1), // Purple
  ];

  const lightsPerTier = 6;
  const trunkHeight = height * 0.15;
  const tierHeight = (height - trunkHeight) / tiers;

  for (let t = 0; t < tiers; t++) {
    const tierY = trunkHeight + t * tierHeight * 0.8 + tierHeight * 0.5;
    const tierRadius = radius * (1 - t * 0.25) * 0.8;

    for (let l = 0; l < lightsPerTier; l++) {
      const angle = (l / lightsPerTier) * Math.PI * 2 + t * 0.5;
      const x = Math.cos(angle) * tierRadius;
      const z = Math.sin(angle) * tierRadius;
      const y = tierY + (Math.random() - 0.5) * tierHeight * 0.5;

      const light = MeshBuilder.CreateSphere(
        `light_${t}_${l}`,
        { diameter: 0.15 },
        scene
      );
      light.position.set(x, y, z);
      light.parent = parent;

      // Light material
      const lightMat = new StandardMaterial(`lightMat_${t}_${l}`, scene);
      const color = colors[(t + l) % colors.length];
      lightMat.diffuseColor = color;
      lightMat.emissiveColor = color;
      light.material = lightMat;
    }
  }
}

/**
 * Creates a simplified tree for distant/low-detail rendering
 *
 * @param scene - BabylonJS scene
 * @param config - Tree configuration
 * @returns Simplified mesh
 */
export function createSimpleCyberpunkTree(
  scene: Scene,
  config: Partial<CyberpunkTreeConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_TREE_CONFIG, ...config };
  const { height, radius, color, emissiveIntensity } = cfg;

  // Single cone for tree
  const tree = MeshBuilder.CreateCylinder(
    'simpleTree',
    {
      height,
      diameterTop: 0,
      diameterBottom: radius * 2,
      tessellation: 6,
    },
    scene
  );
  tree.position.y = height / 2;

  // Material
  const baseColor = hexToColor3(color);
  const mat = new StandardMaterial('simpleTreeMat', scene);
  mat.diffuseColor = baseColor;
  mat.emissiveColor = baseColor.scale(emissiveIntensity ?? 0.3);
  tree.material = mat;

  return tree;
}
