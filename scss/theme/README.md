# scss/theme

The canonical **token source** for css-is-awesome. These Sass partials are
read at compile time by `_generator.scss` and the library mixins; they emit
the baseline CSS custom properties on `:root` that the whole system reads
through `var(--token, fallback)`. Edit a value here and rebuild — every
component picks it up. This is library-author territory, not consumer
territory.

## scss/theme/ vs public/themes/

Easy to confuse. They sit at opposite ends of the pipeline:

| Layer | `scss/theme/` (this folder) | `public/themes/<name>/theme.css` |
| --- | --- | --- |
| When it runs | **Compile time** (Sass → CSS) | **Runtime** (browser, no build) |
| Format | `_*.scss` partials, Sass maps | Plain CSS custom properties |
| Audience | Library authors / contributors | Consumers swapping looks |
| What it produces | The default `:root { … }` block | A `[data-theme="<name>"] { … }` override block |
| Swap mechanism | Recompile the package | Drop in a new file, set `<html data-theme="…">` |
| Source of truth for | Defaults, scales, contracts | One specific palette / mood |

If you want to author a new theme, you almost certainly want
[`../../CONTRIBUTING-THEMES.md`](../../CONTRIBUTING-THEMES.md), not this
folder.

## Files

| File | Owns |
| --- | --- |
| `_index.scss` | Barrel. `@use`s every partial in cascade order and re-exports the maps with the `$theme-*` names the rest of the system expects. Also defines the spacing scale (`$space`, `$gap`, `$padding`, `$margin`) so spacing lives next to its sibling tokens. |
| `_brand.scss` | `$brand` — primary / secondary / accent identity colors (and their hover/active variants). `_colors-light.scss` intentionally references these for `action-primary-*`. |
| `_colors-light.scss` | `$colors-light` — semantic palette for light mode: backgrounds, surfaces, text, borders, interactive states, actions, status colors. |
| `_colors-dark.scss` | `$colors-dark` — same semantic keys as light, dark-mode values. |
| `_typography.scss` | `$fonts` — primary / secondary / mono font stacks. |
| `_shape.scss` | `$radius` — border-radius scale (`none`, `sm`, `md`, `lg`, `xl`, `2xl`, `full`). |
| `_shadows.scss` | `$shadows-light` / `$shadows-dark` — elevation scales. Numbered scale 1..5 is the source of truth; t-shirt aliases (`sm`..`2xl`) layer on top. |
| `_icons.scss` | Icon configuration: SVG pack path (`$icon-path`, `$icon-pack`), default size, name aliases, and the Font Awesome wiring (`$fa-path`, `$fa-style`, `$fa-pro`). |
| `_components.scss` | `$components` — per-component runtime override map (e.g. `btn-radius`, `btn-padding-y`). Each entry is emitted as a CSS custom property AND used as the fallback inside `var(--key, …)` in the matching mixin. Keep in sync with `scss/_mixins.scss` and `scss/components/*.scss`. |
| `registry.json` | Static snapshot of preset palettes (sketchbook, royal-blue, grinning-gremlin, custom, etc.) carried over from the original boilerplate. **Not imported by the build, the validator, or the docs site** — it predates the runtime `public/themes/*` model. Treat it as historical reference; the live themes are the CSS files under `public/themes/`. |

## Cascade order (`_index.scss`)

```scss
@use './brand'         as *;   // identity colors first — referenced by colors
@use './colors-light'  as *;
@use './colors-dark'   as *;
@use './typography'    as *;
@use './shape'         as *;
@use './shadows'       as *;
@use './components'    as *;   // last — may reference any of the above via var()
```

Order matters: `_colors-light.scss` reads `$brand` for `action-primary-*`,
and `_components.scss` references the radius / spacing / color tokens that
earlier partials define. Re-ordering will break compilation or silently
swap defaults.

## Adding a NEW theme

You almost certainly do **not** edit this folder. Themes are runtime CSS
files. See [`../../CONTRIBUTING-THEMES.md`](../../CONTRIBUTING-THEMES.md)
for the contract, the validator, and the PR checklist.

Edit this folder only when you are changing the **defaults the library
itself ships with** — adding a new token to the contract, retuning the
spacing scale, or wiring a new component map.
