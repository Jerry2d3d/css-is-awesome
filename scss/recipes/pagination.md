---
name: pagination
description: A keyboard-accessible pager — first/prev/next/last plus a windowed page-number range with ellipses, built on cia.pagination and cia.pagination-item, collapsing to prev / "Page 3 of 12" / next on phones.
category: navigation
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You have a list, table, or search result set that is too long for one screen and the user needs to jump between numbered pages — an admin list, a blog archive, search results. The full pattern is a `<nav>` landmark holding **first / previous / a windowed run of page numbers / next / last**, with the current page marked `aria-current="page"` and an ellipsis wherever the run collapses. If you only need prev/next and a count (an infinite feed with a fallback, a wizard), the minimal pager inside the [`data-table`](./data-table.md) recipe is enough — this recipe is for when users need to *land on page 7 directly*.

## Structure (raw HTML)

Page numbers are **links** when every page has its own URL (`?page=7` — the SEO-friendly, shareable form), and **buttons** when paging is purely client-side state. Both are shown; pick one and stay consistent.

### Link variant (each page has a URL)

```html
<nav aria-label="Pagination" data-cia-recipe="pagination" class="my-pager">
  <ul data-slot="list">
    <li><a href="?page=1" data-slot="item" aria-label="First page">«</a></li>
    <li data-slot="prev"><a href="?page=5" data-slot="item" aria-label="Previous page">‹</a></li>

    <li><a href="?page=1" data-slot="item">1</a></li>
    <li data-slot="ellipsis" aria-hidden="true">…</li>
    <li><a href="?page=5" data-slot="item">5</a></li>
    <li><a href="?page=6" data-slot="item" aria-current="page">6</a></li>
    <li><a href="?page=7" data-slot="item">7</a></li>
    <li data-slot="ellipsis" aria-hidden="true">…</li>
    <li><a href="?page=12" data-slot="item">12</a></li>

    <li data-slot="next"><a href="?page=7" data-slot="item" aria-label="Next page">›</a></li>
    <li><a href="?page=12" data-slot="item" aria-label="Last page">»</a></li>

    <li data-slot="summary" aria-live="polite">Page 6 of 12</li>
  </ul>
</nav>
```

On the first page, "First" and "Previous" are disabled. A link cannot take the `disabled` attribute, so it becomes `aria-disabled="true"` + `tabindex="-1"` and drops its `href`:

```html
<li><a data-slot="item" aria-label="First page" aria-disabled="true" tabindex="-1">«</a></li>
```

### Button variant (client-side state)

```html
<nav aria-label="Pagination" data-cia-recipe="pagination" class="my-pager">
  <ul data-slot="list">
    <li><button type="button" data-slot="item" aria-label="First page" disabled>«</button></li>
    <li data-slot="prev"><button type="button" data-slot="item" aria-label="Previous page" disabled>‹</button></li>
    <li><button type="button" data-slot="item" aria-current="page">1</button></li>
    <li><button type="button" data-slot="item">2</button></li>
    <li><button type="button" data-slot="item">3</button></li>
    <li data-slot="ellipsis" aria-hidden="true">…</li>
    <li><button type="button" data-slot="item">12</button></li>
    <li data-slot="next"><button type="button" data-slot="item" aria-label="Next page">›</button></li>
    <li><button type="button" data-slot="item" aria-label="Last page">»</button></li>
    <li data-slot="summary" aria-live="polite">Page 1 of 12</li>
  </ul>
</nav>
```

Notes on the markup:

- `<nav aria-label="Pagination">` is a **landmark** — screen-reader users can jump straight to it from a landmark list. If a page has two pagers (top and bottom of a table), give them distinct labels ("Pagination, top" / "Pagination, bottom") or the landmark list shows two identical entries.
- The list is a real `<ul>`, so assistive tech announces "list, 12 items" (11 controls plus the summary) and the user knows how many controls there are before tabbing through them.
- The arrow controls use `aria-label` because "«" has no accessible name. Page-number controls need nothing extra — "6" is their name, and `aria-current="page"` is what marks the active one.
- The ellipsis is `aria-hidden="true"` — it is a visual cue for "pages omitted here," not a control, so it should be neither announced nor focusable.
- `[data-slot="summary"]` is an `aria-live="polite"` region so a page change is announced once ("Page 7 of 12") without moving focus. It lives *inside* the list on purpose: on phones it becomes the visible page indicator seated between the two arrows, and flex `order` can only reseat a sibling (see Variants). A live region announces from anywhere in the DOM, so this costs nothing on desktop.

## Styling (cia mixins)

