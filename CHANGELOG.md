# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Eliminated Sass "unquoted color-name in interpolation" warning by quoting the `black` key in `$font-weights` (scss/_system.scss).

### Changed
- Standardized dark/light theme selector on `[data-theme="..."]`. Removed the `.theme-dark` / `.theme-light` class selectors from the generator and documentation. For component-scoped theming, use the `generate-scoped` mixin under your own selector.
- Fixed doc typo in scss/README.md: the import example referenced a nonexistent `primitives` module; corrected to `system`.

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
