# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**See also:** [`VERSIONING.md`](./VERSIONING.md) — version policy, deprecation
lifecycle, and the Conventional Commits → changelog section mapping that drives
automated releases.

## [Unreleased]

### Changed — npm publish gate (v0.7.0 prep)

- `package.json` `files` array now explicitly includes `public/icons` and
  `LICENSE-third-party` so the new Lucide `core` icon pack (49 SVGs) and
  the third-party attribution license ship in the tarball. Verified via
  `npm pack --dry-run` and a real `npm pack` extract: 125 files, 162 kB
  packed / 1.0 MB unpacked, no `dist/components/`, no `src/`, no tests,
  no `.next/` or `out/`. Top-level layout: `dist/`, `scss/`, `public/`,
  `figma-tokens/`, both `LICENSE` files, and the four reference markdown
  docs (`README`, `CHANGELOG`, `AGENTS`, `CLAUDE`, `GEMINI`,
  `css-is-awesome.instructions`).
- Confirmed `scss/main.scss` no longer `@use`s `_app-styles` (already
  fixed in `d986ea7`). Spot-checked all four `dist/*.css` builds for
  docs-only selectors (`.site-header`, `.docs-*`, `.draft-stamp`,
  `APP STYLES`, `next-`, `launch-gate`) — none present. Build sizes:
  core 18.2 kB / 16.4 kB min, utilities 112.4 kB / 81.9 kB min, full
  161.5 kB / 115.6 kB min (uncompressed; gzip ≈ 2.4 / 11.5 / 15.2 kB
  per the previously recorded baselines).
- `_app-styles.scss` itself remains in `scss/` as a project-owned
  template for consuming boilerplates — not imported by any library
  entry, but shipped so a downstream copy-step can pick it up if a
  consumer wants the boilerplate template.

### Added — Docs content refresh + live token visualizers

- `/docs` intro now ships a real Quick Start: CDN one-`<link>` snippet, the
  three bundle tiers (`core` 2.4 KB / `utilities` 11.5 KB / `full` 15.2 KB
  gzipped), a side-by-side utility-class vs. SCSS-mixin example, and an
  expanded "What next" with links out to `/docs/tokens`, `/docs/animation`,
  `/themes`, `/docs/authoring/themes`, and `/compare`.
- `/docs/tokens` swatches now read live values via
  `getComputedStyle(document.documentElement)` and re-resolve whenever the
  active theme changes — color chips, hex/rgb values and the type-scale
  preview all reskin without a reload. Added an `Action (semantic primary)`
  group covering the four `--action-primary-*` slots, an extended radii
  preview that renders `--r-sm/md/lg` next to the `--radius-*` aliases, and
  a Type scale section with sample lines at the resolved sizes.
- `<Example.Code>` snippets across every docs page now have a
  copy-to-clipboard button. Reads `pre.textContent` (so syntax-highlight
  spans are stripped automatically), shows `Copied` for ~1.5 s, and falls
  back to a hidden-textarea + `execCommand('copy')` when the Async
  Clipboard API is unavailable. Hover-to-reveal on pointer devices,
  always-visible on touch and on focus, with `aria-label` swapping
  between "Copy code to clipboard" and "Copied to clipboard".

### Added — Boilerplate theme (recommended starter)

- New theme **Boilerplate** (`boilerplate-light` + `boilerplate-dark`) at
  `public/themes/boilerplate/theme.css`. Both modes ship in a single file
  and each declares the full 123-token contract.
- Design intent: a neutral, low-flourish, easy-to-override starter.
  Slate-leaning grays + one clean blue accent (`#2563eb` / `#3b82f6`),
  system UI sans-serif by default (no web fonts, no `@import` — fastest
  possible first paint), `ui-monospace` code stack, subtle shadows,
  standard 4 / 6 / 8 px radii. Goal: drop it in, accept defaults, get
  something that looks "modern, clean, professional, and unsurprising."
