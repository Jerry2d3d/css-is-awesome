# EPIC v1.2-01 — RTL Audit + Recipe

**Status:** Planned (v1.2)
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
- [ ] Script at `scripts/audit-logical-properties.mjs`
- [ ] Scans `scss/**/*.scss` (excluding `themes/*` — themes are token-only)
- [ ] Reports: `margin-left`, `margin-right`, `padding-left`, `padding-right`, `border-left`, `border-right`, `text-align: left/right`, `left:`, `right:`
- [ ] Outputs file path + line number + suggested replacement
- [ ] CI runs on every PR; fails if new violations introduced

**Effort:** S (≤4 hrs)

#### US-V12.01.1.2 — Fix all reported violations

**Acceptance criteria:**
- [ ] Each violation from US-V12.01.1.1 either fixed or annotated `// cia-rtl-allow: <reason>` (e.g. a debug border explicitly on left)
- [ ] All cia tests + Playwright still green
- [ ] Visual diff in 8 themes: zero regressions in LTR layouts

**Effort:** M (4-8 hrs)

---

### F1.2 — RTL recipe

#### US-V12.01.2.1 — Write `/scss/recipes/rtl-layout.md`

**As** an AI agent building a multilingual site
**I want** a recipe showing how to set `<html dir="rtl">` + which cia patterns work automatically + how to handle the few that need RTL-specific overrides
**So that** I ship Arabic/Hebrew without RTL bugs

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/rtl-layout.md`
- [ ] Section on `dir="rtl"` setup
- [ ] List of patterns that "just work" because of logical properties
- [ ] Section on icon-flipping (chevrons, arrows) — covers `transform: scaleX(-1)` and SVG-internal flip
- [ ] Pitfalls: number rendering, English brand names in Arabic context, mixed-direction strings
- [ ] Framework examples

**Effort:** M (4-8 hrs)

---

### F1.3 — Docs page

#### US-V12.01.3.1 — Build `/docs/rtl` page

**Acceptance criteria:**
- [ ] Page at `src/app/docs/rtl/page.tsx`
- [ ] Live demo: same cia components rendered side-by-side in LTR (English) + RTL (Arabic mock)
- [ ] Renders the RTL recipe inline
- [ ] Linked from main docs nav

**Effort:** M (4-8 hrs)
**Depends on:** US-V12.01.2.1

---

### F1.4 — Playwright RTL test suite

#### US-V12.01.4.1 — Add RTL test fixture

**Acceptance criteria:**
- [ ] Playwright test at `tests/rtl.spec.ts`
- [ ] Iterates over key routes (/, /docs, /themes, each recipe page)
- [ ] For each: set `<html dir="rtl">`, capture screenshot
- [ ] Snapshot baseline committed under `tests/snapshots/rtl/`

**Effort:** M (4-8 hrs)

#### US-V12.01.4.2 — Axe scan on RTL routes

**Acceptance criteria:**
- [ ] Run @axe-core/playwright on each RTL-rendered route
- [ ] Zero violations beyond the existing LTR baseline
- [ ] Wired into npm test

**Effort:** S (≤4 hrs)

#### US-V12.01.4.3 — Document the RTL test process in CONTRIBUTING.md

**Acceptance criteria:**
- [ ] CONTRIBUTING.md gets an "RTL testing" section
- [ ] Explains how to update snapshots
- [ ] Notes that visual diffs are reviewed manually

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 7 stories accepted
- [ ] Audit script lives + runs in CI
- [ ] All non-logical-property violations fixed or explicitly annotated
- [ ] `/docs/rtl` page lives + linked
- [ ] RTL recipe shipped
- [ ] Playwright RTL snapshot suite green
- [ ] Axe-clean on RTL routes

## Risks

- **Icon flipping edge cases.** Some icons (arrow-right, undo) should flip in RTL; others (logos, brand marks) must NOT. Mitigation: recipe documents the per-icon decision; cia ships base behavior with opt-out class.
- **Snapshot maintenance.** Visual snapshots can drift unintentionally. Mitigation: snapshots gate manual review on every PR; auto-update only on explicit `--update-snapshots` flag.
- **Bidi text in form inputs.** Browsers handle most cases, but cia can't help if consumer mixes Arabic + Latin in a single input without `dir="auto"`. Recipe notes this.

## Related

- [v1.2 EPIC-03-i18n-recipes.md](./EPIC-03-i18n-recipes.md) — RTL flip patterns cross-referenced
- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — schema this recipe follows
