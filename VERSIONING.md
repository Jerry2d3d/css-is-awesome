# Versioning Policy

How `css-is-awesome` versions its public surfaces, deprecates old APIs, and records changes. This document owns the **policy**; release mechanics (tag, build, publish) live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Public surfaces

`css-is-awesome` ships three versioned public surfaces. A change to any of them is a versioned change.

| Surface             | Lives in                                   | Consumed as                                |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| CSS class names     | `dist/*.css`                               | HTML / SCSS / React class strings          |
| SCSS mixin API      | `scss/` (`_mixins.scss`, `_layout.scss`, …) | Authors who `@use "css-is-awesome/scss/main"` |
| Token contract      | [`CONTRACT.md`](./CONTRACT.md) + [`scripts/theme-contract.json`](./scripts/theme-contract.json) | Themes declared in a `:root { … }` block   |

The **library version** lives in [`package.json`](./package.json). The **contract version** lives in the `version` field of `scripts/theme-contract.json`. They move together on most MAJOR bumps but are independent: a library MINOR can ship without bumping the contract.

---

## 1. Semantic Versioning

This project follows [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html) — `MAJOR.MINOR.PATCH`.

### MAJOR — `x.0.0`

Any change that can break a consumer upgrading blindly.

| Change                                                                    | Example                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------ |
| Public CSS class renamed or removed                                       | `.btn-primary` → `.btn-cta`                            |
| SCSS mixin renamed, removed, or breaking signature change                 | `m.btn($variant)` now requires `$size`                 |
| SCSS mixin default changes rendered output                                | `m.card()` default radius flips from `md` → `lg`       |
| Contract: required token renamed or removed                               | `--surface-default` → `--surface-base`                 |
| Contract: `version` field bumps to a new major (`"1"` → `"2"`)            | Required-token removal in `scripts/theme-contract.json` |
| React component removed, renamed, or incompatible prop change             | `<Button variant>` values narrowed                     |
| Peer-dependency floor rises                                               | `react: >=18` → `react: >=19`                          |

### MINOR — `0.x.0`

Additive, non-breaking changes.

| Change                                                       | Example                                           |
| ------------------------------------------------------------ | ------------------------------------------------- |
| New public CSS class                                         | `.cia-grid-auto-fit` added                        |
| New public SCSS mixin                                        | `m.cluster($gap)` added                           |
| New optional token added to contract (`"1"` → `"1.1"`)       | `--dropdown-offset-y` added to component section  |
| New React component                                          | `<DataTable>` added                               |
| Additive component prop with a sensible default              | `<Button loading>` added, defaults to `false`     |
| New utility class (`.cia-*`)                                 | `.cia-text-balance` added                         |

### PATCH — `0.0.x`

Internal-only or visually-identical changes.

| Change                                                    | Example                                            |
| --------------------------------------------------------- | -------------------------------------------------- |
| Bug fix that does not change public API                   | Focus ring no longer clipped on `.btn-ghost`       |
| Documentation content change                              | Typo fix in `CONTRACT.md`                          |
| Build output micro-optimization with no visual change     | Redundant `0` removed from compiled shadows        |
| Security patch that does not change public API            | Upstream Sass `@import` path sanitization          |
| Dependency bump within an already-allowed range           | `sass ^1.97.1` → `sass ^1.98.0`                    |

---

## 2. Pre-1.0 rules

While the library is pre-1.0 (`0.x.x`), the rules above apply with one carve-out: we reserve the right to ship a genuinely-breaking change as a **MINOR** bump if it is the right call for the system's long-term shape. Every such change is:

1. Called out loudly in the `CHANGELOG.md` entry under `### Changed` with a **BREAKING** prefix.
2. Called out again in the release notes with a migration snippet.

**`1.0.0` locks the contract.** After 1.0, breaking changes require a MAJOR bump, no exceptions.

---

## 3. Deprecation policy

Every public symbol — CSS class, SCSS mixin, React prop, contract token — follows the same lifecycle: **deprecate → warn → remove**.

### Lifecycle

1. **Mark** the symbol with an inline `@deprecated` comment citing the replacement and the intended removal version.
2. **Warn** at use-time:
    - React components / hooks → `console.warn(…)` once per session (dedupe by symbol name).
    - SCSS mixins → `@warn "m.old-name is deprecated, use m.new-name (removed in 1.0)";`.
    - CSS classes / tokens → no runtime warning possible; rely on the `@deprecated` JSDoc and changelog.