```scss
// Pager.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-pager {
  [data-slot="list"] {
    @include cia.pagination($gap: 2xs);
  }

  // Both <a> and <button> items get the same box. The mixin already styles
  // :hover, [aria-current="page"], and [disabled]; the button reset below
  // is what makes a <button> look identical to an <a>.
  [data-slot="item"] {
    @include cia.button-reset;
    @include cia.pagination-item($size: 2.25rem, $r: md);
    @include cia.focus-ring;

    // The link variant can't take `disabled` — it uses aria-disabled.
    &[aria-disabled="true"] {
      @include cia.disabled;
    }
  }

  [data-slot="ellipsis"] {
    @include cia.flex($justify: center);
    inline-size: 2.25rem;
    color: cia.color(text-muted);
    user-select: none;
  }

  // Desktop: a status line under the run of pages (a full-width flex item).
  [data-slot="summary"] {
    flex-basis: 100%;
    margin-block-start: cia.space(2);
    @include cia.font(reg, 1);
    color: cia.color(text-secondary);
  }
}
```

The two inputs worth knowing: `cia.pagination-item($size, $r)` sets the hit area (2.25rem = 36px meets the 24px minimum with room to spare; use `2.75rem` for a touch-first product) and the corner radius (`full` gives circular pills). `cia.pagination($gap)` takes any spacing-scale key.

## Interactivity

The link variant needs **zero JS** — every page is a real URL and the server renders the right `aria-current`. The button variant is a few lines of state, and the only non-trivial piece is deciding *which* page numbers to show.

**Windowing.** Show the first and last page always, plus `siblings` pages either side of the current one. Collapse any gap larger than one page into an ellipsis:

```js
// pages(current, total, siblings = 1) → [1, "…", 5, 6, 7, "…", 12]
function pages(current, total, siblings = 1) {
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const out = [1];
  if (start === 3) out.push(2);
  else if (start > 3) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end === total - 2) out.push(total - 1);
  else if (end < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}
```

A gap of exactly one page (e.g. current = 3 → `1 2 3 4 … 12`) renders that page rather than an ellipsis standing in for a single number — the ellipsis would be wider than the number it hides.

**State.** Clamp every change: `setPage(Math.min(Math.max(1, next), total))`. Disable first/prev on page 1 and next/last on the last page. Update the summary text, and `aria-live` does the announcing.

**Keyboard.** Nothing custom. Tab moves between items in DOM order; Enter/Space activates. Do **not** turn the pager into an arrow-key roving-tabindex widget — a pager is a list of links, not a toolbar, and users expect Tab to work.

**URL sync.** For the button variant in a SPA, mirror the page into the query string (`history.replaceState`) so reload and share still land on the right page — otherwise you've built a pager the back button doesn't understand.

## A11y checklist

