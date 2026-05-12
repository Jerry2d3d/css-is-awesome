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

A theme is a single CSS file declaring custom properties at `:root`. Replace `theme.css` to reskin the entire site. Themes shipped (each light + dark unless noted): sketchbook (css-is-awesome's brand), press, graphite, glass, cupertino, terminal, prism, plus the unbranded `boilerplate` starter — 8 families, 16 blocks total. All 16 shipped blocks pass the WCAG 2.2 AA contrast audit by default.

```html
<link rel="stylesheet" href="node_modules/css-is-awesome/dist/css-is-awesome.min.css">
<link rel="stylesheet" href="node_modules/css-is-awesome/public/theme.css">
<html data-theme="prism-light"> <!-- swap to any theme name -->
```

Validator: `node scripts/theme-validator.js path/to/theme.css` (or `--all` for every shipped theme). Every theme must declare every contract token (123 slots in v1; missing tokens always fail). The audit also runs a WCAG 2.2 AA contrast check; **a11y FAILs are fatal by default** as of v0.7. Pass `--allow-a11y-fail` to downgrade contrast failures to a report-only warning (the older `--strict` flag is accepted as a no-op alias). `--border-default` is treated as decorative per WCAG 2.2 SC 1.4.11 and reports as info, not FAIL.

### Theme init (Next.js / SSR consumers)

Setting `data-theme` in a `useEffect` causes a flash-of-default-theme before hydration. The fix is an inline `<script>` in `<head>` that runs synchronously before paint and sets the attribute from storage or system preference. css-is-awesome is a styling-only package, so there is no helper to import — paste the snippet directly into your layout:

```tsx
// app/layout.tsx (Next.js App Router) — paste this <script> in <head>
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('cia-theme');
if(s){document.documentElement.setAttribute('data-theme',s);return;}
if(window.matchMedia('(prefers-color-scheme: dark)').matches){
document.documentElement.setAttribute('data-theme','prism-dark');return;}
document.documentElement.setAttribute('data-theme','prism-light');
}catch(e){document.documentElement.setAttribute('data-theme','prism-light');}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`suppressHydrationWarning` on `<html>` is required — the inline script mutates the DOM before React hydrates, so React would otherwise warn about a server/client mismatch on `data-theme`. Adjust the storage key and theme names (`'cia-theme'`, `'prism-light'`, `'prism-dark'`) to match your app.

## Icons (1 pack, override per theme)

The default `core` icon pack ships at `public/icons/core/<name>.svg` —
49 glyphs vendored from Lucide (ISC + MIT, see `LICENSE-third-party`).
Use the existing mixins; the call signatures are unchanged:

```scss
@include m.svg(check);                     // tinted via currentColor
@include m.svg-text(arrow-right, $position: after);
```

Compiled output emits a per-glyph custom property fallback so a theme
can override one icon without rebuilding SCSS:

```css
mask: var(--cia-icon-check, url('/icons/core/check.svg')) center / contain no-repeat;
```

To override `check` for one theme, drop the replacement SVG at
`public/themes/<theme>/icons/core/check.svg` and declare
`--cia-icon-check: url('/themes/<theme>/icons/core/check.svg')` inside
that theme's `:root`/`[data-theme]` block. Resolution order is
**per-theme override → core pack → 404**.

### Adding your own glyph (drop-in)

You don't have to register a new glyph in the contract just to use it.
The `core` pack and any custom pack you create both work as plain
folders — drop an SVG in and call the mixin:

```bash
cp my-flag.svg public/icons/core/flag.svg
```

```scss
@include m.svg(flag);   // tinted via currentColor — works immediately
```

No JSON edit, no `validate-icons` run required. The contract validator
only enforces the canonical 49-glyph `core` set; everything beyond that
is opt-in. Add a glyph to `scripts/icon-contract.json` only when every
pack must declare it.

For new packs (e.g. `editor`, `files`), set `$theme-icon-pack: editor`
in your SCSS and drop SVGs at `public/icons/editor/*.svg` — same
no-registration drop-in pattern.

See [`CONTRACT.md` → Icons contract](./CONTRACT.md#icons-contract) for
the full spec, the canonical 49-glyph list, naming conventions, and
when to bump the contract. Validate the contract pack with
`npm run validate-icons`.

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
- **Don't hardcode breakpoints.** Use `m.bp(md)` (or `m.bp-down`, `m.bp-between`). Numbers come from the contract.
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
