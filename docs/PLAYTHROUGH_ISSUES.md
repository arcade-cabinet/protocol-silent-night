# Protocol: Silent Night - Play-through Issues Diagnosis

**Date:** 2026-01-19
**Tested on:** GitHub Pages (https://arcade-cabinet.github.io/protocol-silent-night/)
**Method:** Chrome MCP automated testing + JavaScript instrumentation

## Critical Issues

### 1. Performance: ~8 FPS (Target: 60 FPS)
- **Severity:** CRITICAL
- **Impact:** Game is nearly unplayable
- **Cause:** Three.js rendering with many simultaneous objects (enemies, bullets, terrain)
- **Fix:** Migrate to BabylonJS with instanced rendering, or implement object pooling

### 2. Hit Detection Failure
- **Severity:** CRITICAL
- **Impact:** 70+ shots fired with 0 kills
- **Observed:** Bullets visually fire (cyan trail visible) but don't register hits
- **Possible causes:**
  - Collision detection not running at low FPS
  - Bullet speed too fast for frame-based collision
  - Hitbox misalignment between visual and collision geometry

### 3. Damage Intake Rate
- **Severity:** HIGH
- **Impact:** HP drains from 100 to 0 in ~10 seconds
- **Issue:** No invincibility frames after taking damage
- **Fix:** Add brief invincibility period, reduce enemy damage, or add knockback

## Major Issues

### 4. Tone.js Multiple Initialization
- **Severity:** MEDIUM
- **Impact:** Potential memory leak, audio issues
- **Observed:** `Tone.js v15.1.22` logged 4 times on page load
- **Fix:** Ensure audio context initialized only once

### 5. Visual Feedback Missing
- **Severity:** MEDIUM
- **Issues:**
  - No bullet impact effects
  - No hit confirmation (visual/audio)
  - Health bar doesn't flash on damage
  - Player character blends with terrain (green on blue/green)

### 6. Enemy Spawn Balance
- **Severity:** MEDIUM
- **Impact:** Overwhelming difficulty from start
- **Observed:** Enemies spawn everywhere simultaneously
- **Fix:** Implement wave-based spawning with gradual difficulty ramp

## UX Issues

### 7. Missing Aim Indicator
- No crosshair or aim direction feedback
- Player doesn't know where bullets will go

### 8. No Audio Feedback
- Firing sound may exist but no hit/miss differentiation
- No enemy death sound

### 9. Character Visibility
- CYBER-ELF (green) hard to see on blue/green terrain
- Recommend stronger character outline or glow effect

## Mobile/Architecture Issues

### 10. Missing BabylonJS GUI
- **Status:** NOT IMPLEMENTED
- HUD uses React Native overlays instead of `@babylonjs/gui`
- Causes z-index conflicts and performance overhead

### 11. Missing Reactylon
- **Status:** NOT IMPLEMENTED
- Not using reactylon for React-BabylonJS integration
- Current: Plain `@babylonjs/react-native`

### 12. No Touch Controls
- Web version keyboard-only (WASD/Space)
- Mobile needs virtual joystick (partially implemented but not connected)

## Recommendations

### Immediate Fixes (Before CD Release)
1. Fix hit detection - use continuous collision or swept AABB
2. Add invincibility frames (0.5s after damage)
3. Implement object pooling for bullets/enemies
4. Fix Tone.js singleton initialization

### Short-term (1.0 Release)
1. Migrate HUD to BabylonJS GUI
2. Add visual/audio feedback for all interactions
3. Implement wave-based enemy spawning
4. Add aim indicator

### Long-term (Post-1.0)
1. Full reactylon migration
2. Mobile-optimized shaders
3. LOD system for terrain
4. Network multiplayer support

## Test Metrics

| Metric | Observed | Target |
|--------|----------|--------|
| FPS | 8 | 60 |
| Load Time | ~2s | <1s |
| Hit Rate | 0% | >50% |
| Survival Time | ~10s | >60s |
| WebGL Version | 2.0 | 2.0 ✓ |
