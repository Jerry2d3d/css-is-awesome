---
name: form-validation-html5
description: Zero-JS form validation using native HTML5 constraints and the :user-invalid/:user-valid pseudo-classes, plus a small submit-time error summary via checkValidity().
category: forms
complexity: simple
cia-version: ">=1.11.1"
---

## Use this when

You need form validation and don't want (or need) a validation library. The
browser already validates `required`, `pattern`, `minlength`, `type="email"`
and friends for free — the only thing missing is the *styling*, and CSS has
had an answer for that since `:user-invalid`/`:user-valid` reached Baseline.
This is the zero-dependency, zero-JavaScript-for-styling starting point;
reach for [`react-hook-form`](./form-validation-react-hook-form.md) or
[Zod](./form-validation-zod.md) when you need cross-field rules, async
checks, or a schema shared with your backend.

## Structure (raw HTML)

```html
<form novalidate>
  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required />
    <span class="field-error" id="email-error">Enter a valid email address.</span>
  </div>

  <div class="field">
    <label for="username">Username</label>
    <input id="username" name="username" type="text" required minlength="3" pattern="[a-zA-Z0-9_]+" />
    <span class="field-error" id="username-error">3+ letters, numbers, or underscores.</span>
  </div>

  <div class="field">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" required pattern=".{8,}" />
    <span class="field-error" id="password-error">At least 8 characters.</span>
  </div>

  <div class="form-summary" role="alert" hidden></div>

  <button type="submit">Create account</button>
</form>
```

`novalidate` on the `<form>` turns off the browser's own error-bubble UI
(which you can't style) while leaving every constraint — `required`,
`pattern`, `minlength`, `type="email"` — fully active. The browser still
validates; only its default *presentation* is disabled.

## Styling (cia mixins)

```scss
@use 'css-is-awesome/api' as cia;

.field {
  display: flex;
  flex-direction: column;
  gap: cia.space(1);
  margin-block-end: cia.space(4);

  input {
    @include cia.input-base;
  }

  // Zero-JS error styling: :user-invalid only matches after the user has
  // interacted with the field (unlike :invalid, which matches an empty
  // required field before the user has typed anything — a bad first
  // impression). :has() reveals the sibling message without any JS.
  &:has(input:user-invalid) input {
    border-color: var(--error-default);
  }
  &:has(input:user-invalid) .field-error {
    display: block;
  }
  &:has(input:user-valid) input {
    border-color: var(--success-default);
  }

  .field-error {
    display: none;
    color: var(--error-text);
    font-size: 0.85em;
  }
}

.form-summary {
  padding: cia.space(3) cia.space(4);
  margin-block-end: cia.space(4);
  border-radius: var(--radius-md);
  background: var(--error-subtle);
  color: var(--error-text);

  &[hidden] {
    display: none;
  }
}
```

`--error-default`, `--error-subtle`, `--error-text`, `--success-default` are
real contract tokens (`CONTRACT.md`'s Status section) — no new tokens, no
custom color decisions.

## Interactivity

**Styling needs zero JavaScript** — `:user-invalid`/`:user-valid` +
`:has()` do the whole per-field error/success reveal natively. The only
script needed is the epic-required error *summary* on submit, because a
summary needs to enumerate every failing field, which CSS alone can't do:

```js
form.addEventListener("submit", (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    const invalid = [...form.elements].filter((el) => el.willValidate && !el.validity.valid);
    summary.textContent = `Fix ${invalid.length} field(s): ${invalid.map((el) => el.labels[0]?.textContent).join(", ")}`;
    summary.hidden = false;
    invalid[0]?.focus();
  } else {
    summary.hidden = true;
  }
});
```

- **Native:** every per-field validation rule and its live error/success
  styling — `required`, `pattern`, `minlength`, `type="email"`,
  `:user-invalid`, `:user-valid`, `:has()`.
- **JS:** only the submit-time summary banner and moving focus to the first
  invalid field.
- **Edge cases:** `novalidate` must stay on the `<form>` or the browser's
  native error bubbles fight your CSS. SSR is unaffected — none of this
  needs hydration to work; the summary script is a plain progressive
  enhancement that a no-JS visitor simply doesn't get (the browser's native
  validation still blocks submission either way).

## A11y checklist

- [ ] Every input has a `<label for>` — `:user-invalid` styling alone
  conveys nothing to a screen reader without one ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Each input's error message is linked via `aria-describedby` pointing
  at its `.field-error` span, so a screen reader announces the reason, not
  just "invalid" ([WCAG 2.2 SC 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
- [ ] The submit-time summary uses `role="alert"` so screen readers announce
  it the moment it appears, without the user needing to find it
  ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] Focus moves to the first invalid field on a failed submit, so
  keyboard users land where the problem is instead of staying on the submit
  button ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))

