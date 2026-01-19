# Codebase Summary - Protocol: Silent Night

## Repository Structure

```
protocol-silent-night/
├── apps/                        # Application packages
│   ├── mobile/                  # [NEW] Expo + BabylonJS RN app
│   │   ├── app/                # Expo Router pages
│   │   │   ├── _layout.tsx    # Root layout (dark theme)
│   │   │   ├── index.tsx      # Menu screen
│   │   │   ├── character-select.tsx
│   │   │   ├── game.tsx       # Main game scene
│   │   │   └── workshop.tsx   # Santa's Workshop
│   │   ├── components/        # React Native components
│   │   │   └── GameScene.tsx  # BabylonJS scene wrapper
│   │   ├── app.json           # Expo configuration
│   │   ├── package.json       # App dependencies
│   │   └── tsconfig.json
│   └── web/                    # [PLACEHOLDER] Legacy web version
│
├── packages/                    # Shared packages
│   └── game-core/              # [NEW] Platform-agnostic game logic
│       ├── src/
│       │   ├── data/          # JSON DDLs (migrated from src/data)
│       │   │   ├── classes.json
│       │   │   ├── weapons.json
│       │   │   ├── enemies.json
│       │   │   ├── upgrades.json
│       │   │   └── ...
│       │   ├── types/         # TypeScript definitions
│       │   │   └── index.ts   # All game types
│       │   └── index.ts       # Package exports
│       ├── package.json
│       └── tsconfig.json
│
├── src/                         # [LEGACY] Original web source
│   ├── __tests__/              # Jest/Vitest test suites
│   │   ├── unit/              # Unit tests
│   │   └── integration/       # Integration tests
│   ├── audio/                  # Tone.js audio system
│   ├── characters/            # Character components (strata-based)
│   ├── data/                  # [BEING MOVED] JSON DDLs
│   ├── game/                  # Game systems (Enemies, Bullets, etc.)
│   ├── shaders/               # WebGL shaders
│   ├── store/                 # Zustand game store
│   ├── types/                 # TypeScript definitions
│   └── ui/                    # React UI components
│
├── e2e/                        # Playwright E2E tests
├── docs/                       # Documentation
│   ├── VISION_1.0.md          # 1.0 release vision
│   ├── TRIAGE_REPORT_2026-01.md # GitHub triage results
│   └── ...
│
├── memory-bank/                # [NEW] Multi-agent context
│   ├── projectbrief.md        # Project overview
│   ├── productContext.md      # Product requirements
│   ├── techContext.md         # Technology stack
│   ├── systemPatterns.md      # Architecture patterns
│   ├── activeContext.md       # Current focus
│   ├── progress.md            # Work tracking
│   └── codebaseSummary.md     # This file
│
├── .kiro/                      # Kiro AI specifications
│   ├── specs/                 # Feature specifications
│   │   ├── 1.0-architecture-pivot.md
│   │   ├── 1.0-procedural-characters.md
│   │   └── 1.0-combat-effects.md
│   └── steering/              # Development guidelines
│       ├── product.md
│       ├── tech.md
│       └── code-style.md
│
├── .jules/                     # Jules agent learnings
│   ├── bolt.md               # Performance learnings
│   └── sentinel.md           # Security learnings
│
├── AGENTS.md                   # Agent registry and instructions
├── CLAUDE.md                   # Claude Code instructions
├── package.json                # Root package (dev scripts)
└── pnpm-workspace.yaml         # [NEW] Monorepo config
```

## Key Components

### Mobile App (`apps/mobile/`)

| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout with dark theme |
| `app/index.tsx` | Main menu screen |
| `app/character-select.tsx` | Class selection UI |
| `app/game.tsx` | Game screen with BabylonJS |
| `app/workshop.tsx` | Santa's Workshop (meta-progression) |
| `components/GameScene.tsx` | BabylonJS engine wrapper |

### Game Core (`packages/game-core/`)

| Directory | Purpose |
|-----------|---------|
| `data/` | JSON DDL files (game content) |
| `types/` | TypeScript type definitions |
| `systems/` | [TODO] Combat, progression logic |
| `schemas/` | [TODO] Zod validation schemas |

### Legacy Web (`src/`)

| Directory | Purpose | Migration Status |
|-----------|---------|-----------------|
| `data/` | DDLs | → game-core |
| `types/` | Types | → game-core |
| `store/` | Zustand | → game-core |
| `audio/` | Tone.js | Port to mobile |
| `game/` | Game systems | Port to mobile |
| `ui/` | React components | Rewrite for RN |
| `characters/` | @jbcom/strata | Replace completely |

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                    DDL Files                         │
│  (classes.json, weapons.json, enemies.json, etc.)   │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              game-core Loaders                       │
│         (TypeScript + Zod validation)               │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              Zustand Game Store                      │
│   (playerClass, enemies, bullets, progression)      │
└─────────────────────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│   BabylonJS      │           │   React Native   │
│   Scene          │           │   UI Components  │
│   (3D rendering) │           │   (HUD, menus)   │
└──────────────────┘           └──────────────────┘
```

## Test Structure

```
src/__tests__/
├── unit/
│   ├── ui/                    # UI component tests
│   │   ├── SantasWorkshop.test.tsx
│   │   ├── EndScreen.test.tsx
│   │   ├── HUD.test.tsx
│   │   └── ...
│   ├── game/                  # Game system tests
│   │   ├── Enemies.test.tsx
│   │   ├── Bullets.test.tsx
│   │   └── ...
│   ├── gameStore.test.ts      # Store unit tests
│   └── gameStore-entities.test.ts
└── integration/
    └── game-flow.test.ts      # Full game flow tests
```

## Important Files

| File | Why It Matters |
|------|----------------|
| `src/store/gameStore.ts` | Central game state (needs platform refactor) |
| `packages/game-core/src/data/classes.json` | Player character definitions |
| `packages/game-core/src/data/weapons.json` | Weapon configurations |
| `apps/mobile/components/GameScene.tsx` | BabylonJS scene entry point |
| `AGENTS.md` | Instructions for all AI agents |
| `memory-bank/activeContext.md` | Current priorities |

## Deprecated/Legacy

| Path | Reason | Action |
|------|--------|--------|
| `src/characters/StrataCharacter.tsx` | Uses @jbcom/strata | Delete after AnimeHero |
| Any Three.js imports | Web-only | Remove entirely |
| CSS Modules in ui/ | Web-only | Use StyleSheet |
