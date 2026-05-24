# EPIC v1.2-03 — i18n Recipes

**Status:** Planned (v1.2)
**Effort estimate:** ~3-5 working days
**Stories:** 7

## Mission

Ship 4 recipes covering common internationalization patterns: locale-aware date formatting, number/currency formatting, pluralization, and RTL flip patterns. Each leans on the native `Intl` API rather than wrapping a heavy i18n library.

## Why now

cia is logical-properties-friendly (RTL nearly works out of the box per v1.2 EPIC-01) but has no recipe-level guidance on i18n. Production teams shipping to multiple locales need patterns. Without recipes, they either over-pick (i18next + dayjs + numbro) or under-pick (hardcoded English) — both wrong.

## Out of scope

- A cia-original i18n library
- Translation file management (consumer's i18n library handles this)
- Per-locale theme switching (out of scope; themes are brand-agnostic)

## Features

### F3.1 — Locale-aware date formatting recipe

#### US-V12.03.1.1 — Write `i18n-date-formatting.md` recipe

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/i18n-date-formatting.md`
- [ ] Uses `Intl.DateTimeFormat` (no library dependency)
- [ ] Patterns: short/long/numeric, timezone handling, "X minutes ago" relative dates
- [ ] Pairs with v1.0 datepicker recipe — shows how to display selected date in user's locale
- [ ] Framework examples (Intl API is universal)
- [ ] Pitfalls: SSR locale mismatch (server vs browser locale)

**Effort:** M (4-8 hrs)

#### US-V12.03.1.2 — Render at `/docs/recipes/i18n-date-formatting`

**Effort:** S (≤4 hrs)

---

### F3.2 — Number + currency formatting recipe

#### US-V12.03.2.1 — Write `i18n-number-currency.md` recipe

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/i18n-number-currency.md`
- [ ] Uses `Intl.NumberFormat` for decimals, percents, currencies
- [ ] Patterns: en-US vs de-DE vs ja-JP separator differences, currency selection by locale
- [ ] Compact formatting (1.2M, 3.4B) shown
- [ ] Sign display (+/-) for accounting contexts
- [ ] Framework examples

**Effort:** M (4-8 hrs)

#### US-V12.03.2.2 — Render demo page

**Effort:** S (≤4 hrs)

---

### F3.3 — Pluralization recipe

#### US-V12.03.3.1 — Write `i18n-pluralization.md` recipe

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/i18n-pluralization.md`
- [ ] Uses `Intl.PluralRules`
- [ ] Patterns: "1 item" / "5 items" / "0 items" / locale-specific (Polish has 4 plural forms; Arabic has 6)
- [ ] Helper function shown: `pluralize(count, locale, { one, other, few?, many?, zero? })`
- [ ] No external dependency; pure Intl
- [ ] Framework examples

**Effort:** M (4-8 hrs)

#### US-V12.03.3.2 — Render demo page

**Effort:** S (≤4 hrs)

---

### F3.4 — RTL flip patterns recipe

#### US-V12.03.4.1 — Write `i18n-rtl-flip.md` recipe (cross-link with EPIC-01)

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/i18n-rtl-flip.md`
- [ ] Patterns for: chevron/arrow icons (`transform: scaleX(-1)`), SVG-internal flip, brand marks that should NOT flip
- [ ] Auto-detection via `<html dir>` + CSS `[dir="rtl"]` selector
- [ ] Performance note: CSS-only flip > JS detection
- [ ] Cross-references v1.2 EPIC-01 RTL audit and RTL layout recipe
- [ ] Framework examples (mostly CSS, JS framework-agnostic)

**Effort:** M (4-8 hrs)
**Depends on:** v1.2 US-V12.01.2.1 (RTL layout recipe)

## Definition of done

- [ ] All 7 stories accepted
- [ ] 4 i18n recipes shipped
- [ ] All render at `/docs/recipes/i18n-*` with live demos
- [ ] `validate-recipes` passes
- [ ] MCP server surfaces all 4
- [ ] Cross-linked under "i18n" category in catalog

## Risks

- **Intl API browser support edge cases.** Older browsers / Node SSR may lack some `Intl` features. Mitigation: recipes note required browser baseline and polyfill path (`@formatjs/intl-pluralrules` etc.) for older targets.
- **Locale detection complexity.** Server-side locale negotiation is consumer's responsibility — recipe doesn't try to solve it. Pitfalls section explicitly says "consumer must provide locale; we just consume it."

## Related

- [v1.2 EPIC-01-rtl-audit.md](./EPIC-01-rtl-audit.md) — RTL layout recipe (cross-linked)
- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — datepicker recipe (cross-linked)
