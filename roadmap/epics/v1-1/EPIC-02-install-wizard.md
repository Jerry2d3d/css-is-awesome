# EPIC v1.1-02 — `npm create cia` Install Wizard

**Status:** ✅ Complete — **`create-cia@1.0.0` published to npm 2026-09-25**, dist-tag `latest`, with a GitHub Release and tag. `npm create cia@latest` and `npx create-cia` are both live.

The publish was blocked for a week on credentials, and the failure was worth recording because it had two layers. The token returned **E403** while it carried *stage-only* permission, then **E401** once replaced — authentication failing outright rather than permission being refused. The fix was a granular token with **read-and-write (publish and stage)** across **all packages**; it could not be scoped to `create-cia` specifically, because an unpublished package does not exist for npm to scope against, and the first publish is the one that needs to work.

Underneath that sat a second problem the release workflow's own header predicts: the 2026-09-18 run reached `prepare`, which tags and pushes before npm is ever contacted, then failed at publish. A `v1.0.0` tag was left on the remote asserting a version that existed nowhere. Re-running would have computed "no new version" from the commits after that tag and reported SUCCESS having shipped nothing. Deleting the tag on both sides was the documented recovery.

Verified from the published artifact rather than the source tree: the tarball carries 13 files (bin, 8 lib modules, README, LICENSE, package.json) with no dev fixtures, `--version` reports 1.0.0, and `--yes --dry-run` in an empty directory prints a full plan and writes nothing.
**Effort estimate:** ~3-5 working days
**Stories:** 7

## Mission

Ship `npm create cia@latest` (alias `npx create-cia`) — a guided installer that asks framework, initial theme, and optional add-on questions, then wires the consumer's project in one command. Lowers the "what do I install?" friction.

## Why now

v1.0 ships `npm install css-is-awesome` (slim, no prompts). v1.1 introduces multiple add-ons (`@cia/a11y-recipes`, `@cia/react`). Without a wizard, consumers must read README + decide between scss/css/min + decide which themes to load + decide on add-ons. Wizard collapses that into 4 questions.

## Out of scope

- New-project scaffolding (don't `create-react-app` — meet teams in existing projects per Gemini's strategic note)
- Cloud-hosted templates
- Auth setup, database wiring, deployment config

## Features

### F2.1 — CLI scaffolding

#### US-V11.02.1.1 — `npm create cia@latest` recognized

**As** a dev trying cia for the first time
**I want** `npm create cia@latest` to run a guided wizard
**So that** I don't read 5 docs pages to decide what to install

