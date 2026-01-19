# System Patterns - Protocol: Silent Night

## Core Architecture Pattern

**Data-Driven Engine with Platform-Specific Renderers**

```
┌──────────────────────────────────────────────────────────┐
│                    packages/game-core/                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │    DDLs     │  │   Systems   │  │     Types       │   │
│  │  (JSON)     │  │ (Combat,    │  │  (TypeScript)   │   │
│  │             │  │  Progress)  │  │                 │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                           │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ apps/    │    │ apps/    │    │ future   │
    │ mobile   │    │ web      │    │ console  │
    │(BabylonJS│    │(Three.js)│    │          │
    │  + RN)   │    │ Legacy   │    │          │
    └──────────┘    └──────────┘    └──────────┘
```

## State Management Pattern

**Zustand Store with Selectors**

```typescript
// CORRECT: Use selectors for high-frequency state
const playerPosition = useGameStore(state => state.playerPosition);

// WRONG: Subscribe to entire store
const store = useGameStore(); // Re-renders on ANY state change

// For game loops, access directly without React
useFrame(() => {
  const { playerPosition, updatePosition } = useGameStore.getState();
  updatePosition(newPos);
});
```

## Game Loop Pattern

**Declarative Scene + Imperative Updates**

```tsx
// Declarative structure (Reactylon/BabylonJS)
function GameScene() {
  return (
    <Scene>
      <IsometricCamera />
      <HexGrid />
      <PlayerCharacter />
      <EnemySwarm />
    </Scene>
  );
}

// Imperative updates in useFrame/useBeforeRender
function PlayerCharacter() {
  const mesh = useRef();

  useBeforeRender(() => {
    const { movement } = useGameStore.getState();
    mesh.current.position.x += movement.x * deltaTime;
  });

  return <Mesh ref={mesh} />;
}
```

## Procedural Character Pattern

**Lofted Splines, Not Primitives**

```tsx
// CORRECT: Smooth, curved meshes
<ExtrudeShape
  shape={torsoProfile}      // Curved profile
  path={spinePath}          // Bezier curve
  subdivision={4}           // Smooth result
/>

// WRONG: Stacked primitives (blocky look)
<Box />  // Don't stack boxes
<Cylinder /> // Don't stack cylinders
```

## Combat Effect Pattern

**Explosions Hide Collision Imprecision**

```
Clash Sequence:
1. Proximity detected (dist < 2.5)
2. Halt enemy AI movement
3. Spawn explosion at midpoint
4. Camera shake + screen flash
5. Knockback animation
6. Apply damage
7. Resume normal gameplay

The explosion OBSCURES the collision point,
so precision isn't visible to player.
```

## DDL Loading Pattern

**JSON → Zod Validation → TypeScript Types**

```typescript
// packages/game-core/systems/loaders.ts
import { z } from 'zod';
import classesJson from '../data/classes.json';

const ClassSchema = z.object({
  type: z.enum(['santa', 'elf', 'bumble']),
  name: z.string(),
  hp: z.number(),
  speed: z.number(),
  // ...
});

export const PLAYER_CLASSES = ClassSchema.array().parse(classesJson);
```

## Navigation Pattern

**Expo Router File-Based**

```
apps/mobile/app/
├── _layout.tsx         # Root layout (dark theme)
├── index.tsx           # Menu screen
├── character-select.tsx
├── game.tsx           # Main game scene
├── workshop.tsx       # Santa's Workshop
└── [dynamic].tsx      # Dynamic routes if needed
```

## Persistence Pattern

**AsyncStorage + Zustand Middleware**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGameStore = create(
  persist(
    (set, get) => ({
      metaProgress: { nicePoints: 0, ... },
      // ...
    }),
    {
      name: 'protocol-silent-night',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ metaProgress: state.metaProgress }),
    }
  )
);
```

## Animation Pattern

**Reanimated for UI, BabylonJS for 3D**

```tsx
// UI animations: react-native-reanimated
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: withSpring(pressed ? 0.95 : 1) }],
}));

// 3D animations: BabylonJS Animation API
Animation.CreateAndStartAnimation(
  'walkCycle',
  skeleton,
  'position.y',
  60,     // FPS
  30,     // Frames
  startPos,
  endPos,
  Animation.ANIMATIONLOOPMODE_CYCLE
);
```

## Error Boundary Pattern

```tsx
// Wrap game scene with error boundary
function GameScreen() {
  return (
    <ErrorBoundary
      fallback={<GameCrashScreen />}
      onError={(error) => logCrash(error)}
    >
      <GameScene />
    </ErrorBoundary>
  );
}
```

## Component Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Scene | PascalCase + Scene | `DioramaScene` |
| Character | Anime prefix | `AnimeHero`, `AnimeEnemy` |
| Effect | Descriptive | `ExplosionParticles`, `CameraShake` |
| UI | Descriptive | `StatusPanel`, `CommandMenu` |
| Store | use prefix | `useGameStore`, `useAudioStore` |
| Hook | use prefix | `useIsometricCamera`, `useCombat` |
