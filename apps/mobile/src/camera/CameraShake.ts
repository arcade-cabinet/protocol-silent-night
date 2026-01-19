/**
 * CameraShake - Screen shake effect system for BabylonJS
 *
 * Provides procedural camera shake for impact feedback:
 * - Damage taken
 * - Boss appearances
 * - Heavy weapon fire
 * - Explosions
 *
 * Uses Perlin-like noise for organic shake feel.
 */

import { type ArcRotateCamera, Vector3 } from '@babylonjs/core';

/**
 * Shake effect configuration
 */
export interface ShakeConfig {
  /** Shake strength multiplier (0.1 = subtle, 1.0 = violent) */
  intensity: number;
  /** Shake duration in milliseconds */
  duration: number;
  /** Shake frequency (higher = more rapid, default: 25) */
  frequency?: number;
  /** Fade out curve exponent (higher = faster decay, default: 2) */
  decay?: number;
}

/**
 * Active shake state
 */
interface ShakeState {
  startTime: number;
  config: Required<ShakeConfig>;
  originalTarget: Vector3;
}

// Default values for optional config
const DEFAULT_FREQUENCY = 25;
const DEFAULT_DECAY = 2;

/**
 * Simple pseudo-random noise function for shake variation
 * Creates organic-feeling shake without external dependencies
 */
function noise(t: number): number {
  const x = Math.sin(t * 12.9898 + t * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Generate shake offset using multi-frequency noise
 * Combines multiple frequencies for more natural feel
 */
function generateShakeOffset(
  time: number,
  intensity: number,
  frequency: number
): Vector3 {
  const t = time * frequency;

  // Multi-frequency noise for organic feel
  const x =
    (noise(t) - 0.5) * 2 +
    (noise(t * 2.1) - 0.5) * 0.5 +
    (noise(t * 4.3) - 0.5) * 0.25;

  const y =
    (noise(t + 100) - 0.5) * 2 +
    (noise(t * 2.1 + 100) - 0.5) * 0.5 +
    (noise(t * 4.3 + 100) - 0.5) * 0.25;

  const z =
    (noise(t + 200) - 0.5) * 2 +
    (noise(t * 2.1 + 200) - 0.5) * 0.5 +
    (noise(t * 4.3 + 200) - 0.5) * 0.25;

  // Scale by intensity, vertical shake is reduced for better feel
  return new Vector3(x * intensity, y * intensity * 0.3, z * intensity);
}

/**
 * Calculate shake decay based on progress and decay exponent
 */
function calculateDecay(progress: number, decay: number): number {
  return (1 - progress) ** decay;
}

/**
 * Apply camera shake effect directly to an ArcRotateCamera
 *
 * This is a standalone function for simple use cases.
 * For more control, use the IsometricCamera's built-in shake.
 *
 * @param camera - The ArcRotateCamera to shake
 * @param intensity - Shake strength (0.1 = subtle, 1.0 = violent)
 * @param duration - Shake duration in milliseconds
 * @returns Cleanup function to stop shake early
 *
 * @example
 * ```typescript
 * // Simple shake on damage
 * applyCameraShake(camera, 0.3, 200);
 *
 * // Stop shake early
 * const stopShake = applyCameraShake(camera, 0.5, 500);
 * stopShake(); // Immediately stops
 * ```
 */
export function applyCameraShake(
  camera: ArcRotateCamera,
  intensity: number,
  duration: number
): () => void {
  const originalTarget = camera.target.clone();
  const startTime = Date.now();
  let animationFrame: number | null = null;
  let isActive = true;

  function update(): void {
    if (!isActive) return;

    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) {
      // Restore original target
      camera.setTarget(originalTarget);
      isActive = false;
      return;
    }

    // Calculate decayed intensity
    const decay = calculateDecay(progress, DEFAULT_DECAY);
    const currentIntensity = intensity * decay;

    // Generate shake offset
    const offset = generateShakeOffset(
      elapsed / 1000,
      currentIntensity,
      DEFAULT_FREQUENCY
    );

    // Apply shake offset to camera target
    camera.setTarget(originalTarget.add(offset));

    // Continue animation
    animationFrame = requestAnimationFrame(update);
  }

  // Start shake
  update();

  // Return cleanup function
  return () => {
    isActive = false;
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
    camera.setTarget(originalTarget);
  };
}

/**
 * Create a reusable shake controller for a camera
 *
 * Useful when you need to manage multiple shake effects or
 * need more control over the shake behavior.
 *
 * @param camera - The ArcRotateCamera to control
 * @returns Shake controller with start/stop/update methods
 *
 * @example
 * ```typescript
 * const shaker = createCameraShakeController(camera);
 *
 * // Start shake on damage
 * shaker.start({ intensity: 0.3, duration: 200 });
 *
 * // Check if shaking
 * if (shaker.isShaking()) {
 *   console.log('Camera is shaking');
 * }
 *
 * // Force stop
 * shaker.stop();
 *
 * // Clean up
 * shaker.dispose();
 * ```
 */
export function createCameraShakeController(camera: ArcRotateCamera) {
  let activeShake: ShakeState | null = null;
  let animationFrame: number | null = null;

  function update(): void {
    if (!activeShake) return;

    const elapsed = Date.now() - activeShake.startTime;
    const { duration, intensity, frequency, decay } = activeShake.config;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) {
      camera.setTarget(activeShake.originalTarget);
      activeShake = null;
      return;
    }

    // Calculate decayed intensity
    const decayFactor = calculateDecay(progress, decay);
    const currentIntensity = intensity * decayFactor;

    // Generate and apply shake offset
    const offset = generateShakeOffset(elapsed / 1000, currentIntensity, frequency);
    camera.setTarget(activeShake.originalTarget.add(offset));

    // Continue animation
    animationFrame = requestAnimationFrame(update);
  }

  return {
    /**
     * Start a new shake effect
     * If a shake is already active, it will be replaced
     */
    start(config: ShakeConfig): void {
      // Save original target (or use current if already shaking)
      const originalTarget = activeShake
        ? activeShake.originalTarget
        : camera.target.clone();

      activeShake = {
        startTime: Date.now(),
        config: {
          intensity: config.intensity,
          duration: config.duration,
          frequency: config.frequency ?? DEFAULT_FREQUENCY,
          decay: config.decay ?? DEFAULT_DECAY,
        },
        originalTarget,
      };

      // Start animation loop
      if (animationFrame === null) {
        update();
      }
    },

    /**
     * Stop the current shake immediately
     */
    stop(): void {
      if (activeShake) {
        camera.setTarget(activeShake.originalTarget);
        activeShake = null;
      }
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    },

    /**
     * Check if camera is currently shaking
     */
    isShaking(): boolean {
      return activeShake !== null;
    },

    /**
     * Clean up resources
     */
    dispose(): void {
      this.stop();
    },
  };
}

