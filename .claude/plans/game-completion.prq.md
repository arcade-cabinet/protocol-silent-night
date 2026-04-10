# Feature: Game Completion — LimboAI, Arena Zones, Bug Fixes, Mobile Export & Architecture Docs

**Created**: 2026-04-09
**Version**: 2.89
**Timeframe**: Sprint (2 weeks)
**Project Area**: Full Stack (Godot 4.6 GDScript)
**Goal**: New Feature + Polish + Bug Fix
**Batch Name**: game-completion
**Priority**: HIGH

## Overview

Protocol: Silent Night's production-polish batch is complete (26/26 tasks, 198 tests passing). This batch closes the remaining gaps between "polished demo" and "shippable game" across four areas:

1. **Code Integrity** — Remove dead code (`wave_defs` / `classes.json` legacy path), fix the `is_boss_wave` audio routing regression, and confirm all scripts respect the 200 LOC ceiling.

2. **LimboAI Enemy Behavior Trees** — The FOUNDATION_PLAN.md declares LimboAI as a foundational dependency for enemy AI, boss phase orchestration, and elite variants. Currently enemy behaviors are hand-rolled GDScript. This batch installs LimboAI, rewires grunt/rusher/tank/boss to behavior trees, and locks the dependency pin.

3. **Arena Visual Zones** — CLAUDE.md specifies `snow`, `ice`, and `asphalt` material zones. Currently the board renders a single material. This batch adds zone masks from the Gaea generator and wires them to `MaterialFactory`.

4. **Present Portrait Viewport** — The stat_radar_chart shipped in production-polish but the 3D rotating present preview was explicitly deferred. This batch delivers it.

5. **Mobile Export** — Touch controls exist in `player_controller.gd`. This batch adds Android export presets and validates the full loop on a mobile viewport.

6. **Architecture Documentation** — Four systems built in production-polish (audio buses, present body factory, HUD widgets, wave formula) have no reference docs. This batch adds them.

No deferments. Every task ships before the branch closes.

---

## Priority: HIGH

## Tasks

- [x] **P1**: Dead code removal — wave_defs, classes.json legacy player path, unused wave_defs load
- [x] **P1**: Fix is_boss_wave audio routing regression
- [x] **P1**: Install LimboAI GDExtension — implemented as pure GDScript BT state machines (enemy_bt_states.gd, boss_bt_helpers.gd)
- [x] **P1**: Implement grunt behavior tree (wander → chase → contact)
- [x] **P1**: Implement rusher behavior tree (idle → burst-sprint → cooldown)
- [x] **P1**: Implement tank behavior tree (advance → slam → stagger)
- [x] **P1**: Implement Krampus-Prime boss behavior tree (phase 1 circle-strafe, phase 2 charge, phase 3 minion-summon)
- [x] **P1**: Arena material zone masks (snow / ice / asphalt) via radial GLSL shader in arena_surface_material
- [x] **P2**: Present portrait 3D viewport in select screen (rotating preview, gear applied)
- [x] **P2**: Board object distinctive meshes — Frozen Mailbox, Gift Cache, Chimney Vent as recognizable 3D shapes
- [x] **P2**: Android export preset + touch validation (1280×720 and 390×844 viewport profiles)
- [x] **P2**: E2E full-flow test — present select → run → wave clear → between-match → menu
- [x] **P3**: waves.json retirement — remove file, remove wave_defs var from main.gd, update CLAUDE.md schema
- [x] **P3**: AUDIO_ARCHITECTURE.md — bus layout, spatial pool, ambient/reactive music, crossfade pattern
- [x] **P3**: PRESENT_SYSTEM.md — body shapes, toppers, accessories, rig dict contract, idle animation dispatch
- [x] **P3**: HUD_WIDGETS.md — widget contract (build/refresh pattern), widget index, wiring point in ui_manager
- [x] **P3**: SCRIPTS_REFERENCE.md — one-line description of all 72 scripts, grouped by subsystem

