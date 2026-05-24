---
name: dialog
description: Accessible modal dialog built on the native HTML <dialog> element.
category: overlay
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You need a modal — confirm, info, form, lightbox — that traps focus while open, returns focus on close, dismisses on Esc, and hides the background from screen readers. Use this recipe if you can target browsers with native `<dialog>` support (Baseline since 2022 across Chrome/Firefox/Safari/Edge). If you need older browser support, reach for a focus-trap library + `[role="dialog"]` div.

## Structure (raw HTML)

```html
<dialog data-cia-recipe="dialog" aria-labelledby="my-dialog-title">
  <header data-slot="header">
    <h2 id="my-dialog-title">Dialog title</h2>
    <button data-slot="close" aria-label="Close" formmethod="dialog">×</button>
  </header>
  <main data-slot="body">
    Dialog body content goes here.
  </main>
  <footer data-slot="footer">
    <button data-slot="cancel" formmethod="dialog">Cancel</button>
    <button data-slot="confirm" autofocus>Confirm</button>
  </footer>
</dialog>
```

Notes on the markup:
- `<dialog>` element is the source of truth — its `.showModal()` method does focus trap + Esc handling + `aria-modal` + backdrop, all natively
- `aria-labelledby` points to the title element so screen readers announce the dialog by name on open
- `formmethod="dialog"` on the cancel/close buttons closes the dialog without a JS handler when the dialog is inside a `<form>`
- `autofocus` on the primary action sets initial focus when the dialog opens

## Styling (cia mixins)

```scss
@use 'css-is-awesome' as cia;

.my-dialog {
  @include cia.modal;

  [data-slot="header"]  { @include cia.toolbar; }
  [data-slot="body"]    { @include cia.stack($gap: 4); }
  [data-slot="footer"]  { @include cia.toolbar; }

  [data-slot="close"]   { @include cia.btn(ghost); margin-inline-start: auto; }
  [data-slot="cancel"]  { @include cia.btn(ghost); }
  [data-slot="confirm"] { @include cia.btn(primary); }
}

/* Backdrop is exposed by the browser via ::backdrop */
.my-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}
```

## Interactivity

Native behavior of `<dialog>.showModal()`:
- Renders above all other content in the top-layer
- Adds `[open]` and `aria-modal="true"`
- Traps Tab focus inside the dialog
- Dismisses on Esc (calls `.close()` with no `returnValue`)
- Disables interaction with the page behind it
- Exposes `::backdrop` for backdrop styling

To open: `dialogEl.showModal()`. To close: `dialogEl.close(optionalReturnValue)`. The return value is readable on the `close` event for "Cancel vs Confirm" wiring.

Consumer responsibilities:
- Show / close from your component logic (button clicks, route changes, etc.)
- Optionally listen for the `close` event to read `returnValue`
- If using `<form method="dialog">`, submit buttons close with `returnValue = button.value`

No JS shim required for any of the above — every behavior is native.

## A11y checklist

- [ ] `aria-labelledby` points to the title element ([WAI-ARIA Authoring Practices: Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/))
- [ ] Initial focus on the primary action via `autofocus`, OR moved programmatically to the first focusable element on open
- [ ] Background content has `inert` attribute when dialog is open (automatic with `.showModal()` — the top-layer hides everything from accessibility tree)
- [ ] Esc closes the dialog (native to `<dialog>.showModal()`)
- [ ] Close button has accessible name (`aria-label="Close"`)
- [ ] Focus returns to the trigger element on close (browser handles this automatically when `.showModal()` was the open mechanism)
- [ ] If dialog contains a `<form>`, use `method="dialog"` so submission closes the dialog naturally (avoids hand-wired close handlers)
- [ ] Color contrast on `::backdrop` does not interfere with the dialog's own contrast budget ([WCAG 2.2 SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))

## Framework examples

### React