- Bundled into the consolidated `public/theme.css` via
  `scripts/bundle-companion-themes.mjs` (script extended to support
  multiple `[data-theme]` blocks per source folder).
- Selectable in the docs UI: added to `<ThemeSelect>` (header dropdown),
  `<ThemePicker>` (docs row), and the `/themes/gallery` page as the
  first tile.
- Gates the v0.7 npm publish (per ROADMAP.md).

### BREAKING CHANGES — Theme naming convention (Feature 2.14)

Every built-in theme name now carries a `-light` / `-dark` mode suffix.
Five of the six original themes are renamed; `terminal` stays
single-mode by design (CRT phosphor only — a "terminal-light" is no
longer terminal).

| v0.6 name      | v0.7 name           |
|----------------|---------------------|
| `sketchbook`   | `sketchbook-light`  |
| `press`        | `press-light`       |
| `graphite`     | `graphite-dark`     |
| `glass`        | `glass-light`       |
| `cupertino`    | `cupertino-light`   |

**Backward-compat aliases** ship in `public/theme.css` for the entire
0.7.x line: `<html data-theme="sketchbook">` keeps resolving to the
sketchbook-light tokens, etc. The aliases are **removed in v0.8**
(US-2.14.3). Migration steps are in [`MIGRATION.md`](./MIGRATION.md).

The default attribute on `<html>` and the default cookie value both
become `sketchbook-light`. The `:root:not([data-theme])` fallback in
the consolidated bundle still selects sketchbook so a no-attribute
drop-in still works.

### Changed — Theme system

- `public/theme.css` selectors renamed (with the v0.6 names retained as
  comma-grouped alias selectors on each block).
- `public/themes/{press,graphite,glass,cupertino}/` folders renamed to
  `{press-light,graphite-dark,glass-light,cupertino-light}/`. Per-theme
  banner comments updated.
- `<ThemePicker>` and the `/themes` gallery emit suffixed IDs.
- Pre-hydration script in `app/layout.tsx` accepts both old and new
  cookie values (old maps to alias selectors).
- Visual-regression baselines under `tests/__screenshots__/` renamed to
  match the new theme IDs.

### Added — Documentation

- [`MIGRATION.md`](./MIGRATION.md) — v0.7 migration steps for consumers
  (theme renames, removal timeline, per-tier impact).
- [`THREE-TIERS.md`](./THREE-TIERS.md) — top-level doc for the canonical
  three-tier authoring story (drop-in classes, SCSS mixins, bare tags),
  same-button-three-ways demo, router architecture, and a picking-a-tier
  table.
- New docs route `/docs/three-tiers` dogfoods the same story with live
  Button previews next to each tier's code. Sidebar nav: "Three tiers"
  sits between Introduction and Install under Getting started.
- `/docs/animation` rewritten as a live preview page: every keyframe in
  `_animations.scss` rendered as a card in a responsive grid, with
  hover/click/keyboard-driven replay for one-shot animations and
  always-on previews for loopers. Cards show the `cia-anim-*` utility
  class so readers can copy the trigger directly. Page reads from the
  same motion tokens (`--duration-*`, `--ease`) so swapping themes via
  the header dropdown or floating ThemePicker retimes every preview in
  place. Reduced-motion safety net documented inline.

### Changed — Documentation

- README "Two ways to use it" → "Three ways to use it" with a Tier 3
  bare-tags section and a link to `THREE-TIERS.md`.

### Added — Icons (Lucide `core` pack + per-theme override)

- **Default `core` icon pack** vendored from Lucide, shipping at
  `public/icons/core/<name>.svg` — 49 glyphs (8 already shipped + 41
  new) covering navigation, actions, status, communication, user /
  security, and media. Source list and per-glyph mapping documented in
  `roadmap/icons-proposal.md` and `scripts/icon-contract.json`.
