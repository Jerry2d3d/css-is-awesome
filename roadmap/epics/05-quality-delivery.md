# Epic 5: Quality & Delivery

## Summary
This epic owns the full build-validate-ship pipeline that takes code from a commit to users with confidence. Tests, CI, and release automation aren't three separate systems — they're one pipeline, and splitting them forced fake seams. Today the repo has zero tests (no Jest, no Playwright, no axe-core, no visual regression, no Lighthouse tracking, no bundle-size monitoring), no CI, no automated deploy, no release command, and no Storybook. Every change is risky and every claim ("accessible", "themeable", "small") is unverified. This epic stands up unit tests, accessibility validation, end-to-end and visual-regression suites, contrast audit, Lighthouse baseline, bundle-size regression gate, and manual-test plans for keyboard and screen readers; wires all of that into a GitHub Actions pipeline that lints, typechecks, builds, and tests every PR under 5 minutes; auto-deploys the docs site on every merge with preview URLs on every PR; automates version bumps, changelog regeneration, npm publish, and GitHub releases behind one command; installs Storybook with stories per component and a visual-testing harness; and ships pre-commit hooks, `dev:watch`, a bundle analyzer, TypeScript token definitions, and starter templates. By the time this epic closes, the only manual step in the release path is clicking "Merge".

## Goals
- Every PR runs lint + typecheck + build + the full test suite in under 5 minutes, with coverage posted as a PR comment.
- Zero axe-core violations (AA) on every documented page rendered in every in-repo theme, and every React component carries a jest-axe assertion.
- Every merge to `main` deploys the docs site to production within 10 minutes, and every PR gets a unique preview URL posted as a comment.
- `npm run release` is one command that bumps version (SemVer), regenerates `CHANGELOG.md`, builds `dist/`, publishes to npm, tags the commit, and creates a GitHub release — no human file-editing in between.
- Every React component has a co-located `*.test.tsx` unit test and a `.stories.tsx` Storybook story covering default, variants, states, and edge cases.
- Bundle-size regression gate blocks PRs that exceed the configured budget threshold on `dist/*.css` and `.next/static/css/*`.

## Out of scope
- Actual test fixes, component rewrites, or a11y remediation required to make the tests pass — those happen inline with the work in Epic 3 (React Component Library) and Epic 4 (Documentation Site).
- Writing the docs content — see Epic 4. This epic only builds and deploys the site.
- Theme-contract validator script — see Epic 1 (Library Foundations). This epic may invoke it from a workflow but doesn't define it.
- Load testing, security scanning, and fuzz testing — post-1.0.
- MCP/AI prompt evaluation suites and JSON token export for AI tooling — see Epic 6 (AI Integration). TypeScript token constants live in this epic; AI-consumable JSON does not.
- Community contribution policy, issue/PR templates, and CoC — see Epic 7 (Community & Project Meta).

## Features

### Feature 5.1: Unit test harness (Jest + React Testing Library)
Stand up the Jest + React Testing Library + `@testing-library/jest-dom` configuration and a co-location convention. Every React component gets a `ComponentName.test.tsx` file next to it. A shared `test-utils.tsx` wraps render with `ThemeProvider` so components can be tested under any theme.

#### User Stories

**US-5.1.1** — As a contributor, I want a working Jest + React Testing Library setup, so that I can write a component test without configuring tooling.

**Acceptance criteria:**
- [ ] `jest.config.js`, `jest.setup.ts`, and a `test-utils.tsx` exist at the repo root (or under `tests/`).
- [ ] `npm test` runs Jest against every `*.test.tsx` file and exits 0 on a clean tree.
- [ ] `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` are declared dev dependencies.
- [ ] A documented `renderWithTheme(ui, { theme })` helper wraps render with the site's ThemeProvider.
- [ ] The suite completes in under 30 seconds locally on a mid-range dev machine.

**Priority:** P1
**Effort:** 3
**Role:** contributor

**US-5.1.2** — As a contributor, I want every React component to have a co-located test file, so that I can't forget to add coverage when I add a component.

**Acceptance criteria:**
- [ ] Every file under `app/components/**/*.tsx` (excluding story/demo files) has a matching `*.test.tsx` sibling.
- [ ] Each test file covers at minimum: renders with default props, accepts and merges `className`, accepts and merges inline `style`, forwards `ref`, fires the primary callback on the primary interaction.
- [ ] A lint rule or CI script flags components missing a test file.
- [ ] The missing-test check runs on every PR and fails the build on regression.

**Priority:** P1
**Effort:** 7
**Role:** contributor

**US-5.1.3** — As a reviewer, I want a documented minimum-test checklist, so that I can tell at a glance whether a PR's tests are complete.

