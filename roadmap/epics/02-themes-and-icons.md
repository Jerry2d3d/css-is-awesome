# Epic 2: Themes & Icons

## Summary
Extends the theme ecosystem from "six colored swatches" into a complete, audited, contributor-friendly surface. Ships per-theme icon packs so each theme feels end-to-end authored (Terminal gets pixel glyphs, Press gets serif-editorial marks, etc.), wires a theme-aware icon swap so changing `theme.css` also changes icon visual language, replaces the flat swatches on `/themes` with live rendered thumbnails, writes the theme-authoring guide for the docs site, codifies a community submission flow, and adds CI gates for WCAG AA contrast and per-theme file size. Dark-mode companions close out whichever of the six shipped themes lack a full light/dark pair. Depends on Epic 1's token contract and theme validator; unblocks Epic 4's docs-site theme authoring page.

## Goals
- All 6 shipped themes pass WCAG AA (4.5:1 body text, 3:1 UI/large text) on every defined surface token, verified by a CI script.
- 5 new per-theme icon packs shipped (Press, Graphite, Glass, Cupertino, Terminal), each with the same 8 starter icons Sketchbook ships.
- `/themes` gallery renders a live, in-browser preview of a shared sample page per theme (no static screenshots).
- Every theme's `theme.css` file stays under 2 KB gzipped, enforced in CI.
- Each of the 6 shipped themes has an explicit light/dark pairing decision recorded (companion shipped, or documented as single-mode by design).
- Published theme authoring guide + `CONTRIBUTING-THEMES.md` flow, with at least one external test-run PR merged through it before 1.0.

## Out of scope
- Token system primitives, sizing scale, `$theme-components` map, dark-mode auto-detect mechanism — see Epic 1.
- Docs-site chrome, TOC, search, syntax highlighting — see Epic 5.
- Real docs content beyond the theme authoring page — see Epic 4.
- React component wrappers that consume themes — see Epic 3.
- Visual regression infra for theme snapshots — see Epic 5 (this epic produces the themes; Epic 5 adds the snapshot harness).

## Features

### Feature 2.1: Per-theme icon packs
Each of the 5 non-Sketchbook themes gets its own `public/themes/{name}/icons/` folder containing SVGs that match the theme's visual language. The starter set is the same 8 icons Sketchbook ships (edit, download, check, close, search, menu, arrow-right, chevron-down) so swap is 1:1. Icons are authored as single-color SVGs optimized for CSS-mask rendering. The canonical glyph list (per pack, per tier) is maintained in `roadmap/icons-proposal.md`; this feature implements its Sketchbook-equivalent override slice for the other 5 themes, while Feature 2.10 handles the bundled core pack.

#### User Stories

**US-2.1.1** — As a theme author, I want a documented icon authoring spec (viewBox, stroke width, fill rules, file naming), so that icons I submit render correctly through `m.svg()`.

**Acceptance criteria:**
- [ ] Spec document lists: required 24x24 viewBox, `fill="currentColor"` or solid black, no inline `style` attrs, single `<path>` or `<g>` preferred, kebab-case filename matching mixin arg.
- [ ] Spec includes one worked example SVG reviewed against the mask-render path.
- [ ] Spec is linked from `CONTRIBUTING-THEMES.md` and from Feature 2.4's authoring guide.

**Priority:** P0
**Effort:** 1
**Role:** theme author

**US-2.1.2** — As a consumer, I want Press, Graphite, Glass, Cupertino, and Terminal to each ship the same 8 starter icons as Sketchbook, so that swapping themes never leaves me with missing glyphs.

**Acceptance criteria:**
- [ ] Each theme folder contains: edit, download, check, close, search, menu, arrow-right, chevron-down.
- [ ] Every SVG passes SVGO lint with zero warnings.
- [ ] Every icon renders at 16px and 24px with no visible clipping or anti-alias artifacts.
- [ ] Terminal icons use pixel-grid styling; Press uses serif/editorial; Glass uses thin line; Cupertino uses SF-symbol-adjacent weight; Graphite uses hand-sketched stroke.

**Priority:** P0
**Effort:** 7
**Role:** consumer

**US-2.1.3** — As a designer, I want to see all icon packs side-by-side in a comparison grid, so that I can evaluate whether a theme's icon voice matches the brand I'm considering it for.

**Acceptance criteria:**
- [ ] `/themes/icons` page renders a 6-column grid (one per theme) x 8-row (one per icon).
- [ ] Page is reachable from the main `/themes` gallery.
- [ ] Hovering a cell shows the theme name and icon name as a tooltip.

**Priority:** P1
**Effort:** 1
**Role:** designer

### Feature 2.2: Theme-aware icon swap
Today `$theme-icon-path` is a global. This feature makes the icon set swap together with the theme: loading `themes/terminal/theme.css` should also point the svg mixin at `themes/terminal/icons/`. Must work without JavaScript and without the consumer editing config. The runtime mechanism (`--icon-path` custom property read by the svg mixin) is the same primitive Feature 2.11 formalizes for arbitrary icon-pack switching — this feature scopes it to per-theme override folders, Feature 2.11 generalizes it to top-level packs (lucide / phosphor / heroicons).

#### User Stories

**US-2.2.1** — As a consumer, I want switching `theme.css` to automatically switch the icon set, so that I never see a Sketchbook pencil-stroke icon inside a Terminal theme page.

**Acceptance criteria:**
- [ ] Each theme CSS file sets a `--cia-icon-path` custom property scoped to `:root` (or the theme selector used).
- [ ] The `svg()` mixin reads `--cia-icon-path` at render time with a fallback to the library default.
- [ ] Demo page toggles through all 6 themes and icons update within one paint frame.
- [ ] No JavaScript required for the swap.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.2.2** — As a theme author, I want to override only a subset of icons (e.g. ship my own `check` and `close`, inherit the rest from Sketchbook), so that I don't have to re-draw 8 icons to start a theme.

**Acceptance criteria:**
- [ ] `svg()` mixin supports a fallback lookup: theme path -> default path.
- [ ] When a theme folder is missing an icon, Sketchbook's version renders and a console/build warning is emitted at build time (not at runtime in consumer pages).
- [ ] Behavior is documented in the authoring guide with a worked example.

**Priority:** P1
**Effort:** 3
**Role:** theme author

