# Feature: Production Polish — Coal Feedback, Present Variety, Procedural Audio & UX Pass

**Created**: 2026-04-09
**Version**: 2.88
**Timeframe**: Sprint (2 weeks)
**Project Area**: Full Stack (Godot 4.6 GDScript)
**Goal**: New Feature + Polish
**Batch Name**: production-polish
**Priority**: HIGH

## Overview

Protocol: Silent Night has a functional MVP loop (wave formula, 26-present roster, coal queue, between-match screens, boss phases). This batch attacks the **production-polish gaps** between "playable" and "shippable holidaypunk arcade roguelike." Three named pillars plus a sweep of macro/meso/micro gaps across UI, UX, HUD, gameplay board, VFX, and audio.

### The Three Named Pillars

1. **Coal Activation World-Space Feedback** — Currently coal triggers a text-only `show_message` with a damage number and a cached `play_damage` sweep. No 3D VFX at the player, no screen shake, no unique coal audio, no camera punch, no sidebar animation. This is the most under-delivered moment in the game.

2. **Present Roster Visual Variety Audit** — 26 present definitions share an identical silhouette: `BoxMesh + BowMesh + 2 arms + 2 legs + face quad`. `box_width/height/depth` vary but the *shape language* is uniform. No toppers (hat/antlers/star/halo), no body variants (sphere/cylinder/gift-bag/stacked), no ribbon patterns, no accessory meshes, no idle animation personality per archetype. Visual identity collapses into "palette swap with slight scale."

3. **Holidaypunk Procedural Audio Pass** — `audio_manager.gd` has 6 cached SFX + 3 music loops. No ambient bed (wind, distant bells, industrial hum), no spatial positioning (`AudioStreamPlayer3D`), no enemy footsteps/telegraphs, no reactive intensity layering (calm → pressure → panic), no bus routing (Master only), no ducking, no coal-unique audio. Mono 22050 Hz output on a Master bus is the floor — we need to raise the ceiling.

### Macro/Meso/Micro Gaps (Pillar 4: Sweep)

Beyond the three pillars, there are dozens of quality-of-life and polish gaps across the stack. This batch catalogs and fixes the highest-leverage ones without scope-creeping into new systems.

---

## Priority: HIGH

## Tasks

- [ ] **P1**: Coal activation world-space VFX + screen shake + camera punch
- [ ] **P1**: Coal effect-specific audio (6 unique SFX replacing reused damage sweep)
- [ ] **P1**: Coal sidebar activation animation (pulse, consume, shard burst)
- [ ] **P1**: Present topper system (hat / antlers / star / halo / candy cane) — data + factory + parts
- [ ] **P1**: Present body shape variants (box / cube / tall / stacked / gift-bag / cylinder) — mesh factory
- [ ] **P1**: Present idle animation personality (bounce / sway / hover / twitch) per archetype
- [ ] **P1**: Spatial audio — convert enemy SFX + impacts + coal effects to `AudioStreamPlayer3D`
- [ ] **P1**: Audio bus architecture (Master / Music / SFX / Ambient / UI) with volumes in settings
- [ ] **P1**: Ambient soundscape bed (wind, distant bells, industrial hum, snow crunch)
- [ ] **P1**: Reactive music intensity layering (calm / pressure / panic / boss) with crossfade
- [ ] **P2**: Minimap HUD widget (enemy + coal + boss radar)
- [ ] **P2**: Kill feed / combo counter HUD
- [ ] **P2**: Threat indicators (off-screen arrows for boss/Krampus)
- [ ] **P2**: Damage number polish (crit color, font scale by damage, stacking)
- [ ] **P2**: Settings menu (audio buses, screen shake toggle, reduced motion)
- [ ] **P2**: Pause menu with resume / restart / settings / quit
- [ ] **P2**: Ribbon pattern variants for present wrapping (stripes, diagonal, dots, checker)
- [ ] **P2**: Present accessory meshes (scarf, ribbon-tail, glow aura, tag)
- [ ] **P2**: Enemy telegraph audio (windup tone before ranged shots)
- [ ] **P2**: Boss phase-transition SFX + music sting
- [ ] **P3**: Screen shake system as shared service (not just coal)
- [ ] **P3**: Present select screen visual upgrade (rotating 3D preview, stat radar chart)
- [ ] **P3**: HUD polish — animated bars, tick marks on XP bar, pulse on low HP
- [ ] **P3**: Gameplay board edge glow / vignette when low HP
- [ ] **P3**: Pickup attraction radius visual ring
- [ ] **P3**: Wave banner polish (3D text, easing, character reveal)
- [ ] **P3**: Coal rarity tiers (common/rare/legendary) with visual distinction
- [ ] **P3**: Documentation — `docs/POLISH_AUDIT.md` cataloging remaining gaps

