---
name: letterhead
description: A print-only letterhead — a branded header (name, address, a rule) that appears only when the page is printed, styled with cia's print-only mixin and the themeable --print-* palette.
category: layout
complexity: simple
cia-version: ">=1.11.0"
---

## Use this when

You have a page — an invoice, a quote, a report — that people **print**, and
you want a branded header on the paper that isn't on the screen: a company
name, an address line, a rule under it. A letterhead. It's not a theme and it's
not a colour scheme — it's a small piece of **markup you add**, styled with
cia's print helpers so it shows on paper only and matches the print palette.

Pair it with [`print-to-pdf`](./print-to-pdf.md) (the page *is* the document) or
[`print-spec`](./print-spec.md) (a paginated spec document).

## Structure (raw HTML)

```html
<article class="doc">
  <!-- Only rendered on paper. On screen your site chrome carries identity. -->
  <header class="letterhead">
    <p class="letterhead-name">ACME CORPORATION</p>
    <p class="letterhead-tag">Threat mitigation since 1949</p>
    <p class="letterhead-addr">1 Cliffside Drive · Painted Desert Mesa · acme.example</p>
  </header>

  <!-- …the rest of the document… -->
</article>
```

## Styling (cia mixins)

`cia.print-only` hides the block on screen and reveals it in `@media print`. It
reads the **print palette** — `--print-ink`, `--print-line`, `--print-muted` —
that `cia.print-base` defines, so the letterhead always matches the paper look
and follows any per-theme print override (a newsprint red rule, a navy ink).

```scss
@use 'css-is-awesome/api' as cia;

// Requires cia.print-base once at the stylesheet ROOT (it defines --print-*).
.letterhead {
  @include cia.print-only;
  margin-block-end: 1rem;
  padding-block-end: 0.5rem;
  border-block-end: 3px double var(--print-line);   // the paper's rule colour
  text-align: center;
}

.letterhead-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.9rem;
  letter-spacing: 0.14em;
  color: var(--print-ink);                            // the paper's ink
}
.letterhead-tag  { margin: 0.15rem 0 0; font-style: italic; color: var(--print-muted); }
.letterhead-addr { margin: 0.35rem 0 0; font-family: var(--font-mono); font-size: 0.62rem; color: var(--print-muted); }
```

Read `--print-*` directly rather than `--ink` / `--border-default`: in print
those are already rebound onto the palette, but naming the print tokens states
the intent and survives a per-theme print override unchanged.

## Interactivity

**Zero JS.** A letterhead is static markup — there is nothing to wire. It is
absent from the screen (`print-only` sets `display: none`) and present on paper
because `@media print` reveals it. No script, no state, no server.

## A11y checklist

- [ ] The letterhead is branding, not content — never put information the reader needs *only* here; it is absent from the screen, so the on-screen header must carry the real identity and links ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Keep the wordmark a `<p>`, not a heading, so a print-only `<h1>` doesn't fork the document outline between screen and paper ([WCAG 2.2 SC 2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html))
- [ ] A logo `<img>` carries a real `alt` (the company name), or `alt=""` when adjacent text already names it ([WCAG 2.2 SC 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html))
- [ ] Ink-on-paper contrast meets the minimum — `--print-ink` on `--print-paper` is dark-on-light by default; keep any per-theme override readable ([WCAG 2.2 SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))

## Framework examples

The letterhead is static markup — no props, no lifecycle, no client code. Every
stack renders the same header; the visibility and styling live entirely in the
`@media print` CSS above.

### React

```tsx
export function Letterhead() {
  return (
    <header className="letterhead">
      <p className="letterhead-name">ACME CORPORATION</p>
      <p className="letterhead-addr">1 Cliffside Drive · acme.example</p>
    </header>
  );
}
```

### Vue

```vue
<template>
  <header class="letterhead">
    <p class="letterhead-name">ACME CORPORATION</p>
    <p class="letterhead-addr">1 Cliffside Drive · acme.example</p>
  </header>
</template>
```

### Svelte

```svelte
<header class="letterhead">
  <p class="letterhead-name">ACME CORPORATION</p>
  <p class="letterhead-addr">1 Cliffside Drive · acme.example</p>
</header>
```

### Vanilla

```html
<header class="letterhead">
  <p class="letterhead-name">ACME CORPORATION</p>
  <p class="letterhead-addr">1 Cliffside Drive · acme.example</p>
</header>
```

## Variants

- **Newsprint rule.** A theme (e.g. Press) overrides `--print-line` in its own
  `@media print` block; the letterhead's rule turns that colour automatically —
  no change to the letterhead itself.
- **Logo instead of a wordmark.** Swap `.letterhead-name` for an `<img>` (give
  it `alt`). Prefer an inline SVG or a build-time data URI so nothing is fetched
  at print time.
- **Footer letterhead.** The same pattern as a `print-only` footer — page-foot
  address and a rule — using `margin-block-start: auto` inside a full-page flex
  column to pin it to the bottom (see [`print-to-pdf`](./print-to-pdf.md)).

## Pitfalls

- **`print-base` must be included once at the stylesheet root**, or the
  `--print-*` tokens are undefined and the rule/ink fall back to initial values.
- **Don't duplicate identity on screen.** Because it is `print-only`, let your
  normal on-screen header carry the brand; the letterhead is for paper alone.
- **A full-bleed coloured band costs toner.** Prefer ink, a rule, and restraint;
  let `--print-paper` stay near-white unless a theme deliberately wants a tint.

## Related recipes

- [`print-to-pdf`](./print-to-pdf.md) — the page *is* the document; save it as a
  faithful PDF. The letterhead lives on top of this.
- [`print-spec`](./print-spec.md) — paginate a page into a spec document with a
  cover, index, and printed sheet numbers.
