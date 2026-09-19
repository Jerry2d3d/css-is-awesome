# EPIC v1.4-03 — Contract hygiene

**Status:** ✅ Complete — shipped as css-is-awesome **1.16.1** (2026-09-18, contract 1.1) and **1.18.0** (2026-09-19, contract 1.2).
**Effort actual:** ~1 working day
**Stories:** 5

## Mission

Make the theme contract impossible to break by accident again: a required token can never be added in a MINOR without CI noticing, optional tokens are information rather than failures, and every optional token says which feature it enables.

## The incident

Library **1.12.0** (2026-09-10, the density knob) added `--space-unit` to the contract's *required* list while the contract version stayed `"1"`. [`VERSIONING.md`](../../../VERSIONING.md) forbids that in a MINOR: every consumer validating a custom theme with the shipped validator started failing on upgrade. It was invisible to us because all 24 shipped themes declared the token, so `validate-themes` stayed green — a green check that proved nothing. Reported by Gremlin Forge via boiler-project-ai on 2026-09-18; verified as the only required-list change between 1.11.1 and 1.16.0. The token is not needed at runtime: only the shipped theme files call `space-scale`, the library's root defaults never emit it, and a hand-written theme with absolute `--space-N` values never references it.

## What shipped

### 1.16.1 — contract 1.1

- `--space-unit` moved to `optional`; contract `"1"` → `"1.1"`.
- `theme-validator.js` reports undeclared optional tokens as **info** (`--show-optional` lists them) and never fails on them; a theme omitting only `--space-unit` validates clean.
- **`npm run check:contract`** (`scripts/check-contract-growth.mjs`, CI-gated; checkout uses `fetch-depth: 0` for tags): diffs the contract against the last release tag and fails when the required/optional lists change without the version bump the versioning tables demand. Proven to fail on an unbumped relaxation and on an unbumped new required token.
- VERSIONING.md gained explicit rows: new required token → MAJOR; required relaxed to optional → contract minor. CONTRACT.md / MIGRATION.md disclose the 1.12.0–1.16.0 mistake. Stale "127 required + 36 optional" figures (reality 128 + 40) corrected.

### 1.18.0 — contract 1.2

- `features` map in `scripts/theme-contract.json`: every one of the 41 optional tokens in exactly one of 10 features (density, spacing-aliases, print, component-radius, component-shadows, component-motion, surfaces-extended, borders-extended, logo, touch-target).
- Validator info line reports per feature; results carry `optionalMissingByFeature`; MCP `get_token` returns `feature`.
- `check:contract` also fails on an orphaned, duplicated or required token in the map.
- CONTRACT.md feature table — the first documentation for fourteen optional tokens that had no row.

## Stories (all accepted)

- [x] US-V14.03.1 Relax `--space-unit`; bump contract; validator info path
- [x] US-V14.03.2 `check-contract-growth.mjs` + CI wiring + negative tests
- [x] US-V14.03.3 VERSIONING / CONTRACT / MIGRATION disclosures; count sweep
- [x] US-V14.03.4 `features` map, validator grouping, MCP exposure
- [x] US-V14.03.5 Consumers told to floor at `^1.16.1` (1.16.0 still bundles the old list)

## Rule going forward

When a feature needs a new theme token, add it as **optional** with a library or generator default and bump the contract minor. A required change is a MAJOR, with a migration entry. `check:contract` enforces both.

## Related

- [`../../handoffs/2026-09-18-gremlin-forge-boilerplate.md`](../../handoffs/2026-09-18-gremlin-forge-boilerplate.md)
- [`../../../VERSIONING.md`](../../../VERSIONING.md), [`../../../CONTRACT.md`](../../../CONTRACT.md)
