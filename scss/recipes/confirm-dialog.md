---
name: confirm-dialog
description: A small "are you sure?" pattern built on the dialog recipe, plus an inline popover variant for lower-stakes confirmations.
category: overlay
complexity: simple
cia-version: ">=1.0.0"
---

## Use this when

You need to confirm a destructive or consequential action — delete, discard, leave-with-unsaved-changes — before it happens. Use the **modal variant** (a thin preset over the [`dialog`](./dialog.md) recipe) when the action affects the whole page or is hard to undo: delete an account, discard a whole form. Use the **popover variant** when the action is small and local — removing one row, one tag — and a full-screen modal would be disproportionate to what's being confirmed.

Don't reach for `window.confirm()`: it can't be styled, its focus/return-focus behavior is entirely up to the browser, and it blocks the whole page rather than just the affected area.

## Structure (raw HTML)

Modal variant — same mechanics as `dialog`, just a fixed shape (icon + message + Cancel/Confirm):

```html
<dialog data-cia-recipe="confirm-dialog" aria-labelledby="confirm-title">
  <main data-slot="body">
    <span data-slot="icon" aria-hidden="true">⚠</span>
    <p id="confirm-title">Delete this file? This action cannot be undone.</p>
  </main>
  <footer data-slot="footer">
    <button data-slot="reject" formmethod="dialog" autofocus>Cancel</button>
    <button data-slot="accept" formmethod="dialog">Delete</button>
  </footer>
</dialog>
```

Popover variant — anchored to its trigger, no full-page dimming:

```html
<div data-cia-recipe="confirm-popup" style="position: relative; display: inline-block;">
  <button type="button" data-slot="trigger" aria-haspopup="dialog" aria-expanded="false">
    Remove tag
  </button>
  <div data-slot="panel" role="dialog" aria-label="Confirm" hidden>
    <span data-slot="icon" aria-hidden="true">⚠</span>
    <p data-slot="message">Remove this tag?</p>
    <div data-slot="actions">
      <button data-slot="reject" autofocus>No</button>
      <button data-slot="accept">Yes</button>
    </div>
  </div>
</div>
```

Notes on the markup:
- The modal variant reuses `<dialog>` verbatim — its `.showModal()` gives focus trap, Esc handling and `aria-modal` for free, exactly as in `dialog`.
- `autofocus` sits on **Cancel/Reject** in both variants, not Confirm/Accept — for a destructive action, the safe default should be the one that requires no extra keypress.
- Neither variant's accept button ever says a bare "Yes" or "OK" for a destructive action — say the actual verb ("Delete", "Remove", "Discard") so the confirmation is legible on its own, out of context (a screen reader announcing just the button, a person tabbing back to it later).
- The popover variant's `[data-slot="panel"]` starts `hidden`; toggling that attribute (or `display`) is the only state a consumer manages — no library engine required, same "consumer owns open state" model as `datepicker`.

## Styling (cia mixins)

```scss
// ConfirmDialog.module.scss
@use 'css-is-awesome/api' as cia;

.confirm-dialog {
  @include cia.modal;

  [data-slot="body"]    { @include cia.flex($gap: 3, $align: flex-start); }
  [data-slot="icon"]    { color: cia.color(warning-default); font-size: 1.5rem; }
  [data-slot="footer"]  { @include cia.toolbar; }

  [data-slot="reject"]  { @include cia.btn(ghost); }
  [data-slot="accept"]  { @include cia.btn(error); } // never `primary` for a destructive action — see Pitfalls
}
.confirm-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
```

```scss
// ConfirmPopup.module.scss
@use 'css-is-awesome/api' as cia;

.confirm-popup {
  position: relative;
  display: inline-block;
}
[data-slot="panel"] {
  @include cia.popover-base($p: 3, $max-width: 18rem);
  position: absolute;
  inset-block-start: calc(100% + #{cia.space(1)});
  inset-inline-start: 0;
  z-index: 10;

  @include cia.flex($direction: column, $gap: 2);
}
[data-slot="icon"] { color: cia.color(warning-default); }
[data-slot="actions"] {
  @include cia.toolbar($gap: 2);
}
[data-slot="reject"] { @include cia.btn(ghost); }
[data-slot="accept"] { @include cia.btn(error); }
```

## Interactivity

Modal variant — identical to `dialog`: open with `dialogEl.showModal()`, close with `dialogEl.close()`. Reject fires first if the user chose it (or Esc/backdrop), Accept fires only from its own button.

