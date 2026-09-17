---
name: command-palette
description: A Cmd+K / Ctrl+K command palette — native <dialog> for the top layer, focus trap and Esc, plus the combobox recipe's input layer over a grouped, filterable command list.
category: overlay
complexity: complex
cia-version: ">=1.0.0"
---

## Use this when

You want a keyboard-first launcher — "press Cmd+K, type a few letters, hit Enter" — for navigation, actions, or recent items in an app or docs site. Build it from **two things you already have**: the native `<dialog>` element (see [`dialog`](./dialog.md)) for the overlay, and the ARIA combobox input layer from the [`combobox`](./combobox.md) recipe for the search + list. If you only need a single search box on a page with no modal, use the combobox recipe directly. If the list is short and fixed (five menu items), a `cia.dropdown` is enough.

The palette is also where the "focus trap" question is settled for good: **`dialog.showModal()` is the focus trap.** It puts the dialog in the browser's top layer, makes everything behind it `inert`, keeps Tab inside, closes on Esc, and returns focus to the element that had it when the dialog opened. A JS focus-trap library exists to emulate exactly that for a `<div role="dialog">` — with a real `<dialog>` there is nothing left for it to do.

## Structure (raw HTML)

```html
<button type="button" data-slot="trigger" aria-haspopup="dialog">
  Search commands… <kbd>Ctrl</kbd> <kbd>K</kbd>
</button>

<dialog data-cia-recipe="command-palette" aria-label="Command palette">
  <div data-slot="search">
    <input
      data-slot="input"
      type="text"
      role="combobox"
      aria-expanded="true"
      aria-controls="my-palette-list"
      aria-autocomplete="list"
      aria-activedescendant=""
      aria-describedby="my-palette-count"
      autocomplete="off"
      spellcheck="false"
      placeholder="Type a command or search…"
      autofocus
    />
    <span id="my-palette-count" data-slot="count" aria-live="polite" class="sr-only">8 commands</span>
  </div>

  <ul id="my-palette-list" data-slot="list" role="listbox" aria-label="Commands">
    <li role="group" aria-labelledby="my-palette-nav">
      <div id="my-palette-nav" data-slot="heading">Navigation</div>
      <ul role="presentation">
        <li id="cmd-docs" role="option" data-slot="option">Go to Docs <kbd data-slot="hint">G D</kbd></li>
        <li id="cmd-themes" role="option" data-slot="option" data-active>Go to Themes <kbd data-slot="hint">G T</kbd></li>
      </ul>
    </li>
    <li role="group" aria-labelledby="my-palette-actions">
      <div id="my-palette-actions" data-slot="heading">Actions</div>
      <ul role="presentation">
        <li id="cmd-dark" role="option" data-slot="option">Toggle dark mode</li>
        <li id="cmd-copy" role="option" data-slot="option">Copy install command</li>
      </ul>
    </li>
  </ul>

  <p data-slot="empty" hidden>No commands match.</p>
</dialog>
```

Notes on the markup:

- The `<dialog>` gets an `aria-label` rather than `aria-labelledby` — a palette has no visible title, the search box *is* the UI. Screen readers still announce "Command palette, dialog" on open.
- The input is the combobox recipe's custom variant verbatim: `role="combobox"`, `aria-controls` pointing at the listbox, `aria-activedescendant` tracking the highlighted option while DOM focus never leaves the input. `aria-expanded` is always `"true"` here — the list is permanently visible inside the dialog; there is no closed state to represent.
- `autofocus` on the input is what makes the palette keyboard-first: `showModal()` moves focus to the first `autofocus` element inside the dialog, so the user is typing the instant it opens.
- Groups are `<li role="group" aria-labelledby>` wrapping a `role="presentation"` list. Screen readers announce "Navigation, group" when the active option moves into a new group; sighted users get the heading row. Flat lists can drop the group layer entirely.
- The `[data-slot="count"]` live region is visually hidden and reports the filtered count ("3 commands", "No commands match") so a screen-reader user knows what typing did — a sighted user sees the list shrink, an AT user hears nothing otherwise.
- `<kbd>` hints are decoration: `aria-hidden` is deliberately *not* set, because "Go to Docs, G D" is useful information; keep them short.

## Styling (cia mixins)

