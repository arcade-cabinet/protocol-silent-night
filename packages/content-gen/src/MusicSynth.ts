/**
 * Procedural Audio Engine - AKIRA Style
 * Tribal percussion, polyrhythmic structures, synthesized chanting
 */

export class MusicSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private beat = 0;
  private nextTime = 0;
  private tempo = 150; // Fast tribal tempo
  private schedulerHandle: number | null = null;

  init(): void {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    // Resume logic for browser policy
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  start(): void {
    this.init();
    if (!this.ctx || this.isPlaying) return;
    this.isPlaying = true;
    this.nextTime = this.ctx.currentTime;
    this.schedule();
  }

  stop(): void {
    this.isPlaying = false;
    if (this.schedulerHandle) {
      clearTimeout(this.schedulerHandle);
      this.schedulerHandle = null;
    }
  }

  private schedule(): void {
    if (!this.isPlaying || !this.ctx) return;

    while (this.nextTime < this.ctx.currentTime + 0.1) {
      this.playPattern(this.beat, this.nextTime);
      this.nextTime += 60 / this.tempo / 4; // 16th notes
      this.beat = (this.beat + 1) % 32; // 2 bar loop
    }

    this.schedulerHandle = window.setTimeout(() => this.schedule(), 25);
  }

  private playPattern(b: number, t: number): void {
    if (!this.ctx) return;

    // TAIKO KICK (Deep, Resonant) - Polyrhythmic feel
    // Pattern: X... X.X. X... X... (Tribal)
    const kickPat = [
      1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0,
      0,
    ];
    if (kickPat[b]) this.taiko(t, 0.8);

    // WOODBLOCK / CLACK (Sharp, Metallic)
    // Syncopated accents
    const clackPat = [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]; // repeat twice for 32
    if (clackPat[b % 16]) this.woodblock(t);

    // BREATH / RASP (The "Hoh!" chant sound)
    if (b === 0 || b === 16) this.breath(t);

    // GAMELAN BELL (Eerie high pitch)
    if (b % 8 === 0 && Math.random() > 0.5) {
      this.bell(t, 800 + Math.random() * 400);
    }
  }

  private taiko(t: number, vol: number): void {
    if (!this.ctx) return;

    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.2); // Pitch drop
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.4);
  }

  private woodblock(t: number): void {
    if (!this.ctx) return;

    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(800, t);
    o.frequency.exponentialRampToValueAtTime(100, t + 0.05);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.05);
  }

  private breath(t: number): void {
    if (!this.ctx) return;

    // Filtered noise to simulate human "Hoh!"
    const bSize = this.ctx.sampleRate * 0.2;
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = b;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 400;
    f.Q.value = 1;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.4, t);
    g.gain.linearRampToValueAtTime(0, t + 0.15);

    src.connect(f);
    f.connect(g);
    g.connect(this.ctx.destination);
    src.start(t);
  }

  private bell(t: number, freq: number): void {
    if (!this.ctx) return;

    const o = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator(); // FM modulator
    const g = this.ctx.createGain();
    const g2 = this.ctx.createGain();

    o.type = 'sine';
    o.frequency.value = freq;
    o2.type = 'square';
    o2.frequency.value = freq * 1.5;

    g2.gain.value = 500; // Modulation depth
    o2.connect(g2);
    g2.connect(o.frequency as AudioParam);

    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 1);
    o2.start(t);
    o2.stop(t + 1);
  }

  // --- ONE-SHOT EFFECTS ---

  playJump(): void {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    o.frequency.setValueAtTime(200, t);
    o.frequency.linearRampToValueAtTime(600, t + 0.1);
    g.gain.setValueAtTime(0.3, t);
    g.gain.linearRampToValueAtTime(0, t + 0.1);

    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.1);
  }

  playSlide(): void {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Filtered noise sweep
    const bSize = this.ctx.sampleRate * 0.3;
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = b;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(800, t);
    f.frequency.linearRampToValueAtTime(100, t + 0.3);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.linearRampToValueAtTime(0, t + 0.3);

    src.connect(f);
    f.connect(g);
    g.connect(this.ctx.destination);
    src.start(t);
  }

  playImpact(): void {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Sub drop
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(10, t + 0.5);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(t);
    o.stop(t + 0.5);

    // Noise crash
    const bSize = this.ctx.sampleRate * 0.2;
    const b = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;

    const src = this.ctx.createBufferSource();
    src.buffer = b;
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.5, t);
    g2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    src.connect(g2);
    g2.connect(this.ctx.destination);
    src.start(t);
  }
}

// Singleton instance
export const musicSynth = new MusicSynth();