## Dependencies

- Task `coal-vfx-worldspace` must complete before `coal-sidebar-animation` (shared screen-shake service)
- Task `audio-bus-architecture` must complete before `audio-ambient-bed`, `audio-reactive-music`, `audio-spatial-enemies`, `audio-coal-sfx`, `audio-settings-menu` (all route through buses)
- Task `screen-shake-service` must complete before `hud-low-hp-vignette`, `coal-camera-punch` (both consume shake)
- Task `present-topper-system` must complete before `present-select-visual-upgrade` (previews must show toppers)
- Task `present-body-shape-variants` must complete before `present-idle-animation` (animation retargets to shape)
- Task `settings-menu` must complete before `pause-menu` (pause opens into settings)
- Task `minimap-widget` has no deps
- Task `kill-feed-combo` has no deps
- Task `threat-indicators` has no deps
- Task `polish-audit-doc` must be LAST (catalogs what remains)

## Acceptance Criteria

### Task 1: coal-vfx-worldspace

**Description**: Coal activation spawns a world-space particle VFX at the player position scaled to the effect kind (spray = wide ring, hurl = projectile streak, embers = sustained aura, backfire = explosion + self-shake, fortune = gold sparkle rain, poison = green bubble).

**Criteria**:
- File `scripts/coal_vfx.gd` exists (RefCounted, max 150 LOC)
- `coal_vfx.gd` exposes `spawn_for_effect(root: Node3D, pos: Vector3, kind: String, color: Color)` dispatching to 6 named particle emitters
- `coal_activator.gd` calls `CoalVFX.spawn_for_effect(...)` inside `_apply` for every kind (spray/hurl/poison/embers/backfire/fortune)
- Each kind produces visually distinct particle behavior (tested via headless screenshot capture on active effect)
- `particle_effects.gd` gains new helpers: `spawn_coal_ring`, `spawn_coal_streak`, `spawn_coal_aura`, `spawn_coal_explosion`, `spawn_coal_sparkle_rain`, `spawn_coal_poison_cloud`
- No file exceeds 200 LOC limit
- Smoke test passes: `godot --headless --path . --quit-after 5`

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_coal_vfx.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/coal_vfx.gd` (new)
- `scripts/coal_activator.gd` (modify)
- `scripts/particle_effects.gd` (extend)
- `test/unit/test_coal_vfx.gd` (new)

---

### Task 2: coal-audio-unique-sfx

**Description**: Replace the shared `play_damage` sweep used by coal with 6 unique procedural SFX matching each effect kind. Spray = percussive noise burst, hurl = low-to-high whip, poison = bubbling detuned saw, embers = crackling filtered noise, backfire = downsweep + impact, fortune = chime arpeggio.

**Criteria**:
- `audio_manager.gd` gains `play_coal(kind: String)` method with switch on 6 kinds
- `procedural_sfx.gd` gains `make_noise_burst` enhanced with filter, `make_whip`, `make_bubble`, `make_crackle`, `make_chime_arp` helpers
- Each kind cached in `_cache` under `coal_<kind>` key on `_build_cache`
- `coal_activator.gd` calls `main.audio_mgr.play_coal(kind)` instead of generic feedback
- Test verifies cache contains all 6 coal entries
- No file exceeds 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_audio_coal_sfx.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/audio_manager.gd` (modify)
- `scripts/procedural_sfx.gd` (extend)
- `scripts/coal_activator.gd` (modify)
- `test/unit/test_audio_coal_sfx.gd` (new)

---

### Task 3: coal-sidebar-animation

**Description**: Coal sidebar buttons pulse when hovered, shake + explode into 6 shard particles on activation, and the slot smoothly collapses inward when removed. Replace instant `queue_free` with a 0.35s animation.

**Criteria**:
- `coal_sidebar_ui.gd` gains `animate_consume(button: Button)` tweened sequence (scale 1.3 → 0, color flash)
- `refresh` no longer `queue_free`s immediately — defers via `Tween.tween_callback`
- Idle pulse achieved via `holidaypunk_theme.gd` glow shadow animation (optional — OK if implemented via Tween loop)
- Long-press still sells (preserve existing behavior — DO NOT break)
- File still < 200 LOC
- Visual regression: screenshot captured during activation shows button mid-animation

**Verification**: `manual_review` + `command`
```bash
godot --headless --path . --quit-after 1
```

**Files**:
- `scripts/coal_sidebar_ui.gd` (modify — stays under 120 LOC)
- `scripts/ui_manager.gd` (may need `refresh_coal_sidebar` tweak)

