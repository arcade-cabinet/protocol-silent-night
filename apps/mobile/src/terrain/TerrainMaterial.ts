/**
 * @fileoverview Custom terrain material with cyberpunk grid aesthetic
 * @module terrain/TerrainMaterial
 *
 * Creates a neon-accented grid material for the game terrain.
 * Uses BabylonJS StandardMaterial with custom properties for the
 * cyberpunk Christmas aesthetic.
 */

import {
  type Scene,
  StandardMaterial,
  Color3,
  DynamicTexture,
  Effect,
  ShaderMaterial,
} from '@babylonjs/core';

/**
 * Configuration for terrain material
 */
export interface TerrainMaterialConfig {
  /** Base terrain color (hex string or Color3) */
  baseColor?: string | Color3;
  /** Grid line color (hex string or Color3) */
  gridColor?: string | Color3;
  /** Emissive accent color (hex string or Color3) */
  emissiveColor?: string | Color3;
  /** Grid line spacing in world units */
  gridSpacing?: number;
  /** Grid line width as fraction of spacing */
  gridLineWidth?: number;
  /** Emissive intensity (0-1) */
  emissiveIntensity?: number;
  /** Enable glitch effect on grid */
  enableGlitch?: boolean;
}

/**
 * Default cyberpunk color palette
 */
const CYBERPUNK_COLORS = {
  base: new Color3(0.06, 0.06, 0.1), // #0f0f1a - dark blue-black
  grid: new Color3(0, 1, 0.8), // #00ffcc - cyan
  emissive: new Color3(0, 0.5, 0.4), // #008066 - teal glow
  accent: new Color3(1, 0, 0.4), // #ff0066 - pink
};

/**
 * Converts hex color string to Color3
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
  return CYBERPUNK_COLORS.base;
}

/**
 * Ensures value is Color3
 */
function toColor3(value: string | Color3 | undefined, defaultColor: Color3): Color3 {
  if (!value) return defaultColor;
  if (value instanceof Color3) return value;
  return hexToColor3(value);
}

/**
 * Creates a procedural grid texture for terrain
 *
 * @param scene - BabylonJS scene
 * @param size - Texture size in pixels
 * @param gridColor - Color of grid lines
 * @param lineWidth - Width of grid lines in pixels
 * @returns DynamicTexture with grid pattern
 */
