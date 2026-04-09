# Audio Architecture — Protocol: Silent Night

All audio is synthesized at runtime from GDScript primitives. No external audio files are imported. Every AudioStreamWAV is built from 16-bit PCM mono at 22050 Hz.

---

## Bus Layout

| Bus | Parent | Default Volume | Purpose |
|-----|--------|---------------|---------|
| Master | — | user pref | Global volume control |
| Music | Master | -20 dB | Looping reactive music tracks |
| SFX | Master | -15 dB | All one-shot 2D and 3D effects |
| Ambient | Master | -24 dB | Continuous background atmospheric bed |
| UI | Master | -15 dB | Menu clicks, confirmations |

Buses are created at runtime in `audio_manager._ensure_buses()` rather than baked into the Godot project settings. This is a headless audio driver workaround: the Null audio driver (used during `--headless` test runs) silently ignores bus operations rather than crashing, and runtime bus creation lets tests load without `project.godot` audio config present. The method is idempotent — it skips any bus that already exists by name.

Volumes default to code constants but are overridden on `attach()` from saved preferences via `_apply_saved_volumes(save_manager)`. The bus name key format in SaveManager is `bus_volume_<lowercase_bus_name>` (e.g. `bus_volume_sfx`).

---

## 2D SFX Pool

`audio_manager.gd` owns a round-robin pool of `POOL_SIZE = 6` `AudioStreamPlayer` nodes, all routed to the SFX bus at -15 dB. `_play(key)` pulls the next player in rotation, assigns the cached WAV, and calls `play()`. No priority or interruption logic — oldest slot is overwritten.

---

## Spatial Audio: audio_3d_pool.gd

| Parameter | Value |
|-----------|-------|
| Pool size | 16 `AudioStreamPlayer3D` nodes |
| Bus | SFX |
| Attenuation model | `ATTENUATION_INVERSE_DISTANCE` |
| Unit size | 1.0 m |
| Max distance | 35 m (matches arena scale) |

**API:** `play_3d(key, world_pos, volume_db = 0.0)`

Calls through `audio_manager_ext.play_3d()`, which looks up the WAV from the cache and delegates to `audio_3d_pool.play_at(stream, world_pos, volume_db)`. The pool uses the same round-robin cursor as the 2D pool. The manager-facing API on `audio_manager` proxies directly: `play_3d(key, pos, db)`.

---

## Ambient Bed: procedural_music.make_ambient_bed()

`make_ambient_bed(duration: float = 20.0)` synthesizes a 20-second looping atmospheric track built from four voice layers:

| Layer | Description |
|-------|-------------|
| Wind noise | Filtered random noise, amplitude modulated by a 0.07 Hz sine wave |
| Industrial hum | Stable 55 Hz + 82.5 Hz sine tones at low amplitude |
| Distant bells | Sparse bell at 987.77 Hz, gate fires every 7.3 s, 1.1 s decay |
| Snow crunch | Stochastic high-frequency tick, 0.08% chance per sample |

The stream uses `LOOP_FORWARD` with `loop_end = samples`. The fixed RNG seed `0xA1B1E7` makes the bed deterministic across runs.

Ambient playback is managed by a single `AudioStreamPlayer` on the Ambient bus. `play_ambient()` and `stop_ambient()` on the manager delegate to `audio_manager_ext`.

---

## Reactive Music: music_director.gd

`music_director.gd` watches live game state each frame and selects an intensity layer. It is a pure logic object — the manager owns players, the director only calls `audio_mgr.set_music_intensity(level)`.

### Intensity States

| State | Trigger condition | Track key |
|-------|-------------------|-----------|
| `calm` | < 10 enemies AND HP > 70% | `music_calm` |
| `gameplay` | default / 10–25 enemies / HP 30–70% | `music_gameplay` |
| `panic` | > 25 enemies OR HP < 30% | `music_panic` |
| `boss` | boss active (overrides all) | `music_boss` |

`pressure` is not a distinct state in the current implementation — the `gameplay` state covers the mid-pressure range.

**Hysteresis:** a 0.9 s cooldown (`COOLDOWN = 0.9`) prevents rapid thrashing when state toggles near thresholds.

