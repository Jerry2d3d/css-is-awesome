# Gemini — Software developer (20yr)

## Q1 — Ideas that fit as-is
*   **Logical Properties:** Standardizing on `padding-block` and `margin-inline` is non-negotiable for modern RTL-capable libraries.
*   **Semantic Hierarchy:** The `section → article → div` constraint is a brilliant "fail-fast" for DOM bloat. It forces developers to think about document structure before styling.
*   **Accessibility First:** Using native elements (`<button>`, `<dialog>`) and trapping focus is baseline professional standard.
*   **TypeScript Convention:** Separating `type` (props) from `interface` (data) is a clean, predictable way to navigate types.
*   **Pseudo-element Preference:** Encouraging `::before`/`::after` for decoration keeps the DOM "slim," which I prioritize for performance.

## Q2 — Conflicts (and resolution)
*   **SCSS vs. Vanilla CSS:** The doc says "No SCSS." This is a **hard reject**. We have 120 mixins that *are* the library logic. Writing vanilla CSS in components would mean duplicating the mixin logic manually or losing the link to the tokens.
    *   *Resolution:* Components use `.module.scss`. It remains the "Source of Truth" for applying the mixins.
*   **Fibonacci vs. Tokens:** The doc proposes raw Fibonacci numbers. This creates "two ways to do the same thing" (tokens vs. magic numbers).
    *   *Resolution:* Our tokens *should* be Fibonacci-based, but developers must use the `token()` function or variable. We do not allow `padding: 1.3rem` if `var(--cia-spacing-3)` exists.
*   **Tag Selectors:** The doc prefers `> header` over `.header`. In a component library, this is brittle. If a user needs to wrap a header in a link for SEO, the CSS breaks.
    *   *Resolution:* Use a single class for the root (`.cia-card`) and scoped classes for critical sub-elements to maintain a "predictable contract."

## Q3 — Consumer authoring without per-component SCSS
To satisfy Jerry’s note, we need to stop writing unique CSS for every component and move logic into the Mixin layer.

*   **Mechanism:** The React component becomes a "Thin Wrapper." 
*   **Implementation:**
    ```scss
    // card.module.scss
    .card {
      @include cia.card; // The mixin handles 99% of the logic
    }
    ```
*   **Override Path:** **CSS Variables ONLY.** 
    The mixin should look like this:
    ```scss
    @mixin card {
      background: var(--cia-card-bg, var(--cia-color-surface));
      padding: var(--cia-card-padding, var(--cia-spacing-5));
    }
    ```
*   **Failure Mode:** If a developer tries to override by nesting CSS selectors, they fail. They are forced to provide a style object or a class that sets the `--cia-card-*` variables.

## Q4 — Concrete Proposal
We introduce a "Component Utility" layer in `dist/` for non-React users, generated directly from our mixins.

1.  **New File:** `scss/core-components.scss`. 
    This file loops through our component list and generates standard utility classes.
    ```scss
    .cia-button { @include button-base; }
    .cia-card { @include card-base; }
    ```
2.  **Thin Components:** Refactor `src/components/**/*.module.scss` to be single-line `@include` calls.
3.  **Strict Linting:** Update `.stylelintrc.json` to forbid hardcoded Fibonacci values; force the use of tokens.
4.  **The "Fourth Layer":** `dist/cia-ui.css`. 
    This contains the `.cia-card` etc. classes. Users can drop this in and use standard HTML without SCSS or React.

## Tradeoffs
*   **Pros:** Single source of truth (the Mixin). React and HTML-only users get the exact same styles.
*   **Cons:** The "Thin Wrapper" approach in React feels like "extra steps" for simple components.
*   **Risk:** If the mixins become too complex to handle all variants via CSS variables, we'll end up with "Variable Hell." We must keep the component API surface minimal.
