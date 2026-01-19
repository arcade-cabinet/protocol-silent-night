/**
 * @fileoverview Neon and emissive material effects for Protocol: Silent Night
 * @module lighting/NeonEffects
 *
 * Creates glowing materials and glow layer for cyberpunk neon effects.
 * Provides helpers for creating emissive materials that work with bloom.
 */

import {
  Scene,
  StandardMaterial,
  PBRMaterial,
  Color3,
  GlowLayer,
  Mesh,
  AbstractMesh,
} from '@babylonjs/core';
import type { GlowSystemProps, GlowSystemResult, HexColor } from './LightingTypes';
import { hexToColor3 } from './LightingSystem';

/**
 * Default glow layer blur kernel size for mobile
 */
const MOBILE_GLOW_BLUR_KERNEL = 32;

/**
 * Default glow intensity
 */
const DEFAULT_GLOW_INTENSITY = 1.0;

/**
 * Creates a neon-style StandardMaterial with emissive properties
 *
 * @param scene - BabylonJS scene
 * @param name - Unique material name
 * @param color - Neon color as hex string
 * @param intensity - Emissive intensity (0-2 typical)
 * @returns StandardMaterial configured for neon glow
 *
 * @example
 * ```typescript
 * const neonMaterial = createNeonMaterial(scene, 'neonPink', '#ff00ff', 1.5);
 * mesh.material = neonMaterial;
 * ```
 */
export function createNeonMaterial(
  scene: Scene,
  name: string,
  color: HexColor,
  intensity: number = 1.0
): StandardMaterial {
  const material = new StandardMaterial(name, scene);
  const neonColor = hexToColor3(color);

  // Set diffuse to darker version of color
  material.diffuseColor = neonColor.scale(0.3);

  // Set emissive for glow effect
  material.emissiveColor = neonColor.scale(intensity);

  // No specular for flat neon look
  material.specularColor = Color3.Black();
  material.specularPower = 0;

  // Slight transparency for softer glow
  material.alpha = 1.0;

  return material;
}

/**
 * Creates a neon-style PBR material with better lighting response
 *
 * @param scene - BabylonJS scene
 * @param name - Unique material name
 * @param color - Neon color as hex string
 * @param intensity - Emissive intensity (0-2 typical)
 * @returns PBRMaterial configured for neon glow
 *
 * @example
 * ```typescript
 * const neonPBR = createNeonPBRMaterial(scene, 'neonCyan', '#00ffff', 1.2);
 * mesh.material = neonPBR;
 * ```
 */
export function createNeonPBRMaterial(
  scene: Scene,
  name: string,
  color: HexColor,
  intensity: number = 1.0
): PBRMaterial {
  const material = new PBRMaterial(name, scene);
  const neonColor = hexToColor3(color);

  // Set albedo to darker version
  material.albedoColor = neonColor.scale(0.2);

  // Set emissive for glow
  material.emissiveColor = neonColor.scale(intensity);
  material.emissiveIntensity = intensity;

  // Metallic settings for neon effect
  material.metallic = 0.0;
  material.roughness = 1.0;

  // Disable reflections for flat neon look
  material.reflectionColor = Color3.Black();

  return material;
}

/**
 * Creates a glow layer for selective bloom effects
 *
 * @param props - Scene and configuration
 * @returns Glow system with controls
 *
 * @example
 * ```typescript
 * const glowSystem = createGlowLayer({
 *   scene,
 *   intensity: 1.0,
 *   blurKernelSize: 32,
 * });
 *
 * // Add mesh to glow
 * glowSystem.addGlowMesh(neonSign, '#ff00ff', 1.5);
 *
 * // Cleanup
 * glowSystem.dispose();
 * ```
 */
export function createGlowLayer(props: GlowSystemProps): GlowSystemResult {
  const {
    scene,
    intensity = DEFAULT_GLOW_INTENSITY,
    blurKernelSize = MOBILE_GLOW_BLUR_KERNEL,
  } = props;

  // Create glow layer
  const glowLayer = new GlowLayer('glowLayer', scene, {
    blurKernelSize,
    mainTextureFixedSize: 512, // Mobile-optimized texture size
  });

  glowLayer.intensity = intensity;

  // Track meshes for cleanup
  const glowMeshes = new Set<AbstractMesh>();

  /**
   * Add a mesh to the glow layer with custom color and intensity
   */
  function addGlowMesh(
    mesh: Mesh,
    color?: HexColor,
    meshIntensity?: number
  ): void {
    glowMeshes.add(mesh);

    // Set custom glow color if provided
    if (color) {
      glowLayer.customEmissiveColorSelector = (
        targetMesh,
        _subMesh,
        _material,
        result
      ): void => {
        if (targetMesh === mesh) {
          const glowColor = hexToColor3(color);
          result.set(
            glowColor.r * (meshIntensity ?? 1),
            glowColor.g * (meshIntensity ?? 1),
            glowColor.b * (meshIntensity ?? 1),
            1
          );
        }
      };
    }

    // Add to glow layer included meshes
    glowLayer.addIncludedOnlyMesh(mesh);
  }

  /**
   * Remove a mesh from the glow layer
   */
  function removeGlowMesh(mesh: Mesh): void {
    glowMeshes.delete(mesh);
    glowLayer.removeIncludedOnlyMesh(mesh);
  }

  /**
   * Set overall glow intensity
   */
  function setIntensity(newIntensity: number): void {
    glowLayer.intensity = newIntensity;
  }

  /**
   * Dispose glow layer and resources
   */
  function dispose(): void {
    glowMeshes.clear();
    glowLayer.dispose();
  }

  return {
    glowLayer,
    addGlowMesh,
    removeGlowMesh,
    setIntensity,
    dispose,
  };
}