Popover variant (no native element does this one for you, so a consumer owns a little more):
- Open: set the trigger's `aria-expanded="true"`, un-hide the panel, move focus into it (onto Reject, since it's `autofocus`'d).
- Close on: Accept click, Reject click, Escape, or an outside click — in every case, `aria-expanded="false"`, re-hide the panel, and return focus to the trigger.
- Only one confirm-popup should be open at a time; opening a second one closes the first (same rule datepicker's panel follows for its own single-instance assumption).

Both variants: **Accept fires the destructive action, then closes** — never the other order, so a slow action can't be triggered twice by an impatient double-click before the UI has a chance to disable itself.

## A11y checklist

- [ ] Modal variant inherits `dialog`'s full checklist — `aria-labelledby`, focus trap, Esc-to-close, focus return — unchanged ([WAI-ARIA Authoring Practices: Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/))
- [ ] Popover variant's trigger has `aria-haspopup="dialog"` and `aria-expanded` kept in sync with panel visibility ([WAI-ARIA Authoring Practices: Dialog (Non-Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/))
- [ ] Popover panel is `role="dialog"` with an accessible name (`aria-label`, or `aria-labelledby` pointing at the message)
- [ ] Focus moves into the popover panel on open and returns to the trigger on close, matching the modal variant's native behavior
- [ ] The destructive action's button has a specific, verb-based accessible name — never a bare "Yes"/"OK" ([WCAG 2.2 SC 2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html))
- [ ] The decorative icon is `aria-hidden="true"`; the message text alone carries the meaning

## Framework examples

### React

```tsx
"use client";
import { useRef } from "react";
import styles from "./ConfirmDialog.module.scss";

export default function DeleteFileButton() {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button onClick={() => ref.current?.showModal()}>Delete file</button>

      <dialog ref={ref} className={styles.confirmDialog} aria-labelledby="confirm-title">
        <main data-slot="body">
          <span data-slot="icon" aria-hidden="true">⚠</span>
          <p id="confirm-title">Delete this file? This action cannot be undone.</p>
        </main>
        <footer data-slot="footer">
          <form method="dialog" style={{ display: "contents" }}>
            <button data-slot="reject" value="reject" autoFocus>Cancel</button>
            <button data-slot="accept" value="accept" onClick={() => deleteFile()}>Delete</button>
          </form>
        </footer>
      </dialog>
    </>
  );
}
```

### Vue

```vue
<script setup>
import { ref } from "vue";
const dialogRef = ref(null);
</script>

<template>
  <button @click="dialogRef?.showModal()">Delete file</button>

  <dialog ref="dialogRef" class="confirm-dialog" aria-labelledby="confirm-title">
    <main data-slot="body">
      <span data-slot="icon" aria-hidden="true">⚠</span>
      <p id="confirm-title">Delete this file? This action cannot be undone.</p>
    </main>
    <footer data-slot="footer">
      <form method="dialog" style="display: contents">
        <button data-slot="reject" value="reject" autofocus>Cancel</button>
        <button data-slot="accept" value="accept" @click="deleteFile">Delete</button>
      </form>
    </footer>
  </dialog>
</template>
```

### Svelte

```svelte
<script>
  let dialogEl;
  function confirmDelete() { dialogEl?.showModal(); }
  function deleteFile() { /* the real delete */ }
</script>

<button on:click={confirmDelete}>Delete file</button>

<dialog bind:this={dialogEl} class="confirm-dialog" aria-labelledby="confirm-title">
  <main data-slot="body">
    <span data-slot="icon" aria-hidden="true">⚠</span>
    <p id="confirm-title">Delete this file? This action cannot be undone.</p>
  </main>
  <footer data-slot="footer">
    <form method="dialog" style="display: contents">
      <button data-slot="reject" value="reject" autofocus>Cancel</button>
      <button data-slot="accept" value="accept" on:click={deleteFile}>Delete</button>
    </form>
  </footer>
</dialog>
```

### Vanilla (Web Component)

```js
class ConfirmDialog extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <dialog aria-labelledby="confirm-title">
        <main data-slot="body">
          <span data-slot="icon" aria-hidden="true">⚠</span>
          <p id="confirm-title">${this.getAttribute("message") ?? "Are you sure?"}</p>
        </main>
        <footer data-slot="footer">
          <form method="dialog" style="display: contents">
            <button data-slot="reject" value="reject" autofocus>Cancel</button>
            <button data-slot="accept" value="accept">${this.getAttribute("accept-label") ?? "Confirm"}</button>
          </form>
        </footer>
      </dialog>
    `;
    this._dialog = this.querySelector("dialog");
    this._dialog.addEventListener("close", () => {
      if (this._dialog.returnValue === "accept") this.dispatchEvent(new CustomEvent("confirm"));
    });
  }
  open() { this._dialog?.showModal(); }
}
customElements.define("confirm-dialog", ConfirmDialog);

// usage: <confirm-dialog message="Delete this file?" accept-label="Delete"></confirm-dialog>
// document.querySelector('confirm-dialog').addEventListener('confirm', deleteFile);
```

## Pitfalls

- **Don't use `btn(primary)` on the accept button.** `primary` is the visual weight a UI uses for the action it *wants* you to take. A destructive confirm should read as deliberate, not encouraged — `btn(error)` (cia's status-driven danger variant) sits better than the button an impatient user's muscle memory reaches for.
- **Don't skip the message even when the button label seems to say it all.** "Delete" on a button and "Delete this file? This action cannot be undone." as the message are not redundant — the message is what a screen reader user hears first, before the button.
- **Popover variant: only one open at a time.** If your app can trigger several confirm-popups from a list (e.g. a "remove" button per row), closing any previously-open one before opening a new one avoids two floating panels stacking on top of each other.

## Related recipes

- [`dialog`](./dialog.md) — the modal variant is a thin preset over this; the mechanics (open/close/focus/Esc) are entirely inherited, not re-taught
- [`app-shell`](./app-shell.md) — its Settings modal is the same `dialog`-recipe pattern this recipe's modal variant presets
- [`data-table`](./data-table.md) and [`admin-dashboard-layout`](./admin-dashboard-layout.md) — a per-row delete action is the most common real place to reach for the popover variant
