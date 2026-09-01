# EPIC v1.5-01 — VS Code Extension

**Status:** Planned (v1.5)
**Effort estimate:** ~2 weeks
**Stories:** 15

## Mission

Ship a VS Code extension that makes authoring cia inside `.scss` files feel like Tailwind CSS IntelliSense feels for Tailwind. Mixin signature on hover. Autocomplete for `cia.X` mixins, token keys, and theme names. Jump-to-definition. Inline contrast preview on `m.color(...)` calls.

## Why now

Jerry's 2026-05-23 explicit slot: v1.5. Rationale: playground (v1.0) covers "show me what cia does" with zero install. The VS Code extension is the upgrade for daily use — most valuable to consumers already invested in cia, not those evaluating it. v1.5 also lets the extension reflect a mature API surface (post v1.1 + v1.2 + v1.3).

## Out of scope

- JetBrains plugin (separate epic if community asks)
- Sublime Text / Vim / Emacs support
- Standalone language server (extension uses VS Code APIs directly in v0.1; LSP refactor in v0.2 if needed for other editors)
- Code generation (extension is read-only intelligence)

## Features

### F1.1 — Extension scaffolding

#### US-V15.01.1.1 — Stand up extension repo

**Acceptance criteria:**
- [ ] Repo `cia-vscode-extension` (or `packages/vscode-extension/`)
- [ ] Uses Yeoman VS Code generator + TypeScript
- [ ] Package manifest declares activation events: `onLanguage:scss`, `onLanguage:sass`
- [ ] `package.json` declares cia compatibility version

**Effort:** S (≤4 hrs)

#### US-V15.01.1.2 — Detect cia in the workspace

**Acceptance criteria:**
- [ ] Extension scans `package.json` for `css-is-awesome` in deps/devDeps
- [ ] If absent, extension idles silently
- [ ] If present, extension activates + caches the cia source from `node_modules/css-is-awesome/scss/`

**Effort:** S (≤4 hrs)

#### US-V15.01.1.3 — Version-aware token + mixin catalog

**Acceptance criteria:**
- [ ] Extension reads installed cia version + loads correct mixin/token catalog
- [ ] Catalogs ship pre-computed in extension (~100 KB JSON for cia core)
- [ ] Falls back gracefully if version mismatch (warns user)
- [ ] CI tests against cia v1.0, v1.1, v1.2, v1.3 catalogs

**Effort:** M (4-8 hrs)

---

### F1.2 — Mixin signature hovers

#### US-V15.01.2.1 — Hover over `@include cia.btn(primary)` shows signature

**Acceptance criteria:**
- [ ] Hover triggers a tooltip
- [ ] Tooltip shows: mixin name, full signature with defaults, doc comment, link to docs page
- [ ] Works for all 138 cia mixins
- [ ] Tested on dialog, combobox, button mixins

**Effort:** L (1-2 days)
**Depends on:** US-V15.01.1.3

#### US-V15.01.2.2 — Hover over `m.color(primary)` shows token value across themes

**Acceptance criteria:**
- [ ] Hover shows: token name, current value in active theme, list of values across all 8 themes
- [ ] Color tokens render with a swatch in the tooltip
- [ ] Click on a theme name → swap workspace theme to that one (advanced; can defer to v0.2)

**Effort:** M (4-8 hrs)

#### US-V15.01.2.3 — Hover over recipe import shows recipe summary

**Acceptance criteria:**
- [ ] Hover over `@use 'css-is-awesome/scss/recipes/<name>'` shows recipe name + description + a11y checklist length
- [ ] Click → opens the recipe markdown in a new tab

**Effort:** S (≤4 hrs)

---

### F1.3 — Autocomplete

#### US-V15.01.3.1 — Autocomplete `cia.<TAB>` to list all mixins

**Acceptance criteria:**
- [ ] Typing `cia.` triggers completion list
- [ ] List includes every public mixin with its first-line doc
- [ ] Trigger character configurable

**Effort:** M (4-8 hrs)

#### US-V15.01.3.2 — Autocomplete inside mixin params

**Acceptance criteria:**
- [ ] Typing `cia.btn(<TAB>)` suggests variant names (primary, ghost, outline)
- [ ] Typing `cia.btn(primary, $bg: <TAB>)` suggests color tokens
- [ ] Typing `cia.space(<TAB>)` suggests the numbered + t-shirt scale
- [ ] Parameter-aware (knows the mixin signature)

**Effort:** L (1-2 days)
**Depends on:** US-V15.01.3.1

