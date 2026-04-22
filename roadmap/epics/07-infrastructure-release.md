# Epic 7: Infrastructure & Release

## Summary
This epic turns the repo into a self-running pipeline: code goes from a commit to users via automated, repeatable, auditable steps with no human copy-paste in the middle. Every PR is linted, typechecked, built, and tested in GitHub Actions; every merge to main deploys a preview and the production docs site; every release version-bumps, regenerates the changelog, publishes to npm, and cuts a GitHub release from one command. Contributors build components in isolation via Storybook with dark-mode and a11y addons, iterate on library + site together with a single `dev:watch` script, and rely on pre-commit hooks to catch obvious problems before they leave a laptop. Consumers who want to copy the system into a new project pick a starter template (minimal HTML, Vite, Next.js, or Astro) and `degit` it. CDN links carry SRI hashes, the npm package declares proper `exports`/`files`/`sideEffects`, and TypeScript consumers get typed token constants out of the box. After this epic, the only manual step in the release path is clicking "Merge".

## Goals
- Every PR runs lint, typecheck, build (both `npm run build` and `npm run build:css:all`), and the Epic 6 test suite in under 5 minutes, with coverage reported as a PR comment.
- Every merge to `main` deploys the docs site to production within 10 minutes, and every PR gets a unique preview URL posted as a PR comment.
- `npm run release` is one command that bumps version (SemVer), regenerates `CHANGELOG.md`, builds `dist/`, publishes to npm, tags the commit, and creates a GitHub release — no human file-editing in between.
- Every React component in `src/components/` has a matching `.stories.tsx` covering default, all variants, all states, and edge cases, viewable in a running Storybook.
- `npm run dev:watch` starts the Next.js docs site and SCSS library watch mode in one terminal, with library SCSS edits hot-reloading into the site.
- Every CDN link in the README and docs site carries a valid SRI hash, regenerated automatically on release.
- Starter templates (minimal-HTML, Vite, Next.js, Astro) exist and can be scaffolded with `degit` or GitHub's "Use this template" in under 60 seconds.

## Out of scope
- Writing the tests themselves — see Epic 6 (Testing & Quality). This epic only runs them in CI.
- Writing the docs content — see Epic 4 (Documentation Content). This epic only builds and deploys the site.
- The theme validator script and its CI wiring — see Epic 1 (Library Foundations), Feature 1.6. This epic may invoke it from a workflow but doesn't define it.
- Visual-regression baselines for themes beyond component stories — see Epic 6.
- Community contribution policy, issue/PR templates, and CoC — see Epic 9 (Community & Project Meta).
- JSON token export for AI tooling — see Epic 8 (AI Integration). TypeScript token constants live in this epic; AI-consumable JSON does not.

## Features

### Feature 7.1: GitHub Actions CI pipeline
A single `.github/workflows/ci.yml` workflow that runs on every PR and every push to `main`. It installs dependencies once, then runs lint (ESLint + Stylelint), typecheck (`tsc --noEmit`), both builds (`npm run build` and `npm run build:css:all`), and the full Jest + Playwright test suite from Epic 6. Coverage is uploaded as an artifact and posted as a PR comment. The workflow uses the Node version from `.nvmrc` and caches `node_modules` for speed.

#### User Stories

**US-7.1.1** — As a contributor, I want every PR to be automatically linted, typechecked, built, and tested, so that I get feedback before a maintainer reviews the change.

**Acceptance criteria:**
- [ ] `.github/workflows/ci.yml` runs on `pull_request` and `push` to `main`.
- [ ] Steps include: checkout, setup-node (from `.nvmrc`), `npm ci`, lint, typecheck, build, test.
- [ ] A failing step fails the workflow and blocks merge (enforced via branch protection).
- [ ] Runs reliably in CI and reproducibly locally via the same npm scripts.
- [ ] Documented in `README.md` and `CONTRIBUTING.md`.
- [ ] Failure mode is actionable: each failed step points to the exact file/rule.

**Priority:** P0
**Effort:** M

**US-7.1.2** — As a contributor, I want CI to finish in under 5 minutes, so that I don't context-switch waiting for it.