/**
 * Predefined neon color palette for cyberpunk theme
 */
export const NeonColors = {
  /** Hot pink / magenta */
  PINK: '#ff00ff',
  /** Electric cyan */
  CYAN: '#00ffff',
  /** Neon green */
  GREEN: '#00ff66',
  /** Electric purple */
  PURPLE: '#aa00ff',
  /** Warning orange */
  ORANGE: '#ff6600',
  /** Christmas red */
  RED: '#ff0033',
  /** Ice blue */
  BLUE: '#0066ff',
  /** Electric yellow */
  YELLOW: '#ffff00',
  /** Christmas gold */
  GOLD: '#ffd700',
  /** Tron blue */
  TRON_BLUE: '#4455ff',
} as const;

/**
 * Creates multiple neon materials for common use cases
 *
 * @param scene - BabylonJS scene
 * @returns Object containing common neon materials
 */
export function createNeonMaterialSet(
  scene: Scene
): Record<keyof typeof NeonColors, StandardMaterial> {
  const materials: Record<string, StandardMaterial> = {};

  for (const [name, color] of Object.entries(NeonColors)) {
    materials[name] = createNeonMaterial(scene, `neon${name}`, color, 1.0);
  }

  return materials as Record<keyof typeof NeonColors, StandardMaterial>;
}

/**
 * Updates emissive intensity on a neon material
 *
 * @param material - StandardMaterial or PBRMaterial
 * @param intensity - New emissive intensity
 */
export function setNeonIntensity(
  material: StandardMaterial | PBRMaterial,
  intensity: number
): void {
  if (material instanceof PBRMaterial) {
    material.emissiveIntensity = intensity;
  } else {
    // For StandardMaterial, scale the emissive color
    const currentColor = material.emissiveColor;
    const baseColor = currentColor.scale(1 / (currentColor.r + 0.001));
    material.emissiveColor = baseColor.scale(intensity);
  }
}

/**
 * Creates a pulsing neon effect
 *
 * @param material - Neon material to animate
 * @param minIntensity - Minimum pulse intensity
 * @param maxIntensity - Maximum pulse intensity
 * @param speed - Pulse speed
 * @returns Update function to call each frame
 *
 * @example
 * ```typescript
 * const updatePulse = createPulsingNeon(neonMaterial, 0.5, 1.5, 2.0);
 *
 * // In render loop
 * updatePulse(deltaTime);
 * ```
 */
export function createPulsingNeon(
  material: StandardMaterial | PBRMaterial,
  minIntensity: number,
  maxIntensity: number,
  speed: number
): (deltaTime: number) => void {
  let time = 0;

  // Store base color for scaling
  const baseColor =
    material instanceof PBRMaterial
      ? material.emissiveColor.clone()
      : material.emissiveColor.clone();

  return (deltaTime: number): void => {
    time += deltaTime * speed;

    // Smooth sine wave oscillation
    const t = Math.sin(time) * 0.5 + 0.5;
    const intensity = minIntensity + (maxIntensity - minIntensity) * t;

    if (material instanceof PBRMaterial) {
      material.emissiveColor = baseColor.scale(intensity);
      material.emissiveIntensity = intensity;
    } else {
      material.emissiveColor = baseColor.scale(intensity);
    }
  };
}

/**
 * Creates a flickering neon effect (like a broken sign)
 *
 * @param material - Neon material to animate
 * @param onIntensity - Intensity when "on"
 * @param offIntensity - Intensity when "off"
 * @param flickerChance - Chance to flicker each frame (0-1)
 * @returns Update function to call each frame
 */
export function createFlickeringNeon(
  material: StandardMaterial | PBRMaterial,
  onIntensity: number,
  offIntensity: number,
  flickerChance: number = 0.05
): (deltaTime: number) => void {
  let isOn = true;
  let flickerCooldown = 0;

  const baseColor =
    material instanceof PBRMaterial
      ? material.emissiveColor.clone()
      : material.emissiveColor.clone();

  return (deltaTime: number): void => {
    flickerCooldown -= deltaTime;

    // Random flicker
    if (flickerCooldown <= 0 && Math.random() < flickerChance) {
      isOn = !isOn;
      flickerCooldown = 0.05 + Math.random() * 0.1; // Brief flicker
    }

    // Snap back on after flicker
    if (!isOn && flickerCooldown <= 0) {
      isOn = true;
    }

    const intensity = isOn ? onIntensity : offIntensity;

    if (material instanceof PBRMaterial) {
      material.emissiveColor = baseColor.scale(intensity);
      material.emissiveIntensity = intensity;
    } else {
      material.emissiveColor = baseColor.scale(intensity);
    }
  };
}
