# Epic 3: Gremlin UI — Companion React Component Library

> **Name TBD.** Working candidates: "Gremlin UI", "Components are Awesome", "Gremlin Components". Final name is an open question — see bottom of file.

## Summary
On 2026-05-03 the React component layer was split out of css-is-awesome into a separate product. css-is-awesome remains a pure styling system (SCSS mixins, tokens, themes, CSS bundle). Gremlin UI is a sibling npm package that **depends on css-is-awesome** for theming and ships React wrappers around the same component vocabulary. The 34 components currently sitting in `K:/repo/css-is-awesome/src/components/` (briefly bundled on `feat/v0.7-port-fixes`, now reverted before v0.7 ships) are the seed inventory. Gremlin UI v0.1 ships the 17 components the boilerplate (`boiler-project-ai`) is ready to consume; future versions absorb the rest. Consumers will write `import { Avatar } from '@gremlin/ui'` (or whatever the final scope is) and pair it with any css-is-awesome theme. Boilerplate is the first downstream consumer; their feedback drives v0.1 → v1.0.

## Goals
- Ship Gremlin UI v0.1 to npm with the 17 boilerplate-requested components exported from the package root.
- Package `peerDependencies` lock to `css-is-awesome ^1.0.0` and `react >=18`.
- Every shipped component renders correctly under every official css-is-awesome theme without code changes (proven by a cross-product theme matrix test).
- Repo location, final product name, and documentation home are decided **before** v0.1 tag (open questions tracked below).
- SemVer policy published in the new repo's README before first publish: 0.x = pre-1.0 churn, 1.0 = API freeze gated on css-is-awesome 1.0.
- Migration path for the 34 existing components in `css-is-awesome/src/components/` is documented and executed (move / copy / archive — open question).

## Out of scope
- Shipping any React component from inside the css-is-awesome npm package. css-is-awesome's `package.json` exports must contain zero React surface.
- Modifying css-is-awesome's `src/`, `dist/`, `exports`, or `peerDependencies` to accommodate React. Coordination with css-is-awesome happens via tokens and mixins only.
- Authoring or modifying SCSS mixins, tokens, or themes — owned by Epic 1 and Epic 2 inside css-is-awesome.
- Visual regression, a11y CI wiring, bundle budgets — Gremlin UI will adopt patterns from css-is-awesome's Epic 5 but stand up its own pipeline.
- Boilerplate's own larger versions of Button, Checkbox, DataTable, Dropdown, Input, Radio, Switch, Textarea, Modal, Accordion, Alert, Skeleton, Toast — those stay in `boiler-project-ai` and are not duplicated in Gremlin UI v0.1.

## Features

### Feature 3.1: Repo and package shape
The first decision before any code moves: where Gremlin UI lives, how it builds, and how it depends on css-is-awesome. Build pipeline is likely tsup (the toolchain that briefly worked on `feat/v0.7-port-fixes`); package layout is the standard `dist/` + `src/` with a single root entry that re-exports every component.

#### User Stories

**US-3.1.1** — As a maintainer, I want a decision recorded for repo structure (own repo vs. monorepo with css-is-awesome vs. subfolder of `boiler-project-ai`), so that I can stop fielding "where does this live" questions and start moving code.

**Acceptance criteria:**
- [ ] ADR or roadmap note captures the three options with tradeoffs (release cadence coupling, CI complexity, contributor ergonomics, npm scope ownership).
- [ ] One option is selected and committed in writing.
- [ ] The chosen home has an empty repo / folder initialized with `package.json`, `tsconfig.json`, and `README.md` stubs.
- [ ] css-is-awesome's `package.json` is unchanged by the decision.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

**US-3.1.2** — As a maintainer, I want a tsup-based build pipeline producing ESM + CJS + types, so that downstream apps (boilerplate first) can import Gremlin UI without bundler-specific plumbing.

