/**
 * @fileoverview Shell-based fur rendering for BabylonJS
 * @module characters/ShellFurEffect
 *
 * Implements fur using the shell rendering technique:
 * - Multiple offset layers of the base mesh
 * - Each shell has alpha-tested noise for fur strands
 * - Animation via vertex displacement in shader
 *
 * This replaces @jbcom/strata's fur system with pure BabylonJS.
 */

import {
  type Scene,
  type Mesh,
  ShaderMaterial,
  Color3,
  Effect,
} from '@babylonjs/core';

/**
 * Configuration for fur effect
 */
export interface FurConfig {
  /** Base fur color at root */
  baseColor: string;
  /** Tip color at fur ends */
  tipColor: string;
  /** Number of shell layers (more = denser fur, more GPU) */
  layerCount: number;
  /** Spacing between shells */
  spacing: number;
  /** Wind animation strength */
  windStrength: number;
  /** Gravity droop factor */
  gravityDroop: number;
}

/**
 * Default fur configuration
 */
export const DEFAULT_FUR_CONFIG: FurConfig = {
  baseColor: '#cc4444',
  tipColor: '#ffaa88',
  layerCount: 8,
  spacing: 0.02,
  windStrength: 0.1,
  gravityDroop: 0.04,
};

/**
 * Result from creating fur effect
 */
export interface FurEffectResult {
  /** Shell meshes */
  shells: Mesh[];
  /** Update function for animation */
  update: (time: number) => void;
  /** Set wind direction */
  setWindDirection: (x: number, y: number, z: number) => void;
  /** Dispose all resources */
  dispose: () => void;
}

// Register custom shader
const furVertexShader = `
  precision highp float;

  // Attributes
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec2 uv;

  // Uniforms
  uniform mat4 world;
  uniform mat4 worldViewProjection;
  uniform float layerIndex;
  uniform float totalLayers;
  uniform float spacing;
  uniform float time;
  uniform float windStrength;
  uniform float gravityDroop;
  uniform vec3 windDirection;

  // Varyings
  varying vec2 vUV;
  varying float vLayerFactor;

  // Simple noise function
  float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vUV = uv;
    vLayerFactor = layerIndex / totalLayers;

    // Offset position along normal
    float shellOffset = layerIndex * spacing;
    vec3 offsetPos = position + normal * shellOffset;

    // Apply wind animation (stronger at tips)
    float windFactor = vLayerFactor * windStrength;
    float windAngle = time * 2.0 + position.x * 0.5 + position.z * 0.5;
    offsetPos.x += sin(windAngle) * windFactor * windDirection.x;
    offsetPos.z += cos(windAngle * 0.7) * windFactor * windDirection.z;

    // Apply gravity droop (stronger at tips)
    offsetPos.y -= vLayerFactor * vLayerFactor * gravityDroop;

    gl_Position = worldViewProjection * vec4(offsetPos, 1.0);
  }
`;

const furFragmentShader = `
  precision highp float;

  // Uniforms
  uniform vec3 baseColor;
  uniform vec3 tipColor;
  uniform float layerIndex;
  uniform float totalLayers;
  uniform float furDensity;
  uniform float furThickness;

  // Varyings
  varying vec2 vUV;
  varying float vLayerFactor;

  // Noise functions for fur strands
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    // Generate fur strand pattern
    vec2 furUV = vUV * furDensity;
    float strand = noise(furUV);

    // Fur gets thinner at tips
    float thickness = furThickness * (1.0 - vLayerFactor * 0.7);

    // Alpha test - discard if below threshold
    float alpha = step(vLayerFactor, strand * thickness);
    if (alpha < 0.5) discard;

    // Color gradient from base to tip
    vec3 color = mix(baseColor, tipColor, vLayerFactor);

    // Add some variation
    color *= 0.9 + noise(vUV * 50.0) * 0.2;

    // Darken at base for depth
    color *= 0.7 + vLayerFactor * 0.3;

    gl_FragColor = vec4(color, 1.0);
  }
`;

let shaderRegistered = false;

/**
 * Register the fur shader with BabylonJS
 */
function registerFurShader(): void {
  if (shaderRegistered) return;

  Effect.ShadersStore.furVertexShader = furVertexShader;
  Effect.ShadersStore.furFragmentShader = furFragmentShader;
  shaderRegistered = true;
}

/**
 * Creates shell-based fur effect on a mesh
 *
 * @param scene - BabylonJS scene
 * @param baseMesh - Mesh to add fur to
 * @param config - Fur configuration
 * @returns FurEffectResult with shells and controls
 *
 * @example
 * ```typescript
 * const fur = createFurEffect(scene, torsoMesh, {
 *   baseColor: '#cc4444',
 *   tipColor: '#ffaa88',
 *   layerCount: 8,
 * });
 *
 * // In render loop
 * fur.update(time);
 *
 * // Cleanup
 * fur.dispose();
 * ```
 */
