## Q1 — Bare-tag approach: real talk
Bare-tag styling is a hostile takeover of the global namespace, not a solution. By styling `button` directly, you’ve traded a "utility class trap" for a "specificity and isolation nightmare." Third-party components (calendars, uploaders, icons) will inherit our opinionated styles, forcing consumers into a "reset of our styles" loop. It doesn't solve the three-path problem; it adds a fourth: Global Tag vs. Modifier Class vs. React Prop vs. SCSS Mixin. A library should be a guest in the consumer's codebase, not the landlord. If you want "drop-in," use a specific namespace class on a parent container (`.cia-scope`), but leave the bare tags alone.

## Q2 — Top items to keep from the imported doc (ranked)
1. **Vanilla CSS Modules only** — Mandatory for isolation. It ensures the React layer's styling contract is immutable and side-effect-free.
2. **Fibonacci number convention** — Brilliant. It creates a "soft" contract where developers know what's safe to tweak vs. what's an intentional, "hard" design boundary.
3. **Prefer tag selectors over class names** — Forces semantic HTML. If the CSS relies on `> button`, the dev is forced to use a `<button>`, improving accessibility by default.
4. **No same-element nesting** — The ultimate "div-soup" killer. It forces structural discipline and prevents the recursive "wrapper-of-a-wrapper" madness.
5. **Root class matches kebab-case component name** — Provides a predictable, standard hook for overrides without the chaos of arbitrary naming.
6. **Fully nested selectors** — Ensures the stylesheet is a readable map of the DOM, making maintenance and debugging a spatial exercise rather than a grep hunt.

## My recommendation
Kill the bare-tag styling immediately. Standardize on **CSS Modules for the React layer** and **Mixins for the SCSS layer**, sharing the same **CSS Variables** as the single source of truth. Two paths (Component vs. Mixin) is a bridge; three is a crowd; four is a legacy debt.
