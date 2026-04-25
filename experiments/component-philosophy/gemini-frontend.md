# Gemini — Front-end dev (20yr)

## Q1 — Ideas that fit as-is
*   **Next 15 Static Export Compatibility:** The "Vanilla CSS Modules" approach is perfect for `output: 'export'`. It ensures CSS is extracted at build time with zero runtime overhead, avoiding hydration mismatches often seen with CSS-in-JS.
*   **Semantic Constraints:** The `section → article → div` hierarchy and the "Root is always `<section>`" rule enforce a predictable DOM tree, which is a godsend for automated testing (Playwright) and global layout styling.
*   **TypeScript Co-location:** Keeping `types.ts` next to the component is industry standard for maintainability in large monorepos.
*   **Logical Properties:** Mandating `margin-block` and `margin-inline` is the right move for 2026. It handles RTL/LTR/TTB layouts automatically without extra CSS logic.

## Q2 — Conflicts (and resolution)
*   **SCSS Mixins vs. Vanilla CSS Rules:** The project has 120+ SCSS mixins, but the new rules say "No SCSS" for components. 
    *   *Resolution:* We must treat the SCSS layer as a "Design System Compiler." The `scss/` folder remains the source of truth for tokens and mixins, but it emits a `system.css` containing **CSS Variables** and **Utility Classes**. Components then consume these variables in their `.module.css` via `var(--cia-spacing-5)` instead of `@include spacing(5)`.
*   **Root `<section>` vs. Semantic Landmarks:** Forcing `<section>` as the root of a `Button` or `MenuItem` is semantically "noisy" and can break accessibility (e.g., a button should just be a `<button>`).
    *   *Resolution:* Update the rule: "The root element must be the most semantic interactive element (e.g., `<button>`, `<nav>`, `<dialog>`). If no specific landmark applies, default to `<section>`."
*   **Fibonacci Strictness vs. Figma Tokens:** Existing `tokens.json` might not align with the Fibonacci rule.
    *   *Resolution:* Use a build script to validate `tokens.json` against the Fibonacci sequence. If a token isn't Fibonacci, it must be flagged as "Intentional/Fixed."

## Q3 — Consumer authoring without per-component SCSS
We serve three distinct profiles:

| Consumer Profile | Mechanism | Benefit |
| :--- | :--- | :--- |
| **Vanilla HTML** | `dist/cia.components.css` | Traditional BEM-like classes (`.cia-card`, `.cia-btn`). Zero JS requirement. |
| **React (Standard)** | Library Props | Consumers use `<Button variant="primary">`. The SCSS/CSS is encapsulated; they never see a `.module.css`. |
| **React (Power User)** | **Utility Composition** | We ship a `utilities.module.css`. Consumers do: `className={[utils['p-5'], utils['bg-brand']].join(' ')}`. This skips the need for a local CSS file entirely. |
| **React (Custom)** | **CSS Variable Bridge** | Consumer creates a local `.module.css`, but uses our system variables: `background: var(--cia-color-primary);`. |

## Q4 — Concrete proposal
1.  **The "System" Export:** Modify the build pipeline to generate `public/system.css`. This file maps all SCSS mixins/variables to CSS Custom Properties (e.g., `--cia-fib-5: 1.3rem;`). 
2.  **Component Utility Generation:** For "Jerry's Note," create a `component-utilities.css` that takes our 45 components and generates global classes (e.g., `.cia-button--primary`).
3.  **React Refactor:** 
    *   If a component (like `Card.tsx`) only applies a base mixin, remove `Card.module.scss`.
    *   Instead, have the component apply a "Global System Class" injected via a global provider or direct import.
4.  **Next 15 Optimization:** Use the `experimental.cssChunking` (if available) or standard CSS module splitting to ensure that if a user only uses `<Button>`, they don't download the CSS for `<DataTable>`.

## Tradeoffs
*   **Strict Fibonacci:** Can lead to "visual jitter" if the designer wants a 10px (non-Fib) gap but is forced to choose 8px or 13px. Requires high design-dev alignment.
*   **Section-Root Rule:** Increases DOM depth slightly. In a heavy list (1000+ items), this could impact interaction latency (INP).
*   **No SCSS in Components:** Losing `@extend` and nested mixins means writing more verbose vanilla CSS, but it significantly simplifies the build pipeline and makes the project "future-proof" for CSS native nesting (supported in all modern browsers).