**Acceptance criteria:**
- [ ] A green run on `main` completes in under 5 minutes on a fresh cache.
- [ ] `node_modules` is cached via `actions/setup-node` cache or `actions/cache` keyed on `package-lock.json`.
- [ ] Jest and Playwright tests run with appropriate parallelism for the runner.
- [ ] Wall-clock times for each job are visible in the workflow summary.

**Priority:** P0
**Effort:** M

**US-7.1.3** — As a contributor, I want test coverage posted as a PR comment, so that I can see whether my change moved the number.

**Acceptance criteria:**
- [ ] After the test step, a workflow job posts a coverage summary comment on the PR.
- [ ] The comment shows lines/branches/functions/statements percentages and a delta vs. `main`.
- [ ] The comment is updated (not duplicated) on every push to the PR branch.
- [ ] Coverage artifact (`lcov.info`) is uploaded for download.

**Priority:** P1
**Effort:** S

**US-7.1.4** — As a CI system, I want secrets (npm token, deploy key) stored in GitHub Actions secrets, so that no credentials land in the repo.

**Acceptance criteria:**
- [ ] No `.env*` file with real values is committed; only `.env.example`.
- [ ] All sensitive values are referenced as `${{ secrets.NAME }}` in workflows.
- [ ] Required secret names are documented in `CONTRIBUTING.md`.
- [ ] A workflow that requires a missing secret fails with a clear message naming the missing secret.

**Priority:** P0
**Effort:** S

### Feature 7.2: Docs-site deploy with preview URLs
The docs site (Next.js app at repo root) auto-deploys to Jerry's chosen host on every merge to `main`. Every PR gets a unique preview deployment with its URL posted as a PR comment. The host choice (Vercel, Netlify, Cloudflare Pages, GitHub Pages with a static export) is documented in `DEPLOY.md` and encoded in one workflow file.

#### User Stories

**US-7.2.1** — As a maintainer, I want the docs site to auto-deploy to production on every merge to `main`, so that the public site is never stale.

**Acceptance criteria:**
- [ ] A workflow or host-native integration deploys `main` to production within 10 minutes of merge.
- [ ] The production URL is documented in `README.md`.
- [ ] A failed deploy surfaces an error in the workflow log and does not silently leave the site broken.
- [ ] Rollback procedure is documented in `DEPLOY.md`.

**Priority:** P0
**Effort:** M

**US-7.2.2** — As a contributor, I want every PR to get a preview deploy URL, so that reviewers can click through visual changes before merge.

**Acceptance criteria:**
- [ ] Opening a PR triggers a preview deploy that finishes within 10 minutes.
- [ ] The preview URL is posted as a sticky PR comment (edited on subsequent pushes, not duplicated).
- [ ] Each preview is unique per PR (not overwritten by sibling PRs).
- [ ] Preview is torn down or garbage-collected on PR close.

**Priority:** P1
**Effort:** M

**US-7.2.3** — As a host provider, I want the deploy workflow to use host-native conventions, so that I'm not fighting the platform.

**Acceptance criteria:**
- [ ] If the host supports native Git integration (e.g. Vercel, Netlify), that path is used and documented.
- [ ] If a GitHub Actions workflow is required (e.g. GH Pages), it uses the official first-party action.
- [ ] Secrets required by the host (API token, site ID) are in GitHub Actions secrets, not committed.
- [ ] `DEPLOY.md` lists the host, the auth mechanism, and how to change hosts.

**Priority:** P1
**Effort:** S

### Feature 7.3: npm publish hygiene
Before shipping 1.0, `package.json` must declare `exports`, a minimal `files` allowlist, `sideEffects`, `module`/`main`, and `types` if applicable. Every CDN link in the README and docs site must include an SRI hash. Dry-run `npm publish` must produce a tarball with only the intended contents.

#### User Stories

**US-7.3.1** — As a consumer, I want the npm package to declare `exports`, `files`, `sideEffects`, `module`/`main`, so that my bundler tree-shakes correctly and installs nothing extra.

