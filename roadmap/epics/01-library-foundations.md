# Epic 1: Library Foundations

## Summary
This epic makes the SCSS library internally complete and theme-aware from end to end. It locks in a numbered sizing scale as the single source of truth, ensures every theme declares the full contract of tokens the library's mixins depend on, introduces a per-theme component-override map, adds auto-detected dark mode with manual override, and ships a token validator that prevents incomplete themes from ever reaching main. With this epic landed, any theme in the repo (or contributed downstream) is guaranteed to light up every component correctly, and the library stops silently falling back to defaults.

## Goals
- Every library token map (`$space`, `$font-sizes`, `$line-heights`, `$shadow`, `$z-layers`, `$radius`) uses numeric keys (1..N) as the authoritative scale, with t-shirt aliases layered on top.
- All 6 in-repo themes (`public/theme.css` + 5 under `public/themes/*`) declare 100% of the required token contract, verified by script.
- A `theme-validator.js` script exists, runs in under 2 seconds against any `theme.css`, and is wired into CI to fail PRs that break the contract.
- Dark mode activates automatically on systems with `prefers-color-scheme: dark` and respects any manual override in localStorage.
- A `$theme-components` override map is defined, documented, and consumed by at least 2 in-repo themes.
- `CONTRIBUTING-THEMES.md` and icon-mixin docs are published so an external author can author a valid theme without reading library source.

## Out of scope
- Per-theme icon packs, preview thumbnails, community submission flow, and contrast audits — see Epic 2 (Themes & Icons).
- New React component wrappers that consume these tokens — see Epic 3 (React Component Library).
- Long-form docs-site prose, mixin reference pages, and recipes — see Epic 4 (Documentation Content). This epic ships only the minimal inline docs (`icons/README.md`, `CONTRIBUTING-THEMES.md`).
- CI infrastructure beyond hooking the theme validator in — see Epic 5 (Quality & Delivery).
- Visual-regression tests of themes — see Epic 5 (Quality & Delivery).
- JSON token export for AI tooling — see Epic 6 (AI Integration).

## Features

### Feature 1.1: Numbered sizing scale migration
Refactor the library's scale maps (`$space`, `$font-sizes`, `$line-heights`, `$shadow`, `$z-layers`, `$radius`) so numeric keys (1, 2, 3, ...) are the source of truth. T-shirt aliases (`sm`, `md`, `lg`) become an optional second map that resolves to numeric steps. Update every mixin default to reference numeric keys. Ship a migration note since this is a breaking change.

#### User Stories

**US-1.1.1** — As a system author, I want every scale map in the library keyed by number (1..N), so that the scale has one unambiguous source of truth.

**Acceptance criteria:**
- [ ] `$space`, `$font-sizes`, `$line-heights`, `$shadow`, `$z-layers`, `$radius` each use numeric keys (e.g. `1: 0.25rem, 2: 0.5rem, ...`) in `scss/theme/*`.
- [ ] Every mixin default in `scss/_mixins.scss` and `scss/components/*` references numeric keys, not t-shirt strings.
- [ ] `npm run build:css` produces the same visual output as before migration (diff-checked against baseline screenshots).
- [ ] A migration note lives in `CHANGELOG.md` and `CONTRIBUTING-THEMES.md` listing old → new key mapping.

**Priority:** P0
**Effort:** 7
**Role:** system author

**US-1.1.2** — As a consumer, I want optional t-shirt aliases (`sm`, `md`, `lg`) to still resolve, so that I don't have to memorize numbers.

**Acceptance criteria:**
- [ ] A `$size-aliases` map (or equivalent) exists per scale and maps t-shirt names to numeric steps.
- [ ] Mixins accept either `sm` or `2` for the same call site and produce identical output.
- [ ] At least one example in `scss/examples/_usage.scss` demonstrates both call styles.
- [ ] Aliases are documented at the top of each scale map file.

**Priority:** P1
**Effort:** 1
**Role:** consumer

**US-1.1.3** — As a theme author, I want a clear migration path from the old t-shirt keys, so that I can upgrade an existing theme without guessing.

**Acceptance criteria:**
- [ ] `CONTRIBUTING-THEMES.md` includes a before/after table for every scale map.
- [ ] A `scripts/migrate-theme.js` helper (or well-documented find/replace list) is provided.
- [ ] All 6 in-repo themes are migrated as reference examples.
- [ ] Running the migrated theme through the validator (Feature 1.6) exits 0.

**Priority:** P1
**Effort:** 3
**Role:** theme author

