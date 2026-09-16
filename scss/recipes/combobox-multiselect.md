---
name: combobox-multiselect
description: A tag-input combobox — the ARIA combobox pattern extended to multiple selections, each rendered as a removable chip in front of the text field.
category: input
complexity: complex
cia-version: ">=1.0.0"
---

## Use this when

You need a "pick several from a list" field where the chosen items stay visible as chips — tags on a post, assignees on a ticket, skills on a profile. This recipe **extends the custom variant of [`combobox`](./combobox.md)**: one text input, one filtered listbox, but the listbox is `aria-multiselectable` and every committed option becomes a chip with its own remove button. If the user only ever picks **one** value, stop here and use the plain `combobox` recipe. If the option list is short and fixed and typing-to-filter adds nothing, a group of native `<input type="checkbox">` styled with `cia.check-base` is simpler and needs zero JS.

## Structure (raw HTML)

```html
<div class="my-multiselect" data-cia-recipe="combobox-multiselect">
  <label id="my-ms-label" for="my-ms-input" data-slot="label">Toppings</label>

  <!-- The chips and the input share one visual "field" box -->
  <div data-slot="control">
    <div data-slot="field">
      <ul data-slot="chips" aria-labelledby="my-ms-label" role="list">
        <li data-slot="chip">
          Cheese
          <button type="button" data-slot="remove" aria-label="Remove Cheese">×</button>
        </li>
        <li data-slot="chip">
          Olives
          <button type="button" data-slot="remove" aria-label="Remove Olives">×</button>
        </li>
      </ul>

      <input
        id="my-ms-input"
        data-slot="input"
        type="text"
        role="combobox"
        aria-expanded="false"
        aria-controls="my-ms-listbox"
        aria-autocomplete="list"
        aria-describedby="my-ms-hint"
        autocomplete="off"
        spellcheck="false"
        placeholder="Add a topping…"
      />
    </div>

    <ul id="my-ms-listbox" data-slot="listbox" role="listbox" aria-label="Toppings" aria-multiselectable="true" hidden>
      <li id="my-ms-opt-0" role="option" aria-selected="true">Cheese</li>
      <li id="my-ms-opt-1" role="option" aria-selected="false" data-active>Mushrooms</li>
      <li id="my-ms-opt-2" role="option" aria-selected="true">Olives</li>
      <li id="my-ms-opt-3" role="option" aria-selected="false">Peppers</li>
    </ul>
  </div>

  <span id="my-ms-hint" data-slot="hint">Type to filter. Enter adds, Backspace removes the last one.</span>
  <span data-slot="announce" aria-live="polite" class="my-sr-only"></span>
</div>
```

Notes on the markup:

- The input keeps the exact combobox contract from the base recipe — `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant` (added by JS when an option is active). The **only** ARIA additions are `aria-multiselectable="true"` on the listbox and `aria-selected` reflecting membership rather than "the one committed value".
- Chips are a real `<ul role="list">` named by the field's label, so a screen-reader user can review the current selection as a list ("Toppings, list, 2 items") without opening the popup. Each chip's remove `<button>` carries its own `aria-label` naming the item — "×" alone is not a name.
- `[data-slot="field"]` is a purely visual wrapper that makes chips and input read as one control. Clicking anywhere on it should focus the input (JS, one line).
- The `[data-slot="announce"]` region is where selection changes are spoken once ("Olives added", "Cheese removed") — the listbox's `aria-selected` flips are not reliably announced when DOM focus stays on the input.
- SSR snapshot: listbox `hidden`, `aria-expanded="false"`, chips already rendered for any preselected values.

## Styling (cia mixins)

