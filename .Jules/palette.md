## 2024-05-24 - Accessibility Labels on Non-Form Elements
**Learning:** Testing libraries like `@testing-library/react` can struggle to find elements by label text if the element isn't a native form control, even if it has an appropriate ARIA role.
**Action:** When adding `aria-label` to container elements like `div` with `role="tablist"`, verify that the test query strategy matches (e.g., ensuring `getByLabelText` actually works or falling back to `getByRole` with `name` option).
