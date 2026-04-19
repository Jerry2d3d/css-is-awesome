# css-is-awesome — Roadmap

A phased plan to turn the extracted SCSS system into a polished, Bootstrap-style distributable library. Each phase stands on its own and can ship independently.

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

**Decision:** plain static HTML — no docs engine. Dogfoods the system. Zero build step.

### Template (DONE)
- [x] Ported Sketchbook sketch → `docs/` (index, docs, examples, blog, about)
- [x] Favicon wired to every page
- [x] Two-file contract: `theme.css` (swappable tokens) + `styles.css` (base system)
- [x] SCSS source mirrored in `docs/src/` for devs who compile
- [x] `docs/README.md` with run + swap instructions

### Positioning
- **Landing:** stays clean and fast. No heavy demos, no interactive widgets. One screen, <1s load. Logo, tagline, manifesto, nav. That's it.
- **Power demos live inside** — where the reader is already committed.

### Content (TODO)
- [ ] Replace placeholder docs copy with real install/usage for the published `cia-` system
- [ ] Sections: Tokens (color/spacing/type grids), Utilities (searchable table), Mixins API, Migration from Bootstrap
- [ ] Live color swatches, spacing visualizers, type scale preview
- [ ] Copy-to-clipboard code snippets
- [ ] Deploy to GitHub Pages or Vercel under `css-is-awesome.dev` or subdomain
- [ ] Link docs site in README + package.json `homepage`

### New pages
- [ ] **`/docs` intro page** — first interactive demo: live theme-swap widget at the top of the docs landing. "Click a theme → whole page reskins."
- [ ] **`/compare` page** — honest three-column comparison: css-is-awesome vs Tailwind vs Bootstrap. Where each wins, where each loses. Embed the theme-swap demo as the "this is the thing the others can't do" moment.
- [ ] **`/showcase` page** — real-looking full pages built with the system (marketing / blog / dashboard / admin / 404), all theme-swappable via a single toggle at the top. Answers "what can I do with it?" visually.

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
- [ ] Lock the **token API contract** — the list of CSS vars every theme must define. Once locked, themes version against this.
- [ ] Decide **sizing scale** (numbered 1–9 vs t-shirt sm/md/lg) before locking contract — breaking change if changed later.
- [ ] Pull Sketchbook's docs-specific flourishes (construction lines, seal, draft stamp, brush rules) out of any future "base system" port — they belong in docs chrome only.
- [ ] Ship Theme #2 (candidate: dark, brutalist, or clean-bootstrap-like) to prove the swap.
- [ ] Build the `/themes` gallery page — live preview + one-click download.
- [ ] Write `CONTRIBUTING-THEMES.md` for community submissions later.

**Release:** `v0.5.x` — theme system live, 2+ themes shipped.

---

## Phase 5 — Distribution & CDN (v0.6)

**Goal:** Make it as easy to use as Bootstrap.

- [ ] Publish to npm (`npm publish --access public`)
- [ ] Verify jsDelivr + unpkg auto-serve the `dist/` files
- [ ] README "CDN" section with exact `<link>` tag
- [ ] SRI hashes for security-conscious users
- [ ] GitHub Release with bundled zip download (for non-npm users)
- [ ] `package.json` `exports` field for correct module resolution

**Release:** `v1.0.0` — first production release. SemVer begins.

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

1. **Lock sizing scale** (t-shirt vs numbered) — this gates everything downstream.
2. **Lock theme token API contract** — the exact list of `:root` vars themes must define.
3. **Build Theme #2** to prove the swap mechanism.
4. **Build `/compare` page** — three-column table vs Tailwind/Bootstrap + embedded theme-swap demo.
5. **Build `/showcase` page** — full-page examples with a single theme toggle at top.
6. **Add live theme-swap demo to docs intro** (first thing readers see inside docs).
7. **Replace placeholder docs copy** with real usage for the `cia-` system.
8. **Wire the `/themes` gallery page** with live `<link>` swap preview + download buttons.

---

*Roadmap is iterative — phases can be reordered or merged based on what's most useful to ship next.*
