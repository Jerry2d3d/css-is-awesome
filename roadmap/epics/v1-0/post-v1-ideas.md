# Post-v1.0 Ideas

> **EXPANDED 2026-05-23 into full epic + feature + story files.** This page is now a high-level summary that points at each version's epic folder. Use this for quick scanning; open the linked epic files for full backlog detail.

Each item is a candidate for v1.x+ — version assignments are planned but not locked. Reordering and scope changes expected as v1.0 ships and real usage data comes in.

## Quick navigation to the full epic backlog

- **[v1.1 epics](../v1-1/README.md)** — Recipes momentum (additional recipes, install wizard, @cia/a11y-recipes, @cia/react POC)
- **[v1.2 epics](../v1-2/README.md)** — Coverage (RTL audit, form validation, i18n, print, MUI + Chakra migration)
- **[v1.3 epics](../v1-3/README.md)** — Ecosystem (Figma plugin, theme marketplace, DTCG migration, @cia/angular)
- **[v1.5 epics](../v1-5/README.md)** — IDE integration (VS Code extension)
- **[v2.0 epics](../v2-0/README.md)** — Visual builder (Recipes Maker)
- **[top-level epic index](../README.md)** — full release table, naming convention, contribution rules

The brief summaries below mirror the version assignments — each one links to the full epic file with stories.

---

## v1.5 target

### VS Code extension

Mixin signature hovers, autocomplete for token keys, jump-to-definition for cia mixins, inline contrast preview on color tokens. Mirrors what Tailwind CSS IntelliSense does for Tailwind. Locked as v1.5 target in 2026-05-23 alignment.

**Why deferred from v1.0:** Playground covers the "I can see what cia does" need with zero install. VS Code extension is the "I'm using cia every day" upgrade — earned by post-launch traction.

**Effort estimate:** 1-2 weeks for a polished v1.

---

## Strong v1.1 candidates

### Additional recipes (10-15 more)

v1.0 ships 5 starter recipes. The next batch closes the shadcn-coverage gap:

- combobox-multiselect
- breadcrumb
- pagination
- file-upload (with drag-drop pattern)
- color-picker
- range-slider (single + dual handle)
- toast / notification
- sortable list (drag-handle pattern)
- virtual list (recipe for windowing libs)
- tree / nested navigation
- form-validation patterns (this is its own mini-epic — see below)
- i18n-aware date/number formatting recipe
- RTL recipe
- print recipe
- empty-state recipe

**Effort:** ~2-3 days per recipe. Batch in v1.1 / v1.2 / v1.3 as time permits.

### `@cia/a11y-recipes` add-on package

A separate npm package that bundles WCAG-strict recipes for the harder cases (combobox with announcement, command palette with focus trap library, datepicker with screen-reader month navigation). Optionally includes tiny JS shims only where the recipe needs them.

**Why deferred from v1.0:** v1.0 recipes ship a11y checklists inline. The add-on becomes valuable once there are enough complex recipes to bundle. Gemini warned against cia becoming a "state machine vendor" — the add-on stays small and recipe-driven, never reinventing Radix/React Aria.

**Effort:** ~1 week to scaffold + initial recipe coverage.

### `npm create cia@latest` install wizard

Asks framework? + initial theme? + want @cia/a11y-recipes? Installs and wires the right packages. Easier landing than the current "read README, decide" flow.

**Why deferred from v1.0:** Existing `npm install css-is-awesome` works fine for the slim case. Wizard becomes valuable when there are multiple add-on packages to choose between (i.e., once @cia/a11y-recipes ships).

**Effort:** ~3-5 days.

---

## Framework recipe packs (post-v1.0 sequence)

cia recipes are framework-agnostic, but pre-rendered framework-specific component bundles could help teams that want pre-wired components rather than recipe generation.

### `@cia/react`

A React package of components that consume cia mixins + tokens. Trigger: v1.1 once recipes book proves the pattern. **NOT** a separate component library Jerry maintains forever — generated FROM recipes via a build step so it stays in sync.

**Why deferred:** "I don't want to keep up with a component library" was Jerry's explicit decision 2026-05-23. Revisit only if generated-from-recipes proves viable.

### `@cia/angular`

Trigger: after `@cia/react` ships and stabilizes. Angular is Jerry's stated next-framework target.

### `@cia/vue`, `@cia/svelte`