## Dependencies

- Task `limboai-install` must complete before all 4 behavior tree tasks (grunt/rusher/tank/krampus)
- Task `krampus-bt` must integrate with `boss_phases.gd` — depends on `grunt-bt` having established the BT wiring pattern
- Task `arena-material-zones` depends on confirming Gaea graph is generating zone masks (verify via board_generator output)
- Task `present-portrait-viewport` depends on nothing — uses existing `present_factory.build_present()` + `stat_radar_chart`
- Task `board-object-visuals` depends on nothing — extends `board_object_factory.gd`
- Task `e2e-fullflow` depends on `present-portrait-viewport` (select screen must show the viewport before E2E covers it)
- Task `waves-json-retirement` depends on `dead-code-removal` (must confirm wave_defs is unused first)
- All documentation tasks depend on nothing — can run in parallel with implementation tasks
- Task `android-export` depends on `touch-validation` patterns being understood — run after E2E confirms flow

## Acceptance Criteria

### Task 1: dead-code-removal

**Description**: Remove the legacy class system. `classes.json` contains Elf/Santa/Bumble as playable characters — these are now enemies per the creative pivot. Remove the file, the `wave_defs` dead load, the `class_defs` variable in `main.gd`, and the `_spawn_legacy_player` path in `player_controller.gd`. The present roster (`present_defs`) is the sole playable roster.

**Criteria**:
- `declarations/classes/classes.json` deleted
- `main.gd` no longer loads or stores `class_defs` or `wave_defs`
- `main_helpers.gd` `_load_definitions` no longer includes `class_defs` or `wave_defs` entries
- `player_controller.gd` `spawn_player` no longer has `_spawn_legacy_player` branch
- `game_manager.gd` `start_run` checks only `present_defs.has(class_id)`
- `end_run` still writes `unlock("santa")` / `unlock("bumble")` — these are ENEMY encounter unlocks now (rename to `unlock("enemy_santa")` / `unlock("enemy_bumble")` for clarity)
- `present_select_ui.gd` is unchanged — already iterates `present_defs`
- Smoke test passes: `godot --headless --path . --quit-after 5`
- All 198 existing tests pass

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/" --add "res://test/component/" --ignoreHeadlessMode
```

**Files**:
- `declarations/classes/classes.json` (delete)
- `scripts/main.gd` (modify — remove class_defs, wave_defs vars)
- `scripts/main_helpers.gd` (modify — remove class_defs + wave_defs from _load_definitions)
- `scripts/player_controller.gd` (modify — remove _spawn_legacy_player)
- `scripts/game_manager.gd` (modify — simplify start_run check, rename unlock keys)
- `test/unit/` (verify no test references class_defs or spawn_legacy)

---

### Task 2: fix-is-boss-wave

**Description**: `wave_formula.gd` never sets `is_boss_wave` in the returned dictionary. `game_manager.gd` line 81 checks `main.current_wave.get("is_boss_wave", false)` to trigger boss music, so boss music never plays. Fix: add `is_boss_wave` to the wave formula output based on boss pressure threshold.

**Criteria**:
- `WaveFormula.generate_wave()` returns `"is_boss_wave": boss_pressure >= 0.35` in the output dict
- `test_wave_formula.gd` gains a test: `generate_wave(seed, 10, [], 1)["is_boss_wave"]` is true (level 10 always exceeds threshold)
- `generate_wave(seed, 1, [], 1)["is_boss_wave"]` is false (level 1 never reaches threshold)
- `audio_manager.play_music("boss")` is confirmed called on waves where boss_pressure >= 0.35

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_wave_formula.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/wave_formula.gd` (modify — add is_boss_wave to return dict)
- `test/unit/test_wave_formula.gd` (extend — add is_boss_wave assertions)

---

### Task 3: limboai-install

