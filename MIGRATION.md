# Migration Guide

Breaking changes between css-is-awesome versions, and how to migrate.

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
| `@include m.bp(md) { … }` | `@include m.media(md) { … }` |
| `@include m.bp-down(md) { … }` | `@include m.media-down(md) { … }` |
| `@include m.bp-between(sm, lg)` | `@include m.media-between(sm, lg)` |
| `@include m.cq(md) { … }` | `@include m.contain(md) { … }` |
| `@include m.cq-down(md)` | `@include m.contain-down(md)` |
| `m.color-raw(border-focus)` | `m.color-static(border-focus)` |
| `@include m.inset(4)` | `@include m.pad(4)` |
| `@include m.inset-x(4)` | `@include m.pad-x(4)` |
| `@include m.inset-y(2)` | `@include m.pad-y(2)` |
| `@include m.squish(2, 4)` | `@include m.pad-asym(2, 4)` |
| `@include m.font-load('Inter', '/inter.woff2')` | `@include m.font-face('Inter', '/inter.woff2')` |
| `@include m.font-load-local('Inter', '/inter.woff2')` | `@include m.font-face-local('Inter', '/inter.woff2')` |
| Layout `@include m.container` | `@include m.wrap` |

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
values and the per-theme folder names. The mixin layer (`m.color`,
`m.btn`, etc.) is untouched.

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