- **Per-theme override mechanism** in `scss/_icons.scss`. The `m.svg`,
  `m.svg-bg`, and `m.svg-text` mixins now emit
  `var(--cia-icon-<name>, url('/icons/core/<name>.svg'))` as the icon
  URL, so a theme overrides one glyph by declaring
  `--cia-icon-<name>: url('/themes/<theme>/icons/core/<name>.svg')` on
  `:root`. Resolution order: per-theme override → core pack → 404.
  Mixin call signatures are unchanged (`m.svg(check)` still works).
- New SCSS variable `$icon-pack` (default `'core'`, re-exported as
  `$theme-icon-pack`) decouples the pack folder from `$icon-path`.
- New machine-readable contract at `scripts/icon-contract.json` and a
  validator at `scripts/icon-validator.js` (`npm run validate-icons`)
  that mirror the theme-validator. The validator fails if a pack omits
  any contract glyph.
- New script `scripts/vendor-lucide-core.mjs` (idempotent) regenerates
  `public/icons/core/` from `lucide-static`.
- New `LICENSE-third-party` at the repo root attributing Lucide
  (ISC + Feather-derived MIT subset).
- `CONTRACT.md` gains an "Icons contract" section covering the
  resolution order, the canonical 49-glyph list, naming conventions,
  and SVG file-format expectations.
- `AGENTS.md` gains a short "Icons" subsection pointing at
  `CONTRACT.md` for the full spec.

The legacy flat-layout files at `public/icons/<name>.svg` (the original
8 glyphs) remain on disk as a backward-compat copy; the mixin output now
resolves against `/icons/core/<name>.svg`.

## [0.6.0] - 2026-04-25

First public release — the npm + CDN cut. The library, its docs, the
theme system, the React component layer, the test pipeline, and the
release/CDN automation all land together — designed as one system,
shipped as one cake. v1.0.0 is reserved for after the CDN smoke is
verified live and the API has stabilised in production usage.

### Added — Library

- Six built-in themes: **Sketchbook** (default), **Press**, **Graphite**,
  **Glass**, **Cupertino**, **Terminal**. All ship as `[data-theme="..."]`
  blocks in a single consolidated `public/theme.css`; per-theme files
  remain at `public/themes/<name>/theme.css` for external download.
- 123-token theme contract (`scripts/theme-contract.json`) + validator
  (`scripts/theme-validator.js`) that gate every theme, consolidated or
  standalone.
- ~120 SCSS mixins across `_mixins.scss`, `_layout.scss`, `_animations.scss`,
  `_icons.scss`, and the `components/*.scss` partials. Mixin-first API.
- Token-driven runtime theming via `<html data-theme="...">` attribute +
  cookie persistence. No FOUC, no `<link href>` mutation, no hydration
  mismatch.
- Animation system: 12 named keyframes, motion tokens
  (`--duration-fast/normal/slow`, `--ease`), `.cia-anim-*` and
  `.cia-hover-*` utility classes, all respecting `prefers-reduced-motion`.
- Utility class set (`.cia-*` namespace) for spacing, flex, grid, text,
  color, display, position, sizing — covered in
  [`/docs/utilities`](./src/app/docs/utilities/page.tsx).
- Icon system in `scss/_icons.scss` with SVG and Font Awesome tracks; eight
  starter SVGs in `public/icons/`.

### Added — React component library

- 45 React components built on `forwardRef` + CSS Modules: Accordion,
  Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, DataTable,
  Divider, DocsSidebar, DraftStamp, Dropdown, Example, FormField, Input,
  Label, LaunchGate, List, Logo, LogoMark, MenuItem, Modal, Pagination,
  Popover, Post, Principle, Progress, Radio, Seal, SearchBar, Select,
  SiteHeader, Skeleton, Slider, Spinner, StatChip, Switch, Tabs, Tag,
  Textarea, ThemePicker, ThemeTile, TimelineItem, Toast, Tooltip.

