/**
 * @fileoverview Cyberpunk gift box mesh with ribbon
 * @module obstacles/CyberpunkPresent
 *
 * Creates a stylized gift box/present with neon ribbon accents
 * for the cyberpunk Christmas aesthetic.
 */

import {
  type Scene,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';

/**
 * Configuration for cyberpunk present
 */
export interface CyberpunkPresentConfig {
  /** Width of the box */
  width: number;
  /** Height of the box */
  height: number;
  /** Depth of the box */
  depth: number;
  /** Primary color (hex string) */
  color: string;
  /** Ribbon color (hex string) */
  ribbonColor?: string;
  /** Emissive intensity (0-1) */
  emissiveIntensity?: number;
}

/**
 * Default present configuration
 */
const DEFAULT_PRESENT_CONFIG: CyberpunkPresentConfig = {
  width: 1.5,
  height: 1.2,
  depth: 1.5,
  color: '#ff0044',
  ribbonColor: '#00ffcc',
  emissiveIntensity: 0.4,
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
  return new Color3(1, 0, 0.27); // Default red
}

/**
 * Creates a cyberpunk gift present template mesh
 *
 * The present consists of a box with crossed ribbon strips
 * and a bow on top, all with neon emissive accents.
 *
 * @param scene - BabylonJS scene
 * @param config - Present configuration
 * @returns Template mesh for instancing
 *
 * @example
 * ```typescript
 * const presentTemplate = createCyberpunkPresent(scene, {
 *   width: 1.5,
 *   color: '#ff0066',
 *   ribbonColor: '#00ffcc',
 * });
 *
 * const instance = presentTemplate.createInstance('present1');
 * instance.position.set(5, 0, 3);
 * ```
 */
export function createCyberpunkPresent(
  scene: Scene,
  config: Partial<CyberpunkPresentConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_PRESENT_CONFIG, ...config };
  const { width, height, depth, color, ribbonColor, emissiveIntensity } = cfg;

  // Create parent mesh
  const present = new Mesh('cyberpunkPresent', scene);

  // Box body
  const box = MeshBuilder.CreateBox(
    'box',
    { width, height, depth },
    scene
  );
  box.position.y = height / 2;
  box.parent = present;

  // Box material
  const baseColor = hexToColor3(color);
  const boxMat = new StandardMaterial('boxMat', scene);
  boxMat.diffuseColor = baseColor;
  boxMat.emissiveColor = baseColor.scale(emissiveIntensity! * 0.5);
  boxMat.specularColor = new Color3(0.3, 0.3, 0.3);
  box.material = boxMat;

  // Ribbon color
  const ribColor = hexToColor3(ribbonColor ?? '#00ffcc');

  // Create ribbon strips
  const ribbonWidth = width * 0.15;
  const ribbonThickness = 0.05;

  // Horizontal ribbon (across width)
  const ribbonH = MeshBuilder.CreateBox(
    'ribbonH',
    {
      width: width + 0.02,
      height: ribbonThickness,
      depth: ribbonWidth,
    },
    scene
  );
  ribbonH.position.y = height / 2;
  ribbonH.parent = present;

  // Vertical ribbon (across depth)
  const ribbonV = MeshBuilder.CreateBox(
    'ribbonV',
    {
      width: ribbonWidth,
      height: ribbonThickness,
      depth: depth + 0.02,
    },
    scene
  );
  ribbonV.position.y = height / 2;
  ribbonV.parent = present;

  // Side ribbons (vertical strips on box faces)
  const sideRibbonH = MeshBuilder.CreateBox(
    'sideRibbonH',
    {
      width: ribbonThickness,
      height: height + 0.02,
      depth: ribbonWidth,
    },
    scene
  );
  // Position on front and back
  const sideRibbonH1 = sideRibbonH.clone('sideRibbonH1');
  sideRibbonH1.position.set(-width / 2, height / 2, 0);
  sideRibbonH1.parent = present;
  const sideRibbonH2 = sideRibbonH.clone('sideRibbonH2');
  sideRibbonH2.position.set(width / 2, height / 2, 0);
  sideRibbonH2.parent = present;
  sideRibbonH.dispose();

  const sideRibbonV = MeshBuilder.CreateBox(
    'sideRibbonV',
    {
      width: ribbonWidth,
      height: height + 0.02,
      depth: ribbonThickness,
    },
    scene
  );
  const sideRibbonV1 = sideRibbonV.clone('sideRibbonV1');
  sideRibbonV1.position.set(0, height / 2, -depth / 2);
  sideRibbonV1.parent = present;
  const sideRibbonV2 = sideRibbonV.clone('sideRibbonV2');
  sideRibbonV2.position.set(0, height / 2, depth / 2);
  sideRibbonV2.parent = present;
  sideRibbonV.dispose();

  // Ribbon material
  const ribbonMat = new StandardMaterial('ribbonMat', scene);
  ribbonMat.diffuseColor = ribColor;
  ribbonMat.emissiveColor = ribColor.scale(emissiveIntensity!);
  ribbonMat.specularColor = new Color3(0.5, 0.5, 0.5);

  ribbonH.material = ribbonMat;
  ribbonV.material = ribbonMat;
  sideRibbonH1.material = ribbonMat;
  sideRibbonH2.material = ribbonMat;
  sideRibbonV1.material = ribbonMat;
  sideRibbonV2.material = ribbonMat;

  // Create bow on top
  const bow = createBow(scene, ribbonWidth * 2, ribColor, emissiveIntensity!);
  bow.position.y = height + ribbonWidth * 0.3;
  bow.parent = present;

  return present;
}

