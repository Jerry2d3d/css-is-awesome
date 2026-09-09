# EPIC v1.2-06 — The analyzer health report (`cia analyze`, graded)

> Added 2026-09-07 from the external review (second-AI audit). The reviewer's
> strongest "we do something Bootstrap/Tailwind aren't trying to do" idea:
> turn `cia analyze` from a pass/fail linter into a **graded design-system
> health report** with specific, fixable findings.

**Status:** Planned (v1.2)
**Effort estimate:** ~3-4 working days
**Stories:** 6

## Mission

Make `npx cia analyze` produce a report a team wants to run every sprint:
a headline score, findings grouped by category, and — the part that turns a
linter into an assistant — a **suggested fix on every finding** ("`#8B91A0`
on `--surface` is 3.2:1; nearest on-scale token is `--ink-soft`").

## Why now

The plumbing already exists and is honest — `bin/analyze.cjs` (191 lines,
zero-dependency) reads the **real** API surface from the installed package's
SCSS, walks the consumer's `*.scss`, and already computes and prints
`Design-system health: N%` (`health = 100 − err·10 − warn·2 − info`), with
`--json` and `--strict`. What it lacks is exactly what makes the reviewer's
mock-up compelling: contract-token awareness, more rule coverage, and a
suggested remedy per finding. This is enrichment of a working tool, not a
rewrite — the lowest-risk high-value item in the whole review.

## What exists today (baseline — do not re-build)

Rules already implemented in `bin/analyze.cjs`: `unknown-symbol` (dead
`cia.*` calls), `space-scale` (the `space(>9)` pass-through trap),
`hard-coded-color`, `bem`, `hand-written-areas`. Already present: real-API
symbol discovery, per-file grouping, the `health` number, `--json`,
`--strict`, `--namespace`.

## Out of scope

- Auto-fixing / rewriting the consumer's files. Report only; the human edits.
  (A `--fix` verb can be its own later story once the rules are trusted.)
- Any new runtime dependency. The analyzer stays zero-dep, filesystem-only —
  same philosophy as the MCP server.

## Features

### F1 — Contract-token awareness

- **US-V12.06.1.1** (M) — Load `scripts/theme-contract.json` (already shipped
  in `files`) and flag `var(--token)` references that are **not** in the
  contract (typos, invented tokens). Acceptance: a stylesheet using
  `var(--inkk)` reports `off-contract-token` with the nearest real token as
  the suggestion; a stylesheet using only contract tokens reports none.
- **US-V12.06.1.2** (M) — Flag hard-coded lengths that should be tokens:
  `border-radius`/`padding`/`margin`/`gap` literals that don't match a scale
  step, with the nearest step as the fix. Acceptance: `border-radius: 7px`
  suggests the nearest `--radius-*`; `gap: 1rem` that equals a scale step is
  silent.

### F2 — More rules

- **US-V12.06.2.1** (M) — `missing-focus-visible`: heuristically flag
  interactive selectors (`button`, `a`, `[role=button]`, `.btn`-shaped) that
  define `:hover`/`:active` but no `:focus-visible`/`focus-ring`. Marked
  `info`, not `error` — regex heuristics are noisy; never fail CI on it by
  default. Acceptance: documented as a hint, opt-in to `--strict`.
- **US-V12.06.2.2** (L, OPTIONAL) — `duplicated-pattern`: detect N+ identical
  declaration blocks that could be one mixin. Speculative and the most
  false-positive-prone rule in the epic; ship last, behind a flag, or drop.

### F3 — The graded report

- **US-V12.06.3.1** (M) — ✅ DONE 2026-09-08. The default report is now graded:
  a `health/100` header, a section per category (API / Contract / Spacing /
  Color / Naming / Layout) with `✓` when clean, and each finding shown with its
  file and a `→` suggested-fix line. `--verbose` keeps the flat per-file view;
  `--json` gains `category` + `suggestion` per finding (additive). README
  updated. (Accessibility category lights up when F2.1 lands.)
- **US-V12.06.3.2** (S) — `/docs` page + README section documenting every
  rule, its level, and how the score is computed, so a number in CI is
  legible. Acceptance: each rule links to the doc anchor from `--help`.

## What changes

- `bin/analyze.cjs` grows new rules and a categorized renderer; it starts
  reading `scripts/theme-contract.json`.
- The `--json` envelope gains `category` and `suggestion` fields (**additive**
  — existing consumers of `counts`/`health`/`results` keep working).
- A new docs page and README pass.

## What we may lose

- **Score comparability across versions.** Adding rules changes the number a
  clean-ish project scores. Anyone gating CI on an exact threshold will see
  it move on upgrade. Mitigation: the weighting formula stays the same, new
  rules land mostly as `info`/`warn` (small weight), and the docs state the
  score is a within-version trend, not a cross-version constant.
- **Signal-to-noise, if we over-reach.** `missing-focus-visible` and
  `duplicated-pattern` are heuristic; shipped at `error` they'd cry wolf.
  Held at `info` and (for duplicates) behind a flag or cut entirely.

## Risks

- Regex-based SCSS analysis can't see through `@each`/`calc()`/interpolation.
  Accept false negatives over false positives; never fail CI on a heuristic.
- The nearest-token suggestion needs a tiny color-distance + scale-nearest
  helper, still zero-dep.

## Definition of done

`cia analyze` prints a graded, categorized report with a suggested fix on
every finding; contract-token and hard-coded-length rules live; `--json` is
additively extended; the rule set is documented; the analyzer stays zero-dep
and the existing five rules still pass their cases.

## Related

- `bin/analyze.cjs` (the tool), `scripts/theme-contract.json` (the contract),
  `scripts/theme-a11y.js` (contrast math to reuse for any color suggestions).
- Pairs with [v1.2 EPIC-07 — token intelligence in the editor](./EPIC-07-token-intelligence-editor.md):
  same contract, one surfaced in CI, the other in the editor.
