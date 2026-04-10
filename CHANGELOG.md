# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Game-Completion Batch (PR #152)

- **Enemy AI — BT state machines**: Pure GDScript BT state machines (`enemy_bt_states.gd`, `boss_bt_helpers.gd`) with no external dependency. Grunt: wander (>12u) → chase → contact. Rusher: idle → burst-sprint (2.5× speed, 0.6s) → cooldown (0.9s) with telegraph. Tank: advance → prep_slam (0.5s telegraph) → slam (1.8× dmg, 1.5u radius) → stagger (0.8s). Krampus HSM: phase 1 circle-strafe at 10u orbit + fan shots (0.9s); phase 2 charge every 4s + ranged (1.2s); phase 3 charge every 2.5s + multi-shot (3 proj, ±10°, 0.8s) + 2 minions every 6s.
- **Arena zone tinting**: Radial GLSL shader blend in arena floor — snow (white/pale blue, inner 32%), ice (cyan gloss, 32–68%), asphalt (dark industrial, 68–88%), with edge darkening. Roughness and specular track zone transitions.
- **Present portrait viewport**: `SubViewport` 3D panel on select screen renders a rotating present preview (45°/s Y spin via `auto_rotate.gd`) on button hover. `present_preview_viewport.gd` handles headless no-op. Radar chart and viewport both update on hover.
- **Board object visuals**: Frozen Mailbox (upright 0.4×0.8×0.4 box + mouth slot + frost sphere); Gift Cache (low wide 1.0×0.35×1.0 + ribbon cross, two gold strips); Chimney Vent (0.45r cylinder + CPUParticles3D smoke emitter + ember glow). All three get billboard health bars (QuadMesh, unshaded, `BILLBOARD_ENABLED`); handler updates scale.x on damage.
- **Android export**: `export_presets.cfg` with arm64-v8a, landscape locked, min SDK 28 / target SDK 34. `project.godot` gets `window/handheld/orientation=0`. Touch input tests verify drag→move and dash zone on 390×844 viewport.
- **E2E full-flow**: `test_full_session_flow.gd` — 2 waves + wave_clear drain + win + bumble unlock + menu return, headless, <15s.
- **Dead code removal**: `classes.json` and `waves.json` deleted; `_class_defs` parameter removed from `spawn_player` + `refresh_start_screen`; `_spawn_legacy_player` removed; `wave_formula.gd` is sole wave content source.
- **Architecture docs**: `AUDIO_ARCHITECTURE.md` (146 lines), `PRESENT_SYSTEM.md` (164 lines), `HUD_WIDGETS.md` (219 lines), `SCRIPTS_REFERENCE.md` (158 lines).
- **Tests**: +27 unit/component tests (198→225), all passing. Zero LOC violations.

## [0.1.0] — Godot Reboot (2026-04-09)

Complete rewrite from BabylonJS/TypeScript to Godot 4.6.2 GDScript.
Wave formula, present roster, boss system, and full production polish shipped.

### Production Polish Batch (PRs #148–151)

- **Coal system**: World-space VFX particle compositions per effect kind (spray/hurl/poison/embers/backfire/fortune); 6 unique synthesized SFX; sidebar pulse/consume animation; rarity tiers (common 70% / rare 25% / legendary 5%) with scaled trauma and VFX
- **Present roster**: 26-present body-shape-aware rig with anatomy sockets; 8 topper kinds (santa_hat/antlers/star/halo/candy_cane/bow_giant/ornament); 4 accessory types (scarf/tag/ribbon_tail/glow_aura); idle animation dispatch per body shape (bounce/sway/wobble/hop/spin); ribbon pattern variants (diagonal/checker); stat balance pass aligning archetypes to shapes
- **Audio**: 5-bus architecture (Master/Music/SFX/Ambient/UI) created at runtime; 16-slot AudioStreamPlayer3D pool; 20s procedural ambient bed (wind/industrial hum/distant bells/snow crunch); reactive music intensity (calm→gameplay→pressure→panic→boss) with 0.8s crossfade; enemy telegraph tones; boss phase sting
- **HUD & UX**: 140px circular minimap radar; tier-escalating combo counter; off-screen threat arrows; damage number stacking with crit bounce; settings TabContainer (Audio/Display/Gameplay); pause menu with keyboard navigation; stat radar chart with axis labels; present 3D preview SubViewport (radar wired, rotating preview deferred); pickup attraction ring; vignette on low HP; character-reveal wave banner; HP bar sin-pulse
- **Integration**: Widget build/refresh pattern; boss phase → sting + screen shake; enemy telegraph → spatial 3D audio; reduced motion across flair/present/shake systems
- **Tests**: +57 unit/component tests (141→198), 9 new test suites

