---
name: breadcrumb
description: An accessible "where am I" trail — a labelled <nav> wrapping an ordered list, the current page marked with aria-current, separators drawn by CSS and never read aloud.
category: navigation
complexity: simple
cia-version: ">=1.0.0"
---

## Use this when

You need to show a page's position in a hierarchy — docs sections, admin screens, category → subcategory → product — and let the user jump back up any level. Build it as `<nav aria-label="Breadcrumb">` around an `<ol>`: the list order **is** the hierarchy, so assistive tech announces "list, 4 items" and the nav landmark is discoverable by name. If your pages have no real hierarchy (a flat marketing site, a wizard's step indicator) this is the wrong pattern — a wizard wants the `multi-step-wizard` stepper, and flat sites want plain links.

## Structure (raw HTML)

```html
<nav aria-label="Breadcrumb" data-cia-recipe="breadcrumb">
  <ol class="my-breadcrumb" data-slot="list">
    <li><a href="/">Home</a></li>
    <li><a href="/docs">Docs</a></li>
    <li><a href="/docs/recipes">Recipes</a></li>
    <li><span aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>
```

Notes on the markup:

- The wrapper is a `<nav>` with a **name**. `aria-label="Breadcrumb"` is what lets a screen-reader user jump straight to it from the landmarks list, and distinguishes it from the site's primary `<nav>`.
- The trail is an **ordered** list — `<ol>`, not `<ul>` — because order carries meaning here (ancestor before descendant).
- The last item is the page the user is on. It is `aria-current="page"` and **not a link**: a `<span>` (or an `<a>` with no `href`). A self-link is a dead click and a confusing "link, current page" announcement.
- **No separator elements.** The `›` between items is drawn by CSS (`li + li::before`, provided by the mixin), so it never enters the accessibility tree — no `<span aria-hidden="true">/</span>` between every pair.

## Styling (cia mixins)

The whole pattern is one existing mixin. `cia.breadcrumb` resets the list, lays the items out in a row, draws the separator with `::before` on every item after the first, styles links, and mutes the `[aria-current="page"]` item. Customise it through its **inputs** — the separator glyph and the gap — rather than by writing CSS around it.

```scss
// MyBreadcrumb.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-breadcrumb {
  @include cia.breadcrumb($gap: 1, $separator: "›");
}
```

That is the entire recipe for the base case. Two inputs are all you should ever need to touch:

| Input | Default | What it does |
|---|---|---|
| `$separator` | `"/"` | The glyph rendered in `li + li::before` — `"›"`, `"→"`, `"/"`, `"\\"`. It is CSS `content`, so it is never announced. |
| `$gap` | `1` | Spacing-scale step on both sides of the separator. |

A long trail on a narrow screen should wrap rather than overflow. The mixin is a plain flex row; add `flex-wrap` via `cia.cluster` on the same selector when your trails can get deep:

```scss
@use 'css-is-awesome/api' as cia;

.my-breadcrumb {
  @include cia.breadcrumb($separator: "›");
  @include cia.cluster($gap: 1); // adds flex-wrap so deep trails wrap onto a second line
}
```

## Interactivity

**Zero JS.** The base breadcrumb is links and one `aria-current` attribute; the browser and the router do the rest. Two things the *consumer* owns:

