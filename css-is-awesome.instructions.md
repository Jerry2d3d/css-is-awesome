---
applyTo: "**"
---

# css-is-awesome — system instructions

Authoring rules for css-is-awesome itself AND for consumer apps that use it. Drop this file at the repo root of any project that consumes the library; AI assistants (Cursor, GitHub Copilot, Claude Code, etc.) will pick it up via the `applyTo:` glob.

## TL;DR — three consumer tiers, pick the lowest one that works for you

1. **Drop-in (HTML, no build).** Link `dist/css-is-awesome.css` and a theme file. Use `.cia-*` utility classes in markup. Themes swap via `<html data-theme="press-light">`.
2. **React.** Import a shipped component (`<Button variant="primary">`). Components are token-driven and theme-swap-safe out of the box.
3. **Power user (SCSS).** `@use 'css-is-awesome/scss/mixins' as m;` and `@include btn(primary, $px: 6) { … }` to deviate from defaults.

You only write per-component SCSS when you're deviating from a base mixin. If you're applying the default look, use Tier 1 or Tier 2.

---

## File structure (React components)

Each component lives in its own folder under `src/components/`:

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

You're applying the default mixin output. Use `<Button variant="primary">` in React, or `class="cia-btn cia-btn-primary"` in HTML (when component utilities are available — see Tier 1).

### Do write SCSS when

You're deviating from a base mixin's defaults. Then:

```scss
// MyButton.module.scss
@use 'css-is-awesome/scss/components/buttons' as b;

.myCta { @include b.btn(primary, $px: 6, $r: full); }
```

### Mixin-first

Every visual primitive in the library is a mixin (`btn-base`, `card-base`, `input-base`, `tag`, etc.) plus a router (`btn($variant)`, `alert($status)`, `badge($status)`). Variants are reached by name, not by class. The mixin is the API; classes (utilities + React component classes) are consumers of it.

### Apply token-driven values, not literals

```scss
// Yes — token-driven, theme-swap-safe.
padding-block: m.space(2);
color: m.color(text-primary);
border-radius: m.radius(md);

// No — literal, breaks theme-swap.
padding: 8px;
color: #2A241E;
border-radius: 4px;
```

Tokens come from the theme contract (`scripts/theme-contract.json` — 123 required slots). Themes swap via `<html data-theme="press-light">` and every token resolves to the active theme's value.

### Flex via `m.flex`

`m.flex` is the one flex primitive. Pass only what differs from the
defaults — `$direction: row`, `$align: center`, `$justify: start`,
`$wrap: nowrap`, `$gap: null`, `$inline: false`.

```scss
// Header bar / accordion trigger
@include m.flex($justify: between, $gap: 3);

// Vertical stack with gap
@include m.flex($direction: column, $gap: 4);

// Perfectly centered children
@include m.flex($justify: center);

// Inline chip lockup
@include m.flex($inline: true, $gap: 2);
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
padding-block: m.space(2);
padding-inline: m.space(4);
margin-block-end: m.space(3);
border-block-end: 1px solid m.color(border-default);

/* No */
padding-top: m.space(2);
padding-bottom: m.space(2);
padding-left: m.space(4);
padding-right: m.space(4);
margin-bottom: m.space(3);
border-bottom: 1px solid m.color(border-default);
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

// or use the FormField component
<FormField label="Email"><Input type="email" /></FormField>
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

Each theme is a `[data-theme="<name>"] { ... }` block declaring all 123 contract tokens. `public/theme.css` ships every theme consolidated; per-theme files at `public/themes/<name>/theme.css` are also published for download. All shipped blocks pass the WCAG 2.2 AA contrast audit out of the box.

Theme names carry a mode suffix (`-light` / `-dark`) since v0.7. Shipped families (each with a light and dark variant): `sketchbook` (default — `sketchbook-light`), `press`, `graphite`, `glass`, `cupertino`, `terminal`, `prism`, and the unbranded `boilerplate` starter. That's 8 families / 16 blocks. The unsuffixed v0.6 names (`sketchbook`, `press`, `graphite`, `glass`, `cupertino`, `terminal`) are kept as backward-compat aliases through 0.7.x and will be removed in v0.8 — see `MIGRATION.md`.

### Add a theme

1. Read `scripts/theme-contract.json` — declare every token (123 required slots in v1).
2. Run `npm run validate-themes` to confirm the contract. The validator also runs a WCAG 2.2 AA contrast audit; a11y FAILs are fatal by default. Pass `--allow-a11y-fail` to downgrade contrast failures to a report-only warning while you iterate (the older `--strict` flag is accepted as a no-op alias).
3. Add the theme name to `ThemePicker`'s `THEMES` array and the layout's `VALID_THEMES` set.
4. Optionally add a `[data-theme="<name>"]` block to the consolidated `public/theme.css`.

See `/docs/authoring/themes` for the full guide.

### Adding fonts — one mixin, three shapes

`m.font-load` registers a font slug and **always emits `--font-<slug>` at :root**, so every loaded font is a CSS variable consumers can use 1 or 100 times. Three shapes:

```scss
// page.module.scss (or any module that uses the font)
@use 'css-is-awesome/scss/mixins' as m;

