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
- **Safe-area regression matrix**
  Viewport profile tests now cover portrait notch/home-indicator and landscape notch overrides instead of assuming one default safe area.
- **Assertable mobile baseline guard**
  Portrait capture now has a committed baseline set plus a compare script with deterministic mobile capture setup and a tight render-jitter envelope, so mobile visuals can fail fast instead of relying only on manual artifact inspection.
- **CI-backed mobile visual gate**
  The portrait baseline guard now has a dedicated CI job with software-rendered display capture and screenshot artifact upload, so regressions stop at pull request time instead of depending on local discipline.
- **Display-session mobile touch e2e**
  A portrait windowed e2e now walks through deploy flow, difficulty handoff, live left-thumb movement drag, and concurrent dash touch, then runs in the CI display lane instead of relying on manual handheld inspection.
- **Doctrine + handedness touch proof**
  The display lane now also proves a left-handed `Sightline` run, including left-edge dash geometry, the `STEP` dash verb, and the doctrine-specific lock callout instead of only validating the default breach-style striker lane.
- **Doctrine-specific portrait visual baselines**
  The mobile screenshot guard now includes left-handed `Sightline` and unlock-gated `Sweep` gameplay frames, so doctrine-specific action geometry and lock/readability states are visually pinned instead of only behavior-tested.

## Remaining Product Gaps Versus A Truly Mobile-Optimized Arena Game

### Controls

### UI / Readability

### Performance

- **No mobile frame budget instrumentation**
  Enemy cap exists, but there is no tracked GPU/CPU budget or frame-time telemetry on actual Android hardware.
- **PBR fallback is still opportunistic**
  Missing NAS-mounted textures silently degrade to flat colors in development, which is acceptable for local iteration but not a mobile shipping path.

### QA / Release Readiness

- **No Android hardware soak**
  Export preset exists, but there is no measured battery/thermal/session validation on representative devices.

## Highest-Value Next Moves

1. Run Android hardware soak with frame-budget notes instead of extrapolating from desktop portrait captures.
2. Add operator-specific touch/readability soak for the remaining doctrine lanes beyond the current breach, sightline, and sweep coverage.
3. Turn the display-session touch e2e into a wider matrix that covers more unlock-gated presents instead of stopping at one unlock-backed sweep path.
