# EPIC v2.0-01 — Recipes Maker

**Status:** Planned (v2.0) — bigger UX project
**Effort estimate:** ~3-4 weeks
**Stories:** 18

## Mission

A visual web tool on the cia website where a user drags cia primitives onto a stage, configures each via mixin parameters, sees live preview, and saves the result as a portable recipe markdown file (compatible with the v1.0+ recipe schema).

## Why now

Jerry's idea 2026-05-23, scoped to v2.0 (post v1.0-v1.5 stabilization). Closes the loop with the recipe book: instead of just READING recipes, users CREATE them. AI angle: the saved recipe is a portable brief any AI can generate code from in any framework. No competitor ships a recipe builder.

## Out of scope

- Visual code editor (Monaco or similar — the playground handles that)
- Backend storage / user accounts (v2.0 uses localStorage + share-via-URL)
- Multi-user collaboration
- Plugin SDK for custom primitives
- Versioning of saved recipes (defer to v2.1)

## Features

### F1.1 — Visual canvas + drag-drop

#### US-V20.01.1.1 — Build canvas at /recipes/maker

**Acceptance criteria:**
- [ ] Page at `src/app/recipes/maker/page.tsx`
- [ ] Canvas takes ~60% of viewport; left rail = primitives panel; right rail = inspector
- [ ] Empty state: "Drag a primitive from the left to get started"
- [ ] Mobile: stacked layout (primitives → canvas → inspector)

**Effort:** L (1-2 days)

#### US-V20.01.1.2 — Drag-drop engine

**Acceptance criteria:**
- [ ] Uses dnd-kit (or equivalent — picked based on bundle size + maintenance)
- [ ] Drag from primitives rail → drop on canvas → element appears at drop position
- [ ] Drag within canvas → reorder / nest
- [ ] Drag to trash zone → remove
- [ ] Undo / redo via Cmd+Z / Cmd+Shift+Z

**Effort:** L (1-2 days)

#### US-V20.01.1.3 — Canvas element selection + outline

**Acceptance criteria:**
- [ ] Click an element to select; outline rendered in cia's `--action-primary` color
- [ ] Selected element's properties appear in the inspector
- [ ] Keyboard: Tab cycles selection; Esc deselects; Delete removes

**Effort:** M (4-8 hrs)

---

### F1.2 — Primitives library

#### US-V20.01.2.1 — Define primitives catalog

**Acceptance criteria:**
- [ ] Catalog at `src/lib/recipes-maker/primitives.ts`
- [ ] Each primitive: name, icon, default HTML, default cia mixin call, configurable params
- [ ] First batch: button, input, label, dialog, section, stack, cluster, card, text, image
- [ ] Catalog easily extendable for v2.x additions

**Effort:** M (4-8 hrs)

#### US-V20.01.2.2 — Primitives panel UI

**Acceptance criteria:**
- [ ] Left rail lists primitives grouped by category (Form, Layout, Text, Media, Container)
- [ ] Each primitive shows icon + name
- [ ] Search filter at top of panel
- [ ] Drag a primitive → it's added to canvas at cursor

**Effort:** M (4-8 hrs)

#### US-V20.01.2.3 — Compound primitives (pre-configured combinations)

**Acceptance criteria:**
- [ ] Compound primitives: form-row (label + input), dialog-with-footer (dialog + body + toolbar), card-with-cta (card + button)
- [ ] Treated as single drag unit but expandable to inspect children
- [ ] Helps users start from a useful base, not a bare element

**Effort:** M (4-8 hrs)

---

### F1.3 — Inspector + mixin param editing

#### US-V20.01.3.1 — Inspector shows mixin params for selected element

**Acceptance criteria:**
- [ ] When element selected, inspector lists every mixin called on it
- [ ] Each mixin's params shown as form fields (text, dropdown, color picker)
- [ ] Param defaults pulled from cia's actual mixin signatures
- [ ] Edit → re-render preview live

**Effort:** L (1-2 days)
**Depends on:** US-V20.01.2.1

#### US-V20.01.3.2 — Add mixin to an element

**Acceptance criteria:**
- [ ] Inspector has "+ Add mixin" button
- [ ] Autocomplete dropdown lists all cia mixins applicable to current element (button → cia.btn, .cluster; section → cia.section, .stack, etc.)
- [ ] Adding a mixin merges its defaults into the element

**Effort:** M (4-8 hrs)

#### US-V20.01.3.3 — Set className for element

**Acceptance criteria:**
- [ ] Inspector has a "class name" text field
- [ ] Default class name = primitive name (e.g. `my-button`)
- [ ] Class name used in generated recipe's styling section
- [ ] No `cia-` prefix allowed (lint message)

**Effort:** S (≤4 hrs)

---

### F1.4 — Live preview + theme picker

#### US-V20.01.4.1 — Live preview pane

**Acceptance criteria:**
- [ ] Preview renders in an iframe (sandboxed, just like playground)
- [ ] Updates on every canvas change (debounced 200 ms)
- [ ] Preview shows the actual cia-styled HTML using the current canvas state

