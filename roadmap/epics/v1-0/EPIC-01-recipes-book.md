# EPIC 01 — Recipes Book

**Status:** 🟡 PARTIAL — 7 of 13 stories shipped (audited 2026-07-16, main @ 97f6ae3)
**Effort estimate:** ~5-7 working days
**Stories:** 13

> **Update 2026-09-01 — v1.0 launched with this epic partial.** v1.0.0 was tagged 2026-08-17 and the launch (first npm publish `css-is-awesome@1.1.0`, public repo, live docs site) completed 2026-09-01. The six open stories — datepicker, data-table, and command-palette recipes (US-01.2.3–01.2.5), the authoring guide page (US-01.1.2), and `validate-recipes` (US-01.1.3), plus the dependent US-01.2.6 — are **carried forward post-launch** per the ship-then-see rule; they queue behind real user signal.

## Audited status — 2026-07-16 (main @ 97f6ae3)

The recipe format, catalog, dynamic route, and MCP exposure all shipped. Only **2 of the 5 planned recipes** landed (dialog, combobox); a bonus `print-to-pdf` recipe shipped instead of the other three. The authoring docs page and the `validate-recipes` lint script were never built.

| Story | Status | Evidence |
|-------|--------|----------|
| US-01.1.1 Recipe markdown schema | ✅ DONE | `scss/recipes/README.md` documents frontmatter + required H2s; `scss/recipes/_recipe-template.md` present |
| US-01.1.2 Authoring guide page | ⛔ NOT SHIPPED | No `src/app/docs/recipes/authoring/` route exists |
| US-01.1.3 `validate-recipes` lint script | ⛔ NOT SHIPPED | No `scripts/recipe-validator.mjs`; no `validate-recipes` npm script (README still describes it as future work) |
| US-01.2.1 Recipe: dialog | ✅ DONE | `scss/recipes/dialog.md` — all 4 framework examples (React/Vue/Svelte/Vanilla) + a11y checklist |
| US-01.2.2 Recipe: combobox | ✅ DONE | `scss/recipes/combobox.md` (PR #9) — datalist + ARIA pattern, 4 framework examples |
| US-01.2.3 Recipe: datepicker | ⛔ NOT SHIPPED | No `scss/recipes/datepicker.md` |
| US-01.2.4 Recipe: data-table | ⛔ NOT SHIPPED | No `scss/recipes/data-table.md` (an inline data-table *example* exists in the catalog page, not a recipe file) |
| US-01.2.5 Recipe: command-palette | ⛔ NOT SHIPPED | No `scss/recipes/command-palette.md` |
| US-01.2.6 Each recipe ships 4 framework samples | 🟡 PARTIAL | Satisfied by the 2 shipped recipes; can't be "all 5" until 01.2.3–01.2.5 ship |
| US-01.3.1 Recipe catalog page | ✅ DONE | `src/app/docs/recipes/page.tsx` + `RecipesGallery.tsx` list markdown recipes with category/complexity chips |
| US-01.3.2 Individual recipe pages (dynamic route) | ✅ DONE | `src/app/docs/recipes/[slug]/page.tsx` (PR #11, commit 128bb7b) with copy buttons |
| US-01.4.1 MCP list_recipes / get_recipe | ✅ DONE | `mcp/server.cjs` registers `list_recipes` + `get_recipe` |
| US-01.4.2 assemble_prompt recipe intent | ✅ DONE | `mcp/server.cjs` `assemble_prompt` handles `recipe:<name>` intent |

**Bonus (not in original plan):** `scss/recipes/print-to-pdf.md` shipped (PR #10). The `datepicker`, `data-table`, and `command-palette` recipes remain the outstanding v1.0 work for this epic.

## Mission

Establish the recipe markdown format and ship 5 starter recipes that prove the pattern works across React, Vue, Svelte, and vanilla. Expose all recipes via the MCP server so AI agents can compose them into consumer components in any framework.

## Why now

This is the v1.0 headline. cia has been mixin-first since v0.8 — the recipes book is what makes the mixin authoring story discoverable. Without it, consumers (and AIs) don't know HOW to assemble cia mixins into a complete accessible component.

Recipes are also cia's structural answer to the shadcn-graduate problem: they give consumers the pattern + the cia mixin calls + the a11y notes + the framework variants without forcing cia to maintain a 50-component library.

## Out of scope

- All 15-20 recipes — only the first 5 ship in v1.0
- Visual recipe builder (Recipes Maker) — post-v1.0 idea
- `@cia/a11y-recipes` add-on package — post-v1.0
- Form-validation recipes — post-v1.0
- i18n / RTL recipes — post-v1.0

## Features

### F1.1 — Recipe template + authoring guide

**Goal:** Define the schema every cia recipe follows. Without a stable schema, AI agents and humans can't pattern-match across recipes.

#### US-01.1.1 — Define recipe markdown schema (frontmatter + sections)

**As** a recipe author (Jerry, contributor, or AI)
**I want** a documented markdown schema with required frontmatter and section headings
**So that** every recipe is parseable, search­able, and predictable for human readers and AI agents

**Acceptance criteria:**
- [ ] Schema documented in `scss/recipes/README.md`
- [ ] Required frontmatter: `name`, `description`, `category`, `complexity`, `cia-version`
- [ ] Required H2 sections: `Use this when`, `Structure (raw HTML)`, `Styling (cia mixins)`, `Interactivity`, `A11y checklist`, `Framework examples`
- [ ] Optional H2 sections: `Variants`, `Pitfalls`, `Related recipes`
- [ ] Example recipe stub at `scss/recipes/_recipe-template.md` ready to copy

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-01.1.2 — Write recipe authoring guide at /docs/recipes/authoring

**As** a contributor (human or AI) writing a new recipe
**I want** a docs page that walks through the schema with one full worked example
**So that** I can write a new recipe without reverse-engineering existing ones

**Acceptance criteria:**
- [ ] Page lives at `src/app/docs/recipes/authoring/page.tsx`
- [ ] Renders the schema doc + one full dialog recipe as live example
- [ ] Includes "common mistakes" section (forgot a11y checklist, missing framework example, hardcoded colors instead of `m.color()`)
- [ ] Linked from the recipes catalog page

**Effort:** M (4-8 hrs)
**Depends on:** US-01.1.1

#### US-01.1.3 — Lint script validates recipe files against schema

**As** a maintainer
**I want** `npm run validate-recipes` to fail CI if a recipe is missing required sections
**So that** schema drift can't ship to npm

**Acceptance criteria:**
- [ ] Script at `scripts/recipe-validator.mjs`
- [ ] Reads frontmatter (`yaml`), checks for required keys
- [ ] Walks markdown AST (use `remark`), checks for required H2s
- [ ] Reports missing fields per recipe with file path + line number
- [ ] Wired into `npm test` or `npm run lint`

**Effort:** S (≤4 hrs)
**Depends on:** US-01.1.1

---

### F1.2 — First 5 recipes

**Goal:** Five recipes that cover the high-value gap cia has today: components that native HTML doesn't ship and shadcn covers.

#### US-01.2.1 — Recipe: accessible dialog

**As** an AI agent (or human)
**I want** a recipe that shows how to build a fully-accessible modal dialog using `<dialog>` + cia mixins
**So that** I can generate a production-grade modal in any framework without reading 300 lines of Radix source

**Acceptance criteria:**
- [ ] Recipe file at `scss/recipes/dialog.md`
- [ ] Uses native `<dialog>` with `.showModal()` for built-in focus trap + Esc handling
- [ ] Styling section uses `cia.modal`, `cia.toolbar`, `cia.btn(primary)` and `cia.btn(ghost)`
- [ ] A11y checklist covers `aria-labelledby`, initial focus, `inert` background, `<form method="dialog">`
- [ ] Framework examples: React, Vue, Svelte, vanilla
- [ ] Renders at `/docs/recipes/dialog`

**Effort:** M (4-8 hrs)
**Depends on:** US-01.1.1

#### US-01.2.2 — Recipe: combobox

**As** an AI agent (or human)
**I want** an ARIA-grade combobox recipe with a native `<select>` fallback for the read-only case
**So that** I can ship an autocomplete input that screen readers handle correctly

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/combobox.md`
- [ ] Native `<input list="">` + `<datalist>` variant for the simple case
- [ ] Custom variant uses `[role="combobox"]` + `aria-expanded` + `aria-controls` + `aria-activedescendant`
- [ ] Styling section uses `cia.input-base`, `cia.popover-base` (or equivalent)
- [ ] A11y checklist covers keyboard nav (Arrow keys, Enter, Esc, Home, End)
- [ ] Framework examples: React, Vue, Svelte, vanilla — vanilla uses Web Component
- [ ] Notes which JS engines pair well (Downshift, Headless UI, Zag.js) but doesn't require any

**Effort:** L (1-2 days)
**Depends on:** US-01.2.1

#### US-01.2.3 — Recipe: datepicker

**As** an AI agent (or human)
**I want** a datepicker recipe that starts with native `<input type="date">` and shows how to upgrade to a custom calendar widget
**So that** I can pick the smallest viable surface for the consumer's actual need

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/datepicker.md`
- [ ] Native section: `<input type="date">` with cia.input-base styling + browser-default popover
- [ ] Custom section: month-grid layout with cia.grid + cia.btn(ghost) day cells + popover trigger
- [ ] A11y checklist covers month navigation, today highlight, selected state, date range
- [ ] Framework examples: React, Vue, Svelte, vanilla
- [ ] Pitfalls section warns about timezone handling

**Effort:** L (1-2 days)
**Depends on:** US-01.2.1

#### US-01.2.4 — Recipe: data-table

**As** an AI agent (or human)
**I want** a data-table recipe with sort, sticky header, and a mobile collapse pattern
**So that** I can ship a production table without pulling in Tanstack Table on day one

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/data-table.md`
- [ ] Uses semantic `<table>` + cia.table-base
- [ ] Sortable columns: `<button>` in `<th>` with `aria-sort`
- [ ] Sticky header: `position: sticky; top: 0;` on `<thead>`
- [ ] Mobile collapse: `@media (max-width: ...)` flips rows to card-like blocks
- [ ] A11y checklist covers `<caption>`, `scope="col"`, sort announcements
- [ ] Framework examples: React, Vue, Svelte, vanilla
- [ ] Notes when to graduate to Tanstack Table / AG Grid

**Effort:** L (1-2 days)
**Depends on:** US-01.2.1

#### US-01.2.5 — Recipe: command palette

**As** an AI agent (or human)
**I want** a Cmd+K command-palette recipe
**So that** I can ship a Linear/Notion-style global launcher without copying a 500-line shadcn cmdk component

**Acceptance criteria:**
- [ ] Recipe at `scss/recipes/command-palette.md`
- [ ] Built on `<dialog>` + combobox pattern
- [ ] Keyboard shortcut handler shown for React + Vue + Svelte + vanilla
- [ ] Fuzzy-match search shown (small, no dep — or pointer to fuse.js)
- [ ] A11y checklist covers focus trap, Esc closes, Arrow navigation in results, Enter selects
- [ ] Framework examples: React, Vue, Svelte, vanilla
- [ ] Pitfalls section covers SSR safety + body scroll lock

**Effort:** L (1-2 days)
**Depends on:** US-01.2.1, US-01.2.2

#### US-01.2.6 — Each recipe ships 4 framework code samples

**As** an AI agent reading any recipe
**I want** every recipe's "Framework examples" section to contain React, Vue, Svelte, and vanilla code
**So that** I can copy-adapt regardless of consumer's stack

**Acceptance criteria:**
- [ ] Schema requires the 4 framework sections (lint-enforced via US-01.1.3)
- [ ] Each framework example is runnable (not pseudocode)
- [ ] All 5 v1.0 recipes (US-01.2.1 through US-01.2.5) satisfy this requirement
- [ ] Vanilla examples prefer Web Components when feasible

**Effort:** M (4-8 hrs per recipe, bundled into each recipe's effort above)
**Depends on:** US-01.2.1 through US-01.2.5

---

### F1.3 — Recipe catalog page

**Goal:** A `/docs/recipes` page where humans can browse, search, and link to individual recipes.

#### US-01.3.1 — Recipe catalog page with search + tags

**As** a human dev visiting cia for the first time
**I want** to browse all recipes filtered by category and complexity
**So that** I find the dialog recipe in 10 seconds instead of grepping the source

**Acceptance criteria:**
- [ ] Page at `src/app/docs/recipes/page.tsx`
- [ ] Lists all shipped recipes with name, one-line description, complexity badge
- [ ] Client-side search by recipe name + description
- [ ] Filter by category (overlay / input / data / navigation / feedback)
- [ ] Linked from main docs navigation

**Effort:** M (4-8 hrs)
**Depends on:** US-01.2.1 (needs ≥1 recipe to render)

#### US-01.3.2 — Individual recipe pages render markdown with syntax highlight

**As** a human dev clicking a recipe from the catalog
**I want** the recipe to render with syntax highlighting and a copy button on every code block
**So that** I can read AND copy the patterns in one workflow

**Acceptance criteria:**
- [ ] Dynamic route at `src/app/docs/recipes/[slug]/page.tsx`
- [ ] Reads markdown from `scss/recipes/<slug>.md`
- [ ] Renders with `remark` + a syntax highlighter (prism / shiki / highlight.js)
- [ ] Every fenced code block gets the existing `CopyButton` component
- [ ] Framework example tabs use the existing `Tabs` component

**Effort:** M (4-8 hrs)
**Depends on:** US-01.3.1

---

### F1.4 — MCP server exposes recipes to AI agents

**Goal:** AI agents using `@cia/mcp-server` can list, fetch, and prompt-assemble recipes without reading the cia repo.

#### US-01.4.1 — MCP server exposes list_recipes / get_recipe (verify + extend)

**As** an AI agent connected via MCP
**I want** to call `list_recipes` and `get_recipe(name)` to discover and load recipes
**So that** I can generate a consumer component without filesystem access

**Acceptance criteria:**
- [ ] `mcp/server.cjs` exposes `list_recipes` (returns name + description + category for each)
- [ ] `get_recipe(name)` returns full markdown body + parsed frontmatter
- [ ] Both tools described in MCP server docs
- [ ] Verified with a sample MCP client (Claude Code or Cursor) reading a recipe

**Effort:** S (≤4 hrs)
**Depends on:** US-01.2.1

#### US-01.4.2 — Add `assemble_prompt` recipe intent

**As** an AI agent assembling context for a generation task
**I want** `assemble_prompt({ intent: "recipe:dialog" })` to bundle the recipe + cia mixin signatures it uses + relevant tokens into one prompt block
**So that** I can pass a single rich prompt to my downstream LLM call

**Acceptance criteria:**
- [ ] `assemble_prompt` accepts `recipe:<name>` intent
- [ ] Returns: recipe body + each `cia.X` mixin signature referenced + each `m.color()` / `m.space()` token's current value
- [ ] Documented in `mcp/server.cjs` README
- [ ] Verified with a sample MCP client

**Effort:** S (≤4 hrs)
**Depends on:** US-01.4.1

## Definition of done

- [ ] All 13 stories accepted (7/13 done as of 2026-07-16)
- [ ] Recipe schema documented + authoring guide live (schema ✅; authoring page ⛔)
- [ ] 5 recipes shipped (dialog, combobox, datepicker, data-table, command-palette) — **2/5 shipped** (dialog, combobox); +1 bonus (print-to-pdf)
- [ ] All 5 recipes include React + Vue + Svelte + vanilla examples (true for the 2 shipped)
- [ ] `npm run validate-recipes` passes in CI (script not built)
- [x] `/docs/recipes` catalog page lives + linked from main nav
- [x] MCP server returns recipes via list/get/assemble_prompt
- [ ] At least 1 external AI agent (Claude Code) verified end-to-end fetching a recipe

## Risks

- **Schema lock-in too early.** If we ship 5 recipes and then realize the schema needs an `Errors / edge cases` section, all 5 need updates. Mitigation: review schema after recipe #2 before locking.
- **Framework example drift.** Vue and Svelte snippets won't be tested as rigorously as React. Mitigation: lint script could spot-check syntax via a parser; full runtime testing deferred to v1.1.
- **Combobox + command-palette overlap.** Both touch ARIA combobox pattern. Mitigation: command-palette recipe links to combobox recipe for the input layer, doesn't redefine.

## Related

- [EPIC-04-playground.md](./EPIC-04-playground.md) — playground will link to each recipe with a "Try in playground →" button
- [EPIC-05-bug-fixes-mcp-polish.md](./EPIC-05-bug-fixes-mcp-polish.md) — `/docs/composition` page complements the recipe catalog
- [post-v1-ideas.md](./post-v1-ideas.md) — Recipes Maker, `@cia/a11y-recipes`, additional recipes
