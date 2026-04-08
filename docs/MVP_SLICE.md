# Minimum Viable Slice

This is the implementation contract for the first clean rebuild. If a feature is not listed here, it is not part of MVP.

## Core Loop

1. Select one of the available operators.
2. Survive enemy waves inside a bounded arena.
3. Auto-fire at enemies within range.
4. Collect present drops for XP.
5. Pause for one-of-three upgrade choice on level-up.
6. Reach wave 10 and defeat Krampus-Prime.
7. Unlock new operators based on run progress.

## Operators

The three operators and their identity should be preserved:

- Cyber-Elf: fragile, very fast, rapid-fire stream weapon, default unlocked
- Mecha-Santa: durable shotgun bruiser, unlock at wave 5
- The Bumble: heavy projectile specialist, unlock on campaign clear

The exact implementation can evolve, but the feel cannot collapse into samey variants.

## Enemies

MVP enemy set:

- Grunt: baseline pressure unit
- Rusher: fragile fast attacker
- Tank: slow, high-health collision threat
- Krampus-Prime: wave 10 boss with clear health bar and ranged attack pattern

## Progression

MVP run progression:

- present drops grant XP
- each level-up offers 3 random upgrade cards
- upgrade pool includes damage, fire rate, health, speed, range, and aura
- level-up interrupts play long enough for a deliberate choice

MVP meta progression:

- save unlocked operators locally
- nothing more elaborate than that is required for the first slice

## Controls

MVP controls must work on both targets from day one:

- desktop: keyboard movement plus dash
- mobile: drag-to-move plus explicit dash button

Touch support is not optional or deferred.

## Presentation

MVP presentation requirements:

- gameboard fills the viewport like a mobile-first roguelike board
- no dependency on skyboxes or scenic horizon composition
- no requirement for heightmap-driven terrain
- readable HUD for HP, XP, wave, timer, kills, and boss HP
- strong hit feedback, damage numbers, drops, and wave banners
- holidaypunk palette and theming
- procedural or reactive audio that supports festive menace rather than generic EDM drift

Environment presentation should come primarily from:

- PBR material selection and layering
- decals and surface breakup
- obstacle silhouettes
- landmark props
- lighting and VFX accents

## Content Boundaries

Keep MVP intentionally small:

- one arena
- one full 10-wave campaign
- three operators
- four enemy types including the boss
- one save file for unlocks

Do not expand MVP with:

- open world structure
- inventory systems
- deep persistence layers
- complex quest logic
- multiple scenes worth of content before the arena loop feels right
- terrain systems built around hills, cliffs, or scenic verticality

## Acceptance Checks

MVP is only done when these are true:

- a fresh player can launch, choose Cyber-Elf, and complete a readable run
- reaching wave 5 unlocks Mecha-Santa in saved data
- clearing wave 10 unlocks The Bumble in saved data
- the boss fight is legible and winnable
- the game reads as holidaypunk in motion, not just in labels