export function createFurEffect(
  scene: Scene,
  baseMesh: Mesh,
  config: Partial<FurConfig> = {}
): FurEffectResult {
  const cfg = { ...DEFAULT_FUR_CONFIG, ...config };

  // Register shader if needed
  registerFurShader();

  const baseColor = Color3.FromHexString(cfg.baseColor);
  const tipColor = Color3.FromHexString(cfg.tipColor);

  // Wind direction (will be animated)
  let windDir = { x: 1, y: 0, z: 0.5 };

  // Create shell meshes
  const shells: Mesh[] = [];
  const materials: ShaderMaterial[] = [];

  for (let i = 0; i < cfg.layerCount; i++) {
    // Clone the base mesh for each shell
    const shell = baseMesh.clone(`furShell_${i}`);
    shell.isPickable = false;

    // Create shader material for this shell
    const material = new ShaderMaterial(
      `furMaterial_${i}`,
      scene,
      {
        vertex: 'fur',
        fragment: 'fur',
      },
      {
        attributes: ['position', 'normal', 'uv'],
        uniforms: [
          'world',
          'worldViewProjection',
          'layerIndex',
          'totalLayers',
          'spacing',
          'time',
          'windStrength',
          'gravityDroop',
          'windDirection',
          'baseColor',
          'tipColor',
          'furDensity',
          'furThickness',
        ],
      }
    );

    // Set static uniforms
    material.setFloat('layerIndex', i + 1);
    material.setFloat('totalLayers', cfg.layerCount);
    material.setFloat('spacing', cfg.spacing);
    material.setFloat('windStrength', cfg.windStrength);
    material.setFloat('gravityDroop', cfg.gravityDroop);
    material.setVector3('windDirection', windDir);
    material.setColor3('baseColor', baseColor);
    material.setColor3('tipColor', tipColor);
    material.setFloat('furDensity', 100);
    material.setFloat('furThickness', 1.2);
    material.setFloat('time', 0);

    // Enable alpha blending for outer shells
    if (i > cfg.layerCount / 2) {
      material.alpha = 0.95;
      material.alphaMode = 1; // ADD
    }

    // Back face culling off for shells
    material.backFaceCulling = false;

    shell.material = material;
    shells.push(shell);
    materials.push(material);
  }

  // Update function
  const update = (time: number): void => {
    for (const material of materials) {
      material.setFloat('time', time);
      material.setVector3('windDirection', windDir);
    }
  };

  // Wind direction setter
  const setWindDirection = (x: number, y: number, z: number): void => {
    windDir = { x, y, z };
  };

  // Dispose function
  const dispose = (): void => {
    for (const shell of shells) {
      shell.dispose();
    }
    for (const material of materials) {
      material.dispose();
    }
  };

  return {
    shells,
    update,
    setWindDirection,
    dispose,
  };
}

/**
 * Creates simplified fur using instanced thin boxes
 * For lower-end devices where shell shaders are too expensive
 *
 * @param scene - BabylonJS scene
 * @param baseMesh - Mesh to add fur to
 * @param config - Fur configuration
 * @returns FurEffectResult
 */
export function createSimpleFurEffect(
  _scene: Scene,
  baseMesh: Mesh,
  config: Partial<FurConfig> = {}
): FurEffectResult {
  // Simplified version - just tint the base mesh and add shell layers
  const cfg = { ...DEFAULT_FUR_CONFIG, ...config };
  const shells: Mesh[] = [];

  // Create fewer shells for performance
  const simpleLayers = Math.min(cfg.layerCount, 4);

  for (let i = 0; i < simpleLayers; i++) {
    const shell = baseMesh.clone(`simpleFurShell_${i}`);
    shell.isPickable = false;

    // Scale slightly larger for each shell
    const scaleFactor = 1 + i * cfg.spacing;
    shell.scaling.scaleInPlace(scaleFactor);

    // Make outer shells more transparent
    if (shell.material) {
      const mat = shell.material.clone(`simpleFurMat_${i}`);
      // @ts-expect-error - alpha property exists
      mat.alpha = 1 - i * 0.2;
      shell.material = mat;
    }

    shells.push(shell);
  }

  return {
    shells,
    update: () => {},
    setWindDirection: () => {},
    dispose: () => {
      for (const shell of shells) {
        shell.dispose();
      }
    },
  };
}

/**
 * Applies fur color tinting to a character based on DDL config
 *
 * @param config - Fur options from DDL
 * @returns CSS-compatible color string
 */
export function getFurTintColor(config: FurConfig): string {
  // Blend base and tip colors
  const base = Color3.FromHexString(config.baseColor);
  const tip = Color3.FromHexString(config.tipColor);
  const blend = Color3.Lerp(base, tip, 0.4);
  return blend.toHexString();
}