```tsx
"use client";
import { useRef } from "react";
import styles from "./MyDialog.module.scss";

export default function MyDialog() {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button onClick={() => ref.current?.showModal()}>Open dialog</button>

      <dialog
        ref={ref}
        className={styles.myDialog}
        aria-labelledby="my-dialog-title"
        onClose={(e) => {
          // e.currentTarget.returnValue is the close value
        }}
      >
        <header data-slot="header">
          <h2 id="my-dialog-title">Delete record?</h2>
          <button data-slot="close" formMethod="dialog" aria-label="Close">×</button>
        </header>
        <main data-slot="body">This action cannot be undone.</main>
        <footer data-slot="footer">
          <form method="dialog" style={{ display: "contents" }}>
            <button data-slot="cancel" value="cancel">Cancel</button>
            <button data-slot="confirm" value="confirm" autoFocus>Delete</button>
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
const open = () => dialogRef.value?.showModal();
</script>

<template>
  <button @click="open">Open dialog</button>

  <dialog
    ref="dialogRef"
    class="my-dialog"
    aria-labelledby="my-dialog-title"
  >
    <header data-slot="header">
      <h2 id="my-dialog-title">Delete record?</h2>
      <button data-slot="close" formmethod="dialog" aria-label="Close">×</button>
    </header>
    <main data-slot="body">This action cannot be undone.</main>
    <footer data-slot="footer">
      <form method="dialog" style="display: contents">
        <button data-slot="cancel" value="cancel">Cancel</button>
        <button data-slot="confirm" value="confirm" autofocus>Delete</button>
      </form>
    </footer>
  </dialog>
</template>
```

### Svelte

```svelte
<script>
  let dialogEl;
  const open = () => dialogEl?.showModal();
</script>

<button on:click={open}>Open dialog</button>

<dialog
  bind:this={dialogEl}
  class="my-dialog"
  aria-labelledby="my-dialog-title"
>
  <header data-slot="header">
    <h2 id="my-dialog-title">Delete record?</h2>
    <button data-slot="close" formmethod="dialog" aria-label="Close">×</button>
  </header>
  <main data-slot="body">This action cannot be undone.</main>
  <footer data-slot="footer">
    <form method="dialog" style="display: contents">
      <button data-slot="cancel" value="cancel">Cancel</button>
      <button data-slot="confirm" value="confirm" autofocus>Delete</button>
    </form>
  </footer>
</dialog>
```

### Vanilla (Web Component)

```js
class MyDialog extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <dialog aria-labelledby="my-dialog-title">
        <header data-slot="header">
          <h2 id="my-dialog-title">${this.getAttribute("title") ?? "Dialog"}</h2>
          <button data-slot="close" formmethod="dialog" aria-label="Close">×</button>
        </header>
        <main data-slot="body"><slot></slot></main>
        <footer data-slot="footer">
          <form method="dialog" style="display: contents">
            <button data-slot="cancel" value="cancel">Cancel</button>
            <button data-slot="confirm" value="confirm" autofocus>OK</button>
          </form>
        </footer>
      </dialog>
    `;
    this._dialog = this.querySelector("dialog");
  }
  open() { this._dialog?.showModal(); }
  close(returnValue) { this._dialog?.close(returnValue); }
}
customElements.define("my-dialog", MyDialog);

// usage in HTML:
// <my-dialog title="Delete record?">This action cannot be undone.</my-dialog>
// <script>document.querySelector('my-dialog').open();</script>
```

## Variants

### Confirm / cancel only (no header dismiss)

Drop the `[data-slot="close"]` button from the header. Esc still closes; the cancel button in the footer is the primary dismiss.

### Drawer (slide-in from edge)

Override `.my-dialog` with `inset-inline-end: 0; margin-inline: auto 0; block-size: 100dvh; max-block-size: none;` to anchor right edge, full height. Add a slide animation:

```scss
.my-dialog[open] {
  animation: slide-in cia.duration(normal) cia.ease(out) both;
}
@keyframes slide-in {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
```

## Pitfalls

- **Form inside dialog with another method:** Setting `<form method="get">` etc. inside a `<dialog>` breaks the native close-on-submit. Either nest a separate `<form method="dialog">` around the close buttons OR handle submission explicitly with `event.preventDefault()` + `dialogEl.close()`.
- **Stacking dialogs:** `.showModal()` puts the dialog in the top-layer. Nesting multiple modal dialogs works but each pushes the previous one further from focus; consider whether your UX really needs nested modals.
- **iOS Safari quirks:** Older iOS Safari (< 17) had `::backdrop` rendering bugs and inconsistent scroll-lock. If you target older Safari, test the backdrop and consider a polyfill.
- **`<dialog>` inside `display: contents` ancestors:** Some CSS layout edge cases can affect the top-layer rendering. If positioning looks off, check that ancestor `transform`, `filter`, or `perspective` isn't establishing a containing block.

## Related recipes

- [`bare-tags`](./_bare-tags.scss) — base bare `<dialog>` styling that applies if you skip a custom class name
- (planned v1.1) `command-palette.md` — Cmd+K palette built on `<dialog>` + combobox pattern
- (planned v1.1) `toast.md` — non-modal transient notifications (`[popover]` based)
