/**
 * IsometricCamera - FF7/Tactics style isometric camera for BabylonJS
 *
 * Creates a locked isometric view camera that follows the player character
 * with smooth interpolation and supports zoom/shake effects.
 *
 * Camera angles:
 * - Alpha (rotation): -90 degrees (-PI/2) - looking from the side
 * - Beta (elevation): ~55 degrees (PI/3) - classic isometric angle
 * - Radius: 50 units (adjustable with pinch)
 */

import {
  type Scene,
  ArcRotateCamera,
  Vector3,
} from '@babylonjs/core';

/**
 * Isometric camera configuration options
 */
export interface IsometricCameraOptions {
  /** Initial camera radius (distance from target) */
  initialRadius?: number;
  /** Minimum zoom distance */
  minRadius?: number;
  /** Maximum zoom distance */
  maxRadius?: number;
  /** Camera follow smoothing factor (0-1, lower = smoother) */
  followSmoothness?: number;
  /** Enable camera input controls */
  enableControls?: boolean;
}

/**
 * Isometric camera control interface
 */
export interface IsometricCameraController {
  /** The BabylonJS ArcRotateCamera instance */
  camera: ArcRotateCamera;
  /** Smoothly follow a target position */
  followTarget: (position: Vector3) => void;
  /** Set camera zoom level (clamped to min/max radius) */
  setZoom: (level: number) => void;
  /** Get current zoom level */
  getZoom: () => number;
  /** Apply screen shake effect */
  shake: (intensity: number, duration: number) => void;
  /** Update camera (call each frame) */
  update: (deltaTime: number) => void;
  /** Clean up camera resources */
  dispose: () => void;
}

// Default camera configuration
const DEFAULT_OPTIONS: Required<IsometricCameraOptions> = {
  initialRadius: 50,
  minRadius: 25,
  maxRadius: 100,
  followSmoothness: 0.1,
  enableControls: false,
};

// Isometric camera angles (locked)
const ISOMETRIC_ALPHA = -Math.PI / 2; // -90 degrees (side view)
const ISOMETRIC_BETA = Math.PI / 3; // ~55 degrees (classic isometric)

/**
 * Creates an isometric camera locked to FF7/Tactics style angles
 *
 * @param scene - The BabylonJS scene
 * @param options - Camera configuration options
 * @returns Camera controller with follow, zoom, and shake methods
 *
 * @example
 * ```typescript
 * const { camera, followTarget, setZoom, shake } = createIsometricCamera(scene);
 *
 * // In game loop
 * followTarget(playerPosition);
 *
 * // On damage taken
 * shake(0.3, 200);
 *
 * // Pinch to zoom
 * setZoom(currentZoom * pinchScale);
 * ```
 */
export function createIsometricCamera(
  scene: Scene,
  options: IsometricCameraOptions = {}
): IsometricCameraController {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // Current state
  let targetPosition = Vector3.Zero();
  let currentZoom = config.initialRadius;
  let shakeOffset = Vector3.Zero();
  let shakeAnimation: ReturnType<typeof setTimeout> | null = null;

  // Create ArcRotateCamera with isometric settings
  const camera = new ArcRotateCamera(
    'isometricCamera',
    ISOMETRIC_ALPHA,
    ISOMETRIC_BETA,
    config.initialRadius,
    Vector3.Zero(),
    scene
  );

  // Lock rotation angles to prevent user from rotating camera
  camera.lowerAlphaLimit = ISOMETRIC_ALPHA;
  camera.upperAlphaLimit = ISOMETRIC_ALPHA;
  camera.lowerBetaLimit = ISOMETRIC_BETA;
  camera.upperBetaLimit = ISOMETRIC_BETA;

  // Set zoom limits
  camera.lowerRadiusLimit = config.minRadius;
  camera.upperRadiusLimit = config.maxRadius;

  // Disable default camera inputs (we handle input manually)
  if (!config.enableControls) {
    camera.inputs.clear();
  }

  // Set up smooth animations
  camera.inertia = 0.9;
  camera.speed = 1;

  /**
   * Smoothly follow a target position using linear interpolation
   */
  function followTarget(position: Vector3): void {
    targetPosition = position.clone();
  }

  /**
   * Set camera zoom level
   */
  function setZoom(level: number): void {
    currentZoom = Math.max(
      config.minRadius,
      Math.min(config.maxRadius, level)
    );
  }

  /**
   * Get current zoom level
   */
  function getZoom(): number {
    return currentZoom;
  }

  /**
   * Apply screen shake effect
   *
   * @param intensity - Shake strength (0.1 = subtle, 1.0 = violent)
   * @param duration - Shake duration in milliseconds
   */
  function shake(intensity: number, duration: number): void {
    // Cancel any existing shake
    if (shakeAnimation) {
      clearTimeout(shakeAnimation);
    }

    const startTime = Date.now();
    const maxOffset = intensity * 2;

    function updateShake(): void {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        shakeOffset = Vector3.Zero();
        shakeAnimation = null;
        return;
      }

      // Decay shake intensity over time
      const decayedIntensity = intensity * (1 - progress);

      // Random offset for shake
      shakeOffset = new Vector3(
        (Math.random() - 0.5) * maxOffset * decayedIntensity,
        (Math.random() - 0.5) * maxOffset * decayedIntensity * 0.5,
        (Math.random() - 0.5) * maxOffset * decayedIntensity
      );

      shakeAnimation = setTimeout(updateShake, 16); // ~60fps
    }

    updateShake();
  }

  /**
   * Update camera position (call each frame)
   */
  function update(_deltaTime: number): void {
    // Smooth follow target
    const currentTarget = camera.target;
    const newTarget = Vector3.Lerp(
      currentTarget,
      targetPosition.add(shakeOffset),
      config.followSmoothness
    );
    camera.setTarget(newTarget);

    // Smooth zoom
    const zoomDiff = currentZoom - camera.radius;
    if (Math.abs(zoomDiff) > 0.01) {
      camera.radius += zoomDiff * config.followSmoothness;
    }
  }

  /**
   * Clean up camera resources
   */
  function dispose(): void {
    if (shakeAnimation) {
      clearTimeout(shakeAnimation);
    }
    camera.dispose();
  }

  return {
    camera,
    followTarget,
    setZoom,
    getZoom,
    shake,
    update,
    dispose,
  };
}

/**
 * Preset shake effects for common game events
 */
export const CameraShakePresets = {
  /** Light shake for minor damage */
  damage: { intensity: 0.2, duration: 150 },
  /** Medium shake for heavy hits */
  heavyDamage: { intensity: 0.5, duration: 250 },
  /** Strong shake for boss appearances */
  bossAppear: { intensity: 0.8, duration: 500 },
  /** Violent shake for explosions */
  explosion: { intensity: 1.0, duration: 400 },
  /** Subtle shake for weapon fire */
  weaponFire: { intensity: 0.1, duration: 80 },
} as const;

export type CameraShakePreset = keyof typeof CameraShakePresets;
