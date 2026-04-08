# Dependency Policy

This repo accepts strategic dependency risk, but it does not accept unbounded dependency drift.

## Current Pinned Dependencies

### `gdUnit4`

- Source: `MikeSchulze/gdUnit4`
- Pin type: tag
- Pin: `v6.1.2`
- Reason: known Godot 4.6-compatible test framework baseline

### `Gaea`

- Source: `BenjaTK/gaea-fork`
- Source line: `4.6`
- Pin type: commit
- Pin: `4065f0fecf24c6b293d440bc6008d97139a0c5d8`
- Reason: procedural generation is core to holidaypunk identity, but upstream movement must never change our foundation implicitly

### `LimboAI`

- Status: planned early dependency
- Policy: pin to a Godot 4.6-compatible release artifact or exact build once integrated

## Upgrade Firewall

No dependency may be upgraded just because upstream changed.

Upgrade only when all of the following are true:

- the change is intentionally reviewed
- compatibility with Godot 4.6 is confirmed
- project tests pass
- any changed behavior is understood and documented
- the user explicitly wants the upgrade or it is required for a blocker

## `Gaea` Risk Acceptance

We are accepting `Gaea` risk on purpose because:

- holidaypunk requires procedural spatial language we are unlikely to source from asset packs
- terrain, topology, landmarking, and prop layout are part of the product
- a graph-driven worldgen tool gives us leverage we would otherwise have to build ourselves

The firewall is:

- exact commit pin
- narrow integration boundary
- deterministic tests
- no automatic upgrades
- upstream contribution when fixes are needed

## `Gaea` Boundary

`Gaea` may own:

- generation graphs
- intermediate terrain and layout logic
- editor tooling for generation authoring

`Gaea` may not own:

- combat rules
- progression rules
- save logic
- mission flow
- core runtime orchestration

The game runtime should consume project-owned generated outputs such as:

- walkable masks
- spawn anchors
- obstacle placements
- decoration anchors
- encounter tags
- surface/material zones

This policy assumes a flat or low-relief roguelike board by default.

`Gaea` is here to improve board generation, composition, and environmental identity.
It is not here to force the project into a heightmap-terrain problem if that is not the game.

## Contribution Policy

If we hit `Gaea` issues:

- isolate the bug or limitation clearly
- document the local impact
- prefer a clean upstream contribution over carrying a silent local divergence
- advance the pin only after the change is validated here

If upstream goes in a direction we do not want:

- do not upgrade
- keep the current pin
- patch locally only when necessary and document the divergence

## Agent Rule

Any agent touching dependencies must read:

- `docs/FOUNDATION_PLAN.md`
- `docs/DEPENDENCY_POLICY.md`
- `docs/DEPENDENCY_WATCH.md`

Agents must not upgrade `Gaea` or `gdUnit4` casually.
