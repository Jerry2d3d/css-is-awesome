# v1.2 — Coverage

**Target release:** v1.2.0 (~3-5 weeks after v1.1)
**Theme:** Close coverage gaps. RTL, form validation, i18n, print, and migration-on-ramp expansion to MUI + Chakra.

> **Status: Not started (planned) — with one item partially delivered early in v1.0.** This is a post-v1.0 version (v1.0 shipped: tagged 2026-08-17, launched 2026-09-01). Every epic below is future work EXCEPT the **Print Recipe (EPIC-04)**, whose core was pulled forward and shipped in v1.0 as a pure-CSS, zero-JS layer — see [`scss/recipes/print-to-pdf.md`](../../../scss/recipes/print-to-pdf.md) and the `print` / `print-base` / `print-hidden` / `print-only` mixins. EPIC-04 is marked Superseded; its remaining stories describe the original plan, not the delivered shape.

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-rtl-audit.md) | **RTL Audit + Recipe** | Audit cia source for non-logical properties. Ship `/docs/rtl` walkthrough + RTL recipe + Playwright test in Arabic/Hebrew. | ~3-5 days | 7 |
| [02](./EPIC-02-form-validation-recipes.md) | **Form Validation Recipes** | 5 recipes: HTML5 validation, react-hook-form + cia, Zod + cia, async validation, success/error patterns. | ~1 week | 10 |
| [03](./EPIC-03-i18n-recipes.md) | **i18n Recipes** | 4 recipes: Intl date formatting, number/currency, pluralization, RTL flip patterns. | ~3-5 days | 7 |
| [04](./EPIC-04-print-recipe.md) | **Print Recipe** ⚠️ _delivered early in v1.0_ | Single recipe + docs page for `@media print` styled with cia tokens. Core shipped in v1.0 (`print-to-pdf.md`). | ~4 hours | 2 |
| [05](./EPIC-05-migration-mui-chakra.md) | **Migration: MUI + Chakra** | Extend `npx cia migrate` to read MUI theme objects + Chakra theme objects. | ~1 week | 6 |

**Total v1.2 effort:** ~16-22 working days. **Total stories:** 32.

## Definition of done for v1.2

- [ ] cia source RTL-audited; all properties use logical syntax
- [ ] 6 new recipes shipped (5 form-validation, 4 i18n — overlap with existing recipes accepted)
- [ ] Print recipe page lives at `/docs/recipes/print`
- [ ] `npx cia migrate mui ./theme.ts` works
- [ ] `npx cia migrate chakra ./theme.ts` works
- [ ] All migrate outputs pass `validate-themes`
- [ ] CHANGELOG.md v1.2.0 entry
