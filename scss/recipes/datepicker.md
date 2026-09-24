---
name: datepicker
description: A formatted date field with an inline calendar-grid popup, built entirely on native Date and Intl — no date library, closing one of cia's oldest queued gaps.
category: input
complexity: complex
cia-version: ">=1.11.1"
---

## Use this when

You need a date field with a visual calendar, not just typed digits —
booking a date, filtering a report by range, scheduling. Start with native
`<input type="date">` when the browser's own picker UI is good enough (it's
zero-JS, zero-recipe, keyboard- and screen-reader-accessible out of the
box, and its formatting follows the user's OS locale automatically). Reach
for this recipe when you need a **styled** calendar that matches your
theme, or a UI the native picker doesn't offer (e.g. a visible month grid
inline rather than a browser-chrome popup).

## Structure (raw HTML)

```html
<div class="my-datepicker">
  <label for="my-date-trigger" data-slot="label">Appointment date</label>
  <button
    id="my-date-trigger"
    type="button"
    data-slot="trigger"
    aria-haspopup="dialog"
    aria-expanded="false"
    aria-controls="my-date-grid"
  >
    Select a date
  </button>

  <div id="my-date-panel" data-slot="panel" hidden>
    <div data-slot="header">
      <button type="button" data-slot="prev" aria-label="Previous month">‹</button>
      <span data-slot="month-label" aria-live="polite">September 2026</span>
      <button type="button" data-slot="next" aria-label="Next month">›</button>
    </div>
    <div id="my-date-grid" data-slot="grid" role="grid" aria-labelledby="my-date-trigger">
      <div role="row" data-slot="weekdays">
        <span role="columnheader" aria-label="Sunday">S</span>
        <span role="columnheader" aria-label="Monday">M</span>
        <!-- …Tue–Sat… -->
      </div>
      <div role="row">
        <button type="button" role="gridcell" tabindex="-1" data-outside-month>31</button>
        <button type="button" role="gridcell" tabindex="0" aria-selected="false">1</button>
        <!-- …one button per day… -->
      </div>
    </div>
  </div>
</div>
```

Notes on the markup:

- The **trigger is a `<button>`, not a text input** — it displays the
  formatted selection but the user never types a date string by hand
  (avoids the whole "what format did they mean" parsing problem). If you
  need a typeable field too, pair this recipe with native
  `<input type="date">` as a fallback path rather than parsing free text.
- `aria-haspopup="dialog"` + `aria-expanded` on the trigger, `role="grid"`
  on the day grid — this is the [WAI-ARIA Date Picker Dialog
  pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).
- `data-outside-month` marks a leading/trailing day from the adjacent month
  (filling the grid to full weeks) — usually dimmed, still clickable.
- Only the currently-focusable day gets `tabindex="0"`; every other day is
  `tabindex="-1"` — the grid uses roving tabindex, not one tab-stop per cell.

## Styling (cia mixins)

```scss
@use 'css-is-awesome/api' as cia;

.my-datepicker {
  position: relative;
  display: inline-block;

  [data-slot="label"] {
    display: block;
    margin-block-end: cia.space(1);
  }

  [data-slot="trigger"] {
    @include cia.input-base;
    @include cia.button-reset;
    text-align: start;
    cursor: pointer;
  }

  [data-slot="panel"] {
    @include cia.popover-base($p: 3, $max-width: 20rem);
    position: absolute;
    inset-block-start: calc(100% + #{cia.space(1)});
    inset-inline-start: 0;
  }

  [data-slot="header"] {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-block-end: cia.space(2);

    button {
      @include cia.btn(ghost);
    }
  }

  [data-slot="grid"] {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: cia.space(1);
  }

  [data-slot="weekdays"] {
    display: contents;

    span {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
    }
  }

  [role="gridcell"] {
    @include cia.button-reset;
    aspect-ratio: 1;
    border-radius: var(--radius-full);
    cursor: pointer;
    @include cia.transition(background-color, color);

    &:hover {
      background: var(--interactive-hover);
    }
    &[data-outside-month] {
      color: var(--text-muted);
    }
    &[aria-selected="true"] {
      background: var(--action-primary-default);
      color: var(--text-inverse);
    }
  }
}
```

`popover-base` is the same mixin the [`combobox`](./combobox.md) recipe
already uses — the popup positioning here is the identical `position:
relative` wrapper + `position: absolute` panel pattern `combobox` uses for
its listbox, not a new mechanism.

## Interactivity

```js
function buildMonth(year, month) {
  // Native Date only — no date library. First day of the grid is the
  // Sunday on/before the 1st; last is the Saturday on/after the last day.
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days; // always 6 full weeks — a stable grid size, no reflow
}

const monthLabelFmt = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const dayFmt = new Intl.DateTimeFormat(undefined, { day: "numeric" });
```

- **Native:** the trigger button, the popup's open/close (a plain
  `hidden` toggle is enough; `[popover]` works too if you want light-
  dismiss and top-layer stacking for free), all date math via `Date`.
- **JS:** grid generation (above), roving-tabindex arrow-key navigation
  within the grid (Left/Right move a day, Up/Down move a week, Home/End
  jump to week start/end, PageUp/PageDown change month), and closing +
  returning focus to the trigger on Escape or a selection.
- **Locale, for free:** `Intl.DateTimeFormat` reads the browser's locale
  automatically — the month name, and which day starts the week if you
  extend this to respect `Intl.Locale().weekInfo`, need no per-locale code
  in this recipe. Deeper locale/formatting concerns (a specific display
  format, RTL calendars) belong to the i18n-recipes epic, not repeated here.