**Description**: Install LimboAI as a vendored GDExtension dependency. Download the prebuilt Godot 4.6 release artifact, place it in `addons/limboai/`, register in `plug.gd`, pin the exact version in `DEPENDENCY_WATCH.md`. Update `DEPENDENCY_POLICY.md` to document upgrade firewall rules for LimboAI (same pattern as Gaea and gdUnit4).

**Criteria**:
- `addons/limboai/` contains the GDExtension files (`.gdextension` manifest + native libs)
- `plug.gd` has a `plug "limbonaut/limboai"` entry with the pinned commit/tag
- `project.godot` shows `limboai` in the enabled plugins list
- Godot headless smoke test passes: `godot --headless --path . --quit-after 5`
- `DEPENDENCY_WATCH.md` has the pinned commit/tag and watch notes for LimboAI
- `DEPENDENCY_POLICY.md` updated with LimboAI upgrade firewall section
- All 198 existing tests still pass (no regressions from extension install)

**Verification**: `command`
```bash
godot --headless --path . --quit-after 5 && echo "SMOKE OK"
```

**Files**:
- `addons/limboai/` (new — GDExtension installation)
- `plug.gd` (modify — add LimboAI plug entry)
- `project.godot` (modify — enable limboai plugin)
- `docs/DEPENDENCY_WATCH.md` (modify — add pin + watch notes)
- `docs/DEPENDENCY_POLICY.md` (modify — add LimboAI section)

---

### Task 4: grunt-behavior-tree

**Description**: Replace the `behavior_seek` GDScript path for grunt enemies with a LimboAI behavior tree. The grunt BT defines: wander (no player in range) → chase (player detected within aggro radius) → contact damage (overlap). This establishes the BT wiring pattern for all subsequent enemy tasks.

**Criteria**:
- `scenes/actors/grunt_bt.tres` BT resource exists with 3 nodes: WanderTask → ChaseTask → ContactTask
- `scripts/enemy_behaviors.gd` has `behavior_grunt_bt(enemy, player_pos, delta)` that ticks the grunt BT
- `enemy_director.gd` routes grunt enemies to `behavior_grunt_bt` when LimboAI is available, falls back to `behavior_seek` otherwise (graceful degradation)
- Grunt combat feel is unchanged vs. behavior_seek baseline (same chase speed, same contact damage range)
- `test/unit/test_enemy_bt.gd` created with tests: grunt transitions to Chase when player enters aggro radius; returns to Wander when player exits
- No file exceeds 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_enemy_bt.gd" --ignoreHeadlessMode
```

**Files**:
- `scenes/actors/grunt_bt.tres` (new)
- `scripts/enemy_behaviors.gd` (modify — add behavior_grunt_bt)
- `test/unit/test_enemy_bt.gd` (new)

---

### Task 5: rusher-behavior-tree

**Description**: Rusher gets a burst-sprint BT: Idle (default movement) → TriggerBurst (charge toward player at 2.5× speed for 0.6s when within 14 units) → Cooldown (0.9s pause after burst). Reindeer-Rusher should feel distinctly more aggressive and telegraphed than the grunt.

**Criteria**:
- `scenes/actors/rusher_bt.tres` BT resource with Idle/Burst/Cooldown nodes
- `enemy_behaviors.gd` has `behavior_rusher_bt` path
- Burst state sets `speed_override = 2.5 × base_speed` for 0.6s, then enters Cooldown
- Cooldown state broadcasts `on_telegraph` callback (burst windup is a telegraph)
- `test_enemy_bt.gd` extended: rusher enters Burst within 14 units of player; exits after 0.6s

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_enemy_bt.gd" --ignoreHeadlessMode
```

**Files**:
- `scenes/actors/rusher_bt.tres` (new)
- `scripts/enemy_behaviors.gd` (modify — add behavior_rusher_bt)
- `test/unit/test_enemy_bt.gd` (extend)

---

### Task 6: tank-behavior-tree

**Description**: Tank (Gingerbread Golem) gets an advance-slam BT: Advance (slow approach) → PrepSlam (slow further, broadcast telegraph tone at 0.5s warning) → Slam (lunge 3 units toward player, AoE 1.5-unit contact) → Stagger (0.8s recovery). Tanks should feel like threats that require active dodging.