**US-2.2.3** — As a maintainer, I want the icon-path indirection to cost zero extra HTTP requests when a theme provides all 8 icons, so that the swap doesn't regress performance.

**Acceptance criteria:**
- [ ] Network tab shows exactly N requests for N rendered icons on a theme that ships the full set — no double-fetch and no fallback probe.
- [ ] Lighthouse performance score on the `/themes` preview page does not drop more than 2 points vs the Sketchbook-only baseline.

**Priority:** P1
**Effort:** 1
**Role:** maintainer

### Feature 2.3: Live theme preview thumbnails on /themes
Replace the current colored-swatch cards with live-rendered thumbnails of a shared sample page (hero, button, card, form field, code block, icon row) re-skinned by each theme. Inspired by Raycast's theme store. Thumbnails are real DOM scaled via `transform: scale()`, not static screenshots, so they stay honest as themes evolve.

#### User Stories

**US-2.3.1** — As a designer, I want `/themes` to show a realistic preview of what a page looks like in each theme, so that I can judge fit without cloning the repo.

**Acceptance criteria:**
- [ ] Gallery shows 6 cards, each with a scaled-down rendering of the canonical sample page.
- [ ] Sample page contains: H1, paragraph, primary+secondary button, card, input, code block, 3-icon row.
- [ ] Each card is at least 320x200 and legible at that size.
- [ ] Clicking a card opens the full-size preview.

**Priority:** P1
**Effort:** 3
**Role:** designer

**US-2.3.2** — As a consumer, I want the gallery to load in under 2 seconds on a cold cache over 4G, so that browsing themes feels instant.

**Acceptance criteria:**
- [ ] Each thumbnail is rendered in a scoped container (shadow DOM or scoped CSS) so themes don't leak into each other.
- [ ] Lighthouse mobile performance on `/themes` >= 90.
- [ ] Total transfer for the gallery page <= 150 KB gzipped.

**Priority:** P1
**Effort:** 3
**Role:** consumer

**US-2.3.3** — As a maintainer, I want the sample-page DOM defined in exactly one file, so that adding a new component to the preview updates every theme thumbnail at once.

**Acceptance criteria:**
- [ ] A single `ThemePreview.astro` (or equivalent) component is the canonical sample.
- [ ] Gallery iterates themes and mounts that one component inside each card with the theme CSS applied.
- [ ] Adding a new element to the sample file requires zero changes under `public/themes/`.

**Priority:** P1
**Effort:** 1
**Role:** maintainer

### Feature 2.4: Theme authoring guide (docs-site page)
A complete docs-site page (`/docs/themes/authoring` or similar) walking an author from "I want to build a theme" to "my theme is merged." Covers token contract, file layout, icon pack requirements, contrast targets, size budget, preview workflow, and PR checklist. Pairs with — but is distinct from — `CONTRIBUTING-THEMES.md`: the repo-root file is the terse process; this page is the illustrated tutorial.

#### User Stories

**US-2.4.1** — As a theme author, I want a step-by-step guide that takes me from zero to a working theme file, so that I don't have to reverse-engineer Sketchbook to figure out what's required.

**Acceptance criteria:**
- [ ] Guide covers, in order: scaffolding the folder, required token list, optional token list, icon pack requirements, running the validator, running the contrast audit, running the size audit, generating a preview, opening the PR.
- [ ] Every required token is listed with its semantic purpose, not just a name.
- [ ] Guide includes a complete worked example (a fictional "Newsprint" theme built end-to-end).

**Priority:** P0
**Effort:** 3
**Role:** theme author

**US-2.4.2** — As a theme author, I want copy-paste starter code for a minimal theme.css, so that I start from a scaffold not a blank file.

**Acceptance criteria:**
- [ ] Guide includes a `theme.css` skeleton with every required custom property listed and commented.
- [ ] A "copy" button on the code block copies the scaffold to clipboard.
- [ ] Scaffold passes the Epic 1 theme validator on first save with only placeholder values.

**Priority:** P0
**Effort:** 1
**Role:** theme author

**US-2.4.3** — As a designer, I want the guide to explain the design constraints (one file, tokens only, no component-level overrides), so that I understand why the system is shaped this way before I propose a theme that breaks it.

**Acceptance criteria:**
- [ ] Guide has a "Philosophy & constraints" section up front that restates the theme-as-one-file rule.
- [ ] Section explicitly calls out what a theme cannot do (e.g. add selectors beyond :root / [data-theme], ship JS, override component layout).
- [ ] Section links to the locked design decision record.

**Priority:** P1
**Effort:** 1
**Role:** designer

### Feature 2.5: Community submission flow
End-to-end process a contributor follows to submit a theme. Codified in `CONTRIBUTING-THEMES.md` (file produced by Epic 1) and enforced by the PR template, validator, and CI gates this epic ships.

#### User Stories

**US-2.5.1** — As a theme author, I want a PR template that lists every requirement, so that I don't submit a theme missing an icon pack or a contrast check.

**Acceptance criteria:**
- [ ] `.github/PULL_REQUEST_TEMPLATE/theme.md` exists and is selectable at PR creation time.
- [ ] Template checkboxes cover: validator passing, contrast audit passing, size audit passing, icon pack present, preview screenshot attached, license declared.
- [ ] Template links to the authoring guide and `CONTRIBUTING-THEMES.md`.

**Priority:** P1
**Effort:** 1
**Role:** theme author

**US-2.5.2** — As a maintainer, I want theme PRs automatically checked by CI before I review, so that I only spend my time on design feedback, not checklist enforcement.

**Acceptance criteria:**
- [ ] CI job triggers on any PR that touches `public/themes/**`.
- [ ] Job runs validator, contrast audit, size audit; posts a single consolidated PR comment with pass/fail per check.
- [ ] Failing checks block merge via required status check.

**Priority:** P1
**Effort:** 3
**Role:** maintainer

**US-2.5.3** — As a maintainer, I want an end-to-end test run of the submission flow before 1.0, so that we know the documented process actually works for an outsider.

**Acceptance criteria:**
- [ ] At least one contributor (not a core maintainer) submits a theme via the documented flow.
- [ ] The submission is merged or rejected with documented feedback.
- [ ] Any friction discovered is filed as issues and either fixed or deferred with a label before 1.0.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

