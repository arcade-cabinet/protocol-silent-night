## 2024-05-23 - Insecure Random Number Generation & E2E Determinism

**Vulnerability:**
The application was using `Math.random()` for critical game mechanics and visual effects. `Math.random()` is not cryptographically secure and its implementation is browser-dependent, leading to insufficient entropy for security-sensitive contexts (though low risk here, it's bad practice). More critically for development, `Math.random()` caused flaky visual regression tests because particle systems and enemy spawns were unpredictable across CI runs.

**Learning:**
1. **Security:** `Math.random()` should be replaced with `crypto.getRandomValues()` for any logic requiring high-quality entropy.
2. **Testing:** E2E tests for WebGL/Three.js applications require strict determinism. Standard "wait for selector" logic is insufficient when the underlying canvas renders asynchronously or nondeterministically.
3. **Architecture:** Injecting a control flag (`window.__E2E_TEST__`) to force a fixed seed in the game loop is a powerful pattern to ensure testability without compromising production randomness.

**Prevention:**
- Use a centralized `SeededRandom` class wrapping `crypto.getRandomValues()` for all game logic.
- Ensure the RNG can accept a fixed seed when running in a test environment.
- In E2E tests, inject the test flag early via `page.addInitScript` to guarantee the seed is set before any game logic initializes.