- **Edge cases:** build the 42-cell grid deterministically (always 6 weeks)
  so the popup never resizes as you navigate months — a resizing popup
  shifts focus unpredictably for a screen-reader or keyboard user
  mid-navigation.

## A11y checklist

- [ ] The day grid is `role="grid"` with `role="row"`/`role="gridcell"` —
  not a bare `<div>` soup — so a screen reader announces it as a navigable
  table structure ([WAI-ARIA APG: Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/))
- [ ] Roving `tabindex` (one `tabindex="0"`, everything else `-1"`) — a
  keyboard user tabs into the grid once, then uses arrow keys, not 42
  individual tab stops ([WAI-ARIA APG: Grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/))
- [ ] The month label is `aria-live="polite"` so navigating months is
  announced without moving focus ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] Closing the popup (Escape, or a date selection) returns focus to the
  trigger button — never leaves focus inside a now-hidden panel
  ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))

## Framework examples

### React

```tsx
"use client";
import { useState } from "react";

const monthFmt = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

function buildMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function DatePicker({ onSelect }: { onSelect: (d: Date) => void }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<Date | null>(null);
  const days = buildMonth(cursor.getFullYear(), cursor.getMonth());

  return (
    <div className="my-datepicker">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {selected ? selected.toLocaleDateString() : "Select a date"}
      </button>
      {open && (
        <div role="dialog" aria-label="Choose date">
          <div>
            <button type="button" aria-label="Previous month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>‹</button>
            <span aria-live="polite">{monthFmt.format(cursor)}</span>
            <button type="button" aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>›</button>
          </div>
          <div role="grid">
            {days.map((d) => (
              <button
                type="button"
                key={d.toISOString()}
                role="gridcell"
                data-outside-month={d.getMonth() !== cursor.getMonth() || undefined}
                aria-selected={selected?.toDateString() === d.toDateString()}
                onClick={() => {
                  setSelected(d);
                  onSelect(d);
                  setOpen(false);
                }}
              >
                {d.getDate()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="my-datepicker">
    <button type="button" :aria-expanded="open" @click="open = !open">
      {{ selected ? selected.toLocaleDateString() : "Select a date" }}
    </button>
    <div v-if="open" role="dialog" aria-label="Choose date">
      <div>
        <button type="button" @click="shiftMonth(-1)">‹</button>
        <span aria-live="polite">{{ monthFmt.format(cursor) }}</span>
        <button type="button" @click="shiftMonth(1)">›</button>
      </div>
      <div role="grid">
        <button
          v-for="d in days"
          :key="d.toISOString()"
          type="button"
          role="gridcell"
          @click="select(d)"
        >
          {{ d.getDate() }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
const monthFmt = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const open = ref(false);
const cursor = ref(new Date());
const selected = ref<Date | null>(null);
const emit = defineEmits<{ select: [Date] }>();

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
const days = computed(() => buildMonth(cursor.value.getFullYear(), cursor.value.getMonth()));
function shiftMonth(delta: number) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1);
}
function select(d: Date) {
  selected.value = d;
  emit("select", d);
  open.value = false;
}
</script>
```

### Svelte

```svelte
<script lang="ts">
  const monthFmt = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
  let open = false;
  let cursor = new Date();
  let selected: Date | null = null;

  export let onSelect: (d: Date) => void;

  function buildMonth(year: number, month: number) {
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }
  $: days = buildMonth(cursor.getFullYear(), cursor.getMonth());

  function select(d: Date) {
    selected = d;
    onSelect(d);
    open = false;
  }
</script>

<div class="my-datepicker">
  <button type="button" aria-expanded={open} on:click={() => (open = !open)}>
    {selected ? selected.toLocaleDateString() : "Select a date"}
  </button>
  {#if open}
    <div role="dialog" aria-label="Choose date">
      <span aria-live="polite">{monthFmt.format(cursor)}</span>
      <div role="grid">
        {#each days as d (d.toISOString())}
          <button type="button" role="gridcell" on:click={() => select(d)}>{d.getDate()}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>
```

### Vanilla

```html
<script type="module">
  const trigger = document.querySelector('[data-slot="trigger"]');
  const panel = document.querySelector('[data-slot="panel"]');

  trigger.addEventListener("click", () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    trigger.setAttribute("aria-expanded", String(willOpen));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    }
  });

  // See "Interactivity" above for buildMonth() + the grid-render/arrow-key
  // navigation that fills [data-slot="grid"] — omitted here for length.
</script>
```

## Pitfalls

- **Don't parse a typed date string.** "03/04/2026" is ambiguous (US vs.
  rest-of-world day/month order) — that ambiguity is exactly why this
  recipe's trigger is a button with a calendar, not a free-text field.
- **A variable-height popup shifts layout as you navigate months** (some
  months render 5 weeks, some 6). Always build the deterministic 42-cell
  grid above, even for months that only need 5 weeks — the extra
  leading/trailing days keep the panel's height constant.
- **Timezones.** `new Date(year, month, day)` constructs in the *local*
  timezone — safe for a UI calendar. If the selected date needs to travel
  to a server, serialize it explicitly (e.g. `toISOString().slice(0, 10)`)
  rather than passing the `Date` object across a JSON boundary, where it
  silently becomes a timezone-shifted string.

## Related recipes

- [`combobox`](./combobox.md) — the same relative/absolute popup
  positioning pattern, for a text-filtered option list instead of a
  calendar grid.
- [`app-shell`](./app-shell.md) — `popover-base` is a shared mixin, not new here.
