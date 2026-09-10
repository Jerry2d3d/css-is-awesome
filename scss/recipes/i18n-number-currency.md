---
name: i18n-number-currency
description: Locale-aware number, percent, currency and compact formatting with native Intl.NumberFormat — no library dependency.
category: i18n
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

You're displaying a number, price, or percentage to users across locales — 1,234.5 in `en-US` is 1.234,5 in `de-DE` (comma and period swap roles entirely), and a price needs both the right separators and the right currency symbol/placement for where it's being read. `Intl.NumberFormat` already knows every locale's grouping separator, decimal separator, and currency conventions; a hand-rolled `toFixed()` + manual comma-insertion breaks the moment a `de-DE` user sees it.

## Structure (raw HTML)

No special markup — format into whatever element already holds the value:

```html
<span data-cia-recipe="i18n-number-currency">
  <!-- formatted text goes here, e.g. "$1,234.56" or "1.234,56 €" -->
</span>
```

For a price specifically, pair the visible formatted text with a machine-readable value so scrapers, price-comparison tools, and structured data don't have to re-parse locale-formatted text:

```html
<span itemprop="price" content="1234.56">
  <!-- visible: the locale-formatted string -->
</span>
```

## Styling (cia mixins)

```scss
// PriceDisplay.module.scss
@use 'css-is-awesome/api' as cia;

.price {
  @include cia.font(semibold, 3);
  color: cia.color(text-primary);
  font-variant-numeric: tabular-nums; // digits align in a list/table of prices
}
.compact {
  color: cia.color(text-muted);
  font-size: 0.85em;
}
```

## Interactivity

Four `Intl.NumberFormat` modes cover nearly every real case:

```js
const n = 1234567.891;

new Intl.NumberFormat(locale).format(n);
// en-US: "1,234,567.891"   de-DE: "1.234.567,891"   ja-JP: "1,234,567.891"

new Intl.NumberFormat(locale, { style: "percent" }).format(0.427);
// en-US: "43%"   (percent style multiplies by 100 for you — don't pre-multiply)

new Intl.NumberFormat(locale, { style: "currency", currency: currencyFor(locale) }).format(n);
// en-US + USD: "$1,234,567.89"   de-DE + EUR: "1.234.567,89 €"   ja-JP + JPY: "¥1,234,568"
// currency is a REQUIRED option — Intl has no default, and locale doesn't imply one
// (plenty of locales are shared across countries with different currencies).

new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);
// en-US: "1.2M"   de-DE: "1,2 Mio."   ja-JP: "123.5万"
```

Accounting contexts (financial statements, invoices) often want an explicit sign on positive numbers too, and sometimes parenthesized negatives instead of a minus sign:

```js
new Intl.NumberFormat(locale, { signDisplay: "exceptZero" }).format(1234);   // "+1,234"
new Intl.NumberFormat(locale, { signDisplay: "exceptZero" }).format(-1234);  // "-1,234"
new Intl.NumberFormat(locale, { currencySign: "accounting", style: "currency", currency: "USD" }).format(-1234);
// "($1,234.00)" instead of "-$1,234.00" — the accounting convention for negative money
```

## A11y checklist

- [ ] A currency value's visible text is paired with a machine-readable equivalent (structured data `itemprop="price"`, an `aria-label` with the full unambiguous amount, or similar) — a screen reader reading "$1.234,56" character-by-character in the wrong locale context can mislead ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Compact notation ("1.2M") has the full value available on request (a `title` attribute, or the full number nearby) — compact form is a readability aid, not the only representation, for anyone who needs the exact figure ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Never infer currency from locale alone in a way the user can't override — `en-US` doesn't always mean USD (a US-based site pricing in EUR for a European catalog, for instance); pass currency explicitly from your actual pricing data

## Framework examples

### React

```tsx
export function Price({ amount, locale, currency }: { amount: number; locale: string; currency: string }) {
  const formatted = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  return (
    <span title={formatted}>
      {formatted}
    </span>
  );
}
```

### Vue

```vue
<script setup lang="ts">
const props = defineProps<{ amount: number; locale: string; currency: string }>();
const formatted = new Intl.NumberFormat(props.locale, { style: "currency", currency: props.currency }).format(props.amount);
</script>

<template>
  <span :title="formatted">{{ formatted }}</span>
</template>
```

### Svelte

```svelte
<script lang="ts">
  export let amount: number;
  export let locale: string;
  export let currency: string;
  $: formatted = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
</script>

<span title={formatted}>{formatted}</span>
```

### Vanilla

```js
function renderPrice(el, amount, locale, currency) {
  const formatted = new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
  el.textContent = formatted;
  el.title = formatted;
}
```

## Pitfalls

- **Forgetting `currency` is required for `style: "currency"`.** Unlike `style: "decimal"` or `"percent"`, there's no sensible default — `Intl.NumberFormat` throws a `TypeError` without it. There's also no implicit locale → currency mapping; a locale like `en` alone doesn't tell you USD vs. GBP vs. AUD.
- **Pre-multiplying a percent value.** `style: "percent"` expects the raw fraction (`0.427`) and multiplies by 100 itself. Passing `42.7` produces `"4,270%"`, not `"43%"`.
- **Parsing a formatted string back into a number by hand.** `"1.234,56"` (de-DE) is not `1.23456` if you naively `parseFloat` it — the separators are swapped. If you need to parse locale-formatted user input back to a number, use `Intl.NumberFormat(locale).formatToParts()` to learn that locale's actual separator characters rather than assuming `.`/`,`.

## Related recipes

- [`i18n-date-formatting`](./i18n-date-formatting.md), [`i18n-pluralization`](./i18n-pluralization.md) — the other two `Intl`-based formatting recipes
- [`rtl-layout`](./rtl-layout.md) — numbers read left-to-right within themselves even inside RTL text; don't apply direction overrides to a formatted number
