# css-is-awesome — Roadmap

A phased plan to turn the extracted SCSS system into a polished, Bootstrap-style distributable library. Each phase stands on its own and can ship independently.

## Two views

- **This file (phases):** delivery milestones — what ships in v0.1, v0.2, v0.5, v1.0, etc.
- **[`roadmap/epics/`](./roadmap/epics/README.md):** thematic work slices with features + user stories + acceptance criteria.

User stories from any epic may ship across multiple phases. Epics don't gate phases; they just describe the work in depth.

---

## Phase 0 — Foundation (DONE)

- [x] Extract SCSS source from `boiler-project-ai`
- [x] Set up `package.json` with build scripts
- [x] README with install + usage
- [x] Initial commit + GitHub push

---

## Phase 1 — Clean & Stabilize (v0.2)

**Goal:** Fix existing issues, lock down the API surface, make the library safe to consume.

### Bug fixes
- [x] Fix unquoted color-name warning in `scss/_generator.scss:21` (quote `$key` when interpolating)
- [x] Pick ONE theme-switch pattern: `[data-theme="dark"]` OR `.theme-dark` — deprecate the other
- [x] Audit `@use` paths for consumer portability (work with aliased imports)

### Developer experience
- [ ] Add `dist/` build output committed to releases (not git — via npm publish)
- [x] Add `CHANGELOG.md` with semver discipline
- [x] Add `LICENSE` file (MIT)
- [x] Add `.editorconfig` for contribution consistency

### Quality
- [x] Stylelint config + lint pass on all SCSS
- [x] `npm run lint` script
- [x] Verify compile output size (gzipped CSS target: <15 KB for core) — 2 KB gzipped

**Release:** `v0.2.0` — first "safe to use" version.

---

## Phase 2 — Bootstrap-Style Utility Classes (v0.3)

**Goal:** The big Bootstrap-parity lever. Give consumers drop-in utility classes so they don't need SCSS at all.

### Utility CSS generation
- [x] New `scss/_utilities.scss` that emits utility classes from existing tokens (all `cia-` prefixed)
- [x] **Spacing:** `.cia-m-xs` through `.cia-m-4xl`, `.cia-mt/mr/mb/ml-*`, `.cia-mx/my-*`, same for padding + gap
- [x] **Typography:** `.cia-text-xs` through `.cia-text-6xl`, `.cia-font-light/normal/semibold/bold`, `.cia-text-primary/secondary/muted`, `.cia-leading-tight/normal/loose`
- [x] **Colors:** `.cia-bg-surface-*`, `.cia-text-*`, `.cia-border-*`, status variants
- [x] **Layout:** `.cia-flex`, `.cia-flex-center`, `.cia-flex-between`, `.cia-stack`, `.cia-grid`, `.cia-inline`
- [x] **Display:** `.cia-hidden`, `.cia-block`, `.cia-flex`, `.cia-grid`, `.cia-inline-*`
- [x] **Position:** `.cia-static`, `.cia-relative`, `.cia-absolute`, `.cia-fixed`, `.cia-sticky`
- [x] **Border/Radius:** `.cia-rounded-sm/md/lg/full`, `.cia-border`, `.cia-border-0`
- [x] **Shadow:** `.cia-shadow-sm/md/lg/xl`, `.cia-shadow-inner`, `.cia-shadow-none`
- [x] **Responsive variants:** `.cia-sm\:flex`, `.cia-md\:hidden`, etc. (included, mobile-first)

### Build outputs
- [x] `dist/css-is-awesome.css` — full system + utilities (10 KB gzip)
- [x] `dist/css-is-awesome.core.css` — tokens + resets only (2 KB gzip)
- [x] `dist/css-is-awesome.utilities.css` — utilities only (8 KB gzip)
- [x] All above as `.min.css` via Sass compressed mode

**Release:** `v0.3.0` — consumers can write `<div class="cia-flex-between cia-p-md cia-bg-surface-subtle cia-rounded-lg">` without touching SCSS.

---

## Phase 3 — Theming & Customization (v0.4)

**Goal:** Make it easy to override tokens without forking.

- [x] Documented override pattern: consumers set CSS custom properties at `:root` to remap any token
- [x] SCSS-level override pattern: `@use "css-is-awesome/scss/theme" with ($overrides...)`
- [x] Brand theming guide (replace `#3A5FCD` with your brand in 3 lines)
- [x] Multi-brand example: light/dark + brand A/brand B via `[data-theme="brand-a-light"]`
- [x] Runtime theme-switch JS snippet in docs (localStorage, `prefers-color-scheme` honor)
- [x] Export Figma Tokens JSON alongside SCSS (for design-tool sync)

