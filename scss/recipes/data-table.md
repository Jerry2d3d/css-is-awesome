---
name: data-table
description: A sortable, paginated data table — click a column header to sort, with a choice between a real HTML table and a CSS Grid role="table" layout for cases a table element can't handle. Closes one of cia's oldest queued gaps.
category: data
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

You're rendering a list of records where the user needs to sort by a
column and page through results — an admin list, a report, search results.
This recipe covers the **core pattern**: sortable columns, a stable sort
state, and pagination. It does not cover every feature a full data-grid
library has (column resizing, drag-to-reorder, cell editing, virtualized
scrolling) — reach for a library when you genuinely need those; most lists
don't.

Two layout choices, same data model:

- **`<table>`** (the default below) — use this whenever you can. Real table
  semantics, free screen-reader table navigation, no JavaScript needed for
  the layout itself.
- **CSS Grid with `role="table"`** — reach for this only when a real
  `<table>` can't do what you need (sticky/pinned columns with independent
  horizontal scroll regions, or row virtualization where absolute
  positioning inside a grid is easier than inside a table). It needs
  explicit `role="table"`/`role="row"`/`role="columnheader"`/`role="cell"`
  to stay screen-reader-navigable as a table, since a `<div>` grid has none
  of that semantics for free.

## Structure (raw HTML)

```html
<div class="my-table-wrap">
  <table class="my-table">
    <caption class="cia-sr-only">Team members</caption>
    <thead>
      <tr>
        <th scope="col" aria-sort="none">
          <button type="button" data-slot="sort" data-key="name">Name</button>
        </th>
        <th scope="col" aria-sort="ascending">
          <button type="button" data-slot="sort" data-key="role">Role</button>
        </th>
        <th scope="col" aria-sort="none">
          <button type="button" data-slot="sort" data-key="joined">Joined</button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ada Lovelace</td>
        <td>Engineer</td>
        <td>2024-03-01</td>
      </tr>
      <!-- …more rows… -->
    </tbody>
  </table>
</div>

<nav aria-label="Pagination" class="my-table-pager">
  <button type="button" data-slot="prev" aria-label="Previous page">‹</button>
  <span aria-live="polite">Page 1 of 4</span>
  <button type="button" data-slot="next" aria-label="Next page">›</button>
</nav>
```

Notes on the markup:

- **The sort control is a `<button>` inside the `<th>`, not the `<th>`
  itself made clickable** — a bare clickable table header has no keyboard
  affordance and no accessible name distinct from the column label.
- **`aria-sort` lives on the `<th>`**, not the button — it's the column
  header's state, and it's how a screen reader announces "Role, column,
  sorted ascending."
- The pager here is intentionally minimal (prev/next + a page count) — a
  fuller pager with numbered pages and first/last jumps is its own future
  recipe; this is the smallest viable version so the table recipe isn't
  blocked on it.

## Styling (cia mixins)

```scss
@use 'css-is-awesome/api' as cia;

.my-table-wrap {
  @include cia.table-responsive; // horizontal scroll on narrow viewports
}

.my-table {
  @include cia.table-base($striped: true, $hover: true);

  th {
    padding: 0; // the button below owns the padding, so its hit target
                // fills the whole header cell, not just the text

    [data-slot="sort"] {
      @include cia.button-reset;
      display: flex;
      align-items: center;
      gap: cia.space(1);
      width: 100%;
      padding: cia.space(2) cia.space(4);
      cursor: pointer;
      text-align: start;
      @include cia.font(semibold, 1);
      color: var(--text-secondary);
      text-transform: uppercase;

      &::after {
        content: "↕";
        opacity: 0.4;
      }
    }

    &[aria-sort="ascending"] [data-slot="sort"]::after {
      content: "↑";
      opacity: 1;
    }
    &[aria-sort="descending"] [data-slot="sort"]::after {
      content: "↓";
      opacity: 1;
    }
  }
}

.my-table-pager {
  display: flex;
  align-items: center;
  gap: cia.space(3);
  margin-block-start: cia.space(4);

  button {
    @include cia.btn(ghost);
  }
}
```

`table-base`'s `$striped`/`$hover` flags are the only styling decisions
this recipe adds — the sort-indicator and pager are new, small, and built
from `button-reset`/`btn`/tokens already in every other recipe in this book.

## Interactivity

```js
type SortState = { key: string; direction: "asc" | "desc" } | null;

function nextSortState(current, key) {
  if (!current || current.key !== key) return { key, direction: "asc" };
  if (current.direction === "asc") return { key, direction: "desc" };
  return null; // third click clears the sort — back to original order
}

function sortRows(rows, sort) {
  if (!sort) return rows;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => (a[sort.key] > b[sort.key] ? dir : a[sort.key] < b[sort.key] ? -dir : 0));
}
```

- **Native:** the table itself, its row/cell rendering — no JS needed for
  the layout.
- **JS:** the sort-state cycle (unsorted → ascending → descending →
  unsorted, not a two-way toggle — losing the ability to get back to the
  original order is a common, avoidable annoyance) and re-rendering
  `aria-sort` on the active `<th>`.
- **Pagination:** slice the sorted array by page — sort *then* paginate,
  never the reverse, or page 2 shows the wrong rows the moment a sort is
  applied.
- **Edge cases:** clearing a sort (the third click) should return rows to
  their *original* order, which means keeping an unsorted copy of the data
  around — sorting in place and trying to "unsort" by reversing twice loses
  the original order the moment any row is added or removed.

## A11y checklist

