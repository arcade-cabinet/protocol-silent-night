# North Star

## Reset

The previous codebase was discarded because it drifted away from the game:

- wrong tone: too much generic techno, not enough holidaypunk
- wrong complexity: workspace, apps split, and platform pivots without product value
- wrong source of truth: docs and code diverged from the playable POC

From this point forward, product truth comes from the playable POC first, then from the reference Godot project structure.

## Product Truth From The POC

`docs/reference/poc.html` defines the minimum viable game more honestly than any deleted roadmap.

It is:

- a touch-first, short-session survival arena game
- a 10-wave run with a boss encounter on wave 10
- three operator identities with distinct combat feel
- a present-driven XP loop with pause-and-pick upgrades
- a replayable arcade structure with class unlocks between runs
- a readable, stylized holiday combat game with strong HUD feedback

It is not:

- an open-ended RPG
- a systems-heavy ECS showcase
- a generic cyber-neon prototype with Christmas paint on top
- a monorepo problem

## Tone

The target tone is holidaypunk.

That means:

- festive iconography with menace and grit
- snow, presents, ornaments, workshop salvage, Krampus energy
- arcade clarity over visual noise
- strong red, icy cyan, white, gold, evergreen, and industrial black

That does not mean:

- full techno abstraction
- sterile sci-fi UI disconnected from the holiday fiction
- platform-first decisions replacing art direction

## Rebuild Guardrails

- Build for one runtime: Godot 4.6 Forward+
- Favor GDScript and Godot-native patterns over web stack translation
- Keep the first shipped slice small and replayable
- Preserve touch-first controls from the start
- Use declarations only where they reduce content churn
- Do not rebuild the deleted architecture under a new name

## Rebuild Success Criteria

The reboot is on track only if it can quickly reproduce these POC truths:

- choose a class and immediately start a run
- move cleanly on desktop and touch
- auto-fire into a readable enemy stream
- collect presents, level up, and choose upgrades
- clear waves, unlock Santa, defeat Krampus, unlock Bumble
- feel recognizably holidaypunk rather than generic techno
