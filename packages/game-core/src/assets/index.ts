/**
 * Assets Module - Single Source of Truth
 *
 * This module provides unified asset management for Protocol: Silent Night.
 * All assets live in packages/game-core/assets/ and are referenced through
 * this module.
 *
 * Usage:
 * ```typescript
 * // Import the asset registry (platform-agnostic paths)
 * import { AudioAssets, MaterialAssets, SkyboxAssets } from '@protocol-silent-night/game-core/assets';
 *
 * // For React Native, import the bridge for Metro-compatible requires
 * import { AudioSources, MaterialSources, SkyboxSources } from '@protocol-silent-night/game-core/assets';
 *
 * // Play a sound
 * const clickSound = AudioSources.ui.click; // Returns a Metro require() result
 * await Audio.Sound.createAsync(clickSound);
 * ```
 */

// Asset Registry (platform-agnostic paths)
export {
  AudioAssets,
  MaterialAssets,
  SkyboxAssets,
  getAssetPath,
  getAudioCategory,
  getMaterialTextures,
  getSkyboxTextures,
  type AssetPath,
  type AudioCategory,
  type MaterialCategory,
  type SkyboxPreset,
  type UISoundKey,
  type WeaponSoundKey,
  type SFXSoundKey,
  type JingleSoundKey,
  type MetalMaterialKey,
  type ConcreteMaterialKey,
} from './AssetRegistry';

// Asset Bridge (React Native - static requires for Metro)
export {
  AudioSources,
  MaterialSources,
  SkyboxSources,
  type AudioSource,
} from './AssetBridge.native';