#### US-V15.01.3.3 — Autocomplete theme names

**Acceptance criteria:**
- [ ] In `<html data-theme="">` HTML files, suggests the 9 shipped themes + any community theme detected in `public/themes/`
- [ ] Recognizes both Astro + Next.js + plain HTML

**Effort:** M (4-8 hrs)

---

### F1.4 — Jump-to-definition

#### US-V15.01.4.1 — Cmd+click on `cia.btn` jumps to mixin source

**Acceptance criteria:**
- [ ] Cmd+click (or F12) opens the file containing the mixin definition
- [ ] Cursor jumps to the right line
- [ ] Works across all 138 mixins
- [ ] Falls back to the cia node_modules source if no local override

**Effort:** M (4-8 hrs)

#### US-V15.01.4.2 — Cmd+click on `m.color(primary)` jumps to token definition

**Acceptance criteria:**
- [ ] Opens the active theme's source file at the token's definition line
- [ ] If active theme is unknown, defaults to boilerplate

**Effort:** M (4-8 hrs)

---

### F1.5 — Inline contrast preview

#### US-V15.01.5.1 — Show contrast badge next to `m.color(...)` calls

**Acceptance criteria:**
- [ ] When a color token appears alongside a `background:` or `color:` declaration, extension computes the contrast pair and shows a badge in the gutter
- [ ] Badge colors: green (AA pass), yellow (AAA fail / AA pass), red (AA fail)
- [ ] Hover the badge → details panel with ratio + WCAG status
- [ ] Toggle to disable globally via setting

**Effort:** L (1-2 days)
**Depends on:** v1.0 US-02.3.1 (validator code shared)

#### US-V15.01.5.2 — Wave of "decorative" classification respected

**Acceptance criteria:**
- [ ] Border tokens marked "decorative" per cia's WCAG 2.2 SC 1.4.11 classification don't trigger FAIL badges
- [ ] Settings let user opt into strict checking that includes decorative tokens

**Effort:** S (≤4 hrs)

---

### F1.6 — Marketplace publish + docs

#### US-V15.01.6.1 — Polish + publish to VS Code Marketplace

**Acceptance criteria:**
- [ ] Extension icon + readme + screenshots
- [ ] Published to marketplace under publisher ID (Jerry's)
- [ ] First version ships v1.0.0 of the extension (independent semver from cia)
- [ ] Linked from cia website + README

**Effort:** M (4-8 hrs)

#### US-V15.01.6.2 — Docs page on cia site

**Acceptance criteria:**
- [ ] Page at `src/app/docs/vscode-extension/page.tsx`
- [ ] Walkthrough with screenshots
- [ ] Settings reference
- [ ] Troubleshooting for non-detection scenarios

**Effort:** S (≤4 hrs)

#### US-V15.01.6.3 — Telemetry (opt-in, anonymous)

**Acceptance criteria:**
- [ ] First-run prompt asks consent for anonymous usage stats
- [ ] If yes: hover counts, autocomplete counts, no source code or token values sent
- [ ] Privacy policy linked

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 15 stories accepted
- [ ] Extension published to VS Code Marketplace
- [ ] Hover, autocomplete, jump-to-def, contrast preview all work in a sample consumer project
- [ ] CI tests pass against cia v1.0/v1.1/v1.2/v1.3
- [ ] Docs page lives + linked
- [ ] At least 1 external user (community tester) verified end-to-end

## Risks

- **Catalog drift.** Extension's pre-computed catalogs can drift from cia source. Mitigation: catalogs are generated by a script that runs against cia source at extension build time; CI fails if drift.
- **Performance on large projects.** Hover + autocomplete must respond under 100 ms. Mitigation: pre-index catalogs + cache; benchmark in CI.
- **Multi-version support.** Workspace might have cia v1.0; another has v1.3. Mitigation: extension picks catalog based on installed version per workspace.
- **Settings explosion.** Easy to add 30 settings users never touch. Mitigation: ship ≤5 settings in v0.1; add only on community ask.

## Related

- [v1.0 EPIC-04-playground.md](../v1-0/EPIC-04-playground.md) — playground covers the "what is this" need; extension covers the "I use this every day" need
- [v1.0 EPIC-02-theme-editor-polish.md](../v1-0/EPIC-02-theme-editor-polish.md) — contrast validator shared with extension
- [v1.1 EPIC-04-framework-pack-react.md](../v1-1/EPIC-04-framework-pack-react.md) — extension can also suggest `@cia/react` components if installed
