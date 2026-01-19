/**
 * @fileoverview Procedural sky dome with gradient shader for Protocol: Silent Night
 * @module lighting/ProceduralSky
 *
 * Creates a gradient sky dome for cyberpunk Christmas night atmosphere.
 * Replaces @jbcom/strata ProceduralSky with native BabylonJS implementation.
 * Includes optional aurora animation effect.
 */

import {
  MeshBuilder,
  ShaderMaterial,
  Effect,
  Mesh,
} from '@babylonjs/core';
import type {
  ProceduralSkyProps,
  ProceduralSkyResult,
  GradientSkyConfig,
} from './LightingTypes';
import { hexToColor3 } from './LightingSystem';

/**
 * Sky dome radius - large enough to encompass entire scene
 */
const SKY_DOME_RADIUS = 500;

/**
 * Sky dome segments - balance quality vs performance
 */
const SKY_DOME_SEGMENTS = 32;

/**
 * Vertex shader for gradient sky
 */
const SKY_VERTEX_SHADER = `
  precision highp float;

  // Attributes
  attribute vec3 position;
  attribute vec2 uv;

  // Uniforms
  uniform mat4 worldViewProjection;

  // Varyings
  varying vec2 vUV;
  varying vec3 vPosition;

  void main() {
    vUV = uv;
    vPosition = position;
    gl_Position = worldViewProjection * vec4(position, 1.0);
  }
`;

/**
 * Fragment shader for gradient sky with aurora effect
 */
