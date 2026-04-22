# Epic 3: React Component Library

## Summary
React is how most consumers will actually use css-is-awesome. Today the library ships ~50 atomic SCSS mixins but only about six matching React components, most of which are docs-site one-offs rather than a proper public API. This epic delivers the missing ~25 React wrappers across atoms, molecules, overlays, data, and feedback tiers so that a React app can install the package and get real, accessible, theme-aware components out of the box — not just a stylesheet. Every component follows the same folder-per-component pattern, forwards refs, accepts `className`/`style` escape hatches, is keyboard-operable where applicable, and has a Storybook story.

## Goals
- All 25 missing components across atoms, molecules, overlays, data, and feedback tiers have React wrappers exported from the package root.
- 100% of components follow the folder-per-component layout: `ComponentName/ComponentName.tsx` + `ComponentName.module.scss` + `index.ts`.
- 100% of components use `React.forwardRef`, accept `className` and `style`, and spread remaining HTML attributes onto the root element.
- 100% of components have typed props with JSDoc on every public prop.
- 100% of components pass an axe-core smoke test in default state.
- Every component ships with at least one Storybook story (story authoring lives in Epic 5; this epic guarantees the stories exist).

## Out of scope
- Authoring or modifying the underlying SCSS mixins — see Epic 1 (Library Foundations).
- Visual regression tests, bundle-size budgets, and a11y CI wiring — see Epic 5 (Quality & Delivery).
- Storybook infrastructure, MDX docs pages, and deploy — see Epic 5 (Quality & Delivery).
- Written guide / "how to compose" documentation — see Epic 4 (Documentation Site).
- Search, TOC, and other docs-site UX — see Epic 4 (Documentation Site).

## Features

### Feature 3.1: Form atoms
The eight single-input primitives consumers need on day one: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, and `Label`. Each wraps the matching SCSS mixin (`input-base`, `textarea-base`, `select-base`, `check-base`, `radio-base`, `switch-base`, `slider-base`, `label-base`), forwards refs to the underlying native element, and is fully controllable or uncontrollable. `Switch` and `Slider` depend on new mixins being finalized in Epic 1.

#### User Stories

**US-3.1.1** — As an app developer, I want `<Input>` to behave like a native `<input>` with css-is-awesome styling applied, so that I can drop it into an existing form without rewiring my state.

**Acceptance criteria:**
- [ ] Renders `<input>` with `input-base` class applied.
- [ ] Accepts all native `<input>` props including `value`, `defaultValue`, `onChange`, `type`.
- [ ] Supports `ref` via `forwardRef` pointing at the underlying `<input>`.
- [ ] Accepts `className` and forwards to root element.
- [ ] Supports `invalid` prop that toggles the error visual state.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Has a Storybook story (see Epic 5).

**Priority:** P0
**Effort:** 1
**Role:** app developer

**US-3.1.2** — As an app developer, I want `<Textarea>` with auto-resize as an opt-in, so that multi-line inputs grow with content without my app wiring a resize observer.

**Acceptance criteria:**
- [ ] Renders `<textarea>` with `textarea-base` class.
- [ ] `autoResize` prop defaults to `false`; when `true`, height tracks content.
- [ ] Accepts all native `<textarea>` props.
- [ ] Supports `ref` via `forwardRef`.
- [ ] Accepts `className` and forwards to root element.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** app developer

**US-3.1.3** — As an app developer, I want `<Select>`, `<Checkbox>`, and `<Radio>` with consistent controlled/uncontrolled APIs, so that I can swap among them without relearning prop names.

**Acceptance criteria:**
- [ ] All three support `value`/`defaultValue`/`onChange` with identical semantics to their native counterparts.
- [ ] All three accept `className`, `style`, and forward `ref` to the underlying input.
- [ ] All three support a `disabled` state that is keyboard-non-focusable.
- [ ] `Radio` supports grouping via `name` or a `RadioGroup` wrapper (decide in design spike; either is acceptable).
- [ ] Keyboard-operable: Tab to focus, Space to toggle (Checkbox/Radio), Enter/Arrow on Select.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Each has a Storybook story.

