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
- [ ] Fix unquoted color-name warning in `scss/_generator.scss:21` (quote `$key` when interpolating)
- [ ] Pick ONE theme-switch pattern: `[data-theme="dark"]` OR `.theme-dark` — deprecate the other
- [ ] Audit `@use` paths for consumer portability (work with aliased imports)

### Developer experience
- [ ] Add `dist/` build output committed to releases (not git — via npm publish)
- [ ] Add `CHANGELOG.md` with semver discipline
- [ ] Add `LICENSE` file (MIT)
- [ ] Add `.editorconfig` for contribution consistency

### Quality
- [ ] Stylelint config + lint pass on all SCSS
- [ ] `npm run lint` script
- [ ] Verify compile output size (gzipped CSS target: <15 KB for core)

**Release:** `v0.2.0` — first "safe to use" version.

---

## Phase 2 — Bootstrap-Style Utility Classes (v0.3)

**Goal:** The big Bootstrap-parity lever. Give consumers drop-in utility classes so they don't need SCSS at all.

### Utility CSS generation
- [ ] New `scss/_utilities.scss` that emits utility classes from existing tokens
- [ ] **Spacing:** `.m-xs` through `.m-4xl`, `.mt/mr/mb/ml-*`, `.mx/my-*`, same for padding
- [ ] **Typography:** `.text-xs` through `.text-6xl`, `.font-light/normal/semibold/bold`, `.text-primary/secondary/muted`, `.leading-tight/normal/loose`
- [ ] **Colors:** `.bg-surface-*`, `.text-action-*`, `.border-default`, status variants
- [ ] **Layout:** `.flex`, `.flex-center`, `.flex-between`, `.stack`, `.grid`, `.inline`
- [ ] **Display:** `.d-none`, `.d-block`, `.d-flex`, `.d-grid`, `.d-inline-*`
- [ ] **Position:** `.static`, `.relative`, `.absolute`, `.fixed`, `.sticky`
- [ ] **Border/Radius:** `.rounded-sm/md/lg/full`, `.border`, `.border-0`
- [ ] **Shadow:** `.shadow-sm/md/lg/xl`, `.shadow-inner`, `.shadow-none`
- [ ] **Responsive variants:** `.sm:flex`, `.md:text-lg`, etc. (opt-in, doubles output size)

### Build outputs
- [ ] `dist/css-is-awesome.css` — full system + utilities
- [ ] `dist/css-is-awesome.core.css` — tokens + resets only (no utilities)
- [ ] `dist/css-is-awesome.utilities.css` — utilities only (no core)
- [ ] All above as `.min.css` via cssnano

**Release:** `v0.3.0` — consumers can write `<div class="flex-between p-md bg-surface-subtle rounded-lg">` without touching SCSS.

---

## Phase 3 — Theming & Customization (v0.4)

**Goal:** Make it easy to override tokens without forking.

- [ ] Documented override pattern: consumers set CSS custom properties at `:root` to remap any token
- [ ] SCSS-level override pattern: `@use "css-is-awesome/scss/mixins" with ($overrides...)`
- [ ] Brand theming guide (replace `#3A5FCD` with your brand in 3 lines)
- [ ] Multi-brand example: light/dark + brand A/brand B via `[data-theme="brand-a-light"]`
- [ ] Runtime theme-switch JS snippet in docs (localStorage, `prefers-color-scheme` honor)
- [ ] Export Figma Tokens JSON alongside SCSS (for design-tool sync)

**Release:** `v0.4.0` — fully themeable.

---

## Phase 4 — Documentation Site (v0.5)

**Goal:** A living docs site where people can see, copy, and steal.

- [ ] Pick a docs engine (Astro Starlight, VitePress, or plain static site)
- [ ] Sections: Install, Tokens (color/spacing/type grids), Utilities (searchable table), Mixins API, Theming, Migration from Bootstrap
- [ ] Live color swatches, spacing visualizers, type scale preview
- [ ] Copy-to-clipboard code snippets
- [ ] Dark/light toggle in docs (dogfooding)
- [ ] Deploy to GitHub Pages or Vercel under `css-is-awesome.dev` or a subdomain
- [ ] Link docs site in README + package.json `homepage`

**Release:** `v0.5.0` — docs are the pitch.

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

1. **Utility naming:** stay close to Bootstrap (`.p-3`) or Tailwind-like (`.p-md`)? The current token names (`xs/sm/md/lg/xl`) push toward Tailwind-style.
2. **Namespace:** should utilities be prefixed (`.ca-flex`) to avoid collisions with existing codebases?
3. **Default CSS output:** include utilities by default or opt-in?
4. **Browser support target:** modern evergreen only, or include a legacy build?

---

*Roadmap is iterative — phases can be reordered or merged based on what's most useful to ship next.*
