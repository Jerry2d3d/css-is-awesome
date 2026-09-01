---
applyTo: "**"
---

# css-is-awesome — system instructions

Authoring rules for css-is-awesome itself AND for consumer apps that use it. Drop this file at the repo root of any project that consumes the library; AI assistants (Cursor, GitHub Copilot, Claude Code, etc.) will pick it up via the `applyTo:` glob.

## TL;DR — three consumer tiers, pick the lowest one that works for you

1. **Tier 2 — mixins (the primary path).** `@use 'css-is-awesome/api' as cia;` then `.your-class { @include cia.btn(primary, $px: 6); }`. You name the selector; cia supplies the look. Needs a Sass build.
2. **Tier 1 — drop-in CSS (no build).** Link `dist/css-is-awesome.css` and a theme file, then use `.cia-*` utility classes in markup.
3. **Tier 3 — bare tags (Pico-mode).** `@use 'css-is-awesome/scss/recipes/bare-tags';` styles every common HTML element, wrapped in `:where()` so your own styles always win.

**cia ships zero JavaScript and no component library.** There is no `<Button>` to import from this package. If you want React components, you write them in your app and style them with cia mixins; for interactive patterns read the *recipes* (see below) rather than inventing markup.

You only write per-component SCSS when you're deviating from a base mixin's defaults — and even then, deviate through the mixin's **arguments**, not hand-written CSS.

---

## File structure (React components)

Convention for **your** app's components (and cia's own docs site) — the npm package itself ships no React. Each component lives in its own folder under `src/components/`:

```
src/components/Button/
├── Button.tsx               (PascalCase — the component file)
├── Button.module.scss       (PascalCase — the styles, OPTIONAL)
├── button.types.ts          (kebab-case — types, OPTIONAL)
└── index.ts                 (re-export barrel)
```

- **Component file** — PascalCase: `Button.tsx`.
- **Style module** — PascalCase: `Button.module.scss`. **Optional** — only create when you're overriding a base mixin or adding component-specific styles. Don't create empty SCSS files.
- **Types file** — kebab-case: `button.types.ts`. **Optional** — only when prop unions are non-trivial (multiple discriminated variants, exported sub-types, generic constraints). Tiny components can keep types inline in the .tsx file.
- **Barrel** — `index.ts` re-exports default + named exports.

---

## Styling — when to write SCSS, when not to

### Don't write SCSS when

You're applying the default look and Tier 1 utilities are enabled — put `class="cia-btn cia-btn-primary"` straight in the markup, no stylesheet needed.

### Do write SCSS when

You're deviating from a base mixin's defaults. Then:

```scss
// MyButton.module.scss
@use 'css-is-awesome/api' as cia;

.myCta { @include cia.btn(primary, $px: 6, $r: full); }
```

### Mixin-first

Every visual primitive in the library is a mixin (`btn-base`, `card-base`, `input-base`, `tag`, etc.) plus a router (`btn($variant)`, `alert($status)`, `badge($status)`). Variants are reached by name, not by class. The mixin is the API; classes (utilities + React component classes) are consumers of it.

### Apply token-driven values, not literals

```scss
// Yes — token-driven, theme-swap-safe.
padding-block: cia.space(2);
color: cia.color(text-primary);
border-radius: cia.radius(md);

// No — literal, breaks theme-swap.
padding: 8px;
color: #2A241E;
border-radius: 4px;
```

Tokens come from the theme contract (`scripts/theme-contract.json` — **127 required + 36 optional = 163 slots**). A single theme file styles the page on its own (it emits a bare `:root`); when several themes are loaded together they swap via `<html data-theme="press-light">`. Either way every token resolves to the active theme's value.

Spacing is a token too. `cia.space(4)` resolves to `var(--space-4)`, and the numbered scale `--space-0`…`--space-9` is contract-required, so a theme can re-proportion the page and not just recolor it.

### Flex via `cia.flex`

