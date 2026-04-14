# Mobile Gap Audit

## Fixed In This Pass

- **Safe-area aware shell layout**
  Landing, progression, difficulty, pause, settings, boss HUD, end overlay, and transient overlays now place themselves inside the display safe area instead of assuming a roomy desktop rectangle.
- **Real multitouch separation**
  Movement and dash are no longer multiplexed through a single anonymous touch. The left-thumb movement drag can stay active while a second touch hits the right-side dash zone.
- **Consistent action geometry**
  The touch dash zone now uses the same safe-area-aware footprint as the visible dash button instead of a giant hardcoded bottom-right percentage block.
- **Portrait visual capture lane**
  `test/e2e/capture_mobile_screenshots.gd` now captures `menu_mobile`, `present_select_mobile`, `difficulty_mobile`, `gameplay_mobile`, `level_up_mobile`, `boss_mobile`, and `victory_mobile`.
- **Runtime quality tiers**
  Display preferences now drive live quality tiers for particles, damage-number density, enemy cap, screen shake, and minimap zoom instead of assuming one desktop budget.
- **Touch calibration/settings surface**
  Players can now swap handedness and tune joystick reach plus dash button size from the settings menu, with the visible overlay and hit zones updating live.
- **Aim-side auto-target affordance**
  Mobile runs now surface the active auto-fire lock with an on-board reticle, tether line, and label so target choice is legible during crowded waves.
- **Per-present touch doctrine**
  The active present now nudges joystick reach, dash footprint, dash verb, and lock language through a live touch doctrine instead of treating every loadout like the same operator.
- **Phone-native level-up sheet**
  The level-up overlay now rises as a centered mobile decision sheet with authored upgrade cards instead of pinning a desktop-style stack to the top edge.
- **Phone-native present-select rail**
  The present-select screen now spends portrait height on the active loadout rail instead of nesting the whole screen inside an outer mobile scroll wrapper.
- **Phone-native difficulty handoff**
  Difficulty now comes up as a present-aware mobile decision rail instead of a generic full-screen desktop grid.

## Remaining Product Gaps Versus A Truly Mobile-Optimized Arena Game

### Controls

### UI / Readability

- **No explicit notch/home-indicator regression tests**
  Safe-area code exists now, but there is no automated matrix across notch/no-notch landscape and portrait targets.

### Performance

- **No mobile frame budget instrumentation**
  Enemy cap exists, but there is no tracked GPU/CPU budget or frame-time telemetry on actual Android hardware.
- **PBR fallback is still opportunistic**
  Missing NAS-mounted textures silently degrade to flat colors in development, which is acceptable for local iteration but not a mobile shipping path.

### QA / Release Readiness

- **Portrait screenshot batch is additive, not yet CI-enforced**
  The capture lane exists, but it is not yet wired into a recurring regression ritual or artifact comparison workflow.
- **No touch-flow e2e on a real display**
  Current automated tests prove control logic and scene boot, but they still do not synthesize an end-to-end on-screen touch run in a non-headless display session.
- **No Android hardware soak**
  Export preset exists, but there is no measured battery/thermal/session validation on representative devices.

## Highest-Value Next Moves

1. Add notch/home-indicator regression coverage across portrait safe-area variants instead of relying on one iPhone-sized capture.
2. Turn the portrait screenshot ritual into an assertable baseline workflow instead of an additive artifact dump.
3. Add a real touch-flow display-session e2e so the whole mobile deploy path is exercised without hand inspection.