---

### Task 4: present-topper-system

**Description**: Add a `topper` field to `presents.json` with 8 variants: `none`, `santa_hat`, `antlers`, `star`, `halo`, `candy_cane`, `bow_giant`, `ornament`. `PresentParts` gains `attach_topper(root, def, box_h)` that builds a mesh from a small library.

**Criteria**:
- `declarations/presents/presents.json` — every present def has a `topper` key (migrate existing 26 — distribute tastefully across 8 types)
- `scripts/present_parts.gd` gains `attach_topper(root, def, box_h)` dispatching on `topper` string
- New file `scripts/present_topper_meshes.gd` (RefCounted, max 180 LOC) generates procedural meshes for each topper kind
- `present_factory.gd` calls `PresentParts.attach_topper(...)` in `build_present`
- Unit test verifies every present def produces a topper node (except `none`)
- No file > 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_present_toppers.gd" --ignoreHeadlessMode
```

**Files**:
- `declarations/presents/presents.json` (modify — add topper field to all 26)
- `scripts/present_parts.gd` (extend)
- `scripts/present_topper_meshes.gd` (new)
- `scripts/present_factory.gd` (modify — call attach_topper)
- `test/unit/test_present_toppers.gd` (new)

---

### Task 5: present-body-shape-variants

**Description**: Replace the fixed `BoxMesh` body with a 6-variant body factory: `box` (default), `cube` (uniform), `tall_rect`, `stacked_duo` (two boxes), `cylinder`, `gift_bag` (cylinder + cinched top). Add `body_shape` field to `presents.json`.

**Criteria**:
- `declarations/presents/presents.json` — every present gets a `body_shape` field
- New file `scripts/present_body_factory.gd` (RefCounted, max 180 LOC) returns a Node3D body subtree for a shape+def
- `present_factory.gd._attach_body` delegates to `PresentBodyFactory.build(shape, def, w, h, d, material)`
- Shape distribution: at least 4 presents per shape to avoid monotony (some shapes may have fewer than 4 if they don't fit tonally)
- All 6 shapes render in headless smoke test (instantiate each and confirm `get_child_count > 0`)
- Arms/legs/bow still attach at box dimensions (existing logic preserved)

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_present_body_shapes.gd" --ignoreHeadlessMode
```

**Files**:
- `declarations/presents/presents.json` (modify)
- `scripts/present_body_factory.gd` (new)
- `scripts/present_factory.gd` (modify)
- `test/unit/test_present_body_shapes.gd` (new)

---

### Task 6: present-idle-animation

**Description**: Each present archetype (determined/angry/cheerful/stoic/manic) gets a distinct idle animation loop applied via `present_animator.gd`: bounce, pulse, hover, subtle sway, twitch. No skeletal anim — transform-only on `position.y` and `rotation`.

**Criteria**:
- `scripts/present_animator.gd` is extended (NOT replaced) with `play_idle(root: Node3D, expression: String, time: float)` per-frame updater
- 5 distinct motion profiles implemented and switchable by expression
- Called from `main.gd` `_process` via `PresentAnimator.play_idle(player_node, expression, time)`
- Motion amplitude small enough to read but not disrupt aim (≤ 0.08m y, ≤ 0.05 rad rot)
- Test: fake 5 presents with 5 expressions, step 60 frames, assert position differs from origin
- File < 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_present_idle_anim.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/present_animator.gd` (extend)
- `scripts/main.gd` (wire `play_idle` into `_process`)
- `test/unit/test_present_idle_anim.gd` (new)

---

### Task 7: audio-spatial-enemies

**Description**: Convert enemy SFX (enemy shots, impacts, deaths) and coal effects from `AudioStreamPlayer` (2D) to `AudioStreamPlayer3D` positioned at source. Falloff tuned to arena scale (unit_size = 1m, max_distance = 35m).

**Criteria**:
- New file `scripts/audio_3d_pool.gd` (RefCounted, max 180 LOC) manages a pool of 16 `AudioStreamPlayer3D` players
- `audio_manager.gd` gains `play_3d(key: String, pos: Vector3)` routing to 3D pool
- `combat_resolver.gd` (or wherever enemy shots/hits live) calls `audio_mgr.play_3d("hit", enemy_pos)`
- Existing 2D `play_hit()` preserved for UI/HUD use (do not break tests)
- Smoke test: spawn an enemy, fire a shot, verify `_audio_3d_pool.active_count() > 0`
- Falloff: linear, `unit_size=1`, `max_distance=35`

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_audio_3d_pool.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/audio_3d_pool.gd` (new)
- `scripts/audio_manager.gd` (modify)
- `scripts/combat_resolver.gd` (modify — spatial hit)
- `scripts/enemy_director.gd` or `enemy_behaviors.gd` (modify — spatial enemy SFX)
- `test/unit/test_audio_3d_pool.gd` (new)

