/**
 * Audio Module
 *
 * Provides audio playback using expo-av for Protocol: Silent Night.
 * Assets are loaded from the shared game-core package (single source of truth).
 *
 * @example
 * ```typescript
 * import { AudioManager } from './audio';
 *
 * // Initialize on app start
 * await AudioManager.initialize();
 * await AudioManager.preloadCommon();
 *
 * // Play UI sounds
 * AudioManager.playUI('click');
 * AudioManager.playUI('confirm');
 *
 * // Play weapon sounds
 * AudioManager.playWeapon('laser_single');
 *
 * // Play SFX
 * AudioManager.playSFX('explosion_medium');
 * AudioManager.playFootstep(); // Random snow footstep
 *
 * // Play jingles
 * AudioManager.playJingle('victory');
 *
 * // Adjust settings
 * AudioManager.updateSettings({ sfxVolume: 0.5 });
 * AudioManager.setMuted(true);
 *
 * // Cleanup
 * await AudioManager.dispose();
 * ```
 */

export {
  AudioManager,
  type SoundCategory,
  type AudioSettings,
  type UISoundKey,
  type WeaponSoundKey,
  type SFXSoundKey,
  type JingleSoundKey,
} from './AudioManager';

// Re-export asset sources from game-core for direct access
export { AudioSources } from '@protocol-silent-night/game-core/assets';