### Feature 1.2: Full token contract coverage per theme
Audit every token the library's mixins reference, then ensure all 6 in-repo themes (`public/theme.css`, `public/themes/cupertino`, `graphite`, `glass`, `press`, `terminal`) declare the full contract: primary/secondary/tertiary semantic colors, `interactive-hover`, `interactive-active`, `border-focus`, and any other slot a mixin reads. Today only primary semantic colors are aliased; the rest fall back to library defaults, which undermines theming.

#### User Stories

**US-1.2.1** — As a system author, I want a canonical list of every token the library expects, so that themes have a clear target to hit.

**Acceptance criteria:**
- [ ] A `scss/theme/_contract.scss` (or equivalent doc) lists every token slot with its type (color, length, number, etc.).
- [ ] The list is generated or verified against actual mixin usage in `scss/_mixins.scss`, `scss/components/*`, and `scss/theme/*`.
- [ ] Slots include at minimum: all semantic color pairs, `interactive-hover`, `interactive-active`, `border-focus`, `border-default`, `surface-*`, `text-*`.
- [ ] The contract is the input consumed by the validator (Feature 1.6).

**Priority:** P0
**Effort:** 3
**Role:** system author

**US-1.2.2** — As a theme author, I want every in-repo theme to declare the full token contract, so that I have working reference themes to copy.

**Acceptance criteria:**
- [ ] `public/theme.css` declares every token in the contract.
- [ ] `public/themes/cupertino/theme.css`, `graphite/theme.css`, `glass/theme.css`, `press/theme.css`, `terminal/theme.css` each declare every token.
- [ ] Running `node scripts/theme-validator.js <path>` exits 0 for all 6 files.
- [ ] No mixin in the library silently falls back to a default for any of the 6 themes (verified by temporarily removing defaults and running the build).

**Priority:** P0
**Effort:** 3
**Role:** theme author

**US-1.2.3** — As a designer, I want `interactive-hover`, `interactive-active`, and `border-focus` explicitly defined per theme, so that interaction states stay on-brand.

**Acceptance criteria:**
- [ ] Each theme defines these three slots as actual values (not `inherit` or fallbacks).
- [ ] Hover/active/focus states on `<button>` and `<a>` match the theme's declared values (spot-check in browser).
- [ ] A demo page in the docs site cycles all 6 themes and visually shows the states.

**Priority:** P1
**Effort:** 1
**Role:** designer

### Feature 1.3: `$theme-components` override map
Introduce a per-theme map that lets a theme override component-level tokens (`btn-padding-y`, `btn-padding-x`, `btn-radius`, `card-padding`, `card-radius`, `card-shadow`, `input-radius`, etc.) without patching the library. Currently no theme populates this map and the library always uses defaults. Define the full key list, document it, and wire at least two themes (e.g. Terminal, Press) to actually override values.

#### User Stories

**US-1.3.1** — As a system author, I want a complete key list for `$theme-components`, so that the override surface is finite and documented.

**Acceptance criteria:**
- [ ] `scss/theme/_components.scss` exports a `$theme-components` default map with every supported key.
- [ ] Key list covers button, card, input, modal, alert, badge, and table at minimum.
- [ ] Every key has a default value and a comment explaining its role.
- [ ] Each listed component mixin reads from the map via a `map.get` with fallback.

**Priority:** P0
**Effort:** 3
**Role:** system author

**US-1.3.2** — As a theme author, I want to override component tokens by declaring a `$theme-components` map in my theme, so that I don't have to patch library files.

**Acceptance criteria:**
- [ ] A theme can declare `$theme-components: (btn-radius: 0, card-shadow: none);` and have those values win at build.
- [ ] Unspecified keys fall back to library defaults without errors.
- [ ] `CONTRIBUTING-THEMES.md` documents the mechanism with a worked example.

**Priority:** P0
**Effort:** 3
**Role:** theme author

**US-1.3.3** — As a designer, I want Terminal and Press themes to actually use component overrides, so that their visual identity is consistent beyond color.

**Acceptance criteria:**
- [ ] `public/themes/terminal/theme.css` overrides at least `btn-radius`, `card-radius`, and `input-radius` to 0.
- [ ] `public/themes/press/theme.css` overrides at least `card-shadow` and `btn-padding-*` to match the editorial aesthetic.
- [ ] Switching to either theme in the picker visibly changes component shape, not just color.

**Priority:** P1
**Effort:** 1
**Role:** designer