---

### Task 8: audio-bus-architecture

**Description**: Create a proper audio bus layout: `Master → Music, SFX, Ambient, UI`. All existing players route to the correct bus. Bus volumes persisted in `save_manager.gd` and exposed via settings menu.

**Criteria**:
- `project.godot` includes a `default_bus_layout` pointing to a new `.tres` asset OR a bus layout is programmatically created at runtime in `audio_manager.attach`
- `audio_manager.gd` sets `bus` property on every `AudioStreamPlayer` by role (music → Music, sfx pool → SFX, coal → SFX, etc.)
- `save_manager.gd` saves/loads `audio_buses: { master, music, sfx, ambient, ui }` volumes in dB
- On attach, `audio_manager` reads saved volumes and applies via `AudioServer.set_bus_volume_db`
- Unit test: mock SaveManager, attach audio, verify `AudioServer.get_bus_index("Music") >= 0`

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_audio_buses.gd" --ignoreHeadlessMode
```

**Files**:
- `project.godot` (modify — bus layout reference)
- `audio_bus_layout.tres` (new — at project root or `resources/`)
- `scripts/audio_manager.gd` (modify)
- `scripts/save_manager.gd` (extend)
- `test/unit/test_audio_buses.gd` (new)

---

### Task 9: audio-ambient-bed

**Description**: A continuous ambient soundscape loop generated by `procedural_music.gd::make_ambient_bed()` routed to the Ambient bus. Layered: wind noise, distant bells (sparse), industrial hum, occasional snow crunch.

**Criteria**:
- `procedural_music.gd` gains `make_ambient_bed(duration: float = 30.0) -> AudioStreamWAV` with 4 layered voices
- `audio_manager.gd` caches under `ambient_bed` and gains `play_ambient() / stop_ambient()` methods
- `main.gd` or `game_manager.gd` calls `audio_mgr.play_ambient()` on arena enter and `stop_ambient()` on end screen
- Ambient bed at -25 dB below SFX to sit under action
- Ambient bus routes here (depends on Task 8)
- File still < 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_audio_ambient.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/procedural_music.gd` (extend)
- `scripts/audio_manager.gd` (modify)
- `scripts/main.gd` or `game_manager.gd` (modify)
- `test/unit/test_audio_ambient.gd` (new)

---

### Task 10: audio-reactive-music

**Description**: Music intensity responds to enemy count, player HP, and boss presence. Four layers: `calm` (< 10 enemies, HP > 70%), `pressure` (10-25 enemies), `panic` (> 25 enemies OR HP < 30%), `boss` (boss active). Smooth crossfade between layers (0.8s).

**Criteria**:
- `scripts/music_director.gd` (new, RefCounted, max 180 LOC) monitors game state and selects layer
- `audio_manager.gd` gains `set_music_intensity(level: String)` with crossfade via secondary `AudioStreamPlayer`
- `procedural_music.gd` generates 4 loops: `make_calm_loop`, `make_pressure_loop` (reuses `make_gameplay_loop`), `make_panic_loop`, `make_boss_loop` (exists)
- `main.gd` calls `music_director.tick(delta, enemy_count, hp_pct, boss_active)` per frame
- Crossfade implemented with two `AudioStreamPlayer`s and `Tween` on volume_db
- Test verifies layer transitions on simulated state changes

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_music_director.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/music_director.gd` (new)
- `scripts/audio_manager.gd` (modify)
- `scripts/procedural_music.gd` (extend)
- `scripts/main.gd` (wire tick)
- `test/unit/test_music_director.gd` (new)

---

### Task 11: minimap-widget

**Description**: Bottom-right HUD minimap showing player (white dot), enemies (red dots), coal pickups (black dots), boss (pulsing red), pickups (gold). Circular radar style, 120x120 px, translates world coords to local.

**Criteria**:
- New file `scripts/minimap_widget.gd` (RefCounted, max 180 LOC) builds a `Control` with a `_draw` override
- `ui_manager.gd` instantiates minimap in `build_ui` and exposes `refresh_minimap(player_pos, enemies, pickups, boss)`
- `main.gd` calls refresh per frame with current state
- Draw uses `draw_circle` and `draw_line` primitives — no textures
- Respects holidaypunk palette (background dark cyan, borders neon cyan, enemies red)
- Test: instantiate, refresh with fake data, verify `_draw` invokable without crash

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_minimap_widget.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/minimap_widget.gd` (new)
- `scripts/ui_manager.gd` (modify)
- `scripts/main.gd` (wire refresh)
- `test/unit/test_minimap_widget.gd` (new)