**Crossfade:** `audio_manager_ext.set_music_intensity()` uses a `Tween` to fade out the current `_music_player` (-20 dB → -60 dB) and fade in the `_music_crossfade` player (-60 dB → -20 dB) over 0.8 s. After the tween, player references are swapped so the "current" is always `_music_player`.

### Tracks

| Cache key | Generator | Loop duration |
|-----------|-----------|--------------|
| `music_menu` | `make_menu_loop()` | 8 s |
| `music_gameplay` | `make_gameplay_loop()` | 6 s |
| `music_boss` | `make_boss_loop()` | 4 s |
| `music_calm` | `make_calm_loop()` | 6 s |
| `music_panic` | `make_panic_loop()` | 4 s |

All tracks are `LOOP_FORWARD`.

---

## Coal SFX: procedural_sfx.gd

`procedural_sfx.gd` provides synthesis primitives. All return `AudioStreamWAV` (no loop). Every method clamps output to `MAX_AMPLITUDE = 30000` (headroom below int16 max of 32767).

### Synthesis Primitives

| Method | Technique | Use case |
|--------|-----------|---------|
| `make_tone(freq, dur, decay)` | Sine with exponential envelope | Short hits, clicks |
| `make_sweep(start_f, end_f, dur, decay)` | Chirp with phase accumulator | Damage sweeps, boss sting |
| `make_chord(freqs[], dur, decay)` | Additive sine mix, equal amplitude per note | Level-up jingles, wave banners |
| `make_noise_burst(dur, decay, cutoff)` | White noise with single-pole LP filter | Coal spray, explosions |
| `make_whip(dur)` | Exponential frequency sweep 180→2580 Hz | Coal hurl |
| `make_bubble(dur)` | Detuned dual sawtooth with LFO | Coal poison |
| `make_crackle(dur)` | Sparse spiky noise with resonance | Coal embers |
| `make_chime_arp(freqs[], dur)` | Sequential tones with harmonic | Coal fortune |

### Coal SFX Dispatch: play_coal(kind)

`audio_manager.play_coal(kind)` looks up `"coal_<kind>"` in the WAV cache. The cache is pre-built in `_build_cache()`:

| Kind | Cache key | Synthesis |
|------|-----------|-----------|
| `spray` | `coal_spray` | `make_noise_burst(0.28, 5.0, 0.45)` |
| `hurl` | `coal_hurl` | `make_whip(0.3)` |
| `poison` | `coal_poison` | `make_bubble(0.6)` |
| `embers` | `coal_embers` | `make_crackle(0.55)` |
| `backfire` | `coal_backfire` | `make_sweep(420, 80, 0.45, 5.0)` |
| `fortune` | `coal_fortune` | `make_chime_arp([659, 784, 988, 1319], 0.6)` |

---

## Enemy Telegraph: play_enemy_telegraph(type, pos)

`audio_manager.play_enemy_telegraph(enemy_type, world_pos)` delegates to `audio_manager_ext.play_enemy_telegraph()`, which looks up `"enemy_telegraph_<type>"` in the cache and calls `play_3d()` at the enemy's world position with -6 dB offset.

Telegraph WAVs are seeded in `audio_manager_ext.seed_extended_cache()`:

| Enemy type | Cache key | Synthesis | Character |
|------------|-----------|-----------|-----------|
| `grunt` | `enemy_telegraph_grunt` | `make_tone(260, 0.14, 18)` | Low, short growl |
| `rusher` | `enemy_telegraph_rusher` | `make_tone(880, 0.05, 35)` | High-pitched blip |
| `tank` | `enemy_telegraph_tank` | `make_sweep(140, 90, 0.22, 8)` | Descending stomp |
| `krampus` | `enemy_telegraph_krampus` | `make_sweep(320, 120, 0.35, 4)` | Ominous bass drop |

Spatial falloff (35 m max distance, inverse-distance attenuation) means telegraphs are inaudible at range and loudest when an enemy is in melee proximity.

---

## Projectile Pitch: play_shot(color_hex)

`play_shot()` derives pitch from the projectile's color hue: `pitch = 0.75 + hue * 0.6`. A tone sweep (880 Hz base) is generated at that pitch and cached by pitch key, so each unique color generates a distinct shot sound on first fire. This gives visual-audio cohesion without per-weapon SFX authoring.