**Acceptance criteria:**
- [ ] `tsup` (or whatever survives the v0.7 revert) configured to output `dist/index.js`, `dist/index.cjs`, and `dist/index.d.ts`.
- [ ] `package.json` declares `main`, `module`, `types`, and `exports` fields correctly.
- [ ] `peerDependencies` lists `css-is-awesome` and `react` with documented version ranges.
- [ ] `npm pack` produces a tarball under 200 KB (excluding `node_modules`).
- [ ] A smoke `import { Button } from '@gremlin/ui'` resolves cleanly in a fresh Vite + React app.

**Priority:** P2
**Effort:** 3
**Role:** maintainer

**US-3.1.3** — As a release manager, I want a published SemVer policy for Gremlin UI, so that downstream consumers (boilerplate) know what 0.x → 1.0 means and when to pin.

**Acceptance criteria:**
- [ ] README contains a SemVer section: 0.x is unstable; minor bumps may break.
- [ ] Section explicitly states 1.0 cannot ship until css-is-awesome is at 1.0.
- [ ] Compatibility table maps Gremlin UI versions to css-is-awesome version ranges.
- [ ] CHANGELOG.md initialized with v0.1 entry.

**Priority:** P2
**Effort:** 1
**Role:** release manager

---

### Feature 3.2: v0.1 component inventory (the 17 boilerplate wants)
Gremlin UI v0.1 ships exactly the 17 components the boilerplate has flagged as "ready to lift": `Avatar`, `Pagination`, `Tabs`, `Tooltip`, `SearchBar`, `List`, `FormField`, `Label`, `Select`, `Slider`, `Divider`, `MenuItem`, `Popover`, `Progress`, `Tag`, `ThemePicker`, `StatChip`. Each must forward refs, accept `className`/`style`, spread remaining HTML attributes, and render correctly under any css-is-awesome theme. Acceptance criteria carried forward from the previous version of this epic apply here, reframed as Gremlin UI work.

#### User Stories

**US-3.2.1** — As an app developer, I want `<Tabs>` to manage active-tab state but also support a controlled mode, so that I can either let it manage itself or sync it to my router.

**Acceptance criteria:**
- [ ] Supports both uncontrolled (`defaultValue`) and controlled (`value` + `onChange`) modes.
- [ ] Renders `role="tablist"` / `role="tab"` / `role="tabpanel"` with correct `aria-selected` and `aria-controls`.
- [ ] Keyboard: Arrow left/right moves focus, Home/End jump to first/last, Enter/Space activates.
- [ ] `orientation` prop supports horizontal and vertical.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Respects `prefers-reduced-motion`.

**Priority:** P2
**Effort:** 7
**Role:** app developer

**US-3.2.2** — As an app developer, I want `<Pagination>` with page count, current page, and a sensible ellipsis strategy, so that I don't have to build page-number truncation logic myself.

**Acceptance criteria:**
- [ ] Props: `totalPages`, `currentPage`, `onPageChange`, optional `siblingCount`.
- [ ] Renders prev/next buttons plus page numbers with ellipsis when truncated.
- [ ] Prev/next are disabled (and `aria-disabled`) at boundaries.
- [ ] Active page has `aria-current="page"`.
- [ ] Keyboard: Tab to each page button, Enter activates.
- [ ] Accepts `className`; forwards `ref`.

**Priority:** P2
**Effort:** 3
**Role:** app developer

**US-3.2.3** — As an app developer, I want `<Tooltip>` and `<Popover>` as portal-based, accessible floating UIs, so that I can annotate icon buttons (Tooltip) and host clickable controls (Popover) with consistent focus and dismiss behavior.

**Acceptance criteria:**
- [ ] Tooltip wraps a single trigger; supports `placement` with auto-flip; shows on hover and focus; `role="tooltip"` with `aria-describedby` on trigger; respects `prefers-reduced-motion`.
- [ ] Popover supports controlled and uncontrolled modes; portals; dismisses on outside click and Escape; focus moves into popover on open and back to trigger on close; `role="dialog"` with `aria-labelledby` when titled.
- [ ] Both forward `ref` and accept `className`.

**Priority:** P2
**Effort:** 9
**Role:** app developer

**US-3.2.4** — As a designer integrating Figma, I want `<Avatar>`, `<Tag>`, `<StatChip>`, `<Divider>`, and `<Progress>` as the small-display set, so that data rows and dashboards match Figma without per-component CSS work.

