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
- Visual regression infra for theme snapshots — see Epic 6 (this epic produces the themes; Epic 6 adds the snapshot harness).

## Features

### Feature 2.1: Per-theme icon packs
Each of the 5 non-Sketchbook themes gets its own `public/themes/{name}/icons/` folder containing SVGs that match the theme's visual language. The starter set is the same 8 icons Sketchbook ships (edit, download, check, close, search, menu, arrow-right, chevron-down) so swap is 1:1. Icons are authored as single-color SVGs optimized for CSS-mask rendering.

#### User Stories

**US-2.1.1** — As a theme author, I want a documented icon authoring spec (viewBox, stroke width, fill rules, file naming), so that icons I submit render correctly through `m.svg()`.

**Acceptance criteria:**
- [ ] Spec document lists: required 24x24 viewBox, `fill="currentColor"` or solid black, no inline `style` attrs, single `<path>` or `<g>` preferred, kebab-case filename matching mixin arg.
- [ ] Spec includes one worked example SVG reviewed against the mask-render path.
- [ ] Spec is linked from `CONTRIBUTING-THEMES.md` and from Feature 2.4's authoring guide.

**Priority:** P0
**Effort:** S

**US-2.1.2** — As a consumer, I want Press, Graphite, Glass, Cupertino, and Terminal to each ship the same 8 starter icons as Sketchbook, so that swapping themes never leaves me with missing glyphs.

**Acceptance criteria:**
- [ ] Each theme folder contains: edit, download, check, close, search, menu, arrow-right, chevron-down.
- [ ] Every SVG passes SVGO lint with zero warnings.
- [ ] Every icon renders at 16px and 24px with no visible clipping or anti-alias artifacts.
- [ ] Terminal icons use pixel-grid styling; Press uses serif/editorial; Glass uses thin line; Cupertino uses SF-symbol-adjacent weight; Graphite uses hand-sketched stroke.

**Priority:** P0
**Effort:** L

**US-2.1.3** — As a designer, I want to see all icon packs side-by-side in a comparison grid, so that I can evaluate whether a theme's icon voice matches the brand I'm considering it for.

**Acceptance criteria:**
- [ ] `/themes/icons` page renders a 6-column grid (one per theme) x 8-row (one per icon).
- [ ] Page is reachable from the main `/themes` gallery.
- [ ] Hovering a cell shows the theme name and icon name as a tooltip.

**Priority:** P1
**Effort:** S

### Feature 2.2: Theme-aware icon swap
Today `$theme-icon-path` is a global. This feature makes the icon set swap together with the theme: loading `themes/terminal/theme.css` should also point the svg mixin at `themes/terminal/icons/`. Must work without JavaScript and without the consumer editing config.

#### User Stories

**US-2.2.1** — As a consumer, I want switching `theme.css` to automatically switch the icon set, so that I never see a Sketchbook pencil-stroke icon inside a Terminal theme page.

**Acceptance criteria:**
- [ ] Each theme CSS file sets a `--cia-icon-path` custom property scoped to `:root` (or the theme selector used).
- [ ] The `svg()` mixin reads `--cia-icon-path` at render time with a fallback to the library default.
- [ ] Demo page toggles through all 6 themes and icons update within one paint frame.
- [ ] No JavaScript required for the swap.

**Priority:** P0
**Effort:** M

**US-2.2.2** — As a theme author, I want to override only a subset of icons (e.g. ship my own `check` and `close`, inherit the rest from Sketchbook), so that I don't have to re-draw 8 icons to start a theme.

**Acceptance criteria:**
- [ ] `svg()` mixin supports a fallback lookup: theme path -> default path.
- [ ] When a theme folder is missing an icon, Sketchbook's version renders and a console/build warning is emitted at build time (not at runtime in consumer pages).
- [ ] Behavior is documented in the authoring guide with a worked example.

**Priority:** P1
**Effort:** M

