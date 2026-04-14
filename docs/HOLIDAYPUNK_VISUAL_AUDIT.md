# Holidaypunk Visual Audit

## Canonical baseline

- `docs/reference/poc.html` is the visual floor.
- `docs/PRODUCTION_CHECKLIST.md` is the current release gate.
- When the Godot build and the POC disagree on feel, composition, or information density, the POC wins.
- The latest local `docs/reference/poc.html` should stay aligned with the user-supplied HTML reference, not drift behind the thread.

## What the POC gets right

### 1. The board reads as weather first, system second

- The arena is a snowy battlefield with visible drifts and atmosphere.
- Trails, threat lines, and the boss rail sit on top of that field.
- The player reads "winter combat board" before they read "UI scaffold."

### 2. Menace is theatrical

- HUD panels are explicit and legible, but the board still owns the frame.
- Boss presentation is centered and ceremonial rather than treated like another toolbar.
- Level-up feels like a moment, not a settings sheet.

### 3. Selection is card-first

- The POC presents character choice as a small set of strong cards.
- Each card exposes enough identity and combat read to pick quickly.
- Secondary details support the pick instead of replacing it.

### 4. Tone is holidaypunk, not just winter cyber

- Red, cyan, white, and gold are used like festive weaponry.
- The mood is dangerous and unruly, not sterile and glossy.
- The ideal mental image is not "cyber UI in snow." It is "a riot under the tree."

## Current Godot gaps

### 1. Board language still undersells the fantasy

- The board no longer reads as a black debug slab, but it still trends too clean and diagrammatic.
- The perimeter is more acceptable after moving off giant ice blocks, but it still needs more authored holiday menace and less repeating boundary geometry.
- Snowfall, drift weight, and combat trails still need to do more of the emotional work.

### 2. Present selection is improved, but not solved

- The preview now lives inside the selection layout instead of floating in the corner.
- The cards now expose deploy stats at a glance, which is closer to good mobile roguelike information density.
- The remaining problem is tone and hierarchy: the rail still feels like a utility chooser instead of a dangerous gift selection ritual.

### 3. Boss and level-up presentation are still below bar

- Wide-phone level-up now centers correctly, but it still feels like a lightweight overlay instead of a high-pressure reward beat.
- Boss threat presentation is still not theatrical enough; it needs stronger separation from the normal HUD state.
- The visual system still defaults to "functional overlay" too quickly.

### 4. Holidaypunk tokens are still too narrow

- Current UI and board language still lean toward cyan-on-dark control room aesthetics.
- Holidaypunk for this game should tolerate grime, punk styling, asymmetry, and mischief.
- The target is closer to "gift-wrap anarchy" than "clean neon winter ops."

## Mobile roguelike information rules

- One primary decision per screen.
- Cards must expose the choice in one glance: name, threat/use case, and locked/unlocked state.
- Secondary detail belongs in a dedicated sidecar, not scattered around the screen.
- The run board must remain readable while overlays are up.
- If a screen looks like tool configuration, it has already failed.

## Immediate next work

1. Raise present-select from "efficient" to "desirable" with stronger card identity and a more authored detail sidecar.
2. Push the board from "snowy enough" to "winter warzone" with better drift language, trail contrast, and perimeter dressing.
3. Rebuild boss and level-up presentation so they land like moments, not top-mounted utility bars.
4. Only refresh screenshot baselines once a state is at or above the POC floor for that moment.
