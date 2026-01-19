/**
 * Camera System - Protocol: Silent Night
 *
 * Isometric camera system for FF7/Tactics style gameplay.
 *
 * @example
 * ```typescript
 * import {
 *   createIsometricCamera,
 *   CameraShakePresets,
 *   ShakePresets,
 *   applyCameraShake,
 * } from '@/src/camera';
 *
 * // Create camera
 * const { camera, followTarget, shake } = createIsometricCamera(scene);
 *
 * // Follow player
 * followTarget(playerMesh.position);
 *
 * // Shake on damage
 * shake(ShakePresets.damage.intensity, ShakePresets.damage.duration);
 * ```
 */

export {
  createIsometricCamera,
  CameraShakePresets,
  type IsometricCameraOptions,
  type IsometricCameraController,
  type CameraShakePreset,
} from './IsometricCamera';

export {
  applyCameraShake,
  createCameraShakeController,
  ShakePresets,
  type ShakeConfig,
  type ShakePresetName,
} from './CameraShake';
