/**
 * @fileoverview Post-processing effects for Protocol: Silent Night
 * @module lighting/PostProcessing
 *
 * Sets up DefaultRenderingPipeline for bloom and other effects.
 * Mobile-optimized with configurable quality settings.
 */

import {
  DefaultRenderingPipeline,
  Color4,
  ImageProcessingConfiguration,
} from '@babylonjs/core';
import type {
  PostProcessingProps,
  PostProcessingResult,
  PostProcessConfig,
} from './LightingTypes';

/**
 * Mobile-optimized bloom kernel size
 * 32 provides good quality without too much performance impact
 */
const MOBILE_BLOOM_KERNEL = 32;

/**
 * Desktop bloom kernel size for higher quality
 */
const DESKTOP_BLOOM_KERNEL = 64;

/**
 * Default HDR texture format
 * Using false for mobile compatibility
 */
const DEFAULT_HDR = false;

/**
 * Sets up post-processing pipeline with bloom effects
 *
 * @param props - Scene, camera, and configuration
 * @returns Post-processing system with controls
 *
 * @example
 * ```typescript
 * const postProcess = setupPostProcessing({
 *   scene,
 *   camera,
 *   config: themeConfig.postProcessing,
 *   mobileOptimized: true,
 * });
 *
 * // Adjust bloom dynamically
 * postProcess.setBloomIntensity(1.5);
 *
 * // Cleanup
 * postProcess.dispose();
 * ```
 */
export function setupPostProcessing(
  props: PostProcessingProps
): PostProcessingResult {
  const { scene, camera, config, mobileOptimized = true } = props;

  // Create default rendering pipeline
  const pipeline = new DefaultRenderingPipeline(
    'defaultPipeline',
    DEFAULT_HDR,
    scene,
    [camera]
  );

  // Configure bloom
  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = config.bloom.luminanceThreshold;
  pipeline.bloomWeight = config.bloom.intensity;
  pipeline.bloomKernel = mobileOptimized ? MOBILE_BLOOM_KERNEL : DESKTOP_BLOOM_KERNEL;
  pipeline.bloomScale = config.bloom.radius;

  // Configure image processing
  pipeline.imageProcessingEnabled = true;
  pipeline.imageProcessing.contrast = 1.1;
  pipeline.imageProcessing.exposure = 1.0;

  // Tone mapping for HDR-like look
  pipeline.imageProcessing.toneMappingEnabled = true;
  pipeline.imageProcessing.toneMappingType =
    ImageProcessingConfiguration.TONEMAPPING_ACES;

  // Vignette for cinematic feel (subtle)
  pipeline.imageProcessing.vignetteEnabled = true;
  pipeline.imageProcessing.vignetteWeight = 0.5;
  pipeline.imageProcessing.vignetteStretch = 0.5;
  pipeline.imageProcessing.vignetteColor = new Color4(0, 0, 0, 0);
  pipeline.imageProcessing.vignetteCameraFov = 0.5;

  // Disable heavy effects on mobile
  if (mobileOptimized) {
    pipeline.fxaaEnabled = false; // FXAA can be expensive
    pipeline.samples = 1; // No MSAA
    pipeline.chromaticAberrationEnabled = false;
    pipeline.grainEnabled = false;
    pipeline.sharpenEnabled = false;
    pipeline.depthOfFieldEnabled = false;
  } else {
    // Enable anti-aliasing on desktop
    pipeline.fxaaEnabled = true;
    pipeline.samples = 4;
  }

  /**
   * Set bloom intensity
   */
  function setBloomIntensity(intensity: number): void {
    pipeline.bloomWeight = intensity;
  }

  /**
   * Set bloom threshold
   */
  function setBloomThreshold(threshold: number): void {
    pipeline.bloomThreshold = threshold;
  }

  /**
   * Enable/disable bloom
   */
  function setBloomEnabled(enabled: boolean): void {
    pipeline.bloomEnabled = enabled;
  }

  /**
   * Dispose pipeline resources
   */
  function dispose(): void {
    pipeline.dispose();
  }

  return {
    pipeline,
    setBloomIntensity,
    setBloomThreshold,
    setBloomEnabled,
    dispose,
  };
}

/**
 * Creates default post-processing configuration
 */
export function getDefaultPostProcessConfig(): PostProcessConfig {
  return {
    bloom: {
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.9,
      intensity: 1.2,
      radius: 0.5,
    },
  };
}

/**
 * Adjusts post-processing for low-end devices
 *
 * @param pipeline - Post-processing pipeline
 */
export function applyLowEndSettings(pipeline: DefaultRenderingPipeline): void {
  // Reduce bloom quality
  pipeline.bloomKernel = 16;
  pipeline.bloomScale = 0.3;

  // Disable all optional effects
  pipeline.fxaaEnabled = false;
  pipeline.samples = 1;
  pipeline.chromaticAberrationEnabled = false;
  pipeline.grainEnabled = false;
  pipeline.sharpenEnabled = false;
  pipeline.depthOfFieldEnabled = false;

  // Reduce image processing
  pipeline.imageProcessing.vignetteEnabled = false;
}

/**
 * Adjusts post-processing for high-end devices
 *
 * @param pipeline - Post-processing pipeline
 */
export function applyHighEndSettings(pipeline: DefaultRenderingPipeline): void {
  // Higher bloom quality
  pipeline.bloomKernel = 64;
  pipeline.bloomScale = 0.5;

  // Enable anti-aliasing
  pipeline.fxaaEnabled = true;
  pipeline.samples = 4;

  // Enable optional effects
  pipeline.imageProcessing.vignetteEnabled = true;

  // Optional: Add grain for cinematic look
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 5;
  pipeline.grain.animated = true;
}

/**
 * Configuration presets for different device tiers
 */
export const PostProcessPresets = {
  /**
   * Minimal settings for low-end devices
   */
  LOW: {
    bloomKernel: 16,
    bloomScale: 0.3,
    fxaa: false,
    vignette: false,
    grain: false,
  },

  /**
   * Balanced settings for mid-range devices
   */
  MEDIUM: {
    bloomKernel: 32,
    bloomScale: 0.5,
    fxaa: false,
    vignette: true,
    grain: false,
  },

  /**
   * High quality for high-end devices
   */
  HIGH: {
    bloomKernel: 64,
    bloomScale: 0.5,
    fxaa: true,
    vignette: true,
    grain: true,
  },
} as const;

/**
 * Apply a preset to the pipeline
 *
 * @param pipeline - Post-processing pipeline
 * @param preset - Preset name
 */
export function applyPreset(
  pipeline: DefaultRenderingPipeline,
  preset: keyof typeof PostProcessPresets
): void {
  const settings = PostProcessPresets[preset];

  pipeline.bloomKernel = settings.bloomKernel;
  pipeline.bloomScale = settings.bloomScale;
  pipeline.fxaaEnabled = settings.fxaa;
  pipeline.imageProcessing.vignetteEnabled = settings.vignette;
  pipeline.grainEnabled = settings.grain;

  if (settings.grain) {
    pipeline.grain.intensity = 5;
    pipeline.grain.animated = true;
  }
}
