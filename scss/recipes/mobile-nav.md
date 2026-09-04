---
name: mobile-nav
description: Hamburger button + slide-in drawer for mobile navigation — zero JavaScript, built on the native Popover API.
category: navigation
complexity: simple
cia-version: ">=1.3.0"
---

## Use this when

Your top navigation has more links than a phone screen can hold and you want
the classic hamburger-opens-a-drawer pattern without shipping any JavaScript.
This recipe is for **site/app navigation**; for content that overlays mid-page
(confirmations, forms), use the `dialog` recipe instead.

## Structure (raw HTML)

Two pieces: a real `<button>` that points at the drawer via `popovertarget`,
and the drawer itself — any element carrying the `popover` attribute.

```html
<header class="site-bar" data-cia-recipe="mobile-nav">
  <a href="/" data-slot="brand">MySite</a>

  <!-- Only visible at mobile widths (see Styling). The browser keeps
       aria-expanded on this button in sync with the popover — for free. -->
  <button class="menu-button" popovertarget="site-menu" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>

  <!-- Desktop inline nav AND the drawer content are the same list. -->
  <nav id="site-menu" class="site-menu" popover aria-label="Site menu">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/contact">Contact</a>
  </nav>
</header>
```

## Styling (cia mixins)

```scss
// SiteBar.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.site-bar {
  @include cia.navbar-base;
}

.menu-button {
  display: none; // desktop: the inline nav is visible, no burger

  @include cia.media-down(md) {
    @include cia.hamburger; // three bars; morphs to an X while expanded
  }
}

.site-menu {
  // Desktop: a plain inline nav. `popover` makes it display:none by
  // default, so opt it back in above the breakpoint.
  @include cia.media(md) {
    display: flex;
    gap: cia.space(5);
  }

  // Mobile: the same element becomes a slide-in drawer.
  @include cia.media-down(md) {
    @include cia.drawer($side: end, $size: 18rem);
    display: flex;
    flex-direction: column;
    gap: cia.space(2);
  }
}
```

Pick the drawer's edge with `$side` (`start`/`end`/`top`/`bottom` — logical,
so RTL pages mirror automatically). `$side: top, $size: auto` gives the
drop-down-sheet look instead of a side panel.

## Interactivity

**There is zero JavaScript, and nothing to wire up.** The Popover API does
all of it natively:

- Tapping the button opens/closes the drawer (`popovertarget` toggles).
- The browser maintains `aria-expanded` on the button — which is exactly what
  `cia.hamburger` keys the bars-to-X morph off.
- **Esc closes. Tapping outside closes** (light dismiss). The drawer sits in
  the top layer above everything, no z-index management.
- The slide-in animation runs on `@starting-style` + `allow-discrete`
  transitions; engines that predate those simply open instantly.

Popover is Baseline 2024 (Chrome 114, Firefox 125, Safari 17). If you must
support older engines, see the checkbox variant below.

## A11y checklist

- [ ] The trigger is a real `<button>` with an accessible name
      (`aria-label="Menu"` or visible text) — never a bare `<label>` or `<div>`
      ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] `aria-expanded` reflects open state — the browser does this for
      `popovertarget` invokers; verify with an inspector
      ([WAI-ARIA APG: Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/))
- [ ] The drawer element is a `<nav>` with `aria-label` so it's discoverable
      as a landmark
      ([WAI-ARIA APG: Landmark regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/))
- [ ] Esc closes the drawer and focus returns to the button (native popover
      behavior — verify if you've added scripts elsewhere)
      ([WAI-ARIA APG: Disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/))
- [ ] Focus is visible on the button (`cia.hamburger` routes `focus-ring`)
      and on every link inside the drawer
      ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))
- [ ] Tap target ≥ 24px minimum; `cia.hamburger` defaults to 44px
      ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))
- [ ] Reduced motion honored — both mixins disable their transitions under
      `prefers-reduced-motion`, baked in
      ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html))

## Framework examples

### React

```jsx
export function SiteBar() {
  return (
    <header className={styles.siteBar}>
      <a href="/">MySite</a>
      <button className={styles.menuButton} popoverTarget="site-menu" aria-label="Menu">
        <span /><span /><span />
      </button>
      <nav id="site-menu" className={styles.siteMenu} popover="auto" aria-label="Site menu">
        <a href="/">Home</a>
        <a href="/about">About</a>
      </nav>
    </header>
  );
}
// React 19 forwards `popover` / `popoverTarget` as attributes — still no JS of yours.
```

### Vue

```vue
<template>
  <header class="site-bar">
    <a href="/">MySite</a>
    <button class="menu-button" popovertarget="site-menu" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <nav id="site-menu" class="site-menu" popover aria-label="Site menu">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
</template>
```

### Svelte

```svelte
<header class="site-bar">
  <a href="/">MySite</a>
  <button class="menu-button" popovertarget="site-menu" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
  <nav id="site-menu" class="site-menu" popover aria-label="Site menu">
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
```

### Vanilla (Web Component)

```html
<!-- No component needed — the pattern IS vanilla HTML. Drop the Structure
     markup in as-is; the popover attributes are the whole mechanism. -->
<script type="module">
  // Intentionally empty. If you later want to close the drawer on in-page
  // link clicks (same-page anchors don't navigate), this one line is the
  // only JS the pattern can ever need:
  // document.querySelectorAll('#site-menu a').forEach(a =>
  //   a.addEventListener('click', () => document.getElementById('site-menu').hidePopover()));
</script>
```

## Variants

**Checkbox fallback (pre-popover engines).** The classic hidden-checkbox hack
— works everywhere, at the cost of weaker semantics (a `<label>` isn't a
button, there's no Esc-close, and you must manage `aria-expanded` yourself or
accept its absence):

```html
<input type="checkbox" id="menu-toggle" class="menu-check" aria-hidden="true">
<label for="menu-toggle" class="menu-button" aria-label="Menu">
  <span></span><span></span><span></span>
</label>
<nav class="site-menu" aria-label="Site menu">…</nav>
```

```scss
.menu-check { display: none; }
.menu-button { @include cia.hamburger; }
.menu-check:checked + .menu-button { @include cia.hamburger-open; }
.site-menu { display: none; }
.menu-check:checked ~ .site-menu { display: flex; }
```

`cia.hamburger-open` exists exactly for this: it is the bars-to-X morph as a
standalone mixin, so state can come from `:checked` instead of
`[aria-expanded]`.

## Pitfalls

- **`popover` hides the element everywhere**, including desktop — that's why
  the Styling section explicitly restores `display: flex` above the
  breakpoint. Forgetting this makes the desktop nav vanish.
- **Don't add `open`/`is-open` classes.** State lives in `[aria-expanded]`
  and `:popover-open`; a class-based copy will drift.
- **Don't wrap the button in the popover element** — the invoker must live
  outside the drawer or it disappears with it.
- The drawer is `position: fixed` in the top layer; giving it a `z-index` or
  a positioned ancestor does nothing (and confuses readers).

## Related recipes

- `dialog` — modal overlays for content (native `<dialog>`, same zero-JS
  philosophy).
- `combobox` — another browser-native disclosure pattern.
