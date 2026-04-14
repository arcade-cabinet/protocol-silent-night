# Production Checklist

`docs/reference/poc.html` remains the visual floor. This checklist is the release gate for the first **Web + Android** production build.

## Release Contract

- HTML5 and Android exports both build cleanly from CI and release workflows.
- Meta progression persists: unlocks, achievements, cookies, coal, gear, and player preferences.
- Interrupted runs are **not** resumable for v1. The game may pause cleanly, but a killed/suspended run is lost.
- Boss-path production builds do not depend on a missing Krampus asset path.
- Release visuals do not depend on `/Volumes/home` being mounted.

## Visual / Brand Gate

- Front door, present select, difficulty handoff, level-up, boss, victory, results, scroll, and market all read as one holidaypunk product.
- The board reads as a winter warzone first, UI scaffold second.
- Present cards expose role, stats, lock state, and flavor in one glance.
- Boss and level-up moments are theatrical, not utility overlays.
- The current playable presents read clearly at gameplay scale and feel intentionally weird, lively, and hostile-to-boring.

## Acceptance Captures

- Mobile visual guard passes.
- Present factory capture passes for roster sheet and gameplay-scale showcase.
- Enemy showcase captures pass for silhouettes, posture, reactivity, telegraphs, threat marks, and projectile read.
- Updated baselines are committed only after the state is at or above the POC floor.

## Release Hardening

- Android hardware soak is run on representative hardware and notes are recorded.
- Web build is load-tested in browser for input, audio, and screenshot sanity.
- Android build is install-tested for input, audio, pause/background behavior, and progression persistence.
- CI, unit, component, display e2e, and visual guard all pass before release tagging.
