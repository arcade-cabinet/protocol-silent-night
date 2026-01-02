/**
 * AudioManager - Comprehensive audio system for Protocol: Silent Night
 *
 * Manages background music (procedural Christmas synth) and sound effects
 * using Tone.js for synthesis and Web Audio API for playback.
 * Data-driven configuration from audio.json.
 */

import * as Tone from 'tone';
import AUDIO_DATA from '@/data/audio.json';

export type SoundEffect =
  | 'weapon_cannon'
  | 'weapon_smg'
  | 'weapon_stars'
  | 'player_damage_light'
  | 'player_damage_heavy'
  | 'enemy_hit'
  | 'enemy_defeated'
  | 'boss_appear'
  | 'boss_hit'
  | 'boss_defeated'
  | 'ui_click'
  | 'ui_select'
  | 'streak_start'
  | 'victory'
  | 'defeat';

export type MusicTrack = 'menu' | 'combat' | 'boss' | 'victory' | 'defeat';

class AudioManagerClass {
  private initialized = false;
  private initializing = false;
  private musicEnabled = true;
  private sfxEnabled = true;
  private masterVolume = 0.7;
  private musicVolume = 0.6;
  private sfxVolume = 0.8;

  // Synth instruments
  private synths: Map<string, Tone.Synth | Tone.PolySynth | Tone.FMSynth | Tone.NoiseSynth> =
    new Map();
  private currentTrack: MusicTrack | null = null;
  private musicLoop: Tone.Loop | null = null;
  private lastSfxTime = 0;

