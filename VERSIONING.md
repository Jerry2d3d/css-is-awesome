# Versioning Policy

How `css-is-awesome` versions its public surfaces, deprecates old APIs, and records changes. This document owns the **policy**; release mechanics (tag, build, publish) live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Public surfaces

`css-is-awesome` ships three versioned public surfaces. A change to any of them is a versioned change.

| Surface             | Lives in                                   | Consumed as                                |
| ------------------- | ------------------------------------------ | ------------------------------------------ |
| CSS class names     | `dist/*.css`                               | HTML / SCSS / React class strings          |
| SCSS mixin API      | `scss/` (`_mixins.scss`, `_layout.scss`, …) | Authors who `@use 'css-is-awesome'` / `@use 'css-is-awesome/api'` |
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
| Optional-peer floor rises                                                 | `@modelcontextprotocol/sdk` minimum raised             |

### MINOR — `0.x.0`

Additive, non-breaking changes.

| Change                                                       | Example                                           |
| ------------------------------------------------------------ | ------------------------------------------------- |
| New public CSS class                                         | `.cia-grid-auto-fit` added                        |
| New public SCSS mixin                                        | `m.cluster($gap)` added                           |
| New optional token added to contract (`"1"` → `"1.1"`)       | `--dropdown-offset-y` added to component section  |
| New theme or recipe shipped                                  | `prism` family added; `mobile-nav` recipe added   |
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

## 2. Pre-1.0 rules (historical)

While the library was pre-1.0 (`0.x.x`), the rules above applied with one carve-out: we reserved the right to ship a genuinely-breaking change as a **MINOR** bump when it was the right call for the system's long-term shape (the v0.7 theme renames and the v0.8 mixin-first reframe both used it). Every such change was:

1. Called out loudly in the `CHANGELOG.md` entry with a **BREAKING** prefix.
2. Called out again in the release notes with a migration snippet.

**`1.0.0` locked the contract** (cut 2026-08-17). Breaking changes now require a MAJOR bump, no exceptions.

---

## 3. Deprecation policy

Every public symbol — CSS class, SCSS mixin, React prop, contract token — follows the same lifecycle: **deprecate → warn → remove**.

### Lifecycle

1. **Mark** the symbol with an inline `@deprecated` comment citing the replacement and the intended removal version.
2. **Warn** at use-time:
    - SCSS mixins → `@warn "m.old-name is deprecated, use m.new-name (removed in 2.0)";`.
    - CSS classes / tokens → no runtime warning possible; rely on the `@deprecated` comment and changelog.
3. **Announce** in the next MINOR release's `CHANGELOG.md` under `### Deprecated`.
4. **Keep functional** for **at least one full MINOR release cycle** after the deprecation lands.
5. **Remove** only in a MAJOR bump.

### Example — deprecating a mixin

```scss
// scss/_mixins.scss
/// @deprecated Use `m.btn-primary` with `$bg: action-secondary-default` override.
///             Removed in 2.0.
@mixin btn-secondary($size: md) {
  @warn "m.btn-secondary is deprecated; use m.btn-primary with $bg: action-secondary-default. Removed in 2.0.";
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

**[`CHANGELOG.md`](./CHANGELOG.md) is GENERATED — never edit it by hand.** [semantic-release](https://github.com/semantic-release/semantic-release) writes each release entry from the Conventional Commits that landed since the previous tag, grouped under the conventional-changelog headings:

- `Features` — from `feat:` commits.
- `Bug Fixes` — from `fix:` commits.
- `Performance Improvements` — from `perf:` commits.

**Version pace — the number belongs to the PACKAGE, not the website.**
The docs site lives in this repo but ships nowhere in the npm tarball, so
site-only work must not spend minor versions. The rules (enforced by a
`releaseRules` override in `.releaserc.json`, adopted 2026-09-04 after
site `feat` commits marched 1.1 → 1.8 in a week):

- Library API work (new/changed mixins, tokens, recipes, packaged docs) —
  normal Conventional Commits semantics: `feat` → minor, `fix` → patch.
- Site-only work — scope it `(site)` or `(docs-site)`: `feat(site)` is
  demoted to a **patch**, `fix(site)` patches, `chore`/`docs` don't
  release at all. Prefer `chore(site)` when nothing packaged changed and
  no npm release is needed — production deploys come from the
  `prod-css-is-awesome` branch, not from npm.
- MAJOR (2.0.0) is reserved for real breaking changes to the public
  surfaces above — nothing else may reach it.
- `BREAKING CHANGES` — from `feat!:` / `fix!:` or a `BREAKING CHANGE:` footer.

Each entry links the commit (and any referenced issue / PR numbers) automatically. There is no hand-maintained `Unreleased` section — in-flight changes are simply the commits on `main` that no tag covers yet.

---

## 5. Conventional Commits → Release

Commits follow [Conventional Commits](https://www.conventionalcommits.org/). The prefix decides both the version bump and the changelog section:

| Commit prefix                             | Bump    | Changelog section          |
| ----------------------------------------- | ------- | -------------------------- |
| `feat:`                                   | MINOR   | `Features`                 |
| `feat!:` or `BREAKING CHANGE:` footer     | MAJOR   | `BREAKING CHANGES`         |
| `fix:`                                    | PATCH   | `Bug Fixes`                |
| `perf:`                                   | PATCH   | `Performance Improvements` |
| `docs:`                                   | *no release* | *omit*                |
| `refactor:`                               | *no release* | *omit*                |
| `test:`                                   | *no release* | *omit*                |
| `chore:`                                  | *no release* | *omit*                |
| `build:` / `ci:`                          | *no release* | *omit*                |

Deprecations are announced in the deprecating commit's body (and land in the release notes through it), plus an inline `@deprecated` comment per §3.

---

## 6. Release process

The policy in this document tells you **what** a version number means. The mechanics are automated: on every push to `main` that contains a releasable commit, semantic-release computes the next version from the commit messages, regenerates `CHANGELOG.md`, builds the bundles (`prepublishOnly` runs `build:css:all`), tags `vX.Y.Z`, and publishes to npm. Nobody hand-types a version number anywhere — the hero, the MCP server, and the docs all read it from `package.json`.

What remains manual:

1. Bumping `version` in `scripts/theme-contract.json` when the contract itself changes (§7).
2. The CI gates (lint, validators, coverage, size budget, Playwright) — a red PR never reaches `main`, so a release is never cut from a failing tree.

Contributor-facing workflow detail lives in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## 7. How to read the version

Two version numbers, two files:

| Version             | Source                                                        | Bumps on                                                                  |
| ------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Library version     | `version` field of [`package.json`](./package.json)           | Any change to the CSS / SCSS / contract public surfaces per §1.           |
| Contract version    | `version` field of [`scripts/theme-contract.json`](./scripts/theme-contract.json) | Contract-only changes (new optional token → minor; required token renamed or removed → major). |

They usually move together on a library MAJOR. They move independently on MINOR and PATCH.

---

## See also

- [`CHANGELOG.md`](./CHANGELOG.md) — the actual change log.
- [`CONTRACT.md`](./CONTRACT.md) — the token contract.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — release mechanics and contributor workflow.
- [`ROADMAP.md`](./ROADMAP.md) — where the library is headed.
