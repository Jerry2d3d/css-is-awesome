---
name: combobox
description: Autocomplete text input with a filtered suggestion list — native <datalist> for the simple case, ARIA combobox pattern for full control.
category: input
complexity: complex
cia-version: ">=1.0.0"
---

## Use this when

You need a text input that suggests and filters options as the user types — country pickers, tag inputs, search-with-suggestions. Start with the **native variant** (`<input list>` + `<datalist>`): zero JS, screen-reader support for free. Upgrade to the **custom variant** only when you need styled options, async option loading, or multi-select. If users pick from a short fixed list and never type, bail and use a plain `<select>` with `cia.select-base` instead.

## Structure (raw HTML)

### Native variant (`<datalist>`)

```html
<div data-cia-recipe="combobox">
  <label for="my-fruit" data-slot="label">Favorite fruit</label>
  <input id="my-fruit" data-slot="input" type="text" list="my-fruit-options" autocomplete="off" />
  <datalist id="my-fruit-options">
    <option value="Apple"></option>
    <option value="Banana"></option>
    <option value="Cherry"></option>
  </datalist>
</div>
```

Notes on the markup:

- The browser owns the suggestion popup: filtering, keyboard nav, and screen-reader announcements all work natively
- `autocomplete="off"` stops the browser's form-autofill popup from fighting the datalist popup
- The popup itself is **not styleable** — if the design requires styled options, use the custom variant below

### Custom variant (ARIA combobox pattern)

```html
<div class="my-combobox" data-cia-recipe="combobox">
  <label for="my-combo-input" data-slot="label">Favorite fruit</label>
  <input
    id="my-combo-input"
    data-slot="input"
    type="text"
    role="combobox"
    aria-expanded="false"
    aria-controls="my-combo-listbox"
    aria-autocomplete="list"
    autocomplete="off"
    spellcheck="false"
  />
  <ul id="my-combo-listbox" data-slot="listbox" role="listbox" aria-label="Suggestions" hidden>
    <li id="my-combo-opt-0" role="option">Apple</li>
    <li id="my-combo-opt-1" role="option" data-active>Banana</li>
    <li id="my-combo-opt-2" role="option" aria-selected="true">Cherry</li>
  </ul>
</div>
```

Notes on the markup:

- The `<input>` keeps DOM focus the whole time — the listbox is driven by `aria-activedescendant` on the input pointing at the active option's `id` (no roving `tabindex`)
- `aria-expanded` mirrors whether the listbox is visible; `aria-controls` ties input to listbox
- `aria-autocomplete="list"` tells screen readers a filtered list appears as the user types
- `data-active` marks the option `aria-activedescendant` currently points at (keyboard highlight); `aria-selected="true"` marks the committed value — they are different states and style differently
- Option `id`s must be stable per render so `aria-activedescendant` can reference them

## Styling (cia mixins)

```scss
// MyCombobox.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

.my-combobox {
  position: relative;

  [data-slot="label"] { @include cia.label-base; }

  [data-slot="input"] {
    @include cia.input-base;
    inline-size: 100%;
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
  }

  /* Keyboard highlight — where aria-activedescendant points */
  [role="option"][data-active] {
    background: cia.color(interactive-hover);
  }

  /* Committed value */
  [role="option"][aria-selected="true"] {
    font-weight: cia.font-weight(medium);
    background: cia.color(interactive-active);
  }
}
```

The native variant only needs `[data-slot="label"]` + `[data-slot="input"]` — the browser popup ignores author CSS. `cia.dropdown-item` already provides `:hover` (pointer highlight); `[data-active]` layers the keyboard highlight on top so mouse and keyboard states stay independent.

## Interactivity

Native variant: **zero JS.** The browser filters, navigates, commits, and announces.

Custom variant: this is the rare recipe where real JS is required — ARIA state doesn't update itself. The consumer script owns five jobs, each a few lines:

1. **Filter** options against the input value on every `input` event (re-open the listbox, reset the active index)
2. **Open/close** — set `hidden` on the listbox and mirror it to `aria-expanded` on the input
3. **Track the active option** — move an index with Arrow keys, set `aria-activedescendant` to that option's `id`, toggle `data-active`
4. **Commit** — on Enter or option click, write the option's text into the input, set `aria-selected`, close
5. **Dismiss** — Esc closes the listbox (a second Esc clears the input); blur closes

