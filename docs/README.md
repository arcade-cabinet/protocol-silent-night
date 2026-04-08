# Protocol: Silent Night

This repository is now intentionally docs-only.

The previous implementation was removed because it no longer matched the game. The useful artifacts left are:

- `docs/reference/poc.html`: the only playable, working expression of the core game loop
- `ashworth-manor` (external sibling repo): the structural reference for how the rebuild should be organized in Godot 4.6

## Read This First

1. `docs/reference/poc.html`
2. `docs/NORTH_STAR.md`
3. `docs/FOUNDATION_PLAN.md`
4. `docs/DEPENDENCY_POLICY.md`
5. `docs/DEPENDENCY_WATCH.md`
6. `docs/BOARD_GENERATION_CONTRACT.md`
7. `docs/MVP_SLICE.md`
8. `docs/GODOT_REBOOT.md`

## What This Repo Is For

- Preserve the actual game feel in a single playable file
- Define the minimum viable slice in concrete terms
- Document the rebuild direction without carrying forward dead architecture

## What This Repo Is Not For

- Maintaining the old BabylonJS / Expo / monorepo direction
- Pretending speculative architecture is product progress
- Expanding docs beyond what helps the next clean implementation
