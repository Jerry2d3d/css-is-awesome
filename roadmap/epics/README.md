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
**Effort:** S | M | L | XL

(repeat per story)

(repeat per feature)

## Dependencies
- Blocks: Epic N, Epic M
- Blocked by: Epic N

## Priority
P0 (blocker for 1.0) | P1 (wanted for 1.0) | P2 (post-1.0)
```

## ID scheme

`US-{epic#}.{feature#}.{story#}` — e.g. `US-1.2.3` = Epic 1, Feature 2, Story 3. IDs are stable; renumbering retires an ID and assigns a new one.

## Priority scale

- **P0** — blocker for 1.0 release.
- **P1** — wanted for 1.0, can slip without blocking the release.
- **P2** — post-1.0.

## Effort scale

- **S** — under a day
- **M** — a day or two
- **L** — a week
- **XL** — longer than a week

## The nine epics

1. [Library Foundations](01-library-foundations.md) — token coverage, sizing scale, `$theme-components` map, theme validator, dark-mode auto-detect
2. [Themes & Icons](02-themes-and-icons.md) — per-theme icon packs, preview thumbnails, authoring guide, community submission, contrast audit
3. [React Component Library](03-react-components.md) — the ~25 missing React wrappers (atoms → molecules → overlays)
4. [Documentation Content](04-documentation-content.md) — real `/docs` content, mixin reference, migration guide, recipes, a11y notes
5. [Site UX](05-site-ux.md) — search, TOC, prev/next, OpenGraph, real 404, Shiki syntax highlight, copy-to-clipboard
6. [Testing & Quality](06-testing-quality.md) — Jest, Playwright, axe-core, visual regression, Lighthouse, bundle-size CI
7. [Infrastructure & Release](07-infrastructure-release.md) — GitHub Actions CI, deploy, automated release, Storybook, starter templates
8. [AI Integration](08-ai-integration.md) — MCP server, CLI, JSON tokens, AI prompt templates
9. [Community & Project Meta](09-community-meta.md) — CONTRIBUTING, CoC, SECURITY, issue/PR templates, SemVer policy
