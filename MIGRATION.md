# Migration Guide

Breaking changes between css-is-awesome versions, and how to migrate.

## v1.0 — mixin-first goes stable (published as 1.1.0)

**There are no breaking changes between v0.8.1/0.8.2 and v1.0.0.** 1.0.0
(tagged 2026-08-17) is the point at which the v0.8 mixin-first surface —
mixins, functions, token contract, theme architecture — became stable under
strict SemVer (see [`VERSIONING.md`](./VERSIONING.md)). Every mixin you called
in v0.8.1 compiles unchanged in v1.x; `npm run validate-api` guards the barrel
surface on every commit. The 67 commits between 0.8.2 and 1.0.0 carry no
rename, removal or signature change.

1.0.0 itself was never published to npm. The first published release is
**1.1.0 (2026-09-01)**, so upgrading from v0.8 in practice means landing on
1.1.x — and that release does carry **one action-required change for authors
of custom themes** (section 2 below). Consumers of the shipped themes have
nothing to do.

### What changed at a glance

| Area | v0.8.x | v1.x |
|---|---|---|
| Component stylesheet import | `@use 'css-is-awesome/scss/mixins' as m` (deep path) or the emitting bundle | **`@use 'css-is-awesome/api' as cia`** — zero-emit barrel, safe in CSS Modules (additive; the deep paths still work) |
| Root-level `@use 'css-is-awesome'` | Worked only via the deep `scss/…` paths on a clean install | **Resolves on a clean install** — root shims `api.scss` + `_index.scss` shipped (Sass ignores `package.json` `exports`) |
| Custom-theme contract | `--space-{2xs,xs,sm,md,lg,xl}` required | **`--space-0` … `--space-9` required**, t-shirt names optional (1.1.0 — validator fails an unconverted theme) |
| Six `--radius-{button,card,input,modal,badge,avatar}` tokens | Required of every theme, read by nothing | **Dropped from the contract** — the live knobs are `--btn-radius`, `--card-radius`, … |
| Library defaults selector | `:root { … }` (tied a drop-in theme at 0,1,0 — library won) | **`:where(:root) { … }`** — a theme's bare `:root` always wins |
| `theme()` mixin output | Inconsistent (`:root`, `[data-theme]`, or `:root[data-theme]`) | **`:root, :root[data-theme="<name>"]`** — drop-in with no markup change; `$standalone: false` for bundles |
| `spinner` / `skeleton` keyframes | Emitted at module top level on import (leaked; CSS Modules renamed them) | **Emitted via `@at-root` inside the mixin** — only when called |
| Print / PDF | — | **New**: `print`, `print-base`, `print-hidden`, `print-only` mixins + `print-to-pdf` recipe |

### 1. Adopt the two-import model (recommended, not required)

v0.8 consumers typically imported the whole library into every component
stylesheet, or reached for the deep `scss/mixins` path. Both still compile.
The v1 shape separates the two jobs:

```scss
// app/globals.scss — loaded ONCE at the app root. Emits :root tokens + base.
@use 'css-is-awesome';

// Card.module.scss — per component. Emits NOTHING until a mixin is called,
// so it is safe under Next.js CSS Modules "pure" mode.
@use 'css-is-awesome/api' as cia;
.card { @include cia.card-base($shadow: 2); background: cia.color(surface-default); }
```

If you were on the deep path, the swap is one line:

```scss
// v0.8
@use 'css-is-awesome/scss/mixins' as m;
.btn { @include m.btn(primary); }

// v1.x — same mixins, one namespace for the whole API (layout + components too)
@use 'css-is-awesome/api' as cia;
.btn { @include cia.btn(primary); }
```

`m.` was only ever the `_mixins.scss` leaf; `cia.` forwards every module, so
`cia.stack`, `cia.card-base` and `cia.print-base` are all reachable without a
second import. Deep paths remain supported for anyone who prefers them.

### 2. Custom themes: declare `--space-0` … `--space-9` (1.1.0, action required)

