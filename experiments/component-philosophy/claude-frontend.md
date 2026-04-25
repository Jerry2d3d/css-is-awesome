# Claude — Front-end dev (20yr)

## Q1 — Ideas that fit as-is

- **`*.types.ts` co-location.** Drop-in next to `Button.tsx`. Zero runtime cost, helps tree-shake type imports and keeps `forwardRef<HTMLElement, Props>` signatures readable. Adoptable per-component without a migration.
- **Block/inline logical properties.** Already partially used in our mixins; cheap to enforce with a stylelint rule (`csstools/use-logical`). RTL story improves for free.
- **Fibonacci-as-soft-value convention.** Maps cleanly onto our numbered scale (1..9) — values from `m.space($n)` already emit "approximate, theme-driven"; raw `1.3rem` literals are the escape hatch. We just need to document the signal.
- **`handle*` event-handler prefix + arrow-function helpers.** Stylistic, costs nothing, matches what `Tabs.tsx` already does in spirit (`handleKey`).
- **No `!important`.** Spot-check confirms our component mixins don't emit it; we can lock it in with a stylelint `declaration-no-important` rule.
- **Pseudo-elements over wrapper divs.** Already idiomatic in our SCSS; no change needed.

## Q2 — Conflicts (and resolution)

- **"Vanilla CSS Modules only, no SCSS."** Hard conflict. Our entire mixin API is SCSS — the `@include m.btn(primary)` pattern is the system. Resolution: keep SCSS Modules as the *authoring* layer for our React components and for consumers who want mixin power. Add a parallel **utility-class layer** so consumers who want the doc's "no preprocessor" feel never have to touch SCSS. The pipeline already produces `dist/css-is-awesome.css`; we extend it with a components bundle (Q4).
- **"Per-component `.module.css` is required, even if empty."** Conflicts with Jerry's "no SCSS file unless you change a mixin." Resolution: invert the rule — the `.module.scss` is *optional* for consumers, *required* only inside our published `src/components/*` because we ship the React component. Lint enforces only the inside-our-repo case.
- **"Root is always `<section>`."** Conflicts with semantically-correct roots: `Button` must render `<button>` / `<a>`; `DataTable` renders `<table>`; `Tabs.Panel` is a `role="tabpanel"` div. Resolution: adopt the spirit (semantic roots) but reject the literal rule. `Button.tsx` is correct as-is.
- **CamelCase module class names** (`styles.itemInteractive`) vs **kebab-case** (`style['image-picker']`). Cosmetic. Resolution: keep camelCase — it survives `Object.keys` introspection, plays nicely with `classnames`-style joiners, and avoids `style['x']` bracket noise. Not worth a churn.
- **Class joining via `[a, b].join(' ')` array syntax.** Already what `Button.tsx`, `Tabs.tsx`, and `DataTable.tsx` do (`.filter(Boolean).join(" ")`). No conflict.
- **Default export only.** `Tabs.tsx` exports both named (`Tabs`) and default (`TabsWithSub` compound). Hard requirement for the compound-component pattern; the doc's rule must bend here. Keep both.

## Q3 — Consumer authoring without per-component SCSS

Three consumer profiles, three paths. The mechanism per profile is what matters:

1. **Vanilla HTML / no React, no SCSS.** Today they get layout/spacing utilities but nothing component-shaped. Mechanism: **ship `dist/css-is-awesome.components.css`** — a pre-built bundle of `.cia-card`, `.cia-btn`, `.cia-btn-primary`, `.cia-input`, `.cia-tag`, etc., generated from the existing component mixins. Add to `package.json` `exports` as `./components`. They drop a `<link>` and write `<button class="cia-btn cia-btn-primary">`.

2. **React consumers using OUR `<Button>`.** Already solved. `<Button variant="primary">` works today — no SCSS, no CSS Modules on their side, just an import from our package's `exports` field (which currently isn't exposed for components — see Q4).

3. **React consumers building their OWN components on top of our system.** Today they write `Foo.module.scss` containing `@include m.btn(primary)`. Mechanism to skip the SCSS file: let them reuse the same generated component utility classes via a tiny `cn()` helper or just `className="cia-btn cia-btn-primary"` on a plain `<button>`. They only need a `.module.scss` when they want to *deviate* from the base mixin (override padding, change focus-ring color, etc.) — which matches Jerry's rule exactly.

