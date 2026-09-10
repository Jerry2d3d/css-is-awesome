# EPIC v1.1-08 — Additional Recipes (batch 2, from Boiler)

**Status:** In progress (v1.1) — F8.1 (datepicker) and F8.2 (data-table)
shipped 2026-09-10, both verified live. F8.3-F8.7 remain.
**Effort estimate:** ~9-13 working days
**Stories:** 14

## Mission

Add 7 more recipes to the book, each grounded in a **working reference
implementation already built in `boiler-project-ai`** (the separate Next.js
project that consumes cia) rather than designed from scratch. The recipe
becomes "write up what already works," not "invent the UX" — lower risk,
faster to ship, and the framework examples can be checked against real,
running code instead of hand-typed pseudocode.

## Why now

Surveyed `boiler-project-ai` (2026-09-10) two ways: a file/page read, then
**Boiler's own MCP server** (`boiler-project-ai/mcp/server.cjs` — it ships
one, same pattern as cia's `list_components`/`get_component`/
`search_components`), which returned its **full catalog: 98 documented
components** with descriptions and `packages/react/src/components/<Name>/README.md`
detail. That second pass changed the priority order — two components
turned out to be exactly the recipes the original v1.0 plan queued and
never built:

**`DataTable`** and **`DatePicker`** are real gaps, not new ideas.
`ROADMAP.md`'s v1.0 sprint text names "datepicker, data-table,
command-palette" as queued-next back in 2026-05; only dialog and combobox
ever shipped. Boiler now has full, working reference implementations for
the first two (confirmed via `get_component`: `DataTable` — two layout
engines, HTML `<table>` and a CSS Grid `role="table"` variant, sortable/
pinned columns, saved searches; `DatePicker` — composes a `Popup` +
`Calendar` built on native `Date`, no date library). That closes the
biggest, longest-standing gap in the recipe book — bumped to the top of
this batch.

Five more components are equally real, generic, and Boiler-brand-free:
`AdminLayout`/`AdminHeader` (a CSS Grid admin-dashboard skeleton — distinct
from the already-shipped `app-shell`, which is a flex sidebar, not a grid
admin layout), `ConfirmDialog`/`ConfirmPopup` (built on `Modal`, a small
but widely-reusable "are you sure?" pattern), `LoginForm`/`RegisterForm`
(the auth session/redirect flow around a form), `MultiStepForm` (step
orchestration around cia's existing `stepper` mixin), and `InputOtp`
(verification-code entry).

Batch 1 (`EPIC-01-additional-recipes.md`, still unstarted) also gets two
free wins from this survey, noted in **Related**, not repeated as new
work here: its `F1.4` (file-upload) and `F1.5` (toast) stories now have a
working Boiler reference too (`Upload`, `Toast` components).

## Out of scope

- Boiler's own branding/copy — every recipe below is the generic pattern,
  not a copy of Boiler's specific UI.
- The full 25+ feature-flag surface of Boiler's `DataTable` (saved
  searches, submenus, per-row danger actions, etc.) — the recipe teaches
  the **core pattern** (sortable columns + pagination + a table/grid
  choice), not every flag; note the richer surface exists for consumers
  who want to go further.
- `command-palette` — still not evidenced in Boiler (its `Menu` component
  is an anchored dropdown-of-commands, not a fuzzy-search launcher) —
  remains genuinely unbuilt and un-referenced; not part of this batch.

## Features

### F8.1 — Recipe: datepicker

#### US-V11.08.1.1 — Write `datepicker.md` recipe

