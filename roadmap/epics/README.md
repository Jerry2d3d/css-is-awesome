# Epics

Detailed breakdown of the work needed to take css-is-awesome to 1.0 and beyond. Each epic is a thematic slice of the system. `ROADMAP.md` at the repo root is the phase/milestone view; these files are the work-item view. User stories from any epic may ship across multiple phases.

## Format (every epic file follows this)

```md
# Epic {N}: {Name}

## Summary
One paragraph. What this epic delivers and why it matters.

## Goals
- Measurable outcome 1
- Measurable outcome 2

## Out of scope
- Things explicitly NOT in this epic (go elsewhere)

## Features

### Feature {N.M}: {Name}
One-paragraph description.

#### User Stories

**US-{N}.{M}.{K}** — As a {role}, I want {goal}, so that {benefit}.

**Acceptance criteria:**
- [ ] criterion 1
- [ ] criterion 2

**Priority:** P0 | P1 | P2
**Effort:** 1 | 3 | 5 | 7 | 9 | 11 | 13
**Role:** {role — pulled from the "As a" opener; e.g. "maintainer", "consumer", "CI system"}

(repeat per story)

(repeat per feature)

## Dependencies
- Blocks: Epic N, Epic M
- Blocked by: Epic N

## Priority
P0 (blocker for 1.0) | P1 (wanted for 1.0) | P2 (post-1.0)
```

## Product scope — what these epics cover

css-is-awesome is now positioned as one of three products under a shared umbrella:

1. **css-is-awesome** — the styling system (SCSS, themes, contract, mixins). This repo. Pure styling, no React.
2. **Gremlin UI** *(name TBD)* — companion React component library, distributed as a separate package; depends on css-is-awesome for tokens and styles.
3. **Gremlin Boilerplate** *(name TBD)* — Next.js starter that pre-wires the styling system and component library. Lives in its own repo (today: `boiler-project-ai`).

Most of these epics belong to css-is-awesome (the styling system). Epic 03 is being rescoped to plan Gremlin UI (the React component library) as a separate product. Epic 02 has an add-ons feature that covers extra themes/icons distributed beyond core.

```
Gremlin Boilerplate  →  Gremlin UI  →  css-is-awesome  →  (optional) Add-ons
   (Next.js starter)   (React lib)     (SCSS system)      (themes, icons, extras)
```

## ID scheme

`US-{epic#}.{feature#}.{story#}` — e.g. `US-1.2.3` = Epic 1, Feature 2, Story 3. IDs are stable; renumbering retires an ID and assigns a new one.

## Priority scale

- **P0** — blocker for 1.0 release.
- **P1** — wanted for 1.0, can slip without blocking the release.
- **P2** — post-1.0.

## Effort scale

Modified-Fibonacci odd scale. Bigger numbers mean more uncertainty as well as more hours.

- **1** — trivial; under half a day of focused work
- **3** — simple; roughly one day
- **5** — straightforward; two to three days
- **7** — medium; one working week
- **9** — complex; a week plus some uncertainty
- **11** — hard; more than a week with open questions
- **13** — large; multi-week or needs to be split

Default existing stories map roughly: old **S → 1**, **M → 3**, **L → 7**, **XL → 13**. Re-estimate when better information shows up.

## Role

Every user story has one primary role pulled from the "As a {role}…" opener. Kept as its own metadata line so the backlog is scannable by audience. Roles to use consistently across epics:

- **system author** / **maintainer** — Jerry or anyone keeping the library running
- **consumer** — a developer using css-is-awesome in their project
- **theme author** — someone writing a new theme
- **contributor** — external PR author
- **CI system** — automated checks
- **designer** — non-engineer stakeholder
- **accessibility reviewer**
- **release manager**
- **AI assistant** — Claude / ChatGPT / Gemini / Copilot / Cursor
- **new user** — first five minutes on the site
- **Bootstrap migrant**, **keyboard user**, **screen-reader user**, etc. as specific stories need

## The seven epics

1. [Library Foundations](01-library-foundations.md) — token coverage, sizing scale, `$theme-components` map, theme validator, dark-mode auto-detect
2. [Themes & Icons](02-themes-and-icons.md) — per-theme icon packs, preview thumbnails, authoring guide, community submission, contrast audit; now also includes an add-ons feature (extra themes/icons/animation packs distributed beyond core)
3. [React Component Library](03-react-components.md) — companion React component library — Gremlin UI *(name TBD; separate product, planning home)*
4. [Documentation Site](04-documentation-site.md) — real `/docs` content + site UX: mixin reference, migration guide, search, TOC, Shiki, mobile nav, copy-to-clipboard
5. [Quality & Delivery](05-quality-delivery.md) — tests, a11y, visual regression, Lighthouse, bundle budget, CI, deploy, release automation, Storybook, starter templates
6. [AI Integration](06-ai-integration.md) — MCP server, CLI, JSON tokens, AI prompt templates
7. [Community & Project Meta](07-community-meta.md) — CONTRIBUTING, CoC, SECURITY, issue/PR templates, SemVer policy

See also: [`roadmap/product-architecture.md`](../product-architecture.md) for the umbrella product split (css-is-awesome / Gremlin UI / Gremlin Boilerplate / Add-ons).