### Feature 2.6: Color contrast audit CI
A script walks every shipped theme, computes WCAG contrast ratios for every semantic foreground/background pair defined by the token contract, and fails CI if any pair drops below AA. Runs on PR for changed themes and on schedule for all themes (catches regressions from base-library token renames).

#### User Stories

**US-2.6.1** — As an accessibility reviewer, I want every shipped theme to pass WCAG AA on all body-text surface pairs, so that consumers don't have to audit themes themselves.

**Acceptance criteria:**
- [ ] Audit covers every `--cia-bg-*` / `--cia-fg-*` pair the token contract defines as "text on surface."
- [ ] Body-text pairs must score >= 4.5:1; large-text and UI pairs must score >= 3:1.
- [ ] All 6 shipped themes pass as of merge-to-main; audit output is archived per release tag.

**Priority:** P0
**Effort:** 3
**Role:** accessibility reviewer

**US-2.6.2** — As a CI system, I want to run the audit automatically on any PR that modifies `public/themes/**` or `public/theme.css`, so that regressions never reach main.

**Acceptance criteria:**
- [ ] GitHub Action triggers on `public/themes/**` and `public/theme.css` paths.
- [ ] Action runs the audit script, posts results as a PR comment, and sets a required status check.
- [ ] Failure output names the exact token pair and the measured ratio (e.g. `--cia-bg-surface / --cia-fg-body: 3.8:1 (need 4.5:1)`).

**Priority:** P0
**Effort:** 1
**Role:** CI system

**US-2.6.3** — As a theme author, I want to run the same audit locally before I push, so that I don't waste a CI round trip on a failure I could have caught.

**Acceptance criteria:**
- [ ] `npm run audit:contrast -- --theme=<name>` runs the same check CI runs.
- [ ] Local and CI output are identical.
- [ ] Command is documented in the authoring guide.

**Priority:** P1
**Effort:** 1
**Role:** theme author

### Feature 2.7: Theme size/perf audit
Each `theme.css` file has a hard budget of 2 KB gzipped. A CI script measures the size of every theme file and fails the build if any exceeds the budget. Also reports cumulative size across all shipped themes on each release tag.

#### User Stories

**US-2.7.1** — As a maintainer, I want every shipped `theme.css` to stay under 2 KB gzipped, so that the "one tiny file swaps a theme" promise stays true.

**Acceptance criteria:**
- [ ] Budget is enforced as a CI failure, not a warning.
- [ ] All 6 current shipped themes are under 2 KB gzipped at merge of this story.
- [ ] Budget value lives in one config file so it can be tuned without hunting scripts.

**Priority:** P1
**Effort:** 1
**Role:** maintainer

**US-2.7.2** — As a theme author, I want clear feedback when my theme exceeds the budget, including which tokens or selectors are costing the most bytes, so that I can trim intelligently.

**Acceptance criteria:**
- [ ] Audit output shows raw bytes, gzipped bytes, and % of budget used.
- [ ] On failure, output ranks declarations by byte cost so the author sees the heaviest lines first.
- [ ] Audit documented in the authoring guide with an example of reading the output.

**Priority:** P1
**Effort:** 1
**Role:** theme author

**US-2.7.3** — As a CI system, I want the size audit to run on every PR that touches theme files, so that size regressions are caught pre-merge.

**Acceptance criteria:**
- [ ] Action triggers on `public/themes/**` and `public/theme.css`.
- [ ] Result is posted as a PR comment and sets a required status check.
- [ ] Cumulative size across all themes is reported on release-tag runs and archived.

**Priority:** P1
**Effort:** 1
**Role:** CI system

### Feature 2.8: Dark-mode companions
Each shipped theme gets an explicit light/dark disposition: companion shipped, or documented as single-mode by design (e.g. Terminal stays dark-only). For themes that should pair, ship the companion file; for themes that shouldn't, record the rationale. Wiring to auto-detect `prefers-color-scheme` is Epic 1's job — this feature just ensures the content exists.

#### User Stories

**US-2.8.1** — As a consumer, I want every theme that makes sense in both light and dark to ship both variants, so that I can respect user system preference.

**Acceptance criteria:**
- [ ] Pairing matrix recorded in the authoring guide for all 6 themes: Sketchbook (light + dark), Press (light + dark), Graphite (dark, companion light), Glass (light + dark), Cupertino (light + dark), Terminal (dark only by design).
- [ ] Each paired theme ships both files under `public/themes/{name}/theme.css` and `public/themes/{name}/theme-dark.css` (or equivalent convention agreed with Epic 1).
- [ ] Each paired dark companion passes the Feature 2.6 contrast audit.

**Priority:** P1
**Effort:** 7
**Role:** consumer

**US-2.8.2** — As a designer, I want single-mode themes (e.g. Terminal light-less) to state that intent explicitly, so that I know it's a design decision not an oversight.

**Acceptance criteria:**
- [ ] Each single-mode theme has a "Mode" field in its README/frontmatter stating "dark only" or "light only" with a one-line rationale.
- [ ] `/themes` gallery shows a "Dark only" / "Light only" badge on single-mode themes.
- [ ] Authoring guide explains when single-mode is an acceptable choice.

**Priority:** P1
**Effort:** 1
**Role:** designer

**US-2.8.3** — As an accessibility reviewer, I want dark companions to meet the same WCAG AA bar as their light counterparts, so that dark mode is not a second-class experience.

**Acceptance criteria:**
- [ ] Contrast audit (Feature 2.6) runs against both light and dark companions of every paired theme.
- [ ] Both variants must pass AA for merge; no "dark is best-effort" exception.
- [ ] Audit report breaks down pass/fail per variant.

**Priority:** P0
**Effort:** 1
**Role:** accessibility reviewer

### Feature 2.9: Browser-based themes editor (/themes/editor)
A pure client-side theme editor at `/themes/editor` that lets anyone draft, preview, and download a contract-valid `theme.css` without cloning the repo or editing files. Side panel exposes a control for every contract slot (surfaces, ink, lines, primary, seal, accent, code, type, radius, shadow, blur, glow, motion). Live preview renders a sample page (buttons, cards, forms, code blocks, icons) inside an iframe so style writes don't bleed into the docs chrome. Three top-level actions: "Start from theme X" (any of the 6 shipped themes plus the boilerplate from Feature 2.12), "Reset," and "Download theme.css" (Blob → `<a download>`). Edits autosave to localStorage so a tab close doesn't lose work. Validation runs in-browser against a JS port of `scripts/theme-contract.json` and blocks download when any required token is missing or malformed.

