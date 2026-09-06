---
title: Printing a design system
slug: printing-a-design-system
category: engineering
tags: css, print, pdf, page-breaks, design-system
audience: front-end developers, design system authors
excerpt: cia's pages turn into real printed documents — cover, table index, numbered sheets, followable links — with zero JavaScript and no PDF library. The generator was in the browser the whole time; we only had to ship the styling layer, and each honest-looking feature hid a smaller, sharper bug than we expected.
author: Jerry Hansen
publishDate: 2026-09-06
updatedDate: 2026-09-06
---

Every "export to PDF" button you have ever shipped is a lie about where the work
happens. There is usually a headless Chromium on a server, or a client-side
library reimplementing text layout, quietly rebuilding the thing the browser in
front of you already does. The browser has a layout engine and a PDF writer
wired together behind `Ctrl/Cmd+P`. The page **is** the PDF source. We didn't
need a generator — we needed a styling layer, and it's pure CSS.

This is the story of making cia's own pages print as real documents: the theme
editor becomes a "Theme Specification," the docs print a followable article.
Zero JavaScript in the mechanism. Every feature below started as a problem I
expected to be big and turned out to be small.

## The family

Three mixins carry the whole thing. `print-base` goes once at the root and emits
a variable control plane, the `@page` box, and a few sane defaults.
`print-hidden` takes screen chrome off the paper. `print-only` reveals a block
that exists only on paper — a cover, an index, a URL footer.

```scss
// app/globals.scss — top level, included ONCE.
@use 'css-is-awesome/api' as cia;

@include cia.print-base;

.site-nav,
.doc-sidebar { @include cia.print-hidden; }
```

Nothing emits until called. `print-base` has to live at the stylesheet root
because it writes a top-level `:root` and an `@page` — put it in a
`.module.scss` and Next's CSS-Modules pure mode rejects it outright.

## Page breaks are structure, and hard numbers are a promise

A spec document has a shape the screen doesn't: cover, table index, then one
section per page. The section break is one line:

```scss
.section {
  @include cia.print { break-before: page; }
}
```

The honest part is the index. The theme editor's table index hard-codes its page
numbers right in the markup — "Button … 2", "Badge … 3", "Inputs … 4". A
hard-coded page number is a claim, and it's only *true* while every section
forces its own page. Force `break-before: page` on section k and it lands
deterministically on page k+1. Drop one break and section 3 reflows onto page 2
— the index now points at the wrong sheet, a bug that surfaces only in print
preview.

So the rule became: hard numbers only where you can guarantee one page per
section. That's the theme editor, where each section is a component demo sized
to a page. The docs do the opposite — they print an "On this page" list of plain
bullets, no numbers, because article prose legitimately flows across pages.
Forcing a break on every `<h2>` of a long article just strands half-empty
sheets. Bullets are the honest answer when you can't promise a page count.

## The dark-theme bug that shrank

Here's the one I got wrong first. cia's dark themes render light text on dark
surfaces. My assumption: printing them means remapping every background to white
and every dark surface to paper, a big translation layer.

Then I actually printed one. Browsers **don't print backgrounds** by default —
the dark surface was never going to reach the paper. The real bug was much
smaller and much dumber: the light-gray and green *body text* was still light,
and it was vanishing on white paper. Not the whole theme. Just the ink.

So the fix collapsed. `print-base` forces `color-scheme: light` in print, which
lands every paired theme's `light-dark()` token on its light branch for free —
they print correct with no extra code. For the dark-*only* themes that use
literal light values, a `$legible` flag darkens just the body-text tokens:

```scss
@media print {
  :root {
    color-scheme: light;          // paired themes flip for free

    @if $legible {                // dark-only themes: darken ONLY body ink
      --ink:       CanvasText;
      --ink-soft:  color-mix(in sRGB, CanvasText 78%, Canvas);
      --ink-faint: color-mix(in sRGB, CanvasText 60%, Canvas);
      --muted:     color-mix(in sRGB, CanvasText 70%, Canvas);
    }
  }
}
```

`--code-*` tokens are left alone, so code blocks keep their own ink; accents are
left alone, so links and headings keep the theme's voice. The lesson was to stop
theorizing and print the thing — the actual bug was a quarter the size of the
one I'd designed a fix for.

## A printed link is dead without its URL

Underlined blue text means nothing on paper. You can't click it. The obvious fix
is a hidden `<span>` next to every link holding a duplicate of its `href`, shown
only in print — and that means touching markup for every link on the site.

CSS already knows the href. `attr()` reads it, `::after` prints it, and the
`$link-urls` flag does it site-wide with no markup at all:

```scss
a[href^="http"]::after { content: " (" attr(href) ")"; }        // external: as-is
a[href^="/"]::after    { content: " (#{$link-origin}" attr(href) ")"; }  // internal: full URL
a[href^="#"]::after    { content: none; }                        // same-page: skip
```

External links print their href verbatim. Internal `/…` links get `$link-origin`
prepended so a paper reader gets a real, typeable URL instead of a bare path.
Same-page `#anchor` links print nothing, because the URL adds nothing there. No
duplicate spans, no markup churn — the destination was in the attribute all
along.

## Sheet numbers, when the engine has them

The page number lives in a `@page` margin box:

```scss
@page { @bottom-center { content: counter(page); font-size: 9pt; } }
```

Guarded behind a `$page-numbers` flag, because margin boxes aren't universal —
engines without support just print unnumbered sheets, no error, no fallback.
That's fine: it's progressive enhancement. The table index keeps its own numbers
in the markup, so navigation survives even where the margin box doesn't.

## It's flags, and it's a recipe

All of it collapses into `print-base` arguments now. Nothing here changes for an
existing caller — every polish flag defaults off:

```scss
@include cia.print-base(
  $legible: true,                        // dark-only themes get dark body ink
  $link-urls: true,                      // links print their destination
  $link-origin: 'https://cssisawesome.com',
  $page-numbers: true                    // sheet numbers in the margin box
);
```

And it isn't just ours to keep. The whole thing is the `print-spec` recipe, with
React and Angular examples for the one genuinely optional piece — a dynamic "On
this page" index that harvests the current page's headings (re-read on route
change *and* on `beforeprint`, or the SPA prints the last page's list). The
pagination itself — breaks, show/hide, sheet numbers, followable links — is pure
CSS and identical across every framework.

None of this needed a PDF library, a headless browser, or a plugin. The
generator was sitting behind `Ctrl+P` the entire time; we only had to hand it a
stylesheet.

---

*In css-is-awesome: `cia.print-base`, `cia.print-hidden`, and `cia.print-only`
ship today, and the [`print-spec`](/docs/recipes) recipe builds the full cover +
index + numbered pages on top of them. The theme editor at
[/themes](/themes) prints as a Theme Specification — open it and hit `Ctrl+P`.*
