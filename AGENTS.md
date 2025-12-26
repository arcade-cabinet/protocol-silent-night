# PROTOCOL: SILENT NIGHT // AGENT REGISTRY

**System Version:** 4.0 (DDL Edition)
**Target Runtime:** React Three Fiber / Three.js / WebGL
**Classification:** Data-Driven Arcade RPG Simulation
**Architecture:** Modular TypeScript with Zustand State Management and JSON DDLs

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

## 5. STRATA INTEGRATION

This project is fully powered by [@jbcom/strata](https://github.com/strata-game-library/core) and the new `StrataCharacter` interpreter.

### Custom Component: `<StrataCharacter />`
```tsx
// This component now handles all rendering by interpreting DDLs
<StrataCharacter 
  config={classes.santa} 
  isMoving={true} 
  isFiring={false} 
/>
```

---

## 6. PROJECT STRUCTURE (v4.0)

```
src/
├── data/                   # JSON DDLs (The Source of Truth)
├── characters/             # Generic rendering brains
│   ├── StrataCharacter.tsx # Interprets class/skin JSON
│   └── PlayerController.tsx # Generic movement/firing brain
├── game/                   # Optimized game systems
│   ├── Enemies.tsx         # Instanced enemy management
│   ├── Bullets.tsx         # Instanced projectile management
│   └── ...
├── store/                  # Unified State & Data Loading
│   └── gameStore.ts        # Roguelike + Meta-progression
└── ui/                     # Modular React interfaces
```

---

*Generated for Protocol: Silent Night v4.0 (DDL Edition)*
