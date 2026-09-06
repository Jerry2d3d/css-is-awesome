---
name: print-spec
description: Turn a live page into a paginated specification document on Ctrl+P — cover + table index, one page per section, printed sheet numbers — with pure-CSS page breaks.
category: layout
complexity: medium
cia-version: ">=1.9.0"
---

## Use this when

You want `Ctrl/Cmd+P` (or Save-as-PDF) to emit a **spec document** from a page you already have — a cover page with a numbered table index, then every major section starting on its own sheet, with a page number printed in the margin of each. The cia site itself does this: the theme editor at `/themes` prints as a "Theme Specification," and the docs render a print-only "On this page" index. This is the *paginate-it-as-a-spec* recipe. If you only need a page to save as a faithful PDF — a résumé, an invoice, a receipt where the page **is** the document and pagination is incidental — use [`print-to-pdf`](./print-to-pdf.md) instead; it is simpler and this recipe builds on it. Reach for this one when the printed artifact has a *structure of its own* (index → sections → numbered pages) that the screen page does not show.

## Structure (raw HTML)

Three ingredients: **screen chrome** that must vanish on paper, a **cover/index** that appears only on paper, and the **sections** — each one a page. Put `data-cia-recipe` on the root; mark the index and each section with `data-slot` so tooling and your styles can find them.

```html
<main data-cia-recipe="print-spec">
  <!-- 1. Screen-only chrome — hidden on paper. -->
  <nav class="site-nav no-print">…</nav>
  <aside class="doc-sidebar no-print">…</aside>

  <!-- 2. Cover + table index — PRINT ONLY (hidden on screen).
       The page numbers are hard-coded in the markup; they are
       honest because each section forces its own page below,
       so section k always lands on page k+1. -->
  <nav class="print-index" data-slot="index" aria-label="Table index">
    <h2>Table index</h2>
    <ol>
      <li><span>Cover &amp; index</span><span class="print-leader" aria-hidden="true"></span><span class="print-page">1</span></li>
      <li><span>Overview</span><span class="print-leader" aria-hidden="true"></span><span class="print-page">2</span></li>
      <li><span>Tokens</span><span class="print-leader" aria-hidden="true"></span><span class="print-page">3</span></li>
      <li><span>Components</span><span class="print-leader" aria-hidden="true"></span><span class="print-page">4</span></li>
    </ol>
  </nav>

  <!-- 3. Each section is one printed page. -->
  <section class="section" data-slot="section" id="overview">
    <h2>Overview</h2>
    <p>…</p>
  </section>
  <section class="section" data-slot="section" id="tokens">
    <h2>Tokens</h2>
    <p>…</p>
  </section>
  <section class="section" data-slot="section" id="components">
    <h2>Components</h2>
    <p>…</p>
  </section>
</main>
```

Notes on the markup:

- **No button is required.** Every print path — `Ctrl/Cmd+P`, File → Print, the dialog's built-in "Save as PDF" — triggers the same `@media print` layer. A `<button onclick="window.print()">` is a discoverability signpost only (see [`print-to-pdf`](./print-to-pdf.md) for that one line).
- The index is a real `<nav aria-label="Table index">`, not a decorative block — it is genuine navigation for the printed artifact.
- The `print-leader` span is the dotted line between a label and its page number; it is `aria-hidden` because it carries no meaning for a screen reader.

## Styling (cia mixins)

Four moves, all pure CSS: `print-base` once at the root, `print-only` on the index, `print-hidden` on the chrome, and `break-before: page` on each section. A `@page` margin box adds the printed sheet number.

**1. In your GLOBAL stylesheet** — `print-base` emits its own `:root` block plus `@page`, so it must sit at the top level of a global/root stylesheet, never inside a `.module.scss` (a top-level `:root` is a hard build error under Next.js CSS Modules pure mode). This is also where the sheet-number `@page` box lives, because it extends the same `@page` box `print-base` opened.

