---
name: otp-input
description: A segmented one-time-code entry field — per-cell native inputs with auto-advance, backspace-retreat, arrow-key navigation and full-code paste distribution.
category: input
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You need 2FA or email/SMS verification-code entry — the classic "6 boxes" pattern. Build it from **one native `<input>` per cell**, not a single hidden input with a styled overlay: each cell gets `inputmode="numeric"` (mobile numeric keyboard for free), participates in native tab order, and receives paste/autofill the browser already knows how to handle. The JS layer only orchestrates focus movement between cells — it never re-implements text entry.

## Structure (raw HTML)

```html
<div data-cia-recipe="otp-input" role="group" aria-label="Verification code">
  <input
    type="text"
    inputmode="numeric"
    pattern="[0-9]*"
    maxlength="1"
    autocomplete="one-time-code"
    aria-label="Digit 1 of 6"
    data-slot="cell"
  />
  <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit 2 of 6" data-slot="cell" />
  <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit 3 of 6" data-slot="cell" />
  <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit 4 of 6" data-slot="cell" />
  <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit 5 of 6" data-slot="cell" />
  <input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit 6 of 6" data-slot="cell" />
</div>
<span data-slot="paste-announce" aria-live="polite" class="sr-only"></span>
```

Notes on the markup:
- `autocomplete="one-time-code"` belongs **only on the first cell** — that's the WebOTP/SMS-autofill contract; the platform fills the whole code into that one field, and your paste handler (below) is what actually distributes it across the rest.
- `inputmode="numeric"` + `pattern="[0-9]*"` together get the numeric keyboard on both iOS and Android without changing `type` away from `text` (an `input[type=number]` grows spinner UI you don't want and mishandles a leading-zero code).
- `maxlength="1"` is a real constraint, not just a hint — combined with the auto-advance JS it's what makes typing feel like "one keystroke per box."
- The visually-hidden `[data-slot="paste-announce"]` region exists solely so a full-code paste is announced once ("Code entered") instead of six silent field changes.

## Styling (cia mixins)

```scss
// OtpInput.module.scss
@use 'css-is-awesome/api' as cia;

.otp-input {
  @include cia.flex($gap: 2);
}

[data-slot="cell"] {
  inline-size: 2.75rem;
  block-size: 3rem;
  text-align: center;
  border: 1px solid cia.color(border-default);
  border-radius: cia.radius(md);
  background: cia.color(surface-default);
  color: cia.color(text-primary);
  @include cia.font(semibold, 4);
  @include cia.transition(border-color, box-shadow);

  &:focus-visible {
    @include cia.focus-ring;
  }
  &[data-filled="true"] {
    border-color: cia.color(action-primary-default);
  }
  &[data-invalid="true"] {
    border-color: cia.color(error-default);
  }
  &[disabled] {
    opacity: 0.6;
  }
}

.sr-only {
  @include cia.sr-only;
}
```

## Interactivity

- **Type a digit** — fills the cell, advances focus to the next one. On the last cell, filling it fires `onComplete` with the joined code.
- **Backspace** — clears the focused cell if it has a value; if it's already empty, moves focus to the previous cell and clears that one instead (so Backspace always "does something" from the user's position).
- **Arrow Left / Right** — move focus one cell over without changing any value.
- **Paste** (anywhere in the group) — read the pasted string, strip non-digits if the field is numeric-only, distribute one character per cell starting from whichever cell had focus, then move focus to the cell after the last one filled (clamped to the last cell if the paste filled the rest). Announce via the live region.
- **Full code entered** — call the verification check; on failure, mark every cell `data-invalid="true"` and refocus the first cell so retyping is immediate, rather than making the user click back in.

No library is required for any of this — it's ~40 lines of focus/keydown/paste handling. `mask` mode (rendering a filled cell as a dot rather than the digit) is a purely presentational swap in the same handlers, not a different architecture.

## A11y checklist

- [ ] The wrapper is `role="group"` with an `aria-label` naming what's being entered ("Verification code") ([WAI-ARIA: group role](https://www.w3.org/TR/wai-aria-1.2/#group))
- [ ] Each cell has its own accessible name identifying its position ("Digit 1 of 6"), not a shared or missing label ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))
- [ ] Only the first cell carries `autocomplete="one-time-code"` — duplicating it on every cell breaks platform SMS autofill instead of helping it
- [ ] A full-code paste is announced once via a polite live region, not six individual field-change announcements
- [ ] On verification failure, focus returns to the first cell so the user can immediately retype, and the error is announced (`role="alert"` or an adjacent `aria-live` message), not conveyed by cell color alone ([WCAG 2.2 SC 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html))

## Framework examples

### React

