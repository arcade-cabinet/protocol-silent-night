# Technical Context - Protocol: Silent Night

## Technology Stack (1.0 Target)

### Platform Layer
| Technology | Purpose | Version |
|------------|---------|---------|
| React Native | Cross-platform native runtime | 0.76+ |
| Expo | Development framework | SDK 54+ |
| Expo Router | File-based navigation | 4.x |
| EAS Build | Cloud builds for iOS/Android | Latest |

### 3D Rendering
| Technology | Purpose | Version |
|------------|---------|---------|
| BabylonJS | 3D engine | 7.x |
| @babylonjs/react-native | Native GPU rendering | 2.3+ |
| Reactylon | Declarative JSX for BabylonJS | Latest |

### State Management
| Technology | Purpose |
|------------|---------|
| Zustand | Global game state |
| AsyncStorage | Local persistence |
| game-core DDL loaders | Content loading |

### Audio
| Technology | Purpose |
|------------|---------|
| Tone.js | Procedural synth music |
| expo-av | Audio playback |

### UI & Animation
| Technology | Purpose |
|------------|---------|
| React Native | Native UI components |
| react-native-reanimated | 60fps animations |
| expo-haptics | Tactile feedback |

### Testing
| Technology | Purpose |
|------------|---------|
| Jest | Unit testing |
| Maestro | E2E mobile testing |
| Target coverage | 75%+ |

## Architecture Patterns

### Monorepo Structure
```
protocol-silent-night/
├── apps/
│   ├── mobile/              # Expo + BabylonJS app
│   │   ├── app/            # Expo Router pages
│   │   ├── components/     # React Native UI
│   │   └── src/            # App-specific code
│   └── web/                # Legacy (maintenance mode)
├── packages/
│   └── game-core/          # Shared game logic
│       ├── data/           # JSON DDLs
│       ├── systems/        # Combat, progression, etc.
│       └── types/          # TypeScript definitions
└── pnpm-workspace.yaml
```

### Data-Driven Design (DDLs)
All game content defined in JSON files:
- `classes.json` - Player characters
- `weapons.json` - Weapons + evolutions
- `enemies.json` - Enemy configurations
- `upgrades.json` - Roguelike upgrades
- `themes.json` - Visual themes
- `audio.json` - Sound configurations

### Component Boundaries
- **Scene Components:** Reactylon (BabylonJS JSX)
- **UI Components:** React Native StyleSheet
- **Game Logic:** Zustand stores
- **Data Loading:** TypeScript loaders in game-core

## Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| FPS (flagship) | 60 stable | Premium feel |
| FPS (mid-tier) | 30 stable | Broad device support |
| Memory | < 300MB | Prevent crashes |
| Bundle size | < 100MB | App Store limits |
| Load time | < 3s | User patience |
| Touch latency | < 100ms | Responsive feel |

## Forbidden Patterns

These are explicitly NOT allowed in the codebase:

| Pattern | Reason |
|---------|--------|
| Capacitor/Cordova | Web wrapper, not native |
| Three.js / R3F | Web-only, no native support |
| @jbcom/strata | DEPRECATED |
| CSS-in-JS | Use StyleSheet instead |
| Web-first + wrapping | Defeats mobile-native goal |
| localStorage | Use AsyncStorage |

## Development Environment

### Prerequisites
- Node.js 20+
- pnpm 9+
- Xcode (for iOS)
- Android Studio (for Android)
- Expo CLI

### Key Commands
```bash
# Development
pnpm dev:mobile          # Start Expo dev server
pnpm build:ios          # EAS Build for iOS
pnpm build:android      # EAS Build for Android

# Testing
pnpm test               # Run Jest tests
pnpm test:e2e           # Run Maestro E2E tests
pnpm typecheck          # TypeScript validation

# Game Core
cd packages/game-core
pnpm build              # Build shared package
```

## Known Technical Debt

1. **Character System Migration:** @jbcom/strata → procedural BabylonJS
2. **Legacy Web App:** Needs maintenance mode freeze
3. **Test Migration:** Jest tests need Expo/RN adaptation
4. **Store Migration:** gameStore needs platform-agnostic refactor
