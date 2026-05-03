# AGENTS.md — css-is-awesome

This file is the entry point for AI coding agents (Aider, Codex, Cursor, Claude Code, Gemini, Copilot, etc.) working in or with css-is-awesome.

## What this library is

A token-driven SCSS design system with a **single mixin-router per component**. One source of truth, three authoring tiers:

- **Tier 1** — drop-in CSS classes (`.cia-btn-primary`). No build.
- **Tier 2** — author your own class names, `@include` mixins for variants. SCSS build required.
- **Tier 3** — bare-tag recipe. Zero classes, every common HTML element is styled.

All three resolve to the same compiled output. Pick the lowest tier that works.

## Quick decisions for an AI agent

When asked to add a UI element, follow this order:

1. **Is the user already on Tier 1, 2, or 3?** Match the existing tier in the project.
2. **Use a mixin if you need a custom variant.** `@include b.btn(primary, $r: full)` not `<button class="cia-btn-primary cia-rounded-full">`.
3. **Never invent class names.** `cia-*` utilities exist for tokens (spacing, color, layout). Don't extend the `cia-` namespace; that's library-only.
4. **All values come from tokens.** Never hardcode `#3A5FCD`, `1rem`, `8px`. Use `m.color(primary)`, `m.space(4)`, `m.radius(md)`.
5. **One class per element on Tier 1.** No BEM. No `__element` / `--modifier` chains.

## Install

```bash
npm install css-is-awesome
# Tier 2 also wants:
npm install -D sass
```

For SCSS imports through Sass:
```bash
sass app.scss app.css --load-path=node_modules
```
Or with the modern package importer:
```bash
sass app.scss app.css --pkg-importer=node
# Then prefix imports: @use 'pkg:css-is-awesome/scss/...'
```

## Tier 2 example (the most common request)

```scss
@use 'css-is-awesome/scss/components/buttons' as b;
@use 'css-is-awesome/scss/components/data'    as d;
@use 'css-is-awesome/scss/mixins'              as m;

.hero-cta    { @include b.btn(primary, $r: full); @include m.elevation(2); }
.product-card{ @include d.card-base($shadow: 2); }
```

```html
<a class="hero-cta" href="/buy">Buy now</a>
<article class="product-card">…</article>
```

## Theme system (1 file)

A theme is a single CSS file declaring custom properties at `:root`. Replace `theme.css` to reskin the entire site. Themes shipped: sketchbook (css-is-awesome's brand), press, graphite, glass, cupertino, terminal, prism-light + prism-dark.

```html
<link rel="stylesheet" href="node_modules/css-is-awesome/dist/css-is-awesome.min.css">
<link rel="stylesheet" href="node_modules/css-is-awesome/public/theme.css">
<html data-theme="prism-light"> <!-- swap to any theme name -->
```

Validator: `node scripts/theme-validator.js path/to/theme.css`. Every theme must declare every contract token; the validator fails CI if not.

### Theme init (Next.js / SSR consumers)

Setting `data-theme` in a `useEffect` causes a flash-of-default-theme before hydration. Use the inline-script helper to set the attribute synchronously on first paint:

```tsx
// app/layout.tsx (Next.js App Router)
import { getThemeInitScript } from "css-is-awesome/theme-init";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getThemeInitScript({
          defaultTheme: "prism-light",
          darkTheme: "prism-dark",
          storageKey: "app-theme",
        }) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is required — the inline script mutates the DOM before React hydrates, so React would otherwise warn about a server/client mismatch on `data-theme`.

## Where to read deeper

Inside this package (all whitelisted in `files`):

- **`css-is-awesome.instructions.md`** — full authoring rules (~14 KB, Cursor/Copilot pick up via `applyTo: "**"` frontmatter)
- **`README.md`** — install, scripts, links
- **`THREE-TIERS.md`** — full tier explanation with examples
- **`THEMING.md`** — theme contract and dark-mode pattern
- **`CONTRACT.md`** — the token contract (every theme must declare every slot)
- **`CHANGELOG.md`** — version history

## Common gotchas for AI agents

- **Don't write BEM.** No `cia-card__title--large`. The library is anti-BEM by design.
- **Don't hardcode breakpoints.** Use `m.media(md)`. Numbers come from the contract.
- **Variants are arguments, not classes.** `btn(primary)`, not `cia-btn cia-btn-primary` (Tier 1 utilities are an exception, but only at consumer level).
- **The `cia-*` prefix is library-owned.** Consumer code should use its own naming for new classes.
- **`scss/_app-styles.scss` is NOT part of the library entry.** It's a template for project-owned styles in a consuming boilerplate. Don't `@use` it from library code.

## Tooling around the library (planned)

- **MCP server** (`@css-is-awesome/mcp`, post-1.0) — programmatic introspection of tokens, mixins, components.
- **`cia` CLI** (post-1.0) — `cia init`, `cia add button`, `cia theme new`, `cia theme validate`.
- **JSON token export** at a stable URL — DTCG-format token list.
- **`llm.txt`** at the docs site root — single-fetch summary for any AI agent.

When those ship, this file will link them. Until then, the markdown files above are the source of truth.

---

If you're a human reading this and want full developer docs, start at `README.md`.
