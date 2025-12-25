# Copilot Instructions for Protocol: Silent Night

## Project Overview

This is a **WebGL arcade game** built with Three.js and React Three Fiber. It's a Christmas-themed shooter where players defend the North Pole from Grinch-Bot invaders.

## Tech Stack

- **Runtime**: React 18 + TypeScript
- **3D Engine**: Three.js via React Three Fiber
- **Graphics**: @jbcom/strata for procedural characters, fur, sky, fog
- **State**: Zustand
- **Build**: Vite
- **Lint**: Biome
- **Test**: Playwright E2E

## Key Patterns

### State Management
Use Zustand store at `src/store/gameStore.ts`. Access with hooks:
```typescript
const { playerHp, damagePlayer } = useGameStore();
```

For frame-loop updates, use `getState()` to avoid re-renders:
```typescript
const currentHp = useGameStore.getState().playerHp;
```

### 3D Components
All 3D code uses React Three Fiber patterns:
```typescript
import { useFrame } from '@react-three/fiber';

useFrame((state, delta) => {
  // Animation logic here
  meshRef.current.rotation.y += delta;
});
```

### Character Creation
Characters use Strata's articulated character system:
```typescript
import { createCharacter, animateCharacter } from '@jbcom/strata';

const character = createCharacter({
  skinColor: 0xff0044,
  furOptions: { ... },
  scale: 1.4,
});
```

### Fur Rendering
Fur uses shell-based technique. Cache fur groups to avoid traversal:
```typescript
// Cache in useEffect
furGroupsRef.current = findFurGroups(character.joints);

// Update in useFrame
for (const group of furGroupsRef.current) {
  updateFurUniforms(group, time);
}
```

## File Structure

```
src/
├── characters/     # Player models (Santa, Elf, Bumble)
├── game/           # Core systems (Terrain, Enemies, Bullets)
├── store/          # Zustand state
├── ui/             # React UI components
├── shaders/        # GLSL shaders
└── types/          # TypeScript definitions
```

## Coding Guidelines

1. **Immutable State**: Never mutate Zustand state directly. Create new objects:
   ```typescript
   // Good
   const newMesh = new THREE.Object3D();
   newMesh.position.copy(newPos);
   return { ...enemy, mesh: newMesh };
   
   // Bad
   enemy.mesh.position.copy(newPos);
   ```

2. **Performance**: 
   - Use `useMemo` for geometries/materials
   - Use `useCallback` with stable dependencies
   - Avoid `traverse()` in `useFrame`

3. **Type Safety**: All game entities extend `EntityData` interface

4. **CSS**: Use CSS Modules for component styles

## Game Constants

Located in `src/types/index.ts`:
- `CONFIG.WAVE_REQ` - Kills to spawn boss (10)
- `CONFIG.MAX_MINIONS` - Max concurrent enemies (15)
- `PLAYER_CLASSES` - Character stats

## Testing

```bash
pnpm test:e2e        # Headless (CI)
pnpm test:e2e:mcp    # Full WebGL (with MCP)
```

Tests skip WebGL-dependent assertions in headless mode.

## Common Tasks

### Add New Character
1. Create `src/characters/NewCharacter.tsx`
2. Add config to `PLAYER_CLASSES` in types
3. Add case in `PlayerController.tsx`

### Add New Enemy Type
1. Add type to `EnemyType` union
2. Add spawn logic in `Enemies.tsx`
3. Create mesh component

### Add UI Effect
1. Create component in `src/ui/`
2. Export from `src/ui/index.ts`
3. Add to `App.tsx`
