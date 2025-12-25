import { describe, it, expect, beforeEach } from 'vitest';
import { AudioManager } from '../../../audio/AudioManager';

/**
 * REAL integration tests for AudioManager
 * These test actual behavior, not mocked implementations
 */
describe('AudioManager - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    if ((AudioManager as any).initialized) {
      AudioManager.dispose();
    }
  });

  describe('Settings Management', () => {
    it('should return correct initial settings before initialization', () => {
      const settings = AudioManager.getSettings();
      
      expect(settings.initialized).toBe(false);
      expect(settings.musicEnabled).toBe(true);
      expect(settings.sfxEnabled).toBe(true);
      expect(settings.currentTrack).toBeNull();
    });

    it('should persist and restore settings across sessions', async () => {
      await AudioManager.initialize();
      
      // Change settings
      AudioManager.setMasterVolume(0.5);
      AudioManager.setMusicVolume(0.3);
      AudioManager.setSFXVolume(0.4);
      AudioManager.toggleMusic(); // Disable
      AudioManager.toggleSFX(); // Disable
      
      // Verify saved
      const saved = localStorage.getItem('audio_preferences');
      expect(saved).toBeTruthy();
      const prefs = JSON.parse(saved!);
      expect(prefs.masterVolume).toBe(0.5);
      expect(prefs.musicVolume).toBe(0.3);
      expect(prefs.sfxVolume).toBe(0.4);
      expect(prefs.musicEnabled).toBe(false);
      expect(prefs.sfxEnabled).toBe(false);
      
      // Dispose and reinitialize
      AudioManager.dispose();
      await AudioManager.initialize();
      
      // Verify restored
      const settings = AudioManager.getSettings();
      expect(settings.masterVolume).toBe(0.5);
      expect(settings.musicVolume).toBe(0.3);
      expect(settings.sfxVolume).toBe(0.4);
      expect(settings.musicEnabled).toBe(false);
      expect(settings.sfxEnabled).toBe(false);
    });

    it('should handle corrupted localStorage gracefully', async () => {
      localStorage.setItem('audio_preferences', 'invalid json{{{');
      
      await AudioManager.initialize();
      
      const settings = AudioManager.getSettings();
      expect(settings.initialized).toBe(true);
      // Should fallback to defaults
      expect(settings.musicEnabled).toBe(true);
      expect(settings.sfxEnabled).toBe(true);
    });
  });

  describe('Volume Boundary Testing', () => {
    beforeEach(async () => {
      await AudioManager.initialize();
    });

    it('should clamp master volume to valid range', () => {
      AudioManager.setMasterVolume(-10);
      expect(AudioManager.getSettings().masterVolume).toBe(0);
      
      AudioManager.setMasterVolume(10);
      expect(AudioManager.getSettings().masterVolume).toBe(1);
      
      AudioManager.setMasterVolume(0.5);
      expect(AudioManager.getSettings().masterVolume).toBe(0.5);
    });

    it('should clamp music volume to valid range', () => {
      AudioManager.setMusicVolume(-10);
      expect(AudioManager.getSettings().musicVolume).toBe(0);
      
      AudioManager.setMusicVolume(10);
      expect(AudioManager.getSettings().musicVolume).toBe(1);
      
      AudioManager.setMusicVolume(0.7);
      expect(AudioManager.getSettings().musicVolume).toBe(0.7);
    });

    it('should clamp SFX volume to valid range', () => {
      AudioManager.setSFXVolume(-10);
      expect(AudioManager.getSettings().sfxVolume).toBe(0);
      
      AudioManager.setSFXVolume(10);
      expect(AudioManager.getSettings().sfxVolume).toBe(1);
      
      AudioManager.setSFXVolume(0.9);
      expect(AudioManager.getSettings().sfxVolume).toBe(0.9);
    });
  });

  describe('Music State Management', () => {
    beforeEach(async () => {
      await AudioManager.initialize();
    });

    it('should track current music track', () => {
      expect(AudioManager.getSettings().currentTrack).toBeNull();
      
      AudioManager.playMusic('menu');
      expect(AudioManager.getSettings().currentTrack).toBe('menu');
      
      AudioManager.playMusic('combat');
      expect(AudioManager.getSettings().currentTrack).toBe('combat');
      
      AudioManager.stopMusic();
      expect(AudioManager.getSettings().currentTrack).toBeNull();
    });

    it('should not change track if same track is played', () => {
      AudioManager.playMusic('boss');
      const track1 = AudioManager.getSettings().currentTrack;
      
      AudioManager.playMusic('boss');
      const track2 = AudioManager.getSettings().currentTrack;
      
      expect(track1).toBe(track2);
      expect(track1).toBe('boss');
    });

    it('should stop music when disabled', () => {
      AudioManager.playMusic('combat');
      expect(AudioManager.getSettings().currentTrack).toBe('combat');
      
      AudioManager.toggleMusic(); // Disable
      expect(AudioManager.getSettings().currentTrack).toBeNull();
      expect(AudioManager.getSettings().musicEnabled).toBe(false);
    });

    it('should not play music when disabled', () => {
      AudioManager.toggleMusic(); // Disable
      AudioManager.playMusic('victory');
      
      expect(AudioManager.getSettings().currentTrack).toBeNull();
      expect(AudioManager.getSettings().musicEnabled).toBe(false);
    });

    it('should support all music track types', () => {
      const tracks: Array<'menu' | 'combat' | 'boss' | 'victory' | 'defeat'> = [
        'menu',
        'combat',
        'boss',
        'victory',
        'defeat',
      ];
      
      for (const track of tracks) {
        AudioManager.playMusic(track);
        expect(AudioManager.getSettings().currentTrack).toBe(track);
      }
    });
  });

  describe('Toggle Behavior', () => {
    beforeEach(async () => {
      await AudioManager.initialize();
    });

    it('should toggle music enabled state', () => {
      expect(AudioManager.getSettings().musicEnabled).toBe(true);
      
      AudioManager.toggleMusic();
      expect(AudioManager.getSettings().musicEnabled).toBe(false);
      
      AudioManager.toggleMusic();
      expect(AudioManager.getSettings().musicEnabled).toBe(true);
    });

    it('should toggle SFX enabled state', () => {
      expect(AudioManager.getSettings().sfxEnabled).toBe(true);
      
      AudioManager.toggleSFX();
      expect(AudioManager.getSettings().sfxEnabled).toBe(false);
      
      AudioManager.toggleSFX();
      expect(AudioManager.getSettings().sfxEnabled).toBe(true);
    });

    it('should persist toggle changes to localStorage', () => {
      AudioManager.toggleMusic();
      AudioManager.toggleSFX();
      
      const saved = localStorage.getItem('audio_preferences');
      expect(saved).toBeTruthy();
      
      const prefs = JSON.parse(saved!);
      expect(prefs.musicEnabled).toBe(false);
      expect(prefs.sfxEnabled).toBe(false);
    });
  });

  describe('Cleanup and Disposal', () => {
    beforeEach(async () => {
      await AudioManager.initialize();
    });

    it('should reset state on dispose', () => {
      AudioManager.playMusic('combat');
      expect(AudioManager.getSettings().initialized).toBe(true);
      expect(AudioManager.getSettings().currentTrack).toBe('combat');
      
      AudioManager.dispose();
      
      expect(AudioManager.getSettings().initialized).toBe(false);
      expect(AudioManager.getSettings().currentTrack).toBeNull();
    });

    it('should allow reinitialization after dispose', async () => {
      await AudioManager.initialize();
      AudioManager.dispose();
      await AudioManager.initialize();
      
      expect(AudioManager.getSettings().initialized).toBe(true);
    });
  });

  describe('Sound Effects API Coverage', () => {
    beforeEach(async () => {
      await AudioManager.initialize();
    });

    it('should accept all weapon SFX types without error', () => {
      expect(() => AudioManager.playSFX('weapon_cannon')).not.toThrow();
      expect(() => AudioManager.playSFX('weapon_smg')).not.toThrow();
      expect(() => AudioManager.playSFX('weapon_stars')).not.toThrow();
    });

    it('should accept all damage SFX types without error', () => {
      expect(() => AudioManager.playSFX('player_damage_light')).not.toThrow();
      expect(() => AudioManager.playSFX('player_damage_heavy')).not.toThrow();
    });

    it('should accept all enemy SFX types without error', () => {
      expect(() => AudioManager.playSFX('enemy_hit')).not.toThrow();
      expect(() => AudioManager.playSFX('enemy_defeated')).not.toThrow();
    });

    it('should accept all boss SFX types without error', () => {
      expect(() => AudioManager.playSFX('boss_appear')).not.toThrow();
      expect(() => AudioManager.playSFX('boss_hit')).not.toThrow();
      expect(() => AudioManager.playSFX('boss_defeated')).not.toThrow();
    });

    it('should accept all UI SFX types without error', () => {
      expect(() => AudioManager.playSFX('ui_click')).not.toThrow();
      expect(() => AudioManager.playSFX('ui_select')).not.toThrow();
    });

    it('should accept all game event SFX types without error', () => {
      expect(() => AudioManager.playSFX('streak_start')).not.toThrow();
      expect(() => AudioManager.playSFX('victory')).not.toThrow();
      expect(() => AudioManager.playSFX('defeat')).not.toThrow();
    });

    it('should not throw when SFX disabled', () => {
      AudioManager.toggleSFX(); // Disable
      
      expect(() => AudioManager.playSFX('weapon_cannon')).not.toThrow();
      expect(() => AudioManager.playSFX('boss_defeated')).not.toThrow();
    });
  });
});
