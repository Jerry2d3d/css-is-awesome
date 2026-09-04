---
name: bottom-nav
description: Mobile-app layout — a fixed bottom dock whose slots open slide-up sheets, zero JavaScript on the Popover API.
category: navigation
complexity: medium
cia-version: ">=1.5.0"
---

## Use this when

Your page is a **tool** on mobile — docs with a section tree, a dashboard, an
editor — and navigation belongs in thumb reach, app-style, instead of behind a
top hamburger. This is the layout the cia docs site itself runs on phones.
For simple site navigation (a menu of links), use the `mobile-nav` recipe's
drawer instead.

## Structure (raw HTML)

A fixed bottom dock of buttons, each pointing at its own sheet via
`popovertarget`. The browser manages open state, Esc, and light dismiss.

```html
<div data-cia-recipe="bottom-nav">
  <!-- slide-up sheets — one per dock slot -->
  <section id="nav-sheet" class="app-sheet" popover aria-label="Navigation">
    <nav data-slot="nav">…section links…</nav>
  </section>
  <section id="tools-sheet" class="app-sheet" popover aria-label="Tools">
    <div data-slot="tools">…controls…</div>
  </section>

  <!-- the dock -->
  <nav class="app-dock" aria-label="Quick menu">
    <button popovertarget="nav-sheet">Menu</button>
    <button popovertarget="tools-sheet">Tools</button>
    <a href="/search" aria-current="false">Search</a>
  </nav>
</div>
```

## Styling (cia mixins)

```scss
// AppDock.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.app-dock {
  // Hide above the mobile breakpoint — desktop has the full chrome.
  display: none;

  @include cia.media-down(lg) {
    @include cia.dock(3);        // CSS Grid: one equal track per slot
  }
}
.app-dock button,
.app-dock a {
  @include cia.dock-item;        // 56px thumb targets, ARIA-driven accent
}

.app-sheet {
  @include cia.media-down(lg) {
    @include cia.sheet;          // bottom drawer, 72dvh cap, rounded shoulders
  }
}
```

Give the page's scrollable content bottom padding so the fixed dock never
covers the last lines: `padding-block-end: calc(6rem + env(safe-area-inset-bottom))`
on the content region of your page layout.

## Interactivity

**Zero JavaScript.** Each dock button is a `popovertarget` invoker for its
sheet; the browser keeps `aria-expanded` in sync (which is what lights the
active slot via `cia.dock-item`), closes on Esc or outside tap, and stacks
the sheet in the top layer above the dock. Opening one sheet auto-closes
another (`popover="auto"` is exclusive). The slide-up animation rides
`@starting-style` and degrades to an instant open on older engines.
Popover is Baseline 2024 (Chrome 114, Firefox 125, Safari 17).

## A11y checklist

- [ ] The dock is a `<nav>` with an `aria-label`, discoverable as a landmark
      ([WAI-ARIA APG: Landmark regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/))
- [ ] Every slot is a real `<button>` (sheet openers) or `<a>` (route links)
      with a visible text label — icons alone don't name a control
      ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] `aria-expanded` reflects each sheet's state — browser-managed for
      `popovertarget` invokers; verify with an inspector
      ([WAI-ARIA APG: Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/))
- [ ] Sheets carry `aria-label`s describing their content
      ([WCAG 2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html))
- [ ] Esc closes the open sheet and focus returns to its dock button (native
      popover behavior — verify if you've added scripts)
      ([WAI-ARIA APG: Dialog (Modal) keyboard](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/))
- [ ] Slots are ≥ 44px targets; `cia.dock-item` defaults to 56px
      ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))
- [ ] Reduced motion honored — the sheet's slide disables under
      `prefers-reduced-motion` (baked into `cia.drawer`)
      ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html))

## Framework examples

### React

```jsx
export function AppDock() {
  return (
    <>
      <section id="nav-sheet" className={styles.appSheet} popover="auto" aria-label="Navigation">
        <nav>…</nav>
      </section>
      <nav className={styles.appDock} aria-label="Quick menu">
        <button popoverTarget="nav-sheet">Menu</button>
      </nav>
    </>
  );
}
// React 19 forwards popover / popoverTarget as attributes — still no JS of yours.
```

### Vue

```vue
<template>
  <section id="nav-sheet" class="app-sheet" popover aria-label="Navigation">
    <nav>…</nav>
  </section>
  <nav class="app-dock" aria-label="Quick menu">
    <button popovertarget="nav-sheet">Menu</button>
  </nav>
</template>
```

### Svelte

```svelte
<section id="nav-sheet" class="app-sheet" popover aria-label="Navigation">
  <nav>…</nav>
</section>
<nav class="app-dock" aria-label="Quick menu">
  <button popovertarget="nav-sheet">Menu</button>
</nav>
```

### Vanilla (Web Component)

```html
<!-- The pattern IS vanilla HTML — the popover attributes are the whole
     mechanism. Drop the Structure markup in as-is. -->
<script type="module">
  // Intentionally empty. Optional nicety: close the open sheet when a
  // same-page link inside it is tapped —
  // sheet.querySelectorAll('a[href^="#"]').forEach(a =>
  //   a.addEventListener('click', () => sheet.hidePopover()));
</script>
```

## Variants

- **Mixed dock**: route links (`<a aria-current="page">`) and sheet openers
  (`<button popovertarget>`) share the dock; `cia.dock-item` lights either
  via its ARIA state.
- **Two-slot / five-slot**: pass the count — `cia.dock(5)` — and the grid
  redistributes; keep it ≤5 so labels stay readable.

## Pitfalls

- **`popover` hides sheets everywhere**, including desktop. If a sheet's
  content should exist in desktop chrome instead (a sidebar, say), render it
  twice — desktop region + mobile sheet — or move the node with CSS only.
- **Padding under the dock**: forgetting the content's bottom padding hides
  the page's last lines behind the bar (see Styling).
- **Don't z-index against the sheets** — popovers live in the top layer; the
  dock's `z-index` only matters against page content.
- The dock is `position: fixed` — inside a transformed ancestor it will pin
  to that ancestor, not the viewport. Keep it at the page level.

## Related recipes

- `mobile-nav` — hamburger + drawer for plain site navigation (the "flex
  layout": one fluid shell that reshapes with the screen; this recipe is
  the "app layout").
- `dialog` — modal overlays on native `<dialog>`.
