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

`print-base` freezes it by default:

```scss
@if $freeze-animations {
  * {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
    scale: none !important;
  }
}
```

`transform` and `scale` come along because a reveal that also translates would otherwise print offset, and a `scale(0)` entrance prints nothing at all.

The cost is real and worth naming: on paper you lose deliberate opacity. A watermark at `opacity: 0.1` prints solid. If you want that, `@include cia.print-base($freeze-animations: false)` turns the whole block off — and then invisible text is back on your list of things to check. Most pages want the freeze; documents that lean on translucency should opt out and audit their own animations.

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

These mixins exist to beat a component's own `display` rule. `.site-nav { display: flex }` and `@media print { .site-nav { display: none } }` have equal specificity, so the winner is source order — which, once your build concatenates modules, is not something the mixin author controls. Sass module order, CSS Modules hashing, and a bundler's chunk order all get a vote.

An `!important` on four declarations, scoped to `@media print`, makes "hidden on paper" mean hidden on paper. `print-only` carries a matching `@media screen { display: none !important }` for the same reason in reverse. The value stays a variable, so overriding is still a one-line job — you change what it hides *to*, not whether the rule wins.

## What CSS still can't do

Background colors and images are stripped by default in every browser's print path, to save ink. There is no CSS declaration that forces them on; the user has to tick "Background graphics" in the print dialog. If your invoice depends on a filled header bar, that is a design constraint, not a bug you can fix.

`px` is a screen unit and behaves unpredictably across print zoom — use `pt` and `in` for print typography.

A few invisible pixels of trailing margin on the last element spill a blank final sheet, which is the most common "it works but looks broken" report.

And unattended generation — emailing invoices, batch export — still needs a driver. The same stylesheet renders it, but something has to press print. That something is a headless browser, and it lives on your server, not in cia.

The [full recipe](https://github.com/Jerry2d3d/css-is-awesome/blob/main/scss/recipes/print-to-pdf.md) documents all seven gotchas, including the light-on-dark theme trap and the `color-scheme: light` flip that fixes it in one line.

Everything above is CSS. The user presses Ctrl+P. That's the feature.
