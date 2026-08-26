---
name: print-to-pdf
description: Pixel-faithful PDF export from any page using only a @media print stylesheet — no library, no server.
category: layout
complexity: simple
cia-version: ">=1.0.0"
---

## Use this when

You want users to save a page as a faithful PDF — résumés, invoices, receipts, reports, tickets, order confirmations — and you'd rather not pay for a PDF service (DocRaptor, Prince, PDFShift) or pull in a rendering library. A browser already has a world-class layout + PDF engine built in; you just describe the page *on paper* with `@media print`, and the user saves it from the print dialog. **The page itself is the PDF source — there's no second template to keep in sync.** If your "PDF" is really a fixed artifact unrelated to the page (a generated certificate, a pre-printed form to fill), this isn't it — use a real PDF library. If you need PDFs generated with no human present (emailing invoices, batch export), the *same stylesheet* still drives it — see the automation note under Interactivity.

## Structure (raw HTML)

There's almost nothing to add — the page **is** the structure. The only print-specific markup is marking the on-screen chrome that shouldn't appear on paper. Put `data-cia-recipe` on the document root so tooling can find it.

```html
<body data-cia-recipe="print-to-pdf">
  <nav class="site-nav">…</nav>           <!-- hidden on paper -->

  <main class="doc" data-slot="document">
    <h1>Quarterly Report</h1>
    <p>…</p>
    <a href="https://example.com/details">Full details</a>
  </main>

  <footer class="site-footer">…</footer>  <!-- hidden on paper -->

  <!-- Optional signpost. Ctrl+P works with or without it. -->
  <button type="button" class="no-print" onclick="window.print()">Save as PDF</button>
</body>
```

Notes on the markup:

- **No button is required.** `@media print` applies to *every* print path — `Ctrl/Cmd+P`, File → Print, the dialog's built-in "Save as PDF" destination. The button is a discoverability signpost only; it says "this page was designed to become a PDF."
- Mark every piece of site chrome — `nav`, `footer`, the button itself — so the print layer can hide it. A single shared class (`no-print`) plus your structural elements is enough.
- The `<a>` keeps its real `href`. On paper a clickable link is dead, so we print the URL after it (see Pitfalls).

## Styling (cia mixins)

cia owns the `@media print` layer through four mixins. `print-base` ships the page-level defaults **on**; the rest are per-element.

```scss
@use 'css-is-awesome' as cia;

// 1. Page-level defaults — include ONCE at the ROOT (not inside a selector;
//    it emits @page). Sets the @page box and freezes animations so nothing
//    prints invisible. Defaults are on; toggle via args.
@include cia.print-base;                            // size: letter, margin: 0.5in, freeze on
// @include cia.print-base($size: A4, $margin: 0.75in);   // override the paper
// @include cia.print-base($freeze-animations: false);    // opt out of the freeze

// Make every light-dark() token resolve to its paper-friendly light value,
// so a dark theme doesn't print as white-on-white. (See Pitfalls.)
:root {
  @include cia.print { color-scheme: light; }
}

// 2. Hide site chrome on paper — the "hide the nav" case.
.site-nav,
.site-footer,
.no-print {
  @include cia.print-hidden;
}

// 3. Co-locate per-element print overrides RIGHT NEXT TO the screen rule
//    they change, so the reason is visible where you read the original.
.doc {
  background: cia.color(surface-default);
  color: cia.color(text-primary);

  @include cia.print {
    padding-block: 0;                 // strip screen chrome that wastes the sheet
  }
}
```

Show the minimum to make it work. The `color-scheme: light` flip is the cia-native fix for light-on-dark themes: instead of recoloring element by element, you tell the print sheet to use each token's light side once. Class names are consumer-chosen (`my-doc`, `.doc`) — never `cia-*`.

### The variable filter system

`print-base` emits three custom properties that are the control plane for the whole print layer — flip them and the output changes without rewriting a single rule:

| Variable | Value | What it does |
|---|---|---|
| `--is-print` | `0` on screen, `1` on paper | A readable print-state switch. Use it in `calc()`, `opacity`, or `@container style(--is-print: 1)` to drive custom print-only effects. |
| `--print-hide` | `none` | The `display` applied to `print-hidden` elements on paper. |
| `--print-show` | `revert` | The `display` applied to `print-only` elements on paper. |

Because the *value* is a variable, a per-element exception needs no new rule — just re-aim the variable on that element:

```scss
.legal-footer { @include cia.print-hidden; --print-hide: revert; } // keep this one ON paper
.receipt-grid { @include cia.print-only;   --print-show: grid; }   // print-only block as a grid

.cover { @include cia.print { opacity: var(--is-print); } }        // fades in only on paper
```

That is the whole reason this recipe needs no JavaScript and no headless-browser service: the media query plus a few variables **are** the engine.

## Interactivity

**Zero JS.** The browser runs no script and needs no server — it reads your `@media print` rules and renders. The user presses `Ctrl/Cmd+P` (or File → Print) and picks the built-in "Save as PDF" destination. That is the entire mechanism.

