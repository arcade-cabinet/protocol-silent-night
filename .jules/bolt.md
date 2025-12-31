## 2024-05-23 - Zustand Re-render Optimization
**Learning:** Components using `useGameStore()` without selectors subscribe to the *entire* state object. In a game loop where state like `playerPosition` updates every frame, this causes every subscribing UI component to re-render 60 times per second, even if they only display static data like health or score.
**Action:** Always use `useShallow` or specific selectors when consuming Zustand stores in UI components to isolate them from high-frequency game loop updates.
