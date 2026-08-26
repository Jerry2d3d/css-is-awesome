---
title: Recipes, not components
slug: recipes-not-components
category: architecture
tags: recipes, accessibility, architecture, zero-js
audience: design system authors, front-end developers
excerpt: cia ships markdown patterns instead of a component library. Here is what that buys you, and the bug fix you give up to get it.
author: Jerry Hansen
publishDate: 2026-08-17
updatedDate: 2026-08-17
---

The obvious version of css-is-awesome was a component library. Ship `<Dialog>`, ship `<Combobox>`, ship a `<DataTable>`, publish to npm, and let people install their way to an accessible UI.

I got about as far as sketching the package layout before the arithmetic stopped working.

A component library is a promise to keep up. Keep up with React's next rendering model. Keep up with Vue and Svelte if you want them, or tell those users they aren't invited. Keep up with the props that consumers wedge into your API because the one thing they needed wasn't exposed. The library's real product isn't the components — it's the maintenance you're agreeing to do forever, on someone else's release schedule.

cia is one person. The honest read was that a 50-component library would be stale in a year and I'd spend that year on version bumps instead of CSS.

So the v1.0 headline deliverable became a book of recipes. Commit [`d20c098`](https://github.com/Jerry2d3d/css-is-awesome) landed the schema, the authoring guide, and the first one — `dialog`.

## What a recipe actually is

A recipe is a single markdown file at `scss/recipes/<slug>.md`. It carries five required sections in a fixed order, documented in [`scss/recipes/README.md`](https://github.com/Jerry2d3d/css-is-awesome/blob/main/scss/recipes/README.md):

```markdown
## Use this when
## Structure (raw HTML)
## Styling (cia mixins)
## Interactivity
## A11y checklist
## Framework examples
```

Plus optional `Variants`, `Pitfalls`, and `Related recipes`. The order is fixed on purpose — both a reader and a parser should be able to jump straight to the a11y checklist without hunting.

**Structure comes first, and native elements come before ARIA.** The dialog recipe doesn't hand you a div with `role="dialog"` and a focus-trap dependency:

```html
<dialog data-cia-recipe="dialog" aria-labelledby="my-dialog-title">
  <header data-slot="header">
    <h2 id="my-dialog-title">Dialog title</h2>
    <button data-slot="close" aria-label="Close" formmethod="dialog">×</button>
  </header>
  <main data-slot="body">…</main>
  <footer data-slot="footer">
    <button data-slot="cancel" formmethod="dialog">Cancel</button>
    <button data-slot="confirm" autofocus>Confirm</button>
  </footer>
</dialog>
```

`.showModal()` gives you the top layer, the focus trap, `aria-modal`, Esc-to-close, focus return on close, and a `::backdrop` to style. No shim. The combobox recipe does the same thing one level down: the native variant is `<input list>` + `<datalist>`, where the browser owns filtering, keyboard navigation, and screen-reader announcements, and the ARIA `role="combobox"` build is presented as the upgrade you take *only* when you need styled options or async loading.

**Then the styling section, which is the part cia actually owns:**

```scss
@use 'css-is-awesome' as cia;

.my-dialog {
  @include cia.modal;

  [data-slot="header"]  { @include cia.toolbar; }
  [data-slot="body"]    { @include cia.stack($gap: 4); }
  [data-slot="close"]   { @include cia.btn(ghost); margin-inline-start: auto; }
  [data-slot="confirm"] { @include cia.btn(primary); }
}
```

Note `.my-dialog`, not `.cia-dialog`. The schema forbids `cia-` prefixes in recipe examples — that namespace belongs to the library, and the whole point is that the selector is yours.

**Then the a11y checklist**, which is the section I'd defend hardest. Every item is testable and cites the WCAG 2.2 success criterion or the ARIA Authoring Practices pattern it satisfies. From `dialog.md`:

```markdown
- [ ] `aria-labelledby` points to the title element (WAI-ARIA APG: Dialog (Modal))
- [ ] Background content has `inert` when the dialog is open
- [ ] Focus returns to the trigger element on close
- [ ] Color contrast on `::backdrop` does not interfere with the dialog's
      own contrast budget (WCAG 2.2 SC 1.4.11 Non-text Contrast)
```

That's the homework a component library normally does behind the curtain, written out where you can audit it — and where you can tell whether your hand-rolled version still passes after you've edited it.

## One file, two audiences

The recipes live in `scss/recipes/` rather than in the website's content folder, and that placement is load-bearing. They ship inside the npm package.

Humans read them at `/docs/recipes/<slug>`. Commit [`128bb7b`](https://github.com/Jerry2d3d/css-is-awesome) added the dynamic route: [`src/lib/recipes.ts`](https://github.com/Jerry2d3d/css-is-awesome/blob/main/src/lib/recipes.ts) reads the markdown at build time inside a Server Component and renders it with `marked`. The parser never reaches the browser. Adding a recipe file adds a page — no route edits.

AI agents read the same bytes over MCP. `mcp/server.cjs` registers `list_recipes` and `get_recipe`, and `assemble_prompt({ intent: "recipe:dialog" })` bundles the recipe with the signatures of every `cia.X` mixin it calls. An agent generating your dialog gets the markup, the mixin calls, and the a11y checklist in one payload.

Two surfaces, one source of truth, zero duplication. If the checklist is wrong, it's wrong in exactly one place.

## The folder trap

`scss/recipes/` holds two different kinds of file, and the naming is the only thing telling them apart:

- `<slug>.md` — a **pattern to read**. `dialog.md`, `combobox.md`, `print-to-pdf.md`. You do not import these. You read them and build the thing.
- `_<slug>.scss` — **real opt-in SCSS**. `_bare-tags.scss` is the one shipped today, and it's a genuine `@use`:

```scss
@use 'css-is-awesome/scss/recipes/bare-tags';
```

That one line styles bare `<h1>`, `<button>`, `<table>`, `<dialog>` and friends at zero specificity via `:where()`, so any selector you write beats it. It's Pico-style drop-in behavior, off by default.

People conflate the two constantly. Even the MCP server had to grow a `kind` field — `"md"` versus `"scss"` — so agents stop trying to `@use` a markdown file. If you take one thing from this post: markdown recipes are prose, SCSS recipes are code.

## What this costs you

The trade is real, so here it is without softening.

**You get less out of the box.** A recipe is not an install. You read it, you write the component, you own the result. That's an afternoon where shadcn or Radix would have been ten minutes.

**A recipe cannot ship you a bug fix.** This is the sharpest edge. If a browser changes `<dialog>` focus behavior next year and I fix the recipe, your app doesn't get the fix. There's no `npm update` that reaches into your codebase. A dependency can do that; a document cannot. If your team's realistic maintenance budget for hand-written UI code is zero, a component library is the correct choice and I'd rather you use one.

**Framework examples drift.** Each recipe ships runnable React, Vue, Svelte, and vanilla Web Component code. I test React hardest. That's an honest confession, and it's why [EPIC-01](https://github.com/Jerry2d3d/css-is-awesome/blob/main/roadmap/epics/v1-0/EPIC-01-recipes-book.md) still has an unbuilt `validate-recipes` script sitting in it.

What you get in exchange: markup you own, working in any framework, with the accessibility research already done and cited. Nothing to upgrade. Nothing to fight when your design needs the one prop nobody exposed.

## Where the book stands

Three recipes ship today: **dialog**, **combobox**, and **print-to-pdf**. `datepicker`, `data-table`, and `command-palette` are scoped in EPIC-01 and not written yet — the epic audit says 2 of 5 planned recipes plus one bonus, and I'd rather post that number than round it up.

Three recipes is a thin book. It's also three patterns that didn't exist as a maintained dependency you'd have to live with.
