## 2024-05-23 - [Optimizing R3F Components with Zustand]
**Learning:** React components subscribing to a Zustand store without selectors (i.e., `useStore()`) will re-render on *every* state update. In a game loop where state updates happen every frame (e.g., player position, bullet updates), this causes the entire component tree to re-render 60 times per second, leading to massive performance degradation.
**Action:** Always use specific selectors for stable values (e.g., `useStore(state => state.action)`) and access high-frequency/transient state directly via `useStore.getState()` inside `useFrame` loops, bypassing the React render cycle entirely.

## 2024-05-23 - [Transient State Updates in Game Loops (FAILED ATTEMPT)]
**Learning:** I attempted to optimize enemy damage by mutating the `hp` property of enemy objects directly in the store, bypassing Zustand's `set` function to avoid re-renders. While this improved render performance, it caused critical regressions in E2E tests (UI timeouts, button clicks failing) because the application state became desynchronized from the UI and test drivers.
**Action:** Do NOT bypass Zustand's `set` method for state updates that affect logic or UI, even if high-frequency. Instead, rely on selectors or split the store into "structural" (Zustand) and "transient" (Ref/Object3D) state if optimization is strictly needed. Correctness > Speed.