**Acceptance criteria:**
- [ ] `package.json` has an `exports` map covering every public entry point (SCSS, compiled CSS, any JS/TS).
- [ ] `files` is an explicit allowlist (at minimum: `scss/`, `dist/`, `figma-tokens/`, `README.md`, `LICENSE`).
- [ ] `sideEffects` is declared accurately (CSS imports marked, pure JS marked `false`).
- [ ] `module`, `main`, and (if typed) `types` point to real files that exist in the published tarball.
- [ ] Documented in `CONTRIBUTING.md` under a "Release Hygiene" section.

**Priority:** P0
**Effort:** M

**US-7.3.2** — As a release manager, I want `npm publish --dry-run` to show a tarball with only the intended files, so that I never accidentally publish `node_modules` or source artifacts.

**Acceptance criteria:**
- [ ] `npm publish --dry-run` output is captured and inspected in CI as part of the release flow.
- [ ] Tarball size is under a documented threshold (e.g. 500KB for the library itself).
- [ ] `.npmignore` is either absent (relying on `files`) or consistent with `files`, not conflicting.
- [ ] No `src/`, `test/`, `node_modules/`, or tooling config leaks into the tarball.
- [ ] Failure mode is actionable: if the tarball contains an unexpected file, CI names it.

**Priority:** P0
**Effort:** S

**US-7.3.3** — As a consumer, I want every CDN link in the README and docs site to carry an SRI hash, so that I can verify the file I'm loading hasn't been tampered with.

**Acceptance criteria:**
- [ ] Every `<link>` or `<script>` pointing at a CDN URL in `README.md` and the docs site includes an `integrity="sha384-..."` and `crossorigin="anonymous"` attribute.
- [ ] SRI hashes are regenerated as part of the release flow (Feature 7.4) and committed with the release.
- [ ] A script (`scripts/sri.js` or similar) computes and updates hashes in one pass.
- [ ] Running the site with a tampered file fails to load (manually verified once and noted in `DEPLOY.md`).

**Priority:** P0
**Effort:** M

### Feature 7.4: Release automation
A single command — `npm run release` — bumps the package version (SemVer), regenerates `CHANGELOG.md` from Conventional Commits or Changesets, builds `dist/`, publishes to npm, creates a git tag, pushes the tag, and creates a GitHub release whose body is the changelog excerpt for that version. Alternatively, triggered by applying a `release` label on a PR. No manual `npm version`, no manual file edits, no manual `git tag`.

#### User Stories

**US-7.4.1** — As a release manager, I want `npm run release` to perform every step of a release in order, so that I cannot forget one.

**Acceptance criteria:**
- [ ] `npm run release` (or a scripted equivalent) runs: lint, typecheck, build, test, version bump, changelog regen, `npm publish`, `git tag`, `git push --tags`, create GitHub release.
- [ ] Any failed step aborts the release and leaves no partial state (e.g. no tag pushed without a publish).
- [ ] The script respects `--dry-run` for safe practice.
- [ ] Runs reliably in CI (e.g. on a `workflow_dispatch`) and reproducibly locally.
- [ ] Documented in `CONTRIBUTING.md` and `RELEASING.md`.
- [ ] Failure mode is actionable: each failed step tells the release manager exactly what to fix.

**Priority:** P0
**Effort:** L

**US-7.4.2** — As a release manager, I want the version bump to be SemVer-correct based on commit history, so that I don't have to decide major/minor/patch by hand.

**Acceptance criteria:**
- [ ] Conventional Commits (`feat:`, `fix:`, `BREAKING CHANGE:`) or Changesets drives the bump decision.
- [ ] A `feat:` commit bumps minor; `fix:` bumps patch; `BREAKING CHANGE:` footer or `!` syntax bumps major.
- [ ] The chosen tool is pinned in `devDependencies` and its config committed.
- [ ] A mis-typed commit message does not silently corrupt the bump — a lint rule catches it.

**Priority:** P0
**Effort:** M

**US-7.4.3** — As a consumer, I want `CHANGELOG.md` to list every user-visible change per version with dates and links, so that I can audit what shipped.

**Acceptance criteria:**
- [ ] `CHANGELOG.md` is regenerated by the release command, not hand-edited.
- [ ] Each version entry has: version, date, grouped changes (Features, Fixes, Breaking), and links to PRs/commits.
- [ ] The format matches Keep A Changelog conventions.
- [ ] The GitHub release body pulls the same content for that version.