### Godot Reboot Core Systems (PRs #140–147)

- **Arena**: Orthographic rectangular board (Brotato-style), procedural generation via Gaea, obstacle placement, spawn rings, snow drift decoration
- **Player**: 25-present anthropomorphic roster with PRNG-seeded unlock milestones; present factory with procedural mesh assembly (box/topper/bow/arms/face); WASD + touch drag-to-move + dash mechanic; auto-fire with range targeting
- **Enemies**: 7 enemy types (grunt/rusher/tank/elf/santa/bumble/krampus); behavior system (seek/ranged/flank); Krampus-Prime boss with 3-phase pressure accumulator; enemy phase scaling by level×difficulty
- **Wave formula**: PRNG-seeded generation; no hardcoded tables; level as force multiplier across spawn_rate/composition/hp_scale/speed_mult/pattern/burst_chance/boss_pressure/scroll_pressure; 5 pattern types (scatter/ring/wedge/flanking/spiral)
- **Coal & scrolls**: PRNG-driven scroll pressure accumulator; board objects (Frozen Mailbox/Gift Cache/Chimney Vent); Naughty/Nice list scrolls; coal sidebar buff queue with 6 random effects
- **Gear & loot**: 4 gear slots per present (weapon_mod/wrapping_upgrade/bow_accessory/tag_charm); 5 rarity tiers (common→legendary); gear stat modifiers; gear visualizer on player mesh; market screen with reroll
- **Between-match flow**: RESULTS → SCROLLS → MARKET 3-screen flow; cookie economy (persistent meta currency); scroll unfurl animation; market refresh
- **Difficulty**: 6 tiers Priceless→Unforgivable (1×–6× formula multiplier); rewraps = lives (5→0 by tier); permadeath toggle
- **Audio**: Procedural SFX synthesis; 3 music loop layers; present audio; damage/pickup feedback
- **Save system**: JSON persistence; character unlocks; cookie balance; coal queue; gear loadout; achievements; preferences

## [1.0.0] — BabylonJS Release (2026-01-19)

### Features (BabylonJS/React/TypeScript implementation — superseded by Godot reboot)
- Complete BabylonJS 3D implementation with React Three Fiber frontend
- Three playable operators: Cyber-Elf, Mecha-Santa, The Bumble
- 10-wave campaign with Krampus-Prime boss encounter
- Procedural sky, terrain, and obstacle generation
- Full CI/CD pipeline with GitHub Pages deployment
- Mobile-first touch controls via Capacitor plugin
- Save system with operator unlock progression
- Accessibility improvements: ARIA attributes, accessible status bars

### Previous Releases (Dec 2025 — React/TypeScript era)
- v4.0 Unified DDL Edition: React/TypeScript game loop rebuild
- Gameplay juice: enemy behaviors, particles, character animation
- Security: save file integrity checks, tampering protection
- Performance: optimized render loops, HUD re-render elimination
- Accessibility: accessible palette, status bars, ARIA landmarks
- Test coverage: 50%+ coverage with audio system and player tests

[Unreleased]: https://github.com/arcade-cabinet/protocol-silent-night/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/arcade-cabinet/protocol-silent-night/compare/v1.0.0...v0.1.0
[1.0.0]: https://github.com/arcade-cabinet/protocol-silent-night/releases/tag/v1.0.0
