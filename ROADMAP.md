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
- [x] Add `dist/` build output committed to releases (not git — via npm publish) — verified in tarball (`npm pack` smoke test)
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
- [x] **Responsive variants:** `.cia-sm\:flex`, `.cia-md\:hidden`, etc. (included, `min-width` syntax; both directions supported via `m.media` / `m.media-down`)

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
- [x] Deploy to the external host + link from README — done: GitHub Pages mirror live and linked, and production at https://cssisawesome.com on Vercel since 2026-09-04 (deploys from the `prod-css-is-awesome` branch).

### New pages
- [x] **`/themes` gallery** — all 6 themes with live-swap preview + download per tile. Uses `ThemeTile` component. (Now at `/themes/gallery`; `/themes` is the editor.)
- [x] **`/compare` page** — honest three-column vs Tailwind vs Bootstrap with feature table and "where each wins" verdicts.
- [x] **`/compare` bundle-size table** — three-tier story (core / utilities / full) with gzipped KB landed in the 2026-05-07 refresh.
- [x] **`/docs` intro page** — real Quick Start, three-tier story, utility-vs-mixin side-by-side, expanded "What next" links.
- [x] **`/showcase` page** — shipped with 4 placeholder example blocks (marketing / blog / dashboard / 404). Content rework tracked in Phase 5.5 Step 1.5.

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
- [x] **Theme editor import** — upload a previously-downloaded `theme.css` to round-trip back into the editor and keep iterating (uncommitted on `main` 2026-05-12; `src/lib/theme-parse.ts` + ThemeEditorDock changes).

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
- [x] **`npm publish` 0.7.0+** — the package shipped publicly via semantic-release. Current published version is **0.8.2** (panel R7 bug-fix patch, 2026-05-21) after the v0.8 mixin-first reframe (BREAKING) and v0.8.1 animations split.
- [x] **Boilerplate consumer install** — boiler-project-ai is on `feature/v2.5-wave8-bare-tags` consuming `css-is-awesome@0.8.2` via `file:` workspace dep. Wave 8 atom conversion wrapped on the feature branch (2026-05-21). End-to-end mixin API + bare-tags Tier-2 pattern verified.

