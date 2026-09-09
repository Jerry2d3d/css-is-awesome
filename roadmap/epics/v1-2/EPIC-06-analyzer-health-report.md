# EPIC v1.2-06 — The analyzer health report (`cia analyze`, graded)

> Added 2026-09-07 from the external review (second-AI audit). The reviewer's
> strongest "we do something Bootstrap/Tailwind aren't trying to do" idea:
> turn `cia analyze` from a pass/fail linter into a **graded design-system
> health report** with specific, fixable findings.

**Status:** Complete (2026-09-09). F3.1 shipped 2026-09-08; F1.2, F2.1, and
F3.2 shipped 2026-09-09. F1.1 turned out to already be shipped — it just
wasn't marked (`off-contract-token` was already live in `bin/analyze.cjs`
before this epic file existed). F2.2 (`duplicated-pattern`) is explicitly
dropped per its own "ship last, behind a flag, or drop" call — most
false-positive-prone rule in the epic, not worth the noise.
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
`off-contract-token` (US-V12.06.1.1 — this was already live, pre-dating this
epic file), `hard-coded-color`, `bem`, `hand-written-areas`. Already present:
real-API symbol discovery, per-file grouping, the `health` number, `--json`,
`--strict`, `--namespace`.

## Out of scope

- Auto-fixing / rewriting the consumer's files. Report only; the human edits.
  (A `--fix` verb can be its own later story once the rules are trusted.)
- Any new runtime dependency. The analyzer stays zero-dep, filesystem-only —
  same philosophy as the MCP server.

## Features

### F1 — Contract-token awareness

- **US-V12.06.1.1** (M) — ✅ ALREADY SHIPPED (pre-dates this epic). Loads
  `scripts/theme-contract.json` and flags `var(--token)` references that are
  **not** in the contract as `off-contract-token`, with the nearest real
  token (edit-distance ≤ 2) as the suggestion; pure custom tokens are left
  alone.
- **US-V12.06.1.2** (M) — ✅ DONE 2026-09-09. `off-scale-length`: flags a
  literal `border-radius`/`padding`/`margin`/`gap` value within 2px of a
  scale step (Sketchbook's reference values — CONTRACT.md's designated
  reference implementation — used as a *hint* table, not an equivalence
  claim, since real themes diverge: Terminal flattens every `--radius-*` to
  `0`). `border-radius: 7px` suggests `--radius-lg`; a literal `0` is never
  flagged. Category `Spacing`.

### F2 — More rules

- **US-V12.06.2.1** (M) — ✅ DONE 2026-09-09. `missing-focus-visible`:
  file-level heuristic — a file styles `:hover`/`:active` on something
  button/link-shaped (`button`, `a`, `[role=button]`, `.btn`-shaped classes)
  but never mentions `:focus-visible` or `focus-ring` anywhere in that file.
  File-level rather than per-selector, because SCSS commonly sets
  `focus-ring` once for a whole component and nests `&:hover` under it
  elsewhere (see `scss/components/_buttons.scss`) — per-selector adjacency
  would false-positive on exactly that shape. `info` level; never fails
  `--strict`. New category `Accessibility`.
- **US-V12.06.2.2** (L, OPTIONAL) — ⛔ DROPPED. `duplicated-pattern` — kept
  as documented-but-not-built, per its own "ship last, behind a flag, or
  drop" call. Most false-positive-prone rule in the epic; not worth it.

### F3 — The graded report

- **US-V12.06.3.1** (M) — ✅ DONE 2026-09-08. The default report is now graded:
  a `health/100` header, a section per category (API / Contract / Spacing /
  Color / Naming / Layout) with `✓` when clean, and each finding shown with its
  file and a `→` suggested-fix line. `--verbose` keeps the flat per-file view;
  `--json` gains `category` + `suggestion` per finding (additive). README
  updated. (Accessibility category lights up when F2.1 lands.)
- **US-V12.06.3.2** (S) — ✅ DONE 2026-09-09. New
  [`/docs/analyzer`](../../../src/app/docs/analyzer/page.tsx) page documents
  every rule (level, category, one-line description), the health formula,
  and all CLI flags. `bin/analyze.cjs`'s `--help` links to it; `README.md`'s
  CLI section updated.

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
every finding; contract-token and off-scale-length rules live; `--json` is
additively extended; the rule set is documented; the analyzer stays zero-dep
and every existing rule still passes its cases. **Met 2026-09-09** —
`duplicated-pattern` (F2.2) intentionally excluded, see above.

## Related

- `bin/analyze.cjs` (the tool), `scripts/theme-contract.json` (the contract),
  `scripts/theme-a11y.js` (contrast math to reuse for any color suggestions).
- Pairs with [v1.2 EPIC-07 — token intelligence in the editor](./EPIC-07-token-intelligence-editor.md):
  same contract, one surfaced in CI, the other in the editor.
