import * as Tone from 'tone';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager, type MusicTrack } from '@/audio/AudioManager';

describe('AudioManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    AudioManager.dispose();
  });

  it('should initialize correctly', async () => {
    const settingsBefore = AudioManager.getSettings();
    expect(settingsBefore.initialized).toBe(false);

    await AudioManager.initialize();

    const settingsAfter = AudioManager.getSettings();
    expect(settingsAfter.initialized).toBe(true);
    expect(Tone.start).toHaveBeenCalled();
  });

  it('should be idempotent during initialization', async () => {
    await AudioManager.initialize();
    await AudioManager.initialize();

    expect(Tone.start).toHaveBeenCalledTimes(1);
  });

  it('should toggle music', async () => {
    await AudioManager.initialize();
    const initialSettings = AudioManager.getSettings();
    expect(initialSettings.musicEnabled).toBe(true);

    AudioManager.toggleMusic();
    expect(AudioManager.getSettings().musicEnabled).toBe(false);

    AudioManager.toggleMusic();
    expect(AudioManager.getSettings().musicEnabled).toBe(true);
  });

  it('should toggle SFX', async () => {
    await AudioManager.initialize();
    const initialSettings = AudioManager.getSettings();
    expect(initialSettings.sfxEnabled).toBe(true);

    AudioManager.toggleSFX();
    expect(AudioManager.getSettings().sfxEnabled).toBe(false);

    AudioManager.toggleSFX();
    expect(AudioManager.getSettings().sfxEnabled).toBe(true);
  });

  it('should set volumes correctly', async () => {
    await AudioManager.initialize();

    AudioManager.setMasterVolume(0.5);
    expect(AudioManager.getSettings().masterVolume).toBe(0.5);

    AudioManager.setMusicVolume(0.4);
    expect(AudioManager.getSettings().musicVolume).toBe(0.4);

    AudioManager.setSFXVolume(0.3);
    expect(AudioManager.getSettings().sfxVolume).toBe(0.3);
  });

  it('should play all music tracks', async () => {
    await AudioManager.initialize();

    const tracks: MusicTrack[] = ['menu', 'combat', 'boss', 'victory', 'defeat'];
    for (const track of tracks) {
      AudioManager.playMusic(track);
      expect(AudioManager.getSettings().currentTrack).toBe(track);
    }
  });

  it('should stop music', async () => {
    await AudioManager.initialize();
    AudioManager.playMusic('menu');
    expect(AudioManager.getSettings().currentTrack).toBe('menu');

    AudioManager.stopMusic();
    expect(AudioManager.getSettings().currentTrack).toBe(null);
  });

  it('should play all SFX', async () => {
    await AudioManager.initialize();

    const sfxList = [
      'weapon_cannon',
      'weapon_smg',
      'weapon_stars',
      'player_damage_light',
      'player_damage_heavy',
      'enemy_hit',
      'enemy_defeated',
      'boss_appear',
      'boss_hit',
      'boss_defeated',
      'ui_click',
      'ui_select',
      'streak_start',
      'victory',
      'defeat',
    ] as const;

    for (const sfx of sfxList) {
      expect(() => AudioManager.playSFX(sfx)).not.toThrow();
    }
  });

  it('should not play music if disabled', async () => {
    await AudioManager.initialize();
    AudioManager.toggleMusic(); // disable

    AudioManager.playMusic('menu');
    expect(AudioManager.getSettings().currentTrack).toBe(null);
  });
});