**Acceptance criteria:**
- [ ] `tests/README.md` lists the minimum test cases per component archetype (atom, form control, overlay, navigation).
- [ ] The checklist is linked from the PR template.
- [ ] At least three example test files (one atom, one form control, one overlay) live in the repo as reference implementations.
- [ ] Produces an artifact (Jest's JSON output) a reviewer can read.

**Priority:** P2
**Effort:** 1
**Role:** reviewer

### Feature 5.2: Accessibility tests (jest-axe)
Every component test file runs `jest-axe` against its rendered output and asserts zero violations at AA level. Every documented page route also gets a Playwright-driven axe run. This is a hard gate — not a warning — because "accessible" is a load-bearing claim of the system.

#### User Stories

**US-5.2.1** — As an accessibility reviewer, I want every React component to include a jest-axe assertion, so that a11y regressions are caught at the unit level.

**Acceptance criteria:**
- [ ] `jest-axe` is installed and configured with the site's axe rule set (AA).
- [ ] Every `*.test.tsx` in `app/components/` includes at least one `expect(...).toHaveNoViolations()` assertion against its rendered output.
- [ ] The assertion runs against the component in each of its documented states (e.g. default, disabled, error).
- [ ] Runs on every PR via CI (see Feature 5.13) and fails the build on any violation.
- [ ] Produces a JSON violation report artifact on failure.
- [ ] Completes in under 20 seconds locally across the full component suite.

**Priority:** P0
**Effort:** 7
**Role:** accessibility reviewer

**US-5.2.2** — As an accessibility reviewer, I want every documented page to pass axe-core at AA in every theme, so that page-level composition issues are caught.

**Acceptance criteria:**
- [ ] A Playwright test enumerates every route in `app/` and runs `@axe-core/playwright` with AA rules against each.
- [ ] The test iterates every in-repo theme (`public/theme.css` + `public/themes/*`) per route.
- [ ] Zero violations allowed; violations fail the build (not just warn).
- [ ] Violation details (rule, selector, snippet) are written to a JSON artifact per run.
- [ ] Runs on every PR via CI.

**Priority:** P0
**Effort:** 7
**Role:** accessibility reviewer

**US-5.2.3** — As a maintainer, I want a short allowlist mechanism for known-accepted axe violations, so that a documented intentional exception doesn't block the build forever.

**Acceptance criteria:**
- [ ] A `tests/a11y-allowlist.json` file maps rule-id + selector to a justification string and an expiry date.
- [ ] Allowlisted violations don't fail the build but log a warning with the justification.
- [ ] Expired allowlist entries fail the build until renewed or removed.
- [ ] The allowlist is referenced from the accessibility statement (Feature 5.11).

**Priority:** P2
**Effort:** 1
**Role:** maintainer

### Feature 5.3: End-to-end smoke tests (Playwright)
A Playwright suite exercises the built docs site: loads the landing page, navigates the docs sidebar, switches themes via the picker, confirms the choice persists across reloads, and verifies every documented route returns 200. Runs across Chromium, Firefox, and WebKit.

#### User Stories

**US-5.3.1** — As a contributor, I want a Playwright setup that runs against a locally built site, so that I can catch navigation and integration regressions before pushing.

**Acceptance criteria:**
- [ ] `playwright.config.ts` exists with projects for Chromium, Firefox, and WebKit.
- [ ] `npm run test:e2e` boots the Next.js production build and runs the suite against it.
- [ ] A smoke test covers: landing loads, docs sidebar renders, at least two route clicks succeed.
- [ ] Completes in under 90 seconds locally on a single browser.
- [ ] Produces an HTML report reviewers can open.

**Priority:** P1
**Effort:** 3
**Role:** contributor

**US-5.3.2** — As a reviewer, I want an end-to-end test that verifies theme switching and persistence, so that the theme picker doesn't silently break.

**Acceptance criteria:**
- [ ] A Playwright spec switches to each in-repo theme via the picker and asserts `data-theme` updates on `<html>` or `<body>`.
- [ ] The spec reloads the page and asserts the chosen theme persists (localStorage is honored).
- [ ] The spec clears the override and asserts the site reverts to system preference.
- [ ] Runs on every PR via CI.
- [ ] Fails the build on regression — not just a warning.

**Priority:** P1
**Effort:** 3
**Role:** reviewer

**US-5.3.3** — As a release manager, I want every documented route enumerated and pinged in the smoke suite, so that a dead route never reaches a release.

**Acceptance criteria:**
- [ ] A Playwright test derives the route list from the Next.js app directory structure (or a manifest file) so new routes are automatically included.
- [ ] Each route is visited and the HTTP status is asserted to be 200.
- [ ] Routes returning 3xx/4xx/5xx fail the build with the failing URL logged.
- [ ] Produces a route coverage artifact showing which routes were tested.

**Priority:** P1
**Effort:** 1
**Role:** release manager

### Feature 5.4: Visual regression tests
Screenshot every documented page in every in-repo theme at a fixed viewport, and every Storybook story per component, diff against a committed baseline using `pixelmatch` (or a hosted provider like Chromatic), fail on any diff over the configured pixel threshold. Baseline regeneration requires explicit approval; it never happens automatically. Pages × themes covers the integrated docs site; stories cover component-level rendering in isolation — both run on every PR.

#### User Stories

**US-5.4.1** — As a reviewer, I want a visual regression suite that screenshots every page in every theme, so that unintended visual changes are caught before merge.

**Acceptance criteria:**
- [ ] A Playwright spec iterates every route × every in-repo theme and captures a PNG screenshot at a fixed viewport (e.g. 1280×800).
- [ ] Each screenshot is diffed against `tests/visual/__baseline__/{route}--{theme}.png` using `pixelmatch`.
- [ ] Diffs over a configured pixel threshold (documented in `tests/visual/README.md`) fail the build.
- [ ] Failing runs produce a side-by-side diff PNG per regression as a CI artifact.
- [ ] Runs on every PR via CI.

**Priority:** P1
**Effort:** 7
**Role:** reviewer

**US-5.4.2** — As a maintainer, I want a visual-regression run against every Storybook story on every PR, so that I catch unintended component-level UI changes before merge.

**Acceptance criteria:**
- [ ] A CI job runs visual regression against every story in the PR branch vs. `main` baselines (via Chromatic or Storybook + Playwright screenshots).
- [ ] Changed stories are flagged with diff images (Chromatic UI or uploaded as workflow artifacts).
- [ ] A green run with zero diffs requires no human action.
- [ ] Runs reliably in CI and reproducibly locally via an npm script.
- [ ] Documented in `CONTRIBUTING.md`.
- [ ] Failure mode is actionable: comment links directly to the diff.

**Priority:** P1
**Effort:** 7
**Role:** maintainer

**US-5.4.3** — As a maintainer, I want baseline snapshots to regenerate only with explicit approval, so that a contributor can't silently normalize a visual regression.

**Acceptance criteria:**
- [ ] Running `npm run test:visual -- --update` is the only way to overwrite page × theme baseline PNGs locally, and an equivalent documented "accept baseline" step exists for story baselines (e.g. a Chromatic approval URL, or `npm run test:visual:update`).
- [ ] CI never regenerates baselines automatically; the baseline-update flag is gated behind a dedicated workflow dispatch.
- [ ] Baseline PNGs live under version control (`tests/visual/__baseline__/`) and diff reviewably in PRs; story baselines are either committed or host-managed.
- [ ] Accepting a baseline requires explicit action — no silent auto-approval.
- [ ] `tests/visual/README.md` and `CONTRIBUTING.md` document the update workflow and review expectations.

**Priority:** P1
**Effort:** 3
**Role:** maintainer

**US-5.4.4** — As a contributor, I want fast local feedback on a single page × theme pair, so that I'm not waiting for the full matrix during iteration.

**Acceptance criteria:**
- [ ] `npm run test:visual -- --route=/docs/buttons --theme=graphite` runs only that pair.
- [ ] The single-pair run completes in under 15 seconds locally.
- [ ] The command is documented in `tests/visual/README.md`.

**Priority:** P2
**Effort:** 1
**Role:** contributor

**US-5.4.5** — As a release manager, I want secrets for the chosen visual-testing provider stored in GitHub Actions secrets, so that no tokens land in the repo.

**Acceptance criteria:**
- [ ] `CHROMATIC_PROJECT_TOKEN` (or equivalent) lives in GitHub Actions secrets.
- [ ] The workflow references the secret by name; no token in any committed file.
- [ ] Required secret names are listed in `CONTRIBUTING.md`.

**Priority:** P1
**Effort:** 1
**Role:** release manager

### Feature 5.5: Color contrast audit per theme
A script enumerates every token pair that must meet WCAG contrast (text on surface at AA, body text at AAA) in every in-repo theme and reports fails by theme and pair. Runs in CI on every PR that touches a theme file or a contrast-sensitive component.

#### User Stories

**US-5.5.1** — As an accessibility reviewer, I want an automated contrast audit across every theme, so that no theme ships with a contrast failure.

**Acceptance criteria:**
- [ ] `scripts/contrast-audit.js` enumerates every in-repo theme (`public/theme.css` + `public/themes/*/theme.css`).
- [ ] For each theme, it reads the token contract and computes WCAG contrast ratios for every documented text-on-surface pair.
- [ ] Text-on-surface fails AA → build fails. Body-paragraph text fails AAA → build fails.
- [ ] The script exits 0 on full pass, non-zero on any failure, and prints a table of ratios per pair per theme.
- [ ] Runs in under 3 seconds against all in-repo themes.
- [ ] Produces a JSON artifact with per-pair ratios for the accessibility statement.

**Priority:** P0
**Effort:** 3
**Role:** accessibility reviewer

**US-5.5.2** — As a theme author, I want to run the contrast audit against a single theme locally, so that I can iterate on a new theme without running the full suite.

**Acceptance criteria:**
- [ ] `node scripts/contrast-audit.js public/themes/foo/theme.css` runs against a single file.
- [ ] Output clearly lists every pair, its computed ratio, and its pass/fail status per rule level.
- [ ] Completes in under 1 second on a single theme.
- [ ] Zero npm runtime dependencies (stdlib only) to match the theme-validator convention (Epic 1).

**Priority:** P1
**Effort:** 1
**Role:** theme author

**US-5.5.3** — As a CI system, I want the contrast audit integrated into the PR flow, so that a failing theme blocks merge.

**Acceptance criteria:**
- [ ] A CI step runs `contrast-audit.js` against every theme on every PR (see Feature 5.13 for workflow wiring).
- [ ] The step fails the build on any non-zero exit.
- [ ] The step's log lists each theme and pass/fail summary before the detailed table.
- [ ] Fails the build on regression — not just a warning.

**Priority:** P0
**Effort:** 1
**Role:** CI system

**US-5.5.4** — As a system author, I want the contrast audit folded into `scripts/theme-validator.js` and driven by `scripts/theme-contract.json`, so that one tool checks both token coverage and contrast in one pass.

**Acceptance criteria:**
- [ ] `scripts/theme-contract.json` declares a `contrastPairs` array mapping foreground tokens to background tokens with a required level (`AA-body` ≥ 4.5:1, `AA-large` ≥ 3:1, `AAA-body` ≥ 7:1).
- [ ] `scripts/theme-validator.js` resolves each token reference to its computed color (handling `var()` chains, hex, rgb(), hsl(), and oklch()) and computes the WCAG 2.x contrast ratio per pair.
- [ ] A failing pair is reported as `theme=<name> pair=<fg>-on-<bg> ratio=<n>:1 required=<level>` and exits non-zero.
- [ ] Both consolidated `[data-theme="..."]` and per-file `:root { ... }` shapes are supported (matching existing validator detection).
- [ ] Zero npm runtime dependencies (stdlib only) — preserves the validator's Path A constraint.
- [ ] No duplicate logic with `scripts/contrast-audit.js`; the audit script either delegates to the validator or is removed in favor of a single entrypoint, and `tests/README.md` documents the consolidation.

**Priority:** P1
**Effort:** 5
**Role:** system author

**US-5.5.5** — As a theme author, I want the validator to tell me which pair failed and by how much, so that I can adjust one token instead of re-tuning the whole palette.

**Acceptance criteria:**
- [ ] On failure, the validator prints a table with columns: pair, foreground hex, background hex, computed ratio, required ratio, deficit.
- [ ] The deficit column shows the delta (e.g. `-0.7:1`) so the author knows how much darker/lighter the token must move.
- [ ] A `--explain <pair>` flag prints the full resolution chain (`--cia-fg-muted` → `var(--cia-gray-600)` → `#6b7280`) so an author can see which raw token to change.
- [ ] Documented in the theme authoring guide (Epic 2) and linked from the failure output.

**Priority:** P1
**Effort:** 3
**Role:** theme author

### Feature 5.6: Lighthouse baseline
Every route gets a Lighthouse run via `@lhci/cli` (or equivalent). A JSON baseline is committed to the repo. PRs that drop any category score more than the configured delta fail CI.

#### User Stories

**US-5.6.1** — As a release manager, I want Lighthouse scores tracked per route, so that performance and a11y regressions are visible over time.

**Acceptance criteria:**
- [ ] `lighthouserc.json` (or equivalent) enumerates every documented route and the four Lighthouse categories.
- [ ] A committed baseline file (`tests/lighthouse/baseline.json`) records expected scores per route per category.
- [ ] `npm run test:lighthouse` runs against a local production build and diffs results against the baseline.
- [ ] Scores are archived per run as a CI artifact.

**Priority:** P1
**Effort:** 3
**Role:** release manager

**US-5.6.2** — As a reviewer, I want Lighthouse regressions to fail CI, so that a slow page or a11y regression doesn't sneak in.

**Acceptance criteria:**
- [ ] A configured delta (documented in `tests/lighthouse/README.md`) defines the maximum allowed drop per category (e.g. performance: -5 points).
- [ ] The CI step fails on any route where any category drops beyond its delta.
- [ ] The failing route and category are named in the CI log.
- [ ] Runs on every PR via CI.
- [ ] Produces an artifact (Lighthouse HTML or JSON report) a reviewer can read.

**Priority:** P1
**Effort:** 1
**Role:** reviewer

**US-5.6.3** — As a maintainer, I want baseline updates to require explicit approval, so that scores don't quietly drift downward over releases.

**Acceptance criteria:**
- [ ] Baseline JSON is committed; updating it requires a deliberate `npm run test:lighthouse -- --update-baseline` command.
- [ ] CI never updates the baseline automatically.
- [ ] PRs that update the baseline diff the scores in a reviewable way.
- [ ] `tests/lighthouse/README.md` documents when a baseline bump is appropriate (e.g. explicit perf work landed).

**Priority:** P2
**Effort:** 1
**Role:** maintainer

### Feature 5.7: Bundle-size monitoring
Every PR measures `dist/*.css` (library output) and `.next/static/css/*` (site output) against a committed baseline. Over-budget PRs fail; under-budget PRs update the baseline (with opt-in) so "wins" stick. A `npm run analyze` command produces an interactive `webpack-bundle-analyzer` (or `@next/bundle-analyzer`) treemap to diagnose what's big in the Next.js build.

#### User Stories

**US-5.7.1** — As a reviewer, I want bundle sizes reported on every PR, so that I see the size impact of a change before approving.

**Acceptance criteria:**
- [ ] `scripts/bundle-size.js` measures each `dist/*.css` file and each `.next/static/css/*.css` file.
- [ ] A committed baseline (`tests/bundle-size/baseline.json`) records the byte size (and gzipped size) per file.
- [ ] `npm run test:bundle-size` prints a table: file, baseline, current, delta %, verdict.
- [ ] Runs on every PR via CI (see Feature 5.13).
- [ ] Produces the table as a CI artifact / PR comment for reviewer visibility.

**Priority:** P0
**Effort:** 3
**Role:** reviewer

**US-5.7.2** — As a CI system, I want configurable warn/fail thresholds, so that the gate's strictness is explicit.

**Acceptance criteria:**
- [ ] The warn threshold (default: +5%) and fail threshold (default: +10%) are declared in `tests/bundle-size/config.json` with inline comments.
- [ ] Exceeding warn logs a warning; exceeding fail fails the build.
- [ ] Thresholds are overridable per file (e.g. a new bundle might accept a larger delta during initial stabilization).
- [ ] Fails the build on regression — not just a warning.

**Priority:** P0
**Effort:** 1
**Role:** CI system

**US-5.7.3** — As a maintainer, I want baseline updates to be an explicit action, so that size creep can't hide behind auto-updated baselines.

**Acceptance criteria:**
- [ ] `npm run test:bundle-size -- --update-baseline` is the only way to overwrite `baseline.json`.
- [ ] CI never updates the baseline automatically.
- [ ] Updating the baseline in a PR produces a visible diff a reviewer can evaluate.
- [ ] `tests/bundle-size/README.md` documents when a baseline bump is appropriate.

**Priority:** P1
**Effort:** 1
**Role:** maintainer

**US-5.7.4** — As a contributor, I want `npm run analyze` to produce an interactive bundle treemap, so that I can see what's big in the Next.js build.

**Acceptance criteria:**
- [ ] `npm run analyze` runs the Next.js build with `@next/bundle-analyzer` (or equivalent) enabled.
- [ ] An HTML report opens in the browser (or is written to a known path) showing chunk sizes.
- [ ] Documented in `CONTRIBUTING.md` under "Performance".

**Priority:** P2
**Effort:** 1
**Role:** contributor

**US-5.7.5** — As a maintainer, I want a size budget posted as a PR comment when the bundle grows beyond a threshold, so that size regressions get attention.

**Acceptance criteria:**
- [ ] A CI step measures total JS+CSS bundle size and compares to `main`.
- [ ] A PR that grows the bundle by more than the documented threshold (e.g. 10KB gzipped) gets a warning comment.
- [ ] Threshold is documented in `CONTRIBUTING.md` and tunable in one config file.
- [ ] Failure mode is actionable: the comment names the chunk that grew.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

**US-5.7.6** — As a CI system, I want hard absolute byte budgets on the published library bundles, so that the "tiny by default" claim is enforceable, not aspirational.

**Acceptance criteria:**
- [ ] `tests/bundle-size/budgets.json` declares absolute gzipped budgets: `dist/css-is-awesome.core.min.css` ≤ 3 KB, `dist/css-is-awesome.min.css` (full) ≤ 12 KB, and a per-route Next.js editor hydration budget (initial value documented and tunable).
- [ ] `scripts/bundle-size.js` measures gzipped size of each declared artifact and exits non-zero on any over-budget file.
- [ ] The CI step runs on every PR (Feature 5.12) and blocks merge on failure — independent of the baseline-delta gate (US-5.7.1) so a "small but over-budget" file still fails.
- [ ] Each budget line has an inline comment in `budgets.json` justifying the number against a competitor reference (Tailwind reset, Pico, Bootstrap reboot).
- [ ] The published `README.md` "size" badge is generated from the same measurement so the marketing number cannot drift from the gate.

**Priority:** P0
**Effort:** 3
**Role:** CI system

**US-5.7.7** — As a consumer, I want a public size dashboard or badge on the docs site, so that I can see at a glance how cia compares to competing systems.

**Acceptance criteria:**
- [ ] The docs site renders a size table showing `core.min.css`, `full.min.css`, and the hydrated editor-route cost in raw and gzipped bytes, generated from the latest CI run.
- [ ] The table includes a column for at least three competitor references (Tailwind preflight + utilities, Bootstrap reboot, Pico) updated by a documented script.
- [ ] The numbers are dynamically updated on release (not hand-maintained) and dated.
- [ ] Source is the same `bundle-size.js` artifact CI uses, ensuring marketing claims and gate enforcement match.

**Priority:** P2
**Effort:** 3
**Role:** consumer

### Feature 5.8: Browser matrix verification
Playwright runs the full suite against Chromium, Firefox, and WebKit. A documented manual-test plan covers iOS Safari and Android Chrome at mobile viewport sizes, since headless WebKit does not perfectly emulate mobile Safari.

#### User Stories

**US-5.8.1** — As a CI system, I want the Playwright suite to run against Chromium, Firefox, and WebKit on every PR, so that cross-browser regressions are caught automatically.

**Acceptance criteria:**
- [ ] `playwright.config.ts` declares projects for all three browsers.
- [ ] The CI workflow (see Feature 5.13) runs each browser as a matrix job.
- [ ] Per-browser results are surfaced in the PR.
- [ ] Failing on any one browser fails the overall build.
- [ ] Produces per-browser HTML reports as artifacts.

**Priority:** P2
**Effort:** 3
**Role:** CI system

**US-5.8.2** — As a release manager, I want a documented mobile manual-test plan, so that iOS and Android coverage isn't skipped just because automation can't fully emulate them.

**Acceptance criteria:**
- [ ] `tests/manual/mobile-checklist.md` lists the routes, viewports, and interactions to test on a physical device.
- [ ] The checklist covers iOS Safari (latest and latest-1) and Android Chrome (latest).
- [ ] The release checklist (Feature 5.16) references this document as a required step before cutting a release.
- [ ] The document includes a template for recording results.

**Priority:** P2
**Effort:** 1
**Role:** release manager

### Feature 5.9: Manual accessibility checklists (keyboard + screen reader)
Documented hand-run checklists that a reviewer or contributor walks through for any new interactive component. Keyboard coverage: Tab order, Escape to dismiss overlays, Enter to activate, Arrow keys on composite widgets (menus, tabs, sliders, lists), and focus visibility. Screen reader coverage: VoiceOver (macOS / iOS), NVDA (Windows), and JAWS (Windows). Not automated — automation of screen reader semantics is unreliable. Required before every release and for any PR that adds or significantly changes an interactive component.

#### User Stories

**US-5.9.1** — As an accessibility reviewer, I want a keyboard-navigation checklist per component archetype, so that keyboard support is verified consistently.

**Acceptance criteria:**
- [ ] `tests/manual/keyboard-checklist.md` documents expected keyboard behavior per archetype (button, menu, tabs, slider, list, dialog, form).
- [ ] Each archetype lists the keys that must work and the expected focus/state change.
- [ ] The checklist references WAI-ARIA Authoring Practices for each pattern.
- [ ] The document fits the "completes in under 30 minutes per release" criterion for a full site sweep.

**Priority:** P1
**Effort:** 1
**Role:** accessibility reviewer

**US-5.9.2** — As a contributor, I want the keyboard checklist linked from the PR template, so that I remember to run it against any interactive component I touch.

**Acceptance criteria:**
- [ ] The PR template includes a "Keyboard check" section referencing the checklist.
- [ ] The PR template's checkbox is not auto-checked; contributor must tick it deliberately.
- [ ] A dedicated section in the checklist covers focus-visible styling per theme.
- [ ] Produces a reviewer-readable record in the PR description itself.

**Priority:** P2
**Effort:** 1
**Role:** contributor

**US-5.9.3** — As an accessibility reviewer, I want a documented screen reader checklist per archetype, so that AT coverage is verified before release.

**Acceptance criteria:**
- [ ] `tests/manual/screen-reader-checklist.md` covers VoiceOver, NVDA, and JAWS.
- [ ] For each archetype (button, menu, tabs, dialog, form, table, alert), the expected announcement and navigation order is documented.
- [ ] The checklist notes known-acceptable differences between AT (e.g. verbose vs terse announcement).
- [ ] The document is linked from the release checklist (Feature 5.16).

**Priority:** P1
**Effort:** 3
**Role:** accessibility reviewer

**US-5.9.4** — As a release manager, I want screen-reader smoke results recorded per release, so that we have an auditable trail of AT verification.

**Acceptance criteria:**
- [ ] A template for recording results (AT, version, OS, date, tester, pass/fail per archetype) lives next to the checklist.
- [ ] Completed run logs are stored under `tests/manual/runs/{YYYY-MM-DD}-{release}.md`.
- [ ] The release checklist (Feature 5.16) references a completed run as a release gate.
- [ ] Produces an artifact (the run log) a reviewer can read.

**Priority:** P2
**Effort:** 1
**Role:** release manager

### Feature 5.10: Accessibility statement
A public a11y conformance statement at `/accessibility` on the docs site (with a source `a11y.md` at the repo root). States the conformance target (WCAG 2.1 AA, with AAA for body text), lists known gaps, links to the contrast audit results, and provides a contact path for reporting issues.

#### User Stories

**US-5.10.1** — As a consumer, I want a clear accessibility statement, so that I can evaluate whether css-is-awesome meets my own compliance requirements.

**Acceptance criteria:**
- [ ] `a11y.md` exists at the repo root.
- [ ] A `/accessibility` page on the docs site renders the same content (or links to the markdown source).
- [ ] The statement declares the target conformance level and the date of last audit.
- [ ] Known gaps, with workarounds where available, are listed.
- [ ] A contact method for reporting issues is included.

**Priority:** P1
**Effort:** 1
**Role:** consumer

**US-5.10.2** — As a maintainer, I want the accessibility statement linked to automated-audit outputs, so that claims stay honest over time.

**Acceptance criteria:**
- [ ] The statement links to the contrast-audit JSON artifact location (Feature 5.5) and the axe artifact location (Feature 5.2).
- [ ] A section notes that contrast and axe checks run on every PR via CI.
- [ ] A section lists allowlisted axe violations and their justifications (US-5.2.3).
- [ ] The statement is updated as part of the release checklist (Feature 5.16).

**Priority:** P2
**Effort:** 1
**Role:** maintainer

### Feature 5.11: Coverage reporting
Istanbul/c8 coverage runs as part of `npm test`. A baseline threshold is configured in `jest.config.js`. PRs that drop below threshold fail CI. Coverage reports are archived as CI artifacts.

#### User Stories

**US-5.11.1** — As a reviewer, I want unit-test coverage reported on every PR, so that I can see whether new code is tested.

**Acceptance criteria:**
- [ ] `jest.config.js` enables coverage collection across `app/components/**/*.{ts,tsx}`.
- [ ] Coverage reports (lcov + html) are produced on every `npm test -- --coverage` run.
- [ ] The HTML report is uploaded as a CI artifact a reviewer can download.
- [ ] The report surfaces line, branch, function, and statement coverage per file.

**Priority:** P2
**Effort:** 1
**Role:** reviewer

**US-5.11.2** — As a CI system, I want a configured coverage threshold that fails the build, so that untested code can't pile up silently.

**Acceptance criteria:**
- [ ] `jest.config.js` declares per-metric thresholds (documented defaults in `tests/README.md`).
- [ ] Falling below any threshold fails `npm test`.
- [ ] The thresholds are justified inline (a comment explaining why the chosen numbers).
- [ ] Fails the build on regression — not just a warning.

**Priority:** P2
**Effort:** 1
**Role:** CI system

**US-5.11.3** — As a maintainer, I want threshold bumps to be deliberate, so that coverage trends upward over time.

**Acceptance criteria:**
- [ ] Raising a threshold requires a PR that explicitly edits `jest.config.js`.
- [ ] `tests/README.md` documents the project's coverage philosophy (what to measure, what to exclude).
- [ ] Exclusions (e.g. generated files, type-only files) are listed and justified inline.

**Priority:** P2
**Effort:** 1
**Role:** maintainer

### Feature 5.12: GitHub Actions CI pipeline
A single `.github/workflows/ci.yml` workflow that runs on every PR and every push to `main`. It installs dependencies once, then runs lint (ESLint + Stylelint), typecheck (`tsc --noEmit`), both builds (`npm run build` and `npm run build:css:all`), and the full Jest + Playwright test suite from Features 5.1–5.11. Coverage is uploaded as an artifact and posted as a PR comment. The workflow uses the Node version from `.nvmrc` and caches `node_modules` for speed.

#### User Stories

**US-5.12.1** — As a contributor, I want every PR to be automatically linted, typechecked, built, and tested, so that I get feedback before a maintainer reviews the change.

**Acceptance criteria:**
- [ ] `.github/workflows/ci.yml` runs on `pull_request` and `push` to `main`.
- [ ] Steps include: checkout, setup-node (from `.nvmrc`), `npm ci`, lint, typecheck, build, test.
- [ ] A failing step fails the workflow and blocks merge (enforced via branch protection).
- [ ] Runs reliably in CI and reproducibly locally via the same npm scripts.
- [ ] Documented in `README.md` and `CONTRIBUTING.md`.
- [ ] Failure mode is actionable: each failed step points to the exact file/rule.

**Priority:** P0
**Effort:** 3
**Role:** contributor

**US-5.12.2** — As a contributor, I want CI to finish in under 5 minutes, so that I don't context-switch waiting for it.

**Acceptance criteria:**
- [ ] A green run on `main` completes in under 5 minutes on a fresh cache.
- [ ] `node_modules` is cached via `actions/setup-node` cache or `actions/cache` keyed on `package-lock.json`.
- [ ] Jest and Playwright tests run with appropriate parallelism for the runner.
- [ ] Wall-clock times for each job are visible in the workflow summary.

**Priority:** P0
**Effort:** 3
**Role:** contributor

**US-5.12.3** — As a contributor, I want test coverage posted as a PR comment, so that I can see whether my change moved the number.

**Acceptance criteria:**
- [ ] After the test step, a workflow job posts a coverage summary comment on the PR.
- [ ] The comment shows lines/branches/functions/statements percentages and a delta vs. `main`.
- [ ] The comment is updated (not duplicated) on every push to the PR branch.
- [ ] Coverage artifact (`lcov.info`) is uploaded for download.

**Priority:** P1
**Effort:** 1
**Role:** contributor

**US-5.12.4** — As a CI system, I want secrets (npm token, deploy key) stored in GitHub Actions secrets, so that no credentials land in the repo.

**Acceptance criteria:**
- [ ] No `.env*` file with real values is committed; only `.env.example`.
- [ ] All sensitive values are referenced as `${{ secrets.NAME }}` in workflows.
- [ ] Required secret names are documented in `CONTRIBUTING.md`.
- [ ] A workflow that requires a missing secret fails with a clear message naming the missing secret.

**Priority:** P0
**Effort:** 1
**Role:** CI system

### Feature 5.13: Docs-site deploy with preview URLs
The docs site (Next.js app at repo root) auto-deploys to Jerry's chosen host on every merge to `main`. Every PR gets a unique preview deployment with its URL posted as a PR comment. The host choice (Vercel, Netlify, Cloudflare Pages, GitHub Pages with a static export) is documented in `DEPLOY.md` and encoded in one workflow file.

#### User Stories

**US-5.13.1** — As a maintainer, I want the docs site to auto-deploy to production on every merge to `main`, so that the public site is never stale.

**Acceptance criteria:**
- [ ] A workflow or host-native integration deploys `main` to production within 10 minutes of merge.
- [ ] The production URL is documented in `README.md`.
- [ ] A failed deploy surfaces an error in the workflow log and does not silently leave the site broken.
- [ ] Rollback procedure is documented in `DEPLOY.md`.

**Priority:** P0
**Effort:** 3
**Role:** maintainer

**US-5.13.2** — As a contributor, I want every PR to get a preview deploy URL, so that reviewers can click through visual changes before merge.

**Acceptance criteria:**
- [ ] Opening a PR triggers a preview deploy that finishes within 10 minutes.
- [ ] The preview URL is posted as a sticky PR comment (edited on subsequent pushes, not duplicated).
- [ ] Each preview is unique per PR (not overwritten by sibling PRs).
- [ ] Preview is torn down or garbage-collected on PR close.

**Priority:** P1
**Effort:** 3
**Role:** contributor

**US-5.13.3** — As a host provider, I want the deploy workflow to use host-native conventions, so that I'm not fighting the platform.

**Acceptance criteria:**
- [ ] If the host supports native Git integration (e.g. Vercel, Netlify), that path is used and documented.
- [ ] If a GitHub Actions workflow is required (e.g. GH Pages), it uses the official first-party action.
- [ ] Secrets required by the host (API token, site ID) are in GitHub Actions secrets, not committed.
- [ ] `DEPLOY.md` lists the host, the auth mechanism, and how to change hosts.

**Priority:** P1
**Effort:** 1
**Role:** host provider

### Feature 5.14: npm publish hygiene
Before shipping 1.0, `package.json` must declare `exports`, a minimal `files` allowlist, `sideEffects`, `module`/`main`, and `types` if applicable. Every CDN link in the README and docs site must include an SRI hash. Dry-run `npm publish` must produce a tarball with only the intended contents.

#### User Stories

**US-5.14.1** — As a consumer, I want the npm package to declare `exports`, `files`, `sideEffects`, `module`/`main`, so that my bundler tree-shakes correctly and installs nothing extra.

**Acceptance criteria:**
- [ ] `package.json` has an `exports` map covering every public entry point (SCSS, compiled CSS, any JS/TS).
- [ ] `files` is an explicit allowlist (at minimum: `scss/`, `dist/`, `figma-tokens/`, `README.md`, `LICENSE`).
- [ ] `sideEffects` is declared accurately (CSS imports marked, pure JS marked `false`).
- [ ] `module`, `main`, and (if typed) `types` point to real files that exist in the published tarball.
- [ ] Documented in `CONTRIBUTING.md` under a "Release Hygiene" section.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-5.14.2** — As a release manager, I want `npm publish --dry-run` to show a tarball with only the intended files, so that I never accidentally publish `node_modules` or source artifacts.

**Acceptance criteria:**
- [ ] `npm publish --dry-run` output is captured and inspected in CI as part of the release flow.
- [ ] Tarball size is under a documented threshold (e.g. 500KB for the library itself).
- [ ] `.npmignore` is either absent (relying on `files`) or consistent with `files`, not conflicting.
- [ ] No `src/`, `test/`, `node_modules/`, or tooling config leaks into the tarball.
- [ ] Failure mode is actionable: if the tarball contains an unexpected file, CI names it.

**Priority:** P0
**Effort:** 1
**Role:** release manager

**US-5.14.3** — As a consumer, I want every CDN link in the README and docs site to carry an SRI hash, so that I can verify the file I'm loading hasn't been tampered with.

**Acceptance criteria:**
- [ ] Every `<link>` or `<script>` pointing at a CDN URL in `README.md` and the docs site includes an `integrity="sha384-..."` and `crossorigin="anonymous"` attribute.
- [ ] SRI hashes are regenerated as part of the release flow (Feature 5.15) and committed with the release.
- [ ] A script (`scripts/sri.js` or similar) computes and updates hashes in one pass.
- [ ] Running the site with a tampered file fails to load (manually verified once and noted in `DEPLOY.md`).

**Priority:** P0
**Effort:** 1
**Role:** consumer

**US-5.14.4** — As a release manager, I want a CDN-suitability review before cutting v1.0, so that we ship under a delivery story we've actually audited rather than defaulted into.

**Acceptance criteria:**
- [ ] Audit doc at `docs/release/cdn-review.md` (or similar) compares the current CDN strategy (jsDelivr auto-mirror + unpkg fallback) against at least three alternates: self-hosted edge (Cloudflare R2 + Workers), a different commercial CDN (e.g. KeyCDN, Bunny), and a "no-CDN, npm-only" stance.
- [ ] Each option is scored on: free-for-OSS pricing, global edge presence, uptime track record, supply-chain posture (SRI support, mutability, signing), tracking/analytics behavior on served files, and how easy it is to migrate away from later.
- [ ] Decision is recorded with reasoning ("stay on jsDelivr because X" or "move to Y because Z"), signed off in the v1.0 release checklist.
- [ ] If the decision is to migrate, a migration story is filed against this epic with effort and target version before v1.0 ships.
- [ ] Review is rerun before any subsequent major (v2.0+) so we don't sleepwalk into a CDN that became wrong.

**Priority:** P1
**Effort:** 1
**Role:** release manager
**Effort:** 3
**Role:** consumer

### Feature 5.15: Release automation
A single command — `npm run release` — bumps the package version (SemVer), regenerates `CHANGELOG.md` from Conventional Commits or Changesets, builds `dist/`, publishes to npm, creates a git tag, pushes the tag, and creates a GitHub release whose body is the changelog excerpt for that version. Alternatively, triggered by applying a `release` label on a PR. No manual `npm version`, no manual file edits, no manual `git tag`.

#### User Stories

**US-5.15.1** — As a release manager, I want `npm run release` to perform every step of a release in order, so that I cannot forget one.

**Acceptance criteria:**
- [ ] `npm run release` (or a scripted equivalent) runs: lint, typecheck, build, test, version bump, changelog regen, `npm publish`, `git tag`, `git push --tags`, create GitHub release.
- [ ] Any failed step aborts the release and leaves no partial state (e.g. no tag pushed without a publish).
- [ ] The script respects `--dry-run` for safe practice.
- [ ] Runs reliably in CI (e.g. on a `workflow_dispatch`) and reproducibly locally.
- [ ] Documented in `CONTRIBUTING.md` and `RELEASING.md`.
- [ ] Failure mode is actionable: each failed step tells the release manager exactly what to fix.

**Priority:** P0
**Effort:** 7
**Role:** release manager

**US-5.15.2** — As a release manager, I want the version bump to be SemVer-correct based on commit history, so that I don't have to decide major/minor/patch by hand.

**Acceptance criteria:**
- [ ] Conventional Commits (`feat:`, `fix:`, `BREAKING CHANGE:`) or Changesets drives the bump decision.
- [ ] A `feat:` commit bumps minor; `fix:` bumps patch; `BREAKING CHANGE:` footer or `!` syntax bumps major.
- [ ] The chosen tool is pinned in `devDependencies` and its config committed.
- [ ] A mis-typed commit message does not silently corrupt the bump — a lint rule catches it.

**Priority:** P0
**Effort:** 3
**Role:** release manager

**US-5.15.3** — As a consumer, I want `CHANGELOG.md` to list every user-visible change per version with dates and links, so that I can audit what shipped.

**Acceptance criteria:**
- [ ] `CHANGELOG.md` is regenerated by the release command, not hand-edited.
- [ ] Each version entry has: version, date, grouped changes (Features, Fixes, Breaking), and links to PRs/commits.
- [ ] The format matches Keep A Changelog conventions.
- [ ] The GitHub release body pulls the same content for that version.

**Priority:** P0
**Effort:** 3
**Role:** consumer

**US-5.15.4** — As a release manager, I want to optionally trigger a release by applying a `release` label to a PR, so that I can cut a version without a terminal.

**Acceptance criteria:**
- [ ] A workflow on `pull_request` with label `release` (or similar) runs the release flow on merge.
- [ ] The workflow uses a GitHub token with publish rights stored in secrets.
- [ ] Applying the label on a merged PR re-triggers release only if safe (no duplicate version).
- [ ] The mechanism is documented in `RELEASING.md`.

**Priority:** P1
**Effort:** 3
**Role:** release manager

### Feature 5.16: TypeScript token definitions
Ship a `tokens.d.ts` (and compiled `tokens.js`/`tokens.mjs`) that exposes every token from `$theme-light`, `$space`, `$font-sizes`, `$font-weights`, `$line-heights`, `$shadow`, `$z-layers`, `$radius`, and `$theme-components` as typed TypeScript constants. TypeScript consumers import them for type-safe token access in component code (e.g. inline styles, CSS-in-JS, or data props). Generated from the SCSS source of truth at build time; not hand-maintained.

#### User Stories

**US-5.16.1** — As a consumer, I want to `import { space, fontSizes, colors } from '@jerry2d3d/css-is-awesome/tokens'` in my TypeScript code, so that I get autocomplete and compile-time errors for token names.

**Acceptance criteria:**
- [ ] A `tokens` entry point is declared in `package.json` `exports`.
- [ ] The module exports typed constants for every scale and the light theme colors at minimum.
- [ ] A TypeScript consumer in a sample project (the Next.js starter) uses the import and typechecks cleanly.
- [ ] Documented in a docs-site page and linked from the README.

**Priority:** P1
**Effort:** 3
**Role:** consumer

**US-5.16.2** — As a system author, I want the TypeScript token file generated from the SCSS source, so that it cannot drift.

**Acceptance criteria:**
- [ ] A script (`scripts/build-tokens.js` or similar) parses the SCSS token maps and emits `tokens.d.ts` + `tokens.mjs`.
- [ ] The script runs as part of `npm run build` and the release flow.
- [ ] Running the script with no source changes produces zero diff (idempotent).
- [ ] A CI check fails if the generated file is out of date in a PR.
- [ ] Failure mode is actionable: names the drifted token.

**Priority:** P1
**Effort:** 3
**Role:** system author

**US-5.16.3** — As a consumer, I want token types to include literal values, so that my editor shows the actual `0.5rem` or `#0066ff` on hover.

**Acceptance criteria:**
- [ ] Exported constants are typed as literal values (e.g. `export const space2: "0.5rem"`), not `string`.
- [ ] Hovering the import in VS Code shows the literal value in the tooltip.
- [ ] A consumer can use a token as a template-literal type (e.g. in a Tailwind config) without `as const` gymnastics.

**Priority:** P2
**Effort:** 1
**Role:** consumer

### Feature 5.17: Storybook installation
Install Storybook v10+ with the Next.js framework, running via `npm run storybook` on port 6006. Configure the dark-mode addon, a11y addon, and docs addon. Mirror the setup already proven in the `boiler-project-ai` boilerplate so future upgrades stay in sync. Storybook reads global styles and the current theme CSS so stories render in the real visual context.

#### User Stories

**US-5.17.1** — As a contributor, I want `npm run storybook` to boot Storybook v10+ with the Next.js framework, so that I can build components in isolation.

**Acceptance criteria:**
- [ ] `.storybook/main.ts` declares `framework: '@storybook/nextjs'` with v10+ packages in `devDependencies`.
- [ ] `npm run storybook` starts on `http://localhost:6006` without errors.
- [ ] Global styles (`globals.css`, active theme CSS) load into every story.
- [ ] A `preview.tsx` configures parameters (layout, viewports) consistent with the docs site.
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P0
**Effort:** 3
**Role:** contributor

**US-5.17.2** — As a Storybook author, I want dark-mode, a11y, and docs addons installed and configured, so that every story surfaces accessibility issues and lets me flip themes.

**Acceptance criteria:**
- [ ] `@storybook/addon-a11y`, a dark-mode addon, and `@storybook/addon-docs` are installed at compatible versions.
- [ ] Each addon is registered in `.storybook/main.ts` and works in the running UI.
- [ ] The dark-mode addon toggles `data-theme="dark"` so library dark tokens apply.
- [ ] The a11y addon runs axe-core against every story and surfaces violations in the side panel.

**Priority:** P0
**Effort:** 3
**Role:** Storybook author

**US-5.17.3** — As a contributor, I want `npm run build-storybook` to produce a static Storybook, so that it can be published alongside the docs site.

**Acceptance criteria:**
- [ ] `npm run build-storybook` emits `storybook-static/` with no errors.
- [ ] The static build opens correctly when served locally (`npx http-server storybook-static`).
- [ ] A CI step builds Storybook on every PR to catch regressions.
- [ ] Optionally deployed under `/storybook` on the docs site host (documented, not required for P0).

**Priority:** P1
**Effort:** 1
**Role:** contributor

### Feature 5.18: Storybook stories per component
Every React component in `src/components/` has a co-located `.stories.tsx` file. Each stories file covers the default rendering, every variant (size, color, shape), every state (hover, focus, disabled, loading, error), and at least one edge case (empty, very long content, RTL if relevant). Stories use the Component Story Format (CSF 3).

#### User Stories

**US-5.18.1** — As a Storybook author, I want a naming and location convention for stories, so that I don't have to guess where to put them.

**Acceptance criteria:**
- [ ] Convention: `Button.tsx` next to `Button.stories.tsx` in the same directory.
- [ ] A template / `plop` generator / documented pattern exists to scaffold a new stories file.
- [ ] `.storybook/main.ts` `stories` glob picks up both `src/components/**/*.stories.tsx` and any future additions.
- [ ] Documented in `CONTRIBUTING.md` under "Adding a component".

**Priority:** P1
**Effort:** 1
**Role:** Storybook author

**US-5.18.2** — As a contributor, I want every existing React component to have a stories file covering default + variants + states, so that Storybook is a complete component catalog.

**Acceptance criteria:**
- [ ] Every file in `src/components/` that exports a React component has a matching `.stories.tsx`.
- [ ] Each stories file includes: a default story, one story per variant, one story per state (hover, focus, disabled, loading, error where applicable), and at least one edge-case story.
- [ ] Stories use CSF 3 (`export default { ... } satisfies Meta<...>` and named exports).
- [ ] A CI check fails if a new component PR lands without a stories file.

**Priority:** P1
**Effort:** 7
**Role:** contributor

**US-5.18.3** — As a Storybook author, I want `argTypes` wired so the Controls panel exposes every prop with sensible ranges, so that designers can play with a component without editing code.

**Acceptance criteria:**
- [ ] Every stories file defines `argTypes` for props with appropriate `control` types (select, boolean, text, range).
- [ ] Defaults in the Controls panel match the component's actual default props.
- [ ] Changing a control updates the rendered story in real time.

**Priority:** P2
**Effort:** 3
**Role:** Storybook author

### Feature 5.19: Pre-commit hooks
Install Husky or simple-git-hooks. On every `git commit`, run lint and typecheck against changed files (via `lint-staged`). Block the commit on failure. The hook is installed automatically after `npm install` so no contributor has to remember to enable it.

#### User Stories

**US-5.19.1** — As a contributor, I want `git commit` to auto-lint and auto-typecheck my staged changes, so that obvious problems never leave my laptop.

**Acceptance criteria:**
- [ ] Husky or simple-git-hooks is installed and wired to `npm install` via `prepare` script.
- [ ] `lint-staged` runs ESLint and Stylelint on staged `.ts/.tsx/.js/.scss/.css` files.
- [ ] Typecheck runs on the whole project (fast in incremental mode) on commit.
- [ ] A commit with a lint error is rejected with an actionable message.
- [ ] Runs reliably and reproducibly; same checks as CI.
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P0
**Effort:** 3
**Role:** contributor

**US-5.19.2** — As a contributor, I want to bypass hooks on an emergency basis, so that I'm never fully locked out of committing.

**Acceptance criteria:**
- [ ] `git commit --no-verify` works and is documented as an emergency escape hatch only.
- [ ] CI still catches anything a bypass commit introduces, so nothing broken reaches `main`.
- [ ] The README/CONTRIBUTING notes that bypassing locally still fails CI.

**Priority:** P1
**Effort:** 1
**Role:** contributor

**US-5.19.3** — As a contributor, I want commit messages to be validated against Conventional Commits, so that the release changelog (Feature 5.15) stays clean.

**Acceptance criteria:**
- [ ] A `commit-msg` hook runs `commitlint` (or equivalent) against the message.
- [ ] Malformed messages are rejected with a link to the convention.
- [ ] The rule set is committed (`.commitlintrc` or `commitlint.config.js`).
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P1
**Effort:** 1
**Role:** contributor

### Feature 5.20: `dev:watch` combined script
One npm script — `npm run dev:watch` — that concurrently starts `next dev` and the SCSS library watch build, so an edit to `scss/*` rebuilds the library CSS and Next.js hot-reloads the resulting change into the running docs site. Uses `concurrently` or `npm-run-all -p` to run both in one terminal with colored prefixed output.

#### User Stories

**US-5.20.1** — As a contributor, I want `npm run dev:watch` to run Next.js dev and SCSS watch in one terminal, so that editing the library immediately reflects in the site.

**Acceptance criteria:**
- [ ] `npm run dev:watch` runs `next dev` and `npm run build:css:all -- --watch` (or equivalent) in parallel.
- [ ] Editing a file under `scss/` triggers a rebuild and Next.js HMR picks up the new CSS within 2 seconds.
- [ ] Output is colored per-process (e.g. `[next]`, `[scss]`).
- [ ] Ctrl-C cleanly stops both processes.
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P0
**Effort:** 1
**Role:** contributor

**US-5.20.2** — As a contributor, I want a clear error when either sub-process fails, so that I don't spend 10 minutes wondering why nothing's reloading.

**Acceptance criteria:**
- [ ] A crashed sub-process surfaces its stderr with its prefix.
- [ ] The wrapper does not exit silently on a sub-process crash — it either restarts or prints an actionable message.
- [ ] Documented failure modes (port in use, SCSS syntax error) are listed in `CONTRIBUTING.md`.

**Priority:** P1
**Effort:** 1
**Role:** contributor

### Feature 5.21: Starter templates
Four starter templates that let a consumer go from zero to "css-is-awesome running in my project" in under 60 seconds: (1) minimal-HTML (single `index.html` with CDN `<link>` and SRI), (2) Vite starter, (3) Next.js starter, (4) Astro starter. Each is either a GitHub template repo or a folder under `starters/` that users can scaffold with `degit`. Each includes a README with run instructions.

#### User Stories

**US-5.21.1** — As a consumer, I want a minimal-HTML starter I can download and open in a browser, so that I can evaluate the library in the simplest possible context.

**Acceptance criteria:**
- [ ] `starters/minimal-html/` (or a template repo) exists with a single `index.html`.
- [ ] The `<link>` to the library uses a CDN URL with a valid SRI hash.
- [ ] Opening the file in a browser shows styled components without a build step.
- [ ] A `README.md` in the starter explains what it demonstrates.
- [ ] Documented in the main repo `README.md` under "Starters".

**Priority:** P1
**Effort:** 1
**Role:** consumer

**US-5.21.2** — As a consumer, I want a Vite starter, a Next.js starter, and an Astro starter, so that I can pick the one matching my stack.

**Acceptance criteria:**
- [ ] Three starters exist under `starters/` (or as template repos linked from the README).
- [ ] Each scaffolds with `degit` (or "Use this template") and runs with its standard `npm run dev` in under 60 seconds.
- [ ] Each imports the library via SCSS and renders at least one themed example page.
- [ ] Each has a README with prerequisites, run command, and a pointer to the docs site.

**Priority:** P1
**Effort:** 7
**Role:** consumer

**US-5.21.3** — As a maintainer, I want starters to stay in sync with the library version, so that a consumer doesn't scaffold a broken starter.

**Acceptance criteria:**
- [ ] Each starter pins `@jerry2d3d/css-is-awesome` at a specific version or `latest`.
- [ ] A CI job on the main repo runs `npm install` + `npm run build` inside each starter on every PR that touches `package.json` or the starters.
- [ ] Broken starter = failing CI.
- [ ] A documented procedure for updating starters at release time lives in `RELEASING.md`.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

### Feature 5.22: Zero-JS interactive component primitives
A set of pure-CSS interactive primitives — tabs, accordion, modal, popover, tooltip — implemented with `:has()`, the native popover API (`[popover]`), and `@container` queries, with no JavaScript required for open/close/active behavior. Consumers get working interactive components before any JS bundle downloads. Where a feature is not yet universal (e.g. older Safari), a documented progressive-enhancement fallback is provided. This is the single biggest 2026 differentiator vs shadcn/ui (which requires React + Radix), Bootstrap (which requires its JS bundle), and daisyUI (which depends on host-framework JS for non-trivial widgets). Browser-compatibility testing is a first-class deliverable, not an afterthought.

#### User Stories

**US-5.22.1** — As a system author, I want a documented design pattern and shared SCSS partial for zero-JS interactive primitives, so that every primitive uses the same checked-input / `:has()` / `[popover]` conventions instead of five different bespoke approaches.

**Acceptance criteria:**
- [ ] `scss/components/_interactive-primitives.scss` (or similar) defines shared mixins: `cia-disclosure()`, `cia-popover()`, `cia-tabset()`, `cia-tooltip()`.
- [ ] A design-pattern document under `roadmap/decisions/` records the chosen toggle mechanism (label-for-checkbox vs `[popover]` vs `:target` vs `details`) per primitive and the rationale.
- [ ] Every primitive's markup pattern is a single block of HTML in a docs-site demo (no React state, no event handlers) that works when JS is disabled.
- [ ] The pattern document covers the focus-management contract per primitive and references WAI-ARIA Authoring Practices.
- [ ] No Stimulus, Alpine, or Vue-style directive sneaks into the SCSS — strict zero-JS rule enforced by a lint check on the source files.

**Priority:** P2
**Effort:** 5
**Role:** system author

**US-5.22.2** — As a consumer, I want tabs, accordion, modal, popover, and tooltip components I can drop into plain HTML, so that I get working interactivity before my JS bundle downloads (or with no JS at all).

**Acceptance criteria:**
- [ ] Each of the five primitives ships as a documented HTML pattern + SCSS mixin: tabs, accordion, modal (via `[popover]`), popover, tooltip.
- [ ] Each primitive works with JavaScript disabled in the browser (verified via a Playwright test with JS off).
- [ ] Each primitive has a docs-site demo page showing the bare HTML, the styled output, and the JS-off state side by side.
- [ ] Each primitive carries a jest-axe assertion (Feature 5.2) and a keyboard checklist entry (Feature 5.9).
- [ ] Each primitive includes documented progressive-enhancement guidance for the consumer to layer on JS for advanced behavior (e.g. animation, async content) without breaking the JS-off baseline.
- [ ] Bundle impact on `dist/css-is-awesome.core.min.css` from the full primitive set is measured and stays under the budget (US-5.7.6).

**Priority:** P2
**Effort:** 13
**Role:** consumer

**US-5.22.3** — As a CI system, I want a browser-matrix compatibility test that verifies each primitive on Chromium, Firefox, and WebKit (and headless mobile WebKit), so that "works without JS" doesn't silently regress on a browser that lacks `:has()` or `[popover]`.

**Acceptance criteria:**
- [ ] A Playwright matrix runs each primitive's demo page on Chromium, Firefox, and WebKit with `javaScriptEnabled: false`.
- [ ] Open/close/active interactions are exercised via real keyboard and pointer events, asserting the visible state changes.
- [ ] A documented fallback is verified for any primitive that does not work in a tier-2 browser; CI fails if a primitive silently no-ops on a supported browser without a fallback.
- [ ] The matrix results table is uploaded as a PR artifact and surfaces per-primitive per-browser pass/fail.
- [ ] Browser baseline (`@supports` chains, fallback strategy) is documented in the primitive's docs page.

**Priority:** P2
**Effort:** 7
**Role:** CI system

**US-5.22.4** — As an accessibility reviewer, I want each zero-JS primitive to satisfy the same a11y bar as a fully scripted component, so that "no JS" never becomes "no accessibility".

**Acceptance criteria:**
- [ ] Each primitive's demo passes axe-core at AA in every in-repo theme (extends Feature 5.2).
- [ ] Focus-trap / focus-restore behavior for modal and popover is verified via a Playwright keyboard test.
- [ ] Screen-reader announcements for each primitive are documented in `tests/manual/screen-reader-checklist.md` (Feature 5.9) and tested at least once before release.
- [ ] Reduced-motion preferences are honored (no transitions for users with `prefers-reduced-motion: reduce`).
- [ ] Forced-colors mode (Windows High Contrast) is tested and documented per primitive.

**Priority:** P2
**Effort:** 5
**Role:** accessibility reviewer

### Feature 5.23: Intrinsic layout mixins
A set of container-query-driven layout mixins — `@include stack()`, `@include cluster()`, `@include switcher()`, `@include sidebar()`, `@include cover()`, `@include grid-auto()` — inspired by Every Layout. They replace media-query-based responsive layout for the majority of cases by reacting to the parent container's size rather than the viewport. Consumers compose layouts without breakpoints, and the same component renders correctly in a sidebar, a card, or a full-width region without per-context overrides.

#### User Stories

**US-5.23.1** — As a system author, I want every intrinsic-layout mixin defined in one SCSS partial with a shared API surface, so that the mixins compose predictably and don't grow into snowflakes.

**Acceptance criteria:**
- [ ] `scss/mixins/_intrinsic-layout.scss` (or similar) defines: `stack($space)`, `cluster($space, $align)`, `switcher($threshold, $space, $limit)`, `sidebar($side, $side-width, $content-min, $space)`, `cover($min-height, $space)`, `grid-auto($min, $space)`.
- [ ] Every mixin uses `@container` queries (not `@media`) where size-responsive behavior is required.
- [ ] Every mixin's parameters default to existing system tokens (`$space-3`, etc.) so a zero-arg call produces a sensible result.
- [ ] A design-pattern document under `roadmap/decisions/` records the parameter naming convention and rationale (named after Every Layout, mapped to cia tokens).
- [ ] Output CSS is idempotent: calling the same mixin twice on the same selector emits no duplicate declarations.

**Priority:** P2
**Effort:** 3
**Role:** system author

**US-5.23.2** — As a consumer, I want to compose responsive layouts with `@include stack()`, `@include cluster()`, etc., without writing media queries, so that my components adapt to their container instead of the viewport.

**Acceptance criteria:**
- [ ] Each mixin has a docs-site page with: usage example, rendered demo at multiple container sizes (resizable iframe or `<resizable>` widget), parameter table, and "when to use vs when not to".
- [ ] At least one full-page docs example composes three mixins to build a real layout (e.g. a card grid with sidebar + cluster + stack) with no `@media` rules.
- [ ] Each mixin has a Storybook story (Feature 5.18) demonstrating the container-driven behavior.
- [ ] A migration note explains how to replace common Bootstrap row/col patterns with the intrinsic equivalents.

**Priority:** P2
**Effort:** 5
**Role:** consumer

**US-5.23.3** — As a CI system, I want an automated visual-regression run that resizes a container and snapshots the layout, so that intrinsic layout breakage is caught even though it isn't viewport-driven.

**Acceptance criteria:**
- [ ] The visual-regression suite (Feature 5.4) includes a "container-size matrix" page per mixin that resizes the parent container at fixed widths (e.g. 240, 480, 720, 960px) and captures a snapshot at each.
- [ ] Diffs in any container-size snapshot fail the build (per existing visual-regression rules).
- [ ] Each snapshot is named `{mixin}--{containerWidth}` for easy review.
- [ ] Documented in `tests/visual/README.md` alongside the page × theme matrix.

**Priority:** P2
**Effort:** 3
**Role:** CI system

**US-5.23.4** — As a theme author / consumer, I want intrinsic layout mixins to honor the system's spacing scale and respect `prefers-reduced-motion`, so that intrinsic layouts feel consistent with the rest of cia.

**Acceptance criteria:**
- [ ] Every spacing parameter resolves to a token from `$space` by default; passing a raw value emits a deprecation warning at compile time (Sass `@warn`).
- [ ] Layout transitions (e.g. switcher's reflow) are zero-duration under `prefers-reduced-motion: reduce`.
- [ ] A linter or sass-true test asserts that every mixin's compiled output uses `var(--cia-space-*)` references, not inlined values.
- [ ] Documented in the theme-authoring guide (Epic 2) so theme authors know how mixins interact with token overrides.

**Priority:** P2
**Effort:** 3
**Role:** theme author

## Dependencies
- Blocks: 1.0 release (no publish without tests, CI, and release automation; every quality claim is unverified without this epic).
- Blocked by: Epic 3 (React Component Library — components must exist before unit tests and Storybook stories can cover them). Partial work can proceed against any components that land early, but the suite is not complete until Epic 3 closes.

## Priority
P0 (blocker for 1.0) — accessibility tests, color contrast audit, bundle-size regression gate, absolute bundle-byte budgets (US-5.7.6), CI pipeline, docs-site production deploy, npm publish hygiene, release automation, Storybook install, pre-commit hooks, and `dev:watch` are P0. Unit tests, visual regression, Lighthouse baseline, end-to-end smoke, TypeScript token definitions, Storybook stories per component, visual-testing harness, preview deploys, contrast audit consolidated into theme-validator (US-5.5.4–5), and starter templates are P1. Coverage thresholds, full browser matrix automation, screen-reader run logs, bundle analyzer, public size dashboard, zero-JS interactive primitives (Feature 5.22), and intrinsic layout mixins (Feature 5.23) are P2 — the latter two are post-v1.0 differentiators that move cia from at-parity to best-in-class.
