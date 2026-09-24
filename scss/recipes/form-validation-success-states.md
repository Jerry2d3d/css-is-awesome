---
name: form-validation-success-states
description: Four success-feedback patterns after a form passes validation or submits — an inline field checkmark, a summary banner, an optimistic UI, and (once you have a toast primitive) a redirect-with-toast — with the tradeoffs for picking between them.
category: forms
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

Every recipe in this book so far shows *error* feedback. Success needs its
own design decision: a field going green the moment it's valid can feel
like busywork on a short form and genuinely helpful on a long one; a submit
that blocks on the server response reads as "safe" but slow, one that
updates immediately and rolls back on failure reads as fast but riskier.
This recipe is the decision table plus the three patterns you can build with
cia alone, and a fourth noted for when you have a toast primitive to pair it
with.

## Structure (raw HTML)

```html
<!-- Pattern 1: inline checkmark per field -->
<div class="field" data-status="valid">
  <label for="email">Email</label>
  <div class="field-input-wrap">
    <input id="email" name="email" type="email" />
    <span class="field-check" aria-hidden="true"></span>
  </div>
</div>

<!-- Pattern 2: summary banner after submit -->
<div class="form-banner" data-kind="success" role="status" hidden>
  Account created — check your email to verify.
</div>

<!-- Pattern 3: optimistic toggle (state applies immediately, rolls back on failure) -->
<label class="optimistic-toggle">
  <input type="checkbox" />
  Email me weekly digests
</label>
```

## Styling (cia mixins)

```scss
@use 'css-is-awesome/api' as cia;

// Pattern 1 — inline checkmark
.field-input-wrap {
  position: relative;
  input { @include cia.input-base; padding-inline-end: cia.space(8); }
}
.field-check {
  display: none;
  position: absolute;
  inset-inline-end: cia.space(3);
  inset-block-start: 50%;
  translate: 0 -50%;
  color: var(--success-default);

  .field[data-status="valid"] & {
    display: block;
    @include cia.icon-svg(check, 1em);
  }
}

// Pattern 2 — summary banner
.form-banner {
  padding: cia.space(3) cia.space(4);
  margin-block-end: cia.space(4);
  border-radius: var(--radius-md);

  &[data-kind="success"] {
    background: var(--success-subtle);
    color: var(--success-text);
  }
  &[data-kind="error"] {
    background: var(--error-subtle);
    color: var(--error-text);
  }
  &[hidden] { display: none; }
}

// Pattern 3 — optimistic toggle: no error styling needed while pending,
// only a brief rollback affordance if the write actually fails.
.optimistic-toggle {
  display: flex;
  align-items: center;
  gap: cia.space(2);

  &[data-failed="true"] {
    color: var(--error-text);
  }
}
```

## Interactivity

**Pattern 1 — inline checkmark.** Set `data-status="valid"` the same way
the other recipes set `data-invalid`/`data-status="taken"` — from
`:user-valid` if you're on the [HTML5 recipe](./form-validation-html5.md),
or from `formState.dirtyFields`/a Zod `safeParse` success otherwise. Best on
longer forms (registration, checkout) where per-field confirmation reduces
anxiety; on a 2-field login form it's usually noise.

**Pattern 2 — summary banner.** Show once, after a successful submit
response — not per field. `role="status"` announces it; `hidden` keeps it
out of the accessibility tree until then (unlike `display: none` set via
CSS alone, the `hidden` attribute is what screen readers key off).

```js
async function handleSubmit(e) {
  e.preventDefault();
  const res = await fetch("/api/signup", { method: "POST", body: new FormData(e.target) });
  const banner = document.querySelector(".form-banner");
  banner.dataset.kind = res.ok ? "success" : "error";
  banner.textContent = res.ok ? "Account created — check your email to verify." : "Something went wrong. Try again.";
  banner.hidden = false;
}
```

**Pattern 3 — optimistic UI.** Flip the UI immediately on interaction,
*before* the network call resolves; roll back only if it actually fails.
Right for low-stakes, high-frequency actions (a preference toggle, a
"save draft") where the failure rate is low and instant feedback matters
more than certainty. Wrong for anything with real consequences (payment,
account deletion) — there, wait for confirmation.

```js
checkbox.addEventListener("change", async (e) => {
  const wasChecked = e.target.checked;
  try {
    await fetch("/api/preferences", { method: "PATCH", body: JSON.stringify({ digest: wasChecked }) });
  } catch {
    e.target.checked = !wasChecked; // roll back
    e.target.closest(".optimistic-toggle").dataset.failed = "true";
    setTimeout(() => delete e.target.closest(".optimistic-toggle").dataset.failed, 2000);
  }
});
```