```scss
// app/globals.scss (or your single root stylesheet) — included ONCE.
@use 'css-is-awesome/api' as cia;

// The control plane, the @page box, the animation freeze — plus the print
// polish flags. Each defaults OFF except the two structural ones, so nothing
// changes for existing callers until you opt in:
//   $legible      — dark-only themes (literal light ink) print dark body text.
//   $link-urls    — every link prints its destination, so paper is followable.
//   $link-origin  — prepended to internal (/…) hrefs so they print as full URLs.
//   $page-numbers — sheet numbers in the bottom-center margin box.
// print-base also forces `color-scheme: light` in print for free, so PAIRED
// themes (light-dark() tokens) land on their light branch automatically.
@include cia.print-base(
  $legible: true,
  $link-urls: true,
  $link-origin: 'https://example.com',
  $page-numbers: true
);

// Hide site chrome on paper.
.site-nav,
.doc-sidebar,
.no-print {
  @include cia.print-hidden;
}
```

`$legible` darkens only the body text tokens (`--ink`, `--ink-soft`,
`--ink-faint`, `--muted`) — code blocks keep their own `--code-*` ink, and
accents are left alone so links and headings keep the theme's voice.
`$link-urls` prints external hrefs directly and internal ones prefixed with
`$link-origin`; same-page `#anchor` links are skipped (the URL adds nothing).

**2. In the page's COMPONENT stylesheet** — the index show/hide and the per-section page break emit nothing until called, so they are safe in a `.module.scss`.

```scss
// PrintSpec.module.scss — component stylesheet, so import the zero-emit barrel.
@use 'css-is-awesome/api' as cia;

// The cover/index is paper-only: hidden on screen, revealed in print.
.print-index {
  @include cia.print-only;
}
.print-index li {
  display: flex;
  align-items: baseline;
  gap: cia.space(2);
}
.print-leader {
  flex: 1;
  border-block-end: 1px dotted cia.color(text-muted);
}
.print-page {
  font-family: var(--font-mono, monospace);
}

// THE KEY MOVE: each section starts a new sheet. This is what makes the
// index's hard-coded numbers a guarantee rather than a hope — section k
// is deterministically page k+1.
.section {
  @include cia.print { break-before: page; }
}
```

Class names are consumer-chosen (`.print-index`, `.section`) — never `cia-*`. For the full account of *why* the print mixins compile to `!important` and why `@layer` cannot replace them, see [`print-to-pdf`](./print-to-pdf.md); the same variable-driven control plane (`--is-print` / `--print-hide` / `--print-show`) powers this recipe.

**Honest numbering.** Hard-coded page numbers in the index are only truthful while every section forces its own break. Drop the `break-before: page` and section 3 might reflow onto page 2 — the index now *lies*. If you cannot guarantee one-page-per-section (long, flowing prose that legitimately spans pages), do not print hard numbers; use the dynamic harvested index below with bullets instead, which is exactly why the docs site prints bullets, not numbers, for article prose.

## Interactivity

**The pagination is pure CSS — zero JavaScript.** `print-only`, `print-hidden`, `break-before: page`, and the `@page` margin box are the entire engine. A **static** spec with a hard-coded table index needs no script at all.

The **only** optional JS is a *dynamic* "On this page" index that harvests the current page's own `<h2>` headings so the printed index matches whatever page is being printed. There are two non-obvious requirements, and getting either wrong ships a stale index:

- **Re-read on navigation.** In an SPA a shared layout persists across client-side route changes, so a harvest that runs once at mount goes stale the moment the user navigates. Key the harvest to the current route.
- **Re-read on `beforeprint`.** The window fires `beforeprint` immediately before the print dialog snapshots the page. Harvesting there guarantees the printed list reflects the DOM *as printed*, even if the route-keyed read missed a late render. This is the belt-and-braces guarantee.

Harvest `article h2[id]`, store `{ id, text }`, render a `print-only` `<nav>`. Return nothing when there are no headings. The screen never sees it; only paper does.

## A11y checklist

