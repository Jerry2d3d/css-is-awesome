# EPIC v1.1-03 — `@cia/a11y-recipes` Add-on Package

**Status:** Planned (v1.1)
**Effort estimate:** ~5-7 working days
**Stories:** 10

## Mission

Ship `@cia/a11y-recipes` as a separate npm package containing WCAG-strict variants of the v1.0 + v1.1 recipes. Recipes-first; tiny JS shims ship inline ONLY where the recipe genuinely needs them. Optional — consumers `npm install @cia/a11y-recipes` when they need stricter a11y than the base recipes provide.

## Why now

v1.0 + v1.1 recipes ship inline a11y checklists, but the underlying components (combobox, datepicker, command-palette) have tricky screen-reader edge cases that a checklist alone doesn't solve. Production teams demanding WCAG 2.2 AA strict need named-region announcements, live-region updates, focus-trap libraries, and dynamic ARIA syncing.

Gemini's warning still holds: **don't reinvent state machines**. This package ships RECIPES (the pattern), not a full state-machine library. Where JS is unavoidable, ship the smallest possible shim and reference established libraries (Radix focus-trap, React Aria, Zag.js).

## Out of scope

- Full Radix-replacement state machines
- React-specific components (those go in `@cia/react` — see [EPIC-04](./EPIC-04-framework-pack-react.md))
- Component delivery (still recipes, not pre-built React/Vue files)
- Combobox / datepicker / command-palette implementations themselves (the v1.0 recipes cover the base; this package is the WCAG-grade layer ON TOP)

## Features

### F3.1 — Separate npm package scaffolding

#### US-V11.03.1.1 — Stand up `@cia/a11y-recipes` package

**As** a maintainer
**I want** a new npm package at `packages/a11y-recipes/` (or sibling repo — TBD) that publishes as `@cia/a11y-recipes`
**So that** the add-on can ship independently and version independently from cia core

**Acceptance criteria:**
- [ ] Package structure: `package.json` + `recipes/*.md` + optional `shims/*.js`
- [ ] `package.json` declares `css-is-awesome` as a peer dependency (^1.1.0)
- [ ] Files manifest ships ONLY recipes + shims + README + LICENSE
- [ ] Bundler-friendly export of shims (ESM only, no CJS)
- [ ] Tarball under 50 KB packed

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-V11.03.1.2 — Decide monorepo vs sibling repo

**As** a maintainer
**I want** a documented decision on whether @cia/a11y-recipes lives in this repo (monorepo with pnpm workspace) or a sibling repo
**So that** the publish/release process is clear

**Acceptance criteria:**
- [ ] Decision documented in `roadmap/epics/v1-1/decisions/monorepo-vs-sibling.md`
- [ ] Considers: shared CI, version sync, contributor friction, npm publish flow
- [ ] If monorepo: pnpm workspace set up; CI updated to publish workspace packages via semantic-release
- [ ] If sibling: new repo created; CI templated from this repo

**Effort:** S (≤4 hrs)
**Depends on:** none

---

### F3.2 — First WCAG-strict recipes

#### US-V11.03.2.1 — Recipe: combobox-aria-announcement

**As** a consumer needing WCAG 2.2 AA combobox
**I want** a recipe extending the v1.0 combobox with live-region announcements for filter results, selection changes, and empty states
**So that** screen-reader users get the same UX as sighted users

**Acceptance criteria:**
- [ ] Recipe at `recipes/combobox-aria-announcement.md` (in the @cia/a11y-recipes package)
- [ ] Adds `<div role="status" aria-live="polite">` for "5 results" announcements
- [ ] Adds `aria-activedescendant` syncing pattern for keyboard focus on options
- [ ] Optional inline JS shim ≤500 bytes for the live-region update logic
- [ ] References Radix Combobox + React Aria + Zag.js for full state-machine alternatives
- [ ] Framework examples: React, Vue, Svelte, vanilla

**Effort:** L (1-2 days)
**Depends on:** v1.0 US-01.2.2 (combobox), US-V11.03.1.1

#### US-V11.03.2.2 — Recipe: datepicker-screen-reader

**As** a consumer needing accessible date selection
**I want** a recipe with proper screen-reader month navigation, today-marking announcements, and keyboard-grid navigation
**So that** the datepicker isn't a screen-reader trap

**Acceptance criteria:**
- [ ] Recipe at `recipes/datepicker-screen-reader.md`
- [ ] Month/year header uses `aria-live="polite"` for nav announcements
- [ ] Day cells use `role="gridcell"` + `aria-selected`
- [ ] Today cell announces "today" in addition to date
- [ ] Keyboard: Arrow keys move day, PageUp/Down moves month, Home/End moves to first/last of week
- [ ] No JS shim needed beyond v1.0 datepicker recipe's existing JS
- [ ] Framework examples

**Effort:** L (1-2 days)

#### US-V11.03.2.3 — Recipe: command-palette-focus-trap

**As** a consumer shipping a Cmd+K palette to production
**I want** a recipe with battle-tested focus-trap behavior, including modal-portal interactions and Esc handling that doesn't conflict with browser shortcuts
**So that** screen-reader + keyboard-only users can use my palette safely