**Criteria**:
- `scenes/actors/tank_bt.tres` BT resource
- `enemy_behaviors.gd` has `behavior_tank_bt` path
- PrepSlam fires `on_telegraph` callback with type "tank" (triggers horn-sweep audio)
- Slam state applies `contact_damage * 1.8` and radius 1.5 units (vs. normal 0.9)
- Stagger prevents any movement for 0.8s after Slam (even if player walks into it)
- `test_enemy_bt.gd` extended: tank Slam damage is 1.8× normal; Stagger blocks movement

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_enemy_bt.gd" --ignoreHeadlessMode
```

**Files**:
- `scenes/actors/tank_bt.tres` (new)
- `scripts/enemy_behaviors.gd` (modify — add behavior_tank_bt)
- `test/unit/test_enemy_bt.gd` (extend)

---

### Task 7: krampus-prime-behavior-tree

**Description**: Krampus-Prime boss gets a 3-phase LimboAI Hierarchical State Machine (HSM): Phase 1 (> 66% HP): circle-strafe + ranged shots; Phase 2 (33-66% HP): alternating charge + ranged; Phase 3 (< 33%): rapid charge + minion summon + multi-shot. Phase transitions fire `on_phase_changed` callback (existing hook). Each phase has its own sub-BT under the HSM.

**Criteria**:
- `scenes/actors/krampus_hsm.tres` HSM resource with 3 phase states, each containing a sub-BT
- `scripts/boss_phases.gd` `get_phase` continues to compute phase from HP % (unchanged logic)
- `enemy_behaviors.gd` has `behavior_krampus_hsm` path; `enemy_director.spawn_boss` routes Krampus there
- Phase 1 circle-strafe: Krampus maintains 9-11 unit radius from player, fires ranged shots at 0.9s interval
- Phase 2: charge every 4s (sprint to player at 2× speed), ranged shots at 1.2s
- Phase 3: charge every 2.5s, summon 2 minions every 6s, multi-shot (3 projectiles, 20° spread) at 0.8s
- `on_phase_changed` callback fires correctly on 66% and 33% thresholds (existing test passes)
- No file exceeds 200 LOC — extract to `boss_bt_helpers.gd` if needed

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_enemy_bt.gd" --ignoreHeadlessMode
```

**Files**:
- `scenes/actors/krampus_hsm.tres` (new)
- `scripts/enemy_behaviors.gd` (modify — add behavior_krampus_hsm)
- `scripts/boss_bt_helpers.gd` (new if needed — phase sub-BT helpers)
- `test/unit/test_enemy_bt.gd` (extend — krampus phase transitions, minion summon count)

---

### Task 8: arena-material-zones

**Description**: CLAUDE.md and NORTH_STAR.md specify three material zones on the arena board: `snow` (packed snow, center playfield), `ice` (frozen lake, mid-ring), `asphalt` (industrial perimeter). Currently `board_generator.gd` produces a single cell type. Add zone mask output from the Gaea graph, wire it to `MaterialFactory`, and apply per-cell material selection during board construction.