**US-2.2.3** — As a maintainer, I want the icon-path indirection to cost zero extra HTTP requests when a theme provides all 8 icons, so that the swap doesn't regress performance.

**Acceptance criteria:**
- [ ] Network tab shows exactly N requests for N rendered icons on a theme that ships the full set — no double-fetch and no fallback probe.
- [ ] Lighthouse performance score on the `/themes` preview page does not drop more than 2 points vs the Sketchbook-only baseline.

**Priority:** P1
**Effort:** S

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
**Effort:** M

**US-2.3.2** — As a consumer, I want the gallery to load in under 2 seconds on a cold cache over 4G, so that browsing themes feels instant.

**Acceptance criteria:**
- [ ] Each thumbnail is rendered in a scoped container (shadow DOM or scoped CSS) so themes don't leak into each other.
- [ ] Lighthouse mobile performance on `/themes` >= 90.
- [ ] Total transfer for the gallery page <= 150 KB gzipped.

**Priority:** P1
**Effort:** M

**US-2.3.3** — As a maintainer, I want the sample-page DOM defined in exactly one file, so that adding a new component to the preview updates every theme thumbnail at once.

**Acceptance criteria:**
- [ ] A single `ThemePreview.astro` (or equivalent) component is the canonical sample.
- [ ] Gallery iterates themes and mounts that one component inside each card with the theme CSS applied.
- [ ] Adding a new element to the sample file requires zero changes under `public/themes/`.

**Priority:** P1
**Effort:** S

### Feature 2.4: Theme authoring guide (docs-site page)
A complete docs-site page (`/docs/themes/authoring` or similar) walking an author from "I want to build a theme" to "my theme is merged." Covers token contract, file layout, icon pack requirements, contrast targets, size budget, preview workflow, and PR checklist. Pairs with — but is distinct from — `CONTRIBUTING-THEMES.md`: the repo-root file is the terse process; this page is the illustrated tutorial.

#### User Stories

**US-2.4.1** — As a theme author, I want a step-by-step guide that takes me from zero to a working theme file, so that I don't have to reverse-engineer Sketchbook to figure out what's required.

**Acceptance criteria:**
- [ ] Guide covers, in order: scaffolding the folder, required token list, optional token list, icon pack requirements, running the validator, running the contrast audit, running the size audit, generating a preview, opening the PR.
- [ ] Every required token is listed with its semantic purpose, not just a name.
- [ ] Guide includes a complete worked example (a fictional "Newsprint" theme built end-to-end).

**Priority:** P0
**Effort:** M

**US-2.4.2** — As a theme author, I want copy-paste starter code for a minimal theme.css, so that I start from a scaffold not a blank file.

**Acceptance criteria:**
- [ ] Guide includes a `theme.css` skeleton with every required custom property listed and commented.
- [ ] A "copy" button on the code block copies the scaffold to clipboard.
- [ ] Scaffold passes the Epic 1 theme validator on first save with only placeholder values.

**Priority:** P0
**Effort:** S

**US-2.4.3** — As a designer, I want the guide to explain the design constraints (one file, tokens only, no component-level overrides), so that I understand why the system is shaped this way before I propose a theme that breaks it.

**Acceptance criteria:**
- [ ] Guide has a "Philosophy & constraints" section up front that restates the theme-as-one-file rule.
- [ ] Section explicitly calls out what a theme cannot do (e.g. add selectors beyond :root / [data-theme], ship JS, override component layout).
- [ ] Section links to the locked design decision record.

**Priority:** P1
**Effort:** S

### Feature 2.5: Community submission flow
End-to-end process a contributor follows to submit a theme. Codified in `CONTRIBUTING-THEMES.md` (file produced by Epic 1) and enforced by the PR template, validator, and CI gates this epic ships.

#### User Stories

**US-2.5.1** — As a theme author, I want a PR template that lists every requirement, so that I don't submit a theme missing an icon pack or a contrast check.