**Priority:** P0
**Effort:** 3
**Role:** app developer

**US-3.1.4** — As an accessibility reviewer, I want `<Switch>` to announce its on/off state and be operable from the keyboard, so that screen reader users can toggle settings.

**Acceptance criteria:**
- [ ] Renders with `role="switch"` and `aria-checked` reflecting state.
- [ ] Space and Enter toggle state; focus ring visible.
- [ ] Controlled (`checked` + `onChange`) and uncontrolled (`defaultChecked`) modes both supported.
- [ ] Accepts `className` and forwards `ref`.
- [ ] Respects `prefers-reduced-motion` (no bounce animation when reduced).
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** accessibility reviewer

**US-3.1.5** — As an app developer, I want `<Slider>` with min/max/step and keyboard support, so that numeric range inputs match the rest of the form system.

**Acceptance criteria:**
- [ ] Renders native `<input type="range">` with `slider-base` class applied.
- [ ] Props: `min`, `max`, `step`, `value`, `defaultValue`, `onChange`.
- [ ] Arrow keys change value by `step`; PageUp/PageDown by `step * 10`; Home/End jump to min/max.
- [ ] Accepts `className`, `style`; forwards `ref`.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** app developer

**US-3.1.6** — As a designer integrating Figma, I want `<Label>` to be a standalone component (not just a styled tag), so that required-field indicators and helper slots are consistent across the system.

**Acceptance criteria:**
- [ ] Renders `<label>` with `label-base` class.
- [ ] `htmlFor` prop required in TypeScript; JSDoc explains it.
- [ ] `required` prop renders a visual indicator and `aria-required` hint.
- [ ] Accepts `className` and forwards `ref` to `<label>`.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** designer

---

### Feature 3.2: Feedback atoms
Small status and display primitives: `Alert`, `Badge`, `Tag`, `Progress`, `Divider`, `Spinner`, `Skeleton`, `Avatar`, `AvatarGroup`. `Skeleton` needs a new SCSS mixin designed and added in this epic (tracked here; mixin lands via Epic 1 coordination).

#### User Stories

**US-3.2.1** — As an app developer, I want `<Alert>` with status variants (`info` | `success` | `warning` | `error`) and an optional dismiss button, so that I can surface inline messages without building one from scratch.

**Acceptance criteria:**
- [ ] Requires `message` prop (or children); no other required props.
- [ ] Supports `status` prop with four variants.
- [ ] Optional `onDismiss` renders a close button; without it, no close UI.
- [ ] Renders with `role="alert"` when status is `error` or `warning`, `role="status"` otherwise.
- [ ] Accepts `className`; forwards `ref` to root.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** app developer

**US-3.2.2** — As an app developer, I want `<Badge>` and `<Tag>` as distinct but consistent components, so that I can use Badge for counts/status dots and Tag for removable labels.

**Acceptance criteria:**
- [ ] `<Badge>` requires children, supports `status` prop.
- [ ] `<Tag>` supports an optional `onRemove` that renders an "x" button when provided.
- [ ] Both accept `className`, `style`; forward `ref` to root.
- [ ] Tag's remove button is keyboard-operable (Enter/Space).
- [ ] Both have Storybook stories.

**Priority:** P0
**Effort:** 1
**Role:** app developer

**US-3.2.3** — As an app developer, I want `<Progress>` as both determinate (has `value`) and indeterminate (no `value`), so that I can use it for file uploads and unknown-duration loaders.

**Acceptance criteria:**
- [ ] When `value` is provided, renders `<progress>` with `aria-valuenow`.
- [ ] When `value` is omitted, renders an indeterminate animated bar.
- [ ] `max` prop defaults to `100`.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Respects `prefers-reduced-motion`: indeterminate animation stops or slows.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** app developer

**US-3.2.4** — As an app developer, I want `<Spinner>` as a pure visual loader, so that I don't have to embed an SVG inline every time I need one.

