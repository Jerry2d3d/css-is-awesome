# css-is-awesome — Roadmap

A phased plan to turn the extracted SCSS system into a polished, Bootstrap-style distributable library. Each phase stands on its own and can ship independently.

## Product architecture

**Strategic decision (2026-05-03):** the umbrella is split into THREE distinct products. css-is-awesome is the styling system — it does NOT ship React/JS components. See [`roadmap/product-architecture.md`](./roadmap/product-architecture.md) for the full rationale.

1. **css-is-awesome** (this repo) — the styling system whose themes pass a typed contract; one file swaps the entire skin. Pure SCSS + CSS, no React.
2. **Add-ons** — themes, icon packs, animation libraries, mixin extras. Drop-in single-file assets, no build step. The existing one-file `theme.css` model is the template.
3. **Gremlin UI** — FUTURE separate npm package: a React component library that depends on css-is-awesome for theming. Picks up the components currently sitting in `src/components/`. Name TBD ("Gremlin UI" / "Components are Awesome" / "Gremlin Components").
4. **Gremlin Boilerplate** — FUTURE Next.js starter that pre-wires css-is-awesome + Gremlin UI + auth + an opinionated app shell. Evolves from `boiler-project-ai`.

Gremlin UI and Gremlin Boilerplate are out of this repo's primary scope, but planning starts here so we don't paint ourselves into a corner.

```
Gremlin Boilerplate  ──►  Gremlin UI  ──►  css-is-awesome  ──►  Add-ons
   (Next.js app)         (React lib)       (this repo)         (themes,
                                                                icon packs,
                                                                animations)
```

Dependency direction is one-way: lower layers never know about higher ones.

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

### Content
- [x] Replace placeholder docs copy with real install/usage for the published `cia-` system — `/docs` intro now ships real Quick Start, three-tier story, utility-vs-mixin side-by-side, expanded "What next" links.
- [ ] Sections: Tokens (color/spacing/type grids — DONE), Utilities (searchable table — TODO), Mixins API (TODO), Migration from Bootstrap (started; needs polish).
- [x] Live color swatches, spacing visualizers, type scale preview — `/docs/tokens` reads `getComputedStyle` after mount and re-resolves on theme swap via `useThemeAttribute`.
- [x] Copy-to-clipboard code snippets — every `<Example.Code>` has a Copy button (CopyButton client island, secure-context fallback to execCommand).
- [ ] Deploy to the external host + link from README + `package.json` `homepage` (Pages workflow exists; live URL not yet linked from README).

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
- [x] Decide **sizing scale** — LOCKED on numbered scale as the source of truth, with t-shirt aliases layered on top (settled out of session 2026-05-04). Both `m.space(4)` and `m.space(md)` resolve identically.
- [ ] Pull Sketchbook's docs-specific flourishes (construction lines, seal, draft stamp, brush rules) out of any future "base system" port — they belong in docs chrome only.
- [x] Ship 5 additional themes to prove the swap:
  - [x] Press (editorial newsprint)
  - [x] Graphite (dark aluminum) — the dark-mode proof
  - [x] Glass (visionOS glassmorphism) — exercises `--blur-*` + `--paper-glass`
  - [x] Cupertino (macOS native)
  - [x] Terminal (CRT phosphor) — mono-only stress test
- [x] Build the `/themes` gallery page — live preview + one-click download per tile. (Moved to `/themes/gallery` when `/themes` became the editor.)
- [x] Write `CONTRIBUTING-THEMES.md` for community submissions later.

### Animation system
- [x] Keyframe library in `scss/_animations.scss` (fade/slide/scale/pop/pulse/shimmer/spin/wiggle)
- [x] `animate()` mixin with name/speed/delay/iteration/fill/timing params
- [x] `animate-on()` interaction helper (hover/focus · lift/glow/press/fade)
- [x] `.cia-anim-*` and `.cia-hover-*` utility classes emitted from the same source
- [x] Theme-driven — reads `--duration-fast/normal/slow` and `--ease` so each theme controls feel
- [x] `prefers-reduced-motion` respected globally
- [x] Docs page with live animation preview grid (`/docs/animation` — 12 keyframes as cards, hover/click replay, theme-swap retimes everything in place)