In v0.8 a theme could satisfy the contract with the six t-shirt spacing
names, but components read the numbered scale (`space(4)` → `var(--space-4)`),
so a theme's spacing was never actually applied. 1.1.0 makes the numbered
scale the required source of truth and turns the t-shirt names into optional
aliases that reference it.

```css
/* v0.8 custom theme — passes the old validator, but components ignored it */
:root[data-theme="brand"] {
  --space-xs: 4px;  --space-sm: 8px;  --space-md: 16px;
  --space-lg: 24px; --space-xl: 32px; --space-2xs: 2px;
}

/* v1.x custom theme — required. `npm run validate-themes` fails without it. */
:root[data-theme="brand"] {
  --space-0: 0;    --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-7: 48px;
  --space-8: 64px; --space-9: 96px;
  /* optional aliases — keep them only if your own CSS reads them */
  --space-md: var(--space-4);
}
```

Shipped themes were all converted; if you copied one as a starting point,
re-copy its spacing block. `--space-unit` (the density knob, 1.12.0) is
**optional** — since contract 1.1 (library 1.16.1) the validator reports a
missing optional token as info, never a failure; between 1.12.0 and 1.16.0 it
was wrongly listed as required, which is why a custom theme could fail
validation after a minor upgrade. (Later 1.x releases derive the whole scale from a
single `--space-unit`; see the theme authoring docs for the current shape.)

While you are in the file: the six `--radius-button` / `-card` / `-input` /
`-modal` / `-badge` / `-avatar` tokens can be deleted. Nothing read them. The
per-component radius knobs that do work are `--btn-radius`, `--card-radius`,
`--input-radius`, `--modal-radius`, `--badge-radius` and `--tag-radius`.

### 3. Drop-in themes need no markup (1.1.0, behaviour change, no action)

Two changes make a single theme file work when dropped into any page:

- Library defaults now emit under `:where(:root)` (specificity 0,0,0). In
  v0.8 the library's own `:root` tied a theme's `:root` and, loading second,
  won — so a drop-in theme rendered an untokenised page unless you also set
  `<html data-theme>`. Specificity only *decreased*, so nothing that used to
  win can start losing.
- `cia.theme('name')` now emits `:root, :root[data-theme="name"]`. If you build
  a multi-theme bundle yourself, pass `$standalone: false` so twenty blocks
  don't all claim `:root`.

If your app overrode a library default with a bare `:root` rule that only
worked because of source order, it now works by specificity instead.

### 4. `spinner` / `skeleton` in CSS Modules (fix, no action)

v0.8 defined those mixins' `@keyframes` at module top level, so importing the
file leaked CSS and CSS Modules renamed the keyframes away from the
`animation-name` that referenced them. They now emit via `@at-root` inside the
mixin, co-located with the reference, so CSS Modules renames both together.
If you had worked around it by importing `animations-utilities` globally,
that workaround is harmless and can stay.

### New mixins/features (additive, no migration needed)

- `css-is-awesome/api` — the zero-emit authoring barrel (section 1)
- `cia.print`, `cia.print-base($freeze-animations, $size, $margin)`,
  `cia.print-hidden`, `cia.print-only` — pure-CSS print/PDF layer;
  `print-base` is root-only (emits `@page`) and exposes `--is-print`,
  `--print-hide`, `--print-show`. Recipe: `scss/recipes/print-to-pdf.md`
- The recipes book (`scss/recipes/*.md`) and the MCP server (`mcp/server.cjs`)
  ship in the package; `npx cia add <recipe>` copies a recipe into your project
- `npm run validate-package` — packs, installs into a temp project and compiles
  every documented `@use` specifier, which is how the root-shim break was found
- Theme build + drift gates (`check:theme-drift`), a corrected contrast
  validator (it previously skipped unquoted `[data-theme=x]` blocks), and
  24 shipped themes all passing the contract and the a11y audit

### Where to read more

- [`CHANGELOG.md`](./CHANGELOG.md) — `[1.0.0]` and `[1.1.0]` entries carry the
  full detail and the reasoning behind each change