**Release:** `v0.4.0` — fully themeable.

---

## Phase 4 — Documentation Site (v0.5)

**Goal:** A living docs site where people can see, copy, and steal.

**Decision (revised):** Next.js 15 + App Router + TypeScript. Static-exported (`output: "export"`) so it deploys to any static host. Replaced the original "plain static HTML" plan — dogfooding still intact (the site consumes our own CSS), but we get proper routing, component reuse, and TypeScript safety.

### Template (DONE)
- [x] Ported Sketchbook sketch → `src/app/` (index, docs, examples, blog, about)
- [x] Favicon wired via `src/app/favicon.ico` (Next.js App Router convention)
- [x] Two-file contract preserved: `public/theme.css` (swappable tokens) + `src/app/globals.css` (base system)
- [x] Co-located SCSS: every `page.tsx` gets a sibling `page.scss`; every component gets its own `.scss`
- [x] `npm run dev` + `npm run build` scripts

### App structure (DONE)
- [x] `src/app/` — routes: `/`, `/docs`, `/examples`, `/blog`, `/about`, `/themes`, `/compare`
- [x] `src/components/` — extracted components (see below)
- [x] `public/` — theme files, icon sprite
- [x] `scss/` — the design-system library (unchanged by this phase; separate concern)

### Extracted components (DONE)
Shared chrome + reusable building blocks now live in `src/components/`:
- `SiteHeader` — docs header with nav + active state
- `ThemePicker` — live 6-theme swap widget
- `Button`, `Card`, `Icon`, `Seal`, `LogoMark` — atoms
- `Post`, `Principle`, `TimelineItem`, `StatChip` — data-driven repeating blocks
- `Example` (+ `.Preview` / `.Code` compound slots) — code + preview wrapper
- `DocsSidebar`, `Logo`, `DraftStamp` — structural

### Content (still TODO)
- [ ] Replace placeholder docs copy with real install/usage for the published `cia-` system
- [ ] Sections: Tokens (color/spacing/type grids), Utilities (searchable table), Mixins API, Migration from Bootstrap
- [ ] Live color swatches, spacing visualizers, type scale preview
- [ ] Copy-to-clipboard code snippets
- [ ] Deploy to the external host + link from README + `package.json` `homepage`

### New pages
- [x] **`/themes` gallery** — all 6 themes with live-swap preview + download per tile. Uses `ThemeTile` component.
- [x] **`/compare` page** — honest three-column vs Tailwind vs Bootstrap with feature table and "where each wins" verdicts.
- [ ] **`/compare` bundle-size table** — add three-tier story (core / utilities / full) with gzipped KB next to Tailwind + Bootstrap equivalents.
- [ ] **`/docs` intro page** — still placeholder; replace with live theme-swap demo at top + real cia-* usage.
- [ ] **`/showcase` page** — real-looking full pages (marketing / blog / dashboard / 404), all theme-swappable.

**Release:** `v0.5.0` — docs are the pitch.

---

## Phase 4.5 — Theme System (v0.5 / v0.6 crossover)

**Goal:** Themes as one-file add-ons. User downloads a `theme.css`, replaces the one they have, everything reskins.

**Model locked in:**
- Theme = a single CSS file that declares CSS custom properties on `:root`.
- Tokens only — no component CSS, no new rules. Base system stays clean.
- Install = copy over `theme.css`. No build step, no tool required.
- Discovery = a Themes gallery page on the docs site with live `<link>` swapping.

### Work
- [x] Lock the **token API contract** — documented in `docs/theme.css` header as the authoritative slot list every theme declares. Slots grouped: surfaces · ink · lines · primary · seal · accent · code · type · radius · shadow · blur · glow · motion.
- [ ] Decide **sizing scale** (numbered 1–9 vs t-shirt sm/md/lg) — still open; current contract ships t-shirt (`--r-sm/md/lg`). Numbered aliases can be added later without breaking.
- [ ] Pull Sketchbook's docs-specific flourishes (construction lines, seal, draft stamp, brush rules) out of any future "base system" port — they belong in docs chrome only.
- [x] Ship 5 additional themes to prove the swap:
  - [x] Press (editorial newsprint)
  - [x] Graphite (dark aluminum) — the dark-mode proof
  - [x] Glass (visionOS glassmorphism) — exercises `--blur-*` + `--paper-glass`
  - [x] Cupertino (macOS native)
  - [x] Terminal (CRT phosphor) — mono-only stress test
