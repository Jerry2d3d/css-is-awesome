---
name: sortable-list
description: A re-orderable list — native HTML5 drag-and-drop for the pointer, a grab/move/drop keyboard alternative on the handle, and every move announced through a live region.
category: data
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You need a list the user can reorder — priority queues, playlist tracks, form-builder fields, dashboard widgets. This recipe gives you the **structure and the cia styling** (drag handle, the insertion line, the "grabbed" state) plus a complete **native** implementation: HTML5 drag-and-drop for the pointer and a keyboard grab-move-drop loop on the handle. If you already use a drag library ([dnd-kit](https://dndkit.com/), [pragmatic-drag-and-drop](https://atlassian.design/components/pragmatic-drag-and-drop/), [Sortable.js](https://sortablejs.github.io/Sortable/)), keep the library and use only the Styling section — the `data-*` hooks are library-agnostic. If items never need reordering, bail: a plain list with `cia.list-item` is all you need.

## Structure (raw HTML)

```html
<ul class="my-sortable" data-cia-recipe="sortable-list" role="list" aria-label="Task order">
  <li data-slot="item" draggable="true" data-id="a">
    <button
      type="button"
      data-slot="handle"
      aria-label="Reorder: Write the launch post"
      aria-describedby="my-sortable-hint"
      aria-pressed="false"
    >
      <span aria-hidden="true">⠿</span>
    </button>
    <span data-slot="label">Write the launch post</span>
  </li>
  <li data-slot="item" draggable="true" data-id="b" data-drop-position="before">
    <button type="button" data-slot="handle" aria-label="Reorder: Record the demo" aria-describedby="my-sortable-hint" aria-pressed="false">
      <span aria-hidden="true">⠿</span>
    </button>
    <span data-slot="label">Record the demo</span>
  </li>
  <li data-slot="item" draggable="true" data-id="c" data-grabbed>
    <button type="button" data-slot="handle" aria-label="Reorder: Ship it" aria-describedby="my-sortable-hint" aria-pressed="true">
      <span aria-hidden="true">⠿</span>
    </button>
    <span data-slot="label">Ship it</span>
  </li>
</ul>
<p id="my-sortable-hint" hidden>Press Space to grab, arrow keys to move, Space to drop, Escape to cancel.</p>
<div data-slot="announce" aria-live="assertive" aria-atomic="true" class="my-sr-only"></div>
```

Notes on the markup:

- `role="list"` is redundant on a `<ul>` in theory but **necessary in practice** — Safari/VoiceOver drops list semantics from a `<ul>` once `list-style: none` is applied (and `cia.list-reset` applies it). The explicit role restores them.
- The **handle is a real `<button>`**, not the whole `<li>`. It is the single focusable, the single thing screen readers land on, and the single thing that carries `aria-pressed` ("grabbed"). A whole-row drag target steals text selection and makes every item a tab stop.
- `draggable="true"` sits on the `<li>` (the thing that moves), but the JS below only lets a drag start when the pointer went down on the handle, so text inside the label stays selectable.
- `aria-describedby` points at a hidden hint that spells out the keyboard loop once — read on focus, never repeated.
- Three state hooks, all attributes so the consumer keeps every class name: `data-drop-position="before|after"` on the item the pointer is hovering (draws the insertion line), `data-grabbed` on the item currently picked up by keyboard or pointer, and `aria-pressed` on the handle mirroring that grab.
- `[data-slot="announce"]` is an `aria-live="assertive"` region. It sits **outside** the list so reordering the DOM never re-mounts it (a re-mounted live region announces nothing).

## Styling (cia mixins)

```scss
// SortableList.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-sortable {
  @include cia.list-reset;
  @include cia.stack($gap: 1);

  [data-slot="item"] {
    @include cia.list-item($py: 2, $px: 2);
    position: relative;
    border: 1px solid cia.color(border-default);
    border-radius: cia.radius(md);
    background: cia.color(surface-default);
    @include cia.transition(box-shadow, opacity);

    // The insertion line: a 2px bar hugging the top or bottom edge of the
    // item the pointer is over. Drawn from an attribute the JS toggles, so
    // the consumer never has to agree on a class name with the script.
    &::before {
      content: '';
      position: absolute;
      inset-inline: 0;
      block-size: 2px;
      background: cia.color(action-primary-default);
      opacity: 0;
      pointer-events: none;
    }
    &[data-drop-position="before"]::before { inset-block-start: -3px; opacity: 1; }
    &[data-drop-position="after"]::before  { inset-block-end: -3px;   opacity: 1; }

    // Picked up (keyboard grab or pointer drag): lift it and tint the border.
    &[data-grabbed] {
      @include cia.elevation(2);
      border-color: cia.color(action-primary-default);
      opacity: 0.85;
    }
  }

  [data-slot="handle"] {
    @include cia.btn-icon($size: 2rem, $r: sm);
    cursor: grab;
    color: cia.color(text-muted);
    touch-action: none;

    &[aria-pressed="true"] { cursor: grabbing; color: cia.color(action-primary-default); }
  }

  [data-slot="label"] {
    flex: 1;
    @include cia.font(reg, 2);
  }
}

.my-sr-only { @include cia.sr-only; }
```

The handle shows a Unicode grip glyph (`⠿`) with no icon dependency. Swap it for an icon-pack glyph by replacing the `<span>` with `@include cia.svg('grip-vertical')` (folder-based icon packs) or `@include cia.fa-icon('grip-vertical')` (Font Awesome) on the handle — the `btn-icon` sizing is unchanged either way.

## Interactivity

Two input paths, one shared `move(fromIndex, toIndex)` that reorders the data and re-renders. Neither needs a library — the whole thing is ~60 lines.

**Pointer — native HTML5 drag-and-drop.**

1. `pointerdown` on the handle sets an `armed` flag. `dragstart` then fires on the **`<li>`** (the browser dispatches it on the nearest `draggable` ancestor, never on the handle), so the flag is the only reliable way to know the drag began on the grip — if it is not set, `preventDefault()` so label text stays selectable. Otherwise: remember the dragged item's index, set `data-grabbed`, and call `dataTransfer.setData('text/plain', id)` — Firefox will not start a drag without *some* data.
2. `dragover` on any item: `preventDefault()` (that is what makes it a valid drop target), then compare `event.clientY` to the item's vertical midpoint and set `data-drop-position` to `before` or `after`. Clear the attribute from every other item.
3. `drop`: read the target index and position, call `move()`, clear every attribute.
4. `dragend`: clear every attribute (fires whether or not a drop happened, so this is the reliable cleanup hook).

**Keyboard — grab / move / drop on the handle.**

| Key (handle focused) | Behavior |
|---|---|
| `Space` / `Enter` | Not grabbed → **grab** (`aria-pressed="true"`, item gets `data-grabbed`, announce "Grabbed X, position 2 of 5"). Grabbed → **drop** (announce "Dropped X at position 3 of 5"). |
| `ArrowUp` / `ArrowDown` | Grabbed → move the item one slot, keep focus on the same handle, announce "X moved to position 3 of 5". Not grabbed → move focus to the previous/next handle (plain list navigation). |
| `Home` / `End` | Grabbed → move to first/last slot. |
| `Escape` | Grabbed → **cancel**: restore the order from before the grab, drop, announce "Reorder cancelled". |
| `Tab` | Leaves the list; if something is still grabbed, treat it as a drop so nothing stays half-lifted. |

Keep focus on the **same handle element** across moves. In React/Vue/Svelte that means keying the item on its stable `id`, not its index, so the framework moves the node instead of re-creating it; in the Web Component it means moving the existing `<li>` with `insertBefore` rather than re-rendering innerHTML.

**Announcements.** Every state change writes one sentence to the `aria-live="assertive"` region — assertive, not polite, because the user just pressed a key and needs the result before the next keystroke. Write the text even when it is identical to the last message: set it to `""` and then to the sentence on the next frame, or append a zero-width change, otherwise some screen readers stay silent on repeats.

**Edge cases:**

- **SSR:** render the list in its stored order with `aria-pressed="false"` on every handle and no `data-*` state attributes — that is the correct server snapshot.
- **Touch:** HTML5 drag-and-drop does not fire on most touch browsers. `touch-action: none` on the handle stops the page from scrolling when the user tries; the keyboard path is not reachable on a phone either, so a touch-first product should add pointer-event-based dragging (or a library — see below) rather than rely on this recipe's pointer path alone. The `move()` function and the styling are reusable as-is.
- **Persisting:** `move()` is the one place order changes — call your API from there (or debounce on `drop`/keyboard-drop) rather than diffing the DOM.

### With a library

The pointer path above is deliberately minimal. If you need touch dragging, auto-scroll, or cross-list moves, bring one library and keep this recipe's markup, attributes and styling:

- **dnd-kit** (React) — `useSortable` gives you `attributes`, `listeners`, `setNodeRef` and `transform`. Spread `listeners` on the **handle**, not the item, and map `isDragging` to `data-grabbed`; dnd-kit's own `KeyboardSensor` + `sortableKeyboardCoordinates` provides the keyboard loop and announces through its `DndContext` `accessibility.announcements` prop — replace the recipe's live region with that, do not run both.

  ```tsx
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  <li ref={setNodeRef} data-slot="item" data-grabbed={isDragging || undefined}
      style={{ transform: CSS.Transform.toString(transform), transition }}>
    <button type="button" data-slot="handle" {...attributes} {...listeners} aria-label={`Reorder: ${item.label}`}>
      <span aria-hidden="true">⠿</span>
    </button>
    <span data-slot="label">{item.label}</span>
  </li>
  ```

  (The inline `style` there is dnd-kit's positional transform, a structural requirement of the library, not appearance.)

- **pragmatic-drag-and-drop** (framework-agnostic, Atlassian) — its `draggable` / `dropTargetForElements` adapters map directly onto steps 1–4 of the pointer path; its `closestEdge` hitbox helper returns the same `before|after` answer as the midpoint check.
- **Anything else** (Sortable.js, Vue Draggable, svelte-dnd-action) — bring your own. The contract is: your library sets `data-grabbed` and `data-drop-position`, the recipe's SCSS does the rest.

## A11y checklist

- [ ] The list keeps list semantics after `list-style: none` — `role="list"` is set explicitly on the `<ul>` ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Every reorder the pointer can do, the keyboard can do: grab, move up/down, drop, cancel — all from the handle button ([WCAG 2.2 SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
- [ ] Dragging is not the only way — the keyboard path is a single-pointer, no-path-based alternative ([WCAG 2.2 SC 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html))
- [ ] Each handle has an accessible name that includes the item ("Reorder: Ship it"), not six buttons all called "Reorder" ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] The grabbed state is exposed as `aria-pressed` on the handle, not only by colour/shadow; `aria-grabbed` / `aria-dropeffect` are deprecated since ARIA 1.1 and are not used ([WAI-ARIA 1.2: aria-grabbed (deprecated)](https://www.w3.org/TR/wai-aria-1.2/#aria-grabbed))
- [ ] Every grab, move, drop and cancel is announced with the item name and its new position out of the total, via an `aria-live="assertive"` region that lives outside the reordered DOM ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] The keyboard instructions are discoverable from the handle via `aria-describedby`, not only in surrounding prose ([WCAG 2.2 SC 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html))
- [ ] Focus stays on the same handle while its item moves — the user never has to re-find what they were holding ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))
- [ ] The handle is at least 24×24 CSS px — `cia.btn-icon($size: 2rem)` is 32px ([WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))
- [ ] The insertion line meets 3:1 against the surface — `action-primary-default` does in every shipped cia theme ([WCAG 2.2 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))

## Framework examples

All four implement the same spec: native HTML5 pointer drag from the handle, keyboard grab/arrow/drop/Escape on the handle, one `move()` function, one live region. Items are keyed by a stable `id`.

### React

```tsx
"use client";
import { useRef, useState } from "react";
import styles from "./SortableList.module.scss";

type Item = { id: string; label: string };

export default function SortableList({ initial, onChange }: { initial: Item[]; onChange?: (items: Item[]) => void }) {
  const [items, setItems] = useState(initial);
  const [grabbed, setGrabbed] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ id: string; pos: "before" | "after" } | null>(null);
  const [announce, setAnnounce] = useState("");
  const snapshot = useRef<Item[] | null>(null);
  const dragIndex = useRef<number | null>(null);
  const armed = useRef(false); // pointer went down on a handle

  function say(text: string) {
    setAnnounce("");
    requestAnimationFrame(() => setAnnounce(text));
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return items;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    setItems(next);
    onChange?.(next);
    return next;
  }

  // ── keyboard ──
  function onHandleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const item = items[index];
    const isGrabbed = grabbed === item.id;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!isGrabbed) {
        snapshot.current = items;
        setGrabbed(item.id);
        say(`Grabbed ${item.label}, position ${index + 1} of ${items.length}.`);
      } else {
        setGrabbed(null);
        say(`Dropped ${item.label} at position ${index + 1} of ${items.length}.`);
      }
    } else if (e.key === "Escape" && isGrabbed) {
      e.preventDefault();
      if (snapshot.current) { setItems(snapshot.current); onChange?.(snapshot.current); }
      setGrabbed(null);
      say("Reorder cancelled.");
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : e.key === "Home" ? 0 : items.length - 1;
      if (isGrabbed) {
        const next = move(index, to);
        const at = next.findIndex((i) => i.id === item.id);
        say(`${item.label} moved to position ${at + 1} of ${next.length}.`);
      } else {
        const handles = e.currentTarget.closest("ul")?.querySelectorAll<HTMLButtonElement>('[data-slot="handle"]');
        handles?.[Math.max(0, Math.min(to, items.length - 1))]?.focus();
      }
    } else if (e.key === "Tab" && isGrabbed) {
      setGrabbed(null);
      say(`Dropped ${item.label} at position ${index + 1} of ${items.length}.`);
    }
  }

  // ── pointer (HTML5 DnD) ──
  function onDragStart(e: React.DragEvent<HTMLLIElement>, index: number) {
    if (!armed.current) { e.preventDefault(); return; } // dragstart targets the <li>, so ask the flag
    dragIndex.current = index;
    e.dataTransfer.setData("text/plain", items[index].id);
    e.dataTransfer.effectAllowed = "move";
    setGrabbed(items[index].id);
  }
  function onDragOver(e: React.DragEvent<HTMLLIElement>, id: string) {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    setDrop({ id, pos: e.clientY < r.top + r.height / 2 ? "before" : "after" });
  }
  function onDrop(e: React.DragEvent<HTMLLIElement>, index: number) {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || !drop) return;
    let to = drop.pos === "before" ? index : index + 1;
    if (from < to) to -= 1;
    const next = move(from, to);
    say(`${items[from].label} moved to position ${to + 1} of ${next.length}.`);
    clear();
  }
  function clear() { dragIndex.current = null; armed.current = false; setGrabbed(null); setDrop(null); }

  return (
    <>
      <ul className={styles.mySortable} data-cia-recipe="sortable-list" role="list" aria-label="Task order">
        {items.map((item, index) => (
          <li
            key={item.id}
            data-slot="item"
            draggable
            data-grabbed={grabbed === item.id || undefined}
            data-drop-position={drop?.id === item.id ? drop.pos : undefined}
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => onDragOver(e, item.id)}
            onDragLeave={() => setDrop((d) => (d?.id === item.id ? null : d))}
            onDrop={(e) => onDrop(e, index)}
            onDragEnd={clear}
          >
            <button
              type="button"
              data-slot="handle"
              aria-label={`Reorder: ${item.label}`}
              aria-describedby="my-sortable-hint"
              aria-pressed={grabbed === item.id}
              onKeyDown={(e) => onHandleKeyDown(e, index)}
              onPointerDown={() => { armed.current = true; }}
              onPointerUp={() => { armed.current = false; }}
            >
              <span aria-hidden="true">⠿</span>
            </button>
            <span data-slot="label">{item.label}</span>
          </li>
        ))}
      </ul>
      <p id="my-sortable-hint" hidden>Press Space to grab, arrow keys to move, Space to drop, Escape to cancel.</p>
      <div data-slot="announce" aria-live="assertive" aria-atomic="true" className={styles.mySrOnly}>{announce}</div>
    </>
  );
}
```

### Vue

```vue
<script setup>
import { ref, nextTick } from "vue";

const props = defineProps({ initial: { type: Array, required: true } });
const emit = defineEmits(["change"]);

const items = ref([...props.initial]);
const grabbed = ref(null);
const drop = ref(null);
const announce = ref("");
let snapshot = null;
let dragIndex = null;
let armed = false; // pointer went down on a handle

async function say(text) { announce.value = ""; await nextTick(); announce.value = text; }

function move(from, to) {
  if (from === to || to < 0 || to >= items.value.length) return;
  const [it] = items.value.splice(from, 1);
  items.value.splice(to, 0, it);
  emit("change", [...items.value]);
}

function onHandleKeydown(e, index) {
  const item = items.value[index];
  const isGrabbed = grabbed.value === item.id;
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    if (!isGrabbed) { snapshot = [...items.value]; grabbed.value = item.id; say(`Grabbed ${item.label}, position ${index + 1} of ${items.value.length}.`); }
    else { grabbed.value = null; say(`Dropped ${item.label} at position ${index + 1} of ${items.value.length}.`); }
  } else if (e.key === "Escape" && isGrabbed) {
    e.preventDefault();
    if (snapshot) { items.value = snapshot; emit("change", [...snapshot]); }
    grabbed.value = null; say("Reorder cancelled.");
  } else if (["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : e.key === "Home" ? 0 : items.value.length - 1;
    if (isGrabbed) { move(index, to); const at = items.value.findIndex((i) => i.id === item.id); say(`${item.label} moved to position ${at + 1} of ${items.value.length}.`); }
    else e.currentTarget.closest("ul").querySelectorAll('[data-slot="handle"]')[Math.max(0, Math.min(to, items.value.length - 1))]?.focus();
  } else if (e.key === "Tab" && isGrabbed) {
    grabbed.value = null; say(`Dropped ${item.label} at position ${index + 1} of ${items.value.length}.`);
  }
}

function onDragStart(e, index) {
  if (!armed) { e.preventDefault(); return; } // dragstart targets the <li>, so ask the flag
  dragIndex = index;
  e.dataTransfer.setData("text/plain", items.value[index].id);
  e.dataTransfer.effectAllowed = "move";
  grabbed.value = items.value[index].id;
}
function onDragOver(e, id) {
  e.preventDefault();
  const r = e.currentTarget.getBoundingClientRect();
  drop.value = { id, pos: e.clientY < r.top + r.height / 2 ? "before" : "after" };
}
function onDrop(e, index) {
  e.preventDefault();
  if (dragIndex === null || !drop.value) return;
  let to = drop.value.pos === "before" ? index : index + 1;
  if (dragIndex < to) to -= 1;
  const label = items.value[dragIndex].label;
  move(dragIndex, to);
  say(`${label} moved to position ${to + 1} of ${items.value.length}.`);
  clear();
}
function clear() { dragIndex = null; armed = false; grabbed.value = null; drop.value = null; }
</script>

<template>
  <ul class="my-sortable" data-cia-recipe="sortable-list" role="list" aria-label="Task order">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      data-slot="item"
      draggable="true"
      :data-grabbed="grabbed === item.id ? '' : undefined"
      :data-drop-position="drop && drop.id === item.id ? drop.pos : undefined"
      @dragstart="onDragStart($event, index)"
      @dragover="onDragOver($event, item.id)"
      @dragleave="drop && drop.id === item.id && (drop = null)"
      @drop="onDrop($event, index)"
      @dragend="clear"
    >
      <button
        type="button"
        data-slot="handle"
        :aria-label="`Reorder: ${item.label}`"
        aria-describedby="my-sortable-hint"
        :aria-pressed="grabbed === item.id"
        @keydown="onHandleKeydown($event, index)"
        @pointerdown="armed = true"
        @pointerup="armed = false"
      >
        <span aria-hidden="true">⠿</span>
      </button>
      <span data-slot="label">{{ item.label }}</span>
    </li>
  </ul>
  <p id="my-sortable-hint" hidden>Press Space to grab, arrow keys to move, Space to drop, Escape to cancel.</p>
  <div data-slot="announce" aria-live="assertive" aria-atomic="true" class="my-sr-only">{{ announce }}</div>
</template>
```

### Svelte

```svelte
<script>
  import { tick } from "svelte";
  export let initial = [];
  export let onChange = (items) => {};

  let items = [...initial];
  let grabbed = null;
  let drop = null;
  let announce = "";
  let snapshot = null;
  let dragIndex = null;
  let armed = false; // pointer went down on a handle

  async function say(text) { announce = ""; await tick(); announce = text; }

  function move(from, to) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    items = next;
    onChange(items);
  }

  function onHandleKeydown(e, index) {
    const item = items[index];
    const isGrabbed = grabbed === item.id;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!isGrabbed) { snapshot = [...items]; grabbed = item.id; say(`Grabbed ${item.label}, position ${index + 1} of ${items.length}.`); }
      else { grabbed = null; say(`Dropped ${item.label} at position ${index + 1} of ${items.length}.`); }
    } else if (e.key === "Escape" && isGrabbed) {
      e.preventDefault();
      if (snapshot) { items = snapshot; onChange(items); }
      grabbed = null; say("Reorder cancelled.");
    } else if (["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : e.key === "Home" ? 0 : items.length - 1;
      if (isGrabbed) { move(index, to); const at = items.findIndex((i) => i.id === item.id); say(`${item.label} moved to position ${at + 1} of ${items.length}.`); }
      else e.currentTarget.closest("ul").querySelectorAll('[data-slot="handle"]')[Math.max(0, Math.min(to, items.length - 1))]?.focus();
    } else if (e.key === "Tab" && isGrabbed) {
      grabbed = null; say(`Dropped ${item.label} at position ${index + 1} of ${items.length}.`);
    }
  }

  function onDragStart(e, index) {
    if (!armed) { e.preventDefault(); return; } // dragstart targets the <li>, so ask the flag
    dragIndex = index;
    e.dataTransfer.setData("text/plain", items[index].id);
    e.dataTransfer.effectAllowed = "move";
    grabbed = items[index].id;
  }
  function onDragOver(e, id) {
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    drop = { id, pos: e.clientY < r.top + r.height / 2 ? "before" : "after" };
  }
  function onDrop(e, index) {
    e.preventDefault();
    if (dragIndex === null || !drop) return;
    let to = drop.pos === "before" ? index : index + 1;
    if (dragIndex < to) to -= 1;
    const label = items[dragIndex].label;
    move(dragIndex, to);
    say(`${label} moved to position ${to + 1} of ${items.length}.`);
    clear();
  }
  function clear() { dragIndex = null; armed = false; grabbed = null; drop = null; }
</script>

<ul class="my-sortable" data-cia-recipe="sortable-list" role="list" aria-label="Task order">
  {#each items as item, index (item.id)}
    <li
      data-slot="item"
      draggable="true"
      data-grabbed={grabbed === item.id ? "" : undefined}
      data-drop-position={drop && drop.id === item.id ? drop.pos : undefined}
      on:dragstart={(e) => onDragStart(e, index)}
      on:dragover={(e) => onDragOver(e, item.id)}
      on:dragleave={() => { if (drop && drop.id === item.id) drop = null; }}
      on:drop={(e) => onDrop(e, index)}
      on:dragend={clear}
    >
      <button
        type="button"
        data-slot="handle"
        aria-label={`Reorder: ${item.label}`}
        aria-describedby="my-sortable-hint"
        aria-pressed={grabbed === item.id}
        on:keydown={(e) => onHandleKeydown(e, index)}
        on:pointerdown={() => (armed = true)}
        on:pointerup={() => (armed = false)}
      >
        <span aria-hidden="true">⠿</span>
      </button>
      <span data-slot="label">{item.label}</span>
    </li>
  {/each}
</ul>
<p id="my-sortable-hint" hidden>Press Space to grab, arrow keys to move, Space to drop, Escape to cancel.</p>
<div data-slot="announce" aria-live="assertive" aria-atomic="true" class="my-sr-only">{announce}</div>
```

### Vanilla (Web Component)

Progressive enhancement: author the `<ul>` in plain HTML, wrap it in `<sortable-list>`, and the element wires up the handles it finds. Items are moved with `insertBefore`, so the focused handle is the same node before and after a move.

```js
class SortableList extends HTMLElement {
  connectedCallback() {
    this.list = this.querySelector("ul");
    this.live = this.querySelector('[data-slot="announce"]');
    this.grabbed = null;      // <li> currently held
    this.snapshot = null;     // order before a keyboard grab, for Escape
    this.dragged = null;      // <li> in an HTML5 drag
    this.armed = false;       // pointer went down on a handle

    this.list.addEventListener("pointerdown", (e) => { this.armed = !!e.target.closest('[data-slot="handle"]'); });
    this.list.addEventListener("pointerup", () => { this.armed = false; });
    this.list.addEventListener("keydown", (e) => this.onKeyDown(e));
    this.list.addEventListener("dragstart", (e) => this.onDragStart(e));
    this.list.addEventListener("dragover", (e) => this.onDragOver(e));
    this.list.addEventListener("dragleave", (e) => e.target.closest?.('[data-slot="item"]')?.removeAttribute("data-drop-position"));
    this.list.addEventListener("drop", (e) => this.onDrop(e));
    this.list.addEventListener("dragend", () => this.clear());
  }

  get items() { return [...this.list.querySelectorAll('[data-slot="item"]')]; }
  labelOf(li) { return li.querySelector('[data-slot="label"]').textContent.trim(); }
  say(text) { this.live.textContent = ""; requestAnimationFrame(() => { this.live.textContent = text; }); }

  move(li, to) {
    const items = this.items;
    const from = items.indexOf(li);
    if (to < 0 || to >= items.length || to === from) return;
    const ref = to > from ? items[to].nextSibling : items[to];
    this.list.insertBefore(li, ref);
    this.dispatchEvent(new CustomEvent("change", { detail: this.items.map((i) => i.dataset.id) }));
  }

  setGrabbed(li) {
    this.grabbed?.removeAttribute("data-grabbed");
    this.grabbed?.querySelector('[data-slot="handle"]').setAttribute("aria-pressed", "false");
    this.grabbed = li;
    if (li) { li.setAttribute("data-grabbed", ""); li.querySelector('[data-slot="handle"]').setAttribute("aria-pressed", "true"); }
  }

  onKeyDown(e) {
    const handle = e.target.closest('[data-slot="handle"]');
    if (!handle) return;
    const li = handle.closest('[data-slot="item"]');
    const items = this.items;
    const index = items.indexOf(li);
    const held = this.grabbed === li;
    const pos = () => `${this.items.indexOf(li) + 1} of ${items.length}`;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!held) { this.snapshot = items; this.setGrabbed(li); this.say(`Grabbed ${this.labelOf(li)}, position ${pos()}.`); }
      else { this.setGrabbed(null); this.say(`Dropped ${this.labelOf(li)} at position ${pos()}.`); }
    } else if (e.key === "Escape" && held) {
      e.preventDefault();
      this.snapshot?.forEach((el) => this.list.appendChild(el));
      this.setGrabbed(null);
      this.say("Reorder cancelled.");
    } else if (["ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : e.key === "Home" ? 0 : items.length - 1;
      if (held) { this.move(li, to); this.say(`${this.labelOf(li)} moved to position ${pos()}.`); }
      else items[Math.max(0, Math.min(to, items.length - 1))].querySelector('[data-slot="handle"]').focus();
    } else if (e.key === "Tab" && held) {
      this.setGrabbed(null);
      this.say(`Dropped ${this.labelOf(li)} at position ${pos()}.`);
    }
  }

  onDragStart(e) {
    const li = e.target.closest('[data-slot="item"]');
    if (!li || !this.armed) { e.preventDefault(); return; } // dragstart targets the <li>, so ask the flag
    this.dragged = li;
    e.dataTransfer.setData("text/plain", li.dataset.id ?? "");
    e.dataTransfer.effectAllowed = "move";
    this.setGrabbed(li);
  }
  onDragOver(e) {
    const li = e.target.closest('[data-slot="item"]');
    if (!li || li === this.dragged) return;
    e.preventDefault();
    const r = li.getBoundingClientRect();
    this.items.forEach((i) => i.removeAttribute("data-drop-position"));
    li.setAttribute("data-drop-position", e.clientY < r.top + r.height / 2 ? "before" : "after");
  }
  onDrop(e) {
    const li = e.target.closest('[data-slot="item"]');
    if (!li || !this.dragged) return;
    e.preventDefault();
    const items = this.items;
    let to = li.getAttribute("data-drop-position") === "before" ? items.indexOf(li) : items.indexOf(li) + 1;
    if (items.indexOf(this.dragged) < to) to -= 1;
    const label = this.labelOf(this.dragged);
    this.move(this.dragged, to);
    this.say(`${label} moved to position ${to + 1} of ${items.length}.`);
    this.clear();
  }
  clear() {
    this.items.forEach((i) => i.removeAttribute("data-drop-position"));
    this.setGrabbed(null);
    this.dragged = null;
    this.armed = false;
  }
}
customElements.define("sortable-list", SortableList);
```

```html
<sortable-list>
  <ul class="my-sortable" data-cia-recipe="sortable-list" role="list" aria-label="Task order">
    <li data-slot="item" draggable="true" data-id="a">
      <button type="button" data-slot="handle" aria-label="Reorder: Write the launch post" aria-describedby="my-sortable-hint" aria-pressed="false"><span aria-hidden="true">⠿</span></button>
      <span data-slot="label">Write the launch post</span>
    </li>
    <!-- … -->
  </ul>
  <p id="my-sortable-hint" hidden>Press Space to grab, arrow keys to move, Space to drop, Escape to cancel.</p>
  <div data-slot="announce" aria-live="assertive" aria-atomic="true" class="my-sr-only"></div>
</sortable-list>
```

The Web Component only lets a drag begin from the handle: `pointerdown` records whether the press landed on a grip, and `onDragStart` (which the browser dispatches on the `draggable` `<li>`, never on the button inside it) cancels the drag unless it did.

## Variants

### Horizontal (a tab strip, a kanban column header)

Swap `stack` for `cluster` and turn the insertion line vertical:

```scss
@use 'css-is-awesome/api' as cia;

.my-sortable-row {
  @include cia.list-reset;
  @include cia.cluster($gap: 1);

  [data-slot="item"]::before {
    inset-inline: auto;
    inset-block: 0;
    inline-size: 2px;
    block-size: auto;
  }
  [data-slot="item"][data-drop-position="before"]::before { inset-inline-start: -3px; inset-block-start: 0; }
  [data-slot="item"][data-drop-position="after"]::before  { inset-inline-end: -3px;   inset-block-end: 0; }
}
```

In the JS, compare `clientX` to the horizontal midpoint instead of `clientY`, and map `ArrowLeft` / `ArrowRight` to the same moves as up / down.

### Whole-row handle

For dense admin lists where a separate grip is visual noise, put `data-slot="handle"` on a button that fills the row and contains the label. Keep it a `<button>` — the keyboard loop and `aria-pressed` still need a control — and accept that label text is no longer selectable.

## Pitfalls

- **Keying items by index.** Every framework example keys on `item.id`. Keyed by index, a move re-renders every row between the two positions, the handle that had focus is destroyed, and focus falls to `<body>` — the keyboard user loses the item they were holding.
- **Firefox needs `setData`.** Without a `dataTransfer.setData(...)` call in `dragstart`, Firefox never starts the drag at all; the pointer path silently does nothing.
- **`dragover` without `preventDefault`.** The browser treats every element as a *non*-drop target by default; forgetting `preventDefault()` in `dragover` means `drop` never fires and the cursor shows the "not allowed" icon.
- **Re-mounting the live region.** If the announcer lives inside the list (or inside a component that re-renders on reorder) it re-mounts and announces nothing. Keep it a sibling of the `<ul>`, mounted once.
- **Dropping an item onto itself.** Guard `to === from` in `move()`, and skip `data-drop-position` on the dragged item — otherwise the insertion line flickers on the thing being dragged.
- **Touch.** HTML5 drag-and-drop is not available on iOS Safari and most Android browsers. If your product is touch-first, the pointer path here is not enough — reach for a library (see Interactivity) and keep the styling.

## Related recipes

- [`data-table`](./data-table.md) — the same `move()`-and-announce shape applies to reorderable table rows; pair the handle with a `<th scope="row">`
- [`admin-dashboard-layout`](./admin-dashboard-layout.md) — the natural home for a reorderable sidebar or widget list