### Feature 1.4: Full scale coverage per theme
Every theme must declare `$font-weights`, `$line-heights`, `$font-sizes`, `$space`, `$shadow`, and `$z-layers` maps that cover every numeric step the library expects. Terminal and Press in particular are suspected of partial coverage today. Close the gaps so no mixin falls through to a library default when a theme is applied.

#### User Stories

**US-1.4.1** — As a system author, I want every theme to declare all six scale maps with full numeric coverage, so that mixins always resolve to a theme-declared value.

**Acceptance criteria:**
- [ ] Each of the 6 theme files declares `$font-weights`, `$line-heights`, `$font-sizes`, `$space`, `$shadow`, `$z-layers`.
- [ ] Each scale has every step the contract declares (no missing keys).
- [ ] The validator (Feature 1.6) checks scale-map completeness and reports missing keys by name.
- [ ] Terminal and Press themes in particular pass validation after this story closes.

**Priority:** P0
**Effort:** 3
**Role:** system author

**US-1.4.2** — As a theme author, I want a minimal starter theme template that already covers every scale step, so that I start from a valid baseline.

**Acceptance criteria:**
- [ ] `public/themes/_template/theme.css` exists with every scale declared at default values.
- [ ] Copying the template and running the validator exits 0 before any edits.
- [ ] The template is referenced from `CONTRIBUTING-THEMES.md` as the starting point.

**Priority:** P1
**Effort:** 1
**Role:** theme author

### Feature 1.5: Dark mode auto-detection with manual override
Dark mode should "just work" on systems set to dark, and respect any manual override a user has chosen via the theme picker (persisted in localStorage). The mechanism lives in the default theme (media-query block) and/or a small pre-hydration script in `app/layout.tsx` that sets `data-theme="dark"` on first paint when appropriate. Manual override always wins.

#### User Stories

**US-1.5.1** — As a consumer, I want the site to honor my OS dark-mode preference on first visit, so that I don't see a flash of light UI.

**Acceptance criteria:**
- [ ] On a fresh browser (no localStorage), a system in dark mode loads the site with `data-theme="dark"` applied before paint.
- [ ] No FOUC (flash of unstyled / light-themed content) occurs on load.
- [ ] On a system in light mode, the light theme loads without any dark flash.
- [ ] Verified in Chrome and Safari at minimum.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-1.5.2** — As a consumer, I want my manual theme pick to persist and override the system preference, so that the site remembers my choice.

**Acceptance criteria:**
- [ ] Selecting a theme in the picker writes the choice to localStorage under a single documented key.
- [ ] On reload, the localStorage value is read before paint and applied, ignoring `prefers-color-scheme`.
- [ ] Clearing localStorage reverts behavior to the auto-detect path.
- [ ] A "Use system setting" option in the picker clears the override.

**Priority:** P0
**Effort:** 1
**Role:** consumer

**US-1.5.3** — As a system author, I want the auto-detect logic in one place, so that it's easy to audit and port.

**Acceptance criteria:**
- [ ] A single inline script (no external dependency) lives in `app/layout.tsx` or a dedicated `ThemeBoot.tsx`.
- [ ] The script is under 40 lines and documented inline.
- [ ] A short section in `CONTRIBUTING-THEMES.md` explains the boot sequence for anyone forking the site.

**Priority:** P1
**Effort:** 1
**Role:** system author

### Feature 1.6: Theme validator script
A standalone Node script (no dependencies) that takes a `theme.css` file path, parses its `:root { ... }` block, compares declared custom properties against the contract from Feature 1.2, and reports any missing tokens. Runs locally and in CI. Fails the build on any PR that adds or modifies a theme file with missing tokens.

#### User Stories

**US-1.6.1** — As a theme author, I want to run the validator locally on my theme, so that I know it's complete before I open a PR.

**Acceptance criteria:**
- [ ] `node scripts/theme-validator.js public/themes/foo/theme.css` exits 0 on a complete theme.
- [ ] Exits 1 and prints a list of missing tokens (by name, grouped by category) on an incomplete theme.
- [ ] Runs with zero npm dependencies (stdlib only).
- [ ] Completes in under 2 seconds on any of the 6 in-repo themes.

**Priority:** P0
**Effort:** 3
**Role:** theme author

**US-1.6.2** — As a CI system, I want the validator to run on every PR that touches a theme file, so that broken themes never reach main.

