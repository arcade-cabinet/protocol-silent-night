# Contributing to Protocol: Silent Night

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Node.js 20 or higher
- pnpm 9 or higher
- A modern browser with WebGL support

### Setup
```bash
git clone https://github.com/arcade-cabinet/protocol-silent-night.git
cd protocol-silent-night
pnpm install
pnpm dev
```

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Code Style
This project uses [Biome](https://biomejs.dev/) for linting and formatting:
```bash
pnpm lint      # Check for issues
pnpm format    # Auto-format code
pnpm check     # Lint + format in one command
```

### Type Checking
```bash
pnpm typecheck
```

### Testing
```bash
# Run E2E tests (headless)
pnpm test:e2e

# Run with full WebGL support (requires display)
pnpm test:e2e:mcp

# Interactive test UI
pnpm test:e2e:ui
```

## Project Structure

```
src/
├── characters/     # Player character components
│   ├── SantaCharacter.tsx
│   ├── ElfCharacter.tsx
│   ├── BumbleCharacter.tsx
│   └── PlayerController.tsx
├── game/           # Core game systems
│   ├── GameScene.tsx    # Main 3D scene
│   ├── Terrain.tsx      # Procedural terrain
│   ├── Enemies.tsx      # Enemy AI
│   ├── Bullets.tsx      # Projectile system
│   └── HitParticles.tsx # Particle effects
├── store/          # State management
│   └── gameStore.ts     # Zustand store
├── ui/             # UI components
│   ├── StartScreen.tsx
│   ├── HUD.tsx
│   ├── BossHUD.tsx
│   └── EndScreen.tsx
├── shaders/        # Custom GLSL shaders
└── types/          # TypeScript definitions
```

## Key Technologies

- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **@jbcom/strata** - Procedural graphics library
- **Zustand** - State management
- **Vite** - Build tool

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm lint && pnpm typecheck && pnpm build`
5. Run `pnpm test:e2e` to verify tests pass
6. Submit a Pull Request

### PR Guidelines
- Keep PRs focused on a single feature or fix
- Include a clear description of changes
- Reference any related issues
- Ensure CI passes before requesting review

## Game Design Guidelines

### Adding New Characters
1. Create component in `src/characters/`
2. Use `createCharacter()` from Strata for articulated models
3. Add fur system with `createFurSystem()` if needed
4. Add configuration to `PLAYER_CLASSES` in `src/types/`

### Adding New Enemies
1. Add enemy type to `src/types/index.ts`
2. Implement spawn logic in `src/game/Enemies.tsx`
3. Create mesh component for rendering
4. Balance HP/speed/damage appropriately

### UI Components
- Use CSS Modules for styling
- Follow existing HUD panel patterns
- Support both desktop and mobile layouts

## Questions?

Open an issue for questions or suggestions!