`cia.flex` is the one flex primitive. Pass only what differs from the
defaults — `$direction: row`, `$align: center`, `$justify: start`,
`$wrap: nowrap`, `$gap: null`, `$inline: false`.

```scss
// Header bar / accordion trigger
@include cia.flex($justify: between, $gap: 3);

// Vertical stack with gap
@include cia.flex($direction: column, $gap: 4);

// Perfectly centered children
@include cia.flex($justify: center);

// Inline chip lockup
@include cia.flex($inline: true, $gap: 2);
```

`$justify` accepts the shorthand `start`/`end`/`center`/`between`/
`around`/`evenly` (mapped to `flex-start`/`flex-end`/`space-between`/
etc. on emit). `$align` accepts `start`/`end`/`center`/`baseline`/
`stretch`. Full CSS values pass through unchanged, so
`$justify: space-between` still works if you prefer the long form.
The shorthand matches the `cia-justify-between` / `cia-items-center`
utility-class vocabulary.

### No `!important`

Banned. Stylelint enforces (`declaration-no-important: true`). Sole exception: inside `@media (prefers-reduced-motion: reduce)` overrides for accessibility, where `!important` is the canonical pattern (and explicitly disabled with a comment).

If you're tempted to reach for `!important`, the right answer is one of: (a) use `:where(...)` to drop the library selector to specificity 0, (b) override the relevant CSS variable, (c) call the mixin with explicit args.

### Logical properties — required for new code

Use `padding-block` / `padding-inline` / `margin-block` / `margin-inline` / `border-block-start` / etc. Don't use `padding-top` / `margin-left` / `border-left` etc. unless you specifically need physical (rare).

```scss
/* Yes */
padding-block: cia.space(2);
padding-inline: cia.space(4);
margin-block-end: cia.space(3);
border-block-end: 1px solid cia.color(border-default);

/* No */
padding-top: cia.space(2);
padding-bottom: cia.space(2);
padding-left: cia.space(4);
padding-right: cia.space(4);
margin-bottom: cia.space(3);
border-bottom: 1px solid cia.color(border-default);
```

Logical properties auto-flip for RTL languages (Arabic, Hebrew) and vertical writing modes. The library's internal mixins emit logical properties.

> **Note on the public utility classes (`.cia-mt-*`, `.cia-mr-*`, `.cia-pl-*`, etc.):** these still emit physical properties in v1.x to preserve API stability for early adopters. They will migrate to logical properties in v2.x.

### Pseudo-elements over decorative DOM

Decorative? Use `::before` / `::after`. Functional (focusable, interactive, semantic)? Use a real element.

```tsx
// Yes — decoration via pseudo-element
<button className="my-btn-with-shine">Save</button>

// .my-btn-with-shine::after { content: ""; ... }

// No — decoration via wrapper
<button>
  <span className="shine-overlay" />
  Save
</button>
```

Pseudo-elements aren't focusable, aren't tab stops, screen readers ignore them by default — exactly what you want for decoration.

### Sizing units

Order of preference: **rem → em → vw/vh → ch → %**.

- `rem` for spacing, font sizes, layout (consistent scale, scales with user font preferences).
- `em` for sizes relative to current element font size.
- `vw` / `vh` (or `svw` / `svh`) for viewport-relative layout. Use common fractions: `25vw`, `50vw`, `75vw`.
- `ch` for text-width sizing.
- `%` only when the size genuinely must be a percentage of the parent (`width: 100%` to fill).

### Print / PDF

Print is a pure-CSS layer — zero JS. "The page IS the PDF source." The
browser's native Print → Save as PDF is the generator; cia just supplies the
`@media print` styling. Four mixins:

- **`print`** — bare `@media print { @content }` wrapper. Co-locate it inside
  a selector to override that element on paper.
- **`print-base($freeze-animations: true, $size: letter, $margin: 0.5in)`** —
  page-level defaults, ON by default. Include it **once at the stylesheet
  ROOT** — it emits `@page` (invalid when nested in a selector), freezes
  animations so nothing prints invisible, and emits the print variable
  control plane.