/**
 * Creates a decorative bow mesh
 */
function createBow(
  scene: Scene,
  size: number,
  color: Color3,
  emissiveIntensity: number
): Mesh {
  const bow = new Mesh('bow', scene);

  // Bow loops (two torus segments)
  const loopRadius = size * 0.4;
  const tubeRadius = size * 0.08;

  // Left loop
  const leftLoop = MeshBuilder.CreateTorus(
    'leftLoop',
    {
      diameter: loopRadius * 2,
      thickness: tubeRadius * 2,
      tessellation: 16,
    },
    scene
  );
  leftLoop.rotation.x = Math.PI / 2;
  leftLoop.rotation.y = Math.PI / 6;
  leftLoop.position.x = -loopRadius * 0.5;
  leftLoop.scaling.y = 0.5; // Flatten into loop shape
  leftLoop.parent = bow;

  // Right loop
  const rightLoop = leftLoop.clone('rightLoop');
  rightLoop.position.x = loopRadius * 0.5;
  rightLoop.rotation.y = -Math.PI / 6;
  rightLoop.parent = bow;

  // Center knot
  const knot = MeshBuilder.CreateSphere(
    'knot',
    { diameter: size * 0.3 },
    scene
  );
  knot.scaling.y = 0.6;
  knot.parent = bow;

  // Trailing ribbons
  const tailLength = size * 0.8;
  const tail1 = MeshBuilder.CreateBox(
    'tail1',
    {
      width: size * 0.15,
      height: tailLength,
      depth: tubeRadius * 2,
    },
    scene
  );
  tail1.position.set(-size * 0.1, -tailLength * 0.4, 0);
  tail1.rotation.z = -0.3;
  tail1.parent = bow;

  const tail2 = MeshBuilder.CreateBox(
    'tail2',
    {
      width: size * 0.15,
      height: tailLength,
      depth: tubeRadius * 2,
    },
    scene
  );
  tail2.position.set(size * 0.1, -tailLength * 0.4, 0);
  tail2.rotation.z = 0.3;
  tail2.parent = bow;

  // Bow material
  const bowMat = new StandardMaterial('bowMat', scene);
  bowMat.diffuseColor = color;
  bowMat.emissiveColor = color.scale(emissiveIntensity);
  bowMat.specularColor = new Color3(0.5, 0.5, 0.5);

  leftLoop.material = bowMat;
  rightLoop.material = bowMat;
  knot.material = bowMat;
  tail1.material = bowMat;
  tail2.material = bowMat;

  return bow;
}

/**
 * Creates a simplified present for distant/low-detail rendering
 *
 * @param scene - BabylonJS scene
 * @param config - Present configuration
 * @returns Simplified mesh
 */
export function createSimpleCyberpunkPresent(
  scene: Scene,
  config: Partial<CyberpunkPresentConfig> = {}
): Mesh {
  const cfg = { ...DEFAULT_PRESENT_CONFIG, ...config };
  const { width, height, depth, color, emissiveIntensity } = cfg;

  const present = MeshBuilder.CreateBox(
    'simplePresent',
    { width, height, depth },
    scene
  );
  present.position.y = height / 2;

  const baseColor = hexToColor3(color);
  const mat = new StandardMaterial('simplePresentMat', scene);
  mat.diffuseColor = baseColor;
  mat.emissiveColor = baseColor.scale(emissiveIntensity ?? 0.4);
  present.material = mat;

  return present;
}
