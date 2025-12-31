## 2024-05-23 - [Optimizing R3F Components with Zustand]
**Learning:** React components subscribing to a Zustand store without selectors (i.e., `useStore()`) will re-render on *every* state update. In a game loop where state updates happen every frame (e.g., player position, bullet updates), this causes the entire component tree to re-render 60 times per second, leading to massive performance degradation.
**Action:** Always use specific selectors for stable values (e.g., `useStore(state => state.action)`) and access high-frequency/transient state directly via `useStore.getState()` inside `useFrame` loops, bypassing the React render cycle entirely.

## 2024-05-23 - [Transient State Updates in Game Loops]
**Learning:** High-frequency updates (like HP or position) in a Zustand store can cause excessive re-rendering if handled via immutable state updates (`set`).
**Action:** For transient data that is visualized via refs in `useFrame` (like particle positions or enemy HP colors), prefer mutating the object in place without calling `set`, unless the UI strictly needs to react to it. This decouples the visual update loop (60fps) from the React reconciliation loop.
