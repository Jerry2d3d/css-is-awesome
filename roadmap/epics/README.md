# Epics

> **Updated 2026-05-23.** This folder now contains TWO parallel structures:
>
> 1. **Versioned epic folders (v1-0/ through v2-0/)** — the current backlog organized by release. Created during the 2026-05-23 v1.0 architecture lock. These are the active source of truth.
> 2. **Legacy numbered epics (01-07)** — the original 7-epic structure from earlier 2026. Items mostly shipped (theme system, MCP server, CI) or absorbed into the new versioned epics. Preserved for history.

Detailed breakdown of the work needed to take css-is-awesome from v1.0 to v2.0. Each epic is a thematic slice of the system. `ROADMAP.md` at the repo root is the phase/milestone view; these files are the work-item view.

> **Post-launch week note (2026-09-05, npm 1.9.0).** The week after launch shipped, in order: the mobile toolkit (hamburger/drawer/sheet/dock + mobile-nav and bottom-nav recipes - the book is FIVE), the site's Nav/Main/Footer control system + mobile pass, spacing aliases in all 24 themes, the layout doctrine (AGENTS #7/#8), the DocEntry component-docs registry with real-mixin live demos (which caught and fixed the tabs nth-of-type bug), production hosting moved to Vercel (prod-css-is-awesome = Production Branch), the version-pace rule (site feat = patch), and from the external review: cia add + cia analyze CLI verbs and /docs/browser-support. The Figma pipeline (figma-pipeline.md) joined the roadmap as the next major workstream, absorbing v1-3 EPIC-01/03.
>
> **Launch note (2026-09-01) — the launch milestone is DONE.** **css-is-awesome@1.1.0 was published to npm on 2026-09-01** — the first publish in the project's history — with dist-tag `latest`, a GitHub Release, and an annotated tag; the release automation (semantic-release via the CI → Release workflows) is proven end to end. The **GitHub repo went public 2026-09-01**, and the **docs site is live at <https://jerry2d3d.github.io/css-is-awesome/>** (Actions-based GitHub Pages deploy, auto-deploys on every push to `main`). CDN delivery verified: `https://cdn.jsdelivr.net/npm/css-is-awesome@1/dist/css-is-awesome.min.css` and the per-theme files resolve (unpkg too).
> **Version-number caveat:** npm versions are derived by semantic-release from commit history, so they do NOT map 1:1 onto the version folders below. The published **1.1.0** carries the 2026-08-29 → 2026-09-01 wave (theme single-source rework, themes-own-spacing, a11y fixes, linux visual baselines, public roadmap page) — it is **not** the `v1-1/` backlog, none of which has started. Never hand-type a "current version" here; state versions only as dated historical facts.
>
> **Audit note (2026-09-09) — print theme + bundler bug.** [v1.2 EPIC-08](./v1-2/EPIC-08-print-theme-tokens.md) is now complete: the theme-editor print-preview modal persists its palette per family in `localStorage` and seeds from a theme's own in-file `--print-*` override instead of always resetting to plain B/W (US-V12.08.5.3). Verifying that in a real browser surfaced a real bug, same shape as the 2026-08-30 one below: `scripts/build-theme-bundle.mjs`'s block extractor treated any `@media { … }` block as one opaque top-level rule with selector `"@media print"`, which never contains `data-theme`, so it silently dropped — Press's newsprint print override (the epic's reference implementation) never reached the consolidated `public/theme.css` that the docs site and npm consumers actually load, even though the per-theme file `public/themes/press/theme.css` had it correctly. Fixed by recursing into at-rules and re-wrapping the matched inner rule; rebuilt the bundle; `check:theme-drift` and `validate-themes` both pass; re-verified live via Playwright.
>
> **Audit note (2026-09-10) — app-shell recipe shipped; recipe backlog scoped from Boiler.** New recipe `app-shell` (navbar + sidebar/control-panel + footer, composed from already-existing mixins — `navbar-base`, `sidebar`, `toolbar`, `stack`, `cluster` — with a working Settings modal cross-linked to the `dialog` recipe rather than re-documented) shipped and verified live (15th recipe). Separately, surveyed `boiler-project-ai` (the separate Next.js project that consumes cia) for recipe-shaped gaps — first with a file read, then with **Boiler's own MCP server** (it ships one, same shape as cia's), which returned its full 98-component catalog. Two things turned out to already exist there with real reference implementations: `DataTable` and `DatePicker` — these are the *original* v1.0-queued recipes ("datepicker, data-table, command-palette") that never got built; only `dialog` and `combobox` of that original five ever shipped, a fact that had gone stale in [`v1-1/EPIC-01-additional-recipes.md`](./v1-1/EPIC-01-additional-recipes.md)'s own "Why now" text (now corrected there) and in [`v1-1/README.md`](./v1-1/README.md)'s Definition of Done (also corrected — it said "12 recipes total," reality is 14 shipped as of today, none of them via that backlog). New epic [`v1-1/EPIC-08-additional-recipes-batch-2.md`](./v1-1/EPIC-08-additional-recipes-batch-2.md) captures 7 Boiler-backed candidates (datepicker, data-table, admin-dashboard-layout, confirm-dialog, auth-flow, multi-step-wizard, otp-input — each with a cited Boiler component/file), plus a "Considering" list (search-results, Chart, a form-field-composition group, Timeline, Carousel, and several PrimeNG/KendoReact-parity controls) held back as lower-priority rather than padding the batch. Batch 1's `pagination`/`file-upload`/`toast` stories also gained real Boiler references from the same survey (`Pagination`, `Upload`, `Toast` components) — annotated in place, not re-scoped.
>
> **Audit note (2026-09-09) — form validation recipes complete.** [v1.2 EPIC-02](./v1-2/EPIC-02-form-validation-recipes.md) is now complete: 5 recipes (native HTML5, react-hook-form, Zod, debounced async validation, success-state patterns), each with a **real, verified-live interactive demo** — not a screenshot — at its own static route (`src/app/docs/recipes/form-validation-<slug>/`, confirmed to take precedence over the generic `[slug]` catch-all, same pattern `copy-button`/`anchor-positioning`/`tabs-aria` already used). Two gaps closed along the way: `category: "forms"` didn't exist in `scripts/validate-recipes.mjs`'s enum, and `react-hook-form` wasn't installed anywhere (added as a docs-site-only `devDependency`, never touches the shipped npm package). One constraint shaped the async recipe: the docs site is a static export (`output: "export"`), so its "mock endpoint" is simulated client-side rather than a real Route Handler — same UX pattern (debounce, `AbortController` cancellation, loading/success/error states), just no server. The success-states recipe's fourth pattern (redirect + toast) is documented, not demoed — no toast recipe/component exists yet (v1.1, unstarted).
>
> **Audit note (2026-09-09) — RTL audit complete.** [v1.2 EPIC-01](./v1-2/EPIC-01-rtl-audit.md) is now complete: 18 non-logical-property violations found by a new `scripts/audit-logical-properties.mjs` (CI-gated), 8 real component fixes, 2 needing a `[dir="rtl"]` override (no logical equivalent for `background-position`/`transform`), and 9 in `scss/_utilities.scss`'s Tier-1 physical-direction utilities — kept intentionally (Tailwind/Bootstrap-style consumer choice) with a parallel logical set added alongside. Shipped `/docs/rtl` (a real live LTR/RTL demo of the exact components the audit touched, verified in a browser — computed `background-position-x` flips `calc(100% - 12px)` → `12px`), the `rtl-layout` recipe, and `tests/rtl.spec.ts` (screenshots + axe, win32 **and** linux baselines committed — generated the linux set via Docker since CI's Playwright job runs on `ubuntu-latest` and a missing baseline fails outright). The new axe scan, being the first test to ever hit an actual `/docs/recipes/*` page, caught two real pre-existing a11y bugs in the shared recipe/blog markdown renderer (unlabeled task-list checkboxes; a non-focusable scrollable code block) — fixed at the source in `src/lib/recipes.ts`/`src/lib/blog.ts`, unrelated to RTL itself. Also surfaced but **not fixed** (out of scope): 27 pre-existing `smoke.spec.ts` failures across nearly every route, all the same shape — Next.js RSC-prefetch payload requests 404 against `npx serve out` — confirmed via direct network inspection to be a static-export/tooling interaction, not a content bug.
>
> **Audit note (2026-09-09) — token intelligence in the editor complete.** [v1.2 EPIC-07](./v1-2/EPIC-07-token-intelligence-editor.md) is now complete. New `scripts/build-token-consumer-map.mjs` derives which mixins/functions read each design token (handling both literal `var(--token)` and wrapper-function calls like `m.color(ink)`/`m.radius(lg)`, resolved by deriving a function→prefix table from `_mixins.scss`'s own `@function` bodies), committing `src/lib/generated/token-consumers.json` and gating it with a CI drift guard. The theme editor's rows now show a "used by N ▸" disclosure from that map and a live WCAG contrast readout with a one-click nearest-passing-color fix, both verified live in a browser. Two deliberate scope corrections, both recorded in the epic file: the zero-consumer CI guard was **descoped from pass/fail to informational-only** after measuring an 85-of-123 false-positive rate on cia's own required contract tokens (`--ink`, `--paper` included) — the static scanner can't see through a token reached only via a mixin's own parameter, and a check that's permanently red on fine tokens is worse than no check; and the "share the contrast math with CI" requirement is met via a genuinely shared `scripts/audit-pairs.json` (the curated pairs) plus a verified TS **port** of the math rather than a live cross-runtime import, because `tsconfig.json`'s `allowJs: false` makes importing a CJS `.js` file into `.ts` impractical without a fragile ambient declaration.
>
> **Audit note (2026-09-09) — analyzer health report complete.** [v1.2 EPIC-06](./v1-2/EPIC-06-analyzer-health-report.md) is now complete. Two new `cia analyze` rules shipped: `off-scale-length` (a literal `border-radius`/`padding`/`margin`/`gap` value close to a scale step suggests the nearest named token — as a hint, not an equivalence claim, since themes are free to set their own numbers per step; a literal `0` is never flagged) and `missing-focus-visible` (`info`-level, file-scope heuristic: interactive `:hover`/`:active` styling with no `:focus-visible`/`focus-ring` anywhere in the file). New `/docs/analyzer` page documents all 8 rules. Also corrected: **F1.1 (`off-contract-token`) turned out to already be shipped** — it was live in `bin/analyze.cjs` before this epic file was even written; the epic file just never said so. F2.2 (`duplicated-pattern`) is intentionally dropped per its own "ship last, behind a flag, or drop" call.
>
> **Audit note (2026-08-30) — theme system.** The `fix/theme-single-source` pass closes several long-open criteria in the legacy epics and corrects one that was reported green but wasn't: the contrast audit's block regex required quotes, so an unquoted `[data-theme=dark]` matched nothing and the file fell through to a `:root`-only path that audited nothing and exited 0. **US-2.6.1 / US-2.6.2 / US-5.5.1 / US-5.5.3 were passing on a validator that never read the themes.** Now fixed and expanded (17 → 22 pairs, `--code-*` added), with all **24** themes genuinely passing. Also landed: every theme has exactly one SCSS source (13 hand-authored CSS files ported, 3 bundle-only themes promoted), themes own `--space-0..9` (US-1.4.1, spacing half), and `npm run check:theme-drift` gates the committed artifacts against their sources in CI. This wave shipped in the `1.1.0` (2026-09-01) section of [`CHANGELOG.md`](../../CHANGELOG.md).
>
> **Audit note (2026-07-16).** Reconciled against `main` @ **v0.8.2 (pre-1.0)**. Legacy epics **01 / 02 / 04 / 06 / 07 are largely shipped**; **05 is partial** (Storybook killed; Jest, Lighthouse, and bundle-size gates not built); **03 is SUPERSEDED** (no React component package — cia ships zero JS; `src/components/` is the docs-site reference only). Each legacy epic file now carries a **STATUS banner** under its title with the per-feature detail; the individual `- [ ]` acceptance boxes inside those files are **stale** and were not flipped item-by-item. The active, accurate backlog is the **v1-0/ sprint folder** ([`v1-0/README.md`](./v1-0/README.md)).

## Versioned epic folders (current source of truth)

| Release | Theme | Folder | Stories | Status |
|---|---|---|---|---|
| [v1.0](./v1-0/README.md) | **Recipes-first reframe** — recipes book, theme editor polish, migration on-ramp, playground, bug-fix patch | v1-0/ | 42 | Shipped — tagged v1.0.0 2026-08-17 at 24/42 (ship-then-see); **launched 2026-09-01** (npm publish + public repo + live site); 18 stories carried forward post-launch |
| [v1.1](./v1-1/README.md) | **Recipes momentum** — 7 more recipes, install wizard, @cia/a11y-recipes, @cia/react codegen POC, density knob, MCP zero-install | v1-1/ | 51 | Planned — not started (the npm version 1.1.0, published 2026-09-01, is NOT this backlog; see version-number caveat above) |
| [v1.2](./v1-2/README.md) | **Coverage** — RTL audit, form validation, i18n, print, MUI/Chakra migration, analyzer health report, token intelligence, print theme tokens | v1-2/ | 53 | Planned |
| [v1.3](./v1-3/README.md) | **Ecosystem** — Figma plugin, theme marketplace, DTCG migration, @cia/angular, AI token diff | v1-3/ | 38 | Planned |
| v1.4 | *Reserved — scoped from v1.1-v1.3 feedback* | — | — | Not scoped |
| [v1.5](./v1-5/README.md) | **IDE integration** — VS Code extension | v1-5/ | 15 | Planned |
| [v2.0](./v2-0/README.md) | **Visual builder** — Recipes Maker | v2-0/ | 18 | Planned — may never ship |

**Total planned stories across all versions:** 217 (was 188; the 2026-09-07 external-review wave added 19 across four epics — v1.1 MCP zero-install +4, v1.2 analyzer health report +6 and token intelligence +5, v1.3 AI token diff +4; then 2026-09-08 the print-theme-tokens epic added +10 to v1.2, growing to include a letterhead recipe and a theme-editor print mode).

> **On effort estimates.** Per-story day estimates live inside the individual
> epic files as planning aids. They are deliberately NOT summarised here or on
> the public roadmap page: a day count on a public list reads as a delivery
> date, and then work gets shipped to the date instead of to the standard.
> The public view is [`/docs/roadmap`](../../src/app/docs/roadmap/page.tsx),
> which states direction and ordering with no dates at all.

## Versioned epic format

Every versioned epic file follows the structure documented in [`v1-0/README.md`](./v1-0/README.md). Standard sections: Mission, Why now, Out of scope, Features (each with user stories + acceptance criteria + effort), Definition of done, Risks, Related.

### Story IDs

`US-V<MM>.<EE>.<FF>.<SS>` where:
- `V<MM>` = version major+minor (V10 for v1.0, V11 for v1.1, V15 for v1.5, V20 for v2.0)
- `<EE>` = epic number within that version
- `<FF>` = feature number within that epic
- `<SS>` = story number within that feature

Example: `US-V11.04.1.1` = v1.1, epic 04 (@cia/react POC), feature 1 (codegen pipeline), story 1 (parse recipe markdown into AST).

### Effort scale (hours-based)

- **S** — under 4 hours
- **M** — 4 to 8 hours
- **L** — 1 to 2 days
- **XL** — more than 2 days (rare; usually a sign the story should be split)

## Cross-cutting decisions (every epic respects these)

- **Zero JS in npm `files` manifest** — CLI binaries in `bin/` allowed (MCP server already there)
- **No `@layer`** — `:where()` for bare-tag specificity
- **No BEM** — no `__` / `--` patterns in cia class names
- **No component library to maintain** — recipes are the framework story; `@cia/<framework>` packs ship via codegen if at all
- **Mixin-first** — cia is the mixin; the selector is the consumer's choice
- **Themes are data** — one theme = one file via `light-dark()`; tokens only
- **Fail-by-default a11y** — `--allow-a11y-fail` opts out; default enforces WCAG 2.2 AA

See memory in `~/.claude/projects/K--repo-css-is-awesome/memory/` for the full architectural lock history.

## How to add an epic post-lock

1. Pick the right version folder (or create one)
2. Add `EPIC-<NN>-<name>.md` following the existing structure in that version
3. Update that version's `README.md` to list the new epic
4. Update this top-level README's "Versioned epic folders" table

## How to deprecate an epic

1. Rename file → `<filename>.archived.md`
2. Add header note: `**STATUS: ARCHIVED <date>** — Reason: <one line>. See [<replacement>](path) for current direction.`
3. Update the version README to note the archive
4. Don't delete — history matters

---

# Legacy: original 7 epics (preserved for history)

> The structure below predates the 2026-05-23 v1.0 architecture lock. Most items have shipped (MCP server, theme validator, CI, semantic-release) or were absorbed into the new versioned epics. The "Gremlin UI" plan in particular has been REVISED — see Phase 8 in `ROADMAP.md` and [`v1-0/post-v1-ideas.md`](./v1-0/post-v1-ideas.md) for the current "boiler = showcase, not a separate React component library" direction.

## Legacy format

```md
# Epic {N}: {Name}

## Summary
One paragraph. What this epic delivers and why it matters.

## Features

### Feature {N.M}: {Name}

#### User Stories

**US-{N}.{M}.{K}** — As a {role}, I want {goal}, so that {benefit}.

**Acceptance criteria:**
- [ ] criterion 1
- [ ] criterion 2

**Priority:** P0 | P1 | P2
**Effort:** 1 | 3 | 5 | 7 | 9 | 11 | 13
```

(Legacy effort scale was modified-Fibonacci 1-13; new versioned epics use S/M/L/XL with hour ranges. Mapping: old 1 → S, 3 → M, 7 → L, 13 → XL.)

## Legacy ID scheme

`US-{epic#}.{feature#}.{story#}` — e.g. `US-1.2.3` = legacy Epic 1, Feature 2, Story 3.

(New versioned epics use the prefixed format `US-V<MM>.<EE>.<FF>.<SS>` documented above to avoid collision.)

## Legacy priority scale

- **P0** — blocker for 1.0 release.
- **P1** — wanted for 1.0, can slip without blocking the release.
- **P2** — post-1.0.

## The original seven epics

1. [Library Foundations](01-library-foundations.md) — token coverage, sizing scale, `$theme-components` map, theme validator, dark-mode auto-detect *(largely shipped; only the component-depth audit, `roadmap/component-audit.md`, is outstanding)*
2. [Themes & Icons](02-themes-and-icons.md) — per-theme icon packs, preview thumbnails, authoring guide, community submission, contrast audit; add-ons feature *(largely shipped — **24 themes**, one SCSS source each, light/dark pairing + naming migration, Lucide core pack, contrast + icon validators (contrast false-pass bug fixed 2026-08-30), `/themes` editor; outstanding: Phosphor/Heroicons packs, per-theme size CI, add-ons layer. Community submission also tracked in [v1.3 EPIC-02 theme marketplace](./v1-3/EPIC-02-theme-marketplace.md))*
3. [React Component Library](03-react-components.md) — companion React component library — Gremlin UI *(**SUPERSEDED** 2026-05-23: NO separate component library ships; cia is zero-JS. `src/components/` is the docs-site reference. See the epic's STATUS banner and [v1.1 EPIC-04 @cia/react codegen](./v1-1/EPIC-04-framework-pack-react.md) for the codegen-if-at-all approach.)*
4. [Documentation Site](04-documentation-site.md) — real `/docs` content + site UX *(content shipped; chrome gaps — no site search, no custom 404, no OG images)*
5. [Quality & Delivery](05-quality-delivery.md) — tests, a11y, visual regression, Lighthouse, bundle budget, CI, deploy, release automation, Storybook, starter templates *(**partial**: CI + Playwright a11y/smoke/visual + release automation + Pages deploy shipped — and proven 2026-09-01: first npm publish (1.1.0) end to end via semantic-release, docs site live on Pages, visual baselines committed for both win32 and linux; Storybook explicitly killed; Jest unit harness, Lighthouse baseline, and bundle-size gates NOT built)*
6. [AI Integration](06-ai-integration.md) — MCP server, CLI, JSON tokens, AI prompt templates *(**shipped**: MCP server, `cia` CLI (`bin/cia.cjs`), JSON tokens, `llm.txt`, AGENTS/CLAUDE/GEMINI files; outstanding: prompt-template folder, hosted bots, unified `/docs/ai` page)*
7. [Community & Project Meta](07-community-meta.md) — CONTRIBUTING, CoC, SECURITY, issue/PR templates, SemVer policy *(mostly shipped; outstanding: FUNDING.yml, MAINTAINERS.md, brand assets, announcement kit)*

See also: [`roadmap/product-architecture.md`](../product-architecture.md) for the (also revised) umbrella product split.