---

### Task 12: kill-feed-combo

**Description**: Combo counter appears when ≥ 3 enemies killed within 2s, stacks, resets on timeout. Displays top-right as `KILLS x12` with flame color escalation. Contributes to score multiplier (x1 / x2 / x3 at 5/15/30 stacks).

**Criteria**:
- New file `scripts/combo_counter.gd` (RefCounted, max 150 LOC) tracks kill timestamps, computes combo
- `ui_manager.gd` exposes `show_combo(count: int, tier: int)` rendering top-right label
- `main.gd` (in `_kill_enemy`) calls `combo_counter.register_kill(time)` and passes result to UI
- Tier colors: tier 1 = white, tier 2 = gold, tier 3 = red
- Test: simulate 10 kills at 0.1s apart, verify combo >= 10 and tier 3
- Reset after 2s of no kills

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_combo_counter.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/combo_counter.gd` (new)
- `scripts/ui_manager.gd` (modify)
- `scripts/main.gd` (wire)
- `test/unit/test_combo_counter.gd` (new)

---

### Task 13: threat-indicators

**Description**: Off-screen arrow indicators for boss/Krampus. When boss exists and is off-camera, arrow rotates around player HUD-space radius pointing to boss. Red for active, gold when low HP, purple for spawn imminence.

**Criteria**:
- New file `scripts/threat_indicator.gd` (RefCounted, max 150 LOC) uses a `Control` node with `_draw` override for an arrow
- `ui_manager.gd` instantiates, exposes `update_threat(boss_pos, cam_pos, cam_viewport, tier: String)`
- Returns early if boss is on-screen
- Arrow rotates around center-screen at 180px radius
- Test: with fake off-screen boss, `update_threat` makes arrow visible
- Clean up on boss death (`update_threat(null, ...)`)

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_threat_indicator.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/threat_indicator.gd` (new)
- `scripts/ui_manager.gd` (modify)
- `scripts/main.gd` (wire per-frame)
- `test/unit/test_threat_indicator.gd` (new)

---

### Task 14: damage-number-polish

**Description**: Existing `damage_numbers.gd` gets crit variant (2x damage → gold + 1.5x scale), stacking (consecutive hits on same target accumulate and bounce), font scale by damage (small < 20, med 20-50, big > 50).

**Criteria**:
- `scripts/damage_numbers.gd` extended with `spawn(pos, amount, is_crit: bool = false, target_id: int = -1)`
- Stacking: same `target_id` within 0.4s upgrades existing number, does not spawn new one
- Font scale applied via `theme_override_font_sizes`
- Crit adds gold color + 1.5x initial scale
- Test: spawn 3 damage events for target_id=5 within 0.3s, assert only 1 `DamageNumber` exists and `accumulated >= 3 * base`
- File < 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_damage_number_polish.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/damage_numbers.gd` (modify)
- `test/unit/test_damage_number_polish.gd` (new)

---

### Task 15: settings-menu

**Description**: Accessible from start screen. Controls: Master/Music/SFX/Ambient/UI volume sliders (dB), screen shake toggle, reduced motion toggle, fullscreen toggle. Persisted via `save_manager.gd`.

**Criteria**:
- New file `scripts/settings_menu.gd` (RefCounted, max 180 LOC) builds a `PanelContainer` overlay
- Triggered from start screen button "SETTINGS"
- Sliders bound to `AudioServer.set_bus_volume_db` live
- Toggles persisted via `save_manager.set_setting(key, value)` / `get_setting(key, default)`
- Close button returns to start screen
- Test: build menu, flip screen_shake toggle, verify save_manager received update

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_settings_menu.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/settings_menu.gd` (new)
- `scripts/save_manager.gd` (extend with set_setting/get_setting)
- `scripts/ui_builder.gd` (modify — add SETTINGS button)
- `test/unit/test_settings_menu.gd` (new)

---

### Task 16: pause-menu

**Description**: Pressing ESC (desktop) or PAUSE button (mobile) during gameplay opens a pause overlay with Resume / Restart / Settings / Quit. Pauses tree via `get_tree().paused = true`.

