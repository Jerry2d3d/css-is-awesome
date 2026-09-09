---
name: form-validation-react-hook-form
description: Form state and validation with react-hook-form, error styling driven from formState.errors and cia's error tokens — register for plain fields, Controller for anything that needs a transformed value.
category: forms
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

You're on React and want validation state (touched, dirty, submitting,
per-field errors) managed for you instead of reading `input.validity` by
hand — and you want re-renders kept to a minimum, which is react-hook-form's
whole pitch (uncontrolled inputs by default). cia does none of the state
management here; it only supplies the tokens the error styling reads.

Reach for [the HTML5 recipe](./form-validation-html5.md) if native
constraints are enough. Reach for [the Zod recipe](./form-validation-zod.md)
if you want a schema — the two compose (`zodResolver`, shown below).

## Structure (raw HTML)

react-hook-form generates the DOM from your JSX (`register` spreads
`name`/`ref`/`onChange`/`onBlur` onto a plain `<input>`), so there's no
separate static markup to show — see **Framework examples** below, which
*is* the structure for this recipe.

```html
<!-- What register() produces on a plain <input>, for reference -->
<div class="field" data-invalid="true">
  <label for="email">Email</label>
  <input id="email" name="email" aria-invalid="true" aria-describedby="email-error" />
  <span class="field-error" id="email-error">Enter a valid email address.</span>
</div>
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

  // react-hook-form doesn't touch the DOM's :invalid/:valid pseudo-state —
  // it's just JS state — so the error styling reads a real attribute
  // instead of a CSS pseudo-class. data-invalid is set from
  // formState.errors in the framework example below.
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

Same tokens as the HTML5 recipe (`--error-default`, `--error-text`) — the
styling layer doesn't change based on which validation strategy drives it.

## Interactivity

- **`register`** for a plain field: `<input {...register("email", { required: true, pattern: /.../ })} />`.
  react-hook-form wires `name`, `ref`, `onChange`, `onBlur` — no manual
  `useState` per field.
- **`Controller`** when the input isn't a plain DOM element, or the value
  needs transforming before it reaches form state (a masked phone number, a
  currency field stripping formatting) — react-hook-form can't `ref` a
  non-native input directly, so `Controller` bridges it via `field.onChange`/
  `field.value`.
- **Reset:** `reset()` clears both values and error state — use it after a
  successful submit rather than manually clearing each field.
- **Submit:** `handleSubmit(onValid, onInvalid)` — `onValid` never runs
  unless every field passes; `onInvalid` (optional) gets the full error map
  for a summary banner.

## A11y checklist

- [ ] Every field wires `aria-invalid={!!errors.field}` and
  `aria-describedby` pointing at its error span — react-hook-form's error
  state has to be manually bridged to ARIA; it doesn't do this for you
  ([WCAG 2.2 SC 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html))
- [ ] Submit-time errors move focus to the first invalid field
  (`setFocus(firstErrorName)`) ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))
- [ ] A submit-error summary (if shown) uses `role="alert"` so it's
  announced without the user hunting for it ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] Labels stay real `<label for>` elements even though react-hook-form
  doesn't require them — `register` only wires the input, not a label
  association ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))

## Framework examples

react-hook-form is React-only — the JS-native equivalent for other
frameworks is a different library with the same *shape* (register a field,
read a reactive error map). Their APIs differ meaningfully enough that
copy-pasting a react-hook-form-shaped example into them would be actively
wrong, so each one is noted with its closest equivalent instead.

### React

```tsx
import { useForm } from "react-hook-form";

type FormValues = { email: string; username: string };

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<FormValues>();

  const onValid = (data: FormValues) => {
    console.log("submit", data);
  };
  const onInvalid = () => {
    const first = Object.keys(errors)[0] as keyof FormValues | undefined;
    if (first) setFocus(first);
  };

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate>
      <div className="field" data-invalid={!!errors.email}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          aria-invalid={!!errors.email}
          aria-describedby="email-error"
          {...register("email", { required: "Email is required", pattern: /^\S+@\S+\.\S+$/ })}
        />
        <span className="field-error" id="email-error">{errors.email?.message}</span>
      </div>
      <button type="submit">Create account</button>
    </form>
  );
}
```

### Vue — nearest equivalent: VeeValidate

```vue
<!-- VeeValidate matches react-hook-form's shape closest on Vue: a
     useField/useForm composable pair, uncontrolled-by-default fields. -->
<template>
  <form @submit="onSubmit">
    <div class="field" :data-invalid="!!errors.email">
      <label for="email">Email</label>
      <input id="email" v-bind="emailAttrs" :aria-invalid="!!errors.email" />
      <span class="field-error">{{ errors.email }}</span>
    </div>
    <button type="submit">Create account</button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
const { defineField, handleSubmit, errors } = useForm();
const [emailAttrs] = defineField("email");
const onSubmit = handleSubmit((values) => console.log(values));
</script>
```

### Svelte — nearest equivalent: Felte

```svelte
<!-- Felte is Svelte's closest analog: a single createForm() call driving
     uncontrolled fields, matching react-hook-form's model. -->
<script lang="ts">
  import { createForm } from "felte";
  const { form, errors } = createForm({
    onSubmit: (values) => console.log(values),
  });
</script>

<form use:form novalidate>
  <div class="field" data-invalid={!!$errors.email}>
    <label for="email">Email</label>
    <input id="email" name="email" aria-invalid={!!$errors.email} />
    <span class="field-error">{$errors.email}</span>
  </div>
  <button type="submit">Create account</button>
</form>
```

### Vanilla — the pattern without a library

```html
<!-- react-hook-form's value (skipping re-renders on every keystroke) is
     React-specific; vanilla JS has no re-render cost to avoid, so the
     HTML5 recipe's native-constraint pattern is the right vanilla
     equivalent, not a reimplementation of register()/Controller. -->
<p>See <a href="./form-validation-html5.md">the HTML5 recipe</a>.</p>
```

## Pitfalls

- **`register`'s spread must come last** on the input if you're also
  setting `onChange`/`onBlur` yourself — react-hook-form's handlers need to
  run, and JSX prop spread order determines which one wins.
- **Uncontrolled by default** means `input.value` isn't React state — don't
  reach for `useState` to "sync" a registered field's value; read it from
  `watch()` or on submit instead, or you'll fight the library.
- **`Controller` has render overhead `register` doesn't** — use it only
  when you actually need it (a non-native input, a transformed value), not
  as the default for every field.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — native constraints only, zero dependencies.
- [`form-validation-zod`](./form-validation-zod.md) — pairs directly via `zodResolver`.
