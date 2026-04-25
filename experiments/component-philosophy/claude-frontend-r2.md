# Claude — Front-end dev (20yr) — Round 2

## Q1 — Bare-tag approach: real talk

The vision works for the marketing site / Pico-style demo case and **bites hard the moment a consumer drops in a third-party React lib**. Concrete failures I expect:

- **Specificity inversion vs. CSS Modules.** `button { @include m.btn-base }` is `0,0,1`. Our React layer in `src/components/Button/Button.module.scss` compiles `.default { @include m.btn-base }` → `.Button_default__hash` (`0,1,0`). Module wins, good — but **only if the global bare-tag CSS is loaded *before* the module CSS**. In Next 15 with `output: "export"` (per `next.config.mjs`), the CSS Modules chunk is emitted into `_next/static/css/*.css` and injected via `<link>` in route order. If a consumer drops `dist/css-is-awesome.css` via a `<link>` in their own `app/layout.tsx`, it lands in the head *after* Next's build-time chunks unless they import it from the root layout module graph. Order is non-obvious and non-deterministic across versions. We will get bug reports about "padding looks different in prod vs. dev" that trace to head ordering.

- **Third-party React libs get hijacked.** `react-select` renders an internal `<button>` for the clear/dropdown indicators. Headless UI's `<Menu.Button>` is a real `<button>`. `react-datepicker` has 30+ unstyled `<button>` elements in its calendar grid. The moment we ship `button { padding: var(--btn-padding-x) … ; background: m.color(action-primary-default); border-radius: m.radius(md) }`, every one of those becomes a giant blue pill. The fix is `button:not([data-cia-skip]) { … }` plus docs telling consumers to set `data-cia-skip` on every third-party root — which nobody will do. **This is the single biggest reason Pico stays niche.**

- **Form libraries.** Formik / React Hook Form don't wrap inputs — they pass props through to a native `<input>`. So `input { @include input-base }` is fine *for the input itself*. The bite is `<input type="checkbox">` and `<input type="radio">` — bare-tag `padding: m.space(1)` on `input` makes checkboxes hilarious. We need attribute-narrowed selectors: `input:where(:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]))`. That's not a one-liner mixin call anymore.

- **CMS-emitted HTML.** This is where it WINS. WordPress / Contentful / Sanity portable-text outputs raw `<button>` / `<table>` / `<blockquote>` / `<figure>`. Today those render unstyled in our static export. With bare-tag, they "just work." This is the actual user story Jerry wants and it's real — markdown blog posts, MDX, static HTML embeds, all get a free coat of paint.

- **Reset.** We ship no reset today. If we go bare-tag, **modern-normalize MUST land before our bare-tag layer** or Safari's default `button` font-family will leak through, Firefox's `<fieldset>` border will show, etc. That's a third file (`reset.css`) the Tier-1 consumer drops in. It's still simple, but it's no longer "one CSS file + theme."

- **`.cia-*` utilities coexist, they don't get replaced.** Bare-tag styles shape; utilities position/space (`.cia-stack-3`, `.cia-grid-cols-3`). Different concerns, different specificity, no collision. Keep both, document them as Layer 1 (shape via tags) + Layer 2 (compose via utilities).

- **It tips the system from "mixin-first" to "global stylesheet that uses mixins."** Mixins remain the source of truth (the bare-tag layer just calls `@include btn-base` etc.), but the *consumption surface* is now global CSS. That's a philosophy shift Jerry should own consciously, not slide into.

The fix that makes this shippable: use **CSS cascade layers** (`@layer reset, base, components, utilities, overrides`) so order is enforceable rather than head-position-dependent, and gate the bare-tag rules behind `:where(…)` to keep specificity at `0,0,0`. Then React Module classes (`0,1,0`) and consumer overrides (`0,1,0`+) both beat the bare-tag layer trivially. That neutralizes 80% of the failure modes above.

## Q2 — Top items to keep from the imported doc (ranked)

1. **Logical properties (`margin-block` / `padding-inline`)** — Already partial in our mixins. A bare-tag `button { padding-block: …; padding-inline: … }` rule is RTL-correct on day one; physical properties would need a per-locale override later. Free RTL story is the highest-ROI item in the doc.
2. **`!important` ban** — Critical when bare-tag rules and `.cia-*` utilities coexist with consumer overrides. If we ever emit `!important` in `_buttons.scss`, every consumer override becomes a fight. Lock with `stylelint declaration-no-important`.
3. **Native interactive elements + `htmlFor` a11y** — Already our practice in `Button.tsx` (renders `<button>` or `<a>`, never a div with onClick). This is exactly what makes bare-tag styling viable: if consumers also use semantic elements, our CSS hits the right targets. Lock with `eslint-plugin-jsx-a11y`.
4. **`*.types.ts` co-location** — Pure stylistic win. Lets `Button.tsx` shed its inline `ButtonProps` union into `button.types.ts`. Improves IDE tree-shake of type-only imports. Adoptable per-component, no migration.
5. **Pseudo-elements over decorative DOM** — Already idiomatic in our SCSS. Codify it because it's load-bearing for bare-tag: every wrapper div we add is one more thing third-party libs can collide with.
6. **`handle*` event-handler prefix** — Cosmetic but cheap. `Tabs.tsx` already does `handleKey`. Codify so future `Dropdown`/`Modal` components don't drift.
7. **Class joining via array `.join(' ')`** — Already what `Button.tsx` does (`[styles[variant], extra].filter(Boolean).join(" ")`). Codify so contributors don't reach for `clsx`/`classnames`.

**Items that only make sense inside a consumer's app, NOT in our library** (rejected for our purposes):
- *"Component root is always `<section>`"* — would break `Button.tsx`, `DataTable.tsx`, `Modal.tsx` (already a `<dialog>`), `Toast.tsx`. Hard reject.
- *"Vanilla CSS only, no SCSS"* — kills the mixin API which IS the system. Hard reject.
- *"Style module required for every component, even if empty"* — directly contradicts Jerry's "no SCSS unless you change a mixin" rule. Hard reject.
- *"Fibonacci as soft-value convention"* — useful framing for consumer app code; we have `theme-contract.json` + `m.space()` doing the same job more rigorously. Skip for library code.

## My recommendation

Ship bare-tag, but ship it **inside `@layer base`** with `:where(…)` selectors so specificity stays at `0,0,0`. Ship `modern-normalize` in `@layer reset` ahead of it. That neutralizes the third-party-React-lib hijack problem and makes consumer overrides trivial. Keep `.cia-*` utilities in `@layer utilities` — they coexist, they don't replace. Don't strip the React Module layer; the `<Button>` component remains the React consumer's path. Three concentric tiers, one cascade-ordered stylesheet.