```scss
// MyMultiselect.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-multiselect {
  [data-slot="label"] {
    @include cia.label-base;
  }

  // Positioning context for the popup — wraps the field and the listbox only,
  // so the popup opens directly under the field, not under the hint.
  [data-slot="control"] {
    position: relative;
  }

  // The shared "field" box gets the input chrome; the real <input> is bare.
  [data-slot="field"] {
    @include cia.input-base($py: 2xs, $px: 1);
    @include cia.cluster($gap: 2xs);
    cursor: text;

    // Delegate the focus ring to the wrapper — the visible box is what the user reads as "the field".
    &:focus-within {
      border-color: cia.color(border-focus);
      box-shadow: 0 0 0 3px rgba(cia.color-static(border-focus), 0.2);
    }
  }

  [data-slot="chips"] {
    @include cia.list-reset;
    @include cia.cluster($gap: 2xs);
  }

  [data-slot="chip"] {
    @include cia.tag($removable: true);
  }

  [data-slot="remove"] {
    @include cia.btn-icon($size: 1.25rem, $r: sm);
    @include cia.font(medium, 2);
    line-height: 1;
    color: cia.color(text-muted);

    &:hover {
      color: cia.color(text-primary);
      background: cia.color(interactive-hover);
    }
  }

  [data-slot="input"] {
    @include cia.form-reset;
    flex: 1 1 8ch;
    min-inline-size: 8ch;
    padding: cia.space(2xs) cia.space(1);
    background: transparent;
    color: cia.color(text-primary);
    @include cia.font(reg, 2);

    &::placeholder {
      color: cia.color(text-muted);
    }
    &:focus {
      outline: none; // the wrapper's :focus-within draws the ring
    }
  }

  [data-slot="listbox"] {
    @include cia.popover-base($p: 1, $max-width: none);
    position: absolute;
    inset-block-start: calc(100% + #{cia.space(1)});
    inset-inline: 0;
    margin: 0;
    list-style: none;
    max-block-size: 16rem;
    overflow-y: auto;
  }

  [role="option"] {
    @include cia.dropdown-item;
    border-radius: cia.radius(sm);
    justify-content: space-between;

    // A visible "selected" mark so membership isn't conveyed by colour alone
    &[aria-selected="true"]::after {
      content: "✓";
      color: cia.color(action-primary-default);
    }
  }

  // Keyboard highlight — where aria-activedescendant points
  [role="option"][data-active] {
    background: cia.color(interactive-hover);
  }

  [role="option"][aria-selected="true"] {
    font-weight: cia.font-weight(medium);
  }

  [data-slot="hint"] {
    @include cia.form-help;
  }
}

.my-sr-only {
  @include cia.sr-only;
}
```

`cia.input-base` goes on the **wrapper**, not the `<input>`, because the chips live inside the same border. The input itself gets `cia.form-reset` so it inherits the wrapper's font and background with no chrome of its own. `[data-slot="control"]` is the positioning context so the popup hangs off the field, not off the hint below it.

## Interactivity

Everything from the base [`combobox`](./combobox.md) recipe still applies — filter on `input`, open/close mirrored to `aria-expanded`, `aria-activedescendant` tracking, commit on Enter/`mousedown`, dismiss on Esc/blur. Three things change:

1. **Commit toggles instead of replaces.** Enter (or clicking an option) adds the option to the selection if absent, removes it if present. The input is cleared after a commit and the listbox **stays open** so the user can keep picking — closing it after every pick is the most common multiselect annoyance.
2. **Backspace in an empty input removes the last chip.** Only when the caret is at position 0 with no text; otherwise Backspace edits text as normal.
3. **Each chip's remove button is a real button.** Click or Enter/Space on it removes that item and moves focus back to the input, so keyboard users don't land on a chip that just disappeared.

Keyboard map (per the [WAI-ARIA APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), with the multiselect additions marked):

| Key | Behavior |
|---|---|
| `ArrowDown` | Open the listbox if closed; move active option down (wraps to top) |
| `ArrowUp` | Move active option up (wraps to bottom) |
| `Enter` | **Toggle** the active option; clear the input; keep the listbox open |
| `Backspace` (input empty) | **Remove the last chip** |
| `Escape` | Close the listbox; if already closed, clear the input text |
| `Tab` | Native — leaves the field; the listbox closes on blur |
| Printable keys | Type into the input; list re-filters |

Edge cases:

- **Announcements.** After every add/remove, write a short sentence into the polite live region ("Olives added", "Cheese removed, 1 selected"). Clear it on the next change so repeated identical messages are still spoken.
- **Chip focus order.** Chips come *before* the input in DOM order, so Shift+Tab from the input walks the remove buttons in reverse — that's correct and expected; don't `tabindex="-1"` them away, or keyboard users lose the only way to remove a specific chip.
- **Max selection.** If you cap the count, keep the listbox open but render options non-selectable (`aria-disabled="true"`, skip in Arrow navigation) and say why in the hint. Don't silently ignore Enter.
- **Form submission.** The chips are display; the *value* is your state. For a plain `<form>` post, render one `<input type="hidden" name="toppings[]">` per selection, or a single hidden input with a delimited value.

