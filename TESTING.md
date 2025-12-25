# Testing Strategy for Protocol: Silent Night

This document outlines the comprehensive testing strategy for the game, including unit tests, integration tests, and end-to-end tests.

## Test Coverage Summary

### Unit Tests (101 tests)
- **Game Store Tests** (`src/__tests__/unit/gameStore.test.ts`): 34 tests
  - Player state management
  - Input handling
  - Stats and scoring
  - High score persistence
  
- **Entity Management Tests** (`src/__tests__/unit/gameStore-entities.test.ts`): 35 tests
  - Bullet lifecycle
  - Enemy management
  - Boss mechanics
  
- **Type System Tests** (`src/__tests__/unit/types.test.ts`): 32 tests
  - Game constants validation
  - Character class balance
  - Type definitions

### Integration Tests (16 tests)
- **Game Flow Tests** (`src/__tests__/integration/game-flow.test.ts`): 16 tests
  - Complete game loops
  - Combat scenarios
  - Character class progression
  - Boss fights
  - High score persistence
  - Kill streak system
  - State transitions

### End-to-End Tests (21 tests)
- **Basic Tests** (`e2e/game.spec.ts`): 11 tests
  - Page loading and meta tags
  - localStorage functionality
  - PWA manifest
  - Canvas rendering
  - Character selection UI
  
- **Character Class Tests** (`e2e/character-classes.spec.ts`): 10 tests
  - All 3 character classes (Santa, Elf, Bumble)
  - Movement mechanics
  - Combat and firing
  - Touch controls
  - Score updates
  - Game state persistence

## Running Tests

### Unit and Integration Tests
```bash
# Run all tests once
pnpm test:unit

# Watch mode for development
pnpm test:unit:watch

# With UI
pnpm test:unit:ui

# With coverage report
pnpm test:coverage
```

### End-to-End Tests

#### Headless Mode (CI)
```bash
# Basic E2E tests (works in headless/CI environments)
pnpm test:e2e
```

Note: WebGL-dependent tests are automatically skipped in headless mode to prevent false failures.

#### Full WebGL Testing (MCP Mode)
```bash
# Full tests with WebGL/GPU support (requires display)
pnpm test:e2e:mcp

# Or with UI
pnpm test:e2e:ui
```

This mode requires:
- Display server (X11 or Wayland)
- GPU acceleration
- Full browser environment

#### All Tests
```bash
# Run both unit and E2E tests
pnpm test:all
```

## Test Structure

### Unit Tests
Unit tests focus on isolated components and pure logic:
- ✅ Zustand store mutations
- ✅ Game constants and configuration
- ✅ Type system validation
- ✅ Character class balance
- ✅ Scoring and kill streak logic
- ✅ State management

### Integration Tests
Integration tests verify systems working together:
- ✅ Complete game flow (menu → phase 1 → boss → win)
- ✅ Combat mechanics (bullets, enemies, collisions)
- ✅ Character-specific gameplay
- ✅ Boss fight sequences
- ✅ High score persistence across games
- ✅ Kill streak bonuses
- ✅ State transitions

### E2E Tests
E2E tests verify the complete user experience:
- ✅ Page loading and initialization
- ✅ Character selection
- ⚠️ Movement (WASD keys) - requires WebGL
- ⚠️ Shooting (Space key) - requires WebGL
- ⚠️ Enemy spawning and AI - requires WebGL
- ⚠️ Boss fights - requires WebGL
- ✅ Touch controls (UI buttons)
- ✅ Score tracking
- ✅ Game state persistence

⚠️ = Tests that require full GPU/WebGL support

## Test Environment

### Vitest Configuration
- Environment: `happy-dom` (lightweight DOM implementation)
- Setup file: `src/__tests__/setup.ts`
- Coverage provider: V8
- Mocked APIs:
  - localStorage
  - matchMedia
  - ResizeObserver
  - WebGL context (basic mocks for unit tests)

### Playwright Configuration
- Browser: Chromium
- Two modes:
  1. **Headless** (default): Software WebGL, skips GPU-dependent tests
  2. **MCP** (`PLAYWRIGHT_MCP=true`): Full GPU, all tests enabled
- Timeout: 60s (MCP) / 30s (headless)
- Screenshots on failure
- Video recording (MCP mode only)

## Coverage Goals

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

Current coverage (unit + integration tests):
- Game Store: ~95%
- Types/Constants: 100%
- UI Components: 0% (needs implementation)
- Game Systems: 0% (partially covered by integration tests)

## Future Improvements

### Component Tests (TODO)
- [ ] HUD component rendering
- [ ] StartScreen interactions
- [ ] EndScreen display
- [ ] BossHUD updates
- [ ] KillStreak animations
- [ ] DamageFlash effects
- [ ] InputControls (touch joystick)
- [ ] LoadingScreen states

### E2E Improvements (TODO)
- [ ] Visual regression testing
- [ ] Performance benchmarks
- [ ] Accessibility audits
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Mobile device testing
- [ ] Network condition simulation

### CI Integration (TODO)
- [ ] GitHub Actions workflow for tests
- [ ] Coverage reporting
- [ ] Test result badges
- [ ] Automated visual diffs
- [ ] Performance regression detection

## Known Limitations

### WebGL in CI/Headless
WebGL and Three.js require GPU acceleration to fully function. In headless/CI environments:
- Software rendering (SwiftShader) provides basic WebGL
- Complex 3D scenes may fail or perform poorly
- Some rendering tests must be skipped

**Solutions:**
1. Mock Three.js for unit tests ✅
2. Skip GPU-dependent E2E tests in headless mode ✅
3. Run full E2E tests with MCP/GPU in dev environment ✅
4. Use visual regression testing for critical rendering

### Test Performance
- Unit tests: ~1s (fast, run often)
- Integration tests: ~1.5s (medium, run per commit)
- E2E tests: ~30-60s (slow, run before PR)

## Best Practices

1. **Test Pyramid**: More unit tests, fewer E2E tests
2. **Isolation**: Each test should be independent
3. **Cleanup**: Always reset state between tests
4. **Descriptive Names**: Tests should document behavior
5. **Fast Feedback**: Keep unit tests under 100ms
6. **Realistic Data**: Use production-like test data
7. **Error Messages**: Clear assertions with context

## Debugging Tests

### Vitest
```bash
# Run specific test file
pnpm vitest src/__tests__/unit/gameStore.test.ts

# Run with debugger
pnpm vitest --inspect-brk

# Update snapshots
pnpm vitest -u
```

### Playwright
```bash
# Run specific test
pnpm playwright test -g "should select character"

# Debug mode (opens browser)
pnpm playwright test --debug

# Generate test code
pnpm playwright codegen http://localhost:4173
```

## Contributing

When adding new features:
1. Write unit tests first (TDD)
2. Add integration tests for feature interactions
3. Update E2E tests if UI changes
4. Ensure coverage doesn't decrease
5. Update this README if test strategy changes

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [React Three Fiber Testing](https://docs.pmnd.rs/react-three-fiber/advanced/testing)