#### User Stories

**US-2.9.1** — As a theme author, I want to draft a complete theme entirely in the browser without touching files, so that I can iterate on a design before committing to a PR scaffold.

**Acceptance criteria:**
- [ ] `/themes/editor` ships as a static page; no server, no auth, no network calls beyond initial assets.
- [ ] Side panel renders one control per contract slot (color picker for color tokens; numeric/select for radius/shadow/blur/glow/motion; font-family text input for type tokens).
- [ ] Live preview iframe re-renders within one paint frame of any control change.
- [ ] Preview sample page covers: H1/H2, paragraph, primary+secondary button, card, input, code block, icon row.
- [ ] No theme styles leak from the iframe into the host page.

**Priority:** P0
**Effort:** 13
**Role:** theme author

**US-2.9.2** — As a new user, I want to start from a preset (any shipped theme or the boilerplate) and tweak from there, so that I'm never staring at a blank slate.

**Acceptance criteria:**
- [ ] "Start from theme X" dropdown lists all 6 shipped themes plus the boilerplate (Feature 2.12).
- [ ] Selecting a preset replaces all current control values with that theme's tokens and re-renders the preview.
- [ ] "Reset" returns to whichever preset was last loaded (not always Sketchbook).
- [ ] Switching presets after edits prompts before discarding unsaved work.

**Priority:** P0
**Effort:** 3
**Role:** new user

**US-2.9.3** — As a theme author, I want the download to produce a contract-valid `theme.css` that passes `node scripts/theme-validator.js` on first save, so that the editor's output is trustworthy and not "draft quality."

**Acceptance criteria:**
- [ ] In-browser validator is a JS port of `scripts/theme-contract.json` and is kept in lockstep with it (single source of truth, regenerated at build).
- [ ] Download button is disabled with an inline error list while validation fails.
- [ ] Generated `theme.css` includes every required token, scoped under a configurable selector (default `[data-theme="custom"]`).
- [ ] Round-tripping: downloading a file, then loading it via "Start from theme" reproduces the same control state byte-for-byte.

**Priority:** P0
**Effort:** 5
**Role:** theme author

**US-2.9.4** — As a new user, I want my in-progress edits to survive a tab close or accidental refresh, so that an hour of tweaking isn't lost to a stray Cmd-W.

**Acceptance criteria:**
- [ ] Every control change writes the working state to localStorage within 500ms (debounced).
- [ ] On reload, the editor restores the last working state (preset + per-token overrides) and shows a "Resumed from autosave" badge.
- [ ] A visible "Clear autosave" action wipes the stored state.
- [ ] Storage key is namespaced (`cia.editor.v1`) so future schema changes can migrate cleanly.

**Priority:** P0
**Effort:** 1
**Role:** new user