Pairs well with (but requires none of): [Downshift `useMultipleSelection`](https://www.downshift-js.com/use-multiple-selection), [Headless UI Combobox (`multiple`)](https://headlessui.com/react/combobox#selecting-multiple-values), [Zag.js tags-input](https://zagjs.com/components/react/tags-input) — they own the state machine, you keep this recipe's markup and styling.

## A11y checklist

- [ ] Listbox has `aria-multiselectable="true"` and every option reflects membership via `aria-selected="true|false"` — not by chip presence alone ([APG Listbox pattern, multi-select](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/))
- [ ] Input keeps the full combobox contract: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"`, `aria-activedescendant`; DOM focus never leaves the input while navigating options ([APG Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/))
- [ ] Chips are a `role="list"` named by the field's label, so the current selection is reviewable without opening the popup ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Every remove control is a `<button>` with an `aria-label` naming its item ("Remove Olives"), and is reachable by Tab ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] Removing a chip moves focus back to the input, never leaves it on a removed node ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))
- [ ] Add/remove events are announced once via a polite live region ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] Selected options carry a visible mark (the ✓) in addition to weight/colour ([WCAG 2.2 SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))
- [ ] Remove buttons are at least 24×24 CSS px, or spaced so targets don't overlap ([WCAG 2.2 SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))
- [ ] Keyboard highlight (`[data-active]`) meets non-text contrast against the listbox surface ([WCAG 2.2 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))

## Framework examples

All four examples implement the same spec: filter-as-you-type over a static list, chips with remove buttons, Enter toggles, Backspace-on-empty removes the last chip, polite announcements.

### React

