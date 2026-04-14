# Mobile Gap Audit

## Fixed In This Pass

- **Safe-area aware shell layout**
  Landing, progression, difficulty, pause, settings, boss HUD, end overlay, and transient overlays now place themselves inside the display safe area instead of assuming a roomy desktop rectangle.
- **Landscape-first phone support boundary**
  Compact phone portrait is no longer treated as a primary gameplay target. Narrow portrait now hard-stops behind a rotate gate, while large portrait remains reserved for tablet and unfolded-foldable widths.
- **Real multitouch separation**
  Movement and dash are no longer multiplexed through a single anonymous touch. The left-thumb movement drag can stay active while a second touch hits the right-side dash zone.
- **Consistent action geometry**
  The touch dash zone now uses the same safe-area-aware footprint as the visible dash button instead of a giant hardcoded bottom-right percentage block.
- **Landscape-phone visual capture lane**
  `test/e2e/capture_mobile_screenshots.gd` now captures the shipping handheld layout on a landscape phone viewport, with portrait kept as a large-screen exception instead of the main baseline.
- **Runtime quality tiers**
  Display preferences now drive live quality tiers for particles, damage-number density, enemy cap, screen shake, and minimap zoom instead of assuming one desktop budget.
- **Touch calibration/settings surface**
  Players can now swap handedness and tune joystick reach plus dash button size from the settings menu, with the visible overlay and hit zones updating live.
- **Aim-side auto-target affordance**
  Mobile runs now surface the active auto-fire lock with an on-board reticle, tether line, and label so target choice is legible during crowded waves.
- **Per-present touch doctrine**
  The active present now nudges joystick reach, dash footprint, dash verb, and lock language through a live touch doctrine instead of treating every loadout like the same operator.
- **Wide-phone deploy and decision layouts**
  Present select, difficulty, and level-up now use a wide handheld composition on phone-class landscape viewports instead of inheriting the narrow stacked portrait shell.
- **Safe-area regression matrix**
  Viewport profile tests now cover portrait notch/home-indicator and landscape notch overrides instead of assuming one default safe area.
- **Assertable mobile baseline guard**
  The handheld capture lane now has a committed baseline set plus a compare script with deterministic mobile capture setup and a tight render-jitter envelope, so visual regressions fail fast instead of relying only on manual artifact inspection.
- **CI-backed mobile visual gate**
  The handheld baseline guard now has a dedicated CI job with software-rendered display capture and screenshot artifact upload, so regressions stop at pull request time instead of depending on local discipline.
- **Display-session mobile touch e2e**
  A landscape-phone display e2e now walks through deploy flow, difficulty handoff, live left-thumb movement drag, and concurrent dash touch, then runs in the CI display lane instead of relying on manual handheld inspection.
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
- **Pause-time doctrine + pressure recap**
  The pause card now surfaces the active present/doctrine, dash verb, lock language, hostile pressure, and frame-budget rating so a resumed run does not dump the player back into the board with zero context.
- **Suspended-run checkpoint restore**
  Mobile app pause/back now writes a suspended-run checkpoint, the start screen surfaces a `RESUME VIGIL` action, and the restored run comes back on the same wave checkpoint with its progression, upgrades, cookies, and rewrap count intact.

## Remaining Product Gaps Versus A Truly Mobile-Optimized Arena Game

### Controls

- **No one-thumb accessibility mode**
  The game is now solid on two-thumb play, but it still assumes split move-plus-dash input instead of offering a genuinely one-thumb or hold-to-aim accessibility variant.

### UI / Readability

- **Still below the POC visual floor**
  The landscape phone shell now has the right board aspect and framed HUD language, but it is still not at the HTML POC's visual bar. Title framing is closer; combat HUD density, boss theatrics, and level-up card presence still need another pass.
- **No pause-surface targeting affordance jump**
  The recap now explains doctrine and pressure, but the pause card still does not let the player jump straight into settings slices like Touch or Display from the specific pressure it is surfacing.

### Performance

- **No device-backed budget baselines**
  Live frame telemetry exists in-session, but there are still no representative Android captures that say what stable/stressed/critical actually means on real hardware tiers.
- **PBR fallback is still opportunistic**
  Missing NAS-mounted textures silently degrade to flat colors in development, which is acceptable for local iteration but not a mobile shipping path.

### QA / Release Readiness

- **No Android hardware soak**
  Export preset exists, but there is no measured battery/thermal/session validation on representative devices.
- **Resume is checkpoint-grade, not exact-state**
  Suspended restore now preserves the run and wave context, but it still restarts from the wave checkpoint instead of reconstructing live enemies, pickups, and exact board pressure at the frame of interruption.

## Highest-Value Next Moves

1. Raise landscape phone combat, boss, and level-up presentation to the POC visual floor instead of treating the orientation cut as the finish line.
2. Run Android hardware soak with frame-budget notes and haptics/background-pause behavior instead of extrapolating from desktop captures.
3. Decide whether the checkpoint restore is the shipping bar or whether boss/pickup state needs a more exact suspended snapshot.