export function createGridTexture(
  scene: Scene,
  size: number = 512,
  gridColor: Color3 = CYBERPUNK_COLORS.grid,
  lineWidth: number = 2
): DynamicTexture {
  const texture = new DynamicTexture('gridTexture', size, scene, true);
  const ctx = texture.getContext();

  // Clear with transparent
  ctx.clearRect(0, 0, size, size);

  // Set grid line style
  const r = Math.floor(gridColor.r * 255);
  const g = Math.floor(gridColor.g * 255);
  const b = Math.floor(gridColor.b * 255);
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
  ctx.lineWidth = lineWidth;

  // Draw grid lines
  const cellSize = size / 8; // 8x8 grid pattern

  // Vertical lines
  for (let x = 0; x <= size; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= size; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Add glow effect at intersections
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
  for (let x = 0; x <= size; x += cellSize) {
    for (let y = 0; y <= size; y += cellSize) {
      ctx.beginPath();
      ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  texture.update();
  return texture;
}

/**
 * Creates the main terrain material with cyberpunk grid aesthetic
 *
 * @param scene - BabylonJS scene
 * @param config - Material configuration
 * @returns Configured StandardMaterial
 *
 * @example
 * ```typescript
 * const material = createTerrainMaterial(scene, {
 *   baseColor: '#0f0f1a',
 *   gridColor: '#00ffcc',
 *   emissiveIntensity: 0.3,
 * });
 * terrain.material = material;
 * ```
 */
export function createTerrainMaterial(
  scene: Scene,
  config: TerrainMaterialConfig = {}
): StandardMaterial {
  const material = new StandardMaterial('terrainMaterial', scene);

  // Apply colors
  const baseColor = toColor3(config.baseColor, CYBERPUNK_COLORS.base);
  const emissiveColor = toColor3(config.emissiveColor, CYBERPUNK_COLORS.emissive);
  const gridColor = toColor3(config.gridColor, CYBERPUNK_COLORS.grid);

  material.diffuseColor = baseColor;
  material.specularColor = new Color3(0.1, 0.1, 0.1);
  material.emissiveColor = emissiveColor.scale(config.emissiveIntensity ?? 0.2);

  // Create and apply grid texture
  const gridTexture = createGridTexture(
    scene,
    512,
    gridColor,
    config.gridLineWidth ? config.gridLineWidth * 64 : 2
  );

  // Scale texture to match grid spacing
  const spacing = config.gridSpacing ?? 10;
  gridTexture.uScale = spacing;
  gridTexture.vScale = spacing;

  material.emissiveTexture = gridTexture;
  material.emissiveTexture.hasAlpha = true;

  // Disable backface culling for terrain
  material.backFaceCulling = false;

  return material;
}

/**
 * Vertex shader for custom terrain
 */
const TERRAIN_VERTEX_SHADER = `
precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

// Uniforms
uniform mat4 worldViewProjection;
uniform mat4 world;
uniform float time;
uniform float glitchIntensity;

// Varyings
varying vec2 vUV;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vGlitch;

// Pseudo-random function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main(void) {
    vec3 pos = position;

    // Apply glitch displacement
    float glitchValue = 0.0;
    if (glitchIntensity > 0.0) {
        float glitchTime = floor(time * 10.0) / 10.0;
        float glitchRand = random(vec2(glitchTime, floor(position.x / 5.0)));
        if (glitchRand > 0.95) {
            pos.y += (random(position.xz + glitchTime) - 0.5) * glitchIntensity;
            glitchValue = 1.0;
        }
    }

    gl_Position = worldViewProjection * vec4(pos, 1.0);

    vUV = uv;
    vPosition = (world * vec4(pos, 1.0)).xyz;
    vNormal = normalize((world * vec4(normal, 0.0)).xyz);
    vGlitch = glitchValue;
}
`;

/**
 * Fragment shader for custom terrain with grid effect
 */
const TERRAIN_FRAGMENT_SHADER = `
precision highp float;

// Uniforms
uniform vec3 baseColor;
uniform vec3 gridColor;
uniform vec3 emissiveColor;
uniform float gridSpacing;
uniform float gridLineWidth;
uniform float emissiveIntensity;
uniform float time;

// Varyings
varying vec2 vUV;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vGlitch;

// Grid line function
float gridLine(float coord, float spacing, float width) {
    float line = abs(fract(coord / spacing - 0.5) - 0.5) * spacing;
    return 1.0 - smoothstep(0.0, width, line);
}

void main(void) {
    // Calculate grid lines
    float gridX = gridLine(vPosition.x, gridSpacing, gridLineWidth);
    float gridZ = gridLine(vPosition.z, gridSpacing, gridLineWidth);
    float grid = max(gridX, gridZ);

    // Add intersection glow
    float intersection = gridX * gridZ;

    // Pulse effect
    float pulse = 0.5 + 0.5 * sin(time * 2.0 + vPosition.x * 0.1 + vPosition.z * 0.1);

    // Combine colors
    vec3 color = baseColor;

    // Add grid lines
    color = mix(color, gridColor, grid * 0.6);

    // Add intersection highlights
    color = mix(color, gridColor * 1.5, intersection * pulse);

    // Add emissive glow
    vec3 emissive = emissiveColor * emissiveIntensity;
    emissive += gridColor * grid * emissiveIntensity * 0.5;

    // Glitch effect
    if (vGlitch > 0.5) {
        color = mix(color, vec3(1.0, 0.0, 0.4), 0.3);
    }

    // Simple lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diffuse = max(dot(vNormal, lightDir), 0.2);

    vec3 finalColor = color * diffuse + emissive;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;

/**
 * Creates an advanced shader-based terrain material
 *
 * This material uses custom shaders for more complex effects including:
 * - Animated grid lines
 * - Glitch displacement
 * - Dynamic emissive pulses
 *
 * @param scene - BabylonJS scene
 * @param config - Material configuration
 * @returns ShaderMaterial with terrain effects
 *
 * @example
 * ```typescript
 * const material = createAdvancedTerrainMaterial(scene, {
 *   enableGlitch: true,
 *   emissiveIntensity: 0.4,
 * });
 * terrain.material = material;
 *
 * // Update time uniform in render loop
 * scene.onBeforeRenderObservable.add(() => {
 *   material.setFloat('time', performance.now() / 1000);
 * });
 * ```
 */
export function createAdvancedTerrainMaterial(
  scene: Scene,
  config: TerrainMaterialConfig = {}
): ShaderMaterial {
  // Register shaders if not already done
  const store = Effect.ShadersStore as Record<string, string>;
  if (!store.terrainVertexShader) {
    store.terrainVertexShader = TERRAIN_VERTEX_SHADER;
    store.terrainFragmentShader = TERRAIN_FRAGMENT_SHADER;
  }

  const material = new ShaderMaterial(
    'advancedTerrainMaterial',
    scene,
    {
      vertex: 'terrain',
      fragment: 'terrain',
    },
    {
      attributes: ['position', 'normal', 'uv'],
      uniforms: [
        'worldViewProjection',
        'world',
        'time',
        'baseColor',
        'gridColor',
        'emissiveColor',
        'gridSpacing',
        'gridLineWidth',
        'emissiveIntensity',
        'glitchIntensity',
      ],
    }
  );

  // Set uniform values
  const baseColor = toColor3(config.baseColor, CYBERPUNK_COLORS.base);
  const gridColor = toColor3(config.gridColor, CYBERPUNK_COLORS.grid);
  const emissiveColor = toColor3(config.emissiveColor, CYBERPUNK_COLORS.emissive);

  material.setColor3('baseColor', baseColor);
  material.setColor3('gridColor', gridColor);
  material.setColor3('emissiveColor', emissiveColor);
  material.setFloat('gridSpacing', config.gridSpacing ?? 5);
  material.setFloat('gridLineWidth', config.gridLineWidth ?? 0.1);
  material.setFloat('emissiveIntensity', config.emissiveIntensity ?? 0.3);
  material.setFloat('glitchIntensity', config.enableGlitch ? 0.5 : 0);
  material.setFloat('time', 0);

  material.backFaceCulling = false;

  return material;
}

/**
 * Creates a simple flat terrain material for performance-critical scenarios
 *
 * @param scene - BabylonJS scene
 * @param color - Base color
 * @returns StandardMaterial with minimal overhead
 */
export function createSimpleTerrainMaterial(
  scene: Scene,
  color: string | Color3 = CYBERPUNK_COLORS.base
): StandardMaterial {
  const material = new StandardMaterial('simpleTerrainMaterial', scene);

  const baseColor = color instanceof Color3 ? color : hexToColor3(color);

  material.diffuseColor = baseColor;
  material.specularColor = new Color3(0, 0, 0);
  material.emissiveColor = baseColor.scale(0.1);
  material.backFaceCulling = false;

  return material;
}

/**
 * Color palette export for consistent styling across components
 */
export const CyberpunkPalette = {
  ...CYBERPUNK_COLORS,
  /** Helper to create darker variant */
  darker: (color: Color3, factor: number = 0.5): Color3 => color.scale(factor),
  /** Helper to create lighter variant */
  lighter: (color: Color3, factor: number = 1.5): Color3 =>
    new Color3(
      Math.min(color.r * factor, 1),
      Math.min(color.g * factor, 1),
      Math.min(color.b * factor, 1)
    ),
};
