# Present System — Protocol: Silent Night

The present character system assembles fully procedural 3D player characters from definition dictionaries. No mesh assets are imported — every part is built from Godot primitives (`BoxMesh`, `CylinderMesh`, `SphereMesh`, `TorusMesh`, `QuadMesh`).

**Assembly chain:** `PresentFactory.build_present(definition)` → `PresentBodyFactory.build()` (returns RIG dict) → `PresentParts.*` (attach anatomy at socket positions) → `PresentAnimator` (procedural idle/walk/recoil).

---

## Body Shapes: present_body_factory.gd

Six shapes are supported. Each shape's `build()` static variant returns a **RIG dict**.

### RIG Dict Contract

```
{
  root:       Node3D,           # the body mesh subtree, added to present root as "Body"
  sockets:    Dictionary,       # named attachment points (all Vector3, local-space)
  anatomy:    Array[String],    # which parts to render: "arms","legs","face","bow","topper"
  idle_style: String,           # animation dispatch key
  arm_style:  String,           # "stiff" | "wavy"
  leg_style:  String,           # "standard" | "short" | "none"
}
```

**Socket keys** (always present, may be `Vector3.ZERO` for unused slots):

| Key | Anatomy part anchored here |
|-----|---------------------------|
| `arm_left` | Left arm origin |
| `arm_right` | Right arm origin |
| `leg_left` | Left leg root |
| `leg_right` | Right leg root |
| `face` | Face quad center |
| `bow` | Ribbon bow knot |
| `topper` | Topper mesh base |

### Shape Variants

| Shape | Mesh | Idle style | Arm style | Leg style | Anatomy |
|-------|------|-----------|-----------|-----------|---------|
| `box` (default) | Single BoxMesh (w × h × d) | bounce | stiff | standard | arms, legs, face, bow, topper |
| `cube` | Single BoxMesh (avg dimension cubed) | bounce | stiff | standard | arms, legs, face, bow, topper |
| `tall_rect` | Single BoxMesh (h × 1.45, w × 0.85) | sway | stiff | standard | arms, legs, face, bow, topper |
| `stacked_duo` | Two BoxMeshes stacked (big base + small top) | wobble | stiff | short | arms, legs, face, bow, topper |
| `cylinder` | CylinderMesh | bounce | stiff | short | arms, legs, face, bow, topper |
| `gift_bag` | CylinderMesh body + TorusMesh cinch ring | hop | wavy | none | arms, face, bow, topper (no legs) |

### Shape → Recommended Stat Archetype

| Shape | Suggested stat role |
|-------|---------------------|
| `cube` | Balanced all-rounder |
| `tall_rect` | High HP, low speed (tall = durable) |
| `box` | Standard — neutral baseline |
| `stacked_duo` | Medium HP, quirky movement |
| `cylinder` | Speed-focused (nimble shape) |
| `gift_bag` | Damage-focused, fragile (no legs = high risk) |

These are design conventions, not hard constraints. Stat values are in the definition dict.

---

## Toppers: present_topper_meshes.gd

**API:** `PresentTopperMeshes.build(kind: String, color: Color) -> Node3D`

The returned node is positioned by `PresentParts.attach_topper()` at `rig["sockets"]["topper"]`.

**Dispatch:** `build()` uses a `match kind` block. Unknown kinds produce an empty `Node3D`.

Eight kinds (plus `none`):

| Kind | Description | Materials |
|------|-------------|-----------|
| `none` | No topper | — |
| `santa_hat` | White brim + red tipped cone + white pom-sphere | Flat StandardMaterial3D |
| `antlers` | Bilateral trunk + 2 prongs per side, brown | Flat |
| `star` | 5 spike prisms arranged radially + emissive core | Emissive (energy 2.2/1.8) |
| `halo` | TorusMesh ring, pale yellow | Emissive (energy 2.4) |
| `candy_cane` | White shaft + red torus hook | Flat |
| `bow_giant` | Emissive knot-sphere + two torus loops | Emissive (energy 1.4/1.6) |
| `ornament` | Emissive sphere + grey cylinder cap | Emissive (energy 1.3) |

**JSON tag format:** in a present definition, the topper kind is specified as:

```json
{ "topper": "santa_hat", "bow_color": "#ffd700" }
```

`attach_topper()` reads `def["topper"]` for the kind and `def["bow_color"]` as the tint color passed to `build()`. Colors default to `#ffd700` if `bow_color` is absent or if the provided color has value < 0.1 (effectively black).

---

