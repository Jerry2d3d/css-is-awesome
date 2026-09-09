---
name: form-validation-zod
description: Validate a form against a Zod schema on submit, map issues to fields by path, and reuse the same schema server-side or with react-hook-form's zodResolver.
category: forms
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

You want validation rules defined once, as data, instead of scattered across
`required`/`pattern` attributes or a library's field-by-field config — and
especially when the same shape needs validating again on the server (a Zod
schema is plain JS/TS; nothing about it is browser-only). Zod is framework-
native, so this recipe works the same in React, Vue, Svelte, or vanilla; the
difference between them is only how you read the form's current values.

## Structure (raw HTML)

```html
<form novalidate>
  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" aria-describedby="email-error" />
    <span class="field-error" id="email-error"></span>
  </div>

  <div class="field">
    <label for="age">Age</label>
    <input id="age" name="age" type="number" aria-describedby="age-error" />
    <span class="field-error" id="age-error"></span>
  </div>

  <div class="form-summary" role="alert" hidden></div>
  <button type="submit">Continue</button>
</form>
```

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
  // Same attribute-driven pattern as the react-hook-form recipe — Zod's
  // parse result is plain JS, not a DOM pseudo-state, so the styling reads
  // a data attribute set from the parsed result.
  &[data-invalid="true"] input {
    border-color: var(--error-default);
  }
  &[data-invalid="true"] .field-error {
    display: block;
  }
  .field-error {
    display: none;
    color: var(--error-text);
    font-size: 0.85em;
  }
}
```

## Interactivity

```ts
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  age: z.coerce.number().int().min(13, "Must be 13 or older."),
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const result = signupSchema.safeParse(data);

  // Clear previous state
  form.querySelectorAll(".field").forEach((f) => f.removeAttribute("data-invalid"));

  if (!result.success) {
    for (const issue of result.error.issues) {
      const name = issue.path[0];
      const field = form.querySelector(`[name="${name}"]`)?.closest(".field");
      if (field) {
        field.dataset.invalid = "true";
        field.querySelector(".field-error").textContent = issue.message;
      }
    }
    return;
  }

  // result.data is fully typed and parsed (age is a number, not a string)
  console.log(result.data);
});
```

- **Native:** the `<form>`/`FormData` reading, same as the HTML5 recipe.
- **JS:** `schema.safeParse()` — never throws, returns `{ success, data }`
  or `{ success: false, error }`. `z.coerce.number()` handles the fact that
  every form field is a string; without it, `age` fails as "not a number"
  even when the user typed a valid one.
- **Server reuse:** the identical `signupSchema` validates the same payload
  server-side — one source of truth for the rule, not two definitions that
  can drift apart.

### With react-hook-form (`zodResolver`)

If you're already on [react-hook-form](./form-validation-react-hook-form.md),
point it at the same schema instead of hand-mapping issues:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(signupSchema),
});
```

`errors.email.message` is now the Zod issue message directly — no manual
issue-to-field mapping loop.

## A11y checklist

- [ ] Each field's error span is linked via `aria-describedby`, populated
  from `issue.message` — a generic "invalid" tells a screen-reader user
  nothing actionable ([WCAG 2.2 SC 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
- [ ] `result.error.issues` are also summarized somewhere announced with
  `role="alert"`, not just attached silently to fields — a screen-reader
  user submitting from the last field otherwise gets no signal that
  earlier fields failed ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] Focus moves to the first field named in `issues[0].path` on a failed
  submit ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))
- [ ] Numeric/coerced fields (`z.coerce.number()`) still use `type="number"`
  or `inputmode="numeric"` on the `<input>` — Zod coercion doesn't give a
  mobile user a numeric keyboard; the HTML attribute does
  ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))

## Framework examples

Zod itself is framework-agnostic — `signupSchema.safeParse(data)` is
identical everywhere. The examples differ only in how the form's current
values get into `data`.

### React

```tsx
import { useState } from "react";
import { signupSchema } from "./schema";

export function SignupForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const result = signupSchema.safeParse(data);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    console.log(result.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field" data-invalid={!!errors.email}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" aria-describedby="email-error" />
        <span className="field-error" id="email-error">{errors.email}</span>
      </div>
      <button type="submit">Continue</button>
    </form>
  );
}
```

### Vue

```vue
<template>
  <form novalidate @submit.prevent="handleSubmit">
    <div class="field" :data-invalid="!!errors.email">
      <label for="email">Email</label>
      <input id="email" name="email" aria-describedby="email-error" />
      <span class="field-error" id="email-error">{{ errors.email }}</span>
    </div>
    <button type="submit">Continue</button>
  </form>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { signupSchema } from "./schema";
const errors = reactive<Record<string, string>>({});

function handleSubmit(e: Event) {
  const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
  const result = signupSchema.safeParse(data);
  Object.keys(errors).forEach((k) => delete errors[k]);
  if (!result.success) {
    for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message;
    return;
  }
  console.log(result.data);
}
</script>
```

### Svelte

```svelte
<script lang="ts">
  import { signupSchema } from "./schema";
  let errors: Record<string, string> = {};

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    const result = signupSchema.safeParse(data);
    if (!result.success) {
      errors = Object.fromEntries(result.error.issues.map((i) => [i.path[0], i.message]));
      return;
    }
    errors = {};
    console.log(result.data);
  }
</script>

<form novalidate on:submit={handleSubmit}>
  <div class="field" data-invalid={!!errors.email}>
    <label for="email">Email</label>
    <input id="email" name="email" aria-describedby="email-error" />
    <span class="field-error" id="email-error">{errors.email ?? ""}</span>
  </div>
  <button type="submit">Continue</button>
</form>
```

### Vanilla

```js
// See "Interactivity" above — that example IS the vanilla implementation,
// no framework layer needed (schema.safeParse() straight off FormData).
```

## Pitfalls

- **Every `FormData` value is a string.** `z.coerce.number()`/
  `z.coerce.boolean()` on numeric/checkbox fields, or every number field
  fails validation for the mundane reason that `"25" !== 25`.
- **`issue.path` can be nested** (`["address", "zip"]` for an object
  field) — `issue.path[0]` only works for flat schemas like the one here;
  join the path for a nested form.
- **Don't re-derive the schema on the server by hand.** The entire point is
  one schema, two places. Export it from a shared module both sides import.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — native constraints only, zero dependencies.
- [`form-validation-react-hook-form`](./form-validation-react-hook-form.md) — pairs directly via `zodResolver`.
