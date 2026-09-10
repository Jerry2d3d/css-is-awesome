---
name: i18n-pluralization
description: Locale-correct pluralization with native Intl.PluralRules and a small pluralize() helper — English's one/other split isn't universal.
category: i18n
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

You're rendering a count-dependent string — "1 item" vs. "5 items" — and shipping to more than English. `count === 1 ? "item" : "items"` is an English-specific assumption baked into code: Polish has **four** plural forms, Arabic has **six**, and plenty of languages (Japanese, Chinese) have effectively none — nothing changes regardless of count. `Intl.PluralRules` asks the browser which grammatical category a number falls into for a given locale, so the string-selection logic is the same everywhere; only the category *set* differs.

## Structure (raw HTML)

No special markup — this is a string-selection concern feeding into whatever element renders the count:

```html
<p data-cia-recipe="i18n-pluralization">
  <!-- e.g. "3 items in your cart" — the whole sentence is locale text,
       not just the number; word order isn't guaranteed to match English -->
</p>
```

## Styling (cia mixins)

```scss
// PluralText.module.scss
@use 'css-is-awesome/api' as cia;

.count {
  @include cia.font(semibold, 2);
}
```

## Interactivity

`Intl.PluralRules` doesn't produce text — it tells you which category a number belongs to (`"zero"`, `"one"`, `"two"`, `"few"`, `"many"`, `"other"`), and you supply the string for each category your locale actually uses:

```js
const pr = new Intl.PluralRules("en-US");
pr.select(0);  // "other"
pr.select(1);  // "one"
pr.select(5);  // "other"

const prPl = new Intl.PluralRules("pl-PL");
prPl.select(1);   // "one"
prPl.select(2);   // "few"
prPl.select(5);   // "many"
prPl.select(1.5); // "other"  (non-integers are their own category in many locales)

const prAr = new Intl.PluralRules("ar-EG");
prAr.select(0);  // "zero"
prAr.select(1);  // "one"
prAr.select(2);  // "two"
prAr.select(3);  // "few"
prAr.select(11); // "many"
```

A small helper turns the category into the actual string, falling back to `other` for any category the caller didn't supply (every locale supports `other`; it's the only mandatory one):

```js
function pluralize(count, locale, forms) {
  const category = new Intl.PluralRules(locale).select(count);
  const template = forms[category] ?? forms.other;
  return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
}

pluralize(1, "en-US", { one: "{count} item", other: "{count} items" });
// "1 item"
pluralize(5, "pl-PL", { one: "{count} przedmiot", few: "{count} przedmioty", many: "{count} przedmiotów", other: "{count} przedmiotu" });
// "5 przedmiotów"
```

Note the helper reuses [`Intl.NumberFormat`](./i18n-number-currency.md) to format the count itself, not a raw `String(count)` — the two recipes compose.

## A11y checklist

- [ ] The full sentence updates together (count + pluralized word), not a screen-reader-only number swapped inside a sentence that was authored assuming English word order — some locales place the count word differently or inflect surrounding words based on the plural category ([WCAG 2.2 SC 3.1.2 Language of Parts](https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html))
- [ ] A live-updating count (a cart badge, a notification counter) announces via `aria-live="polite"` so the change is heard, not just re-pluralized silently ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] Every `forms` object passed to the helper includes `other` — it's the one category every locale defines, and it's the fallback the helper relies on for any category a given locale uses that the caller didn't anticipate

## Framework examples

### React

```tsx
function pluralize(count: number, locale: string, forms: Record<string, string>): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template = forms[category] ?? forms.other;
  return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
}

export function ItemCount({ count, locale }: { count: number; locale: string }) {
  return (
    <p aria-live="polite">
      {pluralize(count, locale, { one: "{count} item", other: "{count} items" })}
    </p>
  );
}
```

### Vue

```vue
<script setup lang="ts">
const props = defineProps<{ count: number; locale: string }>();

function pluralize(count: number, locale: string, forms: Record<string, string>): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template = forms[category] ?? forms.other;
  return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
}
</script>

<template>
  <p aria-live="polite">
    {{ pluralize(count, locale, { one: "{count} item", other: "{count} items" }) }}
  </p>
</template>
```

### Svelte

```svelte
<script lang="ts">
  export let count: number;
  export let locale: string;

  function pluralize(count, locale, forms) {
    const category = new Intl.PluralRules(locale).select(count);
    const template = forms[category] ?? forms.other;
    return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
  }
  $: text = pluralize(count, locale, { one: "{count} item", other: "{count} items" });
</script>

<p aria-live="polite">{text}</p>
```

### Vanilla

```js
function pluralize(count, locale, forms) {
  const category = new Intl.PluralRules(locale).select(count);
  const template = forms[category] ?? forms.other;
  return template.replace("{count}", new Intl.NumberFormat(locale).format(count));
}

function renderCount(el, count, locale) {
  el.textContent = pluralize(count, locale, { one: "{count} item", other: "{count} items" });
}
```

## Pitfalls

- **`count === 1` as a stand-in for "the one form."** It works for English but not for locales where `1.0` and `1` behave differently, or where a small exact count (2, in Arabic) gets its own dedicated form your `=== 1` check would never reach. Always go through `Intl.PluralRules`, even for a locale you're not shipping yet — the cost of doing it right is the same either way.
- **Assuming every locale needs the same categories you hand-authored for English.** A `forms` object with just `{ one, other }` is complete for English but silently falls back to `other` for every category a richer locale (Polish, Arabic) actually distinguishes — which may read as grammatically wrong to a native speaker even though nothing *crashed*. If you're shipping to those locales for real, get the correct forms translated, not just guessed.
- **Re-implementing category rules from a table you found once.** CLDR's plural rules are genuinely intricate (Polish's `few` vs. `many` split depends on the last two digits) and occasionally revised. `Intl.PluralRules` stays correct as the browser's ICU data updates; a hand-copied table doesn't.

## Related recipes

- [`i18n-number-currency`](./i18n-number-currency.md) — format the count itself; this recipe's helper composes with it directly
- [`i18n-date-formatting`](./i18n-date-formatting.md), [`rtl-layout`](./rtl-layout.md) — the other locale-aware recipes