```tsx
"use client";
import { useId, useRef, useState } from "react";
import styles from "./MyMultiselect.module.scss";

const OPTIONS = ["Cheese", "Mushrooms", "Olives", "Onions", "Peppers", "Pineapple", "Spinach"];

export default function MyMultiselect() {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [announce, setAnnounce] = useState("");

  const matches = OPTIONS.filter((o) => o.toLowerCase().includes(text.toLowerCase()));
  const expanded = open && matches.length > 0;

  const toggle = (option: string) => {
    const has = selected.includes(option);
    const next = has ? selected.filter((s) => s !== option) : [...selected, option];
    setSelected(next);
    setAnnounce(`${option} ${has ? "removed" : "added"}, ${next.length} selected`);
    setText("");
    setActive(-1);
  };

  const remove = (option: string) => {
    setSelected((s) => s.filter((x) => x !== option));
    setAnnounce(`${option} removed`);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % Math.max(matches.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? matches.length - 1 : a - 1));
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      toggle(matches[active]);
    } else if (e.key === "Backspace" && text === "" && selected.length) {
      remove(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      if (open) { setOpen(false); setActive(-1); } else setText("");
    }
  };

  return (
    <div className={styles.myMultiselect}>
      <label id={`${id}-label`} htmlFor={`${id}-input`} data-slot="label">Toppings</label>

      <div data-slot="control">
        <div data-slot="field" onClick={() => inputRef.current?.focus()}>
          <ul data-slot="chips" role="list" aria-labelledby={`${id}-label`}>
            {selected.map((s) => (
              <li key={s} data-slot="chip">
                {s}
                <button type="button" data-slot="remove" aria-label={`Remove ${s}`} onClick={() => remove(s)}>×</button>
              </li>
            ))}
          </ul>
          <input
            ref={inputRef}
            id={`${id}-input`}
            data-slot="input"
            type="text"
            role="combobox"
            aria-expanded={expanded}
            aria-controls={`${id}-listbox`}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
            aria-describedby={`${id}-hint`}
            autoComplete="off"
            spellCheck={false}
            placeholder={selected.length ? "" : "Add a topping…"}
            value={text}
            onChange={(e) => { setText(e.target.value); setOpen(true); setActive(-1); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            onBlur={() => setOpen(false)}
          />
        </div>

        <ul id={`${id}-listbox`} data-slot="listbox" role="listbox" aria-label="Toppings" aria-multiselectable="true" hidden={!expanded}>
          {matches.map((o, i) => (
            <li
              key={o}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={selected.includes(o)}
              data-active={i === active || undefined}
              onMouseDown={(e) => { e.preventDefault(); toggle(o); }}
            >
              {o}
            </li>
          ))}
        </ul>
      </div>

      <span id={`${id}-hint`} data-slot="hint">Type to filter. Enter adds, Backspace removes the last one.</span>
      <span data-slot="announce" aria-live="polite" className={styles.mySrOnly}>{announce}</span>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { computed, ref } from "vue";

const OPTIONS = ["Cheese", "Mushrooms", "Olives", "Onions", "Peppers", "Pineapple", "Spinach"];
const id = "ms-" + Math.random().toString(36).slice(2, 8);

const input = ref(null);
const selected = ref([]);
const text = ref("");
const open = ref(false);
const active = ref(-1);
const announce = ref("");

const matches = computed(() => OPTIONS.filter((o) => o.toLowerCase().includes(text.value.toLowerCase())));
const expanded = computed(() => open.value && matches.value.length > 0);

function toggle(option) {
  const has = selected.value.includes(option);
  selected.value = has ? selected.value.filter((s) => s !== option) : [...selected.value, option];
  announce.value = `${option} ${has ? "removed" : "added"}, ${selected.value.length} selected`;
  text.value = "";
  active.value = -1;
}
function remove(option) {
  selected.value = selected.value.filter((s) => s !== option);
  announce.value = `${option} removed`;
  input.value?.focus();
}
function onKeydown(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    open.value = true;
    active.value = (active.value + 1) % Math.max(matches.value.length, 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    active.value = active.value <= 0 ? matches.value.length - 1 : active.value - 1;
  } else if (e.key === "Enter" && expanded.value && active.value >= 0) {
    e.preventDefault();
    toggle(matches.value[active.value]);
  } else if (e.key === "Backspace" && text.value === "" && selected.value.length) {
    remove(selected.value[selected.value.length - 1]);
  } else if (e.key === "Escape") {
    if (open.value) { open.value = false; active.value = -1; } else text.value = "";
  }
}
</script>

<template>
  <div class="my-multiselect">
    <label :id="`${id}-label`" :for="`${id}-input`" data-slot="label">Toppings</label>

    <div data-slot="control">
      <div data-slot="field" @click="input?.focus()">
        <ul data-slot="chips" role="list" :aria-labelledby="`${id}-label`">
          <li v-for="s in selected" :key="s" data-slot="chip">
            {{ s }}
            <button type="button" data-slot="remove" :aria-label="`Remove ${s}`" @click="remove(s)">×</button>
          </li>
        </ul>
        <input
          ref="input"
          :id="`${id}-input`"
          data-slot="input"
          type="text"
          role="combobox"
          :aria-expanded="expanded"
          :aria-controls="`${id}-listbox`"
          aria-autocomplete="list"
          :aria-activedescendant="active >= 0 ? `${id}-opt-${active}` : undefined"
          :aria-describedby="`${id}-hint`"
          autocomplete="off"
          spellcheck="false"
          :placeholder="selected.length ? '' : 'Add a topping…'"
          v-model="text"
          @input="open = true; active = -1"
          @focus="open = true"
          @keydown="onKeydown"
          @blur="open = false"
        />
      </div>

      <ul :id="`${id}-listbox`" data-slot="listbox" role="listbox" aria-label="Toppings" aria-multiselectable="true" :hidden="!expanded">
        <li
          v-for="(o, i) in matches"
          :key="o"
          :id="`${id}-opt-${i}`"
          role="option"
          :aria-selected="selected.includes(o)"
          :data-active="i === active ? '' : undefined"
          @mousedown.prevent="toggle(o)"
        >
          {{ o }}
        </li>
      </ul>
    </div>

    <span :id="`${id}-hint`" data-slot="hint">Type to filter. Enter adds, Backspace removes the last one.</span>
    <span data-slot="announce" aria-live="polite" class="my-sr-only">{{ announce }}</span>
  </div>
</template>
```

### Svelte