**Criteria**:
- New file `scripts/pause_menu.gd` (RefCounted, max 150 LOC)
- Input handler in `main.gd` or `player_controller.gd` catches ESC and touch button
- Resume sets `paused = false`
- Restart calls existing game restart flow
- Settings opens `settings_menu.gd` overlay
- `process_mode = PROCESS_MODE_ALWAYS` on pause menu so it works while tree paused
- Test: pause → resume restores state

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_pause_menu.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/pause_menu.gd` (new)
- `scripts/main.gd` (wire input)
- `scripts/ui_builder.gd` (modify — add pause button)
- `test/unit/test_pause_menu.gd` (new)

---

### Task 17: ribbon-pattern-variants

**Description**: `wrapping_paper.gdshader` already accepts `pattern_type` (0-5). Audit that all 26 presents have visibly distinct patterns by confirming `pattern_type` + `pattern_scale` distribution and adjusting any duplicates. Add 2 new pattern types to the shader: `6=diagonal_stripes`, `7=checker`.

**Criteria**:
- `shaders/wrapping_paper.gdshader` extended with cases 6 and 7
- Visual test: instantiate all 26 presents with their pattern_type, capture thumbnails, confirm no two presents look identical at silhouette+pattern level
- At least 4 presents reassigned to use new patterns 6/7
- Shader compiles without warnings
- Smoke test passes

**Verification**: `command`
```bash
godot --headless --path . --quit-after 2
```

**Files**:
- `shaders/wrapping_paper.gdshader` (modify)
- `declarations/presents/presents.json` (modify — reassign some pattern_types)

---

### Task 18: present-accessory-meshes

**Description**: Add optional `accessory` field to presents.json (values: `none`, `scarf`, `tag`, `ribbon_tail`, `glow_aura`). `PresentParts` gains `attach_accessory(root, def)` building procedural meshes.

**Criteria**:
- `presents.json` gains `accessory` field on all 26 presents
- `scripts/present_parts.gd` gains `attach_accessory` dispatcher
- New file `scripts/present_accessory_meshes.gd` (RefCounted, max 160 LOC) with mesh builders
- Distribution: ~50% of presents get an accessory (not every one needs it)
- Test: for each accessory type, build a fake present, verify node count > expected baseline
- No file > 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_present_accessories.gd" --ignoreHeadlessMode
```

**Files**:
- `declarations/presents/presents.json` (modify)
- `scripts/present_parts.gd` (extend)
- `scripts/present_accessory_meshes.gd` (new)
- `scripts/present_factory.gd` (modify — call attach_accessory)
- `test/unit/test_present_accessories.gd` (new)

---

### Task 19: enemy-telegraph-audio

**Description**: Enemies playing a short windup tone 0.35s before firing a projectile. Grunt = low blip, Rusher = fast click, Tank = horn, Krampus = ominous swell. Routes through 3D audio pool (depends on Task 7).

**Criteria**:
- `audio_manager.gd` gains `play_enemy_telegraph(enemy_type: String, pos: Vector3)`
- `procedural_sfx.gd` has 4 new cached telegraph tones
- `enemy_behaviors.gd` or `enemy_director.gd` calls telegraph 0.35s before shot (add timer field on enemy dict)
- Telegraph volume -6 dB below shot SFX
- Test: spawn grunt, tick until just before shot, assert `audio_3d_pool.active_count() > 0`

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_enemy_telegraph.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/audio_manager.gd` (modify)
- `scripts/procedural_sfx.gd` (extend)
- `scripts/enemy_behaviors.gd` or `scripts/enemy_director.gd` (modify)
- `test/unit/test_enemy_telegraph.gd` (new)

---

### Task 20: boss-phase-sting

**Description**: Boss phase transitions (hp thresholds at 75%/50%/25%) trigger a music sting + screen flash + camera zoom-out pulse. Announces the phase.

**Criteria**:
- `boss_phases.gd` emits a signal `phase_changed(new_phase: int)` on threshold cross
- `main.gd` connects and calls `audio_mgr.play_boss_sting()`, screen flash, camera punch
- `audio_manager.gd` gains `play_boss_sting()` (reuses `boss_roar` at +3 dB or new cached sting)
- `main.gd` calls `show_message("PHASE %d" % phase, 2.0, Color.RED)`
- Test: simulate hp drop across thresholds, assert sting count == 3

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_boss_phase_sting.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/boss_phases.gd` (modify)
- `scripts/main.gd` (wire signal)
- `scripts/audio_manager.gd` (modify)
- `test/unit/test_boss_phase_sting.gd` (new)

---

### Task 21: screen-shake-service

**Description**: Shared screen shake service used by coal activation, boss hits, player damage, phase transitions. Trauma-based (exponential decay) applied to camera transform.