### Theme icon packs
- [x] `.cia-icon` component in base `styles.css` — `currentColor` + font-size sizing
- [x] Seed sprite at `docs/icons.svg` (8 icons: edit, download, check, close, search, menu, arrow-right, chevron-down)
- [x] Per-theme `icons.svg` slot documented — drop a replacement sprite in the theme folder to swap the pack
- [x] **Vendor Lucide as default `core` pack** — 49 glyphs at `public/icons/core/`, ISC + Feather-derived MIT, with `LICENSE-third-party` notice. Vendored via `scripts/vendor-lucide-core.mjs` from `lucide-static`. See [`roadmap/icons-proposal.md`](./roadmap/icons-proposal.md) for the full glyph list.
- [x] **Icon pack switching mechanism** — per-theme override via `--cia-icon-<name>` CSS custom property (resolution: per-theme override → core pack → 404). Mixin signatures (`m.svg(name)`) unchanged. Documented in `CONTRACT.md` "Icons contract" + `AGENTS.md` "Icons" section. Drop-in workflow: just `cp my.svg public/icons/core/` and call `m.svg(my)` — no JSON edit required for non-contract glyphs. New `npm run validate-icons` enforces the contract pack.
- [ ] Ship icon packs for Press, Graphite, Glass, Cupertino, Terminal
- [ ] Icon index page listing every symbol by name

### Themes editor
- [x] **Theme editor page** at `/themes` — browser-only theme builder; live preview, contract-slot controls (color pickers, length sliders, number/string inputs), Blob download of `theme.css` with both `[data-theme="<name>-light"]` and `[data-theme="<name>-dark"]` blocks (validator-conformant), per-family override persistence in `localStorage`. Category tabs (Color / Layout / Type / Motion), sub-page pills under Color (Foundation / Components / Status), pagination at >4 groups per page, modified-state badge, name field with sanitizer. The `/themes/gallery` page hosts the 6-tile theme gallery.

### Boilerplate theme
- [x] **`public/themes/boilerplate/theme.css`** — neutral starter (light + dark in one file, full 123-token contract). Slate-leaning grays + clean blue accent (`#2563eb` light / `#3b82f6` dark), system UI sans-serif, ui-monospace, subtle shadows, standard 4/6/8/12 px radii. Bundled into `public/theme.css`, selectable in `<ThemeSelect>` / `<ThemePicker>` / `/themes/gallery`. Gating dependency for the v0.7 publish.

**Release:** `v0.5.x` — theme system live, 6 themes shipped, animations + icon-pack mechanism in place, themes editor + boilerplate theme available.

---

## Phase 5 — Distribution & CDN (v0.7)

**Goal:** Cut the first real npm release as a styling-system-only package. css-is-awesome ships SCSS + CSS — no React, no TS modules. Components move out (see Phase 8).

### Pre-publish (in order)
- [x] **Revert React packaging from `feat/v0.7-port-fixes`** — done in commit `53cbeda`. The React bundle, tsup config, and component publishing exports are stripped. Boilerplate copies its components from `src/components/` shadcn-style.
- [x] **Fix `_app-styles.scss` leak** — already fixed in `d986ea7` weeks ago. Verified by Agent X (no docs-only selectors in any of the four `dist/*.css` builds).
- [x] **`npm pack` smoke test** — Agent X verified the tarball: 162 kB packed / 1.0 MB unpacked / 125 files. No `dist/components/`, no `src/`, no tests, no `.next/` or `out/`. Top-level layout: `dist/`, `scss/`, `public/` (now includes `icons/`), `figma-tokens/`, both `LICENSE` files, key `.md` docs.
- [x] **Hand-design boilerplate theme** at `public/themes/boilerplate/theme.css` (tracked in Phase 4.5 — done).
- [x] **Add `public/icons` and `LICENSE-third-party` to `package.json` `files`** so the new Lucide pack ships in the tarball.
- [ ] **`npm publish` 0.7.0** (`npm publish --access public`) — first public registry cut as a styling-only package. Bump version to `0.7.0` first. **Awaiting explicit user go.**
- [ ] **Boilerplate consumer install from registry** — real downstream project installs `css-is-awesome@0.7.0`, drops in the boilerplate theme, confirms full system + utilities work end-to-end. Consumer copies its own components from `src/components/` shadcn-style.