**Acceptance criteria:**
- [ ] Renders with `spinner` mixin applied.
- [ ] Supports a `size` prop (values aligned with sizing scale — see Epic 1).
- [ ] Includes `aria-label` (default: "Loading") overridable via prop.
- [ ] Respects `prefers-reduced-motion` (replaces spin with pulse or static state).
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** app developer

**US-3.2.5** — As an app developer, I want `<Skeleton>` to represent loading placeholders with matching shapes, so that my UI doesn't jump when data arrives.

**Acceptance criteria:**
- [ ] New SCSS mixin `skeleton-base` exists (coordinate with Epic 1).
- [ ] Component supports `variant` prop: `text` | `circle` | `rect`.
- [ ] Supports `width` and `height` props.
- [ ] Shimmer animation respects `prefers-reduced-motion`.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 3
**Role:** app developer

**US-3.2.6** — As a designer integrating Figma, I want `<Avatar>` and `<AvatarGroup>` that match the token-driven sizes, so that people rows in the app match Figma specs exactly.

**Acceptance criteria:**
- [ ] `<Avatar>` accepts `src`, `alt`, `initials` props; falls back to `avatar-placeholder` when no image.
- [ ] Alt text required when `src` is provided (TypeScript enforces).
- [ ] `<AvatarGroup>` lays out children with overlap and optional `max` (renders `+N` chip for overflow).
- [ ] Both accept `className`; forward `ref`.
- [ ] Both have Storybook stories.

**Priority:** P0
**Effort:** 3
**Role:** designer

**US-3.2.7** — As an app developer, I want `<Divider>` as a token-aware separator (horizontal or vertical), so that I don't hand-roll `border` CSS for every layout seam.

**Acceptance criteria:**
- [ ] Props: `orientation` (`horizontal` | `vertical`), `decorative` (defaults to `true`).
- [ ] Renders `<hr>` when `decorative` is `false`, `<div role="separator">` otherwise.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P0
**Effort:** 1
**Role:** app developer

---

### Feature 3.3: Form molecules
Compound form parts that hold light state or compose atoms: `FormField` (Label + Input + HelperText + ErrorMessage) and `SearchBar` (Input + Button + Icon).

#### User Stories

**US-3.3.1** — As an app developer, I want `<FormField>` to wire up label-for, helper text, and error messaging automatically, so that every form in my app is accessible without me wiring `aria-describedby` by hand.

**Acceptance criteria:**
- [ ] Composes `Label`, a form control (via `children`), `HelperText`, and `ErrorMessage`.
- [ ] Automatically generates unique IDs and links `label[for]`, `input[id]`, and `aria-describedby`.
- [ ] `error` prop renders `ErrorMessage` and adds `aria-invalid="true"` to the control.
- [ ] `helperText` prop renders helper row beneath the control.
- [ ] Accepts `className`; forwards `ref` to root wrapper.
- [ ] Works with any of the form atoms from Feature 3.1 as children.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 3
**Role:** app developer

**US-3.3.2** — As an app developer, I want `<SearchBar>` with a leading search icon and optional submit button, so that I can drop a search UI into a header without building it from atoms.

**Acceptance criteria:**
- [ ] Composes an `Input` with `Icon` slot and optional trailing `Button`.
- [ ] Emits `onSearch` on Enter and on button click (if button rendered).
- [ ] Optional `onClear` prop renders an "x" button that clears the input.
- [ ] Keyboard: Enter submits, Escape clears when `onClear` is provided.
- [ ] Accepts `className`; forwards `ref` to the underlying input.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 3
**Role:** app developer

---

### Feature 3.4: Navigation molecules
The navigation set: `Tabs` (active-tab state), `Pagination`, `Breadcrumb`, and `MenuItem` (Icon + Text + Kbd).

#### User Stories

**US-3.4.1** — As an app developer, I want `<Tabs>` to manage active-tab state but also support a controlled mode, so that I can either let it manage itself or sync it to my router.

