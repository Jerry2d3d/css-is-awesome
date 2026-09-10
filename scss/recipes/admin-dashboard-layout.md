---
name: admin-dashboard-layout
description: A CSS Grid admin skeleton — sidebar, stats header, content, optional footer — for a fixed back-office frame that should not reflow.
category: layout
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You're building a back-office or admin screen: a full-height sidebar nav, a stats-focused header, a data-dense content area, maybe a footer. This is **CSS Grid**, not the flex-based [`app-shell`](./app-shell.md) — the sidebar spans the full height as one grid column and never reflows underneath the content, which matters for an admin surface a user lives in all day and expects to stay put. `app-shell` is the better fit for a general page skeleton that should collapse to one column on narrow viewports; reach for this recipe when the sidebar shouldn't collapse, only the content should scroll.

## Structure (raw HTML)

```html
<div data-cia-recipe="admin-dashboard-layout">
  <aside data-slot="sidebar" aria-label="Admin navigation">
    <nav>
      <ul>
        <li><a href="#" aria-current="page">Overview</a></li>
        <li><a href="#">Users</a></li>
        <li><a href="#">Settings</a></li>
      </ul>
    </nav>
  </aside>

  <header data-slot="header">
    <h1>Admin Dashboard</h1>
    <dl data-slot="stats">
      <div><dt>Total users</dt><dd>1,204</dd></div>
      <div><dt>Active today</dt><dd>318</dd></div>
    </dl>
  </header>

  <main data-slot="main" id="admin-main">
    <a data-slot="skip-link" href="#admin-main">Skip to content</a>
    <!-- data-table, forms, etc. -->
  </main>

  <footer data-slot="footer">
    <span>&copy; 2026 Your Company</span>
  </footer>
</div>
```

