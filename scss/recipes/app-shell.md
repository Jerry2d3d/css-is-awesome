---
name: app-shell
description: The structural skeleton most apps need on day one — a top navbar, a sidebar-and-content control panel, and a footer — assembled from cia's existing layout mixins, with a settings modal wired in via the dialog recipe.
category: layout
complexity: simple
cia-version: ">=1.11.1"
---

## Use this when

You're starting a new page or app and need the outer skeleton before any of
the actual product goes in it: a top navbar, a place for primary navigation
+ the main work area (a "control panel" — a settings screen, an admin
panel, a dashboard), and a footer. None of this is new mixins — it's
`navbar-base`, `sidebar`, `toolbar`, and `cluster`, mixins that already
exist, composed once so you don't have to figure out the composition
yourself. Where a piece already has its own recipe with real interactive
code (a modal), this recipe links to it instead of repeating it — see
[`dialog`](./dialog.md).

## Structure (raw HTML)

```html
<div class="app-shell">
  <header class="app-navbar">
    <a class="app-navbar-brand" href="/">Acme</a>
    <nav>
      <ul class="app-navbar-nav">
        <li><a class="app-navbar-link" href="#" aria-current="page">Dashboard</a></li>
        <li><a class="app-navbar-link" href="#">Reports</a></li>
        <li><a class="app-navbar-link" href="#">Team</a></li>
      </ul>
    </nav>
  </header>

  <div class="app-panel">
    <aside data-slot="side">
      <nav aria-label="Section">
        <ul class="app-side-nav">
          <li><a href="#" aria-current="page">Overview</a></li>
          <li><a href="#">Billing</a></li>
          <li><a href="#">Members</a></li>
        </ul>
      </nav>
    </aside>

    <main data-slot="content">
      <div class="app-toolbar">
        <h1>Overview</h1>
        <span data-slot="trailing">
          <button class="app-settings-btn">Settings</button>
        </span>
      </div>
      <p>The main work area — whatever the page actually does goes here.</p>
    </main>
  </div>

  <footer class="app-footer">
    <span>&copy; 2026 Acme Inc.</span>
    <nav>
      <a href="#">Docs</a>
      <a href="#">Support</a>
      <a href="#">Status</a>
    </nav>
  </footer>
</div>
```

The settings button opens a real `<dialog>` — see **Related recipes** below
for the markup; it's not repeated here on purpose.

## Styling (cia mixins)

```scss
@use 'css-is-awesome/api' as cia;

.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

// Top navbar — sticky, themed background, a bottom hairline.
.app-navbar {
  @include cia.navbar-base($sticky: true);
}
.app-navbar-brand {
  @include cia.navbar-brand;
}
.app-navbar-nav {
  @include cia.navbar-nav;
}
.app-navbar-link {
  @include cia.navbar-link;

  &[aria-current="page"] {
    color: var(--text-primary);
    background: var(--action-primary-wash);
  }
}

// The control panel — a side nav + main content area. `sidebar` is a
// wrapping flex pair, not a fixed grid, so it degrades to a single column
// on narrow viewports for free (side stacks above content).
.app-panel {
  @include cia.sidebar($side-width: 14rem);
  flex: 1; // fills remaining height below the navbar, above the footer
  padding: cia.space(4);
}
.app-side-nav {
  @include cia.stack($gap: 1);
  list-style: none;
  margin: 0;
  padding: 0;

  a {
    display: block;
    padding: cia.space(2) cia.space(3);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    text-decoration: none;

    &[aria-current="page"] {
      color: var(--text-primary);
      background: var(--surface-subtle);
    }
    &:hover {
      background: var(--interactive-hover);
    }
  }
}

// The toolbar inside the content area — same mixin the dialog recipe uses
// for its header/footer, reused here for a page-title + trailing-action row.
.app-toolbar {
  @include cia.toolbar;
  margin-block-end: cia.space(4);

  h1 {
    margin: 0;
  }

  [data-slot="trailing"] button {
    @include cia.btn(outline);
  }
}

// Footer — a wrapping cluster with the two groups pushed to opposite ends.
.app-footer {
  @include cia.cluster($justify: space-between);
  padding: cia.space(4) cia.space(6);
  border-block-start: 1px solid var(--border-default);
  color: var(--text-muted);
  font-size: 0.875rem;

  nav {
    @include cia.cluster($gap: 4);
  }
  a {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--text-primary);
    }
  }
}
```

Nothing here is a new mixin — `navbar-base`/`navbar-brand`/`navbar-nav`/
`navbar-link`, `sidebar`, `stack`, `toolbar`, and `cluster` all already
ship. This recipe is the composition, not new primitives.

## Interactivity

**Zero JS for the shell itself.** The navbar, sidebar/content split, and
footer are pure CSS layout — nothing here needs a script. `sidebar`'s
wrapping flex pair reflows to a single column automatically on a narrow
viewport (no media query, no JS breakpoint check) because `[data-slot='side']`
and `[data-slot='content']` both have `flex-grow`, not a fixed width — the
side pane just wraps below the content once there isn't room for its
`$side-width` alongside a reasonable content column.

