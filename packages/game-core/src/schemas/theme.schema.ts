/**
 * @fileoverview Zod schema for theme configurations
 * @module schemas/theme
 *
 * Validates the structure of themes.json DDL file
 */

import { z } from 'zod';

/**
 * 3D position as [x, y, z] tuple
 */
export const Position3DSchema = z.tuple([z.number(), z.number(), z.number()]);

/**
 * Ambient light configuration
 */
export const AmbientLightSchema = z.object({
  intensity: z.number().nonnegative(),
  color: z.string(),
});

/**
 * Moonlight animation configuration
 */
export const MoonlightAnimationSchema = z.object({
  intensityRange: z.tuple([z.number(), z.number()]),
  speed: z.number().positive(),
});

/**
 * Moonlight configuration
 */
export const MoonlightSchema = z.object({
  color: z.string(),
  intensity: z.number().nonnegative(),
  position: Position3DSchema,
  animation: MoonlightAnimationSchema,
});

/**
 * Rim light configuration
 */
export const RimLightSchema = z.object({
  color: z.string(),
  intensity: z.number().nonnegative(),
  position: Position3DSchema,
});

/**
 * Hemisphere light configuration
 */
export const HemisphereLightSchema = z.object({
  skyColor: z.string(),
  groundColor: z.string(),
  intensity: z.number().nonnegative(),
});

/**
 * Fog configuration
 */
export const FogSchema = z.object({
  color: z.string(),
  density: z.number().positive(),
});

/**
 * Complete lighting configuration
 */
export const LightingConfigSchema = z.object({
  ambient: AmbientLightSchema,
  moonlight: MoonlightSchema,
  rim: RimLightSchema,
  hemisphere: HemisphereLightSchema,
  fog: FogSchema,
});

/**
 * Volumetric fog configuration
 */
export const VolumetricFogSchema = z.object({
  color: z.string(),
  density: z.number().positive(),
  height: z.number().positive(),
});

/**
 * Sky configuration
 */
export const SkyConfigSchema = z.object({
  sunAngle: z.number(),
  sunIntensity: z.number().nonnegative(),
  ambientLight: z.number().nonnegative(),
  starVisibility: z.number().min(0).max(1),
  fogDensity: z.number().nonnegative(),
  weatherIntensity: z.number().nonnegative(),
  volumetricFog: VolumetricFogSchema,
});

/**
 * Bloom post-processing configuration
 */
export const BloomConfigSchema = z.object({
  luminanceThreshold: z.number().nonnegative(),
  luminanceSmoothing: z.number().nonnegative(),
  intensity: z.number().nonnegative(),
  radius: z.number().nonnegative(),
});

/**
 * Post-processing configuration
 */
export const PostProcessingConfigSchema = z.object({
  bloom: BloomConfigSchema,
});

/**
 * Single theme configuration
 */
export const ThemeConfigSchema = z.object({
  lighting: LightingConfigSchema,
  sky: SkyConfigSchema,
  postProcessing: PostProcessingConfigSchema,
});

/**
 * Complete themes.json schema (record of theme names to configs)
 */
export const ThemesSchema = z.record(z.string(), ThemeConfigSchema);

/** Inferred types from schemas */
export type Position3D = z.infer<typeof Position3DSchema>;
export type LightingConfig = z.infer<typeof LightingConfigSchema>;
export type SkyConfig = z.infer<typeof SkyConfigSchema>;
export type PostProcessingConfig = z.infer<typeof PostProcessingConfigSchema>;
export type ThemeConfigValidated = z.infer<typeof ThemeConfigSchema>;
export type ThemesData = z.infer<typeof ThemesSchema>;
