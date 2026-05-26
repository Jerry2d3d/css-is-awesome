# EPIC v1.2-04 — Print Recipe (and the PDF answer)

**Status:** Planned (v1.2)
**Effort estimate:** ~1-2 days
**Stories:** 5

## Mission

Ship the cia print recipe AND make it the canonical answer to "how do I get a clean PDF out of an HTML page?" Browser-native `Print → Save as PDF` (Chrome / Edge / Firefox / Safari) is the PDF generator; the cia print recipe is the styling that makes the output usable. Consumers can override or extend the recipe's `@media print` block to customize page layout, headers/footers, page breaks — same parameter-power model as the rest of cia.

## Why this scope is right

The original scope was "ship a print stylesheet, low effort." Jerry's 2026-05-26 refinement: the print recipe IS the PDF generation answer. The user flow is:

1. User loads any HTML page styled with cia
2. cia's print recipe `@use 'css-is-awesome/scss/recipes/print'` adapts the page for paper
3. User clicks browser's native Print
4. Saves as PDF (every modern browser ships this)

No standalone tool needed. No Puppeteer / Playwright / headless service. No JavaScript in cia. The browser is the PDF generator; cia provides the styling layer. **This is the "stays disciplined" version of the wishlist's HTML → PDF idea — promoted to v1.2 because the scope is bounded, the architecture is clean, and the audience is real (every business needs HTML → PDF eventually).**

## Why this beats Puppeteer-based competitors

| | Puppeteer-based tools | cia print recipe + browser print |
|---|---|---|
| Setup | Server with headless Chrome, font installation, scaling concerns | One `@use` line |
| Maintenance | Track Chrome versions, headless quirks per release | None — browsers ship their own print engines |
| Bundle weight | Heavy (Puppeteer = ~170MB Chrome) | Zero (pure CSS) |
| Cross-browser | Chrome-only (Puppeteer); user-side any browser they have | Chrome / Edge / Firefox / Safari all work |
| Customization | Edit a Node script | Override the `@media print` block in your SCSS |
| Server-side generation | ✅ Yes | ❌ User-action required (click Print) |

cia opts out of server-side generation intentionally — that's a separate product space. The "user clicks Print → saves PDF" flow covers 90% of real HTML → PDF needs (invoices, reports, certificates, dashboards-as-PDF) without owning Puppeteer's maintenance.

## Out of scope

- Server-side / programmatic PDF generation (out of scope forever — different product space)
- Custom PDF features that require browser-specific print extensions
- PDF watermarking / signing / encryption (use a dedicated PDF library)

## Features

### F4.1 — Print recipe + base patterns

#### US-V12.04.1.1 — Write `print.md` recipe

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/print.md`
- [ ] Base patterns: hide nav/footer/sidebar via `display: none`
- [ ] Reset backgrounds to white, ink to black (override `--text-primary` + `--background-default` inside `@media print`)
- [ ] Use system font stack (drop custom fonts to save printer ink + speed render)
- [ ] Avoid orphans/widows on paragraphs (`orphans: 3; widows: 3`)
- [ ] Page break controls (`break-before: page;`, `break-inside: avoid`, `break-after`)
- [ ] Show URL after every link via `::after`
- [ ] Framework-agnostic (pure CSS, zero JS)

**Effort:** S (≤4 hrs)

#### US-V12.04.1.2 — Page setup (`@page`)

**Acceptance criteria:**
- [ ] Recipe documents `@page` for default margins
- [ ] Variants for letter / A4 / legal paper sizes via consumer override
- [ ] Margin slot pattern for custom header / footer using `@page :first` + `@page :left` + `@page :right`

**Effort:** S (≤4 hrs)

### F4.2 — Customization hooks (parameter-power for print)

#### US-V12.04.2.1 — Recipe accepts override slots

**Acceptance criteria:**
- [ ] The print recipe's `@media print` block exposes named CSS custom properties consumers can override (`--print-bg`, `--print-ink`, `--print-margin`, `--print-page-size`)
- [ ] Recipe docs show "project the query and override" pattern: `@media print { :root { --print-margin: 1in; } }` from consumer's own SCSS
- [ ] At least 3 override examples in the recipe (invoice padding, report header on first page only, certificate centered layout)

**Effort:** M (4-8 hrs)

#### US-V12.04.2.2 — Composer mixin: `print-shell`

**Acceptance criteria:**
- [ ] New mixin `@include cia.print-shell` that wraps the recipe's `@media print` block with consumer customization slots
- [ ] Parameters: `$margin`, `$page-size`, `$hide-selector` (CSS selector list to hide in print)
- [ ] Lives in `scss/recipes/_print-shell.scss` or `scss/components/_print.scss`
- [ ] Documented in `/docs/mixins` under a new "Print" section

**Effort:** M (4-8 hrs)

### F4.3 — Docs + dogfood

#### US-V12.04.3.1 — Render at `/docs/recipes/print` + "Save as PDF" affordance

**Acceptance criteria:**
- [ ] Recipe page loads at expected route
- [ ] Page renders a "Save this page as PDF" button that triggers `window.print()`
- [ ] Below the button: a clear 3-step explainer ("1. Click Save as PDF · 2. Your browser opens the print dialog · 3. Choose 'Save as PDF' as the destination, then save")
- [ ] Documentation site itself applies the recipe so visitors can save ANY cia docs page as a clean PDF — dogfood proof

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 5 stories accepted
- [ ] Recipe shipped at `scss/recipes/print.md`
- [ ] `print-shell` composer mixin shipped
- [ ] `/docs/recipes/print` page lives with the Save-as-PDF button + 3-step explainer
- [ ] cia docs site dogfoods the recipe — print preview on any docs page produces a clean, branded PDF in Chrome / Edge / Firefox / Safari
- [ ] At least 3 override examples documented (invoice, report, certificate)
- [ ] CHANGELOG.md entry frames this as "cia's HTML → PDF answer"

## Risks

- **Browser print preview varies.** Chrome / Firefox / Safari render `@media print` differently — most notably for `@page` margin areas (the named page regions). Mitigation: recipe documents what works cross-browser vs what's Chrome-only; consumer can opt into Chrome-specific extensions explicitly.
- **`@page` margin headers/footers** aren't fully customizable via CSS in all browsers yet (each browser provides its own UI for that). Recipe documents the CSS-only patterns + notes the browser-UI fallback for headers/footers.
- **Custom fonts dropped in print recipe** — consumers may want their brand serif to stay even on paper. Mitigation: the `print-shell` `$keep-fonts: true` parameter lets them opt out of the system-font swap.

## Related

- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — recipe schema this follows
- WISHLIST.md — this scope was promoted from the "HTML → PDF" wishlist entry (Jerry, 2026-05-26)
- [feedback_user_power_principle.md memory] — `print-shell` parameters honor the rule that customization belongs to the consumer
