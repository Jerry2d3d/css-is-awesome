# EPIC v1.2-02 — Form Validation Recipes

**Status:** Complete (2026-09-09). All 5 recipes shipped with real, verified-
live interactive demos (not screenshots) at their own static routes
(`src/app/docs/recipes/form-validation-<slug>/`, which take precedence over
the generic `[slug]` catch-all — confirmed via the existing `copy-button`/
`anchor-positioning`/`tabs-aria` precedent). Added `category: "forms"` to
`scripts/validate-recipes.mjs`'s enum (didn't exist before this epic) and
`react-hook-form` as a docs-site-only `devDependency` (never touches the
shipped npm package). The async-validation "mock endpoint" is simulated
client-side, not a real API route — this site is a static export
(`output: "export"`), which has no Route Handlers.
**Effort estimate:** ~1 week
**Stories:** 10

## Mission

Ship 5 recipes covering form-validation patterns. cia provides the styling; consumers pick the validation strategy. These recipes show how to wire native HTML5, react-hook-form, Zod, async validation, and success-state UX — all using cia mixins for error/success styling.

## Why now

Forms are the highest-volume UI in business apps. Every team makes the same validation decisions. Without recipes, cia consumers reinvent error display 5 times. With recipes, they pick the pattern that matches their stack and ship.

## Out of scope

- A cia-original validation library (NOT shipping — recipes reference existing libs)
- Form-builder UI (recipe describes the pattern; consumer writes the JSX)
- Cross-field validation patterns beyond simple references (defer to v1.3)

## Features

### F2.1 — Native HTML5 validation recipe

#### US-V12.02.1.1 — Write `form-validation-html5.md` recipe

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/form-validation-html5.md`
- [x] Uses native `required`, `pattern`, `minLength`, etc.
- [x] Styling: `cia.input-base` + `:user-invalid` + `:user-valid` pseudo-classes
- [x] Error message via `[aria-describedby]` pointing to `<span>` revealed when invalid
- [x] Submit handler shows summary of all errors via `form.checkValidity()`
- [x] A11y checklist covers screen-reader error announcement
- [x] Framework examples

**Effort:** M (4-8 hrs)

#### US-V12.02.1.2 — Render at `/docs/recipes/form-validation-html5`

**Acceptance criteria:**
- [x] Live demo with 3 sample fields
- [x] Try invalid input → see error styling
- [x] Linked from main recipes catalog

**Effort:** S (≤4 hrs)

---

### F2.2 — react-hook-form + cia recipe

#### US-V12.02.2.1 — Write `form-validation-react-hook-form.md` recipe

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/form-validation-react-hook-form.md`
- [x] Uses react-hook-form for state + cia for styling
- [x] Error styling toggled via className based on `errors[field]`
- [x] Pattern for register vs Controller (when each is right)
- [x] Reset and submit handlers shown
- [x] React example is primary; Vue/Svelte/vanilla noted as "use this library's equivalent: VeeValidate / Felte / native"

**Effort:** M (4-8 hrs)

#### US-V12.02.2.2 — Render demo page

**Effort:** S (≤4 hrs)

---

### F2.3 — Zod + cia recipe

#### US-V12.02.3.1 — Write `form-validation-zod.md` recipe

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/form-validation-zod.md`
- [x] Defines a Zod schema, parses on submit, maps errors to fields
- [x] Error display uses cia error tokens — the real contract token names are `--error-text` and `--error-default` (this story's own listed names — `border-error`, `action-error-default` — aren't real tokens; corrected in the shipped recipe)
- [x] Optional integration with react-hook-form via `zodResolver` shown
- [x] Framework examples (Zod is JS-native, so all frameworks)

**Effort:** M (4-8 hrs)

#### US-V12.02.3.2 — Render demo page

**Effort:** S (≤4 hrs)

---

### F2.4 — Async validation recipe

#### US-V12.02.4.1 — Write `form-validation-async.md` recipe

**As** an AI agent building a signup form
**I want** a recipe showing the "username available?" pattern with debounce + loading state + success state
**So that** I don't reinvent the async-validation UX

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/form-validation-async.md`
- [x] Pattern: input change → debounce 500ms → fetch → show loading spinner inline → show success check or error message
- [x] Loading state uses `cia.spinner` (when exists) or recipe documents inline spinner SVG
- [x] Success state uses a real check icon + cia success tokens — no `cia.icon()` mixin exists (icons are folder-based, `cia.svg(name)`/`cia.icon-svg(name)` via the `/api` barrel); the shipped recipe uses the real name, and `check.svg` happens to already ship in `public/icons/core/`
- [x] Cancel-in-flight pattern (AbortController) shown
- [x] A11y: `aria-busy` on input during fetch, `role="status"` on result
- [x] Framework examples

**Effort:** L (1-2 days)

#### US-V12.02.4.2 — Render demo page with mock async endpoint

**Effort:** S (≤4 hrs)

---

### F2.5 — Success state patterns recipe

#### US-V12.02.5.1 — Write `form-validation-success-states.md` recipe

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/form-validation-success-states.md`
- [x] Patterns: inline checkmark after valid field, summary banner after successful submit, redirect-after-submit with toast (documented, not demoed — see note below), optimistic UI
- [x] Each pattern's pros/cons (when to use which)
- [x] A11y: screen-reader announcement of success via `aria-live`/`role="status"`
- [x] Toast cross-link — **no toast recipe exists yet** (v1.1's "additional recipes" epic, unstarted), so this is a forward-reference note on the pattern (persist the message, show it on the destination page once a toast primitive exists) rather than a link to something real
- [x] Framework examples

**Effort:** M (4-8 hrs)

#### US-V12.02.5.2 — Render demo page

**Effort:** S (≤4 hrs)

## Definition of done

- [x] All 10 stories accepted
- [x] 5 form-validation recipes shipped
- [x] All 5 render at `/docs/recipes/<slug>` with live demos
- [x] `validate-recipes` passes
- [x] MCP server surfaces all 5
- [x] Cross-linked from `/docs/recipes` catalog with category "forms"

## Risks

- **Library choice bias.** react-hook-form is the React standard but not the only choice. Mitigation: recipe notes alternatives (Formik, TanStack Form) and explains why react-hook-form is the recommended pairing.
- **Vue/Svelte/Angular form-validation patterns vary widely.** Mitigation: keep recipes' framework examples for these to the core HTML5 + Zod patterns; library-specific patterns deferred to future recipes.
- **Async-validation pattern complexity.** AbortController + debounce + race-condition handling is genuinely tricky. Mitigation: recipe contains battle-tested pattern with explicit test cases.

## Related

- [v1.1 EPIC-01-additional-recipes.md](../v1-1/EPIC-01-additional-recipes.md) — toast recipe (cross-referenced)
- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — schema