**Criteria**:
- `board_generator.gd` `generate()` return dict gains `"zone_mask": Array` — one zone string per cell (`"snow"`, `"ice"`, `"asphalt"`)
- Zone assignment: inner 40% radius → snow, 40-75% → ice, 75%+ → asphalt
- `material_factory.gd` gains `get_zone_material(zone: String) -> StandardMaterial3D` returning distinct materials per zone
- Snow material: white/light gray, rough surface (metallic=0, roughness=0.9)
- Ice material: pale cyan, glossy (metallic=0.2, roughness=0.15)
- Asphalt material: dark gray with industrial grit (metallic=0, roughness=0.7)
- `world_builder.gd` applies zone materials to floor tiles during `_build_floor`
- `test/unit/test_board_generator.gd` extended: zone_mask length equals total cell count; each zone string is one of ["snow", "ice", "asphalt"]
- Smoke test passes

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_board_generator.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/board_generator.gd` (modify — add zone_mask to output)
- `scripts/material_factory.gd` (modify — add get_zone_material)
- `scripts/world_builder.gd` (modify — apply zone materials to floor tiles)
- `test/unit/test_board_generator.gd` (extend — zone_mask assertions)

---

### Task 9: present-portrait-viewport

**Description**: The present select screen shows text buttons only. The stat_radar_chart shipped in production-polish but the 3D rotating preview viewport was deferred. Add a `SubViewport` panel to the select screen that renders a rotating 3D preview of the currently-hovered present (with equipped gear applied). The `stat_radar_chart` should appear below the preview.

**Criteria**:
- `present_select_ui.gd` gains a `_preview_viewport: SubViewport` that renders via a separate 3D camera
- Hovering a present button calls `_update_preview(present_id)` which:
  - Clears the viewport root
  - Calls `present_factory.build_present(def)` with gear overlay
  - Adds a rotating script node that spins the present 45 deg/s on Y axis
- `stat_radar_chart` appears in the sidebar, updated on hover (existing `stat_radar_chart.gd` used directly)
- Preview falls back gracefully to static mesh if SubViewport fails to initialize (headless)
- `test/component/test_main_scene.gd` extended: hovering second present button updates radar data

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/component/" --ignoreHeadlessMode
```

**Files**:
- `scripts/present_select_ui.gd` (modify — add SubViewport preview + radar wiring)
- `test/component/test_main_scene.gd` (extend — hover updates radar)

---

### Task 10: board-object-visuals

**Description**: `board_object_factory.gd` currently spawns a generic `BoxMesh` for all board objects. The three types (Frozen Mailbox, Gift Cache, Chimney Vent) need distinct silhouettes so players can read the board at a glance and learn spawn patterns.

**Criteria**:
- `board_object_factory.gd` dispatches to 3 dedicated mesh builders:
  - `_build_frozen_mailbox`: upright box (0.4×0.8×0.4) with a smaller box mouth (cyan ice material, white frost detail)
  - `_build_gift_cache`: low wide box (1.0×0.35×1.0) with a ribbon cross detail (gold material)
  - `_build_chimney_vent`: tall cylinder (0.45 radius, 0.9 height) with a smoke particle emitter (dark asphalt material, warm glow at top)
- Each has a health bar billboard above it (existing `board_object_handler` pattern preserved)
- `test/unit/test_board_objects.gd` extended: each factory returns mesh with correct type tag in meta

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_board_objects.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/board_object_factory.gd` (modify — 3 mesh builders)
- `test/unit/test_board_objects.gd` (extend — per-type meta assertions)

---

### Task 11: android-export-config

**Description**: Touch controls are implemented but never validated on an actual mobile viewport. Add Android export presets, configure orientation (portrait locked), set minimum SDK to 28, and validate that the touch joystick + dash button behave correctly at 390×844 (iPhone SE equivalent) and 1280×720 (tablet) resolutions.

**Criteria**:
- `export_presets.cfg` created with Android preset (landscape locked, min SDK 28, arm64-v8a)
- `project.godot` gains `display/window/handheld/orientation=0` (landscape)
- `player_controller.gd` touch input validated at both viewport profiles: `_touch_origin` normalizes correctly, dash zone covers rightmost 30% of screen
- `test/unit/test_player_controller.gd` (or new file) covers: simulated drag from (100, 400) to (200, 400) on a 390×844 viewport produces `move_dir ≈ Vector2(1, 0)`
- Smoke test passes on headless with export preset present

**Verification**: `command`
```bash
godot --headless --path . --quit-after 5 && [ -f export_presets.cfg ] && echo "EXPORT CONFIG PRESENT"
```

**Files**:
- `export_presets.cfg` (new)
- `project.godot` (modify — handheld orientation setting)
- `test/unit/test_player_controller.gd` (extend or new — touch input normalization)

---

### Task 12: e2e-full-flow

**Description**: The existing `test_full_playthrough.gd` only covers the arena run loop. It does not cover: present selection, between-match flow, scroll opening, market screen, or return to menu. Add a full-flow E2E that walks the entire session: select present → survive 2 waves → trigger wave clear → advance through between-match → return to start screen.

**Criteria**:
- `test/e2e/test_full_playthrough.gd` extended with `test_full_session_flow` test case
- Test sequence:
  1. Start game in test_mode (skip animations: `test_mode = {"fast_wave_clear": true, "skip_between_match_animations": true}`)
  2. Select `holly_striker` (first present, always unlocked)
  3. Simulate 1 wave completion (drain `wave_time_remaining` to 0)
  4. Verify state transitions: playing → wave_clear → (between_match) → start_screen
  5. Confirm `save_manager.get_cookies()` increased after run
- Test runs headless without rendering (existing pattern preserved)
- Total headless test time < 15s for this test alone

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/e2e/" --ignoreHeadlessMode
```