```svelte
<script>
  const OPTIONS = ["Cheese", "Mushrooms", "Olives", "Onions", "Peppers", "Pineapple", "Spinach"];
  const id = "ms-" + Math.random().toString(36).slice(2, 8);

  let input;
  let selected = [];
  let text = "";
  let open = false;
  let active = -1;
  let announce = "";

  $: matches = OPTIONS.filter((o) => o.toLowerCase().includes(text.toLowerCase()));
  $: expanded = open && matches.length > 0;

  function toggle(option) {
    const has = selected.includes(option);
    selected = has ? selected.filter((s) => s !== option) : [...selected, option];
    announce = `${option} ${has ? "removed" : "added"}, ${selected.length} selected`;
    text = "";
    active = -1;
  }
  function remove(option) {
    selected = selected.filter((s) => s !== option);
    announce = `${option} removed`;
    input?.focus();
  }
  function onKeydown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open = true;
      active = (active + 1) % Math.max(matches.length, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = active <= 0 ? matches.length - 1 : active - 1;
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      toggle(matches[active]);
    } else if (e.key === "Backspace" && text === "" && selected.length) {
      remove(selected[selected.length - 1]);
    } else if (e.key === "Escape") {
      if (open) { open = false; active = -1; } else text = "";
    }
  }
</script>

<div class="my-multiselect">
  <label id="{id}-label" for="{id}-input" data-slot="label">Toppings</label>

  <div data-slot="control">
    <div data-slot="field" on:click={() => input?.focus()}>
      <ul data-slot="chips" role="list" aria-labelledby="{id}-label">
        {#each selected as s (s)}
          <li data-slot="chip">
            {s}
            <button type="button" data-slot="remove" aria-label="Remove {s}" on:click={() => remove(s)}>×</button>
          </li>
        {/each}
      </ul>
      <input
        bind:this={input}
        id="{id}-input"
        data-slot="input"
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-controls="{id}-listbox"
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        aria-describedby="{id}-hint"
        autocomplete="off"
        spellcheck="false"
        placeholder={selected.length ? "" : "Add a topping…"}
        bind:value={text}
        on:input={() => { open = true; active = -1; }}
        on:focus={() => (open = true)}
        on:keydown={onKeydown}
        on:blur={() => (open = false)}
      />
    </div>

    <ul id="{id}-listbox" data-slot="listbox" role="listbox" aria-label="Toppings" aria-multiselectable="true" hidden={!expanded}>
      {#each matches as o, i (o)}
        <li
          id="{id}-opt-{i}"
          role="option"
          aria-selected={selected.includes(o)}
          data-active={i === active ? "" : undefined}
          on:mousedown|preventDefault={() => toggle(o)}
        >
          {o}
        </li>
      {/each}
    </ul>
  </div>

  <span id="{id}-hint" data-slot="hint">Type to filter. Enter adds, Backspace removes the last one.</span>
  <span data-slot="announce" aria-live="polite" class="my-sr-only">{announce}</span>
</div>
```

### Vanilla (Web Component)

