---
name: i18n-date-formatting
description: Locale-aware date and relative-time formatting with native Intl.DateTimeFormat and Intl.RelativeTimeFormat — no library dependency.
category: i18n
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

You're displaying a date or time to users in more than one locale and want it to read naturally in each one — "9/10/2026" for `en-US`, "10.9.2026" for `de-DE`, "2026年9月10日" for `ja-JP` — without hand-writing a formatter per locale or reaching for a library. The browser's `Intl.DateTimeFormat` already knows every locale's date order, separators, and month names; you supply the locale and a style, it supplies the string.

This recipe covers formatting a date you already have. Picking one is the [`datepicker`](./datepicker.md) recipe's job — the two pair naturally: capture the date with `datepicker`, display it back to the user through `Intl.DateTimeFormat`.

## Structure (raw HTML)

No special markup — this is a JS formatting concern rendered into whatever element you'd already use for the date:

```html
<time datetime="2026-09-10T14:30:00Z" data-cia-recipe="i18n-date-formatting">
  <!-- formatted text goes here, e.g. "September 10, 2026" -->
</time>
```

Notes on the markup:
- `<time datetime="...">` with a real ISO 8601 value is the machine-readable anchor — screen readers and browsers can announce or act on it even before your JS runs; the locale-formatted text inside is the human-readable presentation layer on top.
- No `data-locale` or similar attribute is needed on the element itself — the locale comes from wherever your app already tracks it (a route param, a cookie, `navigator.language`), not from markup.

## Styling (cia mixins)

```scss
// DateDisplay.module.scss
@use 'css-is-awesome/api' as cia;

.date {
  @include cia.font(medium, 2);
  color: cia.color(text-secondary);
}
.relative {
  color: cia.color(text-muted);
  font-size: 0.85em;
}
```

## Interactivity

Three `Intl.DateTimeFormat` styles cover almost everything:

```js
const date = new Date("2026-09-10T14:30:00Z");

new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(date);
// en-US: "9/10/26"   de-DE: "10.9.26"   ja-JP: "2026/9/10"

new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
// en-US: "September 10, 2026"   de-DE: "10. September 2026"

new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
// en-US: "Sep 10, 2026, 2:30 PM"
```

A specific timezone (rather than the viewer's local one) is a plain option, not a separate API:

```js
new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(date);
```

Relative time ("3 days ago", "in 2 hours") is a **different** constructor — `Intl.RelativeTimeFormat` doesn't take a `Date`, it takes a signed number and a unit, so you compute the delta yourself:

```js
const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
rtf.format(-3, "day");  // en-US: "3 days ago"    (numeric: "auto" prefers "yesterday" for -1)
rtf.format(2, "hour");  // en-US: "in 2 hours"
```

`numeric: "auto"` is almost always what you want — it substitutes idioms ("yesterday", "tomorrow") where the locale has one, falling back to the numeric phrasing otherwise.

## A11y checklist

- [ ] The underlying `<time datetime="...">` carries a real, machine-parseable ISO 8601 value even when the visible text is a relative phrase like "3 days ago" — a screen reader or translation tool can still recover the actual instant ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] `Intl.RelativeTimeFormat` output is re-computed (or paired with the absolute `<time>` value in a tooltip/title) rather than left static on a long-lived page — "3 days ago" silently becomes wrong as time passes if nothing ever refreshes it
- [ ] The formatting locale matches the page's actual content language (`<html lang>`), not left defaulted to the server's locale regardless of who's viewing — see the SSR pitfall below
- [ ] Don't rebuild the month/weekday name lookup by hand for a locale — a hand-maintained translation table drifts from `Intl`'s and is one more thing to keep in sync ([WCAG 2.2 SC 3.1.2 Language of Parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html))

## Framework examples

### React

```tsx
"use client";
import { useEffect, useState } from "react";

export default function DateDisplay({ date, locale }: { date: Date; locale: string }) {
  // Format only after mount: the server's ICU default locale rarely matches
  // the visiting browser's, so formatting during SSR produces text that
  // doesn't match what the client re-renders — a hydration mismatch. Render
  // the ISO value first (correct on both sides), swap to the formatted
  // string once mounted.
  const [text, setText] = useState(date.toISOString());

  useEffect(() => {
    setText(new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date));
  }, [date, locale]);

  return <time dateTime={date.toISOString()}>{text}</time>;
}
```

### Vue

```vue
<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps<{ date: Date; locale: string }>();
const text = ref(props.date.toISOString());

function format() {
  text.value = new Intl.DateTimeFormat(props.locale, { dateStyle: "long" }).format(props.date);
}
onMounted(format);
watch(() => [props.date, props.locale], format);
</script>

<template>
  <time :datetime="date.toISOString()">{{ text }}</time>
</template>
```

### Svelte

```svelte
<script lang="ts">
  export let date: Date;
  export let locale: string;

  let text = date.toISOString();
  import { onMount } from "svelte";
  function format() {
    text = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
  }
  onMount(format);
  $: date, locale, format();
</script>

<time datetime={date.toISOString()}>{text}</time>
```

### Vanilla

```js
function renderDate(el, date, locale) {
  el.setAttribute("datetime", date.toISOString());
  el.textContent = new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}
// No SSR concern in a plain script — it only ever runs in the browser.
document.querySelectorAll("time[data-i18n-date]").forEach((el) => {
  renderDate(el, new Date(el.dataset.iso), document.documentElement.lang || "en");
});
```

## Pitfalls

- **SSR locale mismatch.** If you format a date during server rendering, the server's default ICU locale (often just `en-US` regardless of who's requesting the page) can disagree with the browser's actual locale, producing a React/Vue hydration warning — or worse, a flash of wrong-locale text. Either format only client-side after mount (shown above), or pass the locale explicitly all the way from a source both server and client agree on (a URL segment, a cookie read the same way in both places) — never rely on an environment's implicit default.
- **`toLocaleDateString()` without a fixed locale argument.** Calling `date.toLocaleDateString()` with no arguments uses the *runtime's* default locale — the server's, not the visitor's, in SSR. Always pass the locale explicitly: `date.toLocaleDateString(locale)`, or better, construct an `Intl.DateTimeFormat` instance up front if you're formatting many dates (it's the same API, reused instead of reconstructed per call).
- **Formatting a stale relative time.** `Intl.RelativeTimeFormat` output is a snapshot — "2 minutes ago" doesn't update itself. If it needs to stay current on a long-lived page (a live feed, a chat), re-run the format on an interval or pair it with the absolute time in a `title` attribute so the number is never the only source of truth.

## Related recipes

- [`datepicker`](./datepicker.md) — capture the date this recipe displays
- [`rtl-layout`](./rtl-layout.md) — layout direction is a separate concern from locale formatting; numbers and dates read left-to-right within themselves even inside RTL text (see rtl-layout's Pitfalls)
- [`i18n-number-currency`](./i18n-number-currency.md), [`i18n-pluralization`](./i18n-pluralization.md) — the other two `Intl`-based formatting recipes
