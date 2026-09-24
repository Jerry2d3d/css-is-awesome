---
name: form-validation-async
description: The "is this username taken?" pattern — debounced input, an abortable in-flight check, a loading spinner, and a success or error state, none of which a client-only schema can express.
category: forms
complexity: complex
cia-version: ">=1.11.1"
---

## Use this when

A field's validity depends on something the browser can't know on its
own — a username availability check, an email that must not already be
registered, a coupon code that has to be looked up. This needs a network
round trip per keystroke-pause, which means three problems the other
validation recipes don't have: **debouncing** (don't fire a request per
keystroke), **cancellation** (an in-flight request for "al" shouldn't
overwrite the result for "alice" if it resolves later), and a genuine
**loading state** (the field is neither valid nor invalid while the check
is pending).

## Structure (raw HTML)

```html
<div class="field" data-status="idle">
  <label for="username">Username</label>
  <div class="field-input-wrap">
    <input id="username" name="username" type="text" aria-describedby="username-status" autocomplete="off" />
    <span class="field-spinner" aria-hidden="true"></span>
  </div>
  <span class="field-status" id="username-status" role="status"></span>
</div>
```

`data-status` on the wrapper drives which of idle / checking / available /
taken the field shows — set from script, since none of these are states CSS
can derive on its own (no pseudo-class means "a fetch is pending").

## Styling (cia mixins)

```scss
@use 'css-is-awesome/api' as cia;

.field {
  display: flex;
  flex-direction: column;
  gap: cia.space(1);
  margin-block-end: cia.space(4);
}

.field-input-wrap {
  position: relative;

  input {
    @include cia.input-base;
    padding-inline-end: cia.space(8); // room for the spinner/icon
  }
}

.field-spinner {
  display: none;
  position: absolute;
  inset-inline-end: cia.space(3);
  inset-block-start: 50%;
  translate: 0 -50%;
}

// data-status drives which affordance shows — spinner while checking,
// nothing extra once settled (the status text below carries the result).
.field[data-status="checking"] {
  .field-spinner {
    display: block;
    @include cia.spinner($size: 1em);
  }
}
.field[data-status="available"] input {
  border-color: var(--success-default);
}
.field[data-status="taken"] input {
  border-color: var(--error-default);
}

.field-status {
  font-size: 0.85em;

  .field[data-status="available"] & {
    color: var(--success-text);
  }
  .field[data-status="taken"] & {
    color: var(--error-text);
  }
}
```

## Interactivity

```js
const AbortableCheck = (() => {
  let controller = null;
  let timer = null;

  return function check(username, onResult) {
    clearTimeout(timer);
    controller?.abort(); // cancel whatever was in flight — its result would be stale

    timer = setTimeout(() => {
      controller = new AbortController();
      checkUsername(username, controller.signal)
        .then(onResult)
        .catch((err) => {
          if (err.name !== "AbortError") onResult({ error: true });
        });
    }, 500);
  };
})();

// The "endpoint." A real project replaces this with fetch(url, { signal });
// AbortController cancellation works identically either way — the browser
// aborts a real fetch's underlying request, this just rejects the timer.
const TAKEN = new Set(["admin", "root", "test", "cia"]);
function checkUsername(username, signal) {
  return new Promise((resolve, reject) => {
    const delay = setTimeout(() => resolve({ available: !TAKEN.has(username.toLowerCase()) }), 600);
    signal.addEventListener("abort", () => {
      clearTimeout(delay);
      reject(new DOMException("aborted", "AbortError"));
    });
  });
}

const field = document.querySelector('[data-status]');
const input = field.querySelector("input");
const status = field.querySelector(".field-status");

input.addEventListener("input", () => {
  const value = input.value.trim();
  if (value.length < 3) {
    field.dataset.status = "idle";
    status.textContent = "";
    return;
  }
  field.dataset.status = "checking";
  input.setAttribute("aria-busy", "true");
  status.textContent = "Checking availability…";

  AbortableCheck(value, (result) => {
    input.removeAttribute("aria-busy");
    if (result.error) {
      field.dataset.status = "idle";
      status.textContent = "Couldn't check right now — try again.";
    } else if (result.available) {
      field.dataset.status = "available";
      status.textContent = `"${value}" is available.`;
    } else {
      field.dataset.status = "taken";
      status.textContent = `"${value}" is already taken.`;
    }
  });
});
```

- **Debounce:** the 500ms `setTimeout`, reset on every keystroke — only the
  pause after typing stops actually fires a check.
- **Cancel-in-flight:** `controller.abort()` on the *previous* check before
  starting a new one. Without this, typing "al" → "ali" → "alice" quickly
  can have "al"'s slower response arrive *after* "alice"'s faster one and
  stomp the correct result — a real, common bug class this pattern exists
  specifically to prevent.
- **Loading state:** `aria-busy="true"` on the input plus a visible spinner
  for the checking window; both clear whether the check resolves or errors.