**Acceptance criteria:**
- [ ] `Avatar` accepts `src`, `alt`, `initials`; alt required when `src` provided.
- [ ] `Tag` supports optional `onRemove` rendering an "x" button (keyboard-operable).
- [ ] `StatChip` renders label + value with status variants; spec carried from boilerplate.
- [ ] `Divider` props `orientation` and `decorative` (renders `<hr>` or `<div role="separator">`).
- [ ] `Progress` supports determinate (`value` provided) and indeterminate (no `value`); `prefers-reduced-motion` respected.
- [ ] All forward `ref` and accept `className`/`style`.

**Priority:** P2
**Effort:** 7
**Role:** designer

**US-3.2.5** — As an app developer, I want `<FormField>`, `<Label>`, `<Select>`, `<Slider>`, `<SearchBar>`, `<MenuItem>`, and `<List>` as the form-and-nav set, so that boilerplate's smaller form scaffolding moves over without rewrites.

**Acceptance criteria:**
- [ ] `FormField` composes Label + control + HelperText + ErrorMessage; auto-wires unique IDs and `aria-describedby`; `error` toggles `aria-invalid="true"`.
- [ ] `Label` requires `htmlFor`; `required` prop renders visual indicator and `aria-required` hint.
- [ ] `Select` follows native `<select>` API (`value`/`defaultValue`/`onChange`); keyboard-operable.
- [ ] `Slider` is `<input type="range">` with min/max/step; arrow keys, PageUp/Down, Home/End all wired.
- [ ] `SearchBar` composes Input + optional Button + Icon; emits `onSearch` on Enter / button click; optional `onClear` with Escape support.
- [ ] `MenuItem` slots `icon` / children / `kbd`; renders `<button>` by default, `<a>` via `as`.
- [ ] `List` renders `<ul>` (or `<ol>` via `as`); `ListItem` has `interactive` for focusable rows with `aria-current`.
- [ ] All forward `ref` and accept `className`/`style`.

**Priority:** P2
**Effort:** 13
**Role:** app developer

**US-3.2.6** — As an app developer, I want `<ThemePicker>` to expose css-is-awesome theme switching as a drop-in component, so that downstream apps don't reimplement theme selection UI.

**Acceptance criteria:**
- [ ] Reads available themes from a prop (`themes` array) — does not assume a global registry.
- [ ] Controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) modes.
- [ ] Switching a theme is the consumer's responsibility (the component emits change events; it does not mutate `<html data-theme>` itself unless `manageDocument` prop is `true`).
- [ ] Forwards `ref` and accepts `className`.
- [ ] Documented as "works with any theme registered via css-is-awesome's theme contract".

**Priority:** P2
**Effort:** 3
**Role:** app developer

---

### Feature 3.3: Future-additions watchlist
The 12 components boilerplate has flagged but not yet lifted: `Container`, `Flex`, `Grid`, `Stack`, `Heading`, `Text`, `Link`, `CodeBlock`, `ThemeToggle`, `Stepper`, `PageHeader`, `HealthBadge`. These are not in v0.1 but are tracked here so v0.2/v0.3 planning has a starting list.

#### User Stories

**US-3.3.1** — As a maintainer, I want a tracked watchlist of future Gremlin UI components, so that v0.1 scope stays honest and v0.2 has a queue.

**Acceptance criteria:**
- [ ] README or BACKLOG.md in the Gremlin UI repo lists all 12 candidates.
- [ ] Each entry has a one-line note: source (boilerplate / new), rough complexity, and any dependency on css-is-awesome work.
- [ ] List is reviewed when boilerplate signals a new lift candidate.

**Priority:** P2
**Effort:** 1
**Role:** maintainer

---

### Feature 3.4: Migration of the existing 34 components
The 34 components currently in `css-is-awesome/src/components/` are the seed. Decide whether they move (deleted from css-is-awesome on transfer), get copied (live in both places temporarily), or stay in css-is-awesome but get re-exported. The decision affects css-is-awesome's eventual `src/` cleanup and whether docs site components reuse Gremlin UI.

#### User Stories