### Follow-on
- [x] Verify jsDelivr + unpkg auto-serve the `dist/` files — README shows `cdn.jsdelivr.net/npm/css-is-awesome@0.8/...` examples for both theme files + bundle.
- [x] README "CDN" section with exact `<link>` tag — shipped.
- [ ] SRI hashes for security-conscious users
- [ ] **CDN review before v1.0** — is jsDelivr still the right call, or should we move to a self-hosted edge or alternate CDN? Audit uptime, cache hit rate, supply-chain posture, tracking concerns; decide stay or switch (see Epic 5 Feature 5.14 US-5.14.4).
- [x] **AI-agent instruction files** — `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `llm.txt` all shipped at package root.
- [ ] GitHub Release with bundled zip download (for non-npm users)
- [x] `package.json` `exports` field for correct module resolution — shipped.

**Released through 0.8.2** (2026-05-21). The mixin-first v0.8 reframe (BREAKING) shipped, followed by 0.8.1 animations split + 5 new mixins, then 0.8.2 panel R7 bug-fix patch. The 27-tool MCP server (`@cia/mcp-server`) shipped alongside (2026-05-22). v1.0.0 is reserved for production-stability sign-off (Phase 6+).

---

## Phase 5.5 — Site polish & dogfood pass (v0.7.x)

**Goal:** The docs site is the system's storefront — make it visibly
practice what the library preaches. Two-step plan: clean up site
issues first, then convert page-level styles from raw token consumers
to mixin-API consumers.

Full audit punch list lives in
[`roadmap/site-audit-2026-05-13.md`](./roadmap/site-audit-2026-05-13.md).

### Step 1 — Style pass (style-first, before any dogfood rewrites)
- [ ] **Dead links** — 7 `href="#"` blog tiles + 4 in `/showcase` +
  footer links in `/examples`. Either real targets, disabled state,
  or remove. Demo `href="#"` inside `Example` blocks → `<button>`.
- [ ] **Add `<main>` landmark** to docs layout and any other route
  missing it (landing, about, blog, compare, showcase, examples,
  themes).
- [ ] **Focus styles for nav anchors** in `/themes` sidebar — global
  rule only targets `button`.
- [ ] **Hardcoded hex fallbacks** in `var()` defaults — Logo,
  ThemeEditorDock (TSX + SCSS + rows.tsx), ThemePicker. Decide
  policy: neutral fallback tokens vs strip fallbacks entirely.
- [ ] **Version display** — three different versions visible across
  landing / about / showcase (`v0.1` × 2, `v0.5` × 1). Pick a single
  source.
- [ ] **Per-route metadata** — every route exports its own
  `metadata` so browser tab + social cards are not all "CSS is
  Awesome".

### Step 1.5 — Storefront content rework

`/showcase`, `/blog`, and `/about` currently render placeholder /
out-of-date copy that contradicts the rest of the site. Fix the
content before doing any CSS work on these files so the dogfood
pass doesn't restyle copy that's about to be replaced.

**`/blog`** — *Resolved 2026-08-17: a real markdown-driven `/blog` +
`/blog/[slug]` shipped with 7 posts written from the commit history
(see Phase 5.95) — effectively Path A, all seven.* Original decision
for the record:
- [ ] **Path A — Ship a subset for real.** Pick 2-3 of the 7 drafted
  topics ("Why the overflow stays", "Five voices, one system",
  "Planning a CLI and an MCP server" are the strongest hooks) and
  author real posts at real routes (`/blog/[slug]`).
- [ ] **Path B — Single placeholder.** Replace the listing with a
  single hero + a "first post coming Q3" panel until there are
  posts to ship. Removes 7 dead links in one stroke.

**`/about`** — Content is mostly authentic but factually stale:
- [ ] Timeline says **"v0.1.0 on npm in 2025"** — never happened;
  the npm publish is still gated (Phase 5). Update to reflect the
  actual release history once 0.7.0 publishes.
- [ ] "**Five voices, one system**" + "Sketchbook arrives later in
  the year" — there are now 8 theme families (Sketchbook, Press,
  Graphite, Glass, Cupertino, Terminal, Boilerplate, Prism),
  and Sketchbook shipped. Update theme count + remove the "later in
  the year" framing.
- [ ] `<Seal>Approved · v0.1</Seal>` at the bottom — version drift
  (already tracked in Step 1, dedupe).
- [ ] Light content pass on the principles + "what it isn't"
  sections — verify nothing else contradicts the current product
  state.

**`/showcase`** — 4 example blocks, all with placeholder CTAs and
stale version copy:
- [ ] **Marketing hero block** — "v1.0 shipping soon" copy contradicts
  the actual 0.7 trajectory; `<Seal>New · v0.5</Seal>` is wrong.
  Fix copy + Seal to track real version.
- [ ] **Real CTAs** — `Get started` → `/docs/install`, `Read the
  docs` → `/docs`, `Take me home` already correct, `Report broken
  link` → GitHub issues URL.
- [ ] **Expand the page** — currently 4 blocks (marketing / blog /
  dashboard / 404). Decide whether to add pricing, app-shell,
  signup, docs-page-in-context, or empty-state to make the "see
  it work in production" pitch land harder.
- [ ] **Per-block theme swap** — currently the whole site reskins;
  showcase would benefit from a "lock this block to theme X" toggle
  so visitors can A/B two themes side-by-side without leaving the
  page. Stretch goal.

### Step 2 — Dogfood conversion (the structural gap)
- [ ] **Audit baseline** — count `var(--*)` and `font-family:` /
  `font-size:` raw declarations across `src/app/**/page.module.scss`.
  This is the target metric for the conversion.
- [ ] **Convert page modules** to consume the mixin API:
  `@use 'mixins' as m;` + `@include m.type(...)`, `m.space(...)`,
  `m.color(...)`, `m.font-size(...)`, etc. One page at a time;
  visual-regress after each.
- [ ] **Replace raw layout with `cia-*` utilities** where the
  Tailwind-style class is clearer than a one-off rule.
- [ ] **Keep the artisanal chrome** — Sketchbook's paper/grain/seal
  flourishes stay handcrafted (they're an intentional counter-example),
  but the *typography + spacing scale* underneath them should come
  from the system.

### Step 3 — Coverage + cross-theme + Lighthouse
- [ ] **Component gallery page** — every component in
  `src/components/` rendered at least once (currently `Divider`,
  `List`, `MenuItem`, `Pagination`, `Popover`, `Radio`, `Select`,
  `Slider`, `Switch`, `Textarea`, `Tooltip` aren't shown on the
  site).
- [ ] **Cross-theme spot-check** — every page in all 8 themes ×
  light/dark. Catches hex fallbacks the static audit missed.
- [ ] **Lighthouse + axe pass** — automated a11y + perf baseline,
  fix what surfaces.

**Release:** `v0.7.x` patch range. No library-API change; this is
docs-site quality only.

---

## Phase 5.95 — Post-1.0 hardening (2026-08-17 → 08-18)

**v1.0.0 was cut 2026-08-17** (`253610a`, tagged) at 24 of 42 stories, deliberately: no external users yet, so the SemVer commitment cost nothing. **First published to npm 2026-09-01**; semantic-release has cut every version since (the current one is always the `version` field of `package.json` — never hand-type it).

What the cut surfaced, in the order it hurt:

- [x] **Packaging break — both documented SCSS imports failed on a clean install.** `@use 'css-is-awesome'` and `@use 'css-is-awesome/api'` errored for anyone installing the package; Sass does not read `package.json` `"exports"`. Fixed with root-level forwarding shims (`api.scss`, `_index.scss`). Only the deep paths ever worked, which is why every in-repo check and the Boiler showcase stayed green.
- [x] **Nothing tested the published artifact.** Added `validate-package` (packs → installs → compiles all ten documented specifiers) and wired it into CI, alongside `validate-icons` and `validate-api`, which existed but had never been executed by the workflow.
- [x] **A11y validator was blind to `light-dark()`** — 7 themes scored 0/17 pairs, 119 silent skips, green checkmark. Now evaluates both schemes and keeps the worse row.
- [x] **`prism` shipped but was missing from every theme picker** (4 hand-maintained lists). Added, plus a test asserting all 8 families are offered.
- [x] **Blog was 7 dead stubs.** Replaced with a real markdown-driven `/blog` + `/blog/[slug]` and 7 posts written from the commit history.
- [x] **Visual baselines stale since 2026-05-03**, keeping CI red. Keyed by `{platform}`, win32 set regenerated. **Linux set still needs one manual run of the "Update visual snapshots" workflow.**
- [x] Release friction: `pack:consumer` collapses the three-step pack → re-pin → install dance into one command.

**Still open:** run the snapshot workflow once to create the linux baseline set; the remaining v1.0 stories (Playground is 0/7). ~~Publish to npm~~ — done 2026-09-01.

---

## Phase 5.9 — v1.0 Lockdown (recipes-first)

**Locked 2026-05-23** after long architecture synthesis (panel review + Gemini external read + Jerry instinct refinement).

> **Status 2026-09-04:** v1.0.0 cut 2026-08-17, first npm publish 2026-09-01; releases continue via semantic-release. The sprint checklist below is preserved as written — unchecked items are genuinely still open (see the "Definition of the best" list for per-item status).

**Goal:** Ship v1.0 as a humans-first design system whose AI-friendliness is the bonus. Five tracks, ~42 user stories, ~18-26 working days.

### Priority ladder (the v1.0 pitch order)

1. **Users first** — easy to learn, no framework lock-in, no maintenance treadmill
2. **Tokens** — one source of truth, swap one value = whole app shifts
3. **Theme editor on website** — visual customization for all 123 tokens
4. **Mixin-first speed** — `@include cia.btn(primary)` on any selector
5. **AI second (huge bonus)** — recipes book + MCP server make cia uniquely AI-composable

### The 5 epics

Full backlog: [`roadmap/epics/v1-0/README.md`](./roadmap/epics/v1-0/README.md).

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./roadmap/epics/v1-0/EPIC-01-recipes-book.md) | **Recipes Book** | Recipe format + first 5 recipes (dialog, combobox, datepicker, data-table, command-palette). MCP exposes them. | ~5-7 days | 13 |
| [02](./roadmap/epics/v1-0/EPIC-02-theme-editor-polish.md) | **Theme Editor Polish** | Download `.scss`/`.css`, share URL, inline contrast validator, reset/diff. | ~3-4 days | 9 |
| [03](./roadmap/epics/v1-0/EPIC-03-migration-on-ramp.md) | **Migration On-Ramp** | `npx cia migrate` from Tailwind config + Bootstrap variables. | ~3-5 days | 6 |
| [04](./roadmap/epics/v1-0/EPIC-04-playground.md) | **Playground** | `/playground` page with in-browser SCSS compile + theme picker + share URL. | ~4-6 days | 7 |
| [05](./roadmap/epics/v1-0/EPIC-05-bug-fixes-mcp-polish.md) | **Bug Fixes + MCP Polish** | Round 8 audit cleanup + MCP tests + `/docs/composition` page. | ~3-4 days | 7 |

### What is KILLED at v1.0 lock

- ❌ `@cia/react` as a separate npm component library Jerry maintains forever
- ❌ shadcn-style component ejection CLI for cia
- ❌ `@cia/a11y` as cia-original JS shims (deferred → `@cia/a11y-recipes` post-v1.0)
- ❌ Component library as the v1.0 selling point — recipes ARE the deliverable
- ❌ VS Code extension at v1.0 (deferred to v1.5; playground covers the demo need)

### What is DEFERRED to post-v1.0

See [`roadmap/epics/v1-0/post-v1-ideas.md`](./roadmap/epics/v1-0/post-v1-ideas.md). Highlights: VS Code extension (v1.5), Recipes Maker, `@cia/a11y-recipes`, `npm create cia` wizard, framework recipe packs (`@cia/angular`, etc.), Figma plugin, RTL audit, theme marketplace.

### 8-week pre-release sprint — the GOOD → GREAT path

**Locked 2026-05-26 (revised same day).** The architecture is GREAT; the shipped surface needs to catch up. This 8-week sprint closes that gap before public launch. Each week ships as its own feature branch + PR.

| Wk | Ship | Why this week |
|---|---|---|
| 1 | `npx cia migrate tailwind` + `npx cia migrate bootstrap` (Epic 03, 6 stories) | Single biggest adoption hack. Every "should I switch?" stops at "I have a tuned Tailwind config" until this ships. |
| 2 | 5 hard recipes: combobox, datepicker, data-table, command-palette, toast (Epic 01 F1.2 + v1.1 toast) | Catalog jumps 1 → 6. These are the hard ones shadcn nails. Closes the "thin catalog" perception. |
| 3 | `/playground` page (Epic 04, 7 stories) | Every Tailwind launch tweet links Tailwind Play. cia has no equivalent. Every recipe page links "Try it →". |
| 4 | Theme editor inline contrast validator + 5 more recipes (breadcrumb, pagination, form-validation, file-upload, page-header) | Visible WCAG win. Catalog at ~11 recipes. (`/docs/composition` standalone deferred — its story lives on the YouTube channel after launch.) |
| 5 | First 3 blog posts (pivot narratives) | Gremlin UI → recipes pivot, `@layer` → `:where()` pivot, Zero-JS positioning real-talk. Honest decision storytelling validates the architecture publicly. |
| 6 | **boilerplate-slim Angular set (34) + HTML set (34) complete** (separate repo) | Multi-framework proof. shadcn comparison flips ("React-only" → "React + Angular + HTML at v1.0"). |
| 7 | `/showcase` rebuild + `/docs/migrate-from-shadcn` guide | The shadcn graduate is cia's named target — they need a specific bridge, not generic docs. Showcase rebuild demonstrates cia + boilerplate-slim in real layouts. |
| 8 | Boiler-project-ai relaunch + invite 5-10 external testers + launch post + first 3 community PRs welcomed | First real consumer + early community signals + public launch. |

### Definition of "the best out there" after this sprint

- [x] Migration CLI handles real Tailwind + Bootstrap configs end-to-end (`npx cia migrate` shipped)
- [ ] 11+ recipes shipped across overlay / input / data / navigation / feedback (5 shipped as of 2026-09-04: dialog, combobox, print-to-pdf, mobile-nav, bottom-nav)
- [ ] `/playground` functional in-browser; every recipe page links to a starter URL
- [ ] Inline contrast validator runs live in the theme editor
- [x] Blog shipped for real — markdown-driven `/blog` with 7 posts written from the commit history (2026-08-17)
- [ ] boilerplate-slim ships React + Angular + HTML (34 each)
- [ ] `/showcase` rebuilt + `/docs/migrate-from-shadcn` guide published
- [ ] Boiler dogfoods cia + ≥5 external testers have built something real
- [ ] Launch post on Bluesky / X / dev.to / Substack

**Skipping earlier weeks breaks the chain.** Migration first because it unlocks evaluation. Recipes second because they're day-one deliverable. Playground third because it's the demo surface. Composition + validator fourth because they close Gemini's critique. Blog posts fifth because they validate the architecture in public. boilerplate-slim multi-framework sixth because it's the breadth signal. Showcase + migrate-from-shadcn seventh because they're the conversion bridge. Launch eighth because by then we have something defensible.

### The two-product architecture (separate repos)

cia's umbrella decomposes into TWO products with a one-way dependency:

| | **css-is-awesome** (cia) | **boilerplate-slim** |
|---|---|---|
| What | Styling foundation: tokens + mixins + themes + recipes + MCP | 34 components × 3 frameworks (React + Angular + HTML) |
| Zero JS in npm package | ✅ Hard rule | ❌ Ships JS (consumer-facing components) |
| Standalone use | ✅ Yes | ❌ Requires cia |
| Repo | `Jerry2d3d/css-is-awesome` | `Jerry2d3d/boilerplate-slim` (separate) |
| Semver | Independent | Independent, pins to cia |

Never fold boilerplate-slim into cia npm. Never make cia depend on boilerplate-slim. Update each on its own cadence.

### Wishlist — open ideas

Open list of ideas that could make cia better, captured in [`WISHLIST.md`](./WISHLIST.md). Seeded entries (2026-05-26): **Figma → MCP → Code** (designer-to-code loop, HTML output target), **HTML → PDF** (standalone tool wrapping `@media print` + headless browser). These are seeds, not committed work — promote to an epic when they earn their weight.

### Definition of done

- All 5 epic DODs met (42 stories shipped or punted)
- Tarball under 250 KB packed
- Zero JS in npm `files` manifest (CLI in `bin/` allowed)
- `validate-themes` passes FAIL-by-default across 8 themes
- `validate-recipes` passes in CI
- README, llm.txt, AGENTS.md, CHANGELOG, MIGRATION updated
- semantic-release publishes `1.0.0` cleanly

**Release:** `v1.0.0` — the recipes-first reframe.

---

## Phase 6 — Post-v1.0 sequence (v1.1 → v2.0)

**Locked 2026-05-23** alongside Phase 5.9. Full epic + feature + user-story backlog at [`roadmap/epics/`](./roadmap/epics/README.md).

| Release | Theme | Epic folder | Stories | Effort |
|---|---|---|---|---|
| **v1.1** | Recipes momentum (7 more recipes, install wizard, @cia/a11y-recipes add-on, @cia/react codegen POC) | [v1-1](./roadmap/epics/v1-1/README.md) | 43 | ~25-35 days |
| **v1.2** | Coverage (RTL audit, form-validation recipes, i18n recipes, print recipe, MUI + Chakra migration) | [v1-2](./roadmap/epics/v1-2/README.md) | 32 | ~16-22 days |
| **v1.3** | Ecosystem (Figma plugin, theme marketplace, DTCG migration CLI, @cia/angular) | [v1-3](./roadmap/epics/v1-3/README.md) | 34 | ~28-35 days |
| v1.4 | *Reserved — scoped based on v1.1-v1.3 community feedback* | — | — | — |
| **v1.5** | IDE integration (VS Code extension) | [v1-5](./roadmap/epics/v1-5/README.md) | 15 | ~10 days |
| **v2.0** | Visual builder (Recipes Maker — Jerry's idea, may never ship) | [v2-0](./roadmap/epics/v2-0/README.md) | 18 | ~15-20 days |

**Total post-v1.0 planned stories:** 142. **Total estimated effort:** ~94-122 working days.

The original Phase 6 ("Ecosystem v1.1+") below describes legacy items some of which have shipped (MCP server, CI, semantic-release, badges) and others (TypeScript token defs, PostCSS plugin, starter templates) which are now absorbed into post-v1.0 epics or deferred. Preserved for history:

---

### Phase 6 (legacy — partially shipped, partially superseded)

**Goal:** Solidify as a real project.

- [x] **MCP server** (shipped 2026-05-22) — 30 tools across 8 resource families (themes / mixins / functions / tokens / animations / components / recipes / docs) + `assemble_prompt` + `resolve_size`. Any MCP-aware client (Claude Code, Cursor, Aider, Gemini, Copilot) can discover the entire library surface without grep-walking. `mcp/server.cjs` + `bin: css-is-awesome-mcp`. See README "MCP server" section.
- [x] GitHub Action: CI (build + lint), Release (semver + npm publish + changelog) — semantic-release wired up since v0.7.
- [x] Badge suite in README (npm version, license, semantic-release) — shipped.
- [x] Contribution guide + issue templates — `CONTRIBUTING.md` + `CONTRIBUTING-THEMES.md` shipped.
- [x] TypeScript token definitions (`tokens.d.ts`) — shipped; generated from the contract via `npm run build:token-types`, exported as `css-is-awesome/tokens.d.ts`
- [ ] PostCSS plugin for tree-shaking unused utilities
- [ ] Starter templates: plain HTML, Vite, Next.js, Astro
- [ ] Storybook or Ladle instance — lives in Gremlin UI's repo, not here (see Phase 8).

---

## Phase 7 — Differentiators (post-v1.0)

**Goal:** Move from "another design system" to "the obvious choice for SCSS-first teams who want zero-JS theming." Items from the Gemini critique that widen the moat once the foundations are stable.

- [x] **Zero-JS interactive components** — shipped in v0.8/v1.0: accordion, modal, tooltip, dropdown, tabs, copy-button on `<details name>`, `<dialog>`, `[popover]`, radio + `:has()`; plus the mobile navigation family (hamburger / drawer / sheet / dock, 2026-08). Biggest moat vs shadcn — they need a runtime, we don't.
- [x] **A11y linter inside `theme-validator.js`** — WCAG 2.2 AA contrast checks on 17 token pairs per theme. **FAIL-by-default as of v0.7** (commit `4e1bbf1`, 2026-05-11) after triaging every theme; zero FAILs across all 22 theme blocks. `--allow-a11y-fail` opts out; `--strict` is retained as a no-op alias for backwards compat. `--border-default` is treated as decorative (informational only) per WCAG 2.2 SC 1.4.11.
- [x] **SCSS↔TS token bridge** — shipped: `npm run build:token-types` generates `dist/tokens.d.ts` from the contract.
- [x] **Intrinsic layout mixins** — shipped in the v1.0 surface: `stack` / `cluster` / `switcher` / `sidebar` as first-class mixins.
- [x] **Tailwind→Awesome migration CLI** — shipped as `npx cia migrate tailwind` (config-level conversion into a cia theme; the class-string-scanning variant described here was not built).
- [ ] **Component depth audit** — catalog gaps vs Bootstrap (modal, toast, popover, tooltip, accordion, breadcrumb, pagination, badge, avatar, dropdown, offcanvas) and prioritize zero-JS implementations.

---

## Phase 8 — Companion products (post-1.0) — REVISED 2026-05-23

**Original plan (Gremlin UI as a sister React component library Jerry maintains) was REPLACED 2026-05-23** after architecture synthesis. The decision:

- **No separate React component library to maintain.** "I don't want to keep up with a component library" — Jerry, 2026-05-23.
- **boiler-project-ai becomes a SHOWCASE / reference implementation**, NOT a published @cia/react npm package. It dogfoods cia recipes and proves the pattern. May ship publicly later as a consumer-grade React kit, but NOT the cia product.
- **Recipes book (Phase 5.9 Epic 01) replaces the React component library** as the v1.0 deliverable.

### Showcase: boiler-project-ai (separate repo, Jerry's)
- [ ] Rebuild boiler on top of v0.8.2+ cia, consuming via `file:` or `npm install`
- [ ] Eat cia recipes — every boiler component built from a published recipe
- [ ] Public README positions it as "the reference cia app, not a component library"
- [ ] Possible future release as `@jerry2d3d/cia-boiler` or similar Jerry-namespaced package; out of cia repo scope

### Framework recipe packs (deferred to post-v1.0 — see [post-v1-ideas.md](./roadmap/epics/v1-0/post-v1-ideas.md))
- `@cia/react` — trigger: v1.1 IF generated-from-recipes proves viable
- `@cia/angular` — Jerry's stated next-framework target after `@cia/react`
- `@cia/vue`, `@cia/svelte` — lowest priority unless community demand surfaces

### Original Gremlin UI / Gremlin Boilerplate plan (ARCHIVED)
Naming "Gremlin UI" / "Gremlin Components" / "Companion Boilerplate" — all retired. The Phase 5.9 recipes-first architecture means cia ships ONE thing (the styling engine + recipes), not three coupled products.

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
3. ~~**Default CSS output:** include utilities by default or opt-in?~~ **Decided (v0.8):** opt-in on the Sass path (`$utilities: true`); pre-built CDN bundles still ship every utility.
4. **Browser support target:** modern evergreen only, or include a legacy build? Still open (in practice: modern evergreen — the system leans on `light-dark()`, `:has()`, `[popover]`).
5. ~~**Sizing scale:** refactor `xs/sm/md/lg/xl/2xl/3xl/4xl` → numbered `1–9` with aliases?~~ **Decided (locked 2026-05-04):** numbered scale is the source of truth; t-shirt names are optional aliases.

---

## What's next (decision order)

Items 1-13, 15, 16, the a11y linter triage, and the theme-editor import round-trip all shipped before 2026-05-12. Status as of 2026-05-12:

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
19. ~~A11y linter triage~~ — done 2026-05-11 (commit `4e1bbf1`). Zero FAILs across all 22 theme blocks. `--border-default` reclassified as decorative (info status) per WCAG 2.2 SC 1.4.11. Validator now FAILs by default; `--allow-a11y-fail` opts out; `--strict` retained as a no-op alias.
20. ~~Theme-editor import~~ — upload `.css` to keep editing landed 2026-05-12 (uncommitted on `main`; round-trips a previously-downloaded theme file).

### Open / next up — Phase 5 was the live gate (since resolved)

**Phase 5 (publish v0.7) was the correct next step at the time.** A11y is at zero FAILs, validator is FAIL-by-default, tarball is clean, boilerplate theme + Lucide icons ship, theme editor round-trips. Only the publish command itself + a downstream smoke install remain.

8. ~~**`npm publish`**~~ — done. The package shipped via semantic-release through the 0.7/0.8 line; the 1.x line first published to the public registry 2026-09-01.
9. ~~**Boilerplate consumer install**~~ — done. boiler-project-ai consumes cia (all components + app pages migrated to the `cia` import, 2026-07-11).

### After v0.7 ships

14. **Ship theme-specific `icons.svg`** for each of the 5 non-Sketchbook themes (or just a couple to prove the per-theme override mechanism). Mechanism is proven; only the demo content is missing.
17. **Phase 7 differentiators**:
    - Zero-JS interactive components, TS token bridge, intrinsic layout mixins, Tailwind→Awesome CLI, `/showcase` page, component depth audit — all unstarted.
18. **Phase 8 companion products** — Gremlin UI + Gremlin Boilerplate. Trigger: cia 1.0 ships and ~17 boilerplate-wanted components are stable.

### Smaller items still on the board

- ~~**Utilities searchable table** at `/docs/utilities`~~ — shipped (route live on the docs site).
- ~~**Mixins API reference** at `/docs/mixins`~~ — shipped (README links it as the full reference).
- ~~**README homepage URL** + Pages-deploy verification~~ — done; Pages mirror + cssisawesome.com production both live.
- **Icon index page** listing every glyph in every pack.
- **Pull Sketchbook docs-flourishes** (seal, draft stamp, brush rules) out of any future "base system" port.

---

## YouTube channel — after v1.0 locks in

**Locked 2026-05-26.** End-of-roadmap item by design. No filming until cia v1.0 is stable. Videos recorded against a moving target go stale before they release.

### The lock-in gate (do not record before this)

All of the following must be true before Season 1 production begins:

- [x] cia published to npm (first publish 2026-09-01; 1.x line live)
- [ ] All v1.0 epic acceptance criteria met (42 stories shipped or explicitly punted)
- [ ] No planned mixin renames or API changes within the next 6 months
- [ ] Recipes book stable — at least 11 recipes shipped and not changing
- [ ] Theme editor polish complete (download, share URL, contrast validator)
- [ ] MCP server v1.0 stable; no breaking schema changes planned
- [ ] First 30 days of real consumer signal collected post-launch (catch any "we missed X" before locking content)
- [ ] CHANGELOG settles for at least 30 days without a major API entry

Recording a 12-15 video season takes 3-4 weeks of intensive production. If cia ships v1.0.1 mid-recording with a renamed mixin, half the videos go stale before they release. The gate protects against that.

### The framing — sponsored, not subject

The channel is a **CSS/SCSS knowledge channel sponsored by css-is-awesome**, NOT a cia tutorial channel. Channel name differs from cia (top candidate: **Jerry on CSS** — founder authority, portable across whatever Jerry builds next). cia gets the "brought to you by" credit; the content is broader.

```
WRONG: "How to use css-is-awesome" (limited runway, sales-y)
RIGHT: "Real CSS / modern CSS / design system opinions —
       brought to you by css-is-awesome" (infinite runway, authority)
