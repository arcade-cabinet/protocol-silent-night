/**
 * @fileoverview DDL-driven lighting system for Protocol: Silent Night
 * @module lighting/LightingSystem
 *
 * Creates ambient, moonlight, and shadow systems driven by theme configuration.
 * Optimized for mobile performance with configurable shadow quality.
 */

import {
  HemisphericLight,
  DirectionalLight,
  ShadowGenerator,
  Vector3,
  Color3,
} from '@babylonjs/core';
import type {
  LightingSystemProps,
  LightingSystemResult,
  ThemeConfig,
  HexColor,
} from './LightingTypes';

/**
 * Converts hex color string to BabylonJS Color3
 * @param hex - Hex color string (e.g., "#4455ff" or "4455ff")
 * @returns BabylonJS Color3 instance
 */
export function hexToColor3(hex: HexColor): Color3 {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return new Color3(r, g, b);
}

/**
 * Mobile-optimized shadow map size
 * Balance between quality and performance
 */
const MOBILE_SHADOW_MAP_SIZE = 1024;

/**
 * Shadow blur samples for soft shadows
 */
const SHADOW_BLUR_SAMPLES = 16;

/**
 * Creates the complete lighting system from DDL theme configuration
 *
 * @param props - Scene and theme configuration
 * @returns Lighting system with lights, shadows, and update function
 *
 * @example
 * ```typescript
 * const lighting = createLightingSystem({
 *   scene,
 *   theme: themeConfig,
 * });
 *
 * // In render loop
 * lighting.update(deltaTime);
 *
 * // Cleanup
 * lighting.dispose();
 * ```
 */
export function createLightingSystem(
  props: LightingSystemProps
): LightingSystemResult {
  const { scene, theme } = props;
  const { lighting } = theme;

  // Animation state for pulsing lights
  let animationTime = 0;

  // Create hemisphere ambient light
  const ambientLight = new HemisphericLight(
    'ambientLight',
    new Vector3(0, 1, 0),
    scene
  );

  // Apply hemisphere colors if configured
  if (lighting.hemisphere) {
    ambientLight.diffuse = hexToColor3(lighting.hemisphere.skyColor);
    ambientLight.groundColor = hexToColor3(lighting.hemisphere.groundColor);
    ambientLight.intensity = lighting.hemisphere.intensity;
  } else {
    // Fallback to ambient config
    ambientLight.diffuse = hexToColor3(lighting.ambient.color);
    ambientLight.groundColor = hexToColor3(lighting.ambient.color).scale(0.3);
    ambientLight.intensity = lighting.ambient.intensity;
  }

  // Disable specular on ambient light for softer look
  ambientLight.specular = Color3.Black();

  // Create main directional moonlight
  const moonLight = new DirectionalLight(
    'moonLight',
    new Vector3(
      -lighting.moonlight.position[0],
      -lighting.moonlight.position[1],
      -lighting.moonlight.position[2]
    ).normalize(),
    scene
  );

  moonLight.position = new Vector3(
    lighting.moonlight.position[0],
    lighting.moonlight.position[1],
    lighting.moonlight.position[2]
  );
  moonLight.diffuse = hexToColor3(lighting.moonlight.color);
  moonLight.specular = hexToColor3(lighting.moonlight.color).scale(0.5);
  moonLight.intensity = lighting.moonlight.intensity;

  // Create shadow generator with blur for soft shadows
  const shadowGenerator = new ShadowGenerator(MOBILE_SHADOW_MAP_SIZE, moonLight);
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurScale = 2;
  shadowGenerator.blurBoxOffset = 1;
  shadowGenerator.useKernelBlur = true;
  shadowGenerator.blurKernel = SHADOW_BLUR_SAMPLES;

  // Optimize shadow map for mobile
  shadowGenerator.bias = 0.001;
  shadowGenerator.normalBias = 0.02;
  shadowGenerator.setDarkness(0.5);

  // Optional rim light for character edge highlights
  let rimLight: DirectionalLight | undefined;
  if (lighting.rim) {
    rimLight = new DirectionalLight(
      'rimLight',
      new Vector3(
        -lighting.rim.position[0],
        -lighting.rim.position[1],
        -lighting.rim.position[2]
      ).normalize(),
      scene
    );
    rimLight.position = new Vector3(
      lighting.rim.position[0],
      lighting.rim.position[1],
      lighting.rim.position[2]
    );
    rimLight.diffuse = hexToColor3(lighting.rim.color);
    rimLight.specular = hexToColor3(lighting.rim.color);
    rimLight.intensity = lighting.rim.intensity;
  }

  /**
   * Update lighting animations (pulsing moonlight, etc.)
   * @param deltaTime - Time since last frame in seconds
   */
  function update(deltaTime: number): void {
    animationTime += deltaTime;

    // Animate moonlight intensity if configured
    if (lighting.moonlight.animation) {
      const { intensityRange, speed } = lighting.moonlight.animation;
      const [minIntensity, maxIntensity] = intensityRange;
      const range = maxIntensity - minIntensity;

      // Smooth sine wave oscillation
      const t = Math.sin(animationTime * speed) * 0.5 + 0.5;
      moonLight.intensity = minIntensity + range * t;
    }
  }

  /**
   * Dispose all lighting resources
   */
  function dispose(): void {
    shadowGenerator.dispose();
    ambientLight.dispose();
    moonLight.dispose();
    rimLight?.dispose();
  }

  return {
    ambientLight,
    moonLight,
    shadowGenerator,
    rimLight,
    update,
    dispose,
  };
}

/**
 * Adds a mesh to receive shadows from the shadow generator
 * @param mesh - Mesh to receive shadows
 * @param shadowGenerator - Shadow generator instance
 */
export function enableShadowReceiver(
  mesh: { receiveShadows: boolean },
  _shadowGenerator: ShadowGenerator
): void {
  mesh.receiveShadows = true;
  // Note: Shadow generator reference stored implicitly via scene
}

/**
 * Adds a mesh to cast shadows
 * @param mesh - Mesh to cast shadows
 * @param shadowGenerator - Shadow generator instance
 */
export function enableShadowCaster(
  mesh: { name: string },
  shadowGenerator: ShadowGenerator
): void {
  shadowGenerator.addShadowCaster(mesh as never);
}

/**
 * Creates default theme configuration for cyberpunk Christmas night
 * Use when themes.json is not available
 */
export function getDefaultThemeConfig(): ThemeConfig {
  return {
    lighting: {
      ambient: { intensity: 0.1, color: '#ffffff' },
      moonlight: {
        color: '#4455ff',
        intensity: 1.0,
        position: [-20, 50, -20],
        animation: { intensityRange: [0.8, 1.2], speed: 0.5 },
      },
      rim: { color: '#00ffcc', intensity: 0.3, position: [20, 30, 40] },
      hemisphere: {
        skyColor: '#0a0a20',
        groundColor: '#000000',
        intensity: 0.4,
      },
      fog: { color: '#050505', density: 0.025 },
    },
    sky: {
      sunAngle: 10,
      sunIntensity: 0.1,
      ambientLight: 0.2,
      starVisibility: 0.8,
      fogDensity: 0.3,
      weatherIntensity: 0.2,
      volumetricFog: { color: '#0a0a20', density: 0.015, height: 20 },
    },
    postProcessing: {
      bloom: {
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0.9,
        intensity: 1.2,
        radius: 0.5,
      },
    },
  };
}