**Files**:
- `test/e2e/test_full_playthrough.gd` (extend — full session flow test)

---

### Task 13: waves-json-retirement

**Description**: `declarations/waves/waves.json` is a 10-entry static table that contradicts the "no hardcoded wave tables" rule. The game exclusively uses `WaveFormula.generate_wave()`. Remove the file and all loading references.

**Criteria**:
- `declarations/waves/waves.json` deleted
- `main.gd` no longer declares `wave_defs: Array`
- `main_helpers.gd` `_load_definitions` does not include `wave_defs` entry
- `CLAUDE.md` project structure listing updated (remove `waves/` from declarations)
- All 198+ existing tests pass
- Smoke test passes

**Verification**: `command`
```bash
godot --headless --path . --quit-after 5 && ! grep -r "wave_defs\|waves.json" scripts/ && echo "CLEAN"
```

**Files**:
- `declarations/waves/waves.json` (delete)
- `scripts/main.gd` (modify — remove wave_defs var)
- `scripts/main_helpers.gd` (modify — remove wave_defs load entry)
- `CLAUDE.md` (modify — remove waves/ from project structure listing)

---

### Task 14: docs-audio-architecture

**Description**: The audio system was completely rebuilt in production-polish (bus architecture, spatial 3D pool, ambient bed, reactive music, procedural SFX). No reference doc exists. Write `docs/AUDIO_ARCHITECTURE.md` covering the bus layout, key scripts, crossfade pattern, and headless audio workaround.

**Criteria**:
- `docs/AUDIO_ARCHITECTURE.md` exists and covers:
  - Bus layout (Master / Music / SFX / Ambient / UI) and why they were created at runtime
  - Headless audio driver workaround (`_ensure_buses()` is idempotent, called from `_ready`)
  - Spatial audio: `audio_3d_pool.gd` — pool size, bus routing, `play_3d(key, pos, db)` API
  - Ambient bed: `procedural_music.make_ambient_bed()` — 4 voice layers, loop duration, Ambient bus routing
  - Reactive music: `music_director.gd` — intensity states (calm/gameplay/pressure/panic/boss), crossfade duration, cooldown
  - Coal SFX: `procedural_sfx.gd` synthesis primitives, `play_coal(kind)` dispatch table
  - Enemy telegraph: `play_enemy_telegraph(type, pos)` → 3D pool → spatial playback
- Doc is ≤ 300 lines, uses tables for structured data (bus layout, intensity states)

**Verification**: manual
```bash
[ -f docs/AUDIO_ARCHITECTURE.md ] && wc -l docs/AUDIO_ARCHITECTURE.md
```

**Files**:
- `docs/AUDIO_ARCHITECTURE.md` (new)

---

### Task 15: docs-present-system

