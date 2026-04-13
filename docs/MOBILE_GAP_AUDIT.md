# Mobile Gap Audit

## Fixed In This Pass

- **Safe-area aware shell layout**
  Landing, progression, difficulty, pause, settings, boss HUD, end overlay, and transient overlays now place themselves inside the display safe area instead of assuming a roomy desktop rectangle.
- **Real multitouch separation**
  Movement and dash are no longer multiplexed through a single anonymous touch. The left-thumb movement drag can stay active while a second touch hits the right-side dash zone.
- **Consistent action geometry**
  The touch dash zone now uses the same safe-area-aware footprint as the visible dash button instead of a giant hardcoded bottom-right percentage block.
- **Portrait visual capture lane**
  `test/e2e/capture_mobile_screenshots.gd` now captures `menu_mobile`, `gameplay_mobile`, `level_up_mobile`, `boss_mobile`, and `victory_mobile`.

## Remaining Product Gaps Versus A Truly Mobile-Optimized Arena Game

### Controls

- **No dedicated movement affordance tuning per operator**
  Dash cooldown, button feel, and thumb travel are still globally tuned instead of per-operator or per-weapon identity.
- **No aim-side affordance**
  Auto-fire is viable, but there is no mobile-facing threat lead, aim cone hint, or “why did that target get chosen” readability layer.
- **No touch calibration/settings surface**
  Players cannot tune joystick drag radius, dash button size, handedness, or vibration.

### UI / Readability

- **Start/loadout flow still scrolls rather than re-composing**
  The responsive shell is safer now, but the present select and difficulty flows still solve tight screens partly with scrolling instead of a cleaner phone-native composition.
- **Level-up cards are stacked, not re-authored**
  Mobile can read and use them, but the card composition is still the desktop card system adapted down rather than designed for thumb-speed decision making.
- **No explicit notch/home-indicator regression tests**
  Safe-area code exists now, but there is no automated matrix across notch/no-notch landscape and portrait targets.

### Performance

- **No device-tier quality scaling**
  There is still no runtime quality tiering for particles, shadow quality, material complexity, or damage-number density by device class.
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

1. Add a mobile-only composition pass for present select and level-up so those screens stop relying on scroll as the safety valve.
2. Add runtime quality tiers tied to device class and expose them in settings.
3. Run `capture_mobile_screenshots.gd` as part of the visual verification ritual and commit the resulting reference set.
