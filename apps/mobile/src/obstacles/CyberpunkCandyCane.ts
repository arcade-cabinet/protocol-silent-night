/**
 * @fileoverview Cyberpunk striped candy cane mesh
 * @module obstacles/CyberpunkCandyCane
 *
 * Creates a stylized candy cane with neon stripes for the
 * cyberpunk Christmas aesthetic.
 */

import {
  type Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
} from '@babylonjs/core';

/**
 * Configuration for cyberpunk candy cane
 */
export interface CyberpunkCandyCaneConfig {
  /** Total height of candy cane */
  height: number;
  /** Radius of the cane tube */
  radius: number;
  /** Primary color (hex string) */
  color: string;
  /** Secondary stripe color (hex string) */
  stripeColor?: string;
  /** Emissive intensity (0-1) */
  emissiveIntensity?: number;
  /** Number of stripes */
  stripeCount?: number;
}

/**
 * Default candy cane configuration
 */
const DEFAULT_CANDY_CANE_CONFIG: CyberpunkCandyCaneConfig = {
  height: 4,
  radius: 0.2,
  color: '#ff4477',
  stripeColor: '#ffffff',
  emissiveIntensity: 0.5,
  stripeCount: 8,
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
  return new Color3(1, 0.27, 0.47); // Default pink
}

/**
 * Creates a cyberpunk candy cane template mesh
 *
 * The candy cane consists of a straight shaft with a curved hook,
 * styled with alternating neon stripes.
 *
 * @param scene - BabylonJS scene
 * @param config - Candy cane configuration
 * @returns Template mesh for instancing
 *
 * @example
 * ```typescript
 * const candyCaneTemplate = createCyberpunkCandyCane(scene, {
 *   height: 4,
 *   color: '#ff0066',
 * });
 *
 * const instance = candyCaneTemplate.createInstance('candyCane1');
 * instance.position.set(7, 0, 2);
 * ```
 */
export function createCyberpunkCandyCane(
  scene: Scene,
  config: Partial<CyberpunkCandyCaneConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_CANDY_CANE_CONFIG, ...config };
  const { height, radius, color, stripeColor, emissiveIntensity, stripeCount } = cfg;

  // Create parent mesh
  const candyCane = new Mesh('cyberpunkCandyCane', scene);

  const primaryColor = hexToColor3(color);
  const secondaryColor = hexToColor3(stripeColor ?? '#ffffff');

  // Shaft (straight portion)
  const shaftHeight = height * 0.7;
  const shaft = MeshBuilder.CreateCylinder(
    'shaft',
    {
      height: shaftHeight,
      diameter: radius * 2,
      tessellation: 12,
    },
    scene
  );
  shaft.position.y = shaftHeight / 2;
  shaft.parent = candyCane;

  // Create curved hook portion using a tube along a path
  const hookRadius = height * 0.2;
  const hookSegments = 16;
  const hookPath: Vector3[] = [];

  // Generate hook path (semicircle)
  for (let i = 0; i <= hookSegments; i++) {
    const angle = (i / hookSegments) * Math.PI;
    const x = Math.sin(angle) * hookRadius;
    const y = shaftHeight + (1 - Math.cos(angle)) * hookRadius;
    hookPath.push(new Vector3(x, y, 0));
  }

  const hook = MeshBuilder.CreateTube(
    'hook',
    {
      path: hookPath,
      radius: radius,
      tessellation: 12,
      cap: 2, // Cap both ends
    },
    scene
  );
  hook.parent = candyCane;

  // Create stripe rings along the candy cane
  const stripeWidth = radius * 0.3;
  const stripeSpacing = (shaftHeight + Math.PI * hookRadius) / stripeCount!;

  // Stripes on shaft
  const shaftStripes = Math.floor(shaftHeight / stripeSpacing);
  for (let i = 0; i < shaftStripes; i++) {
    const stripe = MeshBuilder.CreateTorus(
      `stripe_${i}`,
      {
        diameter: radius * 2.1,
        thickness: stripeWidth,
        tessellation: 12,
      },
      scene
    );
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = i * stripeSpacing + stripeSpacing / 2;
    stripe.parent = candyCane;

    // Stripe material
    const stripeMat = new StandardMaterial(`stripeMat_${i}`, scene);
    stripeMat.diffuseColor = secondaryColor;
    stripeMat.emissiveColor = secondaryColor.scale(emissiveIntensity! * 0.8);
    stripe.material = stripeMat;
  }

  // Stripes on hook (positioned along the curve)
  const hookStripes = Math.ceil((Math.PI * hookRadius) / stripeSpacing);
  for (let i = 0; i < hookStripes; i++) {
    const t = (i + 0.5) / hookStripes;
    const angle = t * Math.PI;
    const x = Math.sin(angle) * hookRadius;
    const y = shaftHeight + (1 - Math.cos(angle)) * hookRadius;

    const stripe = MeshBuilder.CreateTorus(
      `hookStripe_${i}`,
      {
        diameter: radius * 2.1,
        thickness: stripeWidth,
        tessellation: 12,
      },
      scene
    );

    // Position and rotate to follow curve
    stripe.position.set(x, y, 0);
    stripe.rotation.z = angle;
    stripe.parent = candyCane;

    const stripeMat = new StandardMaterial(`hookStripeMat_${i}`, scene);
    stripeMat.diffuseColor = secondaryColor;
    stripeMat.emissiveColor = secondaryColor.scale(emissiveIntensity! * 0.8);
    stripe.material = stripeMat;
  }

  // Main material for shaft and hook
  const mainMat = new StandardMaterial('mainMat', scene);
  mainMat.diffuseColor = primaryColor;
  mainMat.emissiveColor = primaryColor.scale(emissiveIntensity!);
  mainMat.specularColor = new Color3(0.4, 0.4, 0.4);
  shaft.material = mainMat;
  hook.material = mainMat;

  return candyCane;
}