- [ ] `aria-sort` is set on the `<th>` (`"none"` | `"ascending"` |
  `"descending"`), reflecting current state — not just a visual arrow icon
  ([WAI-ARIA: aria-sort](https://www.w3.org/TR/wai-aria-1.2/#aria-sort))
- [ ] The sort control is a real `<button>`, reachable and activatable by
  keyboard alone ([WCAG 2.2 SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
- [ ] The table has a `<caption>` (visually hidden via `cia.sr-only` if a
  visible one is redundant with a page heading) — a screen reader user
  landing on the table needs to know what it's a table *of*
  ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] The pager's current-page text is in an `aria-live="polite"` region so
  a sort/page change is announced without moving focus
  ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))

## Framework examples

### React

```tsx
"use client";
import { useMemo, useState } from "react";

type Row = { id: string; name: string; role: string; joined: string };
type Sort = { key: keyof Row; direction: "asc" | "desc" } | null;

export function DataTable({ rows }: { rows: Row[] }) {
  const [sort, setSort] = useState<Sort>(null);

  function toggleSort(key: keyof Row) {
    setSort((s) => (!s || s.key !== key ? { key, direction: "asc" } : s.direction === "asc" ? { key, direction: "desc" } : null));
  }

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const dir = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (a[sort.key] > b[sort.key] ? dir : a[sort.key] < b[sort.key] ? -dir : 0));
  }, [rows, sort]);

  const ariaSort = (key: keyof Row) => (sort?.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none");

  return (
    <table>
      <caption className="cia-sr-only">Team members</caption>
      <thead>
        <tr>
          {(["name", "role", "joined"] as const).map((key) => (
            <th key={key} scope="col" aria-sort={ariaSort(key)}>
              <button type="button" onClick={() => toggleSort(key)}>
                {key}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => (
          <tr key={r.id}>
            <td>{r.name}</td>
            <td>{r.role}</td>
            <td>{r.joined}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Vue

```vue
<template>
  <table>
    <caption class="cia-sr-only">Team members</caption>
    <thead>
      <tr>
        <th v-for="key in keys" :key="key" scope="col" :aria-sort="ariaSort(key)">
          <button type="button" @click="toggleSort(key)">{{ key }}</button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in sorted" :key="r.id">
        <td>{{ r.name }}</td>
        <td>{{ r.role }}</td>
        <td>{{ r.joined }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
type Row = { id: string; name: string; role: string; joined: string };
const props = defineProps<{ rows: Row[] }>();
const keys = ["name", "role", "joined"] as const;
const sort = ref<{ key: (typeof keys)[number]; direction: "asc" | "desc" } | null>(null);

function toggleSort(key: (typeof keys)[number]) {
  const s = sort.value;
  sort.value = !s || s.key !== key ? { key, direction: "asc" } : s.direction === "asc" ? { key, direction: "desc" } : null;
}
function ariaSort(key: string) {
  if (sort.value?.key !== key) return "none";
  return sort.value.direction === "asc" ? "ascending" : "descending";
}
const sorted = computed(() => {
  if (!sort.value) return props.rows;
  const { key, direction } = sort.value;
  const dir = direction === "asc" ? 1 : -1;
  return [...props.rows].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
});
</script>
```

### Svelte

```svelte
<script lang="ts">
  type Row = { id: string; name: string; role: string; joined: string };
  export let rows: Row[];
  const keys = ["name", "role", "joined"] as const;
  let sort: { key: (typeof keys)[number]; direction: "asc" | "desc" } | null = null;

  function toggleSort(key: (typeof keys)[number]) {
    sort = !sort || sort.key !== key ? { key, direction: "asc" } : sort.direction === "asc" ? { key, direction: "desc" } : null;
  }
  function ariaSort(key: string) {
    if (sort?.key !== key) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  }
  $: sorted = (() => {
    if (!sort) return rows;
    const { key, direction } = sort;
    const dir = direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
  })();
</script>

<table>
  <caption class="cia-sr-only">Team members</caption>
  <thead>
    <tr>
      {#each keys as key}
        <th scope="col" aria-sort={ariaSort(key)}>
          <button type="button" on:click={() => toggleSort(key)}>{key}</button>
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each sorted as r (r.id)}
      <tr>
        <td>{r.name}</td>
        <td>{r.role}</td>
        <td>{r.joined}</td>
      </tr>
    {/each}
  </tbody>
</table>
```

### Vanilla

```html
<script type="module">
  let sort = null; // { key, direction } | null

  function toggleSort(key) {
    sort = !sort || sort.key !== key ? { key, direction: "asc" } : sort.direction === "asc" ? { key, direction: "desc" } : null;
    render();
  }

  function render() {
    document.querySelectorAll("[data-slot='sort']").forEach((btn) => {
      const th = btn.closest("th");
      const key = btn.dataset.key;
      th.setAttribute("aria-sort", sort?.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none");
    });
    // …re-render <tbody> from the sorted array…
  }

  document.querySelectorAll("[data-slot='sort']").forEach((btn) => {
    btn.addEventListener("click", () => toggleSort(btn.dataset.key));
  });
</script>
```

## Pitfalls

- **A two-way sort toggle loses the "back to original order" state.**
  Cycle through three states (asc → desc → none), not two, or a user who
  overshoots the sort they wanted has no way back except reloading.
- **Sorting strings and numbers with the same comparator silently breaks
  numeric columns** — `"10" < "9"` is true as strings. If a column's values
  are numeric, sort numerically, not with the generic `>`/`<` comparator
  shown above (which is fine for strings and ISO dates, not for raw numbers).
- **Don't reach for CSS Grid `role="table"` by default.** It needs every
  ARIA role hand-applied to stay a table to assistive tech, where a real
  `<table>` gets that for free. Only reach for it when a real table
  genuinely can't do what you need (see **Use this when**).

## Related recipes

- [`app-shell`](./app-shell.md) — a toolbar row (filters, search, actions)
  commonly sits above a table like this one.