## Framework examples

### React

```tsx
import { useRef, useState } from "react";

export function SignupForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [summary, setSummary] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = formRef.current!;
    if (!form.checkValidity()) {
      e.preventDefault();
      const invalid = [...form.elements].filter(
        (el): el is HTMLInputElement => el instanceof HTMLInputElement && el.willValidate && !el.validity.valid,
      );
      setSummary(`Fix ${invalid.length} field(s): ${invalid.map((el) => el.labels?.[0]?.textContent).join(", ")}`);
      invalid[0]?.focus();
    } else {
      setSummary(null);
    }
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required aria-describedby="email-error" />
        <span className="field-error" id="email-error">Enter a valid email address.</span>
      </div>
      {summary && <div className="form-summary" role="alert">{summary}</div>}
      <button type="submit">Create account</button>
    </form>
  );
}
```

### Vue

```vue
<template>
  <form novalidate @submit="handleSubmit" ref="formRef">
    <div class="field">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required aria-describedby="email-error" />
      <span class="field-error" id="email-error">Enter a valid email address.</span>
    </div>
    <div v-if="summary" class="form-summary" role="alert">{{ summary }}</div>
    <button type="submit">Create account</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
const formRef = ref<HTMLFormElement>();
const summary = ref<string | null>(null);

function handleSubmit(e: Event) {
  const form = formRef.value!;
  if (!form.checkValidity()) {
    e.preventDefault();
    const invalid = [...form.elements].filter(
      (el): el is HTMLInputElement => el instanceof HTMLInputElement && el.willValidate && !el.validity.valid,
    );
    summary.value = `Fix ${invalid.length} field(s).`;
    invalid[0]?.focus();
  } else {
    summary.value = null;
  }
}
</script>
```

### Svelte

```svelte
<script lang="ts">
  let formEl: HTMLFormElement;
  let summary: string | null = null;

  function handleSubmit(e: Event) {
    if (!formEl.checkValidity()) {
      e.preventDefault();
      const invalid = [...formEl.elements].filter(
        (el): el is HTMLInputElement => el instanceof HTMLInputElement && el.willValidate && !el.validity.valid,
      );
      summary = `Fix ${invalid.length} field(s).`;
      invalid[0]?.focus();
    } else {
      summary = null;
    }
  }
</script>

<form novalidate bind:this={formEl} on:submit={handleSubmit}>
  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required aria-describedby="email-error" />
    <span class="field-error" id="email-error">Enter a valid email address.</span>
  </div>
  {#if summary}<div class="form-summary" role="alert">{summary}</div>{/if}
  <button type="submit">Create account</button>
</form>
```

### Vanilla

```html
<form novalidate id="signup-form">
  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required aria-describedby="email-error" />
    <span class="field-error" id="email-error">Enter a valid email address.</span>
  </div>
  <div class="form-summary" role="alert" hidden></div>
  <button type="submit">Create account</button>
</form>

<script type="module">
  const form = document.getElementById("signup-form");
  const summary = form.querySelector(".form-summary");
  form.addEventListener("submit", (e) => {
    if (!form.checkValidity()) {
      e.preventDefault();
      const invalid = [...form.elements].filter((el) => el.willValidate && !el.validity.valid);
      summary.textContent = `Fix ${invalid.length} field(s).`;
      summary.hidden = false;
      invalid[0]?.focus();
    } else {
      summary.hidden = true;
    }
  });
</script>
```

## Pitfalls

- **`novalidate` is required**, or the browser's native error-bubble UI
  appears alongside your CSS styling — usually looking broken, not doubled.
- **`:user-invalid` needs *interaction* first.** An empty required field is
  not styled as an error on page load — correct, since punishing the user
  before they've typed anything is exactly the UX `:user-invalid` was
  designed to avoid. Don't reach for `:invalid` expecting the same
  behavior; it matches immediately.
- **`aria-describedby` must point at an ID that exists even when the error
  is hidden** (`display: none` still keeps the element — and its text — in
  the accessibility tree's reach via `aria-describedby`; don't `display:
  none` AND remove the node, or the reference breaks).

## Related recipes

- [`form-validation-react-hook-form`](./form-validation-react-hook-form.md) — when you need cross-field rules or a controlled form library.
- [`form-validation-zod`](./form-validation-zod.md) — when you want a schema shared with your backend.