The unifying mechanism is the **component utility bundle** — same source of truth (the mixins), three consumption surfaces (CSS bundle, React component, hand-rolled JSX with utility classes).

## Q4 — Concrete proposal

Smallest set of changes to enable "no per-component SCSS unless changing base mixins":

**1. Add `scss/components-utilities.scss` — generates `.cia-*` component classes from existing mixins.**

```scss
// scss/components-utilities.scss  (NEW)
@use 'components/buttons' as b;
@use 'components/forms' as f;
@use 'components/feedback' as fb;
// ... etc

.cia-btn          { @include b.btn-base; }
.cia-btn-primary  { @include b.btn(primary); }
.cia-btn-outline  { @include b.btn(outline); }
.cia-btn-ghost    { @include b.btn(ghost); }
.cia-card         { @include fb.card-base; }
.cia-input        { @include f.input-base; }
.cia-tag          { @include fb.tag-base; }
// ...one line per public component variant
```

**2. Extend the build pipeline.** Add to `package.json`:

```json
"build:css:components": "sass scss/components-utilities.scss dist/css-is-awesome.components.css --no-source-map",
"build:css:components:min": "sass scss/components-utilities.scss dist/css-is-awesome.components.min.css --style=compressed --no-source-map"
```

Wire into `build:css:all` and `prepublishOnly`.

**3. Extend `package.json` `exports`:**

```json
"./components": "./dist/css-is-awesome.components.css",
"./components/min": "./dist/css-is-awesome.components.min.css"
```

Vanilla-HTML consumers do `<link href="…/css-is-awesome/components">`.

**4. Expose React components for npm consumers (currently NOT exported).**
   `package.json` `exports` ships only CSS today — `src/components/Button` is not in the published surface. Add a build step (`tsup` or `tsc --emitDeclarationOnly` + a small bundler) that emits `dist/react/index.js` + types, then:

```json
"./react": { "types": "./dist/react/index.d.ts", "default": "./dist/react/index.js" }
```

This is a separate increment — gates the "React consumer" path of Q3 from being purely theoretical. Until we ship it, only consumers in *this* repo (the docs site) get the React layer.

**5. Lint rules (low cost, high signal).**
   - `stylelint` `declaration-no-important: true`
   - `stylelint` `csstools/use-logical: always`
   - ESLint rule (or just docs) for `handle*` prefix on event handlers in `src/components/**`.

**6. Docs page** — `src/app/docs/recipes/component-without-scss/page.tsx` showing the three consumer profiles side-by-side. Concrete, no philosophical hand-waving.

Files touched:
- `scss/components-utilities.scss` (NEW)
- `package.json` (add scripts + exports)
- `.stylelintrc` (new rules)
- `src/app/docs/recipes/component-without-scss/page.tsx` (NEW docs entry)

Files NOT touched: every existing `src/components/*/Component.module.scss`. Our React components keep using mixins directly — they have zero migration. The new bundle is purely additive.

## Tradeoffs

- **Bundle size.** Component utilities are ~10–20 KB pre-min on top of the existing CSS. Static export consumers pay this only if they import `./components`. React consumers using `<Button>` pay nothing — CSS Modules continue to scope per-component.
- **Two ways to do it.** A React consumer could now write `<button className="cia-btn cia-btn-primary">` *or* `<Button variant="primary">`. Documentation has to clearly say: "Use `<Button>` if you're in React; use `.cia-btn-primary` if you're in vanilla HTML or want a single styled element without a component wrapper." Not a real conflict, but a teaching cost.
- **Class-name surface becomes public API.** Renaming `.cia-btn-primary` is now a breaking change. Lock it under semver and the theme contract.
- **Specificity.** Utility classes are flat `.cia-btn-primary` (specificity 0,1,0); CSS Module classes hash to roughly the same. Order in the cascade matters — components bundle should ship *before* user overrides in `<head>`. Document it.
- **No SSR/RSC impact.** Static export (`output: "export"` in `next.config.mjs`) means React 19 server components render to HTML at build; CSS Modules still hash; the new bundle is just a global stylesheet. Hydration unaffected.
- **What we give up.** The doc's "every component has a `.module.css`, even if empty" rule is rejected. We trade that uniformity for the freedom Jerry wants: consumers stop writing styling files unless they actually have something to say.
