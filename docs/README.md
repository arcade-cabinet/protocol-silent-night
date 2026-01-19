# Protocol: Silent Night - Documentation

> **A cyberpunk Christmas roguelike for mobile-native platforms**

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture Vision](./architecture/VISION_1.0.md) | 1.0 release goals, tech stack, core pillars |
| [Game Design](./design/META_PROGRESSION_DESIGN.md) | Meta-progression, currencies, unlockables |
| [Player Guide](./guides/GAME_MANUAL.md) | How to play, controls, characters |
| [Development Status](./development/IMPLEMENTATION_STATUS.md) | Current implementation progress |

---

## Documentation Structure

```
docs/
├── README.md                    # This file (documentation index)
├── design/                      # Game & System Design
│   └── META_PROGRESSION_DESIGN.md  # Meta-progression mechanics
├── architecture/                # Technical Architecture
│   └── VISION_1.0.md           # 1.0 architecture vision & tech stack
├── development/                 # Development Guides
│   ├── IMPLEMENTATION_STATUS.md # Current implementation progress
│   └── MOBILE_ROADMAP.md       # Mobile enhancement roadmap
├── guides/                      # User Guides
│   └── GAME_MANUAL.md          # Player's guide
├── reference/                   # Historical & Reference Materials
│   ├── TRIAGE_REPORT_2026-01.md # GitHub triage report
│   ├── AI_FEEDBACK_SUMMARY.md   # AI code review feedback
│   ├── PR19_ANALYSIS.md        # PR analysis (historical)
│   ├── DESIGN-SYSTEM.md        # jbcom brand guidelines
│   ├── DOMAIN-STANDARD.md      # Domain standards
│   └── ECOSYSTEM.md            # Ecosystem documentation
└── _static/                     # Static assets
    └── jbcom-sphinx.css        # Sphinx styling
```

---

## Document Categories

### Design (`design/`)
Game design documents covering mechanics, progression systems, and player experience.

- **META_PROGRESSION_DESIGN.md** - Nice Points currency, weapon unlocks, skin collections, permanent upgrades

### Architecture (`architecture/`)
Technical architecture decisions, technology stack, and implementation vision.

- **VISION_1.0.md** - Mobile-native architecture (React Native + Expo + BabylonJS), DDL system, performance targets

### Development (`development/`)
Development status, roadmaps, and implementation guides.

- **IMPLEMENTATION_STATUS.md** - Phase completion status, feature checklist, test coverage
- **MOBILE_ROADMAP.md** - Mobile-first enhancement roadmap, haptic feedback, native features

### Guides (`guides/`)
End-user documentation and player guides.

- **GAME_MANUAL.md** - Controls, characters, weapons, upgrades, tips

### Reference (`reference/`)
Historical analysis, code reviews, and ecosystem documentation.

- **TRIAGE_REPORT_2026-01.md** - Comprehensive GitHub issue/PR triage
- **AI_FEEDBACK_SUMMARY.md** - Aggregated AI code review feedback
- **PR19_ANALYSIS.md** - Deep analysis of character enhancement PR

---

## Goals

### 1.0 Release Goals
- Premium mobile-native experience (NOT a web wrapper)
- 60fps on flagship devices, 30fps on mid-tier
- < 15% battery drain per 30-minute session
- Complete offline-first functionality
- Data-driven architecture (DDL JSON files)

### Architecture Goals
- React Native + Expo SDK 54+
- BabylonJS React Native for 3D rendering
- Zustand for state management
- Expo Router for navigation

### Design Goals
- Deep meta-progression with Nice Points
- 10+ weapons with evolutions
- 3 playable character classes
- Roguelike upgrade system

---

## Related Resources

- **[Memory Bank](../memory-bank/)** - Multi-agent collaboration context
- **[CLAUDE.md](../CLAUDE.md)** - AI agent instructions
- **[AGENTS.md](../AGENTS.md)** - Agent registry
- **[packages/game-core/src/data/](../packages/game-core/src/data/)** - DDL JSON source files
