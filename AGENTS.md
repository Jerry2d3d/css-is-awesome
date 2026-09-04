# AGENTS.md — css-is-awesome

This file is the entry point for AI coding agents (Aider, Codex, Cursor, Claude Code, Gemini, Copilot, etc.) working in or with css-is-awesome.

## What this library is

A token-driven SCSS design system with a **single mixin-router per component**. **Mixin-first since v0.8** — the mixin is the API; the class/tag/selector is the consumer's choice. The npm package ships **zero JavaScript** by hard rule.

**Every mixin is a knob-board.** Each look/feel dimension is an *input*, so a consumer can restyle any mixin at any time by changing an argument — row→column is just `@include cia.flex($direction: column)`, never a hand-written `flex-direction`. Customization lives in the mixin's arguments; the consumer stays one line. **If a visual dimension can only be reached by overriding in CSS, that's a missing input — add it to the mixin.** Fewer SCSS lines always wins.

**v1.0 architecture (locked 2026-05-23):** humans-first, AI-second. The 5-pillar priority is **(1) users first, (2) tokens, (3) theme editor on the website, (4) mixin-first speed, (5) AI as composer via recipes book + MCP server**. v1.0 shipped the recipes book + theme editor polish + Tailwind/Bootstrap migration CLI + playground + MCP polish. No separate React component library (Jerry's call — recipes are the deliverable). Full backlog: [`roadmap/epics/v1-0/`](./roadmap/epics/v1-0/).

Three authoring tiers, in primary-to-fallback order:

- **Tier 2 (primary)** — per component: `@use 'css-is-awesome/api' as cia;` then `.your-class { @include cia.btn(primary); }`. The `/api` barrel is zero-emit (safe inside a `.module.scss`); the root bundle emits the tokens once. SCSS build required.
- **Tier 1 (opt-in)** — drop-in CSS classes (`.cia-btn`). Default-off in Sass path; opt in via `@use cia with ($utilities: true)`. Pre-built CDN bundles still ship every utility.
- **Tier 3 (opt-in Pico-mode)** — `@use 'css-is-awesome/scss/recipes/bare-tags';` one line styles every common HTML element. Wrapped in `:where()` (specificity 0,0,0) so consumer styles always win.

## Quick decisions for an AI agent

When asked to add a UI element, follow this order:

1. **Mixin-first, inputs-first.** `.your-class { @include cia.btn(primary); }` — write your own selector, `@include` the mixin. Need a variation? **Pass it as an input** — `@include cia.flex($direction: column)`, `@include cia.card-base($shadow: 2, $r: xl)` — never hand-write the CSS an input already controls. Fewer SCSS lines always wins. This is the v0.8 primary API.
2. **Match the project's tier.** If they're already on Tier 1 classes (`<button class="cia-btn">`), stay there.
3. **Never invent `cia-*` class names.** That prefix is library-owned. Consumer code uses its own naming.
4. **All values come from tokens.** Never hardcode `#3A5FCD`, `1rem`, `8px`. Use `cia.color(primary)`, `cia.space(4)`, `cia.radius(md)`.
5. **No BEM.** No `__element` / `--modifier` chains. `cia-` is a single-class namespace prefix, not BEM.
6. **No JavaScript.** Cia ships zero JS in the npm package. The 6 interactive components (accordion, modal, tooltip, dropdown, tabs, copy-button) use native HTML primitives — `<details name>`, `<dialog>`, `[popover]`, radio + `:has()`. Mobile navigation follows the same doctrine: the `hamburger` / `drawer` / `sheet` / `dock` mixin family rides `[popover]` + CSS Grid — see the `mobile-nav` recipe (hamburger + drawer) and the `bottom-nav` recipe (dock + sheets). **This rule binds cia, not you.** If you're *consuming* cia (building an app/component library on top of it), write JavaScript/framework components freely — React, SVG charts, interactivity, all of it — and use cia purely for styling (mixins + tokens). Compose the mixins to build any visual you want; you are not limited to cia's pre-made component mixins.
7. **Pages stack by named grid areas — the layout mixins own the shell.** Every page's structure is declared once as `grid-template-areas` (`"navbar" "hero" … "footer"`), and each section claims its slot with `grid-area`. Never hand-write that: use `cia.page-layout(default | sidebar-left | sidebar-right | holy-grail)` for a full viewport shell (100dvh, sticky footer, auto mobile collapse), `cia.layout((sidebar content toc), $tracks: …)` for custom rows of regions, and `cia.page-header` / `cia.page-main` / `cia.page-footer` / `cia.area(name)` for the children. Named areas are the single source of truth for stacking — mobile is just a different `grid-template-areas`, not a pile of margin overrides. Baseline since 2020.
8. **On phones, things take the space they're in.** Below the mobile breakpoint an interactive surface fills its *container* — 100% of the column it lives in, inside the page's existing padding and formatting (never edge-to-edge past the page's gutters, never a floating mid-width popup). Triggers stretch to 100% with `justify-content: space-between` (label left, affordance right). A top-layer popover menu can't size to its container directly, so match its trigger via CSS anchor positioning (`anchor-name` on the trigger; `inset-inline: anchor(start) anchor(end)` under `@supports (anchor-name: --a)`) — opening directly under the trigger, with `position-try-fallbacks: flip-block` so it flips above when it would run off the bottom of the screen — with viewport-minus-gutters as the no-anchor fallback — and set it at `&[popover]` specificity, since the dropdown mixin's `inset: unset` reset otherwise wins. `cia.sheet`, `cia.drawer($side: top|bottom)` and `cia.dock` already obey the rule.
9. **Style semantic state off ARIA, not a parallel `data-*`.** When a state has an ARIA source of truth, hook your styles to *that* attribute: `[aria-selected="true"]`, `[aria-expanded="true"]`, `[aria-invalid="true"]`, `:disabled, [aria-disabled="true"]`, `[aria-pressed="true"]`, `[aria-checked="true"]`, `[aria-current]`, `[role="tab"]`. Then the state can't be styled without setting the ARIA a screen reader needs — **accessible-by-construction**, one source of truth for looks + a11y. Reserve `data-*` for **cosmetic-only** variants (`data-size`, `data-variant`, `data-color`) that carry no ARIA meaning. cia's own components already do this where native HTML doesn't cover it (`[aria-current="page"]`, `[aria-selected="true"]`, `[role="option"]`).

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

## Tier 2 example (the v0.8 primary path)

```scss
@use 'css-is-awesome/api' as cia;   // zero-emit authoring barrel — safe in a .module.scss

.hero-cta     { @include cia.btn(primary); }
.product-card { @include cia.card-base($shadow: 2); }
.faq-item     { @include cia.accordion; }
.confirm-dlg  { @include cia.modal; }
```

```html
<a class="hero-cta" href="/buy">Buy now</a>
<article class="product-card">…</article>
<details name="faq" class="faq-item"><summary>Q?</summary><div>A.</div></details>
<dialog class="confirm-dlg">…</dialog>
```

The cia barrel re-exports every mixin: layout, typography, color, motion, helpers, plus every component. One `@use 'css-is-awesome/api'` gives you the whole API — and it emits **zero CSS** until you call a mixin, so it is safe inside a `.module.scss` under Next.js CSS Modules pure mode.

**Two imports, two jobs.** Keep tokens and mixins in separate places:

- **Root / global** (once) — emit the tokens: `<link>` a theme CSS file, or `@use 'css-is-awesome';` in your global stylesheet. This prints `:root { --… }`.
- **Each component** (`Card.module.scss`) — `@use 'css-is-awesome/api' as cia;` and only call mixins. **Never** `@use 'css-is-awesome'` (the bundle) from a component file — it re-emits `:root`, which CSS Modules pure mode rejects.

**Next.js / Turbopack.** The forwarding barrel **works** under Turbopack. The Boiler showcase runs Next 16.1.1 on Turbopack for both `dev` and `build` and imports `css-is-awesome/scss/api` in all 116 of its stylesheets. Do **not** steer consumers to the leaf module — `scss/mixins` exposes only the ~42 core mixins and none of `btn`, `card-base`, `stack`, `grid` or `animate`, so it forces hand-inlined CSS.

Two real setup notes:

1. Sass doesn't read package.json `exports`, so add `node_modules` to `sassOptions.loadPaths`.
2. **If you hit `Two forwarded modules both define a mixin named stack`, drop your own styles directory from `loadPaths`.** Provenance matters here: that was reported by one consumer, and it is **not** reproducible in standard Sass. cia's internal forwards are all `./`-relative, which Sass resolves against the importing file without consulting load paths — `validate-package` asserts the barrel compiles even with a hostile `styles/_mixins.scss` ahead of `node_modules`. Treat it as a bundler-resolver deviation, not a Sass rule, and don't repeat it as one.

The two-import split (tokens at root, mixins per component) applies on every toolchain.

## Theme system (1 file per theme, drop-in by default)

Every theme emits **two selectors at once**:

```css
:root, :root[data-theme="<name>"] { … }
```

The bare `:root` is the product promise: drop one theme file in as your `theme.css` and the page restyles with **no markup change**. The `[data-theme]` half is what lets several themes coexist in one document. Which half you rely on depends on how you ship:

- **One theme file on its own** — `<html data-theme="…">` is **optional**. Link the file and you're done. (Setting it anyway is harmless and still correct.)
- **The multi-theme bundle** `public/theme.css` (all 24 blocks in one file) — `<html data-theme="…">` is **required**. Every block would collide on a shared `:root`, so the bundle is built with `$standalone: false`, which drops the bare `:root` and leaves only the attribute selector.

This is a fixed rule now because it used to be three rules: the shipped themes disagreed three ways — 9 emitted `:root[data-theme=x]`, 7 emitted `[data-theme=x]`, and 5 emitted a bare `:root`. Only the last group actually worked when dropped in alone. **Never hand-write a theme's selector — call `cia.theme()` and let it emit both halves.**

Library defaults (spacing scale, z-layers, font sizes) are emitted under **`:where(:root)`**, specificity (0,0,0), so any theme declaration outranks them regardless of load order. Deliberately `:where()` and **not** `@layer` — cia is unlayered by decision and that rule stands.

**24 themes, 8 families.** Each family ships three files: the family name itself (e.g. `sketchbook`), plus explicit `-light` and `-dark` siblings. The unsuffixed parent carries **both** modes in one file via `light-dark()`, so the browser auto-swaps on OS `prefers-color-scheme`; the suffixed siblings pin one mode with `color-scheme: light` / `dark` for consumers who want a fixed brand. The eight families are boilerplate, sketchbook, press, prism, cupertino, glass, graphite, terminal. **`terminal` is the one asymmetry** — its unsuffixed file is dark-only (sacred VT100 phosphor), so `terminal` and `terminal-light` are different brands rather than two modes of one.

So: `scss/themes/` has **24** `.scss` sources, `public/themes/` builds **24** directories each holding a `theme.css`, and MCP `list_themes` reports **24**. When you need one number, say **24 themes across 8 families**. All pass the WCAG 2.2 AA contrast audit by default.

```html
<!-- Single file: data-theme is OPTIONAL -->
<link rel="stylesheet" href="node_modules/css-is-awesome/public/themes/boilerplate/theme.css">

<!-- The all-in-one bundle: data-theme is REQUIRED -->
<link rel="stylesheet" href="node_modules/css-is-awesome/public/theme.css">
<html data-theme="boilerplate"> <!-- any of the 24 theme names -->
```

### Themes are open — edit or create your own

**Consumers can edit any shipped theme and make brand-new themes.** Themes are data, not internal magic. Three ways:

1. **Edit a shipped theme in place** — open `scss/themes/<name>.scss`, change tokens, run `npm run build:css:themes`.
2. **Copy + rename** — `cp scss/themes/boilerplate.scss scss/themes/mybrand.scss`, edit, build, validate, ship. Set `<html data-theme="mybrand">` (or just serve the file as your `theme.css` and skip the attribute).
3. **Override at consumer level** — `:root[data-theme="boilerplate"] { --action-primary-default: #ff0066; }` in your own SCSS. No fork needed.

> **`public/themes/**/theme.css` and `public/theme.css` are GENERATED. Never hand-edit them.** `npm run build:css:themes` builds every theme *and* regenerates the bundle, and it is part of `npm run build:css:all`. `npm run check:theme-drift` rebuilds into a scratch copy and fails if the committed artifacts don't match the SCSS sources — CI runs it *before* `validate-themes`, because `validate-themes` reads the committed CSS and would otherwise happily green-light a stale artifact. Edit `scss/themes/<name>.scss`, then rebuild.

Authoring template (in your own project — a theme file is a global stylesheet, so it may emit `:root`):
```scss
// your-project/themes/midnight.scss
@use 'css-is-awesome/api' as cia;

// @mixin theme($name, $scheme: light dark, $standalone: true)
@include cia.theme('midnight') {
  --background-default: light-dark(#f5f5f7, #0a0a0e);
  --text-primary:       light-dark(#0a0a0e, #f5f5f7);
  --action-primary-default: light-dark(#3A5FCD, #60a5fa);
  @include cia.states(action-primary);  // derives hover/active

  /* Spacing is themeable — declare the NUMBERED scale, it is contract-required */
  --space-0: 0; --space-1: 0.25rem; --space-2: 0.5rem; /* … through --space-9 */

  /* ... ~120 more tokens — see scripts/theme-contract.json for the full slot list */
}
```

`$standalone` defaults to `true` (emit `:root, :root[data-theme="<name>"]`). Pass `$standalone: false` only when your block is going into a multi-theme bundle where the bare `:root` would collide.

The validator (`node scripts/theme-validator.js`) enforces the token contract — **127 required + 36 optional = 163 slots** — plus WCAG 2.2 AA contrast (**22 audited pairs per theme**, including five `--code-*` pairs). Themes that miss required tokens or fail contrast cannot ship without `--allow-a11y-fail`.

### Theming spacing (new — read this before you set a size token)

A theme must declare the **numbered** scale `--space-0` … `--space-9`. Those ten are contract-required. The six t-shirt names (`--space-2xs/xs/sm/md/lg/xl`) are **optional**, and the library emits them as `var()` references — `--space-md: var(--space-4)` — so setting a numbered step moves its alias with it.

Why it matters: components call `cia.space(4)`, which resolves to `var(--space-4)`. The t-shirt names used to emit as *independent literals*, so a theme that only set `--space-md` changed a variable nothing read. Swapping a theme repainted colors but never re-proportioned the page. **Set the numbered step; don't set only an alias.**

### Radius tokens: use the per-component knobs

`--radius-avatar`, `--radius-badge`, `--radius-button`, `--radius-card`, `--radius-input` and `--radius-modal` were removed from the contract — nothing ever read them, so any advice to "set `--radius-button`" was advice that could not work. The knobs that *do* work are `--btn-radius`, `--card-radius`, `--input-radius`, `--modal-radius`, `--badge-radius`, `--tag-radius` (all optional), and they cascade from the generic radii: `--btn-radius: var(--radius-md, 0.25rem)`. Set `--radius-md` to move everything; set `--btn-radius` to move just buttons.

**Paired themes (two brands by mode)** — no JS, no mixin:
```html
<link rel="stylesheet" href="/themes/sketchbook.css" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="/themes/terminal.css"   media="(prefers-color-scheme: dark)">
```

Two `<link media>` themes still work under the new selector model: a stylesheet whose `media` doesn't match is loaded but never applied, so only the matching file's `:root` block lands.

Validator: `node scripts/theme-validator.js path/to/theme.css` (or `--all` for every shipped theme). Every theme must declare every required contract token (127 required in v1; missing tokens always fail). The audit also runs a WCAG 2.2 AA contrast check over 22 pairs; **a11y FAILs are fatal by default** as of v0.7. Pass `--allow-a11y-fail` to downgrade contrast failures to a report-only warning (the older `--strict` flag is accepted as a no-op alias). `--border-default` is treated as decorative per WCAG 2.2 SC 1.4.11 and reports as info, not FAIL.

### Theme init (Next.js / SSR consumers)

This section only applies when you ship **more than one theme** (the bundle, or a runtime theme switcher). If you ship a single theme file, its bare `:root` already styles the first paint and there is nothing to set — skip the snippet.

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
@use 'css-is-awesome/scss/icons' as i;      // the icon pack imports on its own

@include i.svg(check);                       // tinted via currentColor
@include i.svg-text(arrow-right, $position: after);
```

> Icons are also on the main barrel under the `icon-` prefix (`cia.icon-svg(check)`) if you prefer a single `@use 'css-is-awesome/api'`.

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
@include i.svg(flag);   // tinted via currentColor — works immediately
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

### ⚠️ `fa-*` is bring-your-own-font — prefer the SVG pack

`fa`, `fa-icon`, `fa-text` and `fa-spin` exist for teams already on Font
Awesome. They map a name through `$icon-fa-map` (55 entries) to a
codepoint and set the FA font family — nothing more:

```css
.a { font-family: "Font Awesome 6 Free"; font-weight: 900; content: "\f00c"; }
```

**cia ships no Font Awesome files** (its licence is not ours to vendor).
`$theme-fa-path` defaults to `/webfonts`, a directory that does **not**
exist in the package, and `fa-load` is never called by cia. So `fa-*`
compiles to valid CSS and renders as a **tofu box** until the consumer
supplies the woff2 files, points `$theme-fa-path` at them, and calls
`@include i.fa-load;` once at the root.

Missing font files do not error. **Default to `svg()` unless the user has
explicitly told you they use Font Awesome** — the SVG pack is
self-contained and needs no setup.

## Where to read deeper

Live docs site: **https://jerry2d3d.github.io/css-is-awesome/** — mixin reference, recipes, theme authoring, MCP setup.

Inside this package (all whitelisted in `files`):

- **`css-is-awesome.instructions.md`** — full authoring rules (~14 KB, Cursor/Copilot pick up via `applyTo: "**"` frontmatter)
- **`README.md`** — install, scripts, links
- **`THREE-TIERS.md`** — full tier explanation with examples
- **`THEMING.md`** — theme contract and dark-mode pattern
- **`CONTRACT.md`** — the token contract (every theme must declare every slot)
- **`CHANGELOG.md`** — version history

## Common gotchas for AI agents

- **Don't write BEM.** No `cia-card__title--large`. The library is anti-BEM by design.
- **Don't hardcode breakpoints.** Use `cia.media(md)` (or `cia.media-down`, `cia.media-between`). Numbers come from the contract.
- **Don't hand-edit `public/themes/**/theme.css` or `public/theme.css`.** They are build artifacts of `scss/themes/*.scss`. Edit the SCSS, run `npm run build:css:themes`, and `npm run check:theme-drift` to prove source and artifact agree.
- **Don't hand-write a theme's selector.** `@include cia.theme(name)` emits `:root, :root[data-theme="name"]` — both halves, on purpose. Writing `[data-theme=x]` yourself breaks the single-file drop-in; writing a bare `:root` yourself breaks the bundle.
- **Theme the numbered spacing scale, not the t-shirt aliases.** `--space-0`…`--space-9` are contract-required; `--space-md` and friends are optional `var()` aliases that follow them.
- **Print/PDF is a pure-CSS layer.** Include `cia.print-base` once at the stylesheet ROOT (it emits `@page`), then `cia.print-hidden` to drop chrome and `cia.print-only` to reveal paper-only content. Read `--is-print` (`0` screen / `1` paper) for custom effects. cia ships **zero JS** for it — the browser's native Print → Save as PDF is the generator.
- **Do NOT "clean up" the `!important` in the print mixins.** It is load-bearing and deliberate. `@media` contributes no specificity, so `print-hidden` carries only the specificity of the selector it is included in; a later equal-specificity `display` (usually a utility class or a component library) wins in print. Verified in a browser: with `!important` the element hides, without it it prints anyway — a silent, paper-only failure. **`@layer` does not fix this** — layered CSS always loses to unlayered CSS, so a layered print rule loses to any unlayered consumer stylesheet, and `!important` inverts layer order on top of that. cia is unlayered by decision (`.agent/decisions/decided/04-at-layer-decision.md`). Scope is 8 declarations, all inside `@media print`, all variable-driven via `--print-hide` / `--print-show`.
- **Don't ship JavaScript.** The npm package has zero `.js`/`.mjs` files. JS-dependent features ship as separate add-on packages.
- **Variants are arguments, not classes.** `cia.btn(primary)`, not `cia-btn cia-btn-primary` (Tier 1 utilities are an exception, but only at consumer level).
- **The `cia-*` prefix is library-owned.** Consumer code should use its own naming for new classes.
- **`scss/_app-styles.scss` is NOT part of the library entry.** It's a template for project-owned styles in a consuming boilerplate. Don't `@use` it from library code.
- **v0.8 mixin renames** — `cia.bp`→`cia.media`, `cia.cq`→`cia.contain`, `cia.color-raw`→`cia.color-static`, `cia.inset`→`cia.pad`, `cia.squish`→`cia.pad-asym`, `cia.font-load`→`cia.font-face`. Old names error with "undefined mixin." No aliases.

## MCP server (SHIPPED — use it)

cia ships a Model Context Protocol stdio server (JSON-RPC over stdio, `serverInfo` name `css-is-awesome` (version read from package.json), protocol `2024-11-05`) at `mcp/server.cjs`, exposed as the `css-is-awesome-mcp` bin. It's in the `files` manifest, so it lands in every consumer's `node_modules`. **Prefer querying it over guessing** — it returns cia's real mixin signatures, tokens, themes, and recipes.

Wire it into your MCP client's `.mcp.json`:

```json
{
  "mcpServers": {
    "css-is-awesome": {
      "command": "node",
      "args": ["node_modules/css-is-awesome/mcp/server.cjs"]
    }
  }
}
```

The SDK is an optional peer dep — `npm install -D @modelcontextprotocol/sdk zod` in the client project to run it. It exposes **30 tools** across 8 families:

- **Themes** — `list_themes`, `get_theme`, `search_themes`
- **Mixins** — `list_mixins`, `get_mixin`, `search_mixins` (real signatures — don't guess)
- **Functions** — `list_functions`, `get_function`, `search_functions`
- **Tokens** — `list_tokens`, `get_token`, `search_tokens` (127 required + 36 optional contract tokens)
- **Animations** — `list_animations`, `get_animation`
- **Components** — `list_components`, `get_component`, `search_components`
- **Recipes** — `list_recipes`, `get_recipe`
- **Doc readers** — `read_llm_txt`, `read_changelog`, `read_migration`, `read_theming`, `read_agents`, `read_contract`, `read_three_tiers`, `read_readme`, `read_versioning`
- **Helpers** — `assemble_prompt` (bundle context), `resolve_size` (snap a design px value to cia's 4px grid — call this whenever a design tool hands you a raw px value)

## Other tooling (shipped)

- **`cia` CLI** — ships as `bin/cia.cjs`, exposed as the `cia` bin. The migration
  on-ramp is live: `npx cia migrate tailwind [path]` and `npx cia migrate bootstrap [path]`
  parse another system's config and dump a cia theme. Run either with `--help` for
  full options. (`cia init` / `cia add` remain post-1.0.)
- **JSON token export** — DTCG-format token list in `figma-tokens/`.
- **`llm.txt`** — at the repo root and served from the docs site; single-fetch
  summary for any AI agent. Also readable over MCP via `read_llm_txt`.

The markdown files above, the `cia` CLI, and the MCP server are the source of truth.

---

If you're a human reading this and want full developer docs, start at `README.md` or the docs site: https://jerry2d3d.github.io/css-is-awesome/.
