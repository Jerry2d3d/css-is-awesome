# EPIC v1.2-04 — Print Recipe

**Status:** Planned (v1.2)
**Effort estimate:** ~4 hours
**Stories:** 2

## Mission

Ship one recipe + one docs page covering `@media print` styling with cia tokens. Small win, high perceived polish — most design systems punt on print; cia ships it.

## Why now

Bootstrap ships a print stylesheet. Tailwind has a `print:` modifier. cia has nothing. v1.2 is the right window to close this trivially before consumers ask.

## Out of scope

- Per-component print variants (recipe gives the patterns; consumer applies per-component as needed)
- PDF generation (recipe is browser-print only)

## Features

### F4.1 — Print recipe + docs

#### US-V12.04.1.1 — Write `print.md` recipe

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/print.md`
- [ ] Patterns: hide nav/footer/sidebar via `display: none`
- [ ] Reset backgrounds to white, ink to black (override theme color tokens via `--text-primary` override in `@media print`)
- [ ] Use system font stack (drop custom fonts; saves printer ink + faster render)
- [ ] Avoid orphans/widows on paragraphs (`orphans: 3; widows: 3`)
- [ ] Page break controls (`break-before: page;`, `break-inside: avoid`)
- [ ] Show URL after every link (`a[href^="http"]:after { content: " (" attr(href) ")"; }`)
- [ ] Framework-agnostic (pure CSS)

**Effort:** S (≤4 hrs)

#### US-V12.04.1.2 — Render at `/docs/recipes/print` + add "Print this page" affordance

**Acceptance criteria:**
- [ ] Recipe page loads at expected route
- [ ] Includes "Print this page" button that triggers `window.print()`
- [ ] Documentation site itself uses the recipe so visitors can print any cia docs page cleanly

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] Both stories accepted
- [ ] Recipe shipped + page lives
- [ ] cia docs site itself applies the print recipe (dogfood)
- [ ] Test: print preview on a docs page shows clean output (no nav, no theme backgrounds, readable type)

## Risks

- **Browser print preview varies.** Chrome / Firefox / Safari render `@media print` differently. Mitigation: recipe covers the lowest-common-denominator patterns; document known browser quirks.

## Related

- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — schema
