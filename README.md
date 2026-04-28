# css-is-awesome

> A tiny, mixin-first SCSS design system with one-file theme swap.

[![CI](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml/badge.svg)](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml) [![Node](https://img.shields.io/badge/node-%E2%89%A520-43853d?logo=node.js&logoColor=white)](./package.json) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![semantic-release](https://img.shields.io/badge/semantic--release-enabled-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

One CSS file. Six voices. Swap the file, the whole site reskins. Built to be small enough to read in an afternoon.

## Three ways to use it

> Full breakdown in [THREE-TIERS.md](./THREE-TIERS.md). All three resolve to the same router mixin per component — mix them freely in one app.

### 1. Drop-in CSS (zero build)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/public/theme.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/css-is-awesome@0.6.0/dist/css-is-awesome.min.css">
```

jsDelivr auto-mirrors npm. Theme stylesheet first (it sets the tokens), library second. Then use utility classes (`cia-flex`, `cia-p-md`) or single-class components (`cia-btn-primary`, `cia-card`, `cia-alert`). For Subresource Integrity hashes see [`/docs/install#cdn-sri`](./src/app/docs/install/page.tsx).

### 2. SCSS with mixin API

```bash
# coming soon — local clone / path import for now
npm install css-is-awesome
```

```scss
@use 'css-is-awesome/scss/components/buttons' as b;

.my-cta {
  @include b.btn(primary, $px: 6, $r: full);
}
```

Author your own class names; the mixin handles the variant. 50+ atomic mixins — `btn(variant)`, `card-base`, `input-base`, `check-base`, `switch-base`, `tab-item`, `badge-base`, `alert-base`, `modal-base`, `tooltip-base`, `dropdown-*`, `nav-*`, `pagination`, `breadcrumb`, `avatar`, and more. Every parameter overridable.

### 3. Bare tags (opt-in Pico-mode)

```scss
@use 'css-is-awesome/scss/recipes/bare-tags';
```

```html
<button>Save</button>
<table>…</table>
<input type="email">
```

One line styles the whole site. Zero classes. Any class-based selector you add wins automatically (specificity `0,0,1`, no `:where()` / `@layer`).

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

## Launch mode / feature flags

The site ships with a runtime feature-flag gate driven by `public/flags.json`:

```json
{
  "version": 1,
  "comingSoon": false,
  "comingSoonMessage": "...",
  "announcement": { "active": false, "id": "", "status": "info", "message": "", "href": "" }
}
```

**Coming soon.** Set `"comingSoon": true` and the site renders a full-page "we're building this" overlay on every route (the theme picker is still visible). Flip back to `false` to restore the normal docs experience. No rebuild required — the flag is fetched at runtime.

**Announcements.** Set `announcement.active: true` plus a unique `announcement.id` to show a dismissible banner on every route. Visitors can dismiss; the dismissal persists in `sessionStorage` keyed by `id`, so changing the id re-shows the banner.

Flag changes on a static host are effective after the next hard reload.

## License

MIT. See [LICENSE](./LICENSE).