- **`print-hidden`** — hide an element on paper (the "hide the nav" case).
- **`print-only`** — show an element only on paper (e.g. an inline URL
  footer); hidden on screen.

```scss
@use 'css-is-awesome/api' as cia;
@include cia.print-base;                 // at ROOT — sets @page, freezes animations, emits vars
.site-nav { @include cia.print-hidden; } // hide chrome on paper
```

`print-base` emits three custom properties — the variable filter system:

- **`--is-print`** — `0` on screen, `1` on paper. Read it in `calc()` /
  `opacity` / `@container style(--is-print: 1)` for custom print effects.
- **`--print-hide`** — display applied to `print-hidden` elements (default
  `none`). Override locally (`--print-hide: revert`) to keep one element on
  paper with no rule rewrite.
- **`--print-show`** — display applied to `print-only` elements (default
  `revert`). Override locally (`--print-show: flex`) to lay out a print-only
  block.

Visibility is variable-driven by design: override `--print-hide` /
`--print-show` per element instead of rewriting rules.

---

## HTML & semantic structure

### Use native interactive elements

```tsx
// Yes
<button onClick={handleClose}>Close</button>
<a href="/about">About</a>
<dialog open={isOpen}>...</dialog>
<input type="checkbox" />

// No — never
<div onClick={handleClose}>Close</div>
<span onClick={navigate}>About</span>
<div role="dialog">...</div>           // unless you're doing something a real <dialog> can't
```

Native elements come with keyboard handling, focus management, and screen-reader semantics for free. `<div onclick>` requires re-implementing all three; people miss steps.

Enforced by `eslint-plugin-jsx-a11y` (already in `next/core-web-vitals`).

### Form controls need labels

```tsx
// Yes
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// or wrap
<label>
  Email
  <input type="email" />
</label>

// or your own field wrapper, styled with cia.form-group / cia.label-base / cia.input-base
<FormField label="Email"><input type="email" /></FormField>
```

### Element hierarchy guidance

For new components, prefer the most semantic native root: `<button>` for a button, `<dialog>` for a modal, `<table>` for tabular data, `<nav>` for navigation, `<article>` for self-contained content blocks, `<section>` for major content groupings. **Avoid `<div>` as the root unless no semantic element fits.**

The library does NOT enforce a single root element across all components — `Button` is `<button>`, `Modal` is `<dialog>`, `DataTable` is `<table>`, etc.

### No same-element nesting

Never nest an element inside the same element type:

- No `<div>` inside `<div>`. Find the semantic tag that belongs there (`<header>`, `<nav>`, `<aside>`, `<section>`, `<article>`).
- No `<span>` inside `<span>`. Same — pick the semantic inline tag.
- No `<p>` inside `<p>`. Browsers will silently break this; the inner `<p>` closes the outer.

### Minimal DOM

Every element must earn its place. If removing it changes nothing visually or semantically, remove it. Use pseudo-elements for decoration (see above).

---

## TypeScript

### `type` for props, `interface` for data models

```ts
// Component props
type ButtonProps = {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  onClick?: () => void;
};

// Data entities
interface User {
  id: string;
  email: string;
  name: string;
}
```

`type` for value shapes, function signatures, unions, intersections. `interface` for entities that might be extended (API responses, domain objects, things you might `extends` later).

### Co-locate types

Tiny components keep types inline in the `.tsx`. Components with non-trivial type surface (`DataTable`, `Tabs`, `Modal` with a discriminated prop union) extract types into a sibling `component-name.types.ts`:

```
src/components/DataTable/
├── DataTable.tsx           // component logic only
├── data-table.types.ts     // Column<T>, SortState, DataTableProps<T>, etc.
└── DataTable.module.scss
```

---

## Component authoring

### Arrow-function default export

```tsx
const Button = (props: ButtonProps) => {
  // ...
};
export default Button;

// Named-only (no default) is fine for pure helpers, but components default-export.
```

For compound components (`Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`), export a default that has named properties attached: `Tabs.List = TabsList; export default Tabs;` — this is the React convention for compound components.