- [ ] The pager is a `<nav>` with an `aria-label` — a named landmark ([WAI-ARIA: navigation role](https://www.w3.org/TR/wai-aria-1.2/#navigation)); two pagers on one page have distinct labels
- [ ] The active page carries `aria-current="page"` and is styled distinctly, not by colour alone — `cia.pagination-item` fills it with `action-primary` *and* inverts the text ([WCAG 2.2 SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- [ ] Arrow controls have an accessible name via `aria-label` ("Previous page"), since the glyph has none ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] Disabled controls are genuinely unreachable: `disabled` on buttons, `aria-disabled="true"` + `tabindex="-1"` + no `href` on links ([WAI-ARIA: aria-disabled](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled))
- [ ] The ellipsis is `aria-hidden="true"` and not focusable — it is decoration, not a control
- [ ] Every item is at least 24×24 CSS px — the default `$size: 2.25rem` gives 36px ([WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))
- [ ] A page change is announced via the `aria-live="polite"` summary, and focus is not moved ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] Focus is visible on every item (`cia.focus-ring`) ([WCAG 2.2 SC 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html))

## Framework examples

All four implement the button variant with the same windowing function: first/prev/next/last, `siblings = 1`, ellipses, disabled edges, live summary.

### React

```tsx
"use client";
import { useState } from "react";
import styles from "./Pager.module.scss";

function pages(current: number, total: number, siblings = 1): (number | "…")[] {
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const out: (number | "…")[] = [1];
  if (start === 3) out.push(2);
  else if (start > 3) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end === total - 2) out.push(total - 1);
  else if (end < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

export default function Pager({ total = 12, onChange }: { total?: number; onChange?: (page: number) => void }) {
  const [page, setPage] = useState(1);

  function go(next: number) {
    const clamped = Math.min(Math.max(1, next), total);
    setPage(clamped);
    onChange?.(clamped);
  }

  const atStart = page === 1;
  const atEnd = page === total;

  return (
    <nav aria-label="Pagination" className={styles.myPager}>
      <ul data-slot="list">
        <li><button type="button" data-slot="item" aria-label="First page" disabled={atStart} onClick={() => go(1)}>«</button></li>
        <li data-slot="prev"><button type="button" data-slot="item" aria-label="Previous page" disabled={atStart} onClick={() => go(page - 1)}>‹</button></li>
        {pages(page, total).map((p, i) =>
          p === "…" ? (
            <li key={`e${i}`} data-slot="ellipsis" aria-hidden="true">…</li>
          ) : (
            <li key={p}>
              <button type="button" data-slot="item" aria-current={p === page ? "page" : undefined} onClick={() => go(p)}>
                {p}
              </button>
            </li>
          ),
        )}
        <li data-slot="next"><button type="button" data-slot="item" aria-label="Next page" disabled={atEnd} onClick={() => go(page + 1)}>›</button></li>
        <li><button type="button" data-slot="item" aria-label="Last page" disabled={atEnd} onClick={() => go(total)}>»</button></li>
        <li data-slot="summary" aria-live="polite">Page {page} of {total}</li>
      </ul>
    </nav>
  );
}
```

### Vue

```vue
<script setup>
import { computed, ref } from "vue";

const props = defineProps({ total: { type: Number, default: 12 } });
const emit = defineEmits(["change"]);
const page = ref(1);

function pages(current, total, siblings = 1) {
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const out = [1];
  if (start === 3) out.push(2);
  else if (start > 3) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end === total - 2) out.push(total - 1);
  else if (end < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

const items = computed(() => pages(page.value, props.total));
const atStart = computed(() => page.value === 1);
const atEnd = computed(() => page.value === props.total);

function go(next) {
  page.value = Math.min(Math.max(1, next), props.total);
  emit("change", page.value);
}
</script>

<template>
  <nav aria-label="Pagination" class="my-pager">
    <ul data-slot="list">
      <li><button type="button" data-slot="item" aria-label="First page" :disabled="atStart" @click="go(1)">«</button></li>
      <li data-slot="prev"><button type="button" data-slot="item" aria-label="Previous page" :disabled="atStart" @click="go(page - 1)">‹</button></li>
      <template v-for="(p, i) in items" :key="p === '…' ? `e${i}` : p">
        <li v-if="p === '…'" data-slot="ellipsis" aria-hidden="true">…</li>
        <li v-else>
          <button type="button" data-slot="item" :aria-current="p === page ? 'page' : undefined" @click="go(p)">{{ p }}</button>
        </li>
      </template>
      <li data-slot="next"><button type="button" data-slot="item" aria-label="Next page" :disabled="atEnd" @click="go(page + 1)">›</button></li>
      <li><button type="button" data-slot="item" aria-label="Last page" :disabled="atEnd" @click="go(total)">»</button></li>
      <li data-slot="summary" aria-live="polite">Page {{ page }} of {{ total }}</li>
    </ul>
  </nav>
</template>
```

### Svelte

```svelte
<script>
  export let total = 12;
  export let onChange = (page) => {};

  let page = 1;

  function pages(current, total, siblings = 1) {
    const start = Math.max(2, current - siblings);
    const end = Math.min(total - 1, current + siblings);
    const out = [1];
    if (start === 3) out.push(2);
    else if (start > 3) out.push("…");
    for (let p = start; p <= end; p++) out.push(p);
    if (end === total - 2) out.push(total - 1);
    else if (end < total - 1) out.push("…");
    if (total > 1) out.push(total);
    return out;
  }

  function go(next) {
    page = Math.min(Math.max(1, next), total);
    onChange(page);
  }

  $: items = pages(page, total);
  $: atStart = page === 1;
  $: atEnd = page === total;
</script>

<nav aria-label="Pagination" class="my-pager">
  <ul data-slot="list">
    <li><button type="button" data-slot="item" aria-label="First page" disabled={atStart} on:click={() => go(1)}>«</button></li>
    <li data-slot="prev"><button type="button" data-slot="item" aria-label="Previous page" disabled={atStart} on:click={() => go(page - 1)}>‹</button></li>
    {#each items as p, i (p === "…" ? `e${i}` : p)}
      {#if p === "…"}
        <li data-slot="ellipsis" aria-hidden="true">…</li>
      {:else}
        <li>
          <button type="button" data-slot="item" aria-current={p === page ? "page" : undefined} on:click={() => go(p)}>{p}</button>
        </li>
      {/if}
    {/each}
    <li data-slot="next"><button type="button" data-slot="item" aria-label="Next page" disabled={atEnd} on:click={() => go(page + 1)}>›</button></li>
    <li><button type="button" data-slot="item" aria-label="Last page" disabled={atEnd} on:click={() => go(total)}>»</button></li>
    <li data-slot="summary" aria-live="polite">Page {page} of {total}</li>
  </ul>
</nav>
```

### Vanilla (Web Component)

```js
function pages(current, total, siblings = 1) {
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const out = [1];
  if (start === 3) out.push(2);
  else if (start > 3) out.push("…");
  for (let p = start; p <= end; p++) out.push(p);
  if (end === total - 2) out.push(total - 1);
  else if (end < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

class MyPager extends HTMLElement {
  connectedCallback() {
    this.total = Number(this.getAttribute("total") ?? 12);
    this.page = Number(this.getAttribute("page") ?? 1);
    this.className = "my-pager";
    this.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (btn && !btn.disabled) this.go(Number(btn.dataset.page));
    });
    this.render();
  }

  go(next) {
    this.page = Math.min(Math.max(1, next), this.total);
    this.render();
    this.dispatchEvent(new CustomEvent("change", { detail: this.page }));
  }

  render() {
    const { page, total } = this;
    const ctrl = (label, glyph, target, disabled, slot = "") =>
      `<li ${slot ? `data-slot="${slot}"` : ""}><button type="button" data-slot="item" aria-label="${label}" data-page="${target}" ${disabled ? "disabled" : ""}>${glyph}</button></li>`;
    const nums = pages(page, total)
      .map((p) =>
        p === "…"
          ? `<li data-slot="ellipsis" aria-hidden="true">…</li>`
          : `<li><button type="button" data-slot="item" data-page="${p}" ${p === page ? 'aria-current="page"' : ""}>${p}</button></li>`,
      )
      .join("");
    this.innerHTML = `
      <nav aria-label="Pagination">
        <ul data-slot="list">
          ${ctrl("First page", "«", 1, page === 1)}
          ${ctrl("Previous page", "‹", page - 1, page === 1, "prev")}
          ${nums}
          ${ctrl("Next page", "›", page + 1, page === total, "next")}
          ${ctrl("Last page", "»", total, page === total)}
          <li data-slot="summary" aria-live="polite">Page ${page} of ${total}</li>
        </ul>
      </nav>`;
  }
}
customElements.define("my-pager", MyPager);
```

## Variants

### Mobile: prev / "Page 3 of 12" / next

Eleven 36px targets don't fit a phone width, and a thumb doesn't need "jump to page 9" anyway. Below the `md` breakpoint hide the numbered run and the first/last jumps, and let the live summary sit *between* prev and next as the visible indicator. Pure CSS — the markup is unchanged, so the wide layout comes back on rotate without any JS:

```scss
@use 'css-is-awesome/api' as cia;

.my-pager {
  @include cia.mobile-only {
    [data-slot="list"] {
      justify-content: space-between;
      flex-wrap: nowrap;
    }

    // Keep only Previous / the summary / Next.
    li:not([data-slot="prev"]):not([data-slot="next"]):not([data-slot="summary"]) {
      display: none;
    }

    [data-slot="prev"] { order: 0; }
    [data-slot="summary"] {
      order: 1;
      flex-basis: auto;
      margin: 0;
    }
    [data-slot="next"] { order: 2; }
  }
}
```

This needs `data-slot="prev"` / `data-slot="next"` on the two arrow `<li>`s (the framework examples below carry them). The summary is already an `<li>`, so `order` can seat it between the arrows — that's the whole reason it lives inside the list.

### Pill shape and bigger targets

```scss
@use 'css-is-awesome/api' as cia;

.my-pager [data-slot="item"] {
  @include cia.pagination-item($size: 2.75rem, $r: full);
}
```

### Page-size selector

Pair the pager with a native `<select>` ("10 / 25 / 50 per page") styled with `cia.select-base`, and reset to page 1 whenever the size changes — page 7 of 12 is page 3 of 5 at the new size, and users find a silently-out-of-range page more confusing than a jump back to the start.

## Pitfalls

- **Don't hide disabled controls.** Removing "Previous" on page 1 makes the layout shift and the control positions move under the cursor. Disable it in place — `cia.pagination-item` already dims it.
- **Don't make page numbers `<span onclick>`.** They must be `<a href>` or `<button>` — anything else is unreachable by keyboard and nameless to screen readers, no matter how it's styled.
- **Don't announce with `role="alert"`.** A page change is a status, not an error; `aria-live="polite"` waits for the user to finish what they're doing. `alert` interrupts.
- **Sort, then paginate.** If the pager sits on a sortable table, apply the sort to the whole data set before slicing the page — see [`data-table`](./data-table.md). Sorting only the visible page is the single most common pager bug.
- **Server + client both rendering `aria-current`.** In an SSR framework, derive the current page from the URL on both sides so hydration doesn't briefly show page 1 as active.

## Related recipes

- [`data-table`](./data-table.md) — the minimal prev/next pager, and the sort-then-paginate rule this recipe assumes
- [`admin-dashboard-layout`](./admin-dashboard-layout.md) — where a full pager most often sits, under a filtered list
