---
title: CSS anchor positioning is a dropdown engine
slug: css-anchor-positioning-dropdown-engine
category: discovery
tags: css, anchor-positioning, popover, layout, progressive-enhancement
audience: front-end developers, design system authors
excerpt: anchor-name, three inset lines, and position-try-fallbacks replace the positioning half of a dropdown library — trigger-width menus that flip above the trigger when the viewport would clip them, re-evaluated by the browser on every open.
author: Jerry Hansen
publishDate: 2026-09-06
updatedDate: 2026-09-06
---

Every dropdown library you have ever shipped exists to answer three questions:
where is the trigger, how wide is it, and is there room below it? For years the
only honest answers came from JavaScript — `getBoundingClientRect()`, a resize
observer, a scroll listener, and a positioning engine like Floating UI to glue
them together.

CSS anchor positioning answers all three in the stylesheet. Not "sort of, with
caveats" — the full dropdown contract, declaratively.

## The wiring

Two properties connect the elements. The trigger declares a name; the menu
subscribes to it:

```css
.trigger {
  anchor-name: --menu-trigger;
}

.menu[popover] {
  position-anchor: --menu-trigger;
}
```

The menu here is a `[popover]`, which matters: popovers render in the top
layer, outside every `overflow: hidden` ancestor that has ever eaten a
dropdown. Anchor positioning works on any absolutely-positioned element, but
the popover pairing is the one that finally kills the portal.

## Exactly the trigger's width

This is the line that made me sit up. `anchor()` resolves to an edge of the
anchor element, and you can set *both* inline edges to it:

```css
.menu[popover] {
  position-anchor: --menu-trigger;
  inset-inline: anchor(start) anchor(end);
  width: auto;
}
```

Left edge pinned to the trigger's left, right edge pinned to the trigger's
right. The menu is now exactly as wide as its trigger — not measured once and
cached, but tracked. Resize the window, let the trigger reflow, reopen the
menu: it matches. No observer, no measurement, no stale width.

(The `width: auto` is load-bearing and non-obvious — the browser's own popover
stylesheet fights you here. That line has its own story, which is the next
post.)

## One line below, and the flip

Placing the menu under the trigger is one more `anchor()`:

```css
.menu[popover] {
  inset-block-start: calc(anchor(end) + 1px);
  position-try-fallbacks: flip-block;
}
```

`anchor(end)` on the block axis is the trigger's bottom edge; the `calc()`
opens the menu one pixel below it. And `position-try-fallbacks: flip-block` is
the part that used to be a library's whole reason to exist: if the menu would
overflow the bottom of the viewport, the browser flips it to sit *above* the
trigger instead. This is not a one-time decision — the browser re-evaluates on
every open, at the element's current scroll position. Trigger near the bottom
of the page: menu opens upward. Scroll it back up, open again: downward. Zero
lines of script.

## Progressive enhancement, honestly

Anchor positioning is not Baseline yet, so this cannot be the only path.
The shape that works is a fallback-first rule with the anchored version layered
inside `@supports`:

```css
.menu[popover] {
  /* no-anchor fallback: full viewport width minus the page gutters */
  inset-inline: var(--space-4);
  width: auto;

  @supports (anchor-name: --a) {
    position-anchor: --menu-trigger;
    inset-inline: anchor(start) anchor(end);
    inset-block-start: calc(anchor(end) + 1px);
    position-try-fallbacks: flip-block;
  }
}
```

Browsers without anchor support get a menu spanning the viewport inside the
gutters — on a phone that is close to what you wanted anyway. Browsers with it
get the trigger-width, flip-aware version.

Where support stands as I write this: Chrome and Edge since 125, Firefox since
144, Safari in Technology Preview only. That is most of the market but not all
of it, and "Safari TP" means real iOS users see your fallback today. Ship the
`@supports` block or don't ship this at all.

## The takeaway

The interesting shift is not that this saves bytes. It is that the dropdown's
*positioning brain* moved into the browser, where it belongs — the same engine
that already knows about scroll, zoom, writing modes, and the keyboard
insetting the viewport. A JS positioning library is a reimplementation of
layout knowledge the browser had all along; `anchor()` is just being allowed
to ask for it.

---

*We use this in css-is-awesome: `cia.dropdown` ships exactly this pattern —
fallback-first, anchored under `@supports` — and it's rule #8 in the package's
[AGENTS.md](https://github.com/Jerry2d3d/css-is-awesome/blob/main/AGENTS.md).
You can see it flip in the dashboard-shell demo at
[/docs/recipes](/docs/recipes).*
