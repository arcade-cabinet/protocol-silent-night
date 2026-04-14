# Mobile Roguelike Reference Patterns

## Source set

- [Brotato on the App Store](https://apps.apple.com/us/app/brotato/id6445884925)
- [Pickle Pete: Survivor on the App Store](https://apps.apple.com/us/app/pickle-pete-survivor/id6444362667)
- [Vampire Survivors on the App Store](https://apps.apple.com/us/app/vampire-survivors/id6444525702)

## What these games emphasize

### Brotato

- The official store copy stresses auto-firing by default, fast runs, dozens of characters, and items from the shop between waves.
- That means the game is framing the build loop as a compact sequence of quick, high-signal decisions rather than as a sprawling management screen.
- Inference: our present select and level-up surfaces should feel like fast deck picks, not configuration panels.

### Pickle Pete

- The official store copy stresses autofire, on-demand abilities, rich environments, a deep progression system, and super easy controls.
- That combination matters: expressive combat is allowed, but the control burden stays low and the build system remains legible.
- Inference: we can support dense stats and unlockables, but only if they collapse into a few obvious actions on each screen.

### Vampire Survivors

- The official store copy stresses minimalistic gameplay, landscape couch co-op, gold-driven meta progression, and touchscreen survival.
- The core read is simple even while the run snowballs.
- Inference: our board must remain the star, and every overlay has to justify the space it steals from the battlefield.

## Rules we should steal

1. One primary decision per screen.
2. Build identity must be obvious before the player reads the fine print.
3. Unlockables should scan as a compact card rail, not a spreadsheet.
4. The board should stay readable even during upgrades, bosses, and end-state overlays.
5. Mobile control simplicity is a feature, not an excuse for weak presentation.

## What this means for Protocol: Silent Night

1. Present select should prioritize one strong card rail plus one detail sidecar.
2. Level-up should read like ripping a weapon mod off the rack, not changing settings.
3. Boss state should become a centered encounter moment, not a second HUD stripe.
4. The mobile bar is not "responsive enough." It is "reads instantly while the board still matters."