**Priority:** P0
**Effort:** M

**US-7.4.4** — As a release manager, I want to optionally trigger a release by applying a `release` label to a PR, so that I can cut a version without a terminal.

**Acceptance criteria:**
- [ ] A workflow on `pull_request` with label `release` (or similar) runs the release flow on merge.
- [ ] The workflow uses a GitHub token with publish rights stored in secrets.
- [ ] Applying the label on a merged PR re-triggers release only if safe (no duplicate version).
- [ ] The mechanism is documented in `RELEASING.md`.

**Priority:** P1
**Effort:** M

### Feature 7.5: TypeScript token definitions
Ship a `tokens.d.ts` (and compiled `tokens.js`/`tokens.mjs`) that exposes every token from `$theme-light`, `$space`, `$font-sizes`, `$font-weights`, `$line-heights`, `$shadow`, `$z-layers`, `$radius`, and `$theme-components` as typed TypeScript constants. TypeScript consumers import them for type-safe token access in component code (e.g. inline styles, CSS-in-JS, or data props). Generated from the SCSS source of truth at build time; not hand-maintained.

#### User Stories

**US-7.5.1** — As a consumer, I want to `import { space, fontSizes, colors } from '@jerry2d3d/css-is-awesome/tokens'` in my TypeScript code, so that I get autocomplete and compile-time errors for token names.

**Acceptance criteria:**
- [ ] A `tokens` entry point is declared in `package.json` `exports`.
- [ ] The module exports typed constants for every scale and the light theme colors at minimum.
- [ ] A TypeScript consumer in a sample project (the Next.js starter) uses the import and typechecks cleanly.
- [ ] Documented in a docs-site page and linked from the README.

**Priority:** P1
**Effort:** M

**US-7.5.2** — As a system author, I want the TypeScript token file generated from the SCSS source, so that it cannot drift.

**Acceptance criteria:**
- [ ] A script (`scripts/build-tokens.js` or similar) parses the SCSS token maps and emits `tokens.d.ts` + `tokens.mjs`.
- [ ] The script runs as part of `npm run build` and the release flow.
- [ ] Running the script with no source changes produces zero diff (idempotent).
- [ ] A CI check fails if the generated file is out of date in a PR.
- [ ] Failure mode is actionable: names the drifted token.

**Priority:** P1
**Effort:** M

**US-7.5.3** — As a consumer, I want token types to include literal values, so that my editor shows the actual `0.5rem` or `#0066ff` on hover.

**Acceptance criteria:**
- [ ] Exported constants are typed as literal values (e.g. `export const space2: "0.5rem"`), not `string`.
- [ ] Hovering the import in VS Code shows the literal value in the tooltip.
- [ ] A consumer can use a token as a template-literal type (e.g. in a Tailwind config) without `as const` gymnastics.

**Priority:** P2
**Effort:** S

### Feature 7.6: Storybook installation
Install Storybook v10+ with the Next.js framework, running via `npm run storybook` on port 6006. Configure the dark-mode addon, a11y addon, and docs addon. Mirror the setup already proven in the `boiler-project-ai` boilerplate so future upgrades stay in sync. Storybook reads global styles and the current theme CSS so stories render in the real visual context.

#### User Stories

**US-7.6.1** — As a contributor, I want `npm run storybook` to boot Storybook v10+ with the Next.js framework, so that I can build components in isolation.

**Acceptance criteria:**
- [ ] `.storybook/main.ts` declares `framework: '@storybook/nextjs'` with v10+ packages in `devDependencies`.
- [ ] `npm run storybook` starts on `http://localhost:6006` without errors.
- [ ] Global styles (`globals.css`, active theme CSS) load into every story.
- [ ] A `preview.tsx` configures parameters (layout, viewports) consistent with the docs site.
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P0
**Effort:** M

**US-7.6.2** — As a Storybook author, I want dark-mode, a11y, and docs addons installed and configured, so that every story surfaces accessibility issues and lets me flip themes.

