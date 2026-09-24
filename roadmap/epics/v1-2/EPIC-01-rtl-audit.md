# EPIC v1.2-01 — RTL Audit + Recipe

**Status:** Complete (2026-09-09).
**Effort estimate:** ~3-5 working days
**Stories:** 7

## Mission

Audit the entire cia SCSS source for non-logical properties (any `margin-left` instead of `margin-inline-start`, etc.). Fix any drift. Ship an `/docs/rtl` walkthrough page, an RTL recipe demonstrating common patterns, and a Playwright test that loads each route in Arabic + Hebrew and snapshots the layout.

## Why now

cia has used logical properties since v0.7 — but the source has been edited by many hands. Drift is likely. v1.2 is the time to lock in RTL correctness before consumers in MENA markets adopt.

## Out of scope

- Translating cia docs themselves into Arabic/Hebrew (out of scope forever — that's a community task)
- BiDi text rendering edge cases (handled by browsers; cia doesn't add to or detract from)
- Per-mixin RTL parameter (`$dir: rtl` opt-in) — not needed if logical properties used throughout

## Features

### F1.1 — Audit + fix non-logical properties

#### US-V12.01.1.1 — Grep cia source for non-logical properties

**Acceptance criteria:**
- [x] Script at `scripts/audit-logical-properties.mjs`
- [x] Scans `scss/**/*.scss` (excluding `themes/*` — themes are token-only)
- [x] Reports: `margin-left`, `margin-right`, `padding-left`, `padding-right`, `border-left`, `border-right`, `text-align: left/right`, `left:`, `right:`
- [x] Outputs file path + line number + suggested replacement
- [x] CI runs on every PR (`npm run check:rtl`); fails if new violations introduced

**Effort:** S (≤4 hrs) — ✅ DONE 2026-09-09.

#### US-V12.01.1.2 — Fix all reported violations

**Acceptance criteria:**
- [x] Each violation from US-V12.01.1.1 either fixed or annotated `// cia-rtl-allow: <reason>`
- [x] All cia tests + Playwright still green
- [x] Visual diff in 6 locked themes (`visual.spec.ts`'s own scope): zero LTR regressions

**Effort:** M (4-8 hrs) — ✅ DONE 2026-09-09. 18 violations found: 8 genuine
component fixes (`_data.scss`, `_navigation.scss`, `_feedback.scss`,
`_accordion.scss`, `_forms.scss` ×2, `scss/examples/_usage.scss` ×2 — the
whole `scss/` tree ships, so this counted); 2 needed a `[dir="rtl"]`
override rather than a rename (`select`'s `background-position`, `switch`'s
`:checked` `translateX`, both verified flipping correctly in a live
browser); 9 were `scss/_utilities.scss`'s Tier-1 physical-direction
utilities (`cia-ml-*`, `cia-text-left`, `cia-border-l`, …) — kept
intentionally (mirrors Tailwind/Bootstrap's own `ml`/`mr` convention,
annotated `cia-rtl-allow`), with a parallel logical set added alongside
(`cia-ms-*`/`cia-me-*`/`cia-mi-*`/`cia-pi-*`, `cia-text-start`/`-end`,
`cia-border-s`/`-e`, `cia-start-0`/`cia-end-0`).

---

### F1.2 — RTL recipe

#### US-V12.01.2.1 — Write `/scss/recipes/rtl-layout.md`

**As** an AI agent building a multilingual site
**I want** a recipe showing how to set `<html dir="rtl">` + which cia patterns work automatically + how to handle the few that need RTL-specific overrides
**So that** I ship Arabic/Hebrew without RTL bugs

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/rtl-layout.md`
- [x] Section on `dir="rtl"` setup
- [x] List of patterns that "just work" because of logical properties
- [x] Section on icon-flipping (chevrons, arrows) — covers `transform: scaleX(-1)` and SVG-internal flip
- [x] Pitfalls: number rendering, English brand names in Arabic context, mixed-direction strings
- [x] Framework examples (React, Vue, Svelte, Vanilla)

**Effort:** M (4-8 hrs) — ✅ DONE 2026-09-09. `npm run validate-recipes` passes
(frontmatter, sections, SCSS block compile, a11y checklist, framework count).

---

### F1.3 — Docs page

#### US-V12.01.3.1 — Build `/docs/rtl` page

**Acceptance criteria:**
- [x] Page at `src/app/docs/rtl/page.tsx`
- [x] Live demo: the exact four components the audit touched (breadcrumb,
  avatar-group, select, switch) rendered side-by-side, `dir="ltr"` panel
  (English) + `dir="rtl"` panel (Arabic) — real mixins via
  `demo.module.scss`, not a lookalike
- [x] Renders the RTL recipe inline (`getRecipe("rtl-layout")`'s `.html`,
  same pattern `/docs/recipes/[slug]/page.tsx` uses)
- [x] Linked from main docs nav (Patterns, next to Print)

**Effort:** M (4-8 hrs) — ✅ DONE 2026-09-09. Verified live in a browser: the
select's chevron and the switch's knob/slide both visibly flip sides between
panels; `background-position-x` confirmed via computed style
(`calc(100% - 12px)` LTR → `12px` RTL).
**Depends on:** US-V12.01.2.1

---

### F1.4 — Playwright RTL test suite

#### US-V12.01.4.1 — Add RTL test fixture

**Acceptance criteria:**
- [x] Playwright test at `tests/rtl.spec.ts`
- [x] Iterates over key routes (/, /docs, /themes, /docs/rtl) + all 8 recipe pages
- [x] For each: set `<html dir="rtl">` (via `page.evaluate`, not a cookie —
  direction isn't persisted app state), capture screenshot
- [x] Snapshot baselines committed at `tests/__screenshots__/rtl.spec.ts/`
  (the project's actual `snapshotPathTemplate`, not a separate `tests/snapshots/rtl/`
  — matches `visual.spec.ts`'s existing convention). **Both platforms**
  committed (win32 local + linux via Docker
  `mcr.microsoft.com/playwright:v1.59.1-noble`, matching the installed
  `@playwright/test` version) — required, since CI's Playwright job runs on
  `ubuntu-latest` and a missing baseline fails outright.

**Effort:** M (4-8 hrs) — ✅ DONE 2026-09-09. chromium-only, same rationale
as `visual.spec.ts` (font-rasterisation noise across engines) — see the
updated `playwright.config.ts` comment and `tests/README.md`.

#### US-V12.01.4.2 — Axe scan on RTL routes

**Acceptance criteria:**
- [x] Run @axe-core/playwright on a representative subset (/, /docs,
  /docs/rtl, /docs/recipes/rtl-layout — mirrors `a11y.spec.ts`'s own
  curated-subset philosophy) with `dir="rtl"` set first
- [x] Zero violations beyond the existing LTR baseline
- [x] Wired into `npm test` (same `tests/rtl.spec.ts` file, second `describe` block)

**Effort:** S (≤4 hrs) — ✅ DONE 2026-09-09. **Found two real, pre-existing
a11y bugs** while writing this (not RTL-specific — the first test to axe-scan
an actual `/docs/recipes/*` page at all): GFM task-list checkboxes in
rendered recipe/blog markdown had no accessible name (`label`, critical),
and the code-block `<pre>` had no `tabindex`/`role` for keyboard scrolling
(`scrollable-region-focusable`, serious). Fixed at the source
(`src/lib/recipes.ts` + `src/lib/blog.ts`'s shared `marked` renderer —
`checkbox()` now emits `aria-hidden="true"` since the box is decorative and
disabled; `code()`'s `<pre>` now matches `Example.tsx`'s own
`tabindex="0" role="region" aria-label="Code sample"` pattern). Both suites
green after the fix.

#### US-V12.01.4.3 — Document the RTL test process in CONTRIBUTING.md

**Acceptance criteria:**
- [x] CONTRIBUTING.md gets an "RTL testing" section
- [x] Explains how to update snapshots
- [x] Notes that visual diffs are reviewed manually

**Effort:** S (≤4 hrs) — ✅ DONE 2026-09-09.

## Definition of done

- [x] All 7 stories accepted
- [x] Audit script lives + runs in CI
- [x] All non-logical-property violations fixed or explicitly annotated
- [x] `/docs/rtl` page lives + linked
- [x] RTL recipe shipped
- [x] Playwright RTL snapshot suite green (win32 + linux baselines both committed)
- [x] Axe-clean on RTL routes (after fixing two pre-existing bugs the new scan surfaced)

**Met 2026-09-09.**

## Unrelated finding, not fixed (out of scope)

Running the full Playwright suite surfaced 27 pre-existing `smoke.spec.ts`
failures, unrelated to RTL: nearly every route logs 7 console 404s for
Next.js RSC prefetch payloads (`__next.<route>.__PAGE__.txt?_rsc=...`)
against `npx serve out` — a static-export/RSC-prefetch/generic-static-server
interaction, not a content bug (`/about`, `/compare`, `/showcase` are
affected identically to anything this epic touched). Confirmed via a direct
network-request check, not fixed here — flagging for a separate look.

## Risks

- **Icon flipping edge cases.** Some icons (arrow-right, undo) should flip in RTL; others (logos, brand marks) must NOT. Mitigation: recipe documents the per-icon decision; cia ships base behavior with opt-out class.
- **Snapshot maintenance.** Visual snapshots can drift unintentionally. Mitigation: snapshots gate manual review on every PR; auto-update only on explicit `--update-snapshots` flag.
- **Bidi text in form inputs.** Browsers handle most cases, but cia can't help if consumer mixes Arabic + Latin in a single input without `dir="auto"`. Recipe notes this.

## Related

- [v1.2 EPIC-03-i18n-recipes.md](./EPIC-03-i18n-recipes.md) — RTL flip patterns cross-referenced
- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — schema this recipe follows