```js
class MyMultiselect extends HTMLElement {
  static options = ["Cheese", "Mushrooms", "Olives", "Onions", "Peppers", "Pineapple", "Spinach"];

  connectedCallback() {
    const id = "ms-" + Math.random().toString(36).slice(2, 8);
    this.selected = [];
    this.active = -1;
    this.open = false;

    this.innerHTML = `
      <div class="my-multiselect">
        <label id="${id}-label" for="${id}-input" data-slot="label">Toppings</label>
        <div data-slot="control">
          <div data-slot="field">
            <ul data-slot="chips" role="list" aria-labelledby="${id}-label"></ul>
            <input id="${id}-input" data-slot="input" type="text" role="combobox" aria-expanded="false"
              aria-controls="${id}-listbox" aria-autocomplete="list" aria-describedby="${id}-hint"
              autocomplete="off" spellcheck="false" placeholder="Add a topping…" />
          </div>
          <ul id="${id}-listbox" data-slot="listbox" role="listbox" aria-label="Toppings" aria-multiselectable="true" hidden></ul>
        </div>
        <span id="${id}-hint" data-slot="hint">Type to filter. Enter adds, Backspace removes the last one.</span>
        <span data-slot="announce" aria-live="polite" class="my-sr-only"></span>
      </div>`;

    this.id_ = id;
    this.input = this.querySelector('[data-slot="input"]');
    this.chips = this.querySelector('[data-slot="chips"]');
    this.listbox = this.querySelector('[data-slot="listbox"]');
    this.announce = this.querySelector('[data-slot="announce"]');

    this.querySelector('[data-slot="field"]').addEventListener("click", () => this.input.focus());
    this.input.addEventListener("input", () => { this.open = true; this.active = -1; this.render(); });
    this.input.addEventListener("focus", () => { this.open = true; this.render(); });
    this.input.addEventListener("blur", () => { this.open = false; this.render(); });
    this.input.addEventListener("keydown", (e) => this.onKeydown(e));
    this.render();
  }

  get matches() {
    const q = this.input.value.toLowerCase();
    return MyMultiselect.options.filter((o) => o.toLowerCase().includes(q));
  }

  toggle(option) {
    const has = this.selected.includes(option);
    this.selected = has ? this.selected.filter((s) => s !== option) : [...this.selected, option];
    this.announce.textContent = `${option} ${has ? "removed" : "added"}, ${this.selected.length} selected`;
    this.input.value = "";
    this.active = -1;
    this.dispatchEvent(new CustomEvent("change", { detail: this.selected }));
    this.render();
  }

  remove(option) {
    this.selected = this.selected.filter((s) => s !== option);
    this.announce.textContent = `${option} removed`;
    this.dispatchEvent(new CustomEvent("change", { detail: this.selected }));
    this.render();
    this.input.focus();
  }

  onKeydown(e) {
    const matches = this.matches;
    const expanded = this.open && matches.length > 0;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.open = true;
      this.active = (this.active + 1) % Math.max(matches.length, 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.active = this.active <= 0 ? matches.length - 1 : this.active - 1;
    } else if (e.key === "Enter" && expanded && this.active >= 0) {
      e.preventDefault();
      return this.toggle(matches[this.active]);
    } else if (e.key === "Backspace" && this.input.value === "" && this.selected.length) {
      return this.remove(this.selected[this.selected.length - 1]);
    } else if (e.key === "Escape") {
      if (this.open) { this.open = false; this.active = -1; } else this.input.value = "";
    }
    this.render();
  }

  render() {
    const id = this.id_;
    const matches = this.matches;
    const expanded = this.open && matches.length > 0;

    this.chips.innerHTML = this.selected
      .map((s) => `<li data-slot="chip">${s}<button type="button" data-slot="remove" aria-label="Remove ${s}">×</button></li>`)
      .join("");
    this.chips.querySelectorAll('[data-slot="remove"]').forEach((btn, i) =>
      btn.addEventListener("click", () => this.remove(this.selected[i])),
    );

    this.input.placeholder = this.selected.length ? "" : "Add a topping…";
    this.input.setAttribute("aria-expanded", String(expanded));
    if (this.active >= 0) this.input.setAttribute("aria-activedescendant", `${id}-opt-${this.active}`);
    else this.input.removeAttribute("aria-activedescendant");

    this.listbox.hidden = !expanded;
    this.listbox.innerHTML = matches
      .map(
        (o, i) =>
          `<li id="${id}-opt-${i}" role="option" aria-selected="${this.selected.includes(o)}"${i === this.active ? " data-active" : ""}>${o}</li>`,
      )
      .join("");
    this.listbox.querySelectorAll('[role="option"]').forEach((li, i) =>
      li.addEventListener("mousedown", (e) => { e.preventDefault(); this.toggle(matches[i]); }),
    );
  }
}
customElements.define("my-multiselect", MyMultiselect);
```

## Variants

### Selected options hidden from the list

Some products prefer the popup to show only what's *left* to pick. Filter `matches` to exclude `selected` and drop the ✓ styling — the chips are then the only selection surface, so the live-region announcements become mandatory rather than nice-to-have.

### Free-text tags (create on Enter)

For a tag input that accepts values not in the list, add one branch: `Enter` with no active option and non-empty text commits the typed text as a new chip. Announce it as "Added new tag X" so the user knows it wasn't matched.

### Compact / inline

```scss
.my-multiselect [data-slot="chip"] {
  @include cia.tag($py: 2xs, $px: 1, $font-size: 1, $removable: true);
}
```

## Pitfalls

- **Don't close the listbox after every commit.** Users picking five toppings will hate reopening it five times. Clear the text, keep it open, and let Esc / blur / Tab close it.
- **Don't make Backspace destructive when there's text in the field.** Only remove the last chip when the input is empty — otherwise a user editing a half-typed word loses a selection they didn't touch.
- **Don't strip remove buttons out of the tab order** to "simplify" Tab. That leaves keyboard users with no way to remove a specific middle chip; Backspace only reaches the last one.
- **Don't rely on `aria-selected` flips being announced.** Focus stays on the input, so most screen readers stay quiet — the live region is the announcement channel.
- **`hidden` + `position: absolute`:** the listbox is absolutely positioned under the field, so if a parent has `overflow: hidden` it gets clipped. Either lift the overflow or render the listbox through a top-layer `[popover]` (see `/docs/recipes/anchor-positioning` for the dropdown engine).

## Related recipes

- [`combobox`](./combobox.md) — the single-select base this recipe extends; read it first for the full APG keyboard contract
- [`otp-input`](./otp-input.md) — another "orchestrate focus between native inputs" pattern

