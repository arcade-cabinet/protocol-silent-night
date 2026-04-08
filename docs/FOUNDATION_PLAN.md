# Foundation Plan

This document exists to keep the reboot from collapsing into either of two failure modes:

- rushing into another wrong implementation
- overcommitting to tools before their role is clearly bounded

## Current Baseline

Already set up in this repo:

- `gd-plug` initialized
- `gdUnit4` installed through `gd-plug`

That gives the project a real dependency and test story before gameplay code begins.

## Recommendation Summary

Adopt now:

- `gd-plug`
- `gdUnit4`
- `Gaea` 4.6 fork
- `LimboAI`

## Why `LimboAI` Goes In Early

`LimboAI` is a good foundation dependency from the start because it solves a structural problem we know we will have:

- enemy behavior authoring
- boss phase logic
- elite variants
- reusable decision patterns across multiple actors

It is a better early dependency than a rendering or UI addon because it shapes runtime behavior and gives us an AI language that can scale with the game.

Recommended role:

- use behavior trees for enemy decision flow
- use HSM for higher-order mode changes, especially bosses and scripted encounter states
- keep custom tasks in GDScript so game rules remain project-owned
- start with grunts, rushers, tanks, and Krampus-Prime as the first LimboAI consumers

Recommended integration method:

- use the Godot 4.6 GDExtension release or build artifact, not a source-only clone
- avoid taking on SCons and cross-platform native build work unless we truly need it

## Why `Gaea` Is Strategic But Must Be Firewalled

`Gaea` is not a side experiment here. It is a strategic dependency because the project needs procedural generation to create a visual and spatial language that asset libraries are unlikely to supply.

Reasons:

- the upstream README still describes Gaea 2.0 as early development
- the addon in the 4.6 fork identifies itself as `v2.0.0-beta5`
- there are no published releases on the forked repo
- the branch packaging is addon-oriented, not dependency-manager-oriented

That does not mean "do not use it." It means "accept the risk explicitly, pin it hard, and firewall upgrades."

Recommended role:

- arena board layout generation
- obstacle and prop placement masks
- spawn ring and perimeter dressing generation
- surface and decoration variation

See `docs/BOARD_GENERATION_CONTRACT.md` for the actual board-first output contract.

Not its role:

- combat systems
- progression systems
- save schema
- mission flow
- core game state orchestration

## Integration Strategy

### `LimboAI`

Bring in early and treat it as a first-class gameplay dependency.

Use it for:

- enemy AI authoring
- boss phase orchestration
- blackboard-driven combat coordination

Keep it out of:

- save logic
- procedural generation
- UI state

### `Gaea`

Bring it in early as a worldgen dependency, but keep the integration boundary hard.

Use it through a narrow output contract:

- seed in
- graph resource selected
- generated arena data out

That output should resolve into project-owned data such as:

- walkable mask
- obstacle placements
- spawn anchors
- decoration anchors
- encounter tags
- surface zones and material masks

The runtime should consume generated data, not Gaea internals.

Important constraint:

- use `Gaea` to generate a combat board, not dramatic heightmap terrain
- prioritize readable open-board combat space, spawn fairness, and perimeter silhouette composition
- avoid solutions that require skyboxing or large-view horizon treatment

## Repository Management Recommendation

### `LimboAI`

Prefer:

- release artifact or precompiled GDExtension package pinned to a version compatible with Godot 4.6

Avoid initially:

- source checkout as the main integration path
- custom native build chain in the core repo

### `Gaea`

Prefer:

- vendoring only `addons/gaea`
- pinning the exact 4.6 fork commit we adopt
- contributing fixes upstream when we hit problems

Avoid:

- importing the entire fork repo as-is
- carrying over its development-only dependencies and tooling
- duplicating bundled `gdUnit4` copies from upstream

## Testing Implications

`gdUnit4` should validate both dependencies from the beginning.

Required test layers:

- unit tests for LimboAI custom tasks and state transitions
- component tests for AI-driven enemy scenes
- worldgen determinism tests for Gaea seed outputs
- regression fixtures for generated arenas

Specific rule for `Gaea`:

- generated results must be tested by stable output properties, not by visual inspection alone

Examples:

- same seed yields same walkable cell count
- same seed yields same number of spawn anchors
- obstacle density remains within defined bounds
- boss arena leaves a guaranteed safe radius
- board stays readable without vertical terrain gimmicks

## Order Of Operations

1. Keep `gd-plug` and `gdUnit4` as the baseline.
2. Integrate `LimboAI` as the first major gameplay dependency.
3. Integrate `Gaea` with strict worldgen determinism coverage and an explicit output contract.
4. Only after both prove out, start the real arena runtime and content pipeline.

## Working Rule

The reboot should be shaped around product needs first:

- holidaypunk tone
- replayable arena combat
- procedural variation that improves the game
- AI that produces readable enemy behavior

If an addon starts dictating architecture outside its bounded role, it should be constrained or removed.
