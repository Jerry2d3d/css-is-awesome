# Product Architecture

**Decision date:** 2026-05-03
**Status:** Locked direction; naming + repo layout TBD.

> **Update 2026-09-01.** Milestones in this doc are historical: css-is-awesome is well past the "v0.7 npm cut" — v1.0.0 was tagged 2026-08-17, and on 2026-09-01 the project launched for real (**first-ever npm publish, `css-is-awesome@1.1.0`**; repo public; docs site live at <https://jerry2d3d.github.io/css-is-awesome/>). The "Gremlin UI" component-library product below was **superseded at the 2026-05-23 v1.0 architecture lock** — the framework story is recipes-first and cia ships zero JS; see the STATUS banner in [`epics/03-react-components.md`](./epics/03-react-components.md) and [`epics/v1-0/README.md`](./epics/v1-0/README.md).

## TL;DR

The umbrella is split into three (arguably four) distinct products. css-is-awesome is the styling system — pure SCSS + CSS, no React. A separate React component library and a Next.js starter live as sister products.

## Why three products

### 1. "The styling system is the important part"

The founder's words. The mixin-router, contract-validated themes, token contract, validator, three authoring tiers (drop-in CSS, SCSS mixins, bare-tag recipe) — that is the original thesis and the moat. A React bundle bolted onto the same package was diluting the message and the maintenance surface.

### 2. The Tailwind → shadcn → Tailwind UI precedent

The proven 2026 pattern is: one styling layer, one component layer, one starter. Each product has one job, one audience, one release cadence. Tailwind never tried to ship React components. shadcn never tried to ship a CSS framework. Tailwind UI sits on top of both. We are following the same shape because it scales for solo and small-team maintainers.

### 3. Solo-dev maintenance argument

Coupling SCSS releases to TS/React releases means every Sass change re-tests every component, every React breaking change re-tests every theme. Splitting them lets each product have an independent CHANGELOG, an independent semver, and an independent test surface. A solo maintainer cannot afford a monolith.

## Products

### css-is-awesome (this repo)

- **Audience:** any web project that wants a themeable, mixin-first design system. Framework-agnostic.
- **Value prop:** the styling system whose themes pass a typed contract; one file swaps the entire skin.
- **Scope:** SCSS source, compiled CSS bundles (core / utilities / full), token contract, theme validator, animations, icon mixin system, three authoring tiers. Lives forever in this repo.
- **Out of scope:** React, JS components, framework-specific runtime code.

### Add-ons

- **Audience:** css-is-awesome consumers who want more themes, icon packs, animation libraries, mixin extras without writing them.
- **Value prop:** drop-in single-file assets, no build step. The existing `theme.css` model is the template.
- **Scope:** themes, icon sprites, keyframe libraries, mixin extras. Distribution is open — separate npm packages, a download registry, or both.
- **Lives in:** likely a sibling org or a `/registry` site. Not yet decided.

### Gremlin UI (FUTURE — name TBD)

- **Audience:** React/Next.js developers who want pre-built components themed by css-is-awesome.
- **Value prop:** unstyled-by-default React components that pick up css-is-awesome themes for free; ship-ready accessibility and behaviour.
- **Scope:** React component library. Depends on css-is-awesome as a peer dep for theming. Picks up the ~34 components in this repo's `src/components/` (or the rescoped subset from Epic 03).
- **Naming:** TBD — "Gremlin UI" / "Components are Awesome" / "Gremlin Components".

### Gremlin Boilerplate (FUTURE)

- **Audience:** developers starting a new full-stack project who want a sensible default stack.
- **Value prop:** Next.js starter that pre-wires css-is-awesome + Gremlin UI + auth + opinionated app shell. One command, working app.
- **Scope:** the current `boiler-project-ai` repo evolves into this.

## Dependency direction

```
Gremlin Boilerplate  ──►  Gremlin UI  ──►  css-is-awesome  ──►  Add-ons
   (Next.js app)         (React lib)       (this repo)         (themes,
                                                                icon packs,
                                                                animations)
```

One-way only. css-is-awesome never imports anything from Gremlin UI. Add-ons consume css-is-awesome's contract but ship independently.

## Open question: repo layout for Gremlin UI

Three plausible options. Not deciding here, just naming the trade-offs.

1. **Separate repo, separate org.** Cleanest separation, slowest cross-cutting changes.
2. **Monorepo (pnpm/turbo workspace) alongside css-is-awesome.** Easier coupled refactors, harder release isolation, risks re-monolithing the maintenance surface we just split.
3. **Separate repo under the same org.** Compromise — independent release cadence but visible co-location for users.

Recommend deferring this decision until the components are stable enough to extract.

## When each product starts (event triggers, not dates)

- **css-is-awesome:** ongoing. Next milestone is v0.7 (styling-only npm cut).
- **Add-ons:** as needed; the boilerplate theme is already in flight under Phase 4.5.
- **Gremlin UI:** starts when css-is-awesome `1.0` ships AND the ~17 components the boilerplate already wants are stable in `src/components/`.
- **Gremlin Boilerplate:** starts when Gremlin UI hits a usable `0.x` AND css-is-awesome `0.7+` is on the registry. Until then, `boiler-project-ai` continues as a private workbench.

## What lives here forever vs what migrates out

**Stays in css-is-awesome forever:**
- `scss/` — the entire SCSS source.
- `dist/` — compiled CSS bundles.
- `public/themes/` — first-party themes (may eventually split into Add-ons, but home base is here).
- `scripts/theme-contract.json` and the validator.
- The Next.js docs site (`src/app/`) — it's docs, not product.

**Migrates out (eventually, to Gremlin UI):**
- `src/components/` — the React components. Today they live here because the docs site needs them; long-term they belong to Gremlin UI.
- Any TS-module entry that was added on `feat/v0.7-port-fixes` — being reverted before v0.7 ships.

**Stays here as a *snippet*, not a module:**
- `theme-init` — documented in `AGENTS.md` as a copy-paste snippet for consumers, NOT a published TS export.

## Reverted scope (2026-05-03)

The React bundle added on `feat/v0.7-port-fixes` (`dist/components/`, `src/index.ts`, `tsup.config.ts`, `tsconfig.lib.json`, `scripts/add-use-client.mjs`, `scripts/copy-component-scss.mjs`) is being stripped before v0.7. The boilerplate consumer copies its 17 wanted components from `src/components/` shadcn-style — a 30-min one-time job.