**Pattern 4 — redirect-after-submit with a toast.** The pattern: submit
succeeds, `router.push()` (or a full navigation) fires immediately, and a
toast surfaces on the *next* page confirming what happened, so the
confirmation doesn't get lost in the redirect. cia doesn't ship a toast
component yet (tracked as a future recipe) — when it does, this pattern
is: persist the message (a query param, `sessionStorage`, or a flash-
message cookie) before redirecting, then read and show it as a toast on
mount of the destination page. Until then, pattern 2's summary banner
covers the "confirm what happened" need on the same page.

## A11y checklist

- [ ] The inline checkmark (`.field-check`) is `aria-hidden` — a field's
  associated `:user-valid`/label state already communicates validity to
  assistive tech; the icon is a sighted-user affordance only
  ([WCAG 2.2 SC 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html))
- [ ] The summary banner uses `role="status"` (success) — reserve
  `role="alert"` for the error-summary pattern in the other recipes, since
  a success confirmation isn't as urgent as a blocked submission
  ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] An optimistic rollback is also announced (not just visually reverted)
  — a screen-reader user who heard "digest on" needs to hear it reverted
  too, not just see the checkbox silently uncheck
  ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] A redirect-after-submit (pattern 4) doesn't fire fast enough to cut
  off a screen reader mid-announcement of the pre-redirect state — give the
  status message at least a brief moment, or persist it across the redirect
  as described above rather than relying on a same-page announcement no one
  has time to hear

## Framework examples

Each pattern is a handful of lines that don't meaningfully change shape
across frameworks — the examples show pattern 3 (optimistic toggle), the
one with the most logic.

### React

```tsx
import { useState } from "react";

export function DigestToggle({ initial }: { initial: boolean }) {
  const [checked, setChecked] = useState(initial);
  const [failed, setFailed] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setChecked(next); // optimistic
    try {
      await fetch("/api/preferences", { method: "PATCH", body: JSON.stringify({ digest: next }) });
    } catch {
      setChecked(!next); // rollback
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <label className="optimistic-toggle" data-failed={failed}>
      <input type="checkbox" checked={checked} onChange={handleChange} />
      Email me weekly digests
    </label>
  );
}
```

### Vue

```vue
<template>
  <label class="optimistic-toggle" :data-failed="failed">
    <input type="checkbox" :checked="checked" @change="handleChange" />
    Email me weekly digests
  </label>
</template>

<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{ initial: boolean }>();
const checked = ref(props.initial);
const failed = ref(false);

async function handleChange(e: Event) {
  const next = (e.target as HTMLInputElement).checked;
  checked.value = next;
  try {
    await fetch("/api/preferences", { method: "PATCH", body: JSON.stringify({ digest: next }) });
  } catch {
    checked.value = !next;
    failed.value = true;
    setTimeout(() => (failed.value = false), 2000);
  }
}
</script>
```

### Svelte

```svelte
<script lang="ts">
  export let initial: boolean;
  let checked = initial;
  let failed = false;

  async function handleChange(e: Event) {
    const next = (e.target as HTMLInputElement).checked;
    checked = next;
    try {
      await fetch("/api/preferences", { method: "PATCH", body: JSON.stringify({ digest: next }) });
    } catch {
      checked = !next;
      failed = true;
      setTimeout(() => (failed = false), 2000);
    }
  }
</script>

<label class="optimistic-toggle" data-failed={failed}>
  <input type="checkbox" checked={checked} on:change={handleChange} />
  Email me weekly digests
</label>
```

### Vanilla

```js
// See "Interactivity" above (pattern 3, the optimistic toggle) — that
// example is the full vanilla implementation, no framework needed.
```

## Pitfalls

- **Don't optimistic-update anything with real consequences.** Payment,
  account deletion, irreversible actions — wait for the server. Optimism is
  for cheap-to-reverse, low-stakes state.
- **A per-field checkmark on every field of a short form is noise, not
  help.** Reserve pattern 1 for forms long enough that per-field
  confirmation actually reduces anxiety (multi-step signup, checkout) —
  skip it on a 2-field login.
- **`hidden` (the attribute), not just `display: none` via a class.** A
  banner toggled only through a CSS class that sets `display: none` is
  still in the accessibility tree if nothing also sets `hidden` /
  `aria-hidden` — screen readers may still announce it.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — the `:user-valid` state pattern 1 reads from.
- [`form-validation-async`](./form-validation-async.md) — the loading→success/error sequence this recipe's patterns 1 and 3 build on.