// 1) Hosted font (Google Fonts / CDN) — slug doubles as the face name
@include m.font-load('Pacifico', 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
// → @import url(...);
// → :root { --font-Pacifico: "Pacifico", sans-serif; }

// 2) System / pre-installed font alias — no URL needed
@include m.font-load(meme,
  $fallback: ('Helvetica Neue', Helvetica, Arial, sans-serif));
// → :root { --font-meme: "Helvetica Neue", Helvetica, Arial, sans-serif; }

// 3) Hosted + override one of the 6 theme contract slots
@include m.font-load('Caveat', 'https://fonts.googleapis.com/css2?family=Caveat',
                     $alias: script);
// → @import + --font-Caveat + --font-script (= "Caveat", sans-serif)

// 4) Self-hosted (woff2 / ttf / etc.)
@include m.font-load-local('Untitled Sans', '/fonts/UntitledSans.woff2');
```

Then consume in components — two interchangeable patterns:

```scss
// Through the mixin (one line, slug as $family):
.headline { @include m.font(reg, 7, $family: 'Pacifico'); }
.logo     { @include m.font($lh: 0.95, $ls: -0.01em, $family: meme); }

// Through raw CSS (use --font-<slug> directly):
.note     { font-family: var(--font-meme); }
.heroH1   { font-family: var(--font-Pacifico); }
```

**Override anywhere** — set the CSS variable in any scope:

```scss
:root             { --font-meme: 'Inter', sans-serif; }   // site-wide
[data-theme="x"]  { --font-meme: 'Press Start 2P', monospace; }  // per-theme
.landing-page     { --font-meme: 'Caveat', cursive; }     // one page
.hero             { --font-meme: 'Pacifico', cursive; }   // one block
<h1 style="--font-meme: 'Comic Sans MS'">                 // one element
```

**Where to call `font-load`** — each `.module.scss` is its own Sass compilation, so the slug registry is per-file. Practically: call `m.font-load(<slug>, ...)` at the top of every module that uses the slug. The `:root` declaration ends up identical across files, so browsers dedupe — only the value matters.

**Scope selector / CSS Modules** — `font-load` defaults to emitting on `:global(:root)`, which CSS Modules (Next.js, webpack `css-loader` with `modules: true`) strip to `:root` in the final CSS. If you're consuming in a plain SCSS context (no CSS Modules), pass `$root: ':root'` to skip the non-standard `:global()` wrapper:

```scss
// CSS Modules (default) — works as-is
@include m.font-load(meme, $fallback: (...));

// Plain SCSS context (Vite without modules, plain webpack, etc.)
@include m.font-load(meme, $fallback: (...), $root: ':root');
```

`font-load` is idempotent (same slug + same URL = no-op; different URL = `@error`).

---

## Accessibility

- Native interactive elements (above) are the foundation.
- All images have `alt` text.
- Form controls have `<label>` (above).
- Use `role` and `aria-*` only when native semantics are insufficient — e.g., disclosure widgets, custom dropdowns, ARIA live regions.
- Keyboard navigation works: dialogs trap focus, Escape closes overlays, arrow keys cycle through tab lists.
- Focus rings come from `m.focus-ring` (or `:focus-visible`) — don't remove the outline without a replacement.
- Honor `prefers-reduced-motion` — animation mixins do this automatically; don't fight it.
- Color is never the only cue — pair status colors with an icon or text label.

---

## Versioning & contributions

- **SemVer** post-1.0 strictly. Breaking changes bump major. See `VERSIONING.md`.
- **Conventional Commits** drive the auto-changelog. `feat:`, `fix:`, `chore:`, `docs:`, `refactor:` etc.
- **CONTRIBUTING.md** has the full setup, PR, and review flow.
- **`.github/ISSUE_TEMPLATE/`** for bug reports, feature requests, theme submissions.

---

## Decision tree — which tier should I use?

**Q: Are you in a React app?**

- **No** → Tier 1 (drop-in CSS). Link `dist/css-is-awesome.css` + a theme. Use `.cia-*` utilities.
- **Yes** → Q2.

**Q2: Are you building UI from our shipped components (`<Button>`, `<Card>`, `<Input>`, etc.)?**

- **Yes** → Tier 2 (React components). Use the components as-is. No SCSS file in your project.
- **No, I'm building a new component** → Q3.

**Q3: Does your new component just need the library's default look applied?**

- **Yes** → Compose `.cia-*` utility classes in `className`, OR use our React components as primitives. **No SCSS file needed.**
- **No, I need to deviate** → Tier 3 (SCSS). Write `Component.module.scss`, `@use 'css-is-awesome/scss/mixins' as m;`, `@include btn(primary, $px: 6) { /* deviations */ }`.

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