- **Marking the current item.** Whatever renders the trail must put `aria-current="page"` on the last item and render it without an `href`. In a framework this is a one-line conditional on "is this the last crumb" (every example below does exactly that).
- **The collapsed variant (optional).** Deep trails (5+ levels) collapse the middle into a single `…` **button**. Pressing it swaps the ellipsis for the hidden crumbs. That is a boolean toggle — one `useState` / `ref` / class field — and the ellipsis must be a real `<button>` with `aria-expanded`, not a clickable `<span>`. See [Variants](#variants).

Edge cases:

- **SSR / static export:** everything above renders correctly server-side; there is no client-only state in the base pattern. The collapsed variant renders collapsed on the server and stays collapsed until the user expands it.
- **Single-level pages:** a trail with only "Home › Current" is still valid. A trail with only the current page is noise — render nothing.
- **Routing frameworks:** swap `<a href>` for your router's link component (`next/link`, `RouterLink`, SvelteKit `<a>` works as-is). The current item stays a `<span>` regardless.

## A11y checklist

- [ ] The trail is wrapped in a `<nav>` with an accessible name (`aria-label="Breadcrumb"`), so it is a distinct, findable landmark ([APG Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/))
- [ ] Items are inside an `<ol>` — the sequence is exposed as an ordered list, not loose inline links ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] The current page carries `aria-current="page"` and is not a link ([APG Breadcrumb Pattern — aria-current](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/))
- [ ] Separators are CSS `::before` content, so they are not announced between every crumb ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Link colour vs. muted current-item colour is not the only cue — the current item is also non-interactive (no link affordance) ([WCAG 2.2 SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- [ ] In the collapsed variant, the `…` is a `<button>` with `aria-expanded` and a name ("Show all pages"), and expanding it does not move focus away from the button ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] Every crumb link is keyboard reachable in document order and shows a visible focus ring ([WCAG 2.2 SC 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))

## Framework examples

All four examples take a `crumbs` array (`{ label, href }`), render every item but the last as a link, and mark the last as `aria-current="page"`.

### React

```tsx
import styles from "./Breadcrumb.module.scss";

type Crumb = { label: string; href: string };

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length < 2) return null;
  const last = crumbs.length - 1;

  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.myBreadcrumb}>
        {crumbs.map((crumb, i) => (
          <li key={crumb.href}>
            {i === last ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <a href={crumb.href}>{crumb.label}</a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

### Vue

```vue
<script setup>
const props = defineProps({ crumbs: { type: Array, required: true } });
</script>

<template>
  <nav v-if="crumbs.length > 1" aria-label="Breadcrumb">
    <ol class="my-breadcrumb">
      <li v-for="(crumb, i) in crumbs" :key="crumb.href">
        <span v-if="i === crumbs.length - 1" aria-current="page">{{ crumb.label }}</span>
        <a v-else :href="crumb.href">{{ crumb.label }}</a>
      </li>
    </ol>
  </nav>
</template>
```

### Svelte

```svelte
<script>
  export let crumbs = [];
</script>

{#if crumbs.length > 1}
  <nav aria-label="Breadcrumb">
    <ol class="my-breadcrumb">
      {#each crumbs as crumb, i (crumb.href)}
        <li>
          {#if i === crumbs.length - 1}
            <span aria-current="page">{crumb.label}</span>
          {:else}
            <a href={crumb.href}>{crumb.label}</a>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}
```

### Vanilla (Web Component)

```js
// <my-breadcrumb items='[{"label":"Home","href":"/"},{"label":"Docs","href":"/docs"}]'></my-breadcrumb>
class MyBreadcrumb extends HTMLElement {
  connectedCallback() {
    const crumbs = JSON.parse(this.getAttribute("items") ?? "[]");
    if (crumbs.length < 2) return;
    const last = crumbs.length - 1;

    this.innerHTML = `<nav aria-label="Breadcrumb"><ol class="my-breadcrumb">${crumbs
      .map((c, i) =>
        i === last
          ? `<li><span aria-current="page"></span></li>`
          : `<li><a></a></li>`,
      )
      .join("")}</ol></nav>`;

    // Set text via textContent / href via setAttribute so labels are never
    // interpreted as HTML.
    this.querySelectorAll("li").forEach((li, i) => {
      const el = li.firstElementChild;
      el.textContent = crumbs[i].label;
      if (i !== last) el.setAttribute("href", crumbs[i].href);
    });
  }
}
customElements.define("my-breadcrumb", MyBreadcrumb);
```

## Variants

### Collapsed middle (deep trails)

For trails deeper than ~5 levels, keep the first crumb and the last two, and fold everything between into a single `…` button. Pressing it reveals the hidden crumbs in place. The button is a normal list item, so the mixin's separator logic still applies to it.

```html
<nav aria-label="Breadcrumb" data-cia-recipe="breadcrumb">
  <ol class="my-breadcrumb">
    <li><a href="/">Home</a></li>
    <li>
      <button type="button" data-slot="expand" aria-expanded="false" aria-label="Show all pages">…</button>
    </li>
    <li><a href="/docs/recipes">Recipes</a></li>
    <li><span aria-current="page">Breadcrumb</span></li>
  </ol>
</nav>
```

```scss
@use 'css-is-awesome/api' as cia;

.my-breadcrumb {
  @include cia.breadcrumb($separator: "›");

  [data-slot="expand"] {
    @include cia.button-reset;
    cursor: pointer;
    color: cia.color(text-link);
    padding-inline: cia.space(2xs);
    border-radius: cia.radius(sm);
    @include cia.focus-ring;

    &:hover {
      background: cia.color(interactive-hover);
    }
  }
}
```

Behaviour: on click, set `aria-expanded="true"` and replace the `…` item with the hidden `<li>`s. Focus stays where it was (on the button, which is now gone — move it to the first revealed link so it isn't lost). There is no "collapse again" — once expanded, the trail is just a trail.

### Truncated labels

Long page titles blow up a single-line trail. Cap each crumb at a max width and let `cia.truncate` add the ellipsis; the full title stays available via `title` on the link.

```scss
@use 'css-is-awesome/api' as cia;

.my-breadcrumb {
  @include cia.breadcrumb($separator: "›");

  a,
  [aria-current="page"] {
    display: inline-block;
    max-inline-size: 12rem;
    @include cia.truncate;
  }
}
```

## Pitfalls

- **Don't make the current page a link to itself.** It reads as "link, Breadcrumb, current page" and clicking it does nothing useful. A `<span aria-current="page">` is correct.
- **Don't put separators in the DOM.** `<li>/</li>` or `<span aria-hidden="true">/</span>` between crumbs doubles the item count and, without `aria-hidden`, gets read aloud. The mixin's `::before` separator costs nothing and is invisible to assistive tech.
- **Don't use `<ul>`.** The hierarchy is ordered; `<ol>` says so.
- **Don't nest the breadcrumb inside the site's primary `<nav>`.** Two nav landmarks with distinct labels are the expected shape; one nav containing another confuses the landmark list.
- **Don't drop `aria-label` when there's a visible heading.** If you *do* have a visible "You are here:" heading, point at it with `aria-labelledby` instead — but there must always be a name.

## Related recipes

- [`app-shell`](./app-shell.md) — the page frame this trail typically sits at the top of
- [`admin-dashboard-layout`](./admin-dashboard-layout.md) — deep admin hierarchies are the usual home of the collapsed variant