```scss
// CommandPalette.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-palette-trigger {
  @include cia.btn(outline);
  gap: cia.space(2);

  kbd {
    @include cia.font(reg, 1);
    padding: 0 cia.space(1);
    border: 1px solid cia.color(border-default);
    border-radius: cia.radius(sm);
    background: cia.color(surface-muted);
  }
}

.my-palette {
  // modal-base, not modal: the palette hangs from the top of the viewport and
  // has no padding of its own — the search row and the list pad themselves.
  @include cia.modal-base($p: 0, $r: lg, $shadow: 5, $max-width: 40rem);
  border: 1px solid cia.color(border-default);
  margin-block-start: 10vh;
  overflow: hidden;

  &::backdrop {
    background: rgb(0 0 0 / 50%);
  }

  [data-slot="search"] {
    padding: cia.space(3) cia.space(4);
    border-block-end: 1px solid cia.color(border-default);
  }

  // The bare input: no box of its own, the search row is the box.
  [data-slot="input"] {
    @include cia.form-reset;
    inline-size: 100%;
    border: 0;
    background: transparent;
    color: cia.color(text-primary);
    @include cia.font(reg, 3);

    &:focus {
      outline: none;
    }
    &::placeholder {
      color: cia.color(text-muted);
    }
  }

  [data-slot="list"] {
    @include cia.list-reset;
    max-block-size: 22rem;
    overflow-y: auto;
    padding-block: cia.space(2);

    ul {
      @include cia.list-reset;
    }
  }

  [data-slot="heading"] {
    padding: cia.space(2) cia.space(4) cia.space(1);
    @include cia.font(semibold, 1);
    color: cia.color(text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  [role="option"] {
    @include cia.dropdown-item($py: 2, $px: 4);
    justify-content: space-between;
    cursor: default;
  }

  // Keyboard highlight — the option aria-activedescendant points at.
  // dropdown-item already handles :hover, so mouse and keyboard stay independent.
  [role="option"][data-active] {
    background: cia.color(interactive-hover);
  }

  [data-slot="hint"] {
    @include cia.font(reg, 1);
    color: cia.color(text-muted);
  }

  [data-slot="empty"] {
    margin: 0;
    padding: cia.space(5) cia.space(4);
    text-align: center;
    color: cia.color(text-muted);
  }
}

.sr-only {
  @include cia.sr-only;
}
```

`cia.modal-base` gives the surface, radius, shadow, width clamp and `z(modal)`; the recipe overrides only what a palette needs differently from a centred dialog (top-anchored via `margin-block-start`, zero padding, a visible border so it reads on dark backdrops). Everything else is the combobox recipe's styling with the listbox inlined instead of absolutely positioned.

## Interactivity

**Native (zero JS):** `showModal()` handles the top layer, `::backdrop`, the focus trap, `inert` on the page behind, Esc-to-close, and focus return to the trigger. `autofocus` on the input handles initial focus.

**The consumer script owns five jobs** — the same five as the combobox recipe, minus open/close of the list, plus the global shortcut:

1. **Shortcut** — one `keydown` listener on `document`: `(e.metaKey || e.ctrlKey) && e.key === "k"` → `preventDefault()` + `dialog.showModal()`. Register it once (in `useEffect` / `onMounted` / `connectedCallback`), never at module load — there is no `document` during SSR.
2. **Filter** — on every `input` event, filter the command list by substring (or a small fuzzy scorer), re-render the groups, drop groups that became empty, reset the active index to the first visible option, and write the count to the live region ("3 commands" / "No commands match").
3. **Track the active option** — ArrowDown / ArrowUp move an index over the *visible* options, wrapping at both ends; set `aria-activedescendant` to that option's `id`, toggle `data-active`, and `scrollIntoView({ block: "nearest" })` so a long list follows the keyboard.
4. **Run** — Enter runs the active command's handler and calls `dialog.close()`; pointer click on an option does the same. Run *after* `close()` if the command navigates, so focus restoration completes before the route changes.
5. **Reset** — on the dialog's `close` event, clear the input, restore the full list, and move "Recent" bookkeeping if you keep one (most palettes push the executed command to the top of a Recent group).

Keyboard map:

| Key | Behavior |
|---|---|
| `Ctrl+K` / `Cmd+K` (anywhere) | Open the palette, focus the input |
| `ArrowDown` / `ArrowUp` | Move the active option (wraps) |
| `Enter` | Run the active command, close |
| `Escape` | Close (native to `showModal()`) |
| `Home` / `End` | Native text-caret movement in the input — not hijacked |
| Printable keys | Filter the list |

Edge cases:

