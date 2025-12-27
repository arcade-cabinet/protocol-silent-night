# Palette's Journal

## 2024-05-22 - Accessibility in Canvas
**Learning:** Canvas elements are opaque to screen readers by default.
**Action:** Ensure any interactive canvas elements have HTML fallbacks or are managed via keyboard event listeners that update aria-live regions or hidden DOM elements to communicate state changes.

## 2024-05-22 - Loading States
**Learning:** Users can get confused when 3D scenes take time to load without feedback.
**Action:** Always include a visual loading indicator (Spinner/Progress) when loading heavy 3D assets or scenes.
