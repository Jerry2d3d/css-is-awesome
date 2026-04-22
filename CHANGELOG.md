# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Numbered sizing scale migration (Epic 1.1, non-breaking refactor).** Numeric
  keys (`1..N`) are now the authoritative source of truth for the internal scale
  maps; t-shirt keys (`xs/sm/md/…`) layer on top as aliases that resolve to the
  same values. This aligns the library with Radix, Open Props, and IBM Carbon
  conventions and unblocks the numeric half of the theme token contract
  (`--space-1..9`, `--font-size-1..10`, …).

  Both call styles continue to produce identical visual output — `m.space(4)`
  and `m.space(md)` both resolve to `1rem`, and the generator emits `--space-4`
  *and* `--space-md` at `:root` so themes can declare either (or both).

  Mixin defaults across `scss/_mixins.scss`, `scss/_layout.scss`, and
  `scss/components/*.scss` were flipped from t-shirt to numeric (~60 defaults).
  Theme component tokens in `scss/theme/_components.scss` that feed space/shadow
  lookups were flipped too; radius component tokens stayed t-shirt because the
  radius scale is anchor-named (`sm/md/lg/xl/full`) and maps to the contract's
  semantic `--radius-*` tokens.

  `$radius`, `$z-layers`, `$letter-spacings`, `$breakpoints`, and container
  width aliases are **not** on a numbered scale — they're semantic anchor maps
  and stay keyed by name.

  #### Alias mapping tables

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

- Standardized dark/light theme selector on `[data-theme="..."]`. Removed the `.theme-dark` / `.theme-light` class selectors from the generator and documentation. For component-scoped theming, use the `generate-scoped` mixin under your own selector.
- Fixed doc typo in scss/README.md: the import example referenced a nonexistent `primitives` module; corrected to `system`.

### Fixed
- Eliminated Sass "unquoted color-name in interpolation" warning by quoting the `black` key in `$font-weights` (scss/_system.scss).

### Added
- `LICENSE` (MIT).
- `CHANGELOG.md` (this file).
- `.editorconfig` for contribution consistency.

## [0.1.0] - 2026-04-15

### Added
- Initial extraction of the SCSS design system from `boiler-project-ai`.
- `package.json` with `build`, `build:min`, and `watch` scripts.
- Top-level `README.md` with install and usage instructions.
- `ROADMAP.md` outlining phases through v1.0.
