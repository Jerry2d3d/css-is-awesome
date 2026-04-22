# Epic 6: Testing & Quality

## Summary
This epic builds the safety net that lets 1.0 ship with confidence. Today the repo has zero tests — no Jest, no Playwright, no axe-core, no visual regression, no Lighthouse tracking, no bundle-size monitoring. Every change is risky and every claim ("accessible", "themeable", "small") is unverified. This epic stands up unit tests for every React component, accessibility validation at the component and page level, end-to-end smoke tests, visual regression per theme, a per-theme contrast audit, a Lighthouse baseline, a bundle-size regression gate, and a documented manual-test plan for keyboard and screen readers. By the time this epic closes, a contributor can open a PR and know within minutes whether it broke a component, a theme, a11y, performance, or bundle size. The companion repo `boiler-project-ai` already carries the infrastructure shape (Jest, Playwright, @testing-library, jest-axe, pixelmatch) and is the reference implementation to pattern-match against.

## Goals
- 100% of React components in `app/components/` have a co-located `*.test.tsx` file covering render, props, ref forwarding, events, and a11y.
- Zero axe-core violations (AA) on every documented page rendered in every in-repo theme.
- Every in-repo theme passes WCAG AA for text-on-surface and AAA for body paragraph text, verified by a script that runs in CI.
- Lighthouse performance, a11y, best-practices, and SEO scores are tracked per route with a baseline JSON committed to the repo; regressions over a configured delta fail CI.
- Bundle-size regression gate fires on every PR: `dist/*.css` and `.next/static/css/*` are measured against baseline, and the build fails over the configured threshold.
- Playwright end-to-end suite covers load, navigation, theme switching + persistence, and every documented route returning 200 across Chromium, Firefox, and WebKit.
- Visual regression baseline covers every documented page × every in-repo theme, with explicit approval required to regenerate baseline snapshots.
- Unit-test coverage meets a documented Istanbul/c8 threshold, enforced in CI.

## Out of scope
- Actual test fixes, component rewrites, or a11y remediation required to make the tests pass — those happen inline with the work in Epic 3 (React Component Library) and Epic 5 (Site UX).
- CI pipeline wiring itself (GitHub Actions workflows, matrix config, artifact upload) — see Epic 7 (Infrastructure & Release). This epic ships the scripts and configs; Epic 7 wires them up.
- Theme-contract validator script — see Epic 1 (Library Foundations).
- Storybook interaction tests — see Epic 7 (Infrastructure & Release).
- Load testing, security scanning, and fuzz testing — post-1.0.
- MCP/AI prompt evaluation suites — see Epic 8 (AI Integration).

## Features

### Feature 6.1: Unit test harness (Jest + React Testing Library)
Stand up the Jest + React Testing Library + `@testing-library/jest-dom` configuration and a co-location convention. Every React component gets a `ComponentName.test.tsx` file next to it. A shared `test-utils.tsx` wraps render with `ThemeProvider` so components can be tested under any theme.

#### User Stories

**US-6.1.1** — As a contributor, I want a working Jest + React Testing Library setup, so that I can write a component test without configuring tooling.

**Acceptance criteria:**
- [ ] `jest.config.js`, `jest.setup.ts`, and a `test-utils.tsx` exist at the repo root (or under `tests/`).
- [ ] `npm test` runs Jest against every `*.test.tsx` file and exits 0 on a clean tree.
- [ ] `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` are declared dev dependencies.
- [ ] A documented `renderWithTheme(ui, { theme })` helper wraps render with the site's ThemeProvider.
- [ ] The suite completes in under 30 seconds locally on a mid-range dev machine.

**Priority:** P1
**Effort:** M

**US-6.1.2** — As a contributor, I want every React component to have a co-located test file, so that I can't forget to add coverage when I add a component.

**Acceptance criteria:**
- [ ] Every file under `app/components/**/*.tsx` (excluding story/demo files) has a matching `*.test.tsx` sibling.
- [ ] Each test file covers at minimum: renders with default props, accepts and merges `className`, accepts and merges inline `style`, forwards `ref`, fires the primary callback on the primary interaction.
- [ ] A lint rule or CI script flags components missing a test file.
- [ ] The missing-test check runs on every PR and fails the build on regression.