### Follow-on
- [ ] Verify jsDelivr + unpkg auto-serve the `dist/` files
- [ ] README "CDN" section with exact `<link>` tag
- [ ] SRI hashes for security-conscious users
- [ ] **CDN review before v1.0** — is jsDelivr still the right call, or should we move to a self-hosted edge or alternate CDN? Audit uptime, cache hit rate, supply-chain posture, tracking concerns; decide stay or switch (see Epic 5 Feature 5.14 US-5.14.4).
- [ ] **AI-agent instruction files** — `AGENTS.md`, `CLAUDE.md`, `GEMINI.md` shipped at package root and whitelisted in `files`. Pointers to the deep `css-is-awesome.instructions.md`.
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
- [ ] Storybook or Ladle instance — lives in Gremlin UI's repo, not here (see Phase 8).

---

## Phase 7 — Differentiators (post-v1.0)

**Goal:** Move from "another design system" to "the obvious choice for SCSS-first teams who want zero-JS theming." Items from the Gemini critique that widen the moat once the foundations are stable.

- [ ] **Zero-JS interactive components** — tabs, accordion, modal, popover, tooltip built on `:has()`, the popover API, and `@container`. Biggest moat vs shadcn — they need a runtime, we don't.
- [x] **A11y linter inside `theme-validator.js`** — WCAG 2.2 AA contrast checks on 17 token pairs per theme. WARN-by-default to avoid blocking CI on existing failures; `--strict` opts into FAIL. Reports 104 known failures across 14 themes that need triage (see "104 a11y failures" section in resume notes).
- [ ] **SCSS↔TS token bridge** — generate `tokens.d.ts` from the contract so consumers get type-safe token access in JS/TS.
- [ ] **Intrinsic layout mixins** — stack/cluster/switcher (Every Layout patterns) as first-class mixins so consumers stop hand-rolling flex utilities.
- [ ] **Tailwind→Awesome migration CLI** — parses Tailwind class strings in a project and suggests `cia-*` utility or mixin equivalents; lowest-friction path for migrants.
- [ ] **`/showcase` page** — full real pages (marketing, blog, dashboard, 404) with one-click theme swap. The "see it work in production" pitch.
- [ ] **Component depth audit** — catalog gaps vs Bootstrap (modal, toast, popover, tooltip, accordion, breadcrumb, pagination, badge, avatar, dropdown, offcanvas) and prioritize zero-JS implementations.

---

## Phase 8 — Companion products (post-1.0)

**Goal:** Ship the React layer and the Next.js starter as separate products that depend on css-is-awesome. Naming for the React lib is still TBD: **"Gremlin UI"** vs **"Components are Awesome"** vs **"Gremlin Components"**.

These live OUTSIDE this repo (separate package, separate semver, separate README). Tracked here so the strategic split is visible.

### Gremlin UI (sister npm package)
- [ ] **Trigger:** starts when css-is-awesome `1.0` ships AND the ~17 components the boilerplate already wants are stable in `src/components/`.
- [ ] Stand up its own repo (or workspace package — see [`roadmap/product-architecture.md`](./roadmap/product-architecture.md) open question).
- [ ] Migrate components from this repo's `src/components/` (or the rescoped subset from Epic 03).
- [ ] Declare `css-is-awesome` as a peer dependency for theming.
- [ ] Storybook or Ladle for the component catalog.
- [ ] Independent semver, independent CHANGELOG.

