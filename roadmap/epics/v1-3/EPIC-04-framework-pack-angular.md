# EPIC v1.3-04 — `@cia/angular` v0.1 (Mirror of React Codegen)

**Status:** Planned (v1.3) — **GATED by v1.1 EPIC-04 success**
**Effort estimate:** ~2 weeks
**Stories:** 10

## Mission

Apply the codegen pattern proven in v1.1 EPIC-04 (`@cia/react`) to Angular. Generate Angular components from cia recipes. Ship `@cia/angular` v0.1 with 3-5 generated components.

**GATING CONDITION:** If `@cia/react` codegen failed in v1.1 (recipes don't reliably translate to framework components), this epic is permanently deferred. Recipes alone remain the framework story.

## Why now

Angular is Jerry's stated next-framework target. v1.3 is the right window: v1.1 has proven (or disproven) the codegen pattern, v1.2 ships coverage gaps, and v1.3 is the ecosystem release where Angular fits.

## Out of scope

- Angular Material compatibility (different system; consumers wrap if needed)
- Standalone-vs-NgModule debate — v0.1 ships standalone components (Angular 17+ default)
- Custom directives beyond what recipes describe
- AOT compilation pipeline tweaks (use Angular's defaults)

## Features

### F4.1 — Angular generator

#### US-V13.04.1.1 — Add Angular generator to codegen package

**Acceptance criteria:**
- [ ] Generator at `packages/codegen/generators/angular.mjs`
- [ ] Reads recipe's "Angular" framework section (NEW — needs to exist in recipes; this story might require updating v1.0 + v1.1 recipes to add Angular sections)
- [ ] Outputs `<ComponentName>.component.ts` (standalone) + `<ComponentName>.component.html` + `<ComponentName>.component.scss`
- [ ] Selector convention: `cia-<recipe-slug>`
- [ ] Component file passes `ng lint`

**Effort:** L (1-2 days)
**Depends on:** v1.1 US-V11.04.1.1 (recipe parsing)

#### US-V13.04.1.2 — Add Angular sections to existing recipes

**Acceptance criteria:**
- [ ] Walk all shipped recipes (v1.0 + v1.1)
- [ ] Add an "Angular" subsection to each "Framework examples" H2
- [ ] Lint script (v1.0 US-01.1.3) updated to require Angular section in addition to React/Vue/Svelte/vanilla
- [ ] Updated recipes still pass validate-recipes

**Effort:** L (1-2 days)
**Depends on:** none (can run parallel to F4.1)

#### US-V13.04.1.3 — Generate Angular CSS

**Acceptance criteria:**
- [ ] Generated `.component.scss` mirrors React's `.module.scss` content
- [ ] Angular uses ViewEncapsulation by default — generator outputs styles that work in encapsulated mode
- [ ] `@use 'css-is-awesome' as cia;` import path works in Angular CLI's Sass pipeline

**Effort:** M (4-8 hrs)

---

### F4.2 — First batch of generated components

#### US-V13.04.2.1 — Generate Dialog component

**Acceptance criteria:**
- [ ] `packages/@cia/angular/src/dialog.component.ts` generated from `scss/recipes/dialog.md`
- [ ] Uses standalone component pattern (Angular 17+)
- [ ] Exports `<cia-dialog>` selector
- [ ] Smoke test in a sample Angular app

**Effort:** M (4-8 hrs)

#### US-V13.04.2.2 — Generate Combobox component

**Effort:** M (4-8 hrs)

#### US-V13.04.2.3 — Generate DataTable component

**Effort:** M (4-8 hrs)

#### US-V13.04.2.4 — Generate CommandPalette component

**Effort:** M (4-8 hrs)

---

### F4.3 — npm package + tooling

#### US-V13.04.3.1 — Package scaffolding for `@cia/angular`

**Acceptance criteria:**
- [ ] Package at `packages/@cia/angular/`
- [ ] Peer deps: `@angular/core ^17 || ^18 || ^19 || ^20`, cia ^1.3
- [ ] Compatible with both standalone components and NgModule (provide migration note)
- [ ] Tree-shakeable
- [ ] Published to npm

**Effort:** M (4-8 hrs)
**Depends on:** US-V13.04.2.1 through US-V13.04.2.4

#### US-V13.04.3.2 — Build pipeline + CI smoke test

**Acceptance criteria:**
- [ ] `npm run build:angular` regenerates components from current recipes
- [ ] CI: create temp Angular app, install `@cia/angular`, render components, `ng build` passes
- [ ] Run on every PR touching recipes/ or codegen/
- [ ] Migration script for recipe breaking changes

**Effort:** M (4-8 hrs)

## Definition of done

- [ ] All 10 stories accepted
- [ ] `@cia/angular` v0.1.0 published
- [ ] 4 components generated (Dialog, Combobox, DataTable, CommandPalette)
- [ ] Each verified in a sample Angular app
- [ ] CHANGELOG.md `@cia/angular` v0.1.0 entry
- [ ] Recipe schema updated to require Angular section + lint enforces

## Risks

- **Recipe schema breaking change.** Adding required Angular section forces all existing recipes to update. Mitigation: do it as part of this epic; bump recipe-schema version; lint enforces.
- **Angular-React framework semantics differ.** React's compound components (Dialog.Header) don't translate 1:1 to Angular's content projection. Mitigation: each recipe's Angular section is authored separately, codegen just transports it; cross-framework idioms aren't forced.
- **Standalone vs NgModule.** Angular has migrated to standalone components. v0.1 only ships standalone; NgModule users can wrap if needed. Document this limitation.
- **Gating risk.** If v1.1 EPIC-04 React codegen fails, this epic is permanently deferred. Mitigation: explicit gate documented; v1.3 release notes reflect.

## Related

- [v1.1 EPIC-04-framework-pack-react.md](../v1-1/EPIC-04-framework-pack-react.md) — gating epic; proves the codegen pattern
- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — recipes that this generates from
- [post-v1-ideas.md](../v1-0/post-v1-ideas.md) — `@cia/vue`, `@cia/svelte` slated after Angular ships