/**
 * Shake effect presets for common game events
 */
export const ShakePresets = {
  /** Subtle shake for taking minor damage */
  lightDamage: {
    intensity: 0.15,
    duration: 120,
    frequency: 30,
    decay: 2,
  },

  /** Medium shake for significant damage */
  damage: {
    intensity: 0.3,
    duration: 200,
    frequency: 25,
    decay: 2,
  },

  /** Heavy shake for critical hits */
  criticalHit: {
    intensity: 0.5,
    duration: 300,
    frequency: 20,
    decay: 1.5,
  },

  /** Dramatic shake for boss entrance */
  bossAppear: {
    intensity: 0.6,
    duration: 800,
    frequency: 8,
    decay: 3,
  },

  /** Impact shake for explosions */
  explosion: {
    intensity: 0.8,
    duration: 400,
    frequency: 35,
    decay: 2.5,
  },

  /** Quick subtle shake for weapon fire */
  weaponFire: {
    intensity: 0.08,
    duration: 60,
    frequency: 40,
    decay: 3,
  },

  /** Rapid heavy shake for machine gun */
  rapidFire: {
    intensity: 0.12,
    duration: 40,
    frequency: 50,
    decay: 4,
  },

  /** Rumble for environmental effects */
  rumble: {
    intensity: 0.2,
    duration: 1000,
    frequency: 6,
    decay: 1,
  },
} as const;

export type ShakePresetName = keyof typeof ShakePresets;