**Criteria**:
- New file `scripts/screen_shake.gd` (RefCounted, max 120 LOC) implements trauma model
- `add_trauma(amount: float)`, `update(delta, camera)` interface
- Respects "reduced motion" setting from Task 15
- `main.gd` instantiates, calls `update` per frame with camera node
- All shake sources replaced with `screen_shake.add_trauma(amount)`
- Test: add trauma 1.0, tick 60 frames, assert trauma < 0.01

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_screen_shake.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/screen_shake.gd` (new)
- `scripts/main.gd` (instantiate + tick)
- `scripts/coal_activator.gd` (modify — add_trauma on backfire)
- `scripts/player_damage_handler.gd` (modify — add_trauma on hit)
- `test/unit/test_screen_shake.gd` (new)

---

### Task 22: present-select-visual-upgrade

**Description**: Present select screen shows a rotating 3D preview of the currently-hovered present (instead of flat list). Stat radar chart (HP / Speed / Damage / Fire Rate / Range / Pierce) next to preview.

**Criteria**:
- `scripts/present_select_ui.gd` extended with preview area (SubViewport with 3D camera + present instance)
- Rotation driven by Tween at 30 deg/sec
- Stat radar chart drawn via `_draw` override on a Control (6-axis polygon)
- Hovering a present updates the preview
- File still < 200 LOC (split if needed into `present_preview_viewport.gd`)
- Graceful fallback in headless (no SubViewport crash)

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_present_preview.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/present_select_ui.gd` (modify)
- `scripts/present_preview_viewport.gd` (new if needed)
- `scripts/stat_radar_chart.gd` (new, max 120 LOC)
- `test/unit/test_present_preview.gd` (new)

---

### Task 23: hud-polish-animations

**Description**: HP bar pulses red when < 30% HP, XP bar gets tick marks at upgrade levels, gameplay board vignette fades in as HP drops, wave banner uses 3D text or easing animation.

**Criteria**:
- `ui_manager.gd` applies a tween pulse to hp_bar when hp_pct < 0.3
- XP bar gets 10 tick marks drawn over the fill (via custom `_draw` on an overlay)
- Vignette implemented as a full-screen `ColorRect` with alpha bound to `1.0 - hp_pct` (damped)
- Wave banner text animates in with character-reveal tween (0.05s per char)
- All respect "reduced motion" setting
- File still < 200 LOC

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_hud_polish.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/ui_manager.gd` (modify)
- `scripts/ui_builder.gd` (modify — add vignette overlay)
- `test/unit/test_hud_polish.gd` (new)

---

### Task 24: pickup-attraction-ring

**Description**: When an upgrade grants pickup magnetism, render a translucent ring on the gameplay board showing attraction radius. Pulse effect so it reads as active.

**Criteria**:
- New file `scripts/pickup_magnet_ring.gd` (RefCounted, max 100 LOC) builds a torus mesh
- `progression_manager.gd` tracks current pickup radius
- `main.gd` creates ring on player init, updates scale per frame to match radius
- Ring material is additive, gold-cyan gradient
- Only visible when radius > base value
- Test: set radius, tick, assert ring scale matches

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_pickup_magnet_ring.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/pickup_magnet_ring.gd` (new)
- `scripts/main.gd` (wire)
- `test/unit/test_pickup_magnet_ring.gd` (new)

---

### Task 25: coal-rarity-tiers

**Description**: Coal picked up from the world rolls a rarity: `common` (70%), `rare` (25%), `legendary` (5%). Rare doubles effect values, legendary triples. Visual distinction via glow color (gray/cyan/gold) in sidebar.

**Criteria**:
- `coal_effects.gd` extended with `apply_effect(effect_id, rng, rarity: String = "common")` — damage/radius scale by rarity
- Pickup code (likely `scroll_pickup.gd` or `main.gd` coal pickup path) rolls rarity, stores in queue as dict `{effect_id, rarity}`
- `coal_sidebar_ui.gd` renders rarity glow color on button
- `coal_activator.gd` unpacks rarity from entry and passes to `apply_effect`
- Test: roll 1000 rarities, assert distribution within 5% of expected

**Verification**: `command`
```bash
godot --headless --path . -s addons/gdUnit4/bin/GdUnitCmdTool.gd --add "res://test/unit/test_coal_rarity.gd" --ignoreHeadlessMode
```

**Files**:
- `scripts/coal_effects.gd` (modify)
- `scripts/coal_activator.gd` (modify)
- `scripts/coal_sidebar_ui.gd` (modify)
- `scripts/main.gd` (modify — coal pickup rolls rarity)
- `test/unit/test_coal_rarity.gd` (new)

---

### Task 26: polish-audit-doc

**Description**: After all other tasks complete, write `docs/POLISH_AUDIT.md` cataloging: (a) what this batch shipped, (b) remaining known gaps with severity, (c) next-batch candidates.

**Criteria**:
- `docs/POLISH_AUDIT.md` exists
- Three sections: Shipped, Remaining Gaps, Next Candidates
- At least 10 entries in Remaining Gaps with severity tags (P1/P2/P3)
- File committed
- No code changes