### Added — Documentation site

- Nested-route docs at `/docs` with shared shell (sidebar + on-this-page
  TOC + prev/next footer + cookie-driven theme picker).
- 24 static-export pages including: getting started, install (CDN /
  npm-SCSS / React-Next / download), tokens reference, mixin API, utility
  class reference, animation reference, accessibility reference, recipes
  (10 composed patterns), Bootstrap migration, Tailwind migration, theme
  authoring guide, icon authoring guide, FAQ.
- LaunchGate component + `public/flags.json` for coming-soon and
  announcement banner modes.

### Added — Quality, CI, and release

- GitHub Actions CI workflow (`.github/workflows/ci.yml`): lint, SCSS
  lint, theme validator, library bundle build, Next static export, docs
  artifact upload.
- Playwright suite (`tests/`): 16 smoke tests, 5 axe-core a11y scans, 18
  visual-regression baselines (6 themes × 3 routes). Parallel CI job.
- `semantic-release` pipeline (`.releaserc.json` +
  `.github/workflows/release.yml`) gated on CI success — Conventional
  Commits drive `CHANGELOG.md`, version bumps, GitHub releases, and npm
  publish.
- CDN publish workflow (`.github/workflows/cdn-publish.yml`): on every
  release, attaches `.tar.gz` + `.zip` bundles to the GitHub Release and
  smoke-checks five jsDelivr URLs.
- Package shaped for distribution: `exports` map (CSS bundles + SCSS
  source + per-theme files + figma tokens), `peerDependencies` (sass
  optional), `engines.node >= 20`, `prepublishOnly` builds bundles.

### Added — Community meta

- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1
  adoption), `SECURITY.md` (90-day coordinated disclosure),
  `VERSIONING.md` (SemVer + deprecation lifecycle + Conventional Commits
  mapping).
- Issue templates: bug report, feature request, theme submission,
  question; pull-request template.
- README badges (CI status + Node 20 + MIT + semantic-release).

### Changed — Mixin API consolidation

- **Buttons**: `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`,
  and `btn-preset` are replaced by a single `btn($variant)` router. Status
  variants (info / success / warning / error) are FREE via token
  interpolation (`#{$variant}-default`, `#{$variant}-subtle`,
  `#{$variant}-text`). The previous mixin names are gone — call sites
  update to `@include btn(primary)`.
- **Tag**: `tag-base` + `tag-removable` are replaced by
  `tag($removable: false)`.
- **List item**: `list-item` + `list-item-interactive` are replaced by
  `list-item($interactive: false)`.
- **`nav-link`** removed — was an alias for `navbar-link`. Use
  `navbar-link` directly.

### Changed — Theme system

- Theme dispatch moved from runtime `<link href>` mutation to
  `<html data-theme="...">` attribute + cookie. Eliminates Next 15 / React
  19 hydration warnings on docs routes. The previous `cia-theme-file`
  localStorage key is replaced by a `cia-theme` cookie.
- **Numbered sizing scale migration (non-breaking refactor).** Numeric
  keys (`1..N`) are now the authoritative source of truth for the internal
  scale maps; t-shirt keys (`xs/sm/md/…`) layer on top as aliases that
  resolve to the same values. Aligns with Radix, Open Props, IBM Carbon
  conventions; unblocks numeric tokens (`--space-1..9`,
  `--font-size-1..10`, …).

  Both call styles continue to produce identical visual output —
  `m.space(4)` and `m.space(md)` both resolve to `1rem`. The generator
  emits both `--space-4` *and* `--space-md` at `:root` so themes can
  declare either.

  Mixin defaults flipped from t-shirt to numeric across `_mixins.scss`,
  `_layout.scss`, and `components/*.scss` (~60 defaults). Theme
  component tokens in `scss/theme/_components.scss` flipped too; radius
  component tokens stayed t-shirt because the radius scale is
  anchor-named (`sm/md/lg/xl/full`).

  `$radius`, `$z-layers`, `$letter-spacings`, `$breakpoints`, and
  container width aliases stay keyed by name (semantic anchor maps).