- **Nothing matches:** show `[data-slot="empty"]`, clear `aria-activedescendant` (an id pointing at a hidden element is an ARIA error), and let Enter do nothing.
- **Pointer + keyboard:** commit on `mousedown` + `preventDefault()` as in the combobox recipe so the input never blurs before the click lands; hover does *not* move `aria-activedescendant` — only keys do — so a mouse resting on the list doesn't fight the arrow keys.
- **Scroll lock:** the top layer stops interaction with the page but not wheel-scrolling of `<body>` in every browser. If that bothers you, `html:has(dialog[open]) { overflow: hidden; }` in the global stylesheet is the whole fix.

Pairs well with (but requires none of): [cmdk](https://cmdk.paco.me/), [kbar](https://kbar.vercel.app/), [Headless UI Combobox](https://headlessui.com/react/combobox) — keep this recipe's markup and styling and let them own jobs 2-4.

## A11y checklist

- [ ] Opened with `showModal()` so the dialog is in the top layer with `aria-modal` semantics, background content is `inert`, Tab is trapped, Esc closes, and focus returns to the trigger on close ([APG Dialog (Modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/))
- [ ] The dialog has an accessible name — `aria-label="Command palette"` — since it has no visible heading ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] Initial focus lands on the search input (`autofocus`), so the palette is usable from the keyboard the moment it opens ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))
- [ ] The input follows the combobox contract: `role="combobox"`, `aria-controls` → listbox `id`, `aria-autocomplete="list"`, `aria-activedescendant` tracks the highlighted option while DOM focus stays on the input ([APG Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/))
- [ ] Every command is `role="option"` with a stable `id`; groups are `role="group"` with `aria-labelledby` pointing at their visible heading ([WAI-ARIA 1.2: listbox role](https://www.w3.org/TR/wai-aria-1.2/#listbox))
- [ ] Filtering results are announced through a polite live region ("3 commands", "No commands match") so the effect of typing is not visual-only ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] The trigger carries `aria-haspopup="dialog"` and the documented shortcut is also reachable by pointer — the keyboard shortcut is an accelerator, never the only way in ([WCAG 2.2 SC 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html))
- [ ] The keyboard highlight (`[data-active]`) meets non-text contrast against the list surface ([WCAG 2.2 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- [ ] Options inherit ≥24px height from `cia.dropdown-item` padding ([WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))

## Framework examples

All four implement the same spec: Ctrl/Cmd+K opens, substring filter over grouped commands, wrapping arrow navigation with `aria-activedescendant`, Enter runs + closes, live-region count. The command list is data, not markup — swap in your own.

### React

```tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CommandPalette.module.scss";

type Command = { id: string; label: string; group: string; hint?: string; run: () => void };

export default function CommandPalette({ commands }: { commands: Command[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  }, [commands, query]);

  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of visible) map.set(c.group, [...(map.get(c.group) ?? []), c]);
    return [...map.entries()];
  }, [visible]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dialogRef.current?.showModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function run(cmd: Command) {
    dialogRef.current?.close();
    cmd.run();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!visible.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % visible.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + visible.length) % visible.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(visible[active]);
    }
  }

  const activeId = visible[active] ? `cmd-${visible[active].id}` : undefined;
  const count = visible.length ? `${visible.length} command${visible.length === 1 ? "" : "s"}` : "No commands match";

  return (
    <>
      <button
        type="button"
        className={styles.myPaletteTrigger}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        Search commands… <kbd>Ctrl</kbd> <kbd>K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.myPalette}
        aria-label="Command palette"
        onClose={() => {
          setQuery("");
          setActive(0);
        }}
      >
        <div data-slot="search">
          <input
            data-slot="input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="my-palette-list"
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-describedby="my-palette-count"
            autoComplete="off"
            spellCheck={false}
            placeholder="Type a command or search…"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
          <span id="my-palette-count" className={styles.srOnly} aria-live="polite">
            {count}
          </span>
        </div>

        <ul id="my-palette-list" data-slot="list" role="listbox" aria-label="Commands">
          {groups.map(([group, items]) => (
            <li key={group} role="group" aria-labelledby={`my-palette-${group}`}>
              <div id={`my-palette-${group}`} data-slot="heading">{group}</div>
              <ul role="presentation">
                {items.map((c) => {
                  const isActive = visible[active]?.id === c.id;
                  return (
                    <li
                      key={c.id}
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={isActive}
                      data-active={isActive ? "" : undefined}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        run(c);
                      }}
                    >
                      {c.label}
                      {c.hint && <kbd data-slot="hint">{c.hint}</kbd>}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <p data-slot="empty" hidden={visible.length > 0}>No commands match.</p>
      </dialog>
    </>
  );
}
```

### Vue

```vue
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({ commands: { type: Array, required: true } });

const dialog = ref(null);
const query = ref("");
const active = ref(0);

const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? props.commands.filter((c) => c.label.toLowerCase().includes(q)) : props.commands;
});
const groups = computed(() => {
  const map = new Map();
  for (const c of visible.value) map.set(c.group, [...(map.get(c.group) ?? []), c]);
  return [...map.entries()];
});
const activeId = computed(() => (visible.value[active.value] ? `cmd-${visible.value[active.value].id}` : undefined));
const count = computed(() =>
  visible.value.length ? `${visible.value.length} command${visible.value.length === 1 ? "" : "s"}` : "No commands match",
);

function open() {
  dialog.value?.showModal();
}
function run(cmd) {
  dialog.value?.close();
  cmd.run();
}
function onKeydown(e) {
  if (!visible.value.length) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    active.value = (active.value + 1) % visible.value.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    active.value = (active.value - 1 + visible.value.length) % visible.value.length;
  } else if (e.key === "Enter") {
    e.preventDefault();
    run(visible.value[active.value]);
  }
}
function onShortcut(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    open();
  }
}
onMounted(() => document.addEventListener("keydown", onShortcut));
onBeforeUnmount(() => document.removeEventListener("keydown", onShortcut));
</script>

<template>
  <button type="button" class="my-palette-trigger" aria-haspopup="dialog" @click="open">
    Search commands… <kbd>Ctrl</kbd> <kbd>K</kbd>
  </button>

  <dialog ref="dialog" class="my-palette" aria-label="Command palette" @close="query = ''; active = 0">
    <div data-slot="search">
      <input
        data-slot="input"
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="my-palette-list"
        aria-autocomplete="list"
        :aria-activedescendant="activeId"
        aria-describedby="my-palette-count"
        autocomplete="off"
        spellcheck="false"
        placeholder="Type a command or search…"
        autofocus
        :value="query"
        @input="query = $event.target.value; active = 0"
        @keydown="onKeydown"
      />
      <span id="my-palette-count" class="sr-only" aria-live="polite">{{ count }}</span>
    </div>

    <ul id="my-palette-list" data-slot="list" role="listbox" aria-label="Commands">
      <li v-for="[group, items] in groups" :key="group" role="group" :aria-labelledby="`my-palette-${group}`">
        <div :id="`my-palette-${group}`" data-slot="heading">{{ group }}</div>
        <ul role="presentation">
          <li
            v-for="c in items"
            :key="c.id"
            :id="`cmd-${c.id}`"
            role="option"
            :aria-selected="visible[active]?.id === c.id"
            :data-active="visible[active]?.id === c.id ? '' : undefined"
            @mousedown.prevent="run(c)"
          >
            {{ c.label }}
            <kbd v-if="c.hint" data-slot="hint">{{ c.hint }}</kbd>
          </li>
        </ul>
      </li>
    </ul>

    <p data-slot="empty" :hidden="visible.length > 0">No commands match.</p>
  </dialog>
</template>
```

### Svelte

```svelte
<script>
  import { onMount } from "svelte";

  export let commands = [];

  let dialog;
  let query = "";
  let active = 0;

  $: q = query.trim().toLowerCase();
  $: visible = q ? commands.filter((c) => c.label.toLowerCase().includes(q)) : commands;
  $: groups = [...visible.reduce((m, c) => m.set(c.group, [...(m.get(c.group) ?? []), c]), new Map()).entries()];
  $: activeId = visible[active] ? `cmd-${visible[active].id}` : undefined;
  $: count = visible.length ? `${visible.length} command${visible.length === 1 ? "" : "s"}` : "No commands match";

  function open() {
    dialog?.showModal();
  }
  function run(cmd) {
    dialog?.close();
    cmd.run();
  }
  function onKeydown(e) {
    if (!visible.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = (active + 1) % visible.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = (active - 1 + visible.length) % visible.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(visible[active]);
    }
  }

  onMount(() => {
    function onShortcut(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    }
    document.addEventListener("keydown", onShortcut);
    return () => document.removeEventListener("keydown", onShortcut);
  });
</script>

<button type="button" class="my-palette-trigger" aria-haspopup="dialog" on:click={open}>
  Search commands… <kbd>Ctrl</kbd> <kbd>K</kbd>
</button>

<dialog bind:this={dialog} class="my-palette" aria-label="Command palette" on:close={() => { query = ""; active = 0; }}>
  <div data-slot="search">
    <input
      data-slot="input"
      type="text"
      role="combobox"
      aria-expanded="true"
      aria-controls="my-palette-list"
      aria-autocomplete="list"
      aria-activedescendant={activeId}
      aria-describedby="my-palette-count"
      autocomplete="off"
      spellcheck="false"
      placeholder="Type a command or search…"
      autofocus
      bind:value={query}
      on:input={() => (active = 0)}
      on:keydown={onKeydown}
    />
    <span id="my-palette-count" class="sr-only" aria-live="polite">{count}</span>
  </div>

  <ul id="my-palette-list" data-slot="list" role="listbox" aria-label="Commands">
    {#each groups as [group, items] (group)}
      <li role="group" aria-labelledby={`my-palette-${group}`}>
        <div id={`my-palette-${group}`} data-slot="heading">{group}</div>
        <ul role="presentation">
          {#each items as c (c.id)}
            <li
              id={`cmd-${c.id}`}
              role="option"
              aria-selected={visible[active]?.id === c.id}
              data-active={visible[active]?.id === c.id ? "" : undefined}
              on:mousedown|preventDefault={() => run(c)}
            >
              {c.label}
              {#if c.hint}<kbd data-slot="hint">{c.hint}</kbd>{/if}
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>

  <p data-slot="empty" hidden={visible.length > 0}>No commands match.</p>
</dialog>
```

### Vanilla (Web Component)

```js
class CommandPalette extends HTMLElement {
  // Pass commands in via a property: el.commands = [{ id, label, group, hint, run }]
  commands = [];
  #query = "";
  #active = 0;

  connectedCallback() {
    this.innerHTML = `
      <button type="button" class="my-palette-trigger" aria-haspopup="dialog">
        Search commands… <kbd>Ctrl</kbd> <kbd>K</kbd>
      </button>
      <dialog class="my-palette" aria-label="Command palette">
        <div data-slot="search">
          <input data-slot="input" type="text" role="combobox" aria-expanded="true"
            aria-controls="my-palette-list" aria-autocomplete="list" aria-describedby="my-palette-count"
            autocomplete="off" spellcheck="false" placeholder="Type a command or search…" autofocus />
          <span id="my-palette-count" class="sr-only" aria-live="polite"></span>
        </div>
        <ul id="my-palette-list" data-slot="list" role="listbox" aria-label="Commands"></ul>
        <p data-slot="empty" hidden>No commands match.</p>
      </dialog>`;

    this.dialog = this.querySelector("dialog");
    this.input = this.querySelector('[data-slot="input"]');
    this.list = this.querySelector('[data-slot="list"]');

    this.querySelector(".my-palette-trigger").addEventListener("click", () => this.dialog.showModal());
    this.onShortcut = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.dialog.showModal();
      }
    };
    document.addEventListener("keydown", this.onShortcut);

    this.input.addEventListener("input", () => {
      this.#query = this.input.value;
      this.#active = 0;
      this.render();
    });
    this.input.addEventListener("keydown", (e) => {
      const visible = this.visible();
      if (!visible.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.#active = (this.#active + 1) % visible.length;
        this.render();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.#active = (this.#active - 1 + visible.length) % visible.length;
        this.render();
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.run(visible[this.#active]);
      }
    });
    this.dialog.addEventListener("close", () => {
      this.#query = "";
      this.#active = 0;
      this.input.value = "";
      this.render();
    });
    this.render();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.onShortcut);
  }

  visible() {
    const q = this.#query.trim().toLowerCase();
    return q ? this.commands.filter((c) => c.label.toLowerCase().includes(q)) : this.commands;
  }

  run(cmd) {
    this.dialog.close();
    cmd.run();
  }

  render() {
    const visible = this.visible();
    const activeCmd = visible[this.#active];
    const groups = new Map();
    for (const c of visible) groups.set(c.group, [...(groups.get(c.group) ?? []), c]);

    this.list.innerHTML = [...groups.entries()]
      .map(
        ([group, items]) => `
        <li role="group" aria-labelledby="my-palette-${group}">
          <div id="my-palette-${group}" data-slot="heading">${group}</div>
          <ul role="presentation">
            ${items
              .map(
                (c) => `<li id="cmd-${c.id}" role="option" aria-selected="${c === activeCmd}"${c === activeCmd ? " data-active" : ""}>
                  ${c.label}${c.hint ? `<kbd data-slot="hint">${c.hint}</kbd>` : ""}
                </li>`,
              )
              .join("")}
          </ul>
        </li>`,
      )
      .join("");

    this.list.querySelectorAll('[role="option"]').forEach((el, i) =>
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.run(visible[i]);
      }),
    );

    if (activeCmd) this.input.setAttribute("aria-activedescendant", `cmd-${activeCmd.id}`);
    else this.input.removeAttribute("aria-activedescendant");
    this.querySelector('[data-slot="empty"]').hidden = visible.length > 0;
    this.querySelector("#my-palette-count").textContent = visible.length
      ? `${visible.length} command${visible.length === 1 ? "" : "s"}`
      : "No commands match";
  }
}
customElements.define("command-palette", CommandPalette);
```

## Variants

### WCAG-strict

The base recipe already satisfies WCAG 2.2 AA for the palette itself. Teams shipping to strict audits usually want these four extras — all small, none needing a library:

- **Announce result counts.** Keep the polite live region (`[data-slot="count"]`) and write to it on *every* filter change, including "No commands match". Without it, a screen-reader user who types "xyz" hears silence and cannot tell whether the list is empty or the palette is broken. Debounce the write by ~150 ms if your filter runs per keystroke, so a fast typist hears one announcement, not eight.
- **Keep focus on the input.** Never move DOM focus into the list. `aria-activedescendant` is the whole mechanism — the screen reader reads the referenced option while the caret stays in the search box. Moving real focus to `<li>` elements breaks typing-to-filter and is the most common palette a11y bug in the wild.
- **Return focus to the trigger.** `showModal()` does this automatically when the dialog was opened by the trigger's click. When the palette was opened by the keyboard shortcut instead, the browser still returns focus to whatever was focused before — usually right. If a command navigates, run it *after* `close()` so the restoration completes first, then let the new route set focus as it normally would.
- **`inert` and scroll lock.** The top layer already makes the page behind the dialog inert to AT and pointer. If your app also has a sticky header with its own tabbable controls rendered *outside* the normal flow (a portal), verify Tab cannot reach them; if it can, they are not behind the dialog in the DOM and need `inert` set manually while the palette is open. Scroll lock is a one-liner in the global stylesheet: `html:has(dialog[open]) { overflow: hidden; }`.

```scss
// app/globals.scss — global stylesheet, so the emitting bundle is correct here.
@use 'css-is-awesome';

html:has(dialog[open]) {
  overflow: hidden;
}
```

### Recent commands

Push the executed command's `id` to the front of a `recent` array (cap at 3-5), persist it in `localStorage` if you like, and render a "Recent" group first whenever the query is empty. Filtering ignores the Recent group so results don't appear twice.

### Nested pages

For "Go to Theme → pick a theme" flows, replace the command list with a second list when a parent command runs, prefix the input with a breadcrumb chip, and make Backspace-on-empty-input pop back one level. The dialog, input, and listbox contracts stay identical; only the data changes.

## Pitfalls

- **Don't build the overlay from a `<div role="dialog">` plus a focus-trap library.** Native `<dialog>` + `showModal()` gives you the top layer, `inert`, Tab trapping, Esc and focus return with zero code. The library route exists for browsers older than 2022; if you can't target `<dialog>`, use the [`dialog`](./dialog.md) recipe's fallback note rather than reinventing it here.
- **Don't set `aria-expanded="false"` on the input when the list is empty.** The list is still present and controlled; use the empty-state paragraph and clear `aria-activedescendant` instead.
- **Don't register the Cmd+K listener at module scope.** It throws during SSR (`document` is undefined) and, in React strict mode, double-registers. Register in a mount hook and remove on unmount.
- **Don't use `Cmd+K` on macOS without also handling `Ctrl+K`.** Some users remap; some Linux/Windows keyboards report `metaKey` for the Windows key. Check both modifiers.
- **Don't let hover move the active option.** Mouse hover highlights via `:hover` (from `cia.dropdown-item`); only arrow keys move `aria-activedescendant`. Otherwise a stray pointer resting on the list hijacks Enter.

## Related recipes

- [`dialog`](./dialog.md) — the overlay half: `<dialog>`, `showModal()`, the native focus trap and focus return this recipe relies on
- [`combobox`](./combobox.md) — the input half: `role="combobox"` + `aria-activedescendant` over a `role="listbox"`; the keyboard contract is reused verbatim
- [`app-shell`](./app-shell.md) — the layout this palette usually mounts into (trigger in the navbar, shortcut app-wide)