**Verification**: `file_exists`

**Files**:
- `docs/POLISH_AUDIT.md` (new)

---

## Execution Order

Respects dependency graph:

1. `coal-vfx-worldspace` (P1, no deps)
2. `audio-bus-architecture` (P1, no deps — blocks several audio tasks)
3. `screen-shake-service` (P3 promoted — blocks coal and HP vignette)
4. `coal-audio-unique-sfx` (P1, depends on audio-bus)
5. `coal-sidebar-animation` (P1, depends on coal-vfx-worldspace)
6. `audio-spatial-enemies` (P1, depends on audio-bus)
7. `audio-ambient-bed` (P1, depends on audio-bus)
8. `audio-reactive-music` (P1, depends on audio-bus)
9. `present-topper-system` (P1, no deps)
10. `present-body-shape-variants` (P1, no deps)
11. `present-idle-animation` (P1, depends on present-body-shape-variants)
12. `ribbon-pattern-variants` (P2, independent shader)
13. `present-accessory-meshes` (P2, depends on present-topper)
14. `minimap-widget` (P2, no deps)
15. `kill-feed-combo` (P2, no deps)
16. `threat-indicators` (P2, no deps)
17. `damage-number-polish` (P2, no deps)
18. `enemy-telegraph-audio` (P2, depends on audio-spatial-enemies)
19. `boss-phase-sting` (P2, depends on audio-bus + screen-shake)
20. `settings-menu` (P2, depends on audio-bus)
21. `pause-menu` (P2, depends on settings-menu)
22. `hud-polish-animations` (P3, depends on screen-shake-service)
23. `present-select-visual-upgrade` (P3, depends on present-topper + body)
24. `pickup-attraction-ring` (P3, no deps)
25. `coal-rarity-tiers` (P3, depends on coal-vfx + coal-audio)
26. `polish-audit-doc` (P3, LAST — catalogs what remains)

## Technical Notes

### Constraints Respected
- **200 LOC per .gd file** — hook-enforced, each new file sized accordingly
- **No hardcoded wave tables** — none of these tasks touch `wave_formula.gd`
- **Declarations-first** — topper/body_shape/accessory fields added to `presents.json`, not hardcoded
- **Holidaypunk tone** — all VFX/audio/UI choices palette-checked against `holidaypunk_theme.gd`
- **gdUnit4 v6.1.2** — all tests written for the pinned version
- **Max 200 LOC enforced by .claude/settings.json hook** — decompose as needed

### Known Risks
- **Headless audio test instability** — `AudioServer` bus creation may differ in headless; wrap in `Engine.is_editor_hint()` guards where needed
- **SubViewport in headless** — `present-select-visual-upgrade` preview needs graceful skip when `DisplayServer.get_name() == "headless"`
- **Mesh factory explosion** — adding toppers + body shapes + accessories could balloon draw calls per present. Mitigate by caching meshes in static dicts
- **Existing `main.gd` is at 200 LOC** — we may need to extract helpers to keep additions clean
- **Test file proliferation** — 26 tasks each add a test file. Acceptable but the `test/unit/` directory will grow ~3x
- **Backward compatibility** — existing saves won't have `audio_buses` dict; `save_manager.gd` must handle missing keys

### Commit Strategy
- ONE integration branch: `codex/production-polish`
- Incremental commits per task (P1 first, then P2, then P3)
- Squash merge at end per PR workflow memory
- Each commit passes the 200 LOC hook and gdUnit4 tests
- No admin bypass

## Risks

- **Scope creep into new gameplay systems** — mitigated by explicit acceptance criteria per task; each task is bounded
- **Audio bus layout incompatibility with existing project.godot** — test on a throwaway branch first
- **Present visual identity regression** — verify with screenshot diff tests before merging any present-roster task
- **Performance degradation from additional 3D audio players + particles + ambient layers** — profile frame time on wave 15+ before merging audio stack
- **200 LOC hook rejecting new files** — pre-plan decomposition targets, each listed file has a LOC budget
- **Breaking the MVP loop** — every task includes a smoke test (`godot --headless --path . --quit-after 1`) to catch regressions

---

## Summary

**26 tasks** grouped into 4 pillars (coal, presents, audio, UX sweep). Strict dependency ordering ensures audio-bus architecture unblocks 5 audio tasks, screen-shake service unblocks coal+HUD polish, and present-shape system unblocks idle anim + preview viewport. All tasks respect the 200 LOC constraint, hold the holidaypunk tone, and include explicit acceptance criteria with automated verification where possible.

**Execute with**:
```bash
/task-batch .claude/plans/production-polish.prq.md --priority
```
