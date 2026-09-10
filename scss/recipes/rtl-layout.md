---
name: rtl-layout
description: Ship a right-to-left (Arabic, Hebrew) layout with cia — what works for free from logical properties, what needs a dir="rtl" override, and how to flip directional icons.
category: layout
complexity: medium
cia-version: ">=1.11.1"
---

## Use this when

You're shipping a page or app to a right-to-left locale — Arabic, Hebrew,
Farsi, Urdu — and need to know what cia already handles and what you still
have to do. cia has used CSS logical properties (`margin-inline-start`
instead of `margin-left`, `text-align: start` instead of `left`) since v0.7,
so most layout mirrors automatically the moment you set `dir="rtl"`. A
handful of things — directional icons, `background-position`, `transform` —
have no logical-property equivalent and need an explicit override; this
recipe is the list of which ones and how cia handles each.

This recipe is about **layout direction**, not translation or locale
formatting (dates, numbers, currency, pluralization) — that's the
[i18n recipes](../recipes/) once shipped. It also doesn't cover BiDi text
rendering edge cases (mixed Arabic/Latin in one string) beyond flagging them
in Pitfalls below — browsers handle the rendering; cia doesn't add to or
subtract from that.

## Structure (raw HTML)

Set direction once, at the root. Everything under it inherits.

```html
<html lang="ar" dir="rtl">
  <body>
    <!-- cia components render mirrored automatically — no per-component
         dir prop, no RTL variant class. -->
  </body>
</html>
```

A single section can override the page's direction locally — useful for an
embedded LTR code sample inside an otherwise-RTL page, or vice versa:

```html
<div dir="ltr">
  <!-- e.g. a code block, a product SKU, a URL — content that stays LTR
       regardless of the surrounding page direction -->
</div>
```

## Styling (cia mixins)

**What "just works" — no code change, no RTL variant.** Because cia's own
source uses logical properties throughout — audited and CI-gated on every
PR, so drift can't creep back in — every mixin below mirrors correctly
under `dir="rtl"` with zero extra CSS:

- Spacing: `cia.pad`, `cia.pad-asym`, `cia.space`, `cia.grid` — all emit
  `margin-inline-*`/`padding-inline-*`, never `-left`/`-right`.
- Text: `cia.type`, any mixin touching `text-align` — reads `start`/`end`,
  not `left`/`right`.
- Borders: component mixins with a directional accent border (the
  breadcrumb separator in `cia.breadcrumb`, the avatar-stack overlap in
  `cia.avatar-group`, the accordion chevron) use `border-inline-*`/
  `margin-inline-*` and mirror correctly.
- The **Tier-1 utility classes** ship both a physical set (`cia-ml-*`,
  `cia-mr-*`, `cia-text-left`, `cia-text-right`, `cia-border-l`,
  `cia-border-r`, `cia-left-0`, `cia-right-0`) for when you want a specific
  visual side regardless of direction, and a **logical set** (`cia-ms-*`/
  `cia-me-*`, `cia-mi-*`/`cia-pi-*`, `cia-text-start`/`cia-text-end`,
  `cia-border-s`/`cia-border-e`, `cia-start-0`/`cia-end-0`) that mirrors.
  Reach for the logical set unless you specifically want a fixed side.

```scss
@use 'css-is-awesome/api' as cia;

// Mirrors automatically under dir="rtl" — no override needed.
.sidebar {
  @include cia.pad(4);
  border-inline-end: 1px solid var(--border-default);
}
```

**What needs an explicit `[dir="rtl"]` override.** Two CSS features have no
logical-property equivalent with reliable browser support: `background-
position` and `transform`. cia's own `select` and `switch` mixins hit both —
read their source (`scss/components/_forms.scss`) as the reference pattern:

```scss
// A select's dropdown chevron — background-position can't use a logical
// keyword, so the LTR value gets an explicit RTL flip.
.custom-select {
  background-position: right 0.5rem center; // LTR default
  padding-inline-end: 2rem;                 // this one DOES flip on its own

  [dir="rtl"] & {
    background-position: left 0.5rem center;
  }
}

// A toggle knob's resting position IS logical (mirrors on its own); the
// SLIDE distance is a transform, which isn't direction-aware, so only the
// checked-state transform needs the override.
.switch::before {
  inset-inline-start: 1px; // mirrors automatically
}
.switch:checked::before {
  transform: translateX(1.25rem);
}
[dir="rtl"] .switch:checked::before {
  transform: translateX(-1.25rem); // same distance, opposite direction
}
```

### Icon-flipping (chevrons, arrows)

Not every icon should flip in RTL — that's the actual hard part. A **directional** icon (a "next" chevron, a back arrow, an undo icon whose curve implies a reading direction) should flip, because it encodes "forward" or "backward" relative to reading order. A **non-directional** icon (a logo, a brand mark, a checkmark, a search icon) must **never** flip — it has no direction, and mirroring it looks broken or, for a logo, wrong.

Two flip mechanisms, pick based on the icon's shape:

```css
/* Mechanism 1 — transform, for a whole-icon flip. Cheapest; use for any
   icon that's symmetric enough that a horizontal mirror reads correctly
   (most chevrons, arrows). */
[dir="rtl"] .icon-flip {
  transform: scaleX(-1);
}
```

