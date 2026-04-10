# Scripts Reference — Protocol: Silent Night

All scripts live in `scripts/`. Max 200 LOC per file (hook-enforced). Grouped by subsystem.

---

## Core Loop

| File | Description |
|------|-------------|
| `main.gd` | Root `Node3D` scene entry point; owns top-level state (enemies, projectiles, pickups, player_state) and wires all subsystem managers together |
| `game_manager.gd` | Run state orchestration — delegates wave formula, wave spawner, and player spawn; `start_run(class_id)` kicks off a new run |
| `main_helpers.gd` | Static helper functions extracted from `main.gd` for LOC compliance; thin wrappers over coal activation and other main-state-accessing utilities |
| `runtime_cleaner.gd` | Clears all runtime nodes and arrays (enemies, projectiles, pickups, VFX, particles) between runs via `clear(main)` |

---

## Wave / Enemy

| File | Description |
|------|-------------|
| `wave_formula.gd` | PRNG-seeded wave generation algorithm; derives spawn rate, composition, HP scale, speed multiplier, pattern type, burst chance, and boss threshold from `(run_seed, level)` with a pressure accumulator and no hardcoded wave tables |
| `wave_spawner.gd` | Per-frame spawn execution; rolls boss pressure accumulator each frame for Krampus appearance probability within normal waves; tracks bosses and scrolls dropped per level |
| `enemy_director.gd` | Spawns and manages enemy lifecycle; builds 3D enemy nodes from definitions; delegates per-enemy behavior to `enemy_behaviors.gd`; takes `MaterialFactory` and `PixelArtRenderer` at init |
| `enemy_behaviors.gd` | Per-enemy behavior helpers; BT wrappers for grunt/rusher/tank/Krampus delegating to `enemy_bt_states.gd`; pure static functions that mutate enemy state |
| `enemy_bt_states.gd` | Pure static BT tick functions — `grunt_tick`, `rusher_tick`, `tank_tick` with telegraph callbacks and state constants (TANK_SLAM_DAMAGE_MULT, etc.) |
| `boss_phases.gd` | 3-phase Krampus-Prime fight wired to `BossBTHelpers`: Phase 1 circle-strafe, Phase 2 charge + ranged, Phase 3 rapid-charge + multi-shot + minions |
| `boss_bt_helpers.gd` | Pure static helpers for Krampus HSM: `circle_strafe_dir`, `charge_tick`, `update_charge_phase`, `is_charging`, `multi_shot` (3 proj ±10°) |

---

## Player / Combat

| File | Description |
|------|-------------|
| `player_controller.gd` | Player movement (WASD/stick), dash input, firing direction, present visual assembly; takes `MaterialFactory` and `PixelArtRenderer` at init |
| `player_damage_handler.gd` | Applies damage to the player, handles rewrap (extra life) logic and i-frames (1.2 s after each rewrap) |
| `combat_resolver.gd` | Projectile movement, enemy hit detection, cookie/XP pickup overlap resolution, damage number spawning; takes `MaterialFactory` and `PixelArtRenderer` at init |

---

## Board / World

| File | Description |
|------|-------------|
| `board_generator.gd` | Procedural arena layout generation from a PRNG seed; outputs snow drift positions, ridge lines, obstacle data, and zone assignments |
| `board_builder.gd` | Visual board construction — builds the arena surface, perimeter walls, lighting rigs, and decorative scatter from `board_generator` output |
| `world_builder.gd` | One-shot scene graph setup: `WorldEnvironment`, directional light, camera rig, and ambient light configuration |
| `board_object_factory.gd` | Builds procedural destructible board objects (frozen mailbox, gift cache, chimney vent) from primitives + themed materials; objects drop scrolls on destruction |
| `board_object_handler.gd` | Manages board object lifecycle — spawning, damage resolution, destruction, and scroll pickup drop |
| `obstacle_builder.gd` | Builds collision-geometry obstacle nodes (barricades, pillars) from `board_generator` obstacle data |
| `material_factory.gd` | Loads PBR textures from `/Volumes/home/assets/2DPhotorealistic/` (SMB mount) with a cache; silently falls back to flat colors when unmounted |

---

## Present System