**Acceptance criteria:**
- [ ] `@storybook/addon-a11y`, a dark-mode addon, and `@storybook/addon-docs` are installed at compatible versions.
- [ ] Each addon is registered in `.storybook/main.ts` and works in the running UI.
- [ ] The dark-mode addon toggles `data-theme="dark"` so library dark tokens apply.
- [ ] The a11y addon runs axe-core against every story and surfaces violations in the side panel.

**Priority:** P0
**Effort:** M

**US-7.6.3** — As a contributor, I want `npm run build-storybook` to produce a static Storybook, so that it can be published alongside the docs site.

**Acceptance criteria:**
- [ ] `npm run build-storybook` emits `storybook-static/` with no errors.
- [ ] The static build opens correctly when served locally (`npx http-server storybook-static`).
- [ ] A CI step builds Storybook on every PR to catch regressions.
- [ ] Optionally deployed under `/storybook` on the docs site host (documented, not required for P0).

**Priority:** P1
**Effort:** S

### Feature 7.7: Storybook stories per component
Every React component in `src/components/` has a co-located `.stories.tsx` file. Each stories file covers the default rendering, every variant (size, color, shape), every state (hover, focus, disabled, loading, error), and at least one edge case (empty, very long content, RTL if relevant). Stories use the Component Story Format (CSF 3).

#### User Stories

**US-7.7.1** — As a Storybook author, I want a naming and location convention for stories, so that I don't have to guess where to put them.

**Acceptance criteria:**
- [ ] Convention: `Button.tsx` next to `Button.stories.tsx` in the same directory.
- [ ] A template / `plop` generator / documented pattern exists to scaffold a new stories file.
- [ ] `.storybook/main.ts` `stories` glob picks up both `src/components/**/*.stories.tsx` and any future additions.
- [ ] Documented in `CONTRIBUTING.md` under "Adding a component".

**Priority:** P1
**Effort:** S

**US-7.7.2** — As a contributor, I want every existing React component to have a stories file covering default + variants + states, so that Storybook is a complete component catalog.

**Acceptance criteria:**
- [ ] Every file in `src/components/` that exports a React component has a matching `.stories.tsx`.
- [ ] Each stories file includes: a default story, one story per variant, one story per state (hover, focus, disabled, loading, error where applicable), and at least one edge-case story.
- [ ] Stories use CSF 3 (`export default { ... } satisfies Meta<...>` and named exports).
- [ ] A CI check fails if a new component PR lands without a stories file.

**Priority:** P1
**Effort:** L

**US-7.7.3** — As a Storybook author, I want `argTypes` wired so the Controls panel exposes every prop with sensible ranges, so that designers can play with a component without editing code.

**Acceptance criteria:**
- [ ] Every stories file defines `argTypes` for props with appropriate `control` types (select, boolean, text, range).
- [ ] Defaults in the Controls panel match the component's actual default props.
- [ ] Changing a control updates the rendered story in real time.

**Priority:** P2
**Effort:** M

### Feature 7.8: Visual testing harness
Visual-regression baselines pinned per Storybook story. Either Storybook + Chromatic (hosted) or Storybook + Playwright screenshot tests (self-hosted). Runs on every PR. Flags pixel-level changes for human review. Stories mentioned in Feature 7.7 are the input.

#### User Stories

**US-7.8.1** — As a maintainer, I want a visual-regression run against every PR, so that I catch unintended UI changes before merge.

**Acceptance criteria:**
- [ ] A CI job runs visual regression against every story in the PR branch vs. `main` baselines.
- [ ] Changed stories are flagged with diff images (Chromatic UI or uploaded as workflow artifacts).
- [ ] A green run with zero diffs requires no human action.
- [ ] Runs reliably in CI and reproducibly locally via an npm script.
- [ ] Documented in `CONTRIBUTING.md`.
- [ ] Failure mode is actionable: comment links directly to the diff.

**Priority:** P1
**Effort:** L

**US-7.8.2** — As a contributor, I want an obvious way to approve an intentional visual change, so that I don't block the PR forever.

**Acceptance criteria:**
- [ ] A documented "accept baseline" step exists (e.g. a Chromatic approval URL, or `npm run test:visual:update`).
- [ ] Updated baselines are committed back to the PR branch (or host-managed) and re-run cleanly.
- [ ] Accepting a baseline requires explicit action — no silent auto-approval.
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P1
**Effort:** M