**US-3.4.1** — As a maintainer, I want a documented migration plan for the 34 components, so that there is one source of truth for each component and no drift across repos.

**Acceptance criteria:**
- [ ] Migration plan written (move / copy-then-deprecate / dual-home) with rationale.
- [ ] Each of the 34 components labeled with target: "v0.1 of Gremlin UI", "future Gremlin UI", "stays in css-is-awesome (docs-only)", or "delete".
- [ ] css-is-awesome's docs site rendering does not break during the migration (docs-only components keep working).
- [ ] css-is-awesome's `package.json` exports field is audited to confirm no React surface leaks post-migration.

**Priority:** P2
**Effort:** 5
**Role:** maintainer

**US-3.4.2** — As a contributor, I want a one-page guide explaining how a Gremlin UI component is structured, so that I can add a new component or port one from boilerplate without guessing.

**Acceptance criteria:**
- [ ] Guide covers folder layout: `ComponentName/ComponentName.tsx` + `.module.scss` + `index.ts`.
- [ ] Guide enforces `forwardRef`, `className`/`style` pass-through, HTML attribute spread, JSDoc on every public prop.
- [ ] Guide shows how to consume css-is-awesome mixins from inside a Gremlin UI component's SCSS module.
- [ ] Linked from the Gremlin UI README.

**Priority:** P2
**Effort:** 3
**Role:** contributor

---

### Feature 3.5: Cross-product compatibility
The hard contract: any Gremlin UI version in its supported range must work with any css-is-awesome version in its supported range, under any official theme, without consumer code changes. This feature defines and enforces that contract.

#### User Stories

**US-3.5.1** — As a CI system, I want a cross-product version matrix test, so that a Gremlin UI release cannot ship if it breaks against a supported css-is-awesome version.

**Acceptance criteria:**
- [ ] CI job mounts each Gremlin UI component into a fixture app paired with each supported css-is-awesome version.
- [ ] Matrix runs on every PR and on a nightly schedule.
- [ ] Failing matrix blocks publish.
- [ ] Compatibility ranges in `peerDependencies` are sourced from this matrix, not guessed.

**Priority:** P2
**Effort:** 7
**Role:** CI system

**US-3.5.2** — As a theme author, I want every Gremlin UI component to render correctly under every official css-is-awesome theme without code changes, so that adding a new theme to css-is-awesome doesn't require Gremlin UI updates.

**Acceptance criteria:**
- [ ] Storybook (or equivalent) test harness loops every component through every official theme and screenshots / asserts no broken layout.
- [ ] A new theme added in css-is-awesome triggers the harness on the next Gremlin UI CI run.
- [ ] Documented invariant in Gremlin UI README: "If a theme breaks a component, that's a Gremlin UI bug, not a theme bug."

**Priority:** P2
**Effort:** 7
**Role:** theme author

---

### Feature 3.6: Component API consistency
The umbrella "definition of done" for every component shipped from Gremlin UI. Carried forward from the original Epic 3 with the surface relocated to the new package.

#### User Stories

**US-3.6.1** — As an app developer, I want every Gremlin UI component to expose the same escape hatches (`className`, `style`, `ref`, HTML attribute spread), so that I can override or extend any component when my app needs something unusual.

**Acceptance criteria:**
- [ ] Every component uses `React.forwardRef`.
- [ ] Every component accepts `className` and merges it onto the root element.
- [ ] Every component accepts `style` and merges it onto the root element.
- [ ] Every component spreads remaining native HTML attributes onto the root.
- [ ] A lint rule or CI check enforces the pattern.

**Priority:** P2
**Effort:** 3
**Role:** app developer

**US-3.6.2** — As a contributor, I want every component to live in a predictable folder structure, so that I can find and import its stylesheet, type, and index without hunting.

**Acceptance criteria:**
- [ ] Every component lives in `src/components/ComponentName/`.
- [ ] Each folder contains `ComponentName.tsx`, `ComponentName.module.scss`, and `index.ts`.
- [ ] `index.ts` re-exports the component and its prop type as named exports.
- [ ] Package root `index.ts` re-exports every component.
- [ ] CI fails if a component doesn't match the pattern.

