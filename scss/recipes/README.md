# cia Recipes — Format + Authoring Guide

Recipes are cia's framework-agnostic patterns for building components. Each recipe is a single markdown file under `scss/recipes/`. Recipes ship in the npm package and are exposed to AI agents via the MCP server (`list_recipes`, `get_recipe`, `assemble_prompt`).

> **The recipe IS the deliverable.** cia does not ship a component library. Recipes give consumers (and AI agents) the pattern — they generate or copy the component in their own framework + selector vocabulary.

## File naming

- **Real recipes:** `<slug>.md` — kebab-case slug becomes the URL at `/docs/recipes/<slug>` and the MCP `get_recipe(slug)` key
- **Template / not-renderable:** `_<name>.md` — underscore prefix; catalog page + MCP loader skip these

## Required frontmatter

Every recipe begins with YAML frontmatter:

```yaml
---
name: dialog
description: Accessible modal dialog built on <dialog>.
category: overlay
complexity: medium
cia-version: ">=1.0.0"
---
```

| Field | Type | Notes |
|---|---|---|
| `name` | string | Must match the filename slug |
| `description` | string | One sentence — what this recipe builds, no more |
| `category` | enum | One of: `overlay`, `input`, `data`, `navigation`, `feedback`, `layout`, `auth` |
| `complexity` | enum | One of: `simple`, `medium`, `complex` |
| `cia-version` | semver range | Minimum cia version this recipe targets |

## Required H2 sections (in this order)

```markdown
## Use this when
## Structure (raw HTML)
## Styling (cia mixins)
## Interactivity
## A11y checklist
## Framework examples
```

Each section's purpose:

- **Use this when** — 1-3 sentences describing the consumer scenario. If the reader's situation doesn't match, they should bail and look elsewhere.
- **Structure (raw HTML)** — the markup with `data-cia-recipe` / `data-slot` attributes. Framework-agnostic; consumer adapts to JSX / template / Svelte syntax.
- **Styling (cia mixins)** — SCSS using `cia.X` mixin calls against consumer-chosen class names, opened with `@use 'css-is-awesome/api' as cia;` (see [Import convention](#import-convention)). Show the minimum to make it work; cross-link to mixin docs for parameter detail.
- **Interactivity** — native browser behavior first (`<dialog>.showModal()`, popover API, etc.). JS only where the native primitive can't do the job.
- **A11y checklist** — concrete, testable items. Each item references the WCAG SC or ARIA pattern it satisfies.
- **Framework examples** — minimum **4 subsections**: React, Vue, Svelte, vanilla (Web Component preferred for vanilla). Each is runnable code, not pseudocode.

## Optional H2 sections

- **Variants** — common adaptations (size, density, position). One sub-block per variant with the styling delta.
- **Pitfalls** — known gotchas (SSR, browser compat, focus management edge cases). One bullet per pitfall.
- **Related recipes** — cross-link to other recipes in the catalog.

## Import convention

**Two imports, two jobs.** A recipe's `scss` blocks are component-level styling, so they open with the **zero-emit authoring barrel**:

```scss
@use 'css-is-awesome/api' as cia;
```

`/api` forwards the entire mixin + function API and emits **zero CSS** until a mixin is called, which makes it safe inside a `.module.scss` under Next.js CSS Modules pure mode.

- ❌ **Never** `@use 'css-is-awesome'` in a component styling block. That is the emitting bundle — it prints `:root` tokens, resets and base rules, and a top-level `:root` is a hard build error in CSS Modules pure mode.
- ✅ `@use 'css-is-awesome'` is only correct in a **root/global** stylesheet, where the tokens are emitted exactly once. If a recipe demonstrates a global stylesheet, label the block with a filename comment (`// app/globals.scss`) so the reader can tell which half of the model they're looking at.
- Some mixins emit at the root themselves — `cia.print-base` emits a `:root` block plus `@page`. They are still imported from `/api`; what changes is *placement*. Say in prose that they belong at the top level of a global stylesheet, never in a component module. See [`print-to-pdf.md`](./print-to-pdf.md) for the worked example.
- Recipes stay on `/api` on every toolchain, Turbopack included — the barrel works there. Setup notes for Next.js live in the root [`README.md`](../../README.md).

## Code-block standards

- Fenced blocks with language tag — `html`, `scss`, `tsx`, `vue`, `svelte`, `js`
- Component styling blocks open with `@use 'css-is-awesome/api' as cia;` — see [Import convention](#import-convention)
- Use the cia mixin API verbatim — never inline raw token values
- Class names in examples use the convention `my-<thing>` (signals "your selector here") — never `cia-<thing>` (that prefix is library-owned)
- Each framework example targets a single component, not a full app

## Forbidden in recipes

- ❌ `@use 'css-is-awesome'` (the emitting bundle) in a component styling block — use `css-is-awesome/api`, see [Import convention](#import-convention)
- ❌ `cia-` class names (that prefix belongs to the library, not consumer code)
- ❌ BEM (`__element` / `--modifier`) — see [`feedback_no_bem.md`](../../README.md) project rule
- ❌ Hard-coded `#hex`, `1rem`, `8px` — use `m.color()`, `m.space()`, `m.radius()`
- ❌ Inline `style=""` for **appearance** — colour, spacing, type, borders. That defeats the cia mixin pitch, and a reader copying it learns the wrong lesson.
  - ✅ Allowed for **structural layout-neutralising** only, where an element is required by the HTML contract but must not create a box. The canonical case is `<form method="dialog" style="display: contents">` in `dialog.md`: the form has to wrap the buttons for dialog-close to work, but it must not become a layout box. There is no token or mixin involved and no appearance is being set. `validate-recipes` warns on every inline `style=` so each one stays a conscious decision.
- ❌ Pseudo-code framework examples ("// import your stuff here")

## How a recipe gets rendered + consumed

- **Humans:** The cia website's `/docs/recipes/[slug]` page reads `scss/recipes/<slug>.md`, parses the markdown, renders with syntax highlighting + copy buttons. Catalog page at `/docs/recipes` lists every recipe filtered by category + complexity.
- **AI agents:** The MCP server exposes `list_recipes`, `get_recipe(slug)`, and `assemble_prompt({ intent: "recipe:<slug>" })`. AI reads the recipe + relevant mixin signatures and generates the consumer's component in their stack.

## Validation

`npm run validate-recipes` (US-01.1.3 in v1.0 EPIC-01) walks `scss/recipes/*.md`, checks frontmatter against the schema, asserts required H2s exist, and verifies no forbidden patterns appear. Wired into CI for v1.0.

## Template

Copy `_recipe-template.md` to `<your-slug>.md` and fill in. The template includes every required section with comments explaining what to write.

## Where to read next

- [`_recipe-template.md`](./_recipe-template.md) — copyable stub
- [`dialog.md`](./dialog.md) — first shipped recipe; reference example
- [`../../roadmap/epics/v1-0/EPIC-01-recipes-book.md`](../../roadmap/epics/v1-0/EPIC-01-recipes-book.md) — v1.0 backlog for the first 5 recipes + catalog + MCP exposure
