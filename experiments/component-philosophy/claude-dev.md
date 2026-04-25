# Claude — Software developer (20yr)

## Q1 — Ideas that fit as-is

- **TS `type` for props vs. `interface` for data models.** Costs nothing, no runtime impact, and makes intent grep-able. We can adopt it without touching SCSS, the contract, or `package.json` exports. The kebab-case `*.types.ts` filename is fine; co-location is what matters. Conventions like this are pure consumer ergonomics — adopt.
- **`!important` ban.** Already true in our codebase by accident. A grep across `scss/_mixins.scss`, `scss/_utilities.scss`, and `scss/components/_buttons.scss` confirms zero `!important`. Codify as a stylelint rule and it's free.
- **Logical properties (`margin-block` / `margin-inline`).** Strict superset of what we emit. Our `inset-x` / `inset-y` / `squish` mixins in `scss/_mixins.scss:567-583` use physical properties — we can swap them to logical without breaking any consumer. Pure win for RTL.
- **`section → article → div` hierarchy.** Orthogonal to CSS. It's an HTML authoring rule. React components in `src/components/*` can adopt without any library change.
- **Event handlers prefixed `handle`, arrow function default exports, array-syntax className join.** Zero coupling to the CSS library. Adopt at the React layer.
- **Native interactive elements + label/htmlFor a11y rules.** Already our practice (`btn-base` calls `button-reset` — assumes `<button>`). Codify in lint.

## Q2 — Conflicts (and resolution)

- **"Vanilla CSS Modules only — no SCSS" — NOT RESOLVABLE.** Our entire authoring model is `@use 'mixins' as m;` + `@include btn(primary)`. The 800+ LOC mixin API in `scss/_mixins.scss` and the variant router in `scss/components/_buttons.scss:59-82` cannot be expressed in vanilla CSS Modules without losing the parameter API, the `@error` failure modes, or the variant fan-out. Dropping SCSS would force consumers to memorize tokens instead of compose mixins. **Reject.**
- **"Style module required for every component, even if empty" — REJECT.** Directly contradicts Jerry's headline note. An empty file is API surface area for nothing. We require zero CSS files when a consumer doesn't deviate from the base mixin.
- **"Root class = kebab-case component name" — PARTIAL.** Fine as a convention inside a consumer's app. But it conflicts with our published utility API where `.cia-*` is the namespace. We can't ship `.image-picker` — that's the consumer's name in their app, not ours.
- **"Tag selectors over class names + fully nested with `>` combinators" — CONFLICTS WITH MIXINS.** Our mixins emit flat selectors so consumers can apply them anywhere. Forcing nested `> article > header` chains inside a `.card-base` mixin would lock the markup shape. **Resolution:** the rule applies to *consumer's component CSS*, not to library-emitted output. Document the boundary; don't enforce it on the library side.
- **"Fibonacci numbers signal 'safe to adjust'" — CONFLICTS WITH `theme-contract.json`.** Our contract is the source of truth for every spacing/radius/font value. There is no "safe to adjust" zone — values are tokens, full stop. The Fibonacci convention is a workaround for codebases without a token contract. We have one. **Reject for library code.** Consumers may use it in *their* app code if they want, but the library never emits a magic number — every value goes through `space()`, `radius()`, `font-size()`, `m.color()`.
- **"Component root is always `<section>`" — CONFLICTS WITH SEMANTICS.** A `<button>` is a component. A `<dialog>` is a component. A nav link is a component. Forcing `<section>` is wrong by HTML spec for half our components. The doc itself carves out exceptions for `<dialog>` — once you start carving exceptions, the rule isn't a rule. **Reject.**

## Q3 — Consumer authoring without per-component SCSS

The mechanism already exists in two halves; we just need to document the seam.

- **Mechanism.** Consumers compose pre-built classes in HTML/JSX. Two layers:
  - **Layout/spacing/text/color** → `.cia-*` utilities (already shipped via `dist/css-is-awesome.utilities.css`, exported as `css-is-awesome/utilities`).
  - **Components** → React components from the React layer (`<Button variant="primary">`) which internally `@include btn(primary)` once at compile time.