**Acceptance criteria:**
- [ ] `.github/PULL_REQUEST_TEMPLATE/theme.md` exists and is selectable at PR creation time.
- [ ] Template checkboxes cover: validator passing, contrast audit passing, size audit passing, icon pack present, preview screenshot attached, license declared.
- [ ] Template links to the authoring guide and `CONTRIBUTING-THEMES.md`.

**Priority:** P1
**Effort:** S

**US-2.5.2** — As a maintainer, I want theme PRs automatically checked by CI before I review, so that I only spend my time on design feedback, not checklist enforcement.

**Acceptance criteria:**
- [ ] CI job triggers on any PR that touches `public/themes/**`.
- [ ] Job runs validator, contrast audit, size audit; posts a single consolidated PR comment with pass/fail per check.
- [ ] Failing checks block merge via required status check.

**Priority:** P1
**Effort:** M

**US-2.5.3** — As a maintainer, I want an end-to-end test run of the submission flow before 1.0, so that we know the documented process actually works for an outsider.

**Acceptance criteria:**
- [ ] At least one contributor (not a core maintainer) submits a theme via the documented flow.
- [ ] The submission is merged or rejected with documented feedback.
- [ ] Any friction discovered is filed as issues and either fixed or deferred with a label before 1.0.

**Priority:** P2
**Effort:** M

### Feature 2.6: Color contrast audit CI
A script walks every shipped theme, computes WCAG contrast ratios for every semantic foreground/background pair defined by the token contract, and fails CI if any pair drops below AA. Runs on PR for changed themes and on schedule for all themes (catches regressions from base-library token renames).

#### User Stories

**US-2.6.1** — As an accessibility reviewer, I want every shipped theme to pass WCAG AA on all body-text surface pairs, so that consumers don't have to audit themes themselves.

**Acceptance criteria:**
- [ ] Audit covers every `--cia-bg-*` / `--cia-fg-*` pair the token contract defines as "text on surface."
- [ ] Body-text pairs must score >= 4.5:1; large-text and UI pairs must score >= 3:1.
- [ ] All 6 shipped themes pass as of merge-to-main; audit output is archived per release tag.

**Priority:** P0
**Effort:** M

**US-2.6.2** — As a CI system, I want to run the audit automatically on any PR that modifies `public/themes/**` or `public/theme.css`, so that regressions never reach main.

**Acceptance criteria:**
- [ ] GitHub Action triggers on `public/themes/**` and `public/theme.css` paths.
- [ ] Action runs the audit script, posts results as a PR comment, and sets a required status check.
- [ ] Failure output names the exact token pair and the measured ratio (e.g. `--cia-bg-surface / --cia-fg-body: 3.8:1 (need 4.5:1)`).

**Priority:** P0
**Effort:** S

**US-2.6.3** — As a theme author, I want to run the same audit locally before I push, so that I don't waste a CI round trip on a failure I could have caught.

**Acceptance criteria:**
- [ ] `npm run audit:contrast -- --theme=<name>` runs the same check CI runs.
- [ ] Local and CI output are identical.
- [ ] Command is documented in the authoring guide.

**Priority:** P1
**Effort:** S

### Feature 2.7: Theme size/perf audit
Each `theme.css` file has a hard budget of 2 KB gzipped. A CI script measures the size of every theme file and fails the build if any exceeds the budget. Also reports cumulative size across all shipped themes on each release tag.

#### User Stories

**US-2.7.1** — As a maintainer, I want every shipped `theme.css` to stay under 2 KB gzipped, so that the "one tiny file swaps a theme" promise stays true.

**Acceptance criteria:**
- [ ] Budget is enforced as a CI failure, not a warning.
- [ ] All 6 current shipped themes are under 2 KB gzipped at merge of this story.
- [ ] Budget value lives in one config file so it can be tuned without hunting scripts.

**Priority:** P1
**Effort:** S

