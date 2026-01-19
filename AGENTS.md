# PROTOCOL: SILENT NIGHT // AGENT REGISTRY

**System Version:** 5.0 (Mobile-Native Edition)
**Target Runtime:** React Native + Expo + BabylonJS React Native (Reactylon)
**Classification:** Data-Driven Mobile Arcade RPG
**Architecture:** Monorepo with shared game-core, native GPU rendering, and JSON DDLs

> **⚠️ ARCHITECTURE PIVOT IN PROGRESS:** See `docs/VISION_1.0.md` and `.kiro/specs/` for migration plan.
> The v4.0 web-first architecture (Three.js/R3F) is being replaced with mobile-native BabylonJS.

---

## 📚 AGENT ONBOARDING

**All agents MUST read `memory-bank/` before starting work.**

```bash
# Required reading order
cat memory-bank/activeContext.md   # Current priorities
cat memory-bank/progress.md        # Work status
cat memory-bank/systemPatterns.md  # Architecture patterns
```

| Memory Bank File | When to Read |
|-----------------|--------------|
| `activeContext.md` | **Every session** - Current focus and blockers |
| `progress.md` | Continuing previous work |
| `projectbrief.md` | Understanding project goals |
| `productContext.md` | Feature implementation |
| `techContext.md` | Technology decisions |
| `systemPatterns.md` | Writing code |
| `codebaseSummary.md` | Finding files |

---

## 1. DATA-DRIVEN ARCHITECTURE (DDLs)

Protocol: Silent Night v4.0 has transitioned to a fully data-driven architecture. The simulation core is now content-agnostic, with all game entities, stats, and behaviors defined in JSON Data Definition Layers (DDLs).

### Core Data Verticals (`src/data/`)
- **`classes.json`**: Definitions for player characters, including Strata joint customizations and base stats.
- **`weapons.json`**: configurations for all weapons and evolutions.
- **`upgrades.json`**: Roguelike upgrade definitions with stat multipliers.
- **`enemies.json`**: Enemy stats and spawn configurations.
- **`audio.json`**: Procedural synth settings for music and SFX.
- **`themes.json`**: Environmental lighting and atmosphere presets.
- **`config.json`**: Global game constants.
- **`briefing.json`**: Centralized mission narrative data.

---

## 2. OPERATOR AGENTS (Player Classes)

Operators are now dynamically built using the `StrataCharacter` component, which interprets instructions from `classes.json`.

### Class Profiles (Default)
| Class | Role | Speed | HP | Weapon |
|-------|------|-------|----|--------|
| **MECHA-SANTA** | Heavy Siege / Tank | 9 | 300 | Coal Cannon |
| **CYBER-ELF** | Recon / Scout | 18 | 100 | Plasma SMG |
| **THE BUMBLE** | Crowd Control | 12 | 200 | Star Thrower |

**Customization Logic:**
- **Joint Scaling**: Non-uniform scaling of specific bones (hips, torso, head).
- **Geometric Attachments**: Adding primitives (cones, spheres, tori) to joints to build character features.
- **Fur System**: Dense white fur for Bumble, crimson suit trim for Santa, cyber-hair for Elf.

---

## 3. THREAT VECTORS (Enemy AI)

Hostile agents are controlled by the central Game loop using definition-aware behavior trees.

### Type 1: MINION (Grinch-Bot)
- **Spawn Logic**: Procedural radial spawn driven by `enemies.json` spawnConfig.
- **Behavior**: Smooth-rotation pursuit with knockback-on-contact.
- **Visuals**: Instanced rendering for maximum performance.

### Type 2: BOSS (Krampus-Prime)
- **Trigger**: Spawns after WAVE_REQ (10) eliminations.
- **Visuals**: Articulated `BossMesh` with phase-based emissive intensity.

---

## 4. PROGRESSION SYSTEMS

### Meta-Progression (Santa's Workshop)
- **Nice Points (NP)**: Earned through combat and streaks.
- **Unlocks**: Weapons, Skins, and Permanent stat upgrades.
- **Persistence**: Saved to `localStorage` via Zustand middleware.

### In-Run Progression (Roguelike)
- **XP System**: Kill-based experience with scaling curves.
- **Level-Up**: Pause-based choice between 3 weighted random upgrades.
- **Weapon Evolution**: Automatic transformation of base weapons at level 10 if criteria are met.

---

## 5. CHARACTER RENDERING (1.0 MIGRATION)

> **DEPRECATED:** @jbcom/strata is no longer maintained. See `.kiro/specs/1.0-procedural-characters.md`.

### Legacy (v4.x - Web)
```tsx
// DEPRECATED - Do not use
<StrataCharacter config={classes.santa} />
```

### Target (v5.0 - Mobile-Native)
```tsx
// Reactylon + BabylonJS procedural generation
<AnimeHero
  config={classes.santa}
  position={playerPosition}
  isMoving={true}
  isFiring={false}
/>
```

Key differences:
- **No external character library** - Procedural BabylonJS meshes
- **Lofted splines** - Smooth anime-style bodies, not primitive stacks
- **DynamicTexture faces** - Canvas-rendered anime eyes
- **Rigged skeletons** - Native bone animation support

---

## 6. PROJECT STRUCTURE

### Current (v4.x - Web-First)
```
src/
├── data/                   # JSON DDLs (The Source of Truth)
├── characters/             # Generic rendering brains
├── game/                   # Optimized game systems
├── store/                  # Unified State & Data Loading
└── ui/                     # Modular React interfaces
```

### Target (v5.0 - Mobile-Native Monorepo)
```
protocol-silent-night/
├── apps/
│   ├── mobile/             # React Native + Expo
│   │   ├── app/            # Expo Router pages
│   │   └── src/            # Mobile-specific code
│   └── web/                # Legacy (maintenance mode)
├── packages/
│   └── game-core/          # Shared DDLs and game logic
│       ├── data/           # JSON DDLs
│       ├── systems/        # Combat, progression, etc.
│       └── types/          # TypeScript types
├── .kiro/                  # Kiro specs and steering
└── docs/                   # Documentation
```

---

## 7. REFERENCE DOCUMENTS

| Document | Purpose |
|----------|---------|
| **`memory-bank/`** | **Multi-agent shared context (READ FIRST)** |
| `docs/VISION_1.0.md` | 1.0 release vision and architecture |
| `docs/TRIAGE_REPORT_2026-01.md` | Comprehensive triage and recommendations |
| `docs/MOBILE_ROADMAP.md` | Mobile-first feature requirements |
| `.kiro/specs/` | Implementation specifications |
| `.kiro/steering/` | Development guidelines |

---

## 8. AGENT ASSIGNMENTS

| Agent | Primary Role | Current Task |
|-------|--------------|--------------|
| **Claude Code** | Architecture, implementation | Memory bank setup, 1.0 foundation |
| **Jules** | Refactoring, multi-file changes | Available for procedural character work |
| **Cursor Cloud** | Long-running autonomous tasks | Standby |
| **Sage** | Quick explanations | On-demand |

### Handoff Protocol

When switching agents:
1. Update `memory-bank/activeContext.md` with current state
2. Update `memory-bank/progress.md` with completed work
3. Commit and push changes
4. Next agent reads memory-bank before starting

---

*Protocol: Silent Night - Transitioning to v5.0 Mobile-Native Edition*