**Priority:** P1
**Effort:** L

**US-6.1.3** — As a reviewer, I want a documented minimum-test checklist, so that I can tell at a glance whether a PR's tests are complete.

**Acceptance criteria:**
- [ ] `tests/README.md` lists the minimum test cases per component archetype (atom, form control, overlay, navigation).
- [ ] The checklist is linked from the PR template.
- [ ] At least three example test files (one atom, one form control, one overlay) live in the repo as reference implementations.
- [ ] Produces an artifact (Jest's JSON output) a reviewer can read.

**Priority:** P2
**Effort:** S

### Feature 6.2: Accessibility tests (jest-axe)
Every component test file runs `jest-axe` against its rendered output and asserts zero violations at AA level. Every documented page route also gets a Playwright-driven axe run. This is a hard gate — not a warning — because "accessible" is a load-bearing claim of the system.

#### User Stories

**US-6.2.1** — As an accessibility reviewer, I want every React component to include a jest-axe assertion, so that a11y regressions are caught at the unit level.

**Acceptance criteria:**
- [ ] `jest-axe` is installed and configured with the site's axe rule set (AA).
- [ ] Every `*.test.tsx` in `app/components/` includes at least one `expect(...).toHaveNoViolations()` assertion against its rendered output.
- [ ] The assertion runs against the component in each of its documented states (e.g. default, disabled, error).
- [ ] Runs on every PR via CI (see Epic 7) and fails the build on any violation.
- [ ] Produces a JSON violation report artifact on failure.
- [ ] Completes in under 20 seconds locally across the full component suite.

**Priority:** P0
**Effort:** L

**US-6.2.2** — As an accessibility reviewer, I want every documented page to pass axe-core at AA in every theme, so that page-level composition issues are caught.

**Acceptance criteria:**
- [ ] A Playwright test enumerates every route in `app/` and runs `@axe-core/playwright` with AA rules against each.
- [ ] The test iterates every in-repo theme (`public/theme.css` + `public/themes/*`) per route.
- [ ] Zero violations allowed; violations fail the build (not just warn).
- [ ] Violation details (rule, selector, snippet) are written to a JSON artifact per run.
- [ ] Runs on every PR via CI.

**Priority:** P0
**Effort:** L

**US-6.2.3** — As a maintainer, I want a short allowlist mechanism for known-accepted axe violations, so that a documented intentional exception doesn't block the build forever.

**Acceptance criteria:**
- [ ] A `tests/a11y-allowlist.json` file maps rule-id + selector to a justification string and an expiry date.
- [ ] Allowlisted violations don't fail the build but log a warning with the justification.
- [ ] Expired allowlist entries fail the build until renewed or removed.
- [ ] The allowlist is referenced from the accessibility statement (Feature 6.11).

**Priority:** P2
**Effort:** S

### Feature 6.3: End-to-end smoke tests (Playwright)
A Playwright suite exercises the built docs site: loads the landing page, navigates the docs sidebar, switches themes via the picker, confirms the choice persists across reloads, and verifies every documented route returns 200. Runs across Chromium, Firefox, and WebKit.

#### User Stories

**US-6.3.1** — As a contributor, I want a Playwright setup that runs against a locally built site, so that I can catch navigation and integration regressions before pushing.

**Acceptance criteria:**
- [ ] `playwright.config.ts` exists with projects for Chromium, Firefox, and WebKit.
- [ ] `npm run test:e2e` boots the Next.js production build and runs the suite against it.
- [ ] A smoke test covers: landing loads, docs sidebar renders, at least two route clicks succeed.
- [ ] Completes in under 90 seconds locally on a single browser.
- [ ] Produces an HTML report reviewers can open.

**Priority:** P1
**Effort:** M

**US-6.3.2** — As a reviewer, I want an end-to-end test that verifies theme switching and persistence, so that the theme picker doesn't silently break.

**Acceptance criteria:**
- [ ] A Playwright spec switches to each in-repo theme via the picker and asserts `data-theme` updates on `<html>` or `<body>`.
- [ ] The spec reloads the page and asserts the chosen theme persists (localStorage is honored).
- [ ] The spec clears the override and asserts the site reverts to system preference.
- [ ] Runs on every PR via CI.
- [ ] Fails the build on regression — not just a warning.

**Priority:** P1
**Effort:** M

**US-6.3.3** — As a release manager, I want every documented route enumerated and pinged in the smoke suite, so that a dead route never reaches a release.

**Acceptance criteria:**
- [ ] A Playwright test derives the route list from the Next.js app directory structure (or a manifest file) so new routes are automatically included.
- [ ] Each route is visited and the HTTP status is asserted to be 200.
- [ ] Routes returning 3xx/4xx/5xx fail the build with the failing URL logged.
- [ ] Produces a route coverage artifact showing which routes were tested.

**Priority:** P1
**Effort:** S

### Feature 6.4: Visual regression tests
Screenshot every documented page in every in-repo theme at a fixed viewport, diff against a committed baseline using `pixelmatch`, fail on any diff over the configured pixel threshold. Baseline regeneration requires an explicit `npm run test:visual -- --update` flag; it never happens automatically.

#### User Stories

**US-6.4.1** — As a reviewer, I want a visual regression suite that screenshots every page in every theme, so that unintended visual changes are caught before merge.

**Acceptance criteria:**
- [ ] A Playwright spec iterates every route × every in-repo theme and captures a PNG screenshot at a fixed viewport (e.g. 1280×800).
- [ ] Each screenshot is diffed against `tests/visual/__baseline__/{route}--{theme}.png` using `pixelmatch`.
- [ ] Diffs over a configured pixel threshold (documented in `tests/visual/README.md`) fail the build.
- [ ] Failing runs produce a side-by-side diff PNG per regression as a CI artifact.
- [ ] Runs on every PR via CI.

**Priority:** P1
**Effort:** L

**US-6.4.2** — As a maintainer, I want baseline snapshots to regenerate only with explicit approval, so that a contributor can't silently normalize a visual regression.

**Acceptance criteria:**
- [ ] Running `npm run test:visual -- --update` is the only way to overwrite baseline PNGs locally.
- [ ] CI never regenerates baselines automatically; the baseline-update flag is gated behind a dedicated workflow dispatch (see Epic 7).
- [ ] Baseline PNGs live under version control (`tests/visual/__baseline__/`) and diff reviewably in PRs.
- [ ] `tests/visual/README.md` documents the update workflow and review expectations.

**Priority:** P1
**Effort:** S

**US-6.4.3** — As a contributor, I want fast local feedback on a single page × theme pair, so that I'm not waiting for the full matrix during iteration.

**Acceptance criteria:**
- [ ] `npm run test:visual -- --route=/docs/buttons --theme=graphite` runs only that pair.
- [ ] The single-pair run completes in under 15 seconds locally.
- [ ] The command is documented in `tests/visual/README.md`.

**Priority:** P2
**Effort:** S

### Feature 6.5: Color contrast audit per theme
A script enumerates every token pair that must meet WCAG contrast (text on surface at AA, body text at AAA) in every in-repo theme and reports fails by theme and pair. Runs in CI on every PR that touches a theme file or a contrast-sensitive component.

#### User Stories

**US-6.5.1** — As an accessibility reviewer, I want an automated contrast audit across every theme, so that no theme ships with a contrast failure.

**Acceptance criteria:**
- [ ] `scripts/contrast-audit.js` enumerates every in-repo theme (`public/theme.css` + `public/themes/*/theme.css`).
- [ ] For each theme, it reads the token contract and computes WCAG contrast ratios for every documented text-on-surface pair.
- [ ] Text-on-surface fails AA → build fails. Body-paragraph text fails AAA → build fails.
- [ ] The script exits 0 on full pass, non-zero on any failure, and prints a table of ratios per pair per theme.
- [ ] Runs in under 3 seconds against all in-repo themes.
- [ ] Produces a JSON artifact with per-pair ratios for the accessibility statement.

**Priority:** P0
**Effort:** M

**US-6.5.2** — As a theme author, I want to run the contrast audit against a single theme locally, so that I can iterate on a new theme without running the full suite.

**Acceptance criteria:**
- [ ] `node scripts/contrast-audit.js public/themes/foo/theme.css` runs against a single file.
- [ ] Output clearly lists every pair, its computed ratio, and its pass/fail status per rule level.
- [ ] Completes in under 1 second on a single theme.
- [ ] Zero npm runtime dependencies (stdlib only) to match the theme-validator convention (Epic 1).

**Priority:** P1
**Effort:** S

**US-6.5.3** — As a CI system, I want the contrast audit integrated into the PR flow, so that a failing theme blocks merge.

**Acceptance criteria:**
- [ ] A CI step runs `contrast-audit.js` against every theme on every PR (see Epic 7 for workflow wiring).
- [ ] The step fails the build on any non-zero exit.
- [ ] The step's log lists each theme and pass/fail summary before the detailed table.
- [ ] Fails the build on regression — not just a warning.

**Priority:** P0
**Effort:** S

### Feature 6.6: Lighthouse baseline
Every route gets a Lighthouse run via `@lhci/cli` (or equivalent). A JSON baseline is committed to the repo. PRs that drop any category score more than the configured delta fail CI.

#### User Stories

**US-6.6.1** — As a release manager, I want Lighthouse scores tracked per route, so that performance and a11y regressions are visible over time.

**Acceptance criteria:**
- [ ] `lighthouserc.json` (or equivalent) enumerates every documented route and the four Lighthouse categories.
- [ ] A committed baseline file (`tests/lighthouse/baseline.json`) records expected scores per route per category.
- [ ] `npm run test:lighthouse` runs against a local production build and diffs results against the baseline.
- [ ] Scores are archived per run as a CI artifact.

**Priority:** P1
**Effort:** M

**US-6.6.2** — As a reviewer, I want Lighthouse regressions to fail CI, so that a slow page or a11y regression doesn't sneak in.

**Acceptance criteria:**
- [ ] A configured delta (documented in `tests/lighthouse/README.md`) defines the maximum allowed drop per category (e.g. performance: -5 points).
- [ ] The CI step fails on any route where any category drops beyond its delta.
- [ ] The failing route and category are named in the CI log.
- [ ] Runs on every PR via CI.
- [ ] Produces an artifact (Lighthouse HTML or JSON report) a reviewer can read.

**Priority:** P1
**Effort:** S

**US-6.6.3** — As a maintainer, I want baseline updates to require explicit approval, so that scores don't quietly drift downward over releases.

**Acceptance criteria:**
- [ ] Baseline JSON is committed; updating it requires a deliberate `npm run test:lighthouse -- --update-baseline` command.
- [ ] CI never updates the baseline automatically.
- [ ] PRs that update the baseline diff the scores in a reviewable way.
- [ ] `tests/lighthouse/README.md` documents when a baseline bump is appropriate (e.g. explicit perf work landed).

**Priority:** P2
**Effort:** S

### Feature 6.7: Bundle-size regression gate
Every PR measures `dist/*.css` (library output) and `.next/static/css/*` (site output) against a committed baseline. Over-budget PRs fail. Under-budget PRs update the baseline (with opt-in) so "wins" stick.

#### User Stories

**US-6.7.1** — As a reviewer, I want bundle sizes reported on every PR, so that I see the size impact of a change before approving.

**Acceptance criteria:**
- [ ] `scripts/bundle-size.js` measures each `dist/*.css` file and each `.next/static/css/*.css` file.
- [ ] A committed baseline (`tests/bundle-size/baseline.json`) records the byte size (and gzipped size) per file.
- [ ] `npm run test:bundle-size` prints a table: file, baseline, current, delta %, verdict.
- [ ] Runs on every PR via CI (see Epic 7).
- [ ] Produces the table as a CI artifact / PR comment for reviewer visibility.

**Priority:** P0
**Effort:** M

**US-6.7.2** — As a CI system, I want configurable warn/fail thresholds, so that the gate's strictness is explicit.

**Acceptance criteria:**
- [ ] The warn threshold (default: +5%) and fail threshold (default: +10%) are declared in `tests/bundle-size/config.json` with inline comments.
- [ ] Exceeding warn logs a warning; exceeding fail fails the build.
- [ ] Thresholds are overridable per file (e.g. a new bundle might accept a larger delta during initial stabilization).
- [ ] Fails the build on regression — not just a warning.

**Priority:** P0
**Effort:** S

**US-6.7.3** — As a maintainer, I want baseline updates to be an explicit action, so that size creep can't hide behind auto-updated baselines.

**Acceptance criteria:**
- [ ] `npm run test:bundle-size -- --update-baseline` is the only way to overwrite `baseline.json`.
- [ ] CI never updates the baseline automatically.
- [ ] Updating the baseline in a PR produces a visible diff a reviewer can evaluate.
- [ ] `tests/bundle-size/README.md` documents when a baseline bump is appropriate.

**Priority:** P1
**Effort:** S

### Feature 6.8: Browser matrix verification
Playwright runs the full suite against Chromium, Firefox, and WebKit. A documented manual-test plan covers iOS Safari and Android Chrome at mobile viewport sizes, since headless WebKit does not perfectly emulate mobile Safari.

#### User Stories

**US-6.8.1** — As a CI system, I want the Playwright suite to run against Chromium, Firefox, and WebKit on every PR, so that cross-browser regressions are caught automatically.

**Acceptance criteria:**
- [ ] `playwright.config.ts` declares projects for all three browsers.
- [ ] The CI workflow (see Epic 7) runs each browser as a matrix job.
- [ ] Per-browser results are surfaced in the PR.
- [ ] Failing on any one browser fails the overall build.
- [ ] Produces per-browser HTML reports as artifacts.

**Priority:** P2
**Effort:** M

**US-6.8.2** — As a release manager, I want a documented mobile manual-test plan, so that iOS and Android coverage isn't skipped just because automation can't fully emulate them.

**Acceptance criteria:**
- [ ] `tests/manual/mobile-checklist.md` lists the routes, viewports, and interactions to test on a physical device.
- [ ] The checklist covers iOS Safari (latest and latest-1) and Android Chrome (latest).
- [ ] The release checklist in Epic 7 references this document as a required step before cutting a release.
- [ ] The document includes a template for recording results.

**Priority:** P2
**Effort:** S

### Feature 6.9: Keyboard navigation audit
A documented manual-test plan that a reviewer or contributor can walk through for any new interactive component. Covers Tab order, Escape to dismiss overlays, Enter to activate, Arrow keys on composite widgets (menus, tabs, sliders, lists), and focus visibility.

#### User Stories

**US-6.9.1** — As an accessibility reviewer, I want a keyboard-navigation checklist per component archetype, so that keyboard support is verified consistently.

**Acceptance criteria:**
- [ ] `tests/manual/keyboard-checklist.md` documents expected keyboard behavior per archetype (button, menu, tabs, slider, list, dialog, form).
- [ ] Each archetype lists the keys that must work and the expected focus/state change.
- [ ] The checklist references WAI-ARIA Authoring Practices for each pattern.
- [ ] The document fits the "completes in under 30 minutes per release" criterion for a full site sweep.

**Priority:** P1
**Effort:** S

**US-6.9.2** — As a contributor, I want the keyboard checklist linked from the PR template, so that I remember to run it against any interactive component I touch.

**Acceptance criteria:**
- [ ] The PR template includes a "Keyboard check" section referencing the checklist.
- [ ] The PR template's checkbox is not auto-checked; contributor must tick it deliberately.
- [ ] A dedicated section in the checklist covers focus-visible styling per theme.
- [ ] Produces a reviewer-readable record in the PR description itself.

**Priority:** P2
**Effort:** S

### Feature 6.10: Screen reader smoke
A documented hand-run checklist for VoiceOver (macOS / iOS), NVDA (Windows), and JAWS (Windows). Not automated — automation of screen reader semantics is unreliable. Required before every release and for any PR that adds or significantly changes an interactive component.

#### User Stories

**US-6.10.1** — As an accessibility reviewer, I want a documented screen reader checklist per archetype, so that AT coverage is verified before release.

**Acceptance criteria:**
- [ ] `tests/manual/screen-reader-checklist.md` covers VoiceOver, NVDA, and JAWS.
- [ ] For each archetype (button, menu, tabs, dialog, form, table, alert), the expected announcement and navigation order is documented.
- [ ] The checklist notes known-acceptable differences between AT (e.g. verbose vs terse announcement).
- [ ] The document is linked from the release checklist in Epic 7.

**Priority:** P1
**Effort:** M

**US-6.10.2** — As a release manager, I want screen-reader smoke results recorded per release, so that we have an auditable trail of AT verification.

**Acceptance criteria:**
- [ ] A template for recording results (AT, version, OS, date, tester, pass/fail per archetype) lives next to the checklist.
- [ ] Completed run logs are stored under `tests/manual/runs/{YYYY-MM-DD}-{release}.md`.
- [ ] The release checklist in Epic 7 references a completed run as a release gate.
- [ ] Produces an artifact (the run log) a reviewer can read.

**Priority:** P2
**Effort:** S

### Feature 6.11: Accessibility statement
A public a11y conformance statement at `/accessibility` on the docs site (with a source `a11y.md` at the repo root). States the conformance target (WCAG 2.1 AA, with AAA for body text), lists known gaps, links to the contrast audit results, and provides a contact path for reporting issues.

#### User Stories

**US-6.11.1** — As a consumer, I want a clear accessibility statement, so that I can evaluate whether css-is-awesome meets my own compliance requirements.

**Acceptance criteria:**
- [ ] `a11y.md` exists at the repo root.
- [ ] A `/accessibility` page on the docs site renders the same content (or links to the markdown source).
- [ ] The statement declares the target conformance level and the date of last audit.
- [ ] Known gaps, with workarounds where available, are listed.
- [ ] A contact method for reporting issues is included.

**Priority:** P1
**Effort:** S

**US-6.11.2** — As a maintainer, I want the accessibility statement linked to automated-audit outputs, so that claims stay honest over time.

**Acceptance criteria:**
- [ ] The statement links to the contrast-audit JSON artifact location (Feature 6.5) and the axe artifact location (Feature 6.2).
- [ ] A section notes that contrast and axe checks run on every PR via CI.
- [ ] A section lists allowlisted axe violations and their justifications (Feature 6.2.3).
- [ ] The statement is updated as part of the release checklist in Epic 7.

**Priority:** P2
**Effort:** S

### Feature 6.12: Coverage reporting
Istanbul/c8 coverage runs as part of `npm test`. A baseline threshold is configured in `jest.config.js`. PRs that drop below threshold fail CI. Coverage reports are archived as CI artifacts.

#### User Stories

**US-6.12.1** — As a reviewer, I want unit-test coverage reported on every PR, so that I can see whether new code is tested.

**Acceptance criteria:**
- [ ] `jest.config.js` enables coverage collection across `app/components/**/*.{ts,tsx}`.
- [ ] Coverage reports (lcov + html) are produced on every `npm test -- --coverage` run.
- [ ] The HTML report is uploaded as a CI artifact a reviewer can download.
- [ ] The report surfaces line, branch, function, and statement coverage per file.

**Priority:** P2
**Effort:** S

**US-6.12.2** — As a CI system, I want a configured coverage threshold that fails the build, so that untested code can't pile up silently.

**Acceptance criteria:**
- [ ] `jest.config.js` declares per-metric thresholds (documented defaults in `tests/README.md`).
- [ ] Falling below any threshold fails `npm test`.
- [ ] The thresholds are justified inline (a comment explaining why the chosen numbers).
- [ ] Fails the build on regression — not just a warning.

**Priority:** P2
**Effort:** S

**US-6.12.3** — As a maintainer, I want threshold bumps to be deliberate, so that coverage trends upward over time.

**Acceptance criteria:**
- [ ] Raising a threshold requires a PR that explicitly edits `jest.config.js`.
- [ ] `tests/README.md` documents the project's coverage philosophy (what to measure, what to exclude).
- [ ] Exclusions (e.g. generated files, type-only files) are listed and justified inline.

**Priority:** P2
**Effort:** S

## Dependencies
- Blocks: 1.0 release (without this epic, no regression is caught before merge and every quality claim is unverified).
- Blocked by: Epic 3 (React Component Library — components must exist before unit tests can cover them), Epic 7 (Infrastructure & Release — CI is what actually runs the tests on every PR). Partial work can proceed against any components that land early, but the suite is not complete until Epic 3 closes.

## Priority
P0 (blocker for 1.0) — accessibility tests, color contrast audit, and bundle-size regression gate are P0. Unit tests, visual regression, Lighthouse baseline, and end-to-end smoke are P1. Coverage thresholds, full browser matrix automation, and screen-reader run logs are P2.
