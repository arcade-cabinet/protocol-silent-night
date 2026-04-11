# Architectural Core Pillars

## 1. Contextual Integrity
- **CLAUDE.md**: Foundational mandates, coding standards (200 LOC limit), and architectural rules.
- **AGENTS.md**: Specific operational guidelines and task status tracking.

## 2. Pipeline Architecture
- **Present Factory**: Pure GDScript procedural mesh generation for players.
- **Enemy Director**: Logic-driven spawning and mesh management for animated enemies.
- **Material Factory**: PBR-ready material pipeline with flat color fallbacks.
- **Wave Formula**: Deterministic PRNG-seeded pressure scaling.

## 3. Data-Driven Configuration
- **Declarations**: JSON-based configs for enemies, presents, upgrades, and gear.
- **Save Manager**: Lightweight persistence for unlocks and preferences.