**As** an AI agent building a date-entry field
**I want** a recipe for a formatted date input that opens an inline
calendar grid, built on native `Date` with no date library
**So that** I close one of cia's oldest queued gaps without a new dependency

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/datepicker.md`
- [x] Reference: `boiler-project-ai/packages/react/src/components/DatePicker`
  (composes a `Popup` anchored-positioning primitive + a `Calendar`
  month-grid, both on native `Date`) and `.../Calendar`
- [x] A read-only-trigger **button** (not a text input — avoids parsing a
  typed date string), not a native `<input type="date">` replacement —
  recipe notes native `<input type="date">` as the zero-JS fallback
- [~] Keyboard: Enter selects, Esc closes and returns focus to the trigger
  (shipped, verified live); arrow-key grid navigation is documented in the
  recipe's Interactivity section but not wired in the live demo — a fair
  scope cut for a first pass, noted honestly rather than claimed done
- [x] A11y checklist covers `role="grid"`/`role="gridcell"` on the calendar,
  `aria-selected` on the chosen date, announced month/year on navigation
- [x] Framework examples

**Effort:** L (1-2 days) — ✅ DONE 2026-09-10. Verified live: opens, month
navigation ("September 2026" → "October 2026"), date selection updates the
trigger and closes the popup, Escape closes and returns focus to the
trigger. Zero console errors.

#### US-V11.08.1.2 — Render demo page with a live calendar

**Effort:** S (≤4 hrs) — ✅ DONE 2026-09-10.

---

### F8.2 — Recipe: data-table

#### US-V11.08.2.1 — Write `data-table.md` recipe

**As** an AI agent building a sortable, paginated data grid
**I want** a recipe for the core pattern (sortable columns + row
rendering + pagination), with a note on choosing `<table>` vs. a CSS Grid
`role="table"` layout
**So that** I close cia's other oldest queued gap with a proven shape

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/data-table.md`
- [x] Reference: `boiler-project-ai/packages/react/src/components/DataTable`
  (two layout engines sharing one props interface — `DataTable` on a real
  `<table>`, `DataTableGrid` on CSS Grid + `role="table"` for virtualization/
  pinned-column cases an HTML table can't do)
- [x] Covers: column definition (key/header/sortable/width), a `SortState`
  model (`{ key, direction } | null`), click-header-to-sort with a visible
  sort indicator
- [~] Pagination: `pagination` (v1.1 EPIC-01 F1.3) **doesn't exist as a
  shipped recipe yet** (still unstarted), so instead of a broken cross-link
  the recipe/demo ship a minimal inline prev/next pager, explicitly noted
  as "the smallest viable version, not blocked on the future recipe"
- [x] A11y checklist covers: sortable header buttons (not bare clickable
  `<th>`), `aria-sort` on the active column, row count announced after a
  sort/filter change
- [x] Framework examples

**Effort:** L (1-2 days) — ✅ DONE 2026-09-10. Verified live: three-state
sort cycle (ascending → descending → back to original order) confirmed via
`aria-sort` and actual row order changes; pagination confirmed ("Page 1 of
2" → "Page 2 of 2"). Zero console errors. Also fixed a real bug found while
verifying: the recipe's own code sample uses the `cia-sr-only` **utility
class** for the table caption, but this docs site only loads `theme.css`
(tokens), not the separate opt-in utilities bundle — the class silently
had no effect, leaving "Team members" visible above the table instead of
screen-reader-only. The live demo now uses the `sr-only` **mixin** directly
via a CSS Module instead; the recipe's own code sample is unaffected
(correct for a real consumer who *does* load the utilities bundle) but a
note was worth adding for anyone reusing this pattern on a similarly
utilities-free page.
**Depends on:** `pagination` (v1.1 EPIC-01 F1.3) — not yet available; worked
around, not blocked on it

#### US-V11.08.2.2 — Render demo page with a small sortable dataset

**Effort:** S (≤4 hrs) — ✅ DONE 2026-09-10.

---

### F8.3 — Recipe: admin-dashboard-layout

#### US-V11.08.3.1 — Write `admin-dashboard-layout.md` recipe

**As** an AI agent building a back-office/admin screen
**I want** a CSS Grid admin skeleton (sidebar + top nav + content + footer)
distinct from the flex-based `app-shell`
**So that** I pick the right layout primitive for a data-dense admin
surface instead of stretching `app-shell` to fit

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/admin-dashboard-layout.md`
- [ ] Reference: `boiler-project-ai/packages/react/src/components/AdminLayout`
  (CSS Grid, sidebar spans full height, optional footer) and `AdminHeader`
  (stats-focused header with key metrics/user counts)
- [ ] Explicitly notes the choice vs. [`app-shell`](./app-shell.md):
  `app-shell` is a general page skeleton (flex `sidebar` mixin, wraps to
  one column); this recipe is CSS Grid for a fixed admin frame where the
  sidebar shouldn't reflow
- [ ] Composes `data-table` (F8.2) and `confirm-dialog` (F8.4) for its demo
  content rather than re-teaching either
- [ ] A11y checklist covers landmark regions (`nav`, `main`, distinct
  `aria-label`s), skip-to-content link
- [ ] Framework examples

**Effort:** M (4-8 hrs)
**Depends on:** `data-table` (F8.2), `confirm-dialog` (F8.4)

#### US-V11.08.3.2 — Render demo page (stats header + data table + sidebar nav)

**Effort:** S (≤4 hrs)

---

### F8.4 — Recipe: confirm-dialog

#### US-V11.08.4.1 — Write `confirm-dialog.md` recipe

**As** an AI agent building any destructive or consequential action
**I want** a small "are you sure?" pattern built on the existing `dialog`
recipe, plus an inline-popover variant for lower-stakes confirmations
**So that** I don't reach for `window.confirm()` or reinvent this every time

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/confirm-dialog.md`
- [ ] Reference: `boiler-project-ai/packages/react/src/components/ConfirmDialog`
  (built on `Modal`) and `.../ConfirmPopup` (an anchored, inline "are you
  sure?" for a lower-stakes action, thinner than a full modal)
- [ ] Cross-links [`dialog`](./dialog.md) — this recipe is a thin,
  opinionated preset (title + body + Cancel/Confirm), not new modal
  mechanics
- [ ] Notes when to use the popover variant instead: a lower-stakes,
  single-row action (e.g. remove a tag) vs. a full-page-impact one
  (delete an account)
- [ ] A11y checklist: same as `dialog`'s (inherited, not repeated) plus
  the destructive action's button is clearly labeled (never a bare
  "Yes"/"OK")
- [ ] Framework examples

**Effort:** S (≤4 hrs)
**Depends on:** `dialog` (already shipped, cross-linked)

#### US-V11.08.4.2 — Render demo page (delete-row confirmation)

**Effort:** S (≤4 hrs)

---

### F8.5 — Recipe: auth-flow

#### US-V11.08.5.1 — Write `auth-flow.md` recipe

**As** an AI agent building login/register screens
**I want** a recipe for the session/redirect flow around a form, not just
the form's own validation
**So that** I get the URL-derived success banner, loading/error states, and
cookie-vs-token handling right the first time

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/auth-flow.md`
- [ ] Reference: `boiler-project-ai/packages/react/src/components/LoginForm`,
  `.../RegisterForm`
- [ ] Distinct scope from `form-validation-*`: this is the flow AROUND the
  form (submit → loading → success redirect with a `?registered=true`-style
  banner, or inline error) — cross-link a `form-validation-*` recipe for
  field-level validation rather than repeating it
- [ ] Notes both session models (httpOnly cookie via `credentials: "include"`,
  and a bearer-token alternative) as a tradeoff, not a single prescribed choice
- [ ] A11y checklist covers error/success messaging via `role="alert"`/
  `role="status"`, focus management on redirect
- [ ] Framework examples

**Effort:** M (4-8 hrs)
**Depends on:** `form-validation-html5` or `form-validation-react-hook-form` (already shipped, cross-linked)

#### US-V11.08.5.2 — Render demo page (simulated auth, no real backend)

**Effort:** S (≤4 hrs)

---

### F8.6 — Recipe: multi-step-wizard

#### US-V11.08.6.1 — Write `multi-step-wizard.md` recipe

**As** an AI agent building an onboarding or checkout flow
**I want** a recipe for step orchestration (current step, per-step
validation gating, optional steps) built on cia's existing `stepper` mixin
**So that** I don't reinvent step-state management around a mixin that
already exists

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/multi-step-wizard.md`
- [ ] Reference: `boiler-project-ai/packages/react/src/components/MultiStepForm`
  (stepper navigation, directional slide animations, a container-query
  compact stepper variant, per-step validation gating)
- [ ] Uses cia's `stepper` mixin for the visual indicator — cross-link
  rather than restyle; this recipe is the orchestration logic around it
- [ ] Cross-links a `form-validation-*` recipe for what a step's own
  validation should look like
- [ ] A11y checklist covers: step change announced via `aria-live`,
  `aria-current="step"` on the active indicator, focus moves to the new
  step's first field on advance
- [ ] Framework examples

**Effort:** M (4-8 hrs)
**Depends on:** `stepper` mixin (already shipped)

#### US-V11.08.6.2 — Render demo page (3-step form, no real submit)

**Effort:** S (≤4 hrs)

---

### F8.7 — Recipe: otp-input

#### US-V11.08.7.1 — Write `otp-input.md` recipe

**As** an AI agent building 2FA or email verification
**I want** a recipe for a segmented verification-code input with
paste/auto-advance and a mask mode
**So that** I get the fiddly keyboard/paste behavior right without
hand-rolling it

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/otp-input.md`
- [ ] Reference: `boiler-project-ai/packages/react/src/components/InputOtp`
  (per-cell boxes, auto-advance on input, backspace-retreat, arrow-key
  navigation, full-code paste distributes across cells, mask mode)
- [ ] Native `<input inputmode="numeric" pattern="[0-9]*">` per cell, not a
  single hidden input — keeps native mobile numeric keyboard + native
  paste handling as the foundation, JS only for auto-advance/redistribution
- [ ] A11y checklist covers: each cell has an accessible name ("Digit 1 of
  6"), paste announced, `aria-describedby` linking a "code sent to…" hint
- [ ] Framework examples

**Effort:** S (≤4 hrs)
**Depends on:** none — pairs naturally with `auth-flow` (F8.5) as a
2FA/email-verification step, cross-link once both exist

#### US-V11.08.7.2 — Render demo page (6-digit code, fake validation)

**Effort:** S (≤4 hrs)

## Considering — not committing

Real, generic, Boiler-brand-free components exist for all of these — held
back because they're thinner teaching value (more "component" than
"recipe") or narrower audience than the 7 above. Promote any of these if a
second signal shows up (a consumer asks, or the pattern's usage in Boiler
grows more elaborate) — matches [[project_ship_then_see_rule]].

- **search-results** — `SearchBar` + a filtered/grouped results layout
  (`boiler-project-ai/src/app/wiki/page.tsx` + `WikiViewer.tsx`). Real, but
  composes cleanly enough from `SearchBar` + `admin-dashboard-layout`/
  `app-shell` that a dedicated recipe may be redundant once those ship.
- **Chart** — dependency-free SVG bar/line/area/pie
  (`packages/react/src/components/Chart`). Notable and distinct, but
  chart-specific enough (data-shape decisions) to warrant its own scoping
  pass rather than folding into this batch.
- **Form-field composition group** — `InputGroup`, `FloatLabel`,
  `NumericTextBox`, `MaskedTextBox`, `IconField` (all real, all PrimeNG-
  parity pieces). Complementary to the `form-validation-*` recipes (field
  *presentation*, not validation) — candidate for a "batch 3," not this one.
- **Timeline** (activity feed/changelog), **Carousel**, **RangeSlider**/
  **Slider**/**Rating**/**SelectButton**/**ToggleButton**/**SplitButton**,
  **Splitter**/**Window** (resizable/draggable power-user layout) — all
  real and generic, all lower-priority than the 7 committed above.

## Definition of done

- [ ] All 14 stories accepted
- [ ] 7 new recipes shipped to `scss/recipes/`
- [ ] `npm run validate-recipes` passes for all resulting recipes
- [ ] `/docs/recipes` catalog shows all of them
- [ ] MCP server lists/returns all of them (already dynamic — no server
  code change expected, confirmed by every recipe batch shipped this
  session)

## Risks

- **Boiler reference code isn't automatically recipe-schema-clean.** Each
  recipe still needs the full a11y checklist + 4 framework examples written
  fresh — Boiler's React implementation is the starting point for the
  *pattern*, not a copy-paste source for the Vue/Svelte/vanilla sections.
- **`data-table`'s scope discipline.** Boiler's real component has 25+
  feature flags; the recipe must stay at "sortable + paginated," not grow
  into documenting every flag (saved searches, submenus, per-row danger
  actions) — see **Out of scope**.
- **`auth-flow` touches real session/security decisions** (cookie vs.
  token) more than a typical recipe — keep it descriptive ("here are the
  two models and their tradeoffs"), not prescriptive about which is
  "correct" for a given consumer's backend.

## Related

- [v1.1 EPIC-01-additional-recipes.md](./EPIC-01-additional-recipes.md) —
  batch 1 (unstarted); `F1.3` (pagination), `F1.4` (file-upload), and
  `F1.5` (toast) all gain a real Boiler reference implementation from this
  survey (`Pagination`, `Upload`, `Toast` components) — start there when
  batch 1 is picked up.
- [v1.2 EPIC-03-i18n-recipes.md](../v1-2/EPIC-03-i18n-recipes.md) —
  `DatePicker`'s date-formatting concerns are locale-specific; this batch's
  `datepicker` recipe covers the *interaction* pattern, i18n-recipes covers
  the *formatting* — cross-link once both exist.
- `app-shell`, `dialog`, `form-validation-*`, `stepper` mixin — all already
  shipped, all cross-linked above rather than re-taught.
