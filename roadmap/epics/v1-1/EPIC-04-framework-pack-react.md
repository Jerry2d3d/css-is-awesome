# EPIC v1.1-04 — `@cia/react` v0.1 (Codegen Proof of Concept)

**Status:** ⛔ DEFERRED PERMANENTLY — 2026-09-19, on the epic's own fail-fast clause. No `@cia/react` will ship.

> ## Decision 2026-09-19 — the codegen is `cat` with a 15-line header
>
> This epic wrote its own exit condition: *"If codegen does NOT work cleanly, this epic fails fast and `@cia/react` is permanently deferred (recipes remain the only framework story). That's a legitimate v1.1 outcome."* A time-boxed spike built the pipeline exactly as F4.1 specifies and ran it over three recipes of increasing difficulty. It does not work cleanly. The artifacts are in [`spike/`](../../../spike/README.md) and can be re-run.
>
> **What the spike produced**
>
> | Recipe | Generated | Verbatim / synthesised | Renders? |
> |---|---|---|---|
> | `breadcrumb` (simple) | `Breadcrumb.jsx` | 21 / 15 (58% copied) | ❌ `TypeError: Cannot read properties of undefined (reading 'length')` |
> | `combobox-multiselect` (complex) | `ComboboxMultiselect.jsx` | 98 / 15 (87% copied) | ⚠️ renders — as a hard-coded **pizza-toppings picker** |
> | `toast` (complex) | `Toast.jsx` | 88 / 15 (85% copied) | ❌ `ReferenceError: ToastRecipe is not defined` |
>
> **1. It is file assembly, not codegen.** The 15 "synthesised" lines are *byte-identical* across all three outputs apart from the component name — a fixed wrapper template plus a `DO NOT EDIT` header. Everything else is the recipe's React block copied verbatim. F4.1's own criterion concedes this: *"this is the source of truth — codegen just copies it into the right file shape."* A generator whose output is `cat recipe-section` plus a constant is not a pipeline worth two weeks and a published package.
>
> **2. The prop model is incompatible with real recipes.** US-V11.04.1.2 mandates the interface `(children, className, ...rest)`. The three recipes expose three different shapes, none of them that one:
> - `breadcrumb` requires a `crumbs: Crumb[]` prop — the generated wrapper passes none, so it crashes on first render.
> - `combobox-multiselect` takes **no props at all** and is named `MyMultiselect`.
> - `toast` has **no default export**; it exports `ToastProvider` + a `useToast` hook and keeps `ToastItem` private. There is no single component to wrap, so the wrapper references an identifier that does not exist.
>
> **3. Demo fixtures ship to consumers.** `npm install @cia/react` would deliver a `ComboboxMultiselect` hard-wired to `const OPTIONS = ["Cheese", "Mushrooms", "Olives", "Onions", "Peppers", "Pineapple", "Spinach"]` with a `Toppings` label and no prop to change either. Recipe React sections are teaching examples; they are written to be read and adapted, not imported. That is the correct thing for them to be, and it is why they cannot double as package source.
>
> **4. Every output is TSX, and the epic scopes TypeScript out.** "v0.1 is JSX-only, types deferred to v0.2" — but all four framework sections in every recipe are `tsx`. TypeScript's parser rejects all three generated `.jsx` files (2, 4 and 18 errors). Shipping v0.1 would mean stripping the types the recipes deliberately carry.
>
> **5. The styling criterion is wrong twice over.** US-V11.04.1.3 says the generated `.module.scss` contains `@use 'css-is-awesome' as cia;`. That is the emitting bundle, which [`scss/recipes/README.md`](../../../scss/recipes/README.md) forbids in a component stylesheet — *"a top-level `:root` is a hard build error in CSS Modules pure mode"* — and which does not even forward the layout mixins the recipes call (`@include cia.stack` → `Undefined mixin`; `stack` lives in `_layout.scss`). The correct `@use 'css-is-awesome/api' as cia;` compiles clean, so this one is a fixable spec bug. The unfixable part is semantic: `toast.md` styles two distinct selectors, `.my-toasts` (the region, `stack`) and `.my-toast` (one notification, `toast-base`), and a single `cia-recipe-toast` class collapses both onto the same element.
>
> **6. It duplicates a package that already exists and is better.** `@boilerai/react` **0.2.1** already publishes **103 components** against `css-is-awesome ^1.16.1` — including `ComboBox` and `DataTable`, two of this epic's four named targets. Its `Breadcrumb` exports `BreadcrumbItem` and `BreadcrumbProps`, takes `items` / `separator = '/'` / `ariaLabel = 'Breadcrumb'`, and ships with a test file, a stories file and a README. The generated one crashes. boiler-project-ai is cia's designated showcase consumer; shipping a thinner, generated rival from cia's own repo would compete with the showcase and split the React story in two.
>
> **7. The rules already anticipated this.** [`roadmap/epics/README.md`](../README.md) line 111: *"**No component library to maintain** — recipes are the framework story; `@cia/<framework>` packs ship via codegen **if at all**."* The "if at all" is doing real work. [`AGENTS.md`](../../../AGENTS.md) line 11: *"No separate React component library (Jerry's call — recipes are the deliverable)."* A published `@cia/react` is not a violation of the zero-runtime-JavaScript rule — that rule binds the `css-is-awesome` package, and this would be a separate one — but it is squarely against the no-component-library call, and codegen was the only justification for the exception. Codegen did not hold up, so the exception lapses.
>
> **What happens to the stories**
>
> All 12 are retired unbuilt. The same user-power test that retired [EPIC-03](./EPIC-03-cia-a11y-recipes.md) applies: a generated package would cost a publish pipeline, a peer-dep matrix, a sync mechanism and a drift lint, and a consumer gains a component that is strictly worse than copying the recipe by hand or installing `@boilerai/react`. The framework story stays: **32 recipes, each with runnable React / Vue / Svelte / vanilla examples, plus `npx cia add <recipe>` to copy one into a project.** The mirror epic [v1.3 EPIC-04 `@cia/angular`](../v1-3/EPIC-04-framework-pack-angular.md) is deferred on the same evidence, as its own "if codegen proves out" gate never opened.
>
> **What would reopen it.** Real consumer demand for an installable component package, plus a recipe schema change that separates a *reference implementation* (propless, fixture-laden, written to be read) from a *component contract* (named props, no fixtures, one export shape). That is a recipes-book change first and a codegen change second. Nobody has asked for it; `@boilerai/react` already answers the need.
>
> The stories below are kept verbatim as the historical plan. None will be executed.
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
- Project notes (kept outside this repo) — "no component library to maintain" architectural rule this epic respects via codegen
