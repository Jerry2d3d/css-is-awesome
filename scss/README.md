# scss/

The Sass source of css-is-awesome. Tier 1 consumers want the compiled CSS in
`dist/`; Tier 2 consumers (`@use` mixins, author their own class names) want
the files in this folder. Imported through the npm package — don't copy these
into your project.

## Canonical example

```scss
@use 'css-is-awesome/scss/components/buttons' as b;
@use 'css-is-awesome/scss/mixins'              as m;

.hero-cta { @include b.btn(primary, $r: full); @include m.elevation(2); }
```

Compile with Sass + a load path (or the modern package importer):

```bash
sass app.scss app.css --load-path=node_modules
```

## What lives here

| Path                    | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `main.scss`             | Full library entry — tokens + resets + utilities.              |
| `core.scss`             | Tokens + resets only (pair with your own utility set).         |
| `utilities-only.scss`   | Drop-in `cia-*` utility classes, no tokens or resets.          |
| `_index.scss`           | Barrel re-export of every public surface (`@use … as ds`).     |
| `_mixins.scss`          | Core mixin API: `color`, `space`, `btn-base`, `font`, etc.     |
| `_layout.scss`          | `container`, `grid`, `page-layout`, stack/inline helpers.      |
| `_utilities.scss`       | `cia-*` utility class generator (margin, padding, color, …).   |
| `_icons.scss`           | SVG + Font Awesome icon mixins (`svg`, `svg-text`, `fa`).      |
| `_animations.scss`      | Keyframe library + `animate()` mixin + `cia-anim-*` utilities. |
| `_generator.scss`       | SCSS maps → `:root { --token: value; }` writer.                |
| `_system.scss`          | Compile-time constants (breakpoints, spacing scale, z-index).  |
| `components/`           | Per-family component mixins (`buttons`, `forms`, `data`, …).   |
| `theme/`                | Default theme maps (brand, colors, type, shape, shadows).      |
| `recipes/`              | Opt-in presets — currently `bare-tags` (Tier 3, Pico-mode).    |
| `examples/`             | Reference snippets, not part of the entry. Read, don't `@use`. |
| `_app-styles.scss`      | Template for consumer-owned styles. NOT part of the library.   |

## Deeper reading

- Authoring rules, tier decisions, mixin contracts → `../AGENTS.md`
- Full reference (~14 KB) → `../css-is-awesome.instructions.md`
- Contributors (repo only) → `../CONTRIBUTING.md`