**Acceptance criteria:**
- [ ] Recipe at `recipes/command-palette-focus-trap.md`
- [ ] References established focus-trap libraries (focus-trap, focus-trap-react)
- [ ] Documents the `<dialog>` native focus-trap (preferred where supported)
- [ ] Covers portal/popover interaction patterns (z-index, body scroll lock)
- [ ] Esc key handler explicitly checks `event.target` to avoid stealing from input fields
- [ ] Optional inline JS shim ≤300 bytes for the Esc/scroll-lock coordination
- [ ] Framework examples

**Effort:** L (1-2 days)

---

### F3.3 — JS shim pattern (sparingly)

#### US-V11.03.3.1 — Define when a recipe ships a shim

**As** a maintainer
**I want** a documented rule for when a recipe includes a JS shim
**So that** `@cia/a11y-recipes` doesn't drift into being a JS framework

**Acceptance criteria:**
- [ ] Rule documented in package README
- [ ] Shim allowed ONLY IF: no native HTML primitive solves the case, AND the shim is under 1 KB minified, AND the shim has zero runtime dependencies
- [ ] Each shim file is `recipes/<name>.shim.mjs` colocated with its recipe
- [ ] README clearly states "for richer state machines, use Radix / React Aria / Zag.js"

**Effort:** S (≤4 hrs)

#### US-V11.03.3.2 — Lint script enforces shim rule

**As** the CI
**I want** a script that fails the build if any shim is >1 KB or has dependencies
**So that** scope creep is mechanically blocked

**Acceptance criteria:**
- [ ] Script at `scripts/lint-shims.mjs`
- [ ] Walks all `*.shim.mjs` files
- [ ] Asserts each is under 1024 bytes minified
- [ ] Asserts each has no `import` statements (no deps)
- [ ] Wired into `npm test` for the package

**Effort:** S (≤4 hrs)

---

### F3.4 — Install + discoverability

#### US-V11.03.4.1 — Publish package + README

**As** a consumer
**I want** `npm install @cia/a11y-recipes` to give me a working package with discoverable recipes
**So that** the install is friction-free

**Acceptance criteria:**
- [ ] Package published to npm at @cia/a11y-recipes
- [ ] README explains what it is, how it pairs with cia core, when to use it
- [ ] README links to the v1.0 recipes that each a11y-recipes variant extends
- [ ] Verified install from npm in a sample project

**Effort:** S (≤4 hrs)
**Depends on:** US-V11.03.2.1, US-V11.03.2.2, US-V11.03.2.3

#### US-V11.03.4.2 — Wire into cia install wizard

**As** the wizard from EPIC-02
**I want** to offer `@cia/a11y-recipes` as an opt-in install
**So that** consumers who care about WCAG get prompted

**Acceptance criteria:**
- [ ] Wizard's prompt list includes "Want WCAG-strict a11y recipes? (recommended)"
- [ ] If yes, adds `@cia/a11y-recipes` to npm install list
- [ ] Verified end-to-end via wizard run

**Effort:** S (≤4 hrs)
**Depends on:** v1.1 EPIC-02 (install wizard), US-V11.03.4.1

#### US-V11.03.4.3 — MCP exposure of a11y recipes

**As** an AI agent using cia
**I want** MCP to surface @cia/a11y-recipes recipes alongside cia core recipes
**So that** I see both layers when assembling a prompt

**Acceptance criteria:**
- [ ] cia core's MCP server detects if @cia/a11y-recipes is installed (peer dep check)
- [ ] If present, `list_recipes` includes a11y-recipes entries (tagged with category "a11y-strict")
- [ ] `get_recipe(name)` resolves from either package
- [ ] `assemble_prompt({ intent: "recipe:combobox-aria-announcement" })` works

**Effort:** M (4-8 hrs)
**Depends on:** US-V11.03.4.1

## Definition of done

- [ ] All 10 stories accepted
- [ ] `@cia/a11y-recipes` published to npm
- [ ] 3 starter recipes shipped (combobox-aria-announcement, datepicker-screen-reader, command-palette-focus-trap)
- [ ] Shim rule documented + linted
- [ ] cia core MCP server detects and surfaces a11y-recipes
- [ ] cia install wizard offers it as an option
- [ ] At least 1 consumer (boiler-project-ai or external tester) verified end-to-end

## Risks

- **Scope creep into state-machine land.** Mitigation: shim rule + lint script + Gemini's warning quoted in README.
- **Package version sync.** `@cia/a11y-recipes` peer-depends on cia core — if cia ships 1.2, do all a11y-recipes recipes work? Mitigation: semver coordination + CI tests against multiple cia versions.
- **Discoverability beyond MCP.** Consumers using cia without MCP might not realize the package exists. Mitigation: cia core README has a clear "for stricter a11y, install @cia/a11y-recipes" section.

## Related

- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — base recipes this package extends
- [v1.1 EPIC-01-additional-recipes.md](./EPIC-01-additional-recipes.md) — v1.1 base recipes
- [v1.1 EPIC-02-install-wizard.md](./EPIC-02-install-wizard.md) — wizard offers this package
- [project_v1_architecture_recipes.md](../../../C:/Users/jhans/.claude/projects/K--repo-css-is-awesome/memory/project_v1_architecture_recipes.md) — architecture lock with the "no state-machine vendor" rule
