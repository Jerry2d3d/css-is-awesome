# EPIC v1.2-03 — i18n Recipes

**Status:** ✅ Complete (v1.2) — shipped 2026-09-10, verified live. **3 of
the originally-scoped 4 recipes shipped** — see the F3.4 status note
below for why the fourth was dropped rather than written as a near-total
duplicate.
**Effort estimate:** ~3-5 working days
**Stories:** 7 as scoped (6 accepted, 1 superseded — see F3.4)

## Mission

Ship recipes covering common internationalization patterns: locale-aware date formatting, number/currency formatting, and pluralization. Each leans on the native `Intl` API rather than wrapping a heavy i18n library. (RTL flip patterns were also originally scoped here — see F3.4.)

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
- [x] Recipe at `scss/recipes/i18n-date-formatting.md`
- [x] Uses `Intl.DateTimeFormat` (no library dependency)
- [x] Patterns: short/long/numeric, timezone handling, "X minutes ago" relative dates (via `Intl.RelativeTimeFormat`)
- [x] Pairs with v1.0 datepicker recipe — cross-linked, shows how to display selected date in user's locale
- [x] Framework examples (Intl API is universal)
- [x] Pitfalls: SSR locale mismatch (server vs browser locale)

**Effort:** ✅ DONE 2026-09-10. Verified live: switching locale changes
the rendered text for every format style, `ja-JP` produces real Japanese
characters, and — the specific thing the SSR pitfall warns about — zero
console errors/hydration warnings, because the demo defers formatting to
a post-mount effect exactly as the recipe's own React example shows.

#### US-V12.03.1.2 — Render at `/docs/recipes/i18n-date-formatting`

**Effort:** ✅ DONE 2026-09-10.

---

### F3.2 — Number + currency formatting recipe

#### US-V12.03.2.1 — Write `i18n-number-currency.md` recipe

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/i18n-number-currency.md`
- [x] Uses `Intl.NumberFormat` for decimals, percents, currencies
- [x] Patterns: en-US vs de-DE vs ja-JP separator differences, currency selection by locale
- [x] Compact formatting (1.2M) shown
- [x] Sign display (+/-) and accounting-style negatives shown
- [x] Framework examples

**Effort:** ✅ DONE 2026-09-10. Verified live: switching locale swaps
both the number formatting AND the matching currency (USD → EUR → JPY),
and JPY correctly renders with zero decimal places (the real yen
convention — no minor currency unit — which `Intl.NumberFormat` gets
right without the recipe having to special-case it).

#### US-V12.03.2.2 — Render demo page

**Effort:** ✅ DONE 2026-09-10.

---

### F3.3 — Pluralization recipe

#### US-V12.03.3.1 — Write `i18n-pluralization.md` recipe

**Acceptance criteria:**
- [x] Recipe at `scss/recipes/i18n-pluralization.md`
- [x] Uses `Intl.PluralRules`
- [x] Patterns: "1 item" / "5 items" / locale-specific (Polish's 4 forms, Arabic's 6, demonstrated live)
- [x] Helper function shown: `pluralize(count, locale, { one, other, few?, many?, zero? })`
- [x] No external dependency; pure Intl
- [x] Framework examples

**Effort:** ✅ DONE 2026-09-10. Verified live across all 3 demo locales:
`en-US` correctly uses only `one`/`other`; `pl-PL` correctly lands on
`few` at count 2 and `many` at count 5 (not just "singular vs. plural");
`ar-EG` correctly uses `zero` at count 0 with real Arabic sample text
rendered right-to-left via `unicode-bidi: plaintext` (direction is never
hardcoded — the browser's bidi algorithm picks it from the actual text,
the same principle `rtl-layout` documents for mixed content).

#### US-V12.03.3.2 — Render demo page

**Effort:** ✅ DONE 2026-09-10.

---

### F3.4 — RTL flip patterns recipe

#### US-V12.03.4.1 — Write `i18n-rtl-flip.md` recipe (cross-link with EPIC-01)

**Status: ⚠️ SUPERSEDED 2026-09-10 — not written, and shouldn't be.**
Every acceptance criterion below is already fully covered by the
`rtl-layout` recipe (shipped 2026-09-09, v1.2 EPIC-01), which this story
itself was supposed to depend on and cross-link. Reading it in full while
starting this epic found its "Icon-flipping (chevrons, arrows)" section
already contains: the `transform: scaleX(-1)` mechanism, an SVG-internal
flip mechanism, the "directional icon flips, brand mark never flips"
distinction, `[dir="rtl"]`-selector-based detection, and a Pitfalls
section — the exact same content this story asked for, at the same
depth, already live at `/docs/rtl` and in the recipe itself. `rtl-layout`'s
own intro line had already drawn this exact boundary before this epic
was picked up: *"This recipe is about layout direction, not translation
or locale formatting... that's the i18n recipes once shipped."*

Writing `i18n-rtl-flip.md` as scoped would have been near-total
duplication of already-shipped content, not a new recipe. Instead:
`rtl-layout.md`'s own "Related recipes" section now cross-links the 3
i18n recipes that *did* ship (date/number/plural formatting — the actual
gap `rtl-layout` names), closing the loop the other direction. This
story is accepted as **not needed**, not left "not started."

**Acceptance criteria (all already met by `rtl-layout`, confirmed
2026-09-10):**
- [x] Chevron/arrow icon flip via `transform: scaleX(-1)` — `rtl-layout` § Icon-flipping
- [x] SVG-internal flip mechanism — `rtl-layout` § Icon-flipping
- [x] Brand marks that should NOT flip — `rtl-layout` § Icon-flipping
- [x] Auto-detection via `<html dir>` + `[dir="rtl"]` — `rtl-layout` § Styling
- [x] Cross-references EPIC-01's RTL audit and the RTL layout recipe — it IS that recipe
- [x] Framework examples — `rtl-layout` has all 4

**Effort:** Not spent — 0 of the originally-estimated 4-8 hrs, because
the work already existed under a different, better-scoped recipe name.

## Definition of done

- [x] 6 of 7 stories accepted; F3.4 accepted as superseded (not written — see its status note)
- [x] 3 i18n recipes shipped (the epic's original "4 recipes" framing corrected — see Mission/Status above)
- [x] All 3 render at `/docs/recipes/i18n-*` with live demos, verified via Playwright (locale switching produces real, correct locale-specific output — different currencies, different plural categories, real non-Latin script rendering — not just that a `<select>` fired an event)
- [x] `validate-recipes` passes (24 recipes checked, 0 failures)
- [x] MCP server surfaces all 3 (already dynamic — no server code change needed, confirmed by every recipe batch shipped this session)
- [x] Cross-linked under the new `i18n` category (added to `scripts/validate-recipes.mjs`'s `CATEGORIES`, same one-line pattern as adding `forms` for v1.2 EPIC-02)

## Risks

- **Intl API browser support edge cases.** Older browsers / Node SSR may lack some `Intl` features. Mitigation: recipes note required browser baseline and polyfill path (`@formatjs/intl-pluralrules` etc.) for older targets.
- **Locale detection complexity.** Server-side locale negotiation is consumer's responsibility — recipe doesn't try to solve it. Pitfalls section explicitly says "consumer must provide locale; we just consume it."

## Related

- [v1.2 EPIC-01-rtl-audit.md](./EPIC-01-rtl-audit.md) — RTL layout recipe (cross-linked)
- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — datepicker recipe (cross-linked)