```html
<!-- Mechanism 2 — SVG-internal flip, for an icon whose flip needs to
     happen INSIDE the shape (asymmetric glyphs, or when you're already
     applying a transform to the icon for something else and don't want
     them to compound). Flip the path data itself, or wrap it: -->
<svg viewBox="0 0 24 24" aria-hidden="true">
  <g class="icon-flip-inner">
    <path d="M9 6l6 6-6 6" />
  </g>
</svg>
<style>
  [dir="rtl"] .icon-flip-inner {
    transform-box: fill-box;
    transform-origin: center;
    transform: scaleX(-1);
  }
</style>
```

cia ships no built-in "flip this icon" mixin — the decision of which icons
flip is a product/content decision, not something a library can infer from
an SVG's shape. Mark the ones that should with `.icon-flip` (or your own
class) and apply mechanism 1 above; leave everything else untouched.

## Interactivity

Nothing here needs JavaScript. Direction is a CSS/HTML concern —
`dir="rtl"` on `<html>` (or any ancestor) is enough; no script sets or reads
it for layout purposes. If your app supports a runtime locale switcher, the
only JS involved is setting the `dir` attribute (and `lang`) when the user
changes locale — no re-render of cia-styled components is needed, since
they all read direction live from the cascade.

## A11y checklist

- [ ] `<html lang="...">` matches the actual content locale, and `dir="rtl"`
  is set alongside it — screen readers use `lang` to select pronunciation
  rules, and get it wrong silently if it's missing or wrong ([WCAG 2.2 SC
  3.1.1 Language of Page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html))
- [ ] Mixed-direction content (a UI string in Arabic containing an English
  product name, a phone number) gets `dir="auto"` on that specific element
  so the browser's Unicode bidi algorithm can resolve it, rather than
  forcing the wrong base direction ([Unicode Bidirectional Algorithm](https://www.w3.org/International/articles/inline-bidi-markup/))
- [ ] A flipped directional icon keeps the same `aria-label`/accessible
  name — flipping is visual only, the meaning ("next", "back") is unchanged
  ([WCAG 2.2 SC 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html))
- [ ] Focus order still matches visual reading order after the direction
  flip — logical properties handle visual position, but confirm tab order
  wasn't hand-coded assuming LTR (e.g. a hardcoded `tabindex` sequence)
  ([WCAG 2.2 SC 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html))

## Framework examples

Every framework does the same thing: set `dir` (and `lang`) on the root
element the app controls, and let cia's logical properties do the rest —
there is no cia-specific RTL API to call.

### React

```tsx
export function App({ locale, children }: { locale: string; children: React.ReactNode }) {
  const dir = ["ar", "he", "fa", "ur"].includes(locale) ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```

### Vue

```vue
<template>
  <div :dir="dir" :lang="locale">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps<{ locale: string }>();
const RTL_LOCALES = ["ar", "he", "fa", "ur"];
const dir = computed(() => (RTL_LOCALES.includes(props.locale) ? "rtl" : "ltr"));
</script>
```

### Svelte

```svelte
<script lang="ts">
  export let locale: string;
  const RTL_LOCALES = ["ar", "he", "fa", "ur"];
  $: dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
</script>

<div {dir} lang={locale}>
  <slot />
</div>
```

### Vanilla

```html
<script>
  const RTL_LOCALES = ["ar", "he", "fa", "ur"];
  const locale = document.documentElement.lang || "en";
  document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
</script>
```

## Pitfalls

- **Numbers don't flip.** Arabic-script text runs right-to-left, but Arabic
  numerals (0-9) — used in both English and Modern Standard Arabic — still
  read left-to-right within themselves inside an RTL string. Don't apply
  `direction: rtl` to a number or date by hand; let the Unicode bidi
  algorithm place it (it already does this correctly for plain text —
  the bug only shows up if you've forced `unicode-bidi: bidi-override`
  somewhere, which cia never does).
- **English brand names inside Arabic sentences.** "استخدم GitHub للنشر"
  (roughly "Use GitHub to deploy") mixes an LTR brand name into an RTL
  sentence. The browser's bidi algorithm generally gets this right on its
  own; wrap the Latin fragment in `<span dir="ltr">` only if you observe it
  rendering wrong (extra punctuation reordering is the usual symptom).
- **Mixed-direction user input.** A search box or comment field where a
  user might type Arabic, English, or both needs `dir="auto"` on the
  `<input>`/`<textarea>` itself — without it, the field's base direction is
  fixed to the page's and mixed input can render with punctuation and
  trailing Latin words in the wrong visual order.
- **A hardcoded physical value slipping into your OWN CSS.** cia's source
  is logical-property-clean (audited, see above), but your own component
  CSS isn't audited by cia. Reach for `cia-ms-*`/`cia-pe-*`/`cia-text-start`
  over hand-written `margin-left`/`text-align: left` in your own styles.

## Related recipes

- [`print-to-pdf`](./print-to-pdf.md) — print direction inherits from
  `dir` the same way screen layout does; no separate RTL print concern.
- [`i18n-date-formatting`](./i18n-date-formatting.md),
  [`i18n-number-currency`](./i18n-number-currency.md),
  [`i18n-pluralization`](./i18n-pluralization.md) — locale *formatting*
  (dates, numbers, plurals), the concern this recipe explicitly doesn't
  cover. Icon-flipping and layout direction (this recipe) vs. formatting
  (those three) is the full i18n picture.
