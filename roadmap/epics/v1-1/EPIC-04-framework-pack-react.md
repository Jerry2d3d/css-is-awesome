# EPIC v1.1-04 — `@cia/react` v0.1 (Codegen Proof of Concept)

**Status:** Planned (v1.1)
**Effort estimate:** ~2 weeks
**Stories:** 12

## Mission

Prove the codegen pipeline: read cia recipes → emit framework-specific React components. Ship `@cia/react` v0.1 with 3-5 generated components. If generation works, the same pipeline produces `@cia/vue`, `@cia/svelte`, `@cia/angular` in subsequent releases without Jerry maintaining N parallel component libraries.

## Why now

Jerry's 2026-05-23 architectural call: "I don't want to keep up with a component library." Generated-from-recipes is the only way to ship framework packs without violating that rule. v1.1 is the right time to prove the pattern — recipes exist (v1.0) and there's still time before v1.0 stabilizes to integrate feedback.

**If codegen does NOT work cleanly, this epic fails fast and `@cia/react` is permanently deferred** (recipes remain the only framework story). That's a legitimate v1.1 outcome.

## Out of scope

- Hand-written React components (the entire point is NOT to maintain them)
- Server Components (RSC) — v0.1 ships client components only
- TypeScript code generation — v0.1 is JSX-only, types deferred to v0.2
- npm publish of `@cia/vue` / `@cia/svelte` / `@cia/angular` (only `@cia/react` in v1.1; others follow if codegen proves out)

## Features

### F4.1 — Codegen pipeline

#### US-V11.04.1.1 — Parse recipe markdown into structured AST

**As** the codegen tool
**I want** to parse a cia recipe markdown into a structured representation: HTML skeleton + cia mixin calls + a11y notes + framework-section content
**So that** downstream generators have a clean intermediate form

**Acceptance criteria:**
- [ ] Tool at `packages/codegen/parse-recipe.mjs`
- [ ] Uses `remark` + `unified` for markdown AST
- [ ] Extracts HTML structure from "Structure" section as HTML AST
- [ ] Extracts cia mixin calls from "Styling" section as object: `{ selector, mixin, params }[]`
- [ ] Extracts each framework section content as raw string for that framework's generator
- [ ] Validation: throws if recipe doesn't match v1.0 schema

**Effort:** L (1-2 days)
**Depends on:** v1.0 US-01.1.1 (recipe schema)

#### US-V11.04.1.2 — Generate React JSX from recipe AST

**As** the codegen tool
**I want** to take parsed recipe AST and emit a `<RecipeName>.jsx` file with consumer-facing props
**So that** consumers can `import { Dialog } from '@cia/react'`

**Acceptance criteria:**
- [ ] Generator at `packages/codegen/generators/react.mjs`
- [ ] Reads the "React" framework section of the recipe (this is the source of truth — codegen just copies it into the right file shape)
- [ ] Adds prop interface (children, className, ...rest)
- [ ] Default selector class is `cia-recipe-<name>`; consumers can override via className prop
- [ ] Output is single-file React component (function component, no class components)
- [ ] Component file passes `next lint`
- [ ] Component renders in a sample Next.js app

**Effort:** L (1-2 days)
**Depends on:** US-V11.04.1.1

#### US-V11.04.1.3 — Generate CSS module per component

**As** the codegen tool
**I want** to also emit a colocated `<RecipeName>.module.scss` that `@use`s cia and applies the recipe's mixin calls
**So that** the generated component is fully styled out of the box

**Acceptance criteria:**
- [ ] Generator outputs `.module.scss` per component
- [ ] File contains `@use 'css-is-awesome' as cia;` + selector blocks from recipe's styling section
- [ ] Selector targets match the className the React component renders (e.g. `.cia-recipe-dialog`)
- [ ] Compiles cleanly via standard Sass build

**Effort:** M (4-8 hrs)
**Depends on:** US-V11.04.1.2

---

### F4.2 — First batch of generated components

#### US-V11.04.2.1 — Generate Dialog component

**Acceptance criteria:**
- [ ] `packages/@cia/react/src/Dialog.jsx` generated from `scss/recipes/dialog.md`
- [ ] Colocated `Dialog.module.scss`
- [ ] Exports `Dialog`, `Dialog.Header`, `Dialog.Body`, `Dialog.Footer` (compound component pattern)
- [ ] Smoke test renders in storybook-less HTML harness

**Effort:** M (4-8 hrs)
**Depends on:** US-V11.04.1.2

#### US-V11.04.2.2 — Generate Combobox component

**Acceptance criteria:**
- [ ] Generated from `scss/recipes/combobox.md`
- [ ] Works as controlled or uncontrolled
- [ ] Verified in sample app

**Effort:** M (4-8 hrs)

#### US-V11.04.2.3 — Generate DataTable component

**Acceptance criteria:**
- [ ] Generated from `scss/recipes/data-table.md`
- [ ] Accepts `columns` + `data` props
- [ ] Sortable per recipe's pattern
- [ ] Verified in sample app

**Effort:** M (4-8 hrs)

#### US-V11.04.2.4 — Generate CommandPalette component