```tsx
"use client";
import { useRef, useState } from "react";
import styles from "./OtpInput.module.scss";

export default function OtpInput({ length = 6, onComplete }: { length?: number; onComplete?: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(i: number, digit: string) {
    const next = [...values];
    next[i] = digit;
    setValues(next);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) onComplete?.(next.join(""));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      refs.current[i - 1]?.focus();
      setDigit(i - 1, "");
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const chars = e.clipboardData.getData("text").replace(/\D/g, "").split("");
    const next = [...values];
    let cursor = i;
    for (const c of chars) {
      if (cursor >= length) break;
      next[cursor] = c;
      cursor++;
    }
    setValues(next);
    refs.current[Math.min(cursor, length - 1)]?.focus();
    if (next.every(Boolean)) onComplete?.(next.join(""));
  }

  return (
    <div className={styles.otpInput} role="group" aria-label="Verification code">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1} of ${length}`}
          value={v}
          data-filled={Boolean(v)}
          onChange={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
        />
      ))}
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { ref } from "vue";

const props = defineProps<{ length?: number }>();
const length = props.length ?? 6;
const values = ref(Array(length).fill(""));
const inputs = ref([]);
const emit = defineEmits(["complete"]);

function setDigit(i, digit) {
  values.value[i] = digit;
  if (digit && i < length - 1) inputs.value[i + 1]?.focus();
  if (values.value.every(Boolean)) emit("complete", values.value.join(""));
}
function handleKeydown(i, e) {
  if (e.key === "Backspace" && !values.value[i] && i > 0) {
    inputs.value[i - 1]?.focus();
    setDigit(i - 1, "");
  } else if (e.key === "ArrowLeft" && i > 0) {
    inputs.value[i - 1]?.focus();
  } else if (e.key === "ArrowRight" && i < length - 1) {
    inputs.value[i + 1]?.focus();
  }
}
</script>

<template>
  <div class="otp-input" role="group" aria-label="Verification code">
    <input
      v-for="(v, i) in values"
      :key="i"
      :ref="(el) => (inputs[i] = el)"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      :autocomplete="i === 0 ? 'one-time-code' : 'off'"
      :aria-label="`Digit ${i + 1} of ${length}`"
      :value="v"
      :data-filled="Boolean(v)"
      @input="setDigit(i, $event.target.value.replace(/\D/g, '').slice(-1))"
      @keydown="handleKeydown(i, $event)"
    />
  </div>
</template>
```

### Svelte

```svelte
<script>
  export let length = 6;
  export let onComplete = (code) => {};

  let values = Array(length).fill("");
  let inputs = [];

  function setDigit(i, digit) {
    values[i] = digit;
    values = values;
    if (digit && i < length - 1) inputs[i + 1]?.focus();
    if (values.every(Boolean)) onComplete(values.join(""));
  }
  function handleKeydown(i, e) {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      inputs[i - 1]?.focus();
      setDigit(i - 1, "");
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputs[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      inputs[i + 1]?.focus();
    }
  }
</script>

<div class="otp-input" role="group" aria-label="Verification code">
  {#each values as v, i}
    <input
      bind:this={inputs[i]}
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      autocomplete={i === 0 ? "one-time-code" : "off"}
      aria-label={`Digit ${i + 1} of ${length}`}
      value={v}
      data-filled={Boolean(v)}
      on:input={(e) => setDigit(i, e.target.value.replace(/\D/g, "").slice(-1))}
      on:keydown={(e) => handleKeydown(i, e)}
    />
  {/each}
</div>
```

### Vanilla (Web Component)

```js
class OtpInput extends HTMLElement {
  connectedCallback() {
    const length = Number(this.getAttribute("length") ?? 6);
    this.innerHTML = `<div role="group" aria-label="Verification code">${Array.from(
      { length },
      (_, i) =>
        `<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit ${i + 1} of ${length}" ${
          i === 0 ? 'autocomplete="one-time-code"' : ""
        } data-slot="cell" />`,
    ).join("")}</div>`;

    const cells = [...this.querySelectorAll('[data-slot="cell"]')];
    cells.forEach((cell, i) => {
      cell.addEventListener("input", () => {
        cell.value = cell.value.replace(/\D/g, "").slice(-1);
        cell.dataset.filled = String(Boolean(cell.value));
        if (cell.value && i < cells.length - 1) cells[i + 1].focus();
        if (cells.every((c) => c.value)) {
          this.dispatchEvent(new CustomEvent("complete", { detail: cells.map((c) => c.value).join("") }));
        }
      });
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !cell.value && i > 0) cells[i - 1].focus();
        if (e.key === "ArrowLeft" && i > 0) cells[i - 1].focus();
        if (e.key === "ArrowRight" && i < cells.length - 1) cells[i + 1].focus();
      });
    });
  }
}
customElements.define("otp-input", OtpInput);
```

## Pitfalls

- **Don't build this on one hidden `<input>` with six styled `<div>`s.** It looks right visually but breaks paste, autofill, and every assistive technology's expectation that a form field is an `<input>` — the extra JS to fake all of that back in costs more than six real inputs does.
- **Don't set `autocomplete="one-time-code"` on every cell.** It's a signal for where the platform should insert a full SMS-derived code — repeating it on every cell confuses that behavior rather than reinforcing it.
- **Don't forget the paste path.** Typing works without much thought; a code copied from a Messages app or password manager is the far more common real-world input method, and it's the one most homegrown implementations get wrong first.

## Related recipes

- [`auth-flow`](./auth-flow.md) — the natural surrounding flow (2FA or email-verification step) this recipe plugs into
