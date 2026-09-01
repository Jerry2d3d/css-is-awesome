# css-is-awesome

> A tiny, mixin-first SCSS design system with one-file theme swap.

[![npm](https://img.shields.io/npm/v/css-is-awesome?logo=npm&color=cb3837)](https://www.npmjs.com/package/css-is-awesome) [![CI](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml/badge.svg)](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml) [![Node](https://img.shields.io/badge/node-%E2%89%A520-43853d?logo=node.js&logoColor=white)](./package.json) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![semantic-release](https://img.shields.io/badge/semantic--release-enabled-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

**Bring your own selectors. We bring the design system.** One CSS file per theme — drop it in and the page restyles, no markup change. 24 themes. Zero JavaScript in the npm package. Six browser-native interactive components. Small enough to read in an afternoon.

**Docs:** [jerry2d3d.github.io/css-is-awesome](https://jerry2d3d.github.io/css-is-awesome/) · **Install:** `npm install css-is-awesome`

> **Shipped in 1.0.0:** a **recipes book** for building any component in any framework using cia mixins — `dialog`, `combobox` and `print-to-pdf` today, with `datepicker`, `data-table` and `command-palette` queued. AI agents read recipes via MCP and generate components in your stack; humans read them at [`/docs/recipes`](https://jerry2d3d.github.io/css-is-awesome/docs/recipes/).

## For AI agents — start here

**Read [`llm.txt`](./llm.txt) first.** One file, the whole system: install path, hard rules, the mixin vocabulary, and the traps that make agents write wrong cia code. It ships in the npm package, so it's at `node_modules/css-is-awesome/llm.txt` in any project that has cia.

**Then connect the MCP server** and stop guessing at signatures. It answers from the real source — 30 tools covering themes, mixins, functions, tokens, recipes and components.

```bash
npm install -D @modelcontextprotocol/sdk zod   # required — npm will NOT install these for you
```

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

The SDK and `zod` are declared as *optional* peer dependencies, so a plain `npm install css-is-awesome` skips them and the server exits with `@modelcontextprotocol/sdk is not installed`. Install both. `npx css-is-awesome-mcp` does **not** work around this — npx fetches the package but not its optional peers.

Why it matters more here than for older frameworks: no model has memorised cia's API the way it has memorised Tailwind's class names. Without `llm.txt` or MCP, an agent will confidently invent a Tailwind-shaped API. With them, it reads the real thing. Details at [`/docs/mcp`](https://jerry2d3d.github.io/css-is-awesome/docs/mcp/).

## Three ways to use it

> Full breakdown in [THREE-TIERS.md](./THREE-TIERS.md). cia is **mixin-first** since v0.8 — utility classes are an opt-in convenience.

### 1. SCSS with mixin API (recommended)

```bash
npm install css-is-awesome
npm install -D sass
```

```scss
@use 'css-is-awesome' as cia;

.checkout-cta { @include cia.btn(primary); }
.faq-item     { @include cia.accordion; }
.modal        { @include cia.modal; }
```

```html
<!-- One theme file: no data-theme attribute required -->
<link rel="stylesheet" href="/cia/themes/boilerplate/theme.css">
```

Author your own class names; the mixin handles the styling. Mixins for buttons, forms, layout, typography, color, motion, plus the six zero-JS components: `accordion`, `modal`, `tooltip`, `dropdown`, `tabs`, `copy-button` — plus print-to-PDF via a pure-CSS `@media print` layer. Full reference at [`/docs/mixins`](https://jerry2d3d.github.io/css-is-awesome/docs/mixins/).

**Two imports, two jobs.** Emit the tokens once from your root/global stylesheet (`@use 'css-is-awesome';` or `<link>` a theme file), then import the **zero-emit authoring barrel** in each component stylesheet:

```scss
// Card.module.scss — emits no :root, safe under Next.js CSS Modules pure mode
@use 'css-is-awesome/api' as cia;

.product-card { @include cia.card-base($shadow: 2); }
```

> **Next.js / Turbopack.** The barrel works under Turbopack — the showcase app runs Next 16 on Turbopack for both `dev` and `build` and imports `css-is-awesome/scss/api` in every stylesheet.
>
> Sass doesn't read package.json `exports`, so add `node_modules` to `sassOptions.loadPaths`.
>
> One reported hazard, stated with its provenance: a consumer whose own styles directory was on `loadPaths` hit `Two forwarded modules both define a mixin named stack`. cia's internal forwards are all `./`-relative, and standard Sass resolves those against the importing file **without** consulting load paths — `validate-package` asserts the barrel survives a hostile `styles/_mixins.scss` ahead of `node_modules`, and it does. So this appears to be a bundler-resolver deviation rather than Sass behaviour. If you hit it, drop your styles directory from `loadPaths`.

### 2. Drop-in CSS (zero build)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/css-is-awesome@1/public/themes/boilerplate/theme.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/css-is-awesome@1/dist/css-is-awesome.min.css">
```

Theme first (sets the tokens), library second. **No `data-theme` attribute needed** — a single theme file styles the page on its own. Swap the URL to swap the theme; the HTML never changes. Bundle tiers — `dist/tokens.css` (2.2 KB gz, `:where(:root)` vars only), `dist/css-is-awesome.core.min.css` (2.4 KB gz, tokens + resets), `dist/css-is-awesome.min.css` (7.3 KB gz, full).

### 3. Bare tags (opt-in Pico-mode)

```scss
@use 'css-is-awesome/scss/recipes/bare-tags';
```

```html
<button>Save</button>
<table>…</table>
<input type="email">
```

One line styles the whole site. Zero classes. Wrapped in `:where()` (specificity `0,0,0`), so any consumer selector — even another bare tag — wins automatically. No `@layer`, no cascade pollution.

## Themes

**One file per theme since v0.8.** Each theme file emits `:root, :root[data-theme="<name>"]`, so **dropping one in restyles the page with no markup change** — the `data-theme` attribute is optional for the single-file case. Set `<html data-theme="...">` only when you load the all-in-one bundle (`public/theme.css`), where every theme shares one file and the attribute is the only thing telling them apart.

**8 families, 24 files.** Each family ships a dual-mode base (`<name>`, both light + dark via native `light-dark()`) plus single-mode `<name>-light` and `<name>-dark` variants for pairing.

| Theme         | Mood                                                          | Modes |
|---------------|---------------------------------------------------------------|-------|
| boilerplate   | Neutral slate + clean blue, system fonts, drop-in starter     | both |
| sketchbook    | Warm washi paper / charcoal at night, sumi ink, indigo accent | both (brand default) |
| press         | Editorial newsprint / night-edition, Playfair serif, press-red | both |
| prism         | Vercel/Linear/Radix aesthetic, refined blue, neutral grays    | both |
| cupertino     | macOS AppKit, SF Pro, system blue, vibrancy blurs             | both |
| glass         | visionOS glassmorphism, iOS indigo, blur asymmetric per mode  | both (Pattern C) |
| graphite      | Brushed silver / machined dark aluminum, SF system stack      | both |
| terminal      | VT100 phosphor green, zero radii, CRT glow                    | dark-only base (`terminal-light` is the daylight companion) |

**Pair two themes per mode** with native `<link media>`:
```html
<link rel="stylesheet" href="/themes/sketchbook-light/theme.css" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="/themes/terminal-dark/theme.css"    media="(prefers-color-scheme: dark)">
```

Newspaper by day, hacker terminal by night. No JS, no mixin — pure browser behavior. Most design systems give you dark mode; cia lets you ship a second brand at night. See [`/docs/themes/pairing`](https://jerry2d3d.github.io/css-is-awesome/docs/themes/pairing/).

Each theme is one file of CSS custom properties. Tokens only — no component rules. See `public/themes/<name>/theme.css` for the compiled output and `scss/themes/<name>.scss` for the sources. Full contract documented in [THEMING.md](./THEMING.md).

The library's own default tokens emit under `:where(:root)` (specificity `0,0,0`), so any theme declaration outranks them regardless of load order. That's `:where()`, not `@layer` — see the print section below for why cia refuses layers.

### Edit a theme or make your own

**You can.** Themes are open files. Edit any token, make brand-new themes, mix and match — cia treats themes as data, not internal magic.

```bash
# 1. Copy an existing theme as a starting point
cp scss/themes/boilerplate.scss scss/themes/midnight.scss

# 2. Edit tokens (see scss/themes/*.scss for the pattern + light-dark() usage)
#    Wrap in @include cia.theme('midnight') { ... }

# 3. Build to public/themes/midnight/theme.css (also regenerates public/theme.css)
npm run build:css:themes

# 4. Validate against the token contract + a11y audit
node scripts/theme-validator.js public/themes/midnight/theme.css

# 5. Use it — just link the file. No data-theme attribute needed.
#    <link rel="stylesheet" href="/themes/midnight/theme.css">
```

Full authoring walkthrough: [`/docs/authoring/themes`](https://jerry2d3d.github.io/css-is-awesome/docs/authoring/themes/). The contract (127 required + 36 optional tokens) is at [`scripts/theme-contract.json`](./scripts/theme-contract.json).

## Token contract

Every theme declares the same slots: **surfaces · ink · lines · primary · seal · accent · code · type · space · radius · shadow · blur · glow · motion**. Components read tokens, themes set tokens, nothing else. 127 required, 36 optional.

**Themes own the spacing scale.** A theme declares the numbered scale `--space-0` … `--space-9` (contract-required), which is exactly what `cia.space(4)` compiles to — so a theme can ship tighter or airier rhythm without touching a component. The six t-shirt names (`--space-2xs/xs/sm/md/lg/xl`) are optional; the library emits them as references (`--space-md: var(--space-4)`), so they track the numbered scale automatically.

Component-shape tokens (`--btn-radius`, `--card-radius`, `--input-radius`, `--modal-radius`, `--badge-radius`, `--tag-radius`) are optional too, and cascade from the generic radii by default — `--btn-radius: var(--radius-md, 0.25rem)`. Set the generic `--radius-*` scale to move everything; set a component token to make one thing an exception.

## Icons (two systems, very different setup costs)

**SVG pack — self-contained, drop-in.** 49 glyphs vendored from Lucide ship at `public/icons/core/<name>.svg`. Nothing to install.

```scss
@use 'css-is-awesome/api' as cia;

.save-btn { @include cia.icon-svg(check); }         // tinted via currentColor
.next     { @include cia.icon-svg-text(arrow-right, $position: after); }
```

**Adding your own glyph is genuinely drop-in — no registration step.** Put `star.svg` in `public/icons/core/` and `cia.icon-svg(star)` works immediately; the name resolves straight to a filename. `npm run validate-icons` checks the 49 contract glyphs are present and does not object to extras.

Every icon emits a per-glyph custom property, so a theme can swap one without touching SCSS:

```css
mask: var(--cia-icon-check, url('/icons/core/check.svg')) center / contain no-repeat;
```

```scss
:root[data-theme='terminal'] { --cia-icon-check: url('/themes/terminal/icons/check.svg'); }
```

Resolution order is **per-theme override → core pack → 404**.

**Font Awesome — bring your own fonts.** `cia.icon-fa()`, `icon-fa-icon()`, `icon-fa-text()` and `icon-fa-spin()` exist for teams already on FA. They map a name through `$icon-fa-map` (55 entries) to a codepoint and set the FA font family:

```css
.a { font-family: "Font Awesome 6 Free"; font-weight: 900; content: "\f00c"; }
```

⚠️ **cia ships no Font Awesome files** — FA has its own licence, so vendoring it would be wrong. The `fa-*` mixins compile to valid CSS but render as tofu until you:

1. supply the `.woff2` files yourself,
2. put them where `$theme-fa-path` points (default `/webfonts` — this directory does **not** exist in the package),
3. call `@include cia.icon-fa-load;` once at your root.

Missing font files don't error, so a silent tofu box is the failure mode. If you only want icons that work out of the box, use the SVG pack.

## Recipes (build components without a component library)

cia ships **no component library** — deliberately. Interactive patterns arrive as *recipes*: portable markdown files at [`scss/recipes/`](./scss/recipes/) that give you the correct HTML, the `cia.X` mixin calls to style it, and an a11y checklist graded against WCAG 2.2 AA. Copy the pattern into your own framework; you own the component, cia owns the styling and the accessibility homework.

**Shipped:** `dialog`, `combobox`, `print-to-pdf`. Queued next: `datepicker`, `data-table`, `command-palette`.

Humans read them at [`/docs/recipes`](https://jerry2d3d.github.io/css-is-awesome/docs/recipes/); AI agents pull them over MCP with `list_recipes` / `get_recipe`.

## Migrating from Tailwind or Bootstrap

The `cia` CLI converts another design system's config into a cia theme, so you start from your existing colors and spacing instead of a blank file:

```bash
npx cia migrate tailwind ./tailwind.config.js   # auto-detects tailwind.config.* if omitted
npx cia migrate bootstrap ./scss/_variables.scss
```

Both accept `--help` for the full option list. Prose walkthroughs live at [`/docs/migration-tailwind`](https://jerry2d3d.github.io/css-is-awesome/docs/migration-tailwind/) and [`/docs/migration-bootstrap`](https://jerry2d3d.github.io/css-is-awesome/docs/migration-bootstrap/).

## Print / PDF (zero JS)

Print support is a pure-CSS layer — the browser's native **Print → Save as PDF** is the generator, and cia ships no JavaScript for it:

```scss
@use 'css-is-awesome/api' as cia;

// Once, in a GLOBAL stylesheet — never inside a component module.
// It emits its own :root block plus @page, so don't wrap it in a selector.
@include cia.print-base;                   // optional: ($size, $margin, $freeze-animations)

.site-nav   { @include cia.print-hidden; } // drop chrome on paper
.print-note { @include cia.print-only; }   // reveal paper-only content
.invoice    { @include cia.print { border: 1px solid; } } // bare @media print wrapper
```

`print-base` also collapses animations to zero duration and pins them to their final frame, so a page snapshotted mid-entrance-fade doesn't print as invisible text. It deliberately does **not** force `opacity: 1` or `transform: none` — that would fix the fade while flattening every intentional use of the same properties (a 0.15 watermark, a 0.4 disabled control, a stamp rotated `-4deg`). Elements that were never animating are left untouched. Read `--is-print` (`0` on screen, `1` on paper) for custom effects. Full walkthrough: the [`print-to-pdf`](./scss/recipes/print-to-pdf.md) recipe.

### Why the print mixins use `!important`

cia avoids `!important` everywhere else. The print layer is the exception, and it's deliberate.

**`@media` contributes no specificity.** `print-hidden` is included *inside* your selector, so the rule it generates has exactly that selector's specificity — and any later declaration at equal specificity wins, including in print. Measured in a browser:

| | result in print |
|---|---|
| `display: var(--print-hide) !important` | `none` ✓ hides |
| same rule without `!important` | `flex` ✗ prints anyway |

The competing `display` usually isn't yours — it's a utility class or a component library cia can never see. Without `!important` the mixin fails *silently, on paper only*, which is the worst place to discover it.

**`@layer` would be worse, not better.** Layered CSS always loses to unlayered CSS. If cia's print rules lived in a layer and your own CSS is unlayered (the normal case), your `display: flex` would win and the nav would print. cia can't require consumers to adopt layers — see [`.agent/decisions/decided/04-at-layer-decision.md`](./.agent/decisions/decided/04-at-layer-decision.md). `!important` also *inverts* layer order, so the two don't compose the way you'd expect.

The scope is kept narrow: 8 `!important` declarations, all inside `@media print`, all doing one of two jobs — beating a `display` rule, or beating an author `animation` shorthand. The values stay variable-driven (`--print-hide`, `--print-show`), so you can still override behaviour without fighting the mixin.

## MCP server (for AI agents)

cia ships a Model Context Protocol stdio server (JSON-RPC over stdio, protocol `2024-11-05`) at [`mcp/server.cjs`](./mcp/server.cjs), exposed as the `css-is-awesome-mcp` bin. It's in the `files` manifest, so it lands in every consumer's `node_modules`. Any MCP-aware client (Claude Code, Cursor, Aider, Gemini, Copilot) can then query cia's real design system — mixin signatures, tokens, themes, recipes — instead of guessing, without grep-walking the repo. Exposes **30 tools** across 8 families (themes, mixins, functions, tokens · 127 required of them, animations, components, recipes, doc readers) plus `assemble_prompt` (context bundles) and `resolve_size` (snap design px values to cia's 4px grid). Full reference: [`/docs/mcp`](https://jerry2d3d.github.io/css-is-awesome/docs/mcp/).

**Setup is two steps — do both, or the server won't start.**

1. Install the SDK peer deps. The MCP SDK needs `@modelcontextprotocol/sdk` + `zod`; they're declared as *optional* peers so npm skips them by default. Without them the server exits and your MCP client shows only a generic "failed to connect":

   ```bash
   npm install -D @modelcontextprotocol/sdk zod
   ```

2. Add to your client's `.mcp.json` (the `npx` form uses the shipped bin and is CWD-independent):

   ```json
   {
     "mcpServers": {
       "css-is-awesome": {
         "command": "npx",
         "args": ["css-is-awesome-mcp"]
       }
     }
   }
   ```

   Equivalent explicit path: `"command": "node", "args": ["node_modules/css-is-awesome/mcp/server.cjs"]`.

## Docs site

The docs site is live at **https://jerry2d3d.github.io/css-is-awesome/** — it auto-deploys from `main` via GitHub Pages. To run it locally:

```bash
git clone https://github.com/Jerry2d3d/css-is-awesome.git
cd css-is-awesome
npm install
npm run dev          # http://localhost:5173
```

The docs site is a Next.js 15 app at `src/` that dogfoods the library — every page uses CSS Modules composed from the same tokens and mixins the library ships.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Next.js docs site on port 5173 |
| `npm run build` | Static-exports docs site to `out/` |
| `npm run build:css` | Compile library SCSS to `dist/css-is-awesome.css` |
| `npm run build:css:all` | Compile all bundles (full + core + utilities + minified) + themes + token types |
| `npm run build:css:themes` | Rebuild the 24 per-theme CSS files in `public/themes/` **and** regenerate the all-in-one `public/theme.css` bundle |
| `npm run check:theme-drift` | Rebuild the themes into a scratch copy and fail if the committed artifacts don't match their SCSS sources |
| `npm run build:token-types` | Generate `dist/tokens.d.ts` from the contract |
| `npm run dtcg-to-scss` | Convert DTCG-format design tokens into cia SCSS |
| `npm run lint` | ESLint on the Next.js app |
| `npm run lint:scss` | Stylelint on the SCSS library |
| `npm run validate-themes` | Validate every theme against the 127-token contract + WCAG 2.2 AA contrast (FAIL-by-default since v0.7; checks both `light-dark()` branches and reports the worse) |
| `npm run validate-icons` | Validate the `core` icon pack against the 49-glyph contract |
| `npm run validate-api` | Assert the `css-is-awesome/api` barrel stays zero-emit |
| `npm run validate-package` | Pack + install into a temp project and compile every documented `@use` form — catches breakage that in-repo checks can't see |
| `npm run pack:consumer` | Pack and install this build into a local consumer (defaults to `../boiler-project-ai`); `--dry-run` supported |
| `npm test` | Playwright suite — axe a11y checks + per-theme visual snapshots |

## Testing

Eleven checks, all gated in CI on every PR. Each one exists because the failure it catches actually happened.

| Check | What it proves |
|---|---|
| `lint` / `lint:scss` | ESLint on the site, stylelint on the library |
| `validate-themes` | every theme declares all 127 required contract tokens and meets WCAG 2.2 AA on 22 audited pairs — evaluating **both** `light-dark()` branches and keeping the worse result. Fails the build by default |
| `check:theme-drift` | the committed `public/themes/**` and `public/theme.css` artifacts still match their SCSS sources |
| `validate-icons` | the 49-glyph core pack is intact (extras allowed) |
| `validate-api` | the `/api` barrel still emits zero CSS until a mixin is called |
| `validate-package` | packs → installs into a temp project → compiles all **10** documented `@use` specifiers |
| `coverage:api` | calls **174/174** public mixins + functions and asserts the output |
| `coverage:mcp` | calls **30/30** MCP tools over stdio |
| `test` | Playwright — 50 tests: route smoke, axe a11y, per-theme visual snapshots, theme-editor behaviour |

**Call-and-assert coverage.** SCSS has no line-coverage tooling, so cia measures whether every part of the public API is actually callable: parse every public `@mixin`/`@function`, generate a fixture that calls it, compile, and assert it works — no `null` leaking into CSS, functions return a value, mixins emit. **174/174 SCSS units and 30/30 MCP tools**, with CI failing below 98%. A unit with no fixture counts as uncovered, so skipping a test lowers the number rather than hiding.

**What 100% means here:** every public mixin and function is invoked and produces sane output. It catches renames, broken signatures and undefined variables — it found one on its first run, an undefined `$icon-size` that broke four icon mixins. It does **not** prove the CSS is visually correct; that's a deliberate trade against golden-file snapshots, which would churn dozens of files on any token change. Page-level visual correctness is covered by the Playwright snapshots instead.

**Size is gated, not just claimed.** `npm run size-budget` fails CI when any bundle outgrows its budget, and names the docs that quote the number. Raising a budget is a deliberate edit in `scripts/size-budget.mjs`, in the same commit as the growth — the point isn't that the number never moves, it's that it never moves silently. (These figures had drifted to be overstated by up to 2× while nothing measured them.)

**Known gaps**, stated plainly: **a11y runs on routes, not component states** — axe checks a set of pages; individual component states are not swept. (Cross-engine coverage used to be the gap here; the suite now runs chromium, firefox and webkit, which matters because cia leans on `light-dark()`, `:has()`, `[popover]` and `mask`.)

Full detail: [`/docs/testing`](https://jerry2d3d.github.io/css-is-awesome/docs/testing/).

## Size (gzipped)

| Bundle | Size | Use case |
|---|---|---|
| `dist/tokens.css` | 2.2 KB | Tokens only (`:where(:root)` CSS variables, no rules) — the purest mixin-first emit |
| `dist/css-is-awesome.core.min.css` | 2.4 KB | Tokens + resets, no utilities or components |
| `dist/css-is-awesome.utilities.min.css` | 4.1 KB | Every `cia-*` utility class, nothing else |
| `dist/css-is-awesome.min.css` | 7.3 KB | Full bundle (everything) |
| Per-theme `themes/<name>/theme.css` | 1.5–3.4 KB | One file per theme, both modes via `light-dark()`, drop-in with no markup change |
| **JavaScript shipped in package** | **0 KB** | Zero. Period. JS-driven features ship as separate add-on packages. |

## Status

**Stable, [published on npm](https://www.npmjs.com/package/css-is-awesome)** (first published 2026-09-01). The mixin API, functions, token contract, and theme architecture are stable and under strict SemVer — breaking changes require a major bump. See [`VERSIONING.md`](./VERSIONING.md) for the policy.

The 1.0 surface is the v0.8 mixin-first reframe — twelve mixin renames, theme system collapsed to 8 single-file theme families, six zero-JS components, intrinsic-layout vocabulary, opt-in utilities — plus the recipes book, the Tailwind/Bootstrap migration on-ramp, print/PDF support, and the 30-tool MCP server. The npm package ships ZERO JavaScript by hard rule.

See [CHANGELOG.md](./CHANGELOG.md) for the full history and [MIGRATION.md](./MIGRATION.md) for the v0.7 → v0.8 upgrade path.

For the deep authoring reference (tier decisions, mixin contracts, agent rules), read [`AGENTS.md`](./AGENTS.md).

## Launch mode / feature flags

The site ships with a runtime feature-flag gate driven by `public/flags.json`:

```json
{
  "version": 1,
  "comingSoon": false,
  "comingSoonMessage": "...",
  "announcement": { "active": false, "id": "", "status": "info", "message": "", "href": "" }
}
```

**Coming soon.** Set `"comingSoon": true` and the site renders a full-page "we're building this" overlay on every route (the theme picker is still visible). Flip back to `false` to restore the normal docs experience. No rebuild required — the flag is fetched at runtime.

**Announcements.** Set `announcement.active: true` plus a unique `announcement.id` to show a dismissible banner on every route. Visitors can dismiss; the dismissal persists in `sessionStorage` keyed by `id`, so changing the id re-shows the banner.

Flag changes on a static host are effective after the next hard reload.

## License

MIT. See [LICENSE](./LICENSE).