| File | Description |
|------|-------------|
| `present_factory.gd` | Top-level assembler: reads a definition dict, delegates body to `PresentBodyFactory`, anatomy to `PresentParts`, sets `idle_style` meta on the root node |
| `present_body_factory.gd` | 6-variant procedural body builder; each shape returns a RIG dict with root node, socket positions, anatomy list, and animation style keys |
| `present_parts.gd` | Socket-aware anatomy attachment: `attach_bow_at`, `attach_arms_at`, `attach_legs_at`, `attach_face_at`, `attach_topper`, `attach_accessory`, `attach_shadow` |
| `present_topper_meshes.gd` | Builds 8 procedural topper kinds (none/santa_hat/antlers/star/halo/candy_cane/bow_giant/ornament) from Godot primitives + emissive materials |
| `present_accessory_meshes.gd` | Builds 4 optional accessories (none/scarf/tag/ribbon_tail/glow_aura) from primitives; 50–70% of presents carry one |
| `present_animator.gd` | Procedural animation: idle bob/hop/wobble/sway/spin dispatched by `idle_style` meta, walk bob, fire recoil pulse, dash afterimage cloning |
| `present_spawner.gd` | Builds game-ready player nodes from a definition; loads definition JSON, delegates to `PresentFactory`, returns a Node3D for the actor tree |
| `present_face_renderer.gd` | Generates procedural face textures for 5 expressions (determined/angry/cheerful/stoic/manic); caches per expression |
| `present_select_ui.gd` | Builds present character select button cards; hover-driven stat radar chart + 3D viewport preview via `present_preview_viewport.gd` |
| `present_preview_viewport.gd` | Static builder for a `SubViewport` 3D present preview panel; headless no-op; `update_present(vp, def)` clears and rebuilds the rotating present mesh |
| `auto_rotate.gd` | Minimal `Node3D` extension: rotates parent 45°/s on Y axis each `_process` frame; attach as child to any mesh for a continuous spin |

---

## Coal System

| File | Description |
|------|-------------|
| `coal_activator.gd` | Resolves a coal effect descriptor against live game state; pops from the coal queue and dispatches via `CoalEffects.apply_effect` |
| `coal_effects.gd` | One-use consumable buff logic; 6 effects (spray/hurl/poison/embers/backfire/fortune); rarity multiplier and color table; returns an effect descriptor dict |
| `coal_sidebar_ui.gd` | Right-side HUD sidebar showing the coal buff queue; tap to activate, long-press to sell |
| `coal_vfx.gd` | Thin adapter over `particle_coal_helpers`; public API `spawn_for_effect(particles, root, pos, kind, color, rarity)` with rarity-scaled particle count/size |
| `particle_coal_helpers.gd` | Coal-specific mesh particle spawners extracted from `particle_effects.gd` for LOC compliance; dispatches on effect kind with rarity scaling |

---

## Audio

| File | Description |
|------|-------------|
| `audio_manager.gd` | Top-level audio service: owns bus setup, 6-player 2D SFX pool, music players, ambient player, WAV cache, and all public `play_*` methods |
| `audio_manager_ext.gd` | Extension helpers for `audio_manager.gd`: spatial playback, ambient start/stop, music intensity crossfade, and extended cache seeding — static methods that take the manager as first arg |
| `audio_3d_pool.gd` | Pool of 16 `AudioStreamPlayer3D` nodes on the SFX bus; linear inverse-distance falloff, 35 m max distance; round-robin `play_at(stream, world_pos, db)` |
| `procedural_sfx.gd` | PCM synthesis primitives: `make_tone`, `make_sweep`, `make_chord`, `make_noise_burst`, `make_whip`, `make_bubble`, `make_crackle`, `make_chime_arp` — all return `AudioStreamWAV` |
| `procedural_music.gd` | Generates looping music tracks as `AudioStreamWAV`: menu (8 s), gameplay (6 s), boss (4 s), calm (6 s), panic (4 s), ambient bed (20 s) |
| `music_director.gd` | Watches enemy count, player HP, and boss presence; selects intensity state (calm/gameplay/panic/boss); 0.9 s hysteresis cooldown; calls `audio_mgr.set_music_intensity()` |

---

## HUD / UI