## A11y checklist

- [ ] `aria-busy="true"` on the input while a check is pending, removed
  when it settles — screen readers announce the busy state instead of
  silence ([WCAG 2.1 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html))
- [ ] The result text lives in a `role="status"` element (not `alert` — a
  live availability check isn't urgent enough to interrupt, `status` is
  announced politely) so screen readers pick up "available"/"taken" without
  a page reload ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] The spinner is `aria-hidden="true"` — it's decorative; the `role="status"`
  text ("Checking availability…") already conveys the same state to assistive tech
  ([WCAG 2.2 SC 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html))
- [ ] The debounce delay (500ms here) stays well under 1 second — long
  enough to avoid a request per keystroke, short enough that a keyboard
  user doesn't wonder if the field is broken

## Framework examples

### React

```tsx
import { useRef, useState } from "react";

export function UsernameField() {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [message, setMessage] = useState("");
  const controllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    clearTimeout(timerRef.current);
    controllerRef.current?.abort();

    if (value.length < 3) {
      setStatus("idle");
      setMessage("");
      return;
    }
    setStatus("checking");
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      controllerRef.current = controller;
      try {
        const available = await checkUsername(value, controller.signal);
        setStatus(available ? "available" : "taken");
        setMessage(available ? `"${value}" is available.` : `"${value}" is already taken.`);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setStatus("idle");
      }
    }, 500);
  }

  return (
    <div className="field" data-status={status}>
      <label htmlFor="username">Username</label>
      <div className="field-input-wrap">
        <input id="username" onChange={handleChange} aria-busy={status === "checking"} aria-describedby="username-status" />
        <span className="field-spinner" aria-hidden="true" />
      </div>
      <span className="field-status" id="username-status" role="status">{message}</span>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div class="field" :data-status="status">
    <label for="username">Username</label>
    <div class="field-input-wrap">
      <input id="username" @input="handleInput" :aria-busy="status === 'checking'" aria-describedby="username-status" />
      <span class="field-spinner" aria-hidden="true" />
    </div>
    <span class="field-status" id="username-status" role="status">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const status = ref<"idle" | "checking" | "available" | "taken">("idle");
const message = ref("");
let controller: AbortController | null = null;
let timer: ReturnType<typeof setTimeout>;

function handleInput(e: Event) {
  const value = (e.target as HTMLInputElement).value.trim();
  clearTimeout(timer);
  controller?.abort();
  if (value.length < 3) { status.value = "idle"; message.value = ""; return; }
  status.value = "checking";
  timer = setTimeout(async () => {
    controller = new AbortController();
    try {
      const available = await checkUsername(value, controller.signal);
      status.value = available ? "available" : "taken";
      message.value = available ? `"${value}" is available.` : `"${value}" is already taken.`;
    } catch (err) {
      if ((err as Error).name !== "AbortError") status.value = "idle";
    }
  }, 500);
}
</script>
```

### Svelte

```svelte
<script lang="ts">
  let status: "idle" | "checking" | "available" | "taken" = "idle";
  let message = "";
  let controller: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout>;

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value.trim();
    clearTimeout(timer);
    controller?.abort();
    if (value.length < 3) { status = "idle"; message = ""; return; }
    status = "checking";
    timer = setTimeout(async () => {
      controller = new AbortController();
      try {
        const available = await checkUsername(value, controller.signal);
        status = available ? "available" : "taken";
        message = available ? `"${value}" is available.` : `"${value}" is already taken.`;
      } catch (err) {
        if ((err as Error).name !== "AbortError") status = "idle";
      }
    }, 500);
  }
</script>

<div class="field" data-status={status}>
  <label for="username">Username</label>
  <div class="field-input-wrap">
    <input id="username" on:input={handleInput} aria-busy={status === "checking"} aria-describedby="username-status" />
    <span class="field-spinner" aria-hidden="true" />
  </div>
  <span class="field-status" id="username-status" role="status">{message}</span>
</div>
```

### Vanilla

```js
// See "Interactivity" above — that example IS the vanilla implementation,
// framework-free (AbortableCheck + the field/input/status wiring).
```

## Pitfalls

- **Debounce alone doesn't fix the race condition.** It reduces how often a
  request fires, but two in-flight requests can still resolve out of
  order — `AbortController` is the actual fix, not an optional extra.
- **Aborting the timer isn't the same as aborting the request.**
  `clearTimeout` stops a check that hasn't started yet; `controller.abort()`
  cancels one that has. This recipe's `AbortableCheck` does both, in that
  order, every time.
- **A static export can't have a real API route for this** (no Node
  server) — if you're statically exporting, the "check" has to be a client-
  side call to an external API, or (as in this recipe's own live demo) a
  simulated one. Don't reach for a Next.js Route Handler expecting it to
  work on `output: "export"`.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — for validation that doesn't need a network round trip.