The only optional code is a **discoverability signpost** — a one-line button so users notice the page is built to be saved:

```html
<button type="button" class="no-print" onclick="window.print()">Save as PDF</button>
```

It's sugar over `window.print()` and nothing depends on it — `Ctrl+P` does the same job. Hide it on paper with `@include cia.print-hidden`. The framework examples below show this one button in each stack.

## A11y checklist

- [ ] Print output preserves DOM/reading order — the visual sheet follows source order ([WCAG 2.2 SC 1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html))
- [ ] Hiding chrome with `print-hidden` removes only navigation/controls, never content the document needs to make sense ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Ink-on-paper contrast meets the minimum — the `color-scheme: light` flip keeps dark text on a light sheet ([WCAG 2.2 SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- [ ] Link destinations survive on paper — print the `href` inline so a printed link is still followable ([WCAG 2.2 SC 2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html))
- [ ] Animations are frozen and `opacity` forced to `1` in print so no content snapshots invisible (`print-base` does this by default)
- [ ] The optional trigger is a real `<button type="button">` with a clear accessible name, hidden on paper ([WCAG 2.2 SC 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html))

## Framework examples

All four are the same **optional** signpost button — the only framework-specific code in this recipe, and every one is a thin wrapper over `window.print()`. Hide it on paper with `@include cia.print-hidden` (or the `no-print` class).

### React

```tsx
export function PrintButton({
  children = "Save as PDF",
  className,
}: { children?: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      {children}
    </button>
  );
}
```

### Vue

```vue
<template>
  <button type="button" @click="() => window.print()">
    <slot>Save as PDF</slot>
  </button>
</template>
```

### Svelte

```svelte
<button type="button" on:click={() => window.print()}>
  <slot>Save as PDF</slot>
</button>
```

### Vanilla (Web Component)

```js
class PrintButton extends HTMLElement {
  connectedCallback() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = this.textContent.trim() || "Save as PDF";
    this.textContent = "";
    btn.addEventListener("click", () => window.print());
    this.appendChild(btn);
  }
}
customElements.define("print-button", PrintButton);

// Usage: <print-button>Save as PDF</print-button>
```

## Variants

### International paper (A4) / landscape

Pass the size through `print-base` (at the root), and set orientation on `@page`:

```scss
@include cia.print-base($size: A4, $margin: 0.75in);   // at root, not inside a selector

@include cia.print {
  @page { size: A4 landscape; }
}
```

### Force a page break before a section

Start a new sheet at a major boundary (a new invoice, a new chapter):

```scss
.section-start {
  @include cia.print { break-before: page; }
}
```

### Print-only content (URL footer, "printed on" stamp)

Content that should appear *only* on paper, hidden on screen:

```scss
.print-footer { @include cia.print-only; }
```

## Pitfalls

These are the bugs that *will* bite — each one cost real debugging time. This list is the value.

- **Animations snapshot invisible.** Entrance fades and scroll reveals often start at `opacity: 0`; a PDF captured mid-animation prints **blank**. `print-base` collapses animations to zero duration and pins them to their final frame, so the fade lands visible. It does *not* force `opacity: 1` / `transform: none` — that would also flatten deliberate translucency and rotation. Elements that weren't animating keep their own styling. Keep the freeze on unless you have a specific reason not to.
- **A blank trailing page.** A few invisible pixels of trailing `margin`/`padding`/`border` on the last element spill an empty final sheet. Zero them: `@include cia.print { .doc > :last-child { margin-block-end: 0; border-block-end: none; } }`. Also watch a full-height scroll/perspective wrapper (`height: 100vh`, `overflow`, `perspective`) — in print set `overflow: visible` and let content flow, or it clips paged output.
- **Light-on-dark text becomes white-on-white.** Anything styled light text on a dark surface vanishes on a white sheet. The cia fix is the `color-scheme: light` flip in `print-base`'s block above — it lands every `light-dark()` token on its light value. For a one-off, override the single element with `@include cia.print { color: cia.color(text-secondary); }`.
- **Background colors are off by default.** Browsers strip background colors and images when printing to save ink. If your design depends on them, tell users to tick "Background graphics" (Chrome) / "Print backgrounds" (Firefox/Safari) in the print dialog — there's no CSS that forces it on.
- **Links lose their destination.** A clickable link is dead on paper — print the URL after it:
  ```scss
  @include cia.print {
    a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.85em; word-break: break-all; }
  }
  ```
- **Page breaks split things awkwardly.** Keep headings with their content and don't split atomic blocks: `@include cia.print { h2, h3 { break-after: avoid; } li, .card { break-inside: avoid; } .doc { orphans: 3; widows: 3; } }`.
- **`px` gets fuzzy in print.** Use `pt` / `in` for print typography and spacing — `px` is a screen unit and scales unpredictably across print zoom.

## Related recipes

- [`dialog`](./dialog.md) — a print-only summary often lives inside a confirmation dialog before export
