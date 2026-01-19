# Protocol: Silent Night - Comprehensive Triage Report
**Date:** 2026-01-16
**Prepared for:** 1.0 Release Planning
**Status:** CRITICAL ARCHITECTURAL PIVOT REQUIRED

---

## Executive Summary

Protocol: Silent Night has solid game mechanics and a complete DDL architecture, but the current stack **CANNOT deliver a viable mobile-first 1.0 release**. The project claims to be "mobile-first" but is built with web-only technology (Vite + Three.js/R3F) that will NEVER perform well as a true mobile game.

**Critical Blockers:**
1. `@jbcom/strata` dependency is **DEPRECATED** (flagged in multiple maintenance reports)
2. Current architecture (Vite + R3F) is **NOT mobile-native** - PWA/Capacitor wrapping is a dead end
3. **23 open PRs** with significant chaos (duplicates, conflicts, blocked syncs)
4. No `.kiro` directory despite agentic doc references

**Recommendation:** Complete architectural pivot to **React Native + Expo + BabylonJS React Native (Reactylon)** following patterns from `wheres-ball-though` and strategies from `neo-tokyo-rival-academies`.

---

## GitHub Status

### Issues (14 Open)

| # | Title | Type | Priority | Action |
|---|-------|------|----------|--------|
| 93 | synthesis-pr-80: SantasWorkshop a11y | PR Synthesis | Medium | Merge PR #80 |
| 91 | Weekly Maintenance 2026-01-11 | Maintenance | HIGH | Contains critical @jbcom/strata deprecation |
| 89 | synthesis-pr-86: biome bump | PR Synthesis | Low | Merge PR #86 |
| 88 | synthesis-pr-85: vite bump | PR Synthesis | Low | Merge PR #85 |
| 87 | synthesis-pr-84: happy-dom bump | PR Synthesis | Low | Merge PR #84 |
| 83 | synthesis-pr-82: control-center sync | PR Synthesis | HIGH | BLOCKED - 77 reviews, 18 critical |
| 81 | Weekly Maintenance 2026-01-04 | Maintenance | Duplicate | Close - superceded by #91 |
| 71 | Monthly Assessment 2026-01 | Assessment | Low | Keep for reference |
| 67 | synthesis-pr-65: github-actions | PR Synthesis | Medium | REVIEW needed |
| 66 | synthesis-pr-64: react-three/fiber | PR Synthesis | OBSOLETE | Will not matter after pivot |
| 62 | synthesis-pr-49: security/data integrity | PR Synthesis | BLOCKED | Critical feedback unaddressed |
| 61 | synthesis-pr-60: Phase 3 content | PR Synthesis | BLOCKED | Critical feedback unaddressed |
| 58 | synthesis-pr-45: CI pnpm fix | PR Synthesis | Low | Merge PR #45 |
| 56 | synthesis-pr-55: restore project | PR Synthesis | Low | Merge PR #55 |

### PRs (23 Open)

**IMMEDIATE MERGE (Ready, No Conflicts):**
- #86: Bump @biomejs/biome 2.3.10 → 2.3.11
- #85: Bump vite 7.3.0 → 7.3.1
- #84: Bump happy-dom 20.0.11 → 20.1.0
- #80: SantasWorkshop accessibility improvements
- #69: Palette accessibility fix
- #58 (PR #45): CI pnpm version fix
- #56 (PR #55): Restore project structure

**CLOSE AS DUPLICATE (Jules created multiple attempts):**
- #95: Refactor SantasWorkshop accessibility (duplicate of #80)
- #94: Refactor SantasWorkshop accessibility (duplicate of #80)
- #90: Refactor Vite bump (duplicate of #85)
- #79: Refactor SantasWorkshop accessibility (duplicate of #80)
- #78: Palette accessibility (older version of #69)
- #74: Palette UX improvements (duplicate)
- #48: Accessible tabs (superseded by #80)