/**
 * Creates a simplified candy cane for distant/low-detail rendering
 *
 * @param scene - BabylonJS scene
 * @param config - Candy cane configuration
 * @returns Simplified mesh
 */
export function createSimpleCyberpunkCandyCane(
  scene: Scene,
  config: Partial<CyberpunkCandyCaneConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_CANDY_CANE_CONFIG, ...config };
  const { height, radius, color, emissiveIntensity } = cfg;

  // Simple cylinder representation
  const candyCane = MeshBuilder.CreateCylinder(
    'simpleCandyCane',
    {
      height,
      diameter: radius * 2,
      tessellation: 8,
    },
    scene
  );
  candyCane.position.y = height / 2;

  const primaryColor = hexToColor3(color);
  const mat = new StandardMaterial('simpleCandyCaneMat', scene);
  mat.diffuseColor = primaryColor;
  mat.emissiveColor = primaryColor.scale(emissiveIntensity ?? 0.5);
  candyCane.material = mat;

  return candyCane;
}

/**
 * Creates a candy cane with custom stripe pattern
 *
 * @param scene - BabylonJS scene
 * @param config - Base configuration
 * @param stripePattern - Array of colors for custom pattern
 * @returns Mesh with custom stripes
 */
export function createCustomStripeCandyCane(
  scene: Scene,
  config: Partial<CyberpunkCandyCaneConfig> = {},
  stripePattern: string[] = ['#ff0066', '#00ffcc', '#ffff00']
): Mesh {
  const cfg = { ...DEFAULT_CANDY_CANE_CONFIG, ...config };
  const { height, radius, emissiveIntensity } = cfg;

  const candyCane = new Mesh('customCandyCane', scene);

  // Create segments for each color
  const segmentHeight = height / stripePattern.length;

  stripePattern.forEach((colorHex, i) => {
    const segment = MeshBuilder.CreateCylinder(
      `segment_${i}`,
      {
        height: segmentHeight * 1.01, // Slight overlap
        diameter: radius * 2,
        tessellation: 12,
      },
      scene
    );
    segment.position.y = i * segmentHeight + segmentHeight / 2;
    segment.parent = candyCane;

    const color = hexToColor3(colorHex);
    const mat = new StandardMaterial(`segmentMat_${i}`, scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(emissiveIntensity ?? 0.5);
    segment.material = mat;
  });

  return candyCane;
}
