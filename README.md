# css-is-awesome

> A tiny, mixin-first SCSS design system with one-file theme swap.

[![CI](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml/badge.svg)](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml) [![Node](https://img.shields.io/badge/node-%E2%89%A520-43853d?logo=node.js&logoColor=white)](./package.json) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

One CSS file. Six voices. Swap the file, the whole site reskins. Built to be small enough to read in an afternoon.

## Two ways to use it

### 1. Drop-in CSS (zero build)

```html
<!-- coming soon — see Phase 5 in ROADMAP.md -->
<link rel="stylesheet" href="path/to/css-is-awesome.min.css">
```

Until the package lands on npm + jsDelivr, point at a local copy of `dist/css-is-awesome.min.css`. Then use utility classes (`cia-flex`, `cia-p-md`) or component classes (`btn btn--primary`, `card`, `alert`).

### 2. SCSS with mixin API

```bash
# coming soon — local clone / path import for now
npm install css-is-awesome
```

```scss
@use 'css-is-awesome/scss/mixins' as m;

.my-cta {
  @include m.btn-primary($px: xl, $r: full);
}
```

50+ atomic mixins — `btn-base`, `card-base`, `input-base`, `check-base`, `switch-base`, `tab-item`, `badge-base`, `alert-base`, `modal-base`, `tooltip-base`, `dropdown-*`, `nav-*`, `pagination`, `breadcrumb`, `avatar`, and more. Every parameter overridable.

## Themes

Six shipped. Swap by replacing `public/theme.css`:

| Theme | Mood |
|---|---|
| Sketchbook | Warm washi paper, sumi ink, indigo accent (default) |
| Press | Editorial newsprint, Playfair serif, press-red accent |
| Graphite | Space-gray aluminum dark mode, system blue |
| Glass | visionOS glassmorphism, iOS indigo, dual-rim highlights |
| Cupertino | macOS Sonoma window, SF Pro, system blue |
| Terminal | VT100 phosphor green, zero radii, CRT glow |

Each theme is one file of CSS custom properties. Tokens only — no component rules. See `public/themes/` for the sources and `/themes` on the docs site for live previews + downloads. Full contract documented in [THEMING.md](./THEMING.md).

## Token contract

Every theme declares the same slots: **surfaces · ink · lines · primary · seal · accent · code · type · radius · shadow · blur · glow · motion**. Components read tokens, themes set tokens, nothing else.

## Running the docs site locally

```bash
git clone https://github.com/Jerry2d3d/css-is-awesome.git
cd css-is-awesome
npm install
npm run dev          # http://localhost:5173
```

The docs site is a Next.js 15 app at `src/` that dogfoods the library — every page uses CSS Modules composed from the same tokens and mixins the library ships.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Next.js docs site on port 5173 |
| `npm run build` | Static-exports docs site to `out/` |
| `npm run build:css` | Compile library SCSS to `dist/css-is-awesome.css` |
| `npm run build:css:all` | Compile all bundles (full + core + utilities + minified) |
| `npm run lint` | ESLint on the Next.js app |
| `npm run lint:scss` | Stylelint on the SCSS library |

## Size

Verified at Phase 2: **2 KB gzipped** for core (tokens + resets), **10 KB gzipped** for the full bundle (tokens + utilities + components).

## Status

Pre-1.0. Active development. Themes, animations, and the atomic mixin library are in place; docs content and npm publish are the remaining milestones. See [ROADMAP.md](./ROADMAP.md) for what's next and [CHANGELOG.md](./CHANGELOG.md) for what's shipped.

## License

MIT. See [LICENSE](./LICENSE).