  /**
   * Initialize audio system. Must be called after user interaction.
   */
  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) return;

    this.initializing = true;
    try {
      // Start Tone.js audio context
      await Tone.start();
      console.log('🎵 Audio system initialized');

      // Create synth instruments
      this.createInstruments();

      // Load music preferences from localStorage
      this.loadPreferences();

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    } finally {
      this.initializing = false;
    }
  }

  /**
   * Create synth instruments for music and SFX
   */
  private createInstruments(): void {
    const { synths } = AUDIO_DATA;

    for (const [name, config] of Object.entries(synths)) {
      let synth: Tone.Synth | Tone.PolySynth | Tone.FMSynth | Tone.NoiseSynth;

      switch (config.type) {
        case 'PolySynth':
          // @ts-expect-error - Tone.js types can be tricky with constructors
          synth = new Tone.PolySynth(Tone.Synth, config.options).toDestination();
          break;
        case 'FMSynth':
          // @ts-expect-error
          synth = new Tone.FMSynth(config.options).toDestination();
          break;
        case 'NoiseSynth':
          // @ts-expect-error
          synth = new Tone.NoiseSynth(config.options).toDestination();
          break;
        default:
          // @ts-expect-error
          synth = new Tone.Synth(config.options).toDestination();
          break;
      }

      synth.volume.value = config.volume;
      this.synths.set(name, synth);
    }
  }

  /**
   * Play background music track
   */
  playMusic(track: MusicTrack): void {
    if (!this.initialized || !this.musicEnabled) return;
    if (this.currentTrack === track) return;

    // Stop current music
    this.stopMusic();

    this.currentTrack = track;

    const trackData = AUDIO_DATA.music[track as keyof typeof AUDIO_DATA.music];
    if (!trackData) return;

    const melodySynth = this.synths.get('melody') as Tone.PolySynth;
    const bassSynth = this.synths.get('bass') as Tone.FMSynth;
    const padSynth = this.synths.get('pad') as Tone.PolySynth;

    let index = 0;
    let chordIndex = 0;
    let bassIndex = 0;

    // @ts-expect-error
    const melody = trackData.melody || [];
    // @ts-expect-error
    const chords = trackData.chords || [];
    // @ts-expect-error
    const bass = trackData.bass || [];

    this.musicLoop = new Tone.Loop((time) => {
      // Play melody
      if (melody.length > 0) {
        melodySynth.triggerAttackRelease(melody[index % melody.length], '8n', time);
      }

      // Play chords
      if (chords.length > 0 && index % 4 === 0) {
        padSynth.triggerAttackRelease(chords[chordIndex % chords.length], '2n', time);
        chordIndex++;
      }

      // Play bass
      if (bass.length > 0 && index % 2 === 0) {
        bassSynth.triggerAttackRelease(bass[bassIndex % bass.length], '4n', time);
        bassIndex++;
      }

      index++;
    }, trackData.loop);

    this.musicLoop.start(0);
    Tone.getTransport().start();
    Tone.getTransport().bpm.value = trackData.bpm;
  }

  /**
   * Stop background music
   */
  stopMusic(): void {
    if (this.musicLoop) {
      this.musicLoop.stop();
      this.musicLoop.dispose();
      this.musicLoop = null;
    }
    Tone.getTransport().stop();
    this.currentTrack = null;
  }

  /**
   * Play sound effect
   */
  playSFX(effect: SoundEffect): void {
    if (!this.initialized || !this.sfxEnabled) return;

    const sfxSynth = this.synths.get('sfx') as Tone.Synth;
    const noiseSynth = this.synths.get('noise') as Tone.NoiseSynth;
    const now = Tone.now();

    // Prevent timing collisions by ensuring each SFX has a unique timestamp
    // Reset if there's been a gap of more than 1 second (prevents indefinite accumulation)
    if (now - this.lastSfxTime > 1.0) {
      this.lastSfxTime = now;
    }

    // Add small offset (1ms) if this call would overlap with the last one
    const minTimeBetweenSfx = 0.001; // 1ms
    const scheduledTime = Math.max(now, this.lastSfxTime + minTimeBetweenSfx);
    this.lastSfxTime = scheduledTime;

    const effectData = AUDIO_DATA.sfx[effect as keyof typeof AUDIO_DATA.sfx];
    if (!effectData) return;

    // Handle sequence
    // @ts-expect-error
    if (effectData.sequence) {
      // @ts-expect-error
      for (const [note, duration, delay = 0] of effectData.sequence) {
        sfxSynth.triggerAttackRelease(note, duration, scheduledTime + delay);
      }
    } else {
      // @ts-expect-error
      if (effectData.note) {
        // @ts-expect-error
        sfxSynth.triggerAttackRelease(effectData.note, effectData.duration, scheduledTime);
      }
      // @ts-expect-error
      if (effectData.noise) {
        // @ts-expect-error
        noiseSynth.triggerAttackRelease(effectData.duration, scheduledTime);
      }
    }
  }

  /**
   * Toggle music on/off
   */
  toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;
    this.savePreferences();

    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.playMusic(this.currentTrack);
    }
  }

  /**
   * Toggle sound effects on/off
   */
  toggleSFX(): void {
    this.sfxEnabled = !this.sfxEnabled;
    this.savePreferences();
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Tone.getDestination().volume.value = Tone.gainToDb(this.masterVolume);
    this.savePreferences();
  }

  /**
   * Set music volume (0-1)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    const db = Tone.gainToDb(this.musicVolume);
    if (this.synths.has('melody')) this.synths.get('melody')!.volume.value = -12 + db;
    if (this.synths.has('bass')) this.synths.get('bass')!.volume.value = -18 + db;
    if (this.synths.has('pad')) this.synths.get('pad')!.volume.value = -20 + db;
    this.savePreferences();
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    const db = Tone.gainToDb(this.sfxVolume);
    if (this.synths.has('sfx')) this.synths.get('sfx')!.volume.value = -10 + db;
    if (this.synths.has('noise')) this.synths.get('noise')!.volume.value = -20 + db;
    this.savePreferences();
  }

  /**
   * Get current audio settings
   */
  getSettings() {
    return {
      initialized: this.initialized,
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      currentTrack: this.currentTrack,
    };
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem(
        'audio_preferences',
        JSON.stringify({
          musicEnabled: this.musicEnabled,
          sfxEnabled: this.sfxEnabled,
          masterVolume: this.masterVolume,
          musicVolume: this.musicVolume,
          sfxVolume: this.sfxVolume,
        })
      );
    } catch (error) {
      console.warn('Failed to save audio preferences:', error);
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('audio_preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.musicEnabled = prefs.musicEnabled ?? true;
        this.sfxEnabled = prefs.sfxEnabled ?? true;
        this.masterVolume = prefs.masterVolume ?? 0.7;
        this.musicVolume = prefs.musicVolume ?? 0.6;
        this.sfxVolume = prefs.sfxVolume ?? 0.8;

        // Apply volumes
        this.setMasterVolume(this.masterVolume);
        this.setMusicVolume(this.musicVolume);
        this.setSFXVolume(this.sfxVolume);
      }
    } catch (error) {
      console.warn('Failed to load audio preferences:', error);
    }
  }

  /**
   * Cleanup and dispose of all audio resources
   */
  dispose(): void {
    this.stopMusic();

    for (const synth of this.synths.values()) {
      synth.dispose();
    }
    this.synths.clear();

    this.initialized = false;
    this.lastSfxTime = 0;
  }
}

// Export singleton instance
export const AudioManager = new AudioManagerClass();
