/**
 * @fileoverview Volumetric fog system for Protocol: Silent Night
 * @module lighting/VolumetricFog
 *
 * Creates atmospheric fog effects for cyberpunk night atmosphere.
 * Uses BabylonJS built-in fog with optional height-based volumetric effect.
 */

import { type Scene, Vector3, Effect, ShaderMaterial, MeshBuilder, type Mesh } from '@babylonjs/core';
import type { BasicFogConfig, VolumetricFogConfig, HexColor } from './LightingTypes';
import { hexToColor3 } from './LightingSystem';

/**
 * Fog mode constants from BabylonJS
 */
export const FogMode = {
  NONE: 0,
  EXP: 1,
  EXP2: 2,
  LINEAR: 3,
} as const;

/**
 * Volumetric fog plane size
 */
const FOG_PLANE_SIZE = 200;

/**
 * Volumetric fog vertex shader
 */
const VOLUMETRIC_FOG_VERTEX_SHADER = `
  precision highp float;

  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 worldViewProjection;
  uniform mat4 world;

  varying vec2 vUV;
  varying vec3 vWorldPosition;

  void main() {
    vUV = uv;
    vWorldPosition = (world * vec4(position, 1.0)).xyz;
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

/**
 * Volumetric fog fragment shader with height falloff
 */
const VOLUMETRIC_FOG_FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUV;
  varying vec3 vWorldPosition;

  uniform vec3 fogColor;
  uniform float fogDensity;
  uniform float fogHeight;
  uniform float time;
  uniform vec3 cameraPosition;

  // Noise function for fog variation
  float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float smoothNoise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
           (c - a) * u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
  }

  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
      value += amplitude * smoothNoise(st * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    // Height-based fog falloff
    float heightFactor = smoothstep(fogHeight, 0.0, vWorldPosition.y);

    // Distance-based fog
    float dist = length(vWorldPosition.xz - cameraPosition.xz);
    float distFog = 1.0 - exp(-fogDensity * dist * dist);

    // Animated noise for fog variation
    vec2 noiseCoord = vWorldPosition.xz * 0.02 + vec2(time * 0.01, time * 0.005);
    float noiseValue = fbm(noiseCoord) * 0.3 + 0.7;

    // Combine factors
    float fogAmount = heightFactor * distFog * noiseValue;

    // Output with transparency
    gl_FragColor = vec4(fogColor, fogAmount * 0.6);
  }
`;

/**
 * Sets up basic exponential fog on the scene
 *
 * @param scene - BabylonJS scene
 * @param config - Fog configuration from DDL
 *
 * @example
 * ```typescript
 * setupFog(scene, {
 *   color: '#050505',
 *   density: 0.025,
 * });
 * ```
 */
export function setupFog(scene: Scene, config: BasicFogConfig): void {
  scene.fogMode = FogMode.EXP2;
  scene.fogDensity = config.density;
  scene.fogColor = hexToColor3(config.color);
}

/**
 * Disables fog on the scene
 *
 * @param scene - BabylonJS scene
 */
export function clearFog(scene: Scene): void {
  scene.fogMode = FogMode.NONE;
}

/**
 * Updates fog density dynamically
 *
 * @param scene - BabylonJS scene
 * @param density - New fog density
 */
export function setFogDensity(scene: Scene, density: number): void {
  scene.fogDensity = density;
}

/**
 * Updates fog color dynamically
 *
 * @param scene - BabylonJS scene
 * @param color - New fog color as hex string
 */
export function setFogColor(scene: Scene, color: HexColor): void {
  scene.fogColor = hexToColor3(color);
}

/**
 * Result of creating volumetric fog system
 */
export interface VolumetricFogResult {
  /** Fog plane mesh */
  mesh: Mesh;
  /** Update for animated fog */
  update: (deltaTime: number, cameraPosition: Vector3) => void;
  /** Set fog density */
  setDensity: (density: number) => void;
  /** Set fog height */
  setHeight: (height: number) => void;
  /** Set fog color */
  setColor: (color: HexColor) => void;
  /** Dispose fog resources */
  dispose: () => void;
}

/**
 * Register volumetric fog shader
 */
