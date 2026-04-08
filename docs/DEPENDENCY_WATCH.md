# Dependency Watch

This file is the standing record for upstream monitoring. It is not an upgrade queue.

## Watch Rules

- Check upstream when doing dependency work, architecture work, or before any upgrade discussion.
- Record notable findings here.
- Do not change pins just because new upstream activity exists.

## Current Watch Targets

### `Gaea`

- Upstream: `https://github.com/BenjaTK/gaea-fork`
- Tracked line: `4.6`
- Current project pin: `4065f0fecf24c6b293d440bc6008d97139a0c5d8`
- Watch for:
- Godot 4.6 compatibility changes
- graph stability and generation regressions
- serialization or resource format changes
- performance improvements relevant to large procedural arenas

### `gdUnit4`

- Upstream: `https://github.com/MikeSchulze/gdUnit4`
- Current project pin: `v6.1.2`
- Watch for:
- Godot 4.6 fixes
- CLI runner changes
- regression fixes affecting headless test flows

### `LimboAI`

- Upstream: `https://github.com/limbonaut/limboai`
- Status: not yet pinned in this repo
- Watch for:
- Godot 4.6 release compatibility
- prebuilt GDExtension availability
- behavior tree and HSM stability relevant to arcade enemy AI

## Review Log

### 2026-04-07

- `Gaea` 4.6 line inspected and pinned to commit `4065f0fecf24c6b293d440bc6008d97139a0c5d8`.
- Upstream README still marks Gaea 2.0 as early development; project chooses to accept that risk because procedural generation is core to the product.
- `gdUnit4` remains pinned to `v6.1.2`.
- `LimboAI` confirmed as a strong Godot 4.6 candidate, but not yet integrated in this repo.
