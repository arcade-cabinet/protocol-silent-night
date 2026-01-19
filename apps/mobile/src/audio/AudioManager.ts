/**
 * Audio Manager
 *
 * Centralized audio system using expo-av for Protocol: Silent Night.
 * Uses the shared asset registry from game-core for single source of truth.
 *
 * Assets are stored in packages/game-core/assets/ (Kenney.nl CC0)
 */

import { Audio } from 'expo-av';
import {
  AudioSources,
  type UISoundKey,
  type WeaponSoundKey,
  type SFXSoundKey,
  type JingleSoundKey,
} from '@protocol-silent-night/game-core/assets';

// Re-export types for convenience
export type { UISoundKey, WeaponSoundKey, SFXSoundKey, JingleSoundKey };

// ============================================================================
// TYPES
// ============================================================================

export type SoundCategory = 'ui' | 'sfx' | 'weapons' | 'jingles' | 'music' | 'ambient';

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  uiVolume: number;
  muted: boolean;
}

// ============================================================================
// AUDIO MANAGER CLASS
// ============================================================================

class AudioManagerClass {
  private soundCache: Map<string, Audio.Sound> = new Map();
  private musicSound: Audio.Sound | null = null;
  private settings: AudioSettings = {
    masterVolume: 1.0,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    uiVolume: 0.7,
    muted: false,
  };
  private initialized = false;

  /**
   * Initialize the audio system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    this.initialized = true;
  }

  /**
   * Get effective volume for a category
   */
  private getEffectiveVolume(category: SoundCategory): number {
    if (this.settings.muted) return 0;

    let categoryVolume = 1.0;
    switch (category) {
      case 'ui':
        categoryVolume = this.settings.uiVolume;
        break;
      case 'sfx':
      case 'weapons':
      case 'jingles':
        categoryVolume = this.settings.sfxVolume;
        break;
      case 'music':
      case 'ambient':
        categoryVolume = this.settings.musicVolume;
        break;
    }

    return this.settings.masterVolume * categoryVolume;
  }

  /**
   * Play a UI sound
   */
  async playUI(key: UISoundKey): Promise<void> {
    const source = AudioSources.ui[key];
    await this.playSound(`ui_${key}`, source, 'ui');
  }

  /**
   * Play a weapon sound
   */
  async playWeapon(key: WeaponSoundKey): Promise<void> {
    const source = AudioSources.weapons[key];
    await this.playSound(`weapons_${key}`, source, 'weapons');
  }

  /**
   * Play an SFX sound
   */
  async playSFX(key: SFXSoundKey): Promise<void> {
    const source = AudioSources.sfx[key];
    await this.playSound(`sfx_${key}`, source, 'sfx');
  }

  /**
   * Play a jingle
   */
  async playJingle(key: JingleSoundKey): Promise<void> {
    const source = AudioSources.jingles[key];
    await this.playSound(`jingles_${key}`, source, 'jingles');
  }

  /**
   * Play a random footstep sound
   */
  async playFootstep(): Promise<void> {
    const keys: SFXSoundKey[] = ['footstep_snow_1', 'footstep_snow_2', 'footstep_snow_3', 'footstep_snow_4'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    await this.playSFX(randomKey);
  }

  /**
   * Generic sound player
   */
  private async playSound(cacheKey: string, source: number, category: SoundCategory): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Get or create sound object
      let sound = this.soundCache.get(cacheKey);

      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync(source);
        sound = newSound;
        this.soundCache.set(cacheKey, sound);
      }

      // Set volume and play
      const volume = this.getEffectiveVolume(category);
      await sound.setVolumeAsync(volume);
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${cacheKey}:`, error);
    }
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Mute/unmute all audio
   */
  setMuted(muted: boolean): void {
    this.settings.muted = muted;
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Preload commonly used sounds
   */
  async preloadCommon(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Preload UI sounds
    const uiSounds: UISoundKey[] = ['click', 'confirm', 'cancel'];
    for (const key of uiSounds) {
      const source = AudioSources.ui[key];
      const { sound } = await Audio.Sound.createAsync(source);
      this.soundCache.set(`ui_${key}`, sound);
    }

    // Preload common SFX
    const sfxSounds: SFXSoundKey[] = ['footstep_snow_1', 'footstep_snow_2', 'damage', 'powerup'];
    for (const key of sfxSounds) {
      const source = AudioSources.sfx[key];
      const { sound } = await Audio.Sound.createAsync(source);
      this.soundCache.set(`sfx_${key}`, sound);
    }
  }

  /**
   * Cleanup all sounds
   */
  async dispose(): Promise<void> {
    for (const sound of this.soundCache.values()) {
      try {
        await sound.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
    }
    this.soundCache.clear();

    if (this.musicSound) {
      try {
        await this.musicSound.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
      this.musicSound = null;
    }

    this.initialized = false;
  }
}

// Export singleton instance
export const AudioManager = new AudioManagerClass();

// Export default
export default AudioManager;