- [`VERSIONING.md`](./VERSIONING.md) — what counts as MAJOR from 1.0 on
- [`CONTRACT.md`](./CONTRACT.md) — the current required/optional token list

---

## v0.8.1 — animations split + small renames

Patch release with one real fix (animations CSS Modules bug) and two small
renames. No structural changes.

### What changed at a glance

| Area | v0.8.0 | v0.8.1 |
|---|---|---|
| `_animations.scss` shape | Mixed mixins + top-level CSS rules in one file | **Split** — mixins in `_animations.scss`, rules + keyframes in `_animations-utilities.scss` |
| `progress-track` / `progress-fill` mixin names | Without `-base` suffix | **`-base` suffix added** to signal "compose me" |
| `badge-base` / `badge` location | In `_feedback.scss` | **Moved to `_data.scss`** (next to `card-base` / `table-base`) |

### 1. CSS Modules consumers — animations split

If you previously imported animations from a `.module.scss` and hit
`Selector "*, *::before, *::after" is not pure`, that's now fixed:

```scss
// component.module.scss — works now in v0.8.1
@use 'css-is-awesome/scss/animations' as anim;
.my-spinner { @include anim.animate(spin, $iteration: infinite, $timing: linear); }
```

**But the keyframes need to be loaded globally once.** Easiest path: keep
the `@use 'css-is-awesome/scss/main';` line in your global SCSS — it
already loads both halves. Or load the new utilities file directly:

```scss
// globals.scss (loaded once at app root)
@use 'css-is-awesome/scss/animations-utilities';
```

### 2. Rename `progress-track` → `progress-track-base`

```scss
// v0.8.0
.my-track { @include cia.progress-track; }
.my-fill  { @include cia.progress-fill; }

// v0.8.1
.my-track { @include cia.progress-track-base; }
.my-fill  { @include cia.progress-fill-base; }

// OR use the new composer:
.my-progress { @include cia.progress; }
```

The new `cia.progress` composer reads `[data-slot="fill"]` markup — see the
mixin docstring for the recipe.

### 3. `badge-base` / `badge` moved to `_data.scss`

If you had a path-specific import:

```scss
// v0.8.0
@use 'css-is-awesome/scss/components/feedback' as f;
.my-badge { @include f.badge-base; }

// v0.8.1 — option A: use the cia barrel (recommended)
@use 'css-is-awesome/api' as cia;
.my-badge { @include cia.badge-base; }

// v0.8.1 — option B: import from data
@use 'css-is-awesome/scss/components/data' as d;
.my-badge { @include d.badge-base; }
```

The cia barrel re-exports all components, so the recommended Option A
unsubscribes you from future location changes.

### New mixins (additive, no migration needed)

- `cia.wizard-shell` — 3-row layout with shared horizontal rhythm (stepper + body + controls)
- `cia.stepper`, `cia.stepper-circle`, `cia.stepper-connector` — status-driven progress indicator
- `cia.progress` — composed router (track + fill via `[data-slot]`)
- `cia.sidebar` — Every-Layout sidebar (fixed nav + flexible content, gracefully stacks)
- `cia.toolbar` — cluster with auto-margin `[data-slot="trailing"]`

Plus bare-tags additions for `<dialog>` and `<progress>` (opt-in via the
existing `bare-tags` recipe).

---

## v0.8 — mixin-first reframe + theme system collapse

**Status:** breaking, no aliases. v0.8 is the pre-v1.0 lock-in pass.

### What changed at a glance

| Area | v0.7 | v0.8 |
|---|---|---|
| Primary API | utility classes + mixins | **mixin-first** (consumer picks their own selectors) |
| Themes | 14 files (`press-light` + `press-dark` × 7 families) | **9 single-file themes** using `light-dark()` |
| Theme selectors | `[data-theme="press-light"]` / `[data-theme="press-dark"]` | `[data-theme="press"]` |
| Responsive `:` utilities | `.cia-sm:flex`, `.cia-md:hidden` etc. | **killed** (saves 8 KB gz) |
| Utility classes (Sass path) | always emitted | **opt-in** via `@use ... with ($utilities: true)` |
| JavaScript in npm package | optional add-ons | **zero** — hard rule |
| Mixin names | 12 names renamed to spec vocabulary | see rename table below |