**NEEDS REBASE (Conflicting):**
- #65: GitHub Actions group bump
- #64: @react-three/fiber 9.4.2 → 9.5.0 (OBSOLETE after pivot)
- #46: Local storage integrity (important, but needs rebase)
- #38: CSP enhancement

**REQUIRES REVIEW:**
- #82: Control-center sync - BLOCKED with 18 critical issues
- #77: Bolt UI optimization
- #76: CI win condition fix
- #75: Sentinel secure movement
- #73: Bolt enemies re-render
- #70: SeededRandom crypto entropy
- #68: Bolt enemy damage performance

---

## Critical Issues Identified

### 1. @jbcom/strata DEPRECATED (SEVERITY: CRITICAL)

**Impact:** Build will fail or become unsupported
**Current Usage:** Core character rendering system
**Required Action:** Replace with BabylonJS procedural generation (per neo-tokyo strategies)

From maintenance reports:
> "Package is deprecated - needs investigation"

### 2. Architecture Fundamentally Wrong for Mobile-First

**Current Stack:**
- Vite (web bundler)
- Three.js / React Three Fiber (web-only 3D)
- Web-first with PWA aspirations

**Problem:** The MOBILE_ROADMAP.md says "mobile-first" but the architecture says "web game with mobile aspirations". Capacitor/PWA wrapping of WebGL games produces:
- Poor performance on mid-tier devices
- Battery drain
- No access to native performance APIs
- Inferior user experience vs native

**Solution:** Migrate to React Native + Expo + BabylonJS React Native

### 3. PR Chaos from AI Agents

Jules has created **11+ duplicate PRs** attempting to fix the same SantasWorkshop accessibility issue:
- #95, #94, #90, #80, #79, #78, #74, #48...

This indicates:
- No coordination between agent runs
- Missing context for what's already been attempted
- Need for better agentic steering (.kiro)

### 4. Missing .kiro Directory

Referenced in CLAUDE.md and AGENTS.md but doesn't exist:
```
/Users/jbogaty/src/arcade-cabinet/protocol-silent-night/.kiro/  # NOT FOUND
```

---

## Reference Project Analysis

### wheres-ball-though (React Native Pattern)

**Key Learnings:**
- pnpm monorepo: `apps/mobile/` (Expo/RN), `apps/web/` (Vite/Ionic)
- Expo Router for file-based navigation
- @shopify/react-native-skia for GPU-accelerated 2D
- react-native-reanimated for native-thread animations
- Zustand + TanStack Query split (local vs remote state)
- Design token system supporting multiple rendering contexts

**Applicable to Protocol: Silent Night:**
- Same monorepo pattern
- Same state management approach
- Same design token philosophy
- Different 3D renderer (Skia → BabylonJS)

### neo-tokyo-rival-academies BabylonJS Strategies

**Key Learnings:**
- Isometric diorama creation with locked camera
- Procedural anime character generation (replaces @jbcom/strata!)
- Anime-style combat that "hides the toy smash problem"
- BabylonJS Navigation Plugin V2 for enemy AI
- 2D JRPG HUD overlays
- **Reactylon** for declarative BabylonJS in React

**Directly Applicable:**
- Procedural `AnimeHero` class with:
  - Gender morphing
  - Muscle sliders
  - Dynamic face texture
  - Rigged limbs
- Anime combat effects (explosions, screen shake, knockback)
- JRPG HUD (HP/MP bars, command menus, damage popups)

### BabylonJS React Native

**Platform Support:**
- iOS (Metal)
- Android (OpenGL)
- Windows (DirectX)
- XR devices (OpenXR)

**Key Advantage:** True native rendering, not WebView-wrapped WebGL

---

## 1.0 Release Vision

### What Protocol: Silent Night 1.0 MUST Be

1. **True Mobile-Native Game** - Not a PWA, not Capacitor-wrapped
2. **60fps on Mid-Tier Devices** - iPhone SE, Pixel 7, budget Androids
3. **Installable via App Stores** - Real iOS/Android apps
4. **Offline-First** - Full game works without network
5. **Battery Efficient** - < 15% drain per 30min session
6. **Premium Feel** - Haptics, smooth animations, responsive controls