**US-7.8.3** — As a release manager, I want secrets for the chosen visual-testing provider stored in GitHub Actions secrets, so that no tokens land in the repo.

**Acceptance criteria:**
- [ ] `CHROMATIC_PROJECT_TOKEN` (or equivalent) lives in GitHub Actions secrets.
- [ ] The workflow references the secret by name; no token in any committed file.
- [ ] Required secret names are listed in `CONTRIBUTING.md`.

**Priority:** P1
**Effort:** S

### Feature 7.9: Pre-commit hooks
Install Husky or simple-git-hooks. On every `git commit`, run lint and typecheck against changed files (via `lint-staged`). Block the commit on failure. The hook is installed automatically after `npm install` so no contributor has to remember to enable it.

#### User Stories

**US-7.9.1** — As a contributor, I want `git commit` to auto-lint and auto-typecheck my staged changes, so that obvious problems never leave my laptop.

**Acceptance criteria:**
- [ ] Husky or simple-git-hooks is installed and wired to `npm install` via `prepare` script.
- [ ] `lint-staged` runs ESLint and Stylelint on staged `.ts/.tsx/.js/.scss/.css` files.
- [ ] Typecheck runs on the whole project (fast in incremental mode) on commit.
- [ ] A commit with a lint error is rejected with an actionable message.
- [ ] Runs reliably and reproducibly; same checks as CI.
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P0
**Effort:** M

**US-7.9.2** — As a contributor, I want to bypass hooks on an emergency basis, so that I'm never fully locked out of committing.

**Acceptance criteria:**
- [ ] `git commit --no-verify` works and is documented as an emergency escape hatch only.
- [ ] CI still catches anything a bypass commit introduces, so nothing broken reaches `main`.
- [ ] The README/CONTRIBUTING notes that bypassing locally still fails CI.

**Priority:** P1
**Effort:** S

**US-7.9.3** — As a contributor, I want commit messages to be validated against Conventional Commits, so that the release changelog (Feature 7.4) stays clean.

**Acceptance criteria:**
- [ ] A `commit-msg` hook runs `commitlint` (or equivalent) against the message.
- [ ] Malformed messages are rejected with a link to the convention.
- [ ] The rule set is committed (`.commitlintrc` or `commitlint.config.js`).
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P1
**Effort:** S

### Feature 7.10: `dev:watch` combined script
One npm script — `npm run dev:watch` — that concurrently starts `next dev` and the SCSS library watch build, so an edit to `scss/*` rebuilds the library CSS and Next.js hot-reloads the resulting change into the running docs site. Uses `concurrently` or `npm-run-all -p` to run both in one terminal with colored prefixed output.

#### User Stories

**US-7.10.1** — As a contributor, I want `npm run dev:watch` to run Next.js dev and SCSS watch in one terminal, so that editing the library immediately reflects in the site.

**Acceptance criteria:**
- [ ] `npm run dev:watch` runs `next dev` and `npm run build:css:all -- --watch` (or equivalent) in parallel.
- [ ] Editing a file under `scss/` triggers a rebuild and Next.js HMR picks up the new CSS within 2 seconds.
- [ ] Output is colored per-process (e.g. `[next]`, `[scss]`).
- [ ] Ctrl-C cleanly stops both processes.
- [ ] Documented in `CONTRIBUTING.md`.

**Priority:** P0
**Effort:** S

**US-7.10.2** — As a contributor, I want a clear error when either sub-process fails, so that I don't spend 10 minutes wondering why nothing's reloading.

**Acceptance criteria:**
- [ ] A crashed sub-process surfaces its stderr with its prefix.
- [ ] The wrapper does not exit silently on a sub-process crash — it either restarts or prints an actionable message.
- [ ] Documented failure modes (port in use, SCSS syntax error) are listed in `CONTRIBUTING.md`.

**Priority:** P1
**Effort:** S

### Feature 7.11: Starter templates
Four starter templates that let a consumer go from zero to "css-is-awesome running in my project" in under 60 seconds: (1) minimal-HTML (single `index.html` with CDN `<link>` and SRI), (2) Vite starter, (3) Next.js starter, (4) Astro starter. Each is either a GitHub template repo or a folder under `starters/` that users can scaffold with `degit`. Each includes a README with run instructions.

