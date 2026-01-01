## 2024-05-23 - Accessibility Patterns in Gaming UI
**Learning:** Game interfaces often rely on custom styling that strips native browser accessibility cues (like outlines). While visually immersive, this breaks keyboard navigation. Restoring these with `focus-visible` using thematic colors (e.g., `#00ffcc` for sci-fi) maintains immersion while ensuring usability.
**Action:** Always check `outline: none` usage in CSS modules and replace with themed `focus-visible` styles that match the game's aesthetic.

## 2024-05-23 - Tablist Labeling
**Learning:** `role="tablist"` is insufficient on its own when multiple tab interfaces might exist or context is needed. Screen readers require an accessible name (via `aria-label`) to distinguish the purpose of the tab group.
**Action:** Ensure all `role="tablist"` containers have descriptive `aria-label` attributes.
