# Migration Guide

Breaking changes between css-is-awesome versions, and how to migrate.

## v0.7 — theme names carry a `-light` / `-dark` suffix

**Status:** breaking (alias-cushioned). Approved pre-1.0.

### What changed

Every built-in theme name now carries a mode suffix so consumers can read
intent at a glance. The defaults shipped before v0.7 were inconsistent
(some had a suffix, most did not). Five of the six original themes are
renamed; `terminal` stays single-mode by design.

| v0.6 name      | v0.7 name           | Notes                                          |
|----------------|---------------------|------------------------------------------------|
| `sketchbook`   | `sketchbook-light`  | Default. Still wins via `:root:not([data-theme])`. |
| `press`        | `press-light`       |                                                |
| `graphite`     | `graphite-dark`     | Graphite was always dark.                      |
| `glass`        | `glass-light`       |                                                |
| `cupertino`    | `cupertino-light`   |                                                |
| `terminal`     | `terminal`          | Single-mode by design (CRT phosphor only).     |

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
