# Technical Steering - Protocol: Silent Night

## Stack (1.0 Target)

### Platform
- **React Native** + Expo SDK 54+
- **Expo Router** for file-based navigation
- **EAS Build** for cloud builds

### 3D Rendering
- **BabylonJS React Native** for native GPU rendering
- **Reactylon** for declarative JSX components
- Procedural character generation (NOT primitives)

### State Management
- **Zustand** for global game state
- **AsyncStorage** for persistence
- DDL loaders from `packages/game-core/`

### Audio
- **Tone.js** for procedural synth music/SFX
- No external audio files required

### Testing
- **Jest** for unit tests
- **Maestro** for E2E mobile testing
- 75%+ coverage target

## Architecture Patterns

### Monorepo Structure
```
apps/mobile/     # Expo app
packages/game-core/  # Shared DDLs and game logic
```

### Data-Driven Design
All game entities defined in JSON:
- `classes.json` - Player characters
- `weapons.json` - Weapons + evolutions
- `enemies.json` - Enemy configurations
- `upgrades.json` - Roguelike upgrades

### Component Boundaries
- Scene components in Reactylon
- UI components in React Native
- Game logic in Zustand stores
- No Three.js or web-specific APIs

## Performance Targets
| Metric | Target |
|--------|--------|
| FPS (flagship) | 60 stable |
| FPS (mid-tier) | 30 stable |
| Memory | < 300MB |
| Bundle size | < 100MB |

## Forbidden Patterns
- No Capacitor/Cordova
- No web-first with mobile wrapping
- No CSS-in-JS (use StyleSheet)
- No @jbcom/strata (deprecated)
