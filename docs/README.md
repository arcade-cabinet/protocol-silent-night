# Protocol: Silent Night

A holidaypunk roguelike survival arena built in Godot 4.6. You play as one of 25-50 anthropomorphic present characters, surviving infinite waves of increasingly hostile holiday horrors on a procedurally generated combat board.

## Current State

The Godot 4.6 reboot is live with a working game loop:
- Arena board generation with snow drifts and outer ridge
- Pixel art billboard sprites for all actors
- WASD + touch controls with dash mechanic
- Auto-fire combat with projectiles, pickups, and upgrades
- 10-wave campaign with Krampus-Prime boss encounter
- Save/load persistence for character unlocks
- Full test coverage (unit, component, E2E)

## Read This First

1. [docs/reference/poc.html](reference/poc.html) — the playable POC (browser, game feel truth)
2. [docs/NORTH_STAR.md](NORTH_STAR.md) — product vision and guardrails
3. [docs/FOUNDATION_PLAN.md](FOUNDATION_PLAN.md) — dependency strategy
4. [docs/BOARD_GENERATION_CONTRACT.md](BOARD_GENERATION_CONTRACT.md) — arena generation rules
5. [docs/MVP_SLICE.md](MVP_SLICE.md) — minimum viable feature set
6. [docs/GODOT_REBOOT.md](GODOT_REBOOT.md) — structural reference
7. [docs/DEPENDENCY_POLICY.md](DEPENDENCY_POLICY.md) — upgrade firewall
8. [docs/DEPENDENCY_WATCH.md](DEPENDENCY_WATCH.md) — upstream monitoring

## Design Principles

- **Death is the game.** Difficulty scales superlinearly. Every run ends in being overwhelmed.
- **Presents are protagonists.** Anthropomorphic gift boxes with arms, faces, and ridiculous weapons.
- **Waves are formula-driven.** PRNG-seeded generation, not static tables. Level is a force multiplier.
- **Holidaypunk is non-negotiable.** Festive menace, not generic techno or cute Christmas.
