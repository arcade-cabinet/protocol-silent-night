# Godot Reboot

`ashworth-manor` is the structural north star for the rebuild, not because the games are similar, but because the project discipline is correct.

See also `docs/FOUNDATION_PLAN.md` for dependency strategy around `gd-plug`, `gdUnit4`, `LimboAI`, and `Gaea`.

## Adopt From `ashworth-manor`

- Godot 4.6 Forward+
- GDScript-first implementation
- one clean runtime instead of split web/mobile architecture
- declaration-driven content only where it helps
- `gd-plug` for addon setup
- `gdUnit4` for repeatable headless test coverage
- explicit headless validation commands
- `LimboAI` as an early gameplay dependency once added

## Ignore From The Deleted Repo

- `apps/`
- workspace orchestration
- BabylonJS and React Native specific abstractions
- architecture justified by sharing code across runtimes that no longer matter
- letting procedural generation tooling own the runtime architecture

## Recommended Project Shape

```text
protocol-silent-night/
├── project.godot
├── addons/
│   ├── gd-plug/
│   └── gdUnit4/
├── declarations/
│   ├── classes/
│   ├── enemies/
│   ├── waves/
│   ├── upgrades/
│   └── audio/
├── scenes/
│   ├── main.tscn
│   ├── arena/
│   ├── actors/
│   └── ui/
├── scripts/
│   ├── game_manager.gd
│   ├── wave_director.gd
│   ├── player_controller.gd
│   ├── enemy_director.gd
│   ├── combat_resolver.gd
│   ├── progression_manager.gd
│   ├── save_manager.gd
│   └── audio_manager.gd
├── test/
│   ├── unit/
│   ├── component/
│   └── e2e/
└── docs/
```

## World Framing Rule

This game should be treated as a board-first roguelike, not a landscape game.

- the combat board should fill the viewport
- the camera should be optimized for readable combat space, not vistas
- do not build the environment around heightmaps by default
- do not assume a skybox is needed for the presentation to work

Use procedural generation to create:

- board layout
- pathing channels
- hazard and obstacle composition
- surface/material zoning
- landmark placement

Use asset and material content to create:

- snow and ice identity
- asphalt, metal, grime, and industrial contrast
- festive overlays and holidaypunk dressing

## Testing Standard

The rebuild should start with a real test story, not bolt one on later.

Smoke:

```bash
godot --headless --path . --quit-after 1
```

Unit and component coverage should exercise:

- player movement and dash cooldown
- auto-fire targeting and weapon identity
- wave timing and spawn composition
- XP pickup and level-up state transitions
- upgrade application
- boss spawn, attack cadence, and defeat state
- save/unlock behavior

End-to-end coverage should prove:

- a full campaign clear path
- a fail state path
- unlock progression across runs
- UI states for start, level-up, boss, and end screens

Screenshot capture should be part of component and e2e verification for:

- class select
- in-run HUD
- level-up screen
- boss fight
- victory and defeat screens

## Design Discipline

Use declarations for content values, not for every behavior. The first slice should privilege responsiveness, clarity, and feel over purity.

If a system makes the game harder to shape toward holidaypunk feel, it should not survive the reboot.
