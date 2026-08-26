---
title: Print to PDF with zero JavaScript
slug: print-to-pdf-with-zero-javascript
category: technique
tags: print, pdf, css, zero-js
audience: front-end developers
excerpt: The browser already ships a PDF generator. cia's print layer is four mixins, three CSS variables, and no JavaScript at all.
author: Jerry Hansen
publishDate: 2026-08-17
updatedDate: 2026-08-17
readingTime: 5 min
---

Someone asks for "download as PDF" and the usual answers all cost the same thing: a second renderer.

A paid service (DocRaptor, Prince, PDFShift) renders your HTML somewhere else. A headless Chrome job renders it in CI. `html2canvas` + `jsPDF` rasterizes the DOM into an image and drops it into a PDF container, where text stops being text. All three end the same way — you now maintain a page *and* a document template, and they drift.

The browser you are already targeting has a layout engine and a PDF writer wired together behind Ctrl/Cmd+P → **Save as PDF**. The generator is not the missing piece. The missing piece is a description of your page *on paper*.

That description is CSS. So cia's print support ships no JavaScript.

## Four mixins

The whole print layer landed in [`47f1fc2`](https://github.com/Jerry2d3d/css-is-awesome/commit/47f1fc21e599b42aa749e122a628d89441d15045) (2026-06-09) as a new section in `scss/_mixins.scss`:

```scss
@use 'css-is-awesome/api' as cia;

@include cia.print-base;                    // page defaults — ROOT only

.site-nav   { @include cia.print-hidden; }  // drop chrome on paper
.print-note { @include cia.print-only; }    // reveal paper-only content
.invoice    { @include cia.print { border: 1px solid; } }
```

`print` is the primitive — a bare `@media print { @content }` wrapper, nothing more. Its only job is co-location: the print override lives inside the selector it overrides, next to the screen rule it contradicts, instead of in a print stylesheet at the bottom of the file where nobody reads it.

The other three are where the real behavior is.

## The trap: `print-base` is root-only

`print-base` is not an element mixin. It emits its own `:root` block *and* an `@page` rule:

```scss
@mixin print-base($freeze-animations: true, $size: letter, $margin: 0.5in) {
  :root {
    --is-print: 0;
    --print-hide: none;
    --print-show: revert;
  }

  @media print {
    :root { --is-print: 1; }
    @page { size: $size; margin: $margin; }
    // …
  }
}
```

Wrap that in a selector and you get `.doc :root { … }` and `.doc { @page { … } }`. The first matches nothing — `:root` is the `<html>` element and it is never a descendant of your component. The second is invalid; `@page` is a page-context at-rule and does nothing nested under a style rule ([CSS Paged Media 3](https://www.w3.org/TR/css-page-3/)).

The failure is silent. Your stylesheet compiles, stylelint is happy, and paper simply ignores you.

So: include it once, at the top level of a global stylesheet. Not in a `.module.scss`. Not inside `.app { }`. That is also why it is the *only* one of the four with this rule — the per-element mixins emit nothing but declarations.

## The bug that made the freeze a default

Entrance animations usually start invisible. A fade-in is `opacity: 0` until it isn't. A scroll reveal is `transform: translateY(20px); opacity: 0`.

Print snapshots the page in whatever state it is in. Hit Ctrl+P while an entrance animation has not run — which is exactly what happens on a fresh load, or on any element below the fold whose IntersectionObserver never fired — and you get a PDF with correct layout, correct page breaks, and **no text**. The content is there. It has `opacity: 0`.

The obvious fix is to force everything visible:

```scss
* {
  animation: none !important;
  opacity: 1 !important;
  transform: none !important;
}
```

That is what `print-base` shipped first, and it is wrong. It fixes the fade by destroying every *deliberate* use of the same properties. We measured it in a browser under print emulation:

| element | forced-visible freeze |
|---|---|
| entrance fade | `1` — fixed |
| watermark at `opacity: 0.15` | `1` — **destroyed** |
| disabled control at `0.4` | `1` — **destroyed** |
| stamp at `rotate(-4deg)` | flattened |

That last row was our own homepage. The version stamp is rotated four degrees; the freeze ironed it flat on paper.

The distinction that matters: the problem is not that things are transparent, it is that animations *have not finished*. So finish them.

```scss
@if $freeze-animations {
  *, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-fill-mode: forwards !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
  }
}
```

Zero duration plus `forwards` makes every animation land on its final frame instantly. A fade-in ends at `opacity: 1`. A slide-in ends at `translateY(0)`. And an element that was never animating is not touched at all — the watermark stays at `0.15`, the stamp keeps its four degrees.

`!important` stays, and it is load-bearing: `@media` contributes no specificity, so an author's `animation:` shorthand at equal specificity would otherwise win and put the trap right back.

## Three variables are the control plane

`--is-print` is `0` on screen and `1` on paper. It is readable in `calc()`, in `opacity`, in `@container style(--is-print: 1)`:

```scss
.cover { @include cia.print { opacity: var(--is-print); } }
```

`--print-hide` and `--print-show` are the `display` values the two toggle mixins apply. That indirection is the point: an exception needs no new rule, just a re-aimed variable on the one element.

```scss
.legal-footer { @include cia.print-hidden; --print-hide: revert; }  // keep this one
.receipt-grid { @include cia.print-only;   --print-show: grid; }    // print-only, as a grid
```

There is a deliberate line here that is easy to get wrong. Each mixin keeps its `@media` boundary *inside itself* — only the display **value** is variable-driven:

```scss
@mixin print-hidden {
  @media print { display: var(--print-hide, none) !important; }
}
```

The tempting alternative is one unconditional `display: var(--print-display)` per element and a `:root` flip that swaps every value at print time. That version clobbers every element's screen `display` — your flex rows and grid layouts become whatever the variable says, on screen, always. Keeping the media query internal means the variable can only ever influence paper.

## About the `!important`

`print-hidden` and `print-only` both use it, and it is not a shortcut.

The root of it: **`@media` contributes no specificity.** `print-hidden` is included *inside* your selector, so the rule it generates carries exactly that selector's specificity — no more. `.site-nav { display: flex }` and `@media print { .site-nav { display: none } }` are a tie, and ties are settled by source order, which the mixin author does not control once Sass module order, CSS Modules hashing and a bundler's chunk order have all had a vote.

We measured it rather than argued about it, in a browser under print emulation:

| rule | result in print |
|---|---|
| `display: var(--print-hide) !important` | `none` — hides |
| the same rule without `!important` | `flex` — prints anyway |

The competing `display` is usually not even yours. It is a utility class or a component library the design system can never see. Without `!important` the mixin fails *silently, on paper only* — the worst place to find out.

### Why not `@layer`?

This is the obvious modern answer, and for this problem it is worse.

**Layered CSS always loses to unlayered CSS**, regardless of specificity. That is the entire point of the feature. So a print rule inside `@layer` would lose to any consumer stylesheet that isn't layered — which is most of them:

```css
@layer cia { @media print { .site-nav { display: none } } }
.site-nav { display: flex }        /* unlayered — wins */
```

The nav prints. A design system cannot require its consumers to adopt layers just so its print rules work; that tax is exactly why cia ships unlayered in the first place.

There is a second trap: `!important` **inverts** layer order. An important declaration in an *earlier* layer beats a normal one in a later layer. The two features do not compose the way intuition suggests, so reaching for both is how you end up debugging a cascade you can't see.

### Keeping the blast radius small

Eight `!important` declarations, all inside `@media print`, each doing one of two jobs: beat a `display` rule, or beat an author `animation` shorthand. `print-only` carries a matching `@media screen { display: none !important }` for the same reason in reverse.

The values stay variable-driven — `--print-hide`, `--print-show`. You override what it hides *to*, not whether the rule wins. That is the compromise: the mixin is unconditional about winning and completely open about the outcome.

## What CSS still can't do

Background colors and images are stripped by default in every browser's print path, to save ink. There is no CSS declaration that forces them on; the user has to tick "Background graphics" in the print dialog. If your invoice depends on a filled header bar, that is a design constraint, not a bug you can fix.

`px` is a screen unit and behaves unpredictably across print zoom — use `pt` and `in` for print typography.

A few invisible pixels of trailing margin on the last element spill a blank final sheet, which is the most common "it works but looks broken" report.

And unattended generation — emailing invoices, batch export — still needs a driver. The same stylesheet renders it, but something has to press print. That something is a headless browser, and it lives on your server, not in cia.

The [full recipe](https://github.com/Jerry2d3d/css-is-awesome/blob/main/scss/recipes/print-to-pdf.md) documents all seven gotchas, including the light-on-dark theme trap and the `color-scheme: light` flip that fixes it in one line.

Everything above is CSS. The user presses Ctrl+P. That's the feature.