### Feature 2.10: Vendored Lucide core icon pack
Replace the current 8-icon `public/icons/` flat folder with a vendored slice of [Lucide](https://lucide.dev) (MIT) covering the ~49 canonical "core" glyphs listed in `roadmap/icons-proposal.md` (8 already shipped + 41 to add: navigation, actions, status, communication, user/security, media). Files land under `public/icons/core/`. License attribution shipped at `public/icons/LICENSE-third-party`. The Sass default `$theme-icon-path` updates from `/icons` to `/icons/core` so consumers get a real default icon set out of the box, not an 8-glyph stub.

#### User Stories

**US-2.10.1** — As a consumer, I want `@include m.svg(<name>)` to resolve to a Lucide glyph by default for any of the 49 canonical core names, so that I don't have to vendor my own icons before I can render a "trash" or "settings" button.

**Acceptance criteria:**
- [ ] All 49 canonical core glyphs from `roadmap/icons-proposal.md` Pack 1 ship under `public/icons/core/<name>.svg`.
- [ ] `$theme-icon-path` default in `scss/theme/_icons.scss` is updated to `/icons/core`.
- [ ] Every glyph passes SVGO lint with zero warnings.
- [ ] Every glyph renders cleanly through `m.svg()` at 16px and 24px (no clipping, no anti-alias artifacts) and inherits `currentColor`.
- [ ] No glyph carries a hardcoded `fill=` attribute that would break mask-mode rendering.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.10.2** — As a consumer, I want clear attribution for the vendored Lucide icons, so that my project meets MIT's notice requirement without me reverse-engineering it.

**Acceptance criteria:**
- [ ] `public/icons/LICENSE-third-party` exists and contains the verbatim Lucide MIT license + upstream version/commit reference.
- [ ] `public/icons/README.md` links to that file from a "Third-party assets" section.
- [ ] Project root `LICENSE` (or NOTICE if used) references third-party attribution at `public/icons/LICENSE-third-party`.

**Priority:** P0
**Effort:** 1
**Role:** consumer

### Feature 2.11: Icon pack switching mechanism
Formalize a multi-pack icon model on top of the per-theme override primitive from Feature 2.2. Top-level subfolders `public/icons/{lucide,phosphor,heroicons}/` each ship the same canonical Pack 1 names so a consumer can switch the entire visual voice by overriding `$theme-icon-path` (e.g. `'/icons/phosphor'`). Themes can additionally bind a pack to themselves by declaring `--icon-path` in their `theme.css`, which the `m.svg` mixin reads at render time — so loading a theme automatically loads its preferred pack with no extra config. Already partially documented at `public/icons/README.md:172`; this feature promotes that note into a first-class authoring surface with worked examples and contract checks.

#### User Stories

**US-2.11.1** — As a consumer, I want to swap the entire icon visual language across my app by changing one Sass variable, so that I can match my theme's brand voice without re-importing every component.

**Acceptance criteria:**
- [ ] At least 2 alternate packs (Phosphor and Heroicons, both permissively licensed) ship under `public/icons/<pack>/` with the same canonical names as `core`.
- [ ] Setting `$theme-icon-path: '/icons/phosphor'` in a consumer config changes every `m.svg` call site to render Phosphor glyphs with no other code changes.
- [ ] Each alternate pack carries its own `LICENSE-third-party` notice and is referenced from `public/icons/README.md`.
- [ ] An icon-contract validator fails CI if any alternate pack is missing a canonical name from the core list.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.11.2** — As a theme author, I want to bind my theme to a specific icon pack via my `theme.css`, so that loading my theme loads its intended icon voice without the consumer editing Sass config.

**Acceptance criteria:**
- [ ] Theme CSS may declare `--icon-path: '/icons/phosphor';` on its theme selector and the `m.svg` mixin honors it at render time.
- [ ] Resolution order is documented: theme `--icon-path` > consumer `$theme-icon-path` > library default (`/icons/core`).
- [ ] `theme-contract.json` lists `--icon-path` as an optional token with a string-URL value type.
- [ ] At least one shipped theme (e.g. Cupertino or Glass) declares `--icon-path` as a worked example.

**Priority:** P0
**Effort:** 1
**Role:** theme author

**US-2.11.3** — As a theme author, I want the icon-pack-switching model documented as a first-class authoring surface, so that I can pick a strategy (use core, bind a public pack, override with my own folder) without reading source.

**Acceptance criteria:**
- [ ] `public/icons/README.md` "Per-theme icon packs" section is rewritten to cover all three modes (consumer override, theme-bound `--icon-path`, per-theme override folder) with one worked example each.
- [ ] The Feature 2.4 authoring guide cross-links to the icons README's pack-switching section.
- [ ] Resolution-order diagram or table is included so the precedence between `--icon-path`, `$theme-icon-path`, and per-theme override folders is unambiguous.

**Priority:** P0
**Effort:** 1
**Role:** theme author

### Feature 2.12: Boilerplate theme
A 7th built-in theme at `public/themes/boilerplate/theme.css` that ships with the library's default token values — no opinionated visual identity yet. Its job is to be the cleanest possible "Start from this" preset for the editor (Feature 2.9) and the most legible "what does the contract actually require" reference for theme authors. Must pass `node scripts/theme-validator.js --all`. Visible on `/themes` and included in the bundled `public/theme.css` as a 7th `[data-theme="boilerplate"]` block. Real visual design lands in a follow-up story; the placeholder version unblocks the editor and the authoring guide.

#### User Stories

**US-2.12.1** — As a theme author, I want a `boilerplate` theme that is just the contract's default values made explicit, so that I can fork it as the most-neutral possible starting point.

**Acceptance criteria:**
- [ ] `public/themes/boilerplate/theme.css` exists with every required token from `scripts/theme-contract.json` set to a sensible default (no missing tokens, no opinionated brand choices).
- [ ] `node scripts/theme-validator.js --all` passes with the new theme included.
- [ ] The file is added as a 7th `[data-theme="boilerplate"]` block to bundled `public/theme.css`.
- [ ] `/themes` gallery (Feature 2.3 thumbnails) renders the boilerplate alongside the other 6.
- [ ] Boilerplate also passes the Feature 2.6 contrast audit and the Feature 2.7 size budget.

**Priority:** P0
**Effort:** 1
**Role:** theme author

**US-2.12.2** — As a designer, I want the boilerplate theme to eventually have a real, distinct visual identity (not just default tokens), so that it earns its slot on `/themes` rather than reading as a debug stub.

**Acceptance criteria:**
- [ ] A design pass replaces placeholder defaults with an opinionated, shippable look (palette, type, radius, shadow language) distinct from the other 6 themes.
- [ ] The redesign keeps every token name and contract; only values change.
- [ ] Updated theme still passes validator, contrast audit, and size budget.
- [ ] `/themes` thumbnail and any docs reference are refreshed.

**Priority:** P1
**Effort:** 5
**Role:** designer

### Feature 2.13: Universal light/dark pairing
Every theme that makes sense as both light and dark ships both modes; themes that are intrinsically single-mode are documented as such. Closes the gap left by Feature 2.8 by enumerating the actual companion files to ship: Sketchbook Dark (charcoal-paper editorial), Press Dark (night-newsroom), Graphite Light (brushed-silver day mode), Glass Dark (visionOS dark glassmorphism), Cupertino Dark (macOS Dark). Terminal stays single-mode by design — CRT phosphor is intrinsically dark — and that decision is recorded explicitly. The already-shipped `public/themes/prism-light/theme.css` and `public/themes/prism-dark/theme.css` are the structural reference: same token contract on both files, same selector pattern (`[data-theme="<name>-light"]` / `[data-theme="<name>-dark"]`), same component-override block, with values retuned for surface inversion. Passes the Feature 2.6 contrast audit on both halves of every pair.

#### User Stories

**US-2.13.1** — As a consumer, I want a Sketchbook Dark companion that preserves Sketchbook's warm-paper editorial voice on a charcoal-paper canvas, so that I can ship Sketchbook to users who prefer dark mode without abandoning the brand identity.

**Acceptance criteria:**
- [ ] `public/themes/sketchbook-dark/theme.css` ships, scoped to `[data-theme="sketchbook-dark"]`.
- [ ] Token contract matches `prism-dark/theme.css` structurally (same token names, same component-override block).
- [ ] Visual treatment is "charcoal paper" — warm dark surfaces, not zinc-neutral — so the editorial voice carries from light to dark.
- [ ] Passes the Feature 2.6 contrast audit and the Feature 2.7 size budget.
- [ ] Bundled `public/theme.css` includes a `[data-theme="sketchbook-dark"]` block.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.13.2** — As a consumer, I want a Press Dark companion that reads like a night-newsroom redesign of Press, so that long-form reading content keeps its serif-editorial character after sunset.

**Acceptance criteria:**
- [ ] `public/themes/press-dark/theme.css` ships, scoped to `[data-theme="press-dark"]`.
- [ ] Token contract matches the Prism reference structurally.
- [ ] Visual treatment is "night newsroom" — desaturated dark paper, ivory ink, restrained accent — distinguishable from generic dark themes.
- [ ] Passes the Feature 2.6 contrast audit and the Feature 2.7 size budget.
- [ ] Bundled `public/theme.css` includes a `[data-theme="press-dark"]` block.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.13.3** — As a consumer, I want a Graphite Light companion that preserves Graphite's brushed-metal voice on a daytime canvas, so that I can use Graphite in light mode without losing the industrial identity.

**Acceptance criteria:**
- [ ] `public/themes/graphite-light/theme.css` ships, scoped to `[data-theme="graphite-light"]`.
- [ ] Token contract matches the Prism reference structurally.
- [ ] Visual treatment is "brushed silver" — light cool grays, polished-metal accent surfaces — distinguishable from Prism light.
- [ ] Passes the Feature 2.6 contrast audit and the Feature 2.7 size budget.
- [ ] Bundled `public/theme.css` includes a `[data-theme="graphite-light"]` block.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.13.4** — As a consumer, I want a Glass Dark companion that delivers visionOS-style dark glassmorphism, so that frosted UIs work in both light and dark contexts without re-authoring the blur/glow tokens.

**Acceptance criteria:**
- [ ] `public/themes/glass-dark/theme.css` ships, scoped to `[data-theme="glass-dark"]`.
- [ ] Token contract matches the Prism reference structurally; `--blur-*` and `--glow-*` token slots are populated meaningfully (not `none`).
- [ ] Visual treatment is "visionOS dark" — translucent dark surfaces, soft inner highlights, retuned glow values for dark backdrops.
- [ ] Passes the Feature 2.6 contrast audit and the Feature 2.7 size budget.
- [ ] Bundled `public/theme.css` includes a `[data-theme="glass-dark"]` block.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.13.5** — As a consumer, I want a Cupertino Dark companion that mirrors macOS Dark, so that Apple-platform-flavored apps feel native in both system appearances.

**Acceptance criteria:**
- [ ] `public/themes/cupertino-dark/theme.css` ships, scoped to `[data-theme="cupertino-dark"]`.
- [ ] Token contract matches the Prism reference structurally.
- [ ] Visual treatment is "macOS Dark" — system-grays palette, vibrancy-adjacent translucency, SF-aligned type and radii.
- [ ] Passes the Feature 2.6 contrast audit and the Feature 2.7 size budget.
- [ ] Bundled `public/theme.css` includes a `[data-theme="cupertino-dark"]` block.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-2.13.6** — As a designer, I want Terminal to stay single-mode by design with that decision recorded explicitly, so that no future contributor mistakes the missing companion for an oversight.

**Acceptance criteria:**
- [ ] `public/themes/terminal/theme.css` README/frontmatter includes `Mode: dark only` with rationale "CRT phosphor is intrinsically dark; a light companion would betray the visual concept."
- [ ] `/themes` gallery shows a "Dark only" badge on the Terminal card (per Feature 2.8.2).
- [ ] The pairing-decision page (US-2.13.7) lists Terminal as `single-mode by design` with the same rationale.

**Priority:** P0
**Effort:** 1
**Role:** designer

**US-2.13.7** — As a theme author, I want a single docs page that records every theme's pairing decision, so that the project's stance on light/dark is unambiguous and reviewable.

**Acceptance criteria:**
- [ ] `/docs/themes/pairing` (or equivalent) lists every shipped theme with one of: "paired (light + dark)", "paired (light + dark, dark by default)", or "single-mode by design (dark only / light only)".
- [ ] Each pairing decision includes a one-line rationale.
- [ ] Page references Prism Light + Prism Dark as the canonical structural example contributors should mirror.
- [ ] Page is linked from the Feature 2.4 authoring guide and from `CONTRIBUTING-THEMES.md`.

**Priority:** P0
**Effort:** 1
**Role:** theme author

### Feature 2.14: Theme naming convention migration
Pre-1.0 breaking change: every shipped theme's name carries an explicit `-light` or `-dark` suffix. `sketchbook` becomes `sketchbook-light`, `graphite` becomes `graphite-dark`, etc. The bundled `public/theme.css` keeps backward-compat aliases for one minor version (`[data-theme="sketchbook"]` aliases to `sketchbook-light`); after that minor version the unsuffixed selectors are removed. The migration unblocks Feature 2.15 (cross-theme mixing) by making the API consistent — no more guessing whether a name is "default light" or "the only mode that exists." Lands together with Feature 2.13 in v0.7 because the new companions need the new naming from day one.

#### User Stories

**US-2.14.1** — As a maintainer, I want every shipped theme folder, bundled `public/theme.css` selector, validator entry, and theme registry entry renamed to the suffixed convention, so that the codebase consistently reflects "every theme name carries a mode."

**Acceptance criteria:**
- [ ] `public/themes/<name>/` folders renamed to `<name>-light` or `<name>-dark` for every theme except Terminal (which already documents its mode separately) — or Terminal renamed to `terminal-dark` if we choose consistency over brevity (decision captured in PR).
- [ ] Bundled `public/theme.css` `[data-theme="<old>"]` selectors updated to the suffixed names.
- [ ] Backward-compat aliases added for one minor version: each old selector aliases to its new counterpart (e.g. `[data-theme="sketchbook"]` reuses the `sketchbook-light` block).
- [ ] Theme validator, registry, and any internal lookup tables updated to the new names.
- [ ] CHANGELOG entry under the v0.7 release marks this as a breaking change with the alias-grace-period note.

**Priority:** P0
**Effort:** 3
**Role:** maintainer

**US-2.14.2** — As a consumer, I want a written migration guide that tells me exactly which `data-theme` strings changed, so that I can update my app's theme switcher in one pass.

**Acceptance criteria:**
- [ ] `/docs/themes/migration-v0.7` (or equivalent) lists the old name → new name table for every theme.
- [ ] Page notes the alias grace period (one minor version) and the version in which unsuffixed names are removed.
- [ ] Page includes a copy-pasteable find-and-replace recipe (regex or simple string list).
- [ ] CHANGELOG and release notes link to this page.

**Priority:** P0
**Effort:** 1
**Role:** consumer

**US-2.14.3** — As a maintainer, I want the alias grace period to expire on a tracked deadline, so that the backward-compat selectors don't quietly live forever.

**Acceptance criteria:**
- [ ] An issue is filed at the time of the v0.7 cut titled "Remove unsuffixed theme aliases in v0.8" and milestoned to v0.8.
- [ ] When v0.8 is cut, the alias selectors are deleted from bundled `public/theme.css` and the migration page is updated to "aliases removed in v0.8."
- [ ] The CHANGELOG entry for v0.8 notes the alias removal.

**Priority:** P1
**Effort:** 1
**Role:** maintainer

### Feature 2.15: Cross-theme mixing
A consumer picks separate themes for light and dark mode independently — for example Sketchbook Light for daytime and Graphite Dark for nighttime — using the existing `data-theme` attribute. Already supported by the model (Feature 2.14's naming convention makes every theme self-describe its mode); this feature adds the documented pattern, an optional helper, and a ThemePicker UI update so that the capability is discoverable without reading source. Cross-references Epic 1's `prefers-color-scheme` auto-detect — this feature swaps the `data-theme` value the auto-detect writes; it does not replace the detect mechanism.

#### User Stories

**US-2.15.1** — As a consumer, I want a documented pattern for picking different themes for light and dark mode using only `data-theme` and a few lines of JS, so that I can ship cross-theme mixing without depending on a library helper.

**Acceptance criteria:**
- [ ] `/docs/themes/cross-theme-mixing` (or equivalent) shows the canonical pattern: read `prefers-color-scheme`, read the consumer's per-mode preference from storage, write the matching `<name>-light` or `<name>-dark` value to `document.documentElement.dataset.theme`.
- [ ] Page includes a complete copy-pasteable JS snippet (no framework required).
- [ ] Page references Prism Light + Prism Dark as the worked example pair.
- [ ] Page links to Feature 2.14's migration guide (the suffixed naming is what makes this pattern work).

**Priority:** P1
**Effort:** 1
**Role:** consumer

**US-2.15.2** — As a consumer, I want an optional `cross-theme-helper.js` utility that wires up `prefers-color-scheme`, localStorage, and the DOM update for me, so that I don't have to hand-roll the same 30 lines on every project.

**Acceptance criteria:**
- [ ] `cross-theme-helper.js` ships under `public/scripts/` (or equivalent) as a single dependency-free module.
- [ ] Public API takes a light theme name + a dark theme name (e.g. `setupCrossTheme('sketchbook-light', 'graphite-dark')`) and handles: initial read of `prefers-color-scheme`, listening for system changes, persisting per-mode override to localStorage, writing `data-theme` to the document element.
- [ ] Module is fully optional — the documented pattern (US-2.15.1) works without it.
- [ ] Source is under 2 KB minified and ships an inline JSDoc usage example.

**Priority:** P1
**Effort:** 3
**Role:** consumer

**US-2.15.3** — As a new user, I want the `/themes` ThemePicker UI to expose two dropdowns — Light theme and Dark theme — so that I can preview cross-theme mixing without writing code.

**Acceptance criteria:**
- [ ] ThemePicker renders two dropdowns: "Light theme" lists every theme whose name ends in `-light` (plus light-only single-mode themes); "Dark theme" lists every theme ending in `-dark` (plus dark-only single-mode themes like Terminal).
- [ ] Selecting a value updates the stored per-mode preference and applies the matching theme based on current `prefers-color-scheme`.
- [ ] A "Match system" toggle reverts to the OS preference for active mode.
- [ ] Selections persist across page reloads.

**Priority:** P1
**Effort:** 3
**Role:** new user

**US-2.15.4** — As a theme author, I want the cross-theme-mixing docs page to ship a worked example using Sketchbook Light + Graphite Dark, so that the pattern is concrete rather than abstract.

**Acceptance criteria:**
- [ ] Docs page (US-2.15.1) includes a live demo with `sketchbook-light` set as the light pick and `graphite-dark` set as the dark pick.
- [ ] Demo lets the visitor flip the OS appearance (or a simulated toggle) and shows both themes resolving correctly.
- [ ] Demo references Prism Light + Prism Dark as the "matched pair" alternative (vs. the deliberately-mixed Sketchbook + Graphite shown in the demo) so authors see both strategies.

**Priority:** P1
**Effort:** 1
**Role:** theme author

### Feature 2.16: Add-ons — drop-in themes, icon packs, animation extras
Post-1.0 expansion model. Beyond the core themes (Feature 2.13) and the bundled Lucide / Phosphor / Heroicons packs (Features 2.10, 2.11), additional themes, icon packs, animation libraries, and mixin extras ship as **add-ons**: self-contained assets that depend on css-is-awesome but are distributed separately. Each add-on follows the same one-file model the system already enforces — a theme add-on is one `theme.css`, an icon-pack add-on is one folder of SVGs that satisfies the icon-pack contract from Feature 2.11, an animation add-on is a single SCSS partial of keyframes/mixins. No runtime; assets only. The styling-system equivalent of how shadcn distributes components: a curated catalog people pull from, each piece self-contained, no build required. Distribution mechanism (dedicated npm packages like `@css-is-awesome/themes-extra` and `@css-is-awesome/icons-phosphor` vs. a single registry / download index) is an open question. The same theme validator and icon-pack contract checks that gate in-core submissions (Features 2.5, 2.6, 2.7, 2.11) gate add-on submissions too — the difference is distribution surface, not quality bar. Cross-theme mixing (Feature 2.15) and naming conventions (Feature 2.14) apply to add-on themes unchanged.

#### User Stories

**US-2.16.1** — As a system author, I want a single CI-runnable validator entry point that checks any add-on (theme file, icon pack folder, animation partial) against its respective contract, so that add-on submissions are gated by the same quality bar as in-core assets without forking the validator.

**Acceptance criteria:**
- [ ] `npm run validate:addon -- --type=theme --path=<file>` runs `scripts/theme-validator.js` against an arbitrary `theme.css` outside the repo's `public/themes/` tree.
- [ ] `npm run validate:addon -- --type=icons --path=<dir>` runs the icon-pack contract check from Feature 2.11 (canonical names present, SVGO clean, no hardcoded `fill=`, `currentColor` or solid black, no inline `style`).
- [ ] `npm run validate:addon -- --type=animation --path=<file>` lints an animation SCSS partial against an "animation add-on contract" (keyframes namespaced under `cia-`, no global selectors, no JS).
- [ ] All three subcommands share the same JSON output schema so downstream tooling (catalog, PR bots) reads them uniformly.
- [ ] Validator is published as a CLI binary so add-on authors can run it from their own repos without cloning css-is-awesome.

**Priority:** P2
**Effort:** 5
**Role:** system author

**US-2.16.2** — As a theme author, I want a documented path to publish a new theme as an add-on package without merging into core, so that I can ship a niche or branded theme on my own release cadence.

**Acceptance criteria:**
- [ ] `CONTRIBUTING-THEMES.md` (already exists per Feature 2.5) gains an "Add-ons" section linking to a step-by-step add-on publishing guide.
- [ ] Guide covers: scaffolding the add-on package layout, running the Feature 2.16.1 validator, declaring the css-is-awesome version compatibility range, naming conventions for the published artifact, and the catalog-submission step (US-2.16.4).
- [ ] Guide includes a worked example (a fictional theme published as a standalone npm package or downloadable file).
- [ ] Cross-references Feature 2.13 (light/dark pairing expectations apply to add-on themes too) and Feature 2.14 (suffixed naming convention applies to add-on themes too).

**Priority:** P2
**Effort:** 3
**Role:** theme author

**US-2.16.3** — As a contributor, I want an icon-pack-specific submission guide (`CONTRIBUTING-ICONS.md`), so that the rules for shipping an alternate icon pack as an add-on are as clear as the rules for shipping a theme.

**Acceptance criteria:**
- [ ] `CONTRIBUTING-ICONS.md` exists at the repo root, mirrors the structure of `CONTRIBUTING-THEMES.md`, and is referenced from the Feature 2.16.2 add-ons guide.
- [ ] Document covers the icon-pack contract from Feature 2.11 (canonical names, SVGO, `currentColor`), licensing/attribution requirements, optional pack metadata (display name, version, source URL), and the validator command from US-2.16.1.
- [ ] Document explicitly distinguishes "in-core pack" (lands under `public/icons/<pack>/`, ships in the bundle) from "add-on pack" (ships separately, consumer-installed) and notes that the contract is identical.
- [ ] Document is linked from the Feature 2.4 authoring guide, the Feature 2.16.2 add-on publishing guide, and `public/icons/README.md`.

**Priority:** P2
**Effort:** 1
**Role:** contributor

**US-2.16.4** — As a consumer, I want a catalog page on the docs site that lists every shipped + community add-on, so that I can discover and install themes, icon packs, and animation libraries without trawling GitHub or npm.

**Acceptance criteria:**
- [ ] `/docs/add-ons` (or equivalent) renders a filterable catalog with cards for every shipped + accepted community add-on, grouped by type (themes / icon packs / animations / mixin extras).
- [ ] Each card shows: name, type, author, version, license, css-is-awesome compatibility range, install command (or download link), and a live preview where applicable (theme thumbnail per Feature 2.3, icon grid per Feature 2.1.3).
- [ ] Catalog data lives in a single source-of-truth manifest in the repo (e.g. `roadmap/add-ons-registry.json`) so adding an add-on is a one-line PR.
- [ ] Catalog page is linked from `/themes` and `/docs/themes/authoring`.

**Priority:** P2
**Effort:** 5
**Role:** consumer

**US-2.16.5** — As a maintainer, I want a decided distribution mechanism for add-ons (dedicated npm packages, a single registry, a download index, or a hybrid), so that future add-on submissions follow one canonical path rather than ad-hoc per-asset.

**Acceptance criteria:**
- [ ] An ADR (architecture decision record) under `docs/decisions/` evaluates: (a) one npm package per add-on under a `@css-is-awesome/*` scope, (b) a single registry repo with a manifest + downloadable assets, (c) a hybrid where themes are downloads and icon packs are npm packages, (d) GitHub Releases on a dedicated `css-is-awesome-addons` repo.
- [ ] ADR captures trade-offs for each option (discoverability, install ergonomics, version pinning, hosting cost, security review surface).
- [ ] ADR concludes with a chosen mechanism and a rollout plan; all subsequent 2.16.x stories assume that mechanism.
- [ ] **Open question** flagged here remains open until this story merges.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

**US-2.16.6** — As a maintainer, I want a governance policy for community add-ons covering versioning, deprecation, and security review (especially for SVG payloads), so that the catalog stays trustworthy as it grows.

**Acceptance criteria:**
- [ ] A `GOVERNANCE-ADDONS.md` document defines: SemVer expectations per add-on, the css-is-awesome compatibility-range declaration required of every add-on, the deprecation flow (when an add-on is unmaintained or breaks compatibility), and the catalog removal criteria.
- [ ] Document defines a security review checklist for SVG add-ons: no embedded `<script>` or event-handler attrs, no external `xlink:href`, no inline `<style>` with @import, no foreignObject, SVGO clean — automated where possible via the Feature 2.16.1 validator.
- [ ] Document defines a security review process for any add-on that ships JS (animation packs that include helper utilities, etc.) and either bans JS in add-ons outright or requires a manual maintainer review on each version bump.
- [ ] Document is linked from the catalog page (US-2.16.4), `CONTRIBUTING-THEMES.md`, and `CONTRIBUTING-ICONS.md`.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

## Dependencies
- Blocked by: Epic 1 (Library Foundations) — needs the token contract and theme validator in place before per-theme work can be audited consistently, and before `CONTRIBUTING-THEMES.md` has a stable reference surface.
- Blocks: Epic 4 (Documentation Site) — the docs-site theme authoring page references this epic's icon-pack format and audit commands.
- Blocks: Epic 5 (Quality & Delivery) — visual regression snapshots of theme previews depend on the `/themes` thumbnail component shipped here.

## Priority
P0 overall. Sub-priorities:
- **P0** — contrast audit (2.6), first round of per-theme icon packs (2.1), theme-aware icon swap (2.2), authoring guide (2.4), dark-companion contrast parity (2.8.3), browser-based themes editor (2.9), vendored Lucide core pack (2.10), icon pack switching mechanism (2.11), boilerplate theme placeholder (2.12.1), universal light/dark pairing (2.13 — all five new companions, Terminal single-mode rationale, pairing-decision page; lands in v0.7), naming convention migration (2.14.1 + 2.14.2; ships with the new companions in v0.7 because the breaking name change drops here).
- **P1** — preview thumbnails (2.3), size/perf audit (2.7), dark companions content (2.8.1/2.8.2), icon comparison grid (2.1.3), PR template + CI gating (2.5.1/2.5.2), boilerplate theme real design (2.12.2), naming-alias removal follow-up (2.14.3), cross-theme mixing (2.15 — pattern docs, optional helper, ThemePicker dual-dropdown, worked Sketchbook + Graphite example; can ship after v0.7 if it slips).
- **P2** — end-to-end community submission dry run (2.5.3), add-ons distribution layer (2.16 — drop-in themes / icon packs / animation extras, validator CLI, `CONTRIBUTING-ICONS.md`, catalog page, distribution-mechanism ADR, governance policy; lands post-1.0 once the in-core surface is stable).