Keyboard map (per the [WAI-ARIA APG combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)):

| Key | Behavior |
|---|---|
| `ArrowDown` | Open the listbox if closed; move active option down |
| `ArrowUp` | Move active option up |
| `Enter` | Commit the active option, close the listbox |
| `Escape` | Close the listbox; if already closed, clear the input |
| `Home` / `End` | Move the **text caret** to start/end of the input (native — DOM focus never leaves the input) |
| Printable keys | Type into the input; list re-filters |

Edge cases:

- **Option `mousedown` vs input `blur`:** clicking an option fires the input's `blur` first, which closes the listbox before `click` lands. Commit on `mousedown` + `preventDefault()` (the framework examples below all do this).
- **SSR:** render with `hidden` on the listbox and `aria-expanded="false"` — the closed state is the correct server snapshot.
- **Async options:** while loading, keep `aria-expanded="true"` and render a single non-interactive `<li>` *without* `role="option"` ("Loading…") so it isn't keyboard-reachable.

Pairs well with (but requires none of): [Downshift](https://www.downshift-js.com/), [Headless UI Combobox](https://headlessui.com/react/combobox), [Zag.js combobox](https://zagjs.com/components/react/combobox) — they own jobs 1-5 and you keep this recipe's styling section verbatim.

## A11y checklist

- [ ] Input has `role="combobox"`, `aria-expanded`, `aria-controls` pointing at the listbox `id` ([APG Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/))
- [ ] `aria-activedescendant` on the input tracks the active option; DOM focus stays on the input
- [ ] Every suggestion has `role="option"` and a stable `id`; the listbox has `role="listbox"` with an accessible name
- [ ] `ArrowDown` / `ArrowUp` move the active option; `Enter` commits; `Esc` closes (APG keyboard interaction)
- [ ] `Home` / `End` keep their native text-editing behavior (caret to start/end) — do not hijack them for option nav in an editable combobox
- [ ] Committed option carries `aria-selected="true"`
- [ ] Visible label is associated via `for`/`id` ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Keyboard highlight (`[data-active]`) meets non-text contrast against the listbox surface ([WCAG 2.2 SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- [ ] Touch targets: options inherit ≥24px height from `cia.dropdown-item` padding ([WCAG 2.2 SC 2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html))

## Framework examples

All four examples implement the same spec: filter-as-you-type over a static list, full APG keyboard map, commit on Enter/click.

### React

```tsx
"use client";
import { useId, useState } from "react";
import styles from "./MyCombobox.module.scss";

const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango", "Peach", "Pear"];

export default function MyCombobox() {
  const id = useId();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const matches = FRUITS.filter((f) => f.toLowerCase().includes(value.toLowerCase()));
  const expanded = open && matches.length > 0;

  const commit = (option: string) => {
    setValue(option);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      commit(matches[active]);
    } else if (e.key === "Escape") {
      if (open) { setOpen(false); setActive(-1); } else setValue("");
    }
    // Home / End fall through: native caret movement
  };

  return (
    <div className={styles.myCombobox}>
      <label htmlFor={`${id}-input`} data-slot="label">Favorite fruit</label>
      <input
        id={`${id}-input`}
        data-slot="input"
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => { setValue(e.target.value); setOpen(true); setActive(-1); }}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      />
      <ul id={`${id}-listbox`} data-slot="listbox" role="listbox" aria-label="Suggestions" hidden={!expanded}>
        {matches.map((fruit, i) => (
          <li
            key={fruit}
            id={`${id}-opt-${i}`}
            role="option"
            aria-selected={fruit === value}
            data-active={i === active || undefined}
            onMouseDown={(e) => { e.preventDefault(); commit(fruit); }}
          >
            {fruit}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { computed, ref } from "vue";

const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango", "Peach", "Pear"];

const value = ref("");
const open = ref(false);
const active = ref(-1);

const matches = computed(() =>
  FRUITS.filter((f) => f.toLowerCase().includes(value.value.toLowerCase()))
);
const expanded = computed(() => open.value && matches.value.length > 0);

function commit(option) {
  value.value = option;
  open.value = false;
  active.value = -1;
}

function onInput() {
  open.value = true;
  active.value = -1;
}

function onKeyDown(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    open.value = true;
    active.value = Math.min(active.value + 1, matches.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    active.value = Math.max(active.value - 1, 0);
  } else if (e.key === "Enter" && expanded.value && active.value >= 0) {
    e.preventDefault();
    commit(matches.value[active.value]);
  } else if (e.key === "Escape") {
    if (open.value) { open.value = false; active.value = -1; } else value.value = "";
  }
}
</script>

<template>
  <div class="my-combobox">
    <label for="combo-input" data-slot="label">Favorite fruit</label>
    <input
      id="combo-input"
      data-slot="input"
      type="text"
      role="combobox"
      :aria-expanded="expanded"
      aria-controls="combo-listbox"
      aria-autocomplete="list"
      :aria-activedescendant="active >= 0 ? `combo-opt-${active}` : undefined"
      autocomplete="off"
      spellcheck="false"
      v-model="value"
      @input="onInput"
      @keydown="onKeyDown"
      @blur="open = false"
    />
    <ul id="combo-listbox" data-slot="listbox" role="listbox" aria-label="Suggestions" :hidden="!expanded">
      <li
        v-for="(fruit, i) in matches"
        :key="fruit"
        :id="`combo-opt-${i}`"
        role="option"
        :aria-selected="fruit === value"
        :data-active="i === active ? '' : undefined"
        @mousedown.prevent="commit(fruit)"
      >
        {{ fruit }}
      </li>
    </ul>
  </div>
</template>
```

### Svelte

```svelte
<script>
  const FRUITS = ["Apple", "Apricot", "Banana", "Blueberry", "Cherry", "Mango", "Peach", "Pear"];

  let value = "";
  let open = false;
  let active = -1;

  $: matches = FRUITS.filter((f) => f.toLowerCase().includes(value.toLowerCase()));
  $: expanded = open && matches.length > 0;

  function commit(option) {
    value = option;
    open = false;
    active = -1;
  }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open = true;
      active = Math.min(active + 1, matches.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(active - 1, 0);
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      commit(matches[active]);
    } else if (e.key === "Escape") {
      if (open) { open = false; active = -1; } else value = "";
    }
  }
</script>

<div class="my-combobox">
  <label for="combo-input" data-slot="label">Favorite fruit</label>
  <input
    id="combo-input"
    data-slot="input"
    type="text"
    role="combobox"
    aria-expanded={expanded}
    aria-controls="combo-listbox"
    aria-autocomplete="list"
    aria-activedescendant={active >= 0 ? `combo-opt-${active}` : undefined}
    autocomplete="off"
    spellcheck="false"
    bind:value
    on:input={() => { open = true; active = -1; }}
    on:keydown={onKeyDown}
    on:blur={() => (open = false)}
  />
  <ul id="combo-listbox" data-slot="listbox" role="listbox" aria-label="Suggestions" hidden={!expanded}>
    {#each matches as fruit, i (fruit)}
      <li
        id={`combo-opt-${i}`}
        role="option"
        aria-selected={fruit === value}
        data-active={i === active ? "" : undefined}
        on:mousedown|preventDefault={() => commit(fruit)}
      >
        {fruit}
      </li>
    {/each}
  </ul>
</div>
```

### Vanilla (Web Component)

```js
class MyCombobox extends HTMLElement {
  static idSeq = 0;

  connectedCallback() {
    this._options = (this.getAttribute("options") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    this._uid = `my-combo-${MyCombobox.idSeq++}`;
    this._active = -1;
    this._open = false;

    this.classList.add("my-combobox");
    this.innerHTML = `
      <label for="${this._uid}-input" data-slot="label">${this.getAttribute("label") ?? "Choose"}</label>
      <input id="${this._uid}-input" data-slot="input" type="text" role="combobox"
        aria-expanded="false" aria-controls="${this._uid}-listbox"
        aria-autocomplete="list" autocomplete="off" spellcheck="false" />
      <ul id="${this._uid}-listbox" data-slot="listbox" role="listbox" aria-label="Suggestions" hidden></ul>
    `;
    this._input = this.querySelector("input");
    this._listbox = this.querySelector("ul");

    this._input.addEventListener("input", () => { this._open = true; this._active = -1; this._render(); });
    this._input.addEventListener("keydown", (e) => this._onKeyDown(e));
    this._input.addEventListener("blur", () => { this._open = false; this._render(); });
  }

  get _matches() {
    const q = this._input.value.toLowerCase();
    return this._options.filter((o) => o.toLowerCase().includes(q));
  }

  _commit(option) {
    this._input.value = option;
    this._open = false;
    this._active = -1;
    this._render();
    this.dispatchEvent(new CustomEvent("change", { detail: option }));
  }

  _onKeyDown(e) {
    const matches = this._matches;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this._open = true;
      this._active = Math.min(this._active + 1, matches.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this._active = Math.max(this._active - 1, 0);
    } else if (e.key === "Enter" && this._open && this._active >= 0) {
      e.preventDefault();
      this._commit(matches[this._active]);
      return;
    } else if (e.key === "Escape") {
      if (this._open) { this._open = false; this._active = -1; } else this._input.value = "";
    } else {
      return; // Home/End + printable keys: native behavior
    }
    this._render();
  }

  _render() {
    const matches = this._matches;
    const expanded = this._open && matches.length > 0;
    this._input.setAttribute("aria-expanded", String(expanded));
    this._listbox.hidden = !expanded;

    this._listbox.innerHTML = "";
    matches.forEach((option, i) => {
      const li = document.createElement("li");
      li.id = `${this._uid}-opt-${i}`;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(option === this._input.value));
      if (i === this._active) li.setAttribute("data-active", "");
      li.textContent = option;
      li.addEventListener("mousedown", (e) => { e.preventDefault(); this._commit(option); });
      this._listbox.appendChild(li);
    });

    this._input.setAttribute("aria-activedescendant",
      this._active >= 0 ? `${this._uid}-opt-${this._active}` : "");
  }
}
customElements.define("my-combobox", MyCombobox);

// usage in HTML:
// <my-combobox label="Favorite fruit" options="Apple, Banana, Cherry, Mango"></my-combobox>
// <script>document.querySelector('my-combobox').addEventListener('change', (e) => console.log(e.detail));</script>
```

## Variants

### Select-only (no free text)

Add `readonly` semantics: ignore printable keys, open on click/`ArrowDown`, and skip the filter (always show all options). Keep `role="combobox"` — this is the APG "select-only combobox" sub-pattern. Consider whether a styled `<select>` with `cia.select-base` does the job first.

### Async / remote options

Replace the static array with a fetch debounced ~200ms. While loading, keep the listbox open with one non-interactive `<li>` ("Searching…") that has **no** `role="option"`. Announce result counts with a visually-hidden `aria-live="polite"` region ("8 results available").

### Multi-select (tag input)

Committed values render as removable chips before the input; the input clears after each commit instead of taking the value. Set `aria-selected="true"` on every committed option still in the list. This is a large step up in complexity — this is the point where a headless engine (Downshift, Zag.js) earns its weight.

## Pitfalls

- **Don't hijack Home/End.** In an editable combobox they must move the text caret. Hijacking them for first/last option breaks text editing and contradicts the APG.
- **`aria-activedescendant` requires same-document `id` references.** It cannot point across shadow DOM boundaries — the Web Component above deliberately uses light DOM.
- **Blur-close race:** closing the listbox on input `blur` kills option `click` handlers. Commit on `mousedown` + `preventDefault()` (all examples above) or use `relatedTarget` checks.
- **`<datalist>` styling is a dead end.** No browser lets you style the native popup. Don't burn time on it — if the design needs styled options, that's the signal to move to the custom variant.
- **Filtering resets the active index.** After re-filtering, old indices point at different options. Reset `active` to `-1` on every `input` event (all examples above do).
- **Scroll the active option into view** when the list overflows: `option.scrollIntoView({ block: "nearest" })` after moving the active index — omitted from the examples for brevity, needed in production with long lists.
- **Phones: cap the listbox, thumb-size the options.** The `max-block-size: 16rem; overflow-y: auto` in the Styling section is what keeps a long list from running past the bottom of a small viewport — don't delete it when trimming. And `cia.dropdown-item` is padded for pointers (≥24px, the WCAG minimum); at touch widths, bump options to a comfortable 44px thumb target:

  ```scss
  [role="option"] {
    @include cia.media-down(md) {
      min-block-size: 44px;
    }
  }
  ```

## Related recipes

- [`dialog`](./dialog.md) — the other half of the command-palette pattern
- (planned, Week 2) `command-palette.md` — Cmd+K palette = `<dialog>` + this combobox's input layer; it links here for the input, doesn't redefine it
- (planned, Week 2) `datepicker.md` — another "native first, custom when needed" input recipe