const SKY_FRAGMENT_SHADER = `
  precision highp float;

  // Varyings
  varying vec2 vUV;
  varying vec3 vPosition;

  // Uniforms
  uniform vec3 topColor;
  uniform vec3 horizonColor;
  uniform vec3 groundColor;
  uniform float starVisibility;
  uniform float time;
  uniform float auroraIntensity;

  // Pseudo-random function for stars
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // Star field generation
  float stars(vec2 uv, float density) {
    vec2 id = floor(uv * density);
    vec2 f = fract(uv * density);

    float r = random(id);

    // Only show some cells as stars
    if (r < 0.98) return 0.0;

    // Star position within cell
    vec2 starPos = vec2(random(id + 0.1), random(id + 0.2));
    float d = length(f - starPos);

    // Twinkle effect
    float twinkle = sin(time * (random(id) * 2.0 + 1.0)) * 0.5 + 0.5;

    // Star brightness
    float star = smoothstep(0.1, 0.0, d) * (0.5 + 0.5 * twinkle);

    return star;
  }

  // Aurora effect
  vec3 aurora(vec2 uv, float intensity) {
    if (intensity <= 0.0) return vec3(0.0);

    float y = uv.y;

    // Aurora only appears in upper portion of sky
    if (y < 0.4) return vec3(0.0);

    // Wave pattern
    float wave1 = sin(uv.x * 10.0 + time * 0.3) * 0.5 + 0.5;
    float wave2 = sin(uv.x * 7.0 - time * 0.2 + 1.5) * 0.5 + 0.5;
    float wave3 = sin(uv.x * 15.0 + time * 0.5 + 3.0) * 0.5 + 0.5;

    float wave = (wave1 + wave2 * 0.5 + wave3 * 0.25) / 1.75;

    // Vertical falloff
    float verticalFade = smoothstep(0.4, 0.7, y) * smoothstep(1.0, 0.8, y);

    // Aurora colors (green and cyan with hints of purple)
    vec3 auroraColor1 = vec3(0.2, 1.0, 0.5); // Green
    vec3 auroraColor2 = vec3(0.0, 0.8, 1.0); // Cyan
    vec3 auroraColor3 = vec3(0.5, 0.2, 0.8); // Purple

    float colorMix = sin(uv.x * 5.0 + time * 0.1) * 0.5 + 0.5;
    vec3 auroraColor = mix(
      mix(auroraColor1, auroraColor2, colorMix),
      auroraColor3,
      wave3 * 0.3
    );

    return auroraColor * wave * verticalFade * intensity * 0.3;
  }

  void main() {
    // Normalize height (0 at horizon, 1 at top, -1 at bottom)
    float height = normalize(vPosition).y;

    // Calculate gradient
    vec3 color;

    if (height > 0.0) {
      // Sky gradient (horizon to top)
      float t = smoothstep(0.0, 0.8, height);
      color = mix(horizonColor, topColor, t);

      // Add stars to upper sky
      if (starVisibility > 0.0 && height > 0.2) {
        float starField = stars(vUV * 2.0, 100.0);
        starField += stars(vUV * 2.0 + 0.5, 150.0) * 0.5;
        starField += stars(vUV * 2.0 + 0.25, 200.0) * 0.3;

        float starFade = smoothstep(0.2, 0.5, height);
        color += vec3(1.0, 0.95, 0.9) * starField * starVisibility * starFade;
      }

      // Add aurora
      color += aurora(vec2(vUV.x, height), auroraIntensity);
    } else {
      // Ground gradient (horizon to nadir)
      float t = smoothstep(0.0, -0.5, height);
      color = mix(horizonColor, groundColor, t);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Register custom sky shader with BabylonJS
 */
function registerSkyShader(): void {
  if (Effect.ShadersStore.proceduralSkyVertexShader) {
    return; // Already registered
  }

  Effect.ShadersStore.proceduralSkyVertexShader = SKY_VERTEX_SHADER;
  Effect.ShadersStore.proceduralSkyFragmentShader = SKY_FRAGMENT_SHADER;
}

/**
 * Default gradient colors for cyberpunk night sky
 */
export function getDefaultGradientColors(): GradientSkyConfig {
  return {
    topColor: '#0a0a1a', // Deep purple-black
    horizonColor: '#1a1a2e', // Dark purple
    groundColor: '#050510', // Near black
  };
}

/**
 * Creates a procedural sky dome with gradient shader
 *
 * @param props - Scene and sky configuration
 * @returns Procedural sky with mesh, update function, and disposal
 *
 * @example
 * ```typescript
 * const sky = createProceduralSky({
 *   scene,
 *   config: themeConfig.sky,
 *   enableAurora: true,
 * });
 *
 * // In render loop (for aurora animation)
 * sky.update?.(deltaTime);
 *
 * // Cleanup
 * sky.dispose();
 * ```
 */
export function createProceduralSky(
  props: ProceduralSkyProps
): ProceduralSkyResult {
  const { scene, config, gradientColors, enableAurora = false } = props;

  // Register shader if needed
  registerSkyShader();

  // Get gradient colors
  const colors = gradientColors ?? getDefaultGradientColors();

  // Create sky dome mesh (inverted sphere)
  const skyDome = MeshBuilder.CreateSphere(
    'skyDome',
    {
      diameter: SKY_DOME_RADIUS * 2,
      segments: SKY_DOME_SEGMENTS,
      sideOrientation: Mesh.BACKSIDE, // Render inside of sphere
    },
    scene
  );

  // Sky dome should not write to depth or receive shadows
  skyDome.isPickable = false;
  skyDome.infiniteDistance = true;

  // Create shader material
  const skyMaterial = new ShaderMaterial(
    'skyMaterial',
    scene,
    {
      vertex: 'proceduralSky',
      fragment: 'proceduralSky',
    },
    {
      attributes: ['position', 'uv'],
      uniforms: [
        'worldViewProjection',
        'topColor',
        'horizonColor',
        'groundColor',
        'starVisibility',
        'time',
        'auroraIntensity',
      ],
    }
  );

  // Set initial uniforms
  skyMaterial.setColor3('topColor', hexToColor3(colors.topColor));
  skyMaterial.setColor3('horizonColor', hexToColor3(colors.horizonColor));
  skyMaterial.setColor3('groundColor', hexToColor3(colors.groundColor));
  skyMaterial.setFloat('starVisibility', config.starVisibility);
  skyMaterial.setFloat('time', 0);
  skyMaterial.setFloat('auroraIntensity', enableAurora ? config.weatherIntensity : 0);

  // Disable backface culling (we want to see inside)
  skyMaterial.backFaceCulling = false;

  // Apply material
  skyDome.material = skyMaterial;

  // Animation state
  let totalTime = 0;

  /**
   * Update sky animations (stars twinkle, aurora movement)
   * @param deltaTime - Time since last frame in seconds
   */
  function update(deltaTime: number): void {
    totalTime += deltaTime;
    skyMaterial.setFloat('time', totalTime);
  }

  /**
   * Dispose sky resources
   */
  function dispose(): void {
    skyMaterial.dispose();
    skyDome.dispose();
  }

  return {
    mesh: skyDome,
    update: enableAurora || config.starVisibility > 0 ? update : undefined,
    dispose,
  };
}

/**
 * Updates sky colors dynamically (for day/night transitions)
 *
 * @param mesh - Sky dome mesh
 * @param colors - New gradient colors
 */
export function updateSkyColors(
  mesh: Mesh,
  colors: GradientSkyConfig
): void {
  const material = mesh.material as ShaderMaterial;
  if (!material || !material.setColor3) return;

  material.setColor3('topColor', hexToColor3(colors.topColor));
  material.setColor3('horizonColor', hexToColor3(colors.horizonColor));
  material.setColor3('groundColor', hexToColor3(colors.groundColor));
}

/**
 * Updates aurora intensity dynamically
 *
 * @param mesh - Sky dome mesh
 * @param intensity - Aurora intensity (0-1)
 */
export function updateAuroraIntensity(
  mesh: Mesh,
  intensity: number
): void {
  const material = mesh.material as ShaderMaterial;
  if (!material || !material.setFloat) return;

  material.setFloat('auroraIntensity', intensity);
}

/**
 * Updates star visibility dynamically
 *
 * @param mesh - Sky dome mesh
 * @param visibility - Star visibility (0-1)
 */
export function updateStarVisibility(
  mesh: Mesh,
  visibility: number
): void {
  const material = mesh.material as ShaderMaterial;
  if (!material || !material.setFloat) return;

  material.setFloat('starVisibility', visibility);
}