- **Override path (in priority order, fail-loudly contracts).**
  1. **CSS variable override** — themes/pages set `--btn-padding-x: 1.5rem` on `:root` or any scope. The mixin already wraps every property in `var(--key, <default>)` (see `scss/components/_buttons.scss:43-44`). Zero-recompile path. This is the canonical consumer override.
  2. **Mixin re-call with named args** — for design-time customization in the consumer's own SCSS: `.btn-cta { @include btn(primary, $px: 6, $r: full); }`. Required only when CSS-var override can't express the change (e.g. swapping a *variant*, not a *value*).
  3. **There is no third option.** Don't ship a per-component utility class like `.cia-btn-primary` — see Q4 for why.
- **Failure mode.** `btn(banana)` errors at compile via the existing `@error` in `scss/components/_buttons.scss:78`. CSS-var typos silently fall through to the default — that's CSS, can't change it, but the default is always sane.

## Q4 — Concrete proposal

The smallest set of changes. Three of them are docs/lint, one is a tiny build addition. **No new SCSS files. No `.cia-btn-primary` class.**

- **Do NOT add `.cia-btn-primary`, `.cia-card`, `.cia-input`, etc.** Reasoning: it duplicates the React layer (`<Button variant="primary">` already does this), it doubles the override surface (now a consumer can override via class OR via CSS var OR via SCSS — three ways to do the same thing), and every variant we ship as a class is one we can never remove without a breaking change. Component utility classes are a contract trap. The mixin + CSS-var override path already covers vanilla-HTML consumers.
- **File: `docs/AUTHORING.md` (new, ~40 lines).** Document the three-tier model explicitly:
  - Tier 1 (HTML-only, no SCSS): `.cia-*` utilities + CSS-var overrides on `:root`.
  - Tier 2 (React, no SCSS): `<Button variant="primary">` from `@css-is-awesome/react`.
  - Tier 3 (SCSS, deviating from base): `@include btn(primary, $px: 6)`.
  - Explicit anti-pattern callout: "Do not author per-component SCSS just to apply the base mixin. If you're not deviating, use Tier 1 or Tier 2."
- **File: `scss/_overrides.scss` (new, ~30 lines).** A single reference list — every CSS variable a consumer can set to retheme without recompile. Generated from a grep of `var(--btn-*`, `var(--card-*`, `var(--input-*` etc. across `_mixins.scss` and `components/*.scss`. Ship as part of `dist/css-is-awesome.css` as a comment block, or alongside `theme-contract.json` as `component-overrides.json`. This is the missing half of the contract.
- **File: `.stylelintrc` (edit existing).** Add `declaration-no-important: true`. Free.
- **File: `package.json` `exports` (edit existing).** No change needed. We already publish `./core`, `./utilities`, `./min`. The current shape supports the three-tier model. Verified at lines 8-23.
- **File: `src/components/*/types.ts` (gradual adoption).** Move inline prop types to co-located `*.types.ts` files. Pure refactor, no API change.

```
docs/
├── AUTHORING.md                  ← NEW: three-tier consumer doc
scss/
├── _overrides.scss               ← NEW: CSS var override reference (or JSON)
.stylelintrc                       ← EDIT: declaration-no-important
src/components/Button/
├── Button.tsx                     ← EDIT: arrow-fn default export, handle* prefix
├── button.types.ts                ← NEW: extracted prop types
└── Button.module.scss             ← UNCHANGED: still mixin-first
```

## Tradeoffs

- **We say no to per-component utility classes (`.cia-btn-primary`).** Cost: the doc Jerry shared assumes you can author entirely in HTML+CSS. Our answer is "yes — via `.cia-*` utilities + CSS-var theming + the React layer." If the consumer is in raw HTML and wants a primary button styled, they ship our mixin output via the React component or write 3 lines of SCSS. We accept this small friction to keep one canonical override path.
- **We say no to "every component must have a CSS file."** Cost: consumers coming from the imported convention will look for the file and not find it. Doc the convention shift in `AUTHORING.md`.
- **We adopt the TS conventions, logical properties, and `!important` ban.** Cost: minor refactor in `_mixins.scss` (swap `padding-left/right` to `padding-inline` in `inset-x`). Net positive — RTL just works.
- **We reject the Fibonacci convention.** Cost: we lose the "this number is approximate" signaling. Benefit: we never have a value outside the contract. The contract is louder than a number-pattern heuristic.
- **The `_overrides.scss` (or `component-overrides.json`) doc is the load-bearing artifact.** Without it, "override via CSS var" is tribal knowledge. With it, it's a contract — which is the whole reason `theme-contract.json` exists for tokens. Components deserve the same.