#### User Stories

**US-7.11.1** — As a consumer, I want a minimal-HTML starter I can download and open in a browser, so that I can evaluate the library in the simplest possible context.

**Acceptance criteria:**
- [ ] `starters/minimal-html/` (or a template repo) exists with a single `index.html`.
- [ ] The `<link>` to the library uses a CDN URL with a valid SRI hash.
- [ ] Opening the file in a browser shows styled components without a build step.
- [ ] A `README.md` in the starter explains what it demonstrates.
- [ ] Documented in the main repo `README.md` under "Starters".

**Priority:** P1
**Effort:** S

**US-7.11.2** — As a consumer, I want a Vite starter, a Next.js starter, and an Astro starter, so that I can pick the one matching my stack.

**Acceptance criteria:**
- [ ] Three starters exist under `starters/` (or as template repos linked from the README).
- [ ] Each scaffolds with `degit` (or "Use this template") and runs with its standard `npm run dev` in under 60 seconds.
- [ ] Each imports the library via SCSS and renders at least one themed example page.
- [ ] Each has a README with prerequisites, run command, and a pointer to the docs site.

**Priority:** P1
**Effort:** L

**US-7.11.3** — As a maintainer, I want starters to stay in sync with the library version, so that a consumer doesn't scaffold a broken starter.

**Acceptance criteria:**
- [ ] Each starter pins `@jerry2d3d/css-is-awesome` at a specific version or `latest`.
- [ ] A CI job on the main repo runs `npm install` + `npm run build` inside each starter on every PR that touches `package.json` or the starters.
- [ ] Broken starter = failing CI.
- [ ] A documented procedure for updating starters at release time lives in `RELEASING.md`.

**Priority:** P2
**Effort:** M

### Feature 7.12: Bundle analysis
`npm run analyze` runs `webpack-bundle-analyzer` (or Next.js's built-in `@next/bundle-analyzer`) against the docs-site build and opens an interactive treemap of what's big. Used to catch accidental large-dep regressions and inform dependency choices.

#### User Stories

**US-7.12.1** — As a contributor, I want `npm run analyze` to produce an interactive bundle treemap, so that I can see what's big in the Next.js build.

**Acceptance criteria:**
- [ ] `npm run analyze` runs the Next.js build with `@next/bundle-analyzer` (or equivalent) enabled.
- [ ] An HTML report opens in the browser (or is written to a known path) showing chunk sizes.
- [ ] Documented in `CONTRIBUTING.md` under "Performance".

**Priority:** P2
**Effort:** S

**US-7.12.2** — As a maintainer, I want a size budget posted as a PR comment when the bundle grows beyond a threshold, so that size regressions get attention.

**Acceptance criteria:**
- [ ] A CI step measures total JS+CSS bundle size and compares to `main`.
- [ ] A PR that grows the bundle by more than the documented threshold (e.g. 10KB gzipped) gets a warning comment.
- [ ] Threshold is documented in `CONTRIBUTING.md` and tunable in one config file.
- [ ] Failure mode is actionable: the comment names the chunk that grew.

**Priority:** P2
**Effort:** M

## Dependencies
- Blocks: 1.0 release (publishing to npm and cutting the first tagged release both require Feature 7.3 and Feature 7.4 to land). Epic 9 (Community & Project Meta) also depends on this epic's CONTRIBUTING/RELEASING scaffolding to cross-link into.
- Blocked by: Epic 6 (Testing & Quality) — CI (Feature 7.1) runs the tests defined there; visual regression (Feature 7.8) consumes the same harness. CI can stub-run an empty test suite if Epic 6 slips, but the epic as specified needs Epic 6's tests to be real.

## Priority
P0 (blocker for 1.0) — the package cannot ship to npm without Features 7.1, 7.3, 7.4, 7.6, 7.9, and 7.10 landing. Features 7.5, 7.7, 7.8, and 7.11 are P1 (wanted for 1.0, can slip one release without blocking). Feature 7.12 is P2 (post-1.0).