Notes on the markup:
- `<aside>` and `<header>` (as the top nav/stats bar) always render as landmarks, even empty — an empty landmark is still discoverable by a screen reader's landmark list, which matters more for a screen the user returns to repeatedly than a marketing page would.
- The `<footer>` grid row is the one truly optional slot — omit the element and the `.noFooter` modifier class removes its row from the template rather than leaving a collapsed empty track.
- `data-slot="skip-link"` targets `#admin-main` directly (rather than the page's `<main>`, since this recipe often nests inside a larger app-shell) — visually hidden until focused, same pattern as any skip link.
- `<dl>` for the stats pairs is semantic (label/value pairs), not a styling choice — a screen reader announces each `<dt>`/`<dd>` pair together.

## Styling (cia mixins)

```scss
// AdminDashboardLayout.module.scss
@use 'css-is-awesome/api' as cia;

$sidebar-width: 15rem;

.admin-dashboard-layout {
  display: grid;
  grid-template-columns: #{$sidebar-width} 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  min-block-size: 100dvh;

  &.no-footer {
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "sidebar header"
      "sidebar main";
  }
}

[data-slot="sidebar"] {
  grid-area: sidebar;
  background: cia.color(surface-subtle);
  border-inline-end: 1px solid cia.color(border-default);
  padding: cia.space(4);

  nav ul { @include cia.stack($gap: 1); list-style: none; margin: 0; padding: 0; }
  a {
    display: block;
    padding: cia.space(2) cia.space(3);
    border-radius: cia.radius(md);
    color: cia.color(text-secondary);
    text-decoration: none;

    &[aria-current="page"] { color: cia.color(text-primary); background: cia.color(surface-default); }
    &:hover { background: cia.color(interactive-hover); }
  }
}

[data-slot="header"] {
  grid-area: header;
  @include cia.cluster($justify: space-between);
  padding: cia.space(4) cia.space(6);
  border-block-end: 1px solid cia.color(border-default);

  h1 { margin: 0; font-size: 1.25rem; }
}
[data-slot="stats"] {
  @include cia.cluster($gap: 6);
  margin: 0;

  div { text-align: end; }
  dt { @include cia.font(medium, 1); color: cia.color(text-muted); }
  dd { margin: 0; @include cia.font(semibold, 3); }
}

[data-slot="main"] {
  grid-area: main;
  padding: cia.space(6);
  overflow: auto;
}
[data-slot="skip-link"] {
  position: absolute;
  inset-inline-start: -9999px;

  &:focus {
    inset-inline-start: cia.space(4);
    inset-block-start: cia.space(4);
    z-index: 100;
  }
}

[data-slot="footer"] {
  grid-area: footer;
  padding: cia.space(3) cia.space(6);
  border-block-start: 1px solid cia.color(border-default);
  color: cia.color(text-muted);
  font-size: 0.875rem;
}
```

## Interactivity

None from this recipe itself — it's a static grid frame. Everything that moves lives in what you put inside `[data-slot="main"]`: compose [`data-table`](./data-table.md) for a sortable dataset and [`confirm-dialog`](./confirm-dialog.md)'s popover variant for per-row destructive actions, rather than re-inventing either inside this layout.

## A11y checklist

- [ ] `<aside>` and the header `<nav>`/landmark each have a distinct `aria-label` so a screen reader's landmark list can tell them apart from any other nav on the page ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] A skip-to-content link is the first focusable element and targets `[data-slot="main"]`'s id ([WCAG 2.2 SC 2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html))
- [ ] The current sidebar item carries `aria-current="page"`, not just a visual highlight
- [ ] Stats are marked up as a `<dl>` (label/value pairs), not bare `<div>`s with CSS-only visual grouping ([WAI-ARIA: Description List](https://www.w3.org/TR/wai-aria-1.2/#dl))
- [ ] `<main>` has exactly one per page — if this layout is nested inside another `<main>` (e.g. inside `app-shell`), use a non-`<main>` element with `role="region"` and a label instead

## Framework examples

### React

```tsx
import styles from "./AdminDashboardLayout.module.scss";
import type { ReactNode } from "react";

export default function AdminDashboardLayout({
  sidebar,
  stats,
  children,
  footer,
}: {
  sidebar: ReactNode;
  stats?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={`${styles.adminDashboardLayout} ${footer ? "" : styles.noFooter}`}>
      <aside className={styles.sidebar} aria-label="Admin navigation">
        {sidebar}
      </aside>

      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
        {stats && <dl className={styles.stats}>{stats}</dl>}
      </header>

      <main className={styles.main} id="admin-main">
        <a className={styles.skipLink} href="#admin-main">Skip to content</a>
        {children}
      </main>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}
```

### Vue

```vue
<script setup>
defineProps<{ hasFooter?: boolean }>();
</script>

<template>
  <div class="admin-dashboard-layout" :class="{ 'no-footer': !hasFooter }">
    <aside class="sidebar" aria-label="Admin navigation">
      <slot name="sidebar" />
    </aside>
    <header class="header">
      <h1>Admin Dashboard</h1>
      <dl class="stats"><slot name="stats" /></dl>
    </header>
    <main class="main" id="admin-main">
      <a class="skip-link" href="#admin-main">Skip to content</a>
      <slot />
    </main>
    <footer v-if="hasFooter" class="footer"><slot name="footer" /></footer>
  </div>
</template>
```

### Svelte

```svelte
<script>
  export let hasFooter = true;
</script>

<div class="admin-dashboard-layout" class:no-footer={!hasFooter}>
  <aside class="sidebar" aria-label="Admin navigation">
    <slot name="sidebar" />
  </aside>
  <header class="header">
    <h1>Admin Dashboard</h1>
    <dl class="stats"><slot name="stats" /></dl>
  </header>
  <main class="main" id="admin-main">
    <a class="skip-link" href="#admin-main">Skip to content</a>
    <slot />
  </main>
  {#if hasFooter}
    <footer class="footer"><slot name="footer" /></footer>
  {/if}
</div>
```

### Vanilla (Web Component)

```js
class AdminDashboardLayout extends HTMLElement {
  connectedCallback() {
    const hasFooter = this.hasAttribute("footer");
    this.classList.toggle("no-footer", !hasFooter);
    this.innerHTML = `
      <aside data-slot="sidebar" aria-label="Admin navigation">
        <slot name="sidebar"></slot>
      </aside>
      <header data-slot="header">
        <h1>Admin Dashboard</h1>
        <dl data-slot="stats"><slot name="stats"></slot></dl>
      </header>
      <main data-slot="main" id="admin-main">
        <a data-slot="skip-link" href="#admin-main">Skip to content</a>
        <slot></slot>
      </main>
      ${hasFooter ? '<footer data-slot="footer"><slot name="footer"></slot></footer>' : ""}
    `;
  }
}
customElements.define("admin-dashboard-layout", AdminDashboardLayout);
```

## Pitfalls

- **Don't reach for this over `app-shell` by default.** If the page should collapse to one column on a phone, or you don't have a genuine full-height sidebar requirement, `app-shell`'s flex model handles that reflow for free — this recipe's grid deliberately does not.
- **Don't skip the `.no-footer` modifier when omitting the footer.** Removing the `<footer>` element without also removing its grid row leaves a collapsed but still-templated track, which can misalign the sidebar's row-span in some browsers.

## Related recipes

- [`app-shell`](./app-shell.md) — the flex-based, reflowing alternative; use that one when the sidebar should collapse on narrow viewports
- [`data-table`](./data-table.md) — the natural content for `[data-slot="main"]`
- [`confirm-dialog`](./confirm-dialog.md) — the popover variant is the natural pairing for a per-row destructive action inside a data table on this layout