**Acceptance criteria:**
- [ ] Supports both uncontrolled (`defaultValue`) and controlled (`value` + `onChange`) modes.
- [ ] Renders `role="tablist"` / `role="tab"` / `role="tabpanel"` with correct `aria-selected` and `aria-controls`.
- [ ] Keyboard: Arrow left/right moves focus, Home/End jump to first/last, Enter/Space activates.
- [ ] `orientation` prop supports horizontal and vertical.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Respects `prefers-reduced-motion` for any indicator animation.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 7
**Role:** app developer

**US-3.4.2** — As an app developer, I want `<Pagination>` with page count, current page, and a sensible ellipsis strategy, so that I don't have to build page-number truncation logic myself.

**Acceptance criteria:**
- [ ] Props: `totalPages`, `currentPage`, `onPageChange`, optional `siblingCount`.
- [ ] Renders prev/next buttons plus page numbers with ellipsis when truncated.
- [ ] Prev/next are disabled (and `aria-disabled`) at boundaries.
- [ ] Active page has `aria-current="page"`.
- [ ] Keyboard: Tab to each page button, Enter activates.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 3
**Role:** app developer

**US-3.4.3** — As an accessibility reviewer, I want `<Breadcrumb>` to render as a navigation landmark with an ordered list, so that screen readers announce it as breadcrumbs.

**Acceptance criteria:**
- [ ] Renders `<nav aria-label="Breadcrumb">` wrapping an `<ol>`.
- [ ] Last item has `aria-current="page"` and is not a link.
- [ ] Separator is customizable (prop) and `aria-hidden`.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 1
**Role:** accessibility reviewer

**US-3.4.4** — As an app developer, I want `<MenuItem>` as a reusable row (Icon + Text + optional Kbd shortcut), so that menus, dropdowns, and command palettes all share one visual vocabulary.

**Acceptance criteria:**
- [ ] Slots: `icon`, `children` (text), `kbd` (shortcut hint).
- [ ] Supports `disabled` state with correct `aria-disabled` and no focus.
- [ ] Renders as `<button>` by default; `as` prop allows `<a>` for link items.
- [ ] Keyboard-operable: Enter and Space activate.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 1
**Role:** app developer

---

### Feature 3.5: Overlays
Portal-based components with focus management and a11y concerns: `Modal`/`Dialog`, `Tooltip`, `Popover`, `Dropdown`, and `Accordion`.

#### User Stories

**US-3.5.1** — As an app developer, I want `<Modal>` to portal to the document body, trap focus, and close on Escape, so that I don't have to think about a11y plumbing when I add a confirmation dialog.

**Acceptance criteria:**
- [ ] Requires `open` and `onClose` props.
- [ ] Renders into a portal at `document.body`.
- [ ] Focus is trapped inside the modal while open; first focusable element receives focus on open.
- [ ] Focus returns to the trigger element on close.
- [ ] Escape key calls `onClose`.
- [ ] Clicking the backdrop calls `onClose` unless `dismissOnBackdrop={false}`.
- [ ] Body scroll is locked while open.
- [ ] `role="dialog"` with `aria-modal="true"` and `aria-labelledby` wired to a header slot.
- [ ] Sub-components `Modal.Header`, `Modal.Body`, `Modal.Footer` exported.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 7
**Role:** app developer

**US-3.5.2** — As an app developer, I want `<Tooltip>` to show on hover and focus with a small delay, so that I can annotate icon buttons without extra work.

**Acceptance criteria:**
- [ ] Wraps a single trigger child; positions relative to it.
- [ ] Supports `placement`: top | right | bottom | left (auto-flips near viewport edges).
- [ ] Shows on hover and focus; hides on blur and mouseleave; Escape also hides.
- [ ] `delay` prop defaults to a sensible value.
- [ ] Renders with `role="tooltip"` and wires `aria-describedby` on trigger.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Accepts `className`; forwards `ref` to the tooltip element.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 3
**Role:** app developer

