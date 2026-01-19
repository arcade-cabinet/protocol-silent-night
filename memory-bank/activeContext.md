# Active Context - Protocol: Silent Night

> **Last Updated:** 2026-01-16
> **Current Branch:** `release/1.0`
> **Phase:** Foundation (Phase 1 of 4)

## Current Focus

**Architecture Migration: Web → Mobile-Native**

The project is undergoing a complete architectural pivot from web-first (Vite + Three.js/R3F) to mobile-native (React Native + Expo + BabylonJS).

## Immediate Priorities

### P0 - Must Complete This Week
1. **Test BabylonJS on Device**
   - Run `pnpm dev:mobile` and test on real iOS/Android device
   - Verify basic scene renders at 60fps
   - File: `apps/mobile/components/GameScene.tsx`

2. **Complete game-core Package**
   - Build TypeScript DDL loaders
   - Add Zod validation schemas
   - Export from `packages/game-core/src/index.ts`

### P1 - Complete This Sprint
3. **Port Isometric Camera**
   - Create isometric camera hook for BabylonJS
   - Match existing FF7-style angle and zoom

4. **Implement Procedural Character Base**
   - Replace @jbcom/strata with BabylonJS lofted splines
   - File to create: `apps/mobile/src/characters/AnimeHero.tsx`
   - Reference: `.kiro/specs/1.0-procedural-characters.md`

### P2 - Nice to Have
5. **Add Zod to game-core**
6. **Configure EAS Build profiles**

## Active Decisions

### Decided
- ✅ Use BabylonJS React Native (not Three.js)
- ✅ Use Expo SDK 52+ with New Architecture
- ✅ Monorepo structure with pnpm workspaces
- ✅ Preserve all JSON DDLs unchanged
- ✅ No Capacitor/Cordova ever

### Open Questions
- ❓ Reactylon vs. raw BabylonJS JSX for scene components
- ❓ Jest vs. Vitest for mobile testing
- ❓ How to handle Tone.js in React Native context

## Recent Changes

### 2026-01-16
- Closed all 23 open PRs (architecture pivot makes most obsolete)
- Fixed failing tests (EndScreen, SantasWorkshop, game-flow)
- Created monorepo structure (`apps/mobile`, `packages/game-core`)
- Set up Expo app shell with basic screens
- Created `.kiro/` specs and steering documents
- Created this memory-bank for multi-agent collaboration
- Pushed to `release/1.0` branch

### Key Commits
- `a9fd1fe` - fix(ui,tests): Fix accessibility and test failures
- `858e7d4` - feat(arch): Initialize monorepo structure for 1.0

## Blocked Items

| Item | Blocker | Owner |
|------|---------|-------|
| EAS Build | Need to run `eas init` | Human |
| iOS Testing | Need physical device or Mac | Human |
| App Store | Need developer account | Human |

## Agent Assignments

| Agent | Current Task | Status |
|-------|--------------|--------|
| Claude Code | Memory bank setup, architecture | Active |
| Jules | Available for refactoring | Standby |
| Cursor Cloud | Available for long-running | Standby |

## Files to Touch Next

1. `packages/game-core/src/systems/` - Create system loaders
2. `packages/game-core/src/schemas/` - Add Zod validation
3. `apps/mobile/src/scenes/DioramaScene.tsx` - Main game scene
4. `apps/mobile/eas.json` - EAS Build configuration

## Do Not Touch

- `apps/web/` - Legacy, maintenance mode only
- Original `src/` - Will be deprecated after migration
- Any Three.js files - Being replaced, not modified