**Acceptance criteria:**
- [ ] A GitHub Actions step invokes the validator against every `public/theme*.css` and every `public/themes/*/theme.css`.
- [ ] The step fails the build on any non-zero exit.
- [ ] The step's log shows which files passed and which failed with the missing-token list.
- [ ] The workflow file is committed under `.github/workflows/`.

**Priority:** P0
**Effort:** 1
**Role:** CI system

**US-1.6.3** — As a system author, I want the validator to read the contract from a single source, so that adding a token to the library auto-propagates to the check.

**Acceptance criteria:**
- [ ] The contract is defined once (e.g. `scripts/theme-contract.json` or generated from `scss/theme/_contract.scss`).
- [ ] Adding a token to the contract without updating themes causes validation to fail on the next run.
- [ ] A README block in `scripts/` explains how to add a new token slot end-to-end.

**Priority:** P1
**Effort:** 1
**Role:** system author

**US-1.6.4** — As a theme author, I want the validator to warn (not fail) on unknown extra tokens, so that I can experiment without the script blocking me.

**Acceptance criteria:**
- [ ] Tokens declared in a theme but absent from the contract produce a warning line in stdout.
- [ ] Warnings do not change the exit code.
- [ ] The warning message suggests either adding the token to the contract or removing it from the theme.

**Priority:** P2
**Effort:** 1
**Role:** theme author

### Feature 1.7: Icon mixin documentation
The library's `scss/_icons.scss` defines `svg()`, `svg-bg()`, `svg-text()`, and Font Awesome variants. These are currently undocumented. Ship a docs-site page that explains usage and expand `public/icons/README.md` with a concise explainer so anyone browsing the icon directory understands how the mixins consume the files.

#### User Stories

**US-1.7.1** — As a consumer, I want a docs page that explains every icon mixin with a runnable example, so that I can use them without reading source.

**Acceptance criteria:**
- [ ] A page at `app/docs/icons/page.tsx` (or equivalent) exists in the docs site.
- [ ] It covers `svg()`, `svg-bg()`, `svg-text()`, and the Font Awesome variants, each with at least one code sample and rendered preview.
- [ ] Each mixin's signature (parameters, defaults) is documented.
- [ ] The page is linked from the docs-site sidebar.

**Priority:** P1
**Effort:** 3
**Role:** consumer

**US-1.7.2** — As a theme author, I want `public/icons/README.md` to explain the icon-pack contract, so that I know how to ship icons with my theme.

**Acceptance criteria:**
- [ ] The README lists required icon names and file-naming convention.
- [ ] It shows how the SCSS mixins reference icon files (path pattern, URL resolution).
- [ ] It cross-links to the docs-site icon page.
- [ ] It fits on one screen (concise, not a tutorial).

**Priority:** P1
**Effort:** 1
**Role:** theme author

### Feature 1.8: `CONTRIBUTING-THEMES.md`
A repo-root document that explains exactly how to author and submit a new theme: what tokens to declare, how to structure the file, how to run the validator, how to override component tokens, and how to submit. Cross-links to the docs-site theme authoring guide (Epic 4) without duplicating prose.

#### User Stories

**US-1.8.1** — As a theme author, I want a single document at the repo root that walks me through authoring a new theme, so that I can go from zero to a passing theme in one sitting.

**Acceptance criteria:**
- [ ] `CONTRIBUTING-THEMES.md` exists at repo root.
- [ ] It includes sections: Prerequisites, Starter template, Required tokens, Component overrides, Running the validator, Submitting a theme.
- [ ] Every code block is copy-pasteable and accurate as of the current library version.
- [ ] A reader following the doc end-to-end produces a theme that passes the validator.

**Priority:** P1
**Effort:** 3
**Role:** theme author

**US-1.8.2** — As a system author, I want the theme contributing doc to cross-link with Epic 4's theme authoring guide, so that readers don't get lost between repo and site.

**Acceptance criteria:**
- [ ] `CONTRIBUTING-THEMES.md` links to the docs-site theme authoring page (placeholder URL ok until Epic 4 lands).
- [ ] The docs-site guide links back to `CONTRIBUTING-THEMES.md` for submission mechanics.
- [ ] Neither document duplicates the other's primary content.

**Priority:** P2
**Effort:** 1
**Role:** system author

## Dependencies
- Blocks: Epic 2 (Themes & Icons — community submission depends on validator and full contract), Epic 3 (React Component Library — components consume the numbered scale and `$theme-components` map), Epic 4 (Documentation Content — docs reference token names that stabilize here).
- Blocked by: none. This is the foundational epic.

## Priority
P0 (blocker for 1.0)