**US-2.7.2** — As a theme author, I want clear feedback when my theme exceeds the budget, including which tokens or selectors are costing the most bytes, so that I can trim intelligently.

**Acceptance criteria:**
- [ ] Audit output shows raw bytes, gzipped bytes, and % of budget used.
- [ ] On failure, output ranks declarations by byte cost so the author sees the heaviest lines first.
- [ ] Audit documented in the authoring guide with an example of reading the output.

**Priority:** P1
**Effort:** S

**US-2.7.3** — As a CI system, I want the size audit to run on every PR that touches theme files, so that size regressions are caught pre-merge.

**Acceptance criteria:**
- [ ] Action triggers on `public/themes/**` and `public/theme.css`.
- [ ] Result is posted as a PR comment and sets a required status check.
- [ ] Cumulative size across all themes is reported on release-tag runs and archived.

**Priority:** P1
**Effort:** S

### Feature 2.8: Dark-mode companions
Each shipped theme gets an explicit light/dark disposition: companion shipped, or documented as single-mode by design (e.g. Terminal stays dark-only). For themes that should pair, ship the companion file; for themes that shouldn't, record the rationale. Wiring to auto-detect `prefers-color-scheme` is Epic 1's job — this feature just ensures the content exists.

#### User Stories

**US-2.8.1** — As a consumer, I want every theme that makes sense in both light and dark to ship both variants, so that I can respect user system preference.

**Acceptance criteria:**
- [ ] Pairing matrix recorded in the authoring guide for all 6 themes: Sketchbook (light + dark), Press (light + dark), Graphite (dark, companion light), Glass (light + dark), Cupertino (light + dark), Terminal (dark only by design).
- [ ] Each paired theme ships both files under `public/themes/{name}/theme.css` and `public/themes/{name}/theme-dark.css` (or equivalent convention agreed with Epic 1).
- [ ] Each paired dark companion passes the Feature 2.6 contrast audit.

**Priority:** P1
**Effort:** L

**US-2.8.2** — As a designer, I want single-mode themes (e.g. Terminal light-less) to state that intent explicitly, so that I know it's a design decision not an oversight.

**Acceptance criteria:**
- [ ] Each single-mode theme has a "Mode" field in its README/frontmatter stating "dark only" or "light only" with a one-line rationale.
- [ ] `/themes` gallery shows a "Dark only" / "Light only" badge on single-mode themes.
- [ ] Authoring guide explains when single-mode is an acceptable choice.

**Priority:** P1
**Effort:** S

**US-2.8.3** — As an accessibility reviewer, I want dark companions to meet the same WCAG AA bar as their light counterparts, so that dark mode is not a second-class experience.

**Acceptance criteria:**
- [ ] Contrast audit (Feature 2.6) runs against both light and dark companions of every paired theme.
- [ ] Both variants must pass AA for merge; no "dark is best-effort" exception.
- [ ] Audit report breaks down pass/fail per variant.

**Priority:** P0
**Effort:** S

## Dependencies
- Blocked by: Epic 1 (Library Foundations) — needs the token contract and theme validator in place before per-theme work can be audited consistently, and before `CONTRIBUTING-THEMES.md` has a stable reference surface.
- Blocks: Epic 4 (Documentation Content) — the docs-site theme authoring page references this epic's icon-pack format and audit commands.
- Blocks: Epic 6 (Testing & Quality) — visual regression snapshots of theme previews depend on the `/themes` thumbnail component shipped here.

## Priority
P0 overall. Sub-priorities:
- **P0** — contrast audit (2.6), first round of per-theme icon packs (2.1), theme-aware icon swap (2.2), authoring guide (2.4), dark-companion contrast parity (2.8.3).
- **P1** — preview thumbnails (2.3), size/perf audit (2.7), dark companions content (2.8.1/2.8.2), icon comparison grid (2.1.3), PR template + CI gating (2.5.1/2.5.2).
- **P2** — end-to-end community submission dry run (2.5.3).