**Priority:** P2
**Effort:** 1
**Role:** contributor

**US-3.6.3** — As an AI assistant, I want every public prop to have a JSDoc comment, so that IntelliSense and generated docs explain what each prop does.

**Acceptance criteria:**
- [ ] Every exported prop type has JSDoc on each public field.
- [ ] JSDoc includes a one-line description and `@default` where useful.
- [ ] `tsc --noEmit` passes with `strict: true`.

**Priority:** P2
**Effort:** 3
**Role:** AI assistant

---

### Feature 3.7: Documentation home
Where Gremlin UI documentation lives. Two viable options: a separate docs site (own URL, own deploy) or a `/components` route on the css-is-awesome docs site (one place to learn the whole stack). Tradeoffs documented in open questions.

#### User Stories

**US-3.7.1** — As a new user, I want a single discoverable place for Gremlin UI docs, so that I can read the API and copy examples without bouncing between repos.

**Acceptance criteria:**
- [ ] Decision recorded: own docs site vs. `/components` route on css-is-awesome's docs.
- [ ] Chosen home has at minimum: install + setup, theme integration, per-component API page, and a "what's the difference between css-is-awesome and Gremlin UI" explainer.
- [ ] README in the Gremlin UI repo links to the docs home.
- [ ] css-is-awesome's main README cross-links to Gremlin UI ("Looking for React components? See Gremlin UI").

**Priority:** P2
**Effort:** 5
**Role:** new user

---

## Dependencies
- **Blocked by:** css-is-awesome 1.0 stable (token contract, theme contract, mixin API frozen). Gremlin UI cannot ship 1.0 against a moving css-is-awesome target.
- **Blocked by:** open questions resolved (name, repo home, docs home, migration plan).
- **Blocks:** boilerplate's component cleanup (boilerplate cannot delete its 17 lift candidates until Gremlin UI v0.1 is on npm).

## Priority
P2 (post-css-is-awesome-1.0). The entire epic is post-1.0 work. css-is-awesome ships 1.0 as a styling-only system with zero React surface; Gremlin UI follows.

---

## Open questions

### Q1 — Final product name
- **Options:** "Gremlin UI", "Components are Awesome", "Gremlin Components", or other.
- **Tradeoffs:** "Components are Awesome" parallels "css-is-awesome" branding; "Gremlin UI" is shorter and ownable as a separate identity; "Gremlin Components" is descriptive but verbose.
- **Decision needed before:** repo init (US-3.1.1).
- **Owner:** founder.

### Q2 — Repo structure
- **Options:**
  1. **Own repo** (e.g. `gremlin-ui` on GitHub). Pros: independent release cadence, cleanest separation. Cons: two repos to maintain, cross-cutting changes need two PRs.
  2. **Monorepo with css-is-awesome** (pnpm workspaces or similar). Pros: atomic changes that touch both products, shared tooling. Cons: release coupling pressure, larger CI surface, contributors must learn the monorepo.
  3. **Subfolder of `boiler-project-ai`**. Pros: zero new repo, fastest start. Cons: ties Gremlin UI's identity to boilerplate, harder to spin out later, awkward for non-boilerplate consumers.
- **Decision needed before:** US-3.1.1.
- **Owner:** founder.

### Q3 — Documentation home
- **Options:**
  1. **Own docs site** (e.g. `gremlin-ui.dev`). Pros: clean separation, independent IA. Cons: another site to deploy and maintain.
  2. **`/components` route on the css-is-awesome docs site.** Pros: one place to learn the whole stack, shared search and theming. Cons: muddies the css-is-awesome docs identity, makes Gremlin UI feel like a sub-feature rather than a sibling product.
- **Decision needed before:** US-3.7.1.
- **Owner:** founder.

### Q4 — When does work officially start?
Event-triggered, not date-triggered. Both conditions must be true:
1. css-is-awesome 1.0 has shipped (token, theme, and mixin contracts frozen).
2. Boilerplate (`boiler-project-ai`) is using ≥10 components from `css-is-awesome/src/components/` in production, validating that the seed inventory is real-world battle-tested.

Until both are true, Gremlin UI stays a planning artifact.
