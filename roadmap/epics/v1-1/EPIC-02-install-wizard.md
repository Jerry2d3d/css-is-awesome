# EPIC v1.1-02 — `npm create cia` Install Wizard

**Status:** Planned (v1.1)
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
- [ ] New npm package `create-cia` published (npm's `create-*` convention)
- [ ] Package contains a `bin/create-cia.cjs` (or `.mjs`) entry
- [ ] Works on Mac, Linux, Windows (no shell-specific dependencies)
- [ ] Uses `@clack/prompts` (or `prompts` — pick whichever is lighter)
- [ ] No prompts → reasonable defaults applied + summary printed

**Effort:** M (4-8 hrs)
**Depends on:** none

#### US-V11.02.1.2 — Detect existing project state

**As** the wizard
**I want** to detect whether I'm in an existing project (presence of package.json) and adapt prompts accordingly
**So that** existing-project flow doesn't ask "what framework" if Next.js/Vite/Astro is already detected

**Acceptance criteria:**
- [ ] If `package.json` exists, parse to detect framework (next, vite, astro, vue, svelte, angular markers)
- [ ] Skip framework prompt; show "Detected: Next.js — use this? [Y/n]" instead
- [ ] If no `package.json`, prompt full framework list
- [ ] Errors gracefully if package.json is malformed

**Effort:** S (≤4 hrs)
**Depends on:** US-V11.02.1.1

---

### F2.2 — Framework + add-on prompts

#### US-V11.02.2.1 — Prompt for framework

**As** the wizard
**I want** to ask "what framework?" with React / Vue / Svelte / Angular / Vanilla
**So that** the wizard installs the right framework pack (when available)

**Acceptance criteria:**
- [ ] Options: React (recommended — pairs with @cia/react when v1.1 ships), Vue, Svelte, Angular, Vanilla
- [ ] Defaults to React (highest install count from telemetry once v1.1 ships)
- [ ] If chosen framework has a `@cia/*` pack available at install time, add it to install list
- [ ] If no pack exists, note "framework recipe pack not yet published; recipes work in any framework"

**Effort:** S (≤4 hrs)

#### US-V11.02.2.2 — Prompt for initial theme

**As** the wizard
**I want** to ask "which starting theme?" with the 9 shipped themes
**So that** the consumer's `<html data-theme>` is set correctly without manual edit

**Acceptance criteria:**
- [ ] Lists all 9 themes with one-line description (read from theme metadata if available, else hard-coded)
- [ ] Defaults to `boilerplate` (neutral starter)
- [ ] After selection, prints next steps: "Add `<html data-theme=\"<chosen>\">` to your root layout"

**Effort:** S (≤4 hrs)

#### US-V11.02.2.3 — Prompt for `@cia/a11y-recipes` add-on

**As** the wizard
**I want** to ask "want WCAG-strict a11y recipes?" Y/N
**So that** consumers who need stricter accessibility get the add-on installed

**Acceptance criteria:**
- [ ] Yes → adds `@cia/a11y-recipes` to install list
- [ ] No → notes "you can add later with `npm install @cia/a11y-recipes`"
- [ ] Default = Yes (recommend WCAG by default — fail-default consistency)

**Effort:** S (≤4 hrs)

---

### F2.3 — Install + wire SCSS

#### US-V11.02.3.1 — Run npm install + wire SCSS entry

**As** the wizard
**I want** to install all chosen packages and create the SCSS entry that imports cia + the chosen theme
**So that** the consumer doesn't have to write any boilerplate

**Acceptance criteria:**
- [ ] Spawns `npm install <packages>` with detected package manager (npm / pnpm / yarn / bun)
- [ ] Creates `app/styles/cia.scss` (or framework-appropriate path) with `@use 'css-is-awesome' as cia;`
- [ ] Adds `<link rel="stylesheet" href="/themes/<chosen>/theme.css">` to root layout (where detection succeeds)
- [ ] Prints next-step summary with copy-paste lines for what the wizard couldn't auto-wire

**Effort:** M (4-8 hrs)
**Depends on:** US-V11.02.2.1, US-V11.02.2.2, US-V11.02.2.3

#### US-V11.02.3.2 — Print success summary with shortcut commands

**As** the consumer after wizard completes
**I want** a friendly summary with "next: try `<cia.btn>`", "open `/docs/recipes`", "run `npx cia migrate tailwind` if you have a Tailwind config"
**So that** I know what to do next

**Acceptance criteria:**
- [ ] Summary shows: installed packages, theme set, SCSS entry path
- [ ] 3-5 suggested next actions with command snippets
- [ ] Link to docs site for the chosen theme
- [ ] Time-to-first-render estimate ("you can render your first cia button in ~30 seconds")

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 7 stories accepted
- [ ] `npm create cia@latest` published to npm
- [ ] Tested on Mac, Linux, Windows
- [ ] Tested in 3 detected project types (Next.js, Vite-React, vanilla)
- [ ] Tested in a no-package.json directory (new-project mode)
- [ ] Docs page at `/docs/install/wizard` shows the wizard flow with screenshots
- [ ] README.md Quick Start mentions the wizard alongside `npm install`

## Risks

- **`create-*` package permissions.** Reserving the name `create-cia` on npm requires Jerry to publish first. Check name availability before scoping.
- **Framework detection edge cases.** Custom monorepo setups, Yarn workspaces, Bun, Deno — wizard can't cover them all. Mitigation: detection failure → manual framework prompt + warning toast.
- **Auto-wiring root layout is risky.** Modifying user code without explicit consent can damage their project. Mitigation: ALWAYS show diff + ask "Apply changes? [Y/n]" before writing any consumer file.

## Related

- [v1.1 EPIC-04-framework-pack-react.md](./EPIC-04-framework-pack-react.md) — `@cia/react` is what wizard installs when React chosen
- [v1.1 EPIC-03-cia-a11y-recipes.md](./EPIC-03-cia-a11y-recipes.md) — add-on the wizard offers
- [project_install_wizard.md](../../../C:/Users/jhans/.claude/projects/K--repo-css-is-awesome/memory/project_install_wizard.md) — original idea memory