### Tech Stack for 1.0

| Layer | Current (Wrong) | Target (Right) |
|-------|-----------------|----------------|
| **Platform** | Vite web | React Native + Expo |
| **3D Engine** | Three.js/R3F | BabylonJS React Native (Reactylon) |
| **Characters** | @jbcom/strata | Procedural BabylonJS (per neo-tokyo patterns) |
| **State** | Zustand | Zustand (keep) |
| **Audio** | Tone.js | Tone.js (keep) |
| **Build** | Vite | Expo/EAS Build |
| **Distribution** | PWA/Capacitor | App Store / Play Store |

### What Stays vs What Changes

**KEEP (Port to New Stack):**
- DDL Architecture (`src/data/*.json`) - This is the game's soul
- Game logic (combat, progression, roguelike systems)
- Zustand store structure
- Tone.js audio synthesis
- All game design/balancing work

**REPLACE:**
- Three.js/R3F → BabylonJS + Reactylon
- @jbcom/strata → Procedural BabylonJS characters
- Vite → Expo/EAS Build
- CSS Modules → NativeWind/StyleSheet

**ADD:**
- React Native navigation (Expo Router)
- Native haptics (expo-haptics)
- Native device APIs
- EAS Build configuration
- .kiro specs and steering

---

## Recommended Actions

### Phase 0: Clean Up (This Week)

1. **Merge Ready PRs:**
   - #86, #85, #84, #80, #69, #45, #55

2. **Close Duplicate PRs:**
   - #95, #94, #90, #79, #78, #74, #48

3. **Rebase Conflicting PRs:**
   - #65, #46, #38 (if still relevant after pivot)

4. **Close Obsolete Issues:**
   - #81 (duplicate maintenance report)

5. **Address PR #82 (Control Center Sync):**
   - Review 18 critical issues
   - Either fix or close with explanation

### Phase 1: Architecture Pivot (2-3 weeks)

1. **Create `release/1.0` branch** from cleaned main

2. **Set up React Native + Expo structure:**
   ```
   protocol-silent-night/
     apps/
       mobile/     # Expo/React Native
       web/        # Legacy web version (maintenance mode)
     packages/
       game-core/  # DDLs, game logic, shared code
   ```

3. **Integrate BabylonJS React Native:**
   - Set up Reactylon
   - Port isometric camera setup
   - Implement procedural character system (replace strata)

4. **Port game systems:**
   - DDL loaders
   - Combat mechanics
   - Progression systems
   - Audio

### Phase 2: Polish & Test (2 weeks)

1. Mobile controls optimization
2. Performance profiling on target devices
3. EAS Build configuration
4. Haptic feedback implementation
5. Platform-specific testing

### Phase 3: Release (1 week)

1. App Store submission
2. Play Store submission
3. Documentation update
4. Marketing assets

---

## Success Criteria for 1.0

| Metric | Target |
|--------|--------|
| Frame Rate (flagship) | 60fps stable |
| Frame Rate (mid-tier) | 30fps stable |
| Load Time | < 3 seconds |
| App Size | < 100MB |
| Battery (30min) | < 15% drain |
| Touch Latency | < 100ms |
| Crash Rate | < 0.1% |

---

## Conclusion

Protocol: Silent Night has excellent game design, solid DDL architecture, and a compelling theme. However, it is currently built on the wrong foundation for its stated goal of being a "mobile-first" experience.

The path to a successful 1.0 release requires an architectural pivot to React Native + BabylonJS React Native. This is not a failure - it's recognition that the mobile gaming landscape has evolved and web-wrapped games cannot compete with native experiences.

The DDL architecture means the game's soul (mechanics, content, progression) can be preserved while the rendering and platform layers are replaced. The patterns from `wheres-ball-though` and strategies from `neo-tokyo-rival-academies` provide a clear blueprint.

**Next Step:** Create `release/1.0` branch and begin Phase 1 architectural work.

---

*Report generated by Claude Code - Comprehensive Project Triage*