### Internal helpers use arrow functions

```tsx
const handleClose = () => { ... };
const formatLabel = (name: string) => name.replace(/-/g, " ");
```

### Event handlers prefixed `handle`

`handleClose`, `handleSelect`, `handleToggle`, `handleKey`. Prop callbacks for handlers stay as `onClose`, `onSelect`, etc. (the `on*` is the React prop convention; `handle*` is the local function convention).

### Class-name joining via array

```tsx
className={[styles.btn, variant && styles[variant], className].filter(Boolean).join(" ")}
```

Don't use template-string concat. Don't reach for `clsx`/`classnames` for the simple cases — the array+filter+join idiom is sufficient and dependency-free.

### State management

- Local `useState` for component-specific UI state (open/close, selected item, loading).
- Lift to context only when multiple unrelated components need the same data.
- No global stores in this library — consumers can wire their own.

### Conditional rendering

```tsx
// Guard clause for early null
if (!open) return null;

// Inline ternary for simple branches
return (
  <section>
    {loading ? <Spinner /> : <List items={items} />}
  </section>
);
```

---

## Theming

### One file = one theme

Each theme is a single file declaring all **127 required** contract tokens (plus any of the 36 optional ones it wants). It emits **two selectors at once**:

```css
:root, :root[data-theme="<name>"] { … }
```

- The bare `:root` makes a theme **drop-in**: serve one theme file as your `theme.css` and the page restyles with **no markup change**. `data-theme` is optional in that case.
- The `[data-theme]` half is what lets several themes coexist. `public/theme.css` ships all 24 themes consolidated; there, `<html data-theme="<name>">` is **required**, and the bundle is built with `$standalone: false` so the bare `:root` is dropped and the blocks can't collide.

Per-theme files at `public/themes/<name>/theme.css` are also published for download. All shipped blocks pass the WCAG 2.2 AA contrast audit (22 pairs per theme) out of the box.

**24 themes across 8 families.** Every family ships three files: the unsuffixed parent (both modes in one file via `light-dark()`) plus explicit `-light` and `-dark` siblings that pin a single `color-scheme`. Families: `sketchbook` (default), `press`, `graphite`, `glass`, `cupertino`, `terminal`, `prism`, and the unbranded `boilerplate` starter. The unsuffixed names are **first-class themes, not backward-compat aliases** — `sketchbook` is the auto-switching one, `sketchbook-light` / `sketchbook-dark` are the pinned ones. `terminal` is the one asymmetry: its unsuffixed file is dark-only (sacred), so `terminal-light` is a separate brand rather than its light mode.

Library defaults emit under **`:where(:root)`** (specificity 0,0,0), so any theme declaration outranks them regardless of load order. This is `:where()` and deliberately **not** `@layer` — cia is unlayered by decision.

### Add a theme

1. Read `scripts/theme-contract.json` — declare every required token (127 required slots in v1; 36 more are optional). That includes the numbered spacing scale `--space-0` … `--space-9`.
2. Author it through the mixin, never a hand-written selector:
   ```scss
   // @mixin theme($name, $scheme: light dark, $standalone: true)
   @include m.theme('mybrand') { --paper: light-dark(#fff, #0b0b0f); /* … */ }
   ```
   Pass `$standalone: false` only for a block destined for a multi-theme bundle.
3. Run `npm run build:css:themes` — it builds every theme **and** regenerates `public/theme.css`. It is part of `npm run build:css:all`.
4. Run `npm run validate-themes` to confirm the contract. The validator also runs a WCAG 2.2 AA contrast audit; a11y FAILs are fatal by default. Pass `--allow-a11y-fail` to downgrade contrast failures to a report-only warning while you iterate (the older `--strict` flag is accepted as a no-op alias).
5. Run `npm run check:theme-drift` to prove the committed CSS matches the SCSS source. CI runs this **before** `validate-themes`, because `validate-themes` reads the committed CSS and would otherwise pass on a stale artifact.
6. Add the theme name to `ThemePicker`'s `THEMES` array and the layout's `VALID_THEMES` set.