### 1. Rename `data-theme` attribute values

```html
<!-- v0.7 -->
<html data-theme="press-light">
<html data-theme="press-dark">

<!-- v0.8 -->
<html data-theme="press">  <!-- both modes inside one theme file -->
```

The single-file themes use `light-dark()` for color tokens; the browser
auto-swaps based on the user's OS `prefers-color-scheme`.

### 2. Rename mixin calls

| v0.7 | v0.8 |
|---|---|
| `@include cia.bp(md) { … }` | `@include cia.media(md) { … }` |
| `@include cia.bp-down(md) { … }` | `@include cia.media-down(md) { … }` |
| `@include cia.bp-between(sm, lg)` | `@include cia.media-between(sm, lg)` |
| `@include cia.cq(md) { … }` | `@include cia.contain(md) { … }` |
| `@include cia.cq-down(md)` | `@include cia.contain-down(md)` |
| `cia.color-raw(border-focus)` | `cia.color-static(border-focus)` |
| `@include cia.inset(4)` | `@include cia.pad(4)` |
| `@include cia.inset-x(4)` | `@include cia.pad-x(4)` |
| `@include cia.inset-y(2)` | `@include cia.pad-y(2)` |
| `@include cia.squish(2, 4)` | `@include cia.pad-asym(2, 4)` |
| `@include cia.font-load('Inter', '/inter.woff2')` | `@include cia.font-face('Inter', '/inter.woff2')` |
| `@include cia.font-load-local('Inter', '/inter.woff2')` | `@include cia.font-face-local('Inter', '/inter.woff2')` |
| Layout `@include cia.container` | `@include cia.wrap` |

No aliases. Use a regex search-replace on your codebase, or wait for a
codemod (planned for the future `@cia/codemod` package, v1.x).

### 3. Remove responsive `:` utility classes

```html
<!-- v0.7 -->
<div class="cia-sm:flex cia-md:hidden">

<!-- v0.8 -->
<!-- Option A: opt back in to responsive utilities -->
<!-- in your app.scss: -->
<!--   @use 'css-is-awesome' as cia with ($responsive-spacing: true); -->

<!-- Option B (recommended): use the mixin form -->
<div class="my-thing">
<!-- in your SCSS: -->
<!--   .my-thing {
        @include cia.media(md) { display: flex; }
      } -->
```

The responsive utility generator was emitting ~85 lines of cartesian-product
classes that most consumers never used. Killing them dropped `main.scss` from
16.6 KB gz to 8.2 KB gz.

### 4. Opt back in to utility classes (Sass consumers)

```scss
// v0.7 — all utilities always emitted
@use 'css-is-awesome' as cia;

// v0.8 — utilities opt-in
@use 'css-is-awesome' as cia with (
  $utilities: true,             // emit .cia-* utility classes
  $responsive-spacing: true,    // emit .cia-sm-p-md, etc.
);
```

**Pre-built CDN consumers are unaffected** — `dist/css-is-awesome.utilities.css`
still ships every utility class. The opt-in governs the Sass compile path only.

### 5. Move JS handlers out of cia-core dependencies

If you were relying on a JS shim shipped in `dist/`, it's gone. The
CopyButton JS handler now lives at `public/copy-button.mjs` (not in the
npm package). Three migration options:

1. **Copy-paste the recipe** from `/docs/recipes/copy-button`. ~700 bytes,
   framework-free.
2. **Write your own handler** following the documented contract
   (delegated click, `data-copy-target`, `data-copied` state).
3. **Wait for `@cia/copy-button`** add-on package (v1.x roadmap).

### 6. Embrace mixin-first authoring

