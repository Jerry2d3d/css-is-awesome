# EPIC v1.1-01 — Additional Recipes (batch 1)

**Status:** Planned (v1.1)
**Effort estimate:** ~10-14 working days
**Stories:** 14

## Mission

Add 7 recipes to the v1.0 recipe book, prioritized by frequency of shadcn/MUI/Radix usage. Each recipe follows the v1.0 schema and ships React + Vue + Svelte + vanilla examples.

## Why now

v1.0 ships the 5 highest-leverage recipes (dialog, combobox, datepicker, data-table, command-palette). This batch closes the next-most-common gaps so consumers stop saying "cia doesn't have X."

## Out of scope

- Recipes requiring tiny JS shims (moved to [`EPIC-03-cia-a11y-recipes.md`](./EPIC-03-cia-a11y-recipes.md))
- Recipes that aren't generic across frameworks (e.g. framework-specific routing)

## Features

### F1.1 — Recipe: combobox-multiselect

#### US-V11.01.1.1 — Write combobox-multiselect recipe

**As** an AI agent (or human) building a multi-tag input
**I want** a recipe that extends the v1.0 combobox to multiple selections with tag chips
**So that** I don't reinvent the chip-removal + keyboard-nav UX

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/combobox-multiselect.md`
- [ ] References the v1.0 combobox recipe via `## Related recipes`
- [ ] Tag chips use `cia.tag` mixin
- [ ] Keyboard nav: Arrow keys cycle options; Backspace removes last chip; Esc closes; Tab moves to next field
- [ ] Framework examples: React, Vue, Svelte, vanilla

**Effort:** L (1-2 days)
**Depends on:** v1.0 US-01.2.2 (combobox)

#### US-V11.01.1.2 — Render combobox-multiselect at /docs/recipes/combobox-multiselect

**Acceptance criteria:**
- [ ] Page renders via the v1.0 dynamic recipe route
- [ ] Live demo with 3-5 sample options
- [ ] Linked from combobox recipe page

**Effort:** S (≤4 hrs)

---

### F1.2 — Recipe: breadcrumb

#### US-V11.01.2.1 — Write breadcrumb recipe

**As** an AI agent building a documentation or admin nav
**I want** a breadcrumb recipe using `<nav>` + `<ol>` with `aria-label` and current-page marking
**So that** I ship an accessible breadcrumb without thinking about it

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/breadcrumb.md`
- [ ] Semantic structure: `<nav aria-label="Breadcrumb"><ol>…</ol></nav>`
- [ ] Last item uses `aria-current="page"` and is non-interactive
- [ ] Separator handled via CSS `::before` (no `<span aria-hidden>` clutter)
- [ ] Styling uses `cia.cluster` for layout
- [ ] Framework examples: React, Vue, Svelte, vanilla

**Effort:** M (4-8 hrs)

---

### F1.3 — Recipe: pagination

#### US-V11.01.3.1 — Write pagination recipe

**As** an AI agent building a table or list
**I want** a pagination recipe with first/prev/next/last + page numbers
**So that** I ship a keyboard-accessible pager with proper ARIA

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/pagination.md`
- [ ] Semantic: `<nav aria-label="Pagination"><ul>…</ul></nav>`
- [ ] Current page marked `aria-current="page"` and visually distinct
- [ ] Disabled buttons use `aria-disabled` and `tabindex="-1"`
- [ ] Ellipsis (`…`) marked `aria-hidden` and shown when range collapsed
- [ ] Mobile pattern: collapse to prev / page count / next
- [ ] Framework examples

**Effort:** M (4-8 hrs)

---

### F1.4 — Recipe: file-upload

#### US-V11.01.4.1 — Write file-upload recipe