### Gremlin Boilerplate (Next.js starter)
- [ ] **Trigger:** starts when Gremlin UI hits a usable `0.x` AND css-is-awesome `0.7+` is on the registry.
- [ ] Evolve `boiler-project-ai` into the official starter.
- [ ] Pre-wires css-is-awesome (theme + utilities) + Gremlin UI + auth + opinionated app shell.
- [ ] One-command bootstrap (e.g. `npx create-gremlin-app`).
- [ ] Documented as the recommended on-ramp for new full-stack projects.

---

## Stretch / Future

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

Items 1-12 + 16 + a11y linter shipped in earlier sessions. Status as of 2026-05-08:

1. ~~Lock theme token API contract~~ — done.
2. ~~Wire `/themes` gallery page~~ — done. (Now `/themes/gallery`; `/themes` is the editor.)
3. ~~Build `/compare` page~~ — done. (Refreshed 2026-05-07 with editor / icons / animations / bundle-tier rows.)
4. ~~Revert React packaging~~ — done.
5. ~~Fix `_app-styles.scss` leak~~ — already fixed; ROADMAP entry was stale.
6. ~~`npm pack` smoke test~~ — done. Tarball is 162 kB / 125 files, clean.
7. ~~Hand-design boilerplate theme~~ — done (slate neutrals, system fonts, light + dark).
10. ~~Update `/compare` page~~ with three-tier + bundle table — done.
11. ~~Vendor Lucide as default `core` icon pack~~ — done. 49/49 glyphs at `public/icons/core/`, per-theme override mechanism, `LICENSE-third-party`, `npm run validate-icons`.
12. ~~Themes editor at `/themes/editor`~~ — done at `/themes` (with `/themes/gallery` for the tile gallery). Live preview, contract-slot controls, Blob download, localStorage autosave per family.
13. ~~Replace placeholder `/docs` copy~~ — partial. Intro + tokens + animation done; utilities table + mixins API reference still TODO.
15. ~~Animation preview page~~ — done at `/docs/animation`.
16. ~~Decide sizing scale~~ — locked numbered as source of truth, t-shirt aliases layered on top.

### Open / next up

8. **`npm publish` 0.7.0** — bump version, `npm publish --access public`. Awaiting explicit user go.
9. **Boilerplate consumer install from registry** — depends on #8.
14. **Ship theme-specific `icons.svg`** for each of the 5 non-Sketchbook themes (or just a couple to prove the per-theme override mechanism).
17. **Phase 7 differentiators**:
    - ~~A11y linter~~ — done with WARN-by-default. **104 known failures across 14 themes need triage.** Universal failure: `--border-default` fails 3:1 non-text rule on every theme (likely a policy choice — keep low-contrast borders, or bump them). Real text failures concentrated in Glass-light + Cupertino-light (~8 each).
    - Zero-JS interactive components, TS token bridge, intrinsic layout mixins, Tailwind→Awesome CLI, `/showcase` page, component depth audit — all unstarted.
18. **Phase 8 companion products** — Gremlin UI + Gremlin Boilerplate. Trigger: cia 1.0 ships and ~17 boilerplate-wanted components are stable.

### Smaller items still on the board

- **Utilities searchable table** at `/docs/utilities` (placeholder content currently).
- **Mixins API reference** at `/docs/mixins`.
- **README homepage URL** + Pages-deploy verification.
- **Icon index page** listing every glyph in every pack.
- **Pull Sketchbook docs-flourishes** (seal, draft stamp, brush rules) out of any future "base system" port.
- **Triage the 104 a11y failures** so `--strict` can become the CI default.

---

*Roadmap is iterative — phases can be reordered or merged based on what's most useful to ship next.*