The v0.8 reframe is more philosophical than mechanical: **cia ships the
mixin; you ship the class name**. Pre-v0.8 docs led with class examples
(`<button class="cia-btn-primary">`); v0.8 docs lead with mixin examples:

```scss
// v0.7 — class form was primary
<button class="cia-btn-primary">Save</button>

// v0.8 — mixin form is primary
<button class="save-btn">Save</button>

// in your SCSS:
.save-btn { @include cia.btn(primary); }
```

You can still use the `.cia-*` classes if you opt them in — they're a
convenience layer now, not the primary API.

### Where to read more

- [`CHANGELOG.md`](./CHANGELOG.md) — full breaking-change list with code-level detail
- [`AGENTS.md`](./AGENTS.md) — authoring guide updated for v0.8
- `/docs/install` on the docs site — the new mixin-first install path
- `/docs/themes/pairing` — the new `<link media>` paired-brand trick

---

## v0.7 — theme names carry a `-light` / `-dark` suffix

**Status:** breaking (alias-cushioned). Approved pre-1.0.

### What changed

Every built-in theme name now carries a mode suffix so consumers can read
intent at a glance. The defaults shipped before v0.7 were inconsistent
(some had a suffix, most did not). All six original themes are renamed
and now ship paired light/dark modes.

| v0.6 name      | v0.7 name           | Notes                                          |
|----------------|---------------------|------------------------------------------------|
| `sketchbook`   | `sketchbook-light`  | Default. Still wins via `:root:not([data-theme])`. |
| `press`        | `press-light`       |                                                |
| `graphite`     | `graphite-dark`     | Graphite was always dark.                      |
| `glass`        | `glass-light`       |                                                |
| `cupertino`    | `cupertino-light`   |                                                |
| `terminal`     | `terminal-dark`     | New `terminal-light` companion shipped — daylight editor. |

### Migration steps for consumers

#### Tier 1 — drop-in CSS (HTML, no build step)

If your markup looks like this:

```html
<html data-theme="sketchbook">
```

…then nothing breaks today. The unsuffixed v0.6 names continue to resolve
through alias selectors in `public/theme.css` for the entire 0.7.x line.

Before v0.8 ships, rename to the suffixed form:

```html
<html data-theme="sketchbook-light">
```

If you self-host one of the per-theme files, update the path:

```html
<!-- v0.6 -->
<link rel="stylesheet" href="/themes/press/theme.css">

<!-- v0.7+ -->
<link rel="stylesheet" href="/themes/press-light/theme.css">
```

The five renamed folders under `public/themes/` follow the same suffix
convention as the data-theme names.

#### Tier 2 — React (docs theme picker / cookies)

If your app reads or writes the `cia-theme` cookie directly:

```js
// v0.6
document.cookie = "cia-theme=sketchbook; path=/";

// v0.7+
document.cookie = "cia-theme=sketchbook-light; path=/";
```

Both cookie values resolve to the same tokens through 0.7.x because the
pre-hydration script accepts both lists. Update your writes to the new
names so existing cookies migrate naturally.

The `<ThemePicker>` and `<ThemeTile>` components shipped in v0.7 already
emit the suffixed IDs.

#### Tier 3 — SCSS / mixins

No SCSS API changed — the rename only affects the `data-theme` attribute
values and the per-theme folder names. The mixin layer (`cia.color`,
`cia.btn`, etc.) is untouched.

### Removal timeline

- **v0.7.x** — both old and new names work. Aliases ship in
  `public/theme.css`. `MIGRATION.md` and `CHANGELOG.md` document the
  rename. `<ThemePicker>` defaults to the new names.
- **v0.8.0** — alias selectors removed. `<html data-theme="sketchbook">`
  no longer resolves; consumers must use `sketchbook-light`. Per-theme
  folder paths under the old names (`public/themes/press/`, etc.) are
  also gone.

### Related work

- US-2.14.1 — maintainer-side rename (this PR).
- US-2.14.2 — consumer migration guide (this file).
- US-2.14.3 — alias-removal follow-up scheduled for v0.8.
