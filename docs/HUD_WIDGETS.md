# HUD Widgets — Protocol: Silent Night

All HUD widgets are stateless static builders. They create Godot `Control` nodes, return a state dict, and expose a refresh/update API. The live game loop calls refresh functions every frame via `ui_widgets.gd`.

---

## Widget Contract

```
build(root: Control) -> Dictionary          # construct nodes, add to root, return opaque state dict
refresh(state: Dictionary, ...) -> void     # push new data, call queue_redraw() if needed
```

Widgets own their own draw callbacks (`canvas.draw.connect()`). No `_draw()` overrides in GDScript classes — all draw calls happen in lambdas or static methods connected to the `Control.draw` signal.

State dicts are opaque to callers — only the widget's own static methods should read or write them. The `ui_manager` passes them through untouched.

---

## Widget Index

### minimap_widget.gd — Radar Minimap

Circular radar in the bottom-right corner. Draws player (white), enemies (red), pickups (green/gold), and boss (large red) relative to the player's world position.

| Property | Value |
|----------|-------|
| Size | 140 × 140 px |
| Default view radius | 22 world units |
| Border | 2 px neon cyan (#69d6ff) |
| Background | Dark navy, 78% opacity |

**API:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `build` | `(root: Control) -> Dictionary` | Creates `PanelContainer` + inner `Control` canvas, anchored bottom-right |
| `refresh` | `(state, player_pos: Vector2, enemies: Array, pickups: Array, boss: Variant)` | Stores data in canvas meta, calls `queue_redraw()` |
| `set_view_radius` | `(state, radius: float)` | Override zoom level (clamped 8–60 world units) |

World coords are converted via `_world_to_map()`: `center + (world_pos - player_pos) * (SIZE.x * 0.46 / view_radius)`.

Pickup color: gold (`#ffd700`) for `"cookie"` type, green (`#55ff88`) for XP. Boss renders at 5.5 px radius vs 2.8 px for normal enemies.

---

### threat_indicator.gd — Boss Off-Screen Arrow

A full-rect `Control` overlay that draws a filled triangle arrow pointing toward the boss when it is off-screen (delta from player > 10 world units).

| Property | Value |
|----------|-------|
| Indicator radius | 180 px from screen center |
| Triangle size | 16 px |
| Default color | Red `#ff2244` |

**API:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `build` | `(root: Control) -> Dictionary` | Creates full-rect canvas overlay, mouse-passthrough |
| `update` | `(state, boss_world: Variant, player_world: Variant, viewport_size: Vector2, tier: String)` | Recomputes angle and visibility, redraws |

Tier colors: `"red"` → `#ff2244`, `"gold"` → `#ffd700`, `"purple"` → `#aa66ff`. The gold tier is triggered by `ui_widgets._refresh_threat()` when boss HP drops below 30%.

Passing `null` for `boss_world` or `player_world` hides the indicator.

---

### combo_counter.gd — Kill Combo Counter (Logic)

Pure logic object, no scene nodes. Tracks kill timestamps within a sliding 2-second window and escalates through tiers. The UI label is a separate `Label` node built by `ui_widgets._build_combo_label()`.

| Threshold | Tier | Color |
|-----------|------|-------|
| < 3 kills | 0 (hidden) | `#aaaaaa` |
| 3–4 kills | 1 (white) | `#ffffff` |
| 5–14 kills | 2 (gold) | `#ffd700` |
| 15+ kills | 3 (red) | `#ff2244` |

**API:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `tick` | `(delta: float)` | Advances timer; resets combo if 2 s idle |
| `register_kill` | `() -> Dictionary` | Records a kill, returns `{count, tier}` |
| `get_state` | `() -> Dictionary` | Returns current `{count, tier}` without mutation |
| `reset` | `()` | Clears all state |
| `tier_color` | `static (tier: int) -> Color` | Returns display color for tier |

`ui_widgets._refresh_combo()` calls `tick()` every frame and hides the label when `count < 3`.

---

### damage_numbers.gd — Floating Damage Labels

Spawns `Label3D` nodes in world space that rise and fade over 0.6 s. Supports damage stacking: hits to the same `target_id` within a 0.4 s window accumulate into a single label instead of spawning a new one.

| Property | Value |
|----------|-------|
| Lifetime | 0.6 s |
| Fade start | 0.4 s remaining |
| Rise speed | 2.5 world units/s |
| Base font size | 24 px |
| Crit font size | 32 px (+ 8 if amount ≥ 50) |

**API:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `spawn` | `(root, world_pos, amount, color, is_crit, target_id)` | Creates or stacks a damage label |
| `update` | `(delta: float)` | Advances all labels, prunes expired |
| `clear` | `()` | Removes all active labels |

Font size scaling: `amount < 20` → 20 px, `amount ≥ 20` → 28 px, `amount ≥ 50` → 34 px, crit → 32 px base (+8 at ≥ 50). Labels use `BILLBOARD_ENABLED` and `no_depth_test = true` so they always face the camera and render on top.

---

### pickup_magnet_ring.gd — Pickup Attraction Radius

A `MeshInstance3D` torus ring on the game board (not a Control node) showing the player's active pickup attraction radius. Hidden when radius equals the base radius.

| Property | Value |
|----------|-------|
| Material | Unshaded, alpha transparent |
| Base color | Gold-amber `rgba(1.0, 0.87, 0.3, 0.35)` |
| Emission | Cyan `(0.4, 0.9, 1.0)` at energy 1.2 |
| Pulse | ±3% scale, ±0.1 alpha at 3 Hz |

**API:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `build` | `static (root: Node3D) -> MeshInstance3D` | Creates ring, adds to root, starts hidden |
| `update` | `static (ring, player_pos, radius, base_radius, time)` | Shows/hides, scales to radius, pulses |

The ring is parented to the 3D world root, not the HUD. `update()` is called every frame with the current magnet radius from player stats.

---

### stat_radar_chart.gd — 6-Axis Stat Radar

A `Control` canvas node rendering a polygon radar chart. Used in the character select screen (via `present_select_ui.gd`) and can be embedded anywhere a `Control` parent is available.

Axes and normalization maxima:

| Axis | Label | Max |
|------|-------|-----|
| `hp` | HP | 200 |
| `speed` | SPD | 20 |
| `damage` | DMG | 60 |
| `fire_rate` | RATE | 0.6 (inverted — lower = faster) |
| `range` | RNG | 25 |
| `pierce` | PCE | 5 |

`fire_rate` is the only inverted axis: the chart value is `1 - (raw / max)` so a faster fire rate (smaller number) renders as a larger polygon area.

**API:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `build` | `static (root: Control, size: Vector2 = (180, 180)) -> Control` | Creates canvas node |
| `update` | `static (canvas: Control, present_def: Dictionary)` | Reads stat values, redraws |

Rendering: 4 concentric background rings at 25%/50%/75%/100% opacity 12%, then axis lines at 18% white, then filled polygon at cyan 35% opacity with cyan outline `#69d6ff` at 2 px. Axis labels drawn with the fallback system font at 11 px.

---

## Wiring Point: ui_widgets.gd

`ui_widgets.gd` is the integration adapter between `ui_manager` and the individual widgets.

### Build Once

```gdscript
var widget_state: Dictionary = UIWidgets.build_all(hud_root)
```

`build_all(root)` builds minimap, threat indicator, combo counter + label, and the damage vignette. Returns the combined state dict used by all subsequent refresh calls.

### Tick Every Frame

```gdscript
UIWidgets.refresh(widget_state, main_node)
```

`refresh()` calls four sub-refreshers in sequence:

| Sub-refresher | Data source |
|--------------|-------------|
| `_refresh_minimap` | `main.player_node.position`, `main.enemies`, `main.pickups`, `main.boss_ref` |
| `_refresh_threat` | `main.boss_ref`, `main.player_node.position` |
| `_refresh_combo` | `main.get_process_delta_time()` |
| `_refresh_vignette` | `main.player_state["hp"]` / `["max_hp"]` |

**Vignette:** a `ColorRect` at z-index 100 with `MOUSE_FILTER_IGNORE`. Alpha scales from 0 at full HP to 0.45 at 0 HP — a blood-red rim that intensifies as the player is wounded.

**Overlay ticker:** `UIWidgets.tick_overlays(ui_mgr, delta)` drives the banner typewriter effect (0.05 s per character) and achievement overlay fade-out. Called from `ui_manager._process()`.

### Other Helpers

| Method | Description |
|--------|-------------|
| `register_kill(state)` | Routes a kill event into the combo counter |
| `ensure_menus(state, root, ...)` | Lazy-builds pause and settings panels into state dict on first call |
| `toggle_pause(state, tree)` | Shows/hides pause panel, sets `SceneTree.paused` |
| `open_settings(state)` | Shows the settings overlay |

---

## How to Add a New Widget

1. Create `scripts/my_widget.gd` as `extends RefCounted` with static `build(root) -> Dictionary` and `update(state, ...) -> void`.
2. Add a `preload` constant for it in `ui_widgets.gd`.
3. Call `MY_WIDGET.build(root)` inside `build_all()` and store the result under a new key in the state dict.
4. Add a `_refresh_my_widget(state, main)` static method in `ui_widgets.gd` that reads from `main` and calls `MY_WIDGET.update()`.
5. Call `_refresh_my_widget(state, main)` from `refresh()`.
6. If the widget needs per-frame overlay logic (typewriter, timers), wire it into `tick_overlays()`.
7. Keep each file under 200 LOC. If the widget's draw logic is large, extract it to a `my_widget_draw.gd` helper with static methods.
