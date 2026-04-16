# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0](https://github.com/arcade-cabinet/protocol-silent-night/compare/v0.5.0...v0.6.0) (2026-04-14)


### Features

* **gameplay:** add endless mode and complex level-up particle bursts ([#201](https://github.com/arcade-cabinet/protocol-silent-night/issues/201)) ([b9b82d3](https://github.com/arcade-cabinet/protocol-silent-night/commit/b9b82d3e3252561b33d31195f243a2a829090f73))
* **production:** lock release contracts and audit lane ([#203](https://github.com/arcade-cabinet/protocol-silent-night/issues/203)) ([7e45cb7](https://github.com/arcade-cabinet/protocol-silent-night/commit/7e45cb789b56bb497ab525ce9a4c074e868b85b1))

## [0.5.0](https://github.com/arcade-cabinet/protocol-silent-night/compare/v0.4.0...v0.5.0) (2026-04-12)


### Features

* **visuals:** add weather director for viewport-filling holidaypunk wonderland ([#198](https://github.com/arcade-cabinet/protocol-silent-night/issues/198)) ([e3497a3](https://github.com/arcade-cabinet/protocol-silent-night/commit/e3497a35d8090203238577e6f93d4c8abd02944b))

## [0.4.0](https://github.com/arcade-cabinet/protocol-silent-night/compare/v0.3.0...v0.4.0) (2026-04-12)


### Features

* **ui:** responsive swipeable character carousel and locked states ([#195](https://github.com/arcade-cabinet/protocol-silent-night/issues/195)) ([1ef42f4](https://github.com/arcade-cabinet/protocol-silent-night/commit/1ef42f45879af1b6c61e82134b7a804b4b0712c8))


### Bug Fixes

* **ci:** compress lines to resolve LOC violations ([#197](https://github.com/arcade-cabinet/protocol-silent-night/issues/197)) ([4d4343b](https://github.com/arcade-cabinet/protocol-silent-night/commit/4d4343b2ee0e882e42ee3853ac7c8c8f8736ebce))
* **tests:** resolve test regressions from refactoring ([#190](https://github.com/arcade-cabinet/protocol-silent-night/issues/190)) ([f6ffeb8](https://github.com/arcade-cabinet/protocol-silent-night/commit/f6ffeb8a5099efdb2c8875bfd88bfe5ea13f6b6e))
* **ui:** responsive viewport scaling and mobile touch emulation ([#193](https://github.com/arcade-cabinet/protocol-silent-night/issues/193)) ([57a85aa](https://github.com/arcade-cabinet/protocol-silent-night/commit/57a85aa7aac20fa68b8a927048b8c87e42d1eafa))

## [0.3.0](https://github.com/arcade-cabinet/protocol-silent-night/compare/v0.2.0...v0.3.0) (2026-04-11)


### Features

* **alignment:** full production polish, consolidated docs, and expanded roster ([#189](https://github.com/arcade-cabinet/protocol-silent-night/issues/189)) ([34f1575](https://github.com/arcade-cabinet/protocol-silent-night/commit/34f15754ea6c682616070284ee17edc05cea25e9))
* **polish:** align MVP characters, decompose god classes, and refine climax loop ([#180](https://github.com/arcade-cabinet/protocol-silent-night/issues/180)) ([b2597d0](https://github.com/arcade-cabinet/protocol-silent-night/commit/b2597d01a3686e24b42d9d356e5e389afc0ff405))
* **ui:** implement Brotato-style menu flow and remove legacy characters from roster ([#183](https://github.com/arcade-cabinet/protocol-silent-night/issues/183)) ([87a3a56](https://github.com/arcade-cabinet/protocol-silent-night/commit/87a3a56f90fb02b1ddc7691acea788ccb0599f61))


### Bug Fixes

* **enemies:** transition legacy playables to procedural enemy factory ([#185](https://github.com/arcade-cabinet/protocol-silent-night/issues/185)) ([9dae20f](https://github.com/arcade-cabinet/protocol-silent-night/commit/9dae20fc57b69b086272fe84bcc71df33eea16d3))
* **export:** enable GDExtension support, add project icon, and fix GH Pages COOP/COEP ([#182](https://github.com/arcade-cabinet/protocol-silent-night/issues/182)) ([04dd5d1](https://github.com/arcade-cabinet/protocol-silent-night/commit/04dd5d153e6e512f9acc660df13ca49026ba2868))
* **save:** record run stats correctly at start and end ([#178](https://github.com/arcade-cabinet/protocol-silent-night/issues/178)) ([85478e0](https://github.com/arcade-cabinet/protocol-silent-night/commit/85478e022be0e145c9449591c7b6e93b20231a86))
* **ui:** reset character select button state when returning to title screen ([#187](https://github.com/arcade-cabinet/protocol-silent-night/issues/187)) ([320273c](https://github.com/arcade-cabinet/protocol-silent-night/commit/320273c4c93ca989cab283d9335db1a6a895385d))

## [0.2.0](https://github.com/arcade-cabinet/protocol-silent-night/compare/v0.1.0...v0.2.0) (2026-04-10)


### Features

* **1.0:** Complete BabylonJS implementation and CI/CD for release ([a795a5c](https://github.com/arcade-cabinet/protocol-silent-night/commit/a795a5c6fa81f6613b5e54aee23c808b4ae37b3c))
* add @strata/capacitor-plugin for standardized storage and input ([#18](https://github.com/arcade-cabinet/protocol-silent-night/issues/18)) ([2c1eedf](https://github.com/arcade-cabinet/protocol-silent-night/commit/2c1eedf1f117a157c77c6feac0799240e1b73020))
* Add mission briefing screen and character model enhancements ([#19](https://github.com/arcade-cabinet/protocol-silent-night/issues/19)) ([25d39c5](https://github.com/arcade-cabinet/protocol-silent-night/commit/25d39c5b09b35af1377562b057f900a740aff86e))
* add uv support, all actions pinned to SHAs ([6da9d9b](https://github.com/arcade-cabinet/protocol-silent-night/commit/6da9d9bb008e702167f1930df253fff0fdf98103))
* boss phases + procedural music loops ([#143](https://github.com/arcade-cabinet/protocol-silent-night/issues/143)) ([99991ef](https://github.com/arcade-cabinet/protocol-silent-night/commit/99991ef5924d754eb9cac40d4441cd02db26d8cf))
* boss pressure accumulator + countdown timer (replaces fixed boss waves) ([#145](https://github.com/arcade-cabinet/protocol-silent-night/issues/145)) ([58cbc02](https://github.com/arcade-cabinet/protocol-silent-night/commit/58cbc022151fb1b65f05b96c43f3430d308b4c44))
* **combat:** final polish and macro/meso fixes ([#179](https://github.com/arcade-cabinet/protocol-silent-night/issues/179)) ([058ac14](https://github.com/arcade-cabinet/protocol-silent-night/commit/058ac141c5261d9b0818fefe60639f034b6b6b75))
* complete Phase 3 content scaling and fix security tests ([#60](https://github.com/arcade-cabinet/protocol-silent-night/issues/60)) ([a3dc71a](https://github.com/arcade-cabinet/protocol-silent-night/commit/a3dc71a20fd11082dc17c80ea3aaea06c787252d))
* gameplay juice — enemy behaviors, particles, present animation ([#142](https://github.com/arcade-cabinet/protocol-silent-night/issues/142)) ([d906650](https://github.com/arcade-cabinet/protocol-silent-night/commit/d906650950121b409e8c7f737b174522f66281a3))
* production-polish batch — enemy AI, balance, perf, android, CI, security ([fa189e1](https://github.com/arcade-cabinet/protocol-silent-night/commit/fa189e10815795e550fdb43df4d7612c1f792077))
* roster expansion + audio + damage numbers + HUD polish ([#141](https://github.com/arcade-cabinet/protocol-silent-night/issues/141)) ([58f64d2](https://github.com/arcade-cabinet/protocol-silent-night/commit/58f64d2e52585cb52a954b774c4bd63792477466))
* **security:** implement checksum verification for local storage ([#42](https://github.com/arcade-cabinet/protocol-silent-night/issues/42)) ([3b2c328](https://github.com/arcade-cabinet/protocol-silent-night/commit/3b2c3284ad95747b8efc3eff1286837de5235d77))
* switch to orthographic rectangular arena (Brotato-style) ([#144](https://github.com/arcade-cabinet/protocol-silent-night/issues/144)) ([e6bf8b0](https://github.com/arcade-cabinet/protocol-silent-night/commit/e6bf8b02bc494002e94eab0e3c5bad409ec69f74))
* **ui:** add ARIA attributes to HUD progress bars ([#39](https://github.com/arcade-cabinet/protocol-silent-night/issues/39)) ([3f90283](https://github.com/arcade-cabinet/protocol-silent-night/commit/3f902832d2301d323949bff08b3fe4c565ca83b7))
* unified [@cascade](https://github.com/cascade) trigger with pinned action SHAs ([71d5ab3](https://github.com/arcade-cabinet/protocol-silent-night/commit/71d5ab3649e1e7665742519a87f94118f40e8231))
* v2 gameplay systems — difficulty, save, UI rethink ([#147](https://github.com/arcade-cabinet/protocol-silent-night/issues/147)) ([b18677c](https://github.com/arcade-cabinet/protocol-silent-night/commit/b18677cc5bafdfec796b6abc0c2aa211f8c62935))


### Bug Fixes

* add checkout for Jules/Cursor delegation ([abb5d1e](https://github.com/arcade-cabinet/protocol-silent-night/commit/abb5d1e8861b9441b44c0574f06b920ba0f4290d))
* allow /jules and /cursor on PRs ([db8198f](https://github.com/arcade-cabinet/protocol-silent-night/commit/db8198f1bf6aac22905f4d8729d30206b66e5b14))
* allow all bots to trigger Claude ([816fb72](https://github.com/arcade-cabinet/protocol-silent-night/commit/816fb72a776e8789d24cc89624fb7021e97c2ab5))
* **combat:** prevent double end_run when multiple hits kill player in same tick ([#162](https://github.com/arcade-cabinet/protocol-silent-night/issues/162)) ([acbad12](https://github.com/arcade-cabinet/protocol-silent-night/commit/acbad12b6b96978d2d574018f6347230c06482f7))
* Correct LevelUpScreen display logic and add tests ([#37](https://github.com/arcade-cabinet/protocol-silent-night/issues/37)) ([c44f8b3](https://github.com/arcade-cabinet/protocol-silent-night/commit/c44f8b33657ff78fc7ce715340a6e40646a4962e))
* **enemy:** apply tank slam_damage_mult in contact damage (was always 1.0×) ([#159](https://github.com/arcade-cabinet/protocol-silent-night/issues/159)) ([1a4e022](https://github.com/arcade-cabinet/protocol-silent-night/commit/1a4e0224307470bc59cd92ad217501c762ddfbc8))
* explicitly disable frozen-lockfile ([a95afcb](https://github.com/arcade-cabinet/protocol-silent-night/commit/a95afcb7ff1b31a23ecc1907770b67dc0ed94a5a))
* **gameplay:** tank slam_damage_mult persists post-slam + board obj pierce write-back ([#163](https://github.com/arcade-cabinet/protocol-silent-night/issues/163)) ([f9b9c92](https://github.com/arcade-cabinet/protocol-silent-night/commit/f9b9c9290edbd5a8977c3355e780a5a12a653e87))
* **gameplay:** three silent logic bugs found in review ([#161](https://github.com/arcade-cabinet/protocol-silent-night/issues/161)) ([cf6d17a](https://github.com/arcade-cabinet/protocol-silent-night/commit/cf6d17a9cc5d0dcd9661af5650a4db212786d040))
* remove --if-present from npm scripts ([fca518f](https://github.com/arcade-cabinet/protocol-silent-night/commit/fca518f5ab296230e1d92cee8e56cee866c3397a))
* Resolve WebGL shader uniform overflow and optimize terrain rendering ([#52](https://github.com/arcade-cabinet/protocol-silent-night/issues/52)) ([d36e6bc](https://github.com/arcade-cabinet/protocol-silent-night/commit/d36e6bcf5a2e2b877cdea6fd20e4c878b5986fa2))
* **test:** update THREAT.update() calls to drop removed viewport_size param ([#157](https://github.com/arcade-cabinet/protocol-silent-night/issues/157)) ([7a6a4a4](https://github.com/arcade-cabinet/protocol-silent-night/commit/7a6a4a48d938e16c2afef221134fdbe9f38da26b))
* **ui,tests:** Fix accessibility and test failures ([a9fd1fe](https://github.com/arcade-cabinet/protocol-silent-night/commit/a9fd1fee64c3cc5d880d9366f0cc9faee8dda49f))
* update ecosystem-connector for AI automation ([175447a](https://github.com/arcade-cabinet/protocol-silent-night/commit/175447a5676650f88cbd42cc0111041d68ba0795))
* use --no-frozen-lockfile for PRs ([1a7e925](https://github.com/arcade-cabinet/protocol-silent-night/commit/1a7e925bcfaa7b46b449a024b97de9d59e1c3c63))
* use flexible pnpm install for PRs ([5e3e6c3](https://github.com/arcade-cabinet/protocol-silent-night/commit/5e3e6c3bc52baecc2140cb76a54187fb56250e0c))
* use pnpm instead of npm for CI ([063c1fe](https://github.com/arcade-cabinet/protocol-silent-night/commit/063c1fe29f27f793b923fa702ff5889271006e18))
* use valid sunAngle (0-180) for ProceduralSky ([f913475](https://github.com/arcade-cabinet/protocol-silent-night/commit/f913475899a851d0e4e6b89f257ccd9dbb87c36b))

## [Unreleased]

### Post-batch polish (codex/production-polish → integration/production-polish)

- **Tests — save_manager coverage**: `test_register_level_reached_tracks_best_level` (verifies `maxi` monotonic guard + disk persistence) and `test_merge_dict_rejects_unknown_top_level_keys` (tampered save with injected root key is silently dropped) added to `test_save_manager.gd`
- **Tests — board_builder coverage**: New `test/unit/test_board_builder.gd` (5 tests) — foundation adds 6 nodes (outer field + arena surface + 4 border walls); drifts adds 1 node per drift entry; empty board adds nothing; outer ridge adds exactly 24 chunks (4 segments × 6 steps); ridge is seeded-deterministic
- **Security — save injection guard**: `_merge_dict` `top_level` allowlist blocks schema-unknown root keys from tampered save files while leaving nested gear slot keys unrestricted
- **Accessibility — coal button HIG**: Coal sidebar buttons `custom_minimum_size` raised from `40px` to `60×48px` (meets 44pt iOS HIG and 48dp Material minimum)
- **Accessibility — reduced_motion**: `particle_effects.gd` wired into `apply_reduced_motion` pipeline (`configure(reduced)` + `spawn_death_burst` gated); pause button shown/hidden correctly in `show_gameplay_ui`
- **Performance — spark pool**: `flair_animator.gd` pools `MeshInstance3D` sparks (cap 32) with `reparent(parent, false)` for cross-parent reuse; eliminates per-spark allocation on every player movement frame
- **Performance — shadow mesh dedup**: `enemy_director.gd` lazy-inits one `PlaneMesh` per type (enemy + boss); was allocating a new mesh per spawn (up to 49 allocations per wave)
- **Balance — XP curve cap**: `progression_manager.gd` caps `xp_needed` at 500; prevents `1.45^N` XP wall from stalling upgrade flow at late levels
- **Persistence — level tracking**: `save_manager.gd:register_level_reached` + `game_manager.gd` call site; `best_level` now persists across sessions alongside `best_wave`
- **Release — APK artifact**: `release.yml` changed from `--export-debug` to `--export-release` for production-optimized APK builds

### Integration audit — 8-specialist pass (integration/production-polish)

- **Balance — speed scaling**: `speed_mult` now superlinear via `pow(lf/10+1, 1.3)` — enemies outrun the player at level 20+ as intended ("death is the game")
- **Balance — boss XP**: Krampus-Prime `drop_xp` 0→25; killing the boss now meaningfully accelerates progression
- **Balance — upgrade cap**: `damage` and `fire_rate` stacks capped at 5 each (was uncapped — 1.25^∞ violated "pressure valve not godmode" intent)
- **Performance — particle materials**: `particle_effects.gd` now caches `StandardMaterial3D` by `(color, energy)` key; eliminates per-particle allocation (13 per death burst)
- **Performance — enemy cap**: `enemy_director.gd` guards `spawn_enemy` with `MAX_ENEMY_CAP=48` to bound mobile frame budget
- **Code — board ridge stub**: `board_builder.gd:build_outer_ridge` implemented (was bare `pass`) — ice-chunk protrusions along arena perimeter
- **Visual — preview camera**: `present_preview_viewport.gd` uses `look_at_from_position()` to avoid "not in tree" crash on menu load
- **Visual — victory screen**: "Cookies Earned: 0 C" trailing-C abbreviation removed
- **Tone — upgrade names**: `High Caliber`→`Powder-Keg Payload`, `Overclock CPU`→`Workshop Overdrive`, `Kinetic Boots`→`Sleigh-Runner Soles`, `Advanced Optics`→`Tinsel-Scope`
- **Tone — tag charms**: "Valid forever"/"With love"/"Dreams written" flavor replaced with menacing copy matching holidaypunk identity
- **CI — Android on PRs**: `build-android-debug` job added to `ci.yml` — APK built and uploaded on every pull request (was only on push to main)
- **CI — LOC check**: Glob changed from `scripts/*.gd` to `find scripts scenes -name "*.gd"` — recursive, covers all subdirs
- **CI — gdUnit4 exit code**: Removed `--continue` flag — non-zero exit now fails the step; e2e suite added to CI run
- **Tests — 243/243**: Fixed `test_enemy_bt.gd` `Callable(lambda,"call")` parse error (13 tests were silently skipped); added `.uid` files for 6 newly discovered scripts; `test_full_session_flow.gd` now runs via gdUnit4 (not `-s`)

### CI/Security Hardening (post-batch, codex/production-polish)

- **GitHub Actions SHA pinning**: All action refs pinned to full commit SHAs across ci/cd/release/release-please workflows (addresses SonarCloud hotspot S6720 — mutable version tags)
- **Job-level permissions**: Write permissions moved from workflow level to individual job level in all four workflows (SonarCloud quality gate fix)
- **gdUnit4 flag fix**: CI test command corrected to `--continue` (was `--continue-on-failure` which is unrecognized in v6.1.2; caused CI exit 100)
- **preload() hoisting**: All `preload()` calls inside function bodies hoisted to file-level `const` declarations across 8 scripts (main, game_manager, audio_manager, ui_manager, particle_effects, player_controller, main_helpers, audio_manager_ext) — eliminates per-call script re-parsing overhead
- **Stale PR cleanup**: Closed #146 (superseded by stack), #112 and npm dependabot PRs #130-#132/#135/#139 (referenced files no longer in repo)
- **Reviewer bug fixes** (post-CI batch, addressing PR #148-#152 review comments):
  - `flair_animator.gd`: duplicate shared material before mutating in `_tick_color_shift`; set `emission_enabled = true` before writing emission color; preserve fractional spark accumulator remainder; lazy-init shared SphereMesh+material per entry instead of per-spawn; guard tween callback with `is_instance_valid`; extract `SPARK_INTERVAL` const
  - `coal_sidebar_ui.gd`: fix "ROAL"/"LOAL" label bug → "R-COAL"/"L-COAL"; remove unused `tint` param from `_start_idle_pulse`
  - `audio_manager.gd`: clamp restored bus volumes to `[-60, 6]` dB matching `set_bus_volume` guard
  - `procedural_sfx.gd`: clamp `cutoff` to `[0, 1]` in `make_noise_burst` to prevent IIR coefficient inversion
  - `ui_widgets.gd`: clear threat indicator when stale boss node is freed instead of silently returning
  - `present_parts.gd`: fix wavy arm angle (`sign_x*75` same as default) → `sign_x*45`
  - `main.gd`: call `apply_reduced_motion` at `_ready` so `reduced_motion` preference is respected before first run
  - `screen_shake.gd`: fix "exponential" → "linear" in docstring; remove dead `MAX_ROTATION` constant
  - `gear_visualizer.gd`, `gear_flair_visualizer.gd`: fix docstrings to match implementation
  - `music_director.gd`, `threat_indicator.gd`, `audio_3d_pool.gd`, `pause_menu.gd`, `coal_activator.gd`: comment accuracy fixes
  - `test_market_preview.gd`: add name-label and button descendant assertions to formerly shallow test
  - Untrack `.remember/tmp/save-session.pid` (gitignore already covered it)

### Game-Completion Batch (PR #152)

- **Enemy AI — BT state machines**: Pure GDScript BT state machines (`enemy_bt_states.gd`, `boss_bt_helpers.gd`) with no external dependency. Grunt: wander (>12u) → chase → contact. Rusher: idle → burst-sprint (2.5× speed, 0.6s) → cooldown (0.9s) with telegraph. Tank: advance → prep_slam (0.5s telegraph) → slam (1.8× dmg, 1.5u radius) → stagger (0.8s). Krampus HSM: phase 1 circle-strafe at 10u orbit + fan shots (0.9s); phase 2 charge every 4s + ranged (1.2s); phase 3 charge every 2.5s + multi-shot (3 proj, ±10°, 0.8s) + 2 minions every 6s.
- **Arena zone tinting**: Radial GLSL shader blend in arena floor — snow (white/pale blue, inner 32%), ice (cyan gloss, 32–68%), asphalt (dark industrial, 68–88%), with edge darkening. Roughness and specular track zone transitions.
- **Present portrait viewport**: `SubViewport` 3D panel on select screen renders a rotating present preview (45°/s Y spin via `auto_rotate.gd`) on button hover. `present_preview_viewport.gd` handles headless no-op. Radar chart and viewport both update on hover.
- **Board object visuals**: Frozen Mailbox (upright 0.4×0.8×0.4 box + mouth slot + frost sphere); Gift Cache (low wide 1.0×0.35×1.0 + ribbon cross, two gold strips); Chimney Vent (0.45r cylinder + CPUParticles3D smoke emitter + ember glow). All three get billboard health bars (QuadMesh, unshaded, `BILLBOARD_ENABLED`); handler updates scale.x on damage.
- **Android export**: `export_presets.cfg` with arm64-v8a, landscape locked, min SDK 28 / target SDK 34. `project.godot` gets `window/handheld/orientation=0`. Touch input tests verify drag→move and dash zone on 390×844 viewport.
- **E2E full-flow**: `test_full_session_flow.gd` — 2 waves + wave_clear drain + win + bumble unlock + menu return, headless, <15s.
- **Dead code removal**: `classes.json` and `waves.json` deleted; `_class_defs` parameter removed from `spawn_player` + `refresh_start_screen`; `_spawn_legacy_player` removed; `wave_formula.gd` is sole wave content source.
- **Architecture docs**: `AUDIO_ARCHITECTURE.md` (146 lines), `PRESENT_SYSTEM.md` (164 lines), `HUD_WIDGETS.md` (219 lines), `SCRIPTS_REFERENCE.md` (158 lines).
- **Tests**: +45 unit/component tests (198→243), all passing. Zero LOC violations.

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