```

This mirrors Vercel's marketing model (talks about web platform; Next.js sells itself) rather than Linear's (product-focused, slower growth).

### Topic clusters

Six content lanes. cia appears organically across all six — never the headline, always present.

1. **Modern CSS techniques** — container queries, `light-dark()`, anchor positioning, `:has()`, view transitions, scroll-driven animations
2. **Design system opinions** — mixin-first vs class-soup, tokens beyond colors, theme architecture, why component libraries fail
3. **AI + CSS** — how AI agents read CSS, MCP for design systems, prompting Claude for components, the recipe book pattern
4. **Build sessions** — command palette in 15 min, print invoices from HTML, theme editor live-coded
5. **Industry analysis** — Tailwind v4 vs shadcn vs cia, design system failure modes, Bootstrap→modern migration
6. **Tools & tips** — SCSS mixins, dev tools, VS Code extensions, debugging CSS

### Production model — TV seasons

1. **Production block** — 3-4 weeks of intensive batch recording. **12-15 videos per season** (calibrated down from Jerry's initial 27-video target so the math works in 3-4 weeks of part-time production; ~5.5 hrs per video × 13 = ~72 hrs).
2. **Release block** — 1 video per week through the season. 12-15 weeks of content per season at a steady cadence.
3. **Inter-season break** — recharge + plan next batch. 4 weeks typical.
4. **Ad-hoc videos** — slot in between scheduled releases for time-sensitive topics (AI changes, MCP updates, competitor launches, breaking CSS spec news). Label them differently (e.g. "Hot Take" or "News Cut") so they don't confuse the season arc.
5. **Fresh slots** — reserve 2-3 video slots per season for last-minute recording so the season can react to recent events without breaking the schedule.

Roughly **2 seasons per year + ad-hoc = 30-40 videos per year**. Sustainable. Avoids the burnout-by-video-5 that kills most weekly channels.

### Season planning

Each season has a narrative arc. Viewers come back for the next season because they know what it's about.

| Season | Theme | Goal |
|---|---|---|
| **Season 1** | "Modern CSS in 2026" | Broad audience build. Container queries, `light-dark()`, anchor positioning, `:has()`, view transitions. cia mentioned naturally as the sponsor. |
| **Season 2** | "Design System Opinions" | cia's natural territory. Mixin-first, token architecture, theme strategy, why component libraries fail. |
| **Season 3** | "AI + CSS" | cia's distinctive angle. MCP for design systems, prompting Claude for components, the recipe book pattern. |
| **Season 4+** | TBD | Based on what S1-S3 audience responds to. Ship-then-see applies. |

**Final episode of each season teases the next** — 60-second trailer at the end of the season finale. Builds anticipation for the next batch.

### Production setup decisions

Lock these BEFORE video 1 (one-time decisions; reuse forever):

| Decision | Recommendation |
|---|---|
| **Channel name** | Jerry on CSS (top pick), Real CSS, or Awesome CSS |
| **Recording software** | OBS Studio (free, cross-platform) |
| **Microphone** | One decent USB mic — Shure MV7, RØDE NT-USB+, or Audio-Technica AT2020USB+ (~$150-200) |
| **Editing software** | DaVinci Resolve (free, pro-grade) or CapCut (faster for short videos) |
| **Format** | Voice-over screen recording is the starting default (fastest production, lowest friction). Add face-cam after 5-10 videos if Jerry wants. |
| **Length** | 8-15 minutes per video (sweet spot for retention without burnout) |
| **Thumbnail template** | 3-5 word title + visual; consistent design across all videos |
| **Intro/outro motif** | 5 seconds max; don't waste retention budget on branded intros |
| **Description template** | 1-paragraph hook + chapter timestamps + relevant links |
| **Release rhythm** | Same day + time each week during a season (algorithm rewards consistency). Public commitment posted at season start. |

### Calibration math on Jerry's original 27-videos-per-season target

| Step | Time per video |
|---|---|
| Outline / script | 30-60 min |
| Recording (incl. re-takes) | 1-2 hrs |
| Editing | 2-4 hrs |
| Thumbnail design | 20-40 min |
| Description + chapters + tags | 15 min |
| **Total per video** | **~4-7 hrs** |

27 videos × 5.5 hrs average = ~148 hours. In 3-4 weeks of full-time production that's possible but **exhausting** — and Jerry is also building cia + boilerplate-slim in parallel. **12-15 videos per season** uses ~66-83 hours, realistic in 3-4 weeks of half-time YouTube work. If Season 1 production goes faster than expected, batch 3-5 extra videos for Season 1.5 or save for Season 2.

### Success metric

After Season 1 (12-15 videos shipped over 12-15 weeks), the question is: **is the channel growing organically?**

- Subscriber count growing at 50+ per video → working, plan Season 2
- Average view duration > 40% → working, content is right
- Both stagnating → pivot format OR kill the channel; don't grind on dead content

### What this channel is NOT

- NOT a daily vlog
- NOT a sales channel for cia
- NOT a "subscribe, like, comment, hit the bell" channel (that script is dead)
- NOT a guaranteed-weekly-content channel (sustainability over speed)
- NOT a channel for content cross-posted from blog (different medium, different audience)
- NOT something that ships during the v1.0 sprint — see the LOCK-IN GATE above

### Trigger to begin

When the lock-in gate items above are all checked. Likely **3-6 months after v1.0 launches** — give the product time to settle, collect real consumer signal, lock the API, then start filming.

Full strategy + memory (with rationale, name-discussion details, format math, and "ship-then-see" alignment) lives in `project_youtube_channel_strategy.md`.

---

*Roadmap is iterative — phases can be reordered or merged based on what's most useful to ship next.*
