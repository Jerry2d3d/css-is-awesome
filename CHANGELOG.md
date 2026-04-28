# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**See also:** [`VERSIONING.md`](./VERSIONING.md) — version policy, deprecation
lifecycle, and the Conventional Commits → changelog section mapping that drives
automated releases.

## [Unreleased]

### Added — Documentation

- [`THREE-TIERS.md`](./THREE-TIERS.md) — top-level doc for the canonical
  three-tier authoring story (drop-in classes, SCSS mixins, bare tags),
  same-button-three-ways demo, router architecture, and a picking-a-tier
  table.
- New docs route `/docs/three-tiers` dogfoods the same story with live
  Button previews next to each tier's code. Sidebar nav: "Three tiers"
  sits between Introduction and Install under Getting started.

### Changed — Documentation

- README "Two ways to use it" → "Three ways to use it" with a Tier 3
  bare-tags section and a link to `THREE-TIERS.md`.

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