**As** an AI agent building an upload UI
**I want** a recipe that handles native `<input type="file">` + drag-and-drop drop-zone styling
**So that** I get accessible-by-default behavior with progressive enhancement

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/file-upload.md`
- [ ] Native `<input type="file">` is the source of truth (always present, sometimes visually hidden via `cia.sr-only`)
- [ ] Drop-zone visual layer uses `cia.frame` + `cia.cluster`
- [ ] Drag states (`dragenter`/`dragleave`/`drop`) toggle a `data-drag-over` attribute, NOT a class (consumers own the class)
- [ ] A11y checklist covers screen-reader announcement of selected file count
- [ ] Pitfalls: SSR-safe (no `FileReader` at module load), accept attribute, multiple files
- [ ] Framework examples

**Effort:** L (1-2 days)

---

### F1.5 — Recipe: toast / notification

#### US-V11.01.5.1 — Write toast recipe

**As** an AI agent building user-feedback messaging
**I want** a toast recipe using `[popover]` (or fallback for older browsers) with auto-dismiss and pause-on-hover
**So that** I ship transient notifications without a JS library

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/toast.md`
- [ ] Primary pattern uses `[popover]` for browsers that support it; fallback uses position:fixed
- [ ] `role="status"` or `role="alert"` based on severity (status for info/success, alert for warning/error)
- [ ] Auto-dismiss timer pauses on hover/focus
- [ ] Stacking: multiple toasts use `cia.stack` in a fixed container
- [ ] Mobile pattern: full-width bottom or top
- [ ] Framework examples

**Effort:** L (1-2 days)

---

### F1.6 — Recipe: sortable list

#### US-V11.01.6.1 — Write sortable-list recipe

**As** an AI agent building a re-orderable list
**I want** a recipe that points to good drag libraries (dnd-kit, native HTML5 drag-drop) and provides cia styling for handles + drop indicators
**So that** I don't need to invent drag UX but get cia-themed visuals

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/sortable-list.md`
- [ ] Drag handle uses `cia.icon` + cursor-grab styling
- [ ] Drop indicator uses `m.color(action-primary-default)` for the insertion line
- [ ] Keyboard alternative: Up/Down arrows move item position (using built-in `aria-grabbed`/`aria-dropeffect` — or modern WAI-ARIA pattern)
- [ ] Sections per library: native HTML5 drag, dnd-kit, react-beautiful-dnd alternative
- [ ] A11y checklist covers keyboard reordering announcement
- [ ] Framework examples (React + vanilla; Vue + Svelte if dnd-kit equivalent exists)

**Effort:** L (1-2 days)

---

### F1.7 — Recipe: color-picker

#### US-V11.01.7.1 — Write color-picker recipe

**As** an AI agent building a token-customization UI
**I want** a color-picker recipe that starts with native `<input type="color">` and shows the upgrade to a custom HSL/OKLCH picker
**So that** I pick the smallest viable surface

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/color-picker.md`
- [ ] Native section: `<input type="color">` with cia styling (limited cross-browser polish)
- [ ] Custom section: hue strip + saturation/lightness grid + alpha slider, using cia tokens
- [ ] OKLCH support noted (preferred over HSL for perceptual uniformity, matches cia color-mix usage)
- [ ] A11y checklist covers numeric input fallback for keyboard-only users
- [ ] Cross-link to v1.0 theme editor where applicable
- [ ] Framework examples

**Effort:** L (1-2 days)

## Definition of done

- [ ] All 14 stories accepted
- [ ] 7 new recipes shipped to `scss/recipes/`
- [ ] `npm run validate-recipes` passes for all 12 total recipes
- [ ] `/docs/recipes` catalog page shows 12 recipes with filtering
- [ ] MCP server lists/returns all 12 recipes
- [ ] At least 1 external AI agent verified fetching one new recipe end-to-end

## Risks

- **Sortable-list scope creep.** Tempting to cover 5 drag libraries. Cap at 3 (native, dnd-kit, plus one community pick); document others as "BYO."
- **Toast `[popover]` cross-browser.** Safari ≥17, Firefox ≥125, Chrome ≥114. Fallback path must work — write recipe with that as primary if support not yet ubiquitous at v1.1 ship time.
- **Color-picker custom variant complexity.** Could become a mini-app. Keep recipe focused on patterns; defer "polished implementation" to a sample repo or v1.x.

## Related

- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — schema + first 5 recipes
- [v1.1 EPIC-03-cia-a11y-recipes.md](./EPIC-03-cia-a11y-recipes.md) — WCAG-strict variants that EXTEND these recipes