- [ ] The printed index is a real `<nav>` with an `aria-label`, so it is an addressable landmark, not a decorative block ([WAI-ARIA APG: Landmark regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/))
- [ ] Section headings stay real `<h2>` elements (the harvest reads them, it does not replace them), preserving the document outline ([WCAG 2.2 SC 2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html))
- [ ] Print output follows DOM/reading order — the cover/index precedes the sections in source, so it prints first ([WCAG 2.2 SC 1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html))
- [ ] Hiding chrome with `print-hidden` removes only navigation and controls, never content the spec needs to make sense ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))
- [ ] Ink-on-paper contrast meets the minimum — the `color-scheme: light` flip keeps dark text on a light sheet ([WCAG 2.2 SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- [ ] Purely visual leader dots between a label and its page number are `aria-hidden`, so a screen reader hears "Overview 2", not a run of dots ([WCAG 2.2 SC 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html))

## Framework examples

Every example is the **optional** dynamic "On this page" index — the only framework-specific code in this recipe. The pagination itself (section breaks, show/hide, sheet numbers) is pure CSS and identical across stacks. Each harvests `article h2[id]`, re-reads on navigation **and** on `beforeprint`, and renders a `print-only` `<nav>`. The static hard-coded index needs none of this.

### React

```tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./PrintSpecIndex.module.scss";

// Mirrors the cia docs site's DocsPrintIndex.
export default function PrintSpecIndex() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const harvest = () => {
      const article = document.querySelector<HTMLElement>("article");
      if (!article) return;
      const nodes = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2[id]"));
      setHeadings(nodes.map((n) => ({ id: n.id, text: n.textContent ?? "" })));
    };
    // Harvest on navigation (pathname dep) AND at the moment of printing.
    // The shared layout persists across client navigations, so a
    // pathname-only read can go stale; beforeprint reads the CURRENT DOM.
    harvest();
    window.addEventListener("beforeprint", harvest);
    return () => window.removeEventListener("beforeprint", harvest);
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <nav className={styles.printIndex} aria-label="On this page">
      <h2>On this page</h2>
      <ul>
        {headings.map((h) => (
          <li key={h.id}>{h.text}</li>
        ))}
      </ul>
    </nav>
  );
}
```

### Angular

```ts
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { Subscription, filter } from "rxjs";

@Component({
  selector: "print-spec-index",
  standalone: true,
  template: `
    <nav class="print-index" aria-label="On this page" *ngIf="headings.length">
      <h2>On this page</h2>
      <ul>
        <li *ngFor="let h of headings">{{ h.text }}</li>
      </ul>
    </nav>
  `,
})
export class PrintSpecIndexComponent implements OnInit, OnDestroy {
  headings: { id: string; text: string }[] = [];
  private sub?: Subscription;

  constructor(private router: Router, private host: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.harvest();
    // Re-read on every completed navigation — the layout persists.
    this.sub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.harvest());
  }

  // The guarantee: re-read the CURRENT DOM right before the print dialog.
  @HostListener("window:beforeprint")
  harvest(): void {
    const article = this.host.nativeElement.ownerDocument.querySelector("article");
    if (!article) return;
    this.headings = Array.from(article.querySelectorAll<HTMLHeadingElement>("h2[id]")).map(
      (n) => ({ id: n.id, text: n.textContent ?? "" }),
    );
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
```

### Vue

```vue
<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const headings = ref([]);

const harvest = () => {
  const article = document.querySelector("article");
  if (!article) return;
  headings.value = Array.from(article.querySelectorAll("h2[id]")).map((n) => ({
    id: n.id,
    text: n.textContent ?? "",
  }));
};

watch(() => route.fullPath, harvest);          // re-read on navigation
onMounted(() => {
  harvest();
  window.addEventListener("beforeprint", harvest); // re-read before print
});
onUnmounted(() => window.removeEventListener("beforeprint", harvest));
</script>

<template>
  <nav v-if="headings.length" class="print-index" aria-label="On this page">
    <h2>On this page</h2>
    <ul>
      <li v-for="h in headings" :key="h.id">{{ h.text }}</li>
    </ul>
  </nav>
</template>
```

### Svelte

```svelte
<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores"; // SvelteKit route store

  let headings = [];
  const harvest = () => {
    const article = document.querySelector("article");
    if (!article) return;
    headings = Array.from(article.querySelectorAll("h2[id]")).map((n) => ({
      id: n.id,
      text: n.textContent ?? "",
    }));
  };

  $: $page.url.pathname, harvest();            // re-read on navigation

  onMount(() => {
    harvest();
    window.addEventListener("beforeprint", harvest); // re-read before print
    return () => window.removeEventListener("beforeprint", harvest);
  });
</script>

{#if headings.length}
  <nav class="print-index" aria-label="On this page">
    <h2>On this page</h2>
    <ul>
      {#each headings as h (h.id)}
        <li>{h.text}</li>
      {/each}
    </ul>
  </nav>
{/if}
```

### Vanilla (Web Component)

```js
// No router to hook: in a multi-page site each load re-runs the harvest,
// so `beforeprint` is the only listener needed. In an SPA, also call
// harvest() from your router's after-navigation hook.
class PrintSpecIndex extends HTMLElement {
  connectedCallback() {
    this.harvest();
    this._onBeforePrint = () => this.harvest();
    window.addEventListener("beforeprint", this._onBeforePrint);
  }
  disconnectedCallback() {
    window.removeEventListener("beforeprint", this._onBeforePrint);
  }
  harvest() {
    const article = document.querySelector("article");
    const items = article
      ? Array.from(article.querySelectorAll("h2[id]")).map((n) => `<li>${n.textContent}</li>`)
      : [];
    this.innerHTML = items.length
      ? `<nav class="print-index" aria-label="On this page"><h2>On this page</h2><ul>${items.join("")}</ul></nav>`
      : "";
  }
}
customElements.define("print-spec-index", PrintSpecIndex);

// Usage: <print-spec-index></print-spec-index>
// The STATIC hard-coded index needs zero JS — just the markup + CSS above.
```

## Variants

### Static, hard-coded table index (zero JS)

Skip every framework example. Write the numbers into the markup (the Structure block above) and rely on `break-before: page` to make them true. Deterministic, no runtime, nothing to hydrate. Choose this whenever your sections are guaranteed one page each.

### International paper (A4) / landscape

Pass the size through `print-base` at the root, and set orientation on `@page`:

```scss
// app/globals.scss — top level, not inside a selector, not in a component module
@include cia.print-base($size: A4, $margin: 0.75in);

@include cia.print {
  @page { size: A4 landscape; }
}
```

### Bullets instead of numbers (flowing prose)

When a section legitimately spans several pages, drop the page-number column and print the harvested index as plain bullets — an honest "here's what's in this document" without a number that would be a guess. This is what the cia docs do for article prose.

## Pitfalls

- **`print-base` must be root/global.** It emits a `:root` block plus `@page`; inside a `.module.scss` that is a hard build error under Next.js CSS Modules pure mode, and wrapping it in a selector double-nests the `:root` it already writes. It belongs at the top level of a single global stylesheet, included once.
- **`@page` margin boxes are not universal.** `@bottom-center { content: counter(page) }` is unsupported in some engines, which simply print **unnumbered** sheets — no error, no fallback. Keep the table index's own numbers in the markup so navigation survives; treat the margin-box number as progressive enhancement.
- **Hard-coded index numbers lie without forced breaks.** The numbers are only honest while every section forces its own page. Remove a `break-before: page` and the index silently points at the wrong pages — a bug that only shows up in print preview. Either guarantee one-page-per-section or switch to the bullets variant.
- **Forcing `break-before` on flowing prose wastes paper.** A `break-before: page` on every heading of a long article strands half-empty sheets. The docs site deliberately prints *bullets, not numbers* for prose precisely so it does not have to force a break per heading. Reserve forced breaks for genuinely page-sized sections (a component demo, a spec table), not every paragraph.
- **A stale index from a run-once harvest.** In an SPA the layout persists across navigation, so a mount-only read prints the previous page's headings. Re-read on the route change **and** on `beforeprint` — the `beforeprint` read is the one that guarantees the paper matches the page.
- **Dark themes print white-on-white** unless the `color-scheme: light` flip is in place (it lands every `light-dark()` token on its light value). See [`print-to-pdf`](./print-to-pdf.md) Pitfalls for the element-level escape hatch.

## Related recipes

- [`print-to-pdf`](./print-to-pdf.md) — the foundation: save a styled page as a faithful PDF with a `@media print` stylesheet. This recipe adds pagination, a cover/index, and sheet numbers on top of it.