- [x] Build the `/themes` gallery page — live preview + one-click download per tile.
- [ ] Write `CONTRIBUTING-THEMES.md` for community submissions later.

### Animation system
- [x] Keyframe library in `scss/_animations.scss` (fade/slide/scale/pop/pulse/shimmer/spin/wiggle)
- [x] `animate()` mixin with name/speed/delay/iteration/fill/timing params
- [x] `animate-on()` interaction helper (hover/focus · lift/glow/press/fade)
- [x] `.cia-anim-*` and `.cia-hover-*` utility classes emitted from the same source
- [x] Theme-driven — reads `--duration-fast/normal/slow` and `--ease` so each theme controls feel
- [x] `prefers-reduced-motion` respected globally
- [ ] Docs page with live animation preview grid

### Theme icon packs
- [x] `.cia-icon` component in base `styles.css` — `currentColor` + font-size sizing
- [x] Seed sprite at `docs/icons.svg` (8 icons: edit, download, check, close, search, menu, arrow-right, chevron-down)
- [x] Per-theme `icons.svg` slot documented — drop a replacement sprite in the theme folder to swap the pack
- [ ] **Vendor Lucide as default `core` pack** — ~49 glyphs at `public/icons/core/`, MIT, with `LICENSE-third-party` notice. See [`roadmap/icons-proposal.md`](./roadmap/icons-proposal.md) for the full glyph list.
- [ ] **Icon pack switching mechanism** — per-theme override folder (`public/themes/<name>/icons/<pack>/`) resolves before falling back to `core`; documented in CONTRACT.
- [ ] Ship icon packs for Press, Graphite, Glass, Cupertino, Terminal
- [ ] Icon index page listing every symbol by name

### Themes editor
- [ ] **`/themes/editor` page** — browser-only theme builder; live preview, contract-slot controls (color pickers, sliders for radius/shadow/blur, type pickers), Blob download of `theme.css`, localStorage autosave, validates against `scripts/theme-contract.json` before download.

### Boilerplate theme
- [ ] **Hand-design `public/themes/boilerplate/theme.css`** — a neutral starter theme that ships as the recommended baseline for new consumers (clean defaults, no flourish, easy to override).

**Release:** `v0.5.x` — theme system live, 6 themes shipped, animations + icon-pack mechanism in place, themes editor + boilerplate theme available.

---

## Phase 5 — Distribution & CDN (v0.7)

**Goal:** Cut the first real npm release and prove a downstream consumer can pull it from the registry.

### Pre-publish (in order)
- [ ] **Fix `_app-styles.scss` leak** — `scss/main.scss:11` currently pulls in docs-app styles; remove from the library entry so consumers don't inherit Next.js chrome.
- [ ] **`npm pack` smoke test** — generate the tarball, install into a throwaway folder, import the SCSS + utilities CSS, confirm zero stray rules and correct module resolution.
- [ ] **Hand-design boilerplate theme** at `public/themes/boilerplate/theme.css` (tracked in Phase 4.5 — this is the gating dependency for the registry consumer test).
- [ ] **`npm publish` 0.6.1** (`npm publish --access public`) — first public registry cut.
- [ ] **Boilerplate consumer install from registry** — real downstream project installs `css-is-awesome@0.6.1`, drops in the boilerplate theme, confirms full system + utilities work end-to-end.

### Follow-on
- [ ] Verify jsDelivr + unpkg auto-serve the `dist/` files
- [ ] README "CDN" section with exact `<link>` tag
- [ ] SRI hashes for security-conscious users
- [ ] GitHub Release with bundled zip download (for non-npm users)
- [ ] `package.json` `exports` field for correct module resolution

**Release:** `v0.7.0` — first npm + CDN cut. SemVer begins; v1.0.0 is reserved for once the CDN smoke is verified live and the API has stabilised in production usage (Phase 6+).

---

## Phase 6 — Ecosystem (v1.1+)

**Goal:** Solidify as a real project.

- [ ] TypeScript token definitions (`tokens.d.ts`) — type-safe token access from JS
- [ ] PostCSS plugin for tree-shaking unused utilities
- [ ] Starter templates: plain HTML, Vite, Next.js, Astro
- [ ] GitHub Action: CI (build + lint), Release (semver + npm publish + changelog)
- [ ] Badge suite in README (npm version, downloads, bundle size, license)
- [ ] Contribution guide + issue templates
- [ ] Storybook or Ladle instance for the (future) component library

