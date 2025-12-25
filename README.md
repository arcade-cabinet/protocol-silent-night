# Protocol: Silent Night

> Arcade RPG Simulation with Three.js/WebGL

A festive-themed 3D arcade shooter built with React Three Fiber, featuring three unique playable characters with real-time fur rendering, procedural terrain, and boss battles.

![Protocol: Silent Night](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 🎮 Features

- **Three Playable Classes:**
  - 🎅 **MECHA-SANTA** - Heavy tank with Coal Cannon
  - 🧝 **CYBER-ELF** - Fast scout with Plasma SMG
  - ⛄ **THE BUMBLE** - Bruiser with Star Thrower (spread weapon)

- **Visual Effects:**
  - Real-time fur rendering using shell technique
  - Bloom post-processing for neon glow
  - Tron-grid procedural terrain
  - Dynamic lighting with shadows

- **Gameplay:**
  - Wave-based enemy spawning
  - Epic boss battle (Krampus-Prime)
  - Touch and keyboard controls

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 🎯 Controls

### Keyboard
- **WASD / Arrow Keys** - Movement
- **Space** - Fire

### Touch (Mobile)
- **Left side** - Virtual joystick
- **Right side** - Fire button

## 🛠️ Tech Stack

- **Framework:** React 18 + TypeScript
- **3D Engine:** Three.js via React Three Fiber
- **State Management:** Zustand
- **Build Tool:** Vite
- **Linting/Formatting:** Biome
- **Post-Processing:** @react-three/postprocessing

## 📁 Project Structure

```
src/
├── characters/     # Player character components with fur
├── game/           # Core game systems (terrain, enemies, bullets)
├── shaders/        # Custom GLSL shaders (fur, terrain)
├── store/          # Zustand state management
├── types/          # TypeScript definitions
└── ui/             # UI components (HUD, menus)
```

## 🐻 Strata Integration

This project is powered by [@jbcom/strata](https://github.com/strata-game-library/core), a procedural 3D graphics library for React Three Fiber.

### Features Used:
- **`createCharacter()`** - Articulated characters with proper joint hierarchies (hips, torso, head, arms, legs)
- **`animateCharacter()`** - Procedural walk cycles and idle breathing animations
- **`createFurSystem()`** - Shell-based fur rendering with wind and gravity effects
- **`updateFurUniforms()`** - Real-time fur animation
- **`ProceduralSky`** - Dynamic sky with day/night settings
- **`VolumetricFogMesh`** - Atmospheric fog effects
- **`noise3D`, `fbm`** - Procedural terrain generation

See [AGENTS.md](./AGENTS.md) for detailed documentation on the game architecture.

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm check` | Lint and format |
| `pnpm typecheck` | TypeScript type checking |

## 🎨 Character Details

All characters use Strata's `createCharacter()` for proper articulated bodies with animated joints.

### MECHA-SANTA (Tank)
- 300 HP, 9 speed
- Coal Cannon: 40 damage, 0.5s cooldown
- Articulated body with fur-trimmed suit, beard, hat with pom-pom
- Belt with golden buckle, glowing cyber eyes

### CYBER-ELF (Scout)
- 100 HP, 18 speed
- Plasma SMG: 8 damage, 0.1s cooldown
- Articulated body with cyber suit, pointed twitching ears
- Visor with eye glow, spiky cyber-hair, hover boots

### THE BUMBLE (Bruiser)
- 200 HP, 12 speed
- Star Thrower: 18 damage × 3 spread
- Large articulated body with 16-layer dense white fur
- Horns, glowing blue eyes, heavy breathing animation

## 📜 License

MIT
