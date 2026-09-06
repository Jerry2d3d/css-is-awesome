---
title: There is no :nth-of-class, and it will bite you
slug: there-is-no-nth-of-class
category: discovery
tags: css, selectors, nth-of-type, nth-child, debugging
audience: front-end developers, design system authors
excerpt: nth-of-type counts element types, not classes — and the selector everyone assumes exists, :nth-of-class, never has. How one same-type sibling shifts every index by one, why the bug looks wired while being broken, and the modern selector that finally fixes it.
author: Jerry Hansen
publishDate: 2026-09-06
updatedDate: 2026-09-06
---

Here is a selector most working developers believe they have written:

```css
.panel:nth-of-type(2) { display: block; }
```

"The second `.panel`." Except that is not what it says. `:nth-of-type()`
counts by **element type** among siblings — the class is a separate filter
applied *after* the counting. That selector means: "the second `<div>` among
its siblings, if it also happens to have `.panel`." The class contributes
nothing to the index.

The selector people actually want — `:nth-of-class()` — does not exist and
never has. And the gap has a very specific failure signature: everything works
until one unrelated sibling of the same element type shows up.

## The bug, in the wild

Zero-JS radio tabs. Hidden radios hold the state, `:has()` reads it, the
matching panel is shown by index:

```scss
&:has(> input:nth-of-type(#{$i}):checked) > .panel:nth-of-type(#{$i}) {
  display: block;
}
```

The container's children: a `<div class="tab-list">` holding the labels, then
the panels — also `<div>`s. Count the divs. The tab list is div #1. The first
panel is div #2. So `.panel:nth-of-type(1)` matches *nothing* — div #1 has no
`.panel` class — and every tab shows the panel before the one it should.
Tab 1: blank. Tab 2: panel 1.

The cruel part is what still worked: **the labels highlighted perfectly.**
The active-tab underline counted among `<label>` elements, and no impostor
shared their type. Click through the tabs and the strip responds beautifully —
the component *looks* wired. The broken half is the half below the fold of
your attention. This shipped, and it took a rebuilt demo page to catch it.

## The fix that finally exists

CSS did eventually grow the real counter — not as `:nth-of-class()`, but as
an extension to `:nth-child()`:

```css
.panel:nth-child(2 of .panel) { display: block; }
```

`:nth-child(n of S)` counts only the siblings matching `S`. The tab list is
simply not in the census. This is the selector that says what everyone thought
`:nth-of-type()` said.

Support, honestly: Safari has had it since **9** — 2015, a full eight years
ahead — Chrome since **111** (March 2023), Firefox since **113** (May 2023).
So it is safe for anything targeting evergreen browsers, but every
`nth-of-type` tab/stripe/grid pattern you have ever copied predates it, which
is why the broken idiom is still what search results and muscle memory serve
you.

## Fixes, ranked

1. **`:nth-child(n of .panel)`** where your support floor allows. It counts
   the thing you meant to count; the markup can hold whatever siblings it
   wants.

2. **A markup contract.** If you must keep `:nth-of-type()`, the non-panel
   sibling must use a different element type. Our tab list became a `<nav>`:

   ```html
   <nav class="tab-list" role="tablist">…</nav>
   <div class="panel" role="tabpanel">…</div>
   ```

   Now the panels are the only `<div>`s and the indices align. The catch: a
   contract that lives only in your head is not a contract — write it in the
   component's header comment, because the person who wraps the panels in one
   innocent extra `<div>` will be you, in six months.

3. **Never mix same-type non-panels among panels.** This is option 2 stated
   as a lint rule rather than a fix: any `:nth-of-type()` selector is a
   standing assumption that no sibling of that type will ever be inserted.
   Every wrapper div added for styling, every tooltip mount point, every
   analytics beacon element is a potential off-by-one.

## The lesson

`:nth-of-type()` is not "nth matching this selector" and reading it that way
is a time bomb with a delay measured in refactors. Reach for
`:nth-child(n of S)` when you can, and when you can't, treat the element-type
census as part of your public API — because it is one.

---

*We use this in css-is-awesome: this exact off-by-one shipped in `cia.tabs`
and the full post-mortem — including why our own docs found it — is in
[The tabs that highlighted but never
switched](/blog/the-tabs-that-highlighted-but-never-switched).*