3. **Announce** in the next MINOR release's `CHANGELOG.md` under `### Deprecated`.
4. **Keep functional** for **at least one full MINOR release cycle** after the deprecation lands.
5. **Remove** only in a MAJOR bump.

### Example — deprecating a mixin

```scss
// scss/_mixins.scss
/// @deprecated Use `m.btn-primary` with `$bg: action-secondary-default` override.
///             Removed in 1.0.
@mixin btn-secondary($size: md) {
  @warn "m.btn-secondary is deprecated; use m.btn-primary with $bg: action-secondary-default. Removed in 1.0.";
  @include btn-primary($size, $bg: action-secondary-default);
}
```

### Example — deprecating a token

A deprecated contract token:

1. Stays in `scripts/theme-contract.json` under `required` so existing themes keep validating.
2. Gets a `> **Deprecated — removed in contract v2.**` note in its row in `CONTRACT.md`.
3. Bumps the contract `version` by a minor step (e.g. `"1.1"` → `"1.2"`).
4. Is removed from `required` only when the contract `version` bumps to the next major (`"2"`), which coincides with the next library MAJOR.

---

## 4. Changelog format

Changelog follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) verbatim. Each release entry uses these sections, in this order, omitting any that are empty:

- `Added` — new features.
- `Changed` — changes to existing functionality.
- `Deprecated` — soon-to-be-removed features.
- `Removed` — removed features.
- `Fixed` — bug fixes.
- `Security` — vulnerabilities and mitigations.

Entries are written in past tense, grouped by section, and link issue / PR numbers. The top of [`CHANGELOG.md`](./CHANGELOG.md) always carries an `## [Unreleased]` section where in-flight changes accumulate between releases.

### Example release block

```md
## [0.6.0] - 2026-05-12

### Added
- `<DataTable>` component with generic row typing and optional pagination (#142).
- Theme validator now supports `--watch` mode (#138).

### Changed
- `Pagination` props: native `HTMLAttributes.onChange` is `Omit`ped so the custom `onChange(page)` stops colliding. Non-breaking for existing consumers (#140).

### Deprecated
- `m.btn-secondary` — use `m.btn-primary` with `$bg: action-secondary-default` override. Removed in 1.0 (#143).

### Fixed
- Theme picker no longer injected duplicate `<link>` elements on first paint (#145).
```

---

## 5. Conventional Commits → Changelog

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The prefix maps to a changelog section:

| Commit prefix                             | Changelog section               |
| ----------------------------------------- | ------------------------------- |
| `feat:`                                   | `Added`                         |
| `feat!:` or `BREAKING CHANGE:` footer     | `Changed` (breaking — MAJOR)    |
| `fix:`                                    | `Fixed`                         |
| `perf:`                                   | `Changed`                       |
| `docs:`                                   | *omit*                          |
| `refactor:`                               | *omit*                          |
| `test:`                                   | *omit*                          |
| `chore:`                                  | *omit*                          |
| `build:` / `ci:`                          | *omit*                          |

A commit can carry a `Deprecates:` footer to force an entry under `### Deprecated`, or a `Security:` footer to force `### Security`, regardless of prefix.

---

## 6. Release process

The policy in this document tells you **what** a version number means. The mechanics of cutting a release — tagging, building `dist/*.css`, validating themes, publishing to npm — live in [`CONTRIBUTING.md`](./CONTRIBUTING.md) and are automated per Epic 5.

Every release, at minimum:

1. Promotes `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD` in `CHANGELOG.md`.
2. Bumps `version` in `package.json` per the rules in §1.
3. Bumps `version` in `scripts/theme-contract.json` if the contract changed.
4. Runs `npm run validate-themes` — must pass.
5. Rebuilds `dist/*.css` via `npm run build:css:all`.
6. Tags the commit `vX.Y.Z` and pushes.

---

## 7. How to read the version

Two version numbers, two files:

| Version             | Source                                                        | Bumps on                                                                  |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Library version     | `version` field of [`package.json`](./package.json)           | Any change to CSS / SCSS / React public surfaces per §1.                  |
| Contract version    | `version` field of [`scripts/theme-contract.json`](./scripts/theme-contract.json) | Contract-only changes (new optional token → minor; required token renamed or removed → major). |

They usually move together on a library MAJOR. They move independently on MINOR and PATCH.

---

## See also

- [`CHANGELOG.md`](./CHANGELOG.md) — the actual change log.
- [`CONTRACT.md`](./CONTRACT.md) — the token contract.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — release mechanics and contributor workflow.
- [`ROADMAP.md`](./ROADMAP.md) — where the library is headed toward `1.0.0`.