function registerVolumetricFogShader(): void {
  if (Effect.ShadersStore.volumetricFogVertexShader) {
    return;
  }

  Effect.ShadersStore.volumetricFogVertexShader = VOLUMETRIC_FOG_VERTEX_SHADER;
  Effect.ShadersStore.volumetricFogFragmentShader = VOLUMETRIC_FOG_FRAGMENT_SHADER;
}

/**
 * Creates volumetric fog with height-based falloff
 * This creates a visible fog plane that moves with the camera.
 *
 * Note: This is more expensive than basic fog and should be
 * used sparingly on mobile devices.
 *
 * @param scene - BabylonJS scene
 * @param config - Volumetric fog configuration
 * @returns Volumetric fog system with controls
 *
 * @example
 * ```typescript
 * const volumetricFog = createVolumetricFog(scene, {
 *   color: '#0a0a20',
 *   density: 0.015,
 *   height: 20,
 * });
 *
 * // In render loop
 * volumetricFog.update(deltaTime, camera.position);
 *
 * // Cleanup
 * volumetricFog.dispose();
 * ```
 */
export function createVolumetricFog(
  scene: Scene,
  config: VolumetricFogConfig
): VolumetricFogResult {
  // Register shader
  registerVolumetricFogShader();

  // Create fog plane
  const fogPlane = MeshBuilder.CreateGround(
    'volumetricFog',
    {
      width: FOG_PLANE_SIZE,
      height: FOG_PLANE_SIZE,
      subdivisions: 1,
    },
    scene
  );

  // Position at fog height
  fogPlane.position.y = config.height * 0.5;

  // Not pickable
  fogPlane.isPickable = false;

  // Create shader material
  const fogMaterial = new ShaderMaterial(
    'volumetricFogMaterial',
    scene,
    {
      vertex: 'volumetricFog',
      fragment: 'volumetricFog',
    },
    {
      attributes: ['position', 'uv'],
      uniforms: [
        'worldViewProjection',
        'world',
        'fogColor',
        'fogDensity',
        'fogHeight',
        'time',
        'cameraPosition',
      ],
      needAlphaBlending: true,
    }
  );

  // Set initial uniforms
  fogMaterial.setColor3('fogColor', hexToColor3(config.color));
  fogMaterial.setFloat('fogDensity', config.density);
  fogMaterial.setFloat('fogHeight', config.height);
  fogMaterial.setFloat('time', 0);
  fogMaterial.setVector3('cameraPosition', Vector3.Zero());

  // Enable alpha blending
  fogMaterial.alpha = 1.0;
  fogMaterial.backFaceCulling = false;

  fogPlane.material = fogMaterial;

  // Animation state
  let totalTime = 0;

  /**
   * Update volumetric fog animation and camera tracking
   */
  function update(deltaTime: number, cameraPosition: Vector3): void {
    totalTime += deltaTime;
    fogMaterial.setFloat('time', totalTime);
    fogMaterial.setVector3('cameraPosition', cameraPosition);

    // Move fog plane with camera (XZ only)
    fogPlane.position.x = cameraPosition.x;
    fogPlane.position.z = cameraPosition.z;
  }

  /**
   * Set fog density
   */
  function setDensity(density: number): void {
    fogMaterial.setFloat('fogDensity', density);
  }

  /**
   * Set fog height cutoff
   */
  function setHeight(height: number): void {
    fogMaterial.setFloat('fogHeight', height);
    fogPlane.position.y = height * 0.5;
  }

  /**
   * Set fog color
   */
  function setColor(color: HexColor): void {
    fogMaterial.setColor3('fogColor', hexToColor3(color));
  }

  /**
   * Dispose fog resources
   */
  function dispose(): void {
    fogMaterial.dispose();
    fogPlane.dispose();
  }

  return {
    mesh: fogPlane,
    update,
    setDensity,
    setHeight,
    setColor,
    dispose,
  };
}

/**
 * Creates a simple fog configuration for cyberpunk night
 */
export function getDefaultFogConfig(): BasicFogConfig {
  return {
    color: '#050505',
    density: 0.025,
  };
}

/**
 * Creates a volumetric fog configuration for cyberpunk night
 */
export function getDefaultVolumetricFogConfig(): VolumetricFogConfig {
  return {
    color: '#0a0a20',
    density: 0.015,
    height: 20,
  };
}
