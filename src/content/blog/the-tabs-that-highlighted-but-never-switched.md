---
title: The tabs that highlighted but never switched
slug: the-tabs-that-highlighted-but-never-switched
category: engineering
tags: css, post-mortem, mobile, layout, design-system
audience: front-end developers, design system authors
excerpt: A zero-JS tabs component shipped with a one-element off-by-one that CSS can't even express a fix for — and the only reason we found it was converting the docs to live demos. A post-mortem, plus everything else that changed in one very long day.
author: Jerry Hansen
publishDate: 2026-09-04
updatedDate: 2026-09-04
---

cia's tabs are the zero-JS kind: hidden radios hold the state, `:has()` reads
it, and `:nth-of-type()` shows the matching panel. No state machine, no
hydration. We were proud of it. It also never worked with its own documented
markup — and the way it failed is the interesting part.

## The anatomy of the bug

The mixin shows the Nth panel when the Nth radio is checked:

```scss
&:has(> input:nth-of-type(#{$i}):checked) > .cia-tab-panel:nth-of-type(#{$i}) {
  display: block;
}
```

`:nth-of-type()` counts by **element type** among siblings. The documented
markup made the tab list a `<div class="cia-tab-list">` — and the panels are
`<div>`s too. So the list was div #1, the first panel was div #2, and
`.cia-tab-panel:nth-of-type(1)` matched nothing at all. Tab 1: no panel.
Tab 2: panel 1.

Here's why nobody saw it: **the labels highlighted correctly.** The active-tab
underline counts among `<label>`s, which have no impostor in their type. Click
around and the tab strip responds beautifully — it *looks* wired. The broken
half is the half you have to read carefully to notice.

## Why the docs found it

Today the six component pages moved to a data-driven template — one
`ComponentDoc` fed by typed entries, with a rule: the live demo must be the
**real mixin output on real native markup**. Not a React lookalike, the actual
thing. The accordion demo is real `<details name>` elements wearing
`cia.accordion`. The dropdown demo is a real `[popover]` wearing
`cia.dropdown`.

The tabs demo refused to be built. The session converting it read the mixin
first, tried the documented markup, and the counting didn't line up. A
lookalike demo would have shipped smiling. **Demos that must be real are a
test suite you didn't know you were writing.**

## The fix CSS couldn't make

You can't patch this in the selector — CSS has no `:nth-of-class()`. Every
rewrite just moves the fragility somewhere else. So the fix is a markup
contract: the tab list is now a `<nav>`:

```html
<nav class="cia-tab-list" role="tablist">…</nav>
<div class="cia-tab-panel" role="tabpanel">…</div>
```

With the list out of the div count, the panels are the only divs and the
indices align. The mixin's header now carries the rule in writing: *the tab
list must not share the panels' element type.* If you copied the old markup —
swap one word, `div` to `nav`, and your tabs start switching.

## The rest of a very long day

The tabs bug was the punchline of a day spent making the mobile story real.
In rough order:

- **The layout doctrine got its final form.** Grid is the skeleton: the page
  shell is `grid-template-areas` whose names *are* the landmarks —
  `nav / main / footer`. The doctrine scales inward: any control-dense region
  (a docs article, a selections rail) gets its own named-area grid, and that
  grid's `gap` is the region's entire vertical rhythm. Flex lives at the
  leaves, for rows you flip with one command. Mobile is a different area map,
  never a pile of margin overrides.
- **The mobile toolkit became system API** — `cia.hamburger`, `cia.drawer`,
  `cia.sheet`, `cia.dock`, all riding `[popover]` + Grid, zero JavaScript —
  plus two recipes (`mobile-nav`, `bottom-nav`) and a `/docs/mobile` playbook.
- **A dropdown spec worth writing down**: opens one pixel under its
  full-width trigger at the trigger's exact width (CSS anchor positioning),
  flips above when the screen bottom would clip it, and `width: auto` — because
  the UA's `[popover] { width: fit-content }` silently beats both anchored
  edges. That last line cost an hour; it's in the rules now so it never costs
  another.
- **`cia.dropdown` itself had a cousin of the tabs bug**: its `display: flex`
  outranked the browser's `[popover] { display: none }`, so menus rendered
  permanently open. Same lesson — author styles beat UA styles even when the
  UA style is the entire mechanism.
- **21 of 24 themes were missing their spacing aliases**, so
  `var(--space-md)` silently collapsed to zero everywhere those themes ran.
  Every theme now declares the aliases as references into its own numbered
  scale.
- **Data tables restack into labeled cards on phones**, the docs rail became
  a real `<nav>` with a filter and its own internal scroll, and every page now
  ends with a footer that mirrors the nav.
- **And the version number slowed down.** Site-only work stopped spending
  minor versions — the number belongs to the package, not the website. Small
  steps from here: 1.8.1, 1.8.2. Two-point-oh is for breaking changes, and
  there aren't any.

One day, one off-by-one, and a documentation system that now catches this
class of bug by construction. The demos are real, so the bugs can't hide
behind lookalikes anymore.