**Acceptance criteria:**
- [ ] Generated from `scss/recipes/command-palette.md`
- [ ] Renders via portal (or `<dialog>` per recipe choice)
- [ ] Cmd+K handler wired
- [ ] Verified in sample app

**Effort:** M (4-8 hrs)

---

### F4.3 — npm package + tooling

#### US-V11.04.3.1 — Package scaffolding

**As** a consumer
**I want** `npm install @cia/react` to give me a working ESM package with tree-shakeable exports
**So that** my bundle isn't bloated by components I don't import

**Acceptance criteria:**
- [ ] Package at `packages/@cia/react/`
- [ ] `package.json` declares cia as peer dependency (^1.1.0)
- [ ] Peer dependencies: react ^18 || ^19, react-dom ^18 || ^19
- [ ] ESM-only export (no CJS)
- [ ] Tree-shakeable: each component is its own export
- [ ] `sideEffects: false` (with the `.module.scss` files declared as side-effectful per pattern)
- [ ] Published to npm

**Effort:** M (4-8 hrs)
**Depends on:** US-V11.04.2.1 through US-V11.04.2.4

#### US-V11.04.3.2 — Build pipeline

**As** a maintainer
**I want** `npm run build` in the codegen package to regenerate all components from current recipes
**So that** recipe changes flow into the published package automatically

**Acceptance criteria:**
- [ ] Script `npm run build:react` walks `scss/recipes/*.md` and regenerates `packages/@cia/react/src/`
- [ ] Diff-friendly output (deterministic, sorted, no timestamps)
- [ ] Errors loudly if a recipe is malformed
- [ ] Wired into pre-publish hook

**Effort:** M (4-8 hrs)

#### US-V11.04.3.3 — CI smoke test

**As** the CI
**I want** to verify the generated React components render without errors in a sample Next.js project
**So that** broken codegen doesn't ship

**Acceptance criteria:**
- [ ] CI step: create temp Next.js app, install @cia/react locally, render every generated component
- [ ] Component renders without console errors
- [ ] Build succeeds (`next build` passes)
- [ ] Run on every PR that touches recipes/ or codegen/

**Effort:** M (4-8 hrs)

---

### F4.4 — Sync mechanism

#### US-V11.04.4.1 — Recipe-update triggers regen

**As** a maintainer updating a recipe
**I want** the regenerated @cia/react components to match without manual edits
**So that** the recipe stays the single source of truth

**Acceptance criteria:**
- [ ] Recipe update + `npm run build:react` produces the expected component diff
- [ ] No hand-written drift (lint detects manual edits to generated files)
- [ ] Each generated file has a header: `// GENERATED FROM <recipe>.md — DO NOT EDIT`
- [ ] Lint script checks the header is present + first line untouched

**Effort:** S (≤4 hrs)
**Depends on:** US-V11.04.3.2

#### US-V11.04.4.2 — Migration script for breaking recipe changes

**As** a maintainer making a breaking change to a recipe
**I want** a script that flags consumers who likely need to update their import / props
**So that** breaking changes are surfaced clearly

**Acceptance criteria:**
- [ ] When a recipe's public API changes (component name, prop names, slot names), CHANGELOG entry is generated automatically
- [ ] Migration notes appended to `MIGRATION.md`
- [ ] Major-version bump in @cia/react package

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 12 stories accepted
- [ ] `@cia/react` v0.1.0 published to npm
- [ ] 4 components generated from recipes (Dialog, Combobox, DataTable, CommandPalette)
- [ ] Each component verified in a sample Next.js app
- [ ] Codegen pipeline reproducible — `npm run build:react` regenerates same output
- [ ] CI runs smoke test on every PR
- [ ] CHANGELOG.md @cia/react v0.1.0 entry
- [ ] **Decision recorded:** does codegen prove out (→ greenlight `@cia/vue`/`svelte`/`angular`) or fail (→ defer all framework packs permanently)

## Risks

- **Recipe variance breaks codegen.** Different recipes have different markdown shapes despite the schema. Mitigation: schema lint script (v1.0 US-01.1.3) hardened; rejection of malformed recipes is acceptable.
- **React-specific patterns in recipes leak to other framework gens.** When `@cia/vue` is added later, recipe's React-section may have React-isms (hooks, JSX) that don't translate. Mitigation: each framework section is read by its own generator; cross-pollution is impossible by design.
- **Generated code drift.** Consumer copies a generated file out and edits it, then complains when regen overwrites. Mitigation: header comment + lint enforces "don't edit," docs explain "fork the recipe, regenerate, not the component."
- **Codegen is genuinely the wrong shape.** If 4 components surface 4 different bugs in the pipeline, abandon and don't ship `@cia/react`. Recipes alone remain the framework story.

## Related

- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — recipes that this generates from
- [v1.3 EPIC-04-framework-pack-angular.md](../v1-3/EPIC-04-framework-pack-angular.md) — mirror epic if React codegen proves out
- [post-v1-ideas.md](../v1-0/post-v1-ideas.md) — vue / svelte / framework story
- [project_v1_architecture_recipes.md](../../../C:/Users/jhans/.claude/projects/K--repo-css-is-awesome/memory/project_v1_architecture_recipes.md) — "no component library to maintain" architectural rule this epic respects via codegen
