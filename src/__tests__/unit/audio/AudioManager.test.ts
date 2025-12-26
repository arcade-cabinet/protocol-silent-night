import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioManager } from '@/audio/AudioManager';
import * as Tone from 'tone';

// Mock Tone.js
vi.mock('tone', () => {
  const synthMock = {
    toDestination: vi.fn().mockReturnThis(),
    triggerAttackRelease: vi.fn(),
    dispose: vi.fn(),
    volume: { value: 0 },
  };

  class MockSynth {
    constructor() { return synthMock; }
  }
  class MockPolySynth {
    constructor() { return synthMock; }
  }
  class MockFMSynth {
    constructor() { return synthMock; }
  }
  class MockNoiseSynth {
    constructor() { return synthMock; }
  }

  return {
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn().mockReturnValue(0),
    gainToDb: vi.fn().mockReturnValue(0),
    getDestination: vi.fn().mockReturnValue({ volume: { value: 0 } }),
    getTransport: vi.fn().mockReturnValue({
      start: vi.fn(),
      stop: vi.fn(),
      bpm: { value: 120 },
    }),
    Synth: MockSynth,
    PolySynth: MockPolySynth,
    FMSynth: MockFMSynth,
    NoiseSynth: MockNoiseSynth,
    Loop: class {
      constructor(callback) {
        this.callback = callback;
      }
      start = vi.fn().mockReturnThis();
      stop = vi.fn().mockReturnThis();
      dispose = vi.fn().mockReturnThis();
    },
  };
});

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

    // The first call sets initializing = true, and subsequent calls return early.
    // However, if we wait for the first call to finish, the second call will see initialized = true and return early.
    // Tone.start should only be called once.
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

  it('should play music tracks', async () => {
    await AudioManager.initialize();
    
    AudioManager.playMusic('menu');
    expect(AudioManager.getSettings().currentTrack).toBe('menu');

    AudioManager.playMusic('combat');
    expect(AudioManager.getSettings().currentTrack).toBe('combat');
  });

  it('should stop music', async () => {
    await AudioManager.initialize();
    AudioManager.playMusic('menu');
    expect(AudioManager.getSettings().currentTrack).toBe('menu');

    AudioManager.stopMusic();
    expect(AudioManager.getSettings().currentTrack).toBe(null);
  });

  it('should play SFX', async () => {
    await AudioManager.initialize();
    
    expect(() => AudioManager.playSFX('ui_click')).not.toThrow();
    expect(() => AudioManager.playSFX('weapon_cannon')).not.toThrow();
  });
});