The one interactive piece — the Settings button opening a modal — is
**exactly the [`dialog` recipe](./dialog.md)'s own interactivity section**:
`dialogEl.showModal()` on click, native `<dialog>` handles focus trap +
Esc + backdrop. Wire the button's click handler to call `showModal()` on
whichever `<dialog>` you've built from that recipe; there's no new pattern
to learn here.

## A11y checklist

- [ ] The current page's nav link (both navbar and side nav) carries
  `aria-current="page"` — sighted users see it from the active-state
  styling, but a screen reader needs the attribute to know which item is
  current ([WCAG 2.2 SC 2.4.8 Location](https://www.w3.org/WAI/WCAG22/Understanding/location.html))
- [ ] The side nav is wrapped in a `<nav aria-label="…">` distinct from the
  top navbar's own `<nav>` — two unlabeled `<nav>` landmarks on one page are
  indistinguishable to assistive tech ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] The footer is a real `<footer>` element (a landmark), not a `<div>` —
  screen reader users jump between landmarks as a primary navigation method
  ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] The Settings button's modal follows the [`dialog` recipe](./dialog.md)'s
  own a11y checklist in full (`aria-labelledby`, focus trap, Esc, focus
  return) — this recipe doesn't repeat those items, it inherits them

## Framework examples

The shell is static structure — no state, no props beyond page content —
so every framework's version is the same markup in that framework's
template syntax. Only React is shown in full; the others are the identical
structure, framework-native.

### React

```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="app-navbar">
        <a className="app-navbar-brand" href="/">Acme</a>
        <nav>
          <ul className="app-navbar-nav">
            <li><a className="app-navbar-link" href="/" aria-current="page">Dashboard</a></li>
            <li><a className="app-navbar-link" href="/reports">Reports</a></li>
          </ul>
        </nav>
      </header>

      <div className="app-panel">
        <aside data-slot="side">
          <nav aria-label="Section">
            <ul className="app-side-nav">
              <li><a href="/" aria-current="page">Overview</a></li>
              <li><a href="/billing">Billing</a></li>
            </ul>
          </nav>
        </aside>
        <main data-slot="content">{children}</main>
      </div>

      <footer className="app-footer">
        <span>&copy; 2026 Acme Inc.</span>
        <nav>
          <a href="/docs">Docs</a>
          <a href="/support">Support</a>
        </nav>
      </footer>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="app-shell">
    <header class="app-navbar">
      <a class="app-navbar-brand" href="/">Acme</a>
      <nav>
        <ul class="app-navbar-nav">
          <li><a class="app-navbar-link" href="/" aria-current="page">Dashboard</a></li>
        </ul>
      </nav>
    </header>
    <div class="app-panel">
      <aside data-slot="side">
        <nav aria-label="Section">
          <ul class="app-side-nav">
            <li><a href="/" aria-current="page">Overview</a></li>
          </ul>
        </nav>
      </aside>
      <main data-slot="content"><slot /></main>
    </div>
    <footer class="app-footer">
      <span>&copy; 2026 Acme Inc.</span>
      <nav><a href="/docs">Docs</a></nav>
    </footer>
  </div>
</template>
```

### Svelte

```svelte
<div class="app-shell">
  <header class="app-navbar">
    <a class="app-navbar-brand" href="/">Acme</a>
    <nav>
      <ul class="app-navbar-nav">
        <li><a class="app-navbar-link" href="/" aria-current="page">Dashboard</a></li>
      </ul>
    </nav>
  </header>
  <div class="app-panel">
    <aside data-slot="side">
      <nav aria-label="Section">
        <ul class="app-side-nav">
          <li><a href="/" aria-current="page">Overview</a></li>
        </ul>
      </nav>
    </aside>
    <main data-slot="content"><slot /></main>
  </div>
  <footer class="app-footer">
    <span>&copy; 2026 Acme Inc.</span>
    <nav><a href="/docs">Docs</a></nav>
  </footer>
</div>
```

### Vanilla

```html
<!-- See "Structure (raw HTML)" above — that markup, dropped straight into
     a page with the "Styling" block loaded, IS the complete vanilla
     implementation. No wrapper component needed for static structure. -->
```

## Pitfalls

- **Don't reach for a CSS grid framework's breakpoint system.** `sidebar`'s
  reflow is a natural consequence of `flex-wrap` + `flex-grow`, not a media
  query — adding your own breakpoint on top usually fights it rather than
  improving it.
- **The side nav and the top navbar both need their own `aria-label`** if
  you have more than one `<nav>` landmark (this shell always does) — an
  unlabeled second `<nav>` is invisible-by-confusion to a screen reader
  user navigating by landmark.
- **Don't duplicate the dialog recipe's markup here.** If you change how
  your modal works, you only want one place to update it — this recipe's
  Settings button is intentionally a pointer to `dialog.md`, not a copy.

## Related recipes

- [`dialog`](./dialog.md) — the Settings button's modal; full markup, styling, and a11y checklist live there.
- [`mobile-nav`](./mobile-nav.md) — this recipe's navbar is desktop-first; pair it with mobile-nav's hamburger/drawer pattern for small viewports.