**Acceptance criteria:**
- [x] New npm package `create-cia` published (npm's `create-*` convention) — **1.0.0 on npm 2026-09-25**
- [x] Package contains a `bin/create-cia.mjs` entry (ESM)
- [x] Works on Mac, Linux, Windows (no shell-specific dependencies)
- [x] Uses `@clack/prompts` (or `prompts` — pick whichever is lighter)
- [x] No prompts → reasonable defaults applied + summary printed

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-V11.02.1.2 — Detect existing project state

**As** the wizard
**I want** to detect whether I'm in an existing project (presence of package.json) and adapt prompts accordingly
**So that** existing-project flow doesn't ask "what framework" if Next.js/Vite/Astro is already detected

**Acceptance criteria:**
- [x] If `package.json` exists, parse to detect framework (next, vite, astro, vue, svelte, angular markers)
- [x] Skip framework prompt; show "Detected: Next.js — use this? [Y/n]" instead
- [x] If no `package.json`, prompt full framework list
- [x] Errors gracefully if package.json is malformed

**Effort:** S (≤4 hrs)
**Depends on:** US-V11.02.1.1

---

### F2.2 — Framework + add-on prompts

#### US-V11.02.2.1 — Prompt for framework

**As** the wizard
**I want** to ask "what framework?" with React / Vue / Svelte / Angular / Vanilla
**So that** the wizard installs the right framework pack (when available)

**Acceptance criteria:**
- [x] Options: React (recommended — pairs with @cia/react when v1.1 ships), Vue, Svelte, Angular, Vanilla
- [x] Defaults to React when nothing is detected *(detection wins whenever a package.json exists)*
- [x] ~~`@cia/*` pack wiring~~ — no framework packs exist (EPIC-04 unstarted); the wizard installs `sass` when missing instead, which the epic omitted but the generated entry needs
- [x] If no pack exists, note "framework recipe pack not yet published; recipes work in any framework"

**Effort:** S (≤4 hrs)

#### US-V11.02.2.2 — Prompt for initial theme

**As** the wizard
**I want** to ask "which starting theme?" with the 9 shipped themes
**So that** the consumer's `<html data-theme>` is set correctly without manual edit

**Acceptance criteria:**
- [x] Lists all 8 themes with one-line description (read from theme metadata if available, else hard-coded)
- [x] Defaults to `boilerplate` (neutral starter)
- [x] After selection, prints next steps: "Add `<html data-theme=\"<chosen>\">` to your root layout"

**Effort:** S (≤4 hrs)

#### US-V11.02.2.3 — ~~Prompt for `@cia/a11y-recipes` add-on~~ (RETIRED 2026-09-17 — the add-on was folded into the core book; the wizard asks no a11y question because every recipe is WCAG-graded)

**As** the wizard
**I want** to ask "want WCAG-strict a11y recipes?" Y/N
**So that** consumers who need stricter accessibility get the add-on installed

**Acceptance criteria:**
> **⛔ This question was never built, and never will be.** [v1-1 EPIC-03](./EPIC-03-cia-a11y-recipes.md)
> was retired on 2026-09-17: a11y recipes folded into the core recipe book as a
> WCAG-strict section inside each recipe, and no `@cia/a11y-recipes` package
> exists to install. A wizard question offering it would be offering nothing.
> The three criteria below are kept as the historical plan, deliberately
> unticked, because striking them out entirely would hide why the wizard has
> one fewer question than this epic describes.

- [ ] ~~Yes → adds `@cia/a11y-recipes` to install list~~ — package retired
- [ ] ~~No → notes "you can add later with `npm install @cia/a11y-recipes`"~~ — package retired
- [ ] ~~Default = Yes (recommend WCAG by default — fail-default consistency)~~ — package retired

**Effort:** S (≤4 hrs)

---

### F2.3 — Install + wire SCSS

#### US-V11.02.3.1 — Run npm install + wire SCSS entry

**As** the wizard
**I want** to install all chosen packages and create the SCSS entry that imports cia + the chosen theme
**So that** the consumer doesn't have to write any boilerplate

**Acceptance criteria:**
- [x] Spawns `npm install <packages>` with detected package manager (npm / pnpm / yarn / bun)
- [x] Creates `app/styles/cia.scss` (or framework-appropriate path) with `@use 'css-is-awesome' as cia;`
- [x] Imports the theme into the root layout via the package's `css-is-awesome/themes/<name>` export *(a `<link>` into node_modules does not survive a Next/Vite production build; the `<link>` form is printed for the no-bundler case)*
- [x] Prints next-step summary with copy-paste lines for what the wizard couldn't auto-wire

**Effort:** M (4-8 hrs)
**Depends on:** US-V11.02.2.1, US-V11.02.2.2, US-V11.02.2.3

#### US-V11.02.3.2 — Print success summary with shortcut commands

**As** the consumer after wizard completes
**I want** a friendly summary with "next: try `<cia.btn>`", "open `/docs/recipes`", "run `npx cia migrate tailwind` if you have a Tailwind config"
**So that** I know what to do next

**Acceptance criteria:**
- [x] Summary shows: installed packages, theme set, SCSS entry path
- [x] 3-5 suggested next actions with command snippets
- [x] Link to docs site for the chosen theme
- [x] Time-to-first-render estimate ("you can render your first cia button in ~30 seconds")

**Effort:** S (≤4 hrs)

## Definition of done

- [x] All 7 stories accepted — the a11y add-on question (F2.2) is the one deviation, and it is not outstanding work: the package it would install was retired with v1-1 EPIC-03
- [x] `npm create cia@latest` published to npm — **create-cia@1.0.0, 2026-09-25**, dist-tag `latest`, GitHub Release and tag. Verified from the published tarball: 13 files, no dev fixtures, `--version` reports 1.0.0, `--yes --dry-run` in an empty directory prints a full plan and writes nothing
- [x] Tested on Mac, Linux, Windows — CI matrix covers ubuntu, windows **and macos**, on Node 20 and 24. macOS was added 2026-09-25 specifically to make this line true; the wizard spawns a package manager and writes paths, which are the two things that differ most between platforms, so a green Ubuntu run proved nothing about either. Six jobs, all green
- [x] Tested in 3 detected project types (Next.js dry-run, Vite-React real install, empty dir) — 2026-09-17
- [x] Tested in a no-package.json directory (new-project mode)
- [x] Docs page at `/docs/install/wizard` shows the wizard flow *(verbatim dry-run output instead of screenshots — it can't go stale silently)*
- [x] README.md mentions the wizard alongside `npm install`

## Risks

- **`create-*` package permissions.** Reserving the name `create-cia` on npm requires Jerry to publish first. Check name availability before scoping.
- **Framework detection edge cases.** Custom monorepo setups, Yarn workspaces, Bun, Deno — wizard can't cover them all. Mitigation: detection failure → manual framework prompt + warning toast.
- **Auto-wiring root layout is risky.** Modifying user code without explicit consent can damage their project. Mitigation: ALWAYS show diff + ask "Apply changes? [Y/n]" before writing any consumer file.

## Related

- [v1.1 EPIC-04-framework-pack-react.md](./EPIC-04-framework-pack-react.md) — `@cia/react` is what wizard installs when React chosen
- [v1.1 EPIC-03-cia-a11y-recipes.md](./EPIC-03-cia-a11y-recipes.md) — ~~add-on the wizard offers~~ retired 2026-09-17; nothing to offer
- Project notes (kept outside this repo) — the original idea
