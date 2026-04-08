# Protocol: Silent Night // Agent Notes

This repo is in reboot mode.

## Read First

1. `docs/README.md`
2. `docs/NORTH_STAR.md`
3. `docs/FOUNDATION_PLAN.md`
4. `docs/DEPENDENCY_POLICY.md`
5. `docs/DEPENDENCY_WATCH.md`
6. `docs/BOARD_GENERATION_CONTRACT.md`
7. `docs/reference/poc.html`

## Current Foundation

- `gd-plug` is initialized
- `gdUnit4` is installed and pinned
- `Gaea` is an accepted strategic dependency and must stay pinned to an exact vendored commit (no floating branches or auto-updates)
- `LimboAI` is an intended early dependency, but is not yet integrated here

## Dependency Rules

- Do not upgrade `Gaea` or `gdUnit4` casually.
- Do not float branches for critical dependencies.
- Use exact pins for anything foundation-level.
- If upstream changes look useful, document them first.
- If `Gaea` breaks or falls short, prefer contributing upstream before inventing a parallel local fork strategy.

## Upstream Monitoring

When doing dependency or architecture work:

- inspect upstream `Gaea`, `gdUnit4`, and `LimboAI`
- update `docs/DEPENDENCY_WATCH.md` with anything material
- keep the current pins unless there is explicit approval to move them

## Product Rule

The playable POC remains the product truth for game feel.

The rebuild should optimize for:

- holidaypunk identity
- procedural generation that materially improves the game
- readable arcade combat
- clean Godot 4.6 foundations

## Board-First Constraint

- treat the arena as a viewport-filling roguelike board
- do not assume heightmaps are the right procedural target
- do not introduce skybox-first environment work unless the game proves it needs it
- prefer surface zoning, decals, obstacle composition, and landmark placement over scenic terrain work
