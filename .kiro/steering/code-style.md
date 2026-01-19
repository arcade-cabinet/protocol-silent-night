# Code Style Steering - Protocol: Silent Night

## TypeScript
- Strict mode enabled
- Explicit return types on exports
- Prefer `interface` over `type` for objects
- Use `unknown` over `any`

## React Native
- Functional components only
- Custom hooks for reusable logic
- Memoize expensive computations
- Use `StyleSheet.create()` not inline styles

## Reactylon/BabylonJS
- Declarative JSX for scene graph
- Imperative hooks for complex logic (`useScene`, `useBeforeRender`)
- Dispose resources on unmount (Reactylon handles automatically)
- Instance meshes for repeated geometry

## State Management
- Single Zustand store per domain (game, ui, settings)
- Selectors for derived state
- Actions as store methods
- Persist sensitive data to AsyncStorage

## File Organization
```
src/
  scenes/          # Reactylon scene components
  components/      # React Native UI components
  hooks/           # Custom hooks
  stores/          # Zustand stores
  utils/           # Pure utility functions
  types/           # TypeScript interfaces
```

## Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils: `camelCase.ts`
- Types: `PascalCase` with `I` prefix for interfaces
- DDL keys: `kebab-case`

## Testing
- Test file: `*.test.ts(x)`
- Describe blocks mirror component structure
- Mock external dependencies
- Test behavior, not implementation