| File | Description |
|------|-------------|
| `ui_manager.gd` | Orchestrates all HUD panels and overlays; owns `hud_root`, start/level/end screens, message and achievement overlays; wires `ui_widgets` and `ui_builder` |
| `ui_builder.gd` | Builds start screen, HUD health bar, XP bar, wave counter, and score display; uses `holidaypunk_theme.gd` for styling |
| `ui_screens.gd` | Builds the level-up upgrade selection screen and the end/death screen |
| `ui_widgets.gd` | Integration adapter: `build_all(root)` constructs all Phase 5 widgets; `refresh(state, main)` drives per-frame updates for minimap, threat, combo, and vignette |
| `minimap_widget.gd` | Bottom-right circular radar minimap (140 × 140 px) showing player/enemies/pickups/boss via `Control._draw` primitives |
| `combo_counter.gd` | Kill combo logic: sliding 2 s window, 3 tiers (white/gold/red), pure `RefCounted` — no scene nodes |
| `threat_indicator.gd` | Full-rect off-screen boss arrow indicator; draws a filled triangle rotating at 180 px from center toward boss world position |
| `damage_numbers.gd` | Floating `Label3D` damage popups with rise, fade, stacking within 0.4 s per target, crit sizing, and billboard rendering |
| `pickup_magnet_ring.gd` | Torus `MeshInstance3D` on the 3D board showing pickup attraction radius; gold-cyan emissive, 3 Hz pulse, hidden at base radius |
| `stat_radar_chart.gd` | 6-axis polygon radar chart (HP/SPD/DMG/RATE/RNG/PCE) rendered via `Control._draw`; used in character select |
| `holidaypunk_theme.gd` | Procedural theme generator: `StyleBoxFlat` with neon borders, dark backgrounds, and holiday color constants |
| `pixel_art_renderer.gd` | Renders pixel-art sprite sheets from palette strings into `ImageTexture`; 8-px scale, 16-color holidaypunk palette |
| `screen_shake.gd` | Trauma-based camera shake service; `add_trauma(amount)` then `update(delta, camera)` decays and applies h_offset/v_offset; collapses to zero under reduced-motion preference |

---

## Gear / Loot

| File | Description |
|------|-------------|
| `gear_system.gd` | Runtime gear slot manager (weapon_mod/wrapping_upgrade/bow_accessory/tag_charm); equip/unequip with stat modifier application; validates items before accepting |
| `gear_generator.gd` | Procedural gear instance generator; combines archetype templates + madlib prefix/suffix tables via PRNG to produce unique items each run |
| `gear_visualizer.gd` | Attaches visual mesh representations of equipped gear to the present visual root; one node per slot at fixed offsets; chains into `gear_flair_visualizer` |
| `gear_validator.gd` | Headless batch validator for gear definition JSON files in `declarations/gear/`; run with `godot --headless -s res://scripts/gear_validator.gd` |
| `gear_flair_visualizer.gd` | Renders flair pieces (wobble_animation, color_shift, trailing_sparks, etc.) attached to equipped gear; stacks pieces vertically above the present |
| `scroll_formula.gd` | PRNG-driven scroll pressure accumulator matching the boss pressure pattern; probability of scroll drop grows with level + lookback memory |
| `scroll_pickup.gd` | Builds procedural parchment scroll pickup nodes (QuadMesh body + CylinderMesh rolls); naughty = dark red/black, nice = gold/parchment |

---

## Between-Match

| File | Description |
|------|-------------|
| `between_match_flow.gd` | State machine for the between-match screen sequence (RESULTS → SCROLLS → MARKET → menu); skippable via `test_mode["skip_between_match"]` |
| `between_match_screens.gd` | Builds the Results screen and Scroll Opening screen UI |
| `market_screen.gd` | Market screen: 3 procedurally generated gear items for sale, buy with Cookies, reroll for 10 Cookies |
| `market_preview.gd` | Builds a `SubViewport`-based 3D gear preview using `gear_visualizer` against a throwaway `GearSystem`; preview is visually identical to equipped result |
| `difficulty_select.gd` | Builds the difficulty selection screen (6 tiers: Priceless/Great/Good/Naughty/Nice/Unforgivable in a 3×2 grid) with permadeath toggle |
| `pause_menu.gd` | Pause overlay (Resume/Restart/Settings/Quit); sets `SceneTree.paused`, panel uses `PROCESS_MODE_ALWAYS` so buttons respond while paused |
| `settings_menu.gd` | Settings overlay with 3 tabs: Audio (per-bus volume sliders), Display (screen shake, reduced motion, minimap zoom), Gameplay (difficulty preference, permadeath default) |

---

## Progression

| File | Description |
|------|-------------|
| `progression_manager.gd` | Tracks XP, level-ups, kills, and upgrade selection; wires into `ui_manager` for bar updates and `audio_manager` for level-up audio |
| `save_manager.gd` | `Node` autoload: persists run state (unlocked presents, best wave/level, achievements, preferences) to `user://save.json`; `get_preference(key, default)` / `set_preference(key, value)` |

---

## Particles / VFX

| File | Description |
|------|-------------|
| `particle_effects.gd` | Procedural mesh-based particle system (headless-safe); manages entries as `{node, velocity, life, gravity, rise}`; emits muzzle flash, burst, and sparkle types |
| `flair_animator.gd` | `Node` (needs `_process`): per-frame ticker for flair animations — wobble, color shift, trailing sparks; prunes freed targets automatically |
| `flair_catalog.gd` | Loads `declarations/gear/flair_catalog.json`; maps flair types to achievement unlock criteria and visual parameters; static cache, loaded on first access |
