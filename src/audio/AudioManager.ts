/**
 * AudioManager - Comprehensive audio system for Protocol: Silent Night
 *
 * Manages background music (procedural Christmas synth) and sound effects
 * using Tone.js for synthesis and Web Audio API for playback.
 */

import * as Tone from 'tone';

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

  /**
   * Initialize audio system. Must be called after user interaction.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

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
    }
  }

  /**
   * Create synth instruments for music and SFX
   */
  private createInstruments(): void {
    // Melodic synth for lead melodies (Christmas bells sound)
    const melodySynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.1,
        release: 0.5,
      },
    }).toDestination();
    melodySynth.volume.value = -12;
    this.synths.set('melody', melodySynth);

    // Bass synth for low-end
    const bassSynth = new Tone.FMSynth({
      harmonicity: 0.5,
      modulationIndex: 3,
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.3,
        release: 0.5,
      },
    }).toDestination();
    bassSynth.volume.value = -18;
    this.synths.set('bass', bassSynth);

    // Pad synth for atmospheric background
    const padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 1.0,
        decay: 0.5,
        sustain: 0.7,
        release: 2.0,
      },
    }).toDestination();
    padSynth.volume.value = -20;
    this.synths.set('pad', padSynth);

    // Noise synth for percussive sounds
    const noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
      },
    }).toDestination();
    noiseSynth.volume.value = -20;
    this.synths.set('noise', noiseSynth);

    // SFX synth for sound effects
    const sfxSynth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.1,
        release: 0.1,
      },
    }).toDestination();
    sfxSynth.volume.value = -10;
    this.synths.set('sfx', sfxSynth);
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

    // Start appropriate music pattern
    switch (track) {
      case 'menu':
        this.playMenuMusic();
        break;
      case 'combat':
        this.playCombatMusic();
        break;
      case 'boss':
        this.playBossMusic();
        break;
      case 'victory':
        this.playVictoryMusic();
        break;
      case 'defeat':
        this.playDefeatMusic();
        break;
    }
  }

  /**
   * Menu music - Calm Christmas melody
   */
  private playMenuMusic(): void {
    const melodySynth = this.synths.get('melody') as Tone.PolySynth;
    const padSynth = this.synths.get('pad') as Tone.PolySynth;

    // Simple Christmas-inspired chord progression
    const chordProgression = [
      ['C4', 'E4', 'G4'],
      ['A3', 'C4', 'E4'],
      ['F3', 'A3', 'C4'],
      ['G3', 'B3', 'D4'],
    ];

    const melody = ['C5', 'E5', 'G5', 'C6', 'G5', 'E5', 'C5', 'G4'];

    let chordIndex = 0;
    let melodyIndex = 0;

    this.musicLoop = new Tone.Loop((time) => {
      // Play chord
      padSynth.triggerAttackRelease(chordProgression[chordIndex], '2n', time);
      chordIndex = (chordIndex + 1) % chordProgression.length;

      // Play melody note
      melodySynth.triggerAttackRelease(melody[melodyIndex], '8n', time);
      melodyIndex = (melodyIndex + 1) % melody.length;
    }, '4n');

    this.musicLoop.start(0);
    Tone.getTransport().start();
    Tone.getTransport().bpm.value = 100;
  }

  /**
   * Combat music - Upbeat action theme with tech elements
   */
  private playCombatMusic(): void {
    const melodySynth = this.synths.get('melody') as Tone.PolySynth;
    const bassSynth = this.synths.get('bass') as Tone.FMSynth;

    // Fast-paced combat melody
    const combatMelody = ['G4', 'A4', 'B4', 'D5', 'B4', 'A4', 'G4', 'E4'];
    const bassLine = ['G2', 'G2', 'E2', 'E2'];

    let melodyIndex = 0;
    let bassIndex = 0;

    this.musicLoop = new Tone.Loop((time) => {
      // Melody on 8th notes
      melodySynth.triggerAttackRelease(combatMelody[melodyIndex], '16n', time);
      melodyIndex = (melodyIndex + 1) % combatMelody.length;

      // Bass on quarter notes
      if (melodyIndex % 2 === 0) {
        bassSynth.triggerAttackRelease(bassLine[bassIndex], '4n', time);
        bassIndex = (bassIndex + 1) % bassLine.length;
      }
    }, '16n');

    this.musicLoop.start(0);
    Tone.getTransport().start();
    Tone.getTransport().bpm.value = 140;
  }

  /**
   * Boss music - Intense dramatic theme
   */
  private playBossMusic(): void {
    const melodySynth = this.synths.get('melody') as Tone.PolySynth;
    const bassSynth = this.synths.get('bass') as Tone.FMSynth;
    const padSynth = this.synths.get('pad') as Tone.PolySynth;

    // Dramatic boss theme
    const bossMelody = ['E4', 'G4', 'B4', 'E5', 'D5', 'B4', 'G4', 'E4'];
    const bossChords = [
      ['E3', 'G3', 'B3'],
      ['D3', 'F#3', 'A3'],
    ];
    const bassLine = ['E2', 'E2', 'D2', 'D2'];

    let melodyIndex = 0;
    let chordIndex = 0;
    let bassIndex = 0;

    this.musicLoop = new Tone.Loop((time) => {
      // Fast melody
      melodySynth.triggerAttackRelease(bossMelody[melodyIndex], '16n', time);
      melodyIndex = (melodyIndex + 1) % bossMelody.length;

      // Heavy bass
      if (melodyIndex % 2 === 0) {
        bassSynth.triggerAttackRelease(bassLine[bassIndex], '8n', time);
        bassIndex = (bassIndex + 1) % bassLine.length;
      }

      // Pad chords
      if (melodyIndex % 4 === 0) {
        padSynth.triggerAttackRelease(bossChords[chordIndex], '2n', time);
        chordIndex = (chordIndex + 1) % bossChords.length;
      }
    }, '16n');

    this.musicLoop.start(0);
    Tone.getTransport().start();
    Tone.getTransport().bpm.value = 160;
  }

  /**
   * Victory music - Triumphant fanfare
   */
  private playVictoryMusic(): void {
    const melodySynth = this.synths.get('melody') as Tone.PolySynth;

    // Victory fanfare
    const victoryMelody = ['C5', 'E5', 'G5', 'C6'];

    let index = 0;
    this.musicLoop = new Tone.Loop((time) => {
      melodySynth.triggerAttackRelease(victoryMelody[index], '4n', time);
      index = (index + 1) % victoryMelody.length;
    }, '4n');

    this.musicLoop.start(0);
    Tone.getTransport().start();
    Tone.getTransport().bpm.value = 120;
  }

  /**
   * Defeat music - Somber theme
   */
  private playDefeatMusic(): void {
    const padSynth = this.synths.get('pad') as Tone.PolySynth;

    // Sad chord progression
    const defeatChords = [
      ['C4', 'Eb4', 'G4'],
      ['A3', 'C4', 'Eb4'],
    ];

    let index = 0;
    this.musicLoop = new Tone.Loop((time) => {
      padSynth.triggerAttackRelease(defeatChords[index], '1n', time);
      index = (index + 1) % defeatChords.length;
    }, '2n');

    this.musicLoop.start(0);
    Tone.getTransport().start();
    Tone.getTransport().bpm.value = 60;
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

    switch (effect) {
      case 'weapon_cannon':
        sfxSynth.triggerAttackRelease('C2', '0.1', now);
        noiseSynth.triggerAttackRelease('0.05', now);
        break;
      case 'weapon_smg':
        sfxSynth.triggerAttackRelease('G3', '0.05', now);
        break;
      case 'weapon_stars':
        sfxSynth.triggerAttackRelease('C5', '0.08', now);
        break;
      case 'player_damage_light':
        sfxSynth.triggerAttackRelease('E3', '0.1', now);
        break;
      case 'player_damage_heavy':
        sfxSynth.triggerAttackRelease('C2', '0.2', now);
        noiseSynth.triggerAttackRelease('0.1', now);
        break;
      case 'enemy_hit':
        sfxSynth.triggerAttackRelease('A4', '0.05', now);
        break;
      case 'enemy_defeated':
        sfxSynth.triggerAttackRelease('E5', '0.15', now);
        sfxSynth.triggerAttackRelease('C5', '0.15', now + 0.1);
        break;
      case 'boss_appear':
        sfxSynth.triggerAttackRelease('C2', '0.5', now);
        sfxSynth.triggerAttackRelease('G2', '0.5', now + 0.2);
        sfxSynth.triggerAttackRelease('C3', '0.5', now + 0.4);
        break;
      case 'boss_hit':
        sfxSynth.triggerAttackRelease('E3', '0.1', now);
        noiseSynth.triggerAttackRelease('0.05', now);
        break;
      case 'boss_defeated':
        sfxSynth.triggerAttackRelease('C5', '0.3', now);
        sfxSynth.triggerAttackRelease('E5', '0.3', now + 0.15);
        sfxSynth.triggerAttackRelease('G5', '0.3', now + 0.3);
        break;
      case 'ui_click':
        sfxSynth.triggerAttackRelease('C5', '0.05', now);
        break;
      case 'ui_select':
        sfxSynth.triggerAttackRelease('E5', '0.1', now);
        sfxSynth.triggerAttackRelease('G5', '0.1', now + 0.05);
        break;
      case 'streak_start':
        sfxSynth.triggerAttackRelease('G4', '0.1', now);
        sfxSynth.triggerAttackRelease('B4', '0.1', now + 0.05);
        sfxSynth.triggerAttackRelease('D5', '0.1', now + 0.1);
        break;
      case 'victory':
        sfxSynth.triggerAttackRelease('C5', '0.3', now);
        sfxSynth.triggerAttackRelease('E5', '0.3', now + 0.15);
        sfxSynth.triggerAttackRelease('G5', '0.3', now + 0.3);
        sfxSynth.triggerAttackRelease('C6', '0.5', now + 0.45);
        break;
      case 'defeat':
        sfxSynth.triggerAttackRelease('C4', '0.5', now);
        sfxSynth.triggerAttackRelease('A3', '0.5', now + 0.2);
        sfxSynth.triggerAttackRelease('F3', '1.0', now + 0.4);
        break;
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
    // Apply to music synths
    this.synths.get('melody')!.volume.value = -12 + Tone.gainToDb(this.musicVolume);
    this.synths.get('bass')!.volume.value = -18 + Tone.gainToDb(this.musicVolume);
    this.synths.get('pad')!.volume.value = -20 + Tone.gainToDb(this.musicVolume);
    this.savePreferences();
  }

  /**
   * Set SFX volume (0-1)
   */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.synths.get('sfx')!.volume.value = -10 + Tone.gainToDb(this.sfxVolume);
    this.synths.get('noise')!.volume.value = -20 + Tone.gainToDb(this.sfxVolume);
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
  }
}

// Export singleton instance
export const AudioManager = new AudioManagerClass();