## Accessories: present_accessory_meshes.gd

**API:** `PresentAccessoryMeshes.build(kind: String, def: Dictionary, w: float, h: float, d: float) -> Node3D`

Called by `PresentParts.attach_accessory()`. The node is added directly to the present root (not socket-anchored — accessories span the body).

Four accessory kinds (plus `none`):

| Kind | Visual | Source colors | Coverage |
|------|--------|---------------|---------|
| `none` | Nothing | — | — |
| `scarf` | BoxMesh band at 88% height + hanging tail | `arm_color` | Around neck/shoulders |
| `tag` | Tilted QuadMesh + thin cylinder string | `pattern_color` (emissive glow) | Side-hanging gift tag |
| `ribbon_tail` | 3 rotated box segments per side cascading upward | `bow_color` (emissive) | Trailing ribbon streamers |
| `glow_aura` | Semi-transparent emissive SphereMesh shell | `pattern_color` | Full-body aura |

**Distribution guidance:** 50–70% of presents should carry one accessory. `none` is a valid choice for visual clarity. All four types are additive — they do not occlude other anatomy.

**Attach API:** in `PresentFactory.build_present()`, `PresentParts.attach_accessory(root, definition, box_w, box_h, box_d)` is called unconditionally after anatomy assembly. It reads `def["accessory"]` and early-returns on `"none"`.

---

## Idle Animation: present_animator.gd

`PresentAnimator` is a `RefCounted` that drives per-frame visual transforms. It is not a scene node — callers own the update loop.

**Tick:** `animator.update(delta, visual, velocity: Vector2)`

The visual node must carry an `idle_style` meta key (set by `PresentFactory` from the RIG dict): `visual.set_meta("idle_style", rig["idle_style"])`.

### Idle Style Dispatch

| idle_style | Motion | Offset function |
|-----------|--------|----------------|
| `bounce` (default) | Vertical sine bob | `sin(t * 3.2) * 0.06` |
| `hop` | Binary hop with sine gate (2.2 Hz phase) | `maxf(0, sin(phase * PI)) * 0.18` |
| `wobble` | Figure-8 micro-drift | `sin(2.4t) * 0.03 x, cos(1.8t) * 0.025 y` |
| `sway` | Lateral pendulum swing | `sin(1.6t) * 0.05 x` |
| `spin` | Continuous Y-axis rotation + vertical bob | `rotation.y = time * 2.0` |

All idle offsets are scaled by `idle_weight = (1 - moving) * (0.25 if reduced_motion else 1.0)`, so animation fades out while the present is moving and collapses under the accessibility reduced-motion preference.

**Walk bob:** additional `sin(t * 10) * 0.04 * moving` Y offset, active only when speed > 0.

**Recoil:** `trigger_recoil(intensity)` sets a 0.08 s timer. During recoil, `visual.scale` is pulsed via a sine wave up to `1 + intensity`.

**Dash afterimage:** `spawn_dash_afterimage(root, source)` clones all `MeshInstance3D` children of the source into a ghost node with a blue-tinted translucent unshaded material. Afterimages scale out and fade to 0 alpha over `life` seconds (default 0.3 s). `update_afterimages(array, delta)` is a static helper to advance the pool.

---

## Gear Attachment: gear_visualizer.gd

**API:** `GearVisualizer.attach(visual: Node3D, gear_system: RefCounted, animator: Node = null) -> void`

Called once at player spawn. Reads `gear_system.equipped` (a Dictionary of slot → item Dictionary) and builds mesh nodes per equipped slot.

### Slot Offsets

| Slot | Offset | Mesh built |
|------|--------|-----------|
| `weapon_mod` | `(0, 1.35, 0.45)` | Emissive cylinder barrel (horizontal) |
| `wrapping_upgrade` | `(0, 0.55, 0)` | Emissive torus band (equatorial ring) |
| `bow_accessory` | `(0, 1.55, 0)` | Emissive torus ring (bow embellishment) |
| `tag_charm` | `(0.45, 0.6, 0.45)` | Emissive tilted quad (tag) |

Each node is named `Gear_<slot>` and parented to `visual`.

After slot mesh construction, `GearFlairVisualizer.attach_flair()` is called per equipped item to stack flair pieces above `y_start = 1.75`. The returned `y_stack` value from each flair call is threaded into the next call so pieces don't overlap.

**Wiring point:** `player_controller.gd` calls `GearVisualizer.attach(visual_root, gear_system)` during player spawn after `PresentFactory.build_present()` completes.