**US-3.5.3** — As an app developer, I want `<Popover>` as a richer, clickable floating panel, so that I can put controls (not just text) in a floating UI.

**Acceptance criteria:**
- [ ] Controlled (`open` + `onOpenChange`) and uncontrolled modes.
- [ ] Portals; positioned relative to a trigger element.
- [ ] Dismisses on outside click and Escape.
- [ ] Focus moves into the popover on open, returns to trigger on close.
- [ ] `role="dialog"` with `aria-labelledby` when a title is provided.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 7
**Role:** app developer

**US-3.5.4** — As an app developer, I want `<Dropdown>` for menu patterns (not a form select), so that I have a consistent component for "open a list of actions" UI.

**Acceptance criteria:**
- [ ] Exports `Dropdown`, `Dropdown.Trigger`, `Dropdown.Menu`, `Dropdown.Item`, `Dropdown.Divider`.
- [ ] Keyboard: Arrow keys navigate items, Enter activates, Escape closes, Tab closes.
- [ ] `role="menu"` / `role="menuitem"` wired correctly.
- [ ] Closes on outside click and selection.
- [ ] Focus returns to the trigger on close.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 7
**Role:** app developer

**US-3.5.5** — As an app developer, I want `<Accordion>` with single-expand and multi-expand modes, so that FAQ pages and settings panels can reuse one component.

**Acceptance criteria:**
- [ ] `type` prop: `single` (only one open at a time) or `multiple`.
- [ ] Controlled and uncontrolled modes both supported.
- [ ] Each item uses a `<button>` header with `aria-expanded` and `aria-controls`; panel has `role="region"`.
- [ ] Keyboard: Arrow up/down moves between headers, Home/End jump, Enter/Space toggles.
- [ ] Respects `prefers-reduced-motion` (animation replaced with instant toggle).
- [ ] Accepts `className`; forwards `ref`.
- [ ] Has a Storybook story.

**Priority:** P1
**Effort:** 3
**Role:** app developer

---

### Feature 3.6: Data
`DataTable` (sort + filter + pagination) and `List` / `ListItem` for common data-display needs. `DataTable` is the single largest item in this epic and is priced accordingly.

#### User Stories

**US-3.6.1** — As an app developer, I want `<DataTable>` with column-driven config, sorting, and pagination, so that I can render a reasonable data grid without pulling in a heavy third-party table library.

**Acceptance criteria:**
- [ ] Accepts `columns` (config array) and `data` (row array).
- [ ] Column config supports `accessor`, `header`, `cell` (render fn), `sortable`.
- [ ] Click on sortable header toggles asc/desc/unsorted; indicator visible.
- [ ] Optional `pagination` prop enables built-in pagination (composed from Feature 3.4.2).
- [ ] Optional `filter` slot for rendering a search input above the table.
- [ ] Responsive: horizontal scroll on narrow viewports via `table-responsive` wrapper.
- [ ] Keyboard: Tab reaches headers and interactive cells; Enter/Space toggles sort.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Respects `prefers-reduced-motion`.
- [ ] Has a Storybook story.

**Priority:** P2
**Effort:** 13
**Role:** app developer

**US-3.6.2** — As an app developer, I want `<List>` and `<ListItem>` with an interactive variant, so that sidebar nav and settings menus use the same component.

**Acceptance criteria:**
- [ ] `<List>` renders `<ul>` by default; `as="ol"` supported.
- [ ] `<ListItem>` has an `interactive` prop that makes it focusable and adds hover/active styles.
- [ ] When interactive, renders a `<button>` inside or uses `<a>` via `as` prop.
- [ ] Keyboard-operable when interactive; respects `aria-current` for active state.
- [ ] Accepts `className`; forwards `ref`.
- [ ] Both have Storybook stories.

**Priority:** P1
**Effort:** 1
**Role:** app developer

---

### Feature 3.7: Notifications
`Toast` and `ToastProvider` — portal-based, queued, auto-dismissing messages. Requires a provider at the app root so any component can fire a toast.