- Standardized dark/light theme selector on `[data-theme="..."]`. The
  `.theme-dark` / `.theme-light` class selectors are removed from the
  generator and documentation. For component-scoped theming, use the
  `generate-scoped` mixin under your own selector.

### Fixed

- Real fixes (not allowlist) for 7 axe-core serious violations:
  color-contrast on home/footer; in-prose link contrast on
  `/docs/install` + `/docs/tokens`; aria-prohibited-attr on token
  swatches; aria-hidden-focus on the recipes-page modal demo;
  scrollable-region-focusable on `<pre>` code samples.
- React 19 hydration mismatch on `/docs/*` routes — root cause was
  `usePathname()` in `DocsNav` + `DocsPrevNext` resolving differently
  between static-export build time and client hydration. Fixed with a
  `mounted` gate in both components.
- 4 ESLint warnings: Popover useEffect deps, Avatar `<img>` →
  `next/image`, Dropdown unused `_ref`, Radio unsupported
  `aria-invalid`.
- Eliminated Sass "unquoted color-name in interpolation" warning by
  quoting the `black` key in `$font-weights` (`scss/_system.scss`).
- Doc typo in `scss/README.md`: import example referenced a nonexistent
  `primitives` module; corrected to `system`.

### Removed

- Hex-coded `buttonold` scratch mixin (replaced by token-driven
  `btn-preset`, then absorbed into `btn($variant)`).

### Sizing scale alias tables

For reference — both call styles produce identical output. T-shirt aliases
remain available for legacy code; numbered keys are recommended for new code.

Space (`$spacing`, `$space`):
| t-shirt | numeric | value    |
| ------- | ------- | -------- |
| xs      | 1       | 0.5rem   |
| sm      | 2       | 0.75rem  |
| —       | 3       | 0.875rem |
| md      | 4       | 1rem     |
| lg      | 5       | 1.5rem   |
| xl      | 6       | 2rem     |
| 2xl     | 7       | 3rem     |
| 3xl     | 8       | 4rem     |
| 4xl     | 9       | 6rem     |

Extras outside the numbered scale: `0` / `none` (0), `2xs` (0.25rem).

Font size (`$font-sizes`):
| t-shirt | numeric | value    |
| ------- | ------- | -------- |
| xs      | 1       | 0.75rem  |
| sm      | 2       | 0.875rem |
| base    | 3       | 1rem     |
| lg      | 4       | 1.125rem |
| xl      | 5       | 1.25rem  |
| 2xl     | 6       | 1.5rem   |
| 3xl     | 7       | 1.875rem |
| 4xl     | 8       | 2.25rem  |
| 5xl     | 9       | 3rem     |
| 6xl     | 10      | 3.75rem  |

Line height (`$line-heights`):
| named   | numeric | value |
| ------- | ------- | ----- |
| none    | 1       | 1     |
| tight   | 2       | 1.25  |
| snug    | 3       | 1.375 |
| normal  | 4       | 1.5   |
| relaxed | 5       | 1.625 |
| loose   | 6       | 2     |

Shadow (`$shadows-light` / `$shadows-dark`):
| t-shirt | numeric |
| ------- | ------- |
| sm      | 1       |
| md      | 2       |
| lg      | 3       |
| xl      | 4       |
| 2xl     | 5       |

Semantic shadow keys (`inner`, `none`) remain named.

## [0.1.0] - 2026-04-15

### Added
- Initial extraction of the SCSS design system from `boiler-project-ai`.
- `package.json` with `build`, `build:min`, and `watch` scripts.
- Top-level `README.md` with install and usage instructions.
- `ROADMAP.md` outlining phases through v1.0.