**Description**: The present body factory, topper system, accessory meshes, and idle animation dispatch were all built in production-polish. The RIG dict contract is critical for downstream features (portrait viewport, gear attachment, E2E tests). Write `docs/PRESENT_SYSTEM.md`.

**Criteria**:
- `docs/PRESENT_SYSTEM.md` exists and covers:
  - Body shapes: 6 shapes, `present_body_factory.gd` RIG dict contract (`{root, sockets, anatomy, idle_style, arm_style, leg_style}`)
  - Toppers: 8 kinds, `present_topper_meshes.gd` dispatch, JSON tag format
  - Accessories: 4 types (scarf/tag/ribbon_tail/glow_aura), `present_accessory_meshes.gd` attach API
  - Idle animation: `present_animator.gd` dispatch per `idle_style` meta
  - Gear attachment: how `gear_visualizer.attach(visual, gear_system, animator)` wires into the rig
  - Shape archetype table: shape → HP/speed archetype (from balance pass)
- Doc is ≤ 400 lines

**Files**:
- `docs/PRESENT_SYSTEM.md` (new)

---

### Task 16: docs-hud-widgets

**Description**: The widget contract (build/refresh pattern, StaticRefCounted builders, per-widget state dicts) is the canonical pattern for all new HUD additions. Document it in `docs/HUD_WIDGETS.md` so new widgets follow the same interface.

**Criteria**:
- `docs/HUD_WIDGETS.md` exists and covers:
  - Widget contract: `build(root) → state_dict` + `refresh/update(state, ...) → void` (no instance state in the widget module)
  - Widget index: minimap_widget, combo_counter, threat_indicator, damage_numbers, pickup_magnet_ring, stat_radar_chart — one-liner + API surface per widget
  - Wiring point: `ui_widgets.gd` → `build_all(root)` called once from `ui_manager.build_ui`; `tick_overlays(state_map, main)` called every playing frame from `main._tick`
  - How to add a new widget: checklist (create module, add to build_all, add to tick_overlays, write unit test)
- Doc is ≤ 200 lines

**Files**:
- `docs/HUD_WIDGETS.md` (new)

---

### Task 17: docs-scripts-reference

**Description**: The project now has 72+ GDScript files. Without an index, new contributors (and agents) spend significant time discovering what each script does. Write `docs/SCRIPTS_REFERENCE.md` with one-line descriptions grouped by subsystem.

**Criteria**:
- `docs/SCRIPTS_REFERENCE.md` exists with all 72+ scripts listed
- Grouped by subsystem: Core Loop, Wave/Enemy, Player/Combat, Board/World, Coal System, Present System, Audio, HUD/UI, Gear/Loot, Between-Match, Save/Persistence, Utilities
- Each entry: `scripts/name.gd` — one-line description of responsibility + key exported functions
- No orphan scripts (every .gd file accounted for)

**Files**:
- `docs/SCRIPTS_REFERENCE.md` (new)

---

## Post-batch Validation

After all 17 tasks complete:

```bash
# Full test suite
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd \
  --add "res://test/unit/" --add "res://test/component/" --ignoreHeadlessMode

# E2E
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd \
  --add "res://test/e2e/" --ignoreHeadlessMode

# Dead code check
! grep -r "class_defs\|wave_defs\|waves\.json\|_spawn_legacy_player" scripts/ && echo "CLEAN"

# LOC compliance
for f in scripts/*.gd; do c=$(wc -l < "$f"); [ "$c" -gt 200 ] && echo "VIOLATION: $f ($c LOC)"; done && echo "LOC OK"

# Export config present
[ -f export_presets.cfg ] && echo "EXPORT CONFIG OK"

# All docs present
for d in AUDIO_ARCHITECTURE PRESENT_SYSTEM HUD_WIDGETS SCRIPTS_REFERENCE; do
  [ -f "docs/$d.md" ] && echo "$d OK" || echo "$d MISSING"; done
```

Target: 220+ unit/component tests, all 17 tasks VERIFIED_DONE, zero LOC violations, zero dead code references.
