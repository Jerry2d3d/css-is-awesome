---
title: Print is a theme now
slug: print-is-a-theme
category: engineering
tags: css, print, theming, design-tokens, design-systems
audience: front-end developers, design system authors
excerpt: cia's print colour was done three ways at once — a forced light scheme, a "legible" patch for dark themes, and a docs site that hardcoded black-on-white anyway. Collapsing them into four tokens turned print into just another themeable surface.
author: Jerry Hansen
publishDate: 2026-09-09
updatedDate: 2026-09-09
---

We already had print. [Printing a design system](/blog/printing-a-design-system)
and [print-to-PDF with zero JavaScript](/blog/print-to-pdf-with-zero-javascript)
covered the mechanism — the page is the PDF, the browser is the generator, cia
is only the styling. What we *didn't* have was a coherent story for print
**colour**. We had three.

## Three mechanisms, one job

The one job is: put legible ink on paper, whatever theme you were looking at.
Here's how `print-base` was doing it before:

1. **Force the light scheme.** `@media print { color-scheme: light }` makes a
   paired `light-dark()` theme print its light branch — dark text on a white
   sheet, for free.
2. **Patch the dark-only themes.** Terminal has *literal* light ink, so forcing
   the scheme doesn't help it. A `$legible` flag remapped `--ink` and friends to
   `CanvasText` — a targeted darken so the body text survived on white.
3. **Ignore all of that on the docs site.** Our global print layer just wrote
   `body { background: #fff; color: #000 }` and hardcoded the code blocks,
   because a dark theme printing its own surfaces would burn a whole cartridge.

Three answers to one question, and the third one threw away the first two. That
is the shape of a thing that wants to be one idea.

## The idea: print is a surface, so give it tokens

A theme already restyles every surface by owning tokens. Print is just another
surface. So `print-base` now defines a **print palette** —

```scss
--print-ink;    /* body, links, code text — default #000 */
--print-paper;  /* backgrounds            — default #fff */
--print-line;   /* rules, hairlines       — default #999 */
--print-muted;  /* URLs, captions         — default #666 */
```

— and then, inside `@media print`, **rebinds the theme's own colour tokens onto
that palette**:

```scss
@media print {
  :root {
    --ink:            var(--print-ink);
    --surface-default: var(--print-paper);
    --border-default: var(--print-line);
    --code-bg:        var(--print-paper);
    /* …the rest of the colour tokens… */
  }
  body { background: var(--print-paper); color: var(--print-ink); }
}
```

That one move does everything the three mechanisms did, and more. Every element
that reads a theme token — which is every element — resolves to ink on paper.
Dark-only themes are legible **with no flag**, because their `--ink` is now
`--print-ink`, which is black. And because it's all tokens, overriding a single
`--print-*` restyles the whole page.

`$legible` became a deprecated no-op. The rebind supersedes it; passing it warns.

## The payoff: paper you can theme

Once print reads a palette, "make it look different on paper" stops being a
special case:

- **A theme's own paper identity** lives in its one file. Press — our newsprint
  theme — sets `--print-line: #D93025` in its own `@media print` block, and
  every rule on the printed page turns press-red. No other theme changes.
- **A shareable look** — a corporate letterhead palette — is a print-only
  overlay you drop onto *any* theme with `<link media="print">`, because it's
  just `--print-*` overrides and they compose.
- **A letterhead itself** — the branded header on the paper — turned out not to
  be a theme at all. It's *markup*: a `print-only` header that reads the palette.
  So it's a [recipe](/docs/recipes/letterhead), not a feature, and an AI agent
  can generate one on request.

## The editor twist

Here's the part that needed a trick. cia's theme editor edits the live page, but
`--print-*` tokens only do anything inside `@media print` — so editing them
shows *nothing* on screen. You'd have to actually print to see your change.

So the editor's new **Print preview** does the rebind on screen: a paper panel
that binds the theme's tokens to the palette the same way `print-base` does in
print, live. Edit the ink, watch the preview re-ink, copy the `@media print`
block into your theme. The simulation is the same six lines of CSS as the real
thing — which is the nice thing about building on tokens instead of a special
print path.

## The honest cost

One behaviour changed, and it's worth saying plainly: a light theme used to
print its own faint surface tints; now every surface flattens to `--print-paper`
(white by default). That's the *intended* result — predictable, toner-friendly
paper — but it is a visible change, and it's in the changelog as one. A theme
that wants its tints back declares them in its own `@media print` block. The
print look is entirely the theme's to decide; the default is just sensible.

---

None of this added a byte of JavaScript to the package, and the analyzer even
learned the lesson — a literal colour inside `@media print` is now understood as
an intentional paper choice, not a hard-coded-colour smell. Print stopped being
the awkward exception at the edge of the system and became what it should have
been all along: a theme.
