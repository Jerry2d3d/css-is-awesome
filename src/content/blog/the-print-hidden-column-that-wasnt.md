---
title: The print-hidden column that wasn't
slug: the-print-hidden-column-that-wasnt
category: engineering
tags: css, print, grid, layout, debugging
audience: front-end developers, design system authors
excerpt: Building a "print this invoice" example, I hid the sidebar for print and expected the invoice to take the page. It took a third of it. The sidebar was gone — its grid column wasn't. A short note on the print refinements that shook out of one example.
author: Jerry Hansen
publishDate: 2026-09-07
updatedDate: 2026-09-07
---

The [print system](/blog/printing-a-design-system) was already done — flags on
`print-base`, followable link URLs, sheet numbers, dark themes made legible.
Then I built an example to *show* it: a working invoice on the Examples page
that you Ctrl+P into a PDF. Building the demo is where the styling actually got
tested, and three things needed fixing that the abstract system never surfaced.

## "display: none" hides the element, not its track

The example page lives in a two-column shell: a left nav rail and the content.
Printing a page shouldn't print the site's navigation, so the rail already
carried `print-hidden`. I hit Ctrl+P expecting the invoice to spread across the
sheet. It sat in the left third of the page, a wide empty margin down the right.

The rail was gone. Its **column** was not.

```scss
.examples-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
}
.rail { display: none; } // print-hidden
```

`display: none` removes a grid item from the box tree — you can't see it, it
takes no space *of its own*. But `grid-template-columns: 220px minmax(0, 1fr)`
is still in force, and it still declares a 220px track. The track doesn't
belong to the hidden item; it belongs to the grid. So the content sat in the
`1fr` column with a 220px ghost beside it, and the invoice printed into
two-thirds of the page.

This is the same lesson as a hundred other CSS gotchas: **hiding a thing and
reclaiming its space are different operations.** For a grid, hiding the child
does nothing to the template. You have to change the template:

```scss
.examples-shell {
  @media print {
    display: block;
    max-width: none;
    padding: 0;
  }
}
```

Drop to block flow in print and the phantom column is gone — the content is the
whole width. (The docs shell already did this; the examples shell, newer, did
not. Two shells, one lesson, learned twice.)

## Full page means asking for the full page

Full *width* wasn't full *page*. An invoice is short; it floated at the top of
the sheet with the closing stamp tucked right under the table. To make it read
like a document — content at the top, sign-off at the foot — the artifact has
to claim the page's height and push its own footer down:

```scss
.invoice {
  @include cia.print {
    min-block-size: calc(100dvh - 1.2in); // fill the printable area
    display: flex;
    flex-direction: column;
  }
}
.invoice .stamp { margin-block-start: auto; } // sink to the bottom
```

`margin-block-start: auto` inside a flex column is the old "push me to the far
end" trick, and it's exactly right for a page footer.

## A QR code that only exists on paper

The invoice links to an online version. On paper a link is dead text unless you
print its URL — which `print-base`'s `$link-urls` flag already does. But paper
you can *scan* is better than paper you have to type. So the printed invoice
grows a QR code that isn't there on screen:

```scss
.qr { @include cia.print-only; } // hidden on screen, shown in print
```

The interesting part is where the QR image comes from. cia ships no QR
generator, and I wasn't about to add a runtime dependency to draw one in the
browser — that's the opposite of the zero-JS point. So it's generated **at
build time**: the page is a server component that renders the QR to an inline
SVG string during the static export, and bakes it straight into the HTML. No
script runs in the browser, no image is fetched, and the generator (one small
dev-only library) never ships to anyone who installs the package. On paper you
get a scannable square; in the bundle you get nothing extra.

## The example was the test

None of these were bugs in the print *system* — the mixins were fine. They were
things you only see when a real page meets a printer: a grid that keeps a column
for a guest who left, a short document that won't fill a page unless asked, a
link that wants to be scannable. The abstract feature passed every check. The
concrete example is what printed sideways.

That's the argument for building the demo, not just documenting the API. The
demo prints. You can't hide a bug from a printer.