Trigger: after Angular. Lowest priority unless community demand surfaces.

---

## Recipes Maker (Jerry's idea)

Visual web tool where a user drags cia primitives onto a stage, configures via mixin params, saves the result as a portable recipe file (markdown with HTML + SCSS mixin calls + a11y notes + framework variants).

**Why deferred from v1.0:** Second-order product. Recipe book + theme editor are the v1.0 deliverables. Recipes Maker becomes valuable once the recipe format is battle-tested and there's user feedback to inform the visual UX.

**Effort:** ~2-3 weeks for a polished v1. UX design is non-trivial.

See `project_recipes_maker_idea.md` in memory for the full sketch.

---

## Tooling ecosystem

### Figma plugin (tokens sync)

Two-way sync between Figma variables and cia tokens. The existing DTCG bridge (`scripts/dtcg-to-scss.mjs`) is the foundation — wrap as a Figma plugin.

**Effort:** ~2 weeks. Real engineering work + Figma API learning curve.

### VS Code snippets pack

Smaller than the full extension — just a JSON snippets file (`cia-btn` → `@include cia.btn(primary);`). Shipable as a separate marketplace listing or bundled with the v1.5 extension.

**Effort:** ~1 day.

### `@cia/storybook-addon` (UNLIKELY)

Documented in memory `project_no_storybook.md` as **NOT planned**. Listed here only to explicitly note it stays out of scope unless community demand surfaces.

---

## Coverage gaps

### RTL audit

cia uses logical properties (margin-inline, padding-block) — RTL likely works at 90% out of the box. Need explicit Arabic/Hebrew test pages + a dedicated `/docs/rtl` walkthrough + automated test in Playwright.

**Effort:** ~3-4 days for audit + fixes + docs.

### Theme marketplace

Community-submitted themes at `/themes/community`. Chicken-egg with adoption — wait until v1.x has organic users.

**Effort:** ~1 week for submission flow + moderation tooling.

### Form validation recipes

Pattern recipes covering: native HTML5 validation styled with cia, react-hook-form + cia, Zod + cia error states, async validation indicators. Probably needs its own mini-epic (5-7 recipes).

**Effort:** ~1 week for 5 recipes.

### i18n / locale-aware recipes

Date formatting via Intl API + cia datepicker recipe variant, number/currency formatting, pluralization with cia.type mixin, RTL flip recipe.

**Effort:** ~3-5 days.

### Animation orchestration recipes

cia animation mixins handle single-element animations well. Multi-element timeline orchestration (Framer Motion territory) is a recipe pattern, not a cia library expansion.

**Effort:** ~3-5 days for 3 orchestration recipes.

### Print stylesheet recipe

Simple recipe: `@media print` + cia tokens for ink/paper. Single recipe, high perceived polish.

**Effort:** ~4 hours.

---

## Migration on-ramp expansions

### Material UI theme import

Read MUI theme object → produce cia theme.scss. Mirror EPIC-03 pattern.

**Effort:** ~3-4 days.

### Chakra UI theme import

Same shape as MUI.

**Effort:** ~3-4 days.

### Style Dictionary / DTCG import

Already partially exists via `scripts/dtcg-to-scss.mjs`. Surface as a `cia migrate dtcg` CLI command + docs page.

**Effort:** ~2 days.

---

## Defer-until-asked

These have been mentioned but have no current owner or pull demand:

- Tailwind preset (expose cia tokens as a Tailwind config) — explicit dual-audience play, low priority unless asked
- PostCSS plugin for utility tree-shaking — only relevant if utility classes become heavily used post-v1.0
- Starter templates (Vite, Astro, plain HTML) — covered by recipes; templates feel redundant
- Browser-legacy build — modern evergreen is the explicit target; no legacy build planned

---

## How to use this list

When a v1.0 epic completes and there's capacity for the next thing, scan this file. Pull the highest-leverage item that aligns with current strategy. Move it to a new epic file under `roadmap/epics/v1-X/` and check it off here.

When a new idea surfaces, add it here under the right section rather than mid-epic. Keeps `roadmap/epics/v1-0/` focused on v1.0 delivery.

Update memory `project_v1_architecture_recipes.md` if any post-v1.0 item changes the architectural rules (e.g., if `@cia/react` becomes recipes-generated and changes Jerry's "no component library" decision).