**Never hand-edit `public/theme.css` or `public/themes/**/theme.css`.** They are generated from `scss/themes/*.scss` and gated by `check:theme-drift`.

See `/docs/authoring/themes` on the docs site (https://jerry2d3d.github.io/css-is-awesome/docs/authoring/themes/) for the full guide.

### Spacing is themeable — set the numbered step

The numbered scale (`--space-0` … `--space-9`) is the source of truth and is contract-required. The six t-shirt names (`--space-2xs`, `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl`) are **optional**, and the library emits them as `var()` references:

```css
--space-md: var(--space-4);   /* alias follows the step */
```

Components call `cia.space(4)` → `var(--space-4)`. The t-shirt names previously emitted as independent literals, so a theme that set only `--space-md` moved a variable nothing read — which is why theme swaps used to recolor the page but never re-proportion it. **Set the numbered step.**

### Radius: the per-component knobs

`--radius-avatar` / `--radius-badge` / `--radius-button` / `--radius-card` / `--radius-input` / `--radius-modal` were removed from the contract because nothing read them. Use the knobs that are actually wired: `--btn-radius`, `--card-radius`, `--input-radius`, `--modal-radius`, `--badge-radius`, `--tag-radius` (all optional). Each cascades from a generic radius — `--btn-radius: var(--radius-md, 0.25rem)` — so set `--radius-md` to move everything, or the component knob to move one thing.

### Adding fonts — two lines

```css
/* 1) Declare the slug in your global stylesheet (globals.css, theme.css, etc.) */
:root {
  --font-meme: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
```

```scss
/* 2) Use it from any component (mixin form OR raw CSS — both work) */
.logo  { @include cia.font($family: meme, $color: text-primary, $lh: 0.95, $ls: -0.01em); }
.stamp { font-family: var(--font-meme); }
```

`cia.font` takes every text-style property in one call: `$type` (weight + style preset), `$size`, `$lh`, `$ls`, `$family`, `$color`. Pass only what you need — null defaults skip the emit.

`cia.font($family: <slug>)` emits `font-family: var(--font-<slug>);` — no registration, no Sass-side magic. The slug is just a CSS variable name. As long as `--font-<slug>` is declared *somewhere* in scope (globals, theme, page, block), the browser resolves it.

**Override anywhere CSS variables work:**

```scss
:root             { --font-meme: 'Inter', sans-serif; }   // site-wide
[data-theme="x"]  { --font-meme: 'Press Start 2P', monospace; }  // per-theme
.landing-page     { --font-meme: 'Caveat', cursive; }     // one page
.hero             { --font-meme: 'Pacifico', cursive; }   // one block
<h1 style="--font-meme: 'Comic Sans MS'">                 // one element
```

**Hosted fonts (Google Fonts / CDN)** — use `cia.font-face(name, url)` from a *global* Sass file (not a `.module.scss`, because CSS Modules' pure mode rejects the `@import` placement). It registers the URL once and emits the `@import url(...)`.

```scss
// src/styles/fonts.scss (a global .scss imported from layout.tsx)
@include cia.font-face('Pacifico', 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
```

```css
/* src/app/globals.css — declare the variable that components consume */
:root { --font-pacifico: 'Pacifico', cursive; }
```

```scss
/* component */
.headline { @include cia.font($family: pacifico); }
```

**Self-hosted fonts** — `cia.font-face-local('Untitled Sans', '/fonts/UntitledSans.woff2')` for the `@font-face` declaration; declare the CSS variable separately the same way.

---

## Accessibility

- Native interactive elements (above) are the foundation.
- All images have `alt` text.
- Form controls have `<label>` (above).
- Use `role` and `aria-*` only when native semantics are insufficient — e.g., disclosure widgets, custom dropdowns, ARIA live regions.
- Keyboard navigation works: dialogs trap focus, Escape closes overlays, arrow keys cycle through tab lists.
- Focus rings come from `cia.focus-ring` (or `:focus-visible`) — don't remove the outline without a replacement.
- Honor `prefers-reduced-motion` — animation mixins do this automatically; don't fight it.
- Color is never the only cue — pair status colors with an icon or text label.

---

## Recipes — build a component without a component library

cia ships **no component library on purpose**. When you need an interactive
pattern (dialog, combobox, print-to-PDF), read the matching *recipe* instead of
inventing markup or reaching for a dependency.

A recipe is a markdown file at `scss/recipes/<name>.md` carrying:

- the raw, correct HTML structure (native elements first)
- the `cia.X` mixin calls that style it
- an a11y checklist graded against WCAG 2.2 AA
- framework-neutral notes so it ports to React / Vue / Svelte / vanilla

**Shipped today:** `dialog`, `combobox`, `print-to-pdf`. Queued next:
`datepicker`, `data-table`, `command-palette`.

How to reach them:

- **AI agents** — `list_recipes` / `get_recipe(name)` over MCP. Prefer this over
  writing an interactive pattern from memory; the recipe encodes the a11y work.
- **Humans** — `/docs/recipes` on the docs site (https://jerry2d3d.github.io/css-is-awesome/docs/recipes/), or read the markdown directly.

Note the two different things living in `scss/recipes/`: `<slug>.md` files are
*pattern* recipes (read them, don't import them), while `_<slug>.scss` files —
e.g. `_bare-tags.scss` — are real opt-in SCSS you `@use`.

---

## Versioning & contributions

- **SemVer** post-1.0 strictly. Breaking changes bump major. See `VERSIONING.md`.
- **Conventional Commits** drive the auto-changelog. `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` etc.
- **CONTRIBUTING.md** has the full setup, PR, and review flow.
- **`.github/ISSUE_TEMPLATE/`** for bug reports, feature requests, theme submissions.

---

## Decision tree — which tier should I use?

**Q1: Do you have a Sass build?**

- **No** → Tier 1 (drop-in CSS). Link `dist/css-is-awesome.css` + a theme file. Use `.cia-*` utilities in markup.
- **Yes** → Q2.

**Q2: Do you want to style plain HTML elements wholesale (`<h1>`, `<button>`, `<table>`) without adding classes?**

- **Yes** → Tier 3 (Pico-mode). `@use 'css-is-awesome/scss/recipes/bare-tags';` once. It's `:where()`-wrapped, so anything you write later wins.
- **No, I'm styling my own components** → Q3.

**Q3: Is there a cia mixin for what you're building?**

- **Yes** → Tier 2 (the primary path). `Component.module.scss`, `@use 'css-is-awesome/api' as cia;`, `.myCta { @include cia.btn(primary, $px: 6); }`. Reach every variation through the mixin's **arguments**.
- **No mixin fits, and it's an interactive pattern (dialog, combobox, …)** → read the matching **recipe** (`get_recipe` over MCP, or `scss/recipes/<name>.md`). Don't invent the markup.
- **No mixin fits, and it's novel** → compose the primitives (`cia.flex`, `cia.stack`, `cia.pad`, `cia.font`, `cia.color`, `cia.space`). If a visual dimension is only reachable by hand-written CSS, that's a **missing mixin input** — add it.

---

## Anti-patterns (don't do these)

- Adding `!important` to "win" a specificity fight. Use `:where()` or CSS variables.
- Hardcoding hex colors / pixel values. Always go through tokens or mixin args.
- Creating an empty `*.module.scss` to satisfy a convention. The file is optional.
- Using `<div onclick>` instead of `<button>`. Native elements first, always.
- Same-element nesting (`<div>` in `<div>`, `<p>` in `<p>`).
- Wrapper divs for purely decorative effects. Use `::before` / `::after`.
- Template-string `className` concatenation. Use `[a, b].filter(Boolean).join(" ")`.
- Reaching for `next/font` or runtime CSS-in-JS. Tokens + mixins + theme contract are the system.