---

## Phase 7 — Differentiators (post-v1.0)

**Goal:** Move from "another design system" to "the obvious choice for SCSS-first teams who want zero-JS theming." Items from the Gemini critique that widen the moat once the foundations are stable.

- [ ] **Zero-JS interactive components** — tabs, accordion, modal, popover, tooltip built on `:has()`, the popover API, and `@container`. Biggest moat vs shadcn — they need a runtime, we don't.
- [ ] **A11y linter inside `theme-validator.js`** — WCAG contrast checks on every contract slot pair; CI fails any theme that breaks AA on text/surface combos.
- [ ] **SCSS↔TS token bridge** — generate `tokens.d.ts` from the contract so consumers get type-safe token access in JS/TS.
- [ ] **Intrinsic layout mixins** — stack/cluster/switcher (Every Layout patterns) as first-class mixins so consumers stop hand-rolling flex utilities.
- [ ] **Tailwind→Awesome migration CLI** — parses Tailwind class strings in a project and suggests `cia-*` utility or mixin equivalents; lowest-friction path for migrants.
- [ ] **`/showcase` page** — full real pages (marketing, blog, dashboard, 404) with one-click theme swap. The "see it work in production" pitch.
- [ ] **Component depth audit** — catalog gaps vs Bootstrap (modal, toast, popover, tooltip, accordion, breadcrumb, pagination, badge, avatar, dropdown, offcanvas) and prioritize zero-JS implementations.

---

## Stretch / Future

- [ ] Companion React component library (`@css-is-awesome/react`) — pulls from `boiler-project-ai` component inventory
- [ ] Tailwind preset — expose tokens as a Tailwind config for dual-audience support
- [ ] Figma library companion (auto-synced with tokens)
- [ ] Animation/motion preset expansion (keyframe library)
- [ ] Print stylesheet preset
- [ ] RTL (right-to-left) support

---

## Open Questions

1. ~~**Utility naming:** stay close to Bootstrap (`.p-3`) or Tailwind-like (`.p-md`)?~~ **Decided:** Tailwind-style (`.cia-p-md`) with `cia-` prefix.
2. ~~**Namespace:** should utilities be prefixed?~~ **Decided:** yes, `cia-` on everything.
3. **Default CSS output:** include utilities by default or opt-in? Still open.
4. **Browser support target:** modern evergreen only, or include a legacy build? Still open.
5. **Sizing scale:** refactor `xs/sm/md/lg/xl/2xl/3xl/4xl` → numbered `1–9` with aliases? **Pending — blocks the theme token contract.**

---

## What's next (decision order)

1. ~~**Lock theme token API contract**~~ — done. 6 themes implement it.
2. ~~**Wire `/themes` gallery page**~~ — done.
3. ~~**Build `/compare` page**~~ — done.
4. **Fix `_app-styles.scss` leak** at `scss/main.scss:11` so the library entry stops pulling in docs-app styles.
5. **`npm pack` smoke test** — install the tarball into a throwaway folder, verify clean output.
6. **Hand-design `public/themes/boilerplate/theme.css`** — neutral baseline theme for new consumers.
7. **`npm publish` 0.6.1** — first public registry cut.
8. **Boilerplate consumer install from registry** — real downstream project pulls `css-is-awesome@0.6.1` and confirms end-to-end.
9. **Update `/compare` page** — three-tier story (core / utilities / full) + bundle-size table next to Tailwind + Bootstrap.
10. **Vendor Lucide as default `core` icon pack** at `public/icons/core/` (~49 glyphs, MIT, `LICENSE-third-party`).
11. **Themes editor at `/themes/editor`** — browser-only live preview, contract-slot controls, Blob download, localStorage autosave, validates before download.
12. **Replace placeholder `/docs` copy** with real `cia-*` usage, token grids, mixin API reference, migration from Bootstrap.
13. **Ship theme-specific `icons.svg`** for each of the 5 non-Sketchbook themes.
14. **Animation preview page** — grid of every keyframe × every theme.
15. **Decide sizing scale** (t-shirt vs numbered) — shipping t-shirt now; numbered aliases can layer on non-breaking.
16. **Phase 7 differentiators** (post-v1.0) — zero-JS components, a11y linter, TS token bridge, intrinsic layout mixins, Tailwind→Awesome CLI, `/showcase`, component depth audit.

---

*Roadmap is iterative — phases can be reordered or merged based on what's most useful to ship next.*
