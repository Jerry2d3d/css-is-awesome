# css-is-awesome

> A tiny, mixin-first SCSS design system with one-file theme swap.

[![CI](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml/badge.svg)](https://github.com/Jerry2d3d/css-is-awesome/actions/workflows/ci.yml) [![Node](https://img.shields.io/badge/node-%E2%89%A520-43853d?logo=node.js&logoColor=white)](./package.json) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE) [![semantic-release](https://img.shields.io/badge/semantic--release-enabled-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

**Bring your own selectors. We bring the design system.** One CSS file per theme. Nine themes. Zero JavaScript in the npm package. Six browser-native interactive components. Small enough to read in an afternoon.

> **v1.0 preview — landing in 1.0.0:** a **recipes book** for building any component (dialog, combobox, datepicker, data-table, command-palette) in any framework using cia mixins. AI agents read recipes via MCP and generate components in your stack; humans read them at `/docs/recipes`. See [`roadmap/epics/v1-0/`](./roadmap/epics/v1-0/) for the full v1.0 plan.

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
<link rel="stylesheet" href="/cia/themes/boilerplate.css">
<html data-theme="boilerplate">
```

Author your own class names; the mixin handles the styling. Mixins for buttons, forms, layout, typography, color, motion, plus the six zero-JS components: `accordion`, `modal`, `tooltip`, `dropdown`, `tabs`, `copy-button`. Full reference at [`/docs/mixins`](https://github.com/Jerry2d3d/css-is-awesome/blob/main/src/app/docs/mixins/page.tsx).

### 2. Drop-in CSS (zero build)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/css-is-awesome@0.8/public/themes/boilerplate/theme.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/css-is-awesome@0.8/dist/css-is-awesome.min.css">
<html data-theme="boilerplate">
```

Theme first (sets the tokens), library second. Bundle tiers — `dist/tokens.css` (2.3 KB gz, `:root` vars only), `dist/css-is-awesome.core.min.css` (2.7 KB gz, tokens + resets), `dist/css-is-awesome.min.css` (8.2 KB gz, full).

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

**One file per theme since v0.8.** Each theme contains both light + dark modes via native `light-dark()`. Set `<html data-theme="...">` and the browser handles the rest.

| Theme         | Mood                                                          | Modes |
|---------------|---------------------------------------------------------------|-------|
| boilerplate   | Neutral slate + clean blue, system fonts, drop-in starter     | both |
| sketchbook    | Warm washi paper / charcoal at night, sumi ink, indigo accent | both (brand default) |
| press         | Editorial newsprint / night-edition, Playfair serif, press-red | both |
| prism         | Vercel/Linear/Radix aesthetic, refined blue, neutral grays    | both |
| cupertino     | macOS AppKit, SF Pro, system blue, vibrancy blurs             | both |
| glass         | visionOS glassmorphism, iOS indigo, blur asymmetric per mode  | both (Pattern C) |
| graphite      | Brushed silver / machined dark aluminum, SF system stack      | both |
| terminal      | VT100 phosphor green, zero radii, CRT glow                    | dark-only |
| terminal-light | Daylight editor companion to terminal                        | light-only |

**Pair two themes per mode** with native `<link media>`:
```html
<link rel="stylesheet" href="/themes/sketchbook.css" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="/themes/terminal.css"   media="(prefers-color-scheme: dark)">
```

Newspaper by day, hacker terminal by night. No JS, no mixin — pure browser behavior. Most design systems give you dark mode; cia lets you ship a second brand at night. See [`/docs/themes/pairing`](./src/app/docs/themes/pairing/page.tsx).

Each theme is one file of CSS custom properties. Tokens only — no component rules. See `public/themes/<name>/theme.css` for the compiled output and `scss/themes/<name>.scss` for the sources. Full contract documented in [THEMING.md](./THEMING.md).

### Edit a theme or make your own

**You can.** Themes are open files. Edit any token, make brand-new themes, mix and match — cia treats themes as data, not internal magic.

```bash
# 1. Copy an existing theme as a starting point
cp scss/themes/boilerplate.scss scss/themes/midnight.scss

# 2. Edit tokens (see scss/themes/*.scss for the pattern + light-dark() usage)
#    Wrap in @include cia.theme('midnight') { ... }

# 3. Build to public/themes/midnight/theme.css
npm run build:css:themes

# 4. Validate against the token contract + a11y audit
node scripts/theme-validator.js public/themes/midnight/theme.css

# 5. Use it
#    <html data-theme="midnight">
```

Full authoring walkthrough: [`/docs/authoring/themes`](./src/app/docs/authoring/themes/page.tsx). The contract (123 tokens) is at [`scripts/theme-contract.json`](./scripts/theme-contract.json).

## Token contract

Every theme declares the same slots: **surfaces · ink · lines · primary · seal · accent · code · type · radius · shadow · blur · glow · motion**. Components read tokens, themes set tokens, nothing else.

## MCP server (for AI agents)

cia ships a Model Context Protocol stdio server at [`mcp/server.cjs`](./mcp/server.cjs) — any MCP-aware client (Claude Code, Cursor, Aider, Gemini, Copilot) can discover cia's full surface (themes, mixins, functions, tokens, components, recipes, docs) without grep-walking the repo. Exposes 27 tools across 8 families plus `assemble_prompt` (context bundles) and `resolve_size` (snap design px values to cia's 4px grid). Full reference: [`/docs/mcp`](./src/app/docs/mcp/page.tsx).

Add to your client's `.mcp.json`:

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

The SDK is an optional peer dep — `npm install -D @modelcontextprotocol/sdk zod` in your project to run the server.

## Running the docs site locally

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
| `npm run build:css:all` | Compile all bundles (full + core + utilities + minified) |
| `npm run lint` | ESLint on the Next.js app |
| `npm run lint:scss` | Stylelint on the SCSS library |
| `npm run validate-themes` | Validate every theme against the 123-token contract + WCAG 2.2 AA contrast (FAIL-by-default since v0.7) |
| `npm run validate-icons` | Validate the `core` icon pack against the 49-glyph contract |

## Size (v0.8 gzipped)

| Bundle | Size | Use case |
|---|---|---|
| `dist/tokens.css` | 2.3 KB | Tokens only (`:root` CSS variables, no rules) — the purest mixin-first emit |
| `dist/css-is-awesome.core.min.css` | 2.7 KB | Tokens + resets, no utilities or components |
| `dist/css-is-awesome.min.css` | 8.2 KB | Full bundle (everything) |
| Per-theme `themes/<name>.css` | ~1.5-2.3 KB | One file per theme, both modes via `light-dark()` |
| **JavaScript shipped in package** | **0 KB** | Zero. Period. JS-driven features ship as separate add-on packages. |

## Status

Pre-1.0. v0.8 is the mixin-first reframe — twelve mixin renames, theme system collapsed from 14 files to 9 single-file themes, six zero-JS components, intrinsic-layout vocabulary, opt-in utilities. The npm package now ships ZERO JavaScript by hard rule. See [CHANGELOG.md](./CHANGELOG.md) for the breaking-change list and [MIGRATION.md](./MIGRATION.md) for the v0.7 → v0.8 upgrade path.

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
