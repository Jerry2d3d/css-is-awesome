# Icons

The css-is-awesome icon system is mixin-first and pack-based. The
default `core` pack ships at `public/icons/core/` (49 Lucide-vendored
glyphs — see `LICENSE-third-party` for attribution).

## The 30-second version

1. Drop an SVG file into a pack folder (`public/icons/core/foo.svg`).
2. Reference it anywhere: `@include m.svg(foo);`
3. Style it with CSS. `currentColor` means it reskins automatically with `color:`.

That's the whole system. No registry file, no build step, no import list.

The full contract (resolution order, naming rules, override mechanism)
lives in [`CONTRACT.md` → Icons contract](../../CONTRACT.md#icons-contract).

## Mixins

All mixins live in `scss/_icons.scss`. Bring them in via the `m.` namespace
(`@use 'mixins' as m;`) that the rest of the system uses.

### `m.svg($name, $size: t.$theme-icon-size, $color: currentColor)`

Inline single-color icon. Renders via CSS `mask` + `background: currentColor`,
so the icon inherits the parent's `color`. Use for UI glyphs that should
tint with text.

```scss
.btn-close {
  @include m.svg(close);
  color: var(--color-danger);
}
```

Compiled CSS:

```css
.btn-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--color-danger);
}
.btn-close::before {
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  background: currentColor;
  mask: var(--cia-icon-x, url('/icons/core/x.svg')) center / contain no-repeat;
}
```

### `m.svg-bg($name, $size: t.$icon-size)`

SVG rendered as a plain `background-image`. No mask, no tint — the source
SVG's colors are preserved. Use for multi-color illustrations and brand
marks that should NOT become monochrome.

```scss
.logo {
  @include m.svg-bg(brand-mark, 48px);
}
```

### `m.svg-text($name, $size: 1em, $gap: 0.5em, $position: before)`

Icon + label in one flex row. The icon goes in `::before` (default) or
`::after`, with `gap` between them. `$size: 1em` means the icon scales
with the element's `font-size`.

```scss
.btn-save {
  @include m.svg-text(check);   // icon-then-text, 0.5em gap
}

.btn-next {
  @include m.svg-text(arrow-right, 1em, 0.5em, after);
}
```

## Config

All config lives in `scss/theme/_icons.scss` and is re-exported from
`scss/theme/_index.scss` as `t.$theme-*`.

### Icon folder path

`$theme-icon-path` defaults to `/icons` and `$theme-icon-pack` defaults
to `core`, so `m.svg(foo)` resolves to `/icons/core/foo.svg` by default.
Each theme can override individual glyphs via `--cia-icon-<name>` custom
properties (preferred) or swap the entire pack folder by changing
`$theme-icon-path` / `$theme-icon-pack` — see "Per-theme icon packs"
below and `CONTRACT.md → Icons contract`.

### Default icon size

`$theme-icon-size` defaults to `24px`. Used by `svg` and `fa-icon` when
you don't pass an explicit `$size`.

### Alias map

`$theme-icon-svg-alias` remaps semantic names to real filenames. Ships
with a small default set:

```scss
$icon-svg-alias: (
  delete: 'trash',
  close:  'x',
);
```

With that map in place, `@include m.svg(delete);` resolves to
`/icons/trash.svg`. Add your own entries to keep call sites semantic
without renaming files.

## Sizing

Two ways to size an icon:

1. **Implicit (recommended for text-paired icons).** `svg-text` defaults
   `$size` to `1em`, so the icon scales with `font-size`.

   ```scss
   .btn { font-size: 1.125rem; @include m.svg-text(check); } // icon is 18px
   ```

2. **Explicit.** Pass a `$size`:

   ```scss
   .nav-toggle { @include m.svg(menu, 32px); }
   ```

## Coloring

Set `color:` on the element (or any ancestor) and the icon follows. This
works because `svg` / `svg-text` render the glyph as a mask over
`background: currentColor`.

```scss
.btn-danger { color: #e11; @include m.svg(delete); }      // red trash icon
.btn-danger:hover { color: #a00; }                         // hover darkens
```

If an icon isn't picking up the color, see Troubleshooting.

## Mask vs background (svg vs svg-bg)

| Use case                                 | Mixin       |
|------------------------------------------|-------------|
| Single-color UI glyph that tints         | `svg`       |
| Multi-color illustration / brand mark    | `svg-bg`    |
| Icon paired with a text label            | `svg-text`  |

The `svg` path requires the source SVG to have no hardcoded `fill=` (or
have `fill="currentColor"`). If the SVG has baked-in colors, `svg` will
discard them (mask only cares about shape). Use `svg-bg` to keep them.

## Aliases

`$theme-icon-svg-alias` is a `name → filename` map. It lets call sites
use semantic names while the file on disk stays neutral:

```scss
// scss/theme/_icons.scss
$icon-svg-alias: (
  delete:         'trash',
  close:          'x',
  primary-action: 'star-filled',
);
```

```scss
.btn-remove { @include m.svg(delete); }   // loads /icons/trash.svg
```

## Per-theme icon packs

There are two ways a theme overrides icons. Pick whichever matches the
scope of the change.

### Per-glyph (preferred — runtime CSS, no SCSS rebuild)

Drop replacement SVGs at `public/themes/<theme>/icons/<pack>/<name>.svg`
and declare a custom property in that theme's `:root` (or
`[data-theme="<theme>"]`) block:

```css
[data-theme="sketchbook-light"] {
  --cia-icon-search: url('/themes/sketchbook-light/icons/core/search.svg');
  --cia-icon-x:      url('/themes/sketchbook-light/icons/core/x.svg');
}
```

Glyphs you don't override fall back to the bundled `core` pack
automatically. The mixin emits `var(--cia-icon-<name>, url(<core>))` —
the second argument is the fallback.

### Pack-wide (compile-time SCSS swap)

If a theme replaces every glyph, override `$theme-icon-path` once and
ship the full set in the new folder:

```scss
// themes/corporate/_icons.scss
$icon-path: '/themes/corporate/icons';
$icon-pack: 'core';            // keep the contract pack name
$icon-svg-alias: (
  delete: 'bin',
  close:  'dismiss',
);
```

Drop the SVGs at `public/themes/corporate/icons/core/` and every
`@include m.svg(...)` in that theme's bundle resolves against the
corporate pack.

## Font Awesome integration

Use the FA mixins when your project is already on Font Awesome (you have
a Pro license, a brand kit, or need thousands of glyphs you don't want to
curate by hand). Configure `$theme-fa-path`, `$theme-fa-style`, and
`$theme-icon-fa-map` in `scss/theme/_icons.scss`.

### Self-hosted

Drop `fa-solid-900.woff2`, `fa-regular-400.woff2`, and
`fa-brands-400.woff2` into your `$theme-fa-path` folder (default
`/webfonts`), then call `fa-load` once:

```scss
// main.scss
@include m.fa-load;
```

### CDN / kit

Skip `fa-load` entirely. Include FA's stylesheet in your HTML as normal;
the mixins below will pick up the already-registered font families.

### FA mixins at a glance

```scss
.icon-search       { @include m.fa-icon(search); }
.btn-download      { @include m.fa-text(download); }
.loader            { @include m.fa-spin(spinner); }
```

## Authoring tips

- **Single-color glyph.** Export with `fill="currentColor"` (or no `fill`
  at all). Use `m.svg` / `m.svg-text`. Drive the color from the parent's
  `color:`.
- **Multi-color illustration.** Export with fills baked in. Use `m.svg-bg`.
  `color:` has no effect.
- **Adding a new icon.** Save the file as `public/icons/<name>.svg` and
  reference it with `@include m.svg(<name>);`. No manifest update needed.

## Troubleshooting

- **Icon doesn't render.** Check `$theme-icon-path` resolves to a real URL
  and the file exists (e.g. open `/icons/foo.svg` in the browser).
- **Icon renders black and won't pick up `color`.** The SVG has a hardcoded
  `fill` attribute. Either remove the `fill` from the source, change it to
  `currentColor`, or switch to `m.svg-bg`.
- **Icon is stretched or cropped.** `svg` / `svg-text` set `width` and
  `height` to the same value. If your source SVG isn't square, wrap it in
  a `<svg viewBox="...">` with matching width/height, or size it via
  `svg-bg` with an explicit `background-size`.
- **Icon looks fuzzy on high-DPI.** Bump `$size`, or confirm the source is
  a real SVG (not a rasterized PNG exported as `.svg`).
- **FA icon shows a box / wrong glyph.** `$theme-icon-fa-map` doesn't have
  that name, or the FA font file for that style (solid/regular/brands)
  isn't loaded. Check `fa-load` was called, or that your CDN include is
  present.
