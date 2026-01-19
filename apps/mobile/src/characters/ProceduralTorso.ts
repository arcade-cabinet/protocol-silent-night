/**
 * @fileoverview Procedural torso mesh generation using BabylonJS
 * @module characters/ProceduralTorso
 *
 * Creates anime-style mech torsos using extrusion and shape building.
 * The torso is the main body piece connecting head, arms, and hips.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
  VertexData,
} from '@babylonjs/core';
import type { TorsoConfig } from './CharacterTypes';

/**
 * Default torso configuration for a standard humanoid
 */
export const DEFAULT_TORSO_CONFIG: TorsoConfig = {
  hipWidth: 0.35,
  shoulderWidth: 0.5,
  height: 0.8,
  depth: 0.25,
  segments: 8,
  scale: 1.0,
};

/**
 * Generates a cross-section shape for torso extrusion
 * Creates a rounded rectangle profile
 */
function generateTorsoCrossSection(
  width: number,
  depth: number,
  cornerRadius: number = 0.05,
  segments: number = 4
): Vector3[] {
  const points: Vector3[] = [];
  const hw = width / 2;
  const hd = depth / 2;
  const r = Math.min(cornerRadius, hw * 0.3, hd * 0.3);

  // Generate rounded rectangle (counter-clockwise)
  // Bottom-right corner
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI / 2) * (i / segments);
    points.push(
      new Vector3(hw - r + Math.cos(angle) * r, 0, -hd + r - Math.sin(angle) * r)
    );
  }

  // Bottom-left corner
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI / 2) * (i / segments) + Math.PI / 2;
    points.push(
      new Vector3(-hw + r + Math.cos(angle) * r, 0, -hd + r - Math.sin(angle) * r)
    );
  }

  // Top-left corner
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI / 2) * (i / segments) + Math.PI;
    points.push(
      new Vector3(-hw + r + Math.cos(angle) * r, 0, hd - r - Math.sin(angle) * r)
    );
  }

  // Top-right corner
  for (let i = 0; i <= segments; i++) {
    const angle = (Math.PI / 2) * (i / segments) + (3 * Math.PI) / 2;
    points.push(
      new Vector3(hw - r + Math.cos(angle) * r, 0, hd - r - Math.sin(angle) * r)
    );
  }

  return points;
}

/**
 * Generates the extrusion path for the torso (bottom to top)
 */
function generateTorsoPath(config: TorsoConfig): Vector3[] {
  const { height, segments } = config;
  const points: Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Slight S-curve for more natural posture
    const y = t * height;
    const zOffset = Math.sin(t * Math.PI) * 0.02; // Subtle forward curve
    points.push(new Vector3(0, y, zOffset));
  }

  return points;
}

/**
 * Scaling function for the torso extrusion
 * Tapers from hips to shoulders then narrows at neck
 */
function torsoScaleFunction(
  config: TorsoConfig
): (i: number, distance: number) => number {
  const { hipWidth, shoulderWidth } = config;

  return (_i: number, distance: number): number => {
    // Normalize distance to 0-1 range
    const t = distance / config.height;

    if (t < 0.3) {
      // Hip to waist - narrow
      return hipWidth + (shoulderWidth - hipWidth) * (t / 0.3) * 0.5;
    } else if (t < 0.7) {
      // Waist to chest - expand
      const localT = (t - 0.3) / 0.4;
      return hipWidth * 0.75 + shoulderWidth * 0.25 + localT * shoulderWidth * 0.5;
    } else {
      // Chest to shoulders - max width then taper for neck
      const localT = (t - 0.7) / 0.3;
      const peakWidth = shoulderWidth;
      return peakWidth * (1 - localT * 0.2);
    }
  };
}

/**
 * Creates the main torso mesh using extrusion
 *
 * @param scene - BabylonJS scene
 * @param config - Torso configuration
 * @param color - Primary color for the material
 * @returns The generated torso mesh
 */