**Effort:** L (1-2 days)
**Depends on:** v1.0 EPIC-04 (in-browser SCSS compile from playground)

#### US-V20.01.4.2 — Theme picker in maker

**Acceptance criteria:**
- [ ] Preview can be rendered under any of the 9 cia themes
- [ ] Theme picker at top of preview
- [ ] Switching theme re-injects the right theme.css into preview iframe

**Effort:** S (≤4 hrs)

---

### F1.5 — Recipe markdown export

#### US-V20.01.5.1 — Serialize canvas state to recipe markdown

**Acceptance criteria:**
- [ ] "Download recipe.md" button in header
- [ ] Output follows v1.0 recipe schema (frontmatter + required H2 sections)
- [ ] HTML structure section emitted from canvas tree
- [ ] Styling section emitted with one `@include cia.X` per mixin per element
- [ ] A11y checklist section emitted as placeholders for the user to fill in (we can't auto-generate WCAG checklists)
- [ ] Framework example sections emitted as placeholders (recipe author adds framework code)
- [ ] Output validates with `validate-recipes`

**Effort:** L (1-2 days)
**Depends on:** US-V20.01.4.1

#### US-V20.01.5.2 — Recipe metadata input (name, description, category)

**Acceptance criteria:**
- [ ] Before download, modal asks: recipe name, one-line description, category
- [ ] Values populate the frontmatter
- [ ] Validation: name lowercase + hyphens; description non-empty

**Effort:** S (≤4 hrs)

---

### F1.6 — Share + save

#### US-V20.01.6.1 — Save canvas state to URL hash

**Acceptance criteria:**
- [ ] Every change updates URL hash (gzip + base64)
- [ ] Sharing the URL opens the same canvas state
- [ ] URL stays under 4,000 chars even for complex canvases

**Effort:** M (4-8 hrs)

#### US-V20.01.6.2 — Save to localStorage with named recipes

**Acceptance criteria:**
- [ ] "Save as…" button stores current canvas under a user-chosen name
- [ ] "Open…" lists saved recipes from localStorage
- [ ] Delete a saved recipe via right-click context menu

**Effort:** M (4-8 hrs)

#### US-V20.01.6.3 — Import existing recipe markdown

**Acceptance criteria:**
- [ ] "Import recipe…" button accepts a markdown file upload
- [ ] If markdown matches v1.0 schema, canvas state hydrates from it
- [ ] Round-trip: import a published cia recipe, edit, re-export — diff should be minimal (acceptable to lose framework examples, since maker doesn't author them)

**Effort:** L (1-2 days)

---

### F1.7 — Submission flow (community marketplace bridge)

#### US-V20.01.7.1 — "Submit to community" button

**Acceptance criteria:**
- [ ] Button generates a pre-filled GitHub PR URL to the cia repo's `roadmap/community-recipes/` folder
- [ ] PR includes the recipe markdown + a screenshot of the canvas preview
- [ ] Maintainer review + merge follows same flow as theme marketplace

**Effort:** M (4-8 hrs)
**Depends on:** v1.3 EPIC-02 (theme marketplace pattern)

## Definition of done

- [ ] All 18 stories accepted
- [ ] `/recipes/maker` lives + linked from main nav
- [ ] Drag, drop, configure, preview, export all work end-to-end
- [ ] Round-trip with at least 3 v1.x shipped recipes (import → no canvas state lost beyond framework examples)
- [ ] At least 3 community-built recipes submitted via the Maker before v2.0 RC
- [ ] CHANGELOG.md v2.0.0 entry

## Risks

- **Bundle size.** Maker is the heaviest cia page (dnd-kit, Monaco-or-similar inspector, in-browser Sass). Mitigation: code-split aggressively; lazy-load primitives library; serve via Next.js dynamic imports.
- **UX complexity.** Drag-drop visual builders have a long tail of "this is annoying" issues. Mitigation: ship a focused v1 (no nesting depth limits, no responsive preview, no fancy animations) — earn complexity by community demand.
- **Recipe round-trip lossiness.** Framework examples can't survive canvas → recipe → canvas round-trip. Mitigation: document this; maker is for AUTHORING new recipes, not editing published recipes whose framework examples matter.
- **Major-version risk.** v2.0 bump may break user expectations. Mitigation: changes are additive — no cia API changes; the bump signals scope expansion only.

## Related

- [v1.0 EPIC-01-recipes-book.md](../v1-0/EPIC-01-recipes-book.md) — recipe schema this respects
- [v1.0 EPIC-04-playground.md](../v1-0/EPIC-04-playground.md) — in-browser Sass + preview pattern shared
- [v1.3 EPIC-02-theme-marketplace.md](../v1-3/EPIC-02-theme-marketplace.md) — submission flow pattern
- [project_recipes_maker_idea.md](../../../C:/Users/jhans/.claude/projects/K--repo-css-is-awesome/memory/project_recipes_maker_idea.md) — original idea memory