#### User Stories

**US-3.7.1** — As an app developer, I want a `<ToastProvider>` at my app root and a `useToast()` hook, so that any component can trigger a notification without prop-drilling.

**Acceptance criteria:**
- [ ] `<ToastProvider>` renders a portal and holds the toast queue.
- [ ] `useToast()` returns methods: `toast.info`, `toast.success`, `toast.warning`, `toast.error`, `toast.dismiss`.
- [ ] Provider accepts `position` prop (e.g. `top-right`, `bottom-center`).
- [ ] Queue supports a configurable max visible count; extras wait.
- [ ] Has a Storybook story that wires the provider and fires toasts from a button.

**Priority:** P1
**Effort:** 7
**Role:** app developer

**US-3.7.2** — As an accessibility reviewer, I want toasts announced to screen readers and auto-dismissed with a pausable timer, so that users who hover a toast don't lose it mid-read.

**Acceptance criteria:**
- [ ] Each toast renders with `role="status"` (info/success) or `role="alert"` (warning/error).
- [ ] Auto-dismiss timer defaults to a sensible duration, overridable per-toast.
- [ ] Hovering or focusing a toast pauses its dismiss timer; leaving resumes it.
- [ ] Close button is keyboard-operable (Enter/Space) and dismisses the toast.
- [ ] Respects `prefers-reduced-motion` (slide animation replaced with fade or instant).

**Priority:** P1
**Effort:** 3
**Role:** accessibility reviewer

---

### Feature 3.8: Component API consistency
Cross-cutting requirements every component in this epic must satisfy. This feature is the umbrella "definition of done" for the public API.

#### User Stories

**US-3.8.1** — As an app developer, I want every component to expose the same escape hatches (`className`, `style`, `ref`, HTML attribute spread), so that I can override or extend any component when my app needs something unusual.

**Acceptance criteria:**
- [ ] Every component uses `React.forwardRef`.
- [ ] Every component accepts `className` and merges it onto the root element.
- [ ] Every component accepts `style` and merges it onto the root element.
- [ ] Every component spreads remaining native HTML attributes onto the root.
- [ ] A lint rule or CI check enforces the pattern (coordinate with Epic 5).

**Priority:** P0
**Effort:** 3
**Role:** app developer

**US-3.8.2** — As a Storybook author, I want every component to live in a predictable folder structure, so that I can find and import its stylesheet, type, and story without hunting.

**Acceptance criteria:**
- [ ] Every component lives in `src/components/ComponentName/`.
- [ ] Each folder contains `ComponentName.tsx`, `ComponentName.module.scss`, and `index.ts`.
- [ ] `index.ts` re-exports the component and its prop type as named exports.
- [ ] Package root `index.ts` re-exports every component.
- [ ] A CI check fails if a component does not match this pattern (coordinate with Epic 5).

**Priority:** P0
**Effort:** 1
**Role:** Storybook author

**US-3.8.3** — As a designer integrating Figma, I want every component's public prop to have a JSDoc comment, so that IntelliSense in VS Code explains what each prop does.

**Acceptance criteria:**
- [ ] Every exported prop type has JSDoc on each public field.
- [ ] JSDoc includes a one-line description and, where useful, an `@default` tag.
- [ ] `tsc --noEmit` passes with `strict: true`.

**Priority:** P0
**Effort:** 3
**Role:** designer

## Dependencies
- Blocks: Epic 4 (Documentation Site), Epic 5 (Quality & Delivery), Epic 5 (Quality & Delivery)
- Blocked by: Epic 1 (Library Foundations) — needs token coverage and the new `switch-base`, `slider-base`, `spinner`, and `skeleton-base` mixins finalized before wrappers land

## Priority
P0 (blocker for 1.0) — the React layer is the primary consumption surface; atoms are day-one blockers, molecules and overlays are 1.0 must-haves, DataTable is the single P2 that can slip to post-1.0 without blocking the release.
