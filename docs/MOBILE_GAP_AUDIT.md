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
  The mobile screenshot guard now includes `Skate`, left-handed `Sightline`, and unlock-gated `Sweep` gameplay frames, so doctrine-specific action geometry and lock/readability states are visually pinned instead of only behavior-tested.
- **Unlock-backed sweep touch proof**
  The display lane now proves an actually unlocked `Sweep` run end to end, including unlock gating, the `JINK` dash verb, right-edge action geometry, and the doctrine-specific `SWEEP LOCK` callout instead of stopping at default-available presents.
- **Default skate touch proof**
  The display lane now proves the default `Skate` run end to end, including the `SLIDE` dash verb, right-edge action geometry, and the doctrine-specific `HUNT LOCK` callout. That closes the full doctrine set across breach, sightline, sweep, and skate.
- **Background-safe mobile session guard**
  Mobile play now auto-pauses on application suspend, focus loss, and Android back requests, while clearing stale touch state so a resumed run does not lurch or dash from frozen input.
- **Mobile haptics layer**
  Dash, damage, rewrap, level-up, boss-phase, and run-end beats now drive handheld vibration with a player-facing Touch-tab toggle instead of leaving mobile combat completely silent to the hands.

## Remaining Product Gaps Versus A Truly Mobile-Optimized Arena Game

### Controls

- **No one-thumb accessibility mode**
  The game is now solid on two-thumb play, but it still assumes split move-plus-dash input instead of offering a genuinely one-thumb or hold-to-aim accessibility variant.

### UI / Readability

- **No mid-run branch or threat recap on pause**
  The pause surface stops the action cleanly, but it still does not summarize doctrine, current lock behavior, or late-wave threat context the way a top-tier handheld survivor often does.

### Performance

- **No device-backed budget baselines**
  Live frame telemetry exists in-session, but there are still no representative Android captures that say what stable/stressed/critical actually means on real hardware tiers.
- **PBR fallback is still opportunistic**
  Missing NAS-mounted textures silently degrade to flat colors in development, which is acceptable for local iteration but not a mobile shipping path.

### QA / Release Readiness

- **No Android hardware soak**
  Export preset exists, but there is no measured battery/thermal/session validation on representative devices.
- **No mid-run restore after OS kill**
  Background pause is now safe, but a hard mobile process death still drops the current run instead of restoring back into the active session.

## Highest-Value Next Moves

1. Run Android hardware soak with frame-budget notes and haptics/background-pause behavior instead of extrapolating from desktop portrait captures.
2. Add true mid-run restore after OS kill so mobile interruption does not mean a lost session.
3. Expand the display-session touch matrix to more unlock-gated presents and left-handed variants beyond the now-covered doctrine set.
