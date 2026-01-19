# Project Brief - Protocol: Silent Night

## Overview
Protocol: Silent Night is a premium mobile-native cyberpunk Christmas roguelike. Players pilot experimental combat mechs to defend the North Pole from KRAMPUS-PRIME and his Grinch-Bot army in the year 2084.

## Project Status
- **Version:** 1.0 (In Development)
- **Branch:** `release/1.0`
- **Architecture:** Monorepo with mobile-native focus
- **Target Release:** Q1 2026

## Core Identity
- **Genre:** Roguelike shooter with meta-progression
- **Theme:** Cyberpunk Christmas (dark humor meets holiday cheer)
- **Art Style:** Anime/JRPG inspired (FF7, DBZ, Ghost in the Shell)
- **Platform Focus:** iOS and Android native apps

## Goals
1. Ship a premium mobile game to App Store and Play Store
2. Achieve 60fps on flagship devices, 30fps stable on mid-tier
3. Complete offline-first experience with optional cloud sync
4. Data-driven architecture allowing content updates without code changes

## Non-Goals (v1.0)
- Desktop/web optimization
- Multiplayer
- In-app purchases
- Online leaderboards

## Key Stakeholders
- **Owner:** jbcom
- **AI Agents:** Claude Code, Jules, Cursor Cloud
- **Repository:** arcade-cabinet/protocol-silent-night

## Critical Dependencies
- React Native + Expo SDK 54+
- BabylonJS React Native (3D rendering)
- Zustand (state management)
- Tone.js (procedural audio)

## Known Blockers
- @jbcom/strata is DEPRECATED - must be replaced with procedural BabylonJS characters
- Original web-first architecture requires full migration to mobile-native

## Reference Documents
- `docs/VISION_1.0.md` - Complete 1.0 vision document
- `docs/TRIAGE_REPORT_2026-01.md` - GitHub triage results
- `.kiro/specs/` - Detailed technical specifications
- `AGENTS.md` - Agent instructions
