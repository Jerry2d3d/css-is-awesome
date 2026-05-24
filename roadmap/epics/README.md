# Epics

> **Updated 2026-05-23.** This folder now contains TWO parallel structures:
>
> 1. **Versioned epic folders (v1-0/ through v2-0/)** — the current backlog organized by release. Created during the 2026-05-23 v1.0 architecture lock. These are the active source of truth.
> 2. **Legacy numbered epics (01-07)** — the original 7-epic structure from earlier 2026. Items mostly shipped (theme system, MCP server, CI) or absorbed into the new versioned epics. Preserved for history.

Detailed breakdown of the work needed to take css-is-awesome from v1.0 to v2.0. Each epic is a thematic slice of the system. `ROADMAP.md` at the repo root is the phase/milestone view; these files are the work-item view.

## Versioned epic folders (current source of truth)

| Release | Theme | Folder | Stories | Effort | Status |
|---|---|---|---|---|---|
| [v1.0](./v1-0/README.md) | **Recipes-first reframe** — recipes book, theme editor polish, migration on-ramp, playground, bug-fix patch | v1-0/ | 42 | ~18-26 days | Planned (next ship) |
| [v1.1](./v1-1/README.md) | **Recipes momentum** — 7 more recipes, install wizard, @cia/a11y-recipes, @cia/react codegen POC | v1-1/ | 43 | ~25-35 days | Planned |
| [v1.2](./v1-2/README.md) | **Coverage** — RTL audit, form validation, i18n, print, MUI/Chakra migration | v1-2/ | 32 | ~16-22 days | Planned |
| [v1.3](./v1-3/README.md) | **Ecosystem** — Figma plugin, theme marketplace, DTCG migration, @cia/angular | v1-3/ | 34 | ~28-35 days | Planned |
| v1.4 | *Reserved — scoped from v1.1-v1.3 feedback* | — | — | — | Not scoped |
| [v1.5](./v1-5/README.md) | **IDE integration** — VS Code extension | v1-5/ | 15 | ~10 days | Planned |
| [v2.0](./v2-0/README.md) | **Visual builder** — Recipes Maker | v2-0/ | 18 | ~15-20 days | Planned — may never ship |

**Total planned stories across all versions:** 184. **Total estimated effort:** ~112-148 working days.

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

1. [Library Foundations](01-library-foundations.md) — token coverage, sizing scale, `$theme-components` map, theme validator, dark-mode auto-detect *(mostly shipped)*
2. [Themes & Icons](02-themes-and-icons.md) — per-theme icon packs, preview thumbnails, authoring guide, community submission, contrast audit; add-ons feature *(mostly shipped; community submission now in [v1.3 EPIC-02 theme marketplace](./v1-3/EPIC-02-theme-marketplace.md))*
3. [React Component Library](03-react-components.md) — companion React component library — Gremlin UI *(REVISED 2026-05-23: NO separate component library; boiler-project-ai is the showcase. See [v1.1 EPIC-04 @cia/react codegen](./v1-1/EPIC-04-framework-pack-react.md) for the new approach.)*
4. [Documentation Site](04-documentation-site.md) — real `/docs` content + site UX *(shipped)*
5. [Quality & Delivery](05-quality-delivery.md) — tests, a11y, visual regression, Lighthouse, bundle budget, CI, deploy, release automation, Storybook, starter templates *(mostly shipped; Storybook explicitly killed per memory)*
6. [AI Integration](06-ai-integration.md) — MCP server, CLI, JSON tokens, AI prompt templates *(MCP shipped; CLI absorbed into [v1.0 EPIC-03 migration](./v1-0/EPIC-03-migration-on-ramp.md))*
7. [Community & Project Meta](07-community-meta.md) — CONTRIBUTING, CoC, SECURITY, issue/PR templates, SemVer policy *(mostly shipped)*

See also: [`roadmap/product-architecture.md`](../product-architecture.md) for the (also revised) umbrella product split.
