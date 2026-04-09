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
- Current project pin: `v1.7.0` (GDExtension, released 2026-03-01)
- Install method: vendored binary — `addons/limboai/` extracted from `limboai+v1.7.0.gdextension-4.6.zip`
- GDExtension manifest: `addons/limboai/bin/limboai.gdextension` (`compatibility_minimum = "4.2"`)
- Watch for:
  - New GDExtension releases compatible with Godot 4.6 (check `limboai+<ver>.gdextension-4.6.zip`)
  - Breaking changes to `BTTask`, `BehaviorTree`, `LimboHSM` API surface
  - Any Godot 4.6.x point release that breaks GDExtension ABI compatibility

## Review Log

### 2026-04-09

- `LimboAI` v1.7.0 installed as a prebuilt GDExtension targeting Godot 4.6.
  - Downloaded `limboai+v1.7.0.gdextension-4.6.zip` from GitHub releases.
  - Extracted to `addons/limboai/` — all-platform binaries included (macOS universal framework, Linux x86_64/arm64, Windows x86_64, Android, iOS, Web).
  - No `plugin.cfg` — it is a GDExtension, not an editor plugin; Godot loads it automatically via `addons/limboai/bin/limboai.gdextension`.
  - Smoke test: Godot 4.6.2 headless exits 0; no LimboAI load errors in output.
  - `plug.gd` updated with upgrade instructions and pin comment.

### 2026-04-07

- `Gaea` 4.6 line inspected and pinned to commit `4065f0fecf24c6b293d440bc6008d97139a0c5d8`.
- Upstream README still marks Gaea 2.0 as early development; project chooses to accept that risk because procedural generation is core to the product.
- `gdUnit4` remains pinned to `v6.1.2`.
- `LimboAI` confirmed as a strong Godot 4.6 candidate, but not yet integrated in this repo.