export function createTorsoMesh(
  scene: Scene,
  config: Partial<TorsoConfig> = {},
  color: string = '#2a2a3a'
): Mesh {
  const fullConfig: TorsoConfig = { ...DEFAULT_TORSO_CONFIG, ...config };
  const { depth, scale, segments } = fullConfig;

  // Generate the cross-section shape
  const shape = generateTorsoCrossSection(1, depth, 0.05, 4);

  // Generate the extrusion path
  const path = generateTorsoPath(fullConfig);

  // Create the extruded mesh with scaling
  const torso = MeshBuilder.ExtrudeShapeCustom(
    'torso',
    {
      shape,
      path,
      scaleFunction: torsoScaleFunction(fullConfig),
      sideOrientation: Mesh.DOUBLESIDE,
      cap: Mesh.CAP_ALL,
      updatable: false,
    },
    scene
  );

  // Apply scale
  torso.scaling.setAll(scale);

  // Create material
  const material = new StandardMaterial('torsoMat', scene);
  const c3 = Color3.FromHexString(color);
  material.diffuseColor = c3;
  material.specularColor = new Color3(0.3, 0.3, 0.35);
  material.specularPower = 32;
  torso.material = material;

  return torso;
}

/**
 * Creates a simplified box-based torso for lower detail levels
 * Faster to render than extruded version
 *
 * @param scene - BabylonJS scene
 * @param config - Torso configuration
 * @param color - Primary color for the material
 * @returns The generated torso mesh
 */
export function createSimpleTorsoMesh(
  scene: Scene,
  config: Partial<TorsoConfig> = {},
  color: string = '#2a2a3a'
): Mesh {
  const fullConfig: TorsoConfig = { ...DEFAULT_TORSO_CONFIG, ...config };
  const { hipWidth, shoulderWidth, height, depth, scale } = fullConfig;

  // Create tapered box using vertex manipulation
  const torso = MeshBuilder.CreateBox(
    'torso_simple',
    {
      width: shoulderWidth,
      height: height,
      depth: depth,
      updatable: true,
    },
    scene
  );

  // Get vertex data to modify
  const positions = torso.getVerticesData('position');
  if (positions) {
    // Taper the bottom vertices
    for (let i = 0; i < positions.length; i += 3) {
      const y = positions[i + 1];
      if (y < 0) {
        // Bottom vertices - scale X to hip width
        const ratio = hipWidth / shoulderWidth;
        positions[i] *= ratio;
      }
    }

    // Update the mesh
    const vertexData = new VertexData();
    vertexData.positions = positions;
    vertexData.indices = torso.getIndices() ?? [];
    vertexData.normals = [];
    VertexData.ComputeNormals(
      positions,
      vertexData.indices,
      vertexData.normals
    );
    vertexData.applyToMesh(torso, true);
  }

  // Apply scale
  torso.scaling.setAll(scale);
  torso.position.y = height / 2;

  // Create material
  const material = new StandardMaterial('torsoSimpleMat', scene);
  const c3 = Color3.FromHexString(color);
  material.diffuseColor = c3;
  material.specularColor = new Color3(0.3, 0.3, 0.35);
  material.specularPower = 32;
  torso.material = material;

  return torso;
}

/**
 * Creates chest armor plate detail
 * Adds visual interest to the torso
 *
 * @param scene - BabylonJS scene
 * @param width - Plate width
 * @param height - Plate height
 * @param color - Plate color
 * @returns Chest plate mesh
 */
export function createChestPlate(
  scene: Scene,
  width: number = 0.3,
  height: number = 0.25,
  color: string = '#4a4a5a'
): Mesh {
  const plate = MeshBuilder.CreateBox(
    'chestPlate',
    {
      width,
      height,
      depth: 0.05,
    },
    scene
  );

  const material = new StandardMaterial('chestPlateMat', scene);
  const c3 = Color3.FromHexString(color);
  material.diffuseColor = c3;
  material.specularColor = new Color3(0.5, 0.5, 0.5);
  material.specularPower = 64;
  plate.material = material;

  return plate;
}

/**
 * Creates back armor/jetpack mount detail
 *
 * @param scene - BabylonJS scene
 * @param width - Mount width
 * @param height - Mount height
 * @param color - Mount color
 * @returns Back mount mesh
 */
export function createBackMount(
  scene: Scene,
  width: number = 0.2,
  height: number = 0.3,
  color: string = '#3a3a4a'
): Mesh {
  const mount = MeshBuilder.CreateCylinder(
    'backMount',
    {
      diameter: width,
      height,
      tessellation: 6,
    },
    scene
  );

  mount.rotation.x = Math.PI / 2;

  const material = new StandardMaterial('backMountMat', scene);
  const c3 = Color3.FromHexString(color);
  material.diffuseColor = c3;
  material.specularColor = new Color3(0.4, 0.4, 0.4);
  mount.material = material;

  return mount;
}
